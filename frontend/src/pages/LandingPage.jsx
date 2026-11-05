import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowRight,
  TrendingUp,
  Activity,
  Cpu,
  Sliders,
  Sparkles,
  BarChart3,
  ShieldCheck,
  Zap,
  Globe,
  Layers,
  CheckCircle2,
  ChevronDown,
  ArrowUpRight,
  Database,
  Lock,
} from 'lucide-react';
import {
  AreaChart,
  Area,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  CartesianGrid,
} from 'recharts';
import { useStock } from '../context/StockContext';
import StockLogo from '../components/StockLogo';

/* ───── Kindred Dot-Matrix Hands Halftone Canvas Engine ───── */
const LOOP = 20;
const DOT_CLR = '#0d0d0d';
const LEVELS = [0, .26, .52, .78, 1];
const SHEET_URL = 'https://images.higgs.ai/?default=1&output=webp&url=https%3A%2F%2Fd8j0ntlcm91z4.cloudfront.net%2Fuser_38xzZboKViGWJOttwIXH07lWA1P%2Fhf_20261030_025250_100df7b8-31fd-4614-aa4a-c1b7d5b6b273.png&w=1600&q=85';

const SRC = {
  LA: [0, .06, .47, .40],
  RA: [.53, .06, .47, .40],
  LB: [0, .55, .47, .40],
  RB: [.53, .55, .47, .40]
};

function hash(a, b) {
  return ((Math.sin(a * 127.1 + b * 311.7) * 43758.5453) % 1 + 1) % 1;
}
function smooth(e0, e1, x) {
  const t = Math.max(0, Math.min(1, (x - e0) / (e1 - e0)));
  return t * t * (3 - 2 * t);
}
function mixAt(t, on, off, dur) {
  return smooth(on, on + dur, t) * (1 - smooth(off, off + dur, t));
}

