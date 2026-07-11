import { useState, useEffect } from "react"
import { useConnectionStore } from "../../stores/connectionStore"

interface ConnectionModalProps {
  open: boolean
  onClose: () => void
}

type ProviderType = "google" | "openai" | "anthropic" | "ollama" | "custom"

interface ProviderPreset {
  name: string
  label: string
  desc: string
  defaultUrl: string
  defaultModel: string
  icon: string
}

const PRESETS: Record<ProviderType, ProviderPreset> = {
  google: {
    name: "google",
    label: "Google Gemini",
    desc: "Free-tier Gemini models via Google AI Studio. Secure key scraper built-in.",
    defaultUrl: "https://generativelanguage.googleapis.com/v1beta/openai",
    defaultModel: "gemini-2.5-flash",
    icon: "✦",
  },
  openai: {
    name: "openai",
    label: "OpenAI GPT",
    desc: "Direct integration with public OpenAI API keys and models.",
    defaultUrl: "https://api.openai.com/v1",
    defaultModel: "gpt-4o",
    icon: "🤖",
  },
  anthropic: {
    name: "anthropic",
    label: "OpenRouter (Anthropic)",
    desc: "Connect to Claude 3.5 Sonnet and other elite models via OpenRouter gateway.",
    defaultUrl: "https://openrouter.ai/api/v1",
    defaultModel: "anthropic/claude-3.5-sonnet",
    icon: "♣",
  },
  ollama: {
    name: "ollama",
    label: "Ollama Local",
    desc: "Offline-native, privacy-first models running locally on your computer.",
    defaultUrl: "http://localhost:11434/v1",
    defaultModel: "llama3",
    icon: "🐳",
  },
  custom: {
    name: "custom",
    label: "Custom Gateway",
    desc: "Connect to any custom OpenAI-compliant network API.",
    defaultUrl: "",
    defaultModel: "",
    icon: "🌐",
  },
}

