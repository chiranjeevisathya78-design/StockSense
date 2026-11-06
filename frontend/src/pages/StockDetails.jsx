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
      <div className="p-6 space-y-6 max-w-6xl mx-auto">
        <LoadingSkeleton type="card" count={4} />
        <LoadingSkeleton type="chart" />
        <LoadingSkeleton type="table" count={5} />
      </div>
    );
  }

  if (error || !quote) {
    return (
      <div className="p-6 max-w-6xl mx-auto">
        <button
          onClick={() => navigate('/explore')}
          className="flex items-center gap-2 text-xs text-[#111] hover:underline mb-4 font-medium"
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
    <div className="space-y-8 font-sans text-[#636366]">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-black/5">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-3xl sm:text-4xl font-semibold text-[#0f1115] tracking-tight">
              {quote.symbol}
            </h1>
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-black/5 text-[#636366] border border-black/5">
              {quote.market === 'IN' ? 'NSE (India)' : 'US Equities'}
            </span>
          </div>
          <p className="text-sm text-[#8e8e93] mt-1">{quote.name}</p>
        </div>

        {/* Feature Action Buttons */}
        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={() => toggleWatchlist(quote.symbol)}
            className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-semibold border transition-all cursor-pointer ${
              inWatchlist
                ? 'liquid-glass-btn text-white'
                : 'spatial-pill text-[#0f1115] hover:bg-white'
            }`}
          >
            <Bookmark className={`w-3.5 h-3.5 ${inWatchlist ? 'fill-current' : ''}`} />
            <span>{inWatchlist ? 'Watchlisted' : 'Add to Watchlist'}</span>
          </button>

          <Link
            to={`/technical/${encodeURIComponent(quote.symbol)}`}
            className="spatial-pill flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-[#0f1115] transition"
          >
            <Sliders className="w-3.5 h-3.5 text-[#8e8e93]" />
            <span>Technicals</span>
          </Link>

          <Link
            to={`/predictions/${encodeURIComponent(quote.symbol)}`}
            className="liquid-glass-btn flex items-center gap-1.5 px-5 py-2 text-xs font-semibold transition"
          >
            <Cpu className="w-3.5 h-3.5" />
            <span>AI Prediction</span>
          </Link>

          <Link
            to={`/insights/${encodeURIComponent(quote.symbol)}`}
            className="spatial-pill flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-[#0f1115] transition"
          >
            <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
            <span>Insights</span>
          </Link>
        </div>
      </div>

      <DisclaimerBanner compact />

      {/* Primary Settlement Price Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <div className="liquid-glass-panel p-5 col-span-2 sm:col-span-1 lg:col-span-2 flex flex-col justify-between">
          <div className="text-xs text-[#8e8e93] uppercase tracking-wider font-semibold">Last Settlement Close</div>
          <div className="flex items-baseline gap-3 my-1">
            <span className="text-3xl font-semibold text-[#0f1115]">
              {formatCurrency(quote.price, quote.currency)}
            </span>
            <div
              className={`inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full ${
                isPositive
                  ? 'liquid-accent-pill text-emerald-800'
                  : 'bg-rose-500/10 text-rose-700 border border-rose-500/20'
              }`}
            >
              {isPositive ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
              <span>{formatPercent(quote.percent_change)}</span>
            </div>
          </div>
          <div className="text-xs text-[#8e8e93]">
            {isPositive ? '+' : ''}{formatCurrency(quote.change, quote.currency)} Today
          </div>
        </div>

        <div className="liquid-glass-panel p-4 flex flex-col justify-between">
          <span className="text-xs text-[#8e8e93] uppercase tracking-wider font-semibold">Day High</span>
          <span className="text-lg font-semibold text-[#0f1115]">
            {formatCurrency(quote.high, quote.currency)}
          </span>
          <span className="text-[11px] text-[#8e8e93]">Peak transaction</span>
        </div>

        <div className="liquid-glass-panel p-4 flex flex-col justify-between">
          <span className="text-xs text-[#8e8e93] uppercase tracking-wider font-semibold">Day Low</span>
          <span className="text-lg font-semibold text-[#0f1115]">
            {formatCurrency(quote.low, quote.currency)}
          </span>
          <span className="text-[11px] text-[#8e8e93]">Base transaction</span>
        </div>

        <div className="liquid-glass-panel p-4 flex flex-col justify-between">
          <span className="text-xs text-[#8e8e93] uppercase tracking-wider font-semibold">Open</span>
          <span className="text-lg font-semibold text-[#0f1115]">
            {formatCurrency(quote.open, quote.currency)}
          </span>
          <span className="text-[11px] text-[#8e8e93]">Market open</span>
        </div>

        <div className="liquid-glass-panel p-4 flex flex-col justify-between">
          <span className="text-xs text-[#8e8e93] uppercase tracking-wider font-semibold">Volume</span>
          <span className="text-lg font-semibold text-[#0f1115]">
            {formatVolume(quote.volume)}
          </span>
          <span className="text-[11px] text-[#8e8e93]">Contracts traded</span>
        </div>
      </div>

      {/* Main Interactive Settlement Chart Card */}
      <div className="liquid-glass-panel p-6 sm:p-8 space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4 border-b border-black/5">
          <div>
            <h3 className="text-xl font-semibold text-[#0f1115]">
              Continuous Settlement Trajectory
            </h3>
            <p className="text-xs text-[#8e8e93] mt-0.5">
              Historical adjusted daily close values across chosen timeframe
            </p>
          </div>

          {/* Timeframe Period Switcher */}
          <div className="spatial-pill flex items-center gap-1.5 p-1">
            {['1mo', '3mo', '6mo', '1y', '5y'].map((p) => (
              <button
                key={p}
                onClick={() => setPeriod(p)}
                className={`px-3 py-1 rounded-full text-xs transition cursor-pointer ${
                  period === p
                    ? 'bg-[#111] text-white font-medium shadow-xs'
                    : 'text-[#4b5563] hover:text-[#111] hover:bg-[#e8e8e6]'
                }`}
              >
                {p.toUpperCase()}
              </button>
            ))}
          </div>
        </div>

        {/* Recharts Area with Clean Cyan Line */}
        <div className="w-full pt-2" style={{ height: 320, minHeight: 320 }}>
          <ResponsiveContainer width="100%" height={320}>
            <AreaChart data={history}>
              <defs>
                <linearGradient id="kindredDetailsGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#00b3dd" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="#00b3dd" stopOpacity={0.0} />
                </linearGradient>
              </defs>
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
              <Area
                type="monotone"
                dataKey="close"
                name="Settlement Price"
                stroke="#00b3dd"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#kindredDetailsGrad)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Historical Trading Ledger Table */}
      <div className="rounded-2xl bg-white border border-[#e8e8e6] overflow-hidden shadow-xs">
        <div className="px-6 py-4 bg-[#fafaf8] border-b border-[#e8e8e6] flex items-center justify-between">
          <h4 className="text-sm font-medium text-[#111]">
            Recent Daily Trading Ledger
          </h4>
          <span className="text-xs text-[#9a9a9a]">OHLCV Historical Logs</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-[#f7f7f5] text-xs uppercase font-medium text-[#9a9a9a] border-b border-[#e8e8e6]">
              <tr>
                <th className="px-6 py-3">Trading Date</th>
                <th className="px-6 py-3 text-right">Open</th>
                <th className="px-6 py-3 text-right">High</th>
                <th className="px-6 py-3 text-right">Low</th>
                <th className="px-6 py-3 text-right">Close</th>
                <th className="px-6 py-3 text-right">Volume</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#e8e8e6]">
              {history.slice(-10).reverse().map((row, idx) => (
                <tr key={idx} className="hover:bg-[#fafaf8] transition">
                  <td className="px-6 py-3 text-xs text-[#111] font-medium">{row.date}</td>
                  <td className="px-6 py-3 text-xs text-right text-[#4b5563]">{formatCurrency(row.open, quote.currency)}</td>
                  <td className="px-6 py-3 text-xs text-right text-[#4b5563]">{formatCurrency(row.high, quote.currency)}</td>
                  <td className="px-6 py-3 text-xs text-right text-[#4b5563]">{formatCurrency(row.low, quote.currency)}</td>
                  <td className="px-6 py-3 text-xs text-right font-medium text-[#111]">{formatCurrency(row.close, quote.currency)}</td>
                  <td className="px-6 py-3 text-xs text-right text-[#7b7b7b]">{formatVolume(row.volume)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
