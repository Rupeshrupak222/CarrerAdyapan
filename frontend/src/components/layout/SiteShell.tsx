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
              <div className="hidden sm:flex items-center gap-2">
                <Link
                  to="/auth?mode=signin"
                  className="px-4 py-2 text-xs font-extrabold rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 shadow-md shadow-amber-500/20 transition-all flex items-center gap-1.5 hover:scale-105 active:scale-95"
                >
                  <User size={14} />
                  <span>Sign In</span>
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
                <div>
                  <Link
                    to="/auth?mode=signin"
                    onClick={() => setOpen(false)}
                    className="w-full py-2.5 text-center text-xs font-extrabold rounded-xl bg-amber-500 text-stone-950 shadow-md flex items-center justify-center gap-1.5"
                  >
                    <User size={14} />
                    <span>Sign In</span>
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}
      </header>

      {/* ── MAIN CONTENT ── */}
      {children}

      {/* ── FOOTER ── */}
      <footer className="footer-h">
        <div className="footer-top-h">
          <div>
            <Link className="footer-brand-h" to="/">
              <img src={logo} alt="Adyapan" />
              <span>
                Adyapan <b>Career</b>
              </span>
            </Link>
            <p>
              Connecting ambitious talent with high-growth career opportunities through a fast, transparent, and human-first hiring platform.
            </p>
          </div>

          <div>
            <h4>Explore</h4>
            <Link to="/open-positions">Jobs</Link>
            <Link to="/about">About Us</Link>
            <Link to="/life-at-adyapan">Life at Adyapan</Link>
            <Link to="/contact">Contact Us</Link>
          </div>

          <div>
            <h4>For Candidates</h4>
            <Link to="/auth?mode=signup">Create profile</Link>
            <Link to="/auth?mode=signin">Sign In</Link>
            <Link to="/open-positions">Open positions</Link>
            <Link to="/dashboard">Recruiter Portal</Link>
          </div>

          <div>
            <h4>Connect</h4>
            <a href="mailto:support@adyapan.com">support@adyapan.com</a>
            <a href="tel:+918179124566">+91 81791 24566</a>
            <span>Sattva Magnus, Toli Chowki, Hyderabad</span>
            <div className="footer-social-h">
              <a
                href="https://www.instagram.com/adyapan_?igsh=MWw1NGwwNTIwZXU2eQ%3D%3D"
                target="_blank"
                rel="noreferrer"
                aria-label="Instagram"
              >
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                </svg>
              </a>
              <a
                href="https://www.linkedin.com/company/adyapan-edutech-pvt-ltd"
                target="_blank"
                rel="noreferrer"
                aria-label="LinkedIn"
              >
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                  <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
                </svg>
              </a>
            </div>
          </div>
        </div>

        <div className="footer-bottom-h">
          <span>© 2026 Adyapan Edutech Pvt. Ltd. All rights reserved.</span>
          <span>Adyapan Career Portal</span>
        </div>
      </footer>
    </div>
  );
};

export default SiteShell;
