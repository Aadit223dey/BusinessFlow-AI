"use client";

import { Component, type ErrorInfo, type ReactNode } from "react";

/**
 * Component Layout Guard
 *
 * Catches runtime UI errors, registers component crash indicators,
 * and displays localized recovery layouts without crashing the
 * global application state.
 */

export interface ErrorBoundaryProps {
  /** Fallback UI to render when an error is caught */
  fallback: ReactNode;
  /** Child components to render */
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    console.error(
      "[ErrorBoundary] Uncaught component error:",
      error,
      errorInfo.componentStack
    );
  }

  /**
   * Reset the error boundary state, allowing children to re-render.
   */
  resetError = (): void => {
    this.setState({ hasError: false, error: null });
  };

  render(): ReactNode {
    if (this.state.hasError) {
      return this.props.fallback;
    }

    return this.props.children;
  }
}
