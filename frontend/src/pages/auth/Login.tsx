import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import AdyapanLogo from '../../components/common/AdyapanLogo';
import toast from 'react-hot-toast';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();
  const { theme } = useTheme();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email.trim() || !password) {
      toast.error('Please enter email and password');
      return;
    }

    setLoading(true);

    try {
      const result = await login(email.trim(), password);
      if (result.success) {
        toast.success('Welcome back, Recruiter Admin!');
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
    <div className={`min-h-screen font-sans antialiased flex flex-col justify-between transition-colors ${
      theme === 'dark' ? 'bg-slate-950 text-white' : 'bg-slate-50 text-slate-900'
    }`}>
      
      {/* Main Login Card Container */}
      <div className="flex-1 flex items-center justify-center py-12 px-4 sm:px-6">
        <div className={`w-full max-w-md p-6 sm:p-10 rounded-3xl space-y-6 shadow-2xl border transition-all ${
          theme === 'dark'
            ? 'bg-slate-900 border-slate-800 shadow-slate-950'
            : 'bg-white border-slate-200 shadow-xl'
        }`}>
          {/* Header Logo & Title */}
          <div className="text-center space-y-3">
            <div className="flex justify-center mb-3">
              <AdyapanLogo variant={theme === 'dark' ? 'dark' : 'light'} size="normal" />
            </div>
            <h1 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white">
              Recruiter & Admin Login
            </h1>
            <p className="text-xs font-semibold text-slate-600 dark:text-slate-300">
              Access AI candidate rankings, resume scoring, and recruitment workflows.
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4 pt-2">
            <div>
              <label className="block text-xs font-bold mb-1.5 text-slate-800 dark:text-slate-200">
                Recruiter HR Email Address *
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="Enter your HR email address..."
                className={`w-full px-4 py-3 rounded-xl text-xs font-medium focus:outline-none border transition-all ${
                  theme === 'dark'
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
                  className={`w-full pl-4 pr-11 py-3 rounded-xl text-xs font-medium focus:outline-none border transition-all ${
                    theme === 'dark'
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
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858-5.908a10.04 10.04 0 013.682-.863c4.478 0 8.268 2.943 9.542 7a10.025 10.025 0 01-4.132 5.411m-3.016 3.016l-7.5-7.5" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 3l18 18" />
                    </svg>
                  ) : (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
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
              {loading ? 'Authenticating Recruiter Account...' : 'Sign In to Recruiter Dashboard →'}
            </button>
          </form>

          {/* Footer Links */}
          <div className="pt-4 border-t border-slate-200 dark:border-slate-800 text-center text-xs font-semibold space-y-2">
            <p className="text-slate-500 dark:text-slate-400 text-[11px]">
              Admin access only. Contact your Super Admin for credentials.
            </p>
            <p>
              <Link to="/careers" className="text-amber-600 dark:text-amber-400 hover:underline text-[11px]">
                ← Back to Careers Page
              </Link>
            </p>
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