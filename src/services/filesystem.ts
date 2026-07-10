import { invoke } from "@tauri-apps/api/core"

export interface FileEntry {
  name: string
  path: string
  is_dir: boolean
  size: number
}

export async function readFile(path: string): Promise<string> {
  return invoke<string>("read_file", { path })
}

export async function writeFile(path: string, content: string): Promise<void> {
  return invoke("write_file", { path, content })
}

export async function listDirectory(path: string): Promise<FileEntry[]> {
  return invoke<FileEntry[]>("list_directory", { path })
}

export async function createFile(path: string): Promise<void> {
  return invoke("create_file", { path })
}

export async function deleteFile(path: string): Promise<void> {
  return invoke("delete_file", { path })
}

export async function renameFile(oldPath: string, newPath: string): Promise<void> {
  return invoke("rename_file", { oldPath, newPath })
}
