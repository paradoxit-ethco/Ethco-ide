import { Component, type ErrorInfo, type ReactNode } from "react"

interface Props {
  children: ReactNode
  fallback?: ReactNode
}

interface State {
  hasError: boolean
  error: Error | null
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error("ErrorBoundary caught:", error, info)
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback
      return (
        <div className="h-full flex items-center justify-center bg-surface p-4">
          <div className="text-center max-w-md">
            <div className="text-2xl mb-2">\u26A0\uFE0F</div>
            <h2 className="text-sm font-semibold text-[var(--text)] mb-1">Something went wrong</h2>
            <p className="text-xs text-text-muted mb-3 font-mono break-all">
              {this.state.error?.message ?? "Unknown error"}
            </p>
            <button
              onClick={() => this.setState({ hasError: false, error: null })}
              className="px-3 py-1 text-xs bg-accent text-white rounded hover:bg-accent-dark transition-colors"
            >
              Retry
            </button>
          </div>
        </div>
      )
    }
    return this.props.children
  }
}
