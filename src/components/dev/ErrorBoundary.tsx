import React from "react";

type State = { hasError: boolean; msg?: string; stack?: string };

export class ErrorBoundary extends React.Component<React.PropsWithChildren, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(err: any): State {
    return { hasError: true, msg: String(err) };
  }

  componentDidCatch(err: any, info: React.ErrorInfo) {
    console.error("UI crash:", err, info);
    this.setState({ stack: info?.componentStack });
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-[40vh] grid place-items-center p-6 text-center">
          <div>
            <h2 className="text-2xl md:text-3xl font-serif text-yellow-300">Something went wrong.</h2>
            <p className="mt-2 text-gray-300">The page crashed. See details below:</p>
            <pre className="mt-4 bg-black/40 text-red-300 text-xs p-3 rounded max-w-[90vw] overflow-auto">
              {this.state.msg}
              {this.state.stack ? `\n\nComponent stack:${this.state.stack}` : ""}
            </pre>
          </div>
        </div>
      );
    }
    return this.props.children as any;
  }
}
