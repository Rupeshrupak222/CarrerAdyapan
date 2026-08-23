import React, { useState, useEffect } from 'react';
import { useSearchParams, useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { 
  Award, 
  Download, 
  CheckCircle2, 
  AlertCircle, 
  Calendar, 
  DollarSign, 
  MapPin, 
  ShieldCheck, 
  Sparkles,
  ArrowRight,
  HelpCircle,
  FileText
} from 'lucide-react';
import toast from 'react-hot-toast';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const SecureOfferPage: React.FC = () => {
  const { token: paramToken } = useParams<{ token?: string }>();
  const [searchParams] = useSearchParams();
  const token = paramToken || searchParams.get('token');
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [offerData, setOfferData] = useState<any>(null);
  const [accepting, setAccepting] = useState(false);
  const [isAccepted, setIsAccepted] = useState(false);
  const [isRejected, setIsRejected] = useState(false);
  const [declining, setDeclining] = useState(false);
  const [declineModalOpen, setDeclineModalOpen] = useState(false);
  const [declineReason, setDeclineReason] = useState('');
  const [acceptedTimestamp, setAcceptedTimestamp] = useState<string | null>(null);
  const [downloadingPdf, setDownloadingPdf] = useState(false);

  useEffect(() => {
    if (!token) {
      setError('Missing offer acceptance token. Please click the link in your offer email.');
      setLoading(false);
      return;
    }
    fetchOfferDetails();
  }, [token]);

  const fetchOfferDetails = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await axios.get(`${API_BASE}/offers/accept-token/${token}`);
      if (res.data?.success && res.data?.offer) {
        setOfferData(res.data.offer);
        if (res.data.offer.status === 'ACCEPTED' || res.data.offer.isAccepted) {
          setIsAccepted(true);
          setAcceptedTimestamp(res.data.offer.acceptedAt);
        } else if (res.data.offer.status === 'REJECTED') {
          setIsRejected(true);
        }
      } else {
        setError(res.data?.message || 'Offer not found or link has expired.');
      }
    } catch (err: any) {
      setError(err?.response?.data?.message || 'This offer link is invalid or has expired. Please contact your HR manager.');
    } finally {
      setLoading(false);
    }
  };

  const handleDeclineOffer = async () => {
    if (!token) return;
    setDeclining(true);
    try {
      const res = await axios.post(`${API_BASE}/offers/reject`, { token, rejectionReason: declineReason });
      if (res.data?.success) {
        setIsRejected(true);
        setDeclineModalOpen(false);
        toast.success('Your response declining the offer has been submitted.');
      } else {
        toast.error(res.data?.message || 'Failed to decline offer.');
      }
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Failed to submit response.');
    } finally {
      setDeclining(false);
    }
  };

  const handleAcceptOffer = async () => {
    if (!token) return;
    setAccepting(true);
    try {
      const res = await axios.post(`${API_BASE}/offers/accept`, { token });
      if (res.data?.success) {
        setIsAccepted(true);
        setAcceptedTimestamp(res.data.offer?.acceptedAt || new Date().toISOString());
        toast.success(res.data?.message || 'Offer accepted successfully! Welcome to Adyapan!');
      } else {
        toast.error(res.data?.message || 'Failed to accept offer.');
      }
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Failed to accept offer. Please try again.');
    } finally {
      setAccepting(false);
    }
  };

  const handleDownloadPdf = async () => {
    if (!offerData) return;
    setDownloadingPdf(true);
    const toastId = toast.loading('Downloading Official 4-Page Adyapan Offer Letter PDF...');
    try {
      const res = await axios.post(
        `${API_BASE}/offers/generate-pdf`,
        {
          candidateName: offerData.candidateName,
          jobTitle: offerData.jobTitle,
          stipend: offerData.stipend,
          location: offerData.location,
          trainingStartDate: offerData.trainingStartDate,
        },
        { responseType: 'blob' }
      );

      const blob = new Blob([res.data], { type: 'application/pdf' });
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = `${offerData.candidateName.replace(/\s+/g, '_')}_Official_Offer_Letter.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(downloadUrl);
      toast.success('Offer Letter downloaded successfully!', { id: toastId });
    } catch (err) {
      toast.error('Failed to download PDF offer letter.', { id: toastId });
    } finally {
      setDownloadingPdf(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
        <div className="flex flex-col items-center gap-4 text-center">
          <div className="w-12 h-12 border-4 border-amber-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-slate-400 font-medium text-sm">Verifying secure offer token credentials...</p>
        </div>
      </div>
    );
  }

  if (error || !offerData) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-slate-900 border border-slate-800 rounded-3xl p-8 text-center shadow-2xl">
          <div className="w-16 h-16 bg-red-500/10 text-red-400 rounded-2xl flex items-center justify-center mx-auto mb-5">
            <AlertCircle className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-bold text-white mb-2">Offer Link Invalid or Expired</h2>
          <p className="text-slate-400 text-sm mb-6 leading-relaxed">
            {error || 'We could not verify this offer link. Please reach out to our Talent Acquisition team.'}
          </p>
          <a
            href="mailto:hr@adyapan.com"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-sm transition-all"
          >
            <HelpCircle className="w-4 h-4" /> Contact HR Team
          </a>
        </div>
      </div>
    );
  }

  const formattedJoiningDate = new Date(offerData.trainingStartDate || offerData.joiningDate).toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between py-8 px-4 sm:px-6">
      {/* Top Navbar */}
      <header className="max-w-4xl w-full mx-auto flex items-center justify-between pb-6 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-amber-500 to-amber-600 flex items-center justify-center text-slate-950 font-black text-xl shadow-lg shadow-amber-500/20">
            A
          </div>
          <div>
            <span className="font-extrabold text-lg text-white tracking-tight">Adyapan Edutech</span>
            <span className="block text-[11px] font-semibold text-amber-400 uppercase tracking-widest">Offer Acceptance Portal</span>
          </div>
        </div>

        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold">
          <ShieldCheck className="w-4 h-4" />
          <span>Secure Cryptographic Token</span>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-3xl w-full mx-auto my-8">
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-10 shadow-2xl relative overflow-hidden">
          {/* Top Decorative Glow */}
          <div className="absolute -top-24 -right-24 w-60 h-60 bg-amber-500/10 rounded-full blur-3xl pointer-events-none"></div>

          {/* Banner Header */}
          <div className="text-center pb-8 border-b border-slate-800">
            <div className="w-16 h-16 rounded-3xl bg-gradient-to-tr from-amber-500 to-amber-600 text-slate-950 flex items-center justify-center mx-auto mb-4 shadow-xl shadow-amber-500/20">
              <Award className="w-8 h-8" />
            </div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold uppercase tracking-wider mb-2">
              <Sparkles className="w-3.5 h-3.5" />
              Official Employment Offer
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-white">
              Congratulations, {offerData.candidateName}!
            </h1>
            <p className="text-slate-400 text-sm mt-2 max-w-lg mx-auto leading-relaxed">
              We are thrilled to extend an official employment offer for the position of{' '}
              <strong className="text-amber-400 font-bold">{offerData.jobTitle}</strong> at Adyapan Edutech Pvt. Ltd.
            </p>
          </div>

          {/* Key Offer Details Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 my-8">
            <div className="p-5 rounded-2xl bg-slate-950/60 border border-slate-800/80 text-center">
              <DollarSign className="w-6 h-6 text-amber-400 mx-auto mb-2" />
              <span className="text-xs font-medium text-slate-400 uppercase tracking-wider block">Compensation</span>
              <p className="text-base font-bold text-white mt-1">{offerData.stipend || 'INR 20,000/- Per Month'}</p>
            </div>

            <div className="p-5 rounded-2xl bg-slate-950/60 border border-slate-800/80 text-center">
              <Calendar className="w-6 h-6 text-amber-400 mx-auto mb-2" />
              <span className="text-xs font-medium text-slate-400 uppercase tracking-wider block">Joining Date</span>
              <p className="text-base font-bold text-white mt-1">{formattedJoiningDate}</p>
            </div>

            <div className="p-5 rounded-2xl bg-slate-950/60 border border-slate-800/80 text-center">
              <MapPin className="w-6 h-6 text-amber-400 mx-auto mb-2" />
              <span className="text-xs font-medium text-slate-400 uppercase tracking-wider block">Work Location</span>
              <p className="text-base font-bold text-white mt-1">{offerData.location || 'Hyderabad / Hybrid'}</p>
            </div>
          </div>

          {/* Acceptance Action State */}
          {isAccepted ? (
            <div className="p-8 rounded-3xl bg-emerald-950/40 border border-emerald-500/30 text-center my-6 shadow-xl">
              <div className="w-14 h-14 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto mb-4">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h3 className="text-2xl font-extrabold text-white mb-1">Offer Accepted!</h3>
              <p className="text-emerald-300 text-sm max-w-md mx-auto mb-4">
                Thank you for accepting your offer on{' '}
                <strong>{acceptedTimestamp ? new Date(acceptedTimestamp).toLocaleDateString() : 'today'}</strong>. We are excited to welcome you to our team!
              </p>
              <div className="flex flex-wrap items-center justify-center gap-3 mt-4">
                <button
                  onClick={handleDownloadPdf}
                  disabled={downloadingPdf}
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-sm transition-all"
                >
                  <Download className="w-4 h-4" /> Download PDF Offer Letter
                </button>
              </div>
            </div>
          ) : isRejected ? (
            <div className="p-8 rounded-3xl bg-red-950/30 border border-red-500/30 text-center my-6 shadow-xl">
              <div className="w-14 h-14 rounded-2xl bg-red-500/20 text-red-400 flex items-center justify-center mx-auto mb-4">
                <AlertCircle className="w-8 h-8" />
              </div>
              <h3 className="text-2xl font-extrabold text-white mb-1">Offer Declined</h3>
              <p className="text-slate-300 text-sm max-w-md mx-auto mb-4">
                You have declined this employment offer. Our recruitment team has been notified. We wish you the best in your career pursuits.
              </p>
            </div>
          ) : (
            <div className="p-8 rounded-3xl bg-gradient-to-br from-amber-500/15 via-amber-600/5 to-transparent border border-amber-500/30 text-center my-6">
              <h3 className="text-xl font-extrabold text-white mb-2">Review & Confirm Your Decision</h3>
              <p className="text-slate-300 text-sm max-w-md mx-auto mb-6 leading-relaxed">
                By clicking accept below, you officially confirm your acceptance of employment with Adyapan Edutech Pvt. Ltd. under the terms specified in your official offer letter.
              </p>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <button
                  onClick={handleDownloadPdf}
                  disabled={downloadingPdf}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-sm transition-all border border-slate-700"
                >
                  <FileText className="w-4 h-4 text-amber-400" />
                  Download 4-Page PDF
                </button>

                <button
                  onClick={() => setDeclineModalOpen(true)}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl bg-red-950/40 hover:bg-red-900/50 text-red-300 hover:text-white font-bold text-sm transition-all border border-red-800/50"
                >
                  Decline Offer
                </button>

                <button
                  onClick={handleAcceptOffer}
                  disabled={accepting}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-2xl bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white font-extrabold text-base transition-all shadow-xl shadow-emerald-500/25 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50"
                >
                  {accepting ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Confirming Acceptance...
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-5 h-5" />
                      Accept Offer of Employment
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

          {/* Decline Confirmation Modal */}
          {declineModalOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4">
              <div className="max-w-md w-full bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl">
                <h3 className="text-lg font-bold text-white mb-2">Decline Employment Offer</h3>
                <p className="text-slate-400 text-sm mb-4">
                  Please let us know the reason for declining this offer (optional). This action cannot be undone.
                </p>
                <textarea
                  value={declineReason}
                  onChange={(e) => setDeclineReason(e.target.value)}
                  placeholder="e.g. Accepted another offer / Relocation / Salary expectations..."
                  rows={3}
                  className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 text-sm focus:outline-none focus:border-red-500 mb-5 resize-none"
                />
                <div className="flex items-center justify-end gap-3">
                  <button
                    onClick={() => setDeclineModalOpen(false)}
                    className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-sm font-semibold transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleDeclineOffer}
                    disabled={declining}
                    className="px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-sm font-bold transition-all disabled:opacity-50"
                  >
                    {declining ? 'Submitting...' : 'Confirm Decline'}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="text-center text-xs text-slate-600 py-4">
        &copy; {new Date().getFullYear()} Adyapan Edutech Pvt. Ltd. All rights reserved. Secure recruitment automation system.
      </footer>
    </div>
  );
};

export default SecureOfferPage;
