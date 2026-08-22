import React, { useState, useEffect } from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import BackButton from '../../components/common/BackButton';
import { analyticsService } from '../../services/analyticsService';
import { useTheme } from '../../context/ThemeContext';
import { StatCardSkeleton, ChartSkeleton } from '../../components/common/SkeletonLoaders';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, Cell } from 'recharts';

const AnalyticsPage = () => {
  const [stats, setStats] = useState(null);
  const [funnelData, setFunnelData] = useState([]);
  const [velocityData, setVelocityData] = useState([]);
  const [loading, setLoading] = useState(true);
  const { theme } = useTheme();

  useEffect(() => {
    fetchAnalyticsData();

    // Event listeners for real-time synchronization across app
    const handleDataSync = () => fetchAnalyticsData();
    window.addEventListener('adyapan_data_sync', handleDataSync);
    window.addEventListener('adyapan_data_updated', handleDataSync);

    // Live background polling every 4 seconds
    const interval = setInterval(fetchAnalyticsData, 4000);

    return () => {
      window.removeEventListener('adyapan_data_sync', handleDataSync);
      window.removeEventListener('adyapan_data_updated', handleDataSync);
      clearInterval(interval);
    };
  }, []);

  const getLocalDataCounts = () => {
    let localCands = [];
    let localInterviews = [];
    try {
      localCands = JSON.parse(localStorage.getItem('adyapan_candidates') || '[]');
      localInterviews = JSON.parse(localStorage.getItem('adyapan_interviews') || '[]');
    } catch (e) {}

    const totalCands = localCands.length;
    const shortlisted = localCands.filter((c) => c.status === 'SHORTLISTED' || c.status === 'INTERVIEWED').length;
    const hired = localCands.filter((c) => c.status === 'HIRED' || c.status === 'OFFERED').length;
    const interviewed = localInterviews.length;

    return { totalCands, shortlisted, hired, interviewed };
  };

  const fetchAnalyticsData = async () => {
    try {
      const [statsRes, funnelRes, velocityRes] = await Promise.allSettled([
        analyticsService.getDashboardStats(true),
        analyticsService.getHiringFunnel(true),
        analyticsService.getMonthlyVelocity(true),
      ]);

      const local = getLocalDataCounts();

      // 1. Process Stats Cards Data
      if (statsRes.status === 'fulfilled' && statsRes.value) {
        const raw = statsRes.value;
        const totalApps = Math.max(raw.totalApplications || 0, local.totalCands);
        const screened = Math.max(raw.aiScreened || 0, local.totalCands);
        const interviewedCount = Math.max(raw.interviewed ?? raw.interviewsScheduled ?? 0, local.interviewed);
        const hireCount = Math.max(raw.hired || 0, local.hired);

        setStats({
          totalApplications: totalApps,
          aiScreened: screened,
          interviewed: interviewedCount,
          hired: hireCount,
        });
      } else {
        setStats({
          totalApplications: local.totalCands || 0,
          aiScreened: local.totalCands || 0,
          interviewed: local.interviewed || 0,
          hired: local.hired || 0,
        });
      }

      // 2. Process Hiring Funnel Chart Data
      if (funnelRes.status === 'fulfilled' && funnelRes.value?.data && Array.isArray(funnelRes.value.data)) {
        const backendFunnel = funnelRes.value.data.filter((f: any) => f.stage !== 'Shortlisted');
        setFunnelData(backendFunnel);
      } else {
        const totalApps = local.totalCands || 0;
        setFunnelData([
          { stage: 'Applied', count: totalApps },
          { stage: 'AI Screened', count: totalApps },
          { stage: 'Interviewed', count: local.interviewed || 0 },
          { stage: 'Hired', count: local.hired || 0 },
        ]);
      }

      // 3. Process Monthly Velocity Line Chart Data
      if (velocityRes.status === 'fulfilled' && velocityRes.value?.velocity && Array.isArray(velocityRes.value.velocity) && velocityRes.value.velocity.length > 0) {
        setVelocityData(velocityRes.value.velocity);
      } else {
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        const currentMonthIdx = new Date().getMonth();
        const activeMonths = months.slice(0, currentMonthIdx + 1);

        const calculatedVelocity = activeMonths.map((m) => ({
          month: m,
          applications: local.totalCands || 0,
        }));
        setVelocityData(calculatedVelocity);
      }

    } catch (error) {
      console.warn('Analytics page sync error:', error);
    } finally {
      setLoading(false);
    }
  };

  const COLORS = ['#f59e0b', '#d97706', '#10b981', '#f59e0b', '#d97706', '#b45309'];

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header Bar */}
        <div className={`p-6 rounded-3xl border transition-all relative overflow-hidden shadow-sm ${
          theme === 'dark' ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-slate-200 text-slate-900'
        }`}>

          <div className="space-y-1.5 pt-1">
            <BackButton label="Back to Dashboard" to="/dashboard" />
            <div className="inline-flex items-center gap-2 px-3 py-0.5 rounded-full text-xs font-semibold bg-amber-500/15 text-amber-700 dark:text-amber-300 border border-amber-500/30">
              Adyapan Live Pipeline Analytics
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
              Hiring Analytics & Real-Time Metrics
            </h1>
            <p className="text-xs text-slate-600 dark:text-slate-300 font-normal">
              Synchronized view of active candidates, AI screening conversion rates, shortlist ratios, and monthly application velocity.
            </p>
          </div>
        </div>

        {/* Stats Cards */}
        {loading && !stats ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <StatCardSkeleton />
            <StatCardSkeleton />
            <StatCardSkeleton />
            <StatCardSkeleton />
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className={`p-5 rounded-3xl border text-center shadow-sm relative overflow-hidden ${
              theme === 'dark' ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
            }`}>
              <p className="text-3xl font-extrabold text-amber-600 dark:text-amber-400">{stats?.totalApplications || 0}</p>
              <p className="text-xs font-bold text-slate-600 dark:text-slate-300 mt-1 uppercase tracking-wider">Total Applications</p>
            </div>
            <div className={`p-5 rounded-3xl border text-center shadow-sm relative overflow-hidden ${
              theme === 'dark' ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
            }`}>
              <p className="text-3xl font-extrabold text-amber-600 dark:text-amber-400">{stats?.aiScreened || 0}</p>
              <p className="text-xs font-bold text-slate-600 dark:text-slate-300 mt-1 uppercase tracking-wider">AI Screened</p>
            </div>
            <div className={`p-5 rounded-3xl border text-center shadow-sm relative overflow-hidden ${
              theme === 'dark' ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
            }`}>
              <p className="text-3xl font-extrabold text-slate-900 dark:text-white">{stats?.interviewed || 0}</p>
              <p className="text-xs font-bold text-slate-600 dark:text-slate-300 mt-1 uppercase tracking-wider">Interviewed</p>
            </div>
            <div className={`p-5 rounded-3xl border text-center shadow-sm relative overflow-hidden ${
              theme === 'dark' ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
            }`}>
              <p className="text-3xl font-extrabold text-amber-600 dark:text-amber-400">{stats?.hired || 0}</p>
              <p className="text-xs font-bold text-slate-600 dark:text-slate-300 mt-1 uppercase tracking-wider">Hired</p>
            </div>
          </div>
        )}

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {loading && funnelData.length === 0 ? (
            <ChartSkeleton title="Loading Hiring Funnel..." />
          ) : (
            <div className={`p-6 rounded-3xl border shadow-sm ${
              theme === 'dark' ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
            }`}>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                <span className="text-amber-500">📊</span> Hiring Pipeline Funnel (Live DB)
              </h3>
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={funnelData}>
                    <CartesianGrid strokeDasharray="3 3" stroke={theme === 'dark' ? '#1e293b' : '#f1f5f9'} />
                    <XAxis dataKey="stage" tick={{ fontSize: 11, fill: theme === 'dark' ? '#94a3b8' : '#64748b' }} />
                    <YAxis tick={{ fontSize: 11, fill: theme === 'dark' ? '#94a3b8' : '#64748b' }} />
                    <Tooltip />
                    <Bar dataKey="count">
                      {funnelData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} radius={[6, 6, 0, 0] as any} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          <div className={`p-6 rounded-3xl border shadow-sm ${
            theme === 'dark' ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
          }`}>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
              <span className="text-amber-500">📈</span> Monthly Application Velocity (Live DB)
            </h3>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={velocityData}>
                  <CartesianGrid strokeDasharray="3 3" stroke={theme === 'dark' ? '#1e293b' : '#f1f5f9'} />
                  <XAxis dataKey="month" tick={{ fontSize: 11, fill: theme === 'dark' ? '#94a3b8' : '#64748b' }} />
                  <YAxis tick={{ fontSize: 11, fill: theme === 'dark' ? '#94a3b8' : '#64748b' }} />
                  <Tooltip />
                  <Line type="monotone" dataKey="applications" stroke="#f59e0b" strokeWidth={3} dot={{ fill: '#f59e0b', r: 4 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default AnalyticsPage;
