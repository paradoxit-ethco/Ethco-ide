import { create } from "zustand"
import { type ThemeMode, getTheme, setTheme as applyTheme } from "../services/theme"
import { useConnectionStore } from "./connectionStore"

interface SettingsState {
  theme: ThemeMode
  fontSize: number
  tabSize: number
  fontFamily: string
  sidebarWidth: number
  terminalHeight: number
  terminalShell: string
  terminalScrollback: number
  terminalCursorStyle: "bar" | "block" | "underline"
  agentPanelOpen: boolean
  agentBaseUrl: string
  agentApiKey: string
  agentModel: string
  networkProxy: string
  setTheme: (mode: ThemeMode) => void
  setFontSize: (size: number) => void
  setTabSize: (size: number) => void
  setFontFamily: (family: string) => void
  setSidebarWidth: (w: number) => void
  setTerminalHeight: (h: number) => void
  setTerminalShell: (shell: string) => void
  setTerminalScrollback: (lines: number) => void
  setTerminalCursorStyle: (style: "bar" | "block" | "underline") => void
  setAgentPanelOpen: (v: boolean) => void
  setAgentBaseUrl: (url: string) => void
  setAgentApiKey: (key: string) => void
  setAgentModel: (model: string) => void
  setNetworkProxy: (proxy: string) => void
}

const STORAGE_KEY = "ethco-settings"

function loadSettings(): Partial<SettingsState> {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}")
  } catch {
    return {}
  }
}

function saveSettings(s: Partial<SettingsState>) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(s))
  } catch { /* ignore */ }
}

const defaults = {
  theme: getTheme(),
  fontSize: 13,
  tabSize: 2,
  fontFamily: "'JetBrains Mono', 'Fira Code', 'Cascadia Code', monospace",
  sidebarWidth: 208,
  terminalHeight: 200,
  terminalShell: "",
  terminalScrollback: 5000,
  terminalCursorStyle: "bar" as const,
  agentPanelOpen: true,
  agentBaseUrl: "",
  agentApiKey: "",
  agentModel: "",
  networkProxy: "",
}

const saved = loadSettings()

export const useSettingsStore = create<SettingsState>((set) => ({
  ...defaults,
  ...saved,

  setTheme: (mode) => {
    applyTheme(mode)
    set({ theme: mode })
    saveSettings({ theme: mode })
  },

  setFontSize: (size) => {
    set({ fontSize: size })
    saveSettings({ fontSize: size })
  },

  setTabSize: (size) => {
    set({ tabSize: size })
    saveSettings({ tabSize: size })
  },

  setFontFamily: (family) => {
    set({ fontFamily: family })
    saveSettings({ fontFamily: family })
  },

  setSidebarWidth: (w) => {
    set({ sidebarWidth: w })
    saveSettings({ sidebarWidth: w })
  },

  setTerminalHeight: (h) => {
    set({ terminalHeight: h })
    saveSettings({ terminalHeight: h })
  },

  setTerminalShell: (shell) => {
    set({ terminalShell: shell })
    saveSettings({ terminalShell: shell })
  },
  setTerminalScrollback: (lines) => {
    set({ terminalScrollback: lines })
    saveSettings({ terminalScrollback: lines })
  },
  setTerminalCursorStyle: (style) => {
    set({ terminalCursorStyle: style })
    saveSettings({ terminalCursorStyle: style })
  },
  setAgentPanelOpen: (v) => {
    set({ agentPanelOpen: v })
    saveSettings({ agentPanelOpen: v })
  },

  setAgentBaseUrl: (url) => {
    set({ agentBaseUrl: url })
    saveSettings({ agentBaseUrl: url })
    useConnectionStore.getState().setConfig({ baseUrl: url })
  },

  setAgentApiKey: (key) => {
    set({ agentApiKey: key })
    saveSettings({ agentApiKey: key })
    useConnectionStore.getState().setConfig({ apiKey: key })
  },

  setAgentModel: (model) => {
    set({ agentModel: model })
    saveSettings({ agentModel: model })
    useConnectionStore.getState().setConfig({ model: model })
  },

  setNetworkProxy: (proxy) => {
    set({ networkProxy: proxy })
    saveSettings({ networkProxy: proxy })
    const api = (window as any).electronAPI
    if (api?.setProxy) {
      api.setProxy(proxy)
    }
  },
}))
