import { Component } from 'react'
import { AlertTriangle, RefreshCw, Home } from 'lucide-react'

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }

  componentDidCatch(error, info) {
    console.error('[VoyageAI Error Boundary]', error, info)
  }

  render() {
    if (!this.state.hasError) return this.props.children

    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="max-w-md w-full text-center">
          <div className="w-16 h-16 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center mx-auto mb-6">
            <AlertTriangle className="w-8 h-8 text-red-400" />
          </div>
          <h1 className="font-display text-2xl font-bold text-white mb-3">Something went wrong</h1>
          <p className="text-muted text-sm mb-2 leading-relaxed">
            An unexpected error occurred. This has been noted and we're looking into it.
          </p>
          {this.props.showDetail && this.state.error && (
            <pre className="text-xs text-red-300/60 bg-red-500/5 border border-red-500/10 rounded-xl p-3 mb-6 text-left overflow-auto max-h-32">
              {this.state.error.message}
            </pre>
          )}
          <div className="flex gap-3 justify-center mt-6">
            <button
              onClick={() => this.setState({ hasError: false, error: null })}
              className="flex items-center gap-2 px-4 py-2.5 glass border border-border hover:border-gold-400/30 rounded-xl text-sm text-white transition-all"
            >
              <RefreshCw className="w-4 h-4" /> Try again
            </button>
            <a
              href="/"
              className="flex items-center gap-2 px-4 py-2.5 bg-gold-gradient text-void font-bold rounded-xl text-sm shadow-gold-sm"
            >
              <Home className="w-4 h-4" /> Go home
            </a>
          </div>
        </div>
      </div>
    )
  }
}
