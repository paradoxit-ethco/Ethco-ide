export interface FileEntry {
  name: string
  path: string
  isDir: boolean
  size: number
}

export interface FSProvider {
  readFile(path: string): Promise<string>
  writeFile(path: string, content: string): Promise<void>
  listDirectory(path: string): Promise<FileEntry[]>
  createFile(path: string): Promise<void>
  createDirectory(path: string): Promise<void>
  delete(path: string): Promise<void>
  rename(oldPath: string, newPath: string): Promise<void>
  exists(path: string): Promise<boolean>
  getProjectRoot(): string | null
  setProjectRoot(path: string): void
}

export class BrowserFS implements FSProvider {
  private root: string | null = null
  private store = new Map<string, string>()

  constructor() {
    this.loadFromStorage()
  }

  private loadFromStorage() {
    try {
      const data = localStorage.getItem("ethco-browser-fs")
      if (data) {
        const parsed = JSON.parse(data)
        if (parsed.root) this.root = parsed.root
        if (parsed.files) {
          this.store = new Map(Object.entries(parsed.files))
        }
      }
    } catch { /* ignore corrupt data */ }
  }

  private persist() {
    try {
      localStorage.setItem("ethco-browser-fs", JSON.stringify({
        root: this.root,
        files: Object.fromEntries(this.store.entries()),
      }))
    } catch {
      console.warn("Failed to persist filesystem state")
    }
  }

  private normalizePath(path: string): string {
    return path.replace(/\\/g, "/").replace(/\/+/g, "/")
  }

  async readFile(path: string): Promise<string> {
    const key = this.normalizePath(path)
    const content = this.store.get(key)
    if (content === undefined) throw new Error(`File not found: ${path}`)
    return content
  }

  async writeFile(path: string, content: string): Promise<void> {
    const key = this.normalizePath(path)
    this.store.set(key, content)
    this.persist()
  }

  async listDirectory(path: string): Promise<FileEntry[]> {
    const normalized = this.normalizePath(path)
    const prefix = normalized === "/" ? "" : normalized
    const entries = new Map<string, FileEntry>()

    for (const key of this.store.keys()) {
      if (!key.startsWith(prefix + "/") && key !== prefix) continue
      const relative = key.slice(prefix.length).replace(/^\//, "")
      const parts = relative.split("/")
      if (!parts[0]) continue

      if (parts.length === 1) {
        if (!entries.has(key)) {
          entries.set(key, {
            name: parts[0],
            path: key,
            isDir: false,
            size: this.store.get(key)?.length ?? 0,
          })
        }
      } else {
        const dirPath = prefix ? `${prefix}/${parts[0]}` : parts[0]
        if (!entries.has(dirPath)) {
          entries.set(dirPath, {
            name: parts[0],
            path: dirPath,
            isDir: true,
            size: 0,
          })
        }
      }
    }

    return Array.from(entries.values()).sort((a, b) => {
      if (a.isDir !== b.isDir) return a.isDir ? -1 : 1
      return a.name.localeCompare(b.name)
    })
  }

  async createFile(path: string): Promise<void> {
    const key = this.normalizePath(path)
    if (this.store.has(key)) throw new Error(`File exists: ${path}`)
    this.store.set(key, "")
    this.persist()
  }

  async createDirectory(_path: string): Promise<void> {
    this.persist()
  }

  async delete(path: string): Promise<void> {
    const normalized = this.normalizePath(path)
    const toDelete: string[] = []
    for (const key of this.store.keys()) {
      if (key === normalized || key.startsWith(normalized + "/")) {
        toDelete.push(key)
      }
    }
    for (const key of toDelete) {
      this.store.delete(key)
    }
    this.persist()
  }

  async rename(oldPath: string, newPath: string): Promise<void> {
    const oldNorm = this.normalizePath(oldPath)
    const newNorm = this.normalizePath(newPath)

    const toRename: [string, string][] = []
    for (const key of this.store.keys()) {
      if (key === oldNorm) {
        toRename.push([key, newNorm])
      } else if (key.startsWith(oldNorm + "/")) {
        toRename.push([key, newNorm + key.slice(oldNorm.length)])
      }
    }
    for (const [old, nw] of toRename) {
      this.store.set(nw, this.store.get(old)!)
      this.store.delete(old)
    }
    this.persist()
  }

  async exists(path: string): Promise<boolean> {
    const normalized = this.normalizePath(path)
    if (this.store.has(normalized)) return true
    for (const key of this.store.keys()) {
      if (key.startsWith(normalized + "/")) return true
    }
    return false
  }

  getProjectRoot(): string | null {
    return this.root
  }

  setProjectRoot(path: string) {
    this.root = path
    this.persist()
  }
}

export class ElectronFS implements FSProvider {
  private root: string | null = null

