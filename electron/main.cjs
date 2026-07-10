const { app, BrowserWindow, ipcMain, dialog } = require("electron")
const path = require("path")
const http = require("http")
const fs = require("fs")
const { execSync, spawn } = require("child_process")

const DEV_SERVER = process.env.VITE_DEV_SERVER_URL || "http://localhost:5175"
let mainWindow = null

function isServerRunning(url) {
  return new Promise((resolve) => {
    const req = http.get(url, () => { resolve(true); req.destroy() })
    req.on("error", () => resolve(false))
    req.setTimeout(1000, () => { req.destroy(); resolve(false) })
  })
}

async function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 800,
    minHeight: 500,
    backgroundColor: "#1e1e2e",
    title: "Ethco IDE",
    webPreferences: {
      preload: path.join(__dirname, "preload.cjs"),
      contextIsolation: true,
      nodeIntegration: false,
    },
  })

  const useDev = await isServerRunning(DEV_SERVER)

  if (useDev) {
    await mainWindow.loadURL(DEV_SERVER)
    mainWindow.webContents.openDevTools()
  } else {
    await mainWindow.loadFile(path.join(__dirname, "..", "dist", "index.html"))
  }

  ipcMain.handle("dialog:openDirectory", async () => {
    const result = await dialog.showOpenDialog(mainWindow, {
      properties: ["openDirectory"],
    })
    return result.canceled ? null : result.filePaths[0]
  })

  ipcMain.handle("fs:readDir", async (_event, dirPath) => {
    const entries = fs.readdirSync(dirPath, { withFileTypes: true })
    return entries.map((e) => ({
      name: e.name,
      isDirectory: e.isDirectory(),
    }))
  })

  ipcMain.handle("fs:readFile", async (_event, filePath) => {
    return fs.readFileSync(filePath, "utf-8")
  })

  ipcMain.handle("fs:writeFile", async (_event, filePath, content) => {
    fs.mkdirSync(path.dirname(filePath), { recursive: true })
    fs.writeFileSync(filePath, content, "utf-8")
  })

  ipcMain.handle("fs:delete", async (_event, filePath) => {
    fs.rmSync(filePath, { recursive: true, force: true })
  })

  ipcMain.handle("fs:rename", async (_event, oldPath, newPath) => {
    fs.renameSync(oldPath, newPath)
  })

  ipcMain.handle("fs:exists", async (_event, filePath) => {
    return fs.existsSync(filePath)
  })

  ipcMain.handle("fs:createDir", async (_event, dirPath) => {
    fs.mkdirSync(dirPath, { recursive: true })
  })

  ipcMain.handle("git:exec", async (_event, args, cwd) => {
    try {
      const result = execSync(`git ${args.join(" ")}`, { cwd, encoding: "utf-8", maxBuffer: 10 * 1024 * 1024 })
      return result.trim()
    } catch (e) {
      throw new Error(e.stderr || e.message)
    }
  })

  ipcMain.handle("git:status", async (_event, cwd) => {
    const branch = execSync(`git branch --show-current`, { cwd, encoding: "utf-8" }).trim()
    const porcelain = execSync(`git status --porcelain`, { cwd, encoding: "utf-8" }).trim()
    const files = porcelain.split("\n").filter(Boolean).map((line) => {
      const status = line.substring(0, 2).trim()
      const filePath = line.substring(3).trim()
      let type = "modified"
      if (status === "??") type = "untracked"
      else if (status.includes("A")) type = "added"
      else if (status.includes("D")) type = "deleted"
      else if (status.includes("R")) type = "renamed"
      return { path: filePath, status: type }
    })
    return { branch, files }
  })

  ipcMain.handle("git:add", async (_event, filePath, cwd) => {
    execSync(`git add "${filePath}"`, { cwd, encoding: "utf-8" })
  })

  ipcMain.handle("git:reset", async (_event, filePath, cwd) => {
    execSync(`git reset HEAD -- "${filePath}"`, { cwd, encoding: "utf-8" })
  })

  ipcMain.handle("git:commit", async (_event, message, cwd) => {
    execSync(`git commit -m "${message.replace(/"/g, '\\"')}"`, { cwd, encoding: "utf-8" })
  })

  ipcMain.handle("git:log", async (_event, maxCount, cwd) => {
    const output = execSync(`git log --max-count=${maxCount} --format="%H|%s|%an|%ai"`, { cwd, encoding: "utf-8" }).trim()
    return output.split("\n").filter(Boolean).map((line) => {
      const [hash, message, author, date] = line.split("|")
      return { hash, message, author, date }
    })
  })

  ipcMain.handle("git:diff", async (_event, filePath, cwd) => {
    return execSync(`git diff -- "${filePath}"`, { cwd, encoding: "utf-8" }).trim()
  })

  // ── PTY (Terminal) ──
  const ptyProcesses = new Map()

  ipcMain.handle("pty:spawn", (_event, id, cwd) => {
    if (ptyProcesses.has(id)) {
      ptyProcesses.get(id).kill()
      ptyProcesses.delete(id)
    }
    const shell = process.platform === "win32" 
      ? { cmd: "cmd.exe", args: [] }
      : { cmd: process.env.SHELL || "bash", args: [] }
    const proc = spawn(shell.cmd, shell.args, {
      cwd: cwd || process.env.HOME || process.env.USERPROFILE,
      env: { ...process.env, TERM: "xterm-256color" },
      stdio: ["pipe", "pipe", "pipe"],
    })
    ptyProcesses.set(id, proc)

    proc.stdout.on("data", (data) => {
      if (mainWindow && !mainWindow.isDestroyed()) {
        mainWindow.webContents.send("pty:data", id, data.toString())
      }
    })
    proc.stderr.on("data", (data) => {
      if (mainWindow && !mainWindow.isDestroyed()) {
        mainWindow.webContents.send("pty:data", id, data.toString())
      }
    })
    proc.on("exit", (code) => {
      ptyProcesses.delete(id)
      if (mainWindow && !mainWindow.isDestroyed()) {
        mainWindow.webContents.send("pty:exit", id, code)
      }
    })
    proc.on("error", () => {
      ptyProcesses.delete(id)
    })
    return true
  })

  ipcMain.handle("pty:write", (_event, id, data) => {
    const proc = ptyProcesses.get(id)
    if (proc && proc.stdin.writable) {
      proc.stdin.write(data)
    }
  })

  ipcMain.handle("pty:resize", (_event, id, cols, rows) => {
    const proc = ptyProcesses.get(id)
    if (proc && proc.stdout.setCols) {
      proc.stdout.setCols(cols)
      proc.stdout.setRows(rows)
    }
  })

  ipcMain.handle("pty:kill", (_event, id) => {
    const proc = ptyProcesses.get(id)
    if (proc) {
      proc.kill()
      ptyProcesses.delete(id)
    }
  })

  mainWindow.on("closed", () => { mainWindow = null })
}

app.whenReady().then(createWindow)

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit()
})

app.on("activate", () => {
  if (BrowserWindow.getAllWindows().length === 0) createWindow()
})
