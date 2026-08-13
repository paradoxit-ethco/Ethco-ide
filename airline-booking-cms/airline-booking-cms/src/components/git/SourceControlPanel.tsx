import { useState, useEffect, useCallback } from "react"
import { getStatus, stageFile, unstageFile, commit, getDiff, type GitStatus } from "../../services/git"
import { useEditorStore } from "../../stores/editorStore"
import { getFS } from "../../services/fs-provider"

interface SourceControlPanelProps {
  rootPath: string
}

export function SourceControlPanel({ rootPath }: SourceControlPanelProps) {
  const [status, setStatus] = useState<GitStatus | null>(null)
  const [loading, setLoading] = useState(false)
  const [commitMsg, setCommitMsg] = useState("")
  const [committing, setCommitting] = useState(false)
  const [diffContent, setDiffContent] = useState<string | null>(null)
  const [diffFile, setDiffFile] = useState<string | null>(null)
  const openFile = useEditorStore((s) => s.openFile)

  const refresh = useCallback(async () => {
    setLoading(true)
    try {
      const s = await getStatus(rootPath)
      setStatus(s)
    } catch { /* no git repo */ }
    setLoading(false)
  }, [rootPath])

  useEffect(() => {
    refresh()
    const interval = setInterval(refresh, 5000)
    return () => clearInterval(interval)
  }, [refresh])

  async function handleStage(filePath: string) {
    await stageFile(rootPath, filePath)
    refresh()
  }

  async function handleUnstage(filePath: string) {
    await unstageFile(rootPath, filePath)
    refresh()
  }

  async function handleCommit() {
    if (!commitMsg.trim()) return
    setCommitting(true)
    try {
      await commit(rootPath, commitMsg.trim())
      setCommitMsg("")
      refresh()
    } catch (e: any) {
      alert("Commit failed: " + e.message)
    }
    setCommitting(false)
  }

  async function handleOpenFile(filePath: string) {
    try {
      const fullPath = filePath.startsWith(rootPath) ? filePath : `${rootPath}/${filePath}`
      const fs = getFS()
      const content = await fs.readFile(fullPath)
      openFile(fullPath, content)
    } catch { /* ignore */ }
  }

  async function handleShowDiff(filePath: string) {
    try {
      const diff = await getDiff(rootPath, filePath)
      setDiffFile(filePath)
      setDiffContent(diff || "No changes")
    } catch { /* ignore */ }
  }

  const isElectron = !!(window as any).electronAPI?.isElectron

  if (!isElectron) {
    return (
      <div className="bg-surface-alt border-r border-[var(--border)] flex flex-col" style={{ width: 280, minWidth: 200 }}>
        <div className="px-3 py-2 text-xs font-semibold text-text-muted uppercase tracking-wider border-b border-[var(--border)]">Source Control</div>
        <div className="flex-1 flex items-center justify-center px-6">
          <div className="text-center">
            <svg className="w-8 h-8 mx-auto mb-2 text-text-dim" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="12" cy="18" r="3"/><circle cx="6" cy="6" r="3"/><circle cx="18" cy="6" r="3"/><path d="M18 9v1a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2V9"/><path d="M12 12v3"/></svg>
            <p className="text-xs text-text-muted">Git is only available in the desktop app</p>
          </div>
        </div>
      </div>
    )
  }

  if (diffContent !== null && diffFile !== null) {
    return (
      <div className="bg-surface-alt border-r border-[var(--border)] flex flex-col" style={{ width: 280, minWidth: 200 }}>
        <div className="flex items-center gap-2 px-3 py-2 border-b border-[var(--border)]">
          <button onClick={() => { setDiffContent(null); setDiffFile(null) }} className="text-xs text-text-muted hover:text-[var(--text)] transition-colors">&larr; Back</button>
          <span className="text-xs text-[var(--text)] truncate font-mono">{diffFile}</span>
        </div>
        <div className="flex-1 overflow-y-auto p-2">
          <pre className="text-[10px] font-mono text-text-muted whitespace-pre-wrap leading-relaxed">
            {diffContent.split("\n").map((line, i) => (
              <div key={i} className={
                line.startsWith("+") ? "text-success" :
                line.startsWith("-") ? "text-error" :
                line.startsWith("@") ? "text-accent-light" : ""
              }>{line}</div>
            ))}
          </pre>
        </div>
      </div>
    )
  }

  const staged = status?.files.filter((f) => f.status !== "untracked") ?? []
  const unstaged = status?.files.filter((f) => f.status === "untracked") ?? []

  return (
    <div className="bg-surface-alt border-r border-[var(--border)] flex flex-col" style={{ width: 280, minWidth: 200 }}>
      <div className="px-3 py-2 flex items-center justify-between border-b border-[var(--border)]">
        <span className="text-xs font-semibold text-text-muted uppercase tracking-wider">Source Control</span>
        <button onClick={refresh} className="w-5 h-5 flex items-center justify-center rounded text-text-muted hover:text-[var(--text)] hover:bg-white/10 transition-colors" title="Refresh">
          <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/></svg>
        </button>
      </div>

      {status?.branch && (
        <div className="px-3 py-1.5 text-[10px] text-text-muted border-b border-[var(--border)] flex items-center gap-1.5">
          <svg className="w-3 h-3 text-accent-light" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="6 9 6 15"/><path d="M18 9a3 3 0 1 0 0-6 3 3 0 0 0 0 6z"/><path d="M6 15a3 3 0 1 0 0 6 3 3 0 0 0 0-6z"/><line x1="18" y1="9" x2="6" y2="15"/></svg>
          <span className="text-accent-light font-medium">{status.branch}</span>
          {status.files.length > 0 && <span className="text-text-dim">({status.files.length} file{status.files.length !== 1 ? "s" : ""})</span>}
        </div>
      )}

      <div className="px-3 py-2 space-y-1.5 border-b border-[var(--border)]">
        <input
          type="text"
          value={commitMsg}
          onChange={(e) => setCommitMsg(e.target.value)}
          placeholder="Commit message..."
          className="w-full bg-surface border border-[var(--border)] rounded-lg px-2.5 py-1.5 text-xs text-[var(--text)] outline-none focus:border-accent transition-colors"
          onKeyDown={(e) => e.key === "Enter" && handleCommit()}
        />
        <button
          onClick={handleCommit}
          disabled={!commitMsg.trim() || committing}
          className="w-full px-3 py-1.5 text-xs font-medium bg-accent text-white rounded-lg hover:bg-accent-dark transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {committing ? (
            <span className="flex items-center justify-center gap-1.5">
              <div className="w-3 h-3 rounded-full border-2 border-white/30 border-t-white animate-spin" />
              Committing...
            </span>
          ) : "Commit"}
        </button>
      </div>

      {loading ? (
        <div className="flex-1 flex items-center justify-center">
          <div className="flex items-center gap-2 text-xs text-text-muted">
            <div className="w-3 h-3 rounded-full border-2 border-accent/30 border-t-accent animate-spin" />
            Loading...
          </div>
        </div>
      ) : !status || status.files.length === 0 ? (
        <div className="flex-1 flex items-center justify-center px-6">
          <div className="text-center">
            <svg className="w-8 h-8 mx-auto mb-2 text-success" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
            <p className="text-xs text-text-muted">No changes</p>
            <p className="text-[10px] text-text-dim mt-0.5">Working tree is clean</p>
          </div>
        </div>
      ) : (
        <div className="flex-1 overflow-y-auto">
          {staged.length > 0 && (
            <div className="px-3 py-1 text-[10px] text-text-dim uppercase tracking-wider font-semibold">Staged</div>
          )}
          {staged.map((f) => (
            <FileRow key={`staged-${f.path}`} file={f} onAction={() => handleUnstage(f.path)} actionIcon="-" actionTitle="Unstage" statusDot="text-accent-light" onOpen={() => handleOpenFile(f.path)} onDiff={() => handleShowDiff(f.path)} />
          ))}
          {unstaged.length > 0 && (
            <div className="px-3 py-1 text-[10px] text-text-dim uppercase tracking-wider font-semibold">Changes</div>
          )}
          {unstaged.map((f) => (
            <FileRow key={`unstaged-${f.path}`} file={f} onAction={() => handleStage(f.path)} actionIcon="+" actionTitle="Stage" statusDot="text-warning" onOpen={() => handleOpenFile(f.path)} onDiff={() => handleShowDiff(f.path)} />
          ))}
        </div>
      )}
    </div>
  )
}

