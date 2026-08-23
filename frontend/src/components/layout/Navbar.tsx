import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Menu, 
  User, 
  LogOut, 
  ChevronDown,
  Video,
  Sparkles,
  Bell,
  Search,
  Shield,
  Award,
  Briefcase,
  CheckCircle2,
  Layers,
  ExternalLink,
  Trash2
} from 'lucide-react';
import { notificationService, NotificationItem } from '../../services/notificationService';

const Navbar = ({ toggleMobileSidebar }: { toggleMobileSidebar?: () => void }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const profileRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setShowProfileMenu(false);
      }
      if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
        setShowNotifications(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    const loadNotifications = async () => {
      try {
        const data = await notificationService.getNotifications();
        if (data && data.notifications) {
          setNotifications(data.notifications);
          setUnreadCount(data.unreadCount || data.notifications.filter(n => !n.isRead && n.unread !== false).length);
        }
      } catch (err) {
        // Fallback gracefully
      }
    };
    loadNotifications();
    const interval = setInterval(loadNotifications, 30000);
    return () => clearInterval(interval);
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/candidates?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const handleMarkAllRead = async () => {
    await notificationService.markAllAsRead();
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true, unread: false })));
    setUnreadCount(0);
  };

  const handleClearAll = async () => {
    await notificationService.clearAll();
    setNotifications([]);
    setUnreadCount(0);
  };

  const role = user?.role || 'ADMIN';
  const isAdmin = role === 'ADMIN';
  const isManager = role === 'HR_MANAGER';
  const isHR = role === 'HR';

  return (
    <header className="h-16 px-4 md:px-6 lg:px-8 bg-white/95 backdrop-blur-md border-b border-orange-100/90 flex items-center justify-between fixed top-0 left-0 lg:left-72 right-0 z-40 shadow-xs transition-all duration-300">
      {/* Left: Mobile Menu & Portal Identifier */}
      <div className="flex items-center gap-3 md:gap-4 min-w-0">
        <button
          onClick={toggleMobileSidebar}
          className="lg:hidden p-2 rounded-xl text-slate-600 hover:bg-orange-50 hover:text-orange-600 transition-colors border border-slate-200/60"
          title="Toggle Navigation"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Dynamic Portal Badge */}
        <div className="hidden sm:flex items-center gap-2.5">
          {isAdmin && (
            <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-orange-50 to-amber-50 border border-orange-200 text-orange-950 text-xs font-extrabold shadow-2xs">
              <Shield className="w-3.5 h-3.5 text-orange-600" />
              <span>Admin Super Console</span>
            </div>
          )}
          {isManager && (
            <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-purple-50 to-amber-50 border border-purple-200 text-purple-950 text-xs font-extrabold shadow-2xs">
              <Award className="w-3.5 h-3.5 text-purple-600" />
              <span>HR Manager Center</span>
            </div>
          )}
          {isHR && (
            <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200 text-emerald-950 text-xs font-extrabold shadow-2xs">
              <Briefcase className="w-3.5 h-3.5 text-emerald-600" />
              <span>HR Specialist Workspace</span>
            </div>
          )}

          <div className="hidden xl:flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-50 text-slate-600 text-[11px] font-semibold border border-slate-200/60">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span>ATS Live</span>
          </div>
        </div>

        {/* Global Candidate / Job Search */}
        <form onSubmit={handleSearchSubmit} className="hidden md:flex items-center relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search candidates, skills, jobs..."
            className="pl-9 pr-12 py-1.5 w-64 lg:w-80 bg-slate-50/80 hover:bg-white focus:bg-white border border-slate-200 hover:border-orange-300 focus:border-orange-500 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-500/20 transition-all shadow-2xs"
          />
          <kbd className="absolute right-2.5 px-1.5 py-0.5 text-[9px] font-bold text-slate-400 bg-white border border-slate-200 rounded shadow-2xs pointer-events-none">
            ↵
          </kbd>
        </form>
      </div>

      {/* Right Actions & Controls */}
      <div className="flex items-center gap-2 md:gap-3">
        {/* AI Copilot Launch Button */}
        <Link
          to="/assistant"
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white text-xs font-bold transition-all shadow-sm shadow-orange-500/25 hover:scale-[1.02] active:scale-[0.98]"
          title="AI Recruiter Copilot"
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">AI Copilot</span>
        </Link>

        {/* Google Meet Room Shortcut */}
        {user?.meetLink ? (
          <a
            href={user.meetLink}
            target="_blank"
            rel="noopener noreferrer"
            className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-orange-50 hover:bg-orange-100 border border-orange-200 text-orange-800 text-xs font-bold transition-all shadow-2xs"
            title="Open Google Meet Room"
          >
            <Video className="w-3.5 h-3.5 text-orange-600" />
            <span>Meet Room</span>
            <ExternalLink className="w-3 h-3 text-orange-500 ml-0.5" />
          </a>
        ) : null}

        {/* Notification Bell Dropdown */}
        <div className="relative" ref={notifRef}>
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className={`relative p-2 rounded-xl transition-all border ${
              showNotifications
                ? 'bg-orange-50 border-orange-300 text-orange-700'
                : 'bg-white hover:bg-slate-50 border-slate-200 text-slate-600'
            }`}
            title="Notifications"
          >
            <Bell className="w-4 h-4" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white font-extrabold text-[9px] rounded-full flex items-center justify-center border-2 border-white animate-bounce">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white border border-slate-200 rounded-2xl shadow-2xl p-3 z-50 animate-fadeIn">
              <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <h4 className="text-xs font-extrabold text-slate-900">Notifications</h4>
                  {unreadCount > 0 && (
                    <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-orange-100 text-orange-700">
                      {unreadCount} new
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleMarkAllRead}
                    className="text-[10px] font-bold text-orange-600 hover:text-orange-700 hover:underline"
                  >
                    Mark all read
                  </button>
                  <button
                    onClick={handleClearAll}
                    className="text-[10px] font-bold text-slate-400 hover:text-red-600"
                    title="Clear All"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              </div>

              <div className="max-h-72 overflow-y-auto space-y-1.5 scrollbar-thin">
                {notifications.length === 0 ? (
                  <div className="text-center py-6 text-slate-400 text-xs">
                    <CheckCircle2 className="w-6 h-6 text-slate-300 mx-auto mb-1.5" />
                    No new notifications
                  </div>
                ) : (
                  notifications.map((notif) => (
                    <div
                      key={notif.id}
                      className={`p-2.5 rounded-xl text-xs transition-colors border ${
                        notif.isRead
                          ? 'bg-white border-slate-100 text-slate-600'
                          : 'bg-orange-50/60 border-orange-200/80 text-slate-900 font-semibold'
                      }`}
                    >
                      <p className="text-xs font-bold leading-tight text-slate-900">{notif.title}</p>
                      <p className="text-[11px] text-slate-600 mt-0.5">{notif.message}</p>
                      <span className="text-[9px] text-slate-400 block mt-1">
                        {notif.createdAt ? new Date(notif.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : (notif.time || 'Just now')}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* User Profile Dropdown */}
        <div className="relative" ref={profileRef}>
          <button
            onClick={() => setShowProfileMenu(!showProfileMenu)}
            className="flex items-center gap-2 p-1 md:p-1.5 rounded-xl hover:bg-orange-50/70 border border-slate-200/80 hover:border-orange-300 transition-all text-left"
          >
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-orange-500 to-amber-500 text-white flex items-center justify-center font-black text-xs shadow-sm shadow-orange-500/25 shrink-0">
              {user?.name?.[0] || 'U'}
            </div>
            <div className="hidden md:block pr-1">
              <p className="text-xs font-bold text-slate-900 leading-tight truncate max-w-[110px]">{user?.name}</p>
              <p className="text-[10px] font-semibold text-orange-600">{role}</p>
            </div>
            <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform ${showProfileMenu ? 'rotate-180 text-orange-600' : ''}`} />
          </button>

          {showProfileMenu && (
            <div className="absolute right-0 mt-2 w-64 bg-white border border-orange-200/90 rounded-2xl shadow-2xl p-2 z-50 animate-fadeIn">
              <div className="p-3 border-b border-orange-100 mb-1 bg-gradient-to-br from-orange-50/80 to-amber-50/40 rounded-xl">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-orange-500 to-amber-500 text-white flex items-center justify-center font-black text-sm shadow-sm">
                    {user?.name?.[0] || 'U'}
                  </div>
                  <div className="truncate">
                    <p className="text-xs font-extrabold text-slate-900 truncate">{user?.name}</p>
                    <p className="text-[11px] text-slate-500 truncate">{user?.email}</p>
                  </div>
                </div>
                <div className="mt-2 pt-2 border-t border-orange-200/60 flex items-center justify-between">
                  <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-md bg-orange-100 text-orange-800 border border-orange-200">
                    {role}
                  </span>
                  <span className="text-[10px] font-medium text-emerald-600 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span> Active
                  </span>
                </div>
              </div>

              <div className="space-y-0.5">
                {isAdmin && (
                  <Link
                    to="/dashboard"
                    onClick={() => setShowProfileMenu(false)}
                    className="w-full flex items-center gap-2.5 p-2 rounded-xl text-xs font-bold text-slate-700 hover:bg-orange-50 hover:text-orange-700 transition-colors"
                  >
                    <Shield className="w-3.5 h-3.5 text-orange-600" /> Executive Overview
                  </Link>
                )}
                {isManager && (
                  <Link
                    to="/hr-manager/dashboard"
                    onClick={() => setShowProfileMenu(false)}
                    className="w-full flex items-center gap-2.5 p-2 rounded-xl text-xs font-bold text-slate-700 hover:bg-orange-50 hover:text-orange-700 transition-colors"
                  >
                    <Award className="w-3.5 h-3.5 text-purple-600" /> Manager Approvals Hub
                  </Link>
                )}
                {isHR && (
                  <Link
                    to="/hr/dashboard"
                    onClick={() => setShowProfileMenu(false)}
                    className="w-full flex items-center gap-2.5 p-2 rounded-xl text-xs font-bold text-slate-700 hover:bg-orange-50 hover:text-orange-700 transition-colors"
                  >
                    <Briefcase className="w-3.5 h-3.5 text-emerald-600" /> HR My Candidates
                  </Link>
                )}

                <Link
                  to="/candidates"
                  onClick={() => setShowProfileMenu(false)}
                  className="w-full flex items-center gap-2.5 p-2 rounded-xl text-xs font-bold text-slate-700 hover:bg-orange-50 hover:text-orange-700 transition-colors"
                >
                  <Layers className="w-3.5 h-3.5 text-slate-500" /> Candidate Pipeline
                </Link>

                <Link
                  to="/profile"
                  onClick={() => setShowProfileMenu(false)}
                  className="w-full flex items-center gap-2.5 p-2 rounded-xl text-xs font-bold text-slate-700 hover:bg-orange-50 hover:text-orange-700 transition-colors"
                >
                  <User className="w-3.5 h-3.5 text-slate-500" /> Profile & Settings
                </Link>
              </div>

              <div className="mt-1 pt-1 border-t border-slate-100">
                <button
                  onClick={() => {
                    setShowProfileMenu(false);
                    logout();
                  }}
                  className="w-full flex items-center gap-2.5 p-2 rounded-xl text-xs font-bold text-red-600 hover:bg-red-50 transition-colors"
                >
                  <LogOut className="w-3.5 h-3.5" /> Sign Out
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Navbar;

