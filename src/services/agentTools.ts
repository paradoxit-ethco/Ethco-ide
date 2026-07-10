import { getFS } from "./fs-provider"
import { searchInFiles, searchFiles } from "./search"

export interface ToolDef {
  type: "function"
  function: {
    name: string
    description: string
    parameters: Record<string, unknown>
  }
}

export interface ToolCall {
  id: string
  type: "function"
  function: {
    name: string
    arguments: string
  }
}

export type ToolResult = {
  role: "tool"
  tool_call_id: string
  content: string
}

let terminalCommandCallback: ((cmd: string) => void) | null = null
let terminalOutput: string[] = []

export function setTerminalCommandCallback(fn: (cmd: string) => void) {
  terminalCommandCallback = fn
}

export function appendTerminalOutput(data: string) {
  terminalOutput.push(data)
  if (terminalOutput.length > 100) terminalOutput.shift()
}

export function clearTerminalOutput() {
  terminalOutput = []
}

export const IDE_TOOLS: ToolDef[] = [
  {
    type: "function",
    function: {
      name: "read_file",
      description: "Read the full contents of a file. Returns the complete file content.",
      parameters: {
        type: "object",
        properties: {
          path: { type: "string", description: "Absolute file path" },
        },
        required: ["path"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "write_file",
      description: "Create a new file or overwrite an existing file with new content. Use for creating new files or complete rewrites. For small changes, prefer edit_file.",
      parameters: {
        type: "object",
        properties: {
          path: { type: "string", description: "Absolute file path" },
          content: { type: "string", description: "Full file content to write" },
        },
        required: ["path", "content"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "edit_file",
      description: "Make a targeted search-and-replace edit. The old_string must be a unique, exact substring in the file. Preferred over write_file for small changes.",
      parameters: {
        type: "object",
        properties: {
          path: { type: "string", description: "Absolute file path" },
          old_string: { type: "string", description: "Exact unique text to find and replace" },
          new_string: { type: "string", description: "Replacement text" },
        },
        required: ["path", "old_string", "new_string"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "list_files",
      description: "List files and directories in a directory. Shows names with icons and / for directories.",
      parameters: {
        type: "object",
        properties: {
          path: { type: "string", description: "Directory path (default: project root)" },
        },
        required: [],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "run_terminal",
      description: "Execute a shell command in the IDE terminal. Use for running builds, tests, git commands, dev servers, etc. Maximum 10s timeout for output capture.",
      parameters: {
        type: "object",
        properties: {
          command: { type: "string", description: "Shell command to execute" },
        },
        required: ["command"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "search_code",
      description: "Search file contents across the project for a text string. Returns matching files with line numbers and context.",
      parameters: {
        type: "object",
        properties: {
          query: { type: "string", description: "Text to search for (case-insensitive)" },
        },
        required: ["query"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "grep_search",
      description: "Search for files by name matching a pattern. Good for finding files when you know part of the name.",
      parameters: {
        type: "object",
        properties: {
          pattern: { type: "string", description: "Filename pattern to search for (case-insensitive substring)" },
        },
        required: ["pattern"],
      },
    },
  },
]

export async function executeToolCall(
  toolCall: ToolCall,
  projectRoot: string
): Promise<string> {
  const { name, arguments: argsStr } = toolCall.function
  let args: Record<string, string>
  try {
    args = JSON.parse(argsStr)
  } catch {
    return `Error: Invalid JSON in tool arguments: ${argsStr}`
  }

  try {
    switch (name) {
      case "read_file":
        return await readFileTool(args.path, projectRoot)
      case "write_file":
        return await writeFileTool(args.path, args.content, projectRoot)
      case "edit_file":
        return await editFileTool(args.path, args.old_string, args.new_string, projectRoot)
      case "list_files":
        return await listFilesTool(args.path || projectRoot)
      case "run_terminal":
        return await runTerminalTool(args.command)
      case "search_code":
        return await searchCodeTool(args.query, projectRoot)
      case "grep_search":
        return await grepSearchTool(args.pattern, projectRoot)
      default:
        return `Error: Unknown tool '${name}'`
    }
  } catch (e: any) {
    return `Error executing ${name}: ${e.message || String(e)}`
  }
}

function resolvePath(filePath: string, root: string): string {
  if (filePath.startsWith("/") || filePath.match(/^[A-Za-z]:\\/)) return filePath
  return `${root}/${filePath.replace(/\\/g, "/")}`
}

async function readFileTool(filePath: string, root: string): Promise<string> {
  const fs = getFS()
  const full = resolvePath(filePath, root)
  const content = await fs.readFile(full)
  return content
}

async function writeFileTool(filePath: string, content: string, root: string): Promise<string> {
  const fs = getFS()
  const full = resolvePath(filePath, root)
  await fs.writeFile(full, content)
  return `File written: ${full} (${content.length} bytes)`
}

async function editFileTool(filePath: string, oldStr: string, newStr: string, root: string): Promise<string> {
  const fs = getFS()
  const full = resolvePath(filePath, root)
  const content = await fs.readFile(full)
  const idx = content.indexOf(oldStr)
  if (idx === -1) {
    return `Error: Could not find the specified text in the file. Make sure the exact string exists.`
  }
  const updated = content.replace(oldStr, newStr)
  await fs.writeFile(full, updated)
  return `File edited: ${full} (${updated.length} bytes, ${content.length - updated.length} bytes delta)`
}

async function listFilesTool(dirPath: string): Promise<string> {
  const fs = getFS()
  const entries = await fs.listDirectory(dirPath)
  const lines = entries.map((e) => {
    const icon = e.isDir ? "📁" : "📄"
    return `${icon} ${e.name}${e.isDir ? "/" : ""}`
  })
  return lines.join("\n")
}

async function runTerminalTool(command: string): Promise<string> {
  if (!terminalCommandCallback) {
    return "Error: Terminal is not initialized. Open the terminal panel first."
  }
  clearTerminalOutput()
  terminalCommandCallback(command)
  // Wait for output with polling (up to 8s)
  const start = Date.now()
  while (Date.now() - start < 8000) {
    await new Promise((resolve) => setTimeout(resolve, 500))
    const out = terminalOutput.join("")
    if (out.length > 0) {
      // Got output - give it a bit more time to complete
      await new Promise((resolve) => setTimeout(resolve, 1500))
      return terminalOutput.join("").slice(0, 10000) || out
    }
  }
  return terminalOutput.join("").slice(0, 10000) || "Command executed (no output captured)"
}

async function grepSearchTool(pattern: string, root: string): Promise<string> {
  const results = await searchFiles(root, pattern)
  if (results.length === 0) return "No files found matching that pattern"
  return results.map((p) => `📄 ${p}`).join("\n")
}

async function searchCodeTool(query: string, root: string): Promise<string> {
  const results = await searchInFiles(root, query, 20)
  if (results.length === 0) return "No results found"
  const lines: string[] = []
  for (const r of results) {
    lines.push(`\n${r.path}:`)
    for (const m of r.matches) {
      lines.push(`  L${m.line}: ${m.text.slice(0, 120)}`)
    }
  }
  return lines.join("\n")
}
