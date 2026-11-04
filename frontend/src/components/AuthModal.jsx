import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { X, ArrowRight, ShieldCheck, Sparkles, Lock, Mail, User } from 'lucide-react';
import { useStock } from '../context/StockContext';

export default function AuthModal() {
  const { authModalOpen, setAuthModalOpen, authModalMode, setAuthModalMode, login } = useStock();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');

  if (!authModalOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    login(email || 'trader@stocksense.ai', name || 'Institutional Trader');
    navigate('/dashboard');
  };

  const handleDemoLogin = () => {
    login('demo.investor@stocksense.ai', 'Institutional Demo Analyst');
    navigate('/dashboard');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slash-obsidian/80 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-md rounded-[10px] bg-slash-onyx border border-slash-graphite p-6 sm:p-8 shadow-2xl space-y-6">
        {/* Close Button */}
        <button
          onClick={() => setAuthModalOpen(false)}
          className="absolute right-4 top-4 p-1.5 rounded-full text-slash-fog hover:text-white hover:bg-slash-carbon transition"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Modal Header */}
        <div className="text-center space-y-1">
          <div className="text-[12px] font-semibold text-slash-copper uppercase tracking-[-0.02em]">
            StockSense Vault
          </div>
          <h2 className="font-serif text-2xl sm:text-3xl font-normal text-white tracking-[0.01em]">
            {authModalMode === 'login' ? 'Sign in to Terminal' : 'Create Vault Account'}
          </h2>
          <p className="text-xs text-slash-fog">
            Access algorithmic forecasts, custom watchlists, and live multi-exchange data feeds.
          </p>
        </div>

        {/* Tab Toggle */}
        <div className="flex rounded-full bg-slash-carbon border border-slash-graphite p-1">
          <button
            type="button"
            onClick={() => setAuthModalMode('login')}
            className={`flex-1 py-1.5 text-xs rounded-full font-medium transition ${
              authModalMode === 'login'
                ? 'bg-white text-black font-semibold'
                : 'text-slash-fog hover:text-white'
            }`}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => setAuthModalMode('signup')}
            className={`flex-1 py-1.5 text-xs rounded-full font-medium transition ${
              authModalMode === 'signup'
                ? 'bg-white text-black font-semibold'
                : 'text-slash-fog hover:text-white'
            }`}
          >
            Create Account
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {authModalMode === 'signup' && (
            <div className="relative">
              <User className="w-4 h-4 text-slash-fog absolute left-4 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Full Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="w-full bg-slash-carbon border border-slash-graphite rounded-full pl-11 pr-4 py-2.5 text-xs text-white placeholder-slash-ash focus:outline-none focus:border-white transition"
              />
            </div>
          )}

          <div className="relative">
            <Mail className="w-4 h-4 text-slash-fog absolute left-4 top-1/2 -translate-y-1/2" />
            <input
              type="email"
              placeholder="Institutional or personal email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full bg-slash-carbon border border-slash-graphite rounded-full pl-11 pr-4 py-2.5 text-xs text-white placeholder-slash-ash focus:outline-none focus:border-white transition"
            />
          </div>

          <div className="relative">
            <Lock className="w-4 h-4 text-slash-fog absolute left-4 top-1/2 -translate-y-1/2" />
            <input
              type="password"
              placeholder="Secure password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full bg-slash-carbon border border-slash-graphite rounded-full pl-11 pr-4 py-2.5 text-xs text-white placeholder-slash-ash focus:outline-none focus:border-white transition"
            />
          </div>

          <button
            type="submit"
            className="w-full py-2.5 rounded-full bg-white text-black hover:bg-slate-200 text-xs font-semibold transition flex items-center justify-center gap-2"
          >
            <span>{authModalMode === 'login' ? 'Enter Vault' : 'Complete Registration'}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </form>

        <div className="relative flex py-1 items-center">
          <div className="flex-grow border-t border-slash-graphite"></div>
          <span className="flex-shrink mx-3 text-[11px] text-slash-ash uppercase tracking-wider font-mono">or</span>
          <div className="flex-grow border-t border-slash-graphite"></div>
        </div>

        {/* Demo Fast Track Login */}
        <button
          type="button"
          onClick={handleDemoLogin}
          className="w-full py-2.5 rounded-full bg-slash-carbon hover:bg-slash-graphite border border-slash-graphite text-xs font-medium text-white transition flex items-center justify-center gap-2"
        >
          <Sparkles className="w-3.5 h-3.5 text-slash-copper" />
          <span>One-Click Instant Demo Access</span>
        </button>

        <div className="text-center">
          <button
            type="button"
            onClick={() => {
              setAuthModalOpen(false);
              navigate('/dashboard');
            }}
            className="text-[11px] text-slash-fog hover:text-white underline transition"
          >
            Continue as Guest without saving credentials →
          </button>
        </div>
      </div>
    </div>
  );
}
