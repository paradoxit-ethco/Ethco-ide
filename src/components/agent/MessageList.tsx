import { useEffect, useRef, useState } from "react"
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
        <div className="text-center text-text-muted text-xs space-y-2 select-none">
          <p className="text-2xl animate-bounce">🤖</p>
          <p className="font-semibold text-[var(--text)]">Ask Ethco Agent anything</p>
          <p className="text-[10px] leading-relaxed max-w-[200px] mx-auto text-text-dim">
            Create files, run command terminal outputs, or inspect the codebase structure.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="p-3 space-y-4">
      {messages.map((msg) => (
        <div
          key={msg.id}
          className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
        >
          <div
            className={`max-w-[90%] rounded-lg px-3.5 py-2.5 text-[12px] leading-relaxed shadow-sm ${
              msg.role === "user"
                ? "bg-accent/15 text-[var(--text)] border border-accent/20"
                : "bg-[var(--surface-raised)] border border-[var(--border)] text-[var(--text)]"
            }`}
          >
            <div className="flex items-center justify-between text-[10px] text-text-dim mb-2 select-none">
              <span className="font-semibold tracking-wider font-mono">
                {msg.role === "user" ? "YOU" : "ETHCO AGENT"}
              </span>
              <span>
                {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
            <div className="space-y-2">
              <MarkdownContent content={msg.content || ""} />
            </div>
          </div>
        </div>
      ))}
      <div ref={bottomRef} />
    </div>
  )
}

function MarkdownContent({ content }: { content: string }) {
  if (!content) return null

  // Safely parse blocks of code vs text blocks
  const parts = content.split(/(```[\s\S]*?```)/g)

  return (
    <div className="space-y-3 break-words">
      {parts.map((part, index) => {
        if (part.startsWith("```")) {
          // Extract info
          const lines = part.split("\n")
          const firstLine = lines[0].replace("```", "").trim()
          const language = firstLine || "text"
          const code = lines.slice(1, -1).join("\n")

          return <CodeBlock key={index} language={language} code={code} />
        } else {
          return <FormattedText key={index} text={part} />
        }
      })}
    </div>
  )
}

function CodeBlock({ language, code }: { language: string; code: string }) {
  const [copied, setCopied] = useState(false)

  const copyToClipboard = () => {
    navigator.clipboard.writeText(code)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="my-2 border border-[var(--border)] rounded overflow-hidden shadow-md bg-[#131313] font-mono">
      {/* Code header bar */}
      <div className="flex items-center justify-between px-3 py-1.5 bg-[#181818] border-b border-[var(--border)] text-[10px] text-text-muted select-none">
        <span className="uppercase tracking-wider font-semibold text-accent-light">{language}</span>
        <button
          onClick={copyToClipboard}
          className="hover:text-[var(--text)] transition-colors flex items-center gap-1 hover:bg-white/5 px-2 py-0.5 rounded border border-white/5 active:scale-95"
        >
          {copied ? (
            <>
              <svg className="w-3 h-3 text-success" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12" /></svg>
              Copied!
            </>
          ) : (
            <>
              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><rect x="9" y="9" width="13" height="13" rx="2" ry="2" /><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" /></svg>
              Copy
            </>
          )}
        </button>
      </div>
      {/* Code body block */}
      <pre className="p-3 overflow-x-auto text-[11px] leading-[15px] select-text scrollbar-thin max-h-[350px]">
        <code>{code}</code>
      </pre>
    </div>
  )
}

function FormattedText({ text }: { text: string }) {
  // Process block lines (headers, list items, blank spaces)
  const lines = text.split("\n")

  return (
    <div className="space-y-1">
      {lines.map((line, idx) => {
        const trimmed = line.trim()

        if (!trimmed) {
          return <div key={idx} className="h-1.5" />
        }

        // Header styles
        if (trimmed.startsWith("### ")) {
          return <h3 key={idx} className="text-xs font-bold text-[var(--text)] mt-3 mb-1 flex items-center gap-1.5"><span className="w-1 h-3 bg-accent rounded-full inline-block"></span>{line.substring(4)}</h3>
        }
        if (trimmed.startsWith("## ")) {
          return <h2 key={idx} className="text-[13px] font-bold text-[var(--text)] mt-4 mb-2 pb-1 border-b border-[var(--border)]">{line.substring(3)}</h2>
        }
        if (trimmed.startsWith("# ")) {
          return <h1 key={idx} className="text-sm font-bold text-[var(--accent-light)] mt-4 mb-2">{line.substring(2)}</h1>
        }

        // Bullet lists
        if (trimmed.startsWith("- ") || trimmed.startsWith("* ")) {
          return (
            <div key={idx} className="flex items-start gap-1.5 ml-2.5 my-1 leading-relaxed">
              <span className="text-accent-light shrink-0 select-none mt-1.5 w-1 h-1 rounded-full bg-[var(--accent-light)]" />
              <div className="flex-1 text-slate-300">
                <InlineFormatter text={trimmed.substring(2)} />
              </div>
            </div>
          )
        }

        // Standard line
        return (
          <p key={idx} className="leading-relaxed">
            <InlineFormatter text={line} />
          </p>
        )
      })}
    </div>
  )
}

function InlineFormatter({ text }: { text: string }) {
  // Parse bold and inline code elements
  // Note: we target single and double backticks for inline code, and "**" or "__" for bold text
  const parts = text.split(/(`[^`]+`|\?\?[^\?]+\?\?|\*\*[^*]+\*\*)/g)

  return (
    <>
      {parts.map((part, i) => {
        if (part.startsWith("`") && part.endsWith("`")) {
          return (
            <code key={i} className="bg-white/10 px-1 py-0.5 rounded font-mono text-[11px] text-accent-light font-medium mx-0.5">
              {part.slice(1, -1)}
            </code>
          )
        }
        if (part.startsWith("**") && part.endsWith("**")) {
          return (
            <strong key={i} className="font-bold text-[var(--accent-light)]">
              {part.slice(2, -2)}
            </strong>
          )
        }
        return part
      })}
    </>
  )
}
