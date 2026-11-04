import React from 'react';
import { ShieldAlert } from 'lucide-react';

export default function DisclaimerBanner({ compact = false }) {
  if (compact) {
    return (
      <div className="flex items-center gap-2.5 p-3 rounded-full bg-slash-onyx border border-slash-graphite text-xs text-slash-mist">
        <span className="w-1.5 h-1.5 rounded-full bg-slash-copper shrink-0"></span>
        <span className="text-[12px]">
          <strong className="text-slash-copper font-medium">Notice:</strong> Quantitative model simulations for research purposes only. Projections do not constitute financial advice.
        </span>
      </div>
    );
  }

  return (
    <div className="p-5 rounded-[10px] bg-slash-onyx border border-slash-graphite my-4">
      <div className="flex items-start gap-3">
        <div className="w-7 h-7 rounded-full bg-slash-carbon border border-slash-graphite text-slash-copper flex items-center justify-center shrink-0 mt-0.5">
          <ShieldAlert className="w-3.5 h-3.5" />
        </div>
        <div>
          <h4 className="text-xs uppercase tracking-[-0.02em] font-semibold text-slash-copper">
            Educational & Analytical Disclaimer
          </h4>
          <p className="text-xs text-slash-fog mt-1 leading-relaxed">
            StockSense AI is built for educational, quantitative, and research purposes. Stock market trading entails high capital risk.
            Machine learning projections (Linear Regression, Random Forest) and technical indicators are based exclusively on historical statistical patterns
            and must never be treated as guaranteed future outcomes or financial advice.
          </p>
        </div>
      </div>
    </div>
  );
}
