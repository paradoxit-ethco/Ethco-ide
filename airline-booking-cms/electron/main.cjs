const { app, BrowserWindow, ipcMain, dialog, session } = require("electron")
const path = require("path")
const http = require("http")
const fs = require("fs")
const { execSync } = require("child_process")
const pty = require("node-pty")

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

  // ── PTY (Terminal) via node-pty (ConPTY on Windows) ──
  const ptyProcesses = new Map()

  function detectShell() {
    if (process.platform === "win32") {
      const comspec = process.env.COMSPEC
      if (comspec && comspec.toLowerCase().includes("powershell")) return comspec
      return "powershell.exe"
    }
    return process.env.SHELL || "/bin/bash"
  }

  ipcMain.handle("pty:spawn", (_event, id, cwd, cols, rows, shell) => {
    if (id === "agent-shell" && ptyProcesses.has(id)) {
      return true
    }
    if (ptyProcesses.has(id)) {
      ptyProcesses.get(id).kill()
      ptyProcesses.delete(id)
    }

    const shellPath = shell || detectShell()
    const shellArgs = process.platform === "win32" ? [] : ["--login"]
    const term = pty.spawn(shellPath, shellArgs, {
      name: "xterm-256color",
      cols: cols || 80,
      rows: rows || 24,
      cwd: cwd || process.env.HOME || process.env.USERPROFILE,
      env: { ...process.env, TERM: "xterm-256color" },
    })

    ptyProcesses.set(id, term)

    term.onData((data) => {
      if (mainWindow && !mainWindow.isDestroyed()) {
        mainWindow.webContents.send("pty:data", id, data)
      }
    })

    term.onExit(({ exitCode }) => {
      ptyProcesses.delete(id)
      if (mainWindow && !mainWindow.isDestroyed()) {
        mainWindow.webContents.send("pty:exit", id, exitCode)
      }
    })

    return true
  })

  ipcMain.handle("pty:write", (_event, id, data) => {
    const term = ptyProcesses.get(id)
    if (term) {
      term.write(data)
    }
  })

  ipcMain.handle("pty:resize", (_event, id, cols, rows) => {
    const term = ptyProcesses.get(id)
    if (term) {
      term.resize(cols, rows)
    }
  })

  ipcMain.handle("pty:kill", (_event, id) => {
    const term = ptyProcesses.get(id)
    if (term) {
      term.kill()
      ptyProcesses.delete(id)
    }
  })

  // Network proxy management inside the background process
  ipcMain.handle("network:setProxy", async (_event, proxyRules) => {
    try {
      const ses = session.defaultSession
      if (!proxyRules || proxyRules.trim() === "") {
        await ses.setProxy({ mode: "system" })
        console.log("[Proxy] Reset request received. Cleared proxy to system direct mode.")
        return true
      }
      await ses.setProxy({
        proxyRules: proxyRules.trim(),
        proxyBypassRules: "localhost, 127.0.0.1"
      })
      console.log(`[Proxy] Active rules configured to: ${proxyRules}`)
      return true
    } catch (e) {
      console.error("[Proxy] Configuration error inside main script: ", e)
      return false
    }
  })

  // Automatically fetch from settings and apply in background process on startup
  mainWindow.webContents.once("did-finish-load", async () => {
    try {
      const stored = await mainWindow.webContents.executeJavaScript('localStorage.getItem("ethco-settings")')
      if (stored) {
        const settings = JSON.parse(stored)
        if (settings.networkProxy && settings.networkProxy.trim() !== "") {
          const rules = settings.networkProxy.trim()
          await session.defaultSession.setProxy({
            proxyRules: rules,
            proxyBypassRules: "localhost, 127.0.0.1"
          })
          console.log(`[Auto Proxy] Background process automatically initialized: ${rules}`)
        }
      }
    } catch (e) {
      console.error("[Auto Proxy] Failure initializing background proxy configuration: ", e)
    }
  })

  // ── Google AI Studio Key Scraper ──
  // Uses Electron's native Chromium to open AI Studio, let user log in,
  // then scrape API keys directly from the DOM. Zero external dependencies.
  ipcMain.handle("google:scrapeKey", async () => {
    return new Promise((resolve) => {
      const scrapeWindow = new BrowserWindow({
        width: 1000,
        height: 720,
        title: "Google AI Studio — Import API Key",
        parent: mainWindow,
        modal: false,
        webPreferences: {
          nodeIntegration: false,
          contextIsolation: true,
        },
      })

      scrapeWindow.loadURL("https://aistudio.google.com/apikey")

      let resolved = false

      // Poll the DOM every 3 seconds for API key patterns
      const poller = setInterval(async () => {
        if (resolved || scrapeWindow.isDestroyed()) {
          clearInterval(poller)
          return
        }
        try {
          const key = await scrapeWindow.webContents.executeJavaScript(`
            (function() {
              // Strategy 1: Look for key text starting with AIza (standard Gemini key format)
              const allEls = document.querySelectorAll('span, td, div, p, input, textarea, code, pre');
              for (const el of allEls) {
                // Check input values
                if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') {
                  const val = el.value || '';
                  if (val.startsWith('AIza') && val.length >= 35 && val.length <= 45) return val;
                }
                // Check text content
                const text = el.textContent.trim();
                if (text.startsWith('AIza') && text.length >= 35 && text.length <= 45 && !text.includes(' ')) return text;
              }
              // Strategy 2: Check clipboard API (if user copied)
              return null;
            })()
          `)
          if (key && !resolved) {
            resolved = true
            clearInterval(poller)
            console.log("[Google Scraper] API key captured from AI Studio DOM")
            scrapeWindow.close()
            resolve(key)
          }
        } catch {
          // Page not ready or navigating — ignore
        }
      }, 3000)

      scrapeWindow.on("closed", () => {
        clearInterval(poller)
        if (!resolved) {
          resolved = true
          resolve(null)
        }
      })
    })
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
