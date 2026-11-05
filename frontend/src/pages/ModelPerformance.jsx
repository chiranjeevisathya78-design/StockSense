import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  Award,
  ArrowRight,
  CheckCircle2,
  Cpu
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
  Legend
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
      <div className="p-6 space-y-6 max-w-6xl mx-auto">
        <LoadingSkeleton type="card" count={3} />
        <LoadingSkeleton type="chart" />
        <LoadingSkeleton type="table" count={3} />
      </div>
    );
  }

  if (error || !prediction) {
    return (
      <div className="p-6 max-w-6xl mx-auto">
        <ErrorMessage message={error} onRetry={fetchPerformance} />
      </div>
    );
  }

  const modelEntries = prediction.models_compared
    ? Object.entries(prediction.models_compared).map(([name, stats]) => ({
        name,
        mae: stats.mae,
        rmse: stats.rmse,
        target: stats.predicted_price,
        isBest: name === prediction.selected_model
      }))
    : [];

  return (
    <div className="p-4 lg:p-8 space-y-8 max-w-6xl mx-auto bg-[#f7f7f5] text-[#7b7b7b] font-sans">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-[#e8e8e6]">
        <div>
          <div className="text-xs uppercase tracking-wider text-[#9a9a9a] font-medium mb-1">
            Empirical Statistical Verification
          </div>
          <h1 className="text-3xl sm:text-4xl font-medium text-[#111] tracking-[-0.03em]">
            Model Performance — {activeSymbol}
          </h1>
          <p className="text-sm text-[#7b7b7b] mt-1">
            Chronological out-of-sample benchmark error comparison across predictive regressors
          </p>
        </div>

        <Link
          to={`/predictions/${encodeURIComponent(activeSymbol)}`}
          className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-[#111] hover:bg-black text-white text-xs font-medium transition shadow-xs"
        >
          <Cpu className="w-3.5 h-3.5" />
          <span>Active Targets</span>
        </Link>
      </div>

      <DisclaimerBanner compact />

      {/* Model Comparison Metrics (Kindred White Cards) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {modelEntries.map((m) => (
          <div
            key={m.name}
            className={`p-6 sm:p-8 rounded-2xl bg-white border transition shadow-xs space-y-4 ${
              m.isBest ? 'border-[#111]' : 'border-[#e8e8e6]'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="font-semibold text-lg text-[#111]">{m.name}</span>
              {m.isBest && (
                <span className="text-[10px] font-semibold uppercase px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                  Optimal Model Selected
                </span>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4 pt-2">
              <div className="p-4 rounded-xl bg-[#fafaf8] border border-[#e8e8e6]">
                <div className="text-xs text-[#9a9a9a] uppercase font-medium">Mean Absolute Error</div>
                <div className="text-2xl font-semibold text-[#111] mt-1">
                  {m.mae !== undefined ? m.mae.toFixed(2) : '—'}
                </div>
              </div>

              <div className="p-4 rounded-xl bg-[#fafaf8] border border-[#e8e8e6]">
                <div className="text-xs text-[#9a9a9a] uppercase font-medium">Root Mean Sq Error</div>
                <div className="text-2xl font-semibold text-[#111] mt-1">
                  {m.rmse !== undefined ? m.rmse.toFixed(2) : '—'}
                </div>
              </div>
            </div>

            <div className="pt-2 text-xs text-[#7b7b7b] flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              <span>Evaluated on unseen chronological test sessions</span>
            </div>
          </div>
        ))}
      </div>

      {/* Error Comparison Chart */}
      <div className="p-6 sm:p-8 rounded-2xl bg-white border border-[#e8e8e6] shadow-xs space-y-6">
        <h3 className="text-lg font-medium text-[#111]">
          Error Metrics Comparison (MAE vs RMSE)
        </h3>

        <div className="w-full pt-2" style={{ height: 300, minHeight: 300 }}>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={modelEntries}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0ee" vertical={false} />
              <XAxis dataKey="name" stroke="#9a9a9a" tick={{ fontSize: 11, fill: '#7b7b7b' }} />
              <YAxis stroke="#9a9a9a" tick={{ fontSize: 11, fill: '#7b7b7b' }} />
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
              <Legend wrapperStyle={{ fontSize: 12 }} />
              <Bar dataKey="mae" name="Mean Absolute Error (MAE)" fill="#111111" radius={[4, 4, 0, 0]} />
              <Bar dataKey="rmse" name="Root Mean Squared Error (RMSE)" fill="#00b3dd" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
