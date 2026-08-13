# 01 — Overview & Vision

## 1.1 What you're building

A standalone, local-first IDE that looks and feels like Cursor or VS Code — file explorer on the left, Monaco editor with tabs, integrated terminal at the bottom, and an **agent sidebar** (collapsible, VS Code-style) powered by OpenCode baked into the app.

The agent assists the developer, it doesn't take over. Real developers need to see code, navigate files, run terminals, and use git — the agent is a powerful tool in the sidebar, not the entire experience.

## 1.2 Architecture philosophy

- **Rust backend** (Tauri) for all OS-level work: filesystem, PTY, process management, OpenCode sidecar lifecycle. Safe, fast, no Node.js sandbox.
- **Monaco Editor** for the editor widget — same engine as VS Code, consumed as an npm package, zero fork tax.
- **OpenCode as a bundled sidecar** — the binary ships inside the app. Rust spawns it on launch, restarts it on crash, stops it on quit. The frontend talks to it via `@opencode-ai/sdk` over localhost HTTP/SSE. The user never knows it exists.
- **React + TypeScript + Vite** for the UI — fast, typed, modern.

## 1.3 Reference points

| Product | Base | Agent | UX model |
|---|---|---|---|
| **Cursor** | Fork of VS Code | Own models + BYO keys | IDE-first with agent sidebar |
| **VS Code + Copilot** | VS Code | GitHub Copilot | IDE-first with chat sidebar |
| **Ethco IDE** | Monaco + Tauri | OpenCode (sidecar) | IDE-first with collapsible agent sidebar |

## 1.4 Design principles

1. **IDE-first.** The editor, file tree, and terminal are the primary surfaces. The agent is a collapsible sidebar panel.
2. **Every agent action is reviewable.** Diffs staged in Monaco's diff editor, never silent writes.
3. **Model-agnostic.** OpenCode supports 75+ models — never lock users into one provider.
4. **Rust for systems, TypeScript for UI.** The boundary is Tauri IPC. Clear, typed, safe.
5. **OpenCode is a sidecar, not a service.** Bundled binary, auto-managed by Rust. Zero user configuration.

## 1.5 Non-goals (v1)

- Cloud features or accounts
- VS Code extension compatibility
- Training or fine-tuning models
- Browser automation / computer-use
- Windows-first support (macOS/Linux first)
