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
      className="group relative liquid-glass-panel liquid-glass-hover p-5 cursor-pointer flex flex-col justify-between"
    >
      <div>
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-sm text-[#0f1115] group-hover:text-emerald-700 transition">
              {stock.symbol}
            </span>
            <span className="text-[10px] uppercase font-semibold px-2 py-0.5 rounded-full bg-black/5 text-[#636366] border border-black/5">
              {stock.market === 'IN' ? 'NSE (₹)' : 'US ($)'}
            </span>
          </div>

          <button
            onClick={(e) => {
              e.stopPropagation();
              toggleWatchlist(stock.symbol);
            }}
            className={`p-1.5 rounded-full border transition-all cursor-pointer ${
              inWatchlist
                ? 'liquid-glass-btn text-white'
                : 'spatial-pill text-[#8e8e93] hover:text-[#0f1115]'
            }`}
            title={inWatchlist ? 'Remove from Watchlist' : 'Add to Watchlist'}
          >
            <Bookmark className={`w-3.5 h-3.5 ${inWatchlist ? 'fill-current' : ''}`} />
          </button>
        </div>

        <p className="text-xs text-[#8e8e93] truncate max-w-[220px] mb-4">
          {stock.name}
        </p>
      </div>

      <div className="pt-3 border-t border-black/5 flex items-end justify-between">
        <div>
          <div className="text-[10px] text-[#8e8e93] mb-0.5 uppercase tracking-wider font-medium">Last Close</div>
          <div className="font-semibold text-lg text-[#0f1115]">
            {formatCurrency(stock.price, stock.currency)}
          </div>
        </div>

        <div
          className={`flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full ${
            isPositive
              ? 'liquid-accent-pill text-emerald-800 font-semibold'
              : 'bg-rose-500/10 text-rose-700 border border-rose-500/20'
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
