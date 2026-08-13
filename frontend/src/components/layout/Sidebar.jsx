import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import AdyapanLogo from '../common/AdyapanLogo';

const Sidebar = ({ isOpen, onClose }) => {
  const location = useLocation();
  const { user, logout } = useAuth();
  const { theme } = useTheme();

  const navigation = [
    { path: '/dashboard', label: 'Dashboard', icon: '📊' },
    { path: '/jobs', label: 'Jobs', icon: '💼' },
    { path: '/candidates', label: 'Candidates', icon: '👥' },
    { path: '/interviews', label: 'Interviews', icon: '🎯' },
    { path: '/offers', label: 'Offers', icon: '📄' },
    { path: '/analytics', label: 'Analytics', icon: '📈' },
    { path: '/assistant', label: 'AI Copilot', icon: '🤖', badge: 'AI' },
    { path: '/profile', label: 'My Profile', icon: '👤' },
  ];

  const isActive = (path) => location.pathname === path || (path !== '/dashboard' && location.pathname.startsWith(path));

  return (
    <>
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 z-40 lg:hidden transition-opacity"
          style={{ background: 'rgba(13,13,26,0.7)', backdropFilter: 'blur(4px)' }}
        />
      )}

      <aside
        className={`fixed top-0 left-0 bottom-0 z-50 w-64 flex flex-col justify-between transition-all duration-300 shadow-xl border-r lg:translate-x-0 ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}
        style={theme === 'dark'
          ? { background: '#14162a', borderColor: 'rgba(249,115,22,0.2)', color: '#f1f5f9' }
          : { background: '#ffffff', borderColor: '#e8e0d8', color: '#1a1a2e' }
        }
      >
        <div>
          <div
            className="h-16 px-5 flex items-center justify-between border-b"
            style={theme === 'dark'
              ? { borderColor: 'rgba(249,115,22,0.2)', background: '#0d0d1a' }
              : { borderColor: '#f0e8df', background: '#fdfaf6' }
            }
          >
            <Link to="/dashboard">
              <AdyapanLogo variant={theme === 'dark' ? 'dark' : 'light'} size="small" />
            </Link>
            <button
              onClick={onClose}
              className="p-1 lg:hidden transition-colors font-bold text-sm"
              style={{ color: theme === 'dark' ? '#94a3b8' : '#6b7280' }}
            >
              ✕
            </button>
          </div>

          <nav className="p-3 space-y-1">
            {navigation.map((item) => {
              const active = isActive(item.path);
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={onClose}
                  className="flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm transition-all"
                  style={active
                    ? {
                      background: 'linear-gradient(135deg, #f97316 0%, #ea580c 100%)',
                      color: '#ffffff',
                      boxShadow: '0 4px 14px rgba(249,115,22,0.4)',
                      fontWeight: 700,
                    }
                    : theme === 'dark'
                      ? { color: '#94a3b8' }
                      : { color: '#4b5563' }
                  }
                  onMouseEnter={(e) => {
                    if (!active) {
                      e.currentTarget.style.background = theme === 'dark' ? 'rgba(249,115,22,0.12)' : 'rgba(249,115,22,0.08)';
                      e.currentTarget.style.color = '#f97316';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!active) {
                      e.currentTarget.style.background = 'transparent';
                      e.currentTarget.style.color = theme === 'dark' ? '#94a3b8' : '#4b5563';
                    }
                  }}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-base">{item.icon}</span>
                    <span className="font-medium text-sm">{item.label}</span>
                  </div>
                  {item.badge && (
                    <span
                      className="px-2 py-0.5 text-[10px] font-semibold rounded-full"
                      style={active
                        ? { background: 'rgba(255,255,255,0.25)', color: '#ffffff' }
                        : { background: 'rgba(249,115,22,0.15)', color: '#f97316', border: '1px solid rgba(249,115,22,0.3)' }
                      }
                    >
                      {item.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>
        </div>

        <div
          className="p-4 border-t"
          style={theme === 'dark'
            ? { borderColor: 'rgba(249,115,22,0.15)', background: 'rgba(13,13,26,0.6)' }
            : { borderColor: '#f0e8df', background: '#fdfaf6' }
          }
        >
          <Link
            to="/profile"
            onClick={onClose}
            className="flex items-center gap-3 p-2 rounded-xl mb-2 hover:bg-orange-500/10 transition-colors border border-transparent hover:border-orange-500/20 group"
          >
            <div
              className="w-8 h-8 rounded-lg font-bold flex items-center justify-center text-xs shadow-sm shrink-0"
              style={{ background: 'linear-gradient(135deg, #ea580c, #f97316)', color: '#ffffff' }}
            >
              {user?.name?.charAt(0) || 'A'}
            </div>
            <div className="overflow-hidden flex-1">
              <p className="text-xs font-semibold truncate group-hover:text-orange-500 transition-colors" style={{ color: theme === 'dark' ? '#f1f5f9' : '#1a1a2e' }}>
                {user?.name || 'Recruiter Lead'}
              </p>
              <p className="text-[10px] font-medium truncate" style={{ color: theme === 'dark' ? '#64748b' : '#6b7280' }}>
                {user?.company || 'Adyapan Edutech'}
              </p>
            </div>
          </Link>

          <button
            onClick={logout}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 text-xs font-medium rounded-xl transition-colors border"
            style={theme === 'dark'
              ? { color: '#94a3b8', borderColor: 'rgba(249,115,22,0.2)' }
              : { color: '#6b7280', borderColor: '#e8e0d8' }
            }
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(239,68,68,0.08)';
              e.currentTarget.style.color = '#ef4444';
              e.currentTarget.style.borderColor = 'rgba(239,68,68,0.25)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'transparent';
              e.currentTarget.style.color = theme === 'dark' ? '#94a3b8' : '#6b7280';
              e.currentTarget.style.borderColor = theme === 'dark' ? 'rgba(249,115,22,0.2)' : '#e8e0d8';
            }}
          >
            <span>🚪</span> Sign Out
          </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
