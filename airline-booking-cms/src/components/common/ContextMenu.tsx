import { useEffect, useRef } from "react"

export interface ContextMenuItem {
  label?: string
  shortcut?: string
  action?: () => void
  type?: "separator"
  disabled?: boolean
}

interface ContextMenuProps {
  x: number
  y: number
  items: ContextMenuItem[]
  onClose: () => void
}

export function ContextMenu({ x, y, items, onClose }: ContextMenuProps) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    const rect = el.getBoundingClientRect()
    const maxX = window.innerWidth - rect.width - 8
    const maxY = window.innerHeight - rect.height - 8
    if (rect.left > maxX) el.style.left = `${maxX}px`
    if (rect.top > maxY) el.style.top = `${maxY}px`

    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose()
    }
    document.addEventListener("keydown", handleKey)
    return () => document.removeEventListener("keydown", handleKey)
  }, [onClose])

  function handleItemClick(item: ContextMenuItem) {
    if (item.disabled || item.type === "separator") return
    item.action?.()
    onClose()
  }

  return (
    <div
      ref={ref}
      className="fixed z-[100] min-w-[180px] bg-surface-alt border border-[var(--border)] rounded-lg shadow-xl py-1 animate-fade-in"
      style={{ left: x, top: y }}
      onClick={(e) => e.stopPropagation()}
    >
      {(items ?? []).map((item, i) => {
        if (item.type === "separator") {
          return <div key={i} className="h-px bg-[var(--border)] my-1 mx-2" />
        }
        return (
          <div
            key={i}
            className={`flex items-center justify-between px-3 py-1.5 text-xs cursor-pointer mx-1 rounded-md transition-colors ${
              item.disabled
                ? "text-text-dim cursor-not-allowed"
                : "text-[var(--text)] hover:bg-accent/20"
            }`}
            onClick={() => handleItemClick(item)}
          >
            <span>{item.label}</span>
            {item.shortcut && (
              <kbd className="ml-6 text-[10px] text-text-muted font-mono">{item.shortcut}</kbd>
            )}
          </div>
        )
      })}
    </div>
  )
}
