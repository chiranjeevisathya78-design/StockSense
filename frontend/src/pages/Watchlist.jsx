import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Bookmark,
  Trash2,
  TrendingUp,
  TrendingDown,
  Plus,
  ArrowRight,
  Database,
  Sliders,
  Cpu,
  Search
} from 'lucide-react';
import { useStock } from '../context/StockContext';
import { formatCurrency, formatPercent, formatVolume } from '../services/api';
import DisclaimerBanner from '../components/DisclaimerBanner';

export default function Watchlist() {
  const {
    watchlist,
    isWatchlistDemoMode,
    toggleWatchlist,
    setSelectedSymbol
  } = useStock();
  const navigate = useNavigate();

  const [inputSymbol, setInputSymbol] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleAddSubmit = async (e) => {
    e.preventDefault();
    if (!inputSymbol.trim()) return;
    try {
      setSubmitting(true);
      await toggleWatchlist(inputSymbol.trim());
      setInputSymbol('');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-8 font-sans text-[#636366]">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-black/5">
        <div>
          <div className="text-xs uppercase tracking-wider text-[#8e8e93] font-medium mb-1">
            Personal Portfolio Ledger
          </div>
          <h1 className="text-3xl sm:text-4xl font-semibold text-[#0f1115] tracking-tight">
            Watchlist Ledger
          </h1>
          <p className="text-sm text-[#8e8e93] mt-1">
            Track live prices, percentage shifts, and trigger predictive machine learning for saved securities.
          </p>
        </div>

        {/* Persistence Status */}
        <div className="spatial-pill flex items-center gap-2 px-4 py-2 text-xs">
          <Database className="w-3.5 h-3.5 text-cyan-600" />
          <span className="text-[#8e8e93]">Storage:</span>
          <span className="font-semibold text-[#0f1115]">
            {isWatchlistDemoMode ? 'Demo In-Memory Mode' : 'MongoDB Persistence'}
          </span>
        </div>
      </div>

      <DisclaimerBanner compact />

      {/* Manual Quick Add Form */}
      <div className="liquid-glass-panel p-6">
        <form onSubmit={handleAddSubmit} className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-[#8e8e93] absolute left-4 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Add symbol to watchlist (e.g. RELIANCE.NS, TSLA, AAPL)..."
              value={inputSymbol}
              onChange={(e) => setInputSymbol(e.target.value.toUpperCase())}
              className="w-full neo-skeuo-inset pl-11 pr-4 py-2.5 text-sm text-[#0f1115] placeholder-[#8e8e93] focus:outline-none transition"
            />
          </div>
          <button
            type="submit"
            disabled={submitting || !inputSymbol.trim()}
            className="liquid-glass-btn px-6 py-2.5 text-xs font-semibold flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add to Watchlist</span>
          </button>
        </form>
      </div>

      {/* Watchlist Table / Empty State */}
      {watchlist.length === 0 ? (
        <div className="liquid-glass-panel p-12 text-center space-y-4">
          <div className="w-12 h-12 rounded-full bg-black/5 text-[#8e8e93] flex items-center justify-center mx-auto">
            <Bookmark className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-semibold text-[#0f1115]">Your Watchlist is Empty</h3>
          <p className="text-xs text-[#8e8e93] max-w-sm mx-auto">
            Explore active NSE and US equities and click the bookmark icon to monitor prices and trigger predictions here.
          </p>
          <button
            onClick={() => navigate('/explore')}
            className="liquid-glass-btn px-5 py-2.5 text-xs font-semibold cursor-pointer"
          >
            Browse Market Universe
          </button>
        </div>
      ) : (
        <div className="rounded-2xl bg-white border border-[#e8e8e6] overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-[#fafaf8] text-xs uppercase font-medium text-[#9a9a9a] border-b border-[#e8e8e6]">
                <tr>
                  <th className="px-6 py-4">Security Symbol</th>
                  <th className="px-6 py-4">Security Name</th>
                  <th className="px-6 py-4 text-right">Latest Settlement</th>
                  <th className="px-6 py-4 text-right">24h Shift</th>
                  <th className="px-6 py-4 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#e8e8e6]">
                {watchlist.map((item) => {
                  const isPositive = (item.change || 0) >= 0;

                  return (
                    <tr
                      key={item.symbol}
                      className="hover:bg-[#fafaf8] transition cursor-pointer"
                      onClick={() => {
                        setSelectedSymbol(item.symbol);
                        navigate(`/stocks/${encodeURIComponent(item.symbol)}`);
                      }}
                    >
                      <td className="px-6 py-4 font-semibold text-[#111]">
                        {item.symbol}
                      </td>
                      <td className="px-6 py-4 text-xs text-[#7b7b7b]">
                        {item.name || item.symbol}
                      </td>
                      <td className="px-6 py-4 text-right font-medium text-sm text-[#111]">
                        {item.price ? formatCurrency(item.price, item.currency) : '—'}
                      </td>
                      <td className="px-6 py-4 text-right">
                        {item.change !== undefined ? (
                          <div
                            className={`inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-0.5 rounded-full ${
                              isPositive
                                ? 'text-emerald-700 bg-emerald-50 border border-emerald-200/60'
                                : 'text-rose-700 bg-rose-50 border border-rose-200/60'
                            }`}
                          >
                            {isPositive ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                            <span>{formatPercent(item.percent_change || 0)}</span>
                          </div>
                        ) : '—'}
                      </td>
                      <td className="px-6 py-4 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedSymbol(item.symbol);
                              navigate(`/predictions/${encodeURIComponent(item.symbol)}`);
                            }}
                            className="p-1.5 rounded-full bg-[#f0f0ee] hover:bg-[#e8e8e6] text-[#4b5563] hover:text-[#111] transition cursor-pointer"
                            title="View Prediction"
                          >
                            <Cpu className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleWatchlist(item.symbol);
                            }}
                            className="p-1.5 rounded-full hover:bg-rose-50 text-[#9a9a9a] hover:text-rose-600 transition cursor-pointer"
                            title="Remove from Watchlist"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
