import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallbackTitleKm?: string;
  fallbackTitleEn?: string;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="p-6 rounded-3xl bg-amber-50 border-2 border-amber-300 text-stone-800 text-center space-y-4 shadow-lg my-4 max-w-lg mx-auto">
          <div className="w-12 h-12 rounded-full bg-amber-100 text-amber-800 flex items-center justify-center mx-auto shadow-inner">
            <AlertTriangle className="w-6 h-6 text-amber-700" />
          </div>
          <div className="space-y-1">
            <h3 className="font-moul text-sm text-stone-900">
              {this.props.fallbackTitleKm || 'មានបញ្ហាក្នុងការបង្ហាញ Template នេះ'}
            </h3>
            <p className="text-xs text-stone-600">
              {this.props.fallbackTitleEn || 'There was an issue displaying this template content.'}
            </p>
          </div>
          {this.state.error?.message && (
            <div className="p-2.5 rounded-xl bg-stone-100 border border-stone-200 text-[11px] font-mono text-stone-600 overflow-x-auto text-left">
              {this.state.error.message}
            </div>
          )}
          <button
            type="button"
            onClick={() => this.setState({ hasError: false, error: null })}
            className="px-4 py-2 rounded-xl bg-stone-900 text-amber-300 text-xs font-bold shadow-md hover:bg-black transition-all inline-flex items-center gap-1.5"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>ព្យាយាមឡើងវិញ (Try Again)</span>
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
