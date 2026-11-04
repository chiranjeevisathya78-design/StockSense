import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Search,
  Bookmark,
  Menu,
  X,
  Activity,
  Globe
} from 'lucide-react';
import { useStock } from '../context/StockContext';
import { stockApi, formatCurrency, formatPercent } from '../services/api';

export default function Navbar() {
  const { selectedSymbol, setSelectedSymbol, watchlist, sidebarOpen, setSidebarOpen } = useStock();
  const [query, setQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const searchRef = useRef(null);
  const navigate = useNavigate();

  // Search debouncing
  useEffect(() => {
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }

    const timer = setTimeout(async () => {
      try {
        setIsSearching(true);
        const results = await stockApi.searchStocks(query);
        setSearchResults(results);
      } catch (err) {
        console.error('Search error:', err);
      } finally {
        setIsSearching(false);
      }
    }, 250);

    return () => clearTimeout(timer);
  }, [query]);

  // Click outside to close dropdown
  useEffect(() => {
    function handleClickOutside(event) {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelectStock = (symbol) => {
    setSelectedSymbol(symbol);
    setQuery('');
    setShowDropdown(false);
    navigate(`/stocks/${encodeURIComponent(symbol)}`);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && query.trim()) {
      const topSymbol = searchResults[0]?.symbol || query.trim().toUpperCase();
      handleSelectStock(topSymbol);
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-slash-obsidian/95 backdrop-blur-md border-b border-slash-graphite px-4 lg:px-8 py-3.5">
      <div className="flex items-center justify-between gap-4 max-w-[1216px] mx-auto">
        {/* Left: Sidebar Toggle & Brand */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 rounded-full bg-slash-onyx text-slash-fog hover:text-white hover:border-slash-slate transition border border-slash-graphite"
            title="Toggle Sidebar"
          >
            <Menu className="w-4 h-4" />
          </button>

          <Link to="/dashboard" className="flex items-center gap-2.5 group">
            <span className="font-serif text-2xl tracking-[0.01em] font-normal text-white group-hover:text-slash-copper transition">
              StockSense
            </span>
            <span className="text-[11px] font-mono tracking-wider uppercase px-2 py-0.5 rounded-full bg-slash-carbon text-slash-copper border border-slash-copper/30">
              AI
            </span>
          </Link>
        </div>

        {/* Center: Search Bar with Autocomplete */}
        <div className="flex-1 max-w-lg relative" ref={searchRef}>
          <div className="relative">
            <Search className="w-4 h-4 text-slash-fog absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search Indian (RELIANCE.NS) or US (AAPL) securities..."
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setShowDropdown(true);
              }}
              onFocus={() => setShowDropdown(true)}
              onKeyDown={handleKeyDown}
              className="w-full bg-slash-onyx border border-slash-slate rounded-full pl-10 pr-10 py-2 text-sm text-slash-bone placeholder-slash-ash focus:outline-none focus:border-white transition"
            />
            {query && (
              <button
                onClick={() => setQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slash-fog hover:text-white"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Autocomplete Dropdown */}
          {showDropdown && (searchResults.length > 0 || isSearching) && (
            <div className="absolute left-0 right-0 top-full mt-2 bg-slash-onyx border border-slash-graphite rounded-[10px] shadow-2xl overflow-hidden z-50 max-h-96 overflow-y-auto">
              {isSearching && (
                <div className="p-3 text-xs text-slash-fog text-center flex items-center justify-center gap-2">
                  <Activity className="w-3.5 h-3.5 animate-spin text-slash-copper" />
                  Querying live symbols...
                </div>
              )}
              {searchResults.map((item) => (
                <button
                  key={item.symbol}
                  onClick={() => handleSelectStock(item.symbol)}
                  className="w-full px-4 py-2.5 flex items-center justify-between text-left hover:bg-slash-carbon border-b border-slash-graphite/40 last:border-0 transition"
                >
                  <div className="flex items-center gap-2.5">
                    <span className="font-mono font-semibold text-sm text-white">
                      {item.symbol}
                    </span>
                    <span className="text-xs text-slash-fog truncate max-w-[200px] sm:max-w-xs">
                      {item.name}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span
                      className={`text-[10px] font-medium px-2 py-0.5 rounded-full border ${
                        item.market === 'IN'
                          ? 'border-slash-copper/40 text-slash-copper bg-slash-copperGlow'
                          : 'border-slash-steel text-slash-silver bg-slash-carbon'
                      }`}
                    >
                      {item.market === 'IN' ? 'NSE/BSE (₹)' : 'US Market ($)'}
                    </span>
                    <span className="text-[11px] font-mono text-slash-ash">
                      {item.exchange}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right: Quick Markets & Watchlist Link */}
        <div className="flex items-center gap-2.5">
          <div className="hidden xl:flex items-center gap-2 px-3 py-1.5 rounded-full bg-slash-onyx border border-slash-graphite text-xs">
            <span className="w-1.5 h-1.5 rounded-full bg-slash-sage animate-pulse"></span>
            <span className="text-slash-fog">NSE/BSE</span>
            <span className="text-slash-slate mx-1">|</span>
            <span className="w-1.5 h-1.5 rounded-full bg-slash-sage"></span>
            <span className="text-slash-fog">US Markets</span>
          </div>

          <Link
            to="/watchlist"
            className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-slash-onyx hover:bg-slash-carbon border border-slash-steel text-xs font-medium text-white transition"
          >
            <Bookmark className="w-3.5 h-3.5 text-slash-copper" />
            <span className="hidden sm:inline">Watchlist</span>
            <span className="px-1.5 py-0.2 rounded-full bg-slash-carbon border border-slash-graphite text-slash-bone text-[11px] font-mono">
              {watchlist.length}
            </span>
          </Link>
        </div>
      </div>
    </header>
  );
}
