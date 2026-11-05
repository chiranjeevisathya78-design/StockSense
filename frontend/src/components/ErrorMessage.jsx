import React from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';

export default function ErrorMessage({ message, onRetry }) {
  return (
    <div className="rounded-2xl bg-white border border-[#e8e8e6] p-8 text-center my-6 max-w-lg mx-auto shadow-xs">
      <div className="w-10 h-10 rounded-full bg-rose-50 border border-rose-200 text-rose-600 flex items-center justify-center mx-auto mb-3">
        <AlertCircle className="w-5 h-5" />
      </div>
      <h3 className="text-sm font-semibold text-[#111] mb-1">Data Feed Notice</h3>
      <p className="text-xs text-[#7b7b7b] mb-5 max-w-sm mx-auto leading-relaxed">
        {message || 'Unable to retrieve current equity feed. Please check ticker symbol or network connection.'}
      </p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-[#111] hover:bg-black text-white text-xs font-medium transition cursor-pointer shadow-xs"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Retry Request</span>
        </button>
      )}
    </div>
  );
}
