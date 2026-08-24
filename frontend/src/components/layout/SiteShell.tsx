import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  Briefcase,
  Home,
  Info,
  Menu,
  Moon,
  Phone,
  Sparkles,
  Sun,
  X,
} from 'lucide-react';
import logo from '../../assets/adyapan-logo.png';
import { useTheme } from '../../context/ThemeContext';
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
  const location = useLocation();

  const isDark = theme === 'dark';

  // Handle scroll detection for sticky navbar background & shadow elevation
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
      {/* ── CLEAN EXECUTIVE STICKY NAVBAR (ALWAYS PINNED TO TOP ON SCROLL) ── */}
      <header
        className={`sticky top-0 z-[100] w-full transition-all duration-300 ${
          scrolled
            ? 'bg-[#181716]/98 dark:bg-[#121110]/98 backdrop-blur-md shadow-lg border-b border-stone-800 py-3'
            : 'bg-[#181716]/95 dark:bg-[#121110]/95 backdrop-blur-md border-b border-stone-800/80 py-3.5'
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
            {/* Theme Toggle Button with "Apply Theme" Label */}
            <button
              onClick={toggleTheme}
              className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-bold text-stone-200 bg-stone-800/90 hover:bg-stone-700/90 hover:text-amber-400 border border-stone-700/70 hover:border-amber-500/40 transition-all cursor-pointer shadow-xs active:scale-95"
              aria-label={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
              title={isDark ? 'Light Mode' : 'Dark Mode'}
            >
              {isDark ? <Sun size={15} className="text-amber-400" /> : <Moon size={15} className="text-amber-400" />}
              <span>Apply Theme</span>
            </button>

            {/* Mobile Menu Button */}
            <button
              className="md:hidden w-9 h-9 rounded-xl flex items-center justify-center text-stone-200 hover:bg-stone-800 border border-stone-700/60"
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

            {/* Mobile Theme Toggle */}
            <div className="mt-4 pt-4 border-t border-stone-800 flex items-center justify-between">
              <button
                onClick={toggleTheme}
                className="w-full flex items-center justify-center gap-2 px-3.5 py-2.5 rounded-xl text-xs font-bold text-stone-200 bg-stone-800 border border-stone-700/60 hover:text-amber-400"
              >
                {isDark ? <Sun size={16} className="text-amber-400" /> : <Moon size={16} className="text-amber-400" />}
                <span>Apply Theme</span>
              </button>
            </div>
          </div>
        )}
      </header>

      {/* ── MAIN CONTENT ── */}
      {children}

      {/* ── FOOTER ── */}
      <Footer />
    </div>
  );
};

export default SiteShell;
