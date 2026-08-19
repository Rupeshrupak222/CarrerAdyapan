import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { Link, useNavigate } from 'react-router-dom';
import AdyapanLogo from '../common/AdyapanLogo';
import { notificationService, NotificationItem } from '../../services/notificationService';
import { getStoredNotifications, markNotificationsRead } from '../../utils/applicationStore';

const formatRelativeTime = (isoString?: string) => {
  if (!isoString) return 'Just now';
  try {
    const date = new Date(isoString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    if (diffMs < 0) return 'Just now';
    const diffSec = Math.floor(diffMs / 1000);
    if (diffSec < 60) return 'Just now';
    const diffMin = Math.floor(diffSec / 60);
    if (diffMin < 60) return `${diffMin}m ago`;
    const diffHours = Math.floor(diffMin / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    const diffDays = Math.floor(diffHours / 24);
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString('en-IN', { month: 'short', day: 'numeric' });
  } catch {
    return 'Just now';
  }
};

const Navbar = ({ toggleMobileSidebar }: { toggleMobileSidebar?: () => void }) => {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();

  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showNotifMenu, setShowNotifMenu] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [notifications, setNotifications] = useState<any[]>([]);

  const notifRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);
  const mobileMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchNotifs();
    const interval = setInterval(fetchNotifs, 5000);

    const handleClickOutside = (event: MouseEvent | TouchEvent) => {
      if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
        setShowNotifMenu(false);
      }
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setShowProfileMenu(false);
      }
      if (mobileMenuRef.current && !mobileMenuRef.current.contains(event.target as Node)) {
        setMobileMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('touchstart', handleClickOutside);

    return () => {
      clearInterval(interval);
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, []);

  const fetchNotifs = async () => {
    try {
      const res = await notificationService.getNotifications();
      if (res.success && Array.isArray(res.notifications)) {
        const mapped = res.notifications.map((n) => ({
          ...n,
          time: formatRelativeTime(n.createdAt),
          unread: !n.isRead,
        }));
        setNotifications(mapped);
      } else {
        const list = getStoredNotifications();
        if (list && Array.isArray(list)) {
          setNotifications(list.map((n: any) => ({ ...n, unread: n.unread ?? !n.isRead })));
        } else {
          setNotifications([]);
        }
      }
    } catch {
      setNotifications([]);
    }
  };

  const unreadCount = notifications.filter((n) => n.unread).length;

  const handleToggleNotifs = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!showNotifMenu && unreadCount > 0) {
      notificationService.markAllAsRead().catch(() => {});
      markNotificationsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, unread: false, isRead: true })));
    }
    setShowNotifMenu(!showNotifMenu);
    setShowProfileMenu(false);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/candidates?search=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery('');
      setMobileMenuOpen(false);
    }
  };

  const navStyle = theme === 'dark'
    ? { background: 'rgba(13,13,26,0.95)', borderColor: 'rgba(245, 158, 11,0.2)', color: '#f1f5f9' }
    : { background: 'rgba(255,255,255,0.97)', borderColor: '#e8e0d8', color: '#1a1a2e', boxShadow: '0 1px 12px rgba(26,26,46,0.08)' };

  return (
    <header
      className="sticky top-0 z-30 border-b transition-all backdrop-blur-xl shadow-md select-none"
      style={navStyle}
    >
      <div className="flex items-center justify-between px-3 py-2.5 sm:px-6 sm:py-3 gap-2 max-w-7xl mx-auto relative">

        {/* Left: Mobile Toggle, Brand & Global Search */}
        <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
          
          {/* Mobile Sidebar & Menu Toggle Button */}
          <button
            onClick={() => {
              if (toggleMobileSidebar) toggleMobileSidebar();
              setMobileMenuOpen(!mobileMenuOpen);
            }}
            className="p-2 rounded-xl lg:hidden transition-all border shadow-sm shrink-0 active:scale-95"
            style={theme === 'dark'
              ? { background: 'rgba(245, 158, 11,0.15)', borderColor: 'rgba(245, 158, 11,0.3)', color: '#f59e0b' }
              : { background: '#fdfaf6', borderColor: '#e0d8d0', color: '#f59e0b' }
            }
            aria-label="Toggle menu"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>

          {/* Compact Logo for Mobile */}
          <Link to="/dashboard" className="lg:hidden shrink-0 flex items-center">
            <AdyapanLogo variant={theme === 'dark' ? 'dark' : 'light'} size="small" showText={false} />
          </Link>

          {/* Global Search Input */}
          <form onSubmit={handleSearchSubmit} className="relative flex-1 min-w-[100px] max-w-[160px] sm:max-w-xs md:max-w-sm lg:max-w-md">
            <span className="absolute inset-y-0 left-0 flex items-center pl-2.5 pointer-events-none" style={{ color: '#f59e0b' }}>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </span>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search candidates..."
              className="w-full pl-8 pr-3 py-1.5 sm:py-2 text-xs font-semibold rounded-xl focus:outline-none transition-all border"
              style={theme === 'dark'
                ? {
                  background: 'rgba(245, 158, 11,0.08)',
                  borderColor: 'rgba(245, 158, 11,0.25)',
                  color: '#f1f5f9',
                }
                : {
                  background: '#fdfaf6',
                  borderColor: '#e0d8d0',
                  color: '#1a1a2e',
                }
              }
              onFocus={(e) => {
                e.target.style.borderColor = '#f59e0b';
                e.target.style.boxShadow = '0 0 0 3px rgba(245, 158, 11,0.2)';
              }}
              onBlur={(e) => {
                e.target.style.borderColor = theme === 'dark' ? 'rgba(245, 158, 11,0.25)' : '#e0d8d0';
                e.target.style.boxShadow = 'none';
              }}
            />
          </form>
        </div>

        {/* Right Navigation Actions */}
        <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">

          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            className="p-2 sm:px-3 sm:py-1.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 border shrink-0 hover:scale-105 active:scale-95"
            style={theme === 'dark'
              ? { background: 'rgba(245, 158, 11,0.15)', color: '#f59e0b', borderColor: 'rgba(245, 158, 11,0.3)' }
              : { background: '#fdfaf6', color: '#1a1a2e', borderColor: '#e0d8d0' }
            }
            title="Switch Theme Mode"
          >
            {theme === 'dark' ? (
              <svg className="w-4 h-4 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            ) : (
              <svg className="w-4 h-4 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
              </svg>
            )}
            <span className="hidden sm:inline text-xs font-extrabold">{theme === 'dark' ? 'Dark' : 'Light'}</span>
          </button>

          {/* AI Copilot Button */}
          <Link
            to="/assistant"
            className="flex items-center gap-1.5 px-2.5 py-1.5 sm:px-3 sm:py-1.5 text-xs font-extrabold rounded-xl transition-all shadow-md hover:scale-105 active:scale-95 shrink-0"
            style={{
              background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
              color: '#ffffff',
              boxShadow: '0 3px 12px rgba(245, 158, 11, 0.35)',
            }}
          >
            <span className="hidden sm:inline">AI Copilot</span>
            <span className="px-1.5 py-0.5 text-[9px] font-black rounded-full bg-white/30 text-white">AI</span>
          </Link>

          {/* Contact Us Page Button */}
          <Link
            to="/admin-contact"
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-xl transition-all border cursor-pointer shrink-0 hover:scale-105"
            style={theme === 'dark'
              ? { background: 'rgba(245, 158, 11,0.15)', color: '#f59e0b', borderColor: 'rgba(245, 158, 11,0.3)' }
              : { background: '#fdfaf6', color: '#1a1a2e', borderColor: '#e0d8d0' }
            }
          >
            Contact Us
          </Link>

          {/* Careers Public Portal Link */}
          <Link
            to="/careers"
            target="_blank"
            className="hidden md:flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-xl transition-all border shrink-0 hover:scale-105"
            style={{
              background: 'linear-gradient(135deg, rgba(245, 158, 11,0.15), rgba(234,88,12,0.1))',
              color: '#f59e0b',
              borderColor: 'rgba(245, 158, 11,0.3)',
            }}
          >
            <span>Careers ↗</span>
          </Link>

          {/* Notifications & Applicant Alerts Bell Dropdown */}
          <div ref={notifRef} className="relative z-50">
            <button
              onClick={handleToggleNotifs}
              className="p-2 rounded-xl transition-all relative border shrink-0 hover:scale-105 active:scale-95"
              style={theme === 'dark'
                ? { background: 'rgba(245, 158, 11,0.15)', borderColor: 'rgba(245, 158, 11,0.3)', color: '#f59e0b' }
                : { background: '#fdfaf6', borderColor: '#e0d8d0', color: '#d97706' }
              }
              title="Notifications & Applicant Alerts"
            >
              <svg className="w-5 h-5 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
              {unreadCount > 0 && (
                <span
                  className="absolute -top-1 -right-1 px-1.5 py-0.2 font-black text-[10px] rounded-full text-white shadow-md animate-pulse"
                  style={{ background: '#f59e0b' }}
                >
                  {unreadCount}
                </span>
              )}
            </button>

            {/* Notifications Dropdown Panel (Z-Index 100 Guarantee) */}
            {showNotifMenu && (
              <div
                className="absolute right-0 mt-2 w-80 sm:w-96 max-w-[calc(100vw-1.5rem)] rounded-2xl shadow-2xl border py-2.5 z-[100] animate-in fade-in slide-in-from-top-2 duration-200"
                style={theme === 'dark'
                  ? { background: '#14162a', borderColor: 'rgba(245, 158, 11,0.35)', color: '#f1f5f9', boxShadow: '0 12px 40px rgba(0,0,0,0.6)' }
                  : { background: '#ffffff', borderColor: '#e8e0d8', boxShadow: '0 12px 36px rgba(26,26,46,0.16)' }
                }
              >
                <div
                  className="px-4 py-2.5 border-b flex items-center justify-between"
                  style={theme === 'dark'
                    ? { borderColor: 'rgba(245, 158, 11,0.2)', background: 'rgba(13,13,26,0.8)' }
                    : { borderColor: '#f0e8df', background: '#fdfaf6' }
                  }
                >
                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping"></span>
                    <span className="text-xs font-extrabold tracking-wide" style={{ color: theme === 'dark' ? '#f1f5f9' : '#1a1a2e' }}>
                      Applicant Alerts & Notifications
                    </span>
                  </div>
                  <span
                    className="text-[10px] font-black px-2 py-0.5 rounded-full border"
                    style={{ background: 'rgba(245, 158, 11,0.18)', color: '#f59e0b', borderColor: 'rgba(245, 158, 11,0.35)' }}
                  >
                    {notifications.length} Total
                  </span>
                </div>

                <div
                  className="max-h-80 overflow-y-auto divide-y"
                  style={{ borderColor: theme === 'dark' ? 'rgba(245, 158, 11,0.12)' : '#f0e8df' }}
                >
                  {notifications.length === 0 ? (
                    <div className="p-5 text-center text-xs font-semibold" style={{ color: '#94a3b8' }}>
                      No new applicant alerts or notifications
                    </div>
                  ) : (
                    notifications.map((n) => (
                      <Link
                        key={n.id}
                        to={n.link || '/candidates'}
                        onClick={() => setShowNotifMenu(false)}
                        className="block p-3.5 transition-all hover:pl-4"
                        style={{ borderColor: theme === 'dark' ? 'rgba(245, 158, 11,0.1)' : '#f0e8df' }}
                        onMouseEnter={(e) => { e.currentTarget.style.background = theme === 'dark' ? 'rgba(245, 158, 11,0.1)' : '#fdfaf6'; }}
                        onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex items-center gap-1.5">
                            {n.unread && <span className="w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0"></span>}
                            <p className="text-xs font-extrabold leading-snug" style={{ color: theme === 'dark' ? '#f1f5f9' : '#1a1a2e' }}>
                              {n.title}
                            </p>
                          </div>
                          <span className="text-[10px] font-semibold shrink-0" style={{ color: '#f59e0b' }}>
                            {n.time}
                          </span>
                        </div>
                        <p className="text-[11px] mt-1 font-medium leading-relaxed" style={{ color: theme === 'dark' ? '#cbd5e1' : '#6b7280' }}>
                          {n.message}
                        </p>
                      </Link>
                    ))
                  )}
                </div>

                <div
                  className="p-2 border-t text-center"
                  style={theme === 'dark' ? { borderColor: 'rgba(245, 158, 11,0.15)' } : { borderColor: '#f0e8df' }}
                >
                  <Link
                    to="/candidates"
                    onClick={() => setShowNotifMenu(false)}
                    className="text-[11px] font-extrabold text-amber-500 hover:underline"
                  >
                    View All Candidates & Applications →
                  </Link>
                </div>
              </div>
            )}
          </div>

          {/* User Profile & Account Dropdown */}
          <div ref={profileRef} className="relative z-50">
            <button
              onClick={() => {
                setShowProfileMenu(!showProfileMenu);
                setShowNotifMenu(false);
              }}
              className="flex items-center gap-2 px-2.5 py-1.5 rounded-xl border transition-all hover:scale-105 active:scale-95"
              style={theme === 'dark'
                ? { background: 'rgba(245, 158, 11,0.15)', borderColor: 'rgba(245, 158, 11,0.3)' }
                : { background: '#fdfaf6', borderColor: '#e0d8d0' }
              }
            >
              <div
                className="w-7 h-7 rounded-lg font-black flex items-center justify-center text-xs shadow-md shrink-0"
                style={{ background: 'linear-gradient(135deg, #d97706, #f59e0b)', color: '#ffffff' }}
              >
                {user?.name?.charAt(0) || 'A'}
              </div>
              <div className="hidden sm:block text-left">
                <p className="text-xs font-extrabold leading-tight" style={{ color: theme === 'dark' ? '#f1f5f9' : '#1a1a2e' }}>
                  {user?.name || 'Recruiter Lead'}
                </p>
                <p className="text-[10px] font-semibold" style={{ color: '#f59e0b' }}>
                  {user?.company || 'Adyapan Edutech'}
                </p>
              </div>
            </button>

            {/* Profile Menu Dropdown Panel (Z-Index 100 Guarantee) */}
            {showProfileMenu && (
              <div
                className="absolute right-0 mt-2 w-60 max-w-[calc(100vw-1.5rem)] rounded-2xl shadow-2xl border py-2.5 z-[100] animate-in fade-in slide-in-from-top-2 duration-200"
                style={theme === 'dark'
                  ? { background: '#14162a', borderColor: 'rgba(245, 158, 11,0.35)', color: '#f1f5f9', boxShadow: '0 12px 40px rgba(0,0,0,0.6)' }
                  : { background: '#ffffff', borderColor: '#e8e0d8', boxShadow: '0 12px 36px rgba(26,26,46,0.16)' }
                }
              >
                <div
                  className="px-4 py-2.5 border-b"
                  style={theme === 'dark' ? { borderColor: 'rgba(245, 158, 11,0.15)' } : { borderColor: '#f0e8df' }}
                >
                  <p className="text-xs font-extrabold" style={{ color: theme === 'dark' ? '#f1f5f9' : '#1a1a2e' }}>
                    {user?.name || 'Recruiter Lead'}
                  </p>
                  <p className="text-xs truncate font-medium mt-0.5" style={{ color: '#94a3b8' }}>
                    {user?.email || 'admin@adyapan.com'}
                  </p>
                </div>

                <Link
                  to="/profile"
                  className="flex items-center gap-2 px-4 py-2.5 text-xs font-extrabold transition-all hover:pl-5"
                  style={{ color: '#f59e0b' }}
                  onClick={() => setShowProfileMenu(false)}
                  onMouseEnter={(e) => { e.currentTarget.style.background = theme === 'dark' ? 'rgba(245, 158, 11,0.12)' : '#fdfaf6'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
                >
                  <span>👤 View Profile & Account</span>
                </Link>

                <Link
                  to="/admin-contact"
                  className="flex items-center gap-2 px-4 py-2.5 text-xs font-bold transition-all hover:pl-5"
                  style={{ color: theme === 'dark' ? '#cbd5e1' : '#4b5563' }}
                  onClick={() => setShowProfileMenu(false)}
                  onMouseEnter={(e) => { e.currentTarget.style.background = theme === 'dark' ? 'rgba(245, 158, 11,0.12)' : '#fdfaf6'; e.currentTarget.style.color = '#f59e0b'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = theme === 'dark' ? '#cbd5e1' : '#4b5563'; }}
                >
                  <span>📞 Contact Us Support</span>
                </Link>

                <Link
                  to="/careers"
                  target="_blank"
                  className="flex items-center gap-2 px-4 py-2.5 text-xs font-bold transition-all hover:pl-5"
                  style={{ color: theme === 'dark' ? '#cbd5e1' : '#4b5563' }}
                  onClick={() => setShowProfileMenu(false)}
                  onMouseEnter={(e) => { e.currentTarget.style.background = theme === 'dark' ? 'rgba(245, 158, 11,0.12)' : '#fdfaf6'; e.currentTarget.style.color = '#f59e0b'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = theme === 'dark' ? '#cbd5e1' : '#4b5563'; }}
                >
                  <span>🌐 Public Careers Portal ↗</span>
                </Link>

                <Link
                  to="/assistant"
                  className="flex items-center gap-2 px-4 py-2.5 text-xs font-bold transition-all hover:pl-5"
                  style={{ color: theme === 'dark' ? '#cbd5e1' : '#4b5563' }}
                  onClick={() => setShowProfileMenu(false)}
                  onMouseEnter={(e) => { e.currentTarget.style.background = theme === 'dark' ? 'rgba(245, 158, 11,0.12)' : '#fdfaf6'; e.currentTarget.style.color = '#f59e0b'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = theme === 'dark' ? '#cbd5e1' : '#4b5563'; }}
                >
                  <span>🤖 AI Hiring Copilot</span>
                </Link>

                <div className="border-t my-1.5" style={theme === 'dark' ? { borderColor: 'rgba(245, 158, 11,0.15)' } : { borderColor: '#f0e8df' }} />

                <button
                  onClick={() => { setShowProfileMenu(false); logout(); }}
                  className="w-full text-left flex items-center gap-2 px-4 py-2.5 text-xs font-extrabold transition-all hover:pl-5"
                  style={{ color: '#ef4444' }}
                  onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(239,68,68,0.08)'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
                >
                  <span>🚪 Sign Out</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Glassmorphic Navigation Drawer Panel */}
      {mobileMenuOpen && (
        <div
          ref={mobileMenuRef}
          className="lg:hidden border-t px-4 py-3 space-y-2 z-[100] animate-in fade-in slide-in-from-top-2 duration-200"
          style={theme === 'dark'
            ? { background: 'rgba(20,22,42,0.98)', borderColor: 'rgba(245, 158, 11,0.25)', color: '#f1f5f9' }
            : { background: '#ffffff', borderColor: '#e8e0d8', boxShadow: '0 8px 24px rgba(26,26,46,0.12)' }
          }
        >
          <div className="flex items-center justify-between pb-2 border-b" style={theme === 'dark' ? { borderColor: 'rgba(245, 158, 11,0.15)' } : { borderColor: '#f0e8df' }}>
            <span className="text-xs font-extrabold text-amber-500 uppercase tracking-widest">Navigation Menu</span>
            <button onClick={() => setMobileMenuOpen(false)} className="text-xs font-bold text-slate-400 hover:text-amber-500">✕ Close</button>
          </div>

          <div className="grid grid-cols-2 gap-2 pt-1">
            <Link
              to="/assistant"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center justify-center gap-2 p-2.5 rounded-xl font-extrabold text-xs text-white shadow-md"
              style={{ background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)' }}
            >
              🤖 AI Copilot
            </Link>

            <Link
              to="/admin-contact"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center justify-center gap-1.5 p-2.5 rounded-xl font-bold text-xs border"
              style={theme === 'dark'
                ? { background: 'rgba(245, 158, 11,0.15)', color: '#f59e0b', borderColor: 'rgba(245, 158, 11,0.3)' }
                : { background: '#fdfaf6', color: '#1a1a2e', borderColor: '#e0d8d0' }
              }
            >
              📞 Contact Us
            </Link>

            <Link
              to="/careers"
              target="_blank"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center justify-center gap-1.5 p-2.5 rounded-xl font-bold text-xs border"
              style={theme === 'dark'
                ? { background: 'rgba(245, 158, 11,0.15)', color: '#f59e0b', borderColor: 'rgba(245, 158, 11,0.3)' }
                : { background: '#fdfaf6', color: '#1a1a2e', borderColor: '#e0d8d0' }
              }
            >
              🌐 Careers Portal ↗
            </Link>

            <Link
              to="/profile"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center justify-center gap-1.5 p-2.5 rounded-xl font-bold text-xs border"
              style={theme === 'dark'
                ? { background: 'rgba(245, 158, 11,0.15)', color: '#f59e0b', borderColor: 'rgba(245, 158, 11,0.3)' }
                : { background: '#fdfaf6', color: '#1a1a2e', borderColor: '#e0d8d0' }
              }
            >
              👤 Profile & Account
            </Link>
          </div>
        </div>
      )}
    </header>
  );
};

export default Navbar;
