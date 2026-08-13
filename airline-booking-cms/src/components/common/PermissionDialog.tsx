interface PermissionDialogProps {
  open: boolean
  toolName: string
  description: string
  onAllow: () => void
  onDeny: () => void
  onAlwaysAllow: () => void
}

export function PermissionDialog({
  open,
  toolName,
  description,
  onAllow,
  onDeny,
  onAlwaysAllow,
}: PermissionDialogProps) {
  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-surface-alt border border-[var(--border)] rounded-lg shadow-2xl w-[400px]">
        <div className="px-4 py-3 border-b border-[var(--border)]">
          <h3 className="text-sm font-medium text-[var(--text)]">
            Permission Request
          </h3>
        </div>
        <div className="px-4 py-3 space-y-2">
          <div className="text-xs text-text-muted">
            <span className="text-accent-light font-mono">{toolName}</span> wants to:
          </div>
          <p className="text-sm text-[var(--text)]">{description}</p>
        </div>
        <div className="px-4 py-3 border-t border-[var(--border)] flex justify-end gap-2">
          <button
            onClick={onDeny}
            className="px-3 py-1.5 text-xs rounded border border-[var(--border)] text-text-muted hover:text-[var(--text)] hover:bg-white/5 transition-colors"
          >
            Deny
          </button>
          <button
            onClick={onAlwaysAllow}
            className="px-3 py-1.5 text-xs rounded bg-accent/20 text-accent-light hover:bg-accent/30 transition-colors"
          >
            Always Allow
          </button>
          <button
            onClick={onAllow}
            className="px-3 py-1.5 text-xs rounded bg-accent text-white hover:bg-accent-dark transition-colors"
          >
            Allow
          </button>
        </div>
      </div>
    </div>
  )
}
