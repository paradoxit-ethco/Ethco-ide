import { useEffect, useRef } from "react"

interface ContextMenuProps {
  x: number
  y: number
  items: { label: string; action: () => void; disabled?: boolean }[]
  onClose: () => void
}

export function ContextMenu({ x, y, items, onClose }: ContextMenuProps) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        onClose()
      }
    }
    document.addEventListener("mousedown", handleClick)
    return () => document.removeEventListener("mousedown", handleClick)
  }, [onClose])

  return (
    <div
      ref={ref}
      className="fixed z-50 min-w-[160px] bg-surface-alt border border-[var(--border)] rounded-md shadow-xl py-1"
      style={{ left: x, top: y }}
    >
      {items.map((item, i) => (
        <button
          key={i}
          className="w-full text-left px-3 py-1.5 text-xs hover:bg-accent/20 disabled:opacity-40 disabled:cursor-not-allowed"
          disabled={item.disabled}
          onClick={() => {
            item.action()
            onClose()
          }}
        >
          {item.label}
        </button>
      ))}
    </div>
  )
}
