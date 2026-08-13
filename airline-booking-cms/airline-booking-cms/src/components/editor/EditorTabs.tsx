import { useRef } from "react"
import { useEditorStore } from "../../stores/editorStore"

interface EditorTabsProps {
  onCloseTab: (path: string) => void
}

export function EditorTabs({ onCloseTab }: EditorTabsProps) {
  const tabs = useEditorStore((s) => s.tabs)
  const activeTab = useEditorStore((s) => s.activeTab)
  const setActiveTab = useEditorStore((s) => s.setActiveTab)
  const tabsArr = useEditorStore((s) => s.tabs)
  const dragRef = useRef<{ from: number } | null>(null)

  if (tabs.length === 0) return null

  function handleDragStart(e: React.DragEvent, idx: number) {
    dragRef.current = { from: idx }
    e.dataTransfer.effectAllowed = "move"
    e.dataTransfer.setData("text/plain", String(idx))
  }

  function handleDragOver(e: React.DragEvent) { e.preventDefault(); e.dataTransfer.dropEffect = "move" }

  function handleDrop(e: React.DragEvent, toIdx: number) {
    e.preventDefault()
    const from = dragRef.current?.from
    if (from !== undefined && from !== toIdx) {
      const reordered = [...tabsArr]
      const [moved] = reordered.splice(from, 1)
      reordered.splice(toIdx, 0, moved)
      useEditorStore.setState({ tabs: reordered })
    }
    dragRef.current = null
  }

  function handleDragEnd() { dragRef.current = null }

  return (
    <div className="flex bg-[var(--surface-alt)] border-b border-[var(--border)] overflow-x-auto shrink-0 min-h-[35px]">
      {tabs.map((tab, idx) => {
        const isActive = tab.path === activeTab
        return (
          <div
            key={tab.path}
            draggable
            onDragStart={(e) => handleDragStart(e, idx)}
            onDragOver={handleDragOver}
            onDrop={(e) => handleDrop(e, idx)}
            onDragEnd={handleDragEnd}
            className={`flex items-center gap-1.5 px-3 py-[7px] text-[12px] cursor-pointer min-w-0 group transition-colors duration-75 select-none border-r border-[var(--border)] ${
              isActive
                ? "bg-[var(--surface)] text-[var(--text)]"
                : "text-text-muted hover:text-[var(--text)] hover:bg-white/[0.03]"
            }`}
            onClick={() => setActiveTab(tab.path)}
          >
            <FileTabIcon name={tab.name} />
            {tab.isDirty && (
              <span className="w-[6px] h-[6px] rounded-full bg-white/60 shrink-0" />
            )}
            <span className="truncate max-w-[140px]">{tab.name}</span>
            <button
              className="ml-0.5 opacity-0 group-hover:opacity-60 hover:!opacity-100 hover:bg-white/10 rounded p-px leading-none transition-opacity"
              onClick={(e) => { e.stopPropagation(); onCloseTab(tab.path) }}
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>
        )
      })}
    </div>
  )
}

function FileTabIcon({ name }: { name: string }) {
  const ext = name.split(".").pop()?.toLowerCase()
  const colorMap: Record<string, string> = {
    ts: "#3178c6", tsx: "#3178c6", js: "#f7df1e", jsx: "#f7df1e",
    rs: "#dea584", py: "#3572a5", go: "#00add8", json: "#89b4fa",
    md: "#cdd6f4", css: "#519aba", html: "#e34f26", yaml: "#6c7086",
    toml: "#6c7086",
  }
  const color = colorMap[ext ?? ""] || "var(--text-muted)"

  return (
    <svg className="w-3.5 h-3.5 shrink-0" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6z" />
      <polyline points="14 2 14 8 20 8" />
    </svg>
  )
}
