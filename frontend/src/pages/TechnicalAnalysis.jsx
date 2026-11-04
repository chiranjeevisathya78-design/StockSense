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
      <div className="p-6 space-y-6 max-w-[1216px] mx-auto">
        <LoadingSkeleton type="card" count={4} />
        <LoadingSkeleton type="chart" />
        <LoadingSkeleton type="table" count={4} />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="p-6 max-w-[1216px] mx-auto">
        <ErrorMessage message={error} onRetry={fetchIndicators} />
      </div>
    );
  }

  const { current_values: vals, trend, trend_reasons, explanations, series } = data;
  const recentSeries = series.slice(-60);

  const getTrendBadge = (t) => {
    if (t === 'Bullish') {
      return (
        <div className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-slash-sageBg border border-slash-sage/30 text-slash-sage font-medium text-xs">
          <TrendingUp className="w-3.5 h-3.5" />
          <span>Bullish Trend Alignment</span>
        </div>
      );
    }
    if (t === 'Bearish') {
      return (
        <div className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-slash-roseBg border border-slash-rose/30 text-slash-rose font-medium text-xs">
          <TrendingDown className="w-3.5 h-3.5" />
          <span>Bearish Pressure Alignment</span>
        </div>
      );
    }
    return (
      <div className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-slash-carbon border border-slash-graphite text-slash-copper font-medium text-xs">
        <MinusCircle className="w-3.5 h-3.5" />
        <span>Sideways Equilibrium</span>
      </div>
    );
  };

  return (
    <div className="p-4 lg:p-8 space-y-10 max-w-[1216px] mx-auto">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-slash-graphite">
        <div>
          <div className="text-[13px] font-semibold text-slash-copper uppercase tracking-[-0.02em] mb-1">
            Quantitative Momentum & Trend Analysis
          </div>
          <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-normal text-white tracking-[0.01em]">
            Technical Indicators — <span className="text-slash-copper">{data.symbol}</span>
          </h1>
          <p className="text-sm text-slash-fog mt-1">{data.name}</p>
        </div>

        <div className="flex items-center gap-3">
          {getTrendBadge(trend)}
          <Link
            to={`/predictions/${encodeURIComponent(data.symbol)}`}
            className="px-5 py-2 rounded-full bg-white text-black hover:bg-slate-200 text-xs font-medium transition"
          >
            Launch ML Forecast →
          </Link>
        </div>
      </div>

      <DisclaimerBanner compact />

      {/* Transparent Trend Classification Card */}
      <div className="rounded-[10px] bg-slash-onyx border border-slash-graphite p-6 lg:p-8 space-y-4">
        <div className="text-[13px] font-semibold text-slash-copper uppercase tracking-[-0.02em]">
          Deterministic Rule Taxonomy
        </div>
        <h2 className="font-serif text-2xl font-normal text-white tracking-[0.01em]">
          Trend Classification Logic ({trend})
        </h2>
        <p className="text-xs text-slash-fog leading-relaxed">
          The regime classification is evaluated algorithmically from price versus moving averages, moving average crossover slope, 14-period RSI velocity, and MACD divergence:
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
          {trend_reasons.map((reason, idx) => (
            <div
              key={idx}
              className="flex items-start gap-3 p-3.5 rounded-[8px] bg-slash-carbon border border-slash-graphite text-xs text-slash-bone"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-slash-copper mt-1.5 shrink-0"></span>
              <span className="leading-relaxed">{reason}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Indicator Metrics Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
        <div className="rounded-[10px] bg-slash-onyx border border-slash-graphite p-4">
          <div className="text-[11px] text-slash-ash uppercase tracking-wider">Close Price</div>
          <div className="font-serif text-lg font-normal text-white mt-1">
            {vals.current_price?.toFixed(2)}
          </div>
        </div>

        <div className="rounded-[10px] bg-slash-onyx border border-slash-graphite p-4">
          <div className="text-[11px] text-slash-ash uppercase tracking-wider">SMA 20</div>
          <div className="font-serif text-lg font-normal text-slash-copper mt-1">
            {vals.sma_20?.toFixed(2) || '—'}
          </div>
        </div>

        <div className="rounded-[10px] bg-slash-onyx border border-slash-graphite p-4">
          <div className="text-[11px] text-slash-ash uppercase tracking-wider">SMA 50</div>
          <div className="font-serif text-lg font-normal text-slash-silver mt-1">
            {vals.sma_50?.toFixed(2) || '—'}
          </div>
        </div>

        <div className="rounded-[10px] bg-slash-onyx border border-slash-graphite p-4">
          <div className="text-[11px] text-slash-ash uppercase tracking-wider">EMA 20</div>
          <div className="font-serif text-lg font-normal text-slash-fog mt-1">
            {vals.ema_20?.toFixed(2) || '—'}
          </div>
        </div>

        <div className="rounded-[10px] bg-slash-onyx border border-slash-graphite p-4">
          <div className="text-[11px] text-slash-ash uppercase tracking-wider">RSI (14)</div>
          <div
            className={`font-serif text-lg font-normal mt-1 ${
              vals.rsi_14 >= 70
                ? 'text-slash-rose'
                : vals.rsi_14 <= 30
                ? 'text-slash-sage'
                : 'text-white'
            }`}
          >
            {vals.rsi_14?.toFixed(1) || '—'}
          </div>
        </div>

        <div className="rounded-[10px] bg-slash-onyx border border-slash-graphite p-4">
          <div className="text-[11px] text-slash-ash uppercase tracking-wider">MACD</div>
          <div
            className={`font-serif text-lg font-normal mt-1 ${
              vals.macd >= 0 ? 'text-slash-sage' : 'text-slash-rose'
            }`}
          >
            {vals.macd?.toFixed(2) || '—'}
          </div>
        </div>

        <div className="rounded-[10px] bg-slash-onyx border border-slash-graphite p-4">
          <div className="text-[11px] text-slash-ash uppercase tracking-wider">Daily Return</div>
          <div
            className={`font-serif text-lg font-normal mt-1 ${
              vals.daily_return >= 0 ? 'text-slash-sage' : 'text-slash-rose'
            }`}
          >
            {formatPercent(vals.daily_return)}
          </div>
        </div>
      </div>

      {/* Main Multi-Layer Chart */}
      <div className="rounded-[10px] bg-slash-onyx border border-slash-graphite p-6 lg:p-8 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="text-[13px] font-semibold text-slash-copper uppercase tracking-[-0.02em]">Price & Envelopes</div>
            <h2 className="font-serif text-2xl font-normal text-white tracking-[0.01em] mt-0.5">
              Moving Averages & Bollinger Bands Overlay
            </h2>
          </div>

          <div className="flex flex-wrap items-center gap-4 text-xs font-mono">
            <span className="flex items-center gap-1.5 text-white">
              <span className="w-3 h-0.5 bg-white inline-block"></span> Close
            </span>
            <span className="flex items-center gap-1.5 text-slash-copper">
              <span className="w-3 h-0.5 bg-slash-copper inline-block"></span> SMA 20
            </span>
            <span className="flex items-center gap-1.5 text-slash-silver">
              <span className="w-3 h-0.5 bg-slash-silver inline-block"></span> SMA 50
            </span>
            <span className="flex items-center gap-1.5 text-slash-fog">
              <span className="w-3 h-0.5 bg-slash-fog inline-block"></span> Bollinger Bands
            </span>
          </div>
        </div>

        <div className="h-80 w-full pt-2">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={recentSeries}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1c1d22" vertical={false} />
              <XAxis dataKey="date" stroke="#5e616e" tick={{ fontSize: 10 }} tickFormatter={(d) => d.slice(5)} />
              <YAxis stroke="#5e616e" tick={{ fontSize: 10 }} domain={['auto', 'auto']} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#040406',
                  borderColor: '#2e3038',
                  borderRadius: '10px',
                  color: '#fff',
                  fontSize: '11px',
                }}
              />
              <Line type="monotone" dataKey="close" name="Close" stroke="#ffffff" strokeWidth={2} dot={false} />
              <Line type="monotone" dataKey="sma_20" name="SMA 20" stroke="#cc9166" strokeWidth={1.5} dot={false} />
              <Line type="monotone" dataKey="sma_50" name="SMA 50" stroke="#c7c9d1" strokeWidth={1.5} dot={false} />
              <Line type="monotone" dataKey="bb_upper" name="BB Upper" stroke="#464853" strokeDasharray="3 3" strokeWidth={1} dot={false} />
              <Line type="monotone" dataKey="bb_lower" name="BB Lower" stroke="#464853" strokeDasharray="3 3" strokeWidth={1} dot={false} />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Oscillators: RSI and MACD */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="rounded-[10px] bg-slash-onyx border border-slash-graphite p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-serif text-lg font-normal text-white">RSI (14-Period Oscillator)</h3>
            <span className="font-mono text-sm font-bold text-slash-copper">{vals.rsi_14?.toFixed(1)}</span>
          </div>

          <div className="h-48 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={recentSeries}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1c1d22" vertical={false} />
                <XAxis dataKey="date" stroke="#5e616e" tick={{ fontSize: 9 }} tickFormatter={(d) => d.slice(5)} />
                <YAxis stroke="#5e616e" domain={[0, 100]} ticks={[30, 50, 70]} tick={{ fontSize: 9 }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#040406',
                    borderColor: '#2e3038',
                    borderRadius: '10px',
                    color: '#fff',
                    fontSize: '11px',
                  }}
                />
                <ReferenceLine y={70} stroke="#f87171" strokeDasharray="3 3" />
                <ReferenceLine y={30} stroke="#4ade80" strokeDasharray="3 3" />
                <Line type="monotone" dataKey="rsi_14" name="RSI 14" stroke="#cc9166" strokeWidth={2} dot={false} />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="rounded-[10px] bg-slash-onyx border border-slash-graphite p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-serif text-lg font-normal text-white">MACD Momentum Dynamics</h3>
            <span className="font-mono text-sm font-bold text-slash-silver">{vals.macd?.toFixed(2)}</span>
          </div>

          <div className="h-48 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={recentSeries}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1c1d22" vertical={false} />
                <XAxis dataKey="date" stroke="#5e616e" tick={{ fontSize: 9 }} tickFormatter={(d) => d.slice(5)} />
                <YAxis stroke="#5e616e" tick={{ fontSize: 9 }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#040406',
                    borderColor: '#2e3038',
                    borderRadius: '10px',
                    color: '#fff',
                    fontSize: '11px',
                  }}
                />
                <ReferenceLine y={0} stroke="#2e3038" />
                <Bar dataKey="macd_hist" name="Histogram" fill="#ae9357" opacity={0.6} />
                <Line type="monotone" dataKey="macd" name="MACD" stroke="#ffffff" strokeWidth={1.5} dot={false} />
                <Line type="monotone" dataKey="macd_signal" name="Signal" stroke="#cc9166" strokeWidth={1.5} dot={false} />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Guide Cards */}
      <div className="rounded-[10px] bg-slash-onyx border border-slash-graphite p-6 lg:p-8 space-y-6">
        <h2 className="font-serif text-2xl font-normal text-white tracking-[0.01em]">
          Technical Indicator Interpretations
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {Object.entries(explanations).map(([key, desc]) => (
            <div
              key={key}
              className="p-4 rounded-[8px] bg-slash-carbon border border-slash-graphite space-y-1.5"
            >
              <div className="text-[12px] font-semibold uppercase tracking-wider text-slash-copper">
                {key.replace('_', ' ')}
              </div>
              <p className="text-xs text-slash-fog leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
