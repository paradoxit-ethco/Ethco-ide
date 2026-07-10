import { useEffect, useRef, useState, useCallback } from "react"
import { Terminal } from "xterm"
import { FitAddon } from "xterm-addon-fit"
import "xterm/css/xterm.css"
import { useSettingsStore } from "../../stores/settingsStore"
import { setTerminalCommandCallback, appendTerminalOutput, clearTerminalOutput } from "../../services/agentTools"

interface PtyTab {
  id: string
  label: string
  term: Terminal | null
  fitAddon: FitAddon | null
  disposed: boolean
  cleanup: () => void
}

let tabCounter = 0

function detectShell(): string {
  const api = (window as any).electronAPI
  if (api?.platform === "win32") return "powershell"
  return "bash"
}

export function TerminalPanel({ projectPath }: { projectPath?: string }) {
  const [tabs, setTabs] = useState<PtyTab[]>([])
  const [activeId, setActiveId] = useState<string | null>(null)
  const fontSize = useSettingsStore((s) => s.fontSize)
  const fontFamily = useSettingsStore((s) => s.fontFamily)
  const terminalShell = useSettingsStore((s) => s.terminalShell)
  const terminalScrollback = useSettingsStore((s) => s.terminalScrollback)
  const terminalCursorStyle = useSettingsStore((s) => s.terminalCursorStyle)

  const createTab = useCallback(() => {
    const id = `term-${++tabCounter}`
    const shellLabel = terminalShell ? terminalShell.split(/[\\/]/).pop()! : detectShell()
    const tab: PtyTab = {
      id, label: shellLabel, term: null, fitAddon: null, disposed: false, cleanup: () => {},
    }
    setTabs((prev) => [...prev, tab])
    setActiveId(id)
    return id
  }, [terminalShell])

  useEffect(() => {
    if (tabs.length === 0) createTab()
  }, [tabs.length, createTab])

  function removeTab(id: string) {
    const tab = tabs.find((t) => t.id === id)
    if (tab) {
      tab.disposed = true
      tab.cleanup()
      tab.term?.dispose()
    }
    setTabs((prev) => {
      const next = prev.filter((t) => t.id !== id)
      if (activeId === id && next.length > 0) setActiveId(next[next.length - 1].id)
      return next
    })
  }

  useEffect(() => {
    tabs.forEach((t) => {
      if (t.term) { t.term.options.fontSize = fontSize; t.term.options.fontFamily = fontFamily }
    })
  }, [fontSize, fontFamily, tabs])

  return (
    <div className="h-full flex flex-col bg-[var(--surface)]">
      {/* Tab bar */}
      <div className="flex items-center px-3 border-b border-[var(--border)] shrink-0 min-h-[32px] bg-[var(--surface-alt)]">
        <div className="flex items-center overflow-x-auto gap-1">
          {tabs.map((tab) => (
            <div
              key={tab.id}
              className={`flex items-center gap-1.5 px-3 py-1 text-[11px] font-medium rounded-t cursor-pointer select-none group border-b-2 transition-all ${
                tab.id === activeId
                  ? "text-[var(--text)] bg-[var(--surface)] border-[var(--accent-light)]"
                  : "text-text-muted border-transparent hover:text-[var(--text)] hover:bg-white/[0.03]"
              }`}
              onClick={() => setActiveId(tab.id)}
            >
              <svg className="w-3 h-3 text-[var(--accent-light)] shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <polyline points="4 17 10 11 4 5" />
                <line x1="12" y1="19" x2="20" y2="19" />
              </svg>
              <span className="truncate max-w-[120px]">{tab.label}</span>
              <button
                onClick={(e) => { e.stopPropagation(); removeTab(tab.id) }}
                className="ml-1 opacity-0 group-hover:opacity-60 hover:opacity-100 hover:bg-white/10 rounded p-0.5 transition-opacity"
              >
                <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              </button>
            </div>
          ))}
        </div>
        <button onClick={() => createTab()} className="ml-2 p-1 rounded text-text-muted hover:text-[var(--text)] hover:bg-white/5 transition-colors" title="New Terminal">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
        </button>
        <div className="flex-1" />
      </div>

      {/* Terminal views */}
      <div className="flex-1 min-h-0 relative p-2 bg-[var(--surface)]">
        {tabs.map((tab) => (
          <TerminalView
            key={tab.id}
            tab={tab}
            visible={tab.id === activeId}
            fontSize={fontSize}
            fontFamily={fontFamily}
            cursorStyle={terminalCursorStyle}
            scrollback={terminalScrollback}
            shell={terminalShell}
            projectPath={projectPath}
          />
        ))}
      </div>
    </div>
  )
}

