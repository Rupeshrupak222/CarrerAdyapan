import React, { useState, useEffect, useMemo } from 'react';
import { 
  Calendar, 
  RotateCw, 
  Search, 
  CheckCircle2, 
  XCircle, 
  FileText, 
  Video, 
  Star, 
  ArrowRight,
  Sparkles,
  Award
} from 'lucide-react';
import toast from 'react-hot-toast';
import DashboardLayout from '../../components/layout/DashboardLayout';
import applicationService from '../../services/applicationService';
import interviewService from '../../services/interviewService';
import ResumeViewerModal from '../../components/ats/ResumeViewerModal';
import CandidatePreviewModal from '../../components/ats/CandidatePreviewModal';
import { useAuth } from '../../context/AuthContext';

export const HRSpecialistRound2Page: React.FC = () => {
  const { user } = useAuth();
  const [applications, setApplications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  // Modals
  const [evaluationModalOpen, setEvaluationModalOpen] = useState(false);
  const [selectedApp, setSelectedApp] = useState<any>(null);
  const [rating, setRating] = useState(9);
  const [feedback, setFeedback] = useState('Excellent problem solving, technical depth, and cultural alignment with Adyapan.');
  const [decision, setDecision] = useState<'SELECTED' | 'REJECTED'>('SELECTED');
  const [submitting, setSubmitting] = useState(false);

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
      // Round 2 includes candidates who cleared Round 1
      const r2Apps = apps.filter((a: any) =>
        ['ROUND_1_SELECTED', 'ROUND_2_PENDING', 'ROUND_2_SELECTED', 'FINAL_ROUND'].includes(a.status) || a.currentRound === 2
      );
      setApplications(r2Apps);
    } catch (err: any) {
      toast.error('Failed to load Round 2 candidates: ' + err.message);
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

  const handleOpenEvaluation = (app: any) => {
    setSelectedApp(app);
    setRating(9);
    setFeedback('Excellent problem solving, technical depth, and cultural alignment with Adyapan.');
    setDecision('SELECTED');
    setEvaluationModalOpen(true);
  };

  const handleSubmitEvaluation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedApp) return;
    setSubmitting(true);
    try {
      // Find or create interview record for round 2
      let interviewId = selectedApp.interviews?.find((i: any) => i.roundNumber === 2)?.id;
      if (!interviewId) {
        const intRes = await interviewService.createInterview({
          applicationId: selectedApp.id,
          candidateId: selectedApp.candidateId,
          jobId: selectedApp.jobId,
          candidateName: `${selectedApp.candidate?.firstName} ${selectedApp.candidate?.lastName}`,
          candidateEmail: selectedApp.candidate?.email,
          jobTitle: selectedApp.job?.title,
          roundNumber: 2,
          roundName: 'Round 2: Technical & Leadership Assessment',
          hrId: user?.id,
          scheduledAt: new Date(),
        });
        interviewId = intRes.interview?.id;
      }

      if (interviewId) {
        await interviewService.updateFeedback(interviewId, {
          feedback,
          rating,
          result: decision,
          status: 'COMPLETED',
        });
      }

      if (decision === 'SELECTED') {
        await applicationService.updateStatus(selectedApp.id, 'FINAL_ROUND');
        toast.success('Round 2 Cleared! Candidate moved to HR Manager Final Round Selected.');
      } else {
        await applicationService.updateStatus(selectedApp.id, 'ROUND_2_REJECTED', 'REJECTED');
        toast.success('Candidate marked as rejected in Round 2.');
      }

      setEvaluationModalOpen(false);
      loadData();
    } catch (err: any) {
      toast.error('Evaluation failed: ' + err.message);
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
            <div className="flex items-center gap-2">
              <span className="text-xs font-extrabold text-orange-600 uppercase tracking-wider block">
                HR Specialist Console
              </span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-800">
                🔵 Round 2: Technical & Leadership
              </span>
            </div>
            <h1 className="text-2xl font-black text-slate-900 mt-1">Round 2 Evaluation</h1>
            <p className="text-slate-500 text-xs sm:text-sm mt-0.5">
              Conduct Round 2 technical assessments for Round 1 cleared candidates. Marking Selected automatically moves the candidate to the HR Manager's Final Round Selected list.
            </p>
          </div>

          <button
            onClick={loadData}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white hover:bg-slate-50 text-slate-800 text-xs font-bold border border-slate-300 shadow-2xs transition-all"
          >
            <RotateCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} /> Refresh
          </button>
        </div>

        {/* Search */}
        <div className="p-4 rounded-2xl bg-white border border-slate-200 flex items-center justify-between shadow-xs">
          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search candidate..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 outline-none focus:border-orange-500 focus:bg-white transition-all"
            />
          </div>

          <span className="text-xs font-bold text-slate-500">
            {filteredApps.length} Round 1 Cleared Candidate(s)
          </span>
        </div>

        {/* Round 2 Table */}
        <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50/80 text-slate-500 font-extrabold uppercase tracking-wider">
                  <th className="py-3 px-4">Application ID</th>
                  <th className="py-3 px-4">Candidate</th>
                  <th className="py-3 px-4">Job Role</th>
                  <th className="py-3 px-3">Round 1 Result</th>
                  <th className="py-3 px-3">Round 2 Status</th>
                  <th className="py-3 px-4">Resume</th>
                  <th className="py-3 px-4 text-right">Evaluation</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {loading ? (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-slate-400">
                      <div className="flex flex-col items-center gap-2">
                        <div className="w-7 h-7 border-3 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
                        <p className="font-semibold text-xs text-slate-500">Loading Round 2 candidates...</p>
                      </div>
                    </td>
                  </tr>
                ) : filteredApps.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-slate-400">
                      <p className="font-semibold text-xs">No candidates currently waiting for Round 2 evaluation.</p>
                    </td>
                  </tr>
                ) : (
                  filteredApps.map((app) => {
                    const candidate = app.candidate || {};
                    const candName = `${candidate.firstName || ''} ${candidate.lastName || ''}`.trim() || 'Candidate';
                    const appId = app.candidateCode || app.id?.slice(0, 10) || 'APP-2026';
                    const isFinalSelected = app.status === 'FINAL_ROUND' || app.status === 'ROUND_2_SELECTED' || app.finalSelected;
                    const isRejected = app.status === 'ROUND_2_REJECTED' || app.status === 'REJECTED';

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
                          <span className="inline-flex items-center gap-1 text-[10px] font-extrabold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200/60">
                            <CheckCircle2 className="w-3 h-3" /> PASSED
                          </span>
                        </td>
                        <td className="py-3.5 px-3 whitespace-nowrap">
                          <span
                            className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase ${
                              isFinalSelected
                                ? 'bg-emerald-100 text-emerald-800'
                                : isRejected
                                ? 'bg-red-100 text-red-800'
                                : 'bg-blue-100 text-blue-800'
                            }`}
                          >
                            {isFinalSelected ? 'FINAL SELECTED' : isRejected ? 'REJECTED' : 'PENDING'}
                          </span>
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
                        <td className="py-3.5 px-4 text-right whitespace-nowrap">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => {
                                setPreviewApp(app);
                                setPreviewModalOpen(true);
                              }}
                              className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs"
                            >
                              Profile
                            </button>
                            <button
                              onClick={() => handleOpenEvaluation(app)}
                              className="px-3.5 py-1 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs shadow-xs"
                            >
                              Evaluate Round 2
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
        </div>

        {/* Viewport-Centered Evaluation Modal */}
        {evaluationModalOpen && selectedApp && (
          <div 
            className="fixed inset-0 z-[9999] bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn"
            onClick={() => setEvaluationModalOpen(false)}
          >
            <div 
              className="max-w-md w-full bg-white border border-slate-200 rounded-2xl p-6 shadow-2xl space-y-4 animate-scaleUp my-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-base font-extrabold text-slate-900">
                Round 2 Technical Evaluation: {selectedApp.candidate?.firstName} {selectedApp.candidate?.lastName}
              </h3>
              <p className="text-xs text-slate-500 font-mono">
                {selectedApp.candidateCode || selectedApp.id} • {selectedApp.job?.title}
              </p>

              <form onSubmit={handleSubmitEvaluation} className="space-y-3.5 text-xs">
                <div>
                  <label className="text-slate-700 font-bold block mb-1">Score / Rating (1 - 10)</label>
                  <input
                    type="number"
                    min="1"
                    max="10"
                    required
                    value={rating}
                    onChange={(e) => setRating(parseInt(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 font-bold outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="text-slate-700 font-bold block mb-1">Round 2 Decision</label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setDecision('SELECTED')}
                      className={`py-2 rounded-xl font-extrabold text-xs border transition-all ${
                        decision === 'SELECTED'
                          ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                          : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      ✓ Selected (Move to Final Round)
                    </button>
                    <button
                      type="button"
                      onClick={() => setDecision('REJECTED')}
                      className={`py-2 rounded-xl font-extrabold text-xs border transition-all ${
                        decision === 'REJECTED'
                          ? 'bg-red-600 text-white border-red-600 shadow-xs'
                          : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      ✕ Reject Candidate
                    </button>
                  </div>
                </div>

                <div>
                  <label className="text-slate-700 font-bold block mb-1">Technical Assessment Feedback</label>
                  <textarea
                    rows={3}
                    required
                    value={feedback}
                    onChange={(e) => setFeedback(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 outline-none focus:border-blue-500"
                  />
                </div>

                <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200">
                  <button
                    type="button"
                    onClick={() => setEvaluationModalOpen(false)}
                    disabled={submitting}
                    className="px-3.5 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="px-4 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white font-semibold shadow-xs disabled:opacity-50"
                  >
                    {submitting ? 'Submitting...' : 'Save Evaluation'}
                  </button>
                </div>
              </form>
            </div>
          </div>
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
          onRunAts={() => {}}
          onViewResume={(url, name) => {
            setActiveResumeUrl(url);
            setActiveCandidateName(name);
            setResumeModalOpen(true);
          }}
          onShortlist={() => {}}
          onReject={() => {}}
        />
      </div>
    </DashboardLayout>
  );
};

export default HRSpecialistRound2Page;
