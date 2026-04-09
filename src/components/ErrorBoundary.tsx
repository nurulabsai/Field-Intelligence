import React from 'react';

interface ErrorBoundaryState {
  error: Error | null;
}

interface ErrorBoundaryProps {
  children: React.ReactNode;
}

class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = { error: null };

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { error };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo): void {
    // eslint-disable-next-line no-console
    console.error('[ErrorBoundary]', error, info.componentStack);
  }

  handleReload = (): void => {
    this.setState({ error: null });
    if (typeof window !== 'undefined') {
      window.location.href = '/';
    }
  };

  render(): React.ReactNode {
    if (this.state.error) {
      return (
        <div
          role="alert"
          className="min-h-screen bg-bg-primary font-base flex items-center justify-center px-6"
        >
          <div className="max-w-md w-full text-center">
            <h1 className="font-heading text-3xl font-light tracking-tight text-white mb-3">
              Something went wrong
            </h1>
            <p className="text-text-secondary text-sm mb-8">
              NuruOS hit an unexpected error. Your offline work is safe — reload to continue.
            </p>
            <button
              type="button"
              onClick={this.handleReload}
              className="bg-accent text-black py-4 px-8 rounded-full font-bold text-sm uppercase tracking-[0.2em] cursor-pointer border-none active:scale-[0.98] transition-all"
            >
              Reload
            </button>
            {import.meta.env.DEV && (
              <pre className="mt-8 text-left text-[11px] text-red-300/70 bg-red-500/5 border border-red-500/15 rounded-2xl p-4 overflow-auto max-h-48">
                {this.state.error.stack ?? this.state.error.message}
              </pre>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
