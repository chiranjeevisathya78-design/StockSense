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
    <div className="p-4 lg:p-8 space-y-10 max-w-[1216px] mx-auto">
      {/* Page Header */}
      <div className="pb-6 border-b border-slash-graphite">
        <div className="text-[13px] font-semibold text-slash-copper uppercase tracking-[-0.02em] mb-1">
          Market Directory
        </div>
        <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-normal text-white tracking-[0.01em]">
          Explore Securities
        </h1>
        <p className="text-sm text-slash-fog mt-2">
          Discover equities across the National Stock Exchange of India (NSE), Bombay Stock Exchange (BSE), NASDAQ, and NYSE.
        </p>
      </div>

      <DisclaimerBanner compact />

      {/* Search and Filters Bar */}
      <div className="flex flex-col md:flex-row gap-4 justify-between items-stretch md:items-center">
        <form onSubmit={handleSearchSubmit} className="relative flex-1 max-w-lg">
          <Search className="w-4 h-4 text-slash-fog absolute left-4 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by ticker (e.g. INFY.NS, TSLA) or company name..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full bg-slash-onyx border border-slash-slate rounded-full pl-11 pr-24 py-2.5 text-sm text-slash-bone placeholder-slash-ash focus:outline-none focus:border-white transition"
          />
          <button
            type="submit"
            className="absolute right-2 top-1/2 -translate-y-1/2 px-4 py-1.5 bg-white text-black text-xs font-semibold rounded-full hover:bg-slate-200 transition"
          >
            Search
          </button>
        </form>

        {/* Filter Pills */}
        <div className="flex items-center gap-2 p-1 rounded-full bg-slash-onyx border border-slash-graphite self-start md:self-auto">
          {[
            { id: 'ALL', label: 'All Exchanges' },
            { id: 'IN', label: 'India (NSE/BSE)' },
            { id: 'US', label: 'US (NASDAQ/NYSE)' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setFilter(tab.id)}
              className={`px-4 py-1.5 rounded-full text-xs transition ${
                filter === tab.id
                  ? 'bg-white text-black font-semibold'
                  : 'text-slash-fog hover:text-white'
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
        <div className="rounded-[10px] bg-slash-onyx border border-slash-graphite overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slash-carbon text-xs uppercase font-medium text-slash-fog border-b border-slash-graphite">
                <tr>
                  <th className="px-6 py-4">Ticker & Security</th>
                  <th className="px-6 py-4">Exchange</th>
                  <th className="px-6 py-4 text-right">Latest Settlement</th>
                  <th className="px-6 py-4 text-right">24h Shift</th>
                  <th className="px-6 py-4 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slash-graphite/40">
                {filteredStocks.map((stock) => {
                  const quote = stockQuotes[stock.symbol];
                  const inWatchlist = isInWatchlist(stock.symbol);
                  const isPositive = quote ? quote.change >= 0 : true;

                  return (
                    <tr
                      key={stock.symbol}
                      className="hover:bg-slash-carbon transition group cursor-pointer"
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
                                ? 'bg-slash-carbon text-slash-copper border-slash-copper/40'
                                : 'bg-transparent text-slash-fog border-slash-graphite hover:text-white'
                            }`}
                            title={inWatchlist ? 'Remove from Watchlist' : 'Add to Watchlist'}
                          >
                            <Bookmark className="w-3.5 h-3.5 fill-current" />
                          </button>
                          <div>
                            <div className="font-mono font-bold text-white group-hover:text-slash-copper transition">
                              {stock.symbol}
                            </div>
                            <div className="text-xs text-slash-fog truncate max-w-xs">
                              {stock.name}
                            </div>
                          </div>
                        </div>
                      </td>

                      <td className="px-6 py-4">
                        <span
                          className={`text-[10px] font-medium px-2.5 py-0.5 rounded-full border ${
                            stock.market === 'IN'
                              ? 'border-slash-copper/40 text-slash-copper bg-slash-copperGlow'
                              : 'border-slash-steel text-slash-silver bg-slash-carbon'
                          }`}
                        >
                          {stock.market === 'IN' ? 'NSE/BSE (₹)' : 'US Market ($)'}
                        </span>
                      </td>

                      <td className="px-6 py-4 text-right font-serif text-base text-white">
                        {quote ? formatCurrency(quote.price, quote.currency) : '—'}
                      </td>

                      <td className="px-6 py-4 text-right">
                        {quote ? (
                          <div
                            className={`inline-flex items-center gap-1 font-mono text-xs font-medium px-2.5 py-0.5 rounded-full border ${
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
                        ) : (
                          <span className="text-slash-fog text-xs">—</span>
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
                            className="p-1.5 rounded-full bg-slash-carbon hover:bg-slash-graphite text-slash-fog hover:text-white border border-slash-graphite transition"
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
                            className="p-1.5 rounded-full bg-slash-carbon hover:bg-slash-graphite text-slash-fog hover:text-slash-copper border border-slash-graphite transition"
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
