import { create } from "zustand"

export interface Toast {
  id: string
  message: string
  type: "info" | "success" | "error" | "warning"
  duration: number
}

interface ToastState {
  toasts: Toast[]
  addToast: (message: string, type?: Toast["type"], duration?: number) => string
  removeToast: (id: string) => void
}

export const useToastStore = create<ToastState>((set) => ({
  toasts: [],

  addToast: (message, type = "info", duration = 3000) => {
    const id = crypto.randomUUID()
    set((s) => ({ toasts: [...s.toasts, { id, message, type, duration }] }))
    if (duration > 0) {
      setTimeout(() => {
        set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) }))
      }, duration)
    }
    return id
  },

  removeToast: (id) => {
    set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) }))
  },
}))
