import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  Sparkles,
  TrendingUp,
  TrendingDown,
  Activity,
  Cpu,
  Sliders
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
      <div className="p-6 space-y-6 max-w-[1216px] mx-auto">
        <LoadingSkeleton type="card" count={3} />
        <LoadingSkeleton type="table" count={4} />
      </div>
    );
  }

  if (error || !insights) {
    return (
      <div className="p-6 max-w-[1216px] mx-auto">
        <ErrorMessage message={error} onRetry={fetchInsights} />
      </div>
    );
  }

  const getSentimentPill = (sent) => {
    if (sent.includes('Bullish') || sent.includes('Positive')) {
      return (
        <span className="text-[11px] font-medium px-2.5 py-0.5 rounded-full bg-slash-sageBg border border-slash-sage/30 text-slash-sage">
          {sent}
        </span>
      );
    }
    if (sent.includes('Bearish') || sent.includes('Negative') || sent.includes('Caution')) {
      return (
        <span className="text-[11px] font-medium px-2.5 py-0.5 rounded-full bg-slash-roseBg border border-slash-rose/30 text-slash-rose">
          {sent}
        </span>
      );
    }
    return (
      <span className="text-[11px] font-medium px-2.5 py-0.5 rounded-full bg-slash-carbon border border-slash-graphite text-slash-copper">
        {sent}
      </span>
    );
  };

  return (
    <div className="p-4 lg:p-8 space-y-10 max-w-[1216px] mx-auto">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-slash-graphite">
        <div>
          <div className="text-[13px] font-semibold text-slash-copper uppercase tracking-[-0.02em] mb-1">
            Deterministic Natural Language Synthesis
          </div>
          <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-normal text-white tracking-[0.01em]">
            Market Insights — <span className="text-slash-copper">{insights.symbol}</span>
          </h1>
          <p className="text-sm text-slash-fog mt-1">{insights.name}</p>
        </div>

        <div className="flex items-center gap-2.5">
          <Link
            to={`/predictions/${encodeURIComponent(insights.symbol)}`}
            className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-slash-onyx hover:bg-slash-carbon border border-slash-steel text-xs font-medium text-white transition"
          >
            <Cpu className="w-3.5 h-3.5 text-slash-copper" />
            <span>ML Models</span>
          </Link>
          <Link
            to={`/technical/${encodeURIComponent(insights.symbol)}`}
            className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-slash-onyx hover:bg-slash-carbon border border-slash-graphite text-xs font-medium text-white transition"
          >
            <Sliders className="w-3.5 h-3.5 text-slash-fog" />
            <span>Technicals</span>
          </Link>
        </div>
      </div>

      <DisclaimerBanner compact />

      {/* Executive Summary Editorial Card */}
      <div className="rounded-[10px] bg-slash-onyx border border-slash-graphite p-8 lg:p-10 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-[13px] font-semibold text-slash-copper uppercase tracking-[-0.02em]">
              Editorial Consensus
            </div>
            <h2 className="font-serif text-2xl font-normal text-white tracking-[0.01em] mt-0.5">
              Market Regime Summary
            </h2>
          </div>
          {getSentimentPill(insights.overall_sentiment)}
        </div>

        <p className="text-base text-slash-bone leading-relaxed max-w-3xl font-light">
          {insights.summary_paragraph}
        </p>

        <div className="pt-4 border-t border-slash-graphite flex items-center justify-between text-xs text-slash-fog">
          <span>Settlement Reference: {formatCurrency(insights.current_price, insights.currency)}</span>
          <span className="font-mono text-slash-ash">Engine: Deterministic Rule Synthesis v1.0</span>
        </div>
      </div>

      {/* Quantitative ML Forecast Narrative */}
      <div className="rounded-[10px] bg-slash-onyx border border-slash-graphite p-6 lg:p-8 space-y-3">
        <div className="text-[13px] font-semibold text-slash-copper uppercase tracking-[-0.02em]">
          Algorithmic Outlook
        </div>
        <h3 className="font-serif text-xl font-normal text-white tracking-[0.01em]">
          Machine Learning Forecast Perspective
        </h3>
        <p className="text-sm text-slash-fog leading-relaxed p-4 rounded-[8px] bg-slash-carbon border border-slash-graphite">
          {insights.ml_forecast_perspective}
        </p>
      </div>

      {/* Categorized Breakdown */}
      <div className="space-y-4">
        <h2 className="font-serif text-2xl font-normal text-white tracking-[0.01em]">
          Indicator Signal Breakdown
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {insights.bullet_insights.map((item, idx) => (
            <div
              key={idx}
              className="rounded-[10px] bg-slash-onyx border border-slash-graphite p-6 space-y-3 hover:border-slash-slate transition"
            >
              <div className="flex items-center justify-between">
                <h4 className="font-medium text-sm text-white">{item.category}</h4>
                {getSentimentPill(item.sentiment)}
              </div>
              <p className="text-xs text-slash-fog leading-relaxed">{item.detail}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
