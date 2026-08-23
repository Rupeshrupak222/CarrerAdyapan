import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { interviewService } from '../../services/interviewService';
import { candidateService } from '../../services/candidateService';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';
import { 
  Calendar, 
  Clock, 
  Video, 
  Users, 
  CheckCircle2, 
  XCircle, 
  Plus, 
  Search, 
  Filter, 
  ExternalLink, 
  UserCheck, 
  Sparkles, 
  FileText,
  Award,
  RefreshCw,
  SlidersHorizontal
} from 'lucide-react';

const Interviews: React.FC = () => {
  const { user } = useAuth();
  const location = useLocation();

  const isHR = user?.role === 'HR';

  const [interviews, setInterviews] = useState<any[]>([]);
  const [candidates, setCandidates] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roundFilter, setRoundFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');

  // Schedule Modal
  const [showAddModal, setShowAddModal] = useState(false);
  const [formData, setFormData] = useState({
    candidateId: '',
    roundNumber: 1,
    roundName: 'Round 1: Screening / HR',
    scheduledAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().slice(0, 16),
    duration: 30,
    type: 'VIDEO',
    meetingLink: user?.meetLink || 'https://meet.google.com/adyapan-interview',
    instructions: 'Please be ready with a quiet setup and video enabled.',
  });

  // Scorecard Evaluation Modal
  const [feedbackModalOpen, setFeedbackModalOpen] = useState(false);
  const [selectedInterview, setSelectedInterview] = useState<any>(null);
  const [feedbackData, setFeedbackData] = useState({
    technicalScore: 8,
    communicationScore: 8,
    problemSolving: 8,
    cultureFit: 9,
    overallScore: 8,
    recommendation: 'YES',
    decision: 'SELECTED',
    notes: '',
    strengths: '',
    weaknesses: '',
  });

  useEffect(() => {
    fetchData();
  }, [user]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [intRes, candRes] = await Promise.all([
        interviewService.getAllInterviews(true).catch(() => null),
        candidateService.getAllCandidates(true).catch(() => null),
      ]);

      let fetchedInterviews = intRes?.interviews || [];
      let fetchedCandidates = candRes?.candidates || [];

      // STRICT HR ISOLATION: HR Specialist sees ONLY their assigned candidates and interviews!
      if (isHR && user?.id) {
        fetchedInterviews = fetchedInterviews.filter((iv: any) => 
          iv.hrId === user.id || 
          iv.application?.assignedHrId === user.id ||
          iv.hr?.email?.toLowerCase() === user.email?.toLowerCase()
        );
      }

      // STRICT REJECTION FILTER: Exclude any candidates who have been rejected!
      fetchedCandidates = fetchedCandidates.filter((cand: any) => {
        const app = cand.applications?.[0];
        if (!app) return true;
        const isRejected = 
          app.status === 'REJECTED' || 
          app.overallStatus === 'REJECTED' || 
          app.interviews?.some((i: any) => i.result === 'REJECTED');
        
        if (isRejected) return false;

        // If filtering by HR
        if (isHR && user?.id) {
          return (
            app?.assignedHrId === user.id ||
            app?.assignedHr?.email?.toLowerCase() === user.email?.toLowerCase()
          );
        }
        return true;
      });

      setInterviews(fetchedInterviews);
      setCandidates(fetchedCandidates);

      if (fetchedCandidates.length > 0) {
        setFormData((prev) => ({ ...prev, candidateId: fetchedCandidates[0].id }));
      } else {
        setFormData((prev) => ({ ...prev, candidateId: '' }));
      }
    } catch (err: any) {
      toast.error('Failed to load interviews');
    } finally {
      setLoading(false);
    }
  };

  const handleScheduleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.candidateId) {
      toast.error('Please select an assigned candidate');
      return;
    }

    const targetCand = candidates.find((c) => c.id === formData.candidateId);
    const app = targetCand?.applications?.[0];
    const toastId = toast.loading(`Scheduling ${formData.roundName}...`);

    try {
      await interviewService.createInterview({
        applicationId: app?.id,
        candidateId: formData.candidateId,
        candidateName: `${targetCand?.firstName} ${targetCand?.lastName}`,
        candidateEmail: targetCand?.email,
        jobTitle: app?.job?.title || 'Business Development Associate',
        jobId: app?.jobId,
        hrId: user?.id,
        roundNumber: formData.roundNumber,
        roundName: formData.roundName,
        scheduledAt: new Date(formData.scheduledAt).toISOString(),
        duration: formData.duration,
        type: formData.type,
        meetingLink: formData.meetingLink,
      });

      toast.success(`${formData.roundName} scheduled & candidate emailed!`, { id: toastId });
      setShowAddModal(false);
      fetchData();
    } catch (err) {
      toast.error('Failed to schedule interview', { id: toastId });
    }
  };

  const handleOpenScorecard = (interview: any) => {
    setSelectedInterview(interview);
    setFeedbackData({
      technicalScore: 8,
      communicationScore: 8,
      problemSolving: 8,
      cultureFit: 9,
      overallScore: 8,
      recommendation: 'YES',
      decision: 'SELECTED',
      notes: '',
      strengths: '',
      weaknesses: '',
    });
    setFeedbackModalOpen(true);
  };

  const handleScorecardSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedInterview) return;
    const toastId = toast.loading('Submitting interview evaluation scorecard...');
    try {
      await interviewService.updateInterviewFeedback(selectedInterview.id, {
        rating: feedbackData.overallScore,
        feedback: `Decision: ${feedbackData.decision} | Notes: ${feedbackData.notes}\nStrengths: ${feedbackData.strengths}\nWeaknesses: ${feedbackData.weaknesses}`,
        status: 'COMPLETED',
        result: feedbackData.decision,
      });

      toast.success(`Scorecard submitted! Candidate advanced as ${feedbackData.decision}.`, { id: toastId });
      setFeedbackModalOpen(false);
      fetchData();
    } catch (err) {
      toast.error('Failed to submit scorecard', { id: toastId });
    }
  };

  const round1Count = interviews.filter((i) => i.roundNumber === 1).length;
  const round2Count = interviews.filter((i) => i.roundNumber === 2).length;
  const round3Count = interviews.filter((i) => i.roundNumber === 3).length;
  const selectedCount = interviews.filter((i) => i.result === 'SELECTED').length;

  const filteredInterviews = interviews.filter((iv) => {
    const q = search.toLowerCase();
    const candName = (iv.candidateName || '').toLowerCase();
    const jobTitle = (iv.jobTitle || '').toLowerCase();
    const hrName = (iv.hr?.name || '').toLowerCase();
    const matchesSearch = !q || candName.includes(q) || jobTitle.includes(q) || hrName.includes(q);

    const matchesRound = roundFilter === 'ALL' || String(iv.roundNumber) === roundFilter;
    const matchesStatus = statusFilter === 'ALL' || iv.status === statusFilter || iv.result === statusFilter;

    return matchesSearch && matchesRound && matchesStatus;
  });

  return (
    <DashboardLayout>
      <div className="space-y-6 animate-fadeIn">
        {/* Top Header Banner */}
        <div className="p-6 sm:p-8 rounded-3xl bg-white border border-orange-200 shadow-sm relative overflow-hidden">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-orange-50 border border-orange-200 text-orange-800 text-xs font-bold uppercase tracking-wider mb-2">
                <Calendar className="w-3.5 h-3.5 text-orange-600" />
                {isHR ? 'My Assigned Interviews Hub' : 'Multi-Round Interview Operations'}
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
                {isHR ? `${user?.name}'s Interview Schedule` : 'Candidate Interview Center'}
              </h1>
              <p className="text-slate-500 text-sm mt-1">
                {isHR ? (
                  <>Managing <strong>{interviews.length} Assigned Interviews</strong> for your candidate pipeline.</>
                ) : (
                  <>Managing <strong>{interviews.length} Total Scheduled Interviews</strong> across all HR specialists.</>
                )}
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <button
                onClick={() => setShowAddModal(true)}
                disabled={candidates.length === 0}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-extrabold text-xs transition-all shadow-md shadow-orange-500/25 disabled:opacity-50"
              >
                <Plus className="w-4 h-4" /> Schedule Interview
              </button>

              <button
                onClick={fetchData}
                className="p-2.5 rounded-xl bg-white hover:bg-orange-50 text-slate-700 transition-all border border-orange-200"
                title="Refresh"
              >
                <RefreshCw className="w-4 h-4 text-orange-600" />
              </button>
            </div>
          </div>
        </div>

        {/* Round KPI Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="p-5 rounded-2xl bg-white border border-orange-200 shadow-sm">
            <span className="text-[11px] font-bold text-orange-600 uppercase tracking-wider block">Round 1 (Screening)</span>
            <p className="text-2xl font-black text-slate-900 mt-1">{round1Count}</p>
          </div>

          <div className="p-5 rounded-2xl bg-white border border-orange-200 shadow-sm">
            <span className="text-[11px] font-bold text-blue-600 uppercase tracking-wider block">Round 2 (Technical)</span>
            <p className="text-2xl font-black text-slate-900 mt-1">{round2Count}</p>
          </div>

          <div className="p-5 rounded-2xl bg-white border border-orange-200 shadow-sm">
            <span className="text-[11px] font-bold text-purple-600 uppercase tracking-wider block">Round 3 (Final HR)</span>
            <p className="text-2xl font-black text-slate-900 mt-1">{round3Count}</p>
          </div>

          <div className="p-5 rounded-2xl bg-white border border-orange-200 shadow-sm">
            <span className="text-[11px] font-bold text-emerald-600 uppercase tracking-wider block">Selected</span>
            <p className="text-2xl font-black text-emerald-600 mt-1">{selectedCount}</p>
          </div>
        </div>

        {/* Filter Toolbar */}
        <div className="p-4 rounded-2xl bg-white border border-orange-200 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-sm">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search candidate name, email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-xl bg-orange-50/30 border border-orange-200 text-slate-900 text-xs placeholder:text-slate-400 focus:border-orange-500 outline-none"
            />
          </div>

          <div className="flex items-center gap-2.5 w-full sm:w-auto">
            <select
              value={roundFilter}
              onChange={(e) => setRoundFilter(e.target.value)}
              className="px-3.5 py-2 rounded-xl bg-white border border-orange-200 text-slate-700 text-xs font-semibold focus:border-orange-500 outline-none"
            >
              <option value="ALL">All Rounds</option>
              <option value="1">Round 1 (Screening)</option>
              <option value="2">Round 2 (Technical)</option>
              <option value="3">Round 3 (Final HR)</option>
            </select>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3.5 py-2 rounded-xl bg-white border border-orange-200 text-slate-700 text-xs font-semibold focus:border-orange-500 outline-none"
            >
              <option value="ALL">All Outcomes</option>
              <option value="SCHEDULED">Scheduled Calls</option>
              <option value="SELECTED">Selected</option>
              <option value="REJECTED">Rejected</option>
              <option value="COMPLETED">Completed</option>
            </select>
          </div>
        </div>

        {/* Interviews Table */}
        <div className="bg-white border border-orange-200 rounded-3xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-orange-50/50 border-b border-orange-100 text-slate-600 font-bold uppercase tracking-wider">
                  <th className="py-4 px-5">Candidate</th>
                  <th className="py-4 px-5">Round</th>
                  <th className="py-4 px-5">Scheduled Time</th>
                  <th className="py-4 px-5">Assigned Interviewer</th>
                  <th className="py-4 px-5">Result</th>
                  <th className="py-4 px-5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {loading ? (
                  <tr>
                    <td colSpan={6} className="py-16 text-center text-slate-400">
                      <div className="w-8 h-8 border-2 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
                      Loading your interviews...
                    </td>
                  </tr>
                ) : filteredInterviews.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-16 text-center text-slate-400 font-medium">
                      No interviews scheduled for your assigned candidates.
                    </td>
                  </tr>
                ) : (
                  filteredInterviews.map((iv) => (
                    <tr key={iv.id} className="hover:bg-orange-50/30 transition-colors">
                      <td className="py-4 px-5">
                        <p className="font-bold text-slate-900 text-sm">{iv.candidateName || 'Candidate'}</p>
                        <span className="text-[11px] text-slate-400 font-mono">{iv.candidateEmail}</span>
                      </td>

                      <td className="py-4 px-5">
                        <span className="px-2.5 py-1 rounded-xl bg-orange-50 text-orange-800 font-bold border border-orange-200">
                          {iv.roundName || `Round ${iv.roundNumber}`}
                        </span>
                      </td>

                      <td className="py-4 px-5">
                        <div className="flex items-center gap-2 text-slate-700">
                          <Clock className="w-3.5 h-3.5 text-slate-400" />
                          <span>{new Date(iv.scheduledAt).toLocaleString()}</span>
                        </div>
                      </td>

                      <td className="py-4 px-5">
                        <span className="text-slate-700 font-medium">{iv.hr?.name || user?.name}</span>
                      </td>

                      <td className="py-4 px-5">
                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase ${
                          iv.result === 'SELECTED'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : iv.result === 'REJECTED'
                            ? 'bg-red-50 text-red-700 border border-red-200'
                            : 'bg-orange-50 text-orange-800 border border-orange-200'
                        }`}>
                          {iv.result || iv.status}
                        </span>
                      </td>

                      <td className="py-4 px-5 text-right">
                        <div className="flex items-center justify-end gap-2">
                          {iv.meetingLink && (
                            <a
                              href={iv.meetingLink}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="px-3 py-1.5 rounded-xl bg-orange-50 hover:bg-orange-100 text-orange-800 font-bold text-xs inline-flex items-center gap-1 transition-all border border-orange-200"
                            >
                              <Video className="w-3.5 h-3.5 text-orange-600" /> Join Meet
                            </a>
                          )}

                          <button
                            onClick={() => handleOpenScorecard(iv)}
                            className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-bold text-xs transition-all shadow-sm"
                          >
                            Scorecard
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Schedule Interview Modal (Strictly Shows Only Assigned Candidates) */}
        {showAddModal && (
          <div 
            className="fixed inset-0 z-50 bg-slate-950/65 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn"
            onClick={() => setShowAddModal(false)}
          >
            <div 
              className="max-w-md w-full bg-white border border-orange-200 rounded-3xl p-6 shadow-2xl animate-scaleUp my-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-xl font-extrabold text-slate-900 mb-1">Schedule Interview Call</h3>
              <p className="text-xs text-slate-500 mb-4">
                {isHR ? 'Select from your assigned candidates only.' : 'Select candidate and configure interview parameters.'}
              </p>

              <form onSubmit={handleScheduleSubmit} className="space-y-4 text-xs">
                <div>
                  <label className="text-slate-600 font-semibold uppercase">Candidate (Your Assigned Pool)</label>
                  {candidates.length === 0 ? (
                    <p className="text-xs text-red-600 mt-1">No assigned candidates currently available.</p>
                  ) : (
                    <select
                      value={formData.candidateId}
                      onChange={(e) => setFormData({ ...formData, candidateId: e.target.value })}
                      className="mt-1 w-full px-3.5 py-2.5 rounded-xl bg-orange-50/40 border border-orange-200 text-slate-900 font-bold outline-none focus:border-orange-500"
                    >
                      {candidates.map((cand) => (
                        <option key={cand.id} value={cand.id}>
                          {cand.firstName} {cand.lastName} ({cand.email})
                        </option>
                      ))}
                    </select>
                  )}
                </div>

                <div>
                  <label className="text-slate-600 font-semibold uppercase">Round Name</label>
                  <input
                    type="text"
                    value={formData.roundName}
                    onChange={(e) => setFormData({ ...formData, roundName: e.target.value })}
                    className="mt-1 w-full px-3.5 py-2.5 rounded-xl bg-white border border-slate-300 text-slate-900 font-medium outline-none focus:border-orange-500"
                  />
                </div>

                <div>
                  <label className="text-slate-600 font-semibold uppercase">Date & Time</label>
                  <input
                    type="datetime-local"
                    value={formData.scheduledAt}
                    onChange={(e) => setFormData({ ...formData, scheduledAt: e.target.value })}
                    className="mt-1 w-full px-3.5 py-2.5 rounded-xl bg-white border border-slate-300 text-slate-900 font-medium outline-none focus:border-orange-500"
                  />
                </div>

                <div>
                  <label className="text-slate-600 font-semibold uppercase">Google Meet Call Link</label>
                  <input
                    type="text"
                    value={formData.meetingLink}
                    onChange={(e) => setFormData({ ...formData, meetingLink: e.target.value })}
                    className="mt-1 w-full px-3.5 py-2.5 rounded-xl bg-white border border-slate-300 text-slate-900 font-medium outline-none focus:border-orange-500"
                  />
                </div>

                <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={candidates.length === 0}
                    className="px-5 py-2 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 text-white font-extrabold shadow-md shadow-orange-500/25 disabled:opacity-50"
                  >
                    Confirm & Send Email
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Scorecard Modal */}
        {feedbackModalOpen && (
          <div 
            className="fixed inset-0 z-50 bg-slate-950/65 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn"
            onClick={() => setFeedbackModalOpen(false)}
          >
            <div 
              className="max-w-lg w-full bg-white border border-orange-200 rounded-3xl p-6 shadow-2xl animate-scaleUp max-h-[90vh] overflow-y-auto my-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-xl font-extrabold text-slate-900 mb-1">
                Interview Scorecard Evaluation
              </h3>
              <p className="text-xs text-slate-500 mb-5">
                Candidate: <strong className="text-orange-600">{selectedInterview?.candidateName}</strong> ({selectedInterview?.roundName})
              </p>

              <form onSubmit={handleScorecardSubmit} className="space-y-4 text-xs">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-slate-600 font-semibold uppercase">Technical / Domain (1-10)</label>
                    <input
                      type="number"
                      min="1"
                      max="10"
                      value={feedbackData.technicalScore}
                      onChange={(e) => setFeedbackData({ ...feedbackData, technicalScore: parseInt(e.target.value) })}
                      className="mt-1 w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 font-bold outline-none focus:border-orange-500"
                    />
                  </div>

                  <div>
                    <label className="text-slate-600 font-semibold uppercase">Communication (1-10)</label>
                    <input
                      type="number"
                      min="1"
                      max="10"
                      value={feedbackData.communicationScore}
                      onChange={(e) => setFeedbackData({ ...feedbackData, communicationScore: parseInt(e.target.value) })}
                      className="mt-1 w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 font-bold outline-none focus:border-orange-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-slate-600 font-semibold uppercase">Recommendation</label>
                    <select
                      value={feedbackData.recommendation}
                      onChange={(e) => setFeedbackData({ ...feedbackData, recommendation: e.target.value })}
                      className="mt-1 w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 font-bold outline-none focus:border-orange-500"
                    >
                      <option value="STRONG_YES">Strong Yes</option>
                      <option value="YES">Yes</option>
                      <option value="HOLD">Hold</option>
                      <option value="NO">No</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-slate-600 font-semibold uppercase">Decision Outcome</label>
                    <select
                      value={feedbackData.decision}
                      onChange={(e) => setFeedbackData({ ...feedbackData, decision: e.target.value })}
                      className="mt-1 w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-emerald-700 font-bold outline-none focus:border-orange-500"
                    >
                      <option value="SELECTED">SELECTED (Unlock Next Round)</option>
                      <option value="REJECTED">REJECTED</option>
                      <option value="HOLD">HOLD</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="text-slate-600 font-semibold uppercase">Feedback Notes</label>
                  <textarea
                    rows={3}
                    placeholder="Candidate strengths and performance evaluation notes"
                    value={feedbackData.notes}
                    onChange={(e) => setFeedbackData({ ...feedbackData, notes: e.target.value })}
                    className="mt-1 w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 outline-none focus:border-orange-500"
                  />
                </div>

                <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setFeedbackModalOpen(false)}
                    className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold shadow-sm"
                  >
                    Lock Scorecard & Submit
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

export default Interviews;