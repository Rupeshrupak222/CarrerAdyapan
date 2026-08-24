import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { 
  Calendar, 
  Clock, 
  Video, 
  Send, 
  X, 
  Eye, 
  Edit3, 
  Sparkles, 
  CheckCircle2, 
  Building2, 
  User, 
  Mail, 
  ExternalLink 
} from 'lucide-react';
import toast from 'react-hot-toast';
import interviewService from '../../services/interviewService';

interface InterviewScheduleModalProps {
  isOpen: boolean;
  onClose: () => void;
  application: any;
  defaultRoundNumber?: number;
  defaultRoundName?: string;
  onSuccess?: () => void;
  hrUser?: any;
}

export const InterviewScheduleModal: React.FC<InterviewScheduleModalProps> = ({
  isOpen,
  onClose,
  application,
  defaultRoundNumber = 1,
  defaultRoundName,
  onSuccess,
  hrUser,
}) => {
  const [activeTab, setActiveTab] = useState<'EDIT' | 'PREVIEW'>('EDIT');
  const [submitting, setSubmitting] = useState(false);

  const candidate = application?.candidate || {};
  const candName = `${candidate.firstName || ''} ${candidate.lastName || ''}`.trim() || 'Candidate';
  const candEmail = candidate.email || 'candidate@example.com';
  const jobTitle = application?.job?.title || 'Business Development Associate';
  const candidateCode = application?.candidateCode || application?.id?.slice(0, 10) || 'APP-2026';

  const initialRoundName = defaultRoundName || (defaultRoundNumber === 2 ? 'Round 2: Technical & Sales Pitch' : 'Round 1: Screening & Domain');

  const [formData, setFormData] = useState({
    roundNumber: defaultRoundNumber,
    roundName: initialRoundName,
    scheduledAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().slice(0, 16),
    duration: 30,
    type: 'VIDEO',
    meetingLink: hrUser?.meetLink || 'https://meet.google.com/adyapan-interview',
    instructions: 'Please join 5 minutes prior to the scheduled time in a quiet environment with your webcam and audio active.',
    customNote: 'We were impressed by your profile and look forward to speaking with you.',
  });

  useEffect(() => {
    if (isOpen) {
      const rNum = defaultRoundNumber || 1;
      const rName = defaultRoundName || (rNum === 2 ? 'Round 2: Technical & Sales Pitch' : 'Round 1: Screening & Domain');
      setFormData({
        roundNumber: rNum,
        roundName: rName,
        scheduledAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().slice(0, 16),
        duration: 30,
        type: 'VIDEO',
        meetingLink: hrUser?.meetLink || 'https://meet.google.com/adyapan-interview',
        instructions: 'Please join 5 minutes prior to the scheduled time in a quiet environment with your webcam and audio active.',
        customNote: 'We were impressed by your profile and look forward to speaking with you.',
      });
      setActiveTab('EDIT');
    }
  }, [isOpen, defaultRoundNumber, defaultRoundName, hrUser]);

  if (!isOpen || !application) return null;

  const formattedDate = new Date(formData.scheduledAt).toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const formattedTime = new Date(formData.scheduledAt).toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
  });

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setSubmitting(true);
    const toastId = toast.loading(`Scheduling ${formData.roundName} & dispatching invitation email...`);

    try {
      await interviewService.createInterview({
        applicationId: application.id,
        candidateId: application.candidateId,
        candidateName: candName,
        candidateEmail: candEmail,
        jobTitle: jobTitle,
        jobId: application.jobId,
        hrId: hrUser?.id,
        roundNumber: formData.roundNumber,
        roundName: formData.roundName,
        scheduledAt: new Date(formData.scheduledAt).toISOString(),
        duration: formData.duration,
        type: formData.type,
        meetingLink: formData.meetingLink,
        instructions: `${formData.instructions}\n\nNote: ${formData.customNote}`,
      });

      toast.success(`${formData.roundName} scheduled! Invitation email sent to ${candEmail}`, { id: toastId });
      onClose();
      if (onSuccess) onSuccess();
    } catch (err: any) {
      toast.error('Failed to schedule interview: ' + (err.message || 'Error'), { id: toastId });
    } finally {
      setSubmitting(false);
    }
  };

  const modalContent = (
    <div 
      className="fixed inset-0 z-[99999] bg-slate-950/75 backdrop-blur-sm overflow-y-auto flex items-center justify-center p-3 sm:p-5 min-h-screen animate-fadeIn"
      onClick={onClose}
    >
      <div 
        className="w-full max-w-2xl bg-white border border-slate-200 rounded-3xl shadow-2xl overflow-hidden my-auto relative animate-scaleUp text-xs flex flex-col max-h-[92vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-orange-100 text-orange-600 flex items-center justify-center font-bold shadow-xs">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-black text-slate-900">
                  Schedule {formData.roundName}
                </h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-orange-100 text-orange-800">
                  Round {formData.roundNumber}
                </span>
              </div>
              <p className="text-[11px] text-slate-500 font-mono">
                {candidateCode} • {candName} ({candEmail})
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-xl hover:bg-slate-200/60 text-slate-400 hover:text-slate-700 transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="px-6 pt-3 border-b border-slate-200 bg-white flex items-center gap-2">
          <button
            type="button"
            onClick={() => setActiveTab('EDIT')}
            className={`inline-flex items-center gap-1.5 px-4 py-2.5 font-bold text-xs border-b-2 transition-all ${
              activeTab === 'EDIT'
                ? 'border-orange-600 text-orange-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Edit3 className="w-3.5 h-3.5" /> Edit Interview Details
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('PREVIEW')}
            className={`inline-flex items-center gap-1.5 px-4 py-2.5 font-bold text-xs border-b-2 transition-all ${
              activeTab === 'PREVIEW'
                ? 'border-orange-600 text-orange-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Eye className="w-3.5 h-3.5" /> Live Email Preview
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-4">
          {activeTab === 'EDIT' ? (
            <div className="space-y-4">
              {/* Candidate Banner */}
              <div className="p-3.5 rounded-2xl bg-orange-50/60 border border-orange-200/70 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <span className="text-[10px] font-bold text-orange-700 uppercase">Target Candidate</span>
                  <div className="font-extrabold text-slate-900 text-sm">{candName}</div>
                  <div className="text-slate-600 font-mono text-[11px]">{candEmail}</div>
                </div>
                <div className="sm:text-right">
                  <span className="text-[10px] font-bold text-orange-700 uppercase">Job Opening</span>
                  <div className="font-bold text-slate-800">{jobTitle}</div>
                </div>
              </div>

              {/* Form Fields */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="text-slate-700 font-bold block mb-1">Interview Round *</label>
                  <select
                    value={formData.roundNumber}
                    onChange={(e) => {
                      const rNum = parseInt(e.target.value, 10);
                      setFormData({
                        ...formData,
                        roundNumber: rNum,
                        roundName: rNum === 2 ? 'Round 2: Technical & Sales Pitch' : 'Round 1: Screening & Domain',
                      });
                    }}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 font-semibold outline-none focus:border-orange-500 focus:bg-white"
                  >
                    <option value={1}>Round 1: Screening & Domain</option>
                    <option value={2}>Round 2: Technical & Sales Pitch</option>
                  </select>
                </div>

                <div>
                  <label className="text-slate-700 font-bold block mb-1">Round Display Name</label>
                  <input
                    type="text"
                    required
                    value={formData.roundName}
                    onChange={(e) => setFormData({ ...formData, roundName: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 font-semibold outline-none focus:border-orange-500 focus:bg-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="text-slate-700 font-bold block mb-1">Date & Time *</label>
                  <input
                    type="datetime-local"
                    required
                    value={formData.scheduledAt}
                    onChange={(e) => setFormData({ ...formData, scheduledAt: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 font-semibold outline-none focus:border-orange-500 focus:bg-white"
                  />
                </div>

                <div>
                  <label className="text-slate-700 font-bold block mb-1">Duration (Minutes)</label>
                  <select
                    value={formData.duration}
                    onChange={(e) => setFormData({ ...formData, duration: parseInt(e.target.value, 10) })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 font-semibold outline-none focus:border-orange-500 focus:bg-white"
                  >
                    <option value={15}>15 Minutes</option>
                    <option value={30}>30 Minutes</option>
                    <option value={45}>45 Minutes</option>
                    <option value={60}>60 Minutes</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-slate-700 font-bold block mb-1">Meeting Link (Google Meet / Video) *</label>
                <div className="relative">
                  <Video className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="url"
                    required
                    value={formData.meetingLink}
                    onChange={(e) => setFormData({ ...formData, meetingLink: e.target.value })}
                    className="w-full pl-9 pr-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 font-semibold outline-none focus:border-orange-500 focus:bg-white font-mono text-xs"
                    placeholder="https://meet.google.com/..."
                  />
                </div>
              </div>

              <div>
                <label className="text-slate-700 font-bold block mb-1">Candidate Instructions</label>
                <textarea
                  rows={2}
                  value={formData.instructions}
                  onChange={(e) => setFormData({ ...formData, instructions: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 outline-none focus:border-orange-500 focus:bg-white text-xs"
                />
              </div>

              <div>
                <label className="text-slate-700 font-bold block mb-1">Custom Recruiter Note</label>
                <textarea
                  rows={2}
                  value={formData.customNote}
                  onChange={(e) => setFormData({ ...formData, customNote: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 outline-none focus:border-orange-500 focus:bg-white text-xs"
                />
              </div>
            </div>
          ) : (
            /* Live Email Preview */
            <div className="space-y-3">
              {/* Mail Meta Header */}
              <div className="p-3.5 rounded-2xl bg-slate-100 border border-slate-200 text-xs space-y-1 font-mono">
                <div><strong className="text-slate-700 font-sans">To:</strong> {candName} &lt;{candEmail}&gt;</div>
                <div><strong className="text-slate-700 font-sans">From:</strong> Adyapan Recruitment Team &lt;careers@adyapan.com&gt;</div>
                <div><strong className="text-slate-700 font-sans">Subject:</strong> Interview Invitation: {formData.roundName} with Adyapan Career — {candName}</div>
              </div>

              {/* Formatted Letterhead Email Card */}
              <div className="border border-slate-200 rounded-2xl bg-white shadow-sm overflow-hidden text-slate-800">
                {/* Brand Banner */}
                <div className="bg-gradient-to-r from-orange-600 via-amber-600 to-orange-500 text-white p-5">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-lg font-black tracking-tight">ADYAPAN CAREER</div>
                      <div className="text-[11px] text-orange-100">Talent Acquisition & Recruitment Team</div>
                    </div>
                    <span className="px-2.5 py-1 rounded-full bg-white/20 text-white text-[10px] font-bold backdrop-blur-xs">
                      {formData.roundName}
                    </span>
                  </div>
                </div>

                {/* Email Body Content */}
                <div className="p-6 space-y-4 text-xs leading-relaxed">
                  <p className="text-sm">
                    Dear <strong>{candName}</strong>,
                  </p>

                  <p>
                    Congratulations! Following our evaluation of your profile, we are pleased to invite you to attend <strong>{formData.roundName}</strong> for the <strong>{jobTitle}</strong> position at Adyapan Career.
                  </p>

                  {/* Interview Schedule Box */}
                  <div className="p-4 rounded-xl bg-orange-50/80 border border-orange-200/90 space-y-2">
                    <div className="text-xs font-bold text-orange-800 uppercase tracking-wider">Interview Schedule Details</div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                      <div>
                        <span className="text-slate-500 block text-[11px]">Date:</span>
                        <strong className="text-slate-900">{formattedDate}</strong>
                      </div>
                      <div>
                        <span className="text-slate-500 block text-[11px]">Time:</span>
                        <strong className="text-slate-900">{formattedTime} ({formData.duration} mins)</strong>
                      </div>
                    </div>

                    <div className="pt-2 border-t border-orange-200">
                      <span className="text-slate-500 block text-[11px] mb-1">Meeting Platform:</span>
                      <a
                        href={formData.meetingLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs"
                      >
                        <Video className="w-3.5 h-3.5" /> Join Google Meet Call <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                  </div>

                  {formData.instructions && (
                    <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-700">
                      <strong className="text-slate-900 block mb-0.5">Candidate Preparation Instructions:</strong>
                      {formData.instructions}
                    </div>
                  )}

                  {formData.customNote && (
                    <p className="italic text-slate-600">
                      "{formData.customNote}"
                    </p>
                  )}

                  <p className="pt-2 border-t border-slate-100 text-slate-600">
                    Warm regards,<br />
                    <strong className="text-slate-900">{hrUser?.name || 'Recruitment Specialist'}</strong><br />
                    HR & Talent Acquisition Team<br />
                    Adyapan Career
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between">
          <div>
            {activeTab === 'PREVIEW' ? (
              <button
                type="button"
                onClick={() => setActiveTab('EDIT')}
                className="px-3.5 py-2 rounded-xl bg-white border border-slate-300 hover:bg-slate-100 text-slate-700 font-bold"
              >
                ← Back to Edit Details
              </button>
            ) : (
              <button
                type="button"
                onClick={() => setActiveTab('PREVIEW')}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold"
              >
                <Eye className="w-3.5 h-3.5 text-orange-600" /> Preview Invitation Email →
              </button>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              className="px-4 py-2 rounded-xl bg-slate-200/70 hover:bg-slate-200 text-slate-700 font-bold"
            >
              Cancel
            </button>

            <button
              type="button"
              onClick={() => handleSubmit()}
              disabled={submitting}
              className="inline-flex items-center gap-1.5 px-5 py-2 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-extrabold shadow-sm transition-all disabled:opacity-50"
            >
              <Send className="w-3.5 h-3.5" />
              {submitting ? 'Sending Invitation...' : 'Confirm & Send Mail'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  return typeof document !== 'undefined' ? createPortal(modalContent, document.body) : null;
};

export default InterviewScheduleModal;
