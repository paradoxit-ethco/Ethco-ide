# 02 — Architecture

## 2.1 System diagram

```
┌─────────────────────────────────────────────────────────────────┐
│  Ethco IDE (Tauri)                                               │
│                                                                   │
│  ┌─────────────────────┐   ┌──────────────────┐                  │
│  │  Webview (React UI)  │   │  Rust Backend     │                 │
│  │                      │   │  (tokio runtime)   │                 │
│  │  ┌─────────────────┐ │   │                    │                 │
│  │  │ Monaco Editor   │ │   │  - File system     │                 │
│  │  │ (tabs, diff,    │ │   │    (safe fs ops)   │                 │
│  │  │  IntelliSense)  │ │   │  - PTY (terminal)  │                 │
│  │  ├─────────────────┤ │   │  - Project watcher │                 │
│  │  │ File Explorer   │ │   │  - Git integration │                 │
│  │  ├─────────────────┤ │   │  - OpenCode        │──── sidecar ──►│
│  │  │ Terminal (xterm)│ │   │    sidecar manager  │               │
│  │  ├─────────────────┤ │   │                    │               │
│  │  │ Agent Sidebar   │ │   └──────────────────┘               │
│  │  │ (collapsible)   │ │         │ IPC (invoke + events)       │
│  │  └─────────────────┘ │         │                              │
│  └─────────────────────┘          │                              │
│           │                       │                              │
│           └───────────┬───────────┘                              │
│                       ▼                                          │
│            @opencode-ai/sdk (HTTP/SSE, localhost)                 │
│                       ▼                                          │
│              OpenCode Binary (sidecar process)                    │
│              - spawned by Rust on launch                          │
│              - health-checked every 5s                            │
│              - auto-restarted on crash                            │
│              - killed on app quit                                 │
└─────────────────────────────────────────────────────────────────┘
```

## 2.2 Process model

```
┌─ Tauri app ──────────────────────────────┐
│  Main process (Rust)                      │
│  ├─ Tauri core (window management)        │
│  ├─ File system service (tokio::fs)       │
│  ├─ PTY service (portable-pty)            │
│  ├─ Project watcher (notify crate)        │
│  └─ OpenCode sidecar manager              │
│     ├─ Spawn on app launch                │
│     ├─ Health check every 5s              │
│     ├─ Restart with backoff on crash      │
│     └─ Graceful shutdown on app quit      │
│                                           │
│  Webview process (system webview)         │
│  └─ React app                             │
│     ├─ Monaco Editor                      │
│     ├─ File explorer (React tree)         │
│     ├─ Terminal (xterm.js)                │
│     └─ Agent sidebar                      │
└───────────────────────────────────────────┘
```

## 2.3 Data flow — agent turn

1. User types prompt in agent sidebar → React calls `@opencode-ai/sdk`
2. SDK streams events over SSE from localhost OpenCode process
3. Text deltas → rendered in sidebar message list
4. Tool calls → Rust intercepts file edits via SDK event hooks
5. File edits → routed to Monaco diff editor (Accept/Reject)
6. Accept → Rust writes file via `tokio::fs`
7. Reject → SDK tells OpenCode the change was discarded

## 2.4 Why Rust, not Node.js, for the backend

| Concern | Rust (Tauri) | Node.js (Electron) |
|---|---|---|
| PTY safety | `portable-pty` in safe Rust, no shell injection vectors | `node-pty` — native addon, C++ surface area |
| File system | `tokio::fs`, async, no race conditions | `fs` — callback-based, easy to mis-handle |
| Process mgmt | `std::process` + tokio, full control | `child_process` — limited signal handling |
| Memory | ~10MB for backend | ~40MB for Node.js runtime alone |
| Binary size | ~5MB (Tauri shell) | ~150MB (Electron + Chromium) |
| Security | Strict IPC allowlist, no `eval()` | Full Node.js API in main process |

## 2.5 Sidecar bundle

OpenCode's binary is fetched during build and placed in `src-tauri/binaries/`. Tauri's sidecar plugin handles platform-specific naming (`opencode-x86_64-pc-windows-msvc.exe`, `opencode-aarch64-apple-darwin`, etc.). The Rust backend references it by a single logical name and Tauri resolves the platform path at runtime.
