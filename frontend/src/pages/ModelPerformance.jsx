import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  Award,
  ArrowRight
} from 'lucide-react';
import { stockApi, formatCurrency } from '../services/api';
import { useStock } from '../context/StockContext';
import LoadingSkeleton from '../components/LoadingSkeleton';
import ErrorMessage from '../components/ErrorMessage';
import DisclaimerBanner from '../components/DisclaimerBanner';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
  ComposedChart,
  Line
} from 'recharts';

export default function ModelPerformance() {
  const { symbol: routeSymbol } = useParams();
  const { selectedSymbol, setSelectedSymbol } = useStock();

  const activeSymbol = routeSymbol || selectedSymbol || 'RELIANCE.NS';

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [prediction, setPrediction] = useState(null);

  const fetchPerformance = async () => {
    try {
      setLoading(true);
      setError(null);
      setSelectedSymbol(activeSymbol);
      const res = await stockApi.getPrediction(activeSymbol);
      setPrediction(res);
    } catch (err) {
      console.error('Failed to load model performance:', err);
      setError(err.response?.data?.detail || `Failed to evaluate models for ${activeSymbol}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPerformance();
  }, [activeSymbol]);

  if (loading) {
    return (
      <div className="p-6 space-y-6 max-w-[1216px] mx-auto">
        <LoadingSkeleton type="card" count={3} />
        <LoadingSkeleton type="chart" />
        <LoadingSkeleton type="table" count={3} />
      </div>
    );
  }

  if (error || !prediction) {
    return (
      <div className="p-6 max-w-[1216px] mx-auto">
        <ErrorMessage message={error} onRetry={fetchPerformance} />
      </div>
    );
  }

  const barChartData = prediction.models_evaluation.map((m) => ({
    name: m.model_name.replace(' Regressor', '').replace('-Observed-Close Baseline', ''),
    MAE: m.mae,
    RMSE: m.rmse,
    DirectionalAccuracy: m.directional_accuracy,
  }));

  return (
    <div className="p-4 lg:p-8 space-y-10 max-w-[1216px] mx-auto">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-slash-graphite">
        <div>
          <div className="text-[13px] font-semibold text-slash-copper uppercase tracking-[-0.02em] mb-1">
            Empirical Model Evaluation
          </div>
          <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-normal text-white tracking-[0.01em]">
            Model Metrics — <span className="text-slash-copper">{prediction.symbol}</span>
          </h1>
          <p className="text-sm text-slash-fog mt-1">{prediction.name}</p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            to={`/predictions/${encodeURIComponent(prediction.symbol)}`}
            className="flex items-center gap-1.5 px-5 py-2 rounded-full bg-white text-black hover:bg-slate-200 text-xs font-semibold transition"
          >
            <span>View Forecasts</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>

      <DisclaimerBanner compact />

      {/* Model Benchmark Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {prediction.models_evaluation.map((m) => {
          const isWinner = m.model_name === prediction.selected_model;
          return (
            <div
              key={m.model_name}
              className={`p-6 rounded-[10px] bg-slash-onyx border flex flex-col justify-between transition-all ${
                isWinner ? 'border-slash-copper bg-slash-carbon shadow-sm' : 'border-slash-graphite'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-base font-serif font-normal text-white">{m.model_name}</h3>
                  {isWinner && (
                    <span className="text-[10px] font-mono uppercase tracking-wider px-2 py-0.5 rounded-full bg-slash-copperGlow border border-slash-copper/40 text-slash-copper">
                      Optimal
                    </span>
                  )}
                </div>

                <div className="space-y-3 pt-2">
                  <div className="flex items-center justify-between p-3 rounded-[8px] bg-slash-onyx border border-slash-graphite">
                    <span className="text-xs text-slash-fog">Mean Absolute Error (MAE):</span>
                    <span className="font-mono text-sm font-bold text-white">{m.mae}</span>
                  </div>

                  <div className="flex items-center justify-between p-3 rounded-[8px] bg-slash-onyx border border-slash-graphite">
                    <span className="text-xs text-slash-fog">Root Mean Squared Error (RMSE):</span>
                    <span className="font-mono text-sm font-bold text-white">{m.rmse}</span>
                  </div>

                  <div className="flex items-center justify-between p-3 rounded-[8px] bg-slash-onyx border border-slash-graphite">
                    <span className="text-xs text-slash-fog">Directional Accuracy:</span>
                    <span className="font-mono text-sm font-bold text-slash-sage">
                      {m.directional_accuracy}%
                    </span>
                  </div>
                </div>
              </div>

              <div className="pt-4 mt-4 border-t border-slash-graphite/60 text-[11px] text-slash-ash">
                Evaluated against {m.test_samples} unseen chronological test samples.
              </div>
            </div>
          );
        })}
      </div>

      {/* MAE and RMSE Comparison Bar Chart */}
      <div className="rounded-[10px] bg-slash-onyx border border-slash-graphite p-6 lg:p-8 space-y-6">
        <div>
          <div className="text-[13px] font-semibold text-slash-copper uppercase tracking-[-0.02em]">Loss Comparison</div>
          <h2 className="font-serif text-2xl font-normal text-white tracking-[0.01em] mt-0.5">
            Error Metrics (Lower is Better)
          </h2>
          <p className="text-xs text-slash-fog mt-0.5">
            Comparison of Mean Absolute Error (MAE) and Root Mean Squared Error (RMSE) across algorithms.
          </p>
        </div>

        <div className="h-72 w-full pt-2">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={barChartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1c1d22" vertical={false} />
              <XAxis dataKey="name" stroke="#5e616e" tick={{ fontSize: 11 }} />
              <YAxis stroke="#5e616e" tick={{ fontSize: 11 }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#040406',
                  borderColor: '#2e3038',
                  borderRadius: '10px',
                  color: '#fff',
                  fontSize: '11px',
                }}
              />
              <Legend wrapperStyle={{ fontSize: '12px' }} />
              <Bar dataKey="MAE" fill="#cc9166" radius={[4, 4, 0, 0]} />
              <Bar dataKey="RMSE" fill="#777a88" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Actual vs Predicted Time-Series Chart */}
      <div className="rounded-[10px] bg-slash-onyx border border-slash-graphite p-6 lg:p-8 space-y-6">
        <div>
          <div className="text-[13px] font-semibold text-slash-copper uppercase tracking-[-0.02em]">Out-of-Sample Verification</div>
          <h2 className="font-serif text-2xl font-normal text-white tracking-[0.01em] mt-0.5">
            Historical Test Fit Trajectory
          </h2>
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
              <Legend wrapperStyle={{ fontSize: '12px' }} />
              <Line type="monotone" dataKey="actual" name="Actual Close" stroke="#ffffff" strokeWidth={2} dot={false} />
              <Line type="monotone" dataKey="predicted_rf" name="Random Forest" stroke="#cc9166" strokeWidth={1.5} dot={false} />
              <Line type="monotone" dataKey="predicted_lr" name="Linear Regression" stroke="#c7c9d1" strokeWidth={1.5} dot={false} />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Metric Interpretations Guide */}
      <div className="rounded-[10px] bg-slash-onyx border border-slash-graphite p-6 lg:p-8 space-y-6">
        <h2 className="font-serif text-2xl font-normal text-white tracking-[0.01em]">
          Understanding Quantitative Metrics
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 rounded-[8px] bg-slash-carbon border border-slash-graphite space-y-2">
            <h4 className="text-[12px] font-semibold uppercase tracking-wider text-slash-copper">
              Mean Absolute Error (MAE)
            </h4>
            <p className="text-xs text-slash-fog leading-relaxed">
              Average absolute difference between projected close and actual settlement in native currency units.
            </p>
          </div>

          <div className="p-4 rounded-[8px] bg-slash-carbon border border-slash-graphite space-y-2">
            <h4 className="text-[12px] font-semibold uppercase tracking-wider text-slash-silver">
              Root Mean Squared Error (RMSE)
            </h4>
            <p className="text-xs text-slash-fog leading-relaxed">
              Penalizes large outlier variance heavily through quadratic squaring. Crucial benchmark for financial risk.
            </p>
          </div>

          <div className="p-4 rounded-[8px] bg-slash-carbon border border-slash-graphite space-y-2">
            <h4 className="text-[12px] font-semibold uppercase tracking-wider text-slash-sage">
              Directional Accuracy (%)
            </h4>
            <p className="text-xs text-slash-fog leading-relaxed">
              Percentage of trading sessions where the model accurately anticipated the positive or negative delta of the next session.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
