import { create } from "zustand"

export interface ConnectionConfig {
  name: string
  model: string
  baseUrl: string
  apiKey: string
}

interface ConnectionState {
  config: ConnectionConfig
  connected: boolean
  connecting: boolean
  error: string | null
  availableModels: string[]
  setConfig: (config: Partial<ConnectionConfig>) => void
  connect: () => Promise<boolean>
  disconnect: () => void
}

const STORAGE_KEY = "ethco-agent-connection"

function loadConfig(): ConnectionConfig {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}")
    // Migrate old model name format
    if (saved.model && saved.model.startsWith("openai/")) {
      saved.model = saved.model.replace("openai/", "")
    }
    return saved
  } catch {
    return {} as ConnectionConfig
  }
}

function saveConfig(config: ConnectionConfig) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(config))
  } catch { /* ignore */ }
}

const defaults: ConnectionConfig = {
  name: "",
  model: "",
  baseUrl: "",
  apiKey: "",
}

export const useConnectionStore = create<ConnectionState>((set, get) => ({
  config: { ...defaults, ...loadConfig() },
  connected: false,
  connecting: false,
  error: null,
  availableModels: [],

  setConfig: (partial) => {
    const next = { ...get().config, ...partial }
    set({ config: next })
    saveConfig(next)
  },

  connect: async () => {
    const { config } = get()
    if (!config.baseUrl) {
      set({ error: "Base URL is required" })
      return false
    }
    if (!config.model) {
      set({ error: "Model name is required" })
      return false
    }
    set({ connecting: true, error: null })
    try {
      const headers: Record<string, string> = { "Content-Type": "application/json" }
      if (config.apiKey) headers["Authorization"] = `Bearer ${config.apiKey}`

      // Fetch available models and validate
      const res = await fetch(`${config.baseUrl}/models`, { headers, signal: AbortSignal.timeout(8000) })
      if (!res.ok) {
        throw new Error(`Server returned ${res.status}: ${res.statusText}`)
      }

      let availableModels: string[] = []
      try {
        const modelsData = await res.json()
        availableModels = (modelsData.data || []).map((m: any) => m.id || m.name || String(m))
      } catch { /* ignore parse errors */ }

      // Validate model exists if we got a list
      if (availableModels.length > 0 && !availableModels.includes(config.model)) {
        set({
          connected: false,
          connecting: false,
          error: `Model "${config.model}" not found. Available models: ${availableModels.join(", ")}`,
          availableModels,
        })
        return false
      }

      set({ connected: true, connecting: false, error: null, availableModels })
      saveConfig(config)
      return true
    } catch (e: any) {
      set({ connected: false, connecting: false, error: e.message || "Connection failed", availableModels: [] })
      return false
    }
  },

  disconnect: () => {
    set({ connected: false, error: null })
  },
}))
