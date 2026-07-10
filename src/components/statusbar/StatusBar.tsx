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
  const sidebarOpen = useAgentStore((s) => s.sidebarOpen)
  const tabs = useEditorStore((s) => s.tabs)
  const activeTab = useEditorStore((s) => s.activeTab)
  const activeFile = tabs.find((t) => t.path === activeTab)
  const theme = useSettingsStore((s) => s.theme)
  const projectPath = useWorkspaceStore((s) => s.projectPath)

  const agentColor =
    agentStatus === "thinking" ? "text-warning"
    : agentStatus === "error" ? "text-error"
    : "text-success"

  const agentDot =
    agentStatus === "thinking" ? "bg-warning animate-pulse"
    : agentStatus === "error" ? "bg-error"
    : "bg-success"

  // Extract git branch from path or data
  const branch = extractBranch(projectPath)
  // Count errors/warnings (simple estimate from active file content)
  const problemCount = countProblems(tabs, activeTab)

  return (
    <div className="h-[22px] bg-[#181825] border-t border-[#313244] flex items-center text-[11px] text-text-muted select-none shrink-0">
      {/* Left section */}
      <div className="flex items-center">
        {/* Git branch */}
        <button className="flex items-center gap-1 px-3 h-full hover:bg-white/5 transition-colors">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M6 3v12" /><circle cx="18" cy="6" r="3" /><circle cx="6" cy="18" r="3" />
            <path d="M18 9a9 9 0 0 1-9 9" />
          </svg>
          <span>{branch || "main"}</span>
        </button>

        <div className="w-px h-3 bg-[#313244]" />

        {/* Problems */}
        <button className="flex items-center gap-1 px-3 h-full hover:bg-white/5 transition-colors">
          {problemCount.errors > 0 && (
            <span className="text-[#f38ba8]">{problemCount.errors} {problemCount.errors === 1 ? "error" : "errors"}</span>
          )}
          {problemCount.warnings > 0 && (
            <span className="text-[#f9e2af]">{problemCount.warnings} {problemCount.warnings === 1 ? "warning" : "warnings"}</span>
          )}
          {problemCount.errors === 0 && problemCount.warnings === 0 && (
            <span className="text-[#a6e3a1]">0 errors 0 warnings</span>
          )}
        </button>

        <div className="w-px h-3 bg-[#313244]" />

        {/* Agent status */}
        <button
          onClick={toggleSidebar}
          className={`flex items-center gap-1.5 px-3 h-full hover:bg-white/5 transition-colors ${sidebarOpen ? "text-accent-light" : ""}`}
        >
          <span className={`w-[6px] h-[6px] rounded-full ${agentDot}`} />
          <span className={agentColor}>
            {agentStatus === "thinking" ? "Thinking..." : "Agent"}
          </span>
        </button>
      </div>

      {/* Spacer */}
      <div className="flex-1" />

      {/* Right section */}
      <div className="flex items-center">
        {/* Encoding */}
        <button className="px-3 h-full hover:bg-white/5 transition-colors">UTF-8</button>

        <div className="w-px h-3 bg-[#313244]" />

        {/* Line ending */}
        <button className="px-3 h-full hover:bg-white/5 transition-colors">CRLF</button>

        <div className="w-px h-3 bg-[#313244]" />

        {/* Indentation */}
        <button className="px-3 h-full hover:bg-white/5 transition-colors">Spaces: 2</button>

        <div className="w-px h-3 bg-[#313244]" />

        {/* Language */}
        <button className="px-3 h-full hover:bg-white/5 transition-colors">
          {activeFile?.language || "Plain Text"}
        </button>

        <div className="w-px h-3 bg-[#313244]" />

        {/* Theme toggle */}
        <button className="flex items-center gap-1 px-3 h-full hover:bg-white/5 transition-colors capitalize">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            {theme === "dark" ? (
              <>
                <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
              </>
            ) : (
              <>
                <circle cx="12" cy="12" r="5" />
                <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
              </>
            )}
          </svg>
          {theme}
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

function countProblems(tabs: { path: string; content: string; language: string }[], activeTab: string | null) {
  if (!activeTab) return { errors: 0, warnings: 0 }
  const tab = tabs.find((t) => t.path === activeTab)
  if (!tab) return { errors: 0, warnings: 0 }
  // Simple heuristic
  const lines = tab.content.split("\n")
  const errors = lines.filter((l: string) => /error|Error|ERROR/.test(l) && !l.trim().startsWith("//") && !l.trim().startsWith("#") && !l.trim().startsWith("<!--")).length
  const warnings = lines.filter((l: string) => /TODO|FIXME|HACK|XXX|warning/i.test(l)).length
  return { errors: Math.min(errors, 9), warnings: Math.min(warnings, 9) }
}
