import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCandidateAuth } from '../context/CandidateAuthContext';
import { useTheme } from '../context/ThemeContext';
import { CandidateApplication } from '../services/candidateAuthService';
import AdyapanLogo from '../components/common/AdyapanLogo';

const statusConfig: Record<string, { label: string; color: string; bg: string }> = {
  PENDING: { label: 'Pending Review', color: 'text-yellow-700 dark:text-yellow-300', bg: 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800' },
  AI_SCREENED: { label: 'Under Review', color: 'text-blue-700 dark:text-blue-300', bg: 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800' },
  SHORTLISTED: { label: 'Shortlisted', color: 'text-emerald-700 dark:text-emerald-300', bg: 'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800' },
  INTERVIEW: { label: 'Interview Stage', color: 'text-purple-700 dark:text-purple-300', bg: 'bg-purple-50 dark:bg-purple-900/20 border-purple-200 dark:border-purple-800' },
  OFFERED: { label: 'Offer Extended', color: 'text-amber-700 dark:text-amber-300', bg: 'bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800' },
  HIRED: { label: 'Hired', color: 'text-green-700 dark:text-green-300', bg: 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800' },
  REJECTED: { label: 'Not Selected', color: 'text-red-700 dark:text-red-300', bg: 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800' },
};

const getStatusInfo = (status: string) => {
  return statusConfig[status] || { label: status, color: 'text-slate-700 dark:text-slate-300', bg: 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700' };
};

const MyApplications = () => {
  const { candidate, logout, getMyApplications } = useCandidateAuth();
  const { theme } = useTheme();
  const navigate = useNavigate();
  const [applications, setApplications] = useState<CandidateApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'applications' | 'profile'>('applications');

  useEffect(() => {
    if (!candidate) {
      navigate('/login');
      return;
    }
    loadApplications();
  }, [candidate]);

  const loadApplications = async () => {
    setLoading(true);
    const apps = await getMyApplications();
    setApplications(apps);
    setLoading(false);
  };

  const handleLogout = () => {
    logout();
    navigate('/careers');
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  if (!candidate) return null;

  return (
    <div className={`min-h-screen font-sans antialiased transition-colors ${theme === 'dark' ? 'bg-slate-950 text-white' : 'bg-slate-50 text-slate-900'}`}>
      
      {/* Header */}
      <nav className={`sticky top-0 z-50 px-6 py-3.5 border-b backdrop-blur-xl ${theme === 'dark' ? 'bg-slate-950/90 border-slate-800' : 'bg-white/90 border-slate-200'}`}>
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <Link to="/careers" className="flex items-center gap-2">
            <AdyapanLogo variant={theme === 'dark' ? 'dark' : 'light'} size="small" />
          </Link>
          <div className="flex items-center gap-4">
            <Link to="/careers" className={`text-sm font-medium hover:text-amber-500 transition-colors ${theme === 'dark' ? 'text-slate-300' : 'text-slate-600'}`}>
              Browse Jobs
            </Link>
            <div className="flex items-center gap-3">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${theme === 'dark' ? 'bg-amber-500/20 text-amber-300' : 'bg-amber-100 text-amber-700'}`}>
                {candidate.firstName?.[0]?.toUpperCase() || 'C'}
              </div>
              <span className={`text-sm font-medium hidden sm:inline ${theme === 'dark' ? 'text-slate-200' : 'text-slate-700'}`}>
                {candidate.firstName} {candidate.lastName}
              </span>
              <button
                onClick={handleLogout}
                className={`text-xs font-medium px-3 py-1.5 rounded-lg border transition-colors ${theme === 'dark' ? 'border-slate-700 text-slate-400 hover:text-red-400 hover:border-red-800' : 'border-slate-200 text-slate-500 hover:text-red-600 hover:border-red-200'}`}
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
        
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold mb-1">
            Hello, {candidate.firstName}!
          </h1>
          <p className={`text-sm ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>
            Track your job applications and stay updated on your hiring progress.
          </p>
        </div>

        {/* Tabs */}
        <div className={`flex gap-1 p-1 rounded-xl mb-8 w-fit ${theme === 'dark' ? 'bg-slate-900' : 'bg-slate-100'}`}>
          <button
            onClick={() => setActiveTab('applications')}
            className={`px-5 py-2 rounded-lg text-sm font-semibold transition-all ${activeTab === 'applications'
              ? 'bg-amber-500 text-white shadow-md'
              : theme === 'dark' ? 'text-slate-400 hover:text-white' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            My Applications ({applications.length})
          </button>
          <button
            onClick={() => setActiveTab('profile')}
            className={`px-5 py-2 rounded-lg text-sm font-semibold transition-all ${activeTab === 'profile'
              ? 'bg-amber-500 text-white shadow-md'
              : theme === 'dark' ? 'text-slate-400 hover:text-white' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            My Profile
          </button>
        </div>

        {/* Applications Tab */}
        {activeTab === 'applications' && (
          <div className="space-y-4">
            {loading ? (
              <div className="space-y-4">
                {[1, 2, 3].map((n) => (
                  <div key={n} className={`h-32 rounded-2xl animate-pulse ${theme === 'dark' ? 'bg-slate-900' : 'bg-slate-100'}`} />
                ))}
              </div>
            ) : applications.length === 0 ? (
              <div className={`text-center py-16 rounded-2xl border ${theme === 'dark' ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
                <div className="text-4xl mb-4">📋</div>
                <h3 className="text-lg font-bold mb-2">No Applications Yet</h3>
                <p className={`text-sm mb-6 ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>
                  You haven't applied to any jobs yet. Start exploring open positions!
                </p>
                <Link
                  to="/careers"
                  className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold text-white bg-amber-500 hover:bg-amber-600 transition-all shadow-md"
                >
                  Browse Open Positions →
                </Link>
              </div>
            ) : (
              applications.map((app) => {
                const statusInfo = getStatusInfo(app.status);
                return (
                  <div
                    key={app.id}
                    className={`p-6 rounded-2xl border transition-all hover:shadow-md ${theme === 'dark' ? 'bg-slate-900 border-slate-800 hover:border-slate-700' : 'bg-white border-slate-200 hover:border-slate-300'}`}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-base font-bold truncate">{app.job?.title || 'Position'}</h3>
                          <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold border ${statusInfo.bg} ${statusInfo.color}`}>
                            {statusInfo.label}
                          </span>
                        </div>
                        <div className={`flex flex-wrap items-center gap-3 text-xs ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>
                          <span>{app.job?.department}</span>
                          <span>•</span>
                          <span>{app.job?.location}</span>
                          <span>•</span>
                          <span>{app.job?.type === 'FULL_TIME' ? 'Full Time' : app.job?.type}</span>
                        </div>
                        <div className={`mt-3 flex flex-wrap items-center gap-4 text-xs ${theme === 'dark' ? 'text-slate-500' : 'text-slate-400'}`}>
                          <span>Applied: {formatDate(app.appliedAt)}</span>
                          {app.aiScore && (
                            <span className={`font-semibold ${app.aiScore >= 80 ? 'text-emerald-500' : app.aiScore >= 60 ? 'text-amber-500' : 'text-slate-400'}`}>
                              Match Score: {Math.round(app.aiScore)}%
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Interview info if available */}
                      {app.interviews && app.interviews.length > 0 && (
                        <div className={`sm:text-right shrink-0 p-3 rounded-xl ${theme === 'dark' ? 'bg-purple-900/20 border border-purple-800' : 'bg-purple-50 border border-purple-100'}`}>
                          <p className="text-xs font-semibold text-purple-600 dark:text-purple-300 mb-0.5">Interview Scheduled</p>
                          <p className={`text-xs ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>
                            {formatDate(app.interviews[0].scheduledAt)}
                          </p>
                          <p className={`text-xs capitalize ${theme === 'dark' ? 'text-slate-500' : 'text-slate-400'}`}>
                            {app.interviews[0].type?.toLowerCase()} round
                          </p>
                        </div>
                      )}

                      {/* Offer info if available */}
                      {app.offer && (
                        <div className={`sm:text-right shrink-0 p-3 rounded-xl ${theme === 'dark' ? 'bg-amber-900/20 border border-amber-800' : 'bg-amber-50 border border-amber-100'}`}>
                          <p className="text-xs font-semibold text-amber-600 dark:text-amber-300 mb-0.5">Offer Details</p>
                          <p className={`text-xs font-bold ${theme === 'dark' ? 'text-slate-200' : 'text-slate-700'}`}>
                            ₹{app.offer.salary?.toLocaleString('en-IN')} / year
                          </p>
                          <p className={`text-xs ${theme === 'dark' ? 'text-slate-500' : 'text-slate-400'}`}>
                            Status: {app.offer.status}
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Progress Bar */}
                    <div className="mt-4">
                      <div className={`flex items-center gap-1 ${theme === 'dark' ? 'text-slate-600' : 'text-slate-300'}`}>
                        {['PENDING', 'AI_SCREENED', 'SHORTLISTED', 'INTERVIEW', 'OFFERED', 'HIRED'].map((step, idx) => {
                          const steps = ['PENDING', 'AI_SCREENED', 'SHORTLISTED', 'INTERVIEW', 'OFFERED', 'HIRED'];
                          const currentIdx = steps.indexOf(app.status);
                          const isCompleted = idx <= currentIdx && app.status !== 'REJECTED';
                          const isRejected = app.status === 'REJECTED';
                          return (
                            <div key={step} className="flex-1">
                              <div className={`h-1.5 rounded-full transition-all ${isRejected ? 'bg-red-200 dark:bg-red-900/30' : isCompleted ? 'bg-amber-500' : theme === 'dark' ? 'bg-slate-800' : 'bg-slate-200'}`} />
                            </div>
                          );
                        })}
                      </div>
                      <div className={`flex justify-between mt-1.5 text-[10px] font-medium ${theme === 'dark' ? 'text-slate-600' : 'text-slate-400'}`}>
                        <span>Applied</span>
                        <span>Reviewed</span>
                        <span>Shortlisted</span>
                        <span>Interview</span>
                        <span>Offer</span>
                        <span>Hired</span>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}

        {/* Profile Tab */}
        {activeTab === 'profile' && (
          <div className={`p-6 sm:p-8 rounded-2xl border ${theme === 'dark' ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
            <h2 className="text-lg font-bold mb-6">Profile Information</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <label className={`block text-xs font-semibold mb-1 ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>First Name</label>
                <p className="text-sm font-medium">{candidate.firstName || '-'}</p>
              </div>
              <div>
                <label className={`block text-xs font-semibold mb-1 ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>Last Name</label>
                <p className="text-sm font-medium">{candidate.lastName || '-'}</p>
              </div>
              <div>
                <label className={`block text-xs font-semibold mb-1 ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>Email</label>
                <p className="text-sm font-medium">{candidate.email}</p>
              </div>
              <div>
                <label className={`block text-xs font-semibold mb-1 ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>Phone</label>
                <p className="text-sm font-medium">{candidate.phone || '-'}</p>
              </div>
              <div>
                <label className={`block text-xs font-semibold mb-1 ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>Location</label>
                <p className="text-sm font-medium">{candidate.location || '-'}</p>
              </div>
              <div>
                <label className={`block text-xs font-semibold mb-1 ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>Current Company</label>
                <p className="text-sm font-medium">{candidate.currentCompany || '-'}</p>
              </div>
              <div>
                <label className={`block text-xs font-semibold mb-1 ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>Current Position</label>
                <p className="text-sm font-medium">{candidate.currentPosition || '-'}</p>
              </div>
              <div>
                <label className={`block text-xs font-semibold mb-1 ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>LinkedIn</label>
                <p className="text-sm font-medium">
                  {candidate.linkedin ? (
                    <a href={candidate.linkedin} target="_blank" rel="noreferrer" className="text-amber-500 hover:underline">{candidate.linkedin}</a>
                  ) : '-'}
                </p>
              </div>
            </div>
            {candidate.skills && candidate.skills.length > 0 && (
              <div className="mt-6">
                <label className={`block text-xs font-semibold mb-2 ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>Skills</label>
                <div className="flex flex-wrap gap-2">
                  {candidate.skills.map((skill, i) => (
                    <span key={i} className={`px-3 py-1 rounded-full text-xs font-medium border ${theme === 'dark' ? 'bg-slate-800 border-slate-700 text-slate-300' : 'bg-slate-100 border-slate-200 text-slate-700'}`}>
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            )}
            <div className="mt-6 pt-6 border-t border-slate-200 dark:border-slate-800">
              <p className={`text-xs ${theme === 'dark' ? 'text-slate-500' : 'text-slate-400'}`}>
                Member since {candidate.createdAt ? formatDate(candidate.createdAt) : 'recently'}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MyApplications;
