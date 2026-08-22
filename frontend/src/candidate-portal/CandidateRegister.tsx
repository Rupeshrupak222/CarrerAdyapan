import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useCandidateAuth } from '../context/CandidateAuthContext';
import { useTheme } from '../context/ThemeContext';
import CandidateNavbar from '../components/layout/CandidateNavbar';
import Footer from '../components/layout/Footer';

const CandidateRegister = () => {
  const { register, loading } = useCandidateAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const redirectUrl = searchParams.get('redirect') || '';

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
  });
  const [error, setError] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!formData.firstName.trim() || !formData.email.trim() || !formData.password.trim()) {
      setError('Please fill in all required fields (First Name, Email, Password)');
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    const result = await register({
      firstName: formData.firstName.trim(),
      lastName: formData.lastName.trim(),
      email: formData.email.trim().toLowerCase(),
      password: formData.password,
      phone: formData.phone.trim(),
    });

    if (result.success) {
      if (redirectUrl) {
        navigate(redirectUrl);
      } else {
        navigate('/my-applications');
      }
    } else {
      setError(result.error || 'Registration failed. Please check your details.');
    }
  };

  const inputClass = theme === 'dark'
    ? 'w-full px-4 py-3 rounded-xl text-sm font-semibold bg-slate-900 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-500/20 transition-all'
    : 'w-full px-4 py-3 rounded-xl text-sm font-semibold bg-slate-50 border border-slate-200 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 transition-all';

  const labelClass = theme === 'dark'
    ? 'block text-xs font-bold text-slate-200 mb-1.5'
    : 'block text-xs font-bold text-slate-700 mb-1.5';

  return (
    <div className={`min-h-screen flex flex-col font-sans antialiased transition-colors relative overflow-x-hidden ${theme === 'dark' ? 'bg-[#0a0a1a] text-slate-100' : 'bg-slate-50/50 text-slate-900'
      }`}>

      {/* Glow */}
      <div className="fixed top-0 right-0 w-[50vw] h-full pointer-events-none bg-gradient-to-l from-orange-400/15 via-amber-200/10 to-transparent dark:from-amber-500/10 dark:to-transparent blur-3xl z-0" />

      {/* Header */}
      <CandidateNavbar activePage="register" />

      {/* Registration Container */}
      <main className="flex-1 flex items-center justify-center px-4 py-12 relative z-10">
        <div className={`w-full max-w-md p-8 sm:p-10 rounded-3xl border shadow-2xl space-y-6 ${theme === 'dark' ? 'bg-slate-900/90 border-slate-800' : 'bg-white border-amber-200/80 shadow-amber-500/10'
          }`}>

          {/* Header Title & Switch Tabs */}
          <div className="text-center space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-amber-500/15 text-amber-700 dark:text-amber-300 border border-amber-500/30 rounded-full text-[10px] font-bold uppercase tracking-wider">
              ● CANDIDATE PORTAL ACCESS
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">
              Create Candidate Account
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {redirectUrl
                ? 'Create your account to proceed directly with your job application'
                : 'Sign up to apply for open roles and track your hiring status'}
            </p>
          </div>

          {/* Toggle Tab */}
          <div className="grid grid-cols-2 p-1 rounded-2xl bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs font-bold">
            <span className="py-2.5 text-center rounded-xl bg-amber-500 text-slate-950 shadow-md">
              Create Account
            </span>
            <Link
              to={`/login${redirectUrl ? `?redirect=${encodeURIComponent(redirectUrl)}` : ''}`}
              className="py-2.5 text-center text-slate-600 dark:text-slate-400 hover:text-amber-500 transition-colors rounded-xl flex items-center justify-center"
            >
              Sign In
            </Link>
          </div>

          {error && (
            <div className="p-3.5 rounded-2xl bg-red-500/10 border border-red-500/30 text-red-600 dark:text-red-400 text-xs font-bold flex items-center gap-2">
              <span>⚠️</span>
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={labelClass}>First Name *</label>
                <input
                  type="text"
                  name="firstName"
                  required
                  value={formData.firstName}
                  onChange={handleChange}
                  placeholder="e.g. Rahul"
                  className={inputClass}
                />
              </div>
              <div>
                <label className={labelClass}>Last Name</label>
                <input
                  type="text"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleChange}
                  placeholder="e.g. Sharma"
                  className={inputClass}
                />
              </div>
            </div>

            <div>
              <label className={labelClass}>Email Address *</label>
              <input
                type="email"
                name="email"
                required
                value={formData.email}
                onChange={handleChange}
                placeholder="rahul.sharma@example.com"
                className={inputClass}
              />
            </div>

            <div>
              <label className={labelClass}>Mobile Number</label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="+91 98765 43210"
                className={inputClass}
              />
            </div>

            <div>
              <label className={labelClass}>Create Password *</label>
              <input
                type="password"
                name="password"
                required
                minLength={6}
                value={formData.password}
                onChange={handleChange}
                placeholder="Min. 6 characters"
                className={inputClass}
              />
            </div>

            <div>
              <label className={labelClass}>Confirm Password *</label>
              <input
                type="password"
                name="confirmPassword"
                required
                minLength={6}
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder="Re-enter password"
                className={inputClass}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 rounded-2xl text-xs font-bold text-slate-950 bg-gradient-to-r from-amber-400 via-amber-500 to-orange-500 hover:from-amber-300 hover:to-orange-400 transition-all shadow-xl shadow-amber-500/25 uppercase tracking-wider cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2 hover:scale-[1.01] active:scale-[0.99]"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                  <span>Creating Account...</span>
                </>
              ) : (
                <>
                  <span>
                    {redirectUrl ? 'Create Account & Continue to Apply →' : 'Register Candidate Account →'}
                  </span>
                </>
              )}
            </button>
          </form>

          <p className="text-[11px] text-center text-slate-500 dark:text-slate-400">
            By signing up, you agree to Adyapan’s{' '}
            <Link to="/terms" className="underline hover:text-amber-500">Terms of Service</Link>{' '}
            and{' '}
            <Link to="/privacy" className="underline hover:text-amber-500">Privacy Policy</Link>.
          </p>
        </div>
      </main>

      <Footer isPublic={true} />

    </div>
  );
};

export default CandidateRegister;
