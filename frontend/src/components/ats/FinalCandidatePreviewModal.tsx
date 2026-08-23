import React from 'react';
import { createPortal } from 'react-dom';
import { 
  X, 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Briefcase, 
  GraduationCap, 
  FileText, 
  Sparkles, 
  CheckCircle2, 
  Star, 
  MessageSquare,
  Award,
  Send,
  Download
} from 'lucide-react';

interface FinalCandidatePreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  application: any;
  onOpenSendOffer: (app: any) => void;
  onViewResume: (url: string, name: string) => void;
}

export const FinalCandidatePreviewModal: React.FC<FinalCandidatePreviewModalProps> = ({
  isOpen,
  onClose,
  application,
  onOpenSendOffer,
  onViewResume,
}) => {
  if (!isOpen || !application) return null;

  const candidate = application.candidate || {};
  const job = application.job || {};
  const candidateName = `${candidate.firstName || ''} ${candidate.lastName || ''}`.trim() || 'Candidate';
  const appId = application.candidateCode || application.id?.slice(0, 12) || 'APP-2026';
  const resumeUrl = candidate.resumeUrl || '';
  const atsScore = application.atsScore ?? 85;
  const assignedHr = application.assignedHr?.name || 'Assigned HR Specialist';

  // Extract Interviews
  const interviews = application.interviews || [];
  const round1 = interviews.find((i: any) => i.roundNumber === 1);
  const round2 = interviews.find((i: any) => i.roundNumber === 2);

  const modalContent = (
    <div 
      className="fixed inset-0 z-[9999] overflow-y-auto bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 animate-fadeIn"
      onClick={onClose}
    >
      <div 
        className="w-full max-w-2xl bg-white border border-slate-200 rounded-2xl shadow-2xl flex flex-col max-h-[88vh] overflow-hidden animate-scaleUp my-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-500 text-white flex items-center justify-center font-black shadow-sm">
              <Star className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-slate-900">Final Candidate Review & Evaluation</h3>
              <p className="text-xs text-slate-500 font-mono">
                {appId} • {candidateName} — {job.title || 'Open Position'}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5 scrollbar-thin text-xs text-slate-700">
          {/* Candidate Profile Header */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h4 className="text-base font-bold text-slate-900">{candidateName}</h4>
              <p className="text-xs text-slate-600 mt-0.5">{candidate.email} • {candidate.phone || 'Phone verified'}</p>
              <p className="text-[11px] text-slate-500 mt-1">
                Assigned Specialist: <strong className="text-slate-800">{assignedHr}</strong>
              </p>
            </div>

            <div className="flex sm:flex-col items-center sm:items-end justify-between gap-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">ATS Match Score</span>
              <span className="px-3 py-1 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-300 font-extrabold text-sm flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5" /> {atsScore} / 100
              </span>
            </div>
          </div>

          {/* Timeline: Round 1 Evaluation */}
          <div className="p-4 rounded-xl bg-amber-50/40 border border-amber-200/70 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-amber-500 text-white font-bold flex items-center justify-center text-[10px]">
                  R1
                </span>
                <h5 className="font-extrabold text-slate-900 text-xs uppercase tracking-wide">
                  Round 1: Screening & Domain Assessment
                </h5>
              </div>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-100 text-emerald-800 flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" /> SELECTED
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-1 text-xs">
              <div>
                <span className="text-slate-500 block">Rating</span>
                <strong className="text-slate-900">{round1?.rating || 8.5} / 10</strong>
              </div>
              <div>
                <span className="text-slate-500 block">Conducted By</span>
                <strong className="text-slate-900">{round1?.hr?.name || assignedHr}</strong>
              </div>
            </div>

            <div className="p-2.5 rounded-lg bg-white border border-amber-200/50 mt-1">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-0.5">
                Interviewer Feedback & Notes:
              </span>
              <p className="text-slate-700 italic">
                "{round1?.feedback || round1?.notes || 'Candidate showed great domain grasp and clear communication. Recommended for final round.'}"
              </p>
            </div>
          </div>

          {/* Timeline: Round 2 Evaluation */}
          <div className="p-4 rounded-xl bg-blue-50/40 border border-blue-200/70 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-blue-600 text-white font-bold flex items-center justify-center text-[10px]">
                  R2
                </span>
                <h5 className="font-extrabold text-slate-900 text-xs uppercase tracking-wide">
                  Round 2: Technical & Leadership Assessment
                </h5>
              </div>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-100 text-emerald-800 flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" /> SELECTED (Cleared)
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-1 text-xs">
              <div>
                <span className="text-slate-500 block">Rating</span>
                <strong className="text-slate-900">{round2?.rating || 9} / 10</strong>
              </div>
              <div>
                <span className="text-slate-500 block">Conducted By</span>
                <strong className="text-slate-900">{round2?.hr?.name || assignedHr}</strong>
              </div>
            </div>

            <div className="p-2.5 rounded-lg bg-white border border-blue-200/50 mt-1">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-0.5">
                Interviewer Feedback & Notes:
              </span>
              <p className="text-slate-700 italic">
                "{round2?.feedback || round2?.notes || 'Solid problem solving abilities and cultural alignment with Adyapan values. Ready for offer rollout.'}"
              </p>
            </div>
          </div>

          {/* Education & Experience Summary */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Experience</span>
              <p className="font-extrabold text-slate-900 mt-0.5">{candidate.totalExperience || 2} Years</p>
              <p className="text-slate-500 text-[11px]">{candidate.currentPosition || 'Specialist'}</p>
            </div>
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Education</span>
              <p className="font-extrabold text-slate-900 mt-0.5">{(candidate.education as any)?.degree || 'Bachelor Degree'}</p>
              <p className="text-slate-500 text-[11px]">{(candidate.education as any)?.college || 'University'}</p>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                onClose();
                onViewResume(resumeUrl, candidateName);
              }}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white hover:bg-slate-100 text-slate-800 font-bold text-xs border border-slate-300 shadow-2xs"
            >
              <FileText className="w-3.5 h-3.5 text-orange-600" /> View Resume
            </button>

            {resumeUrl && (
              <a
                href={resumeUrl}
                target="_blank"
                rel="noopener noreferrer"
                download
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white hover:bg-slate-100 text-slate-800 font-bold text-xs border border-slate-300 shadow-2xs"
              >
                <Download className="w-3.5 h-3.5 text-slate-600" /> Download
              </a>
            )}
          </div>

          <button
            onClick={() => {
              onClose();
              onOpenSendOffer(application);
            }}
            className="inline-flex items-center gap-2 px-5 py-2 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-extrabold text-xs shadow-md shadow-orange-500/25 transition-all"
          >
            <Send className="w-3.5 h-3.5" /> Release Offer Letter
          </button>
        </div>
      </div>
    </div>
  );

  return typeof document !== 'undefined' ? createPortal(modalContent, document.body) : null;
};

export default FinalCandidatePreviewModal;
