import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { candidateService } from '../../services/candidateService';
import { interviewService } from '../../services/interviewService';
import { applicationService } from '../../services/applicationService';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';
import { 
  ArrowLeft, 
  Mail, 
  Phone, 
  MapPin, 
  Briefcase, 
  GraduationCap, 
  Calendar, 
  FileText, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  Award, 
  Sparkles, 
  ShieldCheck, 
  UserCheck, 
  Video, 
  ExternalLink,
  ChevronRight,
  Plus,
  RefreshCw
} from 'lucide-react';

const CandidateDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [candidate, setCandidate] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Scheduling Modal
  const [scheduleModalOpen, setScheduleModalOpen] = useState(false);
  const [scheduleFormData, setScheduleFormData] = useState({
    roundNumber: 1,
    roundName: 'Round 1: Screening / HR',
    scheduledAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().slice(0, 16),
    duration: 30,
    type: 'VIDEO',
    meetingLink: user?.meetLink || 'https://meet.google.com/adyapan-interview',
    instructions: 'Please be ready with your video enabled in a quiet room.',
  });

  useEffect(() => {
    fetchCandidateData();
  }, [id]);

  const fetchCandidateData = async () => {
    try {
      setLoading(true);
      const res = await candidateService.getCandidateById(id!);
      if (res?.candidate) {
        setCandidate(res.candidate);
      }
    } catch (err: any) {
      toast.error('Failed to load candidate details');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenSchedule = () => {
    const app = candidate?.applications?.[0];
    const nextRound = (app?.currentRound || 0) + 1;
    let roundTitle = `Round ${nextRound}: Assessment`;
    if (nextRound === 1) roundTitle = 'Round 1: Screening & Domain';
    else if (nextRound === 2) roundTitle = 'Round 2: Technical & Sales Pitch';
    else roundTitle = 'Final Evaluation';

    setScheduleFormData({
      roundNumber: Math.min(nextRound, 2),
      roundName: roundTitle,
      scheduledAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().slice(0, 16),
      duration: 30,
      type: 'VIDEO',
      meetingLink: user?.meetLink || 'https://meet.google.com/adyapan-interview',
      instructions: 'Please be seated in a quiet room with video enabled.',
    });
    setScheduleModalOpen(true);
  };

  const handleScheduleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const app = candidate?.applications?.[0];
    const toastId = toast.loading(`Scheduling ${scheduleFormData.roundName}...`);
    try {
      await interviewService.createInterview({
        applicationId: app?.id,
        candidateId: candidate?.id,
        candidateName: `${candidate?.firstName} ${candidate?.lastName}`,
        candidateEmail: candidate?.email,
        jobTitle: app?.job?.title || 'Business Development Associate',
        jobId: app?.jobId,
        hrId: user?.id,
        roundNumber: scheduleFormData.roundNumber,
        roundName: scheduleFormData.roundName,
        scheduledAt: new Date(scheduleFormData.scheduledAt).toISOString(),
        duration: scheduleFormData.duration,
        type: scheduleFormData.type,
        meetingLink: scheduleFormData.meetingLink,
      });

      toast.success(`${scheduleFormData.roundName} scheduled & candidate emailed!`, { id: toastId });
      setScheduleModalOpen(false);
      fetchCandidateData();
    } catch (err: any) {
      toast.error('Failed to schedule interview', { id: toastId });
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="py-20 text-center text-slate-400">
          <div className="w-10 h-10 border-3 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-sm font-semibold">Loading candidate 360 profile...</p>
        </div>
      </DashboardLayout>
    );
  }

  if (!candidate) {
    return (
      <DashboardLayout>
        <div className="py-20 text-center text-slate-400 space-y-4">
          <p className="text-lg font-bold text-slate-800">Candidate Not Found</p>
          <button
            onClick={() => navigate('/candidates')}
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 text-white font-bold text-xs"
          >
            Back to Candidates
          </button>
        </div>
      </DashboardLayout>
    );
  }

  const app = candidate.applications?.[0];
  const interviewsList = app?.interviews || [];
  const score = Math.round(candidate.aiScore || app?.aiScore || 75);

  const timelineSteps = [
    { label: 'Applied', status: 'done', desc: new Date(candidate.createdAt).toLocaleDateString() },
    { label: '24-Hr Screened', status: app?.screeningStatus === 'SHORTLISTED' ? 'done' : 'pending' },
    { label: 'HR Allocated', status: app?.assignedHrId ? 'done' : 'pending', desc: app?.assignedHr?.name },
    { label: 'Round 1 (Domain)', status: interviewsList.some((i: any) => i.roundNumber === 1 && i.result === 'SELECTED') ? 'done' : interviewsList.some((i: any) => i.roundNumber === 1) ? 'active' : 'pending' },
    { label: 'Round 2 (Pitch)', status: interviewsList.some((i: any) => i.roundNumber === 2 && i.result === 'SELECTED') ? 'done' : interviewsList.some((i: any) => i.roundNumber === 2) ? 'active' : 'pending' },
    { label: 'Final Selected', status: app?.finalSelected || app?.status === 'FINAL_ROUND' || app?.status === 'ROUND_2_SELECTED' ? 'done' : 'pending' },
    { label: 'Approved', status: app?.managerApproved ? 'done' : 'pending' },
    { label: 'Offer Released', status: app?.offer?.status ? 'done' : 'pending' },
    { label: 'Offer Accepted', status: app?.offer?.status === 'ACCEPTED' ? 'done' : 'pending' },
    { label: 'Joined', status: app?.overallStatus === 'JOINED' ? 'done' : 'pending' },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-6 animate-fadeIn">
        {/* Navigation & Back button */}
        <div className="flex items-center justify-between">
          <button
            onClick={() => navigate(-1)}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white hover:bg-slate-100 text-slate-700 text-xs font-bold transition-all border border-slate-200 shadow-sm"
          >
            <ArrowLeft className="w-4 h-4" /> Back
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={handleOpenSchedule}
              disabled={app?.overallStatus === 'REJECTED' || app?.overallStatus === 'JOINED'}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white font-extrabold text-xs transition-all shadow-md shadow-amber-500/25 disabled:opacity-40"
            >
              <Calendar className="w-4 h-4" /> Schedule Next Round
            </button>
          </div>
        </div>

        {/* Profile Card Header */}
        <div className="p-6 sm:p-8 rounded-3xl bg-white border border-slate-200 shadow-sm relative overflow-hidden">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div className="flex items-start sm:items-center gap-4">
              <div className="w-16 h-16 rounded-3xl bg-gradient-to-tr from-amber-500 to-amber-600 text-white font-black text-2xl flex items-center justify-center shrink-0 shadow-md shadow-amber-500/20">
                {candidate.firstName?.[0] || 'C'}
              </div>
              <div className="space-y-1">
                <div className="flex flex-wrap items-center gap-2.5">
                  <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
                    {candidate.firstName} {candidate.lastName}
                  </h1>
                  <span className="px-3 py-1 rounded-full bg-slate-100 text-amber-700 font-mono text-xs font-bold border border-slate-200">
                    {candidate.candidateCode || 'CAND-000000'}
                  </span>
                  <span className={`px-3 py-1 rounded-full text-xs font-extrabold uppercase ${
                    (app?.overallStatus || app?.status) === 'SELECTED' || (app?.overallStatus || app?.status) === 'JOINED'
                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                      : (app?.overallStatus || app?.status) === 'REJECTED'
                      ? 'bg-red-50 text-red-700 border border-red-200'
                      : 'bg-amber-50 text-amber-700 border border-amber-200'
                  }`}>
                    {app?.overallStatus || app?.status || 'APPLIED'}
                  </span>
                </div>
                <p className="text-slate-500 text-xs sm:text-sm">
                  Applied for <strong className="text-slate-800">{app?.job?.title || 'Business Development Associate'}</strong> ({app?.job?.department || 'Sales'})
                </p>
              </div>
            </div>

            {/* ATS Match Gauge */}
            <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-center shrink-0">
              <span className="text-[10px] font-bold uppercase tracking-wider text-amber-800 block mb-1">
                ATS Resume Match
              </span>
              <div className="flex items-center gap-2 justify-center">
                <Sparkles className="w-4 h-4 text-amber-600" />
                <span className="text-2xl font-black text-amber-700">{score}%</span>
              </div>
            </div>
          </div>

          {/* Quick Contact & Details Strip */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-6 mt-6 border-t border-slate-100 text-xs">
            <div className="flex items-center gap-2.5 text-slate-700">
              <Mail className="w-4 h-4 text-slate-400 shrink-0" />
              <span className="truncate">{candidate.email}</span>
            </div>
            <div className="flex items-center gap-2.5 text-slate-700">
              <Phone className="w-4 h-4 text-slate-400 shrink-0" />
              <span>{candidate.phone || '+91 98765-43210'}</span>
            </div>
            <div className="flex items-center gap-2.5 text-slate-700">
              <MapPin className="w-4 h-4 text-slate-400 shrink-0" />
              <span>{candidate.location || 'Hyderabad / Remote'}</span>
            </div>
            <div className="flex items-center gap-2.5 text-slate-700">
              <UserCheck className="w-4 h-4 text-amber-600 shrink-0" />
              <span>Assigned HR: <strong>{app?.assignedHr?.name || 'Automated Allocation'}</strong></span>
            </div>
          </div>
        </div>

        {/* 10-Stage Recruitment Journey Timeline */}
        <div className="p-6 sm:p-8 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-4">
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <Clock className="w-5 h-5 text-amber-600" /> Complete Recruitment Journey Timeline
          </h2>

          <div className="overflow-x-auto pb-2">
            <div className="flex items-center justify-between min-w-[700px] gap-2 pt-2">
              {timelineSteps.map((step, idx) => (
                <div key={idx} className="flex-1 text-center relative">
                  <div className={`w-8 h-8 rounded-xl flex items-center justify-center mx-auto mb-2 font-bold text-xs ${
                    step.status === 'done'
                      ? 'bg-emerald-500 text-white shadow-sm'
                      : step.status === 'active'
                      ? 'bg-amber-500 text-white animate-pulse'
                      : 'bg-slate-100 text-slate-400'
                  }`}>
                    {step.status === 'done' ? <CheckCircle2 className="w-4 h-4" /> : idx + 1}
                  </div>
                  <p className="text-[11px] font-bold text-slate-800">{step.label}</p>
                  {step.desc && <span className="text-[9px] text-slate-400 block truncate">{step.desc}</span>}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Multi-Round Interviews Scorecards History */}
        <div className="p-6 sm:p-8 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-4">
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <Calendar className="w-5 h-5 text-amber-600" /> Multi-Round Evaluation History
          </h2>

          {interviewsList.length === 0 ? (
            <div className="py-8 text-center text-slate-400 text-xs">
              No interview rounds scheduled yet. Click "Schedule Next Round" to begin Round 1.
            </div>
          ) : (
            <div className="space-y-3">
              {interviewsList.map((iv: any) => (
                <div key={iv.id} className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <span className="font-extrabold text-slate-900 text-sm block">
                        {iv.roundName || `Round ${iv.roundNumber}`}
                      </span>
                      <span className="text-xs text-slate-500">
                        {new Date(iv.scheduledAt).toLocaleString()} • Interviewer: {iv.hr?.name || 'Talent Acquisition Team'}
                      </span>
                    </div>

                    <span className={`px-3 py-1 rounded-full text-xs font-extrabold uppercase ${
                      iv.result === 'SELECTED'
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        : iv.result === 'REJECTED'
                        ? 'bg-red-50 text-red-700 border border-red-200'
                        : 'bg-amber-50 text-amber-700 border border-amber-200'
                    }`}>
                      Result: {iv.result || 'PENDING'}
                    </span>
                  </div>

                  {iv.feedback && (
                    <div className="p-3.5 rounded-xl bg-white border border-slate-200 text-xs text-slate-700 whitespace-pre-line font-mono shadow-sm">
                      {iv.feedback}
                    </div>
                  )}

                  {iv.meetingLink && (
                    <div className="flex items-center justify-between pt-1 text-xs">
                      <span className="text-slate-500">Call Link: <a href={iv.meetingLink} target="_blank" rel="noopener noreferrer" className="text-amber-600 underline">{iv.meetingLink}</a></span>
                      <a href={iv.meetingLink} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-amber-600 font-bold hover:underline">
                        Join Call <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Schedule Round Modal */}
        {scheduleModalOpen && (
          <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="max-w-md w-full bg-white border border-slate-200 rounded-3xl p-6 shadow-2xl animate-fadeIn">
              <h3 className="text-xl font-extrabold text-slate-900 mb-1">
                Schedule {scheduleFormData.roundName}
              </h3>
              <p className="text-xs text-slate-500 mb-5">
                Candidate: <strong className="text-amber-600">{candidate?.firstName} {candidate?.lastName}</strong>
              </p>

              <form onSubmit={handleScheduleSubmit} className="space-y-4 text-xs">
                <div>
                  <label className="text-slate-600 font-semibold uppercase">Round Title</label>
                  <input
                    type="text"
                    value={scheduleFormData.roundName}
                    onChange={(e) => setScheduleFormData({ ...scheduleFormData, roundName: e.target.value })}
                    className="mt-1 w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 font-medium outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="text-slate-600 font-semibold uppercase">Date & Time</label>
                  <input
                    type="datetime-local"
                    value={scheduleFormData.scheduledAt}
                    onChange={(e) => setScheduleFormData({ ...scheduleFormData, scheduledAt: e.target.value })}
                    className="mt-1 w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 font-medium outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="text-slate-600 font-semibold uppercase">Google Meet Call Link</label>
                  <input
                    type="text"
                    value={scheduleFormData.meetingLink}
                    onChange={(e) => setScheduleFormData({ ...scheduleFormData, meetingLink: e.target.value })}
                    className="mt-1 w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 font-medium outline-none focus:border-amber-500"
                  />
                </div>

                <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setScheduleModalOpen(false)}
                    className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 text-white font-extrabold shadow-md shadow-amber-500/25"
                  >
                    Confirm & Send Email
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

export default CandidateDetails;