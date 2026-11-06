import React, { useState, useEffect, useRef } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Compass,
  BarChart3,
  Activity,
  Cpu,
  Sparkles,
  Bookmark,
  Gauge,
  Search,
  LogOut,
  User,
  ChevronRight,
  Menu,
  X,
  TrendingUp,
  Layers
} from 'lucide-react';
import { useStock } from '../context/StockContext';
import { stockApi } from '../services/api';
import StockLogo from './StockLogo';

export default function Sidebar() {
  const {
    selectedSymbol,
    setSelectedSymbol,
    watchlist,
    user,
    logout,
    setAuthModalOpen,
    setAuthModalMode,
  } = useStock();

  const [query, setQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const searchRef = useRef(null);
  const searchInputRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();

  const navItems = [
    { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/explore', label: 'Explore Market', icon: Compass },
    { to: `/stocks/${encodeURIComponent(selectedSymbol)}`, label: 'Deep Quote', icon: BarChart3 },
    { to: `/technical/${encodeURIComponent(selectedSymbol)}`, label: 'Technicals', icon: Activity },
    { to: `/predictions/${encodeURIComponent(selectedSymbol)}`, label: 'AI Predictions', icon: Cpu },
    { to: `/insights/${encodeURIComponent(selectedSymbol)}`, label: 'Market Insights', icon: Sparkles },
    { to: '/watchlist', label: 'Watchlist', icon: Bookmark, badge: watchlist.length },
    { to: '/models', label: 'Model Lab', icon: Gauge },
  ];

  const quickTickers = ['RELIANCE.NS', 'NVDA', 'AAPL', 'TCS.NS'];

  // Global search shortcut ⌘K
  useEffect(() => {
    function handleKeyDown(e) {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        searchInputRef.current?.focus();
        setShowDropdown(true);
      }
      if (e.key === 'Escape') {
        setShowDropdown(false);
        setQuery('');
      }
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Search debounce
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
    }, 200);
    return () => clearTimeout(timer);
  }, [query]);

  // Click outside to close dropdown
  useEffect(() => {
    function handleClickOutside(e) {
      if (searchRef.current && !searchRef.current.contains(e.target)) {
        setShowDropdown(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Close mobile sidebar on route change
  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  const handleSelect = (sym) => {
    setSelectedSymbol(sym);
    setQuery('');
    setShowDropdown(false);
    navigate(`/stocks/${encodeURIComponent(sym)}`);
  };

  const handleLoginClick = () => {
    setAuthModalMode('login');
    setAuthModalOpen(true);
  };

  const sidebarContent = (
    <div className="flex flex-col h-full justify-between">
      {/* ── Top Area: Brand + Search + Navigation ── */}
      <div className="space-y-5">
        {/* Brand Header */}
        <div className="flex items-center justify-between pb-3 border-b border-black/5">
          <NavLink to="/" className="flex items-center gap-2.5 group">
            <div className="p-2 rounded-2xl bg-white/90 shadow-sm border border-white/90 group-hover:scale-105 transition-transform duration-200">
              <StockLogo size={22} />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-semibold text-[15px] text-[#0f1115] tracking-tight">StockSense</span>
                <span className="text-[10px] font-bold px-1.5 py-0.2 rounded-md bg-emerald-500/10 text-emerald-700 border border-emerald-500/20">
                  AI
                </span>
              </div>
              <div className="text-[10.5px] text-[#8e8e93] font-medium flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <span>Spatial Terminal</span>
              </div>
            </div>
          </NavLink>

          {/* Mobile close button */}
          <button
            onClick={() => setMobileOpen(false)}
            className="md:hidden p-1.5 rounded-xl bg-black/5 text-[#636366] hover:text-[#0f1115]"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tactile Inset Search Bar */}
        <div ref={searchRef} className="relative">
          <div className="neo-skeuo-inset flex items-center px-3 py-2 text-xs transition-all focus-within:ring-2 focus-within:ring-emerald-500/30">
            <Search className="w-3.5 h-3.5 text-[#8e8e93] mr-2 shrink-0" />
            <input
              ref={searchInputRef}
              type="text"
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setShowDropdown(true);
              }}
              onFocus={() => setShowDropdown(true)}
              placeholder="Search ticker or name..."
              className="bg-transparent border-none outline-none w-full text-xs text-[#0f1115] placeholder-[#8e8e93]"
            />
            <kbd className="hidden sm:inline-block px-1.5 py-0.5 text-[9px] font-mono text-[#8e8e93] bg-white/80 rounded border border-black/5 shadow-2xs">
              ⌘K
            </kbd>
          </div>

          {/* Search Dropdown (Floating Glass List) */}
          {showDropdown && (query.trim() || isSearching) && (
            <div className="absolute left-0 right-0 top-full mt-2 liquid-glass-panel bg-white/95 backdrop-blur-2xl border border-white/80 p-2 shadow-xl z-50 max-h-64 overflow-y-auto rounded-2xl">
              {isSearching ? (
                <div className="p-3 text-center text-xs text-[#8e8e93]">Querying live feeds...</div>
              ) : searchResults.length > 0 ? (
                <div className="space-y-1">
                  {searchResults.map((s) => (
                    <button
                      key={s.symbol}
                      onClick={() => handleSelect(s.symbol)}
                      className="w-full flex items-center justify-between p-2 rounded-xl text-left hover:bg-emerald-50/60 hover:text-emerald-900 transition-colors text-xs cursor-pointer"
                    >
                      <div>
                        <div className="font-semibold text-[#0f1115]">{s.symbol}</div>
                        <div className="text-[11px] text-[#8e8e93] truncate max-w-[150px]">{s.name}</div>
                      </div>
                      <span className="text-[10px] font-medium px-1.5 py-0.5 rounded bg-black/5 text-[#636366]">
                        {s.exchange}
                      </span>
                    </button>
                  ))}
                </div>
              ) : (
                <div className="p-3 text-center text-xs text-[#8e8e93]">No tickers found</div>
              )}
            </div>
          )}
        </div>

        {/* Navigation Links */}
        <nav className="space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  `flex items-center justify-between px-3.5 py-2.5 rounded-2xl text-xs font-medium transition-all duration-200 group ${
                    isActive
                      ? 'bg-white/90 text-[#0f1115] shadow-xs border border-white/90 font-semibold'
                      : 'text-[#636366] hover:text-[#0f1115] hover:bg-white/50'
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    <div className="flex items-center gap-3">
                      <div
                        className={`p-1.5 rounded-xl transition-colors ${
                          isActive
                            ? 'bg-emerald-500/15 text-emerald-700'
                            : 'bg-black/5 text-[#8e8e93] group-hover:text-[#0f1115]'
                        }`}
                      >
                        <Icon className="w-4 h-4" />
                      </div>
                      <span>{item.label}</span>
                    </div>

                    {item.badge !== undefined && (
                      <span className="px-2 py-0.5 text-[10px] font-semibold rounded-full bg-black/5 text-[#636366]">
                        {item.badge}
                      </span>
                    )}
                  </>
                )}
              </NavLink>
            );
          })}
        </nav>

        {/* Quick Ticker Switcher */}
        <div className="p-3 rounded-2xl bg-white/40 border border-white/60 space-y-2">
          <div className="text-[10.5px] font-medium text-[#8e8e93] uppercase tracking-wider flex items-center justify-between">
            <span>Quick Ticker</span>
            <span className="font-semibold text-emerald-600">{selectedSymbol}</span>
          </div>
          <div className="grid grid-cols-2 gap-1.5">
            {quickTickers.map((t) => (
              <button
                key={t}
                onClick={() => setSelectedSymbol(t)}
                className={`px-2 py-1.5 rounded-xl text-[11px] font-medium transition-all cursor-pointer ${
                  selectedSymbol === t
                    ? 'bg-white text-[#0f1115] font-semibold shadow-2xs border border-white/90'
                    : 'bg-white/40 text-[#636366] hover:bg-white/80'
                }`}
              >
                {t.replace('.NS', '')}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── Bottom Area: User Session Profile ── */}
      <div className="pt-4 border-t border-black/5">
        {user ? (
          <div className="flex items-center justify-between p-2 rounded-2xl bg-white/50 border border-white/60">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-8 h-8 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-800 flex items-center justify-center font-bold text-xs shrink-0">
                {user.email?.[0]?.toUpperCase() || 'U'}
              </div>
              <div className="min-w-0">
                <div className="text-xs font-semibold text-[#0f1115] truncate">
                  {user.email?.split('@')[0]}
                </div>
                <div className="text-[10px] text-[#8e8e93]">Pro Access</div>
              </div>
            </div>
            <button
              onClick={logout}
              title="Sign Out"
              className="p-1.5 rounded-xl hover:bg-rose-50 hover:text-rose-600 text-[#8e8e93] transition-colors cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <button
            onClick={handleLoginClick}
            className="w-full liquid-glass-btn py-2.5 px-4 text-xs font-medium flex items-center justify-center gap-2 cursor-pointer"
          >
            <User className="w-3.5 h-3.5" />
            <span>Sign In / Demo</span>
          </button>
        )}
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Floating Spatial Sidebar */}
      <aside className="hidden md:block w-72 shrink-0 p-4 sticky top-0 h-screen z-30">
        <div className="h-full liquid-glass-panel p-5 overflow-y-auto">
          {sidebarContent}
        </div>
      </aside>

      {/* Mobile Top Header with Hamburger */}
      <div className="md:hidden sticky top-0 z-40 px-4 py-3 bg-white/80 backdrop-blur-xl border-b border-white/60 flex items-center justify-between">
        <NavLink to="/" className="flex items-center gap-2">
          <StockLogo size={20} />
          <span className="font-semibold text-sm text-[#0f1115]">StockSense</span>
          <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-emerald-500/10 text-emerald-700">
            AI
          </span>
        </NavLink>
        <button
          onClick={() => setMobileOpen(true)}
          className="p-2 rounded-xl bg-black/5 text-[#0f1115]"
        >
          <Menu className="w-5 h-5" />
        </button>
      </div>

      {/* Mobile Drawer Backdrop & Panel */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex">
          <div
            className="fixed inset-0 bg-black/30 backdrop-blur-xs transition-opacity"
            onClick={() => setMobileOpen(false)}
          />
          <div className="relative w-72 max-w-[80vw] h-full liquid-glass-panel bg-white/95 p-5 shadow-2xl z-10 overflow-y-auto">
            {sidebarContent}
          </div>
        </div>
      )}
    </>
  );
}
