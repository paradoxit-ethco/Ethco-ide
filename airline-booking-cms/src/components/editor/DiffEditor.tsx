import { useCallback, useRef } from "react"
import { DiffEditor as MonacoDiffEditor } from "@monaco-editor/react"

interface DiffEditorProps {
  original: string
  modified: string
  language: string
  filePath: string
  onAccept: () => void
  onReject: () => void
}

export function DiffEditor({ original, modified, language, onAccept, onReject }: DiffEditorProps) {
  const editorRef = useRef(null)

  const handleMount = useCallback((editor: any) => {
    editorRef.current = editor
  }, [])

  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center justify-between px-3 py-1.5 bg-surface-alt border-b border-[var(--border)]">
        <span className="text-xs font-medium text-[var(--text)]">Review Changes</span>
        <div className="flex gap-2">
          <button
            onClick={onReject}
            className="px-3 py-1 text-xs rounded bg-red-500/20 text-red-400 hover:bg-red-500/30 transition-colors"
          >
            Reject
          </button>
          <button
            onClick={onAccept}
            className="px-3 py-1 text-xs rounded bg-green-500/20 text-green-400 hover:bg-green-500/30 transition-colors"
          >
            Accept
          </button>
        </div>
      </div>
      <div className="flex-1">
        <MonacoDiffEditor
          original={original}
          modified={modified}
          language={language}
          theme="vs-dark"
          onMount={handleMount}
          options={{
            fontSize: 13,
            fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
            minimap: { enabled: false },
            renderSideBySide: true,
            readOnly: true,
            scrollBeyondLastLine: false,
            automaticLayout: true,
          }}
        />
      </div>
    </div>
  )
}
