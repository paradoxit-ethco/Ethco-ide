# Ethco IDE — Modern Agentic IDE

A standalone, local-first IDE built on **Monaco Editor** with **OpenCode** as a bundled agent sidecar. Rust backend for speed and safety, React + TypeScript frontend, beautiful editor-first UX.

| # | File | What it covers |
|---|------|-----------------|
| 1 | `01-overview-vision.md` | Vision, design principles, comparison |
| 2 | `02-architecture.md` | System architecture — Tauri shell, Rust backend, sidecar agent |
| 3 | `03-design-ux.md` | IDE-first layout with collapsible agent sidebar |
| 4 | `04-technical-specification.md` | Stack, APIs, data models |
| 5 | `05-opencode-integration.md` | Bundling OpenCode as a sidecar binary |
| 6 | `06-development-phases.md` | Phased roadmap |
| 7 | `07-project-structure.md` | Repo layout |
| 8 | `08-build-deployment.md` | Building, signing, distribution |
| 9 | `09-risks-considerations.md` | Risks, security, maintenance |

## Core philosophy

- **IDE-first** — the editor, file tree, and terminal dominate. The agent is a collapsible sidebar, not the main surface.
- **Rust backend** — filesystem, PTY, process lifecycle all in safe Rust via Tauri.
- **OpenCode as sidecar** — bundled binary auto-spawned by Rust on launch. User never installs or configures it.
- **Standalone** — everything local, no cloud dependency, no separate server process the user manages.
