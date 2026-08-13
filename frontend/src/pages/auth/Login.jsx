import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import AdyapanLogo from '../../components/common/AdyapanLogo';
import toast from 'react-hot-toast';

const Login = () => {
  const [email, setEmail] = useState('admin@adyapan.com');
  const [password, setPassword] = useState('password123');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();

  const handleDemoFill = () => {
    setEmail('admin@adyapan.com');
    setPassword('password123');
    toast.success('Demo HR Credentials loaded! ⚡');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!email || !password) {
      toast.error('Please enter email and password');
      return;
    }

    setLoading(true);

    try {
      const result = await login(email, password);
      if (result.success) {
        toast.success('Welcome back, Recruiter Admin! 👋');
        navigate('/dashboard');
      } else {
        toast.error(result.error || 'Login failed. Please try again.');
      }
    } catch (error) {
      console.error('Login error:', error);
      toast.error('Login failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`min-h-screen font-sans antialiased flex flex-col justify-between transition-colors ${theme === 'dark' ? 'bg-slate-950 text-white' : 'bg-slate-50 text-slate-900'
      }`}>
      {/* Premium Glassmorphic Navbar Header */}
      <nav className={`sticky top-0 z-50 px-3.5 sm:px-6 py-3 sm:py-4 backdrop-blur-xl border-b transition-all ${theme === 'dark'
          ? 'bg-slate-950/95 border-slate-800 shadow-2xl shadow-slate-950'
          : 'bg-white/95 border-slate-300 shadow-md'
        }`}>
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-2 sm:gap-4">

          {/* Left: Brand Logo & Tagline */}
          <Link to="/careers" className="flex items-center gap-2 shrink-0">
            <AdyapanLogo variant={theme === 'dark' ? 'dark' : 'light'} size="small" />
          </Link>

          {/* Right Action Buttons */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            {/* Global Theme Mode Toggle Switch Button */}
            <button
              onClick={toggleTheme}
              className={`px-2.5 sm:px-4 py-1.5 sm:py-2 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 border shadow-sm ${theme === 'dark'
                  ? 'bg-slate-900 text-orange-300 border-slate-700 hover:bg-slate-800'
                  : 'bg-slate-100 text-slate-900 border-slate-300 hover:bg-slate-200'
                }`}
              title="Click to Switch Light / Dark Mode"
            >
              <span className="hidden sm:inline">{theme === 'dark' ? '🌙 Dark Mode' : '☀️ Light Mode'}</span>
              <span className="sm:hidden">{theme === 'dark' ? '🌙' : '☀️'}</span>
            </button>

            {/* Public Careers Portal Pill Button */}
            <Link
              to="/careers"
              className="px-3 sm:px-4 py-1.5 sm:py-2 text-xs font-black text-white bg-orange-500 hover:bg-orange-600 rounded-xl transition-all shadow-md shadow-orange-400/20 uppercase tracking-wider flex items-center gap-1.5 shrink-0"
            >
              <span>🌐</span>
              <span className="hidden md:inline">Public Careers Portal ↗</span>
              <span className="md:hidden">Careers ↗</span>
            </Link>
          </div>
        </div>
      </nav>

      {/* Main Login Card Container */}
      <div className="flex-1 flex items-center justify-center py-8 sm:py-12 px-4 sm:px-6">
        <div className={`w-full max-w-md p-5 sm:p-8 rounded-3xl space-y-5 sm:space-y-6 shadow-2xl border transition-all ${theme === 'dark'
            ? 'bg-slate-900 border-slate-800 shadow-slate-950'
            : 'bg-white border-slate-300 shadow-xl'
          }`}>
          {/* Header Title */}
          <div className="text-center space-y-2">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 text-[11px] font-black bg-orange-500/20 text-orange-700 dark:text-orange-300 border border-orange-500/30 rounded-full uppercase">
              🔐 ADYAPAN RECRUITER PORTAL
            </div>
            <h1 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white">
              Recruiter & Admin Login
            </h1>
            <p className="text-xs font-bold text-slate-700 dark:text-slate-300">
              Access AI candidate rankings, resume scoring, job postings, and interview schedules.
            </p>
          </div>

          {/* Quick Demo Autofill Button */}
          <div className={`p-3.5 rounded-2xl border flex items-center justify-between text-xs font-bold ${theme === 'dark' ? 'bg-slate-950/80 border-slate-800 text-slate-300' : 'bg-slate-100 border-slate-300 text-slate-800 shadow-inner'
            }`}>
            <span>⚡ Quick Demo Credentials</span>
            <button
              type="button"
              onClick={handleDemoFill}
              className="px-3.5 py-1.5 bg-orange-400 text-slate-950 font-black rounded-xl text-[10px] uppercase hover:bg-orange-600 transition-colors shadow-md shadow-orange-400/20"
            >
              Autofill Admin
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-black mb-1.5 text-slate-900 dark:text-slate-100">
                Recruiter HR Email Address *
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="admin@adyapan.com"
                className={`w-full px-4 py-3 rounded-xl text-xs font-bold focus:outline-none border transition-all ${theme === 'dark'
                    ? 'bg-slate-950 border-slate-700 text-white focus:border-orange-400'
                    : 'bg-white border-slate-300 text-slate-900 focus:border-blue-600 shadow-sm'
                  }`}
              />
            </div>

            <div>
              <label className="block text-xs font-black mb-1.5 text-slate-900 dark:text-slate-100">
                Account Password *
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="••••••••"
                className={`w-full px-4 py-3 rounded-xl text-xs font-bold focus:outline-none border transition-all ${theme === 'dark'
                    ? 'bg-slate-950 border-slate-700 text-white focus:border-orange-400'
                    : 'bg-white border-slate-300 text-slate-900 focus:border-blue-600 shadow-sm'
                  }`}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 text-xs font-black text-slate-950 bg-gradient-to-r from-orange-400 to-orange-500 hover:from-orange-300 hover:to-orange-400 rounded-xl transition-all shadow-xl shadow-orange-400/20 uppercase tracking-wider text-center"
            >
              {loading ? 'Authenticating Recruiter Account...' : 'Sign In to Recruiter Dashboard →'}
            </button>
          </form>

          {/* Footer Links */}
          <div className="pt-2 border-t border-slate-200 dark:border-slate-800 text-center text-xs font-bold space-y-2">
            <p className="text-slate-700 dark:text-slate-300">
              Need HR access? <Link to="/register" className="text-blue-600 dark:text-orange-400 hover:underline font-black">Request Admin Account</Link>
            </p>
            <p>
              <Link to="/careers" className="text-slate-600 dark:text-slate-400 hover:underline text-[11px]">
                Are you a job candidate? Go to Adyapan Careers Portal →
              </Link>
            </p>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="w-full py-6 border-t border-slate-300 dark:border-slate-800 text-center text-xs font-bold text-slate-600 dark:text-slate-400 bg-white/50 dark:bg-slate-950/50">
        <p>© 2026 Adyapan Edutech Pvt. Ltd. • AI Recruitment Platform</p>
      </footer>
    </div>
  );
};

export default Login;