# 05 — OpenCode Integration (Sidecar)

## 5.1 How the sidecar works

OpenCode is bundled as a platform-specific binary inside the Tauri app. The Rust backend spawns it on launch as a child process. The frontend talks to it via `@opencode-ai/sdk` over localhost HTTP/SSE.

**User experience:** install Ethco IDE → open it → start typing to the agent. Zero setup, zero configuration, zero awareness that there's a "server."

## 5.2 Build-time: bundling the binary

During build, the OpenCode CLI binary is downloaded for the target platform and placed in:

```
src-tauri/binaries/
  opencode-x86_64-pc-windows-msvc.exe
  opencode-x86_64-unknown-linux-gnu
  opencode-aarch64-apple-darwin
  opencode-x86_64-apple-darwin
```

Tauri's `sidecar` plugin resolves the correct binary at runtime based on the platform triple.

## 5.3 Runtime: lifecycle management

```rust
// Pseudo-code for sidecar manager
struct OpenCodeManager {
    port: u16,
}

impl OpenCodeManager {
    /// Called on app startup in a background tokio task
    async fn start(&self) -> Result<()> {
        let binary = app.shell().sidecar("opencode")
            .expect("sidecar binary missing");
        let (rx, child) = binary
            .args(["--port", &self.port.to_string()])
            .spawn()?;

        // Monitor health
        loop {
            tokio::time::sleep(Duration::from_secs(5)).await;
            match health_check(self.port).await {
                Ok(true) => continue,
                _ => {
                    child.kill()?;
                    // restart with exponential backoff
                    self.start()?;
                }
            }
        }
    }

    async fn stop(&self) {
        // Graceful shutdown on app quit
        child.kill()?;
    }
}
```

## 5.4 SDK usage in the frontend

```ts
import { createOpencodeClient } from "@opencode-ai/sdk"

// The sidecar is always on 127.0.0.1:4096
const client = createOpencodeClient({ baseUrl: "http://127.0.0.1:4096" })

// Create session and chat
const session = await client.session.create({ agent: "build" })

for await (const event of client.session.chat({ sessionId: session.id, parts })) {
  // handle events...
}
```

## 5.5 Agents exposed

| Agent | Mode | Behavior |
|---|---|---|
| `build` | Default | Full tool access (edit, bash, etc.) |
| `plan` | Planning | Read-only, denies edits, asks before bash |
| `ask` | Q&A | General questions, no tool access |

Custom agents can be defined via `opencode.json` and shipped with the app.

## 5.6 Default `opencode.json` (bundled)

```json
{
  "permissions": {
    "edit": "ask",
    "bash": "ask",
    "bash_rm *": "deny",
    "bash_git push*": "deny"
  },
  "agents": {
    "build": { "model": "anthropic/claude-sonnet-5" },
    "plan":  { "model": "anthropic/claude-sonnet-5" }
  }
}
```

## 5.7 What NOT to reimplement

| Feature | OpenCode handles it | Your job |
|---|---|---|
| Tool execution (bash, edit, fetch) | ✅ | Surface results in UI |
| Model provider routing / auth | ✅ | Model picker dropdown |
| Permission engine | ✅ | Permission dialog UI |
| LSP diagnostics loop | ✅ | Show diagnostics in gutter |
| MCP server integration | ✅ | Future: settings UI |
| Session persistence | ✅ | Show session history |

Your job is the **editor UI, diff review, and agent panel** — not agent logic.
