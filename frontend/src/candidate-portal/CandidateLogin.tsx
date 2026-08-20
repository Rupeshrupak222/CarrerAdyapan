import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import CandidateNavbar from '../components/layout/CandidateNavbar';
import Footer from '../components/layout/Footer';
import api from '../services/api';
import toast from 'react-hot-toast';

const CandidateLogin = () => {
  const { theme } = useTheme();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const redirectUrl = searchParams.get('redirect') || '';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (!email.trim() || !password) {
      setError('Please enter your email and password');
      setLoading(false);
      return;
    }

    try {
      const response = await api.post('/auth/login', { email: email.trim().toLowerCase(), password });
      const data = response.data;

      if (data.success) {
        const role = data.role || data.user?.role;

        if (role === 'CANDIDATE') {
          localStorage.setItem('token', data.token);
          localStorage.setItem('candidateToken', data.token);
          if (data.candidate) {
            localStorage.setItem('candidate', JSON.stringify(data.candidate));
          } else if (data.user) {
            localStorage.setItem('candidate', JSON.stringify(data.user));
          }
          toast.success('Welcome back!');
          if (redirectUrl) {
            window.location.href = redirectUrl;
          } else {
            window.location.href = '/my-applications';
          }
        } else {
          localStorage.setItem('token', data.token);
          localStorage.setItem('user', JSON.stringify(data.user || {
            id: 'admin-1',
            email: email.trim().toLowerCase(),
            name: 'Recruiter Admin',
            role: 'ADMIN'
          }));
          toast.success('Welcome back, Admin!');
          window.location.href = '/dashboard';
        }
      } else {
        setError(data.message || 'Invalid email or password');
      }
    } catch (err: any) {
      console.error('Login error:', err);
      const msg = err.response?.data?.message || 'Invalid email or password. Please try again.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const inputClass = theme === 'dark'
    ? 'w-full px-4 py-3 rounded-xl text-sm font-semibold bg-slate-900 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-500/20 transition-all'
    : 'w-full px-4 py-3 rounded-xl text-sm font-semibold bg-slate-50 border border-slate-200 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 transition-all';

  const labelClass = theme === 'dark'
    ? 'block text-xs font-bold text-slate-200 mb-1.5'
    : 'block text-xs font-bold text-slate-700 mb-1.5';

  return (
    <div className={`min-h-screen flex flex-col font-sans antialiased transition-colors relative overflow-x-hidden ${
      theme === 'dark' ? 'bg-[#0a0a1a] text-slate-100' : 'bg-slate-50/50 text-slate-900'
    }`}>
      
      {/* Glow */}
      <div className="fixed top-0 right-0 w-[50vw] h-full pointer-events-none bg-gradient-to-l from-orange-400/15 via-amber-200/10 to-transparent dark:from-amber-500/10 dark:to-transparent blur-3xl z-0" />

      {/* Header */}
      <CandidateNavbar activePage="login" />

      {/* Login Container */}
      <main className="flex-1 flex items-center justify-center px-4 py-12 relative z-10">
        <div className={`w-full max-w-md p-8 sm:p-10 rounded-3xl border shadow-2xl space-y-6 ${
          theme === 'dark' ? 'bg-slate-900/90 border-slate-800' : 'bg-white border-amber-200/80 shadow-amber-500/10'
        }`}>
          
          {/* Header Title */}
          <div className="text-center space-y-2">
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
              Sign In to Your Account
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {redirectUrl
                ? 'Sign in to continue directly to your application'
                : 'Enter your credentials to access your dashboard'}
            </p>
          </div>

          {error && (
            <div className="p-3.5 rounded-2xl bg-red-500/10 border border-red-500/30 text-red-600 dark:text-red-400 text-xs font-bold flex items-center gap-2">
              <span>⚠️</span>
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className={labelClass}>Email Address *</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => { setEmail(e.target.value); setError(''); }}
                placeholder="name@example.com"
                className={inputClass}
              />
            </div>

            <div>
              <label className={labelClass}>Password *</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => { setPassword(e.target.value); setError(''); }}
                  placeholder="Enter your password"
                  className={`${inputClass} pr-11`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-amber-500 transition-colors cursor-pointer"
                  title={showPassword ? 'Hide Password' : 'Show Password'}
                >
                  {showPassword ? (
                    <svg className="w-4 h-4 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858-5.908a10.04 10.04 0 013.682-.863c4.478 0 8.268 2.943 9.542 7a10.025 10.025 0 01-4.132 5.411m-3.016 3.016l-7.5-7.5" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3l18 18" />
                    </svg>
                  ) : (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 rounded-2xl text-xs font-black text-slate-950 bg-gradient-to-r from-amber-400 via-amber-500 to-orange-500 hover:from-amber-300 hover:to-orange-400 transition-all shadow-xl shadow-amber-500/25 uppercase tracking-wider cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2 hover:scale-[1.01] active:scale-[0.99]"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                  <span>Signing In...</span>
                </>
              ) : (
                <>
                  <span>Sign In →</span>
                </>
              )}
            </button>
          </form>

          <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
            <Link
              to={`/register${redirectUrl ? `?redirect=${encodeURIComponent(redirectUrl)}` : ''}`}
              className="font-bold text-amber-600 dark:text-amber-400 hover:underline"
            >
              Create Account Free ↗
            </Link>
            <Link
              to="/careers"
              className="hover:text-amber-500 transition-colors"
            >
              ← Back to Careers
            </Link>
          </div>
        </div>
      </main>

      <Footer isPublic={true} />

    </div>
  );
};

export default CandidateLogin;
