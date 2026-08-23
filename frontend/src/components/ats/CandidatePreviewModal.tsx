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
  Calendar, 
  Layers, 
  Award,
  Sparkles,
  ExternalLink
} from 'lucide-react';

interface CandidatePreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  application: any;
  onRunAts: (app: any) => void;
  onViewResume: (url: string, name: string) => void;
  onShortlist: (app: any) => void;
  onReject: (app: any) => void;
}

export const CandidatePreviewModal: React.FC<CandidatePreviewModalProps> = ({
  isOpen,
  onClose,
  application,
  onRunAts,
  onViewResume,
  onShortlist,
  onReject,
}) => {
  if (!isOpen || !application) return null;

  const candidate = application.candidate || {};
  const job = application.job || {};
  const candidateName = `${candidate.firstName || ''} ${candidate.lastName || ''}`.trim() || 'Candidate';
  const appId = application.candidateCode || application.id?.slice(0, 12) || 'APP-2026';
  const skills = Array.isArray(candidate.skills) ? candidate.skills : (typeof candidate.skills === 'string' ? candidate.skills.split(',') : []);

  const modalContent = (
    <div 
      className="fixed inset-0 z-[9999] overflow-y-auto bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 animate-fadeIn"
      onClick={onClose}
    >
      <div 
        className="w-full max-w-2xl bg-white border border-slate-200 rounded-2xl shadow-2xl flex flex-col max-h-[85vh] overflow-hidden animate-scaleUp my-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-orange-500 to-amber-500 text-white flex items-center justify-center font-black text-sm shadow-sm">
              {candidateName[0]}
            </div>
            <div>
              <h3 className="text-base font-extrabold text-slate-900">{candidateName}</h3>
              <p className="text-xs text-slate-500 font-mono">
                {appId} • Applied for <strong>{job.title || 'Open Position'}</strong>
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

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5 scrollbar-thin text-xs text-slate-700">
          {/* Quick Info Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-50 border border-slate-200">
              <Mail className="w-4 h-4 text-slate-400 shrink-0" />
              <span className="truncate">{candidate.email || 'No email'}</span>
            </div>
            <div className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-50 border border-slate-200">
              <Phone className="w-4 h-4 text-slate-400 shrink-0" />
              <span>{candidate.phone || 'Not provided'}</span>
            </div>
            <div className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-50 border border-slate-200">
              <MapPin className="w-4 h-4 text-slate-400 shrink-0" />
              <span>{candidate.location || 'India'}</span>
            </div>
            <div className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-50 border border-slate-200">
              <Calendar className="w-4 h-4 text-slate-400 shrink-0" />
              <span>Applied: {new Date(application.appliedAt || application.createdAt).toLocaleDateString()}</span>
            </div>
          </div>

          {/* Current Experience & Employment */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
            <h4 className="font-extrabold text-slate-900 uppercase text-[11px] flex items-center gap-1.5 tracking-wider">
              <Briefcase className="w-3.5 h-3.5 text-orange-600" />
              Experience & Professional Background
            </h4>
            <div className="grid grid-cols-2 gap-3 text-xs pt-1">
              <div>
                <span className="text-slate-500 font-medium block">Total Experience</span>
                <strong className="text-slate-900 text-sm">{candidate.totalExperience || 2} Years</strong>
              </div>
              <div>
                <span className="text-slate-500 font-medium block">Current Position</span>
                <strong className="text-slate-900">{candidate.currentPosition || 'Specialist'}</strong>
              </div>
              <div>
                <span className="text-slate-500 font-medium block">Current Company</span>
                <strong className="text-slate-900">{candidate.currentCompany || 'Previous Employer'}</strong>
              </div>
              <div>
                <span className="text-slate-500 font-medium block">Status</span>
                <span className="inline-block px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-bold text-[10px]">
                  {candidate.employmentStatus || 'Active Applicant'}
                </span>
              </div>
            </div>
          </div>

          {/* Education Details */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
            <h4 className="font-extrabold text-slate-900 uppercase text-[11px] flex items-center gap-1.5 tracking-wider">
              <GraduationCap className="w-3.5 h-3.5 text-orange-600" />
              Education & Qualifications
            </h4>
            <div className="text-xs space-y-1 pt-1">
              <p>
                <strong>{(candidate.education as any)?.degree || 'Bachelor Degree'}</strong>
                {((candidate.education as any)?.college || candidate.education) && ` from ${(candidate.education as any)?.college || candidate.education}`}
              </p>
              {((candidate.education as any)?.year || (candidate.education as any)?.cgpa) && (
                <p className="text-slate-500">
                  Graduation: {(candidate.education as any)?.year || '2024'} • Score: {(candidate.education as any)?.cgpa || 'First Class'}
                </p>
              )}
            </div>
          </div>

          {/* Skills Badges */}
          <div className="space-y-2">
            <h4 className="font-extrabold text-slate-900 uppercase text-[11px] flex items-center gap-1.5 tracking-wider">
              <Layers className="w-3.5 h-3.5 text-orange-600" />
              Candidate Verified Skills
            </h4>
            <div className="flex flex-wrap gap-1.5">
              {skills.length > 0 ? (
                skills.map((sk: string, i: number) => (
                  <span key={i} className="px-2.5 py-1 rounded-lg bg-orange-50 text-orange-800 border border-orange-200 font-bold text-[11px]">
                    {sk.trim()}
                  </span>
                ))
              ) : (
                <span className="text-slate-400 text-xs">No specific skill tags listed.</span>
              )}
            </div>
          </div>

          {/* ATS Status Banner */}
          <div className="p-3.5 rounded-xl bg-orange-50/60 border border-orange-200 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-orange-500 text-white flex items-center justify-center font-bold">
                <Sparkles className="w-4 h-4" />
              </div>
              <div>
                <p className="font-bold text-slate-900">
                  {application.atsScore ? `ATS Match Score: ${application.atsScore}/100` : 'ATS Check: Not Run Yet'}
                </p>
                <p className="text-[10px] text-slate-500">
                  {application.atsScore ? `Evaluated by ${application.atsAnalyzedBy || 'HR'}` : 'Click below to analyze against job requirements'}
                </p>
              </div>
            </div>

            <button
              onClick={() => {
                onClose();
                onRunAts(application);
              }}
              className="px-3 py-1.5 rounded-lg bg-orange-600 hover:bg-orange-700 text-white font-bold text-xs shadow-xs transition-all"
            >
              {application.atsScore ? 'View ATS Result' : 'Run ATS Check'}
            </button>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between gap-2 shrink-0">
          <button
            onClick={() => {
              onClose();
              onViewResume(candidate.resumeUrl, candidateName);
            }}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white hover:bg-slate-100 text-slate-800 font-bold text-xs border border-slate-300 shadow-2xs"
          >
            <FileText className="w-3.5 h-3.5 text-orange-600" /> View Resume
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                onClose();
                onReject(application);
              }}
              className="px-3.5 py-1.5 rounded-xl bg-red-50 hover:bg-red-100 text-red-700 font-bold text-xs border border-red-200 transition-all"
            >
              Reject
            </button>

            <button
              onClick={() => {
                onClose();
                onShortlist(application);
              }}
              className="px-4 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs shadow-xs transition-all"
            >
              Shortlist Candidate
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  return typeof document !== 'undefined' ? createPortal(modalContent, document.body) : null;
};

export default CandidatePreviewModal;
