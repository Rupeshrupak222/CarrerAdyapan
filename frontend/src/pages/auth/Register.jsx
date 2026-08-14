import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import AdyapanLogo from '../../components/common/AdyapanLogo';
import toast from 'react-hot-toast';

const Register = () => {
  const [formData, setFormData] = useState({
    name: 'Aniket Sharma',
    email: '',
    password: '',
    company: 'Adyapan Edutech Pvt. Ltd.',
  });
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const result = await register(formData);
      if (result.success) {
        toast.success('Recruiter Account created! Welcome to Adyapan Platform ');
        navigate('/dashboard');
      } else {
        toast.error(result.error || 'Registration failed.');
      }
    } catch (error) {
      console.error('Registration error:', error);
      toast.error('Registration error.');
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
                  ? 'bg-slate-900 text-amber-300 border-slate-700 hover:bg-slate-800'
                  : 'bg-slate-100 text-slate-900 border-slate-300 hover:bg-slate-200'
                }`}
              title="Click to Switch Light / Dark Mode"
            >
              <span className="hidden sm:inline">{theme === 'dark' ? 'Dark Mode' : 'Light Mode'}</span>
              <span className="sm:hidden">{theme === 'dark' ? '' : ''}</span>
            </button>

            {/* Already Have Account Button */}
            <Link
              to="/login"
              className="px-3 sm:px-4 py-1.5 sm:py-2 text-xs font-black text-white bg-amber-500 hover:bg-amber-600 rounded-xl transition-all shadow-md shadow-amber-400/20 uppercase tracking-wider flex items-center gap-1.5 shrink-0"
            >
              <span className="hidden sm:inline">Sign In to Dashboard →</span>
              <span className="sm:hidden">Sign In →</span>
            </Link>
          </div>
        </div>
      </nav>

      {/* Main Register Card Container */}
      <div className="flex-1 flex items-center justify-center py-8 sm:py-12 px-4 sm:px-6">
        <div className={`w-full max-w-md p-5 sm:p-8 rounded-3xl space-y-5 sm:space-y-6 shadow-2xl border transition-all ${theme === 'dark'
            ? 'bg-slate-900 border-slate-800 shadow-slate-950'
            : 'bg-white border-slate-300 shadow-xl'
          }`}>
          {/* Header Title */}
          <div className="text-center space-y-2">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 text-[11px] font-black bg-blue-500/20 text-blue-700 dark:text-blue-300 border border-blue-500/30 rounded-full uppercase">
               REQUEST RECRUITER HR ACCESS
            </div>
            <h1 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white">
              Create HR Admin Account
            </h1>
            <p className="text-xs font-bold text-slate-700 dark:text-slate-300">
              Set up your hiring team dashboard for Adyapan Edutech.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-black mb-1.5 text-slate-900 dark:text-slate-100">
                Full Name *
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                placeholder="e.g. Aniket Sharma"
                className={`w-full px-4 py-3 rounded-xl text-xs font-bold focus:outline-none border transition-all ${theme === 'dark'
                    ? 'bg-slate-950 border-slate-700 text-white focus:border-amber-400'
                    : 'bg-white border-slate-300 text-slate-900 focus:border-blue-600 shadow-sm'
                  }`}
              />
            </div>

            <div>
              <label className="block text-xs font-black mb-1.5 text-slate-900 dark:text-slate-100">
                Work Email *
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                placeholder="hr@adyapan.com"
                className={`w-full px-4 py-3 rounded-xl text-xs font-bold focus:outline-none border transition-all ${theme === 'dark'
                    ? 'bg-slate-950 border-slate-700 text-white focus:border-amber-400'
                    : 'bg-white border-slate-300 text-slate-900 focus:border-blue-600 shadow-sm'
                  }`}
              />
            </div>

            <div>
              <label className="block text-xs font-black mb-1.5 text-slate-900 dark:text-slate-100">
                Company / Organization Name *
              </label>
              <input
                type="text"
                name="company"
                value={formData.company}
                onChange={handleChange}
                required
                placeholder="Adyapan Edutech Pvt. Ltd."
                className={`w-full px-4 py-3 rounded-xl text-xs font-bold focus:outline-none border transition-all ${theme === 'dark'
                    ? 'bg-slate-950 border-slate-700 text-white focus:border-amber-400'
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
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
                placeholder="••••••••"
                className={`w-full px-4 py-3 rounded-xl text-xs font-bold focus:outline-none border transition-all ${theme === 'dark'
                    ? 'bg-slate-950 border-slate-700 text-white focus:border-amber-400'
                    : 'bg-white border-slate-300 text-slate-900 focus:border-blue-600 shadow-sm'
                  }`}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 text-xs font-black text-slate-950 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 rounded-xl transition-all shadow-xl shadow-amber-400/20 uppercase tracking-wider text-center"
            >
              {loading ? 'Creating Account...' : 'Create HR Admin Account →'}
            </button>
          </form>

          <div className="pt-2 border-t border-slate-200 dark:border-slate-800 text-center text-xs font-bold space-y-2">
            <p className="text-slate-700 dark:text-slate-300">
              Already have an account? <Link to="/login" className="text-blue-600 dark:text-amber-400 hover:underline font-black">Sign In to Dashboard</Link>
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

export default Register;