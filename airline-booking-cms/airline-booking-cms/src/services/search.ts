import { getFS } from "./fs-provider"

export interface SearchResult {
  path: string
  name: string
  matches: { line: number; text: string }[]
}

export async function searchFiles(root: string, query: string): Promise<string[]> {
  if (!query.trim()) return []
  const fs = getFS()
  const results: string[] = []
  const q = query.toLowerCase()

  async function walk(dir: string) {
    const entries = await fs.listDirectory(dir)
    for (const entry of entries) {
      if (entry.name.startsWith(".") || entry.name === "node_modules") continue
      if (entry.isDir) {
        await walk(entry.path)
      } else if (entry.name.toLowerCase().includes(q)) {
        results.push(entry.path)
      }
    }
  }

  await walk(root)
  return results.slice(0, 50)
}

export async function searchInFiles(root: string, query: string, maxResults = 20): Promise<SearchResult[]> {
  if (!query.trim()) return []
  const fs = getFS()
  const results: SearchResult[] = []
  const q = query.toLowerCase()

  async function walk(dir: string) {
    if (results.length >= maxResults) return
    const entries = await fs.listDirectory(dir)
    for (const entry of entries) {
      if (results.length >= maxResults) return
      if (entry.name.startsWith(".") || entry.name === "node_modules") continue
      if (entry.isDir) {
        await walk(entry.path)
      } else {
        try {
          const content = await fs.readFile(entry.path)
          const lines = content.split("\n")
          const matches = lines
            .map((text, i) => ({ line: i + 1, text: text.trim() }))
            .filter((m) => m.text.toLowerCase().includes(q))
            .slice(0, 5)
          if (matches.length > 0) {
            results.push({ path: entry.path, name: entry.name, matches })
          }
        } catch { /* skip unreadable */ }
      }
    }
  }

  await walk(root)
  return results
}
