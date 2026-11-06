import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  Sparkles,
  TrendingUp,
  TrendingDown,
  Activity,
  Cpu,
  Sliders,
  CheckCircle2
} from 'lucide-react';
import { stockApi, formatCurrency } from '../services/api';
import { useStock } from '../context/StockContext';
import LoadingSkeleton from '../components/LoadingSkeleton';
import ErrorMessage from '../components/ErrorMessage';
import DisclaimerBanner from '../components/DisclaimerBanner';

export default function MarketInsights() {
  const { symbol: routeSymbol } = useParams();
  const { selectedSymbol, setSelectedSymbol } = useStock();

  const activeSymbol = routeSymbol || selectedSymbol || 'RELIANCE.NS';

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [insights, setInsights] = useState(null);

  const fetchInsights = async () => {
    try {
      setLoading(true);
      setError(null);
      setSelectedSymbol(activeSymbol);
      const res = await stockApi.getInsights(activeSymbol);
      setInsights(res);
    } catch (err) {
      console.error('Failed to load market insights:', err);
      setError(err.response?.data?.detail || `Failed to generate insights for ${activeSymbol}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInsights();
  }, [activeSymbol]);

  if (loading) {
    return (
      <div className="p-6 space-y-6 max-w-6xl mx-auto">
        <LoadingSkeleton type="card" count={3} />
        <LoadingSkeleton type="table" count={4} />
      </div>
    );
  }

  if (error || !insights) {
    return (
      <div className="p-6 max-w-6xl mx-auto">
        <ErrorMessage message={error} onRetry={fetchInsights} />
      </div>
    );
  }

  const getSentimentPill = (sent) => {
    if (sent.includes('Bullish') || sent.includes('Positive')) {
      return (
        <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200/60">
          {sent}
        </span>
      );
    }
    if (sent.includes('Bearish') || sent.includes('Negative')) {
      return (
        <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-rose-50 text-rose-700 border border-rose-200/60">
          {sent}
        </span>
      );
    }
    return (
      <span className="text-xs font-medium px-2.5 py-0.5 rounded-full bg-[#f0f0ee] text-[#4b5563]">
        {sent}
      </span>
    );
  };

  return (
    <div className="space-y-8 font-sans text-[#636366]">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-black/5">
        <div>
          <div className="text-xs uppercase tracking-wider text-[#8e8e93] font-medium mb-1">
            Deterministic Natural Language Processing
          </div>
          <h1 className="text-3xl sm:text-4xl font-semibold text-[#0f1115] tracking-tight">
            Executive Market Commentary — <span className="text-emerald-700">{activeSymbol}</span>
          </h1>
          <p className="text-sm text-[#8e8e93] mt-1">
            Algorithmic syntheses generated dynamically from multi-dimensional quantitative signals
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            to={`/technical/${encodeURIComponent(activeSymbol)}`}
            className="spatial-pill flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-[#0f1115] transition"
          >
            <Sliders className="w-3.5 h-3.5 text-[#8e8e93]" />
            <span>Technicals</span>
          </Link>
          <Link
            to={`/predictions/${encodeURIComponent(activeSymbol)}`}
            className="liquid-glass-btn flex items-center gap-1.5 px-5 py-2 text-xs font-semibold transition"
          >
            <Cpu className="w-3.5 h-3.5" />
            <span>AI Targets</span>
          </Link>
        </div>
      </div>

      <DisclaimerBanner compact />

      {/* Primary Narrative Summary Card (Liquid Glass Panel) */}
      <div className="liquid-glass-panel p-6 sm:p-10 space-y-6">
        <div className="flex items-center justify-between pb-4 border-b border-[#e8e8e6]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold">
              <Sparkles className="w-4 h-4" />
            </div>
            <h3 className="text-lg font-medium text-[#111]">
              Executive Synthesis Summary
            </h3>
          </div>
          {getSentimentPill(insights.sentiment || 'Neutral Stance')}
        </div>

        <p className="text-base text-[#111] leading-relaxed font-normal">
          {insights.summary}
        </p>

        {insights.key_points && insights.key_points.length > 0 && (
          <div className="pt-4 border-t border-[#e8e8e6] space-y-2.5">
            <h4 className="text-xs uppercase tracking-wider font-semibold text-[#9a9a9a]">
              Key Factor Observations
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
              {insights.key_points.map((pt, idx) => (
                <div key={idx} className="p-3.5 rounded-xl bg-[#fafaf8] border border-[#e8e8e6] flex items-start gap-2.5 text-xs text-[#4b5563]">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span className="leading-relaxed">{pt}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
