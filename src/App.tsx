import { useEffect, useState, useCallback, useRef } from "react"
import { FileTree } from "./components/explorer/FileTree"
import { EditorTabs } from "./components/editor/EditorTabs"
import { MonacoEditor } from "./components/editor/MonacoEditor"
import { Panel } from "./components/panel/Panel"
import { AgentSidebar } from "./components/agent/AgentSidebar"
import { ActivityBar } from "./components/activitybar/ActivityBar"
import { SearchPanel } from "./components/search/SearchPanel"
import { SourceControlPanel } from "./components/git/SourceControlPanel"
import { StatusBar } from "./components/statusbar/StatusBar"
import { Breadcrumbs } from "./components/editor/Breadcrumbs"
import { ErrorBoundary } from "./components/common/ErrorBoundary"
import { QuickSearch } from "./components/common/QuickSearch"
import { SettingsModal } from "./components/common/SettingsModal"
import { ToastContainer } from "./components/common/ToastContainer"
import { ContextMenu } from "./components/common/ContextMenu"
import { WelcomePage } from "./components/common/WelcomePage"
import { useAgentStore } from "./stores/agentStore"
import { useEditorStore } from "./stores/editorStore"
import { useWorkspaceStore } from "./stores/workspaceStore"
import { useToastStore } from "./stores/toastStore"
import { useActivityStore } from "./stores/activityStore"
import { useConnectionStore } from "./stores/connectionStore"
import { getFS } from "./services/fs-provider"
import { initTheme } from "./services/theme"

