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
      className="group relative rounded-[10px] bg-slash-onyx hover:bg-slash-carbon border border-slash-graphite hover:border-slash-slate transition-all duration-200 p-5 cursor-pointer flex flex-col justify-between"
    >
      <div>
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <span className="font-mono font-bold text-sm text-white group-hover:text-slash-copper transition">
              {stock.symbol}
            </span>
            <span
              className={`text-[10px] font-medium px-2 py-0.5 rounded-full border ${
                stock.market === 'IN'
                  ? 'border-slash-copper/40 text-slash-copper bg-slash-copperGlow'
                  : 'border-slash-steel text-slash-silver bg-slash-carbon'
              }`}
            >
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
                ? 'bg-slash-carbon text-slash-copper border-slash-copper/40'
                : 'bg-transparent text-slash-fog border-slash-graphite hover:text-white'
            }`}
            title={inWatchlist ? 'Remove from Watchlist' : 'Add to Watchlist'}
          >
            <Bookmark className="w-3 h-3 fill-current" />
          </button>
        </div>

        <p className="text-xs text-slash-fog truncate max-w-[220px] mb-4">
          {stock.name}
        </p>
      </div>

      <div className="pt-3 border-t border-slash-graphite/60 flex items-end justify-between">
        <div>
          <div className="text-[11px] text-slash-ash mb-0.5 uppercase tracking-wider font-medium">Last Settlement</div>
          <div className="font-serif text-xl font-normal text-white tracking-[0.01em]">
            {formatCurrency(stock.price, stock.currency)}
          </div>
        </div>

        <div
          className={`flex items-center gap-1 font-mono text-xs font-medium px-2.5 py-0.5 rounded-full border ${
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
          <span>{formatPercent(stock.percent_change)}</span>
        </div>
      </div>
    </div>
  );
}
