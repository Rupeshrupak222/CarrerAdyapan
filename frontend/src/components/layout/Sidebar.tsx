import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { 
  LayoutDashboard, 
  Target, 
  Users, 
  Award, 
  Mail, 
  TrendingUp, 
  ShieldCheck, 
  Settings, 
  LogOut, 
  ExternalLink, 
  Video, 
  CircleDot, 
  FileCheck, 
  Briefcase 
} from 'lucide-react';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const location = useLocation();
  const { user, logout } = useAuth();

  const isAdmin = user?.role === 'ADMIN';
  const isManager = user?.role === 'HR_MANAGER';
  const isHR = user?.role === 'HR';

  // Dynamic Navigation based on strict Role-Based Access Control
  const getNavigationLinks = () => {
    // 1. ADMIN SIDEBAR (Same Base Structure + More Access)
    if (isAdmin) {
      return [
        { path: '/dashboard', label: 'Dashboard', icon: <LayoutDashboard className="w-4 h-4" /> },
        { path: '/admin/screening', label: 'Screening & Approvals', icon: <Target className="w-4 h-4" /> },
        { path: '/admin/workload', label: 'Workload Distribution', icon: <Users className="w-4 h-4" /> },
        { path: '/admin/final-selected', label: 'Final Round Selected', icon: <Award className="w-4 h-4" /> },
        { path: '/admin/jobs', label: 'Job Openings', icon: <Briefcase className="w-4 h-4" /> },
        { path: '/admin/communications', label: 'Communication History', icon: <Mail className="w-4 h-4" /> },
        { path: '/admin/reports', label: 'Hiring Reports', icon: <TrendingUp className="w-4 h-4" /> },
        { path: '/admin/audit-logs', label: 'Audit Trail', icon: <ShieldCheck className="w-4 h-4" /> },
        { path: '/profile', label: 'Settings', icon: <Settings className="w-4 h-4" /> },
      ];
    }

    // 2. HR MANAGER SIDEBAR (Exact Specification)
    if (isManager) {
      return [
        { path: '/hr-manager/dashboard', label: 'Dashboard', icon: <LayoutDashboard className="w-4 h-4" /> },
        { path: '/hr-manager/screening', label: 'Screening & Approvals', icon: <Target className="w-4 h-4" /> },
        { path: '/hr-manager/workload', label: 'Workload Distribution', icon: <Users className="w-4 h-4" /> },
        { path: '/hr-manager/final-selected', label: 'Final Round Selected', icon: <Award className="w-4 h-4" /> },
        { path: '/hr-manager/communications', label: 'Communication History', icon: <Mail className="w-4 h-4" /> },
        { path: '/hr-manager/reports', label: 'Hiring Reports', icon: <TrendingUp className="w-4 h-4" /> },
        { path: '/profile', label: 'Profile & Settings', icon: <Settings className="w-4 h-4" /> },
      ];
    }

    // 3. HR SPECIALIST SIDEBAR (Exact Specification)
    return [
      { path: '/hr/dashboard', label: 'Dashboard', icon: <LayoutDashboard className="w-4 h-4" /> },
      { path: '/hr/candidates', label: 'My Candidates', icon: <Users className="w-4 h-4" /> },
      { path: '/hr/round-1', label: 'Round 1', icon: <CircleDot className="w-4 h-4 text-amber-500" /> },
      { path: '/hr/round-2', label: 'Round 2', icon: <CircleDot className="w-4 h-4 text-blue-500" /> },
      { path: '/hr/evaluations', label: 'Interview Evaluations', icon: <FileCheck className="w-4 h-4" /> },
      { path: '/profile', label: 'Profile', icon: <Settings className="w-4 h-4" /> },
    ];
  };

  const navLinks = getNavigationLinks();

  const isActive = (path: string) => {
    if (path === '/dashboard') return location.pathname === '/dashboard';
    if (path === '/hr-manager/dashboard') return location.pathname === '/hr-manager/dashboard';
    if (path === '/hr/dashboard') return location.pathname === '/hr/dashboard';
    return location.pathname.startsWith(path);
  };

  const homeRoute = isAdmin ? '/dashboard' : isManager ? '/hr-manager/dashboard' : '/hr/dashboard';

  return (
    <>
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 z-40 lg:hidden bg-slate-900/40 backdrop-blur-sm"
        />
      )}

      <aside
        className={`fixed top-0 left-0 bottom-0 z-50 w-72 flex flex-col justify-between transition-all duration-200 border-r lg:translate-x-0 bg-white border-orange-100 shadow-sm ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex flex-col h-full overflow-hidden">
          {/* Brand Header */}
          <div className="h-16 px-5 flex items-center justify-between border-b border-orange-100 bg-white">
            <Link to={homeRoute} className="flex items-center gap-3 group">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-amber-500 via-orange-500 to-amber-600 flex items-center justify-center text-white font-black text-lg shadow-sm shadow-orange-500/30 group-hover:scale-105 transition-all">
                A
              </div>
              <div>
                <span className="font-extrabold text-sm text-slate-900 tracking-tight block">
                  Adyapan Career
                </span>
                <span className="text-[10px] font-bold text-orange-600 uppercase tracking-wider block">
                  {isHR ? 'HR Specialist Portal' : isManager ? 'HR Manager Portal' : 'Admin Control Panel'}
                </span>
              </div>
            </Link>
          </div>

          {/* Saffron & White Navigation Links */}
          <nav className="flex-1 px-3 py-4 overflow-y-auto space-y-1 scrollbar-thin">
            <div className="px-2 pb-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              {isHR ? 'HR Specialist' : isManager ? 'HR Manager' : 'Administration'}
            </div>

            {navLinks.map((item) => {
              const active = isActive(item.path);
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={onClose}
                  className={`flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold transition-all ${
                    active
                      ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-sm shadow-orange-500/25 font-extrabold'
                      : 'text-slate-700 hover:text-orange-600 hover:bg-orange-50/50'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <span className={active ? 'text-white' : 'text-slate-400'}>
                      {item.icon}
                    </span>
                    <span>{item.label}</span>
                  </div>
                </Link>
              );
            })}
          </nav>

          {/* User Profile & Meet at Bottom */}
          <div className="p-3.5 border-t border-orange-100 bg-white space-y-2.5">
            {user?.meetLink && (
              <a
                href={user.meetLink}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-between px-3 py-2 rounded-xl bg-orange-50 hover:bg-orange-100 border border-orange-200 text-xs font-bold text-orange-800 transition-all shadow-2xs"
              >
                <span className="flex items-center gap-2">
                  <Video className="w-3.5 h-3.5 text-orange-600" />
                  Google Meet Room
                </span>
                <ExternalLink className="w-3 h-3 text-orange-600" />
              </a>
            )}

            <div className="flex items-center justify-between pt-1">
              <div className="flex items-center gap-2.5 truncate">
                <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-orange-500 to-amber-500 text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-sm">
                  {user?.name?.[0] || 'U'}
                </div>
                <div className="truncate">
                  <p className="text-xs font-bold text-slate-900 truncate">{user?.name}</p>
                  <span className="text-[10px] font-semibold text-orange-700 block truncate">
                    {user?.role === 'ADMIN' ? 'Administrator' : user?.role === 'HR_MANAGER' ? 'HR Manager' : 'HR Specialist'}
                  </span>
                </div>
              </div>

              <button
                onClick={logout}
                className="p-2 rounded-xl text-slate-400 hover:text-red-600 hover:bg-red-50 transition-all border border-slate-200"
                title="Sign Out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
