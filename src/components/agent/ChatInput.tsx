import { useState, useRef, useCallback } from "react"
import { useAgentStore } from "../../stores/agentStore"
import { sendMessage, cancelMessage } from "../../services/chatService"

export function ChatInput() {
  const [input, setInput] = useState("")
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const activeSessionId = useAgentStore((s) => s.activeSessionId)
  const session = useAgentStore((s) =>
    s.activeSessionId ? s.sessions.find((se) => se.id === s.activeSessionId) : null
  )

  const handleSend = useCallback(async () => {
    const trimmed = input.trim()
    if (!trimmed || !activeSessionId) return
    setInput("")

    try {
      await sendMessage(activeSessionId, trimmed)
    } catch (e: any) {
      const addMessage = useAgentStore.getState().addMessage
      const setStatus = useAgentStore.getState().setStatus
      addMessage(activeSessionId, {
        id: crypto.randomUUID(),
        role: "assistant",
        content: `**Error**: ${e.message || "Failed to send message"}`,
        timestamp: Date.now(),
      })
      setStatus(activeSessionId, "idle")
    }
  }, [input, activeSessionId])

  function handleStop() {
    if (activeSessionId) {
      cancelMessage(activeSessionId)
    }
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <div className="space-y-1.5">
      <div className="flex gap-2">
        <textarea
          ref={textareaRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={
            session?.status === "thinking"
              ? "Agent is thinking..."
              : "Ask the agent to do something..."
          }
          rows={2}
          disabled={session?.status === "thinking"}
          className="flex-1 bg-surface border border-[var(--border)] rounded-lg px-3 py-2 text-xs text-[var(--text)] placeholder-text-muted resize-none outline-none focus:border-accent transition-colors disabled:opacity-50"
        />
        <button
          onClick={session?.status === "thinking" ? handleStop : handleSend}
          disabled={!input.trim() && session?.status !== "thinking"}
          className={`px-3 py-2 text-white rounded-lg text-xs transition-colors self-end flex items-center gap-1 ${
            session?.status === "thinking"
              ? "bg-red-500/80 hover:bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.5)]"
              : "bg-accent hover:bg-accent-dark disabled:opacity-40 disabled:cursor-not-allowed"
          }`}
          title={session?.status === "thinking" ? "Halt current task" : "Send message"}
        >
          {session?.status === "thinking" ? (
            <svg className="w-3 h-3" viewBox="0 0 24 24" fill="currentColor">
              <rect x="6" y="6" width="12" height="12" rx="2" />
            </svg>
          ) : (
            <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
          )}
        </button>
      </div>
    </div>
  )
}
