import { create } from "zustand"
import { type ThemeMode, getTheme, setTheme as applyTheme } from "../services/theme"

interface SettingsState {
  theme: ThemeMode
  fontSize: number
  tabSize: number
  fontFamily: string
  sidebarWidth: number
  terminalHeight: number
  agentPanelOpen: boolean
  agentBaseUrl: string
  agentApiKey: string
  setTheme: (mode: ThemeMode) => void
  setFontSize: (size: number) => void
  setTabSize: (size: number) => void
  setFontFamily: (family: string) => void
  setSidebarWidth: (w: number) => void
  setTerminalHeight: (h: number) => void
  setAgentPanelOpen: (v: boolean) => void
  setAgentBaseUrl: (url: string) => void
  setAgentApiKey: (key: string) => void
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
  agentPanelOpen: true,
  agentBaseUrl: "https://api.opencode.ai/v1",
  agentApiKey: "",
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

  setAgentPanelOpen: (v) => {
    set({ agentPanelOpen: v })
    saveSettings({ agentPanelOpen: v })
  },

  setAgentBaseUrl: (url) => {
    set({ agentBaseUrl: url })
    saveSettings({ agentBaseUrl: url })
  },

  setAgentApiKey: (key) => {
    set({ agentApiKey: key })
    saveSettings({ agentApiKey: key })
  },
}))
