# 03 — Design / UX

## 3.1 Layout

```
┌──────┬─────────────────────────────┬─────────────────┐
│      │                             │                 │
│ File │   Monaco Editor (tabs)     │  Agent Sidebar  │
│ Tree │                             │  (collapsible)  │
│      │   - open files as tabs     │                 │
│      │   - inline diff gutters    │  [Messages]     │
│      │   - syntax highlighting    │                 │
│      │   - IntelliSense           │  [Input]        │
│      │                             │                 │
│      │                             │  [Model picker] │
├──────┴─────────────────────────────┤                 │
│  Terminal (xterm.js + Rust PTY)    │  [Collapse ▲]  │
│  Status Bar: [branch] [agent: idle]│                 │
└────────────────────────────────────┴─────────────────┘
```

## 3.2 Surfaces

### Editor View (primary)
- **Monaco Editor** with tabs — multi-file editing, split views
- **File explorer** — tree view, right-click context menu (new file, rename, delete, reveal in terminal)
- **Inline diff** — when agent proposes a change, Monaco's diff editor opens inline with Accept/Reject
- **Terminal** — bottom panel, multiple tabs, full xterm.js feature set
- **Status bar** — git branch, agent state (`idle`/`thinking`/`error`), line/column, language

### Agent Sidebar (collapsible, VS Code-style)
- **Toggle** — `Cmd+I` / click icon in activity bar or title bar
- **Message list** — streaming text, code blocks with syntax highlighting, file links
- **Input box** — multi-line prompt, `Enter` to send, `Shift+Enter` for newline
- **Model picker** — dropdown showing available models from OpenCode
- **Mode toggle** — `build` / `plan` / `ask` (maps to OpenCode agents)
- **Diff review** — inline in the editor, not in a webview inside the sidebar

## 3.3 Interaction model

Three primitives, consistent across all surfaces:

1. **Chat turn** — free-form instruction → agent responds with text + optional tool calls
2. **Plan artifact** — agent produces a plan before executing. User approves, edits, or rejects.
3. **Diff review** — every file change staged in Monaco diff editor. Accept per-hunk or per-file.

## 3.4 Autonomy levels

| Level | Behavior | Best for |
|---|---|---|
| **Manual** | Agent proposes every tool call; user approves each one | Risky operations |
| **Checkpoint** | Agent runs between checkpoints, pauses for review | Default |
| **Full auto** | Agent runs unattended, reports back with summary | Boilerplate, scaffolding |

## 3.5 Visual identity

- Clean, modern — not a VS Code reskin
- Distinct accent color for AI-generated/pending-review content
- Monaco themes work out of the box — ship curated light + dark themes
- Compact default layout, panels collapse to nothing
