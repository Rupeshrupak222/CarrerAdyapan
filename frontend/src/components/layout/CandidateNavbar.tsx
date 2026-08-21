import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import AdyapanLogo from '../common/AdyapanLogo';
import { useTheme } from '../../context/ThemeContext';
import { useCandidateAuth } from '../../context/CandidateAuthContext';

interface NavLinkItem {
  label: string;
  path: string;
  key: string;
  icon: string;
  isHash?: boolean;
}

interface CandidateNavbarProps {
  activePage?: 'careers' | 'jobs' | 'about' | 'applications' | 'contact' | 'login' | 'register' | string;
}

const CandidateNavbar: React.FC<CandidateNavbarProps> = ({ activePage }) => {
  const { theme, toggleTheme } = useTheme();
  const { candidate, logout } = useCandidateAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);

  const profileDropdownRef = useRef<HTMLDivElement>(null);
  const drawerRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent | TouchEvent) => {
      if (profileDropdownRef.current && !profileDropdownRef.current.contains(e.target as Node)) {
        setShowProfileDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    document.addEventListener('touchstart', handleOutsideClick);
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
      document.removeEventListener('touchstart', handleOutsideClick);
    };
  }, []);

  // Close drawer on route changes or ESC key
  useEffect(() => {
    setMobileDrawerOpen(false);
    setShowProfileDropdown(false);
  }, [location.pathname, location.hash]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setMobileDrawerOpen(false);
        setShowProfileDropdown(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Lock body scroll when mobile drawer is open
  useEffect(() => {
    if (mobileDrawerOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [mobileDrawerOpen]);

  const navLinks: NavLinkItem[] = [
    { label: 'Jobs', path: '/open-positions', key: 'jobs', icon: '💼' },
    { label: 'Life at Adyapan', path: '/life-at-adyapan', key: 'life', icon: '🌟' },
    { label: 'About Us', path: '/about', key: 'about', icon: '📖' },
    { label: 'Contact', path: '/contact', key: 'contact', icon: '📞' },
  ];

  const isLinkActive = (link: NavLinkItem) => {
    if (activePage && activePage === link.key) return true;
    if (link.isHash) {
      return location.pathname === '/careers' && location.hash === link.path.replace('/careers', '');
    }
    return location.pathname === link.path;
  };

  const handleNavClick = (path: string, isHash?: boolean) => {
    setMobileDrawerOpen(false);
    if (isHash) {
      if (location.pathname !== '/careers') {
        navigate(path);
      } else {
        const hashTarget = path.split('#')[1];
        const elem = document.getElementById(hashTarget);
        if (elem) {
          const navOffset = 80;
          const elementPosition = elem.getBoundingClientRect().top;
          const offsetPosition = elementPosition + window.pageYOffset - navOffset;
          window.scrollTo({ top: offsetPosition, behavior: 'smooth' });
          window.history.pushState(null, '', path);
        }
      }
    }
  };

  return (
    <>
      <header
        className={`sticky top-0 z-40 w-full border-b backdrop-blur-xl transition-all duration-200 select-none ${
          theme === 'dark'
            ? 'bg-[#0a0a1a]/90 border-slate-800 text-white shadow-lg shadow-black/20'
            : 'bg-white/90 border-amber-200/50 text-slate-900 shadow-sm'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 sm:h-20 flex items-center justify-between gap-4">
          
          {/* Left: Brand Logo */}
          <Link
            to="/careers"
            className="flex items-center gap-2.5 shrink-0 focus:outline-none"
            aria-label="Adyapan Careers Home"
          >
            <AdyapanLogo variant={theme === 'dark' ? 'dark' : 'light'} size="small" />
          </Link>

          {/* Center: Desktop Navigation Links (Hidden on < lg screens) */}
          <nav className="hidden lg:flex items-center gap-6 xl:gap-8 text-sm font-semibold tracking-tight">
            {navLinks.map((link) => {
              const active = isLinkActive(link);
              return link.isHash ? (
                <a
                  key={link.key}
                  href={link.path}
                  onClick={(e) => {
                    e.preventDefault();
                    handleNavClick(link.path, true);
                  }}
                  className={`transition-colors py-1 relative ${
                    active
                      ? 'text-amber-500 font-extrabold'
                      : theme === 'dark'
                      ? 'text-slate-300 hover:text-amber-400'
                      : 'text-slate-700 hover:text-amber-600'
                  }`}
                >
                  {link.label}
                  {active && (
                    <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-amber-400 to-orange-500 rounded-full" />
                  )}
                </a>
              ) : (
                <Link
                  key={link.key}
                  to={link.path}
                  className={`transition-colors py-1 relative ${
                    active
                      ? 'text-amber-500 font-extrabold'
                      : theme === 'dark'
                      ? 'text-slate-300 hover:text-amber-400'
                      : 'text-slate-700 hover:text-amber-600'
                  }`}
                >
                  {link.label}
                  {active && (
                    <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-amber-400 to-orange-500 rounded-full" />
                  )}
                </Link>
              );
            })}

            {/* Candidate Applications tracker link (Desktop) */}
            {candidate && (
              <Link
                to="/my-applications"
                className={`transition-colors py-1 relative flex items-center gap-1.5 ${
                  activePage === 'applications' || location.pathname === '/my-applications'
                    ? 'text-amber-500 font-extrabold'
                    : theme === 'dark'
                    ? 'text-amber-400 font-bold hover:text-amber-300'
                    : 'text-amber-600 font-bold hover:text-amber-700'
                }`}
              >
                <span>My Applications</span>
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              </Link>
            )}
          </nav>

          {/* Right: Theme Toggle, Candidate Auth Badge & Mobile Hamburger Button */}
          <div className="flex items-center gap-2.5 sm:gap-3">
            
            {/* Theme Toggle Button */}
            <button
              onClick={toggleTheme}
              className={`p-2 sm:p-2.5 rounded-xl border transition-all hover:scale-105 active:scale-95 cursor-pointer ${
                theme === 'dark'
                  ? 'bg-slate-900 text-amber-300 border-slate-800 hover:bg-slate-800'
                  : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100 shadow-sm'
              }`}
              aria-label="Toggle theme mode"
              title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            >
              {theme === 'dark' ? (
                <svg className="w-4 h-4 text-amber-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              ) : (
                <svg className="w-4 h-4 text-slate-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                </svg>
              )}
            </button>

            {/* Desktop Candidate Auth (Hidden on small mobile if drawer is preferred, or compact) */}
            {candidate ? (
              <div ref={profileDropdownRef} className="relative hidden sm:block">
                <button
                  onClick={() => setShowProfileDropdown(!showProfileDropdown)}
                  className={`flex items-center gap-2 p-1.5 pr-3 rounded-full border transition-all cursor-pointer hover:scale-105 active:scale-95 ${
                    theme === 'dark'
                      ? 'bg-slate-900 border-slate-700 hover:border-amber-500/60'
                      : 'bg-white border-amber-200/80 hover:border-amber-400 shadow-sm'
                  }`}
                >
                  <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-gradient-to-tr from-amber-500 to-orange-500 text-slate-950 font-black text-xs flex items-center justify-center shadow-md">
                    {candidate.firstName?.[0]?.toUpperCase() || 'C'}
                  </div>
                  <span className="text-xs font-bold max-w-[110px] truncate text-slate-800 dark:text-slate-200">
                    {candidate.firstName}
                  </span>
                  <svg className="w-3.5 h-3.5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {/* Profile Dropdown Menu */}
                {showProfileDropdown && (
                  <div
                    className={`absolute right-0 mt-2 w-64 rounded-2xl border shadow-2xl p-4 space-y-3 z-50 animate-in fade-in slide-in-from-top-2 duration-150 ${
                      theme === 'dark'
                        ? 'bg-slate-900 border-slate-700 text-white'
                        : 'bg-white border-slate-200 text-slate-900'
                    }`}
                  >
                    <div className="border-b pb-3 border-slate-100 dark:border-slate-800">
                      <p className="text-[10px] font-black text-amber-500 uppercase tracking-widest">
                        Candidate Account
                      </p>
                      <p className="text-sm font-extrabold truncate mt-0.5">
                        {candidate.firstName} {candidate.lastName}
                      </p>
                      <p className="text-xs text-slate-500 truncate">{candidate.email}</p>
                    </div>

                    <div className="space-y-1 text-xs font-bold">
                      <Link
                        to="/my-applications"
                        onClick={() => setShowProfileDropdown(false)}
                        className="w-full text-left p-2.5 rounded-xl hover:bg-amber-500/10 hover:text-amber-500 transition-colors flex items-center gap-2.5"
                      >
                        <svg className="w-4 h-4 text-amber-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        <span>My Applications</span>
                      </Link>
                      <Link
                        to="/open-positions"
                        onClick={() => setShowProfileDropdown(false)}
                        className="w-full text-left p-2.5 rounded-xl hover:bg-amber-500/10 hover:text-amber-500 transition-colors flex items-center gap-2.5"
                      >
                        <svg className="w-4 h-4 text-amber-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
                        <span>Browse Open Jobs</span>
                      </Link>
                    </div>

                    <div className="border-t pt-2 border-slate-100 dark:border-slate-800">
                      <button
                        onClick={() => {
                          logout();
                          setShowProfileDropdown(false);
                        }}
                        className="w-full py-2 px-3 text-xs font-extrabold text-red-500 hover:bg-red-50 dark:hover:bg-red-950/40 rounded-xl transition-all flex items-center justify-between cursor-pointer"
                      >
                        <span>Sign Out</span>
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                        </svg>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="hidden sm:flex items-center">
                <Link
                  to="/login"
                  className="px-5 py-2 text-xs font-black text-slate-950 bg-gradient-to-r from-amber-400 via-amber-500 to-orange-500 hover:from-amber-300 hover:to-orange-400 rounded-xl transition-all shadow-md shadow-amber-500/20 uppercase tracking-wider hover:scale-105 active:scale-95 cursor-pointer"
                >
                  Sign In
                </Link>
              </div>
            )}

            {/* Mobile Hamburger Drawer Toggle Button (Visible on < lg screens) */}
            <button
              onClick={() => setMobileDrawerOpen(!mobileDrawerOpen)}
              className={`p-2 sm:p-2.5 rounded-xl lg:hidden border transition-all active:scale-95 cursor-pointer ${
                mobileDrawerOpen
                  ? 'bg-amber-500 text-slate-950 border-amber-500 shadow-md shadow-amber-500/30'
                  : theme === 'dark'
                  ? 'bg-slate-900 text-amber-400 border-slate-800 hover:bg-slate-800'
                  : 'bg-slate-50 text-slate-800 border-slate-200 hover:bg-slate-100 shadow-sm'
              }`}
              aria-label={mobileDrawerOpen ? 'Close Navigation Menu' : 'Open Navigation Menu'}
              aria-expanded={mobileDrawerOpen}
            >
              {mobileDrawerOpen ? (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </button>

          </div>

        </div>
      </header>

      {/* ===== MOBILE SLIDING SIDEBAR DRAWER & BACKDROP ===== */}
      {mobileDrawerOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          
          {/* Dark Glassmorphic Backdrop */}
          <div
            onClick={() => setMobileDrawerOpen(false)}
            className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm transition-opacity animate-in fade-in duration-200"
            aria-hidden="true"
          />

          {/* Slide-out Drawer Panel from Right */}
          <aside
            ref={drawerRef}
            className={`fixed top-0 right-0 bottom-0 w-[85vw] max-w-sm flex flex-col justify-between shadow-2xl border-l z-50 transition-transform duration-300 animate-in slide-in-from-right duration-300 ${
              theme === 'dark'
                ? 'bg-[#0e0e1f] border-slate-800 text-white'
                : 'bg-white border-amber-200/80 text-slate-900'
            }`}
          >
            
            {/* Top Drawer Header */}
            <div
              className={`p-5 flex items-center justify-between border-b ${
                theme === 'dark' ? 'border-slate-800 bg-[#080816]' : 'border-amber-100 bg-amber-50/40'
              }`}
            >
              <div className="flex items-center gap-2">
                <AdyapanLogo variant={theme === 'dark' ? 'dark' : 'light'} size="small" />
              </div>

              <button
                onClick={() => setMobileDrawerOpen(false)}
                className={`p-2 rounded-xl border transition-all cursor-pointer ${
                  theme === 'dark'
                    ? 'bg-slate-900 border-slate-700 text-slate-300 hover:text-white'
                    : 'bg-white border-slate-200 text-slate-700 hover:text-slate-950 shadow-sm'
                }`}
                aria-label="Close menu"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Middle: Navigation Links & Mobile Options */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4 no-scrollbar">
              
              {/* Candidate Info Card if Logged In */}
              {candidate ? (
                <div
                  className={`p-4 rounded-2xl border space-y-2.5 ${
                    theme === 'dark'
                      ? 'bg-slate-900/80 border-amber-500/30'
                      : 'bg-amber-50/60 border-amber-200'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-amber-500 to-orange-500 text-slate-950 font-black text-sm flex items-center justify-center shadow-md shrink-0">
                      {candidate.firstName?.[0]?.toUpperCase() || 'C'}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-[10px] font-black text-amber-500 uppercase tracking-wider">
                        Candidate Account
                      </p>
                      <p className="text-sm font-extrabold truncate text-slate-900 dark:text-white">
                        {candidate.firstName} {candidate.lastName}
                      </p>
                      <p className="text-[11px] text-slate-500 truncate">{candidate.email}</p>
                    </div>
                  </div>

                  <Link
                    to="/my-applications"
                    onClick={() => setMobileDrawerOpen(false)}
                    className="w-full py-2 px-3 rounded-xl bg-amber-500 text-slate-950 font-black text-xs flex items-center justify-between shadow-sm"
                  >
                    <span>Track My Applications</span>
                    <span>→</span>
                  </Link>
                </div>
              ) : (
                <div className="pb-2">
                  <Link
                    to="/login"
                    onClick={() => setMobileDrawerOpen(false)}
                    className="w-full block py-3 px-4 rounded-xl text-xs font-black text-slate-950 text-center bg-gradient-to-r from-amber-400 to-orange-500 shadow-md shadow-amber-500/20 uppercase tracking-wider"
                  >
                    Sign In
                  </Link>
                </div>
              )}

              {/* Navigation Options List */}
              <div className="space-y-1 pt-1">
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-3 pb-1">
                  Explore Adyapan
                </p>

                {navLinks.map((link) => {
                  const active = isLinkActive(link);
                  return link.isHash ? (
                    <a
                      key={link.key}
                      href={link.path}
                      onClick={(e) => {
                        e.preventDefault();
                        handleNavClick(link.path, true);
                      }}
                      className={`flex items-center gap-3.5 px-3.5 py-3 rounded-2xl text-sm font-bold transition-all ${
                        active
                          ? 'bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30'
                          : theme === 'dark'
                          ? 'text-slate-300 hover:bg-slate-900 hover:text-amber-400'
                          : 'text-slate-700 hover:bg-amber-50 hover:text-amber-700'
                      }`}
                    >
                      <span className="text-base">{link.icon}</span>
                      <span>{link.label}</span>
                    </a>
                  ) : (
                    <Link
                      key={link.key}
                      to={link.path}
                      onClick={() => setMobileDrawerOpen(false)}
                      className={`flex items-center gap-3.5 px-3.5 py-3 rounded-2xl text-sm font-bold transition-all ${
                        active
                          ? 'bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30'
                          : theme === 'dark'
                          ? 'text-slate-300 hover:bg-slate-900 hover:text-amber-400'
                          : 'text-slate-700 hover:bg-amber-50 hover:text-amber-700'
                      }`}
                    >
                      <span className="text-base">{link.icon}</span>
                      <span>{link.label}</span>
                    </Link>
                  );
                })}

                {/* Direct link to My Applications in drawer */}
                <Link
                  to={candidate ? '/my-applications' : '/login?redirect=/my-applications'}
                  onClick={() => setMobileDrawerOpen(false)}
                  className={`flex items-center justify-between px-3.5 py-3 rounded-2xl text-sm font-extrabold transition-all ${
                    activePage === 'applications' || location.pathname === '/my-applications'
                      ? 'bg-amber-500 text-slate-950 font-black shadow-md'
                      : theme === 'dark'
                      ? 'text-amber-400 hover:bg-slate-900'
                      : 'text-amber-600 hover:bg-amber-50'
                  }`}
                >
                  <div className="flex items-center gap-3.5">
                    <span className="text-base">📋</span>
                    <span>My Applications</span>
                  </div>
                  <span className="text-xs">→</span>
                </Link>
              </div>

            </div>

            {/* Bottom Drawer Footer: Mode Toggle & Logout */}
            <div
              className={`p-4 border-t space-y-3 ${
                theme === 'dark' ? 'border-slate-800 bg-[#080816]' : 'border-slate-200 bg-slate-50'
              }`}
            >
              {/* Theme toggle row */}
              <div className="flex items-center justify-between px-2 text-xs font-bold text-slate-500 dark:text-slate-400">
                <span>Color Theme</span>
                <button
                  onClick={toggleTheme}
                  className="px-3 py-1.5 rounded-xl border font-extrabold text-xs flex items-center gap-1.5 cursor-pointer"
                  style={
                    theme === 'dark'
                      ? { background: 'rgba(245, 158, 11, 0.15)', color: '#f59e0b', borderColor: 'rgba(245, 158, 11, 0.3)' }
                      : { background: '#ffffff', color: '#1e293b', borderColor: '#cbd5e1' }
                  }
                >
                  {theme === 'dark' ? '🌙 Dark Mode' : '☀️ Light Mode'}
                </button>
              </div>

              {/* Sign out button if logged in */}
              {candidate && (
                <button
                  onClick={() => {
                    logout();
                    setMobileDrawerOpen(false);
                  }}
                  className="w-full py-2.5 px-3 text-xs font-black text-red-500 hover:bg-red-500/10 rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer border border-red-500/20"
                >
                  <span>Sign Out</span>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                </button>
              )}
            </div>

          </aside>
        </div>
      )}
    </>
  );
};

export default CandidateNavbar;
