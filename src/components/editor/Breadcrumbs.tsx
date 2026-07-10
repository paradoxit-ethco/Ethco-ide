interface BreadcrumbsProps {
  path: string | null
}

export function Breadcrumbs({ path }: BreadcrumbsProps) {
  if (!path) return null

  const parts = path.replace(/\\/g, "/").split("/").filter(Boolean)
  const fileName = parts.pop() || ""

  return (
    <div className="flex items-center h-[22px] px-3 text-[11px] text-text-muted bg-[#1e1e2e] border-b border-[#313244] overflow-x-auto">
      {parts.length > 0 && (
        <span className="flex items-center">
          {parts.map((part, i) => (
            <span key={i} className="flex items-center">
              {i > 0 && <span className="mx-1 opacity-50">/</span>}
              <button className="hover:text-[var(--text)] transition-colors whitespace-nowrap">{part}</button>
            </span>
          ))}
          <span className="mx-1 opacity-50">/</span>
        </span>
      )}
      <span className="text-[var(--text)] whitespace-nowrap">{fileName}</span>
    </div>
  )
}
