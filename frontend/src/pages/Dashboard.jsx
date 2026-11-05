import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  TrendingUp,
  TrendingDown,
  Clock,
  ArrowRight,
  Activity,
  Layers,
  Database,
  BarChart2,
  Sparkles
} from 'lucide-react';
import {
  AreaChart,
  Area,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  CartesianGrid,
} from 'recharts';
import StockCard from '../components/StockCard';
import LoadingSkeleton from '../components/LoadingSkeleton';
import ErrorMessage from '../components/ErrorMessage';
import DisclaimerBanner from '../components/DisclaimerBanner';
import { useStock } from '../context/StockContext';
import { stockApi, formatCurrency, formatPercent } from '../services/api';

export default function Dashboard() {
  const { setSelectedSymbol, watchlist } = useStock();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [overview, setOverview] = useState({
    popular: [],
    top_gainers: [],
    top_losers: [],
    market_timestamp: '',
  });
  const [benchmarkHistory, setBenchmarkHistory] = useState([]);
  const [selectedBenchmark, setSelectedBenchmark] = useState('RELIANCE.NS');

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await stockApi.getPopularOverview();
      setOverview(data);

      const hist = await stockApi.getHistory(selectedBenchmark, '6mo');
      setBenchmarkHistory(hist.data || []);
    } catch (err) {
      console.error('Failed to load dashboard data:', err);
      setError('Unable to load market data. Please verify network connection or try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, [selectedBenchmark]);

  if (loading) {
    return (
      <div className="p-6 sm:p-8 space-y-6 max-w-6xl mx-auto">
        <LoadingSkeleton type="card" count={4} />
        <LoadingSkeleton type="chart" />
        <LoadingSkeleton type="table" count={3} />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 sm:p-8 max-w-6xl mx-auto">
        <ErrorMessage message={error} onRetry={fetchDashboardData} />
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-8 max-w-6xl mx-auto font-sans bg-[#f7f7f5] text-[#7b7b7b]">
      {/* 1. Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-4 pb-6 border-b border-[#e8e8e6]">
        <div>
          <div className="text-xs uppercase tracking-wider text-[#9a9a9a] font-medium mb-1 flex items-center gap-2">
            <span>Market Intelligence Ledger</span>
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
          </div>
          <h1 className="text-3xl sm:text-4xl font-medium text-[#111] tracking-[-0.03em]">
            Market Analysis & Forecasting
          </h1>
          <p className="text-sm text-[#7b7b7b] mt-1 leading-relaxed">
            Continuous equity data feeds, mathematical momentum envelopes, and machine learning models.
          </p>
        </div>

        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white border border-[#e8e8e6] text-xs text-[#7b7b7b] self-start sm:self-auto shadow-xs">
          <Clock className="w-3.5 h-3.5 text-cyan-600" />
          <span>Cutoff: {overview.market_timestamp ? new Date(overview.market_timestamp).toLocaleDateString() : 'Active'}</span>
        </div>
      </div>

      {/* 2. Notice Disclaimer Banner */}
      <div className="p-4 rounded-2xl bg-white border border-[#e8e8e6] text-xs text-[#7b7b7b] flex items-center gap-2.5 shadow-xs">
        <span className="w-2 h-2 rounded-full bg-amber-500 shrink-0" />
        <span>
          <strong className="text-[#111] font-medium">Notice:</strong> Quantitative model simulations for research purposes only. Projections do not constitute financial advice.
        </span>
      </div>

      {/* 3. Four Core Metric Cards (Kindred White Cards) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-6 rounded-2xl bg-white border border-[#e8e8e6] shadow-xs space-y-1">
          <div className="text-[11px] font-medium uppercase tracking-wider text-[#9a9a9a]">Tracked Assets</div>
          <div className="text-2xl sm:text-3xl font-medium text-[#111]">
            20+ Equities
          </div>
          <div className="text-xs text-[#9a9a9a]">NSE, BSE, NASDAQ, NYSE</div>
        </div>

        <div className="p-6 rounded-2xl bg-white border border-[#e8e8e6] shadow-xs space-y-1">
          <div className="text-[11px] font-medium uppercase tracking-wider text-[#9a9a9a]">ML Regressors</div>
          <div className="text-2xl sm:text-3xl font-medium text-[#111]">
            Linear & RF
          </div>
          <div className="text-xs text-emerald-600 font-medium">Chronological 80/20 Split</div>
        </div>

        <div className="p-6 rounded-2xl bg-white border border-[#e8e8e6] shadow-xs space-y-1">
          <div className="text-[11px] font-medium uppercase tracking-wider text-[#9a9a9a]">Indicators</div>
          <div className="text-2xl sm:text-3xl font-medium text-[#111]">
            8 Algorithms
          </div>
          <div className="text-xs text-[#9a9a9a]">RSI, MACD, Bollinger, SMAs</div>
        </div>

        <div className="p-6 rounded-2xl bg-white border border-[#e8e8e6] shadow-xs space-y-1">
          <div className="text-[11px] font-medium uppercase tracking-wider text-[#9a9a9a]">Watchlist Ledger</div>
          <div className="text-2xl sm:text-3xl font-medium text-[#111]">
            {watchlist.length} Securities
          </div>
          <div className="text-xs text-cyan-600 font-medium">Persistent Storage</div>
        </div>
      </div>

      {/* 4. Benchmark Chart Card (White Card with Kindred Styling) */}
      <div className="p-6 sm:p-8 rounded-2xl bg-white border border-[#e8e8e6] shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#e8e8e6]">
          <div>
            <div className="text-[11px] font-medium uppercase tracking-wider text-cyan-700">
              Price Trajectory
            </div>
            <h2 className="text-2xl font-medium text-[#111] mt-0.5">
              6-Month Settlement Trend for {selectedBenchmark}
            </h2>
          </div>

          {/* Benchmark selector pills */}
          <div className="flex items-center gap-1.5 flex-wrap">
            {[
              { label: 'Reliance (IN)', symbol: 'RELIANCE.NS' },
              { label: 'TCS (IN)', symbol: 'TCS.NS' },
              { label: 'Apple (US)', symbol: 'AAPL' },
              { label: 'Nvidia (US)', symbol: 'NVDA' },
            ].map((b) => (
              <button
                key={b.symbol}
                onClick={() => setSelectedBenchmark(b.symbol)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-medium transition ${
                  selectedBenchmark === b.symbol
                    ? 'bg-[#111] text-white shadow-xs'
                    : 'bg-[#f0f0ee] text-[#4b5563] hover:text-[#111] hover:bg-[#e8e8e6]'
                }`}
              >
                {b.label}
              </button>
            ))}
          </div>
        </div>

        {/* Recharts Area with Clean Light Styling */}
        <div className="w-full pt-2" style={{ height: 300, minHeight: 300 }}>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={benchmarkHistory}>
              <defs>
                <linearGradient id="kindredChartGrad" x1="0" y1="0" x2="0" y2="1">
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
                fill="url(#kindredChartGrad)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* 5. Popular Assets Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-medium text-[#111]">
            Featured Equity Universe
          </h2>
          <button
            onClick={() => navigate('/explore')}
            className="text-xs font-medium text-[#111] flex items-center gap-1 hover:opacity-70 transition"
          >
            <span>View All</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {overview.popular.slice(0, 4).map((stock) => (
            <StockCard key={stock.symbol} stock={stock} />
          ))}
        </div>
      </div>

      {/* 6. Top Gainers & Decliners Panels (White Cards with Kindred Styling) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Gainers */}
        <div className="p-6 rounded-2xl bg-white border border-[#e8e8e6] shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              <h3 className="text-base font-medium text-[#111]">Session Gainers</h3>
            </div>
            <span className="text-[11px] text-[#9a9a9a] uppercase font-medium">Positive Velocity</span>
          </div>

          <div className="divide-y divide-[#e8e8e6]">
            {overview.top_gainers.map((stock) => (
              <div
                key={stock.symbol}
                onClick={() => {
                  setSelectedSymbol(stock.symbol);
                  navigate(`/stocks/${encodeURIComponent(stock.symbol)}`);
                }}
                className="py-3 flex items-center justify-between hover:bg-[#fafaf8] px-2 rounded-xl transition cursor-pointer"
              >
                <div>
                  <div className="font-medium text-sm text-[#111]">{stock.symbol}</div>
                  <div className="text-xs text-[#9a9a9a] truncate max-w-[180px]">{stock.name}</div>
                </div>
                <div className="text-right">
                  <div className="font-medium text-sm text-[#111]">{formatCurrency(stock.price, stock.currency)}</div>
                  <div className="text-xs font-semibold text-emerald-600 flex items-center justify-end gap-0.5">
                    <TrendingUp className="w-3 h-3" />
                    <span>{formatPercent(stock.percent_change)}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Top Decliners */}
        <div className="p-6 rounded-2xl bg-white border border-[#e8e8e6] shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-rose-500" />
              <h3 className="text-base font-medium text-[#111]">Session Decliners</h3>
            </div>
            <span className="text-[11px] text-[#9a9a9a] uppercase font-medium">Negative Shift</span>
          </div>

          <div className="divide-y divide-[#e8e8e6]">
            {overview.top_losers.map((stock) => (
              <div
                key={stock.symbol}
                onClick={() => {
                  setSelectedSymbol(stock.symbol);
                  navigate(`/stocks/${encodeURIComponent(stock.symbol)}`);
                }}
                className="py-3 flex items-center justify-between hover:bg-[#fafaf8] px-2 rounded-xl transition cursor-pointer"
              >
                <div>
                  <div className="font-medium text-sm text-[#111]">{stock.symbol}</div>
                  <div className="text-xs text-[#9a9a9a] truncate max-w-[180px]">{stock.name}</div>
                </div>
                <div className="text-right">
                  <div className="font-medium text-sm text-[#111]">{formatCurrency(stock.price, stock.currency)}</div>
                  <div className="text-xs font-semibold text-rose-600 flex items-center justify-end gap-0.5">
                    <TrendingDown className="w-3 h-3" />
                    <span>{formatPercent(stock.percent_change)}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
