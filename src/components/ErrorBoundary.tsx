import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="p-4 bg-red-900/20 border border-red-500 rounded-lg text-white m-4">
          <h2 className="text-xl font-bold text-red-400 mb-2">Oops, ocurrió un error inesperado.</h2>
          <p className="text-sm text-red-200">{this.state.error?.message}</p>
          <button 
            className="mt-4 px-4 py-2 bg-red-600 hover:bg-red-700 rounded text-sm font-bold"
            onClick={() => this.setState({ hasError: false, error: null })}
          >
            Reintentar
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
