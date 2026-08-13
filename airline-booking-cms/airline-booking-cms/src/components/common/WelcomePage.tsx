import { useState } from "react"

interface WelcomePageProps {
  onOpenFolder: (path?: string) => void
}

export function WelcomePage({ onOpenFolder }: WelcomePageProps) {
  const [showOnStartup, setShowOnStartup] = useState(true)

  const startItems = [
    {
      label: "New File...",
      icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="12" y1="18" x2="12" y2="12"/><line x1="9" y1="15" x2="15" y2="15"/></svg>,
      shortcut: "Ctrl+N",
      action: () => {},
    },
    {
      label: "Open File...",
      icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/></svg>,
      shortcut: "Ctrl+O",
      action: () => {},
    },
    {
      label: "Open Folder...",
      icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/></svg>,
      shortcut: "Ctrl+K Ctrl+O",
      action: () => onOpenFolder(),
    },
    {
      label: "Clone Git Repository...",
      icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="18" cy="18" r="3"/><circle cx="6" cy="6" r="3"/><path d="M18 9V6a3 3 0 0 0-3-3h-3"/><path d="M13 15l-4-4"/><path d="M21 15v3a3 3 0 0 1-3 3h-3"/></svg>,
      shortcut: "Ctrl+Shift+P",
      action: () => {},
    },
  ]

  const walkthroughs = [
    {
      title: "Get Started with Ethco IDE",
      description: "Set up your editor — choose a color theme, configure your AI agent connection, and learn the basics.",
      steps: [
        { label: "Choose a color theme", done: false },
        { label: "Connect to an AI agent", done: false },
        { label: "Learn keyboard shortcuts", done: false },
      ],
    },
    {
      title: "Learn the Fundamentals",
      description: "Interactive walkthroughs that teach you how to use the IDE effectively.",
      steps: [
        { label: "Explore the interface layout", done: false },
        { label: "Using the integrated terminal", done: false },
        { label: "Search across your project", done: false },
      ],
    },
    {
      title: "Developer Tools",
      description: "Get started with the tools built into Ethco IDE.",
      steps: [
        { label: "Source control with Git", done: false },
        { label: "Debug and run configurations", done: false },
        { label: "Using the AI agent", done: false },
      ],
    },
  ]

  return (
    <div className="h-full flex flex-col bg-[#1e1e2e] select-none overflow-y-auto">
      <div className="flex-1 flex items-start justify-center gap-12 px-12 py-16 max-w-[900px] mx-auto">
        {/* Left column — Start */}
        <div className="w-[260px] shrink-0 space-y-4">
          <div className="flex items-center gap-3 mb-6">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#cba6f7" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
            </svg>
            <div>
              <h1 className="text-lg font-semibold text-[var(--text)]">Ethco IDE</h1>
              <p className="text-[10px] text-text-muted">Agentic coding environment</p>
            </div>
          </div>

          <div className="space-y-0.5">
            {startItems.map((item) => (
              <button
                key={item.label}
                onClick={item.action}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-white/[0.06] transition-colors text-left group"
              >
                <span className="text-text-muted group-hover:text-[var(--text)] transition-colors shrink-0">{item.icon}</span>
                <span className="text-sm text-[var(--text)] flex-1">{item.label}</span>
                <span className="text-[10px] text-text-dim font-mono">{item.shortcut}</span>
              </button>
            ))}
          </div>

          <div className="pt-4 border-t border-[#313244]">
            <p className="text-[10px] text-text-dim">
              Open a project folder to start coding. The AI agent can help you write, refactor, and debug code.
            </p>
          </div>
        </div>

        {/* Right column — Walkthroughs */}
        <div className="flex-1 space-y-6 min-w-0">
          <h2 className="text-[11px] font-semibold uppercase tracking-widest text-text-muted">Walkthroughs & Setup</h2>

          <div className="space-y-4">
            {walkthroughs.map((section) => (
              <div
                key={section.title}
                className="bg-[#181825] border border-[#313244] rounded-lg overflow-hidden hover:border-[#45475a] transition-colors"
              >
                <div className="px-4 py-3.5">
                  <h3 className="text-sm font-medium text-[var(--text)] mb-1">{section.title}</h3>
                  <p className="text-[11px] text-text-muted leading-relaxed">{section.description}</p>
                </div>
                <div className="border-t border-[#313244] divide-y divide-[#313244]">
                  {section.steps.map((step, i) => (
                    <div key={i} className="flex items-center gap-3 px-4 py-2.5 hover:bg-white/[0.02] transition-colors">
                      <div className={`w-[18px] h-[18px] rounded-full border-2 flex items-center justify-center shrink-0 transition-colors ${
                        step.done ? "bg-accent border-accent" : "border-text-dim"
                      }`}>
                        {step.done && <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3"><polyline points="20 6 9 17 4 12"/></svg>}
                      </div>
                      <span className={`text-xs ${step.done ? "text-text-muted line-through" : "text-[var(--text)]"}`}>
                        {step.label}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="flex items-center justify-center gap-2 py-3 border-t border-[#313244]">
        <label className="flex items-center gap-2 cursor-pointer">
          <div
            onClick={() => setShowOnStartup(!showOnStartup)}
            className={`w-[14px] h-[14px] rounded border-2 flex items-center justify-center transition-colors ${
              showOnStartup ? "bg-accent border-accent" : "border-text-dim hover:border-[var(--text)]"
            }`}
          >
            {showOnStartup && <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3"><polyline points="20 6 9 17 4 12"/></svg>}
          </div>
          <span className="text-[11px] text-text-muted">Show welcome page on startup</span>
        </label>
      </div>
    </div>
  )
}
