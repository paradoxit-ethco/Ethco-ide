import type { Config } from "tailwindcss"

export default {
  content: ["./src/**/*.{ts,tsx}", "./index.html"],
  theme: {
    extend: {
      colors: {
        accent: {
          DEFAULT: "var(--accent)",
          light: "var(--accent-light)",
          dark: "var(--accent-dark)",
        },
        surface: {
          DEFAULT: "var(--surface)",
          alt: "var(--surface-alt)",
          raised: "var(--surface-raised)",
        },
        border: {
          DEFAULT: "var(--border)",
          light: "var(--border-light)",
        },
        text: {
          DEFAULT: "var(--text)",
          muted: "var(--text-muted)",
          dim: "var(--text-dim)",
        },
        error: "var(--error)",
        warning: "var(--warning)",
        success: "var(--success)",
        info: "var(--info)",
      },
    },
  },
  plugins: [],
} satisfies Config
