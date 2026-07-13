import { useConnectionStore } from "../stores/connectionStore"
import { useAgentStore } from "../stores/agentStore"
import { useEditorStore } from "../stores/editorStore"
import { IDE_TOOLS, executeToolCall, type ToolCall } from "./agentTools"
import { buildAdvancedSystemPrompt } from "./prompts"

interface ChatMessage {
  role: "system" | "user" | "assistant" | "tool"
  content: string | null
  tool_calls?: ToolCall[]
  tool_call_id?: string
}

// Map to track active request controllers for cancellations
const activeControllers = new Map<string, AbortController>()

export function cancelMessage(sessionId: string) {
  const ctrl = activeControllers.get(sessionId)
  if (ctrl) {
    ctrl.abort()
    activeControllers.delete(sessionId)
  }
}

export async function sendMessage(sessionId: string, text: string) {
  const { config } = useConnectionStore.getState()
  if (!config.baseUrl) throw new Error("No API endpoint configured")

  const store = useAgentStore.getState()
  const session = store.sessions.find((s) => s.id === sessionId)
  if (!session) throw new Error("Session not found")

  const projectRoot = (window as any).__projectRoot || "unknown"

  // Setup cancellation controller
  const controller = new AbortController()
  activeControllers.set(sessionId, controller)

  // Gather open file paths for context
  const openFiles = useEditorStore.getState().tabs.map(t => t.path)
  const systemPrompt = buildAdvancedSystemPrompt(projectRoot, openFiles)

  let messages: ChatMessage[] = [{ role: "system", content: systemPrompt }]

  // Add history (last 40 messages for deeper context)
  for (const msg of session.messages.slice(-40)) {
    if (msg.role === "user") {
      messages.push({ role: "user", content: msg.content })
    } else if (msg.role === "assistant") {
      messages.push({ role: "assistant", content: msg.content })
    }
  }

  messages.push({ role: "user", content: text })

  // Log user message
  store.addMessage(sessionId, {
    id: crypto.randomUUID(),
    role: "user",
    content: text,
    timestamp: Date.now(),
  })

  store.setStatus(sessionId, "thinking")

  const headers: Record<string, string> = { "Content-Type": "application/json" }
  if (config.apiKey) headers["Authorization"] = `Bearer ${config.apiKey}`

  try {
    // === Unbounded Agentic Loop ===
    // The agent runs autonomously and executes perfectly until completion or manual cancel.
    let isFinished = false

    while (!isFinished && !controller.signal.aborted) {

      // --- Elite Context Auto-Compression ---
      // Estimate token boundary (approx 125,000 threshold mapping to ~450,000 chars)
      const currentPayloadCharLen = messages.reduce((acc, m) => acc + (m.content?.length || 0), 0)
      
      if (currentPayloadCharLen > 400_000) {
        messages = await performAutoCompression(messages, config, sessionId, store, controller.signal)
      }

      const body: Record<string, unknown> = {
        model: config.model,
        messages,
        tools: IDE_TOOLS,
        tool_choice: "auto",
      }

      const res = await fetch(`${config.baseUrl}/chat/completions`, {
        method: "POST",
        headers,
        body: JSON.stringify(body),
        signal: controller.signal,
      })

      if (!res.ok) {
        const errText = await res.text().catch(() => "")
        const msg = errText || res.statusText
        const { availableModels } = useConnectionStore.getState()
        let hint = ""
        if (msg.includes("not supported") || msg.includes("not found") || msg.includes("model")) {
          hint = availableModels.length > 0
            ? `\n\nAvailable models: ${availableModels.join(", ")}`
            : "\n\nCheck that the model name is correct in connection settings."
        }
        throw new Error(`API error ${res.status}: ${msg}${hint}`)
      }

      const data = await res.json()
      const choice = data.choices?.[0]
      if (!choice) throw new Error("Empty API response")

      const responseMsg = choice.message

      // --- Tool call handling ---
      if (responseMsg.tool_calls && responseMsg.tool_calls.length > 0) {
        // Show assistant's reasoning if any exists
        if (responseMsg.content) {
          store.addMessage(sessionId, {
            id: crypto.randomUUID(),
            role: "assistant",
            content: responseMsg.content,
            timestamp: Date.now(),
          })
        }

        // Add assistant message with tool definitions into exact message array structure
        messages.push(responseMsg)

        // Execute each tool call
        const toolResults: ChatMessage[] = []
        for (const tc of responseMsg.tool_calls) {
          if (controller.signal.aborted) break

          const toolName = tc.function.name
          const toolArgs = safeParseArgs(tc.function.arguments)

          // Show the tool invocation to the user
          store.addMessage(sessionId, {
            id: crypto.randomUUID(),
            role: "assistant",
            content: formatToolCall(toolName, toolArgs),
            timestamp: Date.now(),
          })

          // Execute the tool locally
          const result = await executeToolCall(tc, projectRoot)

          // Show truncated result purely in UI (protect scroll performance)
          const truncated = result.length > 1200
            ? result.slice(0, 1200) + `\n... (${result.length - 1200} chars truncated)`
            : result
            
          store.addMessage(sessionId, {
            id: crypto.randomUUID(),
            role: "assistant",
            content: `\`\`\`\n${truncated}\n\`\`\``,
            timestamp: Date.now(),
          })

          // Feed full execution output back into pure LLM payload
          toolResults.push({
            role: "tool",
            tool_call_id: tc.id,
            content: result.slice(0, 30_000), // High capacity internal bounds
          })
        }

        messages.push(...toolResults)
        continue // keep looping if we processed tools!
      }

      // --- No tool calls generated => Agent is finished responding ---
      if (responseMsg.content) {
        store.addMessage(sessionId, {
          id: crypto.randomUUID(),
          role: "assistant",
          content: responseMsg.content,
          timestamp: Date.now(),
        })
      }
      isFinished = true
    }
  } catch (e: any) {
    if (e.name === "AbortError" || e.message.includes("abort")) {
      store.addMessage(sessionId, {
        id: crypto.randomUUID(),
        role: "assistant",
        content: `⛔ **Agent Disconnected:** Live execution sequence aborted manually by user.`,
        timestamp: Date.now(),
      })
    } else {
      store.addMessage(sessionId, {
        id: crypto.randomUUID(),
        role: "assistant",
        content: `**Error**: ${e.message || "Request failed"}\n\nCheck your connection settings.`,
        timestamp: Date.now(),
      })
    }
  } finally {
    activeControllers.delete(sessionId)
    store.setStatus(sessionId, "idle")
  }
}

