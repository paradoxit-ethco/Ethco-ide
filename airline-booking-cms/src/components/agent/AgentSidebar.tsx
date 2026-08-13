import { useState, useEffect } from "react"
import { useAgentStore } from "../../stores/agentStore"
import { useConnectionStore } from "../../stores/connectionStore"
import { ConnectionModal } from "./ConnectionModal"
import { MessageList } from "./MessageList"
import { ChatInput } from "./ChatInput"
import { ModelPicker } from "./ModelPicker"

interface AgentSidebarProps {
  width?: number
}

export function AgentSidebar({ width = 340 }: AgentSidebarProps) {
  const [showConnect, setShowConnect] = useState(false)
  const [historyOpen, setHistoryOpen] = useState(false)

  const connected = useConnectionStore((s) => s.connected)
  const connecting = useConnectionStore((s) => s.connecting)
  const config = useConnectionStore((s) => s.config)

  const sessions = useAgentStore((s) => s.sessions)
  const activeSessionId = useAgentStore((s) => s.activeSessionId)
  const setActiveSession = useAgentStore((s) => s.setActiveSession)
  const createSession = useAgentStore((s) => s.createSession)
  const deleteSession = useAgentStore((s) => s.deleteSession)
  const clearAllSessions = useAgentStore((s) => s.clearAllSessions)
  const deleteMessage = useAgentStore((s) => s.deleteMessage)
  const revertSession = useAgentStore((s) => s.revertSession)
  const setSidebarOpen = useAgentStore((s) => s.setSidebarOpen)

  const activeSession = sessions.find((s) => s.id === activeSessionId)

  // Auto-create session on connect if list is empty
  useEffect(() => {
    if (connected && sessions.length === 0) {
      createSession("build", config.model || "default")
    }
  }, [connected, sessions.length])

  if (!connected) {
    return (
      <>
        <div
          style={{ width: `${width}px` }}
          className="bg-surface-alt border-l border-[var(--border)] flex flex-col shrink-0 transition-[width] ease-out duration-75 select-none"
        >
          <div className="flex items-center justify-between px-3 py-2 border-b border-[var(--border)]">
            <span className="text-xs font-semibold text-[var(--text)]">Agent</span>
            <button
              onClick={() => setSidebarOpen(false)}
              className="text-xs px-1.5 py-0.5 rounded hover:bg-white/10 text-text-muted hover:text-[var(--text)] transition-colors"
            >
              ✕
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
      <div
        style={{ width: `${width}px` }}
        className="bg-surface-alt border-l border-[var(--border)] flex flex-col shrink-0 transition-[width] ease-out duration-75 relative"
      >
        {/* Header bar */}
        <div className="flex items-center justify-between px-3 py-2 border-b border-[var(--border)] select-none shrink-0 bg-[var(--surface-raised)]">
          <div className="flex items-center gap-2 min-w-0">
            <span className="text-xs font-semibold text-[var(--text)] shrink-0">Agent</span>
            {config.model && (
              <span className="text-[9px] px-1.5 py-0.5 rounded bg-success/15 text-success font-medium truncate max-w-[120px]">
                {config.model.split("/").pop()}
              </span>
            )}
          </div>
          <div className="flex items-center gap-1.5 shrink-0">
            {/* New Chat */}
            <button
              onClick={() => {
                createSession("build", config.model || "default")
                setHistoryOpen(false)
              }}
              className="p-1 rounded hover:bg-white/10 text-text-muted hover:text-[var(--text)] transition-colors active:scale-95"
              title="New Chat Session"
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
              </svg>
            </button>
            {/* History drawer selector toggle */}
            <button
              onClick={() => setHistoryOpen(!historyOpen)}
              className={`p-1 rounded transition-colors active:scale-95 ${
                historyOpen ? "bg-accent/20 text-accent-light" : "hover:bg-white/10 text-text-muted hover:text-[var(--text)]"
              }`}
              title="Chat History"
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </button>
            {/* Connection configurations */}
            <button
              onClick={() => setShowConnect(true)}
              className="p-1 rounded hover:bg-white/10 text-text-muted hover:text-[var(--text)] transition-colors"
              title="Connection Settings"
            >
              <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="3" />
                <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a 1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
              </svg>
            </button>
            {/* Close sidebar panel */}
            <button
              onClick={() => setSidebarOpen(false)}
              className="text-xs px-1.5 py-0.5 rounded hover:bg-white/10 text-text-muted hover:text-[var(--text)] transition-colors"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Collapsible History Drawer */}
        {historyOpen && (
          <div className="absolute top-[33px] left-0 right-0 z-30 bg-[var(--surface-raised)] border-b border-[var(--border)] shadow-xl animate-fade-in flex flex-col max-h-[260px]">
            <div className="flex items-center justify-between px-3 py-1.5 border-b border-[var(--border)] bg-white/5 select-none">
              <span className="text-[10px] font-bold text-text-muted uppercase tracking-wider">Chat Sessions History ({sessions.length})</span>
              <button
                onClick={() => {
                  if (confirm("Are you sure you want to clear all chat sessions?")) {
                    clearAllSessions()
                    setHistoryOpen(false)
                  }
                }}
                className="text-[9px] text-red-400 hover:text-red-300 font-semibold flex items-center gap-1 active:scale-95 transition-all"
                title="Clear All Sessions"
              >
                Clear All
              </button>
            </div>
            <div className="overflow-y-auto flex-1 divide-y divide-[var(--border)] max-h-[220px]">
              {sessions.length === 0 ? (
                <p className="text-[10px] text-text-dim text-center py-6">No session history found.</p>
              ) : (
                sessions.map((s) => {
                  const isActive = s.id === activeSessionId
                  const firstMsg = s.messages[0]
                  const snippet = firstMsg 
                    ? (firstMsg.content.length > 50 ? `${firstMsg.content.slice(0, 50)}...` : firstMsg.content)
                    : "No messages yet"

                  return (
                    <div
                      key={s.id}
                      onClick={() => {
                        setActiveSession(s.id)
                        setHistoryOpen(false)
                      }}
                      className={`flex items-center justify-between px-3 py-2 cursor-pointer select-none transition-colors group ${
                        isActive ? "bg-accent/10 border-l-2 border-accent" : "hover:bg-white/[0.02]"
                      }`}
                    >
                      <div className="flex-1 min-w-0 pr-2">
                        <div className="flex items-center gap-1.5">
                          <span className="text-[9px] font-bold uppercase tracking-wider text-accent-light bg-accent/20 px-1 rounded">
                            {s.mode}
                          </span>
                          <span className="text-[9px] text-text-dim">
                            {s.messages.length} messages
                          </span>
                        </div>
                        <p className="text-[10px] text-text-muted truncate mt-1 leading-normal font-mono">
                          {snippet}
                        </p>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          deleteSession(s.id)
                        }}
                        className="p-1 rounded opacity-0 group-hover:opacity-100 hover:bg-white/10 text-text-muted hover:text-red-400 transition-all shrink-0 active:scale-95"
                        title="Delete Session"
                      >
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  )
                })
              )}
            </div>
          </div>
        )}

        {/* Message list container */}
        <div className="flex-1 overflow-y-auto min-h-0">
          {activeSession ? (
            <MessageList 
              messages={activeSession.messages} 
              onDeleteMessage={(msgId) => deleteMessage(activeSession.id, msgId)}
              onRevertMessage={(msgId) => revertSession(activeSession.id, msgId)}
            />
          ) : (
            <div className="p-4 text-center text-xs text-text-muted space-y-3 pt-12">
              <p>Start a new agent session</p>
              <button
                onClick={() => createSession("build", config.model || "default")}
                className="px-4 py-1.5 bg-accent text-white rounded-lg text-xs hover:bg-accent-dark transition-colors"
              >
                New Session
              </button>
            </div>
          )}
        </div>

        {/* Footer tools & prompt input */}
        <div className="border-t border-[var(--border)] p-3 space-y-2 bg-[var(--surface)] shrink-0">
          <div className="flex items-center justify-between">
            <ModelPicker />
          </div>
          <div className="relative">
            <ChatInput />
          </div>
        </div>
      </div>
      <ConnectionModal open={showConnect} onClose={() => setShowConnect(false)} />
    </>
  )
}
