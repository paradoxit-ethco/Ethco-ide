import { useActivityStore, type ActivityId } from "../../stores/activityStore"
import { useAgentStore } from "../../stores/agentStore"
import { usePanelStore } from "../../stores/panelStore"

interface NavItem {
  id: ActivityId | "terminal" | "agent"
  label: string
  shortcut?: string
}

const NAV_ITEMS: NavItem[] = [
  { id: "explorer", label: "Files", shortcut: "Ctrl+Shift+E" },
  { id: "search", label: "Search", shortcut: "Ctrl+Shift+F" },
  { id: "git", label: "Git", shortcut: "Ctrl+Shift+G" },
  { id: "run", label: "Run", shortcut: "Ctrl+Shift+D" },
  { id: "terminal", label: "Terminal", shortcut: "Ctrl+`" },
  { id: "extensions", label: "Extensions" },
  { id: "agent", label: "Agent", shortcut: "Ctrl+B" },
]

export function Navbar() {
  const active = useActivityStore((s) => s.active)
  const toggle = useActivityStore((s) => s.toggle)
  const toggleAgent = useAgentStore((s) => s.toggleSidebar)
  const agentOpen = useAgentStore((s) => s.sidebarOpen)
  const panelVisible = usePanelStore((s) => s.visible)
  const togglePanel = usePanelStore((s) => s.toggle)
  const setPanelTab = usePanelStore((s) => s.setActiveTab)

  function handleClick(item: NavItem) {
    if (item.id === "terminal") {
      if (!panelVisible) togglePanel()
      setPanelTab("terminal")
      return
    }
    if (item.id === "agent") {
      toggleAgent()
      return
    }
    toggle(item.id)
  }

  function isActive(item: NavItem): boolean {
    if (item.id === "terminal") return panelVisible
    if (item.id === "agent") return agentOpen
    return active === item.id
  }

  return (
    <div className="h-[36px] bg-surface-alt border-b border-[var(--border)] flex items-center select-none shrink-0 px-1.5 gap-1">
      <div className="flex items-center gap-0.5">
        {NAV_ITEMS.map((item) => {
          const active_ = isActive(item)
          return (
            <button
              key={item.id}
              onClick={() => handleClick(item)}
              className={`h-[28px] px-3 flex items-center gap-1.5 rounded-md text-xs font-medium transition-all duration-100 whitespace-nowrap ${
                active_
                  ? "bg-accent/15 text-accent-light"
                  : "text-text-muted hover:text-[var(--text)] hover:bg-white/[0.04]"
              }`}
              title={item.shortcut ? `${item.label} (${item.shortcut})` : item.label}
            >
              <NavIcon id={item.id} />
              <span>{item.label}</span>
            </button>
          )
        })}
      </div>

      <div className="flex-1" />

      <div className="flex items-center gap-0.5">
        <span className="text-[10px] text-text-dim px-2">Ethco IDE</span>
      </div>
    </div>
  )
}

function NavIcon({ id }: { id: string }) {
  const size = 16
  switch (id) {
    case "explorer":
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
        </svg>
      )
    case "search":
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="11" cy="11" r="8" />
          <path d="m21 21-4.3-4.3" />
        </svg>
      )
    case "git":
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="18" r="3" />
          <circle cx="6" cy="6" r="3" />
          <circle cx="18" cy="6" r="3" />
          <path d="M18 9v1a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2V9" />
          <path d="M12 12v3" />
        </svg>
      )
    case "run":
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <polygon points="5 3 19 12 5 21 5 3" />
        </svg>
      )
    case "terminal":
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="4 17 10 11 4 5" />
          <line x1="12" y1="19" x2="20" y2="19" />
        </svg>
      )
    case "extensions":
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M6 2h12l4 4v12a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V6l4-4Z" />
          <line x1="2" y1="6" x2="22" y2="6" />
          <line x1="12" y1="6" x2="12" y2="22" />
        </svg>
      )
    case "agent":
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 2a4 4 0 0 1 4 4v2a4 4 0 0 1-8 0V6a4 4 0 0 1 4-4Z" />
          <path d="M16 14H8a4 4 0 0 0-4 4v2h16v-2a4 4 0 0 0-4-4Z" />
          <path d="M20 10a2 2 0 1 0 0-4 2 2 0 0 0 0 4Z" />
          <path d="M4 10a2 2 0 1 0 0-4 2 2 0 0 0 0 4Z" />
        </svg>
      )
    default:
      return null
  }
}
