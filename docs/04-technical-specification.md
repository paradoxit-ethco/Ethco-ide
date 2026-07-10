# 04 — Technical Specification

## 4.1 Stack

| Layer | Choice | Notes |
|---|---|---|
| Desktop shell | **Tauri** (Rust) | 5MB binary, OS-native webview, strict IPC |
| Backend runtime | **tokio** (async Rust) | Filesystem, PTY, sidecar mgmt |
| Editor widget | **Monaco Editor** (`@monaco-editor/react`) | Same engine as VS Code |
| Frontend | **React 18 + TypeScript + Vite** | Fast HMR, typed |
| Styling | **Tailwind CSS** | Utility-first |
| State | **Zustand** | Lightweight, TypeScript-first |
| Terminal backend | **Rust `portable-pty`** | Safe PTY, cross-platform |
| Terminal UI | **xterm.js** + `xterm-addon-fit` | Battle-tested |
| Agent | **OpenCode** (bundled sidecar binary) | Unmodified, auto-managed by Rust |
| Agent SDK | `@opencode-ai/sdk` | HTTP + SSE client to localhost |
| IPC | Tauri `invoke` + events | Typed, secure allowlist |
| Project watching | `notify` crate (Rust) | File system events |
| Git | `git2` crate (Rust) | Native git bindings |
| Packaging | Tauri bundler | .dmg, .deb, .msi |

## 4.2 Rust backend — core services

```rust
// src-tauri/src/main.rs

mod commands;        // Tauri IPC command handlers
mod terminal;        // PTY management (portable-pty)
mod filesystem;      // File read/write/watch
mod sidecar;         // OpenCode binary lifecycle
mod git;             // Git operations (git2)

fn main() {
    tauri::Builder::default()
        .plugin(tauri_plugin_shell::init())   // sidecar support
        .invoke_handler(tauri::generate_handler![
            commands::fs::read_file,
            commands::fs::write_file,
            commands::fs::list_directory,
            commands::fs::create_file,
            commands::fs::delete_file,
            commands::fs::rename_file,
            commands::terminal::create_pty,
            commands::terminal::write_pty,
            commands::terminal::resize_pty,
            commands::sidecar::get_status,
            commands::sidecar::restart_agent,
            commands::git::get_branch,
            commands::git::get_status,
        ])
        .run(tauri::generate_context!())
}
```

### OpenCode sidecar manager

```rust
// src-tauri/src/sidecar.rs

pub struct OpenCodeManager {
    process: Option<Child>,
    port: u16,
}

impl OpenCodeManager {
    pub async fn spawn() -> Result<Self> {
        // Resolve sidecar binary path via Tauri's sidecar API
        let (mut rx, child) = Command::new_sidecar("opencode")?
            .args(["--port", "4096"])
            .spawn()?;

        // Spawn health-check loop
        tokio::spawn(async move {
            loop {
                tokio::time::sleep(Duration::from_secs(5)).await;
                // Health check via HTTP GET to localhost:4096/health
            }
        });

        Ok(Self { process: Some(child), port: 4096 })
    }

    pub fn port(&self) -> u16 { self.port }
}
```

## 4.3 Frontend — core components

```tsx
// Core layout
<App>
  <FileExplorer />
  <EditorTabs>
    <MonacoEditor />
  </EditorTabs>
  <AgentSidebar />       {/* collapsible, VS Code-style */}
  <TerminalPanel />      {/* bottom panel, xterm.js */}
  <StatusBar />
</App>
```

## 4.4 Agent integration

```ts
// src/services/OpenCodeService.ts
import { createOpencodeClient } from "@opencode-ai/sdk"

const client = createOpencodeClient({ baseUrl: "http://127.0.0.1:4096" })

// Create a session
const session = await client.session.create({ agent: "build" })

// Stream chat response
for await (const event of client.session.chat({
  sessionId: session.id,
  parts: [{ type: "text", text: prompt }]
})) {
  switch (event.type) {
    case "text-delta":
      // stream to sidebar message list
      break
    case "tool-call":
      // update status bar
      break
    case "file-edit-proposed":
      // open Monaco diff editor
      break
    case "permission-request":
      // show native dialog
      break
  }
}
```

## 4.5 Diff review flow

1. Agent proposes edit → SDK fires `file-edit-proposed` event
2. Frontend reads original file via `invoke("read_file", { path })`
3. Creates Monaco diff editor: `monaco.editor.createDiffEditor()`
4. Shows Accept/Reject buttons in editor gutter
5. Accept → `invoke("write_file", { path, content })`
6. Reject → discard, report to OpenCode

## 4.6 Manager View (future)

```ts
interface Session {
  id: string
  workspacePath: string
  agentMode: "build" | "plan"
  model: string
  status: "planning" | "running" | "paused" | "done" | "error"
  autonomyLevel: "manual" | "checkpoint" | "full-auto"
  artifacts: Artifact[]
  createdAt: Date
  updatedAt: Date
}
```

## 4.7 Non-functional

- **Local-first**: everything runs on localhost. No cloud required.
- **Crash isolation**: OpenCode crash doesn't crash the IDE — Rust restarts it.
- **Startup budget**: agent panel interactive within ~2s of launch (spawn sidecar async).
- **Bundle size**: target <100MB for base install.
- **Memory**: target <200MB idle (vs 500MB+ for VS Code).
