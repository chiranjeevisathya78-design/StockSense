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
    <div className="space-y-8 font-sans text-[#636366]">
      {/* 1. Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-4 pb-6 border-b border-black/5">
        <div>
          <div className="text-xs uppercase tracking-wider text-[#8e8e93] font-medium mb-1 flex items-center gap-2">
            <span>Market Intelligence Ledger</span>
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
          </div>
          <h1 className="text-3xl sm:text-4xl font-semibold text-[#0f1115] tracking-tight">
            Market Analysis & Forecasting
          </h1>
          <p className="text-sm text-[#8e8e93] mt-1 leading-relaxed">
            Continuous equity data feeds, mathematical momentum envelopes, and machine learning models.
          </p>
        </div>

        <div className="spatial-pill flex items-center gap-2 px-3.5 py-1.5 text-xs text-[#636366] self-start sm:self-auto">
          <Clock className="w-3.5 h-3.5 text-cyan-600" />
          <span>Cutoff: {overview.market_timestamp ? new Date(overview.market_timestamp).toLocaleDateString() : 'Active'}</span>
        </div>
      </div>

      {/* 2. Notice Disclaimer Banner */}
      <div className="liquid-glass-panel p-4 text-xs text-[#636366] flex items-center gap-2.5">
        <span className="w-2 h-2 rounded-full bg-amber-500 shrink-0" />
        <span>
          <strong className="text-[#0f1115] font-semibold">Notice:</strong> Quantitative model simulations for research purposes only. Projections do not constitute financial advice.
        </span>
      </div>

      {/* 3. Four Core Metric Cards (Glass-Neo-Skeuomorphic Panels) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="liquid-glass-panel liquid-glass-hover p-6 space-y-1">
          <div className="text-[11px] font-semibold uppercase tracking-wider text-[#8e8e93]">Tracked Assets</div>
          <div className="text-2xl sm:text-3xl font-semibold text-[#0f1115]">
            20+ Equities
          </div>
          <div className="text-xs text-[#8e8e93]">NSE, BSE, NASDAQ, NYSE</div>
        </div>

        <div className="liquid-glass-panel liquid-glass-hover p-6 space-y-1">
          <div className="text-[11px] font-semibold uppercase tracking-wider text-[#8e8e93]">ML Regressors</div>
          <div className="text-2xl sm:text-3xl font-semibold text-[#0f1115]">
            Linear & RF
          </div>
          <div className="text-xs text-emerald-600 font-semibold">Chronological 80/20 Split</div>
        </div>

        <div className="liquid-glass-panel liquid-glass-hover p-6 space-y-1">
          <div className="text-[11px] font-semibold uppercase tracking-wider text-[#8e8e93]">Indicators</div>
          <div className="text-2xl sm:text-3xl font-semibold text-[#0f1115]">
            8 Algorithms
          </div>
          <div className="text-xs text-[#8e8e93]">RSI, MACD, Bollinger, SMAs</div>
        </div>

        <div className="liquid-glass-panel liquid-glass-hover p-6 space-y-1">
          <div className="text-[11px] font-semibold uppercase tracking-wider text-[#8e8e93]">Watchlist Ledger</div>
          <div className="text-2xl sm:text-3xl font-semibold text-[#0f1115]">
            {watchlist.length} Securities
          </div>
          <div className="text-xs text-cyan-600 font-semibold">Persistent Storage</div>
        </div>
      </div>

      {/* 4. Benchmark Chart Card */}
      <div className="liquid-glass-panel p-6 sm:p-8 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-black/5">
          <div>
            <div className="text-[11px] font-semibold uppercase tracking-wider text-cyan-700">
              Price Trajectory
            </div>
            <h2 className="text-2xl font-semibold text-[#0f1115] mt-0.5">
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
                className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition cursor-pointer ${
                  selectedBenchmark === b.symbol
                    ? 'liquid-glass-btn text-white'
                    : 'spatial-pill text-[#636366] hover:text-[#0f1115]'
                }`}
              >
                {b.label}
              </button>
            ))}
          </div>
        </div>

        {/* Recharts Area */}
        <div className="w-full pt-2" style={{ height: 300, minHeight: 300 }}>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={benchmarkHistory}>
              <defs>
                <linearGradient id="kindredChartGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#00b3dd" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="#00b3dd" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.04)" vertical={false} />
              <XAxis dataKey="date" stroke="#8e8e93" tick={{ fontSize: 11, fill: '#8e8e93' }} />
              <YAxis stroke="#8e8e93" domain={['auto', 'auto']} tick={{ fontSize: 11, fill: '#8e8e93' }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'rgba(255, 255, 255, 0.92)',
                  backdropFilter: 'blur(16px)',
                  borderColor: 'rgba(255, 255, 255, 0.8)',
                  borderRadius: '16px',
                  color: '#0f1115',
                  fontSize: '12px',
                  boxShadow: '0 12px 30px rgba(0, 0, 0, 0.12)',
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
          <h2 className="text-xl font-semibold text-[#0f1115]">
            Featured Equity Universe
          </h2>
          <button
            onClick={() => navigate('/explore')}
            className="spatial-pill px-3 py-1.5 text-xs font-semibold text-[#0f1115] flex items-center gap-1.5 hover:opacity-80 transition cursor-pointer"
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

      {/* 6. Top Gainers & Decliners Panels */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Gainers */}
        <div className="liquid-glass-panel p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              <h3 className="text-base font-semibold text-[#0f1115]">Session Gainers</h3>
            </div>
            <span className="text-[11px] text-[#8e8e93] uppercase font-semibold">Positive Velocity</span>
          </div>

          <div className="divide-y divide-black/5">
            {overview.top_gainers.map((stock) => (
              <div
                key={stock.symbol}
                onClick={() => {
                  setSelectedSymbol(stock.symbol);
                  navigate(`/stocks/${encodeURIComponent(stock.symbol)}`);
                }}
                className="py-3 flex items-center justify-between hover:bg-white/60 px-3 rounded-xl transition cursor-pointer"
              >
                <div>
                  <div className="font-semibold text-sm text-[#0f1115]">{stock.symbol}</div>
                  <div className="text-xs text-[#8e8e93] truncate max-w-[180px]">{stock.name}</div>
                </div>
                <div className="text-right">
                  <div className="font-semibold text-sm text-[#0f1115]">{formatCurrency(stock.price, stock.currency)}</div>
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
        <div className="liquid-glass-panel p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-rose-500" />
              <h3 className="text-base font-semibold text-[#0f1115]">Session Decliners</h3>
            </div>
            <span className="text-[11px] text-[#8e8e93] uppercase font-semibold">Negative Shift</span>
          </div>

          <div className="divide-y divide-black/5">
            {overview.top_losers.map((stock) => (
              <div
                key={stock.symbol}
                onClick={() => {
                  setSelectedSymbol(stock.symbol);
                  navigate(`/stocks/${encodeURIComponent(stock.symbol)}`);
                }}
                className="py-3 flex items-center justify-between hover:bg-white/60 px-3 rounded-xl transition cursor-pointer"
              >
                <div>
                  <div className="font-semibold text-sm text-[#0f1115]">{stock.symbol}</div>
                  <div className="text-xs text-[#8e8e93] truncate max-w-[180px]">{stock.name}</div>
                </div>
                <div className="text-right">
                  <div className="font-semibold text-sm text-[#0f1115]">{formatCurrency(stock.price, stock.currency)}</div>
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
