import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { StockProvider, useStock } from './context/StockContext';
import ErrorBoundary from './components/ErrorBoundary';
import Sidebar from './components/Sidebar';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import AuthModal from './components/AuthModal';

// Pages
import LandingPage from './pages/LandingPage';
import Dashboard from './pages/Dashboard';
import ExploreStocks from './pages/ExploreStocks';
import StockDetails from './pages/StockDetails';
import TechnicalAnalysis from './pages/TechnicalAnalysis';
import Predictions from './pages/Predictions';
import MarketInsights from './pages/MarketInsights';
import Watchlist from './pages/Watchlist';
import ModelPerformance from './pages/ModelPerformance';

function Toast() {
  const { toastMessage } = useStock();
  if (!toastMessage) return null;

  const isSuccess = toastMessage.type === 'success';
  const isError = toastMessage.type === 'error';

  return (
    <div className="fixed bottom-6 right-6 z-50 animate-bounce pointer-events-none">
      <div
        className={`px-4 py-2.5 rounded-full shadow-lg text-xs font-medium border ${
          isSuccess
            ? 'bg-white text-emerald-700 border-emerald-200'
            : isError
            ? 'bg-white text-rose-600 border-rose-200'
            : 'bg-white text-[#111] border-[#e8e8e6]'
        }`}
      >
        {toastMessage.message}
      </div>
    </div>
  );
}

function TerminalLayout({ children }) {
  return (
    <div className="min-h-screen bg-[#f5f5f7] text-[#636366] flex flex-col md:flex-row font-sans relative">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <main className="flex-1 min-w-0 p-4 sm:p-6 lg:p-8">
          {children}
        </main>
        <Footer />
      </div>
    </div>
  );
}

function AppRoutes() {
  const { selectedSymbol } = useStock();

  return (
    <Routes>
      {/* Public Landing Page */}
      <Route path="/" element={<LandingPage />} />

      {/* Internal Application Terminal */}
      <Route
        path="/dashboard"
        element={
          <TerminalLayout>
            <Dashboard />
          </TerminalLayout>
        }
      />
      <Route
        path="/explore"
        element={
          <TerminalLayout>
            <ExploreStocks />
          </TerminalLayout>
        }
      />

      {/* Stock Details */}
      <Route path="/stocks" element={<Navigate to={`/stocks/${encodeURIComponent(selectedSymbol)}`} replace />} />
      <Route
        path="/stocks/:symbol"
        element={
          <TerminalLayout>
            <StockDetails />
          </TerminalLayout>
        }
      />

      {/* Technical Analysis */}
      <Route path="/technical" element={<Navigate to={`/technical/${encodeURIComponent(selectedSymbol)}`} replace />} />
      <Route
        path="/technical/:symbol"
        element={
          <TerminalLayout>
            <TechnicalAnalysis />
          </TerminalLayout>
        }
      />

      {/* Predictions */}
      <Route path="/predictions" element={<Navigate to={`/predictions/${encodeURIComponent(selectedSymbol)}`} replace />} />
      <Route
        path="/predictions/:symbol"
        element={
          <TerminalLayout>
            <Predictions />
          </TerminalLayout>
        }
      />

      {/* Insights */}
      <Route path="/insights" element={<Navigate to={`/insights/${encodeURIComponent(selectedSymbol)}`} replace />} />
      <Route
        path="/insights/:symbol"
        element={
          <TerminalLayout>
            <MarketInsights />
          </TerminalLayout>
        }
      />

      {/* Watchlist */}
      <Route
        path="/watchlist"
        element={
          <TerminalLayout>
            <Watchlist />
          </TerminalLayout>
        }
      />

      {/* Model Performance */}
      <Route path="/models" element={<Navigate to={`/models/${encodeURIComponent(selectedSymbol)}`} replace />} />
      <Route
        path="/models/:symbol"
        element={
          <TerminalLayout>
            <ModelPerformance />
          </TerminalLayout>
        }
      />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <Router>
        <StockProvider>
          <AppRoutes />
          <AuthModal />
          <Toast />
        </StockProvider>
      </Router>
    </ErrorBoundary>
  );
}
