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

  const createTab = useCallback(() => {
    const id = `term-${++tabCounter}`
    const tab: PtyTab = {
      id, label: detectShell(), term: null, fitAddon: null, disposed: false, cleanup: () => {},
    }
    setTabs((prev) => [...prev, tab])
    setActiveId(id)
    return id
  }, [])

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
    <div className="h-full flex flex-col">
      {/* Tab bar */}
      <div className="flex items-center px-2 border-b border-[var(--border)] shrink-0 min-h-[28px]">
        <div className="flex items-center overflow-x-auto">
          {tabs.map((tab) => (
            <div
              key={tab.id}
              className={`flex items-center gap-1 px-2.5 py-1 text-[11px] cursor-pointer select-none group ${
                tab.id === activeId
                  ? "text-[var(--text)] bg-surface/40"
                  : "text-text-muted hover:text-[var(--text)]"
              }`}
              onClick={() => setActiveId(tab.id)}
            >
              <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="4 17 10 11 4 5" />
                <line x1="12" y1="19" x2="20" y2="19" />
              </svg>
              <span className="truncate max-w-[100px]">{tab.label}</span>
              <button
                onClick={(e) => { e.stopPropagation(); removeTab(tab.id) }}
                className="ml-0.5 opacity-0 group-hover:opacity-60 hover:opacity-100 hover:bg-white/10 rounded p-px leading-none"
              >
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              </button>
            </div>
          ))}
        </div>
        <button onClick={() => createTab()} className="ml-1 p-1 rounded text-text-muted hover:text-[var(--text)] hover:bg-white/5 transition-colors" title="New Terminal">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
        </button>
        <div className="flex-1" />
      </div>

      {/* Terminal views */}
      <div className="flex-1 min-h-0 relative">
        {tabs.map((tab) => (
          <TerminalView
            key={tab.id}
            tab={tab}
            visible={tab.id === activeId}
            fontSize={fontSize}
            fontFamily={fontFamily}
            projectPath={projectPath}
          />
        ))}
      </div>
    </div>
  )
}

function TerminalView({ tab, visible, fontSize, fontFamily, projectPath }: {
  tab: PtyTab; visible: boolean; fontSize: number; fontFamily: string; projectPath?: string
}) {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!containerRef.current || tab.term) return

    const term = new Terminal({
      cursorBlink: true,
      cursorStyle: "bar",
      fontSize,
      fontFamily,
      theme: termTheme,
      allowTransparency: true,
      convertEol: true,
    })
    const fitAddon = new FitAddon()
    term.loadAddon(fitAddon)
    term.open(containerRef.current)
    fitAddon.fit()

    const api = (window as any).electronAPI
    if (api?.ptySpawn) {
      api.ptySpawn(tab.id, projectPath || "")

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
    if (visible) setTimeout(() => tab.fitAddon?.fit(), 50)
  }, [visible])

  return (
    <div ref={containerRef} className="absolute inset-0" style={{ display: visible ? "block" : "none" }} />
  )
}

const termTheme = {
  background: "#1e1e2e", foreground: "#cdd6f4", cursor: "#cdd6f4",
  selectionBackground: "#45475a", black: "#45475a", red: "#f38ba8",
  green: "#a6e3a1", yellow: "#f9e2af", blue: "#89b4fa",
  magenta: "#f5c2e7", cyan: "#94e2d5", white: "#bac2de",
  brightBlack: "#585b70", brightRed: "#f38ba8", brightGreen: "#a6e3a1",
  brightYellow: "#f9e2af", brightBlue: "#89b4fa", brightMagenta: "#f5c2e7",
  brightCyan: "#94e2d5", brightWhite: "#a6adc8",
}
