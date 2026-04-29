import { Component, ReactNode, ErrorInfo } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export default class ErrorBoundary extends Component<Props, State> {
  props: Props;
  state: State = { hasError: false, error: null };

  constructor(props: Props) {
    super(props);
    this.props = props;
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
          <div className="max-w-md w-full bg-white rounded-[2.5rem] shadow-2xl p-10 text-center border border-slate-100">
            <div className="w-24 h-24 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-8">
              <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
            </div>
            <h1 className="text-3xl font-black text-slate-900 leading-tight mb-4 uppercase tracking-tighter">Erro de Sistema</h1>
            <p className="text-slate-500 font-medium mb-10 leading-relaxed">
              O FocusOS encontrou uma inconsistência nos dados. Clique no botão abaixo para restaurar o fluxo.
            </p>
            <button 
              onClick={() => {
                // Clear state is sometimes needed if it's a data mismatch
                // localStorage.removeItem('focusos_token'); 
                window.location.reload();
              }}
              className="w-full py-5 bg-indigo-600 text-white rounded-2xl font-black text-[13px] uppercase tracking-[0.2em] hover:bg-slate-900 transition-all shadow-xl shadow-indigo-200"
            >
              Restaurar Interface
            </button>
            <details className="mt-10 text-left opacity-20 hover:opacity-100 transition-opacity">
              <summary className="text-[10px] font-bold uppercase tracking-widest cursor-pointer text-slate-400 mb-2">Logs Técnicos</summary>
              <div className="bg-slate-50 p-6 rounded-2xl overflow-auto max-h-40 font-mono text-[9px] text-slate-500 leading-relaxed border border-slate-100">
                {this.state.error?.toString()}
              </div>
            </details>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
