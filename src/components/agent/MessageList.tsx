import { useEffect, useRef } from "react"
import type { Message } from "../../stores/agentStore"

interface MessageListProps {
  messages: Message[]
}

export function MessageList({ messages }: MessageListProps) {
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  if (messages.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center p-4">
        <div className="text-center text-text-muted text-xs space-y-2">
          <p className="text-lg">\uD83E\uDD16</p>
          <p>Ask the agent anything</p>
          <p className="text-[10px]">e.g. "Add error handling to this function"</p>
        </div>
      </div>
    )
  }

  return (
    <div className="p-3 space-y-3">
      {messages.map((msg) => (
        <div
          key={msg.id}
          className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
        >
          <div
            className={`max-w-[85%] rounded-lg px-3 py-2 text-xs leading-relaxed ${
              msg.role === "user"
                ? "bg-accent/20 text-[var(--text)]"
                : "bg-white/5 text-[var(--text)]"
            }`}
          >
            <div className="text-[10px] text-text-muted mb-1">
              {msg.role === "user" ? "You" : "Agent"}
            </div>
            <div className="whitespace-pre-wrap break-words">{msg.content}</div>
          </div>
        </div>
      ))}
      <div ref={bottomRef} />
    </div>
  )
}
