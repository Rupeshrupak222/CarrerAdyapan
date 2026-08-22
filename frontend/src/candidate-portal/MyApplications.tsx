import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCandidateAuth } from '../context/CandidateAuthContext';
import { useTheme } from '../context/ThemeContext';
import { CandidateApplication } from '../services/candidateAuthService';
import CandidateNavbar from '../components/layout/CandidateNavbar';
import Footer from '../components/layout/Footer';
import toast from 'react-hot-toast';

const STATUS_CONFIG: Record<string, { label: string; step: number; color: string; badgeBg: string }> = {
  PENDING: { label: 'Application Submitted', step: 1, color: 'text-amber-700 dark:text-amber-300', badgeBg: 'bg-amber-500/15 border-amber-500/30' },
  AI_SCREENED: { label: 'Under Review', step: 2, color: 'text-blue-700 dark:text-blue-300', badgeBg: 'bg-blue-500/15 border-blue-500/30' },
  SHORTLISTED: { label: 'Shortlisted for Next Round', step: 3, color: 'text-emerald-700 dark:text-emerald-300', badgeBg: 'bg-emerald-500/15 border-emerald-500/30' },
  INTERVIEW: { label: 'Interview Scheduled', step: 4, color: 'text-purple-700 dark:text-purple-300', badgeBg: 'bg-purple-500/15 border-purple-500/30' },
  OFFERED: { label: 'Offer Letter Extended', step: 5, color: 'text-amber-700 dark:text-amber-300', badgeBg: 'bg-amber-500/20 border-amber-500/40' },
  HIRED: { label: 'Hired & Offer Accepted', step: 6, color: 'text-emerald-700 dark:text-emerald-300', badgeBg: 'bg-emerald-500/20 border-emerald-500/40' },
  REJECTED: { label: 'Not Selected', step: 1, color: 'text-red-700 dark:text-red-300', badgeBg: 'bg-red-500/15 border-red-500/30' },
};

const PROGRESS_STEPS = [
  'Applied',
  'Reviewed',
  'Shortlisted',
  'Interview',
  'Offer',
  'Hired',
];

