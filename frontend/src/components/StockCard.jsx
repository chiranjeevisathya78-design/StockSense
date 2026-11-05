import React from 'react';
import { useNavigate } from 'react-router-dom';
import { TrendingUp, TrendingDown, Bookmark } from 'lucide-react';
import { formatCurrency, formatPercent } from '../services/api';
import { useStock } from '../context/StockContext';

export default function StockCard({ stock }) {
  const navigate = useNavigate();
  const { isInWatchlist, toggleWatchlist, setSelectedSymbol } = useStock();

  const isPositive = stock.change >= 0;
  const inWatchlist = isInWatchlist(stock.symbol);

  const handleClick = () => {
    setSelectedSymbol(stock.symbol);
    navigate(`/stocks/${encodeURIComponent(stock.symbol)}`);
  };

  return (
    <div
      onClick={handleClick}
      className="group relative rounded-2xl bg-white hover:bg-[#fafaf8] border border-[#e8e8e6] hover:border-[#d4d4d2] shadow-xs hover:shadow-md transition-all duration-200 p-6 cursor-pointer flex flex-col justify-between"
    >
      <div>
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-sm text-[#111] group-hover:opacity-70 transition">
              {stock.symbol}
            </span>
            <span className="text-[10px] uppercase font-medium px-2 py-0.5 rounded-full bg-[#f0f0ee] text-[#7b7b7b]">
              {stock.market === 'IN' ? 'NSE/BSE (₹)' : 'US ($)'}
            </span>
          </div>

          <button
            onClick={(e) => {
              e.stopPropagation();
              toggleWatchlist(stock.symbol);
            }}
            className={`p-1.5 rounded-full border transition ${
              inWatchlist
                ? 'bg-[#111] text-white border-[#111]'
                : 'bg-white text-[#9a9a9a] border-[#e8e8e6] hover:text-[#111] hover:bg-[#f0f0ee]'
            }`}
            title={inWatchlist ? 'Remove from Watchlist' : 'Add to Watchlist'}
          >
            <Bookmark className="w-3.5 h-3.5 fill-current" />
          </button>
        </div>

        <p className="text-xs text-[#7b7b7b] truncate max-w-[220px] mb-4">
          {stock.name}
        </p>
      </div>

      <div className="pt-3 border-t border-[#e8e8e6] flex items-end justify-between">
        <div>
          <div className="text-[10px] text-[#9a9a9a] mb-0.5 uppercase tracking-wider font-medium">Last Close</div>
          <div className="font-semibold text-lg text-[#111]">
            {formatCurrency(stock.price, stock.currency)}
          </div>
        </div>

        <div
          className={`flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full ${
            isPositive
              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200/60'
              : 'bg-rose-50 text-rose-700 border border-rose-200/60'
          }`}
        >
          {isPositive ? (
            <TrendingUp className="w-3.5 h-3.5 shrink-0" />
          ) : (
            <TrendingDown className="w-3.5 h-3.5 shrink-0" />
          )}
          <span>{formatPercent(stock.percent_change)}</span>
        </div>
      </div>
    </div>
  );
}
