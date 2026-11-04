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
    <div className="p-4 lg:p-8 space-y-10 max-w-[1216px] mx-auto">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-slash-graphite">
        <div>
          <div className="text-[13px] font-semibold text-slash-copper uppercase tracking-[-0.02em] mb-1">
            Personal Portfolio Ledger
          </div>
          <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-normal text-white tracking-[0.01em]">
            Watchlist Ledger
          </h1>
          <p className="text-sm text-slash-fog mt-1">
            Track live prices, percentage shifts, and trigger predictive machine learning for saved securities.
          </p>
        </div>

        {/* Persistence Status */}
        <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-slash-onyx border border-slash-graphite text-xs">
          <Database className="w-3.5 h-3.5 text-slash-copper" />
          <span className="text-slash-fog">Storage:</span>
          <span className="font-medium text-white">
            {isWatchlistDemoMode ? 'Demo In-Memory Mode' : 'MongoDB Persistence'}
          </span>
        </div>
      </div>

      <DisclaimerBanner compact />

      {/* Add Stock to Watchlist Pill Input Form */}
      <div className="rounded-[10px] bg-slash-onyx border border-slash-graphite p-6">
        <form onSubmit={handleAddSubmit} className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slash-fog absolute left-4 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Enter ticker (e.g. RELIANCE.NS, TCS.NS, NVDA, AAPL)..."
              value={inputSymbol}
              onChange={(e) => setInputSymbol(e.target.value)}
              className="w-full bg-slash-carbon border border-slash-graphite rounded-full pl-11 pr-4 py-2.5 text-sm text-slash-bone placeholder-slash-ash focus:outline-none focus:border-white transition font-mono uppercase"
            />
          </div>
          <button
            type="submit"
            disabled={submitting || !inputSymbol.trim()}
            className="flex items-center justify-center gap-2 px-6 py-2.5 rounded-full bg-white text-black hover:bg-slate-200 disabled:opacity-50 text-xs font-semibold transition"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add to Ledger</span>
          </button>
        </form>
      </div>

      {/* Watchlist Table */}
      {watchlist.length === 0 ? (
        <div className="rounded-[10px] bg-slash-onyx border border-slash-graphite p-12 text-center space-y-4">
          <div className="w-12 h-12 rounded-full bg-slash-carbon border border-slash-graphite flex items-center justify-center mx-auto text-slash-fog">
            <Bookmark className="w-5 h-5" />
          </div>
          <h3 className="font-serif text-2xl font-normal text-white">Your Watchlist Ledger is Empty</h3>
          <p className="text-xs text-slash-fog max-w-sm mx-auto">
            Search for Indian or US equities and add them to monitor price trends and quick-launch ML predictions.
          </p>
          <button
            onClick={() => navigate('/explore')}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-white text-black text-xs font-semibold hover:bg-slate-200 transition mt-2"
          >
            Explore Equities <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      ) : (
        <div className="rounded-[10px] bg-slash-onyx border border-slash-graphite overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slash-carbon text-xs uppercase font-medium text-slash-fog border-b border-slash-graphite">
                <tr>
                  <th className="px-6 py-4">Security</th>
                  <th className="px-6 py-4">Market</th>
                  <th className="px-6 py-4 text-right">Latest Settlement</th>
                  <th className="px-6 py-4 text-right">24h Change</th>
                  <th className="px-6 py-4 text-right">Volume</th>
                  <th className="px-6 py-4 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slash-graphite/50">
                {watchlist.map((item) => {
                  const isPositive = item.change >= 0;
                  return (
                    <tr
                      key={item.symbol}
                      className="hover:bg-slash-carbon transition group cursor-pointer"
                      onClick={() => {
                        setSelectedSymbol(item.symbol);
                        navigate(`/stocks/${encodeURIComponent(item.symbol)}`);
                      }}
                    >
                      <td className="px-6 py-4">
                        <div className="font-mono font-bold text-white group-hover:text-slash-copper transition">
                          {item.symbol}
                        </div>
                        <div className="text-xs text-slash-fog truncate max-w-xs">
                          {item.name}
                        </div>
                      </td>

                      <td className="px-6 py-4">
                        <span
                          className={`text-[10px] font-medium px-2 py-0.5 rounded-full border ${
                            item.market === 'IN'
                              ? 'border-slash-copper/40 text-slash-copper bg-slash-copperGlow'
                              : 'border-slash-steel text-slash-silver bg-slash-carbon'
                          }`}
                        >
                          {item.market === 'IN' ? 'NSE/BSE (₹)' : 'US ($)'}
                        </span>
                      </td>

                      <td className="px-6 py-4 text-right font-serif text-base text-white">
                        {formatCurrency(item.price, item.currency)}
                      </td>

                      <td className="px-6 py-4 text-right">
                        <div
                          className={`inline-flex items-center gap-1 font-mono text-xs font-medium px-2.5 py-0.5 rounded-full border ${
                            isPositive
                              ? 'text-slash-sage bg-slash-sageBg border-slash-sage/30'
                              : 'text-slash-rose bg-slash-roseBg border-slash-rose/30'
                          }`}
                        >
                          {isPositive ? (
                            <TrendingUp className="w-3 h-3" />
                          ) : (
                            <TrendingDown className="w-3 h-3" />
                          )}
                          <span>{formatPercent(item.percent_change)}</span>
                        </div>
                      </td>

                      <td className="px-6 py-4 text-right font-mono text-xs text-slash-fog">
                        {formatVolume(item.volume)}
                      </td>

                      <td className="px-6 py-4 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedSymbol(item.symbol);
                              navigate(`/predictions/${encodeURIComponent(item.symbol)}`);
                            }}
                            className="p-1.5 rounded-full bg-slash-carbon hover:bg-slash-graphite text-slash-fog hover:text-white border border-slash-graphite transition"
                            title="ML Predictions"
                          >
                            <Cpu className="w-3.5 h-3.5" />
                          </button>

                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedSymbol(item.symbol);
                              navigate(`/technical/${encodeURIComponent(item.symbol)}`);
                            }}
                            className="p-1.5 rounded-full bg-slash-carbon hover:bg-slash-graphite text-slash-fog hover:text-white border border-slash-graphite transition"
                            title="Technical Analysis"
                          >
                            <Sliders className="w-3.5 h-3.5" />
                          </button>

                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleWatchlist(item.symbol);
                            }}
                            className="p-1.5 rounded-full bg-slash-carbon hover:bg-slash-roseBg text-slash-fog hover:text-slash-rose border border-slash-graphite transition"
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
