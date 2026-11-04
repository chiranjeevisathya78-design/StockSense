import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { stockApi } from '../services/api';

const StockContext = createContext();

export const StockProvider = ({ children }) => {
  const [selectedSymbol, setSelectedSymbol] = useState('RELIANCE.NS');
  const [watchlist, setWatchlist] = useState([]);
  const [isWatchlistDemoMode, setIsWatchlistDemoMode] = useState(false);
  const [loadingWatchlist, setLoadingWatchlist] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [toastMessage, setToastMessage] = useState(null);

  // Authentication State
  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem('stocksense_user');
      return saved ? JSON.parse(saved) : { name: 'Demo Trader', email: 'trader@stocksense.ai' };
    } catch {
      return { name: 'Demo Trader', email: 'trader@stocksense.ai' };
    }
  });
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState('login'); // 'login' or 'signup'

  const showToast = (message, type = 'info') => {
    setToastMessage({ message, type });
    setTimeout(() => setToastMessage(null), 3500);
  };

  const login = (email, name = 'Institutional Trader') => {
    const newUser = { name, email };
    setUser(newUser);
    localStorage.setItem('stocksense_user', JSON.stringify(newUser));
    showToast(`Welcome back, ${newUser.name}!`, 'success');
    setAuthModalOpen(false);
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('stocksense_user');
    showToast('Signed out of terminal.', 'info');
  };

  const loadWatchlist = useCallback(async () => {
    try {
      setLoadingWatchlist(true);
      const data = await stockApi.getWatchlist();
      setWatchlist(data.items || []);
      setIsWatchlistDemoMode(data.is_demo_mode || false);
    } catch (err) {
      console.error('Failed to load watchlist:', err);
    } finally {
      setLoadingWatchlist(false);
    }
  }, []);

  useEffect(() => {
    loadWatchlist();
  }, [loadWatchlist]);

  const isInWatchlist = (symbol) => {
    if (!symbol) return false;
    return watchlist.some((item) => item.symbol.toUpperCase() === symbol.toUpperCase());
  };

  const toggleWatchlist = async (symbol) => {
    if (!symbol) return;
    const clean = symbol.toUpperCase();
    const already = isInWatchlist(clean);

    try {
      if (already) {
        const res = await stockApi.removeFromWatchlist(clean);
        setWatchlist(res.items || []);
        showToast(`Removed ${clean} from Watchlist`, 'info');
      } else {
        const res = await stockApi.addToWatchlist(clean);
        setWatchlist(res.items || []);
        showToast(`Added ${clean} to Watchlist`, 'success');
      }
    } catch (err) {
      console.error('Error modifying watchlist:', err);
      showToast(err.response?.data?.detail || 'Failed to update watchlist', 'error');
    }
  };

  return (
    <StockContext.Provider
      value={{
        selectedSymbol,
        setSelectedSymbol,
        watchlist,
        isWatchlistDemoMode,
        loadingWatchlist,
        loadWatchlist,
        isInWatchlist,
        toggleWatchlist,
        sidebarOpen,
        setSidebarOpen,
        toastMessage,
        showToast,
        user,
        login,
        logout,
        authModalOpen,
        setAuthModalOpen,
        authModalMode,
        setAuthModalMode,
      }}
    >
      {children}
    </StockContext.Provider>
  );
};

export const useStock = () => {
  const context = useContext(StockContext);
  if (!context) {
    throw new Error('useStock must be used within a StockProvider');
  }
  return context;
};
