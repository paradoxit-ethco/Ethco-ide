import { useConnectionStore } from "../stores/connectionStore"
import { useAgentStore } from "../stores/agentStore"
import { IDE_TOOLS, executeToolCall, type ToolCall } from "./agentTools"

interface ChatMessage {
  role: "system" | "user" | "assistant" | "tool"
  content: string | null
  tool_calls?: ToolCall[]
  tool_call_id?: string
}

export async function sendMessage(sessionId: string, text: string) {
  const { config } = useConnectionStore.getState()
  if (!config.baseUrl) throw new Error("No API endpoint configured")

  const store = useAgentStore.getState()
  const session = store.sessions.find((s) => s.id === sessionId)
  if (!session) throw new Error("Session not found")

  const projectRoot = (window as any).__projectRoot || "unknown"

  const systemPrompt = buildSystemPrompt(projectRoot)

  const messages: ChatMessage[] = [{ role: "system", content: systemPrompt }]

  // Add history (last 30 messages)
  for (const msg of session.messages.slice(-30)) {
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

  try {
    const body: Record<string, unknown> = {
      model: config.model,
      messages,
      tools: IDE_TOOLS,
      tool_choice: "auto",
    }

    const headers: Record<string, string> = { "Content-Type": "application/json" }
    if (config.apiKey) headers["Authorization"] = `Bearer ${config.apiKey}`

    const res = await fetch(`${config.baseUrl}/chat/completions`, {
      method: "POST",
      headers,
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(120000),
    })

    if (!res.ok) {
      const errText = await res.text().catch(() => "")
      const msg = errText || res.statusText
      // Check if it's a model error and include available models
      const { availableModels } = useConnectionStore.getState()
      let hint = ""
      if (msg.includes("not supported") || msg.includes("not found") || msg.includes("model")) {
        hint = availableModels.length > 0
          ? `\n\nAvailable models: ${availableModels.join(", ")}`
          : "\n\nCheck that the model name is correct in connection settings (gear icon → Custom Model field)."
      }
      throw new Error(`API error ${res.status}: ${msg}${hint}`)
    }

    const data = await res.json()
    const choice = data.choices?.[0]
    if (!choice) throw new Error("Empty API response")

    const responseMsg = choice.message

    if (responseMsg.tool_calls && responseMsg.tool_calls.length > 0) {
      // Execute each tool call and show result to user
      for (const tc of responseMsg.tool_calls) {
        const result = await executeToolCall(tc, projectRoot)

        store.addMessage(sessionId, {
          id: crypto.randomUUID(),
          role: "assistant",
          content: `\`${tc.function.name}\` → ${result.slice(0, 800)}${result.length > 800 ? "..." : ""}`,
          timestamp: Date.now(),
        })
      }

      // Send tool results back for final response
      const toolResults = responseMsg.tool_calls.map((tc: ToolCall) => ({
        role: "tool" as const,
        tool_call_id: tc.id,
        content: `Tool ${tc.function.name} executed. Result available in user's chat history above.`,
      }))

      const followUpMessages = [...messages, responseMsg, ...toolResults]
      const followUpRes = await fetch(`${config.baseUrl}/chat/completions`, {
        method: "POST",
        headers,
        body: JSON.stringify({
          model: config.model,
          messages: followUpMessages,
        }),
        signal: AbortSignal.timeout(60000),
      })

      if (followUpRes.ok) {
        const followUpData = await followUpRes.json()
        const followUpChoice = followUpData.choices?.[0]
        if (followUpChoice?.message?.content) {
          store.addMessage(sessionId, {
            id: crypto.randomUUID(),
            role: "assistant",
            content: followUpChoice.message.content,
            timestamp: Date.now(),
          })
        }
      }
    } else if (responseMsg.content) {
      store.addMessage(sessionId, {
        id: crypto.randomUUID(),
        role: "assistant",
        content: responseMsg.content,
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

function buildSystemPrompt(projectRoot: string): string {
  return `<identity>
You are Ethco Agent, a powerful agentic AI coding assistant.
You are pair programming with a USER to solve their coding task. The task may require creating a new codebase, modifying or debugging an existing codebase, or simply answering a question.
The USER will send you requests, which you must always prioritize addressing.
</identity>

<user_information>
The USER's OS is Windows.
Project root: ${projectRoot}
Available tools: read_file, write_file, edit_file (search-and-replace), list_files, run_terminal (execute shell commands), search_code (full-text search across project files).
When reading/writing files, use absolute paths.
</user_information>

<agent_mode>
You operate in three modes:

**PLANNING**: Research the codebase, understand requirements, and design your approach.
- Create implementation_plan.md to document proposed changes
- Present plan to user and iterate until approved
- Use search_code and list_files to explore before making changes

**EXECUTION**: Write code, make changes, implement your design.
- Use write_file, edit_file, read_file to manipulate code
- Use run_terminal to run builds, tests, or dev servers
- Return to PLANNING if you discover unexpected complexity

**VERIFICATION**: Test your changes, validate correctness.
- Run builds/tests via run_terminal
- Present proof of work to the user
- If issues found, switch to EXECUTION to fix, or PLANNING for redesign

Switch modes as needed. Tell the user which mode you're in.
</agent_mode>

<task_tracking>
Use a task.md file to track progress. Format:

- [ ] uncompleted task
- [/] in progress task
- [x] completed task

Update task.md as you work. Break complex tasks into subtasks.
</task_tracking>

<planning>
When starting a significant task:
1. Research the codebase thoroughly
2. Create implementation_plan.md with proposed changes
3. Present plan for user approval
4. Proceed to EXECUTION only after approval

Implementation plan format:
- Goal description
- Proposed changes grouped by component
- Verification plan
- Confidence assessment
</planning>

<execution>
- Write clean, idiomatic code
- Follow existing code patterns and conventions
- Use run_terminal to verify builds compile
- Update task.md as you complete items
</execution>

<verification>
- Run relevant tests via run_terminal
- Verify the build succeeds
- Present evidence of correct behavior
- If errors occur, debug and fix
</verification>

<communication_style>
- Format responses in GitHub-flavored markdown
- Use headers, lists, code blocks for clarity
- Be concise but thorough
- Be proactive but don't surprise - explain what you're doing
- Ask for clarification when uncertain
- Acknowledge mistakes and backtracking
</communication_style>

<tool_usage>
- You are REQUIRED to call a tool when the user asks you to perform an action
- Always use absolute paths
- Use search_code before making changes to understand existing patterns
- Use run_terminal to build and test your changes
- For edits, prefer edit_file (search-and-replace) over write_file for targeted changes
</tool_usage>`
}
