import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  TrendingUp,
  TrendingDown,
  Globe,
  Cpu,
  Bookmark,
  Activity,
  ArrowRight,
  Clock
} from 'lucide-react';
import { stockApi, formatCurrency, formatPercent } from '../services/api';
import { useStock } from '../context/StockContext';
import StockCard from '../components/StockCard';
import LoadingSkeleton from '../components/LoadingSkeleton';
import ErrorMessage from '../components/ErrorMessage';
import DisclaimerBanner from '../components/DisclaimerBanner';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid
} from 'recharts';

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
      <div className="p-6 space-y-6 max-w-[1216px] mx-auto">
        <LoadingSkeleton type="card" count={4} />
        <LoadingSkeleton type="chart" />
        <LoadingSkeleton type="table" count={3} />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 max-w-[1216px] mx-auto">
        <ErrorMessage message={error} onRetry={fetchDashboardData} />
      </div>
    );
  }

  return (
    <div className="p-4 lg:p-8 space-y-12 max-w-[1216px] mx-auto">
      {/* Editorial Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-slash-graphite">
        <div>
          <div className="text-[13px] font-semibold text-slash-copper uppercase tracking-[-0.02em] mb-2">
            Midnight Vault • Quantitative Intelligence
          </div>
          <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-normal text-white tracking-[0.01em]">
            Market Analysis & Prediction
          </h1>
          <p className="text-sm text-slash-fog mt-2 max-w-2xl leading-relaxed">
            Continuous equity data feeds, mathematical momentum envelopes, and machine learning models for Indian and International securities.
          </p>
        </div>

        <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-slash-onyx border border-slash-graphite text-xs text-slash-fog">
          <Clock className="w-3.5 h-3.5 text-slash-copper" />
          <span>Cutoff:</span>
          <span className="font-mono text-white font-medium">
            {overview.market_timestamp || 'Latest Trading Day'}
          </span>
        </div>
      </div>

      <DisclaimerBanner compact />

      {/* Numerical Stat Displays */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="rounded-[10px] bg-slash-onyx border border-slash-graphite p-6 flex flex-col justify-between">
          <div className="text-[13px] text-slash-fog font-medium uppercase tracking-[-0.02em]">Tracked Assets</div>
          <div className="font-serif text-3xl font-normal text-white mt-2 tracking-[0.01em]">20+</div>
          <div className="text-xs text-slash-copper mt-1">NSE, BSE, NASDAQ, NYSE</div>
        </div>

        <div className="rounded-[10px] bg-slash-onyx border border-slash-graphite p-6 flex flex-col justify-between">
          <div className="text-[13px] text-slash-fog font-medium uppercase tracking-[-0.02em]">ML Engines</div>
          <div className="font-serif text-3xl font-normal text-white mt-2 tracking-[0.01em]">LR & RF</div>
          <div className="text-xs text-slash-mist mt-1">Chronological 80/20 Split</div>
        </div>

        <div className="rounded-[10px] bg-slash-onyx border border-slash-graphite p-6 flex flex-col justify-between">
          <div className="text-[13px] text-slash-fog font-medium uppercase tracking-[-0.02em]">Technicals</div>
          <div className="font-serif text-3xl font-normal text-white mt-2 tracking-[0.01em]">8 Indicators</div>
          <div className="text-xs text-slash-ash mt-1">RSI, MACD, BB, SMAs</div>
        </div>

        <div className="rounded-[10px] bg-slash-onyx border border-slash-graphite p-6 flex flex-col justify-between">
          <div className="text-[13px] text-slash-fog font-medium uppercase tracking-[-0.02em]">Watchlist Ledger</div>
          <div className="font-serif text-3xl font-normal text-white mt-2 tracking-[0.01em]">{watchlist.length}</div>
          <div className="text-xs text-slash-copper mt-1">Persistent Storage</div>
        </div>
      </div>

      {/* Gilded Gradient Hero Chart Card */}
      <div className="rounded-[10px] bg-slash-onyx border border-slash-graphite p-6 lg:p-8 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="text-[13px] font-semibold text-slash-copper uppercase tracking-[-0.02em]">
              Gilded Ledger Chart
            </div>
            <h2 className="font-serif text-2xl font-normal text-white tracking-[0.01em] mt-0.5">
              Historical Closing Trajectory
            </h2>
            <p className="text-xs text-slash-fog mt-0.5">
              Showing 6-month continuous daily closes for {selectedBenchmark}
            </p>
          </div>

          {/* Pill Tag Buttons */}
          <div className="flex flex-wrap items-center gap-2">
            {[
              { label: 'Reliance (IN)', symbol: 'RELIANCE.NS' },
              { label: 'TCS (IN)', symbol: 'TCS.NS' },
              { label: 'Apple (US)', symbol: 'AAPL' },
              { label: 'Nvidia (US)', symbol: 'NVDA' },
            ].map((b) => (
              <button
                key={b.symbol}
                onClick={() => setSelectedBenchmark(b.symbol)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-mono transition border ${
                  selectedBenchmark === b.symbol
                    ? 'bg-white text-black border-white font-medium'
                    : 'bg-transparent text-slash-fog hover:text-white border-slash-steel'
                }`}
              >
                {b.label}
              </button>
            ))}
          </div>
        </div>

        {/* Recharts Area with Gilded Gradient */}
        <div className="h-72 w-full pt-2">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={benchmarkHistory}>
              <defs>
                <linearGradient id="gildedGradient" x1="0" y1="0" x2="0" y2="1">
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
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#040406',
                  borderColor: '#2e3038',
                  borderRadius: '10px',
                  color: '#fff',
                  fontSize: '12px',
                }}
              />
              <Area
                type="monotone"
                dataKey="close"
                name="Closing Price"
                stroke="#ae9357"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#gildedGradient)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Popular Equities Grid */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-[13px] font-semibold text-slash-copper uppercase tracking-[-0.02em]">Curated Assets</div>
            <h2 className="font-serif text-2xl font-normal text-white tracking-[0.01em] mt-0.5">
              Indian & International Equities
            </h2>
          </div>
          <button
            onClick={() => navigate('/explore')}
            className="flex items-center gap-1.5 text-xs font-semibold text-slash-copper hover:text-white transition"
          >
            <span>Explore All</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {overview.popular.map((stock) => (
            <StockCard key={stock.symbol} stock={stock} />
          ))}
        </div>
      </div>

      {/* Top Gainers & Decliners Panels */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Gainers */}
        <div className="rounded-[10px] bg-slash-onyx border border-slash-graphite p-6 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slash-graphite">
            <h3 className="font-serif text-lg font-normal text-white">Active Session Gainers</h3>
            <span className="text-[11px] font-mono text-slash-sage uppercase">Upward Velocity</span>
          </div>

          <div className="space-y-2">
            {overview.top_gainers.length > 0 ? (
              overview.top_gainers.map((item) => (
                <div
                  key={item.symbol}
                  onClick={() => {
                    setSelectedSymbol(item.symbol);
                    navigate(`/stocks/${encodeURIComponent(item.symbol)}`);
                  }}
                  className="flex items-center justify-between p-3 rounded-[8px] bg-slash-carbon hover:bg-slash-graphite cursor-pointer transition"
                >
                  <div>
                    <div className="font-mono font-bold text-sm text-white">{item.symbol}</div>
                    <div className="text-xs text-slash-fog truncate max-w-[180px]">{item.name}</div>
                  </div>
                  <div className="text-right">
                    <div className="font-serif text-base text-white">
                      {formatCurrency(item.price, item.currency)}
                    </div>
                    <div className="text-xs font-mono font-medium text-slash-sage">
                      {formatPercent(item.percent_change)}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-4 text-center text-xs text-slash-fog">No gainers available in current sample.</div>
            )}
          </div>
        </div>

        {/* Decliners */}
        <div className="rounded-[10px] bg-slash-onyx border border-slash-graphite p-6 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slash-graphite">
            <h3 className="font-serif text-lg font-normal text-white">Active Session Decliners</h3>
            <span className="text-[11px] font-mono text-slash-rose uppercase">Downward Pressure</span>
          </div>

          <div className="space-y-2">
            {overview.top_losers.length > 0 ? (
              overview.top_losers.map((item) => (
                <div
                  key={item.symbol}
                  onClick={() => {
                    setSelectedSymbol(item.symbol);
                    navigate(`/stocks/${encodeURIComponent(item.symbol)}`);
                  }}
                  className="flex items-center justify-between p-3 rounded-[8px] bg-slash-carbon hover:bg-slash-graphite cursor-pointer transition"
                >
                  <div>
                    <div className="font-mono font-bold text-sm text-white">{item.symbol}</div>
                    <div className="text-xs text-slash-fog truncate max-w-[180px]">{item.name}</div>
                  </div>
                  <div className="text-right">
                    <div className="font-serif text-base text-white">
                      {formatCurrency(item.price, item.currency)}
                    </div>
                    <div className="text-xs font-mono font-medium text-slash-rose">
                      {formatPercent(item.percent_change)}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-4 text-center text-xs text-slash-fog">No decliners available in current sample.</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
