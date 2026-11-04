import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const stockApi = {
  // Health
  getHealth: async () => {
    const res = await api.get('/health');
    return res.data;
  },

  // Stock Search & Overview
  searchStocks: async (query = '') => {
    const res = await api.get(`/stocks/search?q=${encodeURIComponent(query)}`);
    return res.data;
  },

  getPopularOverview: async () => {
    const res = await api.get('/stocks/popular/overview');
    return res.data;
  },

  // Stock Quotes & History
  getQuote: async (symbol) => {
    const res = await api.get(`/stocks/${encodeURIComponent(symbol)}`);
    return res.data;
  },

  getHistory: async (symbol, period = '1y') => {
    const res = await api.get(`/stocks/${encodeURIComponent(symbol)}/history?period=${period}`);
    return res.data;
  },

  // Technical Indicators
  getIndicators: async (symbol) => {
    const res = await api.get(`/stocks/${encodeURIComponent(symbol)}/indicators`);
    return res.data;
  },

  // Machine Learning
  getPrediction: async (symbol) => {
    const res = await api.get(`/stocks/${encodeURIComponent(symbol)}/predict`);
    return res.data;
  },

  getMetrics: async (symbol) => {
    const res = await api.get(`/stocks/${encodeURIComponent(symbol)}/metrics`);
    return res.data;
  },

  // Market Insights
  getInsights: async (symbol) => {
    const res = await api.get(`/stocks/${encodeURIComponent(symbol)}/insights`);
    return res.data;
  },

  // Watchlist
  getWatchlist: async () => {
    const res = await api.get('/watchlist');
    return res.data;
  },

  addToWatchlist: async (symbol) => {
    const res = await api.post('/watchlist', { symbol });
    return res.data;
  },

  removeFromWatchlist: async (symbol) => {
    const res = await api.delete(`/watchlist/${encodeURIComponent(symbol)}`);
    return res.data;
  },
};

// Formatting helpers
export const formatCurrency = (val, currency = 'USD') => {
  if (val === undefined || val === null || isNaN(val)) return '—';
  const symbol = currency === 'INR' ? '₹' : '$';
  return `${symbol}${Number(val).toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
};

export const formatPercent = (val) => {
  if (val === undefined || val === null || isNaN(val)) return '—';
  const prefix = val > 0 ? '+' : '';
  return `${prefix}${Number(val).toFixed(2)}%`;
};

export const formatVolume = (val) => {
  if (val === undefined || val === null || isNaN(val)) return '—';
  if (val >= 1e7) return `${(val / 1e7).toFixed(2)} Cr`;
  if (val >= 1e6) return `${(val / 1e6).toFixed(2)}M`;
  if (val >= 1e3) return `${(val / 1e3).toFixed(1)}K`;
  return Number(val).toLocaleString();
};

export default api;
