import { useSettingsStore } from "../../stores/settingsStore"

interface SettingsModalProps {
  open: boolean
  onClose: () => void
}

export function SettingsModal({ open, onClose }: SettingsModalProps) {
  const settings = useSettingsStore()

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-fade-in" onClick={onClose}>
      <div
        className="w-[540px] max-w-[92vw] bg-surface-alt border border-[var(--border)] rounded-xl shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-5 py-3 border-b border-[var(--border)]">
          <h2 className="text-sm font-semibold text-[var(--text)]">Settings</h2>
          <button onClick={onClose} className="w-6 h-6 flex items-center justify-center rounded-md text-text-muted hover:text-[var(--text)] hover:bg-white/10 transition-colors text-xs">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        </div>

        <div className="px-5 py-4 space-y-5 max-h-[60vh] overflow-y-auto">
          <Section label="Theme">
            <select
              value={settings.theme}
              onChange={(e) => settings.setTheme(e.target.value as "dark" | "light")}
              className="w-full bg-surface border border-[var(--border)] rounded-lg px-3 py-1.5 text-xs text-[var(--text)] outline-none focus:border-accent transition-colors"
            >
              <option value="dark">Dark (Catppuccin Mocha)</option>
              <option value="light">Light</option>
            </select>
          </Section>

          <Section label="Editor">
            <div className="space-y-2.5">
              <Row label="Font Size">
                <input
                  type="number"
                  min={10}
                  max={24}
                  value={settings.fontSize}
                  onChange={(e) => settings.setFontSize(Number(e.target.value))}
                  className="w-16 bg-surface border border-[var(--border)] rounded-lg px-2 py-1.5 text-xs text-[var(--text)] outline-none focus:border-accent text-center transition-colors"
                />
              </Row>
              <Row label="Tab Size">
                <input
                  type="number"
                  min={1}
                  max={8}
                  value={settings.tabSize}
                  onChange={(e) => settings.setTabSize(Number(e.target.value))}
                  className="w-16 bg-surface border border-[var(--border)] rounded-lg px-2 py-1.5 text-xs text-[var(--text)] outline-none focus:border-accent text-center transition-colors"
                />
              </Row>
              <Row label="Font Family">
                <input
                  type="text"
                  value={settings.fontFamily}
                  onChange={(e) => settings.setFontFamily(e.target.value)}
                  className="flex-1 bg-surface border border-[var(--border)] rounded-lg px-3 py-1.5 text-xs text-[var(--text)] outline-none focus:border-accent font-mono transition-colors"
                />
              </Row>
            </div>
          </Section>

          <Section label="Agent">
            <div className="space-y-2.5">
              <Row label="API URL">
                <input
                  type="text"
                  value={settings.agentBaseUrl}
                  onChange={(e) => settings.setAgentBaseUrl(e.target.value)}
                  placeholder="https://api.opencode.ai/v1"
                  className="flex-1 bg-surface border border-[var(--border)] rounded-lg px-3 py-1.5 text-xs text-[var(--text)] outline-none focus:border-accent font-mono transition-colors"
                />
              </Row>
              <Row label="API Key">
                <input
                  type="password"
                  value={settings.agentApiKey}
                  onChange={(e) => settings.setAgentApiKey(e.target.value)}
                  placeholder="sk-..."
                  className="flex-1 bg-surface border border-[var(--border)] rounded-lg px-3 py-1.5 text-xs text-[var(--text)] outline-none focus:border-accent font-mono transition-colors"
                />
              </Row>
              <p className="text-[10px] text-text-muted mt-1 leading-relaxed">
                Configure your OpenCode cloud API endpoint and key. Changes apply on next agent session.
              </p>
            </div>
          </Section>

          <Section label="Terminal">
            <div className="space-y-2.5">
              <Row label="Shell Path">
                <input
                  type="text"
                  value={settings.terminalShell}
                  onChange={(e) => settings.setTerminalShell(e.target.value)}
                  placeholder="auto-detect"
                  className="flex-1 bg-surface border border-[var(--border)] rounded-lg px-3 py-1.5 text-xs text-[var(--text)] outline-none focus:border-accent font-mono transition-colors"
                />
              </Row>
              <Row label="Scrollback">
                <input
                  type="number"
                  min={100}
                  max={50000}
                  step={100}
                  value={settings.terminalScrollback}
                  onChange={(e) => settings.setTerminalScrollback(Number(e.target.value))}
                  className="w-20 bg-surface border border-[var(--border)] rounded-lg px-2 py-1.5 text-xs text-[var(--text)] outline-none focus:border-accent text-center transition-colors"
                />
              </Row>
              <Row label="Cursor Style">
                <select
                  value={settings.terminalCursorStyle}
                  onChange={(e) => settings.setTerminalCursorStyle(e.target.value as "bar" | "block" | "underline")}
                  className="bg-surface border border-[var(--border)] rounded-lg px-3 py-1.5 text-xs text-[var(--text)] outline-none focus:border-accent transition-colors"
                >
                  <option value="bar">Bar</option>
                  <option value="block">Block</option>
                  <option value="underline">Underline</option>
                </select>
              </Row>
            </div>
          </Section>

          <Section label="Keyboard Shortcuts">
            <div className="text-xs text-text-muted space-y-0.5">
              <Shortcut keys="Ctrl+S" desc="Save file" />
              <Shortcut keys="Ctrl+P" desc="Quick file search" />
              <Shortcut keys="Ctrl+B" desc="Toggle agent sidebar" />
              <Shortcut keys="Ctrl+`" desc="Toggle terminal" />
              <Shortcut keys="Ctrl+Shift+E" desc="Show Explorer" />
              <Shortcut keys="Ctrl+Shift+F" desc="Search in files" />
              <Shortcut keys="Ctrl+Shift+G" desc="Source control" />
              <Shortcut keys="Ctrl+Shift+I" desc="New agent session" />
              <Shortcut keys="Ctrl+Shift+T" desc="Toggle theme" />
              <Shortcut keys="Ctrl+W" desc="Close tab" />
            </div>
          </Section>
        </div>

        <div className="px-5 py-3 border-t border-[var(--border)] flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-1.5 text-xs font-medium bg-accent text-white rounded-lg hover:bg-accent-dark transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  )
}

function Section({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <h3 className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-2.5">{label}</h3>
      {children}
    </div>
  )
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <span className="text-xs text-[var(--text)]">{label}</span>
      <div className="flex items-center gap-2">{children}</div>
    </div>
  )
}

function Shortcut({ keys, desc }: { keys: string; desc: string }) {
  return (
    <div className="flex items-center justify-between py-0.5">
      <span>{desc}</span>
      <kbd className="px-1.5 py-0.5 rounded bg-white/5 text-text-muted font-mono text-[10px] border border-[var(--border)]">
        {keys}
      </kbd>
    </div>
  )
}
