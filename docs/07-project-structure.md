# 07 — Project Structure

```
ethco-ide/
├── src/                              # React frontend (TypeScript + Vite)
│   ├── main.tsx                      # Entry point
│   ├── App.tsx                       # Root layout, window management
│   ├── components/
│   │   ├── editor/
│   │   │   ├── MonacoEditor.tsx      # @monaco-editor/react wrapper
│   │   │   ├── DiffEditor.tsx        # Monaco diff editor for review
│   │   │   └── EditorTabs.tsx        # Open file tabs with state
│   │   ├── explorer/
│   │   │   ├── FileTree.tsx          # Tree view of project files
│   │   │   ├── FileTreeNode.tsx      # Single file/dir node
│   │   │   └── ContextMenu.tsx       # Right-click actions
│   │   ├── terminal/
│   │   │   └── TerminalPanel.tsx     # xterm.js wrapper
│   │   ├── agent/
│   │   │   ├── AgentSidebar.tsx      # Collapsible sidebar panel
│   │   │   ├── MessageList.tsx       # Streaming message history
│   │   │   ├── ChatInput.tsx         # Prompt input + send
│   │   │   └── ModelPicker.tsx       # Model selector dropdown
│   │   ├── statusbar/
│   │   │   └── StatusBar.tsx         # Git branch, agent state, cursor
│   │   └── common/
│   │       ├── PermissionDialog.tsx
│   │       └── Icon.tsx
│   ├── services/
│   │   ├── opencode.ts               # SDK client, session management
│   │   ├── filesystem.ts             # Tauri invoke wrappers for fs
│   │   └── terminal.ts               # PTY bridge via Tauri events
│   ├── stores/
│   │   ├── editorStore.ts            # Zustand: open files, active tab
│   │   ├── explorerStore.ts          # Zustand: file tree state
│   │   └── agentStore.ts             # Zustand: sessions, messages
│   ├── hooks/
│   │   ├── useMonaco.ts
│   │   ├── useFilesystem.ts
│   │   └── useTerminal.ts
│   └── styles/
│       └── globals.css               # Tailwind directives + theme vars
├── src-tauri/                        # Rust backend
│   ├── src/
│   │   ├── main.rs                   # Tauri app entry, plugin registration
│   │   ├── lib.rs
│   │   ├── commands/
│   │   │   ├── mod.rs
│   │   │   ├── fs.rs                 # File system IPC handlers
│   │   │   ├── terminal.rs           # PTY IPC handlers
│   │   │   ├── sidecar.rs            # OpenCode lifecycle handlers
│   │   │   └── git.rs                # Git operations
│   │   ├── terminal/
│   │   │   ├── mod.rs
│   │   │   └── pty.rs                # portable-pty wrapper
│   │   └── sidecar/
│   │       ├── mod.rs
│   │       └── manager.rs            # OpenCode process lifecycle
│   ├── binaries/                     # OpenCode sidecar binaries (per platform)
│   ├── Cargo.toml
│   ├── tauri.conf.json
│   └── capabilities/
│       └── default.json              # Tauri capability allowlist
├── public/
│   └── icon.png
├── package.json
├── vite.config.ts
├── tsconfig.json
├── tailwind.config.ts
├── postcss.config.js
└── README.md
```
