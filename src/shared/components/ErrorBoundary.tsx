/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import React, { Component, type ErrorInfo, type ReactNode } from 'react';

interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
}

export default class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(): ErrorBoundaryState {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('virtualFit render error', error, info.componentStack);
  }

  render(): ReactNode {
    if (this.state.hasError) {
      return (
        <div
          className="min-h-screen flex flex-col items-center justify-center gap-4 p-6 bg-bg0 text-text-strong text-center"
          role="alert"
        >
          <p className="text-lg font-semibold">Something went wrong</p>
          <p className="text-sm text-text-muted max-w-md">
            Reload the page to try again. If the problem persists, check your API key and network connection.
          </p>
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="mt-2 px-6 py-3 rounded-full bg-accent text-accent-ink font-semibold uppercase tracking-luxe text-sm"
          >
            Reload
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
