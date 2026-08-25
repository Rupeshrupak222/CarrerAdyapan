import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Users,
  UserCheck,
  Award,
  Star,
  ArrowRight,
  RotateCw,
  CheckCircle2,
  Clock,
  Sparkles,
  Briefcase,
  ShieldCheck,
  FileText,
  Send
} from 'lucide-react';
import toast from 'react-hot-toast';
import DashboardLayout from '../../components/layout/DashboardLayout';
import applicationService from '../../services/applicationService';

export const HRManagerDashboard: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [metrics, setMetrics] = useState({
    total: 0,
    newApps: 0,
    shortlisted: 0,
    rejected: 0,
    unassigned: 0,
    assigned: 0,
    round1Selected: 0,
    round1Rejected: 0,
    round2Selected: 0,
    round2Rejected: 0,
    finalRound: 0,
    offersSent: 0,
  });

  const [recentApplications, setRecentApplications] = useState<any[]>([]);

  const loadDashboardData = async () => {
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
      toast.error('Failed to load manager metrics: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  return (
    <DashboardLayout>
      <div className="space-y-6 animate-fadeIn pb-12">
        {/* Header Title */}
        <div className="p-6 rounded-2xl bg-white border border-slate-200 flex flex-col lg:flex-row lg:items-center justify-between gap-4 shadow-xs">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-extrabold text-orange-600 uppercase tracking-wider block">
                Executive Console
              </span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-orange-100 text-orange-800">
                ⭐ HR Manager Dashboard
              </span>
            </div>
            <h1 className="text-2xl font-black text-slate-900 mt-1">Hiring Pipeline Overview</h1>
            <p className="text-slate-500 text-xs sm:text-sm mt-0.5">
              High-level overview of live candidate progression, screening queue, workload capacity, and final round offer milestones.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={loadDashboardData}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white hover:bg-slate-50 text-slate-800 text-xs font-bold border border-slate-300 shadow-2xs transition-all"
            >
              <RotateCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} /> Refresh Pipeline
            </button>
          </div>
        </div>

        {/* 12-Card Pipeline Overview Matrix */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5">
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

          {/* 4. Unassigned Shortlisted */}
          <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-300 shadow-xs space-y-1">
            <span className="text-[10px] font-extrabold text-amber-800 uppercase tracking-wider block">Unassigned</span>
            <div className="text-2xl font-black text-amber-950">{metrics.unassigned}</div>
            <div className="text-[10px] text-amber-800 font-bold">Needs Specialist Assignment</div>
          </div>

          {/* 5. Assigned Total */}
          <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-1">
            <span className="text-[10px] font-extrabold text-blue-600 uppercase tracking-wider block">Assigned Total</span>
            <div className="text-2xl font-black text-blue-600">{metrics.assigned}</div>
            <div className="text-[10px] text-slate-500 font-semibold">In Active HR Queues</div>
          </div>

          {/* 6. Total Rejected */}
          <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-1">
            <span className="text-[10px] font-extrabold text-red-600 uppercase tracking-wider block">Total Rejected</span>
            <div className="text-2xl font-black text-red-600">{metrics.rejected}</div>
            <div className="text-[10px] text-slate-500 font-semibold">Archived / Closed</div>
          </div>

          {/* 7. Round 1 Selected */}
          <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-300 shadow-xs space-y-1">
            <span className="text-[10px] font-extrabold text-emerald-800 uppercase tracking-wider block">Round 1 Selected</span>
            <div className="text-2xl font-black text-emerald-950">{metrics.round1Selected}</div>
            <div className="text-[10px] text-emerald-800 font-semibold">Passed Screening Call</div>
          </div>

          {/* 8. Round 1 Rejected */}
          <div className="p-4 rounded-2xl bg-red-500/10 border border-red-200 shadow-xs space-y-1">
            <span className="text-[10px] font-extrabold text-red-800 uppercase tracking-wider block">Round 1 Rejected</span>
            <div className="text-2xl font-black text-red-950">{metrics.round1Rejected}</div>
            <div className="text-[10px] text-red-800 font-semibold">Screening Call Disqualified</div>
          </div>

          {/* 9. Round 2 Selected */}
          <div className="p-4 rounded-2xl bg-indigo-500/10 border border-indigo-300 shadow-xs space-y-1">
            <span className="text-[10px] font-extrabold text-indigo-800 uppercase tracking-wider block">Round 2 Selected</span>
            <div className="text-2xl font-black text-indigo-950">{metrics.round2Selected}</div>
            <div className="text-[10px] text-indigo-800 font-semibold">Second Round / Domain</div>
          </div>

          {/* 10. Round 2 Rejected */}
          <div className="p-4 rounded-2xl bg-red-500/10 border border-red-200 shadow-xs space-y-1">
            <span className="text-[10px] font-extrabold text-red-800 uppercase tracking-wider block">Round 2 Rejected</span>
            <div className="text-2xl font-black text-red-950">{metrics.round2Rejected}</div>
            <div className="text-[10px] text-red-800 font-semibold">Second Round Disqualified</div>
          </div>

          {/* 11. Final Round Selected (Ready for Offer) */}
          <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-300 shadow-xs space-y-1">
            <span className="text-[10px] font-extrabold text-amber-800 uppercase tracking-wider block">Final Round</span>
            <div className="text-2xl font-black text-amber-950">{metrics.finalRound}</div>
            <div className="text-[10px] text-amber-800 font-bold">R2 Cleared & Offer Pending</div>
          </div>

          {/* 12. Offers Sent */}
          <div className="p-4 rounded-2xl bg-purple-500/10 border border-purple-300 shadow-xs space-y-1">
            <span className="text-[10px] font-extrabold text-purple-800 uppercase tracking-wider block">Offers Sent</span>
            <div className="text-2xl font-black text-purple-950">{metrics.offersSent}</div>
            <div className="text-[10px] text-purple-800 font-bold">Official Offers Dispatched</div>
          </div>
        </div>

        {/* Compact Workflow Progression Pipeline */}
        <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-extrabold text-slate-900 uppercase tracking-wider">
              Recruitment Workflow Progression
            </h3>
            <span className="text-[11px] text-slate-500">Live Stage Velocity</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2 text-center text-xs">
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
              <span className="text-[10px] font-bold text-slate-400 block">1. INTAKE</span>
              <div className="font-extrabold text-slate-900 text-sm">{metrics.total}</div>
              <span className="text-[10px] text-slate-500">Applications</span>
            </div>

            <div className="p-3 rounded-xl bg-orange-50 border border-orange-200 space-y-1">
              <span className="text-[10px] font-bold text-orange-800 block">2. SHORTLISTED</span>
              <div className="font-extrabold text-orange-950 text-sm">{metrics.shortlisted}</div>
              <span className="text-[10px] text-orange-700">Screened</span>
            </div>

            <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 space-y-1">
              <span className="text-[10px] font-bold text-amber-800 block">3. ASSIGNED</span>
              <div className="font-extrabold text-amber-950 text-sm">{metrics.assigned}</div>
              <span className="text-[10px] text-amber-700">In Active Queue</span>
            </div>

            <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 space-y-1">
              <span className="text-[10px] font-bold text-emerald-800 block">4. R1 SELECTED</span>
              <div className="font-extrabold text-emerald-950 text-sm">{metrics.round1Selected}</div>
              <span className="text-[10px] text-emerald-700">Screened Cleared</span>
            </div>

            <div className="p-3 rounded-xl bg-indigo-50 border border-indigo-200 space-y-1">
              <span className="text-[10px] font-bold text-indigo-800 block">5. R2 SELECTED</span>
              <div className="font-extrabold text-indigo-950 text-sm">{metrics.round2Selected}</div>
              <span className="text-[10px] text-indigo-700">Domain Cleared</span>
            </div>

            <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 space-y-1">
              <span className="text-[10px] font-bold text-amber-800 block">6. FINAL ROUND</span>
              <div className="font-extrabold text-amber-950 text-sm">{metrics.finalRound}</div>
              <span className="text-[10px] text-amber-700">Offer Pending</span>
            </div>

            <div className="p-3 rounded-xl bg-purple-50 border border-purple-200 space-y-1">
              <span className="text-[10px] font-bold text-purple-800 block">7. OFFER SENT</span>
              <div className="font-extrabold text-purple-950 text-sm">{metrics.offersSent}</div>
              <span className="text-[10px] text-purple-700">Dispatched</span>
            </div>
          </div>
        </div>

        {/* Quick Workflow Action Shortcuts */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Link
            to="/hr-manager/screening"
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
            to="/hr-manager/workload"
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
            <div className="pt-4 flex items-center gap-1 text-xs font-extrabold text-amber-700 group-hover:gap-2 transition-all">
              <span>Allocate Candidates</span>
              <ArrowRight className="w-4 h-4" />
            </div>
          </Link>

          <Link
            to="/hr-manager/final-selected"
            className="p-5 rounded-2xl bg-white border border-slate-200 hover:border-orange-300 shadow-xs hover:shadow-md transition-all group flex flex-col justify-between"
          >
            <div>
              <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold mb-3 group-hover:scale-105 transition-transform">
                ⭐
              </div>
              <h4 className="font-bold text-slate-900 text-sm">Final Round Selected</h4>
              <p className="text-slate-500 text-xs mt-1">
                Review Round 2 cleared candidates, inspect complete history, and release offers.
              </p>
            </div>
            <div className="pt-4 flex items-center gap-1 text-xs font-extrabold text-emerald-700 group-hover:gap-2 transition-all">
              <span>Review & Release Offers</span>
              <ArrowRight className="w-4 h-4" />
            </div>
          </Link>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default HRManagerDashboard;
