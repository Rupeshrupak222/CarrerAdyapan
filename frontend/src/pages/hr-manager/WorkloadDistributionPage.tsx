import React, { useState, useEffect, useMemo } from 'react';
import { 
  Users, 
  UserCheck, 
  Search, 
  Filter, 
  RotateCw, 
  Sparkles, 
  FileText, 
  ArrowRight, 
  CheckCircle2, 
  Clock, 
  ShieldCheck, 
  Briefcase, 
  RefreshCw 
} from 'lucide-react';
import toast from 'react-hot-toast';
import DashboardLayout from '../../components/layout/DashboardLayout';
import applicationService from '../../services/applicationService';
import ResumeViewerModal from '../../components/ats/ResumeViewerModal';
import CandidatePreviewModal from '../../components/ats/CandidatePreviewModal';

export const WorkloadDistributionPage: React.FC = () => {
  const [applications, setApplications] = useState<any[]>([]);
  const [workloadStats, setWorkloadStats] = useState<{
    unassignedCount: number;
    assignedCount: number;
    specialistsCount: number;
    specialists: any[];
  }>({
    unassignedCount: 0,
    assignedCount: 0,
    specialistsCount: 0,
    specialists: [],
  });

  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterMode, setFilterMode] = useState<'UNASSIGNED' | 'ASSIGNED' | 'ALL'>('UNASSIGNED');
  const [selectedHrMap, setSelectedHrMap] = useState<Record<string, string>>({});
  const [assigningId, setAssigningId] = useState<string | null>(null);

  // Modals
  const [resumeModalOpen, setResumeModalOpen] = useState(false);
  const [activeResumeUrl, setActiveResumeUrl] = useState('');
  const [activeCandidateName, setActiveCandidateName] = useState('');

  const [previewModalOpen, setPreviewModalOpen] = useState(false);
  const [selectedAppForPreview, setSelectedAppForPreview] = useState<any>(null);

  // Reassign Modal
  const [reassignModalOpen, setReassignModalOpen] = useState(false);
  const [selectedAppForReassign, setSelectedAppForReassign] = useState<any>(null);
  const [reassignTargetHr, setReassignTargetHr] = useState('');
  const [reassignReason, setReassignReason] = useState('WORKLOAD_BALANCING');

  const loadData = async () => {
    setLoading(true);
    try {
      const [appsRes, statsRes] = await Promise.all([
        applicationService.getAllApplications(),
        applicationService.getWorkloadStats(),
      ]);

      const allApps = appsRes.applications || appsRes.data || (Array.isArray(appsRes) ? appsRes : []);
      // Candidates relevant to workload: SHORTLISTED or ASSIGNED
      const workloadApps = allApps.filter((a: any) =>
        ['SHORTLISTED', 'ASSIGNED', 'ROUND_1_PENDING', 'ROUND_2_PENDING'].includes(a.status)
      );
      setApplications(workloadApps);

      if (statsRes.success) {
        setWorkloadStats(statsRes.stats);
      }
    } catch (err: any) {
      toast.error('Failed to load workload data: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Filtered List
  const filteredApps = useMemo(() => {
    return applications.filter((app) => {
      // Tab Filter
      if (filterMode === 'UNASSIGNED') {
        if (app.assignedHrId || app.status !== 'SHORTLISTED') return false;
      } else if (filterMode === 'ASSIGNED') {
        if (!app.assignedHrId && app.status === 'SHORTLISTED') return false;
      }

      // Search
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const candName = `${app.candidate?.firstName || ''} ${app.candidate?.lastName || ''}`.toLowerCase();
        const email = (app.candidate?.email || '').toLowerCase();
        const code = (app.candidateCode || app.id || '').toLowerCase();
        const hrName = (app.assignedHr?.name || '').toLowerCase();
        if (!candName.includes(q) && !email.includes(q) && !code.includes(q) && !hrName.includes(q)) {
          return false;
        }
      }

      return true;
    });
  }, [applications, filterMode, searchQuery]);

  // Handle Assign Single
  const handleAssignSingle = async (appId: string) => {
    const targetHrId = selectedHrMap[appId];
    if (!targetHrId) {
      toast.error('Please select an HR Specialist from the dropdown first.');
      return;
    }

    setAssigningId(appId);
    try {
      const res = await applicationService.assignHr(appId, targetHrId);
      toast.success(res.message || 'Candidate assigned successfully.');
      loadData();
    } catch (err: any) {
      toast.error('Assignment failed: ' + err.message);
    } finally {
      setAssigningId(null);
    }
  };

  // Handle Reassign
  const handleExecuteReassign = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAppForReassign || !reassignTargetHr) return;
    try {
      await applicationService.reassignCandidate(selectedAppForReassign.id, reassignTargetHr, reassignReason);
      toast.success('Candidate reassigned successfully.');
      setReassignModalOpen(false);
      loadData();
    } catch (err: any) {
      toast.error('Reassignment failed: ' + err.message);
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6 animate-fadeIn pb-12">
        {/* Header Title */}
        <div className="p-6 rounded-2xl bg-white border border-slate-200 flex flex-col lg:flex-row lg:items-center justify-between gap-4 shadow-xs">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-extrabold text-orange-600 uppercase tracking-wider block">
                Workload Management
              </span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-orange-100 text-orange-800">
                👥 1 Candidate = 1 HR Specialist
              </span>
            </div>
            <h1 className="text-2xl font-black text-slate-900 mt-1">Workload Distribution</h1>
            <p className="text-slate-500 text-xs sm:text-sm mt-0.5">
              Shortlisted candidates automatically enter this queue. Manually allocate each candidate to an active HR Specialist.
            </p>
          </div>

          <button
            onClick={loadData}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white hover:bg-slate-50 text-slate-800 text-xs font-bold border border-slate-300 shadow-2xs transition-all"
          >
            <RotateCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} /> Refresh Workload
          </button>
        </div>

        {/* Top Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-5 rounded-2xl bg-amber-500/10 border border-amber-200/80 shadow-xs">
            <span className="text-[10px] font-extrabold text-amber-800 uppercase tracking-wider block">
              Unassigned Shortlisted Candidates
            </span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-3xl font-black text-amber-950">{workloadStats.unassignedCount}</span>
              <span className="text-xs font-bold text-amber-800">Awaiting Specialist Assignment</span>
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-emerald-500/10 border border-emerald-200/80 shadow-xs">
            <span className="text-[10px] font-extrabold text-emerald-800 uppercase tracking-wider block">
              Active Assigned Candidates
            </span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-3xl font-black text-emerald-950">{workloadStats.assignedCount}</span>
              <span className="text-xs font-bold text-emerald-800">In Interview Rounds</span>
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-blue-500/10 border border-blue-200/80 shadow-xs">
            <span className="text-[10px] font-extrabold text-blue-800 uppercase tracking-wider block">
              Active HR Specialists
            </span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-3xl font-black text-blue-950">{workloadStats.specialistsCount}</span>
              <span className="text-xs font-bold text-blue-800">Available For Allocation</span>
            </div>
          </div>
        </div>

        {/* Specialist Workload Capacity Cards */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-extrabold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
              <Users className="w-4 h-4 text-orange-600" />
              HR Specialist Team Capacity
            </h3>
            <span className="text-[11px] text-slate-500">Informational Workload Balance</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-5 gap-2.5">
            {workloadStats.specialists.map((spec) => (
              <div key={spec.id} className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1">
                <div className="font-bold text-slate-900 text-xs truncate">{spec.name}</div>
                <div className="text-[10px] text-slate-500 truncate">{spec.designation || 'HR Specialist'}</div>
                <div className="pt-1 flex items-center justify-between text-[11px]">
                  <span className="text-slate-500">Active Load:</span>
                  <span className="font-black text-orange-700 bg-orange-100/70 px-2 py-0.5 rounded-md">
                    {spec.assignedCount}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Search & Tabs Bar */}
        <div className="p-4 rounded-2xl bg-white border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
          {/* Tabs */}
          <div className="flex items-center gap-1.5 p-1 rounded-xl bg-slate-100 border border-slate-200/60 self-start">
            <button
              onClick={() => setFilterMode('UNASSIGNED')}
              className={`px-3 py-1.5 rounded-lg text-xs font-extrabold transition-all ${
                filterMode === 'UNASSIGNED'
                  ? 'bg-white text-orange-700 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Unassigned ({workloadStats.unassignedCount})
            </button>
            <button
              onClick={() => setFilterMode('ASSIGNED')}
              className={`px-3 py-1.5 rounded-lg text-xs font-extrabold transition-all ${
                filterMode === 'ASSIGNED'
                  ? 'bg-white text-orange-700 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Assigned Queue ({workloadStats.assignedCount})
            </button>
            <button
              onClick={() => setFilterMode('ALL')}
              className={`px-3 py-1.5 rounded-lg text-xs font-extrabold transition-all ${
                filterMode === 'ALL'
                  ? 'bg-white text-orange-700 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              All Shortlisted
            </button>
          </div>

          {/* Search */}
          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search candidate / specialist..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 outline-none focus:border-orange-500 focus:bg-white transition-all"
            />
          </div>
        </div>

        {/* Workload Table */}
        <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50/80 text-slate-500 font-extrabold uppercase tracking-wider">
                  <th className="py-3 px-4">Application ID</th>
                  <th className="py-3 px-4">Candidate</th>
                  <th className="py-3 px-4">Job Role</th>
                  <th className="py-3 px-3">ATS Score</th>
                  <th className="py-3 px-3">Status</th>
                  <th className="py-3 px-4">Assigned HR Specialist</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {loading ? (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-slate-400">
                      <div className="flex flex-col items-center gap-2">
                        <div className="w-7 h-7 border-3 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
                        <p className="font-semibold text-xs text-slate-500">Loading workload matrix...</p>
                      </div>
                    </td>
                  </tr>
                ) : filteredApps.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-slate-400">
                      <p className="font-semibold text-xs">No shortlisted candidates in this workload view.</p>
                    </td>
                  </tr>
                ) : (
                  filteredApps.map((app) => {
                    const candidate = app.candidate || {};
                    const candName = `${candidate.firstName || ''} ${candidate.lastName || ''}`.trim() || 'Candidate';
                    const appId = app.candidateCode || app.id?.slice(0, 10) || 'APP-2026';
                    const isAssigned = !!app.assignedHrId;
                    const selectedHr = selectedHrMap[app.id] || '';

                    return (
                      <tr key={app.id} className="hover:bg-orange-50/20 transition-colors">
                        {/* ID */}
                        <td className="py-3.5 px-4 font-mono font-bold text-slate-700">{appId}</td>

                        {/* Candidate */}
                        <td className="py-3.5 px-4">
                          <div className="font-bold text-slate-900 leading-tight">{candName}</div>
                          <div className="text-[11px] text-slate-500 font-mono mt-0.5">{candidate.email}</div>
                        </td>

                        {/* Job Role */}
                        <td className="py-3.5 px-4 font-semibold text-slate-700 max-w-[180px] truncate">
                          {app.job?.title || 'Open Position'}
                        </td>

                        {/* ATS Score */}
                        <td className="py-3.5 px-3 whitespace-nowrap">
                          {app.atsScore ? (
                            <span className="font-extrabold text-orange-700 bg-orange-50 px-2 py-0.5 rounded-md border border-orange-200/60">
                              {app.atsScore}/100
                            </span>
                          ) : (
                            <span className="text-slate-400 font-mono">--</span>
                          )}
                        </td>

                        {/* Status */}
                        <td className="py-3.5 px-3 whitespace-nowrap">
                          <span
                            className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase ${
                              isAssigned
                                ? 'bg-blue-100 text-blue-800'
                                : 'bg-amber-100 text-amber-800'
                            }`}
                          >
                            {isAssigned ? 'ASSIGNED' : 'SHORTLISTED'}
                          </span>
                        </td>

                        {/* HR Specialist Assignment Column */}
                        <td className="py-3.5 px-4 whitespace-nowrap">
                          {isAssigned ? (
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-slate-900 flex items-center gap-1">
                                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                                {app.assignedHr?.name || 'Assigned Specialist'}
                              </span>
                              <button
                                onClick={() => {
                                  setSelectedAppForReassign(app);
                                  setReassignTargetHr(app.assignedHrId || '');
                                  setReassignModalOpen(true);
                                }}
                                className="text-[10px] text-slate-400 hover:text-orange-600 underline font-semibold"
                                title="Reassign Specialist"
                              >
                                Reassign
                              </button>
                            </div>
                          ) : (
                            <select
                              value={selectedHr}
                              onChange={(e) =>
                                setSelectedHrMap({ ...selectedHrMap, [app.id]: e.target.value })
                              }
                              className="px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-300 text-xs font-semibold text-slate-900 outline-none focus:border-orange-500 focus:bg-white"
                            >
                              <option value="">Select HR Specialist ▼</option>
                              {workloadStats.specialists.map((spec) => (
                                <option key={spec.id} value={spec.id}>
                                  {spec.name} ({spec.assignedCount} active)
                                </option>
                              ))}
                            </select>
                          )}
                        </td>

                        {/* Actions */}
                        <td className="py-3.5 px-4 text-right whitespace-nowrap">
                          {isAssigned ? (
                            <span className="text-[11px] font-bold text-slate-400">In Specialist Queue</span>
                          ) : (
                            <button
                              onClick={() => handleAssignSingle(app.id)}
                              disabled={assigningId === app.id}
                              className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-extrabold text-xs shadow-xs transition-all disabled:opacity-50"
                            >
                              {assigningId === app.id ? 'Assigning...' : 'Assign HR Specialist'}
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Viewport-Centered Modals */}
        <ResumeViewerModal
          isOpen={resumeModalOpen}
          onClose={() => setResumeModalOpen(false)}
          resumeUrl={activeResumeUrl}
          candidateName={activeCandidateName}
        />

        <CandidatePreviewModal
          isOpen={previewModalOpen}
          onClose={() => setPreviewModalOpen(false)}
          application={selectedAppForPreview}
          onRunAts={() => {}}
          onViewResume={(url, name) => {
            setActiveResumeUrl(url);
            setActiveCandidateName(name);
            setResumeModalOpen(true);
          }}
          onShortlist={() => {}}
          onReject={() => {}}
        />

        {/* Controlled Reassign Modal */}
        {reassignModalOpen && (
          <div 
            className="fixed inset-0 z-[9999] bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn"
            onClick={() => setReassignModalOpen(false)}
          >
            <div 
              className="max-w-md w-full bg-white border border-slate-200 rounded-2xl p-6 shadow-2xl space-y-4 animate-scaleUp my-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-base font-extrabold text-slate-900">Reassign HR Specialist</h3>
              <p className="text-xs text-slate-500">
                Candidate: <strong>{selectedAppForReassign?.candidate?.firstName} {selectedAppForReassign?.candidate?.lastName}</strong>
              </p>

              <form onSubmit={handleExecuteReassign} className="space-y-3.5 text-xs">
                <div>
                  <label className="text-slate-600 font-semibold uppercase">Select New HR Specialist</label>
                  <select
                    value={reassignTargetHr}
                    onChange={(e) => setReassignTargetHr(e.target.value)}
                    className="mt-1 w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 font-medium outline-none focus:border-orange-500"
                  >
                    <option value="">Select Specialist</option>
                    {workloadStats.specialists.map((hr) => (
                      <option key={hr.id} value={hr.id}>
                        {hr.name} ({hr.email})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-slate-600 font-semibold uppercase">Reassignment Reason</label>
                  <select
                    value={reassignReason}
                    onChange={(e) => setReassignReason(e.target.value)}
                    className="mt-1 w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 font-medium outline-none focus:border-orange-500"
                  >
                    <option value="WORKLOAD_BALANCING">Workload Balancing</option>
                    <option value="SPECIALIZATION_MATCH">Domain Specialization Match</option>
                    <option value="LEAVE_ABSENCE">HR Specialist On Leave</option>
                    <option value="ESCALATION">Manager Escalation</option>
                  </select>
                </div>

                <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200">
                  <button
                    type="button"
                    onClick={() => setReassignModalOpen(false)}
                    className="px-3.5 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white font-semibold"
                  >
                    Confirm Reassign
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default WorkloadDistributionPage;
