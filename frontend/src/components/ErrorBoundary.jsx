import React from 'react';

export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    this.setState({ errorInfo });
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#08080a] text-white p-8 flex items-center justify-center">
          <div className="max-w-2xl w-full p-8 rounded-[10px] bg-[#040406] border border-red-500/40 space-y-4">
            <h1 className="text-xl font-bold text-red-400">Application Rendering Notice</h1>
            <p className="text-xs text-slate-300">
              An unexpected component error occurred while rendering the page:
            </p>
            <pre className="p-4 rounded bg-[#121317] border border-[#1c1d22] text-xs font-mono text-red-300 overflow-x-auto whitespace-pre-wrap">
              {this.state.error?.toString()}
            </pre>
            <button
              onClick={() => {
                localStorage.clear();
                window.location.href = '/dashboard';
              }}
              className="px-5 py-2 rounded-full bg-white text-black text-xs font-semibold hover:bg-slate-200 transition"
            >
              Reset Cache & Launch Dashboard
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

export default ErrorBoundary;
