import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import DashboardLayout from '../../components/layout/DashboardLayout';
import applicationService from '../../services/applicationService';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';
import {
  Users,
  UserCheck,
  Award,
  Briefcase,
  RotateCw,
  CheckCircle2,
  ArrowRight,
  Sparkles,
  Zap,
  Target,
  Send,
  Clock,
  CircleDot
} from 'lucide-react';

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [metrics, setMetrics] = useState({
    total: 0,
    newApps: 0,
    shortlisted: 0,
    rejected: 0,
    unassigned: 0,
    assigned: 0,
    round1: 0,
    round2: 0,
    finalRound: 0,
    offersSent: 0,
  });

  const [recentApplications, setRecentApplications] = useState<any[]>([]);

  useEffect(() => {
    if (user?.role === 'HR') {
      navigate('/hr/dashboard', { replace: true });
      return;
    }
    if (user?.role === 'HR_MANAGER') {
      navigate('/hr-manager/dashboard', { replace: true });
      return;
    }
    fetchDashboardData();
  }, [user, navigate]);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const res = await applicationService.getManagerStats();
      if (res?.metrics) {
        setMetrics(res.metrics);
      }
      if (res?.recentApplications) {
        setRecentApplications(res.recentApplications);
      }
    } catch (err: any) {
      toast.error('Failed to load admin metrics: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6 animate-fadeIn pb-12">
        {/* Header Title Banner */}
        <div className="p-6 rounded-2xl bg-white border border-slate-200 flex flex-col lg:flex-row lg:items-center justify-between gap-4 shadow-xs">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-extrabold text-orange-600 uppercase tracking-wider block">
                Executive Console
              </span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-orange-100 text-orange-800">
                ⭐ Admin Control Panel
              </span>
            </div>
            <h1 className="text-2xl font-black text-slate-900 mt-1">Hiring Pipeline Overview</h1>
            <p className="text-slate-500 text-xs sm:text-sm mt-0.5">
              Comprehensive overview of applicant progression, screening backlog, HR allocation, and final round offer milestones.
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={fetchDashboardData}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white hover:bg-slate-50 text-slate-800 text-xs font-bold border border-slate-300 shadow-2xs transition-all"
            >
              <RotateCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} /> Refresh Pipeline
            </button>
          </div>
        </div>

        {/* 10-Card Metric Overview Matrix */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5">
          {/* 1. Total Applications */}
          <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-1">
            <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">Total Applications</span>
            <div className="text-2xl font-black text-slate-900">{metrics.total}</div>
            <div className="text-[10px] text-slate-500 font-semibold">Total Intake</div>
          </div>

          {/* 2. New Applications */}
          <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-1">
            <span className="text-[10px] font-extrabold text-orange-600 uppercase tracking-wider block">New Applications</span>
            <div className="text-2xl font-black text-orange-600">{metrics.newApps}</div>
            <div className="text-[10px] text-slate-500 font-semibold">Awaiting Initial Review</div>
          </div>

          {/* 3. Shortlisted */}
          <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-1">
            <span className="text-[10px] font-extrabold text-emerald-600 uppercase tracking-wider block">Shortlisted</span>
            <div className="text-2xl font-black text-emerald-600">{metrics.shortlisted}</div>
            <div className="text-[10px] text-slate-500 font-semibold">Screened Positive</div>
          </div>

          {/* 4. Rejected */}
          <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-1">
            <span className="text-[10px] font-extrabold text-red-600 uppercase tracking-wider block">Rejected</span>
            <div className="text-2xl font-black text-red-600">{metrics.rejected}</div>
            <div className="text-[10px] text-slate-500 font-semibold">Archived / Closed</div>
          </div>

          {/* 5. Unassigned Shortlisted */}
          <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-300 shadow-xs space-y-1">
            <span className="text-[10px] font-extrabold text-amber-800 uppercase tracking-wider block">Unassigned</span>
            <div className="text-2xl font-black text-amber-950">{metrics.unassigned}</div>
            <div className="text-[10px] text-amber-800 font-bold">Needs Specialist Assignment</div>
          </div>

          {/* 6. Assigned Candidates */}
          <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-1">
            <span className="text-[10px] font-extrabold text-blue-600 uppercase tracking-wider block">Assigned Total</span>
            <div className="text-2xl font-black text-blue-600">{metrics.assigned}</div>
            <div className="text-[10px] text-slate-500 font-semibold">In HR Queues</div>
          </div>

          {/* 7. Round 1 */}
          <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-1">
            <span className="text-[10px] font-extrabold text-amber-600 uppercase tracking-wider block">Round 1</span>
            <div className="text-2xl font-black text-amber-600">{metrics.round1}</div>
            <div className="text-[10px] text-slate-500 font-semibold">Screening Calls</div>
          </div>

          {/* 8. Round 2 */}
          <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-1">
            <span className="text-[10px] font-extrabold text-indigo-600 uppercase tracking-wider block">Round 2</span>
            <div className="text-2xl font-black text-indigo-600">{metrics.round2}</div>
            <div className="text-[10px] text-slate-500 font-semibold">Secon Round / Domain</div>
          </div>

          {/* 9. Final Round Selected */}
          <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-300 shadow-xs space-y-1">
            <span className="text-[10px] font-extrabold text-emerald-800 uppercase tracking-wider block">Final Round</span>
            <div className="text-2xl font-black text-emerald-950">{metrics.finalRound}</div>
            <div className="text-[10px] text-emerald-800 font-bold">Ready for Offer Release</div>
          </div>

          {/* 10. Offers Sent */}
          <div className="p-4 rounded-2xl bg-purple-500/10 border border-purple-300 shadow-xs space-y-1">
            <span className="text-[10px] font-extrabold text-purple-800 uppercase tracking-wider block">Offers Sent</span>
            <div className="text-2xl font-black text-purple-950">{metrics.offersSent}</div>
            <div className="text-[10px] text-purple-800 font-bold">Official Offers Dispatched</div>
          </div>
        </div>

        {/* Quick Workflow Action Shortcuts */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Link
            to="/admin/screening"
            className="p-5 rounded-2xl bg-white border border-slate-200 hover:border-orange-300 shadow-xs hover:shadow-md transition-all group flex flex-col justify-between"
          >
            <div>
              <div className="w-10 h-10 rounded-xl bg-orange-100 text-orange-700 flex items-center justify-center font-bold mb-3 group-hover:scale-105 transition-transform">
                🎯
              </div>
              <h4 className="font-bold text-slate-900 text-sm">Screening & Approvals</h4>
              <p className="text-slate-500 text-xs mt-1">
                Run ATS check, view resumes, preview candidate profiles, and shortlist or reject.
              </p>
            </div>
            <div className="pt-4 flex items-center gap-1 text-xs font-extrabold text-orange-600 group-hover:gap-2 transition-all">
              <span>Open Screening Console</span>
              <ArrowRight className="w-4 h-4" />
            </div>
          </Link>

          <Link
            to="/admin/workload"
            className="p-5 rounded-2xl bg-white border border-slate-200 hover:border-orange-300 shadow-xs hover:shadow-md transition-all group flex flex-col justify-between"
          >
            <div>
              <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center font-bold mb-3 group-hover:scale-105 transition-transform">
                👥
              </div>
              <h4 className="font-bold text-slate-900 text-sm">Workload Distribution</h4>
              <p className="text-slate-500 text-xs mt-1">
                Assign shortlisted candidates to individual HR Specialists (1-to-1 strict rule).
              </p>
            </div>
            <div className="pt-4 flex items-center gap-1 text-xs font-extrabold text-amber-600 group-hover:gap-2 transition-all">
              <span>Manage Distribution</span>
              <ArrowRight className="w-4 h-4" />
            </div>
          </Link>

          <Link
            to="/admin/final-selected"
            className="p-5 rounded-2xl bg-white border border-slate-200 hover:border-orange-300 shadow-xs hover:shadow-md transition-all group flex flex-col justify-between"
          >
            <div>
              <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold mb-3 group-hover:scale-105 transition-transform">
                🏆
              </div>
              <h4 className="font-bold text-slate-900 text-sm">Final Round Selected</h4>
              <p className="text-slate-500 text-xs mt-1">
                View cleared finalists, configure offer terms, and release official offer letters.
              </p>
            </div>
            <div className="pt-4 flex items-center gap-1 text-xs font-extrabold text-emerald-600 group-hover:gap-2 transition-all">
              <span>Release Offers</span>
              <ArrowRight className="w-4 h-4" />
            </div>
          </Link>
        </div>

        {/* Live Recent Pipeline Table */}
        <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-extrabold text-slate-900 uppercase tracking-wider">
                Recent Active Applications
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">Live candidate statuses across pipeline rounds.</p>
            </div>
            <Link
              to="/admin/candidates"
              className="text-xs font-bold text-orange-600 hover:text-orange-700 flex items-center gap-1"
            >
              <span>View All</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 border-y border-slate-200 text-slate-500 font-bold uppercase tracking-wider">
                  <th className="py-2.5 px-3">Candidate</th>
                  <th className="py-2.5 px-3">Target Role</th>
                  <th className="py-2.5 px-3">Assigned HR</th>
                  <th className="py-2.5 px-3">Current Round</th>
                  <th className="py-2.5 px-3 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {recentApplications.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-slate-400">
                      No active applications found in the pipeline.
                    </td>
                  </tr>
                ) : (
                  recentApplications.map((app) => (
                    <tr key={app.id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="py-3 px-3">
                        <span className="font-bold text-slate-900 block">
                          {app.candidate?.firstName} {app.candidate?.lastName}
                        </span>
                        <span className="text-[10px] text-slate-400 font-mono">{app.candidateCode || 'CAND-000000'}</span>
                      </td>

                      <td className="py-3 px-3">
                        <span className="font-semibold text-slate-700 block truncate max-w-[160px]">
                          {app.job?.title || 'Open Position'}
                        </span>
                      </td>

                      <td className="py-3 px-3">
                        <span className="px-2 py-0.5 rounded-lg bg-orange-50 text-orange-800 font-bold border border-orange-200">
                          {app.assignedHr?.name || 'Unassigned'}
                        </span>
                      </td>

                      <td className="py-3 px-3">
                        <span className="px-2 py-0.5 rounded-lg bg-slate-100 text-slate-800 font-semibold">
                          {app.currentRound === 0 ? 'Resume Screening' : `Round ${app.currentRound}`}
                        </span>
                      </td>

                      <td className="py-3 px-3 text-right">
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-orange-50 text-orange-800 border border-orange-200">
                          {app.overallStatus || app.status}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Dashboard;