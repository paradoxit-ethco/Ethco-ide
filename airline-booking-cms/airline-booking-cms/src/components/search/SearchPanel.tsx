import { useState, useCallback, useRef } from "react"
import { searchInFiles, type SearchResult } from "../../services/search"
import { useEditorStore } from "../../stores/editorStore"
import { getFS } from "../../services/fs-provider"

interface SearchPanelProps {
  rootPath: string
}

export function SearchPanel({ rootPath }: SearchPanelProps) {
  const [query, setQuery] = useState("")
  const [results, setResults] = useState<SearchResult[]>([])
  const [searching, setSearching] = useState(false)
  const [replacing, setReplacing] = useState(false)
  const [replaceText, setReplaceText] = useState("")
  const openFile = useEditorStore((s) => s.openFile)
  const setCursorLine = useEditorStore((s) => s.setCursorLine)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const doSearch = useCallback(async (q: string) => {
    if (!q.trim()) {
      setResults([])
      return
    }
    setSearching(true)
    try {
      const res = await searchInFiles(rootPath, q, 50)
      setResults(res)
    } finally {
      setSearching(false)
    }
  }, [rootPath])

  function handleQueryChange(value: string) {
    setQuery(value)
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => doSearch(value), 300)
  }

  async function handleResultClick(r: SearchResult, line?: number) {
    try {
      const fs = getFS()
      const content = await fs.readFile(r.path)
      openFile(r.path, content)
      if (line) {
        setTimeout(() => setCursorLine(line), 100)
      }
    } catch { /* ignore */ }
  }

  async function handleReplaceAll() {
    if (!replaceText || results.length === 0) return
    const fs = getFS()
    for (const r of results) {
      try {
        const content = await fs.readFile(r.path)
        const updated = content.replace(new RegExp(query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "gi"), replaceText)
        if (updated !== content) {
          await fs.writeFile(r.path, updated)
        }
      } catch { /* skip */ }
    }
    await doSearch(query)
  }

  const totalMatches = results.reduce((sum, r) => sum + r.matches.length, 0)

  return (
    <div className="bg-surface-alt border-r border-[var(--border)] flex flex-col select-none" style={{ width: 280, minWidth: 200 }}>
      <div className="px-3 py-2 text-xs font-semibold text-text-muted uppercase tracking-wider border-b border-[var(--border)]">
        Search
      </div>

      <div className="px-3 py-2 space-y-1.5">
        <div className="relative">
          <svg className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-text-muted" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="8" /><path d="m21 21-4.3-4.3" />
          </svg>
          <input
            type="text"
            value={query}
            onChange={(e) => handleQueryChange(e.target.value)}
            placeholder="Search in files..."
            className="w-full bg-surface border border-[var(--border)] rounded-lg pl-8 pr-3 py-1.5 text-xs text-[var(--text)] outline-none focus:border-accent transition-colors"
          />
        </div>

        {results.length > 0 && (
          <div className="flex items-center justify-between">
            <span className="text-[10px] text-text-muted">{totalMatches} match{totalMatches !== 1 ? "es" : ""} in {results.length} file{results.length !== 1 ? "s" : ""}</span>
            <button
              onClick={() => setReplacing(!replacing)}
              className="text-[10px] text-text-muted hover:text-accent-light transition-colors"
            >
              {replacing ? "Hide" : "Replace"}
            </button>
          </div>
        )}

        {replacing && (
          <div className="flex gap-1.5">
            <input
              type="text"
              value={replaceText}
              onChange={(e) => setReplaceText(e.target.value)}
              placeholder="Replace with..."
              className="flex-1 bg-surface border border-[var(--border)] rounded-lg px-2.5 py-1.5 text-xs text-[var(--text)] outline-none focus:border-accent transition-colors"
            />
            <button
              onClick={handleReplaceAll}
              disabled={!replaceText}
              className="px-2.5 py-1.5 text-xs font-medium bg-accent text-white rounded-lg hover:bg-accent-dark transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              All
            </button>
          </div>
        )}
      </div>

      <div className="flex-1 overflow-y-auto">
        {searching ? (
          <div className="px-3 py-2 flex items-center gap-2 text-xs text-text-muted">
            <div className="w-3 h-3 rounded-full border-2 border-accent/30 border-t-accent animate-spin" />
            Searching...
          </div>
        ) : results.length === 0 && query ? (
          <div className="px-4 py-6 text-center">
            <svg className="w-8 h-8 mx-auto mb-2 text-text-dim" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <circle cx="11" cy="11" r="8" /><path d="m21 21-4.3-4.3" />
            </svg>
            <p className="text-xs text-text-muted">No results found</p>
            <p className="text-[10px] text-text-dim mt-0.5">Try a different search term</p>
          </div>
        ) : (
          results.map((r) => (
            <div key={r.path}>
              <button
                onClick={() => handleResultClick(r)}
                className="w-full text-left px-3 py-1 text-xs hover:bg-white/5 transition-colors truncate flex items-center gap-1.5"
                title={r.path}
              >
                <svg className="w-3 h-3 shrink-0 text-text-dim" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6z"/><polyline points="14 2 14 8 20 8"/></svg>
                <span className="text-[var(--text)] truncate">{r.name}</span>
                <span className="text-text-dim ml-auto shrink-0">{r.matches.length}</span>
              </button>
              {r.matches.map((m) => (
                <button
                  key={`${r.path}:${m.line}`}
                  onClick={() => handleResultClick(r, m.line)}
                  className="w-full text-left pl-8 pr-3 py-0.5 text-[10px] text-text-muted hover:bg-white/5 transition-colors truncate font-mono"
                >
                  <span className="text-accent-light mr-1">L{m.line}</span>
                  {m.text.slice(0, 100)}
                </button>
              ))}
            </div>
          ))
        )}
      </div>
    </div>
  )
}
