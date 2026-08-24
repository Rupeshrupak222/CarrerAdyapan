import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { ArrowRight, Lock, Mail, User, Phone, CheckCircle2, AlertCircle, Eye, EyeOff } from 'lucide-react';
import logo from '../assets/adyapan-logo.png';
import api from '../services/api';
import toast from 'react-hot-toast';
import { useCandidateAuth } from '../context/CandidateAuthContext';
import { useAuth } from '../context/AuthContext';

const AuthPage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const params = new URLSearchParams(location.search);
  const isSignup = params.get('mode') === 'signup';
  const redirectUrl = params.get('redirect') || '';

  const { register: registerCandidate, login: loginCandidate } = useCandidateAuth();
  const { login: loginAdmin } = useAuth();

  const [showPassword, setShowPassword] = useState(false);
  const [reveal, setReveal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [rememberMe, setRememberMe] = useState(true);

  // Form State
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    password: '',
    agreeTerms: true,
  });

  useEffect(() => {
    const isMobile = typeof window !== 'undefined' && window.innerWidth <= 768;
    const timer = window.setTimeout(() => setReveal(true), isMobile ? 350 : 1500);
    return () => window.clearTimeout(timer);
  }, []);

  const handleSceneClick = () => {
    if (!reveal) setReveal(true);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError('');
  };

  const goBack = () => {
    if (window.history.length > 1) {
      navigate(-1);
    } else {
      navigate('/');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const emailTrimmed = formData.email.trim().toLowerCase();

    if (!emailTrimmed || !formData.password.trim()) {
      setError('Please enter your email and password.');
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

      try {
        const nameParts = formData.fullName.trim().split(' ');
        const firstName = nameParts[0];
        const lastName = nameParts.slice(1).join(' ') || '';

        const res = await registerCandidate({
          firstName,
          lastName,
          email: emailTrimmed,
          password: formData.password,
          phone: formData.phone.trim(),
        });

        if (res.success) {
          toast.success('Account created successfully!');
          if (redirectUrl) {
            navigate(redirectUrl);
          } else {
            navigate('/my-applications');
          }
        } else {
          setError(res.error || 'Failed to create account. Please try again.');
        }
      } catch (err: any) {
        const msg = err.response?.data?.message || 'Failed to create account. Please try again.';
        setError(msg);
      } finally {
        setLoading(false);
      }
      return;
    }

    // SIGN IN FLOW
    try {
      const response = await api.post('/auth/login', {
        email: emailTrimmed,
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
          // Admin / Recruiter
          localStorage.setItem('token', data.token);
          localStorage.setItem(
            'user',
            JSON.stringify(
              data.user || {
                id: 'admin-1',
                email: emailTrimmed,
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
  };

  return (
    <div
      className={`auth-scene ${isSignup ? 'auth-signup' : 'auth-signin'} ${reveal ? 'auth-revealed' : ''}`}
      onClick={handleSceneClick}
    >
      <div className="auth-stars" aria-hidden="true" />
      <div className="auth-haze" aria-hidden="true" />

      {/* Brand Top Left */}
      <Link to="/" className="auth-scene-brand" aria-label="Adyapan Hiring home">
        <img src={logo} alt="Adyapan" />
        <span>
          Adyapan <b>Hiring</b>
        </span>
      </Link>

      {/* Back Button Top Right */}
      <button type="button" className="auth-back" onClick={goBack} aria-label="Go back to previous page">
        <span aria-hidden="true">←</span> Go back
      </button>

      {/* Animated Lighthouse Area */}
      <div className="auth-lighthouse-area" aria-hidden="true">
        <div className="auth-beam auth-beam-1" />
        <div className="auth-beam auth-beam-2" />
        <div className="auth-beam auth-beam-3" />
        <div className="auth-lamp-glow" />

        <div className="auth-lighthouse">
          <div className="auth-spire" />
          <div className="auth-dome" />
          <div className="auth-lantern">
            <span className="lantern-frame f1" />
            <span className="lantern-frame f2" />
            <span className="lantern-frame f3" />
            <span className="lantern-frame f4" />
            <span className="lantern-glass" />
            <span className="lantern-fire" />
          </div>
          <div className="auth-gallery-roof" />
          <div className="auth-gallery-deck" />
          <div className="auth-gallery-rail rail-back" />
          <div className="auth-gallery-rail rail-front" />

          <div className="auth-tower">
            <i className="tower-band band-light" />
            <i className="tower-band band-dark" />
            <i className="tower-band band-light" />
            <i className="tower-band band-dark" />
            <i className="tower-band band-light" />
            <span className="tower-window w1" />
            <span className="tower-window w2" />
            <span className="tower-window w3" />
          </div>
          <div className="auth-door" />
          <div className="auth-ground" />
          <div className="auth-water" />
        </div>
      </div>

      {/* Auth Card Container */}
      <div className="auth-card-wrap">
        <div className="auth-card-glow" />
        <div className="auth-card">
          <div className="auth-card-top">
            <span className="auth-mini-label">{isSignup ? 'CREATE PROFILE' : 'MEMBER ACCESS'}</span>
            <button type="button" className="auth-close" onClick={goBack} aria-label="Go back">
              ×
            </button>
          </div>

          <div className="auth-card-heading">
            <h2>
              {isSignup ? (
                <>
                  Create your
                  <br />
                  <span>Adyapan account.</span>
                </>
              ) : (
                <>
                  Welcome
                  <br />
                  <span>back.</span>
                </>
              )}
            </h2>
            <p>
              {isSignup
                ? 'Your next opportunity is closer than you think.'
                : 'Sign in to continue your journey.'}
            </p>
          </div>

          {error && (
            <div className="mb-4 p-3 rounded-xl bg-red-500/15 border border-red-500/30 text-red-300 text-xs font-semibold flex items-center gap-2">
              <AlertCircle size={15} className="text-red-400 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            {isSignup && (
              <label>
                FULL NAME
                <input
                  required
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleChange}
                  placeholder="Your full name"
                  disabled={loading}
                />
              </label>
            )}

            <label>
              EMAIL ADDRESS
              <input
                required
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="you@example.com"
                disabled={loading}
              />
            </label>

            {isSignup && (
              <label>
                PHONE NUMBER
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="+91 98765 43210 (Optional)"
                  disabled={loading}
                />
              </label>
            )}

            <label>
              PASSWORD
              <div className="auth-password">
                <input
                  required
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Enter your password"
                  disabled={loading}
                />
                <button type="button" onClick={() => setShowPassword((v) => !v)} tabIndex={-1}>
                  {showPassword ? 'Hide' : 'Show'}
                </button>
              </div>
            </label>

            {!isSignup && (
              <div className="auth-form-row">
                <label className="auth-check">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                  />
                  <span>Remember me</span>
                </label>
                <a href="mailto:support@adyapan.com?subject=Password%20Reset%20Request" className="auth-forgot">
                  Forgot password?
                </a>
              </div>
            )}

            {isSignup && (
              <label className="auth-check">
                <input
                  type="checkbox"
                  required
                  checked={formData.agreeTerms}
                  onChange={(e) => setFormData({ ...formData, agreeTerms: e.target.checked })}
                />
                <span>I agree to the terms and privacy policy.</span>
              </label>
            )}

            <button className="auth-submit" type="submit" disabled={loading}>
              <span>{loading ? 'Processing...' : isSignup ? 'Create account' : 'Sign in'}</span>
              <ArrowRight size={17} />
            </button>
          </form>

          <div className="auth-switch-dark">
            {isSignup ? (
              <>
                Already have an account?{' '}
                <Link to={redirectUrl ? `/auth?mode=signin&redirect=${encodeURIComponent(redirectUrl)}` : '/auth?mode=signin'}>
                  Sign in
                </Link>
              </>
            ) : (
              <>
                New here?{' '}
                <Link to={redirectUrl ? `/auth?mode=signup&redirect=${encodeURIComponent(redirectUrl)}` : '/auth?mode=signup'}>
                  Create an account
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;
