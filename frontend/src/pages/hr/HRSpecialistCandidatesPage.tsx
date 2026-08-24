import React, { useState, useEffect, useMemo } from 'react';
import { 
  Users, 
  Search, 
  RotateCw, 
  FileText, 
  Calendar, 
  ChevronLeft, 
  ChevronRight 
} from 'lucide-react';
import toast from 'react-hot-toast';
import DashboardLayout from '../../components/layout/DashboardLayout';
import applicationService from '../../services/applicationService';
import ResumeViewerModal from '../../components/ats/ResumeViewerModal';
import CandidatePreviewModal from '../../components/ats/CandidatePreviewModal';
import InterviewScheduleModal from '../../components/ats/InterviewScheduleModal';
import { useAuth } from '../../context/AuthContext';

export const HRSpecialistCandidatesPage: React.FC = () => {
  const { user } = useAuth();
  const [applications, setApplications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [roundFilter, setRoundFilter] = useState('ALL');

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Modals
  const [resumeModalOpen, setResumeModalOpen] = useState(false);
  const [activeResumeUrl, setActiveResumeUrl] = useState('');
  const [activeCandidateName, setActiveCandidateName] = useState('');

  const [previewModalOpen, setPreviewModalOpen] = useState(false);
  const [selectedAppForPreview, setSelectedAppForPreview] = useState<any>(null);

  // Schedule Modal
  const [scheduleModalOpen, setScheduleModalOpen] = useState(false);
  const [selectedAppForSchedule, setSelectedAppForSchedule] = useState<any>(null);
  const [selectedRoundNumber, setSelectedRoundNumber] = useState<number>(1);
  const [selectedRoundName, setSelectedRoundName] = useState<string>('Round 1: Screening & Domain');

  const handleOpenResume = (url: string, name: string) => {
    setActiveResumeUrl(url);
    setActiveCandidateName(name);
    setResumeModalOpen(true);
  };

  const loadData = async () => {
    setLoading(true);
    try {
      const res = await applicationService.getAllApplications({ assignedHrId: user?.id });
      const apps = res.applications || res.data || (Array.isArray(res) ? res : []);
      setApplications(apps);
    } catch (err: any) {
      toast.error('Failed to load your assigned candidates: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [user?.id]);

  const handleOpenSchedule = (app: any, targetRoundNum: number = 1) => {
    setSelectedAppForSchedule(app);
    setSelectedRoundNumber(targetRoundNum);
    setSelectedRoundName(targetRoundNum === 2 ? 'Round 2: Technical & Sales Pitch' : 'Round 1: Screening & Domain');
    setScheduleModalOpen(true);
  };

  const getDisplayStageInfo = (app: any) => {
    const round1Iv = app.interviews?.find((i: any) => i.roundNumber === 1);
    const round2Iv = app.interviews?.find((i: any) => i.roundNumber === 2);

    // 1. Rejected in Round 1
    if (app.status === 'ROUND_1_REJECTED' || (app.status === 'REJECTED' && (app.currentRound === 1 || !app.currentRound))) {
      return {
        currentRoundBadge: <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-800 border border-rose-200">Round 1 Rejected</span>,
        statusBadge: <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-rose-100 text-rose-800">REJECTED IN ROUND 1</span>,
        latestIvText: <span className="text-rose-700 font-semibold">Rejected in Round 1</span>,
        actionBtn: null,
      };
    }

    // 2. Rejected in Round 2
    if (app.status === 'ROUND_2_REJECTED' || (app.status === 'REJECTED' && app.currentRound === 2)) {
      return {
        currentRoundBadge: <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-800 border border-rose-200">Round 2 Rejected</span>,
        statusBadge: <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-rose-100 text-rose-800">REJECTED IN ROUND 2</span>,
        latestIvText: <span className="text-rose-700 font-semibold">Rejected in Round 2</span>,
        actionBtn: null,
      };
    }

    // 3. Final Selected / Cleared Round 2
    if (app.finalSelected || app.status === 'FINAL_SELECTED' || app.status === 'ROUND_2_SELECTED' || app.status === 'FINAL_ROUND' || app.status === 'OFFER_SENT' || app.status === 'OFFER_ACCEPTED') {
      return {
        currentRoundBadge: <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">Final Selected</span>,
        statusBadge: <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-100 text-emerald-800">FINAL SELECTED</span>,
        latestIvText: <span className="text-emerald-700 font-semibold">Final Selected</span>,
        actionBtn: <span className="px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-700 font-extrabold text-xs border border-emerald-200">Final Selected</span>,
      };
    }

    // 4. Round 2 Scheduled
    if (app.status === 'ROUND_2_PENDING' || (app.status === 'INTERVIEW_SCHEDULED' && app.currentRound === 2)) {
      return {
        currentRoundBadge: <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-800 border border-blue-200">Round 2</span>,
        statusBadge: <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-blue-100 text-blue-800">ROUND 2 SCHEDULED</span>,
        latestIvText: (
          <div>
            <span className="font-medium text-slate-800">Round 2: Technical & Pitch</span>
            <span className="text-[10px] text-slate-400 block font-mono">
              {round2Iv?.scheduledAt ? `${new Date(round2Iv.scheduledAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })} ${new Date(round2Iv.scheduledAt).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}` : 'Scheduled'}
            </span>
          </div>
        ),
        actionBtn: (
          <button
            onClick={() => handleOpenSchedule(app, 2)}
            className="inline-flex items-center gap-1 px-3 py-1 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs shadow-xs transition-all"
          >
            <Calendar className="w-3 h-3" /> Reschedule R2
          </button>
        ),
      };
    }

    // 5. Round 1 Cleared (Ready for Round 2)
    if (app.status === 'ROUND_1_SELECTED') {
      return {
        currentRoundBadge: <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-800 border border-blue-200">Round 1 Cleared</span>,
        statusBadge: <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-blue-100 text-blue-800">ROUND 1 CLEARED</span>,
        latestIvText: <span className="font-semibold text-blue-700">Round 1 Cleared</span>,
        actionBtn: (
          <button
            onClick={() => handleOpenSchedule(app, 2)}
            className="inline-flex items-center gap-1 px-3 py-1 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs shadow-xs transition-all"
          >
            <Calendar className="w-3 h-3" /> Schedule R2
          </button>
        ),
      };
    }

    // 6. Round 1 Scheduled
    if (app.status === 'ROUND_1_PENDING' || (app.status === 'INTERVIEW_SCHEDULED' && (app.currentRound === 1 || !app.currentRound)) || (round1Iv && round1Iv.status !== 'COMPLETED')) {
      return {
        currentRoundBadge: <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-200">Round 1</span>,
        statusBadge: <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-blue-100 text-blue-800">SCHEDULED</span>,
        latestIvText: (
          <div>
            <span className="font-medium text-slate-800">Round 1: Screening & Domain</span>
            <span className="text-[10px] text-slate-400 block font-mono">
              {round1Iv?.scheduledAt ? `${new Date(round1Iv.scheduledAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })} ${new Date(round1Iv.scheduledAt).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}` : 'Scheduled'}
            </span>
          </div>
        ),
        actionBtn: (
          <button
            onClick={() => handleOpenSchedule(app, 1)}
            className="inline-flex items-center gap-1 px-3 py-1 rounded-lg bg-white hover:bg-slate-100 text-slate-800 font-bold text-xs border border-slate-300 shadow-2xs transition-all"
          >
            <Calendar className="w-3 h-3" /> Reschedule R1
          </button>
        ),
      };
    }

    // 7. Default / Newly Assigned Shortlisted Candidate
    return {
      currentRoundBadge: <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-200">Resume Shortlisted</span>,
      statusBadge: <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-amber-100 text-amber-800">ASSIGNED</span>,
      latestIvText: <span className="font-semibold text-amber-700">Resume Shortlisted</span>,
      actionBtn: (
        <button
          onClick={() => handleOpenSchedule(app, 1)}
          className="inline-flex items-center gap-1 px-3 py-1 rounded-lg bg-orange-600 hover:bg-orange-700 text-white font-extrabold text-xs shadow-xs transition-all"
        >
          <Calendar className="w-3 h-3" /> Schedule
        </button>
      ),
    };
  };

  const filteredApps = useMemo(() => {
    return applications.filter((app) => {
      const q = searchQuery.toLowerCase().trim();
      const candName = `${app.candidate?.firstName || ''} ${app.candidate?.lastName || ''}`.toLowerCase();
      const email = (app.candidate?.email || '').toLowerCase();
      const code = (app.candidateCode || app.id || '').toLowerCase();
      
      const matchesSearch = !q || candName.includes(q) || email.includes(q) || code.includes(q);
      const matchesStatus = statusFilter === 'ALL' || app.status === statusFilter || app.overallStatus === statusFilter;
      const matchesRound = roundFilter === 'ALL' || String(app.currentRound) === roundFilter;

      return matchesSearch && matchesStatus && matchesRound;
    });
  }, [applications, searchQuery, statusFilter, roundFilter]);

  // Pagination Slice
  const totalPages = Math.ceil(filteredApps.length / itemsPerPage) || 1;
  const paginatedApps = useMemo(() => {
    const startIdx = (currentPage - 1) * itemsPerPage;
    return filteredApps.slice(startIdx, startIdx + itemsPerPage);
  }, [filteredApps, currentPage, itemsPerPage]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, statusFilter, roundFilter]);

  return (
    <DashboardLayout>
      <div className="space-y-6 animate-fadeIn pb-12">
        {/* Header Title */}
        <div className="p-6 rounded-2xl bg-white border border-slate-200 flex flex-col lg:flex-row lg:items-center justify-between gap-4 shadow-xs">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-extrabold text-orange-600 uppercase tracking-wider block">
                HR Specialist Console
              </span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-orange-100 text-orange-800">
                👥 My Candidates
              </span>
            </div>
            <h1 className="text-2xl font-black text-slate-900 mt-1">My Assigned Candidates</h1>
            <p className="text-slate-500 text-xs sm:text-sm mt-0.5">
              Manage, schedule Round 1 & Round 2 interviews, and monitor candidates assigned to your recruiter queue.
            </p>
          </div>

          <button
            onClick={loadData}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white hover:bg-slate-50 text-slate-800 text-xs font-bold border border-slate-300 shadow-2xs transition-all"
          >
            <RotateCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} /> Refresh
          </button>
        </div>

        {/* Filter & Search Bar */}
        <div className="p-4 rounded-2xl bg-white border border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-xs">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search candidate name, email, ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs placeholder:text-slate-400 focus:border-orange-500 focus:bg-white outline-none transition-all"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-700 text-xs font-medium outline-none focus:border-orange-500"
            >
              <option value="ALL">All Statuses</option>
              <option value="ASSIGNED">Assigned</option>
              <option value="ROUND_1_PENDING">Round 1 Scheduled</option>
              <option value="ROUND_1_SELECTED">Round 1 Cleared</option>
              <option value="ROUND_2_PENDING">Round 2 Scheduled</option>
              <option value="FINAL_SELECTED">Final Selected</option>
              <option value="REJECTED">Rejected</option>
            </select>

            <select
              value={roundFilter}
              onChange={(e) => setRoundFilter(e.target.value)}
              className="px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-700 text-xs font-medium outline-none focus:border-orange-500"
            >
              <option value="ALL">All Rounds</option>
              <option value="1">Round 1</option>
              <option value="2">Round 2</option>
            </select>
          </div>
        </div>

        {/* Operational Candidate Table */}
        <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-500 font-extrabold uppercase tracking-wider">
                  <th className="py-3 px-4">Candidate ID & Name</th>
                  <th className="py-3 px-4">Opening</th>
                  <th className="py-3 px-4">Current Round</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Latest Interview</th>
                  <th className="py-3 px-4">Resume</th>
                  <th className="py-3 px-4 text-center min-w-[280px]">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {loading ? (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-slate-400">
                      <div className="flex flex-col items-center gap-2">
                        <div className="w-7 h-7 border-3 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
                        <p className="font-semibold text-xs text-slate-500">Loading candidate list...</p>
                      </div>
                    </td>
                  </tr>
                ) : paginatedApps.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-slate-400">
                      <p className="font-semibold text-xs">No candidates found.</p>
                    </td>
                  </tr>
                ) : (
                  paginatedApps.map((app) => {
                    const candidate = app.candidate || {};
                    const candName = `${candidate.firstName || ''} ${candidate.lastName || ''}`.trim() || 'Candidate';
                    const appId = app.candidateCode || app.id?.slice(0, 10) || 'APP-2026';
                    const stage = getDisplayStageInfo(app);

                    return (
                      <tr key={app.id} className="hover:bg-orange-50/20 transition-colors">
                        {/* Candidate ID & Name */}
                        <td className="py-3.5 px-4">
                          <span className="font-bold text-slate-900 block">
                            {candName}
                          </span>
                          <span className="text-[10px] text-slate-400 font-mono block">
                            {appId} • {candidate.email}
                          </span>
                        </td>

                        {/* Opening */}
                        <td className="py-3.5 px-4 text-slate-700 font-medium max-w-[180px] truncate">
                          {app.job?.title || 'Open Position'}
                        </td>

                        {/* Current Round */}
                        <td className="py-3.5 px-4 whitespace-nowrap">
                          {stage.currentRoundBadge}
                        </td>

                        {/* Status */}
                        <td className="py-3.5 px-4 whitespace-nowrap">
                          {stage.statusBadge}
                        </td>

                        {/* Latest Interview */}
                        <td className="py-3.5 px-4 text-slate-600 whitespace-nowrap">
                          {stage.latestIvText}
                        </td>

                        {/* Resume */}
                        <td className="py-3.5 px-4 whitespace-nowrap">
                          <button
                            onClick={() => handleOpenResume(candidate.resumeUrl, candName)}
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold text-xs"
                          >
                            <FileText className="w-3.5 h-3.5 text-orange-600" /> View
                          </button>
                        </td>

                        {/* Centered Actions */}
                        <td className="py-3.5 px-4 text-center whitespace-nowrap">
                          <div className="flex items-center justify-center gap-1.5">
                            <button
                              onClick={() => {
                                setSelectedAppForPreview(app);
                                setPreviewModalOpen(true);
                              }}
                              className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs"
                            >
                              Profile
                            </button>

                            {stage.actionBtn}
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination Controls */}
          {filteredApps.length > 0 && (
            <div className="px-6 py-4 border-t border-slate-200 bg-slate-50/50 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
              <div className="text-slate-500 font-medium">
                Showing <strong className="text-slate-800">{(currentPage - 1) * itemsPerPage + 1}</strong> to{' '}
                <strong className="text-slate-800">
                  {Math.min(currentPage * itemsPerPage, filteredApps.length)}
                </strong>{' '}
                of <strong className="text-slate-800">{filteredApps.length}</strong> candidates
              </div>

              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                  disabled={currentPage === 1}
                  className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-slate-300 bg-white font-bold text-slate-700 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                >
                  <ChevronLeft className="w-4 h-4" /> Prev
                </button>

                <div className="flex items-center gap-1">
                  {Array.from({ length: totalPages }, (_, idx) => idx + 1)
                    .filter((page) => page === 1 || page === totalPages || Math.abs(page - currentPage) <= 1)
                    .map((page, idx, arr) => (
                      <React.Fragment key={page}>
                        {idx > 0 && arr[idx - 1] !== page - 1 && (
                          <span className="px-1 text-slate-400">...</span>
                        )}
                        <button
                          onClick={() => setCurrentPage(page)}
                          className={`w-7 h-7 rounded-lg font-bold text-xs transition-all ${
                            currentPage === page
                              ? 'bg-orange-600 text-white shadow-xs'
                              : 'bg-white border border-slate-300 text-slate-700 hover:bg-slate-100'
                          }`}
                        >
                          {page}
                        </button>
                      </React.Fragment>
                    ))}
                </div>

                <button
                  onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-slate-300 bg-white font-bold text-slate-700 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                >
                  Next <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Dual-Tab Interview Schedule & Live Email Preview Modal */}
        <InterviewScheduleModal
          isOpen={scheduleModalOpen}
          onClose={() => setScheduleModalOpen(false)}
          application={selectedAppForSchedule}
          defaultRoundNumber={selectedRoundNumber}
          defaultRoundName={selectedRoundName}
          hrUser={user}
          onSuccess={loadData}
        />

        {/* Other Modals */}
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
          onViewResume={handleOpenResume}
          showActions={false}
        />
      </div>
    </DashboardLayout>
  );
};

export default HRSpecialistCandidatesPage;


