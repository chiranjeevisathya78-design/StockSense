import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, NavLink, Link, useLocation } from 'react-router-dom';
import {
  Search,
  Menu,
  X,
  Activity,
  LogOut,
  Sparkles,
  TrendingUp,
} from 'lucide-react';
import { useStock } from '../context/StockContext';
import { stockApi } from '../services/api';
import StockLogo from './StockLogo';

export default function Navbar() {
  const {
    selectedSymbol,
    setSelectedSymbol,
    watchlist,
    user,
    logout,
    setAuthModalOpen,
    setAuthModalMode
  } = useStock();

  const [query, setQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const searchRef = useRef(null);
  const searchInputRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();

  /* Spacious, clean Kindred-style navigation destinations */
  const navLinks = [
    { to: '/dashboard', label: 'Dashboard', exact: true },
    { to: '/explore', label: 'Explore' },
    { to: `/stocks/${encodeURIComponent(selectedSymbol)}`, label: 'Deep Quote' },
    { to: `/technical/${encodeURIComponent(selectedSymbol)}`, label: 'Technicals' },
    { to: `/predictions/${encodeURIComponent(selectedSymbol)}`, label: 'Predictions' },
    { to: `/insights/${encodeURIComponent(selectedSymbol)}`, label: 'Insights' },
    { to: '/watchlist', label: 'Watchlist', count: watchlist.length },
  ];

  /* ⌘K shortcut for search */
  useEffect(() => {
    function handleKeyDown(e) {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setSearchOpen(true);
        setTimeout(() => searchInputRef.current?.focus(), 60);
      }
      if (e.key === 'Escape') {
        setSearchOpen(false);
        setShowDropdown(false);
        setQuery('');
      }
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  /* Search debounce */
  useEffect(() => {
    if (!query.trim()) { setSearchResults([]); return; }
    const timer = setTimeout(async () => {
      try {
        setIsSearching(true);
        const results = await stockApi.searchStocks(query);
        setSearchResults(results);
      } catch (err) { console.error('Search error:', err); }
      finally { setIsSearching(false); }
    }, 220);
    return () => clearTimeout(timer);
  }, [query]);

  /* Click outside closes search & dropdown */
  useEffect(() => {
    function handleClickOutside(event) {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowDropdown(false);
        if (!query) setSearchOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [query]);

  /* Close mobile menu on route change */
  useEffect(() => { setMobileMenuOpen(false); }, [location.pathname]);

  const handleSelectStock = (symbol) => {
    setSelectedSymbol(symbol);
    setQuery('');
    setShowDropdown(false);
    setSearchOpen(false);
    navigate(`/stocks/${encodeURIComponent(symbol)}`);
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchResults.length > 0) {
      handleSelectStock(searchResults[0].symbol);
    } else if (query.trim()) {
      handleSelectStock(query.trim().toUpperCase());
    }
  };

  return (
    <>
      {/* ── Airy, Spacious, Whitish Nav Bar ── */}
      <header className="sticky top-0 z-50 w-full bg-white/95 backdrop-blur-md border-b border-[#e8e8e6] transition-all duration-200">
        <div className="max-w-6xl mx-auto px-6 sm:px-8 py-4 sm:py-5 flex items-center justify-between gap-8">

          {/* ── Brand Logo with Comfortable Breathing Room ── */}
          <Link
            to="/dashboard"
            className="flex items-center gap-3 shrink-0 group select-none mr-2"
          >
            <div className="w-8 h-8 rounded-xl bg-[#f7f7f5] border border-[#e8e8e6] flex items-center justify-center group-hover:scale-105 transition-transform">
              <StockLogo size={20} />
            </div>
            <span className="text-[17px] font-semibold text-[#111] tracking-[-0.015em] group-hover:opacity-75 transition-opacity">
              StockSense
            </span>
          </Link>

          {/* ── Spacious Center Links (Uncrowded, Generous Gaps) ── */}
          <nav className="hidden lg:flex items-center gap-7 xl:gap-8 text-[14px]">
            {navLinks.map((item) => (
              <NavLink
                key={item.label}
                to={item.to}
                end={item.exact}
                className={({ isActive }) =>
                  `flex items-center gap-1.5 transition-all duration-200 py-1 ${
                    isActive
                      ? 'text-[#000] font-semibold'
                      : 'text-[#4b5563] hover:text-[#000] font-normal'
                  }`
                }
              >
                <span>{item.label}</span>
                {item.count !== undefined && item.count > 0 && (
                  <span className="text-[10px] font-semibold px-1.5 py-0.2 rounded-full bg-[#f0f0ee] text-[#71717a]">
                    {item.count}
                  </span>
                )}
              </NavLink>
            ))}
          </nav>

          {/* ── Right: Clean Search Pill & Kindred Black Pill Button ── */}
          <div className="flex items-center gap-3 sm:gap-4 shrink-0">
            {/* Search Pill */}
            <button
              onClick={() => {
                setSearchOpen(!searchOpen);
                setTimeout(() => searchInputRef.current?.focus(), 60);
              }}
              className="flex items-center gap-2.5 px-3.5 sm:px-4 py-2 rounded-full bg-[#f7f7f5] hover:bg-[#f0f0ee] border border-[#e8e8e6] text-[#6b7280] hover:text-[#111] text-xs transition-all duration-200"
              title="Search stocks (⌘K)"
            >
              <Search className="w-3.5 h-3.5 text-[#9a9a9a]" />
              <span className="hidden sm:inline font-normal">Search…</span>
              <kbd className="hidden sm:inline text-[9px] px-1.5 py-0.5 rounded bg-white text-[#9a9a9a] font-medium border border-[#e8e8e6]">
                ⌘K
              </kbd>
            </button>

            {/* Auth or Sign In Button */}
            {user ? (
              <div className="flex items-center gap-2.5 pl-2 border-l border-[#e8e8e6]">
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#f0f0ee] text-xs font-medium text-[#111]">
                  <span className="w-5 h-5 rounded-full bg-[#111] text-white text-[10px] font-semibold flex items-center justify-center">
                    {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
                  </span>
                  <span className="hidden sm:inline max-w-[85px] truncate">
                    {user.name}
                  </span>
                </div>
                <button
                  onClick={logout}
                  className="p-1.5 rounded-full hover:bg-[#f0f0ee] text-[#9a9a9a] hover:text-[#111] transition-colors"
                  title="Sign Out"
                >
                  <LogOut className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <button
                onClick={() => {
                  setAuthModalMode('login');
                  setAuthModalOpen(true);
                }}
                className="bg-[#111] hover:bg-black text-white px-5 sm:px-6 py-2.5 rounded-full font-medium text-[13.5px] transition-transform duration-200 hover:-translate-y-px shadow-xs cursor-pointer"
              >
                Sign In
              </button>
            )}

            {/* Mobile Hamburger Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 rounded-full bg-[#f7f7f5] text-[#3a3a3a] hover:text-[#111] border border-[#e8e8e6] transition-colors"
              aria-label="Toggle navigation"
            >
              {mobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* ── Clean Whitish Search Dropdown Drawer ── */}
        {searchOpen && (
          <div className="border-t border-[#e8e8e6] bg-[#f7f7f5] py-4 px-6 animate-fadeIn shadow-md">
            <div className="max-w-xl mx-auto" ref={searchRef}>
              <form onSubmit={handleSearchSubmit} className="relative">
                <Search className="w-4 h-4 text-[#9a9a9a] absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  ref={searchInputRef}
                  type="text"
                  placeholder="Search NSE/BSE and US stocks (e.g. RELIANCE.NS, AAPL)..."
                  value={query}
                  onChange={(e) => {
                    setQuery(e.target.value);
                    setShowDropdown(true);
                  }}
                  onFocus={() => setShowDropdown(true)}
                  className="w-full bg-white border border-[#e8e8e6] rounded-full pl-11 pr-16 py-2.5 text-sm text-[#111] placeholder-[#9a9a9a] focus:outline-none focus:border-[#111]/30 transition"
                />
                <div className="absolute right-3.5 top-1/2 -translate-y-1/2 flex items-center gap-1.5">
                  {query && (
                    <button
                      type="button"
                      onClick={() => setQuery('')}
                      className="p-1 rounded-full text-[#9a9a9a] hover:text-[#111]"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                  <span className="text-[9px] px-1.5 py-0.5 rounded bg-[#f0f0ee] text-[#9a9a9a] font-medium select-none">
                    ESC
                  </span>
                </div>
              </form>

              {/* Autocomplete Results */}
              {showDropdown && (searchResults.length > 0 || isSearching) && (
                <div className="mt-2.5 bg-white border border-[#e8e8e6] rounded-2xl shadow-lg overflow-hidden max-h-72 overflow-y-auto divide-y divide-[#e8e8e6]/60">
                  {isSearching && (
                    <div className="p-4 text-xs text-[#9a9a9a] text-center flex items-center justify-center gap-2">
                      <Activity className="w-3.5 h-3.5 animate-spin text-[#111]" />
                      Scanning securities…
                    </div>
                  )}
                  {searchResults.map((item) => (
                    <button
                      key={item.symbol}
                      type="button"
                      onClick={() => handleSelectStock(item.symbol)}
                      className="w-full px-4 py-3 flex items-center justify-between text-left hover:bg-[#f7f7f5] transition-colors"
                    >
                      <div>
                        <div className="text-sm font-medium text-[#111]">{item.symbol}</div>
                        <div className="text-xs text-[#7b7b7b] truncate max-w-[200px] sm:max-w-sm">{item.name}</div>
                      </div>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#f0f0ee] text-[#7b7b7b] font-medium">
                        {item.market === 'IN' ? 'NSE/BSE' : 'US Market'}
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── Mobile Drawer (Clean & Light) ── */}
        {mobileMenuOpen && (
          <div className="lg:hidden border-t border-[#e8e8e6] bg-white px-6 py-5 space-y-1 animate-fadeIn shadow-lg">
            {navLinks.map((item) => (
              <NavLink
                key={item.label}
                to={item.to}
                end={item.exact}
                className={({ isActive }) =>
                  `flex items-center justify-between px-4 py-3 rounded-xl text-sm transition-colors ${
                    isActive
                      ? 'bg-[#f0f0ee] text-[#111] font-medium'
                      : 'text-[#4b5563] hover:text-[#111] hover:bg-[#f7f7f5]'
                  }`
                }
              >
                <span>{item.label}</span>
                {item.count !== undefined && item.count > 0 && (
                  <span className="text-xs px-2 py-0.5 rounded-full bg-[#f0f0ee] text-[#7b7b7b]">
                    {item.count}
                  </span>
                )}
              </NavLink>
            ))}
          </div>
        )}
      </header>
    </>
  );
}
