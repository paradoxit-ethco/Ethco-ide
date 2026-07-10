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

const MAX_TOOL_ROUNDS = 8 // maximum agentic loop iterations

export async function sendMessage(sessionId: string, text: string) {
  const { config } = useConnectionStore.getState()
  if (!config.baseUrl) throw new Error("No API endpoint configured")

  const store = useAgentStore.getState()
  const session = store.sessions.find((s) => s.id === sessionId)
  if (!session) throw new Error("Session not found")

  const projectRoot = (window as any).__projectRoot || "unknown"

  // Gather open file paths for context
  const openFiles = useEditorStore.getState().tabs.map(t => t.path)
  const systemPrompt = buildAdvancedSystemPrompt(projectRoot, openFiles)

  const messages: ChatMessage[] = [{ role: "system", content: systemPrompt }]

  // Add history (last 40 messages for deeper context)
  for (const msg of session.messages.slice(-40)) {
    if (msg.role === "user") {
      messages.push({ role: "user", content: msg.content })
    } else if (msg.role === "assistant") {
      messages.push({ role: "assistant", content: msg.content })
    }
  }

  messages.push({ role: "user", content: text })

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
    // === Agentic Loop ===
    // The agent can call tools, get results, and continue reasoning
    // for up to MAX_TOOL_ROUNDS iterations before requiring user input.
    let round = 0

    while (round < MAX_TOOL_ROUNDS) {
      round++

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
        signal: AbortSignal.timeout(120000),
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
        // Show assistant's reasoning if any
        if (responseMsg.content) {
          store.addMessage(sessionId, {
            id: crypto.randomUUID(),
            role: "assistant",
            content: responseMsg.content,
            timestamp: Date.now(),
          })
        }

        // Add assistant message with tool calls to conversation
        messages.push(responseMsg)

        // Execute each tool call
        const toolResults: ChatMessage[] = []
        for (const tc of responseMsg.tool_calls) {
          const toolName = tc.function.name
          const toolArgs = safeParseArgs(tc.function.arguments)

          // Show the tool invocation to the user
          store.addMessage(sessionId, {
            id: crypto.randomUUID(),
            role: "assistant",
            content: formatToolCall(toolName, toolArgs),
            timestamp: Date.now(),
          })

          // Execute the tool
          const result = await executeToolCall(tc, projectRoot)

          // Show truncated result
          const truncated = result.length > 1200
            ? result.slice(0, 1200) + `\n... (${result.length - 1200} chars truncated)`
            : result
          store.addMessage(sessionId, {
            id: crypto.randomUUID(),
            role: "assistant",
            content: `\`\`\`\n${truncated}\n\`\`\``,
            timestamp: Date.now(),
          })

          // Add tool result to messages for next round
          toolResults.push({
            role: "tool",
            tool_call_id: tc.id,
            content: result.slice(0, 15000), // limit context size
          })
        }

        // Add all tool results to the conversation
        messages.push(...toolResults)

        // Continue the loop — the model will see tool results and decide next action
        continue
      }

      // --- No tool calls: final text response ---
      if (responseMsg.content) {
        store.addMessage(sessionId, {
          id: crypto.randomUUID(),
          role: "assistant",
          content: responseMsg.content,
          timestamp: Date.now(),
        })
      }

      // Break the loop — no more tool calls needed
      break
    }

    if (round >= MAX_TOOL_ROUNDS) {
      store.addMessage(sessionId, {
        id: crypto.randomUUID(),
        role: "assistant",
        content: `⚠️ Reached maximum tool execution rounds (${MAX_TOOL_ROUNDS}). Pausing for your input.`,
        timestamp: Date.now(),
      })
    }
  } catch (e: any) {
    store.addMessage(sessionId, {
      id: crypto.randomUUID(),
      role: "assistant",
      content: `**Error**: ${e.message || "Request failed"}\n\nCheck your connection settings and ensure the API endpoint is correct.`,
      timestamp: Date.now(),
    })
  } finally {
    store.setStatus(sessionId, "idle")
  }
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
