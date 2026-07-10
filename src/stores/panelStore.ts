import { create } from "zustand"

export type PanelTabId = "terminal" | "problems" | "output" | "debug"

interface PanelState {
  activeTab: PanelTabId
  visible: boolean
  height: number
  setActiveTab: (tab: PanelTabId) => void
  setVisible: (v: boolean) => void
  toggle: () => void
  setHeight: (h: number) => void
}

export const usePanelStore = create<PanelState>((set) => ({
  activeTab: "terminal",
  visible: true,
  height: 200,

  setActiveTab: (tab) => set({ activeTab: tab, visible: true }),
  setVisible: (v) => set({ visible: v }),
  toggle: () => set((s) => ({ visible: !s.visible })),
  setHeight: (h) => set({ height: Math.max(80, Math.min(600, h)) }),
}))
