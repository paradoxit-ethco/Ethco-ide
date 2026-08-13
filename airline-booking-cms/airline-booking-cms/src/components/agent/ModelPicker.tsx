import { useState } from "react"
import { useConnectionStore } from "../../stores/connectionStore"

export function ModelPicker() {
  const config = useConnectionStore((s) => s.config)
  const setConfig = useConnectionStore((s) => s.setConfig)
  const availableModels = useConnectionStore((s) => s.availableModels)
  const connected = useConnectionStore((s) => s.connected)
  const [open, setOpen] = useState(false)

  if (!config.model) return null

  const models = availableModels.length > 0 ? availableModels : [config.model]

  function handleSelect(model: string) {
    setConfig({ model })
    setOpen(false)
  }

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1.5 px-2 py-1 bg-surface border border-[var(--border)] rounded text-[11px] text-text-muted hover:text-[var(--text)] hover:border-accent/50 transition-colors cursor-pointer"
      >
        {connected && <span className="w-1.5 h-1.5 rounded-full bg-[var(--success)]" />}
        <span className="truncate max-w-[120px]">{config.model}</span>
        <svg className={`w-2.5 h-2.5 transition-transform ${open ? "rotate-180" : ""}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="6 9 12 15 18 9"/></svg>
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div className="absolute bottom-full mb-1 left-0 right-0 bg-surface-alt border border-[var(--border)] rounded-lg shadow-xl py-1 z-20 max-h-[200px] overflow-y-auto">
            {models.length === 0 && (
              <div className="px-3 py-2 text-[10px] text-text-muted">No models available</div>
            )}
            {models.map((m) => (
              <button
                key={m}
                onClick={() => handleSelect(m)}
                className={`w-full text-left px-3 py-1.5 text-[11px] hover:bg-accent/15 transition-colors flex items-center gap-2 ${
                  m === config.model ? "text-accent-light" : "text-[var(--text)]"
                }`}
              >
                {m === config.model && (
                  <svg className="w-2.5 h-2.5 shrink-0" viewBox="0 0 24 24" fill="currentColor"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/></svg>
                )}
                <span className={m === config.model ? "" : "ml-4"}>{m}</span>
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  )
}
