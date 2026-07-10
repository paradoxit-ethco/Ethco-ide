const { contextBridge, ipcRenderer } = require("electron")

contextBridge.exposeInMainWorld("electronAPI", {
  platform: process.platform,
  isElectron: true,
  selectDirectory: () => ipcRenderer.invoke("dialog:openDirectory"),
  readDir: (dirPath) => ipcRenderer.invoke("fs:readDir", dirPath),
  readFile: (filePath) => ipcRenderer.invoke("fs:readFile", filePath),
  writeFile: (filePath, content) => ipcRenderer.invoke("fs:writeFile", filePath, content),
  delete: (filePath) => ipcRenderer.invoke("fs:delete", filePath),
  rename: (oldPath, newPath) => ipcRenderer.invoke("fs:rename", oldPath, newPath),
  exists: (filePath) => ipcRenderer.invoke("fs:exists", filePath),
  createDir: (dirPath) => ipcRenderer.invoke("fs:createDir", dirPath),
  git: (args, cwd) => ipcRenderer.invoke("git:exec", args, cwd),
  gitStatus: (cwd) => ipcRenderer.invoke("git:status", cwd),
  gitAdd: (filePath, cwd) => ipcRenderer.invoke("git:add", filePath, cwd),
  gitReset: (filePath, cwd) => ipcRenderer.invoke("git:reset", filePath, cwd),
  gitCommit: (message, cwd) => ipcRenderer.invoke("git:commit", message, cwd),
  gitLog: (maxCount, cwd) => ipcRenderer.invoke("git:log", maxCount, cwd),
  gitDiff: (filePath, cwd) => ipcRenderer.invoke("git:diff", filePath, cwd),
  ptySpawn: (id, cwd, cols, rows, shell) => ipcRenderer.invoke("pty:spawn", id, cwd, cols, rows, shell),
  ptyWrite: (id, data) => ipcRenderer.invoke("pty:write", id, data),
  ptyResize: (id, cols, rows) => ipcRenderer.invoke("pty:resize", id, cols, rows),
  ptyKill: (id) => ipcRenderer.invoke("pty:kill", id),
  setProxy: (rules) => ipcRenderer.invoke("network:setProxy", rules),
  onPtyData: (callback) => {
    const handler = (_event, id, data) => callback(id, data)
    ipcRenderer.on("pty:data", handler)
    return () => ipcRenderer.removeListener("pty:data", handler)
  },
  onPtyExit: (callback) => {
    const handler = (_event, id, code) => callback(id, code)
    ipcRenderer.on("pty:exit", handler)
    return () => ipcRenderer.removeListener("pty:exit", handler)
  },
})
