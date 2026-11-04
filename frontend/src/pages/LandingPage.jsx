import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  TrendingUp,
  TrendingDown,
  ArrowRight,
  ShieldCheck,
  Cpu,
  Sliders,
  Sparkles,
  Database,
  Layers,
  Award,
  Globe,
  CheckCircle2,
  ChevronRight,
  Lock,
  ChevronDown
} from 'lucide-react';
import { useStock } from '../context/StockContext';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid
} from 'recharts';

// Simulated preview sparkline data for hero
const HERO_CHART_DATA = [
  { day: 'Day 1', price: 341.2 },
  { day: 'Day 5', price: 343.8 },
  { day: 'Day 10', price: 340.5 },
  { day: 'Day 15', price: 346.1 },
  { day: 'Day 20', price: 348.9 },
  { day: 'Day 25', price: 345.4 },
  { day: 'Day 30', price: 350.2 },
  { day: 'Day 35', price: 352.5 },
  { day: 'Day 40', price: 355.8 },
  { day: 'Day 45 (Tomorrow)', price: 359.1 }, // Forecast point
];

const TICKER_TAPE = [
  { sym: 'RELIANCE.NS', price: '₹1,311.00', change: '+1.42%', up: true },
  { sym: 'AAPL', price: '$352.48', change: '+0.85%', up: true },
  { sym: 'TCS.NS', price: '₹3,920.10', change: '-0.45%', up: false },
  { sym: 'NVDA', price: '$138.20', change: '+3.12%', up: true },
  { sym: 'HDFCBANK.NS', price: '₹1,745.00', change: '+0.60%', up: true },
  { sym: 'MSFT', price: '$425.60', change: '+1.10%', up: true },
  { sym: 'INFY.NS', price: '₹1,845.50', change: '-0.32%', up: false },
  { sym: 'GOOGL', price: '$182.90', change: '+1.75%', up: true },
];