function TerminalView({ tab, visible, fontSize, fontFamily, cursorStyle, scrollback, shell, projectPath }: {
  tab: PtyTab; visible: boolean; fontSize: number; fontFamily: string; cursorStyle: string; scrollback: number; shell: string; projectPath?: string
}) {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!containerRef.current || tab.term) return

    const term = new Terminal({
      cursorBlink: true,
      cursorStyle: cursorStyle as "bar" | "block" | "underline",
      fontSize,
      fontFamily,
      theme: termTheme,
      allowTransparency: true,
      convertEol: true,
      scrollback,
    })
    const fitAddon = new FitAddon()
    term.loadAddon(fitAddon)
    term.open(containerRef.current)
    fitAddon.fit()

    const api = (window as any).electronAPI
    if (api?.ptySpawn) {
      const { cols, rows } = fitAddon.proposeDimensions() || { cols: 80, rows: 24 }
      api.ptySpawn(tab.id, projectPath || "", cols, rows, shell || undefined)

      setTerminalCommandCallback((cmd: string) => {
        if (!tab.disposed) { clearTerminalOutput(); api.ptyWrite(tab.id, cmd + "\n") }
      })

      term.onData((data: string) => api.ptyWrite(tab.id, data))

      const unsubData = api.onPtyData((incomingId: string, data: string) => {
        if (incomingId === tab.id && !tab.disposed) { term.write(data); appendTerminalOutput(data) }
      })
      const unsubExit = api.onPtyExit((incomingId: string, _code: number) => {
        if (incomingId === tab.id && !tab.disposed) term.write(`\r\n\x1b[31m[process exited]\x1b[0m\r\n`)
      })

      tab.cleanup = () => { api.ptyKill(tab.id); unsubData(); unsubExit() }
    } else {
      term.writeln("Terminal available in Electron app only")
    }

    tab.term = term
    tab.fitAddon = fitAddon

    return () => { tab.disposed = true; tab.cleanup(); term.dispose(); tab.term = null; tab.fitAddon = null }
  }, [])

  useEffect(() => {
    if (tab.term) { tab.term.options.fontSize = fontSize; tab.term.options.fontFamily = fontFamily }
  }, [fontSize, fontFamily])

  useEffect(() => {
    if (visible) {
      setTimeout(() => {
        tab.fitAddon?.fit()
        const dims = tab.fitAddon?.proposeDimensions()
        if (dims && tab.term && (window as any).electronAPI) {
          ;(window as any).electronAPI.ptyResize(tab.id, dims.cols, dims.rows)
        }
      }, 50)
    }
  }, [visible])

  return (
    <div ref={containerRef} className="absolute inset-0 m-1" style={{ display: visible ? "block" : "none" }} />
  )
}

const termTheme = {
  background: "#1e1e1e", foreground: "#e2e8f0", cursor: "#3794ff",
  selectionBackground: "#334155", black: "#1e293b", red: "#ef4444",
  green: "#22c55e", yellow: "#eab308", blue: "#3b82f6",
  magenta: "#a855f7", cyan: "#06b6d4", white: "#cbd5e1",
  brightBlack: "#475569", brightRed: "#f87171", brightGreen: "#4ade80",
  brightYellow: "#facc15", brightBlue: "#60a5fa", brightMagenta: "#c084fc",
  brightCyan: "#22d3ee", brightWhite: "#f1f5f9",
}
