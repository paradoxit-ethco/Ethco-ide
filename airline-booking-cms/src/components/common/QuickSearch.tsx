import { useState, useEffect, useRef, useCallback } from "react"
import { searchFiles } from "../../services/search"
import { useEditorStore } from "../../stores/editorStore"
import { getFS } from "../../services/fs-provider"

interface QuickSearchProps {
  open: boolean
  onClose: () => void
}

export function QuickSearch({ open, onClose }: QuickSearchProps) {
  const [query, setQuery] = useState("")
  const [results, setResults] = useState<string[]>([])
  const [selected, setSelected] = useState(0)
  const [loading, setLoading] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const openFile = useEditorStore((s) => s.openFile)

  useEffect(() => {
    if (open) {
      setQuery("")
      setResults([])
      setSelected(0)
      setTimeout(() => inputRef.current?.focus(), 50)
    }
  }, [open])

  useEffect(() => {
    if (!query.trim()) {
      setResults([])
      return
    }
    setLoading(true)
    const root = getFS().getProjectRoot()
    if (!root) { setLoading(false); return }

    const timer = setTimeout(async () => {
      const res = await searchFiles(root, query)
      setResults(res)
      setSelected(0)
      setLoading(false)
    }, 150)

    return () => clearTimeout(timer)
  }, [query])

  const handleSelect = useCallback(async (path: string) => {
    try {
      const content = await getFS().readFile(path)
      openFile(path, content)
      onClose()
    } catch (e) {
      console.error("Failed to open file:", e)
    }
  }, [openFile, onClose])

  function handleKeyDown(e: React.KeyboardEvent) {
    switch (e.key) {
      case "ArrowDown":
        e.preventDefault()
        setSelected((s) => Math.min(s + 1, results.length - 1))
        break
      case "ArrowUp":
        e.preventDefault()
        setSelected((s) => Math.max(s - 1, 0))
        break
      case "Enter":
        e.preventDefault()
        if (results[selected]) handleSelect(results[selected])
        break
      case "Escape":
        e.preventDefault()
        onClose()
        break
    }
  }

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-[15vh]" onClick={onClose}>
      <div
        className="w-[600px] max-w-[90vw] bg-surface-alt border border-[var(--border)] rounded-lg shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center px-3 py-2 border-b border-[var(--border)]">
          <span className="text-text-muted text-xs mr-2">\uD83D\uDD0D</span>
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Search files..."
            className="flex-1 bg-transparent text-xs text-[var(--text)] outline-none placeholder-text-muted"
          />
          {loading && <span className="text-[10px] text-text-muted animate-pulse">Searching...</span>}
          <kbd className="ml-2 text-[10px] px-1.5 py-0.5 rounded bg-white/5 text-text-muted font-mono">esc</kbd>
        </div>
        {results.length > 0 && (
          <div className="max-h-80 overflow-y-auto">
            {results.map((path, i) => (
              <div
                key={path}
                className={`flex items-center px-3 py-1.5 text-xs cursor-pointer ${
                  i === selected ? "bg-accent/20 text-accent-light" : "text-[var(--text)] hover:bg-white/5"
                }`}
                onClick={() => handleSelect(path)}
                onMouseEnter={() => setSelected(i)}
              >
                <span className="w-4 mr-2 text-center">{getIcon(path)}</span>
                <span className="truncate">{path.split("/").pop()}</span>
                <span className="ml-auto text-[10px] text-text-muted truncate max-w-[200px]">{path}</span>
              </div>
            ))}
          </div>
        )}
        {query && !loading && results.length === 0 && (
          <div className="px-3 py-4 text-center text-xs text-text-muted">No files found</div>
        )}
        {!query && (
          <div className="px-3 py-4 text-center text-xs text-text-muted">
            Type to search files in the project
          </div>
        )}
      </div>
    </div>
  )
}

function getIcon(path: string): string {
  const ext = path.split(".").pop()?.toLowerCase()
  const icons: Record<string, string> = {
    ts: "\uD83D\uDFE6", tsx: "\u269B\uFE0F", js: "\uD83D\uDFE8", jsx: "\u269B\uFE0F",
    rs: "\uD83E\uDE84", py: "\uD83D\uDC0D", json: "\uD83D\uDCCB", md: "\uD83D\uDCDD",
    css: "\uD83C\uDFA8", html: "\uD83C\uDF10", toml: "\u2699\uFE0F", yaml: "\u2699\uFE0F",
  }
  return icons[ext ?? ""] ?? "\uD83D\uDCC4"
}
