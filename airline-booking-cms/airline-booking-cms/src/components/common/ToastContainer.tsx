import React from "react"
import { useToastStore } from "../../stores/toastStore"

const typeStyles: Record<string, string> = {
  info: "bg-accent/15 text-info border-info/30",
  success: "bg-green-900/20 text-success border-success/30",
  error: "bg-red-900/20 text-error border-error/30",
  warning: "bg-yellow-900/20 text-warning border-warning/30",
}

function IconInfo() {
  return (
    <svg className="w-3.5 h-3.5 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" /><line x1="12" y1="16" x2="12" y2="12" /><line x1="12" y1="8" x2="12.01" y2="8" />
    </svg>
  )
}

function IconSuccess() {
  return (
    <svg className="w-3.5 h-3.5 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" />
    </svg>
  )
}

function IconError() {
  return (
    <svg className="w-3.5 h-3.5 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" /><line x1="15" y1="9" x2="9" y2="15" /><line x1="9" y1="9" x2="15" y2="15" />
    </svg>
  )
}

function IconWarning() {
  return (
    <svg className="w-3.5 h-3.5 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" /><line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" />
    </svg>
  )
}

const icons: Record<string, () => React.ReactElement> = {
  info: IconInfo,
  success: IconSuccess,
  error: IconError,
  warning: IconWarning,
}

export function ToastContainer() {
  const toasts = useToastStore((s) => s.toasts)
  const removeToast = useToastStore((s) => s.removeToast)

  if (toasts.length === 0) return null

  return (
    <div className="fixed bottom-8 right-4 z-[200] flex flex-col gap-2 pointer-events-none">
      {toasts.map((toast) => {
        const Icon = icons[toast.type] || icons.info
        return (
          <div
            key={toast.id}
            className={`pointer-events-auto flex items-center gap-2 px-3 py-2 rounded-lg border text-xs shadow-xl backdrop-blur-sm animate-slide-in-right cursor-pointer transition-opacity hover:opacity-80 ${typeStyles[toast.type] || typeStyles.info}`}
            onClick={() => removeToast(toast.id)}
          >
            <Icon />
            <span>{toast.message}</span>
          </div>
        )
      })}
    </div>
  )
}
