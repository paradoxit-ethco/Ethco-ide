import { invoke } from "@tauri-apps/api/core"

export interface PtyInfo {
  id: string
  cols: number
  rows: number
}

export async function createPty(): Promise<PtyInfo> {
  return invoke<PtyInfo>("create_pty")
}

export async function writePty(input: string): Promise<void> {
  return invoke("write_pty", { input })
}

export async function resizePty(cols: number, rows: number): Promise<void> {
  return invoke("resize_pty", { cols, rows })
}
