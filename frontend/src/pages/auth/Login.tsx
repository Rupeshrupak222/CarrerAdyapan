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
  const { theme } = useTheme();

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
                placeholder="admin@adyapan.com"
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
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="••••••••"
                className={`w-full px-4 py-3 rounded-xl text-xs font-medium focus:outline-none border transition-all ${
                  theme === 'dark'
                    ? 'bg-slate-950 border-slate-700 text-white focus:border-amber-400'
                    : 'bg-white border-slate-300 text-slate-900 focus:border-amber-500 shadow-sm'
                }`}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 text-xs font-bold text-slate-950 bg-amber-400 hover:bg-amber-500 rounded-xl transition-all shadow-md uppercase tracking-wider text-center cursor-pointer"
            >
              {loading ? 'Authenticating Recruiter Account...' : 'Sign In to Recruiter Dashboard →'}
            </button>
          </form>

          {/* Footer Links */}
          <div className="pt-4 border-t border-slate-200 dark:border-slate-800 text-center text-xs font-semibold space-y-2">
            <p className="text-slate-600 dark:text-slate-300">
              Need HR access? <Link to="/register" className="text-amber-600 dark:text-amber-400 hover:underline font-bold">Request Admin Account</Link>
            </p>
            <p>
              <Link to="/careers" className="text-slate-500 dark:text-slate-400 hover:underline text-[11px]">
                Are you a job candidate? Go to Adyapan Careers Portal →
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