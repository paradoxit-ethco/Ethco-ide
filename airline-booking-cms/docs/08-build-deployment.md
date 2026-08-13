# 08 — Build & Deployment

## 8.1 Prerequisites

```bash
# Rust toolchain
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh

# Node.js 20+
# pnpm
npm install -g pnpm

# Tauri CLI
cargo install tauri-cli

# Install dependencies
pnpm install
```

## 8.2 Development

```bash
# Start Vite dev server + Tauri dev mode (hot reload)
pnpm tauri dev
```

## 8.3 Building for distribution

```bash
# Production build (platform-specific)
pnpm tauri build

# Output:
#   src-tauri/target/release/bundle/
#     dmg/  (macOS)
#     deb/  (Linux)
#     msi/  (Windows)
```

## 8.4 Bundling OpenCode sidecar

The `src-tauri/build.rs` script downloads the correct OpenCode binary for the target platform and places it in `src-tauri/binaries/`.

Tauri's `sidecar` plugin requires the binary to be named with the platform triplet:
```
opencode-x86_64-pc-windows-msvc.exe
opencode-x86_64-unknown-linux-gnu
opencode-aarch64-apple-darwin
opencode-x86_64-apple-darwin
```

## 8.5 Code signing

- **macOS**: Apple Developer ID for notarization (required for smooth Gatekeeper)
- **Windows**: Code-signing certificate (required for SmartScreen)
- **Linux**: AppImage signing optional

## 8.6 CI

```yaml
# .github/workflows/build.yml
strategy:
  matrix:
    os: [macos-latest, ubuntu-latest, windows-latest]
steps:
  - uses: actions/checkout@v4
  - uses: actions-rust-lang/setup-rust-toolchain@v1
  - run: pnpm install && pnpm tauri build
  - upload: src-tauri/target/release/bundle/
```

## 8.7 Auto-update

Use `@tauri-apps/plugin-updater` with:
- GitHub Releases (free, simple)
- Your own update server (for private distribution)

Point `tauri.conf.json` > `plugins.updater.endpoints` to your update manifest URL.
