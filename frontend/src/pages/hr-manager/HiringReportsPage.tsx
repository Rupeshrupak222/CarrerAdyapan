import React, { useState, useEffect } from 'react';
import { 
  TrendingUp, 
  RotateCw, 
  Users, 
  Award, 
  CheckCircle2, 
  XCircle, 
  Briefcase, 
  Layers, 
  BarChart3, 
  ArrowRight 
} from 'lucide-react';
import toast from 'react-hot-toast';
import DashboardLayout from '../../components/layout/DashboardLayout';
import applicationService from '../../services/applicationService';

export const HiringReportsPage: React.FC = () => {
  const [reportData, setReportData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    setLoading(true);
    try {
      const res = await applicationService.getHiringReports();
      if (res.success) {
        setReportData(res.report);
      }
    } catch (err: any) {
      toast.error('Failed to load hiring reports: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  return (
    <DashboardLayout>
      <div className="space-y-6 animate-fadeIn pb-12">
        {/* Header Title */}
        <div className="p-6 rounded-2xl bg-white border border-slate-200 flex flex-col lg:flex-row lg:items-center justify-between gap-4 shadow-xs">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-extrabold text-orange-600 uppercase tracking-wider block">
                Operational Analytics
              </span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-orange-100 text-orange-800">
                📊 Recruitment Funnel
              </span>
            </div>
            <h1 className="text-2xl font-black text-slate-900 mt-1">Hiring Reports & Funnel</h1>
            <p className="text-slate-500 text-xs sm:text-sm mt-0.5">
              Live funnel conversion metrics, stage transitions, shortlist vs rejection velocity, and job opening volume.
            </p>
          </div>

          <button
            onClick={loadData}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white hover:bg-slate-50 text-slate-800 text-xs font-bold border border-slate-300 shadow-2xs transition-all"
          >
            <RotateCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} /> Refresh Reports
          </button>
        </div>

        {loading ? (
          <div className="p-12 text-center text-slate-400">
            <div className="flex flex-col items-center gap-2">
              <div className="w-8 h-8 border-3 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
              <p className="font-semibold text-xs text-slate-500">Compiling live hiring metrics...</p>
            </div>
          </div>
        ) : reportData ? (
          <>
            {/* Primary KPI Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {/* Total Apps */}
              <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-1">
                <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">
                  Total Applications
                </span>
                <div className="text-3xl font-black text-slate-900">{reportData.totalApplications}</div>
                <div className="text-[11px] font-semibold text-slate-500">Across all job openings</div>
              </div>

              {/* Shortlist Rate */}
              <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-1">
                <span className="text-[10px] font-extrabold text-emerald-600 uppercase tracking-wider block">
                  Shortlist Conversion
                </span>
                <div className="text-3xl font-black text-emerald-700">{reportData.shortlistRate}%</div>
                <div className="text-[11px] font-semibold text-slate-500">{reportData.shortlistedCount} Candidates Shortlisted</div>
              </div>

              {/* Round 1 -> Round 2 Conversion */}
              <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-1">
                <span className="text-[10px] font-extrabold text-blue-600 uppercase tracking-wider block">
                  Round 1 Pass Rate
                </span>
                <div className="text-3xl font-black text-blue-700">{reportData.round1Conversion}%</div>
                <div className="text-[11px] font-semibold text-slate-500">Advanced to Round 2</div>
              </div>

              {/* Final Offers */}
              <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-1">
                <span className="text-[10px] font-extrabold text-amber-600 uppercase tracking-wider block">
                  Offers Dispatched
                </span>
                <div className="text-3xl font-black text-amber-600">{reportData.offersSent}</div>
                <div className="text-[11px] font-semibold text-slate-500">{reportData.finalRoundCount} Cleared Final Round</div>
              </div>
            </div>

            {/* Visual Funnel Progression */}
            <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-4">
              <h3 className="text-xs font-extrabold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-orange-600" />
                Live Candidate Funnel Flow
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-5 gap-3">
                {/* Step 1 */}
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-center space-y-1">
                  <span className="text-[10px] font-bold text-slate-400 uppercase">1. Received</span>
                  <div className="text-2xl font-black text-slate-900">{reportData.totalApplications}</div>
                  <div className="text-[10px] font-semibold text-slate-500">Applications</div>
                </div>

                {/* Step 2 */}
                <div className="p-4 rounded-xl bg-orange-50/60 border border-orange-200 text-center space-y-1">
                  <span className="text-[10px] font-bold text-orange-800 uppercase">2. Shortlisted</span>
                  <div className="text-2xl font-black text-orange-900">{reportData.shortlistedCount}</div>
                  <div className="text-[10px] font-semibold text-orange-700">{reportData.shortlistRate}% Pass</div>
                </div>

                {/* Step 3 */}
                <div className="p-4 rounded-xl bg-amber-50/60 border border-amber-200 text-center space-y-1">
                  <span className="text-[10px] font-bold text-amber-800 uppercase">3. Round 1 Passed</span>
                  <div className="text-2xl font-black text-amber-900">{Math.round(reportData.shortlistedCount * (reportData.round1Conversion / 100))}</div>
                  <div className="text-[10px] font-semibold text-amber-700">{reportData.round1Conversion}% Pass</div>
                </div>

                {/* Step 4 */}
                <div className="p-4 rounded-xl bg-blue-50/60 border border-blue-200 text-center space-y-1">
                  <span className="text-[10px] font-bold text-blue-800 uppercase">4. Final Round</span>
                  <div className="text-2xl font-black text-blue-900">{reportData.finalRoundCount}</div>
                  <div className="text-[10px] font-semibold text-blue-700">{reportData.round2Conversion}% Pass</div>
                </div>

                {/* Step 5 */}
                <div className="p-4 rounded-xl bg-emerald-50/60 border border-emerald-200 text-center space-y-1">
                  <span className="text-[10px] font-bold text-emerald-800 uppercase">5. Offers Sent</span>
                  <div className="text-2xl font-black text-emerald-900">{reportData.offersSent}</div>
                  <div className="text-[10px] font-semibold text-emerald-700">Official Offers</div>
                </div>
              </div>
            </div>

            {/* Applications Volume by Job Role */}
            <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-4">
              <h3 className="text-xs font-extrabold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                <Briefcase className="w-4 h-4 text-orange-600" />
                Applications Volume by Position
              </h3>

              <div className="border border-slate-200 rounded-xl overflow-hidden divide-y divide-slate-100 text-xs">
                {(reportData.jobsBreakdown || []).map((j: any, i: number) => (
                  <div key={i} className="p-3.5 flex items-center justify-between hover:bg-slate-50 transition-colors">
                    <div>
                      <div className="font-bold text-slate-900">{j.title}</div>
                      <div className="text-[11px] text-slate-500">{j.department || 'General'}</div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-extrabold text-slate-900 text-sm">{j.applicationsCount}</span>
                      <span className="text-slate-400 text-xs">applications</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </>
        ) : null}
      </div>
    </DashboardLayout>
  );
};

export default HiringReportsPage;
