import React, { useState, useEffect, useMemo } from 'react';
import { 
  Star, 
  Search, 
  RotateCw, 
  Sparkles, 
  FileText, 
  Send, 
  CheckCircle2, 
  Download, 
  Eye, 
  Briefcase, 
  Award, 
  Clock 
} from 'lucide-react';
import toast from 'react-hot-toast';
import DashboardLayout from '../../components/layout/DashboardLayout';
import applicationService from '../../services/applicationService';
import FinalCandidatePreviewModal from '../../components/ats/FinalCandidatePreviewModal';
import SendOfferModal from '../../components/ats/SendOfferModal';
import ResumeViewerModal from '../../components/ats/ResumeViewerModal';

export const FinalRoundSelectedPage: React.FC = () => {
  const [applications, setApplications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  // Modals
  const [previewModalOpen, setPreviewModalOpen] = useState(false);
  const [selectedAppForPreview, setSelectedAppForPreview] = useState<any>(null);

  const [offerModalOpen, setOfferModalOpen] = useState(false);
  const [selectedAppForOffer, setSelectedAppForOffer] = useState<any>(null);

  const [resumeModalOpen, setResumeModalOpen] = useState(false);
  const [activeResumeUrl, setActiveResumeUrl] = useState('');
  const [activeCandidateName, setActiveCandidateName] = useState('');

  const loadData = async () => {
    setLoading(true);
    try {
      const res = await applicationService.getFinalRoundSelected();
      const apps = res.applications || res.data || (Array.isArray(res) ? res : []);
      setApplications(apps);
    } catch (err: any) {
      toast.error('Failed to load final selected candidates: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Filtered
  const filteredApps = useMemo(() => {
    return applications.filter((app) => {
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const candName = `${app.candidate?.firstName || ''} ${app.candidate?.lastName || ''}`.toLowerCase();
        const email = (app.candidate?.email || '').toLowerCase();
        const code = (app.candidateCode || app.id || '').toLowerCase();
        const hrName = (app.assignedHr?.name || '').toLowerCase();
        if (!candName.includes(q) && !email.includes(q) && !code.includes(q) && !hrName.includes(q)) {
          return false;
        }
      }
      return true;
    });
  }, [applications, searchQuery]);

  // Handle Send Offer Execution
  const handleExecuteSendOffer = async (appId: string, offerData: any) => {
    try {
      const res = await applicationService.sendOfficialOffer(appId, offerData);
      toast.success(res.message || 'Official offer letter dispatched successfully.');
      loadData();
    } catch (err: any) {
      toast.error('Failed to send offer: ' + err.message);
    }
  };

  const handleOpenResume = (url: string, name: string) => {
    setActiveResumeUrl(url);
    setActiveCandidateName(name);
    setResumeModalOpen(true);
  };

  return (
    <DashboardLayout>
      <div className="space-y-6 animate-fadeIn pb-12">
        {/* Header Title */}
        <div className="p-6 rounded-2xl bg-white border border-slate-200 flex flex-col lg:flex-row lg:items-center justify-between gap-4 shadow-xs">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-extrabold text-orange-600 uppercase tracking-wider block">
                Final Selection Stage
              </span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                ⭐ Round 2 Cleared
              </span>
            </div>
            <h1 className="text-2xl font-black text-slate-900 mt-1">Final Round Selected</h1>
            <p className="text-slate-500 text-xs sm:text-sm mt-0.5">
              Candidates who have successfully passed Round 1 and Round 2 automatically appear here for final HR Manager review and manual offer release.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={loadData}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white hover:bg-slate-50 text-slate-800 text-xs font-bold border border-slate-300 shadow-2xs transition-all"
            >
              <RotateCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} /> Refresh
            </button>
          </div>
        </div>

        {/* Search Bar */}
        <div className="p-4 rounded-2xl bg-white border border-slate-200 flex items-center justify-between shadow-xs">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search final selected candidates..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 outline-none focus:border-orange-500 focus:bg-white transition-all"
            />
          </div>

          <span className="text-xs font-bold text-slate-500">
            {filteredApps.length} Candidate(s) Ready for Offer
          </span>
        </div>

        {/* Final Selected Table */}
        <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50/80 text-slate-500 font-extrabold uppercase tracking-wider">
                  <th className="py-3 px-4">Application ID</th>
                  <th className="py-3 px-4">Candidate</th>
                  <th className="py-3 px-4">Job Role</th>
                  <th className="py-3 px-3">HR Specialist</th>
                  <th className="py-3 px-3">Round 1</th>
                  <th className="py-3 px-3">Round 2</th>
                  <th className="py-3 px-3">Offer Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {loading ? (
                  <tr>
                    <td colSpan={8} className="py-12 text-center text-slate-400">
                      <div className="flex flex-col items-center gap-2">
                        <div className="w-7 h-7 border-3 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
                        <p className="font-semibold text-xs text-slate-500">Loading final selected candidates...</p>
                      </div>
                    </td>
                  </tr>
                ) : filteredApps.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-12 text-center text-slate-400">
                      <p className="font-semibold text-xs">No candidates currently awaiting offer release.</p>
                    </td>
                  </tr>
                ) : (
                  filteredApps.map((app) => {
                    const candidate = app.candidate || {};
                    const candName = `${candidate.firstName || ''} ${candidate.lastName || ''}`.trim() || 'Candidate';
                    const appId = app.candidateCode || app.id?.slice(0, 10) || 'APP-2026';
                    const assignedHr = app.assignedHr?.name || 'HR Specialist';
                    const isOfferSent = app.status === 'OFFER_SENT' || app.offer?.status === 'SENT';
                    const isOfferAccepted = app.status === 'OFFER_ACCEPTED' || app.offer?.status === 'ACCEPTED';

                    return (
                      <tr key={app.id} className="hover:bg-orange-50/20 transition-colors">
                        {/* Application ID */}
                        <td className="py-3.5 px-4 font-mono font-bold text-slate-700">{appId}</td>

                        {/* Candidate */}
                        <td className="py-3.5 px-4">
                          <div className="font-bold text-slate-900 leading-tight">{candName}</div>
                          <div className="text-[11px] text-slate-500 font-mono mt-0.5">{candidate.email}</div>
                        </td>

                        {/* Job Role */}
                        <td className="py-3.5 px-4 font-semibold text-slate-700 max-w-[180px] truncate">
                          {app.job?.title || 'Open Position'}
                        </td>

                        {/* Specialist */}
                        <td className="py-3.5 px-3 whitespace-nowrap font-medium text-slate-800">
                          {assignedHr}
                        </td>

                        {/* Round 1 Status */}
                        <td className="py-3.5 px-3 whitespace-nowrap">
                          <span className="inline-flex items-center gap-1 text-[10px] font-extrabold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200/60">
                            <CheckCircle2 className="w-3 h-3" /> PASSED
                          </span>
                        </td>

                        {/* Round 2 Status */}
                        <td className="py-3.5 px-3 whitespace-nowrap">
                          <span className="inline-flex items-center gap-1 text-[10px] font-extrabold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-md border border-emerald-300">
                            <CheckCircle2 className="w-3 h-3" /> CLEARED
                          </span>
                        </td>

                        {/* Offer Status Badge */}
                        <td className="py-3.5 px-3 whitespace-nowrap">
                          {isOfferAccepted ? (
                            <span className="inline-flex items-center gap-1 text-[10px] font-extrabold text-indigo-800 bg-indigo-100 px-2.5 py-0.5 rounded-full border border-indigo-300 shadow-2xs">
                              <CheckCircle2 className="w-3 h-3 text-indigo-700" /> ACCEPTED
                            </span>
                          ) : isOfferSent ? (
                            <span className="inline-flex items-center gap-1 text-[10px] font-extrabold text-emerald-800 bg-emerald-100 px-2.5 py-0.5 rounded-full border border-emerald-300 shadow-2xs">
                              <Send className="w-3 h-3 text-emerald-700" /> OFFER SENT
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-[10px] font-extrabold text-amber-800 bg-amber-100 px-2.5 py-0.5 rounded-full border border-amber-300">
                              <Clock className="w-3 h-3 text-amber-700" /> READY FOR OFFER
                            </span>
                          )}
                        </td>

                        {/* Actions: Preview Full History, View Resume, Send / Resend Offer */}
                        <td className="py-3.5 px-4 text-right whitespace-nowrap">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => {
                                setSelectedAppForPreview(app);
                                setPreviewModalOpen(true);
                              }}
                              className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs transition-all"
                            >
                              Preview History
                            </button>

                            <button
                              onClick={() => handleOpenResume(candidate.resumeUrl, candName)}
                              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold text-xs transition-all"
                            >
                              <FileText className="w-3.5 h-3.5 text-orange-600" /> Resume
                            </button>

                            {isOfferSent ? (
                              <button
                                onClick={() => {
                                  setSelectedAppForOffer(app);
                                  setOfferModalOpen(true);
                                }}
                                className="inline-flex items-center gap-1 px-3 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs shadow-xs transition-all"
                                title="Inspect or re-dispatch offer letter"
                              >
                                <RotateCw className="w-3 h-3" /> Resend Offer
                              </button>
                            ) : (
                              <button
                                onClick={() => {
                                  setSelectedAppForOffer(app);
                                  setOfferModalOpen(true);
                                }}
                                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-extrabold text-xs shadow-xs transition-all"
                              >
                                <Send className="w-3.5 h-3.5" /> Send Offer
                              </button>
                            )}
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

        {/* Viewport-Centered Modals */}
        <FinalCandidatePreviewModal
          isOpen={previewModalOpen}
          onClose={() => setPreviewModalOpen(false)}
          application={selectedAppForPreview}
          onOpenSendOffer={(app) => {
            setSelectedAppForOffer(app);
            setOfferModalOpen(true);
          }}
          onViewResume={(url, name) => handleOpenResume(url, name)}
        />

        <SendOfferModal
          isOpen={offerModalOpen}
          onClose={() => setOfferModalOpen(false)}
          application={selectedAppForOffer}
          onSendOffer={handleExecuteSendOffer}
        />

        <ResumeViewerModal
          isOpen={resumeModalOpen}
          onClose={() => setResumeModalOpen(false)}
          resumeUrl={activeResumeUrl}
          candidateName={activeCandidateName}
        />
      </div>
    </DashboardLayout>
  );
};

export default FinalRoundSelectedPage;