export function ConnectionModal({ open, onClose }: ConnectionModalProps) {
  const config = useConnectionStore((s) => s.config)
  const setConfig = useConnectionStore((s) => s.setConfig)
  const doConnect = useConnectionStore((s) => s.connect)
  const connecting = useConnectionStore((s) => s.connecting)
  const error = useConnectionStore((s) => s.error)

  const [view, setView] = useState<"list" | "form">("list")
  const [provider, setProvider] = useState<ProviderType>("google")
  const [local, setLocal] = useState(config)
  const [fetchedModels, setFetchedModels] = useState<string[]>([])
  const [scraping, setScraping] = useState(false)

  // Detect provider on mount/open
  useEffect(() => {
    if (!open) return
    setLocal(config)

    const url = config.baseUrl || ""
    if (url.includes("generativelanguage.googleapis.com")) {
      setProvider("google")
    } else if (url.includes("api.openai.com")) {
      setProvider("openai")
    } else if (url.includes("openrouter.ai") || url.includes("anthropic.com")) {
      setProvider("anthropic")
    } else if (url.includes("localhost") || url.includes("127.0.0.1") || url.includes("11434")) {
      setProvider("ollama")
    } else {
      setProvider("custom")
    }
    setView("list")
  }, [open, config])

  // Fetch available models
  useEffect(() => {
    if (!open || !local.baseUrl || view !== "form") return
    const timer = setTimeout(async () => {
      try {
        const headers: Record<string, string> = { "Content-Type": "application/json" }
        if (local.apiKey) headers["Authorization"] = `Bearer ${local.apiKey}`
        const res = await fetch(`${local.baseUrl}/models`, { headers, signal: AbortSignal.timeout(4000) })
        if (res.ok) {
          const data = await res.json()
          const models = (data.data || []).map((m: any) => m.id || m.name || String(m))
          setFetchedModels(models)
        }
      } catch { /* ignore */ }
    }, 1000)

    return () => clearTimeout(timer)
  }, [open, local.baseUrl, local.apiKey, view])

  const handleSelectPreset = (key: ProviderType) => {
    const preset = PRESETS[key]
    setProvider(key)
    setLocal({
      name: preset.name,
      baseUrl: preset.defaultUrl,
      model: preset.defaultModel,
      apiKey: "",
    })
    setFetchedModels([])
    setView("form")
  }

  const handleScrapeGoogle = async () => {
    const api = (window as any).electronAPI
    if (!api?.scrapeGoogleKey) {
      alert("Scraper is only available in the Ethco IDE desktop app packaging.")
      return
    }

    setScraping(true)
    try {
      const key = await api.scrapeGoogleKey()
      if (key) {
        setLocal((prev) => ({ ...prev, apiKey: key }))
      } else {
        alert("Failed to capture API key. Please make sure that you are signed in and have generated a key in AI Studio.")
      }
    } catch (err: any) {
      alert(`Scraping Error: ${err.message || err}`)
    } finally {
      setScraping(false)
    }
  }

  const handleSave = async () => {
    // Save to configuration store
    setConfig(local)
    const success = await doConnect()
    if (success) {
      onClose()
    }
  }

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-[2px]">
      <div className="bg-[var(--surface-alt)] border border-[var(--border)] rounded-lg shadow-2xl w-[480px] max-w-[90vw] animate-fade-in flex flex-col text-[var(--text)] overflow-hidden">
        {/* Header */}
        <div className="px-5 py-3 border-b border-[var(--border)] flex justify-between items-center select-none bg-surface/30">
          <div className="flex items-center gap-2">
            {view === "form" && (
              <button
                onClick={() => setView("list")}
                className="p-1 rounded text-text-muted hover:text-[var(--text)] hover:bg-white/5 transition-colors mr-1"
                title="Back to LLM providers"
              >
                <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg>
              </button>
            )}
            <h3 className="text-xs font-semibold text-[var(--text)]">Configure LLM Provider</h3>
          </div>
          <button
            onClick={onClose}
            className="text-text-muted hover:text-[var(--text)] hover:bg-white/5 rounded px-1.5 py-0.5 text-xs transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Content */}
        {view === "list" ? (
          <div className="px-5 py-4 space-y-3 max-h-[65vh] overflow-y-auto">
            <p className="text-[11px] text-text-muted mb-2 leading-relaxed">
              Select your AI assistant deployment endpoint. Connect to cloud clusters, local models, or custom search nodes.
            </p>
            <div className="grid gap-2.5">
              {(Object.keys(PRESETS) as ProviderType[]).map((key) => {
                const p = PRESETS[key]
                return (
                  <button
                    key={key}
                    onClick={() => handleSelectPreset(key)}
                    className="w-full text-left p-3 rounded-lg border border-[var(--border)] bg-surface hover:border-accent hover:bg-accent/5 transition-all flex items-start gap-3 group"
                  >
                    <span className="text-xl p-1 bg-white/5 rounded border border-[var(--border)] group-hover:border-accent/30">{p.icon}</span>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-xs font-semibold text-[var(--text)] flex items-center gap-1.5">
                        {p.label}
                        {key === "google" && (
                          <span className="text-[8px] bg-green-500/20 text-green-400 px-1 py-0.5 rounded font-normal uppercase tracking-wider">Free Tier</span>
                        )}
                      </h4>
                      <p className="text-[10px] text-text-muted mt-0.5 leading-normal">{p.desc}</p>
                    </div>
                  </button>
                )
              })}
            </div>
          </div>
        ) : (
          <div className="px-5 py-4 space-y-4 max-h-[65vh] overflow-y-auto">
            {/* Provider badge */}
            <div className="flex items-center gap-2 pb-3 border-b border-[var(--border)]">
              <span className="text-xl p-1 bg-white/5 rounded border border-[var(--border)]">{PRESETS[provider].icon}</span>
              <div>
                <h3 className="text-xs font-bold text-[var(--text)]">{PRESETS[provider].label} Configuration</h3>
                <p className="text-[9px] text-text-muted">Currently editing this provider endpoint</p>
              </div>
            </div>

            {/* Google-specific: Import from AI Studio button */}
            {provider === "google" && (
              <button
                onClick={handleScrapeGoogle}
                disabled={scraping}
                className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg border-2 border-dashed border-blue-500/40 bg-blue-500/5 hover:bg-blue-500/10 hover:border-blue-500/60 transition-all text-xs font-medium text-blue-400 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {scraping ? (
                  <>
                    <div className="w-3.5 h-3.5 rounded-full border-2 border-blue-400/30 border-t-blue-400 animate-spin" />
                    Waiting for AI Studio authentication…
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"/><polyline points="10 17 15 12 10 7"/><line x1="15" y1="12" x2="3" y2="12"/></svg>
                    Import Key from Google AI Studio
                  </>
                )}
              </button>
            )}

            {/* Profile name (custom only) */}
            {provider === "custom" && (
              <Field label="Profile Name">
                <input
                  type="text"
                  value={local.name}
                  onChange={(e) => setLocal({ ...local, name: e.target.value })}
                  placeholder="custom-link"
                  className="w-full bg-surface border border-[var(--border)] rounded-lg px-3 py-1.5 text-xs text-[var(--text)] outline-none focus:border-accent transition-colors font-mono"
                />
              </Field>
            )}

            {/* Base URL */}
            {(provider === "custom" || provider === "ollama") ? (
              <Field label="Base URL Endpoint">
                <input
                  type="text"
                  value={local.baseUrl}
                  onChange={(e) => setLocal({ ...local, baseUrl: e.target.value })}
                  placeholder={provider === "ollama" ? "http://localhost:11434/v1" : "https://api.openai.com/v1"}
                  className="w-full bg-surface border border-[var(--border)] rounded-lg px-3 py-1.5 text-xs text-[var(--text)] outline-none focus:border-accent transition-colors font-mono"
                />
              </Field>
            ) : (
              <div className="py-1.5 bg-white/5 border border-[var(--border)] rounded-lg px-3 flex justify-between items-center text-[10px]">
                <span className="text-text-muted">Target API Server</span>
                <span className="font-mono text-[var(--text)] truncate max-w-[260px]">{local.baseUrl}</span>
              </div>
            )}

            {/* API Key */}
            {provider === "ollama" ? (
              <div className="py-1.5 bg-green-500/10 border border-green-500/20 rounded-lg px-3 text-[10px] text-green-400">
                ✓ Offline mode enabled for Ollama. API tokens are not required.
              </div>
            ) : (
              <Field label={`${PRESETS[provider].label} API Key`}>
                <input
                  type="password"
                  value={local.apiKey}
                  onChange={(e) => setLocal({ ...local, apiKey: e.target.value })}
                  placeholder={provider === "google" ? "AIzaSy..." : "sk-..."}
                  className="w-full bg-surface border border-[var(--border)] rounded-lg px-3 py-1.5 text-xs text-[var(--text)] outline-none focus:border-accent transition-colors font-mono"
                />
                {provider === "google" && local.apiKey && (
                  <p className="text-[9px] text-green-400 mt-1">✓ API key loaded. Ready to connect to Gemini.</p>
                )}
              </Field>
            )}

            {/* Model selector */}
            <Field label="Active Model Name">
              <input
                type="text"
                value={local.model}
                onChange={(e) => setLocal({ ...local, model: e.target.value })}
                placeholder="e.g. gpt-4o, gemini-2.5-flash"
                className="w-full bg-surface border border-[var(--border)] rounded-lg px-3 py-1.5 text-xs text-[var(--text)] outline-none focus:border-accent transition-colors font-mono"
              />

              {/* Provider-specific model suggestions */}
              {fetchedModels.length > 0 ? (
                <div className="mt-1.5 flex flex-wrap gap-1">
                  {fetchedModels.map((m) => (
                    <button
                      key={m}
                      onClick={() => setLocal({ ...local, model: m })}
                      className={`text-[9px] px-1.5 py-0.5 rounded border transition-colors ${
                        local.model === m
                          ? "border-accent bg-accent/20 text-accent-light"
                          : "border-[var(--border)] text-text-muted hover:text-[var(--text)] hover:border-accent/50"
                      }`}
                    >
                      {m}
                    </button>
                  ))}
                </div>
              ) : (
                <ModelPresets provider={provider} current={local.model} onSelect={(m) => setLocal({ ...local, model: m })} />
              )}
            </Field>

            {error && (
              <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-red-900/20 border border-error/30 text-error text-xs animate-fade-in">
                <svg className="w-3.5 h-3.5 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>
                <span className="truncate">{error}</span>
              </div>
            )}
          </div>
        )}

        {/* Footer */}
        <div className="px-5 py-3 border-t border-[var(--border)] flex justify-end gap-2 bg-surface/30">
          <button
            onClick={onClose}
            className="px-4 py-1.5 text-xs text-text-muted hover:text-[var(--text)] hover:bg-white/5 rounded-lg transition-colors"
          >
            Cancel
          </button>
          {view === "form" && (
            <button
              onClick={handleSave}
              disabled={connecting}
              className="px-5 py-1.5 text-xs font-semibold bg-accent text-white rounded-lg hover:bg-accent-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1.5"
            >
              {connecting && (
                <div className="w-3 h-3 rounded-full border border-white/30 border-t-white animate-spin" />
              )}
              Apply Configuration
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

function ModelPresets({ provider, current, onSelect }: { provider: ProviderType; current: string; onSelect: (m: string) => void }) {
  const presets: Record<string, string[]> = {
    openai: ["gpt-4o", "gpt-4-turbo", "gpt-3.5-turbo"],
    anthropic: ["anthropic/claude-3.5-sonnet", "anthropic/claude-3-opus"],
    ollama: ["llama3", "mistral", "codegemma"],
    google: ["gemini-2.5-flash", "gemini-2.5-pro", "gemini-1.5-pro"],
  }

  const models = presets[provider]
  if (!models) return null

  return (
    <div className="mt-1.5 flex flex-wrap gap-1">
      {models.map((m) => (
        <button
          key={m}
          onClick={() => onSelect(m)}
          className={`text-[9px] px-1.5 py-0.5 rounded border transition-colors ${
            current === m
              ? "border-accent bg-accent/20 text-accent-light"
              : "border-[var(--border)] text-text-muted hover:text-[var(--text)] hover:border-accent/50"
          }`}
        >
          {m.includes("/") ? m.split("/")[1] : m}
        </button>
      ))}
    </div>
  )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-[10px] font-medium text-[var(--text)] uppercase tracking-wider mb-1.5">{label}</label>
      {children}
    </div>
  )
}
