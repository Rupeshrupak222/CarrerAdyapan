import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { 
  X, 
  Send, 
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
  const [activeTab, setActiveTab] = useState<'EDIT' | 'PREVIEW'>('EDIT');
  const [previewPage, setPreviewPage] = useState<number>(1);
  const [loading, setLoading] = useState(false);
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
      const existingOffer = application.offer?.offerDetails || {};

      setCandidateName(existingOffer.candidateName || fullName);
      setOfferDate(
        existingOffer.offerDate || 
        new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }).replace(/ /g, '-')
      );
      setOlNo(existingOffer.olNo || application.candidateCode || 'ADP0428');
      setJobTitle(existingOffer.jobTitle || application.job?.title || 'COMMUNITY DEVELOPMENT INTERN');
      setDuration(existingOffer.duration || '6 MONTHS');
      setTrainingStartDate(existingOffer.trainingStartDate || '25-May-2026');
      setTrainingEndDate(existingOffer.trainingEndDate || '06-Jun-2026');
      setOjtStartDate(existingOffer.ojtStartDate || '07-Jun-2026');
      setOjtEndDate(existingOffer.ojtEndDate || '07-Dec-2026');
      setLocation(existingOffer.location || 'HYDERABAD');
      setStipend(existingOffer.stipend || 'INR 20000/-PerMonth');
      setIncentives(existingOffer.incentives || 'Up to 10,000/- INCENTIVES.');
      setPostProbationCtc(existingOffer.postProbationCtc || '₹8 LPA ( 6 Fixed + 2 Variable )');
      setReportingDate(existingOffer.reportingDate || existingOffer.trainingStartDate || '25-May-2026');

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
    <div className="border-b border-slate-300 pb-2.5 mb-5">
      <div className="flex items-center gap-2.5">
        <img
          src="/adyapan-logo.jpeg"
          alt="Adyapan Logo"
          className="w-8 h-8 rounded-full object-cover shadow-xs shrink-0 border border-amber-500/40"
        />
        <div>
          <h2 className="text-[#ED9415] font-black text-sm sm:text-base tracking-wide uppercase leading-tight">
            SR'S ADYAPAN EDUTECH PRIVATE LIMITED
          </h2>
          <h4 className="text-[#B81E1E] font-black text-[10px] sm:text-xs tracking-[0.25em] uppercase leading-tight mt-0.5">
            A D Y A P A N &nbsp; S C H O O L .
          </h4>
        </div>
      </div>
    </div>
  );

  const renderPreviewFooter = () => (
    <div className="mt-8 pt-2.5 pb-2 px-4 bg-[#ED9415] text-slate-950 font-black text-[10px] flex items-center justify-center gap-3 rounded-b-lg tracking-wide">
      <span>hr@adyapan.com</span>
      <span>|</span>
      <span>www.adyapanschool.com</span>
      <span>|</span>
      <span>8179124566</span>
    </div>
  );

  const renderWatermark = () => (
    <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-[0.12] select-none z-0">
      <div className="w-80 h-80 rounded-full border-[14px] border-[#ED9415] flex flex-col items-center justify-center">
        <span className="text-7xl font-black text-[#ED9415] font-serif">ady.</span>
        <span className="text-base font-black text-[#ED9415] tracking-[0.3em] uppercase mt-1">A D Y A P A N</span>
      </div>
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
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-bold transition-all ${
                  activeTab === 'EDIT' ? 'bg-white text-orange-600 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Edit3 className="w-3.5 h-3.5" /> Edit Details
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('PREVIEW')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-bold transition-all ${
                  activeTab === 'PREVIEW' ? 'bg-white text-orange-600 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
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

              <div className="bg-white border border-slate-300 rounded-2xl p-8 sm:p-10 shadow-lg min-h-[720px] relative overflow-hidden text-slate-900 text-[12px] leading-relaxed font-sans">
                {renderWatermark()}
                {renderPreviewHeader()}
                {/* PAGE 1 CONTENT */}
                {previewPage === 1 && (
                  <div className="space-y-4 relative z-10 animate-fadeIn text-[11.5px] leading-relaxed">
                    <div className="flex items-center justify-between font-bold text-[12.5px] pt-1">
                      <span>{offerDate}</span>
                      <span>OL No: {olNo}</span>
                    </div>

                    <p className="font-bold text-sm pt-2 text-slate-900">
                      Dear {candidateName} ,
                    </p>

                    <p className="text-justify text-slate-800">
                      We congratulate you for being selected for a <strong>{duration}</strong> Training with adyapan. “At will basis” which can be extended. Please find the following confirmation of your Training :
                    </p>

                    <div className="space-y-1.5 pt-2 text-[12px]">
                      <div>
                        <strong>Job Title:</strong> <strong className="uppercase">{jobTitle}</strong>
                      </div>
                      <div>
                        <strong>Training Start Date:</strong> <span>{trainingStartDate}</span>
                      </div>
                      <div>
                        <strong>Training End Date:</strong> <span>{trainingEndDate}</span>
                      </div>
                      <div className="pt-1">
                        <strong>OJT Start Date:</strong> <span>{ojtStartDate}</span>
                      </div>
                      <div>
                        <strong>OJT End Date:</strong> <span>{ojtEndDate}</span>
                      </div>
                      <div className="pt-1">
                        <strong>Location :</strong> <strong className="uppercase">{location}</strong>
                      </div>
                      <div className="pt-2">
                        <strong>Stipend:</strong> <strong>{stipend}</strong>
                      </div>
                      <div>
                        <strong>{incentives}</strong>
                      </div>
                      <div>
                        <strong>Post-Probation CTC:</strong> <strong>{postProbationCtc}</strong>
                      </div>
                    </div>

                    <div className="pt-8 text-slate-800 leading-relaxed text-[11px]">
                      The first <strong>12 days</strong> of training are <strong>unpaid</strong>. Once these 12 days are successfully completed, the trainee will start receiving the stipend <strong>from the 13th day</strong>, subject to regular attendance and satisfactory performance.
                    </div>
                  </div>
                )}

                {/* PAGE 2 CONTENT */}
                {previewPage === 2 && (
                  <div className="space-y-6 relative z-10 animate-fadeIn flex flex-col justify-between min-h-[540px] text-[11.5px] leading-relaxed">
                    <div className="space-y-5">
                      <p className="leading-relaxed text-slate-800 text-justify">
                        Please indicate your acceptance, by signing in the letter and mail the signed and scanned soft copy of the training Offer Letter and the documents as mentioned below to the <strong>hr@adyapan.com</strong> within <strong>2 working days</strong> from the receipt of this mail. The offer shall stand automatically withdrawn without further action on the part of adyapan if we do not receive your acceptance as per the mentioned timeline.
                      </p>

                      <div className="pt-12 text-center text-slate-800 leading-relaxed">
                        I have read and understood the above terms and conditions and I accept this offer, as set forth above, with adyapan, and will report on or before <strong>{reportingDate}</strong>.
                      </div>

                      <div className="pt-12 space-y-4">
                        <div className="flex items-center gap-2">
                          <strong>SIGNATURE:</strong>
                          <span className="text-slate-500 italic text-[11px]">(Candidate’s Signature)</span>
                        </div>
                        <div>
                          <strong>DATE:</strong>
                          <span className="inline-block w-48 border-b border-slate-400 ml-2"></span>
                        </div>
                      </div>
                    </div>

                    {renderPreviewFooter()}
                  </div>
                )}

                {/* PAGE 3 CONTENT */}
                {previewPage === 3 && (
                  <div className="space-y-4 relative z-10 animate-fadeIn flex flex-col justify-between min-h-[540px]">
                    <div className="space-y-2 text-[10.5px] text-slate-800 leading-normal">
                      <div className="flex items-start gap-2">
                        <span className="text-slate-900 font-bold">▪</span>
                        <span>By accepting this training offer you agree to perform all responsibilities assigned to you with due care and diligence and in compliance with the management norms.</span>
                      </div>

                      <div className="flex items-start gap-2">
                        <span className="text-slate-900 font-bold">▪</span>
                        <span>You are also required to substantially use all of your time and effort to perform these tasks during business hours and such reasonable additional time as may be necessary.</span>
                      </div>

                      <div className="pl-4 py-1 space-y-0.5 text-[11px]">
                        <div><u className="font-bold">Working Hours:</u> 9 Hours a day (Inc. Lunch Break).</div>
                        <div><u className="font-bold">Work Timing:</u> 11AM - 8 PM.</div>
                        <div><u className="font-bold">Job Type:</u> Full Time Training</div>
                        <div><u className="font-bold">Location:</u> {location}</div>
                      </div>

                      <div className="flex items-start gap-2">
                        <span className="text-slate-900 font-bold">▪</span>
                        <span>As a Trainee you will not receive any of the employee benefits that regular employees receive.</span>
                      </div>

                      <div className="flex items-start gap-2">
                        <span className="text-slate-900 font-bold">▪</span>
                        <span>During the Training period, the company will have all the rights to terminate your services without offering any reason and you are required to give 15 Days notice should you wish to terminate your training before the end of your tenure.</span>
                      </div>

                      <div className="flex items-start gap-2">
                        <span className="text-slate-900 font-bold">▪</span>
                        <span>At any time if you wish to discontinue the training due to personal reasons , you will have to pay a compensation equal to 1 month stipend or you will have to serve 1 month notice period.</span>
                      </div>

                      <div className="flex items-start gap-2">
                        <span className="text-slate-900 font-bold">▪</span>
                        <span>All the information acquired during the course shall be strictly confidential and you shall refrain from using it for your own purpose or from disclosing it to anyone outside of the Company.</span>
                      </div>

                      <div className="flex items-start gap-2">
                        <span className="text-slate-900 font-bold">▪</span>
                        <span>Upon conclusion of your tenure, you will immediately return to the Company all of its property, equipment and documents including electronically stored information.</span>
                      </div>

                      <div className="flex items-start gap-2">
                        <span className="text-slate-900 font-bold">▪</span>
                        <span>You will observe all policies and practices governing the conduct of our business and employees.</span>
                      </div>

                      <div className="flex items-start gap-2">
                        <span className="text-slate-900 font-bold">▪</span>
                        <span>Official communication either within the company or outside the company should be through the company Email of your manager only.</span>
                      </div>

                      <div className="flex items-start gap-2">
                        <span className="text-slate-900 font-bold">▪</span>
                        <span>Post successful completion of the tenure, the candidate will be prone to performance based pre-placement offers by the company.</span>
                      </div>

                      <div className="pt-4 space-y-2">
                        <div className="flex items-center gap-2">
                          <strong>SIGNATURE:</strong>
                          <span className="text-slate-500 italic text-[11px]">(Candidate’s Signature)</span>
                        </div>
                        <div>
                          <strong>DATE:</strong>
                          <span className="inline-block w-48 border-b border-slate-400 ml-2"></span>
                        </div>
                      </div>
                    </div>

                    {renderPreviewFooter()}
                  </div>
                )}

                {/* PAGE 4 CONTENT */}
                {previewPage === 4 && (
                  <div className="space-y-4 relative z-10 animate-fadeIn flex flex-col justify-between min-h-[540px]">
                    <div className="space-y-4">
                      <h3 className="text-center font-bold text-xs tracking-wider uppercase">ANNEXURE</h3>

                      <table className="w-full border-collapse border border-slate-900 text-xs">
                        <thead>
                          <tr className="border-b border-slate-900 font-bold">
                            <th className="p-2 border-r border-slate-900 w-16 text-center">Sl. No</th>
                            <th className="p-2 text-left">Particulars</th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr className="border-b border-slate-900">
                            <td className="p-2 border-r border-slate-900 text-center font-bold align-top">1.</td>
                            <td className="p-2 space-y-1 text-[11px]">
                              <p className="font-semibold">Professional / Educational Certificates and Mark Sheets towards:</p>
                              <p>• 10th standard or equivalent examination (Original MS for Verification)</p>
                              <p>• 12th standard or equivalent examination (Original MS for Verification)</p>
                              <p>• Graduation</p>
                              <p>• Post-graduation / Doctorate</p>
                              <p>Other relevant educational or skill certifications</p>
                            </td>
                          </tr>
                          <tr className="border-b border-slate-900">
                            <td className="p-2 border-r border-slate-900 text-center font-bold">2.</td>
                            <td className="p-2 font-bold uppercase text-[11px]">COLOR SCANNED COPY OF YOUR PHOTOGRAPHS</td>
                          </tr>
                          <tr>
                            <td className="p-2 border-r border-slate-900 text-center font-bold">3.</td>
                            <td className="p-2 text-[11px]">PAN Card, Voter ID or Driving Licence Scanned Copy.</td>
                          </tr>
                        </tbody>
                      </table>

                      <div className="pt-2 text-[11px] font-bold leading-relaxed">
                        4. Bank Account Details: Bank Name, Your Name as per Bank records, Account Number, IFSC Code.
                      </div>

                      <div className="pt-8 space-y-1">
                        <div className="font-bold">SIGNATURE:</div>
                        <div className="font-bold pt-4 text-xs">HR MANAGER</div>
                        <div className="font-bold text-xs">ADYAPAN</div>
                      </div>
                    </div>

                    {renderPreviewFooter()}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        <div className="px-6 py-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between shrink-0">
          <button type="button" onClick={handleDownloadPdf} disabled={downloadingPdf} className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white hover:bg-slate-100 text-slate-700 font-bold text-xs border border-slate-300 shadow-2xs transition-all disabled:opacity-50">
            <Download className="w-3.5 h-3.5 text-orange-600" /> {downloadingPdf ? 'Downloading...' : 'Download PDF'}
          </button>
          <div className="flex items-center gap-2.5">
            <button type="button" onClick={onClose} className="px-4 py-2 rounded-xl bg-white hover:bg-slate-100 text-slate-700 font-bold text-xs border border-slate-300 shadow-2xs transition-all">Cancel</button>
            <button type="submit" form="send-offer-form" disabled={loading} onClick={activeTab === 'PREVIEW' ? handleSubmit : undefined} className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-orange-600 via-amber-600 to-orange-600 hover:from-orange-700 hover:to-orange-700 text-white font-extrabold text-xs shadow-md transition-all disabled:opacity-50">
              {loading ? <><RotateCw className="w-3.5 h-3.5 animate-spin" /> Dispatching...</> : <><Send className="w-3.5 h-3.5" /> Confirm & Release</>}
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  return typeof document !== 'undefined' ? createPortal(modalContent, document.body) : null;
};

export default SendOfferModal;
