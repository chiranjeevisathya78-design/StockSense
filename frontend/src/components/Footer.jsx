import React from 'react';
import { Database, Activity, Sparkles } from 'lucide-react';
import { useStock } from '../context/StockContext';
import StockLogo from './StockLogo';

export default function Footer() {
  const { isWatchlistDemoMode } = useStock();

  return (
    <footer className="mt-16 border-t border-black/5 py-10 text-xs text-[#8e8e93]">
      <div className="flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-3">
          <div className="p-1.5 rounded-xl bg-white/80 border border-white/90 shadow-2xs">
            <StockLogo size={18} />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-semibold text-sm text-[#0f1115]">StockSense AI</span>
              <span className="text-[10px] font-bold px-1.5 py-0.2 rounded-md bg-emerald-500/10 text-emerald-700">
                Spatial v2.5
              </span>
            </div>
            <p className="text-[11px] text-[#8e8e93] mt-0.5">
              Mathematical momentum envelopes, zero-leakage regression models, and multi-market coverage.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="spatial-pill flex items-center gap-1.5 px-3 py-1 text-[11px] text-[#636366]">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span>FastAPI Python Core</span>
          </div>
          <div className="spatial-pill flex items-center gap-1.5 px-3 py-1 text-[11px] text-[#636366]">
            <Database className="w-3 h-3 text-cyan-600" />
            <span>{isWatchlistDemoMode ? 'In-Memory Resilient Store' : 'MongoDB Storage'}</span>
          </div>
          <div className="spatial-pill flex items-center gap-1.5 px-3 py-1 text-[11px] text-[#636366]">
            <Activity className="w-3 h-3 text-emerald-600" />
            <span>NSE & US Feeds</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
