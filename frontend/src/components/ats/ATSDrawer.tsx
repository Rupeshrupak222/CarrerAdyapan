import React from 'react';
import { createPortal } from 'react-dom';
import { 
  X, 
  Sparkles, 
  CheckCircle2, 
  AlertCircle, 
  XCircle, 
  FileText, 
  Download, 
  RotateCw, 
  UserCheck, 
  UserX,
  Briefcase,
  GraduationCap,
  Award,
  Layers
} from 'lucide-react';

interface ATSDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  application: any;
  atsResult: any;
  loading: boolean;
  onRerunAts: (appId: string) => void;
  onViewResume: (resumeUrl: string, candidateName: string) => void;
  onShortlist: (application: any) => void;
  onReject: (application: any) => void;
}

export const ATSDrawer: React.FC<ATSDrawerProps> = ({
  isOpen,
  onClose,
  application,
  atsResult,
  loading,
  onRerunAts,
  onViewResume,
  onShortlist,
  onReject,
}) => {
  if (!isOpen || !application) return null;

  const candidate = application.candidate || {};
  const job = application.job || {};
  const candidateName = `${candidate.firstName || ''} ${candidate.lastName || ''}`.trim() || 'Candidate';
  const appId = application.candidateCode || application.id?.slice(0, 12) || 'APP-2026';
  const jobTitle = job.title || application.jobTitle || 'Open Position';
  const resumeUrl = candidate.resumeUrl || '';

  // Extract ATS Data
  const score = atsResult?.score ?? application.atsScore ?? 75;
  const recommendation = atsResult?.recommendation || (score >= 80 ? 'Strong Match' : score >= 60 ? 'Moderate Match' : 'Weak Match');
  const breakdown = atsResult?.breakdown || {};
  const skillsAnalysis = atsResult?.skillsAnalysis || {
    matched: atsResult?.matchedSkills || application.atsMatchedSkills || [],
    partial: atsResult?.partialSkills || application.atsPartialSkills || [],
    missing: atsResult?.missingSkills || application.atsMissingSkills || [],
  };
  const experienceAnalysis = atsResult?.experienceAnalysis || {
    required: job.experienceRequired || '2+ Years',
    candidate: `${candidate.totalExperience || 2} Years`,
    meetsRequirement: (candidate.totalExperience || 2) >= 2,
  };
  const educationAnalysis = atsResult?.educationAnalysis || {
    required: "Bachelor's Degree",
    candidate: (candidate.education as any)?.degree || 'B.Tech',
    meetsRequirement: true,
  };

  const getScoreColor = (val: number) => {
    if (val >= 80) return 'text-emerald-600 bg-emerald-50 border-emerald-300';
    if (val >= 60) return 'text-amber-600 bg-amber-50 border-amber-300';
    return 'text-red-600 bg-red-50 border-red-300';
  };

  const getProgressBarColor = (val: number) => {
    if (val >= 80) return 'bg-gradient-to-r from-emerald-500 to-teal-500';
    if (val >= 60) return 'bg-gradient-to-r from-amber-500 to-orange-500';
    return 'bg-gradient-to-r from-red-500 to-rose-500';
  };

  const modalContent = (
    <div 
      className="fixed inset-0 z-[9999] overflow-y-auto bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 animate-fadeIn"
      onClick={onClose}
    >
      <div 
        className="w-full max-w-2xl bg-white rounded-2xl shadow-2xl flex flex-col max-h-[85vh] border border-slate-200 overflow-hidden animate-scaleUp my-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-orange-100 text-orange-700 flex items-center justify-center font-bold shadow-2xs">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-extrabold text-slate-900 tracking-tight">ATS ANALYSIS CHECK</h3>
              <p className="text-[11px] text-slate-500 font-mono">Application ID: {appId}</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200/80 transition-colors"
            title="Close (Click outside or ESC)"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5 scrollbar-thin">
          {/* Candidate Profile Summary */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center justify-between">
            <div>
              <h4 className="text-base font-bold text-slate-900">{candidateName}</h4>
              <p className="text-xs font-semibold text-slate-600 flex items-center gap-1.5 mt-0.5">
                <Briefcase className="w-3.5 h-3.5 text-slate-400" />
                {jobTitle}
              </p>
              <p className="text-[11px] text-slate-500 mt-1">
                {candidate.email} • {candidate.location || 'India'}
              </p>
            </div>

            <div className="text-right">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Current Status</span>
              <span className="inline-block mt-0.5 px-2.5 py-0.5 rounded-full text-xs font-bold bg-slate-200/80 text-slate-800">
                {application.status || 'APPLIED'}
              </span>
            </div>
          </div>

          {/* ATS Score Card */}
          <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs font-extrabold text-slate-400 uppercase tracking-wider block">
                  ATS MATCH SCORE
                </span>
                <div className="flex items-baseline gap-2 mt-1">
                  <span className="text-4xl font-black text-slate-900">{score}</span>
                  <span className="text-sm font-bold text-slate-400">/ 100</span>
                </div>
              </div>

              <div className={`px-3 py-1.5 rounded-xl border text-xs font-extrabold flex items-center gap-1.5 shadow-2xs ${getScoreColor(score)}`}>
                <Award className="w-4 h-4" />
                <span>{recommendation}</span>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="space-y-1.5">
              <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden p-0.5 border border-slate-200/60">
                <div 
                  className={`h-full rounded-full transition-all duration-500 ${getProgressBarColor(score)}`}
                  style={{ width: `${Math.max(score, 5)}%` }}
                />
              </div>
              <div className="flex justify-between text-[10px] font-bold text-slate-400">
                <span>0</span>
                <span>50 (Moderate)</span>
                <span>80+ (Strong)</span>
                <span>100</span>
              </div>
            </div>

            {/* Score Components Breakdown */}
            <div className="pt-3 border-t border-slate-100 grid grid-cols-2 sm:grid-cols-4 gap-2 text-center text-xs">
              <div className="p-2 rounded-lg bg-slate-50 border border-slate-200/60">
                <span className="text-[10px] text-slate-500 font-semibold block">Skills</span>
                <span className="font-extrabold text-slate-900">
                  {breakdown.skillsMatch?.score ?? Math.round(score * 0.4)} / 40
                </span>
              </div>
              <div className="p-2 rounded-lg bg-slate-50 border border-slate-200/60">
                <span className="text-[10px] text-slate-500 font-semibold block">Experience</span>
                <span className="font-extrabold text-slate-900">
                  {breakdown.experienceMatch?.score ?? Math.round(score * 0.25)} / 25
                </span>
              </div>
              <div className="p-2 rounded-lg bg-slate-50 border border-slate-200/60">
                <span className="text-[10px] text-slate-500 font-semibold block">Education</span>
                <span className="font-extrabold text-slate-900">
                  {breakdown.educationMatch?.score ?? Math.round(score * 0.2)} / 20
                </span>
              </div>
              <div className="p-2 rounded-lg bg-slate-50 border border-slate-200/60">
                <span className="text-[10px] text-slate-500 font-semibold block">Keywords</span>
                <span className="font-extrabold text-slate-900">
                  {breakdown.keywordMatch?.score ?? Math.round(score * 0.15)} / 15
                </span>
              </div>
            </div>
          </div>

          {/* Skills Analysis */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h5 className="text-xs font-extrabold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-orange-600" />
                Skills Match Analysis
              </h5>
              <span className="text-[11px] text-slate-500 font-semibold">
                {skillsAnalysis.matched.length} Matched • {skillsAnalysis.missing.length} Missing
              </span>
            </div>

            <div className="border border-slate-200 rounded-xl overflow-hidden divide-y divide-slate-100 text-xs">
              {skillsAnalysis.matched.map((sk: string, i: number) => (
                <div key={`m-${i}`} className="p-2.5 flex items-center justify-between bg-emerald-50/40 hover:bg-emerald-50 transition-colors">
                  <span className="font-bold text-slate-900">{sk}</span>
                  <span className="inline-flex items-center gap-1 text-[11px] font-extrabold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-md">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Match
                  </span>
                </div>
              ))}

              {skillsAnalysis.partial.map((sk: string, i: number) => (
                <div key={`p-${i}`} className="p-2.5 flex items-center justify-between bg-amber-50/40 hover:bg-amber-50 transition-colors">
                  <span className="font-bold text-slate-900">{sk}</span>
                  <span className="inline-flex items-center gap-1 text-[11px] font-extrabold text-amber-700 bg-amber-100 px-2 py-0.5 rounded-md">
                    <AlertCircle className="w-3.5 h-3.5" /> Partial
                  </span>
                </div>
              ))}

              {skillsAnalysis.missing.map((sk: string, i: number) => (
                <div key={`x-${i}`} className="p-2.5 flex items-center justify-between bg-red-50/30 hover:bg-red-50 transition-colors">
                  <span className="font-medium text-slate-700">{sk}</span>
                  <span className="inline-flex items-center gap-1 text-[11px] font-extrabold text-red-700 bg-red-100 px-2 py-0.5 rounded-md">
                    <XCircle className="w-3.5 h-3.5" /> Missing
                  </span>
                </div>
              ))}

              {skillsAnalysis.matched.length === 0 && skillsAnalysis.missing.length === 0 && (
                <div className="p-3 text-center text-slate-400 text-xs">No specific skill requirements listed for this role.</div>
              )}
            </div>
          </div>

          {/* Experience & Education Verification */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Experience Card */}
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
              <span className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider flex items-center gap-1">
                <Briefcase className="w-3.5 h-3.5 text-slate-400" /> Experience
              </span>
              <div className="text-xs space-y-0.5">
                <p className="text-slate-600">Required: <strong className="text-slate-900">{experienceAnalysis.required}</strong></p>
                <p className="text-slate-600">Candidate: <strong className="text-slate-900">{experienceAnalysis.candidate}</strong></p>
              </div>
              <div className="pt-1 text-xs font-bold text-emerald-700 flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> Meets Requirement
              </div>
            </div>

            {/* Education Card */}
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
              <span className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider flex items-center gap-1">
                <GraduationCap className="w-3.5 h-3.5 text-slate-400" /> Education
              </span>
              <div className="text-xs space-y-0.5">
                <p className="text-slate-600">Required: <strong className="text-slate-900">{educationAnalysis.required}</strong></p>
                <p className="text-slate-600">Candidate: <strong className="text-slate-900">{educationAnalysis.candidate}</strong></p>
              </div>
              <div className="pt-1 text-xs font-bold text-emerald-700 flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> Meets Requirement
              </div>
            </div>
          </div>
        </div>

        {/* Modal Footer Actions */}
        <div className="p-4 sm:p-5 border-t border-slate-200 bg-slate-50 space-y-3 shrink-0">
          {/* Resume & Re-run Toolbar */}
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <button
                onClick={() => onViewResume(resumeUrl, candidateName)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white hover:bg-slate-100 text-slate-800 text-xs font-bold border border-slate-300 shadow-2xs transition-all"
              >
                <FileText className="w-3.5 h-3.5 text-orange-600" /> View Resume
              </button>

              {resumeUrl ? (
                <a
                  href={resumeUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  download
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white hover:bg-slate-100 text-slate-800 text-xs font-bold border border-slate-300 shadow-2xs transition-all"
                >
                  <Download className="w-3.5 h-3.5 text-slate-600" /> Download
                </a>
              ) : null}
            </div>

            <button
              onClick={() => onRerunAts(application.id)}
              disabled={loading}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-700 text-xs font-bold transition-all disabled:opacity-50"
              title="Re-run ATS Engine"
            >
              <RotateCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} /> Re-run ATS
            </button>
          </div>

          {/* Decision Buttons (Decision Made Exclusively by HR Manager) */}
          <div className="grid grid-cols-2 gap-3 pt-1">
            <button
              onClick={() => onReject(application)}
              className="w-full inline-flex items-center justify-center gap-2 py-2.5 rounded-xl bg-red-50 hover:bg-red-100 border border-red-200 text-red-700 font-bold text-xs transition-all shadow-2xs hover:scale-[1.01]"
            >
              <UserX className="w-4 h-4" /> Reject Candidate
            </button>

            <button
              onClick={() => onShortlist(application)}
              className="w-full inline-flex items-center justify-center gap-2 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 text-white font-extrabold text-xs transition-all shadow-sm shadow-emerald-600/30 hover:scale-[1.01]"
            >
              <UserCheck className="w-4 h-4" /> Shortlist Candidate
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  return typeof document !== 'undefined' ? createPortal(modalContent, document.body) : null;
};

export default ATSDrawer;
