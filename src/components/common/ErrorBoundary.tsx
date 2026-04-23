import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: string | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    errorInfo: null
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error, errorInfo: null };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught error:", error, errorInfo);
    this.setState({
      error,
      errorInfo: errorInfo.componentStack
    });
  }

  public render() {
    if (this.state.hasError) {
      let isFirestoreError = false;
      let displayError = this.state.error?.message || "Невідома помилка";

      try {
        const parsed = JSON.parse(displayError);
        if (parsed.error) {
          isFirestoreError = true;
          displayError = JSON.stringify(parsed, null, 2);
        }
      } catch {
        // Not a JSON error
      }

      return (
        <div className="min-h-screen flex items-center justify-center bg-card p-6">
          <div className="max-w-2xl w-full bg-white p-8 lg:p-12 rounded-[40px] shadow-2xl border border-red-100 flex flex-col items-center text-center">
            <div className="w-20 h-20 bg-rose-100 rounded-3xl flex items-center justify-center mb-6">
              <AlertCircle className="w-10 h-10 text-rose-600" />
            </div>
            
            <h1 className="text-3xl font-black text-slate-900 mb-2">
              {isFirestoreError ? 'Помилка доступу' : 'Щось пішло не так'}
            </h1>
            <p className="text-slate-500 mb-8 max-w-md font-medium">
              Додаток зіткнувся з непередбачуваною помилкою. Спробуйте оновити сторінку або зверніться до розробника.
            </p>

            <div className="w-full bg-sidebar text-slate-100 p-6 rounded-3xl text-left text-[10px] overflow-auto max-h-48 mb-8 font-mono shadow-inner border border-white/10">
              <p className="text-rose-400 font-bold mb-2">Error: {this.state.error?.message}</p>
              <p className="opacity-50 break-words whitespace-pre-wrap">{this.state.errorInfo}</p>
            </div>

            <button 
              onClick={() => window.location.reload()} 
              className="w-full btn-primary bg-sidebar hover:bg-sidebar shadow-none py-5 rounded-2xl flex items-center justify-center gap-3 text-lg"
            >
              <RefreshCw className="w-5 h-5" />
              Оновити систему
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
