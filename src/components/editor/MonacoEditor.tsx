import { useRef, useCallback, useEffect } from "react"
import Editor, { type OnMount } from "@monaco-editor/react"
import { useEditorStore } from "../../stores/editorStore"
import { useSettingsStore } from "../../stores/settingsStore"
import { getFS } from "../../services/fs-provider"

interface MonacoEditorProps {
  path: string
  content: string
  language: string
  cursorLine?: number
}

export function MonacoEditor({ path, content, language, cursorLine }: MonacoEditorProps) {
  const editorRef = useRef<Parameters<OnMount>[0] | null>(null)
  const updateContent = useEditorStore((s) => s.updateContent)
  const markClean = useEditorStore((s) => s.markClean)
  const settings = useSettingsStore()

  const handleMount: OnMount = useCallback((editor) => {
    editorRef.current = editor

    editor.onDidChangeModelContent(() => {
      const value = editor.getValue()
      updateContent(path, value)
    })

    editor.addCommand(2048 | 41 /* Ctrl+S */, async () => {
      const value = editor.getValue()
      try {
        const fs = getFS()
        await fs.writeFile(path, value)
        markClean(path)
      } catch (e) {
        console.error("Failed to save file:", e)
      }
    })

    if (cursorLine !== undefined && cursorLine > 0) {
      editor.revealLineInCenter(cursorLine + 1)
      editor.setPosition({ lineNumber: cursorLine + 1, column: 1 })
    }

    editor.focus()
  }, [path, updateContent, markClean, cursorLine])

  useEffect(() => {
    const editor = editorRef.current
    if (!editor) return

    editor.updateOptions({
      fontSize: settings.fontSize,
      fontFamily: settings.fontFamily,
      tabSize: settings.tabSize,
    })
  }, [settings.fontSize, settings.fontFamily, settings.tabSize])

  return (
    <div className="h-full w-full">
      <Editor
        key={path}
        theme={settings.theme === "dark" ? "vs-dark" : "vs"}
        language={language}
        value={content}
        onMount={handleMount}
        options={{
          fontSize: settings.fontSize,
          fontFamily: settings.fontFamily,
          tabSize: settings.tabSize,
          minimap: { enabled: false },
          scrollBeyondLastLine: false,
          lineNumbers: "on",
          renderWhitespace: "selection",
          wordWrap: "off",
          smoothScrolling: true,
          cursorBlinking: "smooth",
          cursorSmoothCaretAnimation: "on",
          bracketPairColorization: { enabled: true },
          padding: { top: 8 },
          automaticLayout: true,
          suggest: {
            showMethods: true,
            showFunctions: true,
            showConstructors: true,
            showFields: true,
            showVariables: true,
            showClasses: true,
            showStructs: true,
            showInterfaces: true,
            showModules: true,
            showProperties: true,
            showEvents: true,
            showOperators: true,
            showUnits: true,
            showValues: true,
            showConstants: true,
            showEnums: true,
            showEnumMembers: true,
            showKeywords: true,
            showWords: true,
            showColors: true,
            showFiles: true,
            showReferences: true,
            showSnippets: true,
          },
        }}
      />
    </div>
  )
}
