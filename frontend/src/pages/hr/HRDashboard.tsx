import React, { useState, useEffect } from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { 
  Users, 
  UserCheck, 
  Calendar, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  FileText, 
  Video, 
  Search, 
  RefreshCw,
  ExternalLink
} from 'lucide-react';
import toast from 'react-hot-toast';
import applicationService from '../../services/applicationService';
import interviewService from '../../services/interviewService';
import { useAuth } from '../../context/AuthContext';
import { Link } from 'react-router-dom';

const HRDashboard: React.FC = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [applications, setApplications] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [roundFilter, setRoundFilter] = useState('ALL');

  // Modals
  const [scheduleModalOpen, setScheduleModalOpen] = useState(false);
  const [feedbackModalOpen, setFeedbackModalOpen] = useState(false);
  const [selectedApp, setSelectedApp] = useState<any>(null);

  // Schedule Form
  const [scheduleData, setScheduleData] = useState({
    roundNumber: 1,
    roundName: 'Round 1: Screening / HR',
    scheduledAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().slice(0, 16),
    duration: 30,
    type: 'VIDEO',
    meetingLink: user?.meetLink || 'https://meet.google.com/adyapan-interview',
    instructions: 'Please join 5 minutes early with your video turned on.',
  });

  // Scorecard Form
  const [feedbackData, setFeedbackData] = useState({
    interviewId: '',
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

  const [hrFilter, setHrFilter] = useState('ALL');

  useEffect(() => {
    fetchMyCandidates();
  }, [user]);

  const fetchMyCandidates = async () => {
    try {
      setLoading(true);
      const queryParams: any = {};
      // If regular HR Specialist, strictly fetch only their assigned candidates
      if (user?.role === 'HR' && user?.id) {
        queryParams.assignedHrId = user.id;
      }
      const res = await applicationService.getAllApplications(queryParams);
      if (res?.applications) {
        setApplications(res.applications);
      }
    } catch (err: any) {
      toast.error('Failed to load candidate applications');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenScheduleModal = (app: any) => {
    setSelectedApp(app);
    const nextRound = (app.currentRound || 0) + 1;
    let rName = `Round ${nextRound}: Assessment`;
    if (nextRound === 1) rName = 'Round 1: Screening / HR';
    if (nextRound === 2) rName = 'Round 2: Technical / Sales Pitch';
    if (nextRound === 3) rName = 'Round 3: Final Management HR';

    setScheduleData({
      roundNumber: nextRound,
      roundName: rName,
      scheduledAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().slice(0, 16),
      duration: 30,
      type: 'VIDEO',
      meetingLink: user?.meetLink || 'https://meet.google.com/adyapan-interview',
      instructions: 'Please join 5 minutes early with your video turned on.',
    });
    setScheduleModalOpen(true);
  };

  const handleScheduleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedApp) return;
    const toastId = toast.loading(`Scheduling ${scheduleData.roundName}...`);
    try {
      await interviewService.createInterview({
        applicationId: selectedApp.id,
        candidateId: selectedApp.candidateId,
        candidateName: `${selectedApp.candidate?.firstName} ${selectedApp.candidate?.lastName}`,
        candidateEmail: selectedApp.candidate?.email,
        jobTitle: selectedApp.job?.title || 'Business Development Associate',
        jobId: selectedApp.jobId,
        hrId: user?.id,
        roundNumber: scheduleData.roundNumber,
        roundName: scheduleData.roundName,
        scheduledAt: new Date(scheduleData.scheduledAt).toISOString(),
        duration: scheduleData.duration,
        type: scheduleData.type,
        meetingLink: scheduleData.meetingLink,
      });

      toast.success(`${scheduleData.roundName} scheduled!`, { id: toastId });
      setScheduleModalOpen(false);
      fetchMyCandidates();
    } catch (err) {
      toast.error('Failed to schedule interview', { id: toastId });
    }
  };

  const handleOpenScorecard = (app: any) => {
    setSelectedApp(app);
    const latestIv = app.interviews?.find((i: any) => i.roundNumber === app.currentRound) || app.interviews?.[app.interviews.length - 1] || app.interviews?.[0];
    setFeedbackData({
      interviewId: latestIv?.id || '',
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
    if (!selectedApp) return;
    const latestIv = selectedApp.interviews?.find((i: any) => i.roundNumber === selectedApp.currentRound) || selectedApp.interviews?.[selectedApp.interviews.length - 1] || selectedApp.interviews?.[0];
    const toastId = toast.loading('Submitting evaluation...');
    try {
      if (latestIv?.id) {
        await interviewService.updateInterviewFeedback(latestIv.id, {
          rating: feedbackData.overallScore,
          feedback: `Decision: ${feedbackData.decision} | Notes: ${feedbackData.notes}\nStrengths: ${feedbackData.strengths}\nWeaknesses: ${feedbackData.weaknesses}`,
          status: 'COMPLETED',
          result: feedbackData.decision,
        });
      }

      toast.success(`Scorecard submitted (${feedbackData.decision})`, { id: toastId });
      setFeedbackModalOpen(false);
      fetchMyCandidates();
    } catch (err) {
      toast.error('Failed to submit evaluation', { id: toastId });
    }
  };

  const totalCandidates = applications.length;
  const round1Pending = applications.filter((a) => a.currentRound === 1 && a.overallStatus !== 'SELECTED').length;
  const round2Ready = applications.filter((a) => a.currentRound === 2).length;
  const round3Ready = applications.filter((a) => a.currentRound === 3).length;
  const finalSelected = applications.filter((a) => a.overallStatus === 'SELECTED' || a.overallStatus === 'JOINED').length;
  const rejected = applications.filter((a) => a.overallStatus === 'REJECTED').length;

  const filteredApps = applications.filter((app) => {
    const q = searchQuery.toLowerCase();
    const fullName = `${app.candidate?.firstName} ${app.candidate?.lastName}`.toLowerCase();
    const email = (app.candidate?.email || '').toLowerCase();
    const code = (app.candidateCode || '').toLowerCase();
    const matchesSearch = !q || fullName.includes(q) || email.includes(q) || code.includes(q);

    const matchesStatus = statusFilter === 'ALL' || app.overallStatus === statusFilter;
    const matchesRound = roundFilter === 'ALL' || String(app.currentRound) === roundFilter;
    const matchesHr = hrFilter === 'ALL' || app.assignedHrId === hrFilter || app.assignedHr?.email === hrFilter;

    return matchesSearch && matchesStatus && matchesRound && matchesHr;
  });

  return (
    <DashboardLayout>
      <div className="space-y-6 animate-fadeIn">
        {/* Simple Header Banner */}
        <div className="p-6 rounded-2xl bg-white border border-slate-200 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
              {user?.role === 'ADMIN' ? 'HR Workspace • Admin Overview' : 'HR Specialist Workspace'}
            </span>
            <h1 className="text-2xl font-bold text-slate-900 mt-1">
              Welcome, {user?.name || 'Recruitment Team'}
            </h1>
            <p className="text-slate-500 text-xs sm:text-sm mt-0.5">
              {user?.role === 'ADMIN' ? (
                <>Managing <strong>{totalCandidates} candidate applications</strong> across all HR specialists.</>
              ) : (
                <>Managing <strong>{totalCandidates} assigned candidate applications</strong>.</>
              )}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            {user?.meetLink && (
              <a
                href={user.meetLink}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-white hover:bg-slate-50 text-slate-800 text-xs font-semibold border border-slate-300 transition-all"
              >
                <Video className="w-3.5 h-3.5" /> Meet Room
              </a>
            )}

            <button
              onClick={fetchMyCandidates}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-white hover:bg-slate-50 text-slate-800 text-xs font-semibold border border-slate-300 transition-all"
            >
              <RefreshCw className="w-3.5 h-3.5" /> Refresh
            </button>
          </div>
        </div>

        {/* 6 Metric KPI Tiles */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          <div className="p-4 rounded-xl bg-white border border-slate-200">
            <span className="text-[11px] font-semibold text-slate-500 block">Total In Pool</span>
            <p className="text-2xl font-bold text-slate-900 mt-1">{totalCandidates}</p>
          </div>

          <div className="p-4 rounded-xl bg-white border border-slate-200">
            <span className="text-[11px] font-semibold text-slate-500 block">Round 1</span>
            <p className="text-2xl font-bold text-slate-900 mt-1">{round1Pending}</p>
          </div>

          <div className="p-4 rounded-xl bg-white border border-slate-200">
            <span className="text-[11px] font-semibold text-slate-500 block">Round 2</span>
            <p className="text-2xl font-bold text-slate-900 mt-1">{round2Ready}</p>
          </div>

          <div className="p-4 rounded-xl bg-white border border-slate-200">
            <span className="text-[11px] font-semibold text-slate-500 block">Round 3</span>
            <p className="text-2xl font-bold text-slate-900 mt-1">{round3Ready}</p>
          </div>

          <div className="p-4 rounded-xl bg-white border border-slate-200">
            <span className="text-[11px] font-semibold text-slate-500 block">Selected</span>
            <p className="text-2xl font-bold text-emerald-600 mt-1">{finalSelected}</p>
          </div>

          <div className="p-4 rounded-xl bg-white border border-slate-200">
            <span className="text-[11px] font-semibold text-slate-500 block">Rejected</span>
            <p className="text-2xl font-bold text-red-600 mt-1">{rejected}</p>
          </div>
        </div>

        {/* Filter Bar */}
        <div className="p-4 rounded-2xl bg-white border border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search candidate name, email, ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 rounded-lg bg-slate-50 border border-slate-200 text-slate-900 text-xs placeholder:text-slate-400 focus:border-slate-400 outline-none"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            {user?.role !== 'HR' && (
              <select
                value={hrFilter}
                onChange={(e) => setHrFilter(e.target.value)}
                className="px-3 py-1.5 rounded-lg bg-slate-50 border border-slate-200 text-slate-700 text-xs font-medium outline-none"
              >
                <option value="ALL">All HR Specialists</option>
                <option value="pavitra@adyapan.com">Pavitra (HR-01)</option>
                <option value="charitha@adyapan.com">Charitha (HR-02)</option>
                <option value="nitisha@adyapan.com">Nitisha (HR-03)</option>
                <option value="aravind@adyapan.com">Aravind (HR-04)</option>
                <option value="veena@adyapan.com">Veena (HR-05)</option>
              </select>
            )}

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-1.5 rounded-lg bg-slate-50 border border-slate-200 text-slate-700 text-xs font-medium outline-none"
            >
              <option value="ALL">All Statuses</option>
              <option value="INTERVIEWING">Interviewing</option>
              <option value="SELECTED">Selected</option>
              <option value="REJECTED">Rejected</option>
            </select>

            <select
              value={roundFilter}
              onChange={(e) => setRoundFilter(e.target.value)}
              className="px-3 py-1.5 rounded-lg bg-slate-50 border border-slate-200 text-slate-700 text-xs font-medium outline-none"
            >
              <option value="ALL">All Rounds</option>
              <option value="1">Round 1</option>
              <option value="2">Round 2</option>
              <option value="3">Round 3</option>
            </select>
          </div>
        </div>

        {/* Simple Clean Table */}
        <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase tracking-wider">
                  <th className="py-3 px-4">Candidate ID & Name</th>
                  <th className="py-3 px-4">Opening</th>
                  <th className="py-3 px-4">Current Round</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Latest Interview</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {loading ? (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-slate-400">
                      Loading assigned candidates...
                    </td>
                  </tr>
                ) : filteredApps.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-slate-400">
                      No candidates found.
                    </td>
                  </tr>
                ) : (
                  filteredApps.map((app) => {
                    const latestIv = app.interviews?.[0];
                    return (
                      <tr key={app.id} className="hover:bg-slate-50 transition-colors">
                        <td className="py-3 px-4">
                          <Link to={`/candidates/${app.candidateId}`} className="font-bold text-slate-900 hover:underline block">
                            {app.candidate?.firstName} {app.candidate?.lastName}
                          </Link>
                          <span className="text-[10px] text-slate-400 font-mono block">
                            {app.candidateCode || 'CAND-000000'} • {app.candidate?.email}
                          </span>
                        </td>

                        <td className="py-3 px-4 text-slate-700">
                          {app.job?.title || 'BDA'}
                        </td>

                        <td className="py-3 px-4">
                          <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-800 font-semibold border border-slate-200">
                            Round {app.currentRound || 1}
                          </span>
                        </td>

                        <td className="py-3 px-4">
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-slate-100 text-slate-800 border border-slate-200">
                            {app.overallStatus}
                          </span>
                        </td>

                        <td className="py-3 px-4 text-slate-600">
                          {latestIv ? (
                            <div>
                              <span>{latestIv.roundName}</span>
                              <span className="text-[10px] text-slate-400 block">
                                {new Date(latestIv.scheduledAt).toLocaleDateString()}
                              </span>
                            </div>
                          ) : (
                            <span className="text-slate-400 italic">Not scheduled</span>
                          )}
                        </td>

                        <td className="py-3 px-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            {latestIv?.meetingLink && (
                              <a
                                href={latestIv.meetingLink}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition-all"
                                title="Join Call"
                              >
                                <Video className="w-3.5 h-3.5" />
                              </a>
                            )}

                            <button
                              onClick={() => handleOpenScheduleModal(app)}
                              className="px-2.5 py-1 rounded-lg bg-white hover:bg-slate-100 text-slate-800 font-semibold text-xs border border-slate-300"
                            >
                              Schedule
                            </button>

                            <button
                              onClick={() => handleOpenScorecard(app)}
                              className="px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs"
                            >
                              Scorecard
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

        {/* Schedule Round Modal */}
        {scheduleModalOpen && (
          <div 
            className="fixed inset-0 z-50 bg-slate-950/65 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn"
            onClick={() => setScheduleModalOpen(false)}
          >
            <div 
              className="max-w-md w-full bg-white border border-slate-300 rounded-2xl p-6 shadow-2xl animate-scaleUp my-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-lg font-bold text-slate-900 mb-1">
                Schedule {scheduleData.roundName}
              </h3>
              <p className="text-xs text-slate-500 mb-4">
                Candidate: <strong>{selectedApp?.candidate?.firstName} {selectedApp?.candidate?.lastName}</strong>
              </p>

              <form onSubmit={handleScheduleSubmit} className="space-y-3.5 text-xs">
                <div>
                  <label className="text-slate-600 font-semibold uppercase">Round Name</label>
                  <input
                    type="text"
                    value={scheduleData.roundName}
                    onChange={(e) => setScheduleData({ ...scheduleData, roundName: e.target.value })}
                    className="mt-1 w-full px-3 py-2 rounded-lg bg-slate-50 border border-slate-300 text-slate-900 outline-none"
                  />
                </div>

                <div>
                  <label className="text-slate-600 font-semibold uppercase">Date & Time</label>
                  <input
                    type="datetime-local"
                    value={scheduleData.scheduledAt}
                    onChange={(e) => setScheduleData({ ...scheduleData, scheduledAt: e.target.value })}
                    className="mt-1 w-full px-3 py-2 rounded-lg bg-slate-50 border border-slate-300 text-slate-900 outline-none"
                  />
                </div>

                <div>
                  <label className="text-slate-600 font-semibold uppercase">Call Link</label>
                  <input
                    type="text"
                    value={scheduleData.meetingLink}
                    onChange={(e) => setScheduleData({ ...scheduleData, meetingLink: e.target.value })}
                    className="mt-1 w-full px-3 py-2 rounded-lg bg-slate-50 border border-slate-300 text-slate-900 outline-none"
                  />
                </div>

                <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200">
                  <button
                    type="button"
                    onClick={() => setScheduleModalOpen(false)}
                    className="px-3.5 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white font-semibold"
                  >
                    Confirm & Save
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
              className="max-w-lg w-full bg-white border border-slate-300 rounded-2xl p-6 shadow-2xl animate-scaleUp max-h-[90vh] overflow-y-auto my-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-lg font-bold text-slate-900 mb-1">
                Scorecard Evaluation
              </h3>
              <p className="text-xs text-slate-500 mb-4">
                Candidate: <strong>{selectedApp?.candidate?.firstName} {selectedApp?.candidate?.lastName}</strong> (Round {selectedApp?.currentRound})
              </p>

              <form onSubmit={handleScorecardSubmit} className="space-y-3.5 text-xs">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-slate-600 font-semibold uppercase">Score (1-10)</label>
                    <input
                      type="number"
                      min="1"
                      max="10"
                      value={feedbackData.technicalScore}
                      onChange={(e) => setFeedbackData({ ...feedbackData, technicalScore: parseInt(e.target.value) })}
                      className="mt-1 w-full px-3 py-2 rounded-lg bg-slate-50 border border-slate-300 text-slate-900 outline-none"
                    />
                  </div>

                  <div>
                    <label className="text-slate-600 font-semibold uppercase">Decision</label>
                    <select
                      value={feedbackData.decision}
                      onChange={(e) => setFeedbackData({ ...feedbackData, decision: e.target.value })}
                      className="mt-1 w-full px-3 py-2 rounded-lg bg-slate-50 border border-slate-300 text-slate-900 font-bold outline-none"
                    >
                      <option value="SELECTED">SELECTED (Next Round)</option>
                      <option value="REJECTED">REJECTED</option>
                      <option value="HOLD">HOLD</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="text-slate-600 font-semibold uppercase">Evaluation Notes</label>
                  <textarea
                    rows={3}
                    placeholder="Candidate performance notes"
                    value={feedbackData.notes}
                    onChange={(e) => setFeedbackData({ ...feedbackData, notes: e.target.value })}
                    className="mt-1 w-full px-3 py-2 rounded-lg bg-slate-50 border border-slate-300 text-slate-900 outline-none"
                  />
                </div>

                <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200">
                  <button
                    type="button"
                    onClick={() => setFeedbackModalOpen(false)}
                    className="px-3.5 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white font-semibold"
                  >
                    Submit Scorecard
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

export default HRDashboard;
