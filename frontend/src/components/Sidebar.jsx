import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Compass,
  LineChart,
  Sliders,
  Cpu,
  Sparkles,
  Bookmark,
  Award,
  ShieldAlert
} from 'lucide-react';
import { useStock } from '../context/StockContext';

export default function Sidebar() {
  const { selectedSymbol, sidebarOpen } = useStock();

  const navItems = [
    {
      to: '/dashboard',
      label: 'Dashboard',
      icon: LayoutDashboard,
      exact: true,
    },
    {
      to: '/explore',
      label: 'Explore Stocks',
      icon: Compass,
    },
    {
      to: `/stocks/${encodeURIComponent(selectedSymbol)}`,
      label: 'Stock Details',
      icon: LineChart,
      badge: selectedSymbol,
    },
    {
      to: `/technical/${encodeURIComponent(selectedSymbol)}`,
      label: 'Technical Analysis',
      icon: Sliders,
    },
    {
      to: `/predictions/${encodeURIComponent(selectedSymbol)}`,
      label: 'AI Predictions',
      icon: Cpu,
      highlight: true,
    },
    {
      to: `/insights/${encodeURIComponent(selectedSymbol)}`,
      label: 'Market Insights',
      icon: Sparkles,
    },
    {
      to: '/watchlist',
      label: 'Watchlist',
      icon: Bookmark,
    },
    {
      to: `/models/${encodeURIComponent(selectedSymbol)}`,
      label: 'Model Metrics',
      icon: Award,
    },
  ];

  return (
    <aside
      className={`fixed lg:sticky top-0 lg:top-[57px] left-0 h-full lg:h-[calc(100vh-57px)] bg-slash-obsidian border-r border-slash-graphite transition-all duration-300 z-30 flex flex-col justify-between ${
        sidebarOpen ? 'w-64 translate-x-0' : 'w-20 -translate-x-full lg:translate-x-0'
      }`}
    >
      <div className="p-3">
        {sidebarOpen && (
          <div className="px-3 pt-2 pb-3">
            <span className="text-[12px] font-semibold uppercase tracking-[-0.02em] text-slash-copper">
              Ledger Navigation
            </span>
          </div>
        )}

        <div className="space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.label}
                to={item.to}
                end={item.exact}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2 rounded-full text-xs font-medium transition group ${
                    isActive
                      ? 'bg-slash-onyx text-white border border-slash-slate shadow-sm'
                      : 'text-slash-fog hover:text-white hover:bg-slash-carbon'
                  }`
                }
              >
                <Icon className={`w-4 h-4 shrink-0 transition ${
                  item.highlight ? 'text-slash-copper' : ''
                }`} />
                {sidebarOpen && (
                  <div className="flex items-center justify-between flex-1 truncate">
                    <span className="truncate">{item.label}</span>
                    {item.badge && (
                      <span className="text-[10px] font-mono px-2 py-0.2 rounded-full bg-slash-carbon border border-slash-graphite text-slash-copper truncate max-w-[70px]">
                        {item.badge}
                      </span>
                    )}
                  </div>
                )}
              </NavLink>
            );
          })}
        </div>

        {/* Selected Symbol Quick View in Sidebar */}
        {sidebarOpen && (
          <div className="mt-8 p-3.5 rounded-[10px] bg-slash-onyx border border-slash-graphite">
            <div className="flex items-center justify-between text-[11px] text-slash-fog mb-1">
              <span className="uppercase tracking-wider font-semibold">Active Ledger</span>
              <span className="w-1.5 h-1.5 rounded-full bg-slash-copper animate-ping"></span>
            </div>
            <div className="font-serif text-lg font-normal text-white truncate tracking-[0.01em]">
              {selectedSymbol}
            </div>
            <div className="text-[11px] text-slash-ash mt-0.5 font-sans">
              {selectedSymbol.endsWith('.NS') || selectedSymbol.endsWith('.BO') ? 'Indian NSE/BSE Equity' : 'US Market Equity'}
            </div>
          </div>
        )}
      </div>

      {/* Bottom Educational Disclaimer Badge */}
      <div className="p-3 border-t border-slash-graphite">
        {sidebarOpen ? (
          <div className="p-3 rounded-[10px] bg-slash-onyx border border-slash-graphite text-[11px] text-slash-fog leading-relaxed">
            <div className="flex items-center gap-1.5 text-slash-copper font-medium mb-1">
              <ShieldAlert className="w-3.5 h-3.5 shrink-0" />
              <span>Vault Analytics</span>
            </div>
            <span>Not investment advice. Quantitative models illustrate statistical methods.</span>
          </div>
        ) : (
          <div className="flex justify-center" title="Educational Platform — Not Investment Advice">
            <ShieldAlert className="w-4 h-4 text-slash-copper" />
          </div>
        )}
      </div>
    </aside>
  );
}
