# 06 — Development Phases

## Phase 0 — Scaffold (3-5 days)
- [ ] `pnpm create tauri-app` with React + TypeScript + Vite
- [ ] Wire up Monaco Editor (`@monaco-editor/react`)
- [ ] Basic file tree in React (dummy data)
- [ ] Tauri IPC: `read_file`, `write_file`, `list_directory` in Rust
- [ ] xterm.js in a bottom panel, connected to a Rust PTY

**Exit criteria:** Tauri app runs, shows Monaco with a file, file tree reads real directory, terminal types.

## Phase 1 — Core IDE (2-3 weeks)
- [ ] File explorer: tree view, create/rename/delete files, context menu
- [ ] Editor tabs: open, close, reorder, unsaved indicator
- [ ] Monaco configuration: themes, keybindings, IntelliSense basics
- [ ] Terminal: multi-tab, resize, copy/paste, shell integration
- [ ] Project watcher (Rust `notify` crate): auto-refresh file tree on file system changes
- [ ] Status bar: cursor position, language, line count

**Exit criteria:** daily-drivable IDE for editing code without an agent.

## Phase 2 — Agent integration (2-3 weeks)
- [ ] Bundle OpenCode binary as Tauri sidecar
- [ ] Rust sidecar manager: spawn, health-check, restart, kill
- [ ] Collapsible agent sidebar with chat UI
- [ ] Stream text responses from OpenCode via `@opencode-ai/sdk`
- [ ] Model picker, mode toggle (`build`/`plan`)
- [ ] Status bar agent state indicator

**Exit criteria:** you can talk to the agent in the sidebar and it responds.

## Phase 3 — Review workflow (2-3 weeks)
- [ ] Intercept file-edit tool calls, route to Monaco diff editor
- [ ] Accept/Reject buttons per file and per hunk
- [ ] Permission dialogs for bash/file operations
- [ ] Plan-then-execute flow

**Exit criteria:** agent never silently writes a file. You can daily-drive Ethco.

## Phase 4 — Polish (2-3 weeks)
- [ ] Git integration: branch display, status, diff in file explorer
- [ ] File search across project (Rust-side ripgrep)
- [ ] Multiple agent sessions (tabbed in sidebar)
- [ ] Keyboard shortcuts reference
- [ ] Settings UI (default model, theme, autonomy level)

## Phase 5 — Distribution (ongoing)
- [ ] CI build matrix (macOS arm64/x64, Linux x64, Windows x64)
- [ ] Auto-updater
- [ ] Code signing
- [ ] Landing page + docs
- [ ] Telemetry (opt-in)
