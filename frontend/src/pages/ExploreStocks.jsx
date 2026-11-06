import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search,
  TrendingUp,
  TrendingDown,
  Bookmark,
  Sliders,
  Cpu
} from 'lucide-react';
import { stockApi, formatCurrency, formatPercent } from '../services/api';
import { useStock } from '../context/StockContext';
import LoadingSkeleton from '../components/LoadingSkeleton';
import DisclaimerBanner from '../components/DisclaimerBanner';

export default function ExploreStocks() {
  const { setSelectedSymbol, isInWatchlist, toggleWatchlist } = useStock();
  const navigate = useNavigate();

  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState('ALL');
  const [loading, setLoading] = useState(false);
  const [stocks, setStocks] = useState([]);
  const [stockQuotes, setStockQuotes] = useState({});

  const handleSearch = async (searchTerm = '') => {
    try {
      setLoading(true);
      const results = await stockApi.searchStocks(searchTerm);
      setStocks(results);

      const quotePromises = results.slice(0, 12).map(async (s) => {
        try {
          const q = await stockApi.getQuote(s.symbol);
          return { symbol: s.symbol, quote: q };
        } catch {
          return null;
        }
      });
      const quotesResolved = await Promise.all(quotePromises);
      const quotesMap = {};
      quotesResolved.forEach((item) => {
        if (item) quotesMap[item.symbol] = item.quote;
      });
      setStockQuotes(quotesMap);
    } catch (err) {
      console.error('Failed to search stocks:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    handleSearch('');
  }, []);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    handleSearch(query);
  };

  const filteredStocks = stocks.filter((s) => {
    if (filter === 'IN') return s.market === 'IN';
    if (filter === 'US') return s.market === 'US';
    return true;
  });

  return (
    <div className="space-y-8 font-sans text-[#636366]">
      {/* Page Header */}
      <div className="pb-6 border-b border-black/5">
        <div className="text-xs uppercase tracking-wider text-[#8e8e93] font-medium mb-1">
          Market Directory
        </div>
        <h1 className="text-3xl sm:text-4xl font-semibold text-[#0f1115] tracking-tight">
          Explore Securities
        </h1>
        <p className="text-sm text-[#8e8e93] mt-1 leading-relaxed">
          Discover equities across the National Stock Exchange of India (NSE), Bombay Stock Exchange (BSE), NASDAQ, and NYSE.
        </p>
      </div>

      <DisclaimerBanner compact />

      {/* Search and Filters Bar */}
      <div className="flex flex-col md:flex-row gap-4 justify-between items-stretch md:items-center">
        <form onSubmit={handleSearchSubmit} className="relative flex-1 max-w-lg">
          <Search className="w-4 h-4 text-[#8e8e93] absolute left-4 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by ticker (e.g. INFY.NS, TSLA) or company name..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full neo-skeuo-inset pl-11 pr-24 py-2.5 text-sm text-[#0f1115] placeholder-[#8e8e93] focus:outline-none transition"
          />
          <button
            type="submit"
            className="absolute right-1.5 top-1/2 -translate-y-1/2 px-4 py-1.5 liquid-glass-btn text-xs font-semibold cursor-pointer"
          >
            Search
          </button>
        </form>

        {/* Filter Pills */}
        <div className="spatial-pill flex items-center gap-1.5 p-1 self-start md:self-auto">
          {[
            { id: 'ALL', label: 'All Exchanges' },
            { id: 'IN', label: 'India (NSE)' },
            { id: 'US', label: 'US (NASDAQ)' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setFilter(tab.id)}
              className={`px-4 py-1.5 rounded-full text-xs font-semibold transition cursor-pointer ${
                filter === tab.id
                  ? 'liquid-glass-btn text-white'
                  : 'text-[#636366] hover:text-[#0f1115]'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Stocks Directory Table */}
      {loading ? (
        <LoadingSkeleton type="table" count={6} />
      ) : (
        <div className="liquid-glass-panel overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-white/40 text-[11px] uppercase font-semibold text-[#8e8e93] border-b border-black/5">
                <tr>
                  <th className="px-6 py-4">Ticker & Security</th>
                  <th className="px-6 py-4">Exchange</th>
                  <th className="px-6 py-4 text-right">Latest Settlement</th>
                  <th className="px-6 py-4 text-right">24h Shift</th>
                  <th className="px-6 py-4 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#e8e8e6]">
                {filteredStocks.map((stock) => {
                  const quote = stockQuotes[stock.symbol];
                  const inWatchlist = isInWatchlist(stock.symbol);
                  const isPositive = quote ? quote.change >= 0 : true;

                  return (
                    <tr
                      key={stock.symbol}
                      className="hover:bg-[#fafaf8] transition group cursor-pointer"
                      onClick={() => {
                        setSelectedSymbol(stock.symbol);
                        navigate(`/stocks/${encodeURIComponent(stock.symbol)}`);
                      }}
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleWatchlist(stock.symbol);
                            }}
                            className={`p-1.5 rounded-full border transition ${
                              inWatchlist
                                ? 'bg-[#111] text-white border-[#111]'
                                : 'bg-transparent text-[#9a9a9a] border-[#e8e8e6] hover:text-[#111] hover:bg-[#f0f0ee]'
                            }`}
                            title={inWatchlist ? 'Remove from Watchlist' : 'Add to Watchlist'}
                          >
                            <Bookmark className="w-3.5 h-3.5 fill-current" />
                          </button>
                          <div>
                            <div className="font-semibold text-sm text-[#111] group-hover:opacity-75 transition">
                              {stock.symbol}
                            </div>
                            <div className="text-xs text-[#7b7b7b] truncate max-w-xs">
                              {stock.name}
                            </div>
                          </div>
                        </div>
                      </td>

                      <td className="px-6 py-4">
                        <span className="text-[10px] font-medium px-2.5 py-0.5 rounded-full bg-[#f0f0ee] text-[#4b5563]">
                          {stock.market === 'IN' ? 'NSE/BSE (₹)' : 'US Market ($)'}
                        </span>
                      </td>

                      <td className="px-6 py-4 text-right font-medium text-sm text-[#111]">
                        {quote ? formatCurrency(quote.price, quote.currency) : '—'}
                      </td>

                      <td className="px-6 py-4 text-right">
                        {quote ? (
                          <div
                            className={`inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-0.5 rounded-full ${
                              isPositive
                                ? 'text-emerald-700 bg-emerald-50 border border-emerald-200/60'
                                : 'text-rose-700 bg-rose-50 border border-rose-200/60'
                            }`}
                          >
                            {isPositive ? (
                              <TrendingUp className="w-3 h-3" />
                            ) : (
                              <TrendingDown className="w-3 h-3" />
                            )}
                            <span>{formatPercent(quote.percent_change)}</span>
                          </div>
                        ) : (
                          <span className="text-[#9a9a9a] text-xs">—</span>
                        )}
                      </td>

                      <td className="px-6 py-4 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedSymbol(stock.symbol);
                              navigate(`/technical/${encodeURIComponent(stock.symbol)}`);
                            }}
                            className="p-1.5 rounded-full bg-[#f0f0ee] hover:bg-[#e8e8e6] text-[#4b5563] hover:text-[#111] transition cursor-pointer"
                            title="Technicals"
                          >
                            <Sliders className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedSymbol(stock.symbol);
                              navigate(`/predictions/${encodeURIComponent(stock.symbol)}`);
                            }}
                            className="p-1.5 rounded-full bg-[#f0f0ee] hover:bg-[#e8e8e6] text-[#4b5563] hover:text-[#111] transition cursor-pointer"
                            title="AI Predictions"
                          >
                            <Cpu className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
