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
    {
      path: '/dashboard',
      label: 'Dashboard',
      icon: (
        <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-5 h-5">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
        </svg>
      ),
    },
    {
      path: '/jobs',
      label: 'Jobs',
      icon: (
        <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-5 h-5">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
        </svg>
      ),
    },
    {
      path: '/candidates',
      label: 'Candidates',
      icon: (
        <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-5 h-5">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
        </svg>
      ),
    },
    {
      path: '/interviews',
      label: 'Interviews',
      icon: (
        <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-5 h-5">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      ),
    },
    {
      path: '/offers',
      label: 'Offers',
      icon: (
        <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-5 h-5">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      ),
    },
    {
      path: '/analytics',
      label: 'Analytics',
      icon: (
        <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-5 h-5">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      ),
    },
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
          ? { background: '#14162a', borderColor: 'rgba(245, 158, 11,0.2)', color: '#f1f5f9' }
          : { background: '#ffffff', borderColor: '#e8e0d8', color: '#1a1a2e' }
        }
      >
        <div>
          <div
            className="h-16 px-5 flex items-center justify-between border-b"
            style={theme === 'dark'
              ? { borderColor: 'rgba(245, 158, 11,0.2)', background: '#0d0d1a' }
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
                      background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                      color: '#ffffff',
                      boxShadow: '0 4px 14px rgba(245, 158, 11,0.4)',
                      fontWeight: 700,
                    }
                    : theme === 'dark'
                      ? { color: '#94a3b8' }
                      : { color: '#4b5563' }
                  }
                  onMouseEnter={(e) => {
                    if (!active) {
                      e.currentTarget.style.background = theme === 'dark' ? 'rgba(245, 158, 11,0.12)' : 'rgba(245, 158, 11,0.08)';
                      e.currentTarget.style.color = '#f59e0b';
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
                    <span className="flex items-center justify-center">{item.icon}</span>
                    <span className="font-medium text-sm">{item.label}</span>
                  </div>
                  {item.badge && (
                    <span
                      className="px-2 py-0.5 text-[10px] font-semibold rounded-full"
                      style={active
                        ? { background: 'rgba(255,255,255,0.25)', color: '#ffffff' }
                        : { background: 'rgba(245, 158, 11,0.15)', color: '#f59e0b', border: '1px solid rgba(245, 158, 11,0.3)' }
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
            ? { borderColor: 'rgba(245, 158, 11,0.15)', background: 'rgba(13,13,26,0.6)' }
            : { borderColor: '#f0e8df', background: '#fdfaf6' }
          }
        >


          <button
            onClick={logout}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 text-xs font-medium rounded-xl transition-colors border"
            style={theme === 'dark'
              ? { color: '#94a3b8', borderColor: 'rgba(245, 158, 11,0.2)' }
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
              e.currentTarget.style.borderColor = theme === 'dark' ? 'rgba(245, 158, 11,0.2)' : '#e8e0d8';
            }}
          >
            Sign Out
          </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
