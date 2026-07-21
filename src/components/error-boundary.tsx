"use client"

import React, { Component, ErrorInfo, ReactNode } from "react"
import { AlertTriangle, RefreshCw, Home } from "lucide-react"
import { Button } from "@/components/ui/button"

interface ErrorBoundaryProps {
  children: ReactNode
  fallback?: ReactNode
}

interface ErrorBoundaryState {
  hasError: boolean
  error: Error | null
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("ErrorBoundary caught:", error, errorInfo)
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null })
  }

  handleGoHome = () => {
    window.location.href = "/dashboard"
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback
      }

      return (
        <div className="min-h-[400px] flex items-center justify-center p-6">
          <div className="w-full max-w-md text-center space-y-6">
            <div className="mx-auto h-16 w-16 rounded-2xl bg-red-50 dark:bg-red-950 flex items-center justify-center">
              <AlertTriangle className="h-8 w-8 text-red-500" />
            </div>

            <div className="space-y-2">
              <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100">
                Something went wrong
              </h2>
              <p className="text-sm text-zinc-500 dark:text-zinc-400 leading-relaxed">
                An unexpected error occurred. You can try reloading this section or head back to the
                dashboard.
              </p>
              {this.state.error && (
                <p className="text-xs text-zinc-400 dark:text-zinc-500 font-mono bg-zinc-50 dark:bg-zinc-800 rounded-xl px-3 py-2 mt-3 break-all">
                  {this.state.error.message}
                </p>
              )}
            </div>

            <div className="flex items-center justify-center gap-3">
              <Button variant="outline" onClick={this.handleGoHome}>
                <Home className="h-4 w-4 mr-2" />
                Go Home
              </Button>
              <Button onClick={this.handleRetry}>
                <RefreshCw className="h-4 w-4 mr-2" />
                Try Again
              </Button>
            </div>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}

export default ErrorBoundary
