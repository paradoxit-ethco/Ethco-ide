import { create } from "zustand"

export interface Message {
  id: string
  role: "user" | "assistant"
  content: string
  timestamp: number
}

export interface AgentSession {
  id: string
  mode: "build" | "plan" | "ask"
  model: string
  messages: Message[]
  status: "idle" | "thinking" | "error"
}

interface AgentState {
  sessions: AgentSession[]
  activeSessionId: string | null
  sidebarOpen: boolean
  createSession: (mode: "build" | "plan" | "ask", model: string) => string
  deleteSession: (id: string) => void
  clearAllSessions: () => void
  addMessage: (sessionId: string, msg: Message) => void
  deleteMessage: (sessionId: string, messageId: string) => void
  revertSession: (sessionId: string, messageId: string) => void
  setStatus: (sessionId: string, status: AgentSession["status"]) => void
  setActiveSession: (id: string) => void
  toggleSidebar: () => void
  setSidebarOpen: (v: boolean) => void
}

const STORAGE_KEY = "ethco-agent-sessions"

function loadSessions(): AgentSession[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

function saveSessions(sessions: AgentSession[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(sessions))
  } catch { /* ignore */ }
}

export const useAgentStore = create<AgentState>((set) => {
  const initialSessions = loadSessions()
  const initialActive = initialSessions.length > 0 ? initialSessions[0].id : null

  return {
    sessions: initialSessions,
    activeSessionId: initialActive,
    sidebarOpen: true,

    createSession: (mode, model) => {
      const id = crypto.randomUUID()
      set((s) => {
        const updated = [
          ...s.sessions,
          { id, mode, model, messages: [], status: "idle" as const },
        ]
        saveSessions(updated)
        return {
          sessions: updated,
          activeSessionId: id,
        }
      })
      return id
    },

    deleteSession: (id) => {
      set((s) => {
        const updated = s.sessions.filter((se) => se.id !== id)
        saveSessions(updated)
        let active = s.activeSessionId
        if (active === id) {
          active = updated.length > 0 ? updated[updated.length - 1].id : null
        }
        return {
          sessions: updated,
          activeSessionId: active,
        }
      })
    },

    clearAllSessions: () => {
      set(() => {
        saveSessions([])
        return {
          sessions: [],
          activeSessionId: null,
        }
      })
    },

    addMessage: (sessionId, msg) => {
      set((s) => {
        const updated = s.sessions.map((se) =>
          se.id === sessionId
            ? { ...se, messages: [...se.messages, msg] }
            : se
        )
        saveSessions(updated)
        return { sessions: updated }
      })
    },

    deleteMessage: (sessionId, messageId) => {
      set((s) => {
        const updated = s.sessions.map((se) =>
          se.id === sessionId
            ? { ...se, messages: se.messages.filter((m) => m.id !== messageId) }
            : se
        )
        saveSessions(updated)
        return { sessions: updated }
      })
    },

    revertSession: (sessionId, messageId) => {
      set((s) => {
        const updated = s.sessions.map((se) => {
          if (se.id !== sessionId) return se
          const idx = se.messages.findIndex((m) => m.id === messageId)
          if (idx === -1) return se
          // Truncate messages to preserve everything before this message index
          return { ...se, messages: se.messages.slice(0, idx) }
        })
        saveSessions(updated)
        return { sessions: updated }
      })
    },

    setStatus: (sessionId, status) => {
      set((s) => {
        const updated = s.sessions.map((se) =>
          se.id === sessionId ? { ...se, status } : se
        )
        saveSessions(updated)
        return { sessions: updated }
      })
    },

    setActiveSession: (id) => set({ activeSessionId: id }),

    toggleSidebar: () => set((s) => ({ sidebarOpen: !s.sidebarOpen })),

    setSidebarOpen: (v) => set({ sidebarOpen: v }),
  }
})
