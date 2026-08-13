import { create } from "zustand"

export type ActivityId = "explorer" | "search" | "git" | "run" | "extensions"

interface ActivityState {
  active: ActivityId | null
  setActive: (id: ActivityId) => void
  toggle: (id: ActivityId) => void
}

export const useActivityStore = create<ActivityState>((set) => ({
  active: "explorer",

  setActive: (id) => set({ active: id }),

  toggle: (id) =>
    set((s) => ({ active: s.active === id ? null : id })),
}))
