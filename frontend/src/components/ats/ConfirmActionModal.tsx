import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { X, CheckCircle2, AlertTriangle, Send, UserX } from 'lucide-react';

interface ConfirmActionModalProps {
  isOpen: boolean;
  onClose: () => void;
  actionType: 'SHORTLIST' | 'REJECT';
  application: any;
  onConfirm: (appId: string, reason?: string) => Promise<void>;
}

export const ConfirmActionModal: React.FC<ConfirmActionModalProps> = ({
  isOpen,
  onClose,
  actionType,
  application,
  onConfirm,
}) => {
  const [loading, setLoading] = useState(false);
  const [reason, setReason] = useState('Qualifications align well with job requirements.');

  if (!isOpen || !application) return null;

  const candidate = application.candidate || {};
  const candidateName = `${candidate.firstName || ''} ${candidate.lastName || ''}`.trim() || 'Candidate';
  const appId = application.candidateCode || application.id?.slice(0, 12) || 'APP-2026';
  const atsScore = application.atsScore ?? 'Not Checked';
  const isShortlist = actionType === 'SHORTLIST';

  const handleExecute = async () => {
    setLoading(true);
    try {
      await onConfirm(application.id, reason);
      onClose();
    } finally {
      setLoading(false);
    }
  };

  const modalContent = (
    <div 
      className="fixed inset-0 z-[9999] overflow-hidden bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn"
      onClick={onClose}
    >
      <div 
        className="w-full max-w-md bg-white border border-slate-200 rounded-2xl p-6 shadow-2xl space-y-4 animate-scaleUp my-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Icon & Title */}
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold ${
              isShortlist ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'
            }`}>
              {isShortlist ? <CheckCircle2 className="w-5 h-5" /> : <AlertTriangle className="w-5 h-5" />}
            </div>
            <div>
              <h3 className="text-base font-extrabold text-slate-900">
                {isShortlist ? 'Confirm Candidate Shortlist' : 'Confirm Candidate Rejection'}
              </h3>
              <p className="text-xs text-slate-500">
                {isShortlist ? 'Candidate will be approved for HR round assignment.' : 'Candidate will be marked as rejected.'}
              </p>
            </div>
          </div>

          <button onClick={onClose} className="text-slate-400 hover:text-slate-700 p-1">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Candidate Info Card */}
        <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-1.5">
          <div className="flex justify-between">
            <span className="text-slate-500 font-medium">Candidate:</span>
            <strong className="text-slate-900">{candidateName}</strong>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500 font-medium">Application ID:</span>
            <span className="font-mono text-slate-700">{appId}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500 font-medium">ATS Match Score:</span>
            <span className="font-bold text-orange-700">{atsScore !== 'Not Checked' ? `${atsScore} / 100` : 'Not Checked'}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500 font-medium">Email Notice:</span>
            <span className="text-emerald-700 font-semibold flex items-center gap-1">
              <Send className="w-3 h-3" /> Automatic candidate email
            </span>
          </div>
        </div>

        {!isShortlist && (
          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">
              Rejection Reason (Internal Record):
            </label>
            <select
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-300 text-xs text-slate-800 focus:outline-none"
            >
              <option value="Does not meet mandatory technical skills criteria">Does not meet technical skills criteria</option>
              <option value="Experience gap for this seniority level">Experience gap for this seniority level</option>
              <option value="Position filled or closed">Position filled or closed</option>
              <option value="Other qualification mismatch">Other qualification mismatch</option>
            </select>
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-slate-100">
          <button
            onClick={onClose}
            disabled={loading}
            className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleExecute}
            disabled={loading}
            className={`px-5 py-2 rounded-xl font-extrabold text-xs text-white transition-all shadow-xs disabled:opacity-50 ${
              isShortlist 
                ? 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-600/30' 
                : 'bg-red-600 hover:bg-red-700 shadow-red-600/30'
            }`}
          >
            {loading ? 'Processing...' : (isShortlist ? 'Confirm Shortlist' : 'Confirm Reject')}
          </button>
        </div>
      </div>
    </div>
  );

  return typeof document !== 'undefined' ? createPortal(modalContent, document.body) : null;
};

export default ConfirmActionModal;
