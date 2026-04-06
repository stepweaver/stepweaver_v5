"use client";

import { Component, type ErrorInfo, type ReactNode } from "react";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error("[ErrorBoundary]", error, info.componentStack);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-[rgb(var(--bg))] text-[rgb(var(--text-color))] font-mono p-8">
          <div className="max-w-md w-full border border-[rgb(var(--border)/0.3)] p-6">
            <div className="text-[rgb(var(--red))] font-[var(--font-ocr)] text-sm tracking-wider uppercase mb-4">
              SYS.ERROR — Recovery Required
            </div>
            <p className="text-sm mb-4">
              An unexpected error occurred. The system is attempting to recover.
            </p>
            {process.env.NODE_ENV === "development" && this.state.error && (
              <details className="text-xs text-[rgb(var(--muted-color))] mb-4">
                <summary className="cursor-pointer">Error details</summary>
                <pre className="mt-2 p-2 bg-[rgb(var(--panel))] overflow-auto">
                  {this.state.error.message}
                </pre>
              </details>
            )}
            <button
              onClick={() => window.location.reload()}
              className="glitch-button glitch-button--primary"
            >
              Refresh Page
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
