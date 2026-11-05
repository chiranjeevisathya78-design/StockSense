import React from 'react';

export default function StockLogo({ className = "w-6 h-6", size = 24 }) {
  return (
    <div className="relative inline-flex items-center justify-center shrink-0">
      <svg
        width={size}
        height={size}
        viewBox="0 0 28 28"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={className}
      >
        <defs>
          <linearGradient id="stockLogoGlowGrad" x1="2" y1="26" x2="26" y2="2" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#10b981" />
            <stop offset="45%" stopColor="#06b6d4" />
            <stop offset="100%" stopColor="#818cf8" />
          </linearGradient>
          <linearGradient id="stockLogoFill" x1="0" y1="0" x2="0" y2="28" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#10b981" stopOpacity="0.9" />
            <stop offset="100%" stopColor="#06b6d4" stopOpacity="0.7" />
          </linearGradient>
          <filter id="stockLogoBlur" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="1.5" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        {/* Candlestick 1 (left) */}
        <line x1="6" y1="12" x2="6" y2="23" stroke="#10b981" strokeWidth="1.6" strokeLinecap="round" opacity="0.5" />
        <rect x="4.5" y="14" width="3" height="6" rx="1" fill="#10b981" opacity="0.6" />

        {/* Candlestick 2 (middle) */}
        <line x1="13" y1="8" x2="13" y2="21" stroke="#06b6d4" strokeWidth="1.6" strokeLinecap="round" opacity="0.75" />
        <rect x="11.5" y="10" width="3" height="8" rx="1" fill="#06b6d4" opacity="0.85" />

        {/* Candlestick 3 (right) */}
        <line x1="20" y1="4" x2="20" y2="18" stroke="#818cf8" strokeWidth="1.6" strokeLinecap="round" opacity="0.9" />
        <rect x="18.5" y="6" width="3" height="7" rx="1" fill="#818cf8" />

        {/* Momentum Trajectory Vector with Neon Glow */}
        <path
          d="M3 20L10 13.5L15 16.5L25 5"
          stroke="url(#stockLogoGlowGrad)"
          strokeWidth="2.8"
          strokeLinecap="round"
          strokeLinejoin="round"
          filter="url(#stockLogoBlur)"
        />

        {/* Summit Apex Node */}
        <circle cx="25" cy="5" r="2.5" fill="#10b981" />
        <circle cx="25" cy="5" r="5" stroke="#10b981" strokeWidth="1" opacity="0.5" className="animate-ping" style={{ transformOrigin: '25px 5px' }} />
      </svg>
    </div>
  );
}