export default function LandingPage() {
  const { setAuthModalOpen, setAuthModalMode } = useStock();
  const navigate = useNavigate();

  const [emailInput, setEmailInput] = useState('');
  const [activeTab, setActiveTab] = useState('prediction');
  const [openFaq, setOpenFaq] = useState(null);

  const handleHeroSubmit = (e) => {
    e.preventDefault();
    setAuthModalMode('signup');
    setAuthModalOpen(true);
  };

  const handleOpenLogin = () => {
    setAuthModalMode('login');
    setAuthModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-slash-obsidian text-slash-bone selection:bg-slash-copper/30 selection:text-white flex flex-col font-sans">
      {/* 1. Fixed Landing Navigation Bar */}
      <header className="sticky top-0 z-40 bg-slash-obsidian/95 backdrop-blur-md border-b border-slash-graphite px-4 lg:px-8 py-3.5">
        <div className="flex items-center justify-between max-w-[1216px] mx-auto">
          {/* Brand */}
          <Link to="/" className="flex items-center gap-2.5 group">
            <span className="font-serif text-2xl font-normal text-white tracking-[0.01em] group-hover:text-slash-copper transition">
              StockSense
            </span>
            <span className="text-[10px] font-mono tracking-wider uppercase px-2 py-0.5 rounded-full bg-slash-carbon text-slash-copper border border-slash-copper/30">
              AI
            </span>
          </Link>

          {/* Center Nav Links */}
          <nav className="hidden md:flex items-center gap-6 text-xs text-slash-fog font-medium">
            <a href="#features" className="hover:text-white transition">Capabilities</a>
            <a href="#ml-pipeline" className="hover:text-white transition">ML Architecture</a>
            <a href="#technicals" className="hover:text-white transition">Technicals</a>
            <a href="#benchmarks" className="hover:text-white transition">Validation</a>
            <a href="#faq" className="hover:text-white transition">FAQ</a>
          </nav>

          {/* Right Action Buttons */}
          <div className="flex items-center gap-3">
            <button
              onClick={handleOpenLogin}
              className="px-4 py-2 rounded-full border border-slash-steel text-xs font-medium text-white hover:border-white transition"
            >
              Sign In
            </button>
            <button
              onClick={() => navigate('/dashboard')}
              className="px-5 py-2 rounded-full bg-white text-black hover:bg-slate-200 text-xs font-semibold transition flex items-center gap-1.5 shadow-sm"
            >
              <span>Launch Terminal</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </header>

      {/* 2. Live Market Ticker Tape */}
      <div className="w-full bg-slash-onyx border-b border-slash-graphite py-2 overflow-hidden select-none">
        <div className="flex items-center gap-8 animate-marquee whitespace-nowrap text-xs font-mono">
          {TICKER_TAPE.concat(TICKER_TAPE).map((item, idx) => (
            <div key={idx} className="flex items-center gap-2 px-2">
              <span className="text-white font-medium">{item.sym}</span>
              <span className="text-slash-fog">{item.price}</span>
              <span
                className={`text-[11px] px-1.5 py-0.2 rounded-full ${
                  item.up
                    ? 'text-slash-sage bg-slash-sageBg'
                    : 'text-slash-rose bg-slash-roseBg'
                }`}
              >
                {item.change}
              </span>
              <span className="text-slash-graphite mx-2">|</span>
            </div>
          ))}
        </div>
      </div>

      <main className="flex-1 max-w-[1216px] mx-auto px-4 lg:px-8 py-12 lg:py-20 space-y-24">
        {/* 3. Hero Section (Split Composition) */}
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center pt-4">
          {/* Left Column: Serif Headline & Action */}
          <div className="lg:col-span-7 space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slash-carbon border border-slash-graphite text-[12px] font-semibold text-slash-copper uppercase tracking-[-0.02em]">
              <span className="w-1.5 h-1.5 rounded-full bg-slash-copper animate-ping"></span>
              <span>Midnight Vault • Quantitative Intelligence</span>
            </div>

            <h1 className="font-serif text-4xl sm:text-5xl lg:text-[68px] leading-[1.08] font-normal text-white tracking-[0.01em]">
              Institutional Quantitative Intelligence for the Modern Investor.
            </h1>

            <p className="text-base sm:text-lg text-slash-fog leading-relaxed max-w-xl font-light">
              Bridge transparent mathematical indicator convergence with rigorous, zero-leakage machine learning across Indian (NSE/BSE) and US (NASDAQ/NYSE) equities.
            </p>

            {/* Pill Email Input joined to White Button */}
            <form onSubmit={handleHeroSubmit} className="pt-2 max-w-md">
              <div className="flex flex-col sm:flex-row gap-2.5 p-1 rounded-full bg-slash-onyx border border-slash-steel/70 focus-within:border-white transition">
                <input
                  type="email"
                  placeholder="Enter your institutional email..."
                  value={emailInput}
                  onChange={(e) => setEmailInput(e.target.value)}
                  className="bg-transparent pl-5 pr-2 py-2 text-sm text-white placeholder-slash-ash focus:outline-none flex-1"
                />
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-full bg-white text-black hover:bg-slate-200 text-xs font-semibold transition shrink-0"
                >
                  Get Started
                </button>
              </div>
            </form>

            <div className="flex flex-wrap items-center gap-5 text-xs text-slash-fog pt-1">
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-slash-sage" />
                <span>100% Anti-Leakage Model Split</span>
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-slash-copper" />
                <span>Zero Paid LLM Requirements</span>
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-slash-sage" />
                <span>Free Guest Terminal Access</span>
              </span>
            </div>
          </div>

          {/* Right Column: Hero Chart Showcase Card */}
          <div className="lg:col-span-5">
            <div className="rounded-[10px] bg-slash-onyx border border-slash-graphite p-6 lg:p-7 shadow-2xl relative space-y-5">
              <div className="flex items-center justify-between pb-3 border-b border-slash-graphite">
                <div>
                  <div className="text-[11px] font-mono text-slash-copper uppercase tracking-wider">
                    Simulated Target: AAPL / RELIANCE
                  </div>
                  <div className="font-serif text-3xl font-normal text-white mt-0.5 tracking-[0.01em]">
                    $ 352.48
                  </div>
                </div>
                <div className="text-right">
                  <span className="inline-flex items-center gap-1 font-mono text-xs font-medium px-2.5 py-0.5 rounded-full bg-slash-sageBg border border-slash-sage/30 text-slash-sage">
                    <TrendingUp className="w-3 h-3" />
                    <span>+1.85% Session</span>
                  </span>
                  <div className="text-[10px] text-slash-ash mt-1">Tomorrow's Close Projected</div>
                </div>
              </div>

              {/* Gilded Chart Line */}
              <div className="w-full pt-1" style={{ height: 180, minHeight: 180 }}>
                <ResponsiveContainer width="100%" height={180}>
                  <AreaChart data={HERO_CHART_DATA}>
                    <defs>
                      <linearGradient id="heroGilded" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#ae9357" stopOpacity={0.4} />
                        <stop offset="95%" stopColor="#ae9357" stopOpacity={0.0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1c1d22" vertical={false} />
                    <XAxis dataKey="day" stroke="#5e616e" tick={{ fontSize: 9 }} />
                    <YAxis stroke="#5e616e" domain={['auto', 'auto']} tick={{ fontSize: 9 }} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#040406',
                        borderColor: '#2e3038',
                        borderRadius: '8px',
                        color: '#fff',
                        fontSize: '11px',
                      }}
                    />
                    <Area
                      type="monotone"
                      dataKey="price"
                      name="Price Forecast"
                      stroke="#ae9357"
                      strokeWidth={2}
                      fillOpacity={1}
                      fill="url(#heroGilded)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>

              {/* Indicator Pills Row */}
              <div className="grid grid-cols-3 gap-2 pt-1 font-mono text-center">
                <div className="p-2.5 rounded-[8px] bg-slash-carbon border border-slash-graphite">
                  <div className="text-[10px] text-slash-fog">RSI-14</div>
                  <div className="font-bold text-xs text-slash-sage mt-0.5">59.7 (Positive)</div>
                </div>
                <div className="p-2.5 rounded-[8px] bg-slash-carbon border border-slash-graphite">
                  <div className="text-[10px] text-slash-fog">MACD</div>
                  <div className="font-bold text-xs text-white mt-0.5">+2.45 Divergence</div>
                </div>
                <div className="p-2.5 rounded-[8px] bg-slash-carbon border border-slash-graphite">
                  <div className="text-[10px] text-slash-fog">Regime</div>
                  <div className="font-bold text-xs text-slash-copper mt-0.5">Bullish Trend</div>
                </div>
              </div>

              <button
                onClick={() => navigate('/dashboard')}
                className="w-full py-2.5 rounded-full bg-slash-carbon hover:bg-slash-graphite border border-slash-graphite text-xs font-medium text-white transition flex items-center justify-center gap-2"
              >
                <span>Inspect Full Live Terminal</span>
                <ArrowRight className="w-3.5 h-3.5 text-slash-copper" />
              </button>
            </div>
          </div>
        </section>

        {/* 4. Stat Callouts Section */}
        <section id="benchmarks" className="py-12 border-y border-slash-graphite">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 text-center">
            <div className="space-y-1">
              <div className="font-serif text-4xl lg:text-5xl font-normal text-white tracking-[0.01em]">100%</div>
              <div className="text-xs uppercase tracking-wider font-semibold text-slash-copper">Anti-Leakage Formulation</div>
              <div className="text-[12px] text-slash-fog">Chronological Time-Series Split</div>
            </div>

            <div className="space-y-1">
              <div className="font-serif text-4xl lg:text-5xl font-normal text-white tracking-[0.01em]">2</div>
              <div className="text-xs uppercase tracking-wider font-semibold text-slash-copper">Major Market Jurisdictions</div>
              <div className="text-[12px] text-slash-fog">NSE/BSE India & US NASDAQ/NYSE</div>
            </div>

            <div className="space-y-1">
              <div className="font-serif text-4xl lg:text-5xl font-normal text-white tracking-[0.01em]">8</div>
              <div className="text-xs uppercase tracking-wider font-semibold text-slash-copper">Core Indicator Algorithms</div>
              <div className="text-[12px] text-slash-fog">SMA, EMA, RSI, MACD, Bollinger</div>
            </div>

            <div className="space-y-1">
              <div className="font-serif text-4xl lg:text-5xl font-normal text-white tracking-[0.01em]">&lt;500ms</div>
              <div className="text-xs uppercase tracking-wider font-semibold text-slash-copper">Inference Latency</div>
              <div className="text-[12px] text-slash-fog">FastAPI + Scikit-Learn Engine</div>
            </div>
          </div>
        </section>

        {/* 5. Capabilities & Features (3-Column Slash Card Grid) */}
        <section id="features" className="space-y-10">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <div className="text-[13px] font-semibold text-slash-copper uppercase tracking-[-0.02em]">
              Precision Engineered
            </div>
            <h2 className="font-serif text-3xl sm:text-4xl font-normal text-white tracking-[0.01em]">
              The Full-Stack Quantitative Architecture
            </h2>
            <p className="text-sm text-slash-fog">
              Eliminating the divide between mathematical indicator rules and empirical predictive models.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="rounded-[10px] bg-slash-onyx border border-slash-graphite p-7 space-y-3 hover:border-slash-slate transition">
              <div className="text-[12px] font-semibold text-slash-copper uppercase tracking-[-0.02em]">
                Multi-Market Engine
              </div>
              <h3 className="font-serif text-xl font-normal text-white">Indian & US Equities</h3>
              <p className="text-xs text-slash-fog leading-relaxed">
                Native ticker handling with currency awareness. View Indian securities in INR (₹) and US equities in USD ($) without distorted cross-comparisons.
              </p>
            </div>

            <div className="rounded-[10px] bg-slash-onyx border border-slash-graphite p-7 space-y-3 hover:border-slash-slate transition">
              <div className="text-[12px] font-semibold text-slash-copper uppercase tracking-[-0.02em]">
                Machine Learning
              </div>
              <h3 className="font-serif text-xl font-normal text-white">Target-Shifted Regressors</h3>
              <p className="text-xs text-slash-fog leading-relaxed">
                Linear Regression and Random Forest Regressors trained on chronologically separated datasets (Target[t] = Close[t + 1]) to guarantee zero lookahead leakage.
              </p>
            </div>

            <div className="rounded-[10px] bg-slash-onyx border border-slash-graphite p-7 space-y-3 hover:border-slash-slate transition">
              <div className="text-[12px] font-semibold text-slash-copper uppercase tracking-[-0.02em]">
                Momentum Envelopes
              </div>
              <h3 className="font-serif text-xl font-normal text-white">Mathematical Indicators</h3>
              <p className="text-xs text-slash-fog leading-relaxed">
                Calculate SMA 20, SMA 50, EMA 20, Wilder's smoothed RSI 14, MACD (12, 26, 9), and 2-standard-deviation Bollinger Bands in real time.
              </p>
            </div>

            <div className="rounded-[10px] bg-slash-onyx border border-slash-graphite p-7 space-y-3 hover:border-slash-slate transition">
              <div className="text-[12px] font-semibold text-slash-copper uppercase tracking-[-0.02em]">
                Explainable AI
              </div>
              <h3 className="font-serif text-xl font-normal text-white">Deterministic Insights</h3>
              <p className="text-xs text-slash-fog leading-relaxed">
                Automated plain-English market synthesis explaining trend consensus without expensive third-party LLM dependencies.
              </p>
            </div>

            <div className="rounded-[10px] bg-slash-onyx border border-slash-graphite p-7 space-y-3 hover:border-slash-slate transition">
              <div className="text-[12px] font-semibold text-slash-copper uppercase tracking-[-0.02em]">
                Portfolio Ledger
              </div>
              <h3 className="font-serif text-xl font-normal text-white">MongoDB Persistence</h3>
              <p className="text-xs text-slash-fog leading-relaxed">
                Maintain personalized stock watchlists stored in MongoDB, with seamless automatic fallback to resilient in-memory storage.
              </p>
            </div>

            <div className="rounded-[10px] bg-slash-onyx border border-slash-graphite p-7 space-y-3 hover:border-slash-slate transition">
              <div className="text-[12px] font-semibold text-slash-copper uppercase tracking-[-0.02em]">
                Rigorous Evaluation
              </div>
              <h3 className="font-serif text-xl font-normal text-white">Honest Loss Metrics</h3>
              <p className="text-xs text-slash-fog leading-relaxed">
                Actual MAE, RMSE, and Directional Accuracy calculated on unseen chronological test sessions compared directly against a naive baseline.
              </p>
            </div>
          </div>
        </section>

        {/* 6. Interactive Terminal Playground Preview */}
        <section id="technicals" className="rounded-[10px] bg-slash-onyx border border-slash-graphite p-8 lg:p-12 space-y-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-slash-graphite">
            <div>
              <div className="text-[13px] font-semibold text-slash-copper uppercase tracking-[-0.02em]">
                Live Terminal Preview
              </div>
              <h2 className="font-serif text-3xl font-normal text-white tracking-[0.01em] mt-1">
                Explore The Analysis Suite
              </h2>
              <p className="text-xs text-slash-fog mt-1">
                Preview how the platform processes quantitative signals before entering.
              </p>
            </div>

            <div className="flex rounded-full bg-slash-carbon border border-slash-graphite p-1 self-start md:self-auto">
              {[
                { id: 'prediction', label: 'AI Forecasting' },
                { id: 'technicals', label: 'Technicals' },
                { id: 'insights', label: 'Market Insights' },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-4 py-1.5 rounded-full text-xs font-medium transition ${
                    activeTab === tab.id
                      ? 'bg-white text-black font-semibold'
                      : 'text-slash-fog hover:text-white'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* Interactive Tab Content */}
          {activeTab === 'prediction' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center animate-fadeIn">
              <div className="space-y-4">
                <span className="text-[11px] font-mono text-slash-copper uppercase tracking-wider">
                  Chronological ML Regressor
                </span>
                <h3 className="font-serif text-2xl font-normal text-white">
                  Next-Day Settlement Price Projection
                </h3>
                <p className="text-xs text-slash-fog leading-relaxed">
                  Our pipeline avoids lookahead bias by shifting target values by one session. The best performing model (Linear Regression or Random Forest) is dynamically chosen by benchmarking out-of-sample RMSE.
                </p>
                <div className="p-4 rounded-[8px] bg-slash-carbon border border-slash-graphite space-y-2 text-xs font-mono">
                  <div className="flex justify-between text-white">
                    <span>Algorithm:</span>
                    <span className="text-slash-copper">Random Forest Regressor</span>
                  </div>
                  <div className="flex justify-between text-white">
                    <span>Out-of-Sample MAE:</span>
                    <span>27.71 (INR/USD)</span>
                  </div>
                  <div className="flex justify-between text-white">
                    <span>Directional Accuracy:</span>
                    <span className="text-slash-sage">58.2% Accurate Shifts</span>
                  </div>
                </div>
              </div>

              <div className="p-6 rounded-[10px] bg-slash-carbon border border-slash-graphite space-y-4">
                <div className="text-[11px] font-mono text-slash-ash uppercase">Sample Forecast Output</div>
                <div className="flex items-baseline justify-between">
                  <div>
                    <div className="text-xs text-slash-fog">Current Close</div>
                    <div className="font-serif text-2xl text-white">₹ 1,311.00</div>
                  </div>
                  <div className="text-right">
                    <div className="text-xs text-slash-copper">Next Day Forecast</div>
                    <div className="font-serif text-2xl text-slash-sage font-medium">₹ 1,328.45 (+1.33%)</div>
                  </div>
                </div>
                <div className="text-[11px] text-slash-ash leading-relaxed border-t border-slash-graphite/60 pt-3">
                  Forecast generated with 17 engineered features including 20-day SMA, 14-day smoothed RSI, and 5-session lagged returns.
                </div>
              </div>
            </div>
          )}

          {activeTab === 'technicals' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center animate-fadeIn">
              <div className="space-y-4">
                <span className="text-[11px] font-mono text-slash-copper uppercase tracking-wider">
                  Mathematical Momentum
                </span>
                <h3 className="font-serif text-2xl font-normal text-white">
                  Multi-Factor Technical Envelopes
                </h3>
                <p className="text-xs text-slash-fog leading-relaxed">
                  Every asset is analyzed using 8 mathematical formulas. Moving averages provide directional smoothing while Wilder's RSI and MACD identify momentum acceleration.
                </p>
                <div className="grid grid-cols-2 gap-3 text-xs font-mono">
                  <div className="p-3 rounded-[8px] bg-slash-carbon border border-slash-graphite">
                    <span className="text-slash-fog text-[10px]">SMA 20/50</span>
                    <div className="text-white font-bold mt-1">Golden Cross Active</div>
                  </div>
                  <div className="p-3 rounded-[8px] bg-slash-carbon border border-slash-graphite">
                    <span className="text-slash-fog text-[10px]">Bollinger (20,2)</span>
                    <div className="text-slash-copper font-bold mt-1">Upper Envelope Probe</div>
                  </div>
                </div>
              </div>

              <div className="p-6 rounded-[10px] bg-slash-carbon border border-slash-graphite space-y-3">
                <div className="text-[11px] font-mono text-slash-ash uppercase">Deterministic Regime Status</div>
                <div className="font-serif text-2xl text-white">Bullish Regime Verified</div>
                <ul className="space-y-1.5 text-xs text-slash-fog">
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-slash-sage"></span>
                    <span>Price holds comfortably above 20-day and 50-day moving averages.</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-slash-sage"></span>
                    <span>14-period RSI sits at 60.3, showing solid buyer interest without overheating.</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-slash-copper"></span>
                    <span>MACD line is expanding positively above its signal line.</span>
                  </li>
                </ul>
              </div>
            </div>
          )}

          {activeTab === 'insights' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center animate-fadeIn">
              <div className="space-y-4">
                <span className="text-[11px] font-mono text-slash-copper uppercase tracking-wider">
                  Automated Commentary
                </span>
                <h3 className="font-serif text-2xl font-normal text-white">
                  Natural Language Synthesis
                </h3>
                <p className="text-xs text-slash-fog leading-relaxed">
                  Instead of cryptic numbers, StockSense AI generates concise editorial summaries synthesizing momentum, volume, and predictive forecasts into plain English.
                </p>
              </div>

              <div className="p-6 rounded-[10px] bg-slash-carbon border border-slash-graphite space-y-3">
                <div className="text-[11px] font-mono text-slash-copper uppercase">Generated Market Summary</div>
                <p className="text-xs text-slash-bone leading-relaxed font-light">
                  "Reliance Industries Ltd (RELIANCE.NS) is currently exhibiting an overall bullish technical structure. The asset trades at ₹1,311.00. Key indicators demonstrate positive alignment across moving averages and momentum oscillators. The Random Forest model projects an estimated next-session close of ₹1,328.45 (+1.33%)."
                </p>
              </div>
            </div>
          )}
        </section>

        {/* 7. Frequently Asked Questions Section */}
        <section id="faq" className="space-y-8 max-w-3xl mx-auto">
          <div className="text-center space-y-2">
            <div className="text-[13px] font-semibold text-slash-copper uppercase tracking-[-0.02em]">
              Clear Answers
            </div>
            <h2 className="font-serif text-3xl font-normal text-white tracking-[0.01em]">
              Frequently Asked Questions
            </h2>
          </div>

          <div className="space-y-3">
            {[
              {
                q: 'How does StockSense AI prevent future-data leakage in ML models?',
                a: 'StockSense AI strictly shifts target closing prices backward by one session (Target[t] = Close[t + 1]). Feature engineering and train/test splits are performed chronologically (80% train, 20% test) with zero random shuffling, ensuring models are never trained on information from the future.',
              },
              {
                q: 'Which stock exchanges are supported?',
                a: 'The application supports Indian equities from the National Stock Exchange (NSE) and Bombay Stock Exchange (BSE) via tickers ending in .NS and .BO, as well as US equities traded on NASDAQ and NYSE.',
              },
              {
                q: 'Does StockSense AI require a paid LLM API key?',
                a: 'No. The AI market insight engine is fully deterministic and runs natively in Python without requiring paid OpenAI or Anthropic API keys, ensuring zero subscription costs.',
              },
              {
                q: 'What happens if MongoDB is not installed on my computer?',
                a: 'The backend automatically detects database connectivity. If MongoDB is offline, it activates a resilient Demo In-Memory Mode so you can still use all watchlist, ML, and technical analysis features seamlessly.',
              },
            ].map((faq, idx) => (
              <div
                key={idx}
                className="rounded-[10px] bg-slash-onyx border border-slash-graphite overflow-hidden"
              >
                <button
                  onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                  className="w-full p-5 text-left flex items-center justify-between text-sm font-medium text-white hover:bg-slash-carbon transition"
                >
                  <span>{faq.q}</span>
                  <ChevronDown
                    className={`w-4 h-4 text-slash-copper transition-transform ${
                      openFaq === idx ? 'rotate-180' : ''
                    }`}
                  />
                </button>
                {openFaq === idx && (
                  <div className="px-5 pb-5 pt-1 text-xs text-slash-fog leading-relaxed border-t border-slash-graphite/40">
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* 8. Final Call to Action */}
        <section className="rounded-[10px] bg-gradient-to-br from-slash-onyx via-slash-carbon to-[#14120f] border border-slash-copper/30 p-10 lg:p-16 text-center space-y-6">
          <div className="text-[13px] font-semibold text-slash-copper uppercase tracking-[-0.02em]">
            Immediate Access
          </div>
          <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-normal text-white tracking-[0.01em] max-w-2xl mx-auto">
            Experience the Future of Algorithmic Market Analytics.
          </h2>
          <p className="text-sm text-slash-fog max-w-xl mx-auto leading-relaxed">
            Open the full interactive terminal now with real-time equity feeds, machine learning forecasting, and personalized portfolio tracking.
          </p>

          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              onClick={() => navigate('/dashboard')}
              className="px-8 py-3 rounded-full bg-white text-black hover:bg-slate-200 text-xs font-semibold transition flex items-center gap-2 shadow-lg"
            >
              <span>Launch Terminal Now</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            <button
              onClick={handleOpenLogin}
              className="px-6 py-3 rounded-full border border-slash-steel text-xs font-medium text-white hover:border-white transition"
            >
              Create Account
            </button>
          </div>
        </section>
      </main>

      {/* 9. Editorial Landing Footer */}
      <footer className="mt-20 bg-slash-obsidian border-t border-slash-graphite text-xs text-slash-fog py-12 px-4 lg:px-8">
        <div className="max-w-[1216px] mx-auto space-y-6">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <span className="font-serif text-2xl font-normal text-white tracking-[0.01em]">
                StockSense AI
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-slash-onyx border border-slash-graphite text-slash-copper">
                Midnight Vault
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-6 text-[11px] text-slash-mist">
              <a href="#features" className="hover:text-white transition">Features</a>
              <a href="#ml-pipeline" className="hover:text-white transition">ML Regressors</a>
              <a href="#technicals" className="hover:text-white transition">Technicals</a>
              <a href="#faq" className="hover:text-white transition">FAQ</a>
              <button onClick={() => navigate('/dashboard')} className="hover:text-white transition">Terminal</button>
            </div>
          </div>

          <p className="text-[11px] text-slash-ash leading-relaxed border-t border-slash-graphite/60 pt-4 max-w-4xl">
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
    </div>
  );
}