const MyApplications = () => {
  const { candidate, logout, getMyApplications, updateProfile } = useCandidateAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();

  const [applications, setApplications] = useState<CandidateApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'applications' | 'profile'>('applications');
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);

  // Profile Edit State
  const [profileForm, setProfileForm] = useState({
    firstName: '',
    lastName: '',
    phone: '',
    location: '',
    currentPosition: '',
    currentCompany: '',
    linkedin: '',
    portfolio: '',
  });
  const [savingProfile, setSavingProfile] = useState(false);

  useEffect(() => {
    if (!candidate) {
      navigate('/login?redirect=/my-applications');
      return;
    }
    loadApplications();
    setProfileForm({
      firstName: candidate.firstName || '',
      lastName: candidate.lastName || '',
      phone: candidate.phone || '',
      location: candidate.location || '',
      currentPosition: candidate.currentPosition || '',
      currentCompany: candidate.currentCompany || '',
      linkedin: candidate.linkedin || '',
      portfolio: candidate.portfolio || '',
    });
  }, [candidate]);

  const loadApplications = async () => {
    setLoading(true);
    try {
      const apps = await getMyApplications();
      setApplications(apps || []);
    } catch {
      setApplications([]);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/careers');
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingProfile(true);
    const res = await updateProfile(profileForm);
    if (res.success) {
      toast.success('Profile updated successfully!');
    } else {
      toast.error(res.error || 'Failed to update profile');
    }
    setSavingProfile(false);
  };

  const formatDate = (dateStr: string) => {
    try {
      return new Date(dateStr).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
    } catch {
      return dateStr;
    }
  };

  if (!candidate) return null;

  return (
    <div className={`min-h-screen font-sans antialiased transition-colors relative overflow-x-hidden ${theme === 'dark' ? 'bg-[#0a0a1a] text-slate-100' : 'bg-slate-50/50 text-slate-900'
      }`}>

      {/* Full-Page Right-to-Left Orange Glow */}
      <div className="fixed top-0 right-0 w-[55vw] max-w-[800px] h-full pointer-events-none bg-gradient-to-l from-orange-400/15 via-amber-200/10 to-transparent dark:from-amber-500/10 dark:via-amber-900/5 dark:to-transparent blur-3xl z-0" />

      {/* ===== 1. UNIFIED CAREERS PORTAL NAV ===== */}
      <CandidateNavbar activePage="applications" />

      {/* ===== 2. HERO GRADIENT HEADER ===== */}
      <section className="relative overflow-hidden bg-gradient-to-r from-[#18181b] via-[#78350f] via-50% to-[#d97706] text-white py-12 sm:py-16 px-4 sm:px-8 border-b border-amber-500/30 shadow-xl">
        <div className="absolute -top-24 right-0 w-[500px] h-[500px] bg-amber-400/30 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 right-1/4 w-[350px] h-[350px] bg-orange-500/25 rounded-full blur-2xl pointer-events-none" />

        <div className="max-w-7xl mx-auto space-y-3 relative z-10">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 bg-amber-400 text-slate-950 rounded-full text-[11px] font-black uppercase tracking-wider shadow-md">
            ● CANDIDATE DASHBOARD
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-white leading-tight drop-shadow-sm">
            Welcome back, {candidate.firstName}!
          </h1>

          <p className="text-sm sm:text-base text-white font-medium max-w-2xl leading-relaxed drop-shadow-sm">
            Track your active job applications, ATS screening status, interview schedules, and offer letters in real time.
          </p>
        </div>
      </section>

      {/* ===== 3. MAIN DASHBOARD CONTENT ===== */}
      <main className="max-w-7xl mx-auto px-4 sm:px-8 py-10 relative z-10 space-y-8">

        {/* Navigation Tabs */}
        <div className="flex items-center justify-between flex-wrap gap-4 border-b border-slate-200 dark:border-slate-800 pb-4">
          <div className={`flex gap-1.5 p-1 rounded-2xl border ${theme === 'dark' ? 'bg-slate-900 border-slate-800' : 'bg-white border-amber-200/80 shadow-sm'
            }`}>
            <button
              onClick={() => setActiveTab('applications')}
              className={`px-5 py-2.5 rounded-xl text-xs font-black transition-all cursor-pointer ${activeTab === 'applications'
                  ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20 scale-[1.02]'
                  : theme === 'dark' ? 'text-slate-400 hover:text-white' : 'text-slate-600 hover:text-slate-900'
                }`}
            >
              My Applications ({applications.length})
            </button>
            <button
              onClick={() => setActiveTab('profile')}
              className={`px-5 py-2.5 rounded-xl text-xs font-black transition-all cursor-pointer ${activeTab === 'profile'
                  ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20 scale-[1.02]'
                  : theme === 'dark' ? 'text-slate-400 hover:text-white' : 'text-slate-600 hover:text-slate-900'
                }`}
            >
              My Profile & Resume
            </button>
          </div>

          <Link
            to="/open-positions"
            className="px-5 py-2.5 rounded-xl text-xs font-extrabold text-slate-950 bg-gradient-to-r from-amber-400 via-amber-500 to-orange-500 hover:from-amber-300 hover:to-orange-400 transition-all shadow-md flex items-center gap-1.5"
          >
            <span>+ Apply for Another Job</span>
          </Link>
        </div>

        {/* TAB 1: APPLICATIONS LIST */}
        {activeTab === 'applications' && (
          <div className="space-y-6">
            {loading ? (
              <div className="space-y-4">
                {[1, 2].map((n) => (
                  <div key={n} className={`h-36 rounded-3xl animate-pulse border ${theme === 'dark' ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
                    }`} />
                ))}
              </div>
            ) : applications.length === 0 ? (
              <div className={`text-center py-20 px-6 rounded-3xl border space-y-4 ${theme === 'dark' ? 'bg-slate-900/60 border-slate-800' : 'bg-white border-amber-200/80 shadow-md'
                }`}>
                <div className="w-16 h-16 rounded-3xl bg-amber-500/15 text-amber-600 dark:text-amber-400 flex items-center justify-center mx-auto shadow-inner">
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                  No Active Applications Yet
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto">
                  You haven't submitted any job applications yet. Browse our live openings across Sales, Technology, and Counseling to get started!
                </p>
                <Link
                  to="/open-positions"
                  className="inline-block px-7 py-3 rounded-full text-xs font-black text-slate-950 bg-gradient-to-r from-amber-400 via-amber-500 to-orange-500 hover:from-amber-300 hover:to-orange-400 shadow-lg shadow-amber-500/25 uppercase tracking-wider"
                >
                  Explore Open Positions →
                </Link>
              </div>
            ) : (
              <div className="space-y-6">
                {applications.map((app) => {
                  const statusInfo = STATUS_CONFIG[app.status] || STATUS_CONFIG.PENDING;
                  const targetJob = app.job || { title: 'Position at Adyapan', department: 'EdTech', location: 'Hyderabad' };
                  const currentStep = statusInfo.step;

                  return (
                    <div
                      key={app.id}
                      className={`p-6 sm:p-8 rounded-3xl border transition-all space-y-6 ${theme === 'dark'
                          ? 'bg-slate-900/90 border-slate-800 shadow-xl'
                          : 'bg-white border-amber-200/80 shadow-xl shadow-amber-500/5'
                        }`}
                    >
                      {/* Top Header info */}
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div>
                          <div className="flex flex-wrap items-center gap-2 mb-2">
                            <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-amber-500/15 text-amber-800 dark:text-amber-300 border border-amber-500/30">
                              {targetJob.department || 'EdTech Growth'}
                            </span>
                            <span className={`px-3 py-1 rounded-full text-[10px] font-black border ${statusInfo.badgeBg} ${statusInfo.color}`}>
                              ● {statusInfo.label}
                            </span>
                          </div>

                          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
                            {targetJob.title}
                          </h2>

                          <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 dark:text-slate-400 font-semibold mt-1">
                            <span>{targetJob.location || 'Hyderabad / Pan-India'}</span>
                            <span>•</span>
                            <span>Applied: {formatDate(app.appliedAt)}</span>
                            {app.aiScore && (
                              <>
                                <span>•</span>
                                <span className="font-extrabold text-emerald-600 dark:text-emerald-400">
                                  Match Score: {Math.round(app.aiScore)}%
                                </span>
                              </>
                            )}
                          </div>
                        </div>

                        {/* Action buttons */}
                        <div className="shrink-0 flex items-center gap-2">
                          <Link
                            to={`/careers/${(targetJob as any).slug || (targetJob as any).id || ''}`}
                            className={`px-4 py-2 rounded-xl text-xs font-bold border transition-colors ${theme === 'dark'
                                ? 'border-slate-700 text-slate-300 hover:bg-slate-800'
                                : 'border-slate-200 text-slate-700 hover:bg-slate-100'
                              }`}
                          >
                            View Role Specifications ↗
                          </Link>
                        </div>
                      </div>

                      {/* 6-Step Hiring Funnel Progress Bar */}
                      <div className="space-y-2 pt-2">
                        <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                          {PROGRESS_STEPS.map((stepName, idx) => {
                            const isCompleted = currentStep > idx + 1;
                            const isCurrent = currentStep === idx + 1;
                            return (
                              <div key={stepName} className="space-y-1.5 text-center">
                                <div className={`h-2.5 rounded-full transition-all ${isCompleted || isCurrent
                                    ? 'bg-gradient-to-r from-amber-400 to-orange-500 shadow-md shadow-amber-500/20'
                                    : theme === 'dark' ? 'bg-slate-800' : 'bg-slate-200'
                                  }`} />
                                <span className={`text-[10px] font-black uppercase tracking-wider block truncate ${isCurrent
                                    ? 'text-amber-500 font-black'
                                    : isCompleted
                                      ? theme === 'dark' ? 'text-slate-300' : 'text-slate-700'
                                      : 'text-slate-400'
                                  }`}>
                                  {stepName}
                                </span>
                              </div>
                            );
                          })}
                        </div>
                      </div>

                      {/* Scheduled Interviews Box if any */}
                      {app.interviews && app.interviews.length > 0 && (
                        <div className={`p-5 rounded-2xl border space-y-3 ${theme === 'dark' ? 'bg-slate-950/80 border-purple-500/40 text-white' : 'bg-purple-50/50 border-purple-200 text-slate-900'
                          }`}>
                          <div className="flex items-center gap-2">
                            <h4 className="text-xs font-black uppercase tracking-wider text-purple-600 dark:text-purple-400">
                              Interview Rounds Scheduled:
                            </h4>
                          </div>

                          <div className="space-y-2">
                            {app.interviews.map((iv: any) => (
                              <div
                                key={iv.id}
                                className={`p-3 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs font-bold ${theme === 'dark' ? 'bg-slate-900 border-slate-800' : 'bg-white border-purple-200 shadow-sm'
                                  }`}
                              >
                                <div>
                                  <p className="font-extrabold text-sm">{iv.type || 'Technical & Cultural Round'}</p>
                                  <p className="text-[11px] text-slate-500 mt-0.5">
                                    {formatDate(iv.scheduledAt)} • Status: <span className="text-purple-500">{iv.status || 'SCHEDULED'}</span>
                                  </p>
                                </div>
                                {iv.meetingLink && (
                                  <a
                                    href={iv.meetingLink}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-black text-center transition-all shadow-md"
                                  >
                                    Join Meeting ↗
                                  </a>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Offer Letter Box if Extended */}
                      {app.offer && (
                        <div className={`p-5 rounded-2xl border space-y-3 ${theme === 'dark' ? 'bg-slate-950/80 border-emerald-500/40' : 'bg-emerald-50/50 border-emerald-200'
                          }`}>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <h4 className="text-xs font-black uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                                Official Offer Letter Extended
                              </h4>
                            </div>
                            <span className="px-3 py-1 rounded-full text-[10px] font-black bg-emerald-500 text-slate-950">
                              {app.offer.status}
                            </span>
                          </div>
                          <p className="text-xs text-slate-600 dark:text-slate-300 font-semibold">
                            Annual CTC: <strong className="text-emerald-600 dark:text-emerald-400">₹{(app.offer.salary / 100000).toFixed(1)} LPA</strong> • Expected Joining: {formatDate(app.offer.joiningDate)}
                          </p>
                        </div>
                      )}

                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* TAB 2: PROFILE & RESUME */}
        {activeTab === 'profile' && (
          <div className={`p-8 rounded-3xl border space-y-6 ${theme === 'dark' ? 'bg-slate-900/90 border-slate-800 shadow-xl' : 'bg-white border-amber-200/80 shadow-xl'
            }`}>
            <div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                Candidate Profile Details
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Keep your contact details and professional profiles up-to-date for Adyapan recruiters.
              </p>
            </div>

            <form onSubmit={handleSaveProfile} className="space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label className="block text-xs font-bold mb-1.5">First Name</label>
                  <input
                    type="text"
                    value={profileForm.firstName}
                    onChange={(e) => setProfileForm({ ...profileForm, firstName: e.target.value })}
                    className={`w-full px-4 py-3 rounded-xl text-xs font-semibold border ${theme === 'dark' ? 'bg-slate-950 border-slate-700 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
                      }`}
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold mb-1.5">Last Name</label>
                  <input
                    type="text"
                    value={profileForm.lastName}
                    onChange={(e) => setProfileForm({ ...profileForm, lastName: e.target.value })}
                    className={`w-full px-4 py-3 rounded-xl text-xs font-semibold border ${theme === 'dark' ? 'bg-slate-950 border-slate-700 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
                      }`}
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold mb-1.5">Email Address</label>
                  <input
                    type="email"
                    disabled
                    value={candidate.email}
                    className={`w-full px-4 py-3 rounded-xl text-xs font-semibold border opacity-60 cursor-not-allowed ${theme === 'dark' ? 'bg-slate-950 border-slate-700 text-white' : 'bg-slate-100 border-slate-200 text-slate-900'
                      }`}
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold mb-1.5">Mobile Number</label>
                  <input
                    type="tel"
                    value={profileForm.phone}
                    onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
                    placeholder="+91 98765 43210"
                    className={`w-full px-4 py-3 rounded-xl text-xs font-semibold border ${theme === 'dark' ? 'bg-slate-950 border-slate-700 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
                      }`}
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold mb-1.5">Current Location</label>
                  <input
                    type="text"
                    value={profileForm.location}
                    onChange={(e) => setProfileForm({ ...profileForm, location: e.target.value })}
                    placeholder="e.g. Hyderabad, Telangana"
                    className={`w-full px-4 py-3 rounded-xl text-xs font-semibold border ${theme === 'dark' ? 'bg-slate-950 border-slate-700 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
                      }`}
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold mb-1.5">LinkedIn Profile</label>
                  <input
                    type="url"
                    value={profileForm.linkedin}
                    onChange={(e) => setProfileForm({ ...profileForm, linkedin: e.target.value })}
                    placeholder="https://linkedin.com/in/..."
                    className={`w-full px-4 py-3 rounded-xl text-xs font-semibold border ${theme === 'dark' ? 'bg-slate-950 border-slate-700 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
                      }`}
                  />
                </div>
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  type="submit"
                  disabled={savingProfile}
                  className="px-7 py-3 rounded-xl text-xs font-black text-slate-950 bg-gradient-to-r from-amber-400 via-amber-500 to-orange-500 hover:from-amber-300 hover:to-orange-400 transition-all shadow-md uppercase tracking-wider cursor-pointer"
                >
                  {savingProfile ? 'Saving Changes...' : 'Save Profile Changes'}
                </button>
              </div>
            </form>
          </div>
        )}

      </main>

      {/* ===== 4. FOOTER ===== */}
      <Footer isPublic={true} />

    </div>
  );
};

export default MyApplications;
