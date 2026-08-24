import React, { useState, useEffect, useMemo } from 'react';
import { createPortal } from 'react-dom';
import {
  Calendar,
  RotateCw,
  Search,
  FileText,
  Video,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  X
} from 'lucide-react';
import toast from 'react-hot-toast';
import DashboardLayout from '../../components/layout/DashboardLayout';
import applicationService from '../../services/applicationService';
import interviewService from '../../services/interviewService';
import ResumeViewerModal from '../../components/ats/ResumeViewerModal';
import CandidatePreviewModal from '../../components/ats/CandidatePreviewModal';
import InterviewScheduleModal from '../../components/ats/InterviewScheduleModal';
import { useAuth } from '../../context/AuthContext';

export const HRSpecialistRound1Page: React.FC = () => {
  const { user } = useAuth();
  const [applications, setApplications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Schedule Modal
  const [scheduleModalOpen, setScheduleModalOpen] = useState(false);
  const [selectedAppForSchedule, setSelectedAppForSchedule] = useState<any>(null);

  // Evaluation Modal
  const [evaluationModalOpen, setEvaluationModalOpen] = useState(false);
  const [selectedApp, setSelectedApp] = useState<any>(null);
  const [rating, setRating] = useState(8);
  const [feedback, setFeedback] = useState('Candidate demonstrated strong domain knowledge and effective communication.');
  const [decision, setDecision] = useState<'SELECTED' | 'REJECTED'>('SELECTED');
  const [submitting, setSubmitting] = useState(false);

  // Preview & Resume Modals
  const [resumeModalOpen, setResumeModalOpen] = useState(false);
  const [activeResumeUrl, setActiveResumeUrl] = useState('');
  const [activeCandidateName, setActiveCandidateName] = useState('');

  const [previewModalOpen, setPreviewModalOpen] = useState(false);
  const [previewApp, setPreviewApp] = useState<any>(null);

  const loadData = async () => {
    setLoading(true);
    try {
      const res = await applicationService.getAllApplications({ assignedHrId: user?.id });
      const apps = res.applications || res.data || (Array.isArray(res) ? res : []);
      const r1Apps = apps.filter((a: any) =>
        ['ASSIGNED', 'ROUND_1_PENDING', 'ROUND_1_SELECTED', 'ROUND_1_REJECTED'].includes(a.status) ||
        (a.status === 'INTERVIEW_SCHEDULED' && (a.currentRound === 1 || a.currentRound === 0))
      );
      setApplications(r1Apps);
    } catch (err: any) {
      toast.error('Failed to load Round 1 candidates: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [user?.id]);

  const filteredApps = useMemo(() => {
    return applications.filter((app) => {
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const candName = `${app.candidate?.firstName || ''} ${app.candidate?.lastName || ''}`.toLowerCase();
        const email = (app.candidate?.email || '').toLowerCase();
        const code = (app.candidateCode || app.id || '').toLowerCase();
        if (!candName.includes(q) && !email.includes(q) && !code.includes(q)) {
          return false;
        }
      }
      return true;
    });
  }, [applications, searchQuery]);

  // Pagination Slice
  const totalPages = Math.ceil(filteredApps.length / itemsPerPage) || 1;
  const paginatedApps = useMemo(() => {
    const startIdx = (currentPage - 1) * itemsPerPage;
    return filteredApps.slice(startIdx, startIdx + itemsPerPage);
  }, [filteredApps, currentPage, itemsPerPage]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery]);

  // Open Schedule Modal
  const handleOpenSchedule = (app: any) => {
    setSelectedAppForSchedule(app);
    setScheduleModalOpen(true);
  };

  // Open Evaluation Scorecard Modal
  const handleOpenEvaluation = (app: any) => {
    setSelectedApp(app);
    setRating(8);
    setFeedback('Candidate demonstrated strong domain knowledge and effective communication.');
    setDecision('SELECTED');
    setEvaluationModalOpen(true);
  };

  // Submit Evaluation Scorecard
  const handleSubmitEvaluation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedApp) return;

    const round1Interview = selectedApp.interviews?.find((i: any) => i.roundNumber === 1);
    if (!round1Interview?.id) {
      toast.error('No scheduled Round 1 interview record found to evaluate.');
      return;
    }

    setSubmitting(true);
    const toastId = toast.loading('Submitting Round 1 Scorecard...');

    try {
      await interviewService.updateFeedback(round1Interview.id, {
        rating,
        feedback,
        status: 'COMPLETED',
        result: decision,
      });

      toast.success(
        decision === 'SELECTED'
          ? 'Candidate PASSED Round 1! Advanced to Round 2 pool.'
          : 'Candidate REJECTED in Round 1.',
        { id: toastId }
      );

      setEvaluationModalOpen(false);
      loadData();
    } catch (err: any) {
      toast.error('Failed to submit evaluation: ' + (err.message || 'Error'), { id: toastId });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6 animate-fadeIn pb-12">
        {/* Header Title */}
        <div className="p-6 rounded-2xl bg-white border border-slate-200 flex flex-col lg:flex-row lg:items-center justify-between gap-4 shadow-xs">
          <div>
            {/* <div className="flex items-center gap-2">
              <span className="text-xs font-extrabold text-orange-600 uppercase tracking-wider block">
                HR Specialist Console
              </span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-orange-100 text-orange-800">
                🟠 Round 1: Screening & Domain
              </span>
            </div> */}
            <h1 className="text-2xl font-black text-slate-900 mt-1">Round 1 Evaluation</h1>
            <p className="text-slate-500 text-xs sm:text-sm mt-0.5">
              Schedule initial video interview (dispatches combined shortlist + schedule email) and evaluate domain skills to advance candidates to Round 2.
            </p>
          </div>

          <button
            onClick={loadData}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white hover:bg-slate-50 text-slate-800 text-xs font-bold border border-slate-300 shadow-2xs transition-all"
          >
            <RotateCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} /> Refresh Table
          </button>
        </div>

        {/* Filter & Search Bar */}
        <div className="p-4 rounded-2xl bg-white border border-slate-200 flex items-center justify-between gap-3 shadow-xs">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search candidate..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs placeholder:text-slate-400 focus:border-orange-500 focus:bg-white outline-none transition-all"
            />
          </div>

          <span className="text-xs font-bold text-slate-500">
            {filteredApps.length} Assigned Candidate(s) in Round 1
          </span>
        </div>

        {/* Round 1 Table */}
        <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50/80 text-slate-500 font-extrabold uppercase tracking-wider">
                  <th className="py-3 px-4">Application ID</th>
                  <th className="py-3 px-4">Candidate</th>
                  <th className="py-3 px-4">Job Role</th>
                  <th className="py-3 px-3">ATS Score</th>
                  <th className="py-3 px-3">Round 1 Status</th>
                  <th className="py-3 px-3">Scheduled Time</th>
                  <th className="py-3 px-4">Resume</th>
                  <th className="py-3 px-4 text-center min-w-[340px]">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {loading ? (
                  <tr>
                    <td colSpan={8} className="py-12 text-center text-slate-400">
                      <div className="flex flex-col items-center gap-2">
                        <div className="w-7 h-7 border-3 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
                        <p className="font-semibold text-xs text-slate-500">Loading Round 1 candidates...</p>
                      </div>
                    </td>
                  </tr>
                ) : paginatedApps.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-12 text-center text-slate-400">
                      <p className="font-semibold text-xs">No candidates found.</p>
                    </td>
                  </tr>
                ) : (
                  paginatedApps.map((app) => {
                    const candidate = app.candidate || {};
                    const candName = `${candidate.firstName || ''} ${candidate.lastName || ''}`.trim() || 'Candidate';
                    const appId = app.candidateCode || app.id?.slice(0, 10) || 'APP-2026';
                    const isPassed = app.status === 'ROUND_1_SELECTED' || app.currentRound > 1;
                    const isRejected = app.status === 'ROUND_1_REJECTED' || app.status === 'REJECTED';
                    const round1Iv = app.interviews?.find((i: any) => i.roundNumber === 1);

                    return (
                      <tr key={app.id} className="hover:bg-orange-50/20 transition-colors">
                        <td className="py-3.5 px-4 font-mono font-bold text-slate-700">{appId}</td>
                        <td className="py-3.5 px-4">
                          <div className="font-bold text-slate-900">{candName}</div>
                          <div className="text-[11px] text-slate-500 font-mono mt-0.5">{candidate.email}</div>
                        </td>
                        <td className="py-3.5 px-4 font-semibold text-slate-700 max-w-[180px] truncate">
                          {app.job?.title || 'Open Position'}
                        </td>
                        <td className="py-3.5 px-3 whitespace-nowrap">
                          {app.atsScore ? (
                            <span className="font-extrabold text-orange-700 bg-orange-50 px-2 py-0.5 rounded-md border border-orange-200/60">
                              {app.atsScore}/100
                            </span>
                          ) : (
                            <span className="text-slate-400">--</span>
                          )}
                        </td>
                        <td className="py-3.5 px-3 whitespace-nowrap">
                          <span
                            className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase ${isPassed
                                ? 'bg-emerald-100 text-emerald-800'
                                : isRejected
                                  ? 'bg-red-100 text-red-800'
                                  : round1Iv
                                    ? 'bg-blue-100 text-blue-800'
                                    : 'bg-amber-100 text-amber-800'
                              }`}
                          >
                            {isPassed ? 'CLEARED' : isRejected ? 'REJECTED' : round1Iv ? 'SCHEDULED' : 'PENDING'}
                          </span>
                        </td>
                        <td className="py-3.5 px-3 text-slate-600 whitespace-nowrap">
                          {round1Iv?.scheduledAt ? (
                            <div>
                              <span className="font-medium text-slate-800">
                                {new Date(round1Iv.scheduledAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })}
                              </span>
                              <span className="text-[10px] text-slate-400 block font-mono">
                                {new Date(round1Iv.scheduledAt).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                              </span>
                            </div>
                          ) : (
                            <span className="text-slate-400 italic">Not scheduled</span>
                          )}
                        </td>
                        <td className="py-3.5 px-4 whitespace-nowrap">
                          <button
                            onClick={() => {
                              setActiveResumeUrl(candidate.resumeUrl);
                              setActiveCandidateName(candName);
                              setResumeModalOpen(true);
                            }}
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold text-xs"
                          >
                            <FileText className="w-3.5 h-3.5 text-orange-600" /> View
                          </button>
                        </td>
                        <td className="py-3.5 px-4 text-center whitespace-nowrap">
                          <div className="flex items-center justify-center gap-1.5">
                            <button
                              onClick={() => {
                                setPreviewApp(app);
                                setPreviewModalOpen(true);
                              }}
                              className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs"
                            >
                              Profile
                            </button>

                            {round1Iv?.meetingLink && (
                              <a
                                href={round1Iv.meetingLink}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-bold text-xs border border-emerald-200 shadow-2xs transition-all"
                                title="Open Google Meet Link"
                              >
                                <Video className="w-3.5 h-3.5 text-emerald-600" />
                                <span>Meet Link</span>
                                <ExternalLink className="w-2.5 h-2.5 text-emerald-500" />
                              </a>
                            )}

                            <button
                              onClick={() => handleOpenSchedule(app)}
                              className="px-2.5 py-1 rounded-lg bg-white hover:bg-slate-100 text-slate-800 font-bold text-xs border border-slate-300 shadow-2xs"
                            >
                              {round1Iv ? 'Reschedule' : 'Schedule R1'}
                            </button>

                            <button
                              onClick={() => handleOpenEvaluation(app)}
                              className="px-3.5 py-1 rounded-lg bg-orange-600 hover:bg-orange-700 text-white font-extrabold text-xs shadow-xs"
                            >
                              Evaluate
                            </button>
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
                          className={`w-7 h-7 rounded-lg font-bold text-xs transition-all ${currentPage === page
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
          defaultRoundNumber={1}
          defaultRoundName="Round 1: Screening & Domain"
          hrUser={user}
          onSuccess={loadData}
        />

        {/* Evaluation Modal (Rendered via Portal) */}
        {evaluationModalOpen && selectedApp && typeof document !== 'undefined' && createPortal(
          <div
            className="fixed inset-0 z-[99999] bg-slate-950/75 backdrop-blur-sm overflow-y-auto flex items-center justify-center p-4 min-h-screen"
            onClick={() => setEvaluationModalOpen(false)}
          >
            <div
              className="max-w-md w-full bg-white border border-slate-200 rounded-3xl p-6 sm:p-7 shadow-2xl space-y-4 my-auto relative animate-scaleUp"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <div>
                  <span className="text-[10px] font-extrabold text-orange-600 uppercase tracking-wider block">Round 1 Evaluation Scorecard</span>
                  <h3 className="text-base font-extrabold text-slate-900 mt-0.5">
                    {selectedApp.candidate?.firstName} {selectedApp.candidate?.lastName}
                  </h3>
                </div>
                <button
                  onClick={() => setEvaluationModalOpen(false)}
                  className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs">
                <div className="font-bold text-slate-900">{selectedApp.job?.title || 'Open Position'}</div>
                <div className="text-[11px] text-slate-500 font-mono mt-0.5">{selectedApp.candidateCode} • {selectedApp.candidate?.email}</div>
              </div>

              <form onSubmit={handleSubmitEvaluation} className="space-y-4 text-xs">
                <div>
                  <label className="text-slate-700 font-bold block mb-1">Score / Rating (1 - 10)</label>
                  <input
                    type="number"
                    min="1"
                    max="10"
                    required
                    value={rating}
                    onChange={(e) => setRating(parseInt(e.target.value) || 1)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 font-black text-sm outline-none focus:border-orange-500"
                  />
                </div>

                <div>
                  <label className="text-slate-700 font-bold block mb-1">Round 1 Decision</label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setDecision('SELECTED')}
                      className={`py-2.5 px-3 rounded-xl font-extrabold text-xs border transition-all ${decision === 'SELECTED'
                          ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs ring-2 ring-emerald-500/20'
                          : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                        }`}
                    >
                      ✓ Pass to Round 2
                    </button>
                    <button
                      type="button"
                      onClick={() => setDecision('REJECTED')}
                      className={`py-2.5 px-3 rounded-xl font-extrabold text-xs border transition-all ${decision === 'REJECTED'
                          ? 'bg-red-600 text-white border-red-600 shadow-xs ring-2 ring-red-500/20'
                          : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                        }`}
                    >
                      ✕ Reject Candidate
                    </button>
                  </div>
                </div>

                <div>
                  <label className="text-slate-700 font-bold block mb-1">Interviewer Feedback & Notes</label>
                  <textarea
                    rows={3}
                    required
                    value={feedback}
                    onChange={(e) => setFeedback(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 outline-none focus:border-orange-500 font-medium"
                  />
                </div>

                <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200">
                  <button
                    type="button"
                    onClick={() => setEvaluationModalOpen(false)}
                    disabled={submitting}
                    className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="px-5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-xs shadow-xs disabled:opacity-50"
                  >
                    {submitting ? 'Submitting...' : 'Save Evaluation'}
                  </button>
                </div>
              </form>
            </div>
          </div>,
          document.body
        )}

        <ResumeViewerModal
          isOpen={resumeModalOpen}
          onClose={() => setResumeModalOpen(false)}
          resumeUrl={activeResumeUrl}
          candidateName={activeCandidateName}
        />

        <CandidatePreviewModal
          isOpen={previewModalOpen}
          onClose={() => setPreviewModalOpen(false)}
          application={previewApp}
          showActions={false}
          onViewResume={(url, name) => {
            setActiveResumeUrl(url);
            setActiveCandidateName(name);
            setResumeModalOpen(true);
          }}
        />
      </div>
    </DashboardLayout>
  );
};

export default HRSpecialistRound1Page;
