import React from 'react';
import { Database, Activity } from 'lucide-react';
import { useStock } from '../context/StockContext';

export default function Footer() {
  const { isWatchlistDemoMode } = useStock();

  return (
    <footer className="mt-24 bg-slash-obsidian border-t border-slash-graphite text-xs text-slash-fog py-12 px-4 lg:px-8">
      <div className="max-w-[1216px] mx-auto space-y-8">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="font-serif text-2xl font-normal text-white tracking-[0.01em]">
              StockSense AI
            </span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-slash-onyx border border-slash-graphite text-slash-copper">
              v1.0.0
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-4 text-[11px] text-slash-mist">
            <span className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-slash-sage"></span>
              <span>FastAPI Engine</span>
            </span>
            <span className="flex items-center gap-1.5">
              <Database className="w-3.5 h-3.5 text-slash-copper" />
              <span>{isWatchlistDemoMode ? 'Demo In-Memory Mode' : 'MongoDB Persistence'}</span>
            </span>
            <span className="flex items-center gap-1.5">
              <Activity className="w-3.5 h-3.5 text-slash-fog" />
              <span>yfinance Market Feed</span>
            </span>
          </div>
        </div>

        <p className="text-[11px] text-slash-ash leading-relaxed border-t border-slash-graphite/60 pt-6 max-w-4xl">
          DISCLAIMER: StockSense AI is an educational machine learning and financial engineering laboratory project.
          Trading in financial instruments involves substantial risk of loss and is not suitable for every investor.
          All predictions, technical indicators, and qualitative market insights are strictly simulated quantitative projections
          and do not constitute investment advice or trading signals.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-between gap-2 text-[10px] text-slash-ash">
          <div>© {new Date().getFullYear()} StockSense AI — Academic Full-Stack ML Project.</div>
          <div>Styled in the Slash Midnight Vault & Gilded Ledger aesthetic.</div>
        </div>
      </div>
    </footer>
  );
}
