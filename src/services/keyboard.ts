type Action = "save" | "openFile" | "searchFiles" | "toggleSidebar" | "newSession" | "closeTab" | "toggleTerminal" | "toggleTheme"

const bindings: Record<Action, { key: string; ctrl?: boolean; meta?: boolean; shift?: boolean }> = {
  save: { key: "s", ctrl: true },
  openFile: { key: "o", ctrl: true },
  searchFiles: { key: "p", ctrl: true },
  toggleSidebar: { key: "b", ctrl: true },
  newSession: { key: "i", ctrl: true, shift: true },
  closeTab: { key: "w", ctrl: true },
  toggleTerminal: { key: "`", ctrl: true },
  toggleTheme: { key: "t", ctrl: true, shift: true },
}

export type KeyboardHandler = (action: Action, e: KeyboardEvent) => void

export function createKeyboardShortcuts(handler: KeyboardHandler) {
  function onKeyDown(e: KeyboardEvent) {
    for (const [action, binding] of Object.entries(bindings) as [Action, typeof bindings[Action]][]) {
      const ctrl = e.ctrlKey || e.metaKey
      if (
        e.key.toLowerCase() === binding.key &&
        ctrl === !!binding.ctrl &&
        e.shiftKey === !!binding.shift
      ) {
        e.preventDefault()
        e.stopPropagation()
        handler(action, e)
        return
      }
    }
  }

  document.addEventListener("keydown", onKeyDown)

  return () => document.removeEventListener("keydown", onKeyDown)
}