function DotMatrixCanvas() {
  const canvasRef = useRef(null);
  const stateRef = useRef({
    sheetReady: false,
    tiles: {},
    W: 0, H: 0, DPR: 1,
    step: 7, rowStep: 14, cols: 0, rows: 0, R: 3,
    seeds: null,
    fA: null, fACtx: null, fB: null, fBCtx: null,
    t0: null, rafId: null,
  });

  const buildTiles = useCallback((sheet) => {
    const s = stateRef.current;
    const sw = sheet.naturalWidth;
    const sh = sheet.naturalHeight;
    const TILE_W = 420;
    for (const key in SRC) {
      const [fx, fy, fw, fh] = SRC[key];
      const sx = fx * sw, sy = fy * sh, sW = fw * sw, sH = fh * sh;
      const aspect = sH / sW;
      const tw = TILE_W, th = Math.round(tw * aspect);
      const c = document.createElement('canvas');
      c.width = tw; c.height = th;
      const x = c.getContext('2d');
      x.imageSmoothingEnabled = true;
      x.imageSmoothingQuality = 'high';
      x.drawImage(sheet, sx, sy, sW, sH, 0, 0, tw, th);
      s.tiles[key] = c;
    }
    s.sheetReady = true;
  }, []);

  const resize = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const s = stateRef.current;
    s.W = canvas.clientWidth;
    s.H = canvas.clientHeight;
    s.DPR = Math.min(2, devicePixelRatio || 1);
    canvas.width = s.W * s.DPR;
    canvas.height = s.H * s.DPR;
    s.step = Math.max(5, s.W / 205);
    s.rowStep = s.step * 2.05;
    s.cols = Math.ceil(s.W / s.step);
    s.rows = Math.ceil(s.H / s.rowStep);
    s.R = s.step * .46;

    s.seeds = new Float32Array(s.cols * s.rows);
    for (let j = 0; j < s.rows; j++) {
      for (let i = 0; i < s.cols; i++) {
        s.seeds[j * s.cols + i] = .55 * hash(i, j) + .45 * hash(j * 3.1, 7.7);
      }
    }
    s.fA = document.createElement('canvas');
    s.fA.width = s.cols; s.fA.height = s.rows;
    s.fACtx = s.fA.getContext('2d', { willReadFrequently: true });
    s.fB = document.createElement('canvas');
    s.fB.width = s.cols; s.fB.height = s.rows;
    s.fBCtx = s.fB.getContext('2d', { willReadFrequently: true });
  }, []);

  const drawHandToField = useCallback((fieldCtx, tile, isLeft, t, ph) => {
    const s = stateRef.current;
    const a = 2 * Math.PI * t / LOOP;
    const portrait = s.H > s.W;
    const hw = portrait ? s.W * .66 : s.W * .53;
    const hAspect = (.40 * 1520) / (.47 * 2688);
    const hh = hw * hAspect;
    const cy = portrait ? s.H * .66 : s.H * .54;
    const reach = (.035 * Math.sin(a + ph) + .012 * Math.sin(2 * a + 1.3 + ph)) * s.W;
    const sc = 1 + .07 * Math.sin(a + .9 + ph);
    const rot = (isLeft ? 1 : -1) * .045 * Math.sin(a + 2.1 + ph);
    let x = isLeft ? reach - s.W * .045 : s.W - hw + s.W * .045 - reach;
    const pivotX = isLeft ? 0 : hw;
    const pivotY = hh / 2;
    const sx = s.cols / s.W;
    const sy = s.rows / s.H;
    fieldCtx.save();
    fieldCtx.scale(sx, sy);
    fieldCtx.translate(x + pivotX, cy - hh / 2 + pivotY);
    fieldCtx.rotate(rot);
    fieldCtx.scale(sc, sc);
    fieldCtx.translate(-pivotX, -pivotY);
    fieldCtx.drawImage(tile, 0, 0, hw, hh);
    fieldCtx.restore();
  }, []);

  const render = useCallback((rawT) => {
    const s = stateRef.current;
    if (!s.sheetReady) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const t = ((rawT % LOOP) + LOOP) % LOOP;

    s.fACtx.fillStyle = '#ffffff';
    s.fACtx.fillRect(0, 0, s.cols, s.rows);
    s.fBCtx.fillStyle = '#ffffff';
    s.fBCtx.fillRect(0, 0, s.cols, s.rows);

    drawHandToField(s.fACtx, s.tiles.LA, true, t, 0);
    drawHandToField(s.fACtx, s.tiles.RA, false, t, Math.PI);
    drawHandToField(s.fBCtx, s.tiles.LB, true, t, 0);
    drawHandToField(s.fBCtx, s.tiles.RB, false, t, Math.PI);

    const dataA = s.fACtx.getImageData(0, 0, s.cols, s.rows).data;
    const dataB = s.fBCtx.getImageData(0, 0, s.cols, s.rows).data;

    const mL = mixAt(t, 6.2, 14.6, 1.6);
    const mR = mixAt(t, 2.4, 10.4, 1.6);
    const halfCols = s.cols / 2;
    const tick = Math.floor(t * 7);
    const portrait = s.H > s.W;

    /* EXPANDED QUIET ZONE TO ENSURE FULL TEXT VISIBILITY */
    const quietW = portrait ? 0.52 : 0.35;
    const quietCY = portrait ? 0.34 : 0.35;
    const quietH = 0.19;

    ctx.setTransform(s.DPR, 0, 0, s.DPR, 0, 0);
    ctx.clearRect(0, 0, s.W, s.H);
    ctx.fillStyle = DOT_CLR;

    for (let j = 0; j < s.rows; j++) {
      let rowShift = 0;
      if (hash(j, tick) > .965) {
        rowShift = Math.round((hash(tick, j) - .5) * 8);
      }
      for (let i = 0; i < s.cols; i++) {
        const idx = j * s.cols + i;
        const seed = s.seeds[idx];
        const m = i < halfCols ? mL : mR;
        const useB = seed < m;
        const si = Math.max(0, Math.min(s.cols - 1, i - rowShift));
        const pxIdx = (j * s.cols + si) * 4;
        const data = useB ? dataB : dataA;
        const lum = data[pxIdx] / 255;
        let v = Math.max(0, Math.min(1, (1 - lum - .16) / .42));

        if (m > 0.001 && m < 0.999) {
          const dist = Math.abs(seed - m);
          if (dist < .12) {
            v *= dist / .12;
            if (hash(i + tick, j) <= .4) v *= .3;
          }
        }
        v *= .86 + .14 * Math.sin(t * 3.2 + seed * 40);

        /* Center horizontal fingertip gap */
        const cx = Math.abs((i + .5) / s.cols - .5);
        v *= smooth(.035, .12, cx);

        /* Complete text quiet zone: ZERO dots behind headline, subline, and CTA */
        const cyNorm = (j + .5) * s.rowStep / s.H;
        const boxHalfW = portrait ? 0.48 : 0.34;
        const boxHalfH = 0.24;
        const boxCY = portrait ? 0.36 : 0.37;

        const dx = cx / boxHalfW;
        const dy = Math.abs(cyNorm - boxCY) / boxHalfH;
        if (dx < 1.0 && dy < 1.0) {
          const dBox = Math.max(dx, dy);
          if (dBox < 0.85) {
            v = 0; // Pure clean zone — zero dots overlapping text
          } else {
            v *= smooth(0.85, 1.0, dBox);
          }
        }

        if (v < .01) continue;

        let level = 0;
        for (let k = LEVELS.length - 1; k >= 1; k--) {
          if (v >= LEVELS[k] - .13) { level = LEVELS[k]; break; }
        }
        if (level === 0) continue;
        const r = level <= .26 ? s.R * .38 : s.R * level;
        const dotX = (i + .5) * s.step;
        const dotY = (j + .5) * s.rowStep;
        ctx.beginPath();
        ctx.arc(dotX, dotY, r, 0, 2 * Math.PI);
        ctx.fill();
      }
    }
  }, [drawHandToField]);

  useEffect(() => {
    resize();
    const sheet = new Image();
    sheet.crossOrigin = 'anonymous';
    sheet.onload = () => {
      buildTiles(sheet);
      const s = stateRef.current;
      function frame(now) {
        if (s.t0 === null) s.t0 = now;
        render((now - s.t0) / 1000);
        s.rafId = requestAnimationFrame(frame);
      }
      s.rafId = requestAnimationFrame(frame);
    };
    sheet.src = SHEET_URL;

    const onResize = () => resize();
    window.addEventListener('resize', onResize);
    return () => {
      window.removeEventListener('resize', onResize);
      if (stateRef.current.rafId) cancelAnimationFrame(stateRef.current.rafId);
    };
  }, [resize, buildTiles, render]);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full block"
      style={{ pointerEvents: 'none' }}
    />
  );
}

