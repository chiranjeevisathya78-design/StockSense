import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { X, ArrowRight, ShieldCheck, Sparkles, Lock, Mail, User } from 'lucide-react';
import { useStock } from '../context/StockContext';
import StockLogo from './StockLogo';

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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/30 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-md rounded-2xl bg-white border border-[#e8e8e6] p-6 sm:p-8 shadow-2xl space-y-6">
        {/* Close Button */}
        <button
          onClick={() => setAuthModalOpen(false)}
          className="absolute right-4 top-4 p-1.5 rounded-full text-[#9a9a9a] hover:text-[#111] hover:bg-[#f0f0ee] transition cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Modal Header */}
        <div className="text-center space-y-2">
          <div className="flex justify-center mb-1">
            <StockLogo size={24} />
          </div>
          <h2 className="text-2xl font-medium text-[#111] tracking-[-0.03em]">
            {authModalMode === 'login' ? 'Sign in to StockSense' : 'Create Account'}
          </h2>
          <p className="text-xs text-[#7b7b7b]">
            Access algorithmic forecasts, custom watchlists, and live multi-exchange data feeds.
          </p>
        </div>

        {/* Tab Toggle */}
        <div className="flex rounded-full bg-[#f7f7f5] border border-[#e8e8e6] p-1">
          <button
            type="button"
            onClick={() => setAuthModalMode('login')}
            className={`flex-1 py-1.5 text-xs rounded-full font-medium transition cursor-pointer ${
              authModalMode === 'login'
                ? 'bg-[#111] text-white shadow-xs'
                : 'text-[#4b5563] hover:text-[#111]'
            }`}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => setAuthModalMode('signup')}
            className={`flex-1 py-1.5 text-xs rounded-full font-medium transition cursor-pointer ${
              authModalMode === 'signup'
                ? 'bg-[#111] text-white shadow-xs'
                : 'text-[#4b5563] hover:text-[#111]'
            }`}
          >
            Create Account
          </button>
        </div>

        {/* Auth Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {authModalMode === 'signup' && (
            <div>
              <label className="block text-xs font-medium text-[#111] mb-1.5">
                Full Name
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-[#9a9a9a] absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="e.g. S. Chiranjeevi"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-[#f7f7f5] border border-[#e8e8e6] rounded-xl pl-10 pr-4 py-2.5 text-xs text-[#111] placeholder-[#9a9a9a] focus:outline-none focus:border-[#111]/30 transition"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-medium text-[#111] mb-1.5">
              Email Address
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-[#9a9a9a] absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                placeholder="name@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-[#f7f7f5] border border-[#e8e8e6] rounded-xl pl-10 pr-4 py-2.5 text-xs text-[#111] placeholder-[#9a9a9a] focus:outline-none focus:border-[#111]/30 transition"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-[#111] mb-1.5">
              Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-[#9a9a9a] absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-[#f7f7f5] border border-[#e8e8e6] rounded-xl pl-10 pr-4 py-2.5 text-xs text-[#111] placeholder-[#9a9a9a] focus:outline-none focus:border-[#111]/30 transition"
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-2.5 rounded-full bg-[#111] hover:bg-black text-white text-xs font-medium transition cursor-pointer shadow-xs flex items-center justify-center gap-1.5"
          >
            <span>{authModalMode === 'login' ? 'Sign In to Terminal' : 'Register Account'}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </form>

        {/* Demo Fast Login */}
        <div className="pt-2 border-t border-[#e8e8e6]">
          <button
            type="button"
            onClick={handleDemoLogin}
            className="w-full py-2 rounded-full bg-[#f0f0ee] hover:bg-[#e8e8e6] text-xs font-medium text-[#111] transition cursor-pointer"
          >
            Instant Demo Analyst Access
          </button>
        </div>
      </div>
    </div>
  );
}
