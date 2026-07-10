import { useState, useEffect } from "react"
import { useConnectionStore } from "../../stores/connectionStore"

interface ConnectionModalProps {
  open: boolean
  onClose: () => void
}

export function ConnectionModal({ open, onClose }: ConnectionModalProps) {
  const config = useConnectionStore((s) => s.config)
  const setConfig = useConnectionStore((s) => s.setConfig)
  const doConnect = useConnectionStore((s) => s.connect)
  const connecting = useConnectionStore((s) => s.connecting)
  const error = useConnectionStore((s) => s.error)
  const [local, setLocal] = useState(config)
  const [fetchedModels, setFetchedModels] = useState<string[]>([])

  // Fetch available models when baseUrl changes
  useEffect(() => {
    if (!open || !local.baseUrl) return
    const timer = setTimeout(async () => {
      try {
        const headers: Record<string, string> = { "Content-Type": "application/json" }
        if (local.apiKey) headers["Authorization"] = `Bearer ${local.apiKey}`
        const res = await fetch(`${local.baseUrl}/models`, { headers, signal: AbortSignal.timeout(5000) })
        if (res.ok) {
          const data = await res.json()
          const models = (data.data || []).map((m: any) => m.id || m.name || String(m))
          setFetchedModels(models)
        }
      } catch { /* ignore */ }
    }, 1000)
    return () => clearTimeout(timer)
  }, [local.baseUrl, local.apiKey, open])

  if (!open) return null

  async function handleSave() {
    setConfig(local)
    const ok = await doConnect()
    if (ok) onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-fade-in" onClick={onClose}>
      <div
        className="w-[460px] max-w-[92vw] bg-surface-alt border border-[var(--border)] rounded-xl shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="px-5 py-4 border-b border-[var(--border)]">
          <div className="flex items-center justify-between mb-1">
            <h2 className="text-sm font-semibold text-[var(--text)]">Language Model (LLM)</h2>
            <button onClick={onClose} className="w-6 h-6 flex items-center justify-center rounded-md text-text-muted hover:text-[var(--text)] hover:bg-white/10 transition-colors">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            </button>
          </div>
          <a href="#" className="text-[10px] text-accent-light hover:underline">Back to LLM profiles list</a>
        </div>

        <div className="px-5 py-4 space-y-4">
          <div className="flex items-center gap-4 border-b border-[var(--border)] pb-3">
            <button className="text-xs font-medium text-accent-light border-b-2 border-accent-light pb-3 -mb-3">
              Basic
            </button>
            <button className="text-xs text-text-muted hover:text-[var(--text)] pb-3 -mb-3">
              Advanced
            </button>
          </div>

          <p className="text-[10px] text-text-muted leading-relaxed">
            These organization defaults are applied first. Members can apply personal overrides where allowed.
          </p>

          <Field label="Name (Optional)">
            <input
              type="text"
              value={local.name}
              onChange={(e) => setLocal({ ...local, name: e.target.value })}
              placeholder="opencode"
              className="w-full bg-surface border border-[var(--border)] rounded-lg px-3 py-1.5 text-xs text-[var(--text)] outline-none focus:border-accent transition-colors font-mono"
            />
            <p className="text-[9px] text-text-muted mt-1">Name must be 1-64 characters: letters, digits, dot, dash, or underscore.</p>
          </Field>

          <Field label="Custom Model">
            <input
              type="text"
              value={local.model}
              onChange={(e) => setLocal({ ...local, model: e.target.value })}
              placeholder="big-pickle"
              className="w-full bg-surface border border-[var(--border)] rounded-lg px-3 py-1.5 text-xs text-[var(--text)] outline-none focus:border-accent transition-colors font-mono"
            />
            {fetchedModels.length > 0 && (
              <div className="mt-1.5 flex flex-wrap gap-1">
                {fetchedModels.map((m) => (
                  <button
                    key={m}
                    onClick={() => setLocal({ ...local, model: m })}
                    className={`text-[10px] px-1.5 py-0.5 rounded border transition-colors ${
                      local.model === m
                        ? "border-accent bg-accent/20 text-accent-light"
                        : "border-[var(--border)] text-text-muted hover:text-[var(--text)] hover:border-accent/50"
                    }`}
                  >
                    {m}
                  </button>
                ))}
              </div>
            )}
          </Field>

          <Field label="Base URL">
            <input
              type="text"
              value={local.baseUrl}
              onChange={(e) => setLocal({ ...local, baseUrl: e.target.value })}
              placeholder="https://opencode.ai/zen/v1"
              className="w-full bg-surface border border-[var(--border)] rounded-lg px-3 py-1.5 text-xs text-[var(--text)] outline-none focus:border-accent transition-colors font-mono"
            />
          </Field>

          <Field label="API Key">
            <input
              type="password"
              value={local.apiKey}
              onChange={(e) => setLocal({ ...local, apiKey: e.target.value })}
              placeholder="sk-..."
              className="w-full bg-surface border border-[var(--border)] rounded-lg px-3 py-1.5 text-xs text-[var(--text)] outline-none focus:border-accent transition-colors font-mono"
            />
            <p className="text-[9px] text-text-muted mt-1">
              Don't know your API key?{" "}
              <a href="#" className="text-accent-light hover:underline">Click here for instructions</a>
            </p>
          </Field>

          {error && (
            <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-red-900/20 border border-error/30 text-error text-xs animate-fade-in">
              <svg className="w-3.5 h-3.5 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>
              <span>{error}</span>
            </div>
          )}
        </div>

        <div className="px-5 py-3 border-t border-[var(--border)] flex justify-end gap-2">
          <button
            onClick={onClose}
            className="px-4 py-1.5 text-xs text-text-muted hover:text-[var(--text)] hover:bg-white/5 rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={connecting}
            className="px-5 py-1.5 text-xs font-medium bg-accent text-white rounded-lg hover:bg-accent-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1.5"
          >
            {connecting && (
              <div className="w-3 h-3 rounded-full border-2 border-white/30 border-t-white animate-spin" />
            )}
            Save Changes
          </button>
        </div>
      </div>
    </div>
  )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-xs font-medium text-[var(--text)] mb-1.5">{label}</label>
      {children}
    </div>
  )
}
