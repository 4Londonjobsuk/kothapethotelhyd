import React, { useState } from 'react';
import { hotelService } from '../../services/hotelService';
import { Lock, Mail, ArrowRight, AlertCircle, CheckCircle2, Loader2, KeyRound } from 'lucide-react';

interface AdminLoginPageProps {
  onLoginSuccess: (user: any) => void;
  onNavigateHome: () => void;
}

export const AdminLoginPage: React.FC<AdminLoginPageProps> = ({
  onLoginSuccess,
  onNavigateHome,
}) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [resetSuccess, setResetSuccess] = useState<string | null>(null);
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [resetLoading, setResetLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setResetSuccess(null);

    if (!email.trim()) {
      setError('Please enter your admin email address.');
      return;
    }
    if (!password) {
      setError('Please enter your password.');
      return;
    }

    setLoading(true);
    try {
      const res = await hotelService.adminLogin(email, password);
      if (res.success && res.user) {
        onLoginSuccess(res.user);
      } else {
        setError(res.error || 'Authentication failed. Please check your credentials.');
      }
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resetEmail.trim()) {
      setError('Please enter your registered admin email.');
      return;
    }

    setResetLoading(true);
    try {
      const res = await hotelService.adminResetPassword(resetEmail);
      if (res.success) {
        setResetSuccess(res.message);
        setShowForgotModal(false);
      } else {
        setError(res.error || 'Failed to send reset link.');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to request password reset.');
    } finally {
      setResetLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-center items-center bg-[#070E1A] px-4 py-12 selection:bg-[#C59A47] selection:text-white">
      {/* Background Subtle Gradient */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-[#0D1E3A] via-[#070E1A] to-[#040810] -z-10 pointer-events-none" />

      <div className="w-full max-w-md bg-[#0B1526] border border-[#C59A47]/25 rounded-2xl p-8 sm:p-10 shadow-[0_20px_60px_rgba(0,0,0,0.6)] relative backdrop-blur-md">
        {/* Brand Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-[#0D1E3A] border border-[#E0C37B]/40 mb-4 shadow-[0_4px_20px_rgba(197,154,71,0.2)]">
            <Lock className="w-7 h-7 text-[#E0C37B]" />
          </div>
          <h1 className="text-2xl font-serif tracking-wide text-[#E0C37B]">
            Lotus Grand Portal
          </h1>
          <p className="text-xs text-stone-400 mt-1.5 uppercase tracking-widest font-sans">
            Administrative Management Login
          </p>
        </div>

        {/* Status Alerts */}
        {error && (
          <div className="mb-6 p-4 rounded-xl bg-rose-950/60 border border-rose-600/40 text-rose-200 text-sm flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
            <div className="flex-1">{error}</div>
          </div>
        )}

        {resetSuccess && (
          <div className="mb-6 p-4 rounded-xl bg-emerald-950/60 border border-emerald-600/40 text-emerald-200 text-sm flex items-start gap-3">
            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
            <div className="flex-1">{resetSuccess}</div>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-stone-300 mb-2">
              Admin Email
            </label>
            <div className="relative">
              <Mail className="w-5 h-5 absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400 pointer-events-none" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@lotusgrand.com"
                className="w-full pl-11 pr-4 py-3 bg-[#070E1A]/80 border border-[#C59A47]/30 rounded-xl text-stone-100 text-sm placeholder-stone-500 focus:outline-none focus:border-[#E0C37B] focus:ring-1 focus:ring-[#E0C37B] transition-all"
                autoComplete="email"
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-semibold uppercase tracking-wider text-stone-300">
                Password
              </label>
              <button
                type="button"
                onClick={() => {
                  setResetEmail(email);
                  setShowForgotModal(true);
                  setError(null);
                }}
                className="text-xs text-[#E0C37B] hover:text-[#FFF5A5] transition-colors cursor-pointer"
              >
                Forgot Password?
              </button>
            </div>
            <div className="relative">
              <KeyRound className="w-5 h-5 absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400 pointer-events-none" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full pl-11 pr-4 py-3 bg-[#070E1A]/80 border border-[#C59A47]/30 rounded-xl text-stone-100 text-sm placeholder-stone-500 focus:outline-none focus:border-[#E0C37B] focus:ring-1 focus:ring-[#E0C37B] transition-all"
                autoComplete="current-password"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 py-3.5 px-6 rounded-xl bg-gradient-to-r from-[#C59A47] to-[#9C752B] hover:from-[#D4AA55] hover:to-[#B58A38] text-white font-medium text-sm tracking-wide shadow-[0_4px_16px_rgba(197,154,71,0.35)] transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-white" />
                <span>Signing In...</span>
              </>
            ) : (
              <>
                <span>Sign In to Admin</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        <div className="mt-8 pt-6 border-t border-stone-800 text-center">
          <button
            onClick={onNavigateHome}
            className="text-xs text-stone-400 hover:text-stone-200 transition-colors inline-flex items-center gap-1.5 cursor-pointer"
          >
            <span>← Return to Public Website</span>
          </button>
        </div>
      </div>

      {/* Forgot Password Modal */}
      {showForgotModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
          <div className="w-full max-w-sm bg-[#0B1526] border border-[#C59A47]/40 rounded-2xl p-6 shadow-2xl">
            <h3 className="text-lg font-serif text-[#E0C37B] mb-2">Reset Admin Password</h3>
            <p className="text-xs text-stone-300 mb-4">
              Enter your admin email address to receive a secure recovery link.
            </p>
            <form onSubmit={handleForgotPassword} className="space-y-4">
              <input
                type="email"
                required
                value={resetEmail}
                onChange={(e) => setResetEmail(e.target.value)}
                placeholder="admin@lotusgrand.com"
                className="w-full px-4 py-2.5 bg-[#070E1A] border border-stone-700 rounded-xl text-stone-100 text-sm focus:outline-none focus:border-[#E0C37B]"
              />
              <div className="flex gap-3 justify-end pt-2">
                <button
                  type="button"
                  onClick={() => setShowForgotModal(false)}
                  className="px-4 py-2 text-xs text-stone-400 hover:text-stone-200 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={resetLoading}
                  className="px-5 py-2 text-xs bg-[#C59A47] hover:bg-[#D4AA55] text-white rounded-lg font-medium cursor-pointer disabled:opacity-50"
                >
                  {resetLoading ? 'Sending...' : 'Send Link'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
