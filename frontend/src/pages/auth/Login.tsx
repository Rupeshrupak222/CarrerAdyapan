import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useTheme } from '../../context/ThemeContext';
import AdyapanLogo from '../../components/common/AdyapanLogo';
import api from '../../services/api';
import toast from 'react-hot-toast';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const { theme } = useTheme();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email.trim() || !password) {
      toast.error('Please enter email and password');
      return;
    }

    setLoading(true);

    try {
      const response = await api.post('/auth/login', { email: email.trim().toLowerCase(), password });
      const data = response.data;

      if (data.success) {
        const role = data.role || data.user?.role;
        if (role === 'CANDIDATE') {
          localStorage.setItem('token', data.token);
          localStorage.setItem('candidateToken', data.token);
          const candidateObj = data.candidate || data.user || {
            id: 'cand-1',
            email: email.trim().toLowerCase(),
            name: email.split('@')[0],
            role: 'CANDIDATE'
          };
          localStorage.setItem('candidate', JSON.stringify(candidateObj));
          toast.success('Welcome back!');
          window.location.href = '/my-applications';
        } else if (role === 'HR') {
          localStorage.setItem('token', data.token);
          localStorage.setItem('user', JSON.stringify(data.user));
          toast.success(`Welcome back, ${data.user?.name || 'HR Specialist'}!`);
          window.location.href = '/hr/dashboard';
        } else if (role === 'HR_MANAGER') {
          localStorage.setItem('token', data.token);
          localStorage.setItem('user', JSON.stringify(data.user));
          toast.success(`Welcome back, ${data.user?.name || 'HR Manager'}!`);
          window.location.href = '/hr-manager/dashboard';
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
        toast.error(data.message || 'Invalid email or password');
      }
    } catch (error: any) {
      console.error('Login error:', error);
      const msg = error.response?.data?.message || 'Invalid email or password';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`min-h-screen font-sans antialiased flex flex-col justify-between transition-colors ${theme === 'dark' ? 'bg-slate-950 text-white' : 'bg-slate-50 text-slate-900'
      }`}>

      {/* Main Login Card Container */}
      <div className="flex-1 flex items-center justify-center py-12 px-4 sm:px-6">
        <div className={`w-full max-w-md p-6 sm:p-10 rounded-3xl space-y-6 shadow-2xl border transition-all ${theme === 'dark'
            ? 'bg-slate-900 border-slate-800 shadow-slate-950'
            : 'bg-white border-slate-200 shadow-xl'
          }`}>
          {/* Header Logo & Title */}
          <div className="text-center space-y-2">
            <div className="flex justify-center mb-3">
              <AdyapanLogo variant={theme === 'dark' ? 'dark' : 'light'} size="normal" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
              Sign In
            </h1>
            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">
              Enter your email and password to access your account.
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4 pt-2">
            <div>
              <label className="block text-xs font-bold mb-1.5 text-slate-800 dark:text-slate-200">
                Email Address *
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="Enter your email address..."
                className={`w-full px-4 py-3 rounded-xl text-xs font-medium focus:outline-none border transition-all ${theme === 'dark'
                    ? 'bg-slate-950 border-slate-700 text-white focus:border-amber-400'
                    : 'bg-white border-slate-300 text-slate-900 focus:border-amber-500 shadow-sm'
                  }`}
              />
            </div>

            <div>
              <label className="block text-xs font-bold mb-1.5 text-slate-800 dark:text-slate-200">
                Account Password *
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder="Enter your account password..."
                  className={`w-full pl-4 pr-11 py-3 rounded-xl text-xs font-medium focus:outline-none border transition-all ${theme === 'dark'
                      ? 'bg-slate-950 border-slate-700 text-white focus:border-amber-400'
                      : 'bg-white border-slate-300 text-slate-900 focus:border-amber-500 shadow-sm'
                    }`}
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
              className="w-full py-3.5 text-xs font-bold text-slate-950 bg-amber-400 hover:bg-amber-500 rounded-xl transition-all shadow-md uppercase tracking-wider text-center cursor-pointer active:scale-98"
            >
              {loading ? 'Signing in...' : 'Sign In →'}
            </button>
          </form>

          {/* Footer Links */}
          <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-[11px] font-semibold">
            <Link to="/register" className="text-amber-600 dark:text-amber-400 hover:underline">
              Create Account ↗
            </Link>
            <Link to="/careers" className="text-slate-500 dark:text-slate-400 hover:text-amber-500 transition-colors">
              ← Back to Careers
            </Link>
          </div>
        </div>
      </div>

      {/* Page Footer */}
      <footer className="w-full py-4 border-t border-slate-200 dark:border-slate-800 text-center text-xs font-medium text-slate-500 dark:text-slate-400">
        <p>© {new Date().getFullYear()} Adyapan Edutech Pvt. Ltd. • AI Recruitment Platform</p>
      </footer>
    </div>
  );
};

export default Login;