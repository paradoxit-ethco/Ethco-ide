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
  addMessage: (sessionId: string, msg: Message) => void
  setStatus: (sessionId: string, status: AgentSession["status"]) => void
  setActiveSession: (id: string) => void
  toggleSidebar: () => void
  setSidebarOpen: (v: boolean) => void
}

export const useAgentStore = create<AgentState>((set) => ({
  sessions: [],
  activeSessionId: null,
  sidebarOpen: true,

  createSession: (mode, model) => {
    const id = crypto.randomUUID()
    set((s) => ({
      sessions: [
        ...s.sessions,
        { id, mode, model, messages: [], status: "idle" },
      ],
      activeSessionId: id,
    }))
    return id
  },

  addMessage: (sessionId, msg) => {
    set((s) => ({
      sessions: s.sessions.map((se) =>
        se.id === sessionId
          ? { ...se, messages: [...se.messages, msg] }
          : se
      ),
    }))
  },

  setStatus: (sessionId, status) => {
    set((s) => ({
      sessions: s.sessions.map((se) =>
        se.id === sessionId ? { ...se, status } : se
      ),
    }))
  },

  setActiveSession: (id) => set({ activeSessionId: id }),

  toggleSidebar: () => set((s) => ({ sidebarOpen: !s.sidebarOpen })),

  setSidebarOpen: (v) => set({ sidebarOpen: v }),
}))
