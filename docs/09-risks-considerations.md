# 09 — Risks & Considerations

## 9.1 Licensing

| Component | License | Notes |
|---|---|---|
| Monaco Editor | MIT | ✅ |
| Tauri | Apache 2.0 / MIT | ✅ |
| OpenCode | MIT | ✅ Bundled as binary, no source modification |
| React, Vite, Tailwind | MIT | ✅ |
| xterm.js | MIT | ✅ |
| portable-pty | MIT | ✅ |

Everything is permissively licensed. No proprietary code, no trademark concerns, no marketplace restrictions.

## 9.2 Security

- **Default permissions**: ship with `"edit": "ask"` and `"bash": "ask"` — never `allow` by default.
- **Sidecar isolation**: OpenCode runs as a separate process with minimal OS privileges. Crashes don't affect the IDE.
- **Tauri IPC allowlist**: only specific commands are exposed to the webview. No `eval`, no arbitrary shell access from renderer.
- **Diff review is mandatory**: even at "full auto" autonomy, destructive operations (rm, force-push) require user approval.

## 9.3 Cost management

- Surfacing token usage per session avoids bill shock with parallel agents
- Default plan model can be cheaper (e.g., Claude Haiku) while build model uses Sonnet

## 9.4 Maintenance

- **Zero upstream fork tax** — Monaco is an npm dependency, OpenCode is a downloaded binary. Updates are version bumps.
- **Monaco version bumps** are usually backward-compatible.
- **OpenCode binary updates**: bump version in build script, test, release.

## 9.5 What you build vs inherit

Unlike VS Code, you build:

| Feature | VS Code | Ethco |
|---|---|---|
| File explorer | Inherited | React tree component |
| Terminal | Inherited | xterm.js + Rust PTY |
| Settings UI | Inherited | React forms |
| Search across files | Inherited | Rust ripgrep |
| Git UI | Inherited | Rust git2 + React |
| Extension marketplace | Inherited | Skip for v1 |
| Debugger | Inherited | Skip for v1 |

**Scope discipline**: ship a lean IDE that does the core loop (edit + agent + terminal) exceptionally well. Don't try to rebuild all of VS Code.

## 9.6 UX pitfalls

- Context window limits on large codebases — design context-selection UI
- No permission prompt before commands — default to `ask`
- Git branching awareness — auto-create branch per session as differentiator
