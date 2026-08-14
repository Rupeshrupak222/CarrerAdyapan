import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { Link } from 'react-router-dom';
import AdyapanLogo from '../common/AdyapanLogo';
import { getStoredNotifications, markNotificationsRead } from '../../utils/applicationStore';

const Navbar = ({ toggleMobileSidebar }) => {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showNotifMenu, setShowNotifMenu] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [notifications, setNotifications] = useState([]);

  const notifRef = useRef(null);
  const profileRef = useRef(null);

  useEffect(() => {
    fetchNotifs();
    const interval = setInterval(fetchNotifs, 3000);

    const handleClickOutside = (event) => {
      if (notifRef.current && !notifRef.current.contains(event.target)) {
        setShowNotifMenu(false);
      }
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setShowProfileMenu(false);
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

  const fetchNotifs = () => {
    const list = getStoredNotifications();
    setNotifications(list);
  };

  const unreadCount = notifications.filter((n) => n.unread).length;

  const handleToggleNotifs = () => {
    if (!showNotifMenu && unreadCount > 0) {
      const updated = markNotificationsRead();
      setNotifications(updated);
    }
    setShowNotifMenu(!showNotifMenu);
  };

  const navStyle = theme === 'dark'
    ? { background: 'rgba(13,13,26,0.95)', borderColor: 'rgba(245, 158, 11,0.2)', color: '#f1f5f9' }
    : { background: 'rgba(255,255,255,0.97)', borderColor: '#e8e0d8', color: '#1a1a2e', boxShadow: '0 1px 8px rgba(26,26,46,0.06)' };

  return (
    <header
      className="sticky top-0 z-50 border-b transition-all backdrop-blur-xl shadow-md"
      style={navStyle}
    >
      <div className="flex items-center justify-between px-3 py-2.5 sm:px-6 sm:py-3 gap-2">

        {/* Left: Mobile Sidebar Toggle & Search */}
        <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
          <button
            onClick={toggleMobileSidebar}
            className="p-2 rounded-xl lg:hidden transition-colors border shadow-sm shrink-0"
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

          {/* Search Input */}
          <div className="relative flex-1 max-w-[140px] xs:max-w-[200px] sm:max-w-xs md:max-w-sm lg:max-w-md">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none" style={{ color: '#f59e0b' }}>
              </span>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search..."
              className="w-full pl-8 sm:pl-9 pr-3 py-1.5 sm:py-2 text-xs rounded-xl focus:outline-none transition-all font-semibold"
              style={theme === 'dark'
                ? {
                  background: 'rgba(245, 158, 11,0.08)',
                  border: '1.5px solid rgba(245, 158, 11,0.2)',
                  color: '#f1f5f9',
                }
                : {
                  background: '#fdfaf6',
                  border: '1.5px solid #e0d8d0',
                  color: '#1a1a2e',
                }
              }
              onFocus={(e) => {
                e.target.style.borderColor = '#f59e0b';
                e.target.style.boxShadow = '0 0 0 3px rgba(245, 158, 11,0.15)';
              }}
              onBlur={(e) => {
                e.target.style.borderColor = theme === 'dark' ? 'rgba(245, 158, 11,0.2)' : '#e0d8d0';
                e.target.style.boxShadow = 'none';
              }}
            />
          </div>
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-1.5 sm:gap-3 shrink-0">

          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            className="px-2.5 sm:px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1 border"
            style={theme === 'dark'
              ? { background: 'rgba(245, 158, 11,0.15)', color: '#f59e0b', borderColor: 'rgba(245, 158, 11,0.3)' }
              : { background: '#fdfaf6', color: '#1a1a2e', borderColor: '#e0d8d0' }
            }
            title="Switch Theme"
          >
            <span className="hidden sm:inline">{theme === 'dark' ? 'Dark Mode' : 'Light Mode'}</span>
            <span className="sm:hidden">{theme === 'dark' ? 'Dark' : 'Light'}</span>
          </button>

          {/* AI Copilot Button */}
          <Link
            to="/assistant"
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-xl transition-all shadow-md hover:scale-105 active:scale-95"
            style={{
              background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
              color: '#ffffff',
              boxShadow: '0 3px 12px rgba(245, 158, 11, 0.4)',
            }}
          >
            <span>AI Copilot</span>
            <span className="px-1.5 py-0.5 text-[9px] font-extrabold rounded-full bg-white/25 text-white">AI</span>
          </Link>

          {/* Contact Us Button */}
          <Link
            to="/contact"
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-xl transition-all border hover:border-amber-400 cursor-pointer"
            style={theme === 'dark'
              ? { background: 'rgba(245, 158, 11,0.15)', color: '#f59e0b', borderColor: 'rgba(245, 158, 11,0.3)' }
              : { background: '#fdfaf6', color: '#1a1a2e', borderColor: '#e0d8d0' }
            }
          >
            Contact Us
          </Link>

          {/* Careers Portal */}
          <Link
            to="/careers"
            target="_blank"
            className="hidden md:flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-xl transition-all border"
            style={{
              background: 'linear-gradient(135deg, rgba(245, 158, 11,0.15), rgba(234,88,12,0.1))',
              color: '#f59e0b',
              borderColor: 'rgba(245, 158, 11,0.3)',
            }}
          >
            <span>Careers ↗</span>
          </Link>

          {/* Notifications Bell */}
          <div ref={notifRef} className="relative">
            <button
              onClick={handleToggleNotifs}
              className="p-1.5 sm:p-2 rounded-xl transition-colors relative"
              style={{ color: theme === 'dark' ? '#94a3b8' : '#6b7280' }}
              title="Notifications"
            >
              <span className="text-base"></span>
              {unreadCount > 0 && (
                <span
                  className="absolute top-0.5 right-0.5 px-1.5 py-0.2 font-bold text-[9px] rounded-full text-white"
                  style={{ background: '#f59e0b' }}
                >
                  {unreadCount}
                </span>
              )}
            </button>

            {showNotifMenu && (
              <div
                className="absolute right-0 mt-2 w-72 sm:w-80 rounded-2xl shadow-xl border py-2 z-50"
                style={theme === 'dark'
                  ? { background: '#14162a', borderColor: 'rgba(245, 158, 11,0.25)', color: '#f1f5f9' }
                  : { background: '#ffffff', borderColor: '#e8e0d8', boxShadow: '0 8px 32px rgba(26,26,46,0.12)' }
                }
              >
                <div
                  className="px-4 py-2.5 border-b flex items-center justify-between"
                  style={theme === 'dark'
                    ? { borderColor: 'rgba(245, 158, 11,0.15)', background: 'rgba(13,13,26,0.5)' }
                    : { borderColor: '#f0e8df', background: '#fdfaf6' }
                  }
                >
                  <span className="text-xs font-bold" style={{ color: theme === 'dark' ? '#f1f5f9' : '#1a1a2e' }}>
                     Applicant Alerts
                  </span>
                  <span
                    className="text-[10px] font-bold px-2 py-0.5 rounded-full border"
                    style={{ background: 'rgba(245, 158, 11,0.15)', color: '#f59e0b', borderColor: 'rgba(245, 158, 11,0.3)' }}
                  >
                    {notifications.length} New
                  </span>
                </div>

                <div
                  className="max-h-72 overflow-y-auto divide-y"
                  style={{ borderColor: theme === 'dark' ? 'rgba(245, 158, 11,0.1)' : '#f0e8df' }}
                >
                  {notifications.length === 0 ? (
                    <div className="p-4 text-center text-xs" style={{ color: '#94a3b8' }}>No new notifications</div>
                  ) : (
                    notifications.map((n) => (
                      <Link
                        key={n.id}
                        to="/candidates"
                        onClick={() => setShowNotifMenu(false)}
                        className="block p-3 transition-colors"
                        style={{ borderColor: theme === 'dark' ? 'rgba(245, 158, 11,0.1)' : '#f0e8df' }}
                        onMouseEnter={(e) => { e.currentTarget.style.background = theme === 'dark' ? 'rgba(245, 158, 11,0.08)' : '#fdfaf6'; }}
                        onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
                      >
                        <div className="flex items-center justify-between">
                          <p className="text-xs font-bold" style={{ color: theme === 'dark' ? '#f1f5f9' : '#1a1a2e' }}>{n.title}</p>
                          <span className="text-[9px] font-medium" style={{ color: '#94a3b8' }}>{n.time}</span>
                        </div>
                        <p className="text-[11px] mt-0.5 font-medium" style={{ color: theme === 'dark' ? '#94a3b8' : '#6b7280' }}>{n.message}</p>
                      </Link>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Profile Dropdown */}
          <div ref={profileRef} className="relative">
            <button
              onClick={() => setShowProfileMenu(!showProfileMenu)}
              className="flex items-center gap-1.5 sm:gap-2 px-2 sm:px-2.5 py-1 sm:py-1.5 rounded-xl border transition-all"
              style={theme === 'dark'
                ? { background: 'rgba(245, 158, 11,0.12)', borderColor: 'rgba(245, 158, 11,0.25)' }
                : { background: '#fdfaf6', borderColor: '#e0d8d0' }
              }
            >
              <div
                className="w-7 h-7 rounded-lg font-bold flex items-center justify-center text-xs shadow-sm"
                style={{ background: 'linear-gradient(135deg, #d97706, #f59e0b)', color: '#ffffff' }}
              >
                {user?.name?.charAt(0) || 'A'}
              </div>
              <div className="hidden sm:block text-left">
                <p className="text-xs font-bold leading-tight" style={{ color: theme === 'dark' ? '#f1f5f9' : '#1a1a2e' }}>
                  {user?.name || 'Recruiter Lead'}
                </p>
                <p className="text-[10px] font-semibold" style={{ color: theme === 'dark' ? '#64748b' : '#6b7280' }}>
                  {user?.company || 'Adyapan Edutech'}
                </p>
              </div>
            </button>

            {showProfileMenu && (
              <div
                className="absolute right-0 mt-2 w-56 rounded-2xl shadow-xl border py-2 z-50"
                style={theme === 'dark'
                  ? { background: '#14162a', borderColor: 'rgba(245, 158, 11,0.25)', color: '#f1f5f9' }
                  : { background: '#ffffff', borderColor: '#e8e0d8', boxShadow: '0 8px 32px rgba(26,26,46,0.12)' }
                }
              >
                <div
                  className="px-4 py-2.5 border-b"
                  style={theme === 'dark' ? { borderColor: 'rgba(245, 158, 11,0.15)' } : { borderColor: '#f0e8df' }}
                >
                  <p className="text-xs font-bold" style={{ color: theme === 'dark' ? '#f1f5f9' : '#1a1a2e' }}>
                    {user?.name || 'Recruiter Lead'}
                  </p>
                  <p className="text-xs truncate font-medium" style={{ color: '#94a3b8' }}>
                    {user?.email || 'admin@adyapan.com'}
                  </p>
                </div>
                <Link
                  to="/profile"
                  className="flex items-center gap-2 px-4 py-2 text-xs font-bold transition-colors"
                  style={{ color: '#f59e0b' }}
                  onClick={() => setShowProfileMenu(false)}
                  onMouseEnter={(e) => { e.currentTarget.style.background = theme === 'dark' ? 'rgba(245, 158, 11,0.12)' : '#fdfaf6'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
                >
                  View Admin Profile
                </Link>
                <Link
                  to="/careers"
                  className="flex items-center gap-2 px-4 py-2 text-xs font-semibold transition-colors"
                  style={{ color: theme === 'dark' ? '#cbd5e1' : '#4b5563' }}
                  onClick={() => setShowProfileMenu(false)}
                  onMouseEnter={(e) => { e.currentTarget.style.background = theme === 'dark' ? 'rgba(245, 158, 11,0.12)' : '#fdfaf6'; e.currentTarget.style.color = '#f59e0b'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = theme === 'dark' ? '#cbd5e1' : '#4b5563'; }}
                >
                  Public Careers Portal
                </Link>
                <Link
                  to="/assistant"
                  className="flex items-center gap-2 px-4 py-2 text-xs font-semibold transition-colors"
                  style={{ color: theme === 'dark' ? '#cbd5e1' : '#4b5563' }}
                  onClick={() => setShowProfileMenu(false)}
                  onMouseEnter={(e) => { e.currentTarget.style.background = theme === 'dark' ? 'rgba(245, 158, 11,0.12)' : '#fdfaf6'; e.currentTarget.style.color = '#f59e0b'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = theme === 'dark' ? '#cbd5e1' : '#4b5563'; }}
                >
                  AI Hiring Copilot
                </Link>
                <div className="border-t my-1" style={theme === 'dark' ? { borderColor: 'rgba(245, 158, 11,0.15)' } : { borderColor: '#f0e8df' }} />
                <button
                  onClick={() => { setShowProfileMenu(false); logout(); }}
                  className="w-full text-left flex items-center gap-2 px-4 py-2 text-xs font-semibold transition-colors"
                  style={{ color: '#ef4444' }}
                  onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(239,68,68,0.06)'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
                >
                  Sign Out
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
