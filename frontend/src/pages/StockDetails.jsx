import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  TrendingUp,
  TrendingDown,
  Bookmark,
  Sliders,
  Cpu,
  Sparkles,
  ArrowLeft
} from 'lucide-react';
import { stockApi, formatCurrency, formatPercent, formatVolume } from '../services/api';
import { useStock } from '../context/StockContext';
import LoadingSkeleton from '../components/LoadingSkeleton';
import ErrorMessage from '../components/ErrorMessage';
import DisclaimerBanner from '../components/DisclaimerBanner';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid
} from 'recharts';

export default function StockDetails() {
  const { symbol: routeSymbol } = useParams();
  const { selectedSymbol, setSelectedSymbol, isInWatchlist, toggleWatchlist } = useStock();
  const navigate = useNavigate();

  const activeSymbol = routeSymbol || selectedSymbol || 'RELIANCE.NS';

  const [period, setPeriod] = useState('1y');
  const [quote, setQuote] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      setSelectedSymbol(activeSymbol);

      const [q, h] = await Promise.all([
        stockApi.getQuote(activeSymbol),
        stockApi.getHistory(activeSymbol, period),
      ]);

      setQuote(q);
      setHistory(h.data || []);
    } catch (err) {
      console.error('Failed to fetch stock details:', err);
      setError(err.response?.data?.detail || `Failed to fetch data for ${activeSymbol}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [activeSymbol, period]);

  if (loading) {
    return (
      <div className="p-6 space-y-6 max-w-[1216px] mx-auto">
        <LoadingSkeleton type="card" count={4} />
        <LoadingSkeleton type="chart" />
        <LoadingSkeleton type="table" count={5} />
      </div>
    );
  }

  if (error || !quote) {
    return (
      <div className="p-6 max-w-[1216px] mx-auto">
        <button
          onClick={() => navigate('/explore')}
          className="flex items-center gap-2 text-xs text-slash-copper hover:underline mb-4"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Explore
        </button>
        <ErrorMessage message={error} onRetry={fetchData} />
      </div>
    );
  }

  const isPositive = quote.change >= 0;
  const inWatchlist = isInWatchlist(quote.symbol);

  return (
    <div className="p-4 lg:p-8 space-y-10 max-w-[1216px] mx-auto">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-slash-graphite">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="font-serif text-4xl lg:text-5xl font-normal text-white tracking-[0.01em]">
              {quote.symbol}
            </h1>
            <span
              className={`text-xs font-medium px-2.5 py-0.5 rounded-full border ${
                quote.market === 'IN'
                  ? 'border-slash-copper/40 text-slash-copper bg-slash-copperGlow'
                  : 'border-slash-steel text-slash-silver bg-slash-carbon'
              }`}
            >
              {quote.market === 'IN' ? 'NSE/BSE (India)' : 'US Equities'}
            </span>
          </div>
          <p className="text-sm text-slash-fog mt-1">{quote.name}</p>
        </div>

        {/* Feature Action Buttons */}
        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={() => toggleWatchlist(quote.symbol)}
            className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-medium border transition ${
              inWatchlist
                ? 'bg-slash-carbon text-slash-copper border-slash-copper/40'
                : 'bg-transparent text-white border-slash-steel hover:border-white'
            }`}
          >
            <Bookmark className="w-3.5 h-3.5 fill-current" />
            <span>{inWatchlist ? 'Watchlisted' : 'Add to Watchlist'}</span>
          </button>

          <Link
            to={`/technical/${encodeURIComponent(quote.symbol)}`}
            className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-slash-onyx hover:bg-slash-carbon border border-slash-graphite text-xs font-medium text-white transition"
          >
            <Sliders className="w-3.5 h-3.5 text-slash-fog" />
            <span>Technicals</span>
          </Link>

          <Link
            to={`/predictions/${encodeURIComponent(quote.symbol)}`}
            className="flex items-center gap-1.5 px-5 py-2 rounded-full bg-white text-black hover:bg-slate-200 text-xs font-medium transition"
          >
            <Cpu className="w-3.5 h-3.5" />
            <span>AI Prediction</span>
          </Link>

          <Link
            to={`/insights/${encodeURIComponent(quote.symbol)}`}
            className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-slash-onyx hover:bg-slash-carbon border border-slash-graphite text-xs font-medium text-white transition"
          >
            <Sparkles className="w-3.5 h-3.5 text-slash-copper" />
            <span>Insights</span>
          </Link>
        </div>
      </div>

      <DisclaimerBanner compact />

      {/* Primary Settlement Price Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <div className="rounded-[10px] bg-slash-onyx border border-slash-graphite p-5 col-span-2 sm:col-span-1 lg:col-span-2 flex flex-col justify-between">
          <div className="text-[12px] text-slash-ash uppercase tracking-wider font-medium">Last Settlement Close</div>
          <div className="flex items-baseline gap-3 my-1">
            <span className="font-serif text-3xl lg:text-4xl font-normal text-white tracking-[0.01em]">
              {formatCurrency(quote.price, quote.currency)}
            </span>
            <div
              className={`flex items-center gap-1 font-mono text-xs font-medium px-2 py-0.5 rounded-full border ${
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
              <span>{formatPercent(quote.percent_change)}</span>
            </div>
          </div>
          <div className="text-[11px] text-slash-fog">
            Session date: {quote.timestamp}
          </div>
        </div>

        <div className="rounded-[10px] bg-slash-onyx border border-slash-graphite p-4">
          <div className="text-[11px] text-slash-ash uppercase tracking-wider">Open</div>
          <div className="font-serif text-lg font-normal text-white mt-1">
            {formatCurrency(quote.open, quote.currency)}
          </div>
        </div>

        <div className="rounded-[10px] bg-slash-onyx border border-slash-graphite p-4">
          <div className="text-[11px] text-slash-ash uppercase tracking-wider">Day High</div>
          <div className="font-serif text-lg font-normal text-slash-sage mt-1">
            {formatCurrency(quote.high, quote.currency)}
          </div>
        </div>

        <div className="rounded-[10px] bg-slash-onyx border border-slash-graphite p-4">
          <div className="text-[11px] text-slash-ash uppercase tracking-wider">Day Low</div>
          <div className="font-serif text-lg font-normal text-slash-rose mt-1">
            {formatCurrency(quote.low, quote.currency)}
          </div>
        </div>

        <div className="rounded-[10px] bg-slash-onyx border border-slash-graphite p-4">
          <div className="text-[11px] text-slash-ash uppercase tracking-wider">Volume</div>
          <div className="font-mono text-base font-medium text-white mt-1">
            {formatVolume(quote.volume)}
          </div>
        </div>
      </div>

      {/* Historical Gilded Chart with Interval Pills */}
      <div className="rounded-[10px] bg-slash-onyx border border-slash-graphite p-6 lg:p-8 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="text-[13px] font-semibold text-slash-copper uppercase tracking-[-0.02em]">Historical Price Action</div>
            <h2 className="font-serif text-2xl font-normal text-white tracking-[0.01em] mt-0.5">
              Settlement Levels & Volatility
            </h2>
          </div>

          {/* Date Range Interval Buttons */}
          <div className="flex items-center gap-1.5 p-1 rounded-full bg-slash-carbon border border-slash-graphite">
            {[
              { id: '1mo', label: '1M' },
              { id: '3mo', label: '3M' },
              { id: '6mo', label: '6M' },
              { id: '1y', label: '1Y' },
              { id: '5y', label: '5Y' },
            ].map((rng) => (
              <button
                key={rng.id}
                onClick={() => setPeriod(rng.id)}
                className={`px-3 py-1 rounded-full text-xs font-mono transition ${
                  period === rng.id
                    ? 'bg-white text-black font-semibold'
                    : 'text-slash-fog hover:text-white'
                }`}
              >
                {rng.label}
              </button>
            ))}
          </div>
        </div>

        {/* Recharts Area Chart */}
        <div className="h-80 w-full pt-2">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={history}>
              <defs>
                <linearGradient id="detailGilded" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#ae9357" stopOpacity={0.35} />
                  <stop offset="95%" stopColor="#ae9357" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#1c1d22" vertical={false} />
              <XAxis
                dataKey="date"
                stroke="#5e616e"
                tick={{ fontSize: 11 }}
                tickFormatter={(val) => val.slice(5)}
              />
              <YAxis
                stroke="#5e616e"
                tick={{ fontSize: 11 }}
                domain={['auto', 'auto']}
                tickFormatter={(val) => `${quote.currency === 'INR' ? '₹' : '$'}${val}`}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#040406',
                  borderColor: '#2e3038',
                  borderRadius: '10px',
                  color: '#fff',
                  fontSize: '12px',
                }}
                formatter={(val) => [formatCurrency(val, quote.currency), 'Close Price']}
              />
              <Area
                type="monotone"
                dataKey="close"
                stroke="#ae9357"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#detailGilded)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Historical Data Table */}
      <div className="rounded-[10px] bg-slash-onyx border border-slash-graphite p-6 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slash-graphite">
          <h2 className="font-serif text-xl font-normal text-white">Historical OHLCV Records</h2>
          <span className="text-xs font-mono text-slash-ash">
            Latest {Math.min(20, history.length)} trading sessions
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead className="text-slash-fog uppercase border-b border-slash-graphite">
              <tr>
                <th className="py-3 px-3">Date</th>
                <th className="py-3 px-3 text-right">Open</th>
                <th className="py-3 px-3 text-right">High</th>
                <th className="py-3 px-3 text-right">Low</th>
                <th className="py-3 px-3 text-right">Close</th>
                <th className="py-3 px-3 text-right">Volume</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slash-graphite/40">
              {history
                .slice()
                .reverse()
                .slice(0, 20)
                .map((row, idx) => {
                  const isDayPositive = row.close >= row.open;
                  return (
                    <tr key={idx} className="hover:bg-slash-carbon transition">
                      <td className="py-2.5 px-3 text-white font-medium">{row.date}</td>
                      <td className="py-2.5 px-3 text-right text-slash-fog">
                        {formatCurrency(row.open, quote.currency)}
                      </td>
                      <td className="py-2.5 px-3 text-right text-slash-sage">
                        {formatCurrency(row.high, quote.currency)}
                      </td>
                      <td className="py-2.5 px-3 text-right text-slash-rose">
                        {formatCurrency(row.low, quote.currency)}
                      </td>
                      <td
                        className={`py-2.5 px-3 text-right font-medium ${
                          isDayPositive ? 'text-slash-sage' : 'text-slash-rose'
                        }`}
                      >
                        {formatCurrency(row.close, quote.currency)}
                      </td>
                      <td className="py-2.5 px-3 text-right text-slash-fog">
                        {formatVolume(row.volume)}
                      </td>
                    </tr>
                  );
                })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
