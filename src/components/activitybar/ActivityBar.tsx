import { useActivityStore, type ActivityId } from "../../stores/activityStore"
import { useAgentStore } from "../../stores/agentStore"
import { usePanelStore } from "../../stores/panelStore"

const ACTIVITIES: { id: ActivityId; label: string }[] = [
  { id: "explorer", label: "Explorer" },
  { id: "search", label: "Search" },
  { id: "git", label: "Source Control" },
  { id: "run", label: "Run and Debug" },
  { id: "extensions", label: "Extensions" },
]

export function ActivityBar() {
  const active = useActivityStore((s) => s.active)
  const toggle = useActivityStore((s) => s.toggle)
  const toggleAgentSidebar = useAgentStore((s) => s.toggleSidebar)
  const agentSidebarOpen = useAgentStore((s) => s.sidebarOpen)
  const panelVisible = usePanelStore((s) => s.visible)
  const togglePanel = usePanelStore((s) => s.toggle)

  return (
    <div className="w-[50px] bg-surface-alt border-r border-[var(--border)] flex flex-col items-center pt-1 select-none shrink-0">
      {/* Top group */}
      <div className="flex flex-col items-center gap-0.5">
        {ACTIVITIES.map(({ id, label }) => {
          const isActive = active === id
          return (
            <button
              key={id}
              onClick={() => toggle(id)}
              className={`w-[44px] h-[44px] flex items-center justify-center rounded-md transition-all duration-100 relative group ${
                isActive
                  ? "text-[var(--text)]"
                  : "text-text-muted hover:text-[var(--text)]"
              }`}
              title={label}
            >
              {isActive && (
                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[2px] h-[22px] rounded-full bg-accent-light" />
              )}
              <span className={`transition-transform duration-100 ${isActive ? "scale-105" : ""}`}>
                <ActivityIcon id={id} />
              </span>
            </button>
          )
        })}
      </div>

      {/* Spacer */}
      <div className="flex-1" />

      {/* Bottom group */}
      <div className="flex flex-col items-center gap-0.5 pb-2">
        <button
          onClick={togglePanel}
          className={`w-[44px] h-[44px] flex items-center justify-center rounded-md transition-all duration-100 text-text-muted hover:text-[var(--text)] relative group`}
          title={panelVisible ? "Close Panel" : "Open Panel"}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <rect x="2" y="2" width="20" height="20" rx="2" />
            <line x1="2" y1="14" x2="22" y2="14" />
            <line x1="9" y1="2" x2="9" y2="22" />
          </svg>
        </button>

        <button
          onClick={toggleAgentSidebar}
          className={`w-[44px] h-[44px] flex items-center justify-center rounded-md transition-all duration-100 relative group ${
            agentSidebarOpen ? "text-accent-light" : "text-text-muted hover:text-[var(--text)]"
          }`}
          title="Agent"
        >
          <ActivityIcon id="agent" />
        </button>

        <button
          className="w-[44px] h-[44px] flex items-center justify-center rounded-md text-text-muted hover:text-[var(--text)] transition-all duration-100 group"
          title="Account"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
            <circle cx="12" cy="7" r="4" />
          </svg>
        </button>

        <button
          className="w-[44px] h-[44px] flex items-center justify-center rounded-md text-text-muted hover:text-[var(--text)] transition-all duration-100 group"
          title="Settings"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="3" />
            <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
          </svg>
        </button>
      </div>
    </div>
  )
}

function ActivityIcon({ id }: { id: ActivityId | "agent" }) {
  switch (id) {
    case "explorer":
      return (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
        </svg>
      )
    case "search":
      return (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="11" cy="11" r="8" />
          <path d="m21 21-4.3-4.3" />
        </svg>
      )
    case "git":
      return (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="18" r="3" />
          <circle cx="6" cy="6" r="3" />
          <circle cx="18" cy="6" r="3" />
          <path d="M18 9v1a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2V9" />
          <path d="M12 12v3" />
        </svg>
      )
    case "run":
      return (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <polygon points="5 3 19 12 5 21 5 3" />
        </svg>
      )
    case "extensions":
      return (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M6 2h12l4 4v12a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V6l4-4Z" />
          <line x1="2" y1="6" x2="22" y2="6" />
          <line x1="12" y1="6" x2="12" y2="22" />
        </svg>
      )
    case "agent":
      return (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 2a4 4 0 0 1 4 4v2a4 4 0 0 1-8 0V6a4 4 0 0 1 4-4Z" />
          <path d="M16 14H8a4 4 0 0 0-4 4v2h16v-2a4 4 0 0 0-4-4Z" />
          <path d="M20 10a2 2 0 1 0 0-4 2 2 0 0 0 0 4Z" />
          <path d="M4 10a2 2 0 1 0 0-4 2 2 0 0 0 0 4Z" />
        </svg>
      )
  }
}
