import { create } from "zustand"

export interface SavedTab {
  path: string
  name: string
  content: string
  language: string
}

interface WorkspaceState {
  projectPath: string | null
  openTabs: SavedTab[]
  activeTab: string | null
  restored: boolean
  saveWorkspace: (projectPath: string | null, tabs: SavedTab[], activeTab: string | null) => void
  loadWorkspace: () => { projectPath: string | null; openTabs: SavedTab[]; activeTab: string | null }
  clearWorkspace: () => void
  setRestored: (v: boolean) => void
  setProjectPath: (path: string | null) => void
}

const WORKSPACE_KEY = "ethco-workspace"

export const useWorkspaceStore = create<WorkspaceState>((set) => ({
  projectPath: null,
  openTabs: [],
  activeTab: null,
  restored: false,

  saveWorkspace: (projectPath, tabs, activeTab) => {
    const data = { projectPath, openTabs: tabs, activeTab }
    try {
      localStorage.setItem(WORKSPACE_KEY, JSON.stringify(data))
    } catch {
      // localStorage might be full; silently ignore
    }
  },

  loadWorkspace: () => {
    try {
      const raw = localStorage.getItem(WORKSPACE_KEY)
      if (!raw) return { projectPath: null, openTabs: [], activeTab: null }
      return JSON.parse(raw)
    } catch {
      return { projectPath: null, openTabs: [], activeTab: null }
    }
  },

  setProjectPath: (path) => set({ projectPath: path }),

  clearWorkspace: () => {
    try { localStorage.removeItem(WORKSPACE_KEY) } catch { /* ignore */ }
  },

  setRestored: (v) => set({ restored: v }),
}))
