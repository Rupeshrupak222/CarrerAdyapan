import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  ArrowRight,
  CheckCircle2,
  Sparkles,
  Heart,
  Eye,
  EyeOff,
  BriefcaseBusiness,
  Lock,
  Mail,
  User,
  Phone,
} from 'lucide-react';
import logo from '../assets/adyapan-logo.png';
import { useCandidateAuth } from '../context/CandidateAuthContext';
import api from '../services/api';
import toast from 'react-hot-toast';

const AuthPage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const params = new URLSearchParams(location.search);
  const isSignup = params.get('mode') !== 'signin';
  const redirectUrl = params.get('redirect') || '';

  const { register: registerCandidate } = useCandidateAuth();

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Form State
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    password: '',
    agreeTerms: true,
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (!formData.email.trim() || !formData.password.trim()) {
      setError('Please fill in email and password.');
      setLoading(false);
      return;
    }

    if (isSignup) {
      if (!formData.fullName.trim()) {
        setError('Please enter your full name.');
        setLoading(false);
        return;
      }
      if (formData.password.length < 6) {
        setError('Password must be at least 6 characters.');
        setLoading(false);
        return;
      }

      const nameParts = formData.fullName.trim().split(' ');
      const firstName = nameParts[0];
      const lastName = nameParts.slice(1).join(' ') || '';

      const res = await registerCandidate({
        firstName,
        lastName,
        email: formData.email.trim().toLowerCase(),
        password: formData.password,
        phone: formData.phone.trim(),
      });

      setLoading(false);
      if (res.success) {
        toast.success('Account created successfully!');
        if (redirectUrl) {
          navigate(redirectUrl);
        } else {
          navigate('/my-applications');
        }
      } else {
        setError(res.error || 'Failed to create account.');
      }
    } else {
      // Sign In Flow
      try {
        const response = await api.post('/auth/login', {
          email: formData.email.trim().toLowerCase(),
          password: formData.password,
        });
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
            localStorage.setItem(
              'user',
              JSON.stringify(
                data.user || {
                  id: 'admin-1',
                  email: formData.email.trim().toLowerCase(),
                  name: 'Recruiter Admin',
                  role: 'ADMIN',
                }
              )
            );
            toast.success('Welcome back, Admin!');
            window.location.href = '/dashboard';
          }
        } else {
          setError(data.message || 'Invalid email or password.');
        }
      } catch (err: any) {
        console.error('Login error:', err);
        const msg = err.response?.data?.message || 'Invalid email or password. Please try again.';
        setError(msg);
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <div className="min-h-screen grid grid-cols-1 lg:grid-cols-12 bg-[#090806] text-white">
      {/* Left Column: Visual Brand Experience */}
      <div className="relative hidden lg:flex lg:col-span-6 xl:col-span-7 flex-col justify-between p-12 overflow-hidden">
        {/* Background Image with Deep Overlay */}
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage:
              'url("https://images.unsplash.com/photo-1556761175-b413da4baf72?auto=format&fit=crop&w=1800&q=90")',
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[#090806] via-[#090806]/80 to-[#090806]/30" />

        {/* Brand Top */}
        <div className="relative z-10">
          <Link to="/" className="inline-flex items-center gap-3">
            <img src={logo} alt="Adyapan Logo" className="w-12 h-12 rounded-full object-contain bg-white/10 p-1" />
            <span className="text-xl font-black tracking-tight">
              Adyapan <span className="text-amber-500">Hiring</span>
            </span>
          </Link>
        </div>

        {/* Hero Message Middle */}
        <div className="relative z-10 max-w-xl space-y-4 my-auto py-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-extrabold bg-amber-500/20 text-amber-300 border border-amber-500/40">
            <Sparkles className="w-3.5 h-3.5" />
            YOUR NEXT OPPORTUNITY
          </div>

          <h1 className="text-4xl sm:text-5xl xl:text-6xl font-black tracking-tight leading-tight">
            {isSignup ? (
              <>
                Your skills deserve <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-amber-500 to-orange-500">
                  to be seen.
                </span>
              </>
            ) : (
              <>
                Welcome <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-amber-500 to-orange-500">
                  back.
                </span>
              </>
            )}
          </h1>

          <p className="text-base text-slate-300 leading-relaxed">
            {isSignup
              ? 'Create your candidate profile and discover career opportunities built around your skills, ambition, and real potential.'
              : 'Sign in to manage your applications, review interview schedules, and explore new openings with Adyapan.'}
          </p>
        </div>

        {/* Feature Badges Bottom */}
        <div className="relative z-10 flex flex-wrap gap-3">
          <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold bg-white/10 border border-white/15 backdrop-blur-md">
            <CheckCircle2 className="w-4 h-4 text-amber-400" />
            Simple Applications
          </span>
          <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold bg-white/10 border border-white/15 backdrop-blur-md">
            <Sparkles className="w-4 h-4 text-amber-400" />
            Skills-First ATS Scoring
          </span>
          <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold bg-white/10 border border-white/15 backdrop-blur-md">
            <Heart className="w-4 h-4 text-rose-400" />
            Human-Centered Hiring
          </span>
        </div>
      </div>

      {/* Right Column: Clean Form Container */}
      <div className="lg:col-span-6 xl:col-span-5 flex flex-col justify-center p-6 sm:p-12 lg:p-16 bg-[#14120e]">
        <div className="w-full max-w-md mx-auto space-y-6">
          <Link
            to="/"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-400 hover:text-amber-400 transition-colors mb-2"
          >
            ← Back to Home
          </Link>

          <div className="space-y-2">
            <span className="text-[10px] font-extrabold uppercase tracking-widest text-amber-500">
              {isSignup ? 'CREATE YOUR PROFILE' : 'WELCOME BACK'}
            </span>
            <h2 className="text-3xl font-black tracking-tight text-white">
              {isSignup ? 'Join Adyapan Hiring' : 'Sign in to Adyapan'}
            </h2>
            <p className="text-xs text-slate-400">
              {isSignup ? 'One profile. Unlimited career opportunities.' : 'Continue your career journey.'}
            </p>
          </div>

          {error && (
            <div className="p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs font-semibold">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {isSignup && (
              <>
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-300">Full Name</label>
                  <div className="relative">
                    <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                    <input
                      type="text"
                      name="fullName"
                      value={formData.fullName}
                      onChange={handleChange}
                      required
                      placeholder="e.g. Rahul Sharma"
                      className="w-full pl-10 pr-4 py-3 rounded-xl bg-[#1e1a14] border border-[#332d24] text-white text-sm focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-all placeholder-slate-500"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-300">Phone Number (Optional)</label>
                  <div className="relative">
                    <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      placeholder="+91 98765 43210"
                      className="w-full pl-10 pr-4 py-3 rounded-xl bg-[#1e1a14] border border-[#332d24] text-white text-sm focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-all placeholder-slate-500"
                    />
                  </div>
                </div>
              </>
            )}

            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-300">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  placeholder="you@example.com"
                  className="w-full pl-10 pr-4 py-3 rounded-xl bg-[#1e1a14] border border-[#332d24] text-white text-sm focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-all placeholder-slate-500"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-bold text-slate-300">Password</label>
              </div>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  placeholder="••••••••"
                  className="w-full pl-10 pr-12 py-3 rounded-xl bg-[#1e1a14] border border-[#332d24] text-white text-sm focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-all placeholder-slate-500"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-amber-400 text-xs font-bold"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {isSignup && (
              <label className="flex items-center gap-2 pt-1 text-xs text-slate-400 cursor-pointer select-none">
                <input
                  type="checkbox"
                  name="agreeTerms"
                  checked={formData.agreeTerms}
                  onChange={(e) => setFormData({ ...formData, agreeTerms: e.target.checked })}
                  required
                  className="rounded border-[#332d24] text-amber-500 focus:ring-amber-500 bg-[#1e1a14]"
                />
                <span>I agree to the Terms of Service and Privacy Policy.</span>
              </label>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 rounded-xl font-extrabold text-sm text-slate-950 bg-gradient-to-r from-amber-400 via-amber-500 to-orange-500 hover:from-amber-300 hover:to-orange-400 transition-all shadow-lg shadow-amber-500/25 flex items-center justify-center gap-2 disabled:opacity-60 cursor-pointer"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <span>{isSignup ? 'Create Account' : 'Sign In'}</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          <div className="pt-4 text-center text-xs text-slate-400 border-t border-[#26211a]">
            {isSignup ? (
              <p>
                Already have an account?{' '}
                <Link to="/auth?mode=signin" className="font-bold text-amber-400 hover:underline">
                  Sign in
                </Link>
              </p>
            ) : (
              <p>
                New to Adyapan?{' '}
                <Link to="/auth?mode=signup" className="font-bold text-amber-400 hover:underline">
                  Create an account
                </Link>
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;
