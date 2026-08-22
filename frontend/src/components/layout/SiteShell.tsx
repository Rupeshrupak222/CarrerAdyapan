import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  ArrowRight,
  Briefcase,
  Home,
  Info,
  LogOut,
  Menu,
  Moon,
  Phone,
  Sparkles,
  Sun,
  User,
  X,
} from 'lucide-react';
import logo from '../../assets/adyapan-logo.png';
import { useTheme } from '../../context/ThemeContext';
import { useCandidateAuth } from '../../context/CandidateAuthContext';
import Footer from './Footer';

interface SiteShellProps {
  children: React.ReactNode;
}

const navItems = [
  { path: '/', label: 'Home', icon: Home },
  { path: '/open-positions', label: 'Jobs', icon: Briefcase },
  { path: '/about', label: 'About Us', icon: Info },
  { path: '/life-at-adyapan', label: 'Life at Adyapan', icon: Sparkles },
  { path: '/contact', label: 'Contact Us', icon: Phone },
];

export const SiteShell: React.FC<SiteShellProps> = ({ children }) => {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { theme, toggleTheme } = useTheme();
  const { candidate, logout } = useCandidateAuth();
  const location = useLocation();

  const isDark = theme === 'dark';

  // Handle scroll detection for sticky navbar background & subtle shadow
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 15) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close mobile drawer on route change
  useEffect(() => {
    setOpen(false);
  }, [location.pathname]);

  return (
    <div className={`h-app ${isDark ? 'theme-dark' : ''}`}>
      {/* ── CLEAN EXECUTIVE FIXED NAVBAR (SLIGHTLY BLACK / OBSIDIAN) ── */}
      <header
        className={`sticky top-0 z-50 w-full transition-all duration-300 ${
          scrolled
            ? 'bg-[#181716]/95 dark:bg-[#121110]/95 backdrop-blur-md shadow-md border-b border-stone-800/90 py-3.5'
            : 'bg-[#181716]/90 dark:bg-[#121110]/90 backdrop-blur-sm border-b border-stone-800/70 py-4'
        }`}
      >
        <div className="max-w-[1380px] mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
          {/* Brand Logo & Name */}
          <Link
            className="flex items-center gap-3 group text-decoration-none select-none"
            to="/"
            onClick={() => setOpen(false)}
          >
            <img
              src={logo}
              alt="Adyapan Logo"
              className="w-10 h-10 object-contain rounded-full ring-2 ring-amber-500/30 transition-transform duration-300 group-hover:scale-105"
            />
            <span className="font-extrabold text-xl tracking-tight text-white">
              Adyapan <span className="text-amber-500 font-extrabold">Career</span>
            </span>
          </Link>

          {/* Desktop Center Clean Minimalist Navigation Links */}
          <nav className="hidden md:flex items-center gap-7 lg:gap-9">
            {navItems.map(({ path, label }) => {
              const isActive =
                location.pathname === path ||
                (path !== '/' && location.pathname.startsWith(path));
              return (
                <Link
                  key={path}
                  to={path}
                  className={`text-sm font-semibold transition-all duration-200 relative py-1 hover:text-amber-400 ${
                    isActive
                      ? 'text-amber-400 font-bold'
                      : 'text-stone-300 hover:text-white'
                  }`}
                >
                  {label}
                  {isActive && (
                    <span className="absolute -bottom-1 left-0 right-0 h-0.5 bg-amber-500 rounded-full" />
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Right Action Buttons */}
          <div className="flex items-center gap-3">
            {/* Theme Switcher Button */}
            <button
              onClick={toggleTheme}
              className="w-9 h-9 rounded-xl flex items-center justify-center text-stone-300 hover:text-amber-400 hover:bg-stone-800 transition-colors"
              aria-label={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
              title={isDark ? 'Light Mode' : 'Dark Mode'}
            >
              {isDark ? <Sun size={18} className="text-amber-400" /> : <Moon size={18} />}
            </button>

            {/* Candidate Auth Buttons */}
            {candidate ? (
              <div className="hidden sm:flex items-center gap-2">
                <Link
                  to="/my-applications"
                  className="px-3.5 py-1.5 rounded-xl text-xs font-bold bg-amber-500/15 text-amber-400 border border-amber-500/30 hover:bg-amber-500/25 transition-all flex items-center gap-1.5"
                  title="View My Applications"
                >
                  <User size={14} className="text-amber-400" />
                  <span className="truncate max-w-[120px] text-stone-200">
                    {candidate.firstName || 'Candidate'}
                  </span>
                </Link>
                <button
                  onClick={logout}
                  className="p-2 text-stone-400 hover:text-rose-400 transition-colors"
                  title="Logout"
                  aria-label="Logout"
                >
                  <LogOut size={16} />
                </button>
              </div>
            ) : (
              <div className="hidden sm:flex items-center gap-2.5">
                <Link
                  to="/auth?mode=signin"
                  className="px-3.5 py-1.5 text-xs font-bold text-stone-200 hover:text-white transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  to="/auth?mode=signup"
                  className="px-4 py-2 text-xs font-extrabold rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 shadow-md shadow-amber-500/20 transition-all flex items-center gap-1.5 hover:scale-105 active:scale-95"
                >
                  <span>Sign Up</span>
                  <ArrowRight size={13} />
                </Link>
              </div>
            )}

            {/* Mobile Menu Button */}
            <button
              className="md:hidden w-9 h-9 rounded-xl flex items-center justify-center text-stone-200 hover:bg-stone-800"
              onClick={() => setOpen((v) => !v)}
              aria-label="Toggle Navigation"
            >
              {open ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>

        {/* ── MOBILE SLIDE-DOWN DRAWER ── */}
        {open && (
          <div className="md:hidden border-t border-stone-800 bg-[#181716]/98 dark:bg-[#121110]/98 backdrop-blur-xl px-4 py-5 animate-fadeIn">
            <div className="flex flex-col space-y-1">
              {navItems.map(({ path, label, icon: Icon }) => {
                const isActive =
                  location.pathname === path ||
                  (path !== '/' && location.pathname.startsWith(path));
                return (
                  <Link
                    key={path}
                    to={path}
                    onClick={() => setOpen(false)}
                    className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-colors ${
                      isActive
                        ? 'bg-amber-500/15 text-amber-400 font-bold border border-amber-500/20'
                        : 'text-stone-300 hover:bg-stone-800 hover:text-white'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Icon size={17} className={isActive ? 'text-amber-400' : 'text-stone-400'} />
                      <span>{label}</span>
                    </div>
                    {isActive && <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />}
                  </Link>
                );
              })}
            </div>

            {/* Mobile Auth Actions */}
            <div className="mt-4 pt-4 border-t border-stone-800">
              {candidate ? (
                <div className="space-y-2">
                  <Link
                    to="/my-applications"
                    onClick={() => setOpen(false)}
                    className="w-full py-2.5 px-4 rounded-xl text-xs font-bold bg-amber-500/15 text-amber-400 border border-amber-500/30 flex items-center justify-center gap-2"
                  >
                    <User size={15} />
                    <span>My Applications ({candidate.firstName})</span>
                  </Link>
                  <button
                    onClick={() => {
                      logout();
                      setOpen(false);
                    }}
                    className="w-full py-2 text-xs font-bold text-rose-400 hover:bg-rose-500/10 rounded-xl"
                  >
                    Log Out
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-2">
                  <Link
                    to="/auth?mode=signin"
                    onClick={() => setOpen(false)}
                    className="w-full py-2.5 text-center text-xs font-bold rounded-xl bg-stone-800 text-white flex items-center justify-center gap-1.5"
                  >
                    <span>Sign In</span>
                  </Link>
                  <Link
                    to="/auth?mode=signup"
                    onClick={() => setOpen(false)}
                    className="w-full py-2.5 text-center text-xs font-extrabold rounded-xl bg-amber-500 text-stone-950 shadow-md flex items-center justify-center gap-1.5"
                  >
                    <span>Sign Up</span>
                    <ArrowRight size={13} />
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}
      </header>

      {/* ── MAIN CONTENT ── */}
      {children}

      {/* ── FOOTER (EXACT HARSHITHA DESIGN) ── */}
      <Footer />
    </div>
  );
};

export default SiteShell;
