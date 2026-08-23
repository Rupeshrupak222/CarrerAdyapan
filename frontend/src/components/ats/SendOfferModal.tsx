import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { X, Send, Award, DollarSign, Calendar, MapPin, FileText, CheckCircle2 } from 'lucide-react';

interface SendOfferModalProps {
  isOpen: boolean;
  onClose: () => void;
  application: any;
  onSendOffer: (appId: string, offerData: any) => Promise<void>;
}

export const SendOfferModal: React.FC<SendOfferModalProps> = ({
  isOpen,
  onClose,
  application,
  onSendOffer,
}) => {
  const [loading, setLoading] = useState(false);
  const [stipend, setStipend] = useState('INR 25,000/- Per Month (During 6-Month Training)');
  const [joiningDate, setJoiningDate] = useState(
    new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0]
  );
  const [location, setLocation] = useState('Hyderabad / Hybrid');
  const [message, setMessage] = useState(
    `Dear Candidate,\n\nWe are thrilled to extend an official offer of employment with Adyapan Edutech Pvt. Ltd. Your performance throughout the selection rounds was outstanding.\n\nPlease find your offer terms and confirmation details below.\n\nWarm regards,\nHR Operations Team\nAdyapan Edutech`
  );

  if (!isOpen || !application) return null;

  const candidate = application.candidate || {};
  const candidateName = `${candidate.firstName || ''} ${candidate.lastName || ''}`.trim() || 'Candidate';
  const candidateEmail = candidate.email || '';
  const jobTitle = application.job?.title || application.jobTitle || 'Open Position';
  const appId = application.candidateCode || application.id?.slice(0, 12) || 'APP-2026';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await onSendOffer(application.id, {
        stipend,
        joiningDate,
        location,
        message,
        customTerms: `Designation: ${jobTitle} | Stipend/CTC: ${stipend} | Joining: ${joiningDate} | Location: ${location}`,
      });
      onClose();
    } finally {
      setLoading(false);
    }
  };

  const modalContent = (
    <div 
      className="fixed inset-0 z-[9999] overflow-y-auto bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 animate-fadeIn"
      onClick={onClose}
    >
      <div 
        className="w-full max-w-xl bg-white border border-slate-200 rounded-2xl shadow-2xl flex flex-col max-h-[88vh] overflow-hidden animate-scaleUp my-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 to-orange-500 text-white flex items-center justify-center font-black shadow-sm">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-slate-900">Issue Official Employment Offer</h3>
              <p className="text-xs text-slate-500 font-mono">
                {appId} • {candidateName} ({candidateEmail})
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

        {/* Scrollable Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-4 text-xs text-slate-700">
          {/* Candidate & Role Highlight */}
          <div className="p-3.5 rounded-xl bg-orange-50/50 border border-orange-200/80 flex items-center justify-between">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-orange-800">Target Role</span>
              <p className="text-sm font-extrabold text-slate-900 mt-0.5">{jobTitle}</p>
            </div>
            <div className="text-right">
              <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800">Final Stage</span>
              <p className="text-xs font-bold text-emerald-700 flex items-center gap-1 mt-0.5">
                <CheckCircle2 className="w-3.5 h-3.5" /> Round 2 Cleared
              </p>
            </div>
          </div>

          {/* Stipend / CTC */}
          <div>
            <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5 mb-1">
              <DollarSign className="w-3.5 h-3.5 text-orange-600" />
              Stipend / CTC Terms
            </label>
            <input
              type="text"
              required
              value={stipend}
              onChange={(e) => setStipend(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 font-medium outline-none focus:border-orange-500 focus:bg-white transition-all text-xs"
              placeholder="e.g. INR 25,000/- Per Month + Incentives"
            />
          </div>

          {/* Joining Date & Location */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5 mb-1">
                <Calendar className="w-3.5 h-3.5 text-orange-600" />
                Joining / Training Date
              </label>
              <input
                type="date"
                required
                value={joiningDate}
                onChange={(e) => setJoiningDate(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 font-medium outline-none focus:border-orange-500 focus:bg-white transition-all text-xs"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5 mb-1">
                <MapPin className="w-3.5 h-3.5 text-orange-600" />
                Work Location
              </label>
              <input
                type="text"
                required
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 font-medium outline-none focus:border-orange-500 focus:bg-white transition-all text-xs"
                placeholder="e.g. Hyderabad / Remote"
              />
            </div>
          </div>

          {/* Email Body / Offer Message */}
          <div>
            <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5 mb-1">
              <FileText className="w-3.5 h-3.5 text-orange-600" />
              Offer Email Message
            </label>
            <textarea
              rows={5}
              required
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 outline-none focus:border-orange-500 focus:bg-white transition-all text-xs leading-relaxed font-sans"
            />
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-200 shrink-0">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition-colors"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-extrabold text-xs shadow-md shadow-orange-500/25 transition-all disabled:opacity-50"
            >
              <Send className="w-3.5 h-3.5" />
              {loading ? 'Dispatching Email...' : 'Send Official Offer Letter'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );

  return typeof document !== 'undefined' ? createPortal(modalContent, document.body) : null;
};

export default SendOfferModal;
