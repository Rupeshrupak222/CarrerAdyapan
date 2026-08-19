import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCandidateAuth } from '../context/CandidateAuthContext';
import { useTheme } from '../context/ThemeContext';
import AdyapanLogo from '../components/common/AdyapanLogo';

const CandidateRegister = () => {
  const { register, loading } = useCandidateAuth();
  const { theme } = useTheme();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: ''
  });
  const [error, setError] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!formData.firstName || !formData.email || !formData.password) {
      setError('Please fill in all required fields');
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
      firstName: formData.firstName,
      lastName: formData.lastName,
      email: formData.email,
      password: formData.password,
      phone: formData.phone
    });

    if (result.success) {
      navigate('/my-applications');
    } else {
      setError(result.error || 'Registration failed');
    }
  };

  return (
    <div className={`min-h-screen flex flex-col font-sans antialiased transition-colors ${theme === 'dark' ? 'bg-slate-950 text-white' : 'bg-slate-50 text-slate-900'}`}>
      
      {/* Minimal Header */}
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

      {/* Registration Form */}
      <div className="flex-1 flex items-center justify-center px-4 py-12">
        <div className={`w-full max-w-md p-8 rounded-2xl border shadow-xl ${theme === 'dark' ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
          
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold mb-2">Create Your Account</h1>
            <p className={`text-sm ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>
              Sign up to apply for jobs and track your applications
            </p>
          </div>

          {error && (
            <div className="mb-6 p-3 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={`block text-xs font-semibold mb-1.5 ${theme === 'dark' ? 'text-slate-300' : 'text-slate-700'}`}>
                  First Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleChange}
                  placeholder="John"
                  className={`w-full px-4 py-2.5 rounded-xl text-sm border focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500 transition-all ${theme === 'dark' ? 'bg-slate-800 border-slate-700 text-white placeholder-slate-500' : 'bg-slate-50 border-slate-200 text-slate-900 placeholder-slate-400'}`}
                  required
                />
              </div>
              <div>
                <label className={`block text-xs font-semibold mb-1.5 ${theme === 'dark' ? 'text-slate-300' : 'text-slate-700'}`}>
                  Last Name
                </label>
                <input
                  type="text"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleChange}
                  placeholder="Doe"
                  className={`w-full px-4 py-2.5 rounded-xl text-sm border focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500 transition-all ${theme === 'dark' ? 'bg-slate-800 border-slate-700 text-white placeholder-slate-500' : 'bg-slate-50 border-slate-200 text-slate-900 placeholder-slate-400'}`}
                />
              </div>
            </div>

            <div>
              <label className={`block text-xs font-semibold mb-1.5 ${theme === 'dark' ? 'text-slate-300' : 'text-slate-700'}`}>
                Email Address <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="john@example.com"
                className={`w-full px-4 py-2.5 rounded-xl text-sm border focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500 transition-all ${theme === 'dark' ? 'bg-slate-800 border-slate-700 text-white placeholder-slate-500' : 'bg-slate-50 border-slate-200 text-slate-900 placeholder-slate-400'}`}
                required
              />
            </div>

            <div>
              <label className={`block text-xs font-semibold mb-1.5 ${theme === 'dark' ? 'text-slate-300' : 'text-slate-700'}`}>
                Phone Number
              </label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="+91 98765-43210"
                className={`w-full px-4 py-2.5 rounded-xl text-sm border focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500 transition-all ${theme === 'dark' ? 'bg-slate-800 border-slate-700 text-white placeholder-slate-500' : 'bg-slate-50 border-slate-200 text-slate-900 placeholder-slate-400'}`}
              />
            </div>

            <div>
              <label className={`block text-xs font-semibold mb-1.5 ${theme === 'dark' ? 'text-slate-300' : 'text-slate-700'}`}>
                Password <span className="text-red-500">*</span>
              </label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Min. 6 characters"
                className={`w-full px-4 py-2.5 rounded-xl text-sm border focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500 transition-all ${theme === 'dark' ? 'bg-slate-800 border-slate-700 text-white placeholder-slate-500' : 'bg-slate-50 border-slate-200 text-slate-900 placeholder-slate-400'}`}
                required
              />
            </div>

            <div>
              <label className={`block text-xs font-semibold mb-1.5 ${theme === 'dark' ? 'text-slate-300' : 'text-slate-700'}`}>
                Confirm Password <span className="text-red-500">*</span>
              </label>
              <input
                type="password"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder="Re-enter password"
                className={`w-full px-4 py-2.5 rounded-xl text-sm border focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500 transition-all ${theme === 'dark' ? 'bg-slate-800 border-slate-700 text-white placeholder-slate-500' : 'bg-slate-50 border-slate-200 text-slate-900 placeholder-slate-400'}`}
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 mt-2 rounded-xl text-sm font-bold text-white bg-amber-500 hover:bg-amber-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-amber-500/20"
            >
              {loading ? 'Creating Account...' : 'Create Account'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className={`text-sm ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>
              Already have an account?{' '}
              <Link to="/login" className="text-amber-500 font-semibold hover:text-amber-600 transition-colors">
                Sign In
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CandidateRegister;
