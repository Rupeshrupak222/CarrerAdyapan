import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import {
  X,
  Send,
  Save,
  Award,
  DollarSign,
  CheckCircle2,
  Eye,
  Edit3,
  RotateCw,
  Download
} from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../services/api';
import { applicationService } from '../../services/applicationService';

interface SendOfferModalProps {
  isOpen: boolean;
  onClose: () => void;
  application: any;
  onSendOffer: (appId: string, offerData: any) => Promise<void>;
  onSaveDraft?: (appId: string, offerData: any) => Promise<void>;
}

export const SendOfferModal: React.FC<SendOfferModalProps> = ({
  isOpen,
  onClose,
  application,
  onSendOffer,
  onSaveDraft,
}) => {
  const [activeTab, setActiveTab] = useState<'EDIT' | 'PREVIEW'>('EDIT');
  const [previewPage, setPreviewPage] = useState<number>(1);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [downloadingPdf, setDownloadingPdf] = useState(false);

  // Editable Fields per User Specification
  const [candidateName, setCandidateName] = useState('');
  const [offerDate, setOfferDate] = useState('14-May-2026');
  const [olNo, setOlNo] = useState('ADP0428');
  const [jobTitle, setJobTitle] = useState('COMMUNITY DEVELOPMENT INTERN');
  const [duration, setDuration] = useState('6 MONTHS');
  const [trainingStartDate, setTrainingStartDate] = useState('25-May-2026');
  const [trainingEndDate, setTrainingEndDate] = useState('06-Jun-2026');
  const [ojtStartDate, setOjtStartDate] = useState('07-Jun-2026');
  const [ojtEndDate, setOjtEndDate] = useState('07-Dec-2026');
  const [location, setLocation] = useState('HYDERABAD');
  const [stipend, setStipend] = useState('INR 20000/-PerMonth');
  const [incentives, setIncentives] = useState('Up to 10,000/- INCENTIVES.');
  const [postProbationCtc, setPostProbationCtc] = useState('₹8 LPA ( 6 Fixed + 2 Variable )');
  const [reportingDate, setReportingDate] = useState('25-May-2026');

  // Sync state whenever application prop changes or modal opens
  useEffect(() => {
    if (application) {
      const cand = application.candidate || {};
      const fullName = `${cand.firstName || ''} ${cand.lastName || ''}`.trim() || 'Candidate';
      let existingOffer: any = {};
      if (application.offer?.offerDetails) {
        if (typeof application.offer.offerDetails === 'object') {
          existingOffer = application.offer.offerDetails;
        } else if (typeof application.offer.offerDetails === 'string') {
          try {
            existingOffer = JSON.parse(application.offer.offerDetails);
          } catch (e) {
            existingOffer = {};
          }
        }
      }

      setCandidateName(existingOffer.candidateName || fullName);
      setOfferDate(
        existingOffer.offerDate ||
        new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }).replace(/ /g, '-')
      );
      setOlNo(existingOffer.olNo || application.candidateCode || 'ADP0428');
      setJobTitle(existingOffer.jobTitle || application.job?.title || 'COMMUNITY DEVELOPMENT INTERN');
      setDuration(existingOffer.duration || '6 MONTHS');
      setTrainingStartDate(existingOffer.trainingStartDate || '01-Sep-2026');
      setTrainingEndDate(existingOffer.trainingEndDate || '15-Sep-2026');
      setOjtStartDate(existingOffer.ojtStartDate || '16-Sep-2026');
      setOjtEndDate(existingOffer.ojtEndDate || '16-Mar-2027');
      setLocation(existingOffer.location || 'HYDERABAD');
      setStipend(existingOffer.stipend || 'INR 20000/-PerMonth');
      setIncentives(existingOffer.incentives || 'Up to 10,000/- INCENTIVES.');
      setPostProbationCtc(existingOffer.postProbationCtc || '₹8 LPA ( 6 Fixed + 2 Variable )');
      setReportingDate(existingOffer.reportingDate || existingOffer.trainingStartDate || '01-Sep-2026');

      setActiveTab('EDIT');
      setPreviewPage(1);
    }
  }, [application, isOpen]);

  if (!isOpen || !application) return null;

  const isAlreadySent = application.status === 'OFFER_SENT' || application.offer?.status === 'SENT';

  const offerPayload = {
    candidateName,
    offerDate,
    olNo,
    jobTitle,
    duration,
    trainingStartDate,
    trainingEndDate,
    ojtStartDate,
    ojtEndDate,
    location,
    stipend,
    incentives,
    postProbationCtc,
    reportingDate,
    customTerms: `Designation: ${jobTitle} | Stipend: ${stipend} | Location: ${location} | Dates: ${trainingStartDate} to ${ojtEndDate}`,
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await onSendOffer(application.id, offerPayload);
      onClose();
    } finally {
      setLoading(false);
    }
  };

  const handleSaveDraft = async () => {
    setSaving(true);
    const toastId = toast.loading('Saving offer details in database...');
    try {
      if (onSaveDraft) {
        await onSaveDraft(application.id, offerPayload);
      } else {
        const res = await applicationService.saveOfferDraft(application.id, offerPayload);
        toast.success(res.message || 'Offer details saved successfully in database!', { id: toastId });
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || err.message || 'Failed to save offer details', { id: toastId });
    } finally {
      setSaving(false);
    }
  };

  const handleDownloadPdf = async () => {
    setDownloadingPdf(true);
    const toastId = toast.loading('Generating 4-Page Adyapan Offer Letter PDF...');
    try {
      const response = await api.post('/offers/generate-pdf', offerPayload, {
        responseType: 'blob',
      });
      const blob = new Blob([response.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${candidateName.replace(/\s+/g, '_')}_Official_Adyapan_Offer_Letter.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      toast.success('Official 4-Page PDF generated and downloaded!', { id: toastId });
    } catch (err: any) {
      toast.error('Failed to download PDF: ' + err.message, { id: toastId });
    } finally {
      setDownloadingPdf(false);
    }
  };

  const renderPreviewHeader = () => (
    <div className="w-full pb-1 mb-5">
      {/* Row 1: Centered Large Logo + Big Bold Company Title in Single Line */}
      <div className="flex items-center justify-center gap-5 sm:gap-6 flex-nowrap">
        <img
          src="/adyapan-logo.png"
          alt="Adyapan Logo"
          className="w-16 h-16 sm:w-20 sm:h-20 object-contain shrink-0"
        />
        <h2 className="text-[#ED9415] font-black text-xl sm:text-2xl md:text-3xl tracking-tight sm:tracking-normal uppercase leading-none whitespace-nowrap shrink-0">
          SR'S ADYAPAN EDUTECH PRIVATE LIMITED
        </h2>
      </div>

      {/* Row 2: Centered Subtitle with increased spacing */}
      <div className="text-center mt-4 sm:mt-5">
        <h4 className="text-[#B81E1E] font-black text-sm sm:text-base md:text-lg tracking-[0.38em] uppercase leading-none whitespace-nowrap">
          A D Y A P A N &nbsp; S C H O O L .
        </h4>
      </div>

      {/* Row 3: Full-width Bold Divider Line */}
      <div className="w-full border-b-2 border-slate-500/80 mt-5"></div>
    </div>
  );

  const renderPreviewFooter = () => (
    <div className="mt-8 pt-2.5 pb-2 px-4 bg-[#ED9415] text-slate-950 font-black text-[11px] flex items-center justify-center gap-3 rounded-b-lg tracking-wide">
      <span>hr@adyapan.com</span>
      <span>|</span>
      <span>www.adyapanschool.com</span>
      <span>|</span>
      <span>8179124566</span>
    </div>
  );

  const renderWatermark = () => (
    <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-[0.08] select-none z-0">
      <img
        src="/adyapan-logo.png"
        alt="Watermark"
        className="w-72 h-72 object-contain"
      />
    </div>
  );

  const modalContent = (
    <div
      className="fixed inset-0 z-[99999] overflow-y-auto bg-slate-950/75 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4 min-h-screen animate-fadeIn"
      onClick={onClose}
    >
      <div
        className="w-full max-w-4xl bg-white border border-slate-200 rounded-3xl shadow-2xl flex flex-col max-h-[92vh] overflow-hidden my-auto animate-scaleUp relative"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="px-6 py-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 via-orange-500 to-amber-600 text-white flex items-center justify-center font-black shadow-sm">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-slate-900">
                {isAlreadySent ? 'Resend Employment Offer' : 'Issue Employment Offer'}
              </h3>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex items-center p-1 rounded-xl bg-slate-200/70 border border-slate-300/50 text-xs">
              <button
                type="button"
                onClick={() => setActiveTab('EDIT')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-bold transition-all ${activeTab === 'EDIT' ? 'bg-white text-orange-600 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
                  }`}
              >
                <Edit3 className="w-3.5 h-3.5" /> Edit Details
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('PREVIEW')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-bold transition-all ${activeTab === 'PREVIEW' ? 'bg-white text-orange-600 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
                  }`}
              >
                <Eye className="w-3.5 h-3.5" /> Letter Preview (4 Pages)
              </button>
            </div>

            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition-colors ml-1"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-4 text-xs text-slate-700 bg-slate-50/50">
          {activeTab === 'EDIT' ? (
            <form id="send-offer-form" onSubmit={handleSubmit} className="space-y-4 max-w-3xl mx-auto bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
              <div className="p-3.5 rounded-2xl bg-orange-50/70 border border-orange-200/80 flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-orange-800">Target Role</span>
                  <p className="text-sm font-extrabold text-slate-900 mt-0.5">{jobTitle}</p>
                </div>
                <div className="text-right">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800">Status</span>
                  <p className="text-xs font-bold text-emerald-700 flex items-center gap-1 mt-0.5">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Round 2 Cleared
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="text-slate-700 font-bold block mb-1">Candidate Full Name *</label>
                  <input type="text" required value={candidateName} onChange={(e) => setCandidateName(e.target.value)} className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 font-semibold outline-none focus:border-orange-500 focus:bg-white transition-all text-xs" />
                </div>
                <div>
                  <label className="text-slate-700 font-bold block mb-1">Offer Issue Date *</label>
                  <input type="text" required value={offerDate} onChange={(e) => setOfferDate(e.target.value)} className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 font-semibold outline-none focus:border-orange-500 focus:bg-white transition-all text-xs" />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="text-slate-700 font-bold block mb-1">Offer Letter No *</label>
                  <input type="text" required value={olNo} onChange={(e) => setOlNo(e.target.value)} className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 font-mono font-bold outline-none focus:border-orange-500 focus:bg-white transition-all text-xs" />
                </div>
                <div>
                  <label className="text-slate-700 font-bold block mb-1">Job Title / Designation *</label>
                  <input type="text" required value={jobTitle} onChange={(e) => setJobTitle(e.target.value)} className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 font-bold uppercase outline-none focus:border-orange-500 focus:bg-white transition-all text-xs" />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="text-slate-700 font-bold block mb-1">Training Start Date *</label>
                  <input type="text" required value={trainingStartDate} onChange={(e) => { setTrainingStartDate(e.target.value); setReportingDate(e.target.value); }} className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 font-semibold outline-none focus:border-orange-500 focus:bg-white transition-all text-xs" />
                </div>
                <div>
                  <label className="text-slate-700 font-bold block mb-1">Training End Date *</label>
                  <input type="text" required value={trainingEndDate} onChange={(e) => setTrainingEndDate(e.target.value)} className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 font-semibold outline-none focus:border-orange-500 focus:bg-white transition-all text-xs" />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="text-slate-700 font-bold block mb-1">OJT Start Date *</label>
                  <input type="text" required value={ojtStartDate} onChange={(e) => setOjtStartDate(e.target.value)} className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 font-semibold outline-none focus:border-orange-500 focus:bg-white transition-all text-xs" />
                </div>
                <div>
                  <label className="text-slate-700 font-bold block mb-1">OJT End Date *</label>
                  <input type="text" required value={ojtEndDate} onChange={(e) => setOjtEndDate(e.target.value)} className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 font-semibold outline-none focus:border-orange-500 focus:bg-white transition-all text-xs" />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="text-slate-700 font-bold block mb-1">Location *</label>
                  <input type="text" required value={location} onChange={(e) => setLocation(e.target.value)} className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 font-bold uppercase outline-none focus:border-orange-500 focus:bg-white transition-all text-xs" />
                </div>
                <div>
                  <label className="text-slate-700 font-bold block mb-1">Stipend (Monthly) *</label>
                  <input type="text" required value={stipend} onChange={(e) => setStipend(e.target.value)} className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 font-bold outline-none focus:border-orange-500 focus:bg-white transition-all text-xs" />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="text-slate-700 font-bold block mb-1">Incentives Clause *</label>
                  <input type="text" required value={incentives} onChange={(e) => setIncentives(e.target.value)} className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 font-bold outline-none focus:border-orange-500 focus:bg-white transition-all text-xs" />
                </div>
                <div>
                  <label className="text-slate-700 font-bold block mb-1">Post-Probation CTC *</label>
                  <input type="text" required value={postProbationCtc} onChange={(e) => setPostProbationCtc(e.target.value)} className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 font-bold outline-none focus:border-orange-500 focus:bg-white transition-all text-xs" />
                </div>
              </div>
            </form>
          ) : (
            <div className="space-y-4 max-w-3xl mx-auto">
              <div className="flex items-center justify-between bg-white px-4 py-2.5 rounded-2xl border border-slate-200 shadow-2xs text-xs">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-slate-700">Page Navigation:</span>
                  <div className="flex items-center gap-1">
                    {[1, 2, 3, 4].map((page) => (
                      <button key={page} onClick={() => setPreviewPage(page)} className={`w-7 h-7 rounded-lg font-bold text-xs transition-all ${previewPage === page ? 'bg-orange-600 text-white shadow-xs' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'}`}>{page}</button>
                    ))}
                  </div>
                </div>
                <button onClick={handleDownloadPdf} disabled={downloadingPdf} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs border border-slate-300 shadow-2xs transition-all disabled:opacity-50">
                  <Download className="w-3.5 h-3.5 text-orange-600" /> {downloadingPdf ? 'Generating...' : 'Download PDF'}
                </button>
              </div>

              <div className="bg-white border border-slate-300 rounded-2xl p-8 sm:p-10 shadow-lg min-h-[720px] relative overflow-hidden text-slate-900 text-[13.5px] leading-relaxed font-sans">
                {renderWatermark()}
                {renderPreviewHeader()}
                {/* PAGE 1 CONTENT */}
                {previewPage === 1 && (
                  <div className="space-y-5 relative z-10 animate-fadeIn flex flex-col justify-between min-h-[620px] text-[13.5px] leading-relaxed">
                    <div className="space-y-4 pt-2">
                      <div className="flex items-center justify-between font-bold text-[14px]">
                        <span>{offerDate}</span>
                        <span>OL No: {olNo}</span>
                      </div>

                      <p className="font-bold text-[15px] pt-3 text-slate-900">
                        Dear {candidateName},
                      </p>

                      <p className="text-justify text-slate-800 leading-relaxed">
                        We congratulate you for being selected for a <strong>{duration}</strong> Training with adyapan. “At will basis” which can be extended. Please find the confirmation of your Training terms and details below:
                      </p>

                      <div className="grid grid-cols-[180px_1fr] gap-y-3 pt-3 text-[13.5px]">
                        <div><strong>Job Title:</strong></div>
                        <div><strong className="uppercase">{jobTitle}</strong></div>

                        <div><strong>Training Start Date:</strong></div>
                        <div><span>{trainingStartDate}</span></div>

                        <div><strong>Training End Date:</strong></div>
                        <div><span>{trainingEndDate}</span></div>

                        <div><strong>OJT Start Date:</strong></div>
                        <div><span>{ojtStartDate}</span></div>

                        <div><strong>OJT End Date:</strong></div>
                        <div><span>{ojtEndDate}</span></div>

                        <div><strong>Location:</strong></div>
                        <div><strong className="uppercase">{location}</strong></div>

                        <div><strong>Stipend:</strong></div>
                        <div><strong>{stipend}</strong></div>

                        <div className="col-span-2"><strong>{incentives}</strong></div>

                        <div><strong>Post-Probation CTC:</strong></div>
                        <div><strong>{postProbationCtc}</strong></div>
                      </div>

                      <div className="pt-8 text-slate-800 leading-relaxed text-[12.5px]">
                        The first <strong>12 days</strong> of training are <strong>unpaid</strong>. Once these 12 days are successfully completed, the trainee will start receiving the stipend <strong>from the 13th day</strong>, subject to regular attendance and satisfactory performance.
                      </div>
                    </div>

                    {renderPreviewFooter()}
                  </div>
                )}

                {/* PAGE 2 CONTENT */}
                {previewPage === 2 && (
                  <div className="space-y-6 relative z-10 animate-fadeIn flex flex-col justify-between min-h-[620px] text-[13.5px] leading-relaxed">
                    <div className="space-y-6 pt-3">
                      <p className="leading-relaxed text-slate-800 text-justify">
                        Please indicate your acceptance by signing this letter and emailing the signed, scanned soft copy of the training Offer Letter and the required documents to <strong>hr@adyapan.com</strong> within <strong>2 working days</strong> from the receipt of this mail. The offer shall stand automatically withdrawn without further action on the part of adyapan if we do not receive your acceptance as per the mentioned timeline.
                      </p>

                      <div className="pt-10 text-center text-slate-800 leading-relaxed max-w-xl mx-auto">
                        I have read and understood the above terms and conditions and I accept this offer, as set forth above, with adyapan, and will report on or before <strong>{reportingDate || trainingStartDate}</strong>.
                      </div>
                    </div>

                    <div className="mt-auto pb-6 space-y-6">
                      <div className="flex items-center gap-2">
                        <strong className="w-56">CANDIDATE SIGNATURE:</strong>
                        <span className="inline-block w-64 border-b border-slate-400"></span>
                      </div>
                      <div className="flex items-center gap-2">
                        <strong className="w-56">CANDIDATE NAME:</strong>
                        <span className="font-bold text-slate-900">{candidateName}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <strong className="w-56">DATE:</strong>
                        <span className="inline-block w-64 border-b border-slate-400"></span>
                      </div>
                    </div>

                    {renderPreviewFooter()}
                  </div>
                )}

                {/* PAGE 3 CONTENT */}
                {previewPage === 3 && (
                  <div className="space-y-6 relative z-10 animate-fadeIn flex flex-col justify-between min-h-[620px]">
                    <div className="space-y-3.5 pt-2 text-[13px] text-slate-800 leading-relaxed">
                      <div className="flex items-start gap-2.5">
                        <span className="text-slate-900 font-bold text-sm">▪</span>
                        <span>By accepting this training offer you agree to perform all responsibilities assigned to you with due care and diligence and in compliance with the management norms.</span>
                      </div>

                      <div className="flex items-start gap-2.5">
                        <span className="text-slate-900 font-bold text-sm">▪</span>
                        <span>You are required to substantially use your time and effort to perform assigned tasks during business hours and such reasonable additional time as may be necessary.</span>
                      </div>

                      <div className="pl-5 py-2.5 space-y-1.5 text-[13px] bg-slate-50/80 rounded-xl border border-slate-200/60 my-2">
                        <div><strong className="underline">Working Hours:</strong> 9 Hours a day (Inc. Lunch Break).</div>
                        <div><strong className="underline">Work Timing:</strong> 11 AM - 8 PM.</div>
                        <div><strong className="underline">Job Type:</strong> Full Time Training</div>
                        <div><strong className="underline">Location:</strong> {location}</div>
                      </div>

                      <div className="flex items-start gap-2.5">
                        <span className="text-slate-900 font-bold text-sm">▪</span>
                        <span>As a Trainee you will not receive employee benefits that regular employees receive.</span>
                      </div>

                      <div className="flex items-start gap-2.5">
                        <span className="text-slate-900 font-bold text-sm">▪</span>
                        <span>During Training, the company reserves rights to terminate services without offering reason and you are required to give 15 Days notice should you wish to terminate early.</span>
                      </div>

                      <div className="flex items-start gap-2.5">
                        <span className="text-slate-900 font-bold text-sm">▪</span>
                        <span>If you discontinue training for personal reasons, you will have to pay compensation equal to 1 month stipend or serve 1 month notice period.</span>
                      </div>

                      <div className="flex items-start gap-2.5">
                        <span className="text-slate-900 font-bold text-sm">▪</span>
                        <span>All information acquired during tenure is strictly confidential and shall not be disclosed.</span>
                      </div>

                      <div className="flex items-start gap-2.5">
                        <span className="text-slate-900 font-bold text-sm">▪</span>
                        <span>Upon tenure conclusion, immediately return all Company equipment, data and property.</span>
                      </div>

                      <div className="flex items-start gap-2.5">
                        <span className="text-slate-900 font-bold text-sm">▪</span>
                        <span>Official communication must be routed strictly through the company email of your manager.</span>
                      </div>

                      <div className="flex items-start gap-2.5">
                        <span className="text-slate-900 font-bold text-sm">▪</span>
                        <span>Post successful completion, candidate is eligible for performance-based pre-placement offer.</span>
                      </div>
                    </div>

                    <div className="mt-auto pb-4 space-y-5">
                      <div className="flex items-center gap-2">
                        <strong>SIGNATURE:</strong>
                        <span className="inline-block w-64 border-b border-slate-400 ml-2"></span>
                        <span className="text-slate-500 italic text-[12.5px] ml-2">(Candidate's Signature)</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <strong>DATE:</strong>
                        <span className="inline-block w-64 border-b border-slate-400 ml-2"></span>
                      </div>
                    </div>

                    {renderPreviewFooter()}
                  </div>
                )}

                {/* PAGE 4 CONTENT */}
                {previewPage === 4 && (
                  <div className="space-y-4 relative z-10 animate-fadeIn flex flex-col justify-between min-h-[620px]">
                    <div className="space-y-4 pt-2">
                      <h3 className="text-center font-bold text-sm tracking-wider uppercase">ANNEXURE</h3>

                      <table className="w-full border-collapse border border-slate-900 text-[12.5px]">
                        <thead>
                          <tr className="border-b border-slate-900 font-bold">
                            <th className="p-2.5 border-r border-slate-900 w-16 text-center">Sl. No</th>
                            <th className="p-2.5 text-left">Particulars</th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr className="border-b border-slate-900">
                            <td className="p-2.5 border-r border-slate-900 text-center font-bold align-top">1.</td>
                            <td className="p-2.5 space-y-1 text-[12px]">
                              <p className="font-semibold">Professional / Educational Certificates and Mark Sheets towards:</p>
                              <p>• 10th standard or equivalent examination (Original for Verification)</p>
                              <p>• 12th standard or equivalent examination (Original for Verification)</p>
                              <p>• Graduation Degree & Semester Mark Sheets</p>
                              <p>• Post-graduation / Master's (if applicable)</p>
                              <p>• Other relevant educational or skill certifications</p>
                            </td>
                          </tr>
                          <tr className="border-b border-slate-900">
                            <td className="p-2.5 border-r border-slate-900 text-center font-bold">2.</td>
                            <td className="p-2.5 font-bold uppercase text-[12px]">COLOR SCANNED COPY OF PASSPORT PHOTOGRAPHS</td>
                          </tr>
                          <tr>
                            <td className="p-2.5 border-r border-slate-900 text-center font-bold">3.</td>
                            <td className="p-2.5 text-[12px]">Aadhaar Card, PAN Card, Voter ID or Passport Scanned Copy.</td>
                          </tr>
                        </tbody>
                      </table>

                      <div className="pt-3 text-[12.5px] font-bold leading-relaxed">
                        4. Bank Account Details: Bank Name, Name as per Bank, Account Number, IFSC Code.
                      </div>
                    </div>

                    <div className="mt-auto pb-4 space-y-1">
                      <div className="font-bold">SIGNATURE:</div>
                      <div className="font-bold pt-3 text-xs uppercase">HR MANAGER</div>
                      <div className="font-bold text-xs uppercase">ADYAPAN EDUTECH PRIVATE LIMITED</div>
                    </div>

                    {renderPreviewFooter()}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        <div className="px-6 py-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between shrink-0">
          <button 
            type="button" 
            onClick={handleDownloadPdf} 
            disabled={downloadingPdf} 
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white hover:bg-slate-100 text-slate-700 font-bold text-xs border border-slate-300 shadow-2xs transition-all disabled:opacity-50 cursor-pointer"
          >
            <Download className="w-3.5 h-3.5 text-orange-600" /> {downloadingPdf ? 'Downloading...' : 'Download PDF'}
          </button>
          
          <div className="flex items-center gap-2.5">
            <button 
              type="button" 
              onClick={onClose} 
              className="px-4 py-2 rounded-xl bg-white hover:bg-slate-100 text-slate-700 font-bold text-xs border border-slate-300 shadow-2xs transition-all cursor-pointer"
            >
              Cancel
            </button>

            {/* Save Offer Details to Database */}
            <button
              type="button"
              disabled={saving || loading}
              onClick={handleSaveDraft}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-900 text-white font-bold text-xs shadow-xs transition-all disabled:opacity-50 cursor-pointer"
              title="Save offer configuration directly to database"
            >
              {saving ? (
                <>
                  <RotateCw className="w-3.5 h-3.5 animate-spin" /> Saving...
                </>
              ) : (
                <>
                  <Save className="w-3.5 h-3.5 text-emerald-400" /> Save Details
                </>
              )}
            </button>

            {/* Confirm & Release Offer Letter */}
            <button 
              type="submit" 
              form="send-offer-form" 
              disabled={loading || saving} 
              onClick={activeTab === 'PREVIEW' ? handleSubmit : undefined} 
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-orange-600 via-amber-600 to-orange-600 hover:from-orange-700 hover:to-orange-700 text-white font-extrabold text-xs shadow-md transition-all disabled:opacity-50 cursor-pointer"
            >
              {loading ? (
                <>
                  <RotateCw className="w-3.5 h-3.5 animate-spin" /> Dispatching...
                </>
              ) : (
                <>
                  <Send className="w-3.5 h-3.5" /> Confirm & Release
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  return typeof document !== 'undefined' ? createPortal(modalContent, document.body) : null;
};

export default SendOfferModal;
