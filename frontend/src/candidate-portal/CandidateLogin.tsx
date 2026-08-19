import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCandidateAuth } from '../context/CandidateAuthContext';
import { useTheme } from '../context/ThemeContext';
import AdyapanLogo from '../components/common/AdyapanLogo';
import api from '../services/api';
import toast from 'react-hot-toast';

const CandidateLogin = () => {
  const { theme } = useTheme();
  const navigate = useNavigate();
  const { login: setAdminSession } = useAuth();
  const { login: setCandidateSession } = useCandidateAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (!email || !password) {
      setError('Please enter your email and password');
      setLoading(false);
      return;
    }

    try {
      // Single universal login call
      const response = await api.post('/auth/login', { email, password });
      const data = response.data;

      if (data.success) {
        const role = data.role;

        if (role === 'CANDIDATE') {
          // Store candidate session
          localStorage.setItem('token', data.token);
          localStorage.setItem('candidateToken', data.token);
          localStorage.setItem('candidate', JSON.stringify(data.candidate));
          toast.success('Welcome back!');
          // Force page reload to pick up context
          window.location.href = '/my-applications';
        } else {
          // Admin/HR - store in auth context
          localStorage.setItem('token', data.token);
          localStorage.setItem('user', JSON.stringify(data.user));
          toast.success('Welcome back, Admin!');
          window.location.href = '/dashboard';
        }
      } else {
        setError(data.message || 'Invalid email or password');
      }
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Invalid email or password';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`min-h-screen flex flex-col font-sans antialiased transition-colors ${theme === 'dark' ? 'bg-slate-950 text-white' : 'bg-slate-50 text-slate-900'}`}>

      {/* Header */}
      <nav className={`px-6 py-4 border-b ${theme === 'dark' ? 'border-slate-800 bg-slate-950' : 'border-slate-200 bg-white'}`}>
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Link to="/careers" className="flex items-center gap-2">
            <AdyapanLogo variant={theme === 'dark' ? 'dark' : 'light'} size="small" />
          </Link>
          <Link to="/careers" className={`text-sm font-medium hover:text-amber-500 transition-colors ${theme === 'dark' ? 'text-slate-300' : 'text-slate-600'}`}>
            ← Back to Careers
          </Link>
        </div>
      </nav>

      {/* Login Form */}
      <div className="flex-1 flex items-center justify-center px-4 py-12">
        <div className={`w-full max-w-md p-8 rounded-2xl border shadow-xl ${theme === 'dark' ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>

          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold mb-2">Sign In</h1>
            <p className={`text-sm ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>
              Access your account
            </p>
          </div>

          {error && (
            <div className="mb-6 p-3 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className={`block text-xs font-semibold mb-1.5 ${theme === 'dark' ? 'text-slate-300' : 'text-slate-700'}`}>
                Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => { setEmail(e.target.value); setError(''); }}
                placeholder="Enter your email"
                className={`w-full px-4 py-2.5 rounded-xl text-sm border focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500 transition-all ${theme === 'dark' ? 'bg-slate-800 border-slate-700 text-white placeholder-slate-500' : 'bg-slate-50 border-slate-200 text-slate-900 placeholder-slate-400'}`}
                required
              />
            </div>

            <div>
              <label className={`block text-xs font-semibold mb-1.5 ${theme === 'dark' ? 'text-slate-300' : 'text-slate-700'}`}>
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => { setPassword(e.target.value); setError(''); }}
                  placeholder="Enter your password"
                  className={`w-full px-4 py-2.5 pr-11 rounded-xl text-sm border focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500 transition-all ${theme === 'dark' ? 'bg-slate-800 border-slate-700 text-white placeholder-slate-500' : 'bg-slate-50 border-slate-200 text-slate-900 placeholder-slate-400'}`}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-amber-500 transition-colors"
                >
                  {showPassword ? (
                    <svg className="w-4.5 h-4.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858-5.908A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.542 7a10.025 10.025 0 01-4.132 5.411M3 3l18 18" />
                    </svg>
                  ) : (
                    <svg className="w-4.5 h-4.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
              className="w-full py-3 rounded-xl text-sm font-bold text-white bg-amber-500 hover:bg-amber-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-amber-500/20"
            >
              {loading ? 'Signing In...' : 'Sign In'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className={`text-sm ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>
              Don't have an account?{' '}
              <Link to="/register" className="text-amber-500 font-semibold hover:text-amber-600 transition-colors">
                Create Account
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CandidateLogin;
