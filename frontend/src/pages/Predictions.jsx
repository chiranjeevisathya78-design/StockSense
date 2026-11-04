import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  Cpu,
  TrendingUp,
  TrendingDown,
  Award,
  Sparkles,
  Clock,
  CheckCircle2
} from 'lucide-react';
import { stockApi, formatCurrency, formatPercent } from '../services/api';
import { useStock } from '../context/StockContext';
import LoadingSkeleton from '../components/LoadingSkeleton';
import ErrorMessage from '../components/ErrorMessage';
import DisclaimerBanner from '../components/DisclaimerBanner';
import {
  ResponsiveContainer,
  ComposedChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid
} from 'recharts';

export default function Predictions() {
  const { symbol: routeSymbol } = useParams();
  const { selectedSymbol, setSelectedSymbol } = useStock();

  const activeSymbol = routeSymbol || selectedSymbol || 'RELIANCE.NS';

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [prediction, setPrediction] = useState(null);

  const fetchPrediction = async () => {
    try {
      setLoading(true);
      setError(null);
      setSelectedSymbol(activeSymbol);
      const res = await stockApi.getPrediction(activeSymbol);
      setPrediction(res);
    } catch (err) {
      console.error('Failed to run ML prediction:', err);
      setError(err.response?.data?.detail || `Failed to run ML models for ${activeSymbol}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPrediction();
  }, [activeSymbol]);

  if (loading) {
    return (
      <div className="p-6 space-y-6 max-w-[1216px] mx-auto">
        <div className="p-8 rounded-[10px] bg-slash-onyx border border-slash-graphite animate-pulse space-y-4">
          <div className="h-6 w-48 bg-slash-carbon rounded-full"></div>
          <div className="h-10 w-96 bg-slash-carbon rounded-full"></div>
        </div>
        <LoadingSkeleton type="chart" />
        <LoadingSkeleton type="table" count={3} />
      </div>
    );
  }

  if (error || !prediction) {
    return (
      <div className="p-6 max-w-[1216px] mx-auto">
        <ErrorMessage message={error} onRetry={fetchPrediction} />
      </div>
    );
  }

  const isPredictedUp = prediction.estimated_change >= 0;

  return (
    <div className="p-4 lg:p-8 space-y-10 max-w-[1216px] mx-auto">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-slash-graphite">
        <div>
          <div className="text-[13px] font-semibold text-slash-copper uppercase tracking-[-0.02em] mb-1">
            Supervised Machine Learning
          </div>
          <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-normal text-white tracking-[0.01em]">
            Next-Day Price Prediction — <span className="text-slash-copper">{prediction.symbol}</span>
          </h1>
          <p className="text-sm text-slash-fog mt-1">{prediction.name}</p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            to={`/models/${encodeURIComponent(prediction.symbol)}`}
            className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-slash-onyx hover:bg-slash-carbon border border-slash-steel text-xs font-medium text-white transition"
          >
            <Award className="w-3.5 h-3.5 text-slash-copper" />
            <span>Validation Metrics</span>
          </Link>
          <Link
            to={`/insights/${encodeURIComponent(prediction.symbol)}`}
            className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-slash-onyx hover:bg-slash-carbon border border-slash-graphite text-xs font-medium text-white transition"
          >
            <Sparkles className="w-3.5 h-3.5 text-slash-fog" />
            <span>Market Synthesis</span>
          </Link>
        </div>
      </div>

      <DisclaimerBanner />

      {/* Hero Prediction Ledger Card */}
      <div className="rounded-[10px] bg-slash-onyx border border-slash-graphite p-8 lg:p-10 space-y-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-center">
          {/* Observed Close */}
          <div>
            <div className="text-[12px] uppercase font-semibold text-slash-ash tracking-wider">
              Last Observed Close
            </div>
            <div className="font-serif text-4xl lg:text-5xl font-normal text-white mt-2 tracking-[0.01em]">
              {formatCurrency(prediction.current_price, prediction.currency)}
            </div>
            <div className="text-xs text-slash-fog flex items-center gap-1.5 mt-2">
              <Clock className="w-3.5 h-3.5 text-slash-copper" />
              <span>Feature Cutoff: {prediction.last_trading_date}</span>
            </div>
          </div>

          {/* Model Projected Close */}
          <div className="p-6 rounded-[10px] bg-slash-carbon border border-slash-slate space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[12px] font-semibold uppercase tracking-wider text-slash-copper">
                Projected Settlement
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-slash-onyx border border-slash-graphite text-slash-bone">
                {prediction.selected_model}
              </span>
            </div>

            <div className="flex items-baseline gap-4">
              <span className="font-serif text-4xl lg:text-5xl font-normal text-white tracking-[0.01em]">
                {formatCurrency(prediction.predicted_next_day_price, prediction.currency)}
              </span>
              <div
                className={`flex items-center gap-1 font-mono text-xs font-semibold px-2.5 py-1 rounded-full border ${
                  isPredictedUp
                    ? 'text-slash-sage bg-slash-sageBg border-slash-sage/30'
                    : 'text-slash-rose bg-slash-roseBg border-slash-rose/30'
                }`}
              >
                {isPredictedUp ? (
                  <TrendingUp className="w-3.5 h-3.5" />
                ) : (
                  <TrendingDown className="w-3.5 h-3.5" />
                )}
                <span>{formatPercent(prediction.estimated_change_percent)}</span>
              </div>
            </div>

            <div className="text-xs text-slash-fog">
              Delta: {formatCurrency(prediction.estimated_change, prediction.currency)}
            </div>
          </div>

          {/* Decision Rationale */}
          <div className="space-y-2">
            <div className="text-[12px] font-semibold uppercase text-slash-ash tracking-wider">Algorithm Selection</div>
            <div className="p-4 rounded-[10px] bg-slash-carbon border border-slash-graphite space-y-1.5">
              <div className="text-white text-xs font-semibold flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-slash-sage" />
                Optimal: {prediction.selected_model}
              </div>
              <p className="text-xs text-slash-fog leading-relaxed">
                Selected deterministically due to lowest out-of-sample RMSE on chronological validation split.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Model Benchmark Comparison */}
      <div>
        <div className="text-[13px] font-semibold text-slash-copper uppercase tracking-[-0.02em] mb-1">
          Empirical Validation
        </div>
        <h2 className="font-serif text-2xl font-normal text-white tracking-[0.01em] mb-4">
          Out-of-Sample Performance on Unseen Test Sessions
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {prediction.models_evaluation.map((m) => {
            const isWinner = m.model_name === prediction.selected_model;
            return (
              <div
                key={m.model_name}
                className={`p-6 rounded-[10px] bg-slash-onyx border transition-all ${
                  isWinner ? 'border-slash-copper bg-slash-carbon' : 'border-slash-graphite'
                }`}
              >
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-medium text-sm text-white">{m.model_name}</h3>
                  {isWinner && (
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-slash-copperGlow border border-slash-copper/40 text-slash-copper uppercase">
                      Selected
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-3 gap-2 font-mono text-center">
                  <div className="p-2.5 rounded-[8px] bg-slash-onyx border border-slash-graphite">
                    <div className="text-[10px] text-slash-fog">MAE</div>
                    <div className="font-bold text-sm text-white mt-1">{m.mae}</div>
                  </div>
                  <div className="p-2.5 rounded-[8px] bg-slash-onyx border border-slash-graphite">
                    <div className="text-[10px] text-slash-fog">RMSE</div>
                    <div className="font-bold text-sm text-white mt-1">{m.rmse}</div>
                  </div>
                  <div className="p-2.5 rounded-[8px] bg-slash-onyx border border-slash-graphite">
                    <div className="text-[10px] text-slash-fog">Dir Acc</div>
                    <div className="font-bold text-sm text-slash-sage mt-1">
                      {m.directional_accuracy}%
                    </div>
                  </div>
                </div>

                <div className="text-[11px] text-slash-ash mt-4">
                  Tested on {m.test_samples} unseen chronological sessions.
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Actual vs Predicted Time-Series Chart */}
      <div className="rounded-[10px] bg-slash-onyx border border-slash-graphite p-6 lg:p-8 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="text-[13px] font-semibold text-slash-copper uppercase tracking-[-0.02em]">Generalization Test</div>
            <h2 className="font-serif text-2xl font-normal text-white tracking-[0.01em] mt-0.5">
              Actual vs. Predicted Trajectory
            </h2>
          </div>

          <div className="flex flex-wrap items-center gap-4 text-xs font-mono">
            <span className="flex items-center gap-1.5 text-white">
              <span className="w-3 h-0.5 bg-white inline-block"></span> Actual
            </span>
            <span className="flex items-center gap-1.5 text-slash-copper font-medium">
              <span className="w-3 h-0.5 bg-slash-copper inline-block"></span> Random Forest
            </span>
            <span className="flex items-center gap-1.5 text-slash-silver">
              <span className="w-3 h-0.5 bg-slash-silver inline-block"></span> Linear Reg
            </span>
            <span className="flex items-center gap-1.5 text-slash-ash">
              <span className="w-3 h-0.5 bg-slash-ash inline-block"></span> Baseline
            </span>
          </div>
        </div>

        <div className="h-80 w-full pt-2">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={prediction.actual_vs_predicted}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1c1d22" vertical={false} />
              <XAxis dataKey="date" stroke="#5e616e" tick={{ fontSize: 10 }} tickFormatter={(d) => d.slice(5)} />
              <YAxis stroke="#5e616e" tick={{ fontSize: 10 }} domain={['auto', 'auto']} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#040406',
                  borderColor: '#2e3038',
                  borderRadius: '10px',
                  color: '#fff',
                  fontSize: '11px',
                }}
              />
              <Line type="monotone" dataKey="actual" name="Actual Close" stroke="#ffffff" strokeWidth={2} dot={false} />
              <Line type="monotone" dataKey="predicted_rf" name="Random Forest" stroke="#cc9166" strokeWidth={1.5} dot={false} />
              <Line type="monotone" dataKey="predicted_lr" name="Linear Regression" stroke="#c7c9d1" strokeWidth={1.5} dot={false} />
              <Line type="monotone" dataKey="baseline" name="Baseline" stroke="#5e616e" strokeDasharray="3 3" strokeWidth={1} dot={false} />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Feature Engineering Details */}
      <div className="rounded-[10px] bg-slash-onyx border border-slash-graphite p-6 space-y-4">
        <h2 className="font-serif text-xl font-normal text-white">Engineered Feature Set (Anti-Leakage)</h2>
        <p className="text-xs text-slash-fog leading-relaxed">
          Features are strictly backward-aligned. Target $y_t$ is the closing price on day $t+1$, preventing any lookahead bias in scaling and evaluation.
        </p>

        <div className="flex flex-wrap gap-2 pt-1">
          {prediction.features_used.map((feat) => (
            <span
              key={feat}
              className="text-xs font-mono px-3 py-1 rounded-full bg-slash-carbon border border-slash-graphite text-slash-silver"
            >
              {feat}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
