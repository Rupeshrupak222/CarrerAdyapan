import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import DashboardLayout from '../../components/layout/DashboardLayout';
import StatCard from '../../components/analytics/StatCard';
import { analyticsService } from '../../services/analyticsService';
import { jobService } from '../../services/jobService';
import { offerService } from '../../services/offerService';
import { candidateService } from '../../services/candidateService';
import { getStoredCandidates, getStoredOffers } from '../../utils/applicationStore';
import toast from 'react-hot-toast';
import { StatCardSkeleton, ChartSkeleton, JobListSkeleton } from '../../components/common/SkeletonLoaders';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, Cell } from 'recharts';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';

const DEFAULT_FUNNEL = [
  { stage: 'Applied', count: 0 },
  { stage: 'AI Screened', count: 0 },
  { stage: 'Shortlisted', count: 0 },
  { stage: 'Interviewed', count: 0 },
  { stage: 'Offer Extended', count: 0 },
  { stage: 'Hired', count: 0 }
];

const FALLBACK_JOBS = [];

const FALLBACK_SELECTED_CANDIDATES = [];

const Dashboard = () => {
  const { user } = useAuth();
  const { theme } = useTheme();

  const [stats, setStats] = useState({
    totalApplications: 0,
    aiScreened: 0,
    shortlisted: 0,
    interviewed: 0,
    offersSent: 0,
    hired: 0,
    jobs: 0,
    averageScore: 88,
    timeSaved: 0
  });
  const [funnelData, setFunnelData] = useState(DEFAULT_FUNNEL);
  const [recentJobs, setRecentJobs] = useState([]);
  const [selectedCandidates, setSelectedCandidates] = useState([]);
  const [sendingWelcomeId, setSendingWelcomeId] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardDataParallel();
    loadSelectedCandidates();

    const handleDataUpdate = () => {
      fetchDashboardDataParallel();
      loadSelectedCandidates();
    };

    window.addEventListener('adyapan_data_updated', handleDataUpdate);
    window.addEventListener('storage', handleDataUpdate);

    return () => {
      window.removeEventListener('adyapan_data_updated', handleDataUpdate);
      window.removeEventListener('storage', handleDataUpdate);
    };
  }, []);

  const loadSelectedCandidates = async () => {
    try {
      const res = await offerService.getAllOffers().catch(() => null);
      const dbOffers = res?.offers || [];
      const localOffers = getStoredOffers();

      const combinedMap = new Map();
      [...localOffers, ...dbOffers].forEach((o) => {
        if (o && (o.id || o.candidateName)) {
          const key = o.candidateName ? o.candidateName.toLowerCase().trim().replace(/\s+/g, ' ') : o.id;
          combinedMap.set(key, o);
        }
      });

      const uniqueOffers = Array.from(combinedMap.values());
      const hiredList = uniqueOffers.filter(
        (o) => !o.status || o.status === 'ACCEPTED' || o.status === 'READY_TO_SEND' || o.status === 'SENT' || o.status === 'APPROVED'
      );

      const mapped = hiredList.map((o, idx) => ({
        id: o.id || `hired-${idx}`,
        candidateName: o.candidateName || 'Candidate',
        email: o.email || o.candidateEmail || 'candidate@example.com',
        phone: o.phone || '+91 98765-43210',
        jobTitle: o.jobTitle || 'Senior Business Development Associate',
        department: o.department || 'EdTech Growth',
        salary: o.stipend || (typeof o.salary === 'number' ? `INR ${o.salary}/-PerMonth` : o.salary) || 'INR 20000/-PerMonth',
        bonus: o.bonus || 100000,
        joiningDate: o.trainingStartDate || (o.joiningDate ? String(o.joiningDate).split('T')[0] : '25-Aug-2026'),
        status: o.status === 'ACCEPTED' ? 'HIRED & ONBOARDING' : 'OFFER EXTENDED',
        onboardingProgress: o.status === 'ACCEPTED' ? 85 : 50,
        milestones: [
          { name: 'Offer Letter Signed', done: true },
          { name: 'Background Audit', done: true },
          { name: 'IT Laptop Allocation', done: o.status === 'ACCEPTED' },
          { name: 'Day 1 Orientation', done: false },
        ],
      }));

      setSelectedCandidates(mapped);
    } catch (e) {
      console.warn('Selected candidates load error:', e);
      setSelectedCandidates([]);
    }
  };

  const handleSendWelcomeEmail = async (cand) => {
    setSendingWelcomeId(cand.id);
    try {
      await offerService.sendWelcomeEmail({
        candidateName: cand.candidateName,
        candidateEmail: cand.email,
        jobTitle: cand.jobTitle,
        joiningDate: cand.joiningDate,
      });
      toast.success(`Welcome Onboarding Package Email dispatched via Resend to ${cand.email}! 🚀✉️`);
    } catch (e) {
      toast.error('Failed to send welcome email');
    } finally {
      setSendingWelcomeId(null);
    }
  };

  const fetchDashboardDataParallel = async () => {
    try {
      const [statsRes, funnelRes, jobsRes, offersRes, candRes] = await Promise.allSettled([
        analyticsService.getDashboardStats(true),
        analyticsService.getHiringFunnel(true),
        jobService.getAllJobs(true),
        offerService.getAllOffers(),
        candidateService.getAllCandidates(true),
      ]);

      const localOffers = getStoredOffers();
      const localCandidates = getStoredCandidates();

      const dbOffers = offersRes.status === 'fulfilled' ? (offersRes.value?.offers || []) : [];
      const allOffersMap = new Map();
      [...localOffers, ...dbOffers].forEach((o) => {
        if (o && (o.id || o.candidateName)) {
          const key = o.candidateName ? o.candidateName.toLowerCase().trim().replace(/\s+/g, ' ') : o.id;
          allOffersMap.set(key, o);
        }
      });
      const uniqueOffers = Array.from(allOffersMap.values());
      const activeOffersCount = uniqueOffers.filter((o) => o.status !== 'REJECTED').length;
      const hiredCount = uniqueOffers.filter((o) => !o.status || o.status === 'ACCEPTED' || o.status === 'READY_TO_SEND' || o.status === 'SENT' || o.status === 'APPROVED').length;

      let fetchedStats = statsRes.status === 'fulfilled' && statsRes.value ? statsRes.value : {};
      let dbJobs = jobsRes.status === 'fulfilled' && Array.isArray(jobsRes.value?.jobs) ? jobsRes.value.jobs : [];
      let dbCandidates = candRes.status === 'fulfilled' && Array.isArray(candRes.value?.candidates) ? candRes.value.candidates : [];

      const totalCandCount = fetchedStats.totalApplications !== undefined && fetchedStats.totalApplications !== null
        ? fetchedStats.totalApplications
        : Math.max(dbCandidates.length, localCandidates.length);

      const aiScreenedCount = fetchedStats.aiScreened !== undefined && fetchedStats.aiScreened !== null
        ? fetchedStats.aiScreened
        : Math.max(dbCandidates.length, localCandidates.length);

      const computedStats = {
        totalApplications: totalCandCount,
        aiScreened: aiScreenedCount,
        shortlisted: fetchedStats.shortlisted ?? 0,
        interviewed: fetchedStats.interviewed ?? 0,
        offersSent: fetchedStats.offersSent ?? activeOffersCount,
        hired: fetchedStats.hired ?? hiredCount,
        jobs: fetchedStats.jobs ?? dbJobs.length,
        averageScore: fetchedStats.averageScore || 88,
        timeSaved: fetchedStats.timeSaved || 0,
      };

      setStats(computedStats);

      const dynamicFunnel = (funnelRes.status === 'fulfilled' && Array.isArray(funnelRes.value?.data) && funnelRes.value.data.length > 0)
        ? funnelRes.value.data
        : [
          { stage: 'Applied', count: computedStats.totalApplications },
          { stage: 'AI Screened', count: computedStats.aiScreened },
          { stage: 'Shortlisted', count: computedStats.shortlisted },
          { stage: 'Interviewed', count: computedStats.interviewed },
          { stage: 'Offer Extended', count: computedStats.offersSent },
          { stage: 'Hired', count: computedStats.hired },
        ];
      setFunnelData(dynamicFunnel);

      setRecentJobs(dbJobs);
    } catch (error) {
      console.warn('Dashboard fetch warning:', error);
      setRecentJobs([]);
    } finally {
      setLoading(false);
    }
  };

  const COLORS = ['#f59e0b', '#d97706', '#10b981', '#f59e0b', '#d97706', '#b45309'];

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Welcome Header Banner */}
        <div className={`p-6 md:p-8 rounded-3xl border transition-all flex flex-col md:flex-row md:items-center justify-between gap-6 relative overflow-hidden shadow-sm ${
          theme === 'dark' ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-amber-200/80 text-slate-900'
        }`}>
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500" />

          <div className="space-y-2 pt-1">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-amber-500/15 text-amber-700 dark:text-amber-300 border border-amber-500/30">
              🎓 ADYAPAN EDUTECH RECRUITMENT CONTROL CENTER
            </div>
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
              Welcome back, {user?.name || 'Recruiter'}! 👋
            </h1>
            <p className="text-xs text-slate-600 dark:text-slate-300 font-normal">
              AI Screening, Automated Interview Schedules, and Offer Letter Pipeline is fully operational.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <Link
              to="/candidates"
              className="px-4 py-2.5 text-xs font-bold text-white bg-amber-500 hover:bg-amber-600 rounded-xl shadow-sm transition-all flex items-center gap-1.5"
            >
              <span>👥</span> Review Candidates
            </Link>
            <Link
              to="/offers"
              className="px-4 py-2.5 text-xs font-semibold text-amber-700 dark:text-amber-300 bg-amber-500/15 border border-amber-500/30 hover:bg-amber-600/25 rounded-xl transition-all flex items-center gap-1.5"
            >
              <span>📄</span> Offer Letters
            </Link>
          </div>
        </div>

        {/* Metric Cards Grid */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCardSkeleton />
            <StatCardSkeleton />
            <StatCardSkeleton />
            <StatCardSkeleton />
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard title="Total Applications" value={stats.totalApplications} icon="📥" change="+14% this week" trend="up" color="amber" />
            <StatCard title="AI Screened & Qualified" value={stats.aiScreened} icon="⚡" change={`${stats.averageScore}% Avg AI Match`} trend="up" color="amber" />
            <StatCard title="Interviews Scheduled" value={stats.interviewed} icon="📅" change="Google Meet Synced" trend="neutral" color="amber" />
            <StatCard title="Hired Candidates" value={stats.hired} icon="🏆" change="Offers Accepted" trend="up" color="emerald" />
          </div>
        )}

        {/* Hired & Selected Candidates Section */}
        <div className={`p-6 rounded-3xl border shadow-sm space-y-5 relative overflow-hidden ${
          theme === 'dark' ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-amber-200/80 text-slate-900'
        }`}>
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500" />

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-3.5 pt-1">
            <div>
              <h2 className="text-base font-bold flex items-center gap-2">
                <span>🏆 Hired & Selected Candidates (Onboarding Control)</span>
                <span className="px-2.5 py-0.5 text-xs font-semibold bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30 rounded-full">
                  {selectedCandidates.length} Selected
                </span>
              </h2>
              <p className="text-xs font-normal text-slate-600 dark:text-slate-300 mt-0.5">
                Track hired candidates, view agreed compensation packages, onboarding milestones, and trigger welcome emails.
              </p>
            </div>
            <Link to="/offers" className="text-xs font-semibold text-amber-600 dark:text-amber-400 hover:underline shrink-0">
              Manage All Offers →
            </Link>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {selectedCandidates.length === 0 ? (
              <div className="p-6 text-center text-xs text-slate-500 dark:text-slate-400 col-span-2">
                No hired candidates yet. Accept offers in the Offers section to bring candidate profiles here.
              </div>
            ) : (
              selectedCandidates.map((cand) => (
                <div
                  key={cand.id}
                  className={`p-5 rounded-2xl border transition-all flex flex-col justify-between gap-4 ${
                    theme === 'dark' ? 'bg-slate-950 border-slate-800 hover:border-amber-500/30' : 'bg-slate-50 border-slate-200 hover:border-amber-300'
                  }`}
                >
                  <div className="space-y-3">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-2xl bg-amber-400 text-slate-950 font-bold flex items-center justify-center text-sm shadow-sm shrink-0">
                          {cand.candidateName.charAt(0)}
                        </div>
                        <div>
                          <h3 className="text-sm font-bold text-slate-900 dark:text-white">{cand.candidateName}</h3>
                          <p className="text-xs text-slate-600 dark:text-slate-300 font-normal">{cand.jobTitle}</p>
                        </div>
                      </div>

                      <span className="px-2.5 py-0.5 text-xs font-semibold bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30 rounded-full shrink-0">
                        ● {cand.status}
                      </span>
                    </div>

                    <div className={`p-3.5 rounded-xl border grid grid-cols-2 gap-2 text-xs font-normal ${
                      theme === 'dark' ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
                    }`}>
                      <div>
                        <span className="text-slate-400 block text-[10px] font-semibold uppercase">Agreed Compensation</span>
                        <span className="text-emerald-600 dark:text-emerald-400 font-bold">Fixed Base: ₹{cand.salary?.toLocaleString()}</span>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[10px] font-semibold uppercase">Target Joining Date</span>
                        <span className="font-semibold text-slate-900 dark:text-white">📅 {cand.joiningDate}</span>
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between text-xs font-medium text-slate-600 dark:text-slate-300">
                        <span>Onboarding Setup Progress</span>
                        <span className="text-amber-600 dark:text-amber-400 font-bold">{cand.onboardingProgress}%</span>
                      </div>
                      <div className="w-full h-2 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-amber-400 rounded-full transition-all duration-500"
                          style={{ width: `${cand.onboardingProgress}%` }}
                        ></div>
                      </div>

                      <div className="flex flex-wrap gap-1.5 pt-1">
                        {cand.milestones.map((m, idx) => (
                          <span
                            key={idx}
                            className={`px-2 py-0.5 text-[11px] font-medium rounded-md border ${
                              m.done
                                ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/30'
                                : 'bg-slate-200/60 text-slate-600 border-slate-300 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700'
                            }`}
                          >
                            {m.done ? '✓' : '⏳'} {m.name}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 pt-2 border-t border-slate-200 dark:border-slate-800">
                    <button
                      onClick={() => handleSendWelcomeEmail(cand)}
                      disabled={sendingWelcomeId === cand.id}
                      className="flex-1 py-2 text-xs font-bold text-white bg-amber-500 hover:bg-amber-600 rounded-xl shadow-sm transition-all disabled:opacity-50 flex items-center justify-center gap-1.5"
                    >
                      <span>✉️</span> {sendingWelcomeId === cand.id ? 'Sending...' : 'Send Welcome Email'}
                    </button>

                    <Link
                      to={`/offers/${cand.id}`}
                      className={`px-3 py-2 text-xs font-semibold rounded-xl border transition-all ${
                        theme === 'dark'
                          ? 'bg-slate-900 text-slate-200 border-slate-800 hover:bg-slate-800'
                          : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      View Offer →
                    </Link>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {loading ? (
            <ChartSkeleton />
          ) : (
            <div className={`rounded-3xl shadow-sm border p-6 space-y-3 ${
              theme === 'dark' ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-amber-200/80 text-slate-900'
            }`}>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <span className="text-amber-500">📊</span> Recruitment Funnel Conversion
              </h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={funnelData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke={theme === 'dark' ? '#334155' : '#f1f5f9'} />
                    <XAxis dataKey="stage" tick={{ fontSize: 11, fill: theme === 'dark' ? '#cbd5e1' : '#64748b' }} />
                    <YAxis tick={{ fontSize: 11, fill: theme === 'dark' ? '#cbd5e1' : '#64748b' }} />
                    <Tooltip contentStyle={{ backgroundColor: theme === 'dark' ? '#0f172a' : '#ffffff', borderColor: theme === 'dark' ? '#334155' : '#e2e8f0', borderRadius: '10px', color: theme === 'dark' ? '#ffffff' : '#0f172a' }} />
                    <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                      {funnelData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          <div className={`rounded-3xl shadow-sm border p-6 space-y-3 ${
            theme === 'dark' ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-amber-200/80 text-slate-900'
          }`}>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <span className="text-amber-500">📈</span> Application Inflow Trends
            </h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={[
                  { day: 'Mon', applications: 12, screened: 10 },
                  { day: 'Tue', applications: 19, screened: 16 },
                  { day: 'Wed', applications: 15, screened: 12 },
                  { day: 'Thu', applications: 27, screened: 24 },
                  { day: 'Fri', applications: 22, screened: 19 },
                  { day: 'Sat', applications: 8, screened: 6 },
                  { day: 'Sun', applications: 5, screened: 4 }
                ]}>
                  <CartesianGrid strokeDasharray="3 3" stroke={theme === 'dark' ? '#334155' : '#f1f5f9'} />
                  <XAxis dataKey="day" tick={{ fontSize: 11, fill: theme === 'dark' ? '#cbd5e1' : '#64748b' }} />
                  <YAxis tick={{ fontSize: 11, fill: theme === 'dark' ? '#cbd5e1' : '#64748b' }} />
                  <Tooltip contentStyle={{ backgroundColor: theme === 'dark' ? '#0f172a' : '#ffffff', borderColor: theme === 'dark' ? '#334155' : '#e2e8f0', borderRadius: '10px', color: theme === 'dark' ? '#ffffff' : '#0f172a' }} />
                  <Line type="monotone" dataKey="applications" stroke="#f59e0b" strokeWidth={2.5} dot={{ fill: '#f59e0b', r: 3 }} />
                  <Line type="monotone" dataKey="screened" stroke="#d97706" strokeWidth={2.5} dot={{ fill: '#d97706', r: 3 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Active Openings Section */}
        {loading && recentJobs.length === 0 ? (
          <JobListSkeleton />
        ) : (
          <div className={`rounded-3xl shadow-sm border p-6 space-y-4 ${
            theme === 'dark' ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-amber-200/80 text-slate-900'
          }`}>
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <span className="text-amber-500">💼</span> Current Openings (Real-Time Control)
              </h3>
              <Link to="/jobs" className="text-xs font-semibold text-amber-600 dark:text-amber-400 hover:underline">
                View All Openings →
              </Link>
            </div>

            <div className="space-y-2.5">
              {recentJobs.length === 0 ? (
                <p className="text-xs text-slate-500 dark:text-slate-400 text-center py-4">No active openings found.</p>
              ) : recentJobs.map((job) => (
                <div
                  key={job.id || job._id}
                  className={`flex items-center justify-between p-4 rounded-2xl border transition-colors ${
                    theme === 'dark' ? 'bg-slate-950 border-slate-800 hover:bg-slate-800/60' : 'bg-slate-50 border-slate-200/80 hover:bg-slate-100/60'
                  }`}
                >
                  <div>
                    <p className="text-xs font-bold text-slate-900 dark:text-white">
                      {job.title}
                    </p>
                    <p className="text-xs text-slate-600 dark:text-slate-300 mt-0.5">{job.department} • {job.location}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="px-2.5 py-0.5 bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30 rounded-full text-xs font-semibold">
                      ● {job.status}
                    </span>
                    <Link to={`/jobs`} className="text-xs font-semibold text-amber-600 dark:text-amber-400 hover:underline">
                      Manage →
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default Dashboard;