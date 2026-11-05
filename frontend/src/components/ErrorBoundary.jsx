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
        <div className="min-h-screen bg-[#f7f7f5] text-[#111111] p-6 sm:p-8 flex items-center justify-center font-sans">
          <div className="max-w-xl w-full p-8 rounded-2xl bg-white border border-[#e8e8e6] shadow-sm space-y-5 text-center">
            <div className="w-12 h-12 rounded-full bg-rose-50 border border-rose-200/80 text-rose-600 flex items-center justify-center mx-auto text-xl font-bold">
              !
            </div>
            <h1 className="text-2xl font-medium text-[#111111] tracking-tight">System Refresh Needed</h1>
            <p className="text-sm text-[#7b7b7b] leading-relaxed max-w-md mx-auto">
              A temporary rendering discrepancy was encountered. Click below to refresh your session with verified live feeds.
            </p>
            {this.state.error && (
              <pre className="p-3 rounded-xl bg-[#f7f7f5] border border-[#e8e8e6] text-xs font-mono text-rose-600 overflow-x-auto whitespace-pre-wrap text-left">
                {this.state.error?.toString()}
              </pre>
            )}
            <button
              onClick={() => {
                localStorage.clear();
                window.location.href = '/dashboard';
              }}
              className="inline-flex items-center justify-center px-6 py-2.5 rounded-full bg-[#111111] text-white text-xs font-medium hover:bg-black transition-transform duration-200 hover:-translate-y-px shadow-xs cursor-pointer"
            >
              Reset Session & Launch Dashboard
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

export default ErrorBoundary;
