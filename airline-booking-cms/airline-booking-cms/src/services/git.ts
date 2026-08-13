export interface GitFile {
  path: string
  status: "modified" | "added" | "deleted" | "untracked" | "renamed"
}

export interface GitStatus {
  branch: string
  files: GitFile[]
}

export interface GitCommit {
  hash: string
  message: string
  author: string
  date: string
}

function api() {
  return (window as any).electronAPI
}

export async function getStatus(rootPath: string): Promise<GitStatus> {
  const ea = api()
  if (!ea?.isElectron) return { branch: "", files: [] }
  return ea.gitStatus(rootPath)
}

export async function stageFile(rootPath: string, filePath: string): Promise<void> {
  const ea = api()
  if (ea?.gitAdd) await ea.gitAdd(filePath, rootPath)
}

export async function unstageFile(rootPath: string, filePath: string): Promise<void> {
  const ea = api()
  if (ea?.gitReset) await ea.gitReset(filePath, rootPath)
}

export async function commit(rootPath: string, message: string): Promise<void> {
  const ea = api()
  if (ea?.gitCommit) await ea.gitCommit(message, rootPath)
}

export async function getLog(rootPath: string, maxCount = 10): Promise<GitCommit[]> {
  const ea = api()
  if (ea?.gitLog) return ea.gitLog(maxCount, rootPath)
  return []
}

export async function getDiff(rootPath: string, filePath: string): Promise<string> {
  const ea = api()
  if (ea?.gitDiff) return ea.gitDiff(filePath, rootPath)
  return ""
}
