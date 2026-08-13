import { useAgentStore } from "../../stores/agentStore"
import { useEditorStore } from "../../stores/editorStore"
import { useSettingsStore } from "../../stores/settingsStore"
import { useWorkspaceStore } from "../../stores/workspaceStore"

export function StatusBar() {
  const agentStatus = useAgentStore((s) => {
    const active = s.sessions.find((se) => se.id === s.activeSessionId)
    return active?.status ?? "idle"
  })
  const toggleSidebar = useAgentStore((s) => s.toggleSidebar)
  const tabs = useEditorStore((s) => s.tabs)
  const activeTab = useEditorStore((s) => s.activeTab)
  const activeFile = tabs.find((t) => t.path === activeTab)
  const theme = useSettingsStore((s) => s.theme)
  const projectPath = useWorkspaceStore((s) => s.projectPath)

  const agentDot =
    agentStatus === "thinking" ? "bg-warning animate-pulse"
    : agentStatus === "error" ? "bg-error"
    : "bg-success"

  // Extract git branch from path or data
  const branch = extractBranch(projectPath)

  return (
    <div className="h-[22px] bg-accent/90 flex items-center text-[11px] text-white/80 select-none shrink-0">
      {/* Left section */}
      <div className="flex items-center h-full">
        {/* Git branch */}
        <button className="flex items-center gap-1 px-2.5 h-full hover:bg-white/10 transition-colors">
          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M6 3v12" /><circle cx="18" cy="6" r="3" /><circle cx="6" cy="18" r="3" />
            <path d="M18 9a9 9 0 0 1-9 9" />
          </svg>
          <span>{branch || "main"}</span>
        </button>

        {/* Errors / Warnings */}
        <button className="flex items-center gap-1.5 px-2 h-full hover:bg-white/10 transition-colors">
          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" /><line x1="15" y1="9" x2="9" y2="15" /><line x1="9" y1="9" x2="15" y2="15" /></svg>
          <span>0</span>
          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" /><line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" /></svg>
          <span>0</span>
        </button>
      </div>

      {/* Spacer */}
      <div className="flex-1" />

      {/* Right section */}
      <div className="flex items-center h-full">
        {/* Language */}
        <button className="px-2 h-full hover:bg-white/10 transition-colors">
          {activeFile?.language || "Plain Text"}
        </button>

        {/* Encoding */}
        <button className="px-2 h-full hover:bg-white/10 transition-colors">UTF-8</button>

        {/* Line ending */}
        <button className="px-2 h-full hover:bg-white/10 transition-colors">CRLF</button>

        {/* Indentation */}
        <button className="px-2 h-full hover:bg-white/10 transition-colors">Spaces: 2</button>

        {/* Theme */}
        <button className="flex items-center gap-1 px-2 h-full hover:bg-white/10 transition-colors capitalize">
          {theme === "dark" ? (
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
            </svg>
          ) : (
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="5" />
              <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
            </svg>
          )}
          {theme}
        </button>

        {/* Agent toggle */}
        <button
          onClick={toggleSidebar}
          className={`flex items-center gap-1.5 px-2.5 h-full hover:bg-white/10 transition-colors`}
        >
          <span className={`w-[6px] h-[6px] rounded-full ${agentDot}`} />
          <span>Agent</span>
        </button>
      </div>
    </div>
  )
}

function extractBranch(projectPath: string | null): string | null {
  if (!projectPath) return null
  const api = (window as any).electronAPI
  if (!api?.gitStatus) return null
  try {
    const result = api.gitStatus(projectPath)
    if (result && typeof result === "string") {
      const lines = result.split("\n").filter((l: string) => l.startsWith("On branch "))
      if (lines.length > 0) return lines[0].replace("On branch ", "").trim()
    }
  } catch { /* ignore */ }
  return null
}
