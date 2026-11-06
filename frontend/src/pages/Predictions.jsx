import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  Cpu,
  TrendingUp,
  TrendingDown,
  Award,
  Sparkles,
  Clock,
  CheckCircle2
} from 'lucide-react';
import { stockApi, formatCurrency, formatPercent } from '../services/api';
import { useStock } from '../context/StockContext';
import LoadingSkeleton from '../components/LoadingSkeleton';
import ErrorMessage from '../components/ErrorMessage';
import DisclaimerBanner from '../components/DisclaimerBanner';
import {
  ResponsiveContainer,
  ComposedChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid
} from 'recharts';

export default function Predictions() {
  const { symbol: routeSymbol } = useParams();
  const { selectedSymbol, setSelectedSymbol } = useStock();

  const activeSymbol = routeSymbol || selectedSymbol || 'RELIANCE.NS';

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [prediction, setPrediction] = useState(null);

  const fetchPrediction = async () => {
    try {
      setLoading(true);
      setError(null);
      setSelectedSymbol(activeSymbol);
      const res = await stockApi.getPrediction(activeSymbol);
      setPrediction(res);
    } catch (err) {
      console.error('Failed to run ML prediction:', err);
      setError(err.response?.data?.detail || `Failed to run ML models for ${activeSymbol}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPrediction();
  }, [activeSymbol]);

  if (loading) {
    return (
      <div className="p-6 space-y-6 max-w-6xl mx-auto">
        <div className="p-8 rounded-2xl bg-white border border-[#e8e8e6] animate-pulse space-y-4">
          <div className="h-6 w-48 bg-[#f0f0ee] rounded-full"></div>
          <div className="h-10 w-96 bg-[#f0f0ee] rounded-full"></div>
        </div>
        <LoadingSkeleton type="chart" />
        <LoadingSkeleton type="table" count={3} />
      </div>
    );
  }

  if (error || !prediction) {
    return (
      <div className="p-6 max-w-6xl mx-auto">
        <ErrorMessage message={error} onRetry={fetchPrediction} />
      </div>
    );
  }

  const isPredictedUp = prediction.estimated_change >= 0;

  return (
    <div className="space-y-8 font-sans text-[#636366]">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-black/5">
        <div>
          <div className="text-xs uppercase tracking-wider text-[#8e8e93] font-medium mb-1">
            Supervised Machine Learning
          </div>
          <h1 className="text-3xl sm:text-4xl font-semibold text-[#0f1115] tracking-tight">
            Next-Day Price Prediction — <span className="text-emerald-700">{prediction.symbol}</span>
          </h1>
          <p className="text-sm text-[#8e8e93] mt-1">{prediction.name}</p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            to={`/models/${encodeURIComponent(prediction.symbol)}`}
            className="spatial-pill flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-[#0f1115] transition"
          >
            <Award className="w-3.5 h-3.5 text-cyan-600" />
            <span>Validation Metrics</span>
          </Link>
          <Link
            to={`/insights/${encodeURIComponent(prediction.symbol)}`}
            className="spatial-pill flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-[#0f1115] transition"
          >
            <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
            <span>Market Synthesis</span>
          </Link>
        </div>
      </div>

      <DisclaimerBanner />

      {/* Hero Prediction Ledger Card (Liquid Glass Panel) */}
      <div className="liquid-glass-panel p-6 sm:p-10 space-y-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-center">
          {/* Observed Close */}
          <div>
            <div className="text-xs uppercase font-semibold text-[#8e8e93] tracking-wider">
              Last Observed Close
            </div>
            <div className="text-4xl sm:text-5xl font-semibold text-[#0f1115] mt-2">
              {formatCurrency(prediction.current_price, prediction.currency)}
            </div>
            <div className="text-xs text-[#8e8e93] flex items-center gap-1.5 mt-2">
              <Clock className="w-3.5 h-3.5 text-cyan-600" />
              <span>Feature Cutoff: {prediction.last_trading_date}</span>
            </div>
          </div>

          {/* Model Projected Close */}
          <div className="p-6 rounded-2xl bg-white/40 border border-white/60 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-emerald-700">
                Projected Settlement
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/80 border border-black/5 text-[#0f1115] font-semibold">
                {prediction.selected_model}
              </span>
            </div>

            <div className="text-3xl font-semibold text-[#0f1115]">
              {formatCurrency(prediction.predicted_price, prediction.currency)}
            </div>

            <div
              className={`inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full ${
                isPredictedUp
                  ? 'liquid-accent-pill text-emerald-800'
                  : 'bg-rose-500/10 text-rose-700 border border-rose-500/20'
              }`}
            >
              {isPredictedUp ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
              <span>{isPredictedUp ? '+' : ''}{formatCurrency(prediction.estimated_change, prediction.currency)} ({formatPercent(prediction.estimated_change_percent)})</span>
            </div>
          </div>

          {/* Anti-Leakage Feature Safeguards */}
          <div className="p-6 rounded-2xl bg-white/40 border border-white/60 space-y-3">
            <div className="text-xs font-semibold uppercase tracking-wider text-[#0f1115] flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Zero-Leakage Safeguard</span>
            </div>
            <p className="text-xs text-[#8e8e93] leading-relaxed">
              Target shifted backward (Target[t] = Close[t + 1]). Splits conducted strictly chronologically without random shuffling to prevent future lookahead.
            </p>
            <div className="text-[11px] text-[#8e8e93]">
              Feature Matrix: 20-SMA, 50-SMA, RSI-14, MACD, Volume Delta
            </div>
          </div>
        </div>
      </div>

      {/* Model Benchmark Comparative Table */}
      <div className="liquid-glass-panel overflow-hidden">
        <div className="px-6 py-4 bg-[#fafaf8] border-b border-[#e8e8e6] flex items-center justify-between">
          <h3 className="text-sm font-medium text-[#111]">
            Comparative Model Performance
          </h3>
          <span className="text-xs text-[#9a9a9a]">Out-of-sample Evaluation</span>
        </div>

        <div className="p-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {prediction.models_compared && Object.entries(prediction.models_compared).map(([name, data]) => (
              <div key={name} className="p-5 rounded-xl bg-[#fafaf8] border border-[#e8e8e6] space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-medium text-sm text-[#111]">{name}</span>
                  {name === prediction.selected_model && (
                    <span className="text-[10px] font-semibold uppercase px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                      Best Model
                    </span>
                  )}
                </div>
                <div className="text-lg font-semibold text-[#111]">
                  Target: {formatCurrency(data.predicted_price, prediction.currency)}
                </div>
                <div className="text-xs text-[#7b7b7b]">
                  MAE: {data.mae ? data.mae.toFixed(2) : '—'} | RMSE: {data.rmse ? data.rmse.toFixed(2) : '—'}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