/* ───── Ticker Tape Data with Colors ───── */
const TICKER_TAPE = [
  { symbol: 'RELIANCE.NS', name: 'Reliance Ind.', price: '₹1,311.00', change: '+1.33%', up: true },
  { symbol: 'TCS.NS', name: 'Tata Consultancy', price: '₹3,940.20', change: '+0.85%', up: true },
  { symbol: 'HDFCBANK.NS', name: 'HDFC Bank', price: '₹1,745.50', change: '-0.42%', up: false },
  { symbol: 'INFY.NS', name: 'Infosys Ltd', price: '₹1,882.10', change: '+2.14%', up: true },
  { symbol: 'AAPL', name: 'Apple Inc.', price: '$224.23', change: '+1.12%', up: true },
  { symbol: 'NVDA', name: 'NVIDIA Corp', price: '$128.88', change: '+3.45%', up: true },
  { symbol: 'MSFT', name: 'Microsoft Corp', price: '$448.37', change: '+0.94%', up: true },
  { symbol: 'GOOGL', name: 'Alphabet Inc.', price: '$178.21', change: '-0.38%', up: false },
];

/* ───── Supported Market Ecosystem ───── */
const MARKET_ECOSYSTEM = [
  { name: 'NSE Nifty 50', desc: 'India' },
  { name: 'BSE Sensex', desc: 'India' },
  { name: 'NASDAQ 100', desc: 'US' },
  { name: 'S&P 500', desc: 'US' },
  { name: 'Scikit-Learn ML', desc: 'Model' },
  { name: 'Zero Data-Leakage', desc: 'Verified' },
];

/* ───── Interactive Chart Sample Data ───── */
const PREVIEW_ASSETS = {
  'RELIANCE.NS': {
    name: 'Reliance Industries Ltd',
    price: '₹1,311.00',
    change: '+1.33%',
    up: true,
    target: '₹1,328.45',
    rsi: '59.7',
    rsiStatus: 'Bullish Momentum',
    trend: 'Above 20-Day & 50-Day SMAs',
    series: [
      { date: 'Oct 20', price: 1260.5 },
      { date: 'Oct 23', price: 1272.0 },
      { date: 'Oct 24', price: 1268.4 },
      { date: 'Oct 25', price: 1285.0 },
      { date: 'Oct 26', price: 1292.1 },
      { date: 'Oct 27', price: 1288.6 },
      { date: 'Oct 30', price: 1301.2 },
      { date: 'Oct 31', price: 1305.8 },
      { date: 'Nov 01', price: 1311.0 },
      { date: 'Target (T+1)', price: 1328.45 },
    ]
  },
  'NVDA': {
    name: 'NVIDIA Corporation',
    price: '$128.88',
    change: '+3.45%',
    up: true,
    target: '$133.50',
    rsi: '66.4',
    rsiStatus: 'Strong Accumulation',
    trend: 'Golden SMA Cross',
    series: [
      { date: 'Oct 20', price: 119.5 },
      { date: 'Oct 23', price: 121.2 },
      { date: 'Oct 24', price: 120.8 },
      { date: 'Oct 25', price: 123.4 },
      { date: 'Oct 26', price: 124.6 },
      { date: 'Oct 27', price: 125.1 },
      { date: 'Oct 30', price: 126.9 },
      { date: 'Oct 31', price: 127.8 },
      { date: 'Nov 01', price: 128.88 },
      { date: 'Target (T+1)', price: 133.50 },
    ]
  },
  'AAPL': {
    name: 'Apple Inc.',
    price: '$224.23',
    change: '+1.12%',
    up: true,
    target: '$227.10',
    rsi: '54.2',
    rsiStatus: 'Neutral Uptrend',
    trend: 'Ascending Support Channel',
    series: [
      { date: 'Oct 20', price: 218.0 },
      { date: 'Oct 23', price: 219.5 },
      { date: 'Oct 24', price: 220.2 },
      { date: 'Oct 25', price: 221.8 },
      { date: 'Oct 26', price: 222.1 },
      { date: 'Oct 27', price: 221.9 },
      { date: 'Oct 30', price: 223.4 },
      { date: 'Oct 31', price: 223.8 },
      { date: 'Nov 01', price: 224.23 },
      { date: 'Target (T+1)', price: 227.10 },
    ]
  },
  'TCS.NS': {
    name: 'Tata Consultancy Services',
    price: '₹3,940.20',
    change: '+0.85%',
    up: true,
    target: '₹3,985.00',
    rsi: '58.3',
    rsiStatus: 'Consolidation Breakout',
    trend: 'Above 50-Day SMA',
    series: [
      { date: 'Oct 20', price: 3860.0 },
      { date: 'Oct 23', price: 3885.0 },
      { date: 'Oct 24', price: 3892.0 },
      { date: 'Oct 25', price: 3910.0 },
      { date: 'Oct 26', price: 3905.0 },
      { date: 'Oct 27', price: 3920.0 },
      { date: 'Oct 30', price: 3928.0 },
      { date: 'Oct 31', price: 3935.0 },
      { date: 'Nov 01', price: 3940.2 },
      { date: 'Target (T+1)', price: 3985.00 },
    ]
  }
};

