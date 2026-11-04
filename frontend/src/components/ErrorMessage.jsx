import React from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';

export default function ErrorMessage({ message, onRetry }) {
  return (
    <div className="rounded-[10px] bg-slash-onyx border border-slash-graphite p-8 text-center my-6 max-w-lg mx-auto">
      <div className="w-10 h-10 rounded-full bg-slash-carbon border border-slash-graphite text-slash-copper flex items-center justify-center mx-auto mb-3">
        <AlertCircle className="w-5 h-5" />
      </div>
      <h3 className="text-sm font-semibold text-white mb-1">Ledger Feed Notice</h3>
      <p className="text-xs text-slash-fog mb-5 max-w-sm mx-auto leading-relaxed">
        {message || 'Unable to retrieve current equity feed. Please check ticker symbol or network connection.'}
      </p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-white text-black text-xs font-medium hover:bg-slate-200 transition"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Retry Request</span>
        </button>
      )}
    </div>
  );
}
