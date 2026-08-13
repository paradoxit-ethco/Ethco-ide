interface BreadcrumbsProps {
  path: string | null
}

export function Breadcrumbs({ path }: BreadcrumbsProps) {
  if (!path) return null

  const parts = path.replace(/\\/g, "/").split("/").filter(Boolean)
  const fileName = parts.pop() || ""

  // Keep last 3 folder parts for readability if very long
  const displayedFolders = parts.slice(-3)

  return (
    <div className="flex items-center h-[26px] px-4 text-[11px] text-text-muted bg-[var(--surface)] border-b border-[var(--border)] overflow-x-auto select-none shrink-0 gap-1 scrollbar-none">
      {displayedFolders.length > 0 && (
        <span className="flex items-center gap-1">
          {displayedFolders.map((part, i) => (
            <span key={i} className="flex items-center gap-1">
              {i > 0 && (
                <svg className="w-2.5 h-2.5 opacity-60 text-text-dim shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="9 18 15 12 9 6" /></svg>
              )}
              <span className="flex items-center gap-1 font-normal hover:text-[var(--text)] cursor-pointer transition-colors duration-75 whitespace-nowrap">
                <svg className="w-3.5 h-3.5 text-text-muted opacity-80 shrink-0" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M10 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2h-8l-2-2z" />
                </svg>
                {part}
              </span>
            </span>
          ))}
          <svg className="w-2.5 h-2.5 opacity-60 text-text-dim shrink-0 mx-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="9 18 15 12 9 6" /></svg>
        </span>
      )}
      <span className="flex items-center gap-1.5 text-[var(--text)] font-medium whitespace-nowrap">
        <BreadcrumbFileIcon name={fileName} />
        {fileName}
      </span>
    </div>
  )
}

function BreadcrumbFileIcon({ name }: { name: string }) {
  const ext = name.split(".").pop()?.toLowerCase()
  const colorMap: Record<string, string> = {
    ts: "#3178c6", tsx: "#3178c6", js: "#f7df1e", jsx: "#f7df1e",
    rs: "#dea584", py: "#3572a5", go: "#00add8", json: "#89b4fa",
    md: "#cdd6f4", css: "#519aba", html: "#e34f26", yaml: "#6c7086",
    toml: "#6c7086",
  }
  const color = colorMap[ext ?? ""] || "var(--text-muted)"

  return (
    <svg className="w-3.5 h-3.5 shrink-0" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6z" />
      <polyline points="14 2 14 8 20 8" />
    </svg>
  )
}
