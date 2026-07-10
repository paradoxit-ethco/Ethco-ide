import { create } from "zustand"

export interface Tab {
  path: string
  name: string
  content: string
  originalContent: string
  language: string
  isDirty: boolean
}

interface EditorState {
  tabs: Tab[]
  activeTab: string | null
  cursorLine: number | null
  openFile: (path: string, name: string, content: string, language: string) => void
  updateContent: (path: string, content: string) => void
  markClean: (path: string) => void
  closeTab: (path: string) => void
  setActiveTab: (path: string) => void
  setCursorLine: (line: number | null) => void
  restoreTabs: (saved: { path: string; name: string; content: string; language: string }[], activePath?: string) => void
}

export const useEditorStore = create<EditorState>((set, get) => ({
  tabs: [],
  activeTab: null,
  cursorLine: null,

  openFile: (path, name, content, language) => {
    const existing = get().tabs.find((t) => t.path === path)
    if (existing) {
      set({ activeTab: path })
    } else {
      set((s) => ({
        tabs: [...s.tabs, { path, name, content, originalContent: content, language, isDirty: false }],
        activeTab: path,
      }))
    }
  },

  updateContent: (path, content) => {
    set((s) => ({
      tabs: s.tabs.map((t) =>
        t.path === path ? { ...t, content, isDirty: content !== t.originalContent } : t
      ),
    }))
  },

  markClean: (path) => {
    set((s) => ({
      tabs: s.tabs.map((t) =>
        t.path === path ? { ...t, originalContent: t.content, isDirty: false } : t
      ),
    }))
  },

  closeTab: (path) => {
    set((s) => {
      const remaining = s.tabs.filter((t) => t.path !== path)
      let newActive = s.activeTab
      if (s.activeTab === path) {
        const idx = s.tabs.findIndex((t) => t.path === path)
        newActive = remaining[Math.min(idx, remaining.length - 1)]?.path ?? null
      }
      return { tabs: remaining, activeTab: newActive }
    })
  },

  setActiveTab: (path) => set({ activeTab: path }),

  setCursorLine: (line) => set({ cursorLine: line }),

  restoreTabs: (saved, activePath) => {
    const tabs = saved.map((t) => ({
      ...t,
      originalContent: t.content,
      isDirty: false,
    }))
    set({ tabs, activeTab: activePath || tabs[0]?.path || null })
  },
}))
