import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { analyticsService } from '../../services/analyticsService';
import { applicationService } from '../../services/applicationService';
import { jobService } from '../../services/jobService';
import { auditService } from '../../services/auditService';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';
import { 
  Users, 
  UserCheck, 
  Award, 
  Briefcase, 
  Calendar, 
  Clock, 
  ShieldCheck, 
  TrendingUp, 
  ArrowUpRight, 
  Plus, 
  RefreshCw, 
  CheckCircle2, 
  XCircle, 
  FileText, 
  Video, 
  ExternalLink,
  ChevronRight,
  Sliders,
  Zap,
  Activity as ActivityIcon,
  Sparkles
} from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Cell } from 'recharts';

const Dashboard: React.FC = () => {
  const { user, switchRoleAccount } = useAuth();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<any>({
    totalApplications: 0,
    totalCandidates: 0,
    aiScreened: 0,
    shortlisted: 0,
    round1Selected: 0,
    round2Selected: 0,
    finalSelected: 0,
    offersSent: 0,
    offersAccepted: 0,
    jobs: 0,
    averageScore: 88,
    timeSaved: 0,
  });

  const [funnelData, setFunnelData] = useState<any[]>([]);
  const [recentApplications, setRecentApplications] = useState<any[]>([]);
  const [recentAudits, setRecentAudits] = useState<any[]>([]);
  const [screeningRunning, setScreeningRunning] = useState(false);

  // ONLY Admin and HR Manager in role switcher as requested
  const rolePills = [
    { roleKey: 'ADMIN', label: 'Rupesh (Admin)', email: 'rupesh@adyapan.com' },
    { roleKey: 'HR_MANAGER', label: 'Nandini (HR Manager)', email: 'nandini@adyapan.com' },
  ];

  useEffect(() => {
    fetchDashboardData();
  }, [user]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [statsRes, funnelRes, appsRes, auditRes] = await Promise.all([
        analyticsService.getDashboardStats().catch(() => null),
        analyticsService.getHiringFunnel().catch(() => null),
        applicationService.getAllApplications().catch(() => null),
        auditService.getAuditLogs({ limit: 6 }).catch(() => null),
      ]);

      if (statsRes) setStats(statsRes);
      if (funnelRes?.data) setFunnelData(funnelRes.data);
      if (appsRes?.applications) setRecentApplications(appsRes.applications.slice(0, 8));
      if (auditRes?.logs) setRecentAudits(auditRes.logs);
    } catch (err: any) {
      console.warn('Dashboard fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleRun24HrScreening = async () => {
    setScreeningRunning(true);
    const toastId = toast.loading('Executing 24-Hour ATS Automated Screening...');
    try {
      const res = await applicationService.triggerScreening(true);
      if (res?.success) {
        toast.success(`Screening complete! Processed ${res.processedCount} applications.`, { id: toastId });
        fetchDashboardData();
      } else {
        toast.error('Screening job encountered an issue.', { id: toastId });
      }
    } catch (err) {
      toast.error('Failed to trigger screening.', { id: toastId });
    } finally {
      setScreeningRunning(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6 animate-fadeIn">

        {/* Saffron & White Hero Header Banner */}
        <div className="p-6 sm:p-8 rounded-3xl bg-white border border-orange-200 shadow-sm relative overflow-hidden">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
            <div className="space-y-1.5">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-50 border border-orange-200 text-orange-800 text-xs font-extrabold uppercase tracking-wider">
                <Sparkles className="w-3.5 h-3.5 text-orange-600" />
                Adyapan ATS • Saffron & White Edition
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                Recruitment Command Overview
              </h1>
              <p className="text-slate-500 text-sm max-w-xl">
                Automated applicant screening, balanced HR allocation, 3-round evaluation pipeline, and email offer dispatch.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <button
                onClick={handleRun24HrScreening}
                disabled={screeningRunning}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-extrabold text-xs transition-all shadow-sm shadow-orange-500/25 disabled:opacity-50"
              >
                <Zap className="w-4 h-4" />
                {screeningRunning ? 'Screening...' : 'Run Auto Screening'}
              </button>

              <Link
                to="/jobs/new"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white hover:bg-orange-50 text-orange-800 font-bold text-xs transition-all border border-orange-200 shadow-sm"
              >
                <Plus className="w-4 h-4 text-orange-600" /> Post New Job
              </Link>
            </div>
          </div>
        </div>

        {/* 6 Metric KPI Tiles */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5">
          <div className="p-5 rounded-2xl bg-white border border-orange-200 shadow-sm hover:border-orange-400 transition-all">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">Total Applied</span>
            <p className="text-2xl font-black text-slate-900 mt-1">{stats.totalApplications || 0}</p>
            <span className="text-[10px] text-orange-600 font-bold mt-1 block">Live Candidates</span>
          </div>

          <div className="p-5 rounded-2xl bg-white border border-orange-200 shadow-sm hover:border-orange-400 transition-all">
            <span className="text-[11px] font-bold text-orange-600 uppercase tracking-wider block">AI Screened</span>
            <p className="text-2xl font-black text-orange-600 mt-1">{stats.aiScreened || 0}</p>
            <span className="text-[10px] text-slate-400 font-semibold mt-1 block">24-Hr Qualified</span>
          </div>

          <div className="p-5 rounded-2xl bg-white border border-orange-200 shadow-sm hover:border-orange-400 transition-all">
            <span className="text-[11px] font-bold text-orange-700 uppercase tracking-wider block">Shortlisted</span>
            <p className="text-2xl font-black text-orange-700 mt-1">{stats.shortlisted || 0}</p>
            <span className="text-[10px] text-slate-400 font-semibold mt-1 block">HR Assigned</span>
          </div>

          <div className="p-5 rounded-2xl bg-white border border-orange-200 shadow-sm hover:border-orange-400 transition-all">
            <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block">Round 1 Done</span>
            <p className="text-2xl font-black text-slate-900 mt-1">{stats.round1Selected || 0}</p>
            <span className="text-[10px] text-slate-400 font-semibold mt-1 block">Ready for Round 2</span>
          </div>

          <div className="p-5 rounded-2xl bg-white border border-orange-200 shadow-sm hover:border-orange-400 transition-all">
            <span className="text-[11px] font-bold text-orange-600 uppercase tracking-wider block">Final Selected</span>
            <p className="text-2xl font-black text-orange-600 mt-1">{stats.finalSelected || 0}</p>
            <span className="text-[10px] text-slate-400 font-semibold mt-1 block">Ready for Offer</span>
          </div>

          <div className="p-5 rounded-2xl bg-white border border-orange-200 shadow-sm hover:border-orange-400 transition-all">
            <span className="text-[11px] font-bold text-emerald-700 uppercase tracking-wider block">Offers Accepted</span>
            <p className="text-2xl font-black text-emerald-700 mt-1">{stats.offersAccepted || 0}</p>
            <span className="text-[10px] text-emerald-600 font-semibold mt-1 block">Hired & Onboarded</span>
          </div>
        </div>

        {/* Saffron & White Funnel Chart */}
        <div className="bg-white border border-orange-200 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-orange-600" /> Hiring Progression Funnel
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Conversion telemetry from initial application to final offer acceptance.
              </p>
            </div>
            <span className="text-xs text-orange-800 font-bold bg-orange-50 px-3 py-1 rounded-full border border-orange-200">
              Live Telemetry
            </span>
          </div>

          <div className="h-60 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={funnelData} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
                <XAxis 
                  dataKey="stage" 
                  stroke="#94a3b8" 
                  fontSize={11} 
                  tickLine={false} 
                  interval={0}
                />
                <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#ffffff',
                    borderColor: '#fed7aa',
                    borderRadius: '12px',
                    color: '#0f172a',
                    fontSize: '12px',
                    boxShadow: '0 10px 15px -3px rgba(249, 115, 22, 0.1)',
                  }}
                />
                <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                  {funnelData.map((_, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={index % 2 === 0 ? '#ea580c' : '#f59e0b'} 
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Live Candidate Pipeline & Audit Activity Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Candidate Pipeline (2 cols) */}
          <div className="lg:col-span-2 bg-white border border-orange-200 rounded-3xl p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <Users className="w-5 h-5 text-orange-600" /> Recent Active Candidates
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">Assigned HR team & interview statuses.</p>
              </div>
              <Link
                to="/candidates"
                className="text-xs font-bold text-orange-600 hover:text-orange-700 flex items-center gap-1"
              >
                View All <ChevronRight className="w-4 h-4" />
              </Link>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-orange-50/50 border-b border-orange-100 text-slate-600 font-bold uppercase tracking-wider">
                    <th className="py-3 px-3.5">Candidate</th>
                    <th className="py-3 px-3.5">Role</th>
                    <th className="py-3 px-3.5">Assigned HR</th>
                    <th className="py-3 px-3.5">Round</th>
                    <th className="py-3 px-3.5 text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {recentApplications.map((app) => (
                    <tr key={app.id} className="hover:bg-orange-50/30 transition-colors">
                      <td className="py-3 px-3.5">
                        <Link to={`/candidates/${app.candidateId}`} className="font-bold text-slate-900 hover:text-orange-600 transition-colors block">
                          {app.candidate?.firstName} {app.candidate?.lastName}
                        </Link>
                        <span className="text-[10px] text-slate-400 font-mono">{app.candidateCode || 'CAND-000000'}</span>
                      </td>

                      <td className="py-3 px-3.5">
                        <span className="font-semibold text-slate-700 block truncate max-w-[130px]">{app.job?.title || 'BDA'}</span>
                      </td>

                      <td className="py-3 px-3.5">
                        <span className="px-2 py-0.5 rounded-lg bg-orange-50 text-orange-800 font-bold border border-orange-200">
                          {app.assignedHr?.name || 'Unassigned'}
                        </span>
                      </td>

                      <td className="py-3 px-3.5">
                        <span className="px-2 py-0.5 rounded-lg bg-slate-100 text-slate-800 font-semibold">
                          {app.currentRound === 0 ? 'Screened' : `Round ${app.currentRound}`}
                        </span>
                      </td>

                      <td className="py-3 px-3.5 text-right">
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-orange-50 text-orange-800 border border-orange-200">
                          {app.overallStatus || app.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Audit Stream (1 col) */}
          <div className="bg-white border border-orange-200 rounded-3xl p-6 shadow-sm space-y-4 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <ActivityIcon className="w-5 h-5 text-orange-600" /> Compliance Audit Trail
                </h3>
                <Link to="/admin/audit-logs" className="text-xs font-bold text-orange-600 hover:text-orange-700">
                  Full Log
                </Link>
              </div>

              <div className="space-y-2.5">
                {recentAudits.map((log) => (
                  <div key={log.id} className="p-3 rounded-xl bg-orange-50/40 border border-orange-100 space-y-1">
                    <div className="flex items-center justify-between text-[10px]">
                      <span className="font-bold text-orange-800">{log.action}</span>
                      <span className="text-slate-400">{new Date(log.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                    <p className="text-xs text-slate-700 font-medium truncate">
                      {log.userName || 'System'} • <span className="text-slate-500">{log.entity}</span>
                    </p>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-4 border-t border-orange-100 text-center">
              <Link
                to="/assistant"
                className="w-full inline-flex items-center justify-center gap-2 py-2.5 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 text-white text-xs font-extrabold transition-all shadow-sm shadow-orange-500/25"
              >
                <Sparkles className="w-4 h-4" />
                Launch AI Recruiter Copilot
              </Link>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Dashboard;