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
      // Reorder by re-inserting tab at new position
      const reordered = [...tabsArr]
      const [moved] = reordered.splice(from, 1)
      reordered.splice(toIdx, 0, moved)
      // Update store - set the tabs in new order and keep active tab
      useEditorStore.setState({ tabs: reordered })
    }
    dragRef.current = null
  }

  function handleDragEnd() { dragRef.current = null }

  return (
    <div className="flex bg-[#181825] border-b border-[#313244] overflow-x-auto shrink-0 min-h-[35px]">
      {tabs.map((tab, idx) => (
        <div
          key={tab.path}
          draggable
          onDragStart={(e) => handleDragStart(e, idx)}
          onDragOver={handleDragOver}
          onDrop={(e) => handleDrop(e, idx)}
          onDragEnd={handleDragEnd}
          className={`flex items-center gap-1.5 px-3 text-xs cursor-pointer min-w-0 group transition-colors duration-75 select-none ${
            tab.path === activeTab
              ? "bg-[#1e1e2e] text-[var(--text)] shadow-[inset_0_-2px_0_0_var(--accent-light)]"
              : "text-text-muted hover:text-[var(--text)] hover:bg-white/[0.03]"
          }`}
          onClick={() => setActiveTab(tab.path)}
          style={{ paddingTop: "8px", paddingBottom: "8px" }}
        >
          {tab.isDirty && (
            <span className="w-[6px] h-[6px] rounded-full bg-accent-light shrink-0" />
          )}
          <span className="truncate max-w-[140px]">{tab.name}</span>
          <button
            className="ml-0.5 opacity-0 group-hover:opacity-60 hover:opacity-100 hover:bg-white/10 rounded p-px leading-none transition-opacity"
            onClick={(e) => { e.stopPropagation(); onCloseTab(tab.path) }}
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>
      ))}
    </div>
  )
}
