import { useCallback, useEffect, useState, useRef } from "react"
import { FileTreeNode } from "./FileTreeNode"
import { useExplorerStore, type FileNode } from "../../stores/explorerStore"
import { useEditorStore } from "../../stores/editorStore"
import { useSettingsStore } from "../../stores/settingsStore"
import { getFS } from "../../services/fs-provider"
import { ContextMenu, type ContextMenuItem } from "../common/ContextMenu"

interface FileTreeProps {
  rootPath: string
}

export function FileTree({ rootPath }: FileTreeProps) {
  const { tree, setTree, setRoot, loading, setLoading, refreshCounter, triggerRefresh } = useExplorerStore()
  const { openFile } = useEditorStore()
  const sidebarWidth = useSettingsStore((s) => s.sidebarWidth)
  const setSidebarWidth = useSettingsStore((s) => s.setSidebarWidth)
  const [contextMenu, setContextMenu] = useState<{
    x: number; y: number; items: ContextMenuItem[]
  } | null>(null)
  const treeRef = useRef<HTMLDivElement>(null)
  const resizingRef = useRef(false)

  useEffect(() => {
    function handleClick() { setContextMenu(null) }
    document.addEventListener("click", handleClick)
    return () => document.removeEventListener("click", handleClick)
  }, [])

  const loadTree = useCallback(async (path: string) => {
    setLoading(true)
    try {
      const fs = getFS()
      const entries = await fs.listDirectory(path)
      const nodes: FileNode[] = entries.map((e) => ({
        name: e.name,
        path: e.path,
        isDir: e.isDir,
        size: e.size,
        children: undefined,
        expanded: false,
      }))
      setRoot(path)
      setTree(nodes)
    } catch (e) {
      console.error("Failed to load directory:", e)
    } finally {
      setLoading(false)
    }
  }, [setTree, setRoot, setLoading])

  useEffect(() => {
    loadTree(rootPath)
  }, [rootPath, refreshCounter, loadTree])

  async function handleNodeClick(node: FileNode) {
    if (!node.isDir) {
      try {
        const fs = getFS()
        const content = await fs.readFile(node.path)
        openFile(node.path, content)
      } catch (e) {
        console.error("Failed to read file:", e)
      }
    }
  }

  function handleResizeStart(e: React.MouseEvent) {
    e.preventDefault()
    resizingRef.current = true
    const startX = e.clientX
    const startWidth = sidebarWidth

    function onMouseMove(e: MouseEvent) {
      const delta = e.clientX - startX
      setSidebarWidth(Math.max(140, Math.min(400, startWidth + delta)))
    }

    function onMouseUp() {
      resizingRef.current = false
      document.removeEventListener("mousemove", onMouseMove)
      document.removeEventListener("mouseup", onMouseUp)
    }

    document.addEventListener("mousemove", onMouseMove)
    document.addEventListener("mouseup", onMouseUp)
  }

  async function handleContextMenu(e: React.MouseEvent, node?: FileNode) {
    e.preventDefault()
    e.stopPropagation()
    const x = e.clientX
    const y = e.clientY

    const getDir = (n: FileNode) =>
      n.isDir ? n.path : n.path.split("/").slice(0, -1).join("/") || n.path

    const items: ContextMenuItem[] = (() => {
      if (!node) {
        return [
          { label: "New File", action: async () => {
            const name = prompt("File name:")
            if (!name) return
            await getFS().createFile(`${rootPath}/${name}`)
            triggerRefresh()
          }},
          { label: "New Folder", action: async () => {
            const name = prompt("Folder name:")
            if (!name) return
            await getFS().createDirectory(`${rootPath}/${name}`)
            triggerRefresh()
          }},
        ]
      }
      return [
        { label: "New File", action: async () => {
          const name = prompt("File name:")
          if (!name) return
          await getFS().createFile(`${getDir(node)}/${name}`)
          triggerRefresh()
        }},
        { label: "New Folder", action: async () => {
          const name = prompt("Folder name:")
          if (!name) return
          await getFS().createDirectory(`${getDir(node)}/${name}`)
          triggerRefresh()
        }},
        { type: "separator" as const },
        { label: "Rename", action: async () => {
          const name = prompt("New name:", node.name)
          if (!name || name === node.name) return
          const parent = node.path.split("/").slice(0, -1).join("/")
          await getFS().rename(node.path, `${parent}/${name}`)
          triggerRefresh()
        }},
        { label: "Delete", action: async () => {
          if (!confirm(`Delete ${node.name}?`)) return
          await getFS().delete(node.path)
          triggerRefresh()
        }},
      ]
    })()

    setContextMenu({ x, y, items })
  }

  return (
    <div
      ref={treeRef}
      className="bg-surface-alt border-r border-[var(--border)] flex flex-col select-none relative"
      style={{ width: sidebarWidth, minWidth: 140 }}
      onContextMenu={(e) => handleContextMenu(e, undefined)}
    >
      <div className="px-3 py-1.5 text-xs font-semibold text-text-muted uppercase tracking-wider">
        Explorer
      </div>
      <div className="flex-1 overflow-y-auto py-1">
        {loading ? (
          <div className="px-3 py-1 text-xs text-text-muted animate-pulse">Loading...</div>
        ) : tree.length === 0 ? (
          <div className="px-3 py-1 text-xs text-text-muted italic">Empty folder</div>
        ) : (
          tree.map((node) => (
            <FileTreeNode
              key={node.path}
              node={node}
              onSelect={handleNodeClick}
              onContextMenu={(e, n) => handleContextMenu(e, n)}
              depth={0}
            />
          ))
        )}
      </div>
      <div
        className="absolute top-0 right-0 w-1 h-full cursor-col-resize hover:bg-accent/50 transition-colors z-10"
        onMouseDown={handleResizeStart}
      />
      {contextMenu && (
        <ContextMenu
          x={contextMenu.x}
          y={contextMenu.y}
          items={contextMenu.items}
          onClose={() => setContextMenu(null)}
        />
      )}
    </div>
  )
}
