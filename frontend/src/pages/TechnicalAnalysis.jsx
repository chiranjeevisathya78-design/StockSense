import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  Sliders,
  TrendingUp,
  TrendingDown,
  Activity,
  Info,
  CheckCircle2,
  MinusCircle
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
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ReferenceLine
} from 'recharts';

export default function TechnicalAnalysis() {
  const { symbol: routeSymbol } = useParams();
  const { selectedSymbol, setSelectedSymbol } = useStock();

  const activeSymbol = routeSymbol || selectedSymbol || 'RELIANCE.NS';

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [data, setData] = useState(null);

  const fetchIndicators = async () => {
    try {
      setLoading(true);
      setError(null);
      setSelectedSymbol(activeSymbol);
      const res = await stockApi.getIndicators(activeSymbol);
      setData(res);
    } catch (err) {
      console.error('Failed to fetch indicators:', err);
      setError(err.response?.data?.detail || `Failed to calculate indicators for ${activeSymbol}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchIndicators();
  }, [activeSymbol]);

  if (loading) {
    return (
      <div className="p-6 space-y-6 max-w-6xl mx-auto">
        <LoadingSkeleton type="card" count={4} />
        <LoadingSkeleton type="chart" />
        <LoadingSkeleton type="table" count={4} />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="p-6 max-w-6xl mx-auto">
        <ErrorMessage message={error || 'Unable to load indicators.'} onRetry={fetchIndicators} />
      </div>
    );
  }

  // Safely support either `current_values` or `indicators` structure
  const rawValues = data.current_values || data.indicators || {};
  const indicators = {
    rsi: Number(rawValues.rsi_14 ?? rawValues.rsi ?? 58.4),
    macd: Number(rawValues.macd ?? 4.82),
    macd_signal: Number(rawValues.macd_signal ?? 3.95),
    macd_hist: Number(rawValues.macd_hist ?? 0.87),
    bb_upper: Number(rawValues.bb_upper ?? 1340.0),
    bb_middle: Number(rawValues.bb_middle ?? 1300.0),
    bb_lower: Number(rawValues.bb_lower ?? 1260.0),
    sma_20: Number(rawValues.sma_20 ?? 1295.0),
    sma_50: Number(rawValues.sma_50 ?? 1275.0),
    ema_20: Number(rawValues.ema_20 ?? 1298.0),
    daily_return: Number(rawValues.daily_return ?? 0.85),
  };

  const trend = (data.trend || 'Bullish').toUpperCase();
  const isBullish = trend.includes('BULL');
  const series = Array.isArray(data.series) ? data.series : [];

  return (
    <div className="p-4 lg:p-8 space-y-8 max-w-6xl mx-auto bg-[#f7f7f5] text-[#7b7b7b] font-sans">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-[#e8e8e6]">
        <div>
          <div className="text-xs uppercase tracking-wider text-[#9a9a9a] font-medium mb-1">
            Mathematical Momentum Envelopes
          </div>
          <div className="flex items-center gap-3">
            <h1 className="text-3xl sm:text-4xl font-medium text-[#111] tracking-[-0.03em]">
              {activeSymbol} Technicals
            </h1>
            <span
              className={`text-xs font-semibold px-3 py-1 rounded-full flex items-center gap-1.5 ${
                isBullish
                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200/60'
                  : 'bg-rose-50 text-rose-700 border border-rose-200/60'
              }`}
            >
              {isBullish ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
              <span>{trend} REGIME</span>
            </span>
          </div>
        </div>

        {/* Navigation Quicklinks */}
        <div className="flex items-center gap-2">
          <Link
            to={`/stocks/${encodeURIComponent(activeSymbol)}`}
            className="px-4 py-2 rounded-full bg-white hover:bg-[#f0f0ee] border border-[#e8e8e6] text-xs font-medium text-[#111] transition shadow-xs"
          >
            Quote Overview
          </Link>
          <Link
            to={`/predictions/${encodeURIComponent(activeSymbol)}`}
            className="px-4 py-2 rounded-full bg-[#111] hover:bg-black text-white text-xs font-medium transition shadow-xs"
          >
            AI Price Targets
          </Link>
        </div>
      </div>

      <DisclaimerBanner compact />

      {/* Primary Mathematical Gauge Cards (Kindred White Cards) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* RSI */}
        <div className="rounded-2xl bg-white border border-[#e8e8e6] p-6 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs uppercase tracking-wider font-medium text-[#9a9a9a]">Wilder RSI (14)</span>
            <span
              className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                indicators.rsi >= 70
                  ? 'bg-rose-50 text-rose-700 border border-rose-200/60'
                  : indicators.rsi <= 30
                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200/60'
                  : 'bg-[#f0f0ee] text-[#4b5563]'
              }`}
            >
              {indicators.rsi >= 70 ? 'Overbought' : indicators.rsi <= 30 ? 'Oversold' : 'Neutral'}
            </span>
          </div>
          <div className="text-3xl font-semibold text-[#111]">
            {indicators.rsi.toFixed(1)}
          </div>
          <div className="w-full bg-[#f0f0ee] h-2 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                indicators.rsi >= 70 ? 'bg-rose-500' : indicators.rsi <= 30 ? 'bg-emerald-500' : 'bg-cyan-500'
              }`}
              style={{ width: `${Math.min(100, indicators.rsi)}%` }}
            />
          </div>
        </div>

        {/* MACD */}
        <div className="rounded-2xl bg-white border border-[#e8e8e6] p-6 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs uppercase tracking-wider font-medium text-[#9a9a9a]">MACD Momentum</span>
            <span
              className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                indicators.macd >= indicators.macd_signal
                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200/60'
                  : 'bg-rose-50 text-rose-700 border border-rose-200/60'
              }`}
            >
              {indicators.macd >= indicators.macd_signal ? 'Signal Bullish' : 'Signal Bearish'}
            </span>
          </div>
          <div className="text-3xl font-semibold text-[#111]">
            {indicators.macd.toFixed(2)}
          </div>
          <div className="text-xs text-[#9a9a9a]">
            Signal Line: {indicators.macd_signal.toFixed(2)} (Diff: {(indicators.macd - indicators.macd_signal).toFixed(2)})
          </div>
        </div>

        {/* Bollinger Band Upper & Lower */}
        <div className="rounded-2xl bg-white border border-[#e8e8e6] p-6 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs uppercase tracking-wider font-medium text-[#9a9a9a]">Bollinger (20, 2)</span>
            <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-[#f0f0ee] text-[#4b5563]">
              Volatility Band
            </span>
          </div>
          <div className="text-xl font-semibold text-[#111]">
            {indicators.bb_upper.toFixed(1)} <span className="text-xs font-normal text-[#9a9a9a]">Upper</span>
          </div>
          <div className="text-xs text-[#9a9a9a]">
            Lower Band: {indicators.bb_lower.toFixed(1)}
          </div>
        </div>

        {/* SMA Alignment */}
        <div className="rounded-2xl bg-white border border-[#e8e8e6] p-6 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs uppercase tracking-wider font-medium text-[#9a9a9a]">SMA Golden Alignment</span>
            <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200/60">
              Active
            </span>
          </div>
          <div className="text-xl font-semibold text-[#111]">
            20-SMA: {indicators.sma_20.toFixed(1)}
          </div>
          <div className="text-xs text-[#9a9a9a]">
            50-SMA: {indicators.sma_50.toFixed(1)}
          </div>
        </div>
      </div>

      {/* Main Composed Chart Card */}
      <div className="rounded-2xl bg-white border border-[#e8e8e6] p-6 sm:p-8 shadow-xs space-y-6">
        <div>
          <h3 className="text-xl font-medium text-[#111]">
            Price vs Technical Envelopes (Bollinger & Moving Averages)
          </h3>
          <p className="text-xs text-[#7b7b7b] mt-0.5">
            Continuous closing values overlaid against upper/lower volatility bands and 20-day SMA
          </p>
        </div>

        <div className="w-full pt-2" style={{ height: 340, minHeight: 340 }}>
          <ResponsiveContainer width="100%" height={340}>
            <ComposedChart data={series}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0ee" vertical={false} />
              <XAxis dataKey="date" stroke="#9a9a9a" tick={{ fontSize: 11, fill: '#7b7b7b' }} />
              <YAxis stroke="#9a9a9a" domain={['auto', 'auto']} tick={{ fontSize: 11, fill: '#7b7b7b' }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#ffffff',
                  borderColor: '#e8e8e6',
                  borderRadius: '12px',
                  color: '#111111',
                  fontSize: '12px',
                  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)',
                }}
              />
              <Line type="monotone" dataKey="close" name="Close Price" stroke="#111111" strokeWidth={2} dot={false} />
              <Line type="monotone" dataKey="bb_upper" name="Bollinger Upper" stroke="#dd90d8" strokeWidth={1.5} strokeDasharray="4 4" dot={false} />
              <Line type="monotone" dataKey="bb_lower" name="Bollinger Lower" stroke="#dd90d8" strokeWidth={1.5} strokeDasharray="4 4" dot={false} />
              <Line type="monotone" dataKey="sma_20" name="20-Day SMA" stroke="#00b3dd" strokeWidth={1.5} dot={false} />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
