import { useRef, useCallback } from "react"
import { usePanelStore, type PanelTabId } from "../../stores/panelStore"
import { TerminalPanel } from "../terminal/TerminalPanel"

const TABS: { id: PanelTabId; label: string }[] = [
  { id: "terminal", label: "TERMINAL" },
  { id: "problems", label: "PROBLEMS" },
  { id: "output", label: "OUTPUT" },
  { id: "debug", label: "DEBUG CONSOLE" },
]

interface PanelProps {
  projectPath?: string
}

export function Panel({ projectPath }: PanelProps) {
  const activeTab = usePanelStore((s) => s.activeTab)
  const setActiveTab = usePanelStore((s) => s.setActiveTab)
  const visible = usePanelStore((s) => s.visible)
  const height = usePanelStore((s) => s.height)
  const setHeight = usePanelStore((s) => s.setHeight)
  const toggle = usePanelStore((s) => s.toggle)
  const containerRef = useRef<HTMLDivElement>(null)

  const handleResizeStart = useCallback((e: React.MouseEvent) => {
    e.preventDefault()
    const startY = e.clientY
    const startH = height

    function onMove(e: MouseEvent) {
      // Calculate height based on cursor position - panel bottom is fixed, top moves
      const panelEl = containerRef.current
      if (!panelEl) return
      const rect = panelEl.getBoundingClientRect()
      // As cursor moves up from panel top, height increases
      const newH = rect.bottom - e.clientY
      setHeight(Math.max(60, Math.min(800, newH)))
    }

    function onUp() {
      document.removeEventListener("mousemove", onMove)
      document.removeEventListener("mouseup", onUp)
    }

    document.addEventListener("mousemove", onMove)
    document.addEventListener("mouseup", onUp)
  }, [height, setHeight])

  if (!visible) {
    return (
      <div className="bg-[#181825] border-t border-[#313244] shrink-0 text-[11px] select-none">
        <div className="flex items-center px-3 h-[25px]">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className="tracking-wider text-text-muted hover:text-[var(--text)] transition-colors mr-4"
            >
              {tab.label}
            </button>
          ))}
          <div className="flex-1" />
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-text-muted"><polyline points="18 15 12 9 6 15"/></svg>
        </div>
      </div>
    )
  }

  return (
    <div
      ref={containerRef}
      className="bg-[#181825] border-t border-[#313244] flex flex-col shrink-0 relative"
      style={{ height }}
    >
      {/* Resize handle at TOP of panel (between editor and panel) */}
      <div
        className="absolute top-0 left-0 right-0 h-[3px] cursor-ns-resize z-20 hover:bg-accent/50 active:bg-accent/70 transition-colors"
        onMouseDown={handleResizeStart}
      />

      {/* Panel tab bar */}
      <div className="flex items-center px-2 border-b border-[#313244] min-h-0 shrink-0 pl-4">
        <div className="flex items-center">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`text-[11px] tracking-wider px-3 py-[7px] border-b-[2px] transition-colors ${
                activeTab === tab.id
                  ? "text-[var(--text)] border-accent-light"
                  : "text-text-muted border-transparent hover:text-[var(--text)] hover:border-text-dim"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="flex-1" />

        <button
          onClick={toggle}
          className="w-6 h-6 flex items-center justify-center rounded text-text-muted hover:text-[var(--text)] hover:bg-white/5 transition-colors"
          title="Minimize Panel"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="6 15 12 9 18 15"/></svg>
        </button>
      </div>

      {/* Panel content - always mount terminal so PTY persists */}
      <div className="flex-1 min-h-0 overflow-hidden relative">
        <div className="absolute inset-0" style={{ display: activeTab === "terminal" ? "block" : "none" }}>
          <TerminalPanel projectPath={projectPath} />
        </div>
        <div className="absolute inset-0 flex items-center justify-center" style={{ display: activeTab === "problems" ? "flex" : "none" }}>
          <span className="text-[11px] text-text-muted">No problems detected</span>
        </div>
        <div className="absolute inset-0 p-3 font-mono text-[11px] text-text-muted whitespace-pre-wrap" style={{ display: activeTab === "output" ? "block" : "none" }}>
          [Output panel ready]
        </div>
        <div className="absolute inset-0 flex items-center justify-center" style={{ display: activeTab === "debug" ? "flex" : "none" }}>
          <span className="text-[11px] text-text-muted">Debug console — run or debug to see output</span>
        </div>
      </div>
    </div>
  )
}
