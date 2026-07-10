export type ThemeMode = "dark" | "light"

const THEME_KEY = "ethco-theme"

const darkTheme = {
  accent: "#6366f1",
  accentLight: "#818cf8",
  accentDark: "#4f46e5",
  surface: "#1e1e2e",
  surfaceAlt: "#181825",
  border: "#313244",
  text: "#cdd6f4",
  textMuted: "#6c7086",
  error: "#f38ba8",
  success: "#a6e3a1",
  warning: "#f9e2af",
}

const lightTheme = {
  accent: "#6366f1",
  accentLight: "#818cf8",
  accentDark: "#4f46e5",
  surface: "#ffffff",
  surfaceAlt: "#f5f5f5",
  border: "#e0e0e0",
  text: "#1e1e2e",
  textMuted: "#9e9e9e",
  error: "#e53935",
  success: "#43a047",
  warning: "#f9a825",
}

let currentTheme: ThemeMode = "dark"

export function getTheme(): ThemeMode {
  return currentTheme
}

export function getThemeVars(): Record<string, string> {
  return currentTheme === "dark" ? darkTheme : lightTheme
}

export function setTheme(mode: ThemeMode) {
  currentTheme = mode
  localStorage.setItem(THEME_KEY, mode)
  applyTheme(mode)
}

export function toggleTheme(): ThemeMode {
  const next: ThemeMode = currentTheme === "dark" ? "light" : "dark"
  setTheme(next)
  return next
}

export function initTheme() {
  const saved = localStorage.getItem(THEME_KEY) as ThemeMode | null
  const preferred = window.matchMedia("(prefers-color-scheme: light)").matches ? "light" : "dark"
  currentTheme = saved || preferred
  applyTheme(currentTheme)
}

function applyTheme(mode: ThemeMode) {
  const vars = mode === "dark" ? darkTheme : lightTheme
  const root = document.documentElement
  Object.entries(vars).forEach(([key, value]) => {
    root.style.setProperty(`--${key.replace(/([A-Z])/g, "-$1").toLowerCase()}`, value)
  })
  root.setAttribute("data-theme", mode)
}
