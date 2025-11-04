import React, { Component, ErrorInfo, ReactNode } from "react";
import { logError } from "@/utils/logger";
import { Button } from "@/components/ui/button";
import { GlassCard } from "@/components/ui/glass-card";
import { AlertTriangle } from "lucide-react";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

/**
 * Global Error Boundary Component
 * Catches React errors and displays fallback UI
 * Logs errors to monitoring service in production
 */
export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    // Log error to console and monitoring service
    logError("React Error Boundary caught an error", error, {
      componentStack: errorInfo.componentStack,
    });

    // Store error info in state
    this.setState({ errorInfo });

    // Call optional error handler
    this.props.onError?.(error, errorInfo);
  }

  handleReset = (): void => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
  };

  handleReload = (): void => {
    window.location.reload();
  };

  render(): ReactNode {
    if (this.state.hasError) {
      // Custom fallback if provided
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Default error UI
      return (
        <div className="min-h-screen flex items-center justify-center p-4 bg-cosmic-blue">
          <GlassCard className="max-w-lg w-full">
            <div className="text-center space-y-6 p-6">
              <div className="flex justify-center">
                <div className="rounded-full bg-red-500/20 p-4">
                  <AlertTriangle className="h-12 w-12 text-red-400" />
                </div>
              </div>

              <div>
                <h1 className="text-2xl font-serif font-bold text-white mb-2">
                  Something went wrong
                </h1>
                <p className="text-stardust">
                  We apologize for the inconvenience. An unexpected error occurred.
                </p>
              </div>

              {/* Show error details in development */}
              {import.meta.env.DEV && this.state.error && (
                <div className="text-left bg-black/30 rounded-lg p-4 overflow-auto max-h-40">
                  <p className="text-xs font-mono text-red-300">
                    {this.state.error.toString()}
                  </p>
                  {this.state.errorInfo && (
                    <pre className="text-xs text-gray-400 mt-2 whitespace-pre-wrap">
                      {this.state.errorInfo.componentStack}
                    </pre>
                  )}
                </div>
              )}

              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Button
                  onClick={this.handleReset}
                  variant="outline"
                  className="border-white/25"
                >
                  Try Again
                </Button>
                <Button
                  onClick={this.handleReload}
                  className="bg-gradient-auric text-cosmic-blue"
                >
                  Reload Page
                </Button>
              </div>

              <p className="text-xs text-stardust/70">
                If this problem persists, please contact support.
              </p>
            </div>
          </GlassCard>
        </div>
      );
    }

    return this.props.children;
  }
}

/**
 * Lightweight error boundary for specific features
 * Shows minimal error UI without full-page takeover
 */
export const FeatureErrorBoundary: React.FC<{ children: ReactNode; featureName: string }> = ({
  children,
  featureName,
}) => {
  return (
    <ErrorBoundary
      fallback={
        <div className="p-6 text-center">
          <p className="text-red-400">
            Unable to load {featureName}. Please try refreshing the page.
          </p>
        </div>
      }
      onError={(error) => {
        logError(`${featureName} feature error`, error);
      }}
    >
      {children}
    </ErrorBoundary>
  );
};
