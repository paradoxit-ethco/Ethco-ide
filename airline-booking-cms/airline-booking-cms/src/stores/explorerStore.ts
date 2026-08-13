import { create } from "zustand"

export interface FileNode {
  name: string
  path: string
  isDir: boolean
  size: number
  children?: FileNode[]
  expanded?: boolean
}

interface ExplorerState {
  root: string | null
  tree: FileNode[]
  loading: boolean
  refreshCounter: number
  triggerRefresh: () => void
  setRoot: (path: string) => void
  setTree: (nodes: FileNode[]) => void
  toggleExpand: (path: string) => void
  setLoading: (v: boolean) => void
}

export const useExplorerStore = create<ExplorerState>((set) => ({
  root: null,
  tree: [],
  loading: false,
  refreshCounter: 0,

  triggerRefresh: () => set((s) => ({ refreshCounter: s.refreshCounter + 1 })),

  setRoot: (path: string) => set({ root: path }),

  setTree: (nodes: FileNode[]) => set({ tree: nodes }),

  toggleExpand: (path: string) => {
    set((s) => ({
      tree: s.tree.map((n) => expandNode(n, path)),
    }))
  },

  setLoading: (v: boolean) => set({ loading: v }),
}))

function expandNode(node: FileNode, targetPath: string): FileNode {
  if (node.path === targetPath) {
    return { ...node, expanded: !node.expanded }
  }
  if (node.children) {
    return { ...node, children: node.children.map((c) => expandNode(c, targetPath)) }
  }
  return node
}
