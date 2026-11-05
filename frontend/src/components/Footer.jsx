import React from 'react';
import { Database, Activity, TrendingUp, ShieldCheck, Cpu, ArrowUpRight } from 'lucide-react';
import { useStock } from '../context/StockContext';
import StockLogo from './StockLogo';

export default function Footer() {
  const { isWatchlistDemoMode } = useStock();

  return (
    <footer className="mt-28 border-t border-white/[0.08] bg-[#070a10] text-xs text-gray-400 py-14 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Background ambient mesh */}
      <div className="absolute top-0 left-1/3 w-96 h-96 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-cyan-500/5 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto space-y-10 relative z-10">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-8 pb-8 border-b border-white/[0.06]">
          {/* Brand Info */}
          <div className="flex items-start gap-4">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-emerald-500/20 via-teal-500/10 to-indigo-500/20 border border-emerald-500/30 p-2 shadow-lg flex items-center justify-center shrink-0">
              <StockLogo size={26} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-display font-bold text-lg text-white">StockSense AI</span>
                <span className="text-[10px] font-tech font-bold uppercase px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  Quantum Alpha v2.5
                </span>
              </div>
              <p className="text-xs text-gray-400 mt-1 max-w-md">
                Precision quantitative machine learning, non-lagging technical momentum, and zero-lookahead price trajectory modeling.
              </p>
            </div>
          </div>

          {/* Infrastructure Health Status Badges */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/[0.04] border border-white/[0.08] text-gray-300">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-xs font-medium">FastAPI Python Microservice</span>
            </div>
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/[0.04] border border-white/[0.08] text-gray-300">
              <Database className="w-3.5 h-3.5 text-cyan-400" />
              <span className="text-xs font-medium">{isWatchlistDemoMode ? 'In-Memory Resilient Store' : 'MongoDB Atlas Active'}</span>
            </div>
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/[0.04] border border-white/[0.08] text-gray-300">
              <Activity className="w-3.5 h-3.5 text-indigo-400" />
              <span className="text-xs font-medium">NSE / BSE & US Data Streams</span>
            </div>
          </div>
        </div>

        {/* Legal Disclaimer & Attribution */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-[11px] text-gray-500">
          <p className="leading-relaxed max-w-3xl">
            IMPORTANT LEGAL DISCLAIMER: StockSense AI is strictly an educational quantitative engineering and algorithmic modeling demonstration platform.
            Trading equities, options, and commodities involves severe financial risk. Past statistical validation and ML forecasts do not guarantee future capital preservation or profits.
          </p>
          <div className="flex items-center gap-4 shrink-0 text-gray-400 font-mono text-[11px]">
            <span>© {new Date().getFullYear()} StockSense AI</span>
            <span>•</span>
            <span className="text-emerald-400 flex items-center gap-1">
              <TrendingUp className="w-3 h-3" /> Zero-Data-Leakage Verified
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