export default function App() {
  const sidebarOpen = useAgentStore((s) => s.sidebarOpen)
  const toggleSidebar = useAgentStore((s) => s.toggleSidebar)
  const createSession = useAgentStore((s) => s.createSession)
  const tabs = useEditorStore((s) => s.tabs)
  const activeTab = useEditorStore((s) => s.activeTab)
  const cursorLine = useEditorStore((s) => s.cursorLine)
  const setCursorLine = useEditorStore((s) => s.setCursorLine)
  const restoreTabs = useEditorStore((s) => s.restoreTabs)
  const closeTab = useEditorStore((s) => s.closeTab)
  const openFile = useEditorStore((s) => s.openFile)
  const updateContent = useEditorStore((s) => s.updateContent)
  const saveWorkspace = useWorkspaceStore((s) => s.saveWorkspace)
  const loadWorkspace = useWorkspaceStore((s) => s.loadWorkspace)
  const restored = useWorkspaceStore((s) => s.restored)
  const setRestored = useWorkspaceStore((s) => s.setRestored)
  const projectPath = useWorkspaceStore((s) => s.projectPath)
  const setProjectPath = useWorkspaceStore((s) => s.setProjectPath)
  const addToast = useToastStore((s) => s.addToast)
  const activityActive = useActivityStore((s) => s.active)
  const setActivity = useActivityStore((s) => s.setActive)

  const [searchOpen, setSearchOpen] = useState(false)
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [confirmClose, setConfirmClose] = useState<{ path: string; name: string } | null>(null)

  const initRef = useRef(false)

  useEffect(() => {
    if (initRef.current) return
    initRef.current = true
    initTheme()

    const saved = loadWorkspace()
    if (saved.projectPath) {
      setProjectPath(saved.projectPath)
      ;(window as any).__projectRoot = saved.projectPath
      const fs = getFS()
      fs.setProjectRoot(saved.projectPath)
      if (Array.isArray(saved.openTabs) && saved.openTabs.length > 0) {
        restoreTabs(saved.openTabs, saved.activeTab)
      }
    }
    setRestored(true)
  }, [])

  useEffect(() => {
    if (!restored || !projectPath) return
    const saveTabs = tabs.map((t) => ({ path: t.path, name: t.name, content: t.content, language: t.language }))
    saveWorkspace(projectPath, saveTabs, activeTab)
  }, [projectPath, tabs, activeTab, restored, saveWorkspace])

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    const ctrl = e.ctrlKey || e.metaKey

    if (ctrl && e.key === "p") { e.preventDefault(); if (projectPath) setSearchOpen((v) => !v); return }
    if (ctrl && e.key === ",") { e.preventDefault(); setSettingsOpen((v) => !v); return }
    if (ctrl && e.key === "b") { e.preventDefault(); toggleSidebar(); return }
    if (ctrl && e.shiftKey && e.key === "I") {
      e.preventDefault()
      const model = useConnectionStore.getState().config.model || "big-pickle"
      createSession("build", model)
      return
    }
    if (ctrl && e.shiftKey && e.key === "F") { e.preventDefault(); setActivity("search"); return }
    if (ctrl && e.shiftKey && e.key === "G") { e.preventDefault(); setActivity("git"); return }
    if (ctrl && e.shiftKey && e.key === "E") { e.preventDefault(); setActivity("explorer"); return }
    if (ctrl && e.shiftKey && e.key === "D") { e.preventDefault(); setActivity("run"); return }
  }, [toggleSidebar, createSession, setActivity, projectPath])

  useEffect(() => {
    document.addEventListener("keydown", handleKeyDown)
    return () => document.removeEventListener("keydown", handleKeyDown)
  }, [handleKeyDown])

  async function handleOpenFolder(path?: string) {
    const win = window as any
    let resolved = path || null
    if (!resolved) {
      if (win.electronAPI?.selectDirectory) {
        resolved = await win.electronAPI.selectDirectory()
      } else {
        resolved = prompt("Enter project path:")
      }
    }
    if (!resolved) return
    const fs = getFS()
    fs.setProjectRoot(resolved)
    setProjectPath(resolved)
    ;(window as any).__projectRoot = resolved
    setActivity("explorer")
    try { if (!(await fs.exists(resolved))) await fs.createDirectory(resolved) } catch { /* ok */ }
  }

  function handleCloseTabWithCheck(path: string) {
    const tab = tabs.find((t) => t.path === path)
    if (tab?.isDirty) setConfirmClose({ path, name: tab.name })
    else closeTab(path)
  }

  function confirmCloseTab(force: boolean) {
    if (confirmClose) {
      if (force) { closeTab(confirmClose.path); addToast(`Closed ${confirmClose.name}`, "info") }
      setConfirmClose(null)
    }
  }

  const activeFile = tabs.find((t) => t.path === activeTab)

  if (!projectPath) {
    return (
      <ErrorBoundary>
        <div className="h-full flex flex-col bg-[#1e1e2e] text-[var(--text)]">
          <WelcomePage onOpenFolder={handleOpenFolder} />
          <QuickSearch open={false} onClose={() => {}} />
          <SettingsModal open={settingsOpen} onClose={() => setSettingsOpen(false)} />
          <ToastContainer />
        </div>
      </ErrorBoundary>
    )
  }

  return (
    <ErrorBoundary>
      <div className="h-full flex flex-col bg-[#1e1e2e] text-[var(--text)]">
        <div className="flex-1 flex overflow-hidden">
          <ErrorBoundary><ActivityBar /></ErrorBoundary>

          {activityActive === "explorer" && (
            <ErrorBoundary><FileTree rootPath={projectPath} /></ErrorBoundary>
          )}
          {activityActive === "search" && (
            <ErrorBoundary><SearchPanel rootPath={projectPath} /></ErrorBoundary>
          )}
          {activityActive === "git" && (
            <ErrorBoundary><SourceControlPanel rootPath={projectPath} /></ErrorBoundary>
          )}
          {activityActive === "run" && (
            <ErrorBoundary>
              <PlaceholderPanel title="RUN AND DEBUG" icon="run">
                <p className="text-xs text-text-muted">No launch configuration yet</p>
                <button className="px-4 py-1.5 text-xs bg-accent text-white rounded hover:bg-accent-dark transition-colors">Create a launch.json</button>
              </PlaceholderPanel>
            </ErrorBoundary>
          )}
          {activityActive === "extensions" && (
            <ErrorBoundary>
              <PlaceholderPanel title="EXTENSIONS" icon="extensions">
                <p className="text-xs text-text-muted">No extensions installed</p>
              </PlaceholderPanel>
            </ErrorBoundary>
          )}

          <div className="flex-1 flex flex-col min-w-0">
            <div className="flex-1 flex flex-col min-h-0">
              <ErrorBoundary>
                <EditorTabs onCloseTab={handleCloseTabWithCheck} />
              </ErrorBoundary>
              <Breadcrumbs path={activeFile?.path || null} />
              <div className="flex-1 min-h-0">
                {activeFile && activeFile.path ? (
                  <MonacoEditor
                    key={activeFile.path}
                    path={activeFile.path}
                    content={activeFile.content}
                    language={activeFile.language}
                    cursorLine={cursorLine ?? undefined}
                  />
                ) : (
                  <div className="h-full flex items-center justify-center bg-[#1e1e2e]">
                    <div className="text-center space-y-3">
                      <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" className="mx-auto text-text-dim">
                        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" />
                        <line x1="12" y1="18" x2="12" y2="12" /><line x1="9" y1="15" x2="15" y2="15" />
                      </svg>
                      <p className="text-xs text-text-muted">No file open</p>
                      <p className="text-[10px] text-text-dim">Select a file from the explorer</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <ErrorBoundary>
              <Panel projectPath={projectPath} />
            </ErrorBoundary>
          </div>

          {sidebarOpen && (
            <ErrorBoundary><AgentSidebar /></ErrorBoundary>
          )}
        </div>

        <ErrorBoundary><StatusBar /></ErrorBoundary>

        <QuickSearch open={searchOpen} onClose={() => setSearchOpen(false)} />
        <SettingsModal open={settingsOpen} onClose={() => setSettingsOpen(false)} />
        <ToastContainer />
        <ContextMenu />

        {confirmClose && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
            <div className="bg-[#1e1e2e] border border-[#313244] rounded-lg shadow-2xl w-[380px]">
              <div className="px-4 py-3 border-b border-[#313244]">
                <h3 className="text-sm font-medium text-[var(--text)]">Unsaved changes</h3>
              </div>
              <div className="px-4 py-3">
                <p className="text-xs text-text-muted">
                  <span className="text-[var(--text)] font-mono">{confirmClose.name}</span> has unsaved changes.
                </p>
              </div>
              <div className="px-4 py-3 border-t border-[#313244] flex justify-end gap-2">
                <button onClick={() => setConfirmClose(null)} className="px-3 py-1.5 text-xs rounded border border-[#313244] text-text-muted hover:text-[var(--text)] hover:bg-white/5 transition-colors">Cancel</button>
                <button onClick={() => confirmCloseTab(true)} className="px-3 py-1.5 text-xs rounded bg-red-900/30 text-red-400 hover:bg-red-900/50 transition-colors">Close Anyway</button>
                <button onClick={async () => {
                  const fs = getFS()
                  const tab = tabs.find((t) => t.path === confirmClose.path)
                  if (tab) {
                    try { await fs.writeFile(tab.path, tab.content); closeTab(tab.path); addToast(`Saved and closed ${tab.name}`, "success") }
                    catch { addToast(`Failed to save ${tab.name}`, "error") }
                  }
                  setConfirmClose(null)
                }} className="px-3 py-1.5 text-xs rounded bg-accent text-white hover:bg-accent-dark transition-colors">Save & Close</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </ErrorBoundary>
  )
}

function PlaceholderPanel({ title, icon, children }: { title: string; icon: string; children: React.ReactNode }) {
  return (
    <div className="w-[280px] min-w-[260px] max-w-[400px] bg-[#1e1e2e] border-r border-[#313244] flex flex-col">
      <div className="px-4 py-3 border-b border-[#313244]">
        <h2 className="text-[11px] font-semibold uppercase tracking-wider text-text-muted">{title}</h2>
      </div>
      <div className="flex-1 flex items-center justify-center p-4">
        <div className="text-center space-y-3">
          {children}
        </div>
      </div>
    </div>
  )
}
