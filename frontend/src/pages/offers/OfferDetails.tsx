import React, { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import DashboardLayout from '../../components/layout/DashboardLayout';
import BackButton from '../../components/common/BackButton';
import AdyapanOfferDocument from '../../components/offers/AdyapanOfferDocument';
import AdyapanOfferGeneratorModal from '../../components/offers/AdyapanOfferGeneratorModal';
import { offerService } from '../../services/offerService';
import { getGlobalOfferTemplate, getStoredOffers, getStoredCandidates } from '../../utils/applicationStore';
import { useTheme } from '../../context/ThemeContext';
import { toast } from 'react-hot-toast';

const OfferDetails = () => {
  const { id } = useParams();
  const [offer, setOffer] = useState<any | null>(null);
  const [sendingEmail, setSendingEmail] = useState(false);
  const [showAdyapanModal, setShowAdyapanModal] = useState(false);
  const [activeTab, setActiveTab] = useState('adyapan4page'); // 'adyapan4page' or 'summary'
  const { theme } = useTheme();

  useEffect(() => {
    loadOfferData();
  }, [id]);

  const loadOfferData = async () => {
    try {
      const dbRes = await offerService.getAllOffers().catch(() => null);
      const dbOffers = dbRes?.offers || [];
      const localOffers = getStoredOffers();
      const allOffers = [...localOffers, ...dbOffers];

      const decodedId = decodeURIComponent(id || '').toLowerCase().trim();

      let found = allOffers.find(
        (o) =>
          o &&
          (o.id === id ||
            o.candidateId === id ||
            (o.email && o.email.toLowerCase().trim() === decodedId) ||
            (o.candidateEmail && o.candidateEmail.toLowerCase().trim() === decodedId) ||
            (o.candidateName && o.candidateName.toLowerCase().trim() === decodedId))
      );

      if (found) {
        setOffer(found);
        return;
      }

      // Check candidates store
      const localCandidates = getStoredCandidates();
      const candMatch = localCandidates.find(
        (c) =>
          c &&
          (c.id === id ||
            c.email?.toLowerCase().trim() === decodedId ||
            `${c.firstName || ''} ${c.lastName || ''}`.trim().toLowerCase() === decodedId)
      );

      if (candMatch) {
        setOffer({
          id: candMatch.id,
          candidateId: candMatch.id,
          candidateName: `${candMatch.firstName || ''} ${candMatch.lastName || ''}`.trim() || 'Candidate Name',
          candidateEmail: candMatch.email || 'candidate@example.com',
          jobTitle: (candMatch as any).currentPosition || (candMatch as any).jobTitle || 'Senior Business Development Associate',
          salary: candMatch.offerDetails?.salary || (candMatch as any).salary || 'INR 20000/-PerMonth',
          stipend: candMatch.offerDetails?.stipend || 'INR 20000/-PerMonth',
          bonus: candMatch.offerDetails?.bonus || 100000,
          joiningDate: candMatch.offerDetails?.joiningDate || (candMatch as any).trainingStartDate || '2026-09-01',
          expirationDate: candMatch.offerDetails?.expirationDate || '2026-08-30',
          status: candMatch.status || 'READY_TO_SEND',
          benefits: candMatch.offerDetails?.benefits || ['Health Insurance', 'Performance Incentives', 'Learning Allowance'],
          customTerms: candMatch.offerDetails?.customTerms || 'Standard Adyapan Edutech Terms.',
        });
        return;
      }

      // If first offer exists, default to first offer
      if (allOffers.length > 0) {
        setOffer(allOffers[0]);
      }
    } catch (err) {
      console.warn('Failed to load offer details:', err);
    }
  };

  const handleSendEmail = async () => {
    if (!offer) return;
    setSendingEmail(true);
    const globalTpl = getGlobalOfferTemplate();
    try {
      await offerService.sendEmail({
        candidateName: offer.candidateName,
        candidateEmail: offer.candidateEmail || offer.email,
        jobTitle: offer.jobTitle,
        salary: offer.salary,
        joiningDate: offer.joiningDate,
        companyTemplateName: globalTpl.templateName,
        templateDataUrl: globalTpl.templateDataUrl,
      });
      toast.success(`Official Offer Letter email dispatched via Resend to ${offer.candidateEmail || offer.email}! `);
    } catch (e) {
      toast.error('Failed to send offer email');
    } finally {
      setSendingEmail(false);
    }
  };

  if (!offer) {
    return (
      <DashboardLayout>
        <div className="p-8 text-center">
          <p className="text-slate-500">Loading offer details...</p>
        </div>
      </DashboardLayout>
    );
  }

  const globalTpl = getGlobalOfferTemplate();
  const candEmail = offer.candidateEmail || offer.email || 'N/A';
  const benefitsList = Array.isArray(offer.benefits) ? offer.benefits : ['Health Insurance', 'Performance Bonus'];

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className={`p-6 rounded-3xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative overflow-hidden shadow-sm ${
          theme === 'dark' ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-slate-200 text-slate-900'
        }`}>

          <div className="space-y-1.5 pt-1">
            <BackButton label="Back to Offers & Agreements" to="/offers" />
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
              Offer Letter: {offer.candidateName}
            </h1>
            <p className="text-xs text-slate-600 dark:text-slate-300 font-normal">
              {offer.jobTitle} • Active Corporate Template: <strong className="text-amber-600 dark:text-amber-400 font-bold">{globalTpl.templateName}</strong>
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <button
              onClick={() => setShowAdyapanModal(true)}
              className="px-4 py-2.5 text-xs font-bold text-white bg-amber-500 hover:bg-amber-600 rounded-xl shadow-sm transition-all flex items-center gap-2"
            >
              Adyapan 4-Page PDF Generator
            </button>

            <Link
              to={`/offers?candidateId=${offer.candidateId || offer.id}`}
              className={`px-3.5 py-2.5 text-xs font-semibold rounded-xl border transition-all ${
                theme === 'dark' ? 'bg-slate-950 text-slate-200 border-slate-800' : 'bg-slate-100 text-slate-700 border-slate-200'
              }`}
            >
              Edit Terms
            </Link>

            <button
              onClick={handleSendEmail}
              disabled={sendingEmail}
              className="flex items-center gap-2 px-4 py-2.5 text-xs font-bold text-white bg-amber-500 hover:bg-amber-600 rounded-xl shadow-sm transition-all disabled:opacity-50"
            >
              {sendingEmail ? 'Sending...' : 'Send Email'}
            </button>
          </div>
        </div>

        {/* Document View Switcher Tabs */}
        <div className="flex items-center gap-3 border-b border-slate-200 dark:border-slate-800 pb-1">
          <button
            onClick={() => setActiveTab('adyapan4page')}
            className={`px-4 py-2 text-xs font-bold rounded-t-xl transition-all ${
              activeTab === 'adyapan4page'
                ? 'bg-amber-500 text-slate-950 border-b-2 border-amber-600'
                : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            Official 4-Page Adyapan Offer Document
          </button>
          <button
            onClick={() => setActiveTab('summary')}
            className={`px-4 py-2 text-xs font-bold rounded-t-xl transition-all ${
              activeTab === 'summary'
                ? 'bg-blue-600 text-white border-b-2 border-blue-700'
                : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            Brief Package Summary
          </button>
        </div>

        {activeTab === 'adyapan4page' ? (
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl">
              <div className="flex items-center gap-3">
                <span className="text-2xl"></span>
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-amber-300">
                    Official SR'S ADYAPAN EDUTECH PRIVATE LIMITED 4-Page Offer Letter
                  </h3>
                  <p className="text-xs text-slate-600 dark:text-slate-400">
                    High-precision layout matching original Adyapan School PDF template. Click below to print or export as PDF.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowAdyapanModal(true)}
                className="px-4 py-2 text-xs font-bold text-white bg-amber-500 hover:bg-amber-600 rounded-xl shadow-sm transition-all"
              >
                 Print / Customize
              </button>
            </div>

            <div className="rounded-3xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-inner bg-slate-200 dark:bg-slate-950 p-6">
              <AdyapanOfferDocument
                data={{
                  candidateName: offer.candidateName,
                  jobTitle: offer.jobTitle || 'COMMUNITY DEVELOPMENT INTERN',
                  stipend: offer.salary ? `INR ${offer.salary}/-PerMonth` : 'INR 20000/-PerMonth',
                  trainingStartDate: offer.joiningDate || '25-May-2026',
                  reportingDate: offer.joiningDate || '25-May-2026',
                  hrEmail: candEmail || 'hr@adyapan.com',
                }}
              />
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main Offer Document Preview */}
            <div className={`lg:col-span-2 p-8 rounded-2xl border shadow-sm space-y-6 ${
              theme === 'dark' ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-slate-200 text-slate-900'
            }`}>
              <div className={`flex items-center justify-between border-b pb-4 ${
                theme === 'dark' ? 'border-slate-800' : 'border-slate-100'
              }`}>
                <div>
                  <h2 className="text-xl font-bold text-blue-600 dark:text-blue-400">OFFER OF EMPLOYMENT</h2>
                  <p className="text-xs text-slate-400 font-medium">Official Employment Agreement • Adyapan Edutech</p>
                </div>
                <span
                  className={`px-3 py-1 text-xs font-medium rounded-full border ${
                    offer.status === 'ACCEPTED'
                      ? 'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-200 border-slate-200 dark:border-slate-700'
                      : 'bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300 border-blue-200'
                  }`}
                >
                  Status: {offer.status || 'SENT'}
                </span>
              </div>

              <p className="text-xs text-slate-700 dark:text-slate-200 leading-relaxed font-medium">
                Dear <strong>{offer.candidateName}</strong>,
              </p>
              <p className="text-xs text-slate-700 dark:text-slate-200 leading-relaxed font-medium">
                We are pleased to extend an offer of employment for the position of <strong>{offer.jobTitle}</strong> at Adyapan Edutech Pvt. Ltd. 
                We were immensely impressed with your skills, professional experience, and target orientation during our evaluation process.
              </p>

              <div className={`p-5 rounded-2xl border space-y-3 ${
                theme === 'dark' ? 'bg-slate-950 border-slate-800' : 'bg-slate-50 border-slate-200'
              }`}>
                <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Compensation Breakdown</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <span className="text-xs text-slate-500 font-medium block">Fixed Base Salary</span>
                    <span className="text-lg font-bold text-slate-900 dark:text-white">₹{Number(offer.salary || 0).toLocaleString()} / yr</span>
                  </div>
                  <div>
                    <span className="text-xs text-slate-500 font-medium block">Variable Performance Bonus</span>
                    <span className="text-lg font-bold text-indigo-600 dark:text-indigo-400">₹{Number(offer.bonus || 0).toLocaleString()} / yr</span>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Benefits Included</h3>
                <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {benefitsList.map((b: string) => (
                    <li key={b} className={`text-xs font-medium flex items-center gap-2 p-2.5 rounded-xl border ${
                      theme === 'dark' ? 'bg-slate-950 border-slate-800 text-slate-200' : 'bg-slate-50 border-slate-200 text-slate-700'
                    }`}>
                      <span className="text-slate-500 font-bold shrink-0">•</span> {b}
                    </li>
                  ))}
                </ul>
              </div>

              {offer.customTerms && (
                <p className="text-xs text-slate-600 dark:text-slate-300 italic pt-2 border-t border-slate-100 dark:border-slate-800">
                  <strong> Terms:</strong> {offer.customTerms}
                </p>
              )}
            </div>

            {/* Right Info Sidebar */}
            <div className="space-y-6">
              <div className={`p-6 rounded-2xl border shadow-sm space-y-4 ${
                theme === 'dark' ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-slate-200 text-slate-900'
              }`}>
                <h3 className="text-sm font-bold border-b border-slate-100 dark:border-slate-800 pb-3">Offer Summary</h3>
                <div className="space-y-2 text-xs font-medium">
                  <p className="text-slate-600 dark:text-slate-300">Candidate Email: <strong className="text-slate-900 dark:text-white">{candEmail}</strong></p>
                  <p className="text-slate-600 dark:text-slate-300">Joining Date: <strong className="text-slate-900 dark:text-white">{offer.joiningDate}</strong></p>
                  <p className="text-slate-600 dark:text-slate-300">Offer Expiration: <strong className="text-slate-900 dark:text-white">{offer.expirationDate}</strong></p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Adyapan Generator Modal */}
      <AdyapanOfferGeneratorModal
        isOpen={showAdyapanModal}
        onClose={() => setShowAdyapanModal(false)}
        initialCandidate={offer}
      />
    </DashboardLayout>
  );
};

export default OfferDetails;

