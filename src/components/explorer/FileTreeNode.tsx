import { useState } from "react"
import { type FileNode } from "../../stores/explorerStore"
import { getFS } from "../../services/fs-provider"

interface FileTreeNodeProps {
  node: FileNode
  onSelect: (node: FileNode) => void
  onContextMenu: (e: React.MouseEvent, node: FileNode) => void
  depth: number
}

export function FileTreeNode({ node, onSelect, onContextMenu, depth }: FileTreeNodeProps) {
  const [expanded, setExpanded] = useState(node.expanded)
  const [children, setChildren] = useState<FileNode[] | null>(null)
  const [loading, setLoading] = useState(false)

  async function handleClick(_e: React.MouseEvent) {
    if (node.isDir) {
      if (!expanded && !children) {
        setLoading(true)
        try {
          const fs = getFS()
          const entries = await fs.listDirectory(node.path)
          setChildren(
            entries.map((e) => ({
              name: e.name,
              path: e.path,
              isDir: e.isDir,
              size: e.size,
              expanded: false,
            }))
          )
        } catch (e) {
          console.error(e)
        } finally {
          setLoading(false)
        }
      }
      setExpanded(!expanded)
    }
    onSelect(node)
  }

  function handleContext(e: React.MouseEvent) {
    e.preventDefault()
    e.stopPropagation()
    onContextMenu(e, node)
  }

  const indentation = depth * 16

  return (
    <div>
      <div
        className="flex items-center gap-0.5 py-[3px] cursor-pointer hover:bg-white/5 text-xs group relative"
        style={{ paddingLeft: `${indentation}px` }}
        onClick={handleClick}
        onContextMenu={handleContext}
        title={node.path}
      >
        {depth > 0 && (
          <div className="absolute left-[7px] top-0 w-px h-full bg-[var(--border)] opacity-30" style={{ left: `${indentation - 8}px` }} />
        )}
        {node.isDir ? (
          <span className="w-4 flex items-center justify-center text-[9px] text-text-muted shrink-0">
            {loading ? (
              <svg className="w-3 h-3 animate-spin" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10" strokeDasharray="31.4 31.4" />
              </svg>
            ) : (
              <svg className={`w-3.5 h-3.5 transition-transform ${expanded ? "rotate-90" : ""}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="9 18 15 12 9 6" />
              </svg>
            )}
          </span>
        ) : (
          <span className="w-4 shrink-0" />
        )}
        <span className="w-4 flex items-center justify-center shrink-0 text-[11px]">
          {node.isDir ? (
            expanded
              ? <svg className="w-3.5 h-3.5 text-accent-light" viewBox="0 0 24 24" fill="currentColor"><path d="M2 6a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2v1H2V6z"/><path d="M2 10h20v8a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2v-8z"/></svg>
              : <svg className="w-3.5 h-3.5 text-text-muted" viewBox="0 0 24 24" fill="currentColor"><path d="M2 6a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2v1H2V6z"/><path d="M2 10h20v8a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2v-8z"/></svg>
          ) : (
            <FileIcon name={node.name} />
          )}
        </span>
        <span className="truncate flex-1 ml-0.5">{node.name}</span>
        {node.isDir && node.size > 0 && (
          <span className="text-[9px] text-text-dim mr-1 opacity-0 group-hover:opacity-60 transition-opacity">
            {node.size}
          </span>
        )}
      </div>
      {expanded && children?.map((child) => (
        <FileTreeNode
          key={child.path}
          node={child}
          onSelect={onSelect}
          onContextMenu={onContextMenu}
          depth={depth + 1}
        />
      ))}
      {loading && (
        <div className="text-xs text-text-dim px-2 py-0.5" style={{ paddingLeft: `${indentation + 20}px` }}>
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 rounded-full bg-accent/30 animate-pulse" />
            <span>Loading...</span>
          </div>
        </div>
      )}
    </div>
  )
}

function FileIcon({ name }: { name: string }) {
  const ext = name.split(".").pop()?.toLowerCase()
  const color = getIconColor(ext)
  return (
    <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6z"/>
      <polyline points="14 2 14 8 20 8"/>
    </svg>
  )
}

function getIconColor(ext?: string): string {
  const colors: Record<string, string> = {
    ts: "#3178c6", tsx: "#3178c6", js: "#f7df1e", jsx: "#f7df1e",
    rs: "#dea584", py: "#3572a5", go: "#00add8", java: "#b07219",
    json: "#89b4fa", md: "#cdd6f4", css: "#519aba", scss: "#c6538c",
    html: "#e34f26", yaml: "#6c7086", toml: "#6c7086", sql: "#e38c00",
    vue: "#42b883", svelte: "#ff3e00", lock: "#f38ba8",
    gitignore: "#6c7086", env: "#f9e2af",
  }
  return colors[ext ?? ""] || "var(--text-muted)"
}