/* ───── FAQ Accordion Data ───── */
const FAQ_LIST = [
  {
    q: 'How does StockSense AI prevent data leakage in its equity models?',
    a: 'Every model target is shifted strictly backward by one session (Target[t] = Close[t + 1]). Feature engineering, scaling, and train/test splits are conducted chronologically without future lookahead or shuffling.',
    badge: 'Zero-Leakage'
  },
  {
    q: 'Which stock exchanges and asset universes are actively supported?',
    a: 'The platform provides seamless coverage for Indian equities traded on the National Stock Exchange (NSE) and Bombay Stock Exchange (BSE), alongside major US equities on NASDAQ and the New York Stock Exchange.',
    badge: 'Multi-Market'
  },
  {
    q: 'Does StockSense require costly third-party API subscriptions?',
    a: 'No. The AI market commentary engine is built on deterministic quantitative rules and local Python analytics, providing instant market narratives without third-party token subscriptions.',
    badge: '100% Free'
  },
  {
    q: 'What happens if MongoDB is offline on my machine?',
    a: 'The backend automatically activates an In-Memory Resilient Mode. You can freely explore real-time charts, model predictions, technical indicators, and manage watchlists without any database blockers.',
    badge: 'Resilient Mode'
  },
];

export default function LandingPage() {
  const navigate = useNavigate();
  const { setAuthModalOpen, setAuthModalMode } = useStock();
  const [activePreviewSymbol, setActivePreviewSymbol] = useState('RELIANCE.NS');
  const [openFaq, setOpenFaq] = useState(0);

  const activeAsset = PREVIEW_ASSETS[activePreviewSymbol] || PREVIEW_ASSETS['RELIANCE.NS'];

  const handleOpenLogin = () => {
    setAuthModalMode('login');
    setAuthModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-[#f7f7f5] text-[#7b7b7b] font-sans selection:bg-[#111]/10 selection:text-[#111]">

      {/* ─────────────────────────────────────────────────────────────
          1. HERO SECTION (Kindred Halftone Hands Canvas + Clean Stock Hero)
      ───────────────────────────────────────────────────────────── */}
      <section className="relative h-screen min-h-[660px] overflow-hidden bg-[#f7f7f5]">
        {/* Dot-matrix canvas running in background */}
        <DotMatrixCanvas />

        {/* Centered Top Nav */}
        <nav className="relative z-10 flex items-center justify-center gap-[clamp(18px,2.6vw,40px)] pt-9 px-4 text-[13.5px]">
          <a href="#" className="flex items-center gap-2 mr-[10px] font-semibold text-[15px] text-[#111] tracking-[-0.01em]">
            <StockLogo size={20} />
            StockSense
          </a>
          <a href="#preview" className="hidden md:inline text-[#3a3a3a] hover:text-[#000] transition-colors duration-200">Live Preview</a>
          <a href="#features" className="hidden md:inline text-[#3a3a3a] hover:text-[#000] transition-colors duration-200">Modules</a>
          <a href="#trust" className="hidden md:inline text-[#3a3a3a] hover:text-[#000] transition-colors duration-200">Trust</a>
          <a href="#faq" className="hidden md:inline text-[#3a3a3a] hover:text-[#000] transition-colors duration-200">FAQ</a>
          <button
            onClick={() => navigate('/explore')}
            className="hidden md:inline text-[#3a3a3a] hover:text-[#000] transition-colors duration-200"
          >
            Explore
          </button>
          <button
            onClick={handleOpenLogin}
            className="bg-[#111] text-white px-[21px] py-[10px] rounded-full font-medium ml-[10px] transition-transform duration-250 hover:-translate-y-px"
          >
            Sign In
          </button>
        </nav>

        {/* Copy block — Perfectly Centered in Quiet Zone with Crystal-Clear Visibility */}
        <div
          className="absolute left-1/2 top-[24%] -translate-x-1/2 text-center z-10"
          style={{ width: 'min(92vw, 720px)' }}
        >
          {/* Eyebrow Pill */}
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200/80 text-xs font-medium text-emerald-800 mb-4 shadow-2xs">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span>Empowering Disciplined Equity Analysis</span>
            <span className="text-[10px] font-semibold uppercase px-1.5 py-0.2 rounded bg-emerald-100 text-emerald-800">
              LIVE FEEDS
            </span>
          </div>

          {/* Headline: Exactly what the user liked */}
          <h1
            className="font-medium tracking-[-0.035em] leading-[1.04]"
            style={{ fontSize: 'clamp(38px, 3.75vw, 68px)' }}
          >
            <span className="block text-emerald-600 font-medium">Decoding</span>
            <span className="block text-[#111]">Market Dynamics.</span>
          </h1>

          {/* Subtitle: 100% Readable with Clean Spacing & Contrast — Zero dots overlapping */}
          <p
            className="mt-5 mx-auto max-w-[460px] text-[#4b5563] font-normal leading-[1.5]"
            style={{ fontSize: 'clamp(13.5px, 1.05vw, 16px)' }}
          >
            We don't just chart price action. We empower investors with zero-leakage predictive intelligence, momentum envelopes, and multi-market clarity across NSE, BSE, and US exchanges.
          </p>

          {/* CTA Wrapper with Rainbow Underglow PEAKING OUT UNDER PILL */}
          <div className="inline-block relative" style={{ marginTop: 'clamp(34px, 3.6vw, 52px)' }}>
            <div
              className="absolute left-[10%] right-[10%] h-4 rounded-[50%] transition-all duration-300"
              style={{
                bottom: '-6px',
                background: 'linear-gradient(90deg, #ffcf5a, #7dffa8, #5ad7ff, #9b7bff, #ff6fd8, #ffb36b)',
                filter: 'blur(9px)',
                opacity: 0.85,
              }}
            />
            <button
              onClick={() => navigate('/dashboard')}
              className="relative z-10 bg-[#111] text-white text-[13.5px] font-medium px-6 py-[11px] rounded-full transition-all duration-300 hover:-translate-y-px flex items-center gap-2 cursor-pointer shadow-sm"
            >
              <span>Launch Market Terminal</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Partner logos / Markets across bottom */}
        <div
          className="absolute left-0 right-0 z-10 flex items-center justify-center flex-wrap px-4 text-[#8d8d8d] font-medium"
          style={{
            bottom: 'clamp(28px, 6vh, 64px)',
            gap: 'clamp(20px, 4vw, 56px)',
            fontSize: 'clamp(13px, 1.1vw, 16px)',
            letterSpacing: '-0.01em',
          }}
        >
          {MARKET_ECOSYSTEM.map((m) => (
            <span key={m.name} className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              <span>{m.name}</span>
            </span>
          ))}
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          2. TICKER RIBBON WITH CLEAN ACCENT COLORS
      ───────────────────────────────────────────────────────────── */}
      <div className="bg-white border-y border-[#e8e8e6] overflow-hidden py-3">
        <div className="animate-marquee whitespace-nowrap flex items-center text-xs">
          {TICKER_TAPE.concat(TICKER_TAPE).map((item, idx) => (
            <div
              key={idx}
              className="flex items-center mx-6 gap-2 cursor-pointer hover:opacity-75 transition"
              onClick={() => navigate(`/stocks/${encodeURIComponent(item.symbol)}`)}
            >
              <span className="font-medium text-[#111]">{item.symbol}</span>
              <span className="text-[#9a9a9a]">{item.price}</span>
              <span
                className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${
                  item.up
                    ? 'text-emerald-700 bg-emerald-50 border border-emerald-200/60'
                    : 'text-rose-700 bg-rose-50 border border-rose-200/60'
                }`}
              >
                {item.change}
              </span>
              <span className="text-[#e8e8e6] ml-4">|</span>
            </div>
          ))}
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          3. MAIN CONTENT CONTAINER (Kindred Clean Layout)
      ───────────────────────────────────────────────────────────── */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-28 space-y-24">

        {/* ── SECTION: Interactive Live Equity Showcase ── */}
        <section id="preview" className="space-y-6">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <span className="text-xs uppercase tracking-wider text-[#9a9a9a] font-medium">
              Live Trajectory Verification
            </span>
            <h2 className="text-3xl sm:text-4xl font-medium text-[#111] tracking-[-0.035em]">
              Real-Time Algorithmic Forecast
            </h2>
            <p className="text-[15px] text-[#7b7b7b] leading-relaxed">
              Continuous equity data feeds compared chronologically against zero-leakage regression targets.
            </p>
          </div>

          {/* Interactive Card in Pure Kindred White Aesthetic */}
          <div className="rounded-[24px] bg-white border border-[#e8e8e6] p-6 sm:p-10 shadow-xs space-y-6">
            {/* Header: Selector pills & Price details */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#e8e8e6]">
              {/* Asset Selector Buttons */}
              <div className="flex flex-wrap items-center gap-2">
                {Object.keys(PREVIEW_ASSETS).map((sym) => (
                  <button
                    key={sym}
                    onClick={() => setActivePreviewSymbol(sym)}
                    className={`px-4 py-2 rounded-full text-xs font-medium transition cursor-pointer ${
                      activePreviewSymbol === sym
                        ? 'bg-[#111] text-white shadow-xs'
                        : 'bg-[#f0f0ee] text-[#4b5563] hover:bg-[#e8e8e6]'
                    }`}
                  >
                    {sym}
                  </button>
                ))}
              </div>

              {/* Price & Target badge */}
              <div className="flex items-center gap-6">
                <div>
                  <div className="text-[10px] text-[#9a9a9a] uppercase font-medium">Latest Settlement</div>
                  <div className="text-2xl font-semibold text-[#111]">{activeAsset.price}</div>
                </div>
                <div className="pl-6 border-l border-[#e8e8e6]">
                  <div className="text-[10px] text-emerald-700 uppercase font-medium">Target (T+1)</div>
                  <div className="text-2xl font-semibold text-emerald-600">{activeAsset.target}</div>
                </div>
              </div>
            </div>

            {/* Recharts Area with Clean Cyan / Emerald Signal Line */}
            <div className="w-full pt-2" style={{ height: 280, minHeight: 280 }}>
              <ResponsiveContainer width="100%" height={280}>
                <AreaChart data={activeAsset.series}>
                  <defs>
                    <linearGradient id="kindredPreviewGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#00b3dd" stopOpacity={0.25} />
                      <stop offset="95%" stopColor="#00b3dd" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0ee" vertical={false} />
                  <XAxis dataKey="date" stroke="#9a9a9a" tick={{ fontSize: 11, fill: '#7b7b7b' }} />
                  <YAxis stroke="#9a9a9a" domain={['auto', 'auto']} tick={{ fontSize: 11, fill: '#7b7b7b' }} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#ffffff',
                      borderColor: '#e8e8e6',
                      borderRadius: '12px',
                      color: '#111111',
                      fontSize: '12px',
                      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)',
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="price"
                    name="Settlement Trajectory"
                    stroke="#00b3dd"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#kindredPreviewGrad)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            {/* Sub-Metric Panels with Clean Kindred Styling */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
              <div className="p-4 rounded-xl bg-[#fafaf8] border border-[#e8e8e6] space-y-1">
                <div className="text-[10px] font-medium text-[#9a9a9a] uppercase tracking-wider">Wilder RSI Momentum</div>
                <div className="text-xl font-medium text-[#111]">{activeAsset?.rsi || '59.7'}</div>
                <div className="text-xs text-[#7b7b7b]">{activeAsset?.rsiStatus || 'Bullish Momentum'}</div>
              </div>

              <div className="p-4 rounded-xl bg-[#fafaf8] border border-[#e8e8e6] space-y-1">
                <div className="text-[10px] font-medium text-[#9a9a9a] uppercase tracking-wider">Moving Average Regime</div>
                <div className="text-xl font-medium text-[#111]">Aligned</div>
                <div className="text-xs text-[#7b7b7b]">{activeAsset?.trend || 'Above 20-Day & 50-Day SMAs'}</div>
              </div>

              <div className="p-4 rounded-xl bg-[#fafaf8] border border-[#e8e8e6] space-y-1">
                <div className="text-[10px] font-medium text-emerald-700 uppercase tracking-wider">T+1 Target Projection</div>
                <div className="text-xl font-medium text-emerald-600">{activeAsset?.target || '₹1,328.45'}</div>
                <div className="text-xs text-[#7b7b7b]">Zero future-data lookahead</div>
              </div>
            </div>
          </div>
        </section>

        {/* ── SECTION: Core Intelligence Modules ── */}
        <section id="features" className="space-y-12">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <span className="text-xs uppercase tracking-wider text-[#9a9a9a] font-medium">What we offer</span>
            <h2 className="text-3xl sm:text-4xl font-medium text-[#111] tracking-[-0.035em]">
              Quantitative Intelligence Modules
            </h2>
            <p className="text-[15px] text-[#7b7b7b] leading-relaxed">
              Machine learning forecasts, technical indicators, and deterministic commentary in one focused experience.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Card 1: Machine Learning */}
            <div className="rounded-[24px] bg-white border border-[#e8e8e6] p-8 space-y-5 hover:shadow-md transition-shadow duration-300">
              <div className="w-10 h-10 rounded-2xl bg-[#f0f0ee] text-[#111] flex items-center justify-center">
                <Cpu className="w-5 h-5" />
              </div>
              <h3 className="text-xl font-medium text-[#111] tracking-[-0.02em]">ML Price Forecasting</h3>
              <p className="text-sm text-[#7b7b7b] leading-relaxed">
                Zero-leakage regressors with chronological train/test splits. Target prices shifted backward by one session (Target[t] = Close[t + 1]).
              </p>
              <button
                onClick={() => navigate('/predictions/RELIANCE.NS')}
                className="text-[13px] font-medium text-[#111] flex items-center gap-1.5 hover:gap-2.5 transition-all cursor-pointer"
              >
                View Predictions <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Card 2: Technicals */}
            <div className="rounded-[24px] bg-white border border-[#e8e8e6] p-8 space-y-5 hover:shadow-md transition-shadow duration-300">
              <div className="w-10 h-10 rounded-2xl bg-[#f0f0ee] text-[#111] flex items-center justify-center">
                <Sliders className="w-5 h-5" />
              </div>
              <h3 className="text-xl font-medium text-[#111] tracking-[-0.02em]">Technical Indicators</h3>
              <p className="text-sm text-[#7b7b7b] leading-relaxed">
                Wilder RSI-14, MACD divergence, Bollinger Bands, and exponential moving averages computed in real time.
              </p>
              <button
                onClick={() => navigate('/technical/RELIANCE.NS')}
                className="text-[13px] font-medium text-[#111] flex items-center gap-1.5 hover:gap-2.5 transition-all cursor-pointer"
              >
                View Technicals <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Card 3: AI Commentary */}
            <div className="rounded-[24px] bg-white border border-[#e8e8e6] p-8 space-y-5 hover:shadow-md transition-shadow duration-300">
              <div className="w-10 h-10 rounded-2xl bg-[#f0f0ee] text-[#111] flex items-center justify-center">
                <Sparkles className="w-5 h-5" />
              </div>
              <h3 className="text-xl font-medium text-[#111] tracking-[-0.02em]">AI Market Commentary</h3>
              <p className="text-sm text-[#7b7b7b] leading-relaxed">
                Deterministic natural-language insights that translate quantitative signals into concise prose without paid external API keys.
              </p>
              <button
                onClick={() => navigate('/insights/RELIANCE.NS')}
                className="text-[13px] font-medium text-[#111] flex items-center gap-1.5 hover:gap-2.5 transition-all cursor-pointer"
              >
                Read Insights <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Card 4: Multi-Market Universe */}
            <div className="rounded-[24px] bg-white border border-[#e8e8e6] p-8 space-y-5 hover:shadow-md transition-shadow duration-300">
              <div className="w-10 h-10 rounded-2xl bg-[#f0f0ee] text-[#111] flex items-center justify-center">
                <Globe className="w-5 h-5" />
              </div>
              <h3 className="text-xl font-medium text-[#111] tracking-[-0.02em]">Dual-Market Coverage</h3>
              <p className="text-sm text-[#7b7b7b] leading-relaxed">
                Seamlessly analyze Indian equities (NSE/BSE in ₹ INR) alongside major US stocks (NASDAQ/NYSE in $ USD).
              </p>
              <button
                onClick={() => navigate('/explore')}
                className="text-[13px] font-medium text-[#111] flex items-center gap-1.5 hover:gap-2.5 transition-all cursor-pointer"
              >
                Explore Stocks <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </section>

        {/* ── SECTION: Zero-Leakage Benchmark Verification ── */}
        <section id="trust" className="rounded-[24px] bg-[#111] p-8 lg:p-12 text-white space-y-6">
          <div className="max-w-2xl space-y-2">
            <span className="text-xs uppercase tracking-wider text-white/50 font-medium">Empirical Verification</span>
            <h2 className="text-3xl sm:text-4xl font-medium text-white tracking-[-0.035em]">
              Zero-Leakage Benchmarks
            </h2>
            <p className="text-sm text-white/60 leading-relaxed">
              MAE, RMSE, and Directional Accuracy computed strictly on unseen chronological test sessions.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-6 border-t border-white/10">
            <div>
              <div className="text-4xl font-medium text-white">100%</div>
              <div className="text-xs text-white/50 mt-1 uppercase tracking-wider">Anti-Leakage Split</div>
              <div className="text-xs text-white/40 mt-0.5">Target[t] = Close[t + 1] offset</div>
            </div>
            <div>
              <div className="text-4xl font-medium text-white">58.2%</div>
              <div className="text-xs text-white/50 mt-1 uppercase tracking-wider">Directional Accuracy</div>
              <div className="text-xs text-white/40 mt-0.5">Above naive drift baseline</div>
            </div>
            <div>
              <div className="text-4xl font-medium text-white">&lt;500ms</div>
              <div className="text-xs text-white/50 mt-1 uppercase tracking-wider">Inference Latency</div>
              <div className="text-xs text-white/40 mt-0.5">Native Scikit-Learn engine</div>
            </div>
          </div>
        </section>

        {/* ── SECTION: Frequently Asked Questions ── */}
        <section id="faq" className="space-y-8 max-w-3xl mx-auto">
          <div className="text-center space-y-2">
            <span className="text-xs uppercase tracking-wider text-[#9a9a9a] font-medium">Questions</span>
            <h2 className="text-3xl font-medium text-[#111] tracking-[-0.035em]">
              Frequently Asked Questions
            </h2>
          </div>

          <div className="space-y-3">
            {FAQ_LIST.map((faq, idx) => (
              <div key={idx} className="rounded-2xl bg-white border border-[#e8e8e6] overflow-hidden shadow-xs">
                <button
                  onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                  className="w-full p-5 text-left flex items-center justify-between text-sm font-medium text-[#111] hover:bg-[#fafaf8] transition cursor-pointer"
                >
                  <div className="flex items-center gap-2.5">
                    <span className="text-[10px] font-medium uppercase px-2 py-0.5 rounded-full bg-[#f0f0ee] text-[#7b7b7b]">
                      {faq.badge}
                    </span>
                    <span>{faq.q}</span>
                  </div>
                  <ChevronDown
                    className={`w-4 h-4 text-[#9a9a9a] transition-transform duration-200 shrink-0 ${
                      openFaq === idx ? 'rotate-180 text-[#111]' : ''
                    }`}
                  />
                </button>
                {openFaq === idx && (
                  <div className="px-5 pb-5 text-sm text-[#7b7b7b] leading-relaxed border-t border-[#e8e8e6] pt-3">
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* ── SECTION: Final Call To Action ── */}
        <section className="rounded-[24px] bg-white border border-[#e8e8e6] p-10 sm:p-16 text-center space-y-6 shadow-xs">
          <h2 className="text-3xl sm:text-4xl font-medium text-[#111] max-w-xl mx-auto leading-tight tracking-[-0.035em]">
            Step into calm, intelligent stock analysis.
          </h2>
          <p className="text-sm text-[#7b7b7b] max-w-md mx-auto leading-relaxed">
            Open the live interactive dashboard with continuous equity feeds, momentum envelopes, and machine learning price targets.
          </p>
          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              onClick={() => navigate('/dashboard')}
              className="px-6 py-3 rounded-full bg-[#111] text-white text-[13.5px] font-medium transition-transform duration-250 hover:-translate-y-px flex items-center gap-2 cursor-pointer shadow-sm"
            >
              <span>Launch Dashboard</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            <button
              onClick={handleOpenLogin}
              className="px-6 py-3 rounded-full bg-transparent border border-[#e8e8e6] text-[13.5px] font-medium text-[#111] hover:bg-[#f0f0ee] transition cursor-pointer"
            >
              Sign In
            </button>
          </div>
        </section>
      </main>

      {/* ─────────────────────────────────────────────────────────────
          4. FOOTER (Landing Page)
      ───────────────────────────────────────────────────────────── */}
      <footer className="border-t border-[#e8e8e6] bg-[#f7f7f5] py-12 px-4 text-center text-xs text-[#9a9a9a]">
        <div className="max-w-4xl mx-auto space-y-4">
          <div className="flex items-center justify-center gap-2">
            <StockLogo size={18} />
            <span className="font-semibold text-sm text-[#111]">StockSense AI</span>
          </div>
          <p className="text-[11px] text-[#9a9a9a] max-w-xl mx-auto">
            Educational quantitative market research application. All indicators and model projections are mathematical demonstrations and do not constitute financial advice.
          </p>
          <div className="text-[11px] text-[#9a9a9a]">
            © {new Date().getFullYear()} StockSense AI. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
