import { useState, useEffect } from "react"
import { useAgentStore } from "../../stores/agentStore"
import { useConnectionStore } from "../../stores/connectionStore"
import { ConnectionModal } from "./ConnectionModal"
import { MessageList } from "./MessageList"
import { ChatInput } from "./ChatInput"
import { ModelPicker } from "./ModelPicker"

export function AgentSidebar() {
  const [showConnect, setShowConnect] = useState(false)
  const connected = useConnectionStore((s) => s.connected)
  const connecting = useConnectionStore((s) => s.connecting)
  const config = useConnectionStore((s) => s.config)

  const sessions = useAgentStore((s) => s.sessions)
  const activeSessionId = useAgentStore((s) => s.activeSessionId)
  const setActiveSession = useAgentStore((s) => s.setActiveSession)
  const createSession = useAgentStore((s) => s.createSession)
  const setSidebarOpen = useAgentStore((s) => s.setSidebarOpen)
  const activeSession = sessions.find((s) => s.id === activeSessionId)

  // Auto-create session on connect
  useEffect(() => {
    if (connected && sessions.length === 0) {
      createSession("build", config.model)
    }
  }, [connected])

  if (!connected) {
    return (
      <>
        <div className="w-80 min-w-[300px] max-w-[450px] bg-surface-alt border-l border-[var(--border)] flex flex-col">
          <div className="flex items-center justify-between px-3 py-2 border-b border-[var(--border)]">
            <span className="text-xs font-semibold text-[var(--text)]">Agent</span>
            <button
              onClick={() => setSidebarOpen(false)}
              className="text-xs px-1.5 py-0.5 rounded hover:bg-white/10 text-text-muted hover:text-[var(--text)] transition-colors"
            >
              \u2715
            </button>
          </div>

          <div className="flex-1 flex items-center justify-center px-6">
            <div className="text-center space-y-4">
              <svg className="w-10 h-10 mx-auto text-text-dim" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" />
                <path d="M12 16v-4" />
                <path d="M12 8h.01" />
              </svg>
              <div>
                <p className="text-sm font-medium text-[var(--text)]">Not Connected</p>
                <p className="text-xs text-text-muted mt-1">Connect to an API endpoint to use the agent</p>
              </div>
              <button
                onClick={() => setShowConnect(true)}
                disabled={connecting}
                className="px-5 py-2 text-sm font-medium bg-accent text-white rounded-lg hover:bg-accent-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 mx-auto"
              >
                {connecting ? (
                  <>
                    <div className="w-3.5 h-3.5 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                    Connecting...
                  </>
                ) : (
                  <>
                    <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M5 12h14" /><path d="M12 5l7 7-7 7" />
                    </svg>
                    Connect
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
        <ConnectionModal open={showConnect} onClose={() => setShowConnect(false)} />
      </>
    )
  }

  return (
    <>
      <div className="w-80 min-w-[300px] max-w-[450px] bg-surface-alt border-l border-[var(--border)] flex flex-col">
        <div className="flex items-center justify-between px-3 py-2 border-b border-[var(--border)]">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-[var(--text)]">Agent</span>
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-success/15 text-success">
              {config.model.split("/").pop()}
            </span>
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setShowConnect(true)}
              className="text-[10px] px-1.5 py-0.5 rounded hover:bg-white/10 text-text-muted hover:text-[var(--text)] transition-colors"
              title="Connection settings"
            >
              <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="3"/><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/></svg>
            </button>
            <button
              onClick={() => setSidebarOpen(false)}
              className="text-xs px-1.5 py-0.5 rounded hover:bg-white/10 text-text-muted hover:text-[var(--text)] transition-colors"
            >
              \u2715
            </button>
          </div>
        </div>

        {sessions.length > 1 && (
          <div className="flex gap-1 px-3 py-1.5 border-b border-[var(--border)] overflow-x-auto">
            {sessions.map((s) => (
              <button
                key={s.id}
                onClick={() => setActiveSession(s.id)}
                className={`text-[10px] px-2 py-0.5 rounded-full whitespace-nowrap transition-colors ${
                  s.id === activeSessionId
                    ? "bg-accent/30 text-accent-light"
                    : "bg-white/5 text-text-muted hover:text-[var(--text)]"
                }`}
              >
                {s.mode} {s.messages.length > 0 ? `(${s.messages.length})` : ""}
              </button>
            ))}
          </div>
        )}

        <div className="flex-1 overflow-y-auto min-h-0">
          {activeSession ? (
            <MessageList messages={activeSession.messages} />
          ) : (
            <div className="p-4 text-center text-xs text-text-muted space-y-3">
              <p>Start a new agent session</p>
              <button
                onClick={() => createSession("build", config.model)}
                className="px-4 py-1.5 bg-accent text-white rounded-lg text-xs hover:bg-accent-dark transition-colors"
              >
                New Session
              </button>
            </div>
          )}
        </div>

        <div className="border-t border-[var(--border)] p-2 space-y-2">
          <div className="flex items-center justify-between">
            <ModelPicker />
          </div>
          <ChatInput />
        </div>
      </div>
      <ConnectionModal open={showConnect} onClose={() => setShowConnect(false)} />
    </>
  )
}