  private get api() {
    return (window as any).electronAPI
  }

  async readFile(path: string): Promise<string> {
    return this.api.readFile(path)
  }

  async writeFile(path: string, content: string): Promise<void> {
    return this.api.writeFile(path, content)
  }

  async listDirectory(path: string): Promise<FileEntry[]> {
    const entries = await this.api.readDir(path)
    return entries.map((e: any) => ({
      name: e.name,
      path: this.normalize(`${path}/${e.name}`),
      isDir: e.isDirectory,
      size: 0,
    }))
  }

  async createFile(path: string): Promise<void> {
    await this.api.writeFile(path, "")
  }

  async createDirectory(path: string): Promise<void> {
    await this.api.createDir(path)
  }

  async delete(path: string): Promise<void> {
    await this.api.delete(path)
  }

  async rename(oldPath: string, newPath: string): Promise<void> {
    await this.api.rename(oldPath, newPath)
  }

  async exists(path: string): Promise<boolean> {
    return this.api.exists(path)
  }

  getProjectRoot(): string | null {
    return this.root
  }

  setProjectRoot(path: string) {
    this.root = path
  }

  private normalize(p: string): string {
    return p.replace(/\\/g, "/")
  }
}

export class TauriFS implements FSProvider {
  private root: string | null = null

  async readFile(path: string): Promise<string> {
    const { invoke } = await import("@tauri-apps/api/core")
    return invoke<string>("read_file", { path })
  }

  async writeFile(path: string, content: string): Promise<void> {
    const { invoke } = await import("@tauri-apps/api/core")
    return invoke("write_file", { path, content })
  }

  async listDirectory(path: string): Promise<FileEntry[]> {
    const { invoke } = await import("@tauri-apps/api/core")
    return invoke<FileEntry[]>("list_directory", { path })
  }

  async createFile(path: string): Promise<void> {
    const { invoke } = await import("@tauri-apps/api/core")
    return invoke("create_file", { path })
  }

  async createDirectory(path: string): Promise<void> {
    const { invoke } = await import("@tauri-apps/api/core")
    return invoke("create_file", { path })
  }

  async delete(path: string): Promise<void> {
    const { invoke } = await import("@tauri-apps/api/core")
    return invoke("delete_file", { path })
  }

  async rename(oldPath: string, newPath: string): Promise<void> {
    const { invoke } = await import("@tauri-apps/api/core")
    return invoke("rename_file", { oldPath, newPath })
  }

  async exists(path: string): Promise<boolean> {
    try {
      await this.readFile(path)
      return true
    } catch {
      return false
    }
  }

  getProjectRoot(): string | null {
    return this.root
  }

  setProjectRoot(path: string) {
    this.root = path
  }
}

let _instance: FSProvider | null = null

export function getFS(): FSProvider {
  if (!_instance) {
    const win = window as any
    if (win.electronAPI?.isElectron) {
      _instance = new ElectronFS()
    } else if (win.__TAURI_INTERNALS__) {
      _instance = new TauriFS()
    } else {
      _instance = new BrowserFS()
    }
  }
  return _instance
}

export function resetFS() {
  _instance = null
}