function FileRow({ file, onAction, actionIcon, actionTitle, statusDot, onOpen, onDiff }: {
  file: { path: string; status: string }
  onAction: () => void
  actionIcon: string
  actionTitle: string
  statusDot: string
  onOpen: () => void
  onDiff: () => void
}) {
  const statusLabel =
    file.status === "untracked" ? "U" :
    file.status === "deleted" ? "D" :
    file.status === "added" ? "A" :
    file.status === "renamed" ? "R" : "M"

  return (
    <div className="flex items-center gap-1 px-2 py-0.5 hover:bg-white/5 group">
      <span className={`w-4 h-4 flex items-center justify-center rounded-full text-[8px] font-bold ${statusDot} bg-current/10`}>{statusLabel}</span>
      <button onClick={onOpen} className="flex-1 text-left text-xs text-[var(--text)] truncate ml-1 hover:underline">
        {file.path}
      </button>
      <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
        <button onClick={onDiff} className="w-5 h-5 flex items-center justify-center rounded text-text-muted hover:text-[var(--text)] hover:bg-white/10 transition-colors" title="Diff">
          <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
        </button>
        <button onClick={onAction} className="w-5 h-5 flex items-center justify-center rounded text-text-muted hover:text-[var(--text)] hover:bg-white/10 transition-colors" title={actionTitle}>
          {actionIcon}
        </button>
      </div>
    </div>
  )
}