/** 
 * Automatically compresses memory blocks if token payload grows exceedingly large. 
 * Allows 125,000+ context stability.
 */
async function performAutoCompression(
  messages: ChatMessage[],
  config: any,
  sessionId: string,
  store: any,
  signal: AbortSignal
): Promise<ChatMessage[]> {
  // Post elite update payload
  store.addMessage(sessionId, {
     id: crypto.randomUUID(),
     role: "assistant",
     content: "🧠 **[Elite Core]: Deep memory compaction initiated...** *(Analyzing backlog to preserve chronological accuracy over 125,000 context limits)*",
     timestamp: Date.now()
  })

  try {
    const sysBlock = messages[0]
    const recentConvo = messages.slice(-5)
    const midString = messages.slice(1, -5).map(m => `[${m.role.toUpperCase()}]: ${m.content}`).join("\n")

    if (midString.length < 500) return messages

    const compressionRequest = {
      model: config.model,
      messages: [
        { 
          role: "system", 
          content: "You are an elite autonomous agent's memory compressor subsystem. Distill the following raw log into a purely factual, robust, heavy chronological summary. Highlight critical path variables, files modified, error outcomes, and user intentions. Delete all hallucination or fluff." 
        },
        { role: "user", content: midString }
      ]
    }
    
    const headers: Record<string, string> = { "Content-Type": "application/json" }
    if (config.apiKey) headers["Authorization"] = `Bearer ${config.apiKey}`

    const res = await fetch(`${config.baseUrl}/chat/completions`, {
       method: "POST", headers, body: JSON.stringify(compressionRequest), signal
    })

    if (res.ok) {
       const wrapper = await res.json()
       const compressed = wrapper.choices?.[0]?.message?.content || "Memories compressed."
       return [
         sysBlock,
         { role: "system", content: `<deep_archive_memory>\n${compressed}\n</deep_archive_memory>` },
         ...recentConvo
       ]
    }
  } catch (err: any) {
    if (err.name === "AbortError") throw err
    // Continue raw if decompression fails
  }
  return messages 
}

/** Format a tool call for display in chat */
function formatToolCall(name: string, args: Record<string, unknown>): string {
  const icons: Record<string, string> = {
    read_file: "📖",
    write_file: "✍️",
    edit_file: "✏️",
    list_files: "📂",
    run_terminal: "⚡",
    search_code: "🔍",
    grep_search: "🔎",
  }
  const icon = icons[name] || "🔧"

  switch (name) {
    case "read_file":
      return `${icon} **Reading** \`${args.path || "?"}\``
    case "write_file":
      return `${icon} **Writing** \`${args.path || "?"}\` (${typeof args.content === "string" ? args.content.length : "?"} bytes)`
    case "edit_file":
      return `${icon} **Editing** \`${args.path || "?"}\``
    case "list_files":
      return `${icon} **Listing** \`${args.path || "project root"}\``
    case "run_terminal":
      return `${icon} **Running** \`${args.command || "?"}\``
    case "search_code":
      return `${icon} **Searching** for \`${args.query || "?"}\``
    case "grep_search":
      return `${icon} **Finding files** matching \`${args.pattern || "?"}\``
    default:
      return `${icon} **${name}** ${JSON.stringify(args).slice(0, 100)}`
  }
}

/** Safely parse tool call arguments */
function safeParseArgs(argsStr: string): Record<string, unknown> {
  try {
    return JSON.parse(argsStr)
  } catch {
    return { raw: argsStr }
  }
}
