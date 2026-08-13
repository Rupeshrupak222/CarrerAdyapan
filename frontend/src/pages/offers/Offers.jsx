import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import DashboardLayout from '../../components/layout/DashboardLayout';
import AdyapanOfferGeneratorModal from '../../components/offers/AdyapanOfferGeneratorModal';
import { offerService } from '../../services/offerService';
import { candidateService } from '../../services/candidateService';
import { useTheme } from '../../context/ThemeContext';
import {
  getGlobalOfferTemplate,
  saveGlobalOfferTemplate,
  getStoredOffers,
  saveOffersList,
  syncUpdateOffer,
  getStoredCandidates
} from '../../utils/applicationStore';
import toast from 'react-hot-toast';

const Offers = () => {
  const [offers, setOffers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingOffer, setEditingOffer] = useState(null);
  const [showAdyapanModal, setShowAdyapanModal] = useState(false);
  const [selectedCandidateForAdyapan, setSelectedCandidateForAdyapan] = useState(null);
  
  const initialGlobalTemplate = getGlobalOfferTemplate();
  const [companyTemplate, setCompanyTemplate] = useState(initialGlobalTemplate.templateName);
  const [companyTemplateUrl, setCompanyTemplateUrl] = useState(initialGlobalTemplate.templateDataUrl);
  
  const { theme } = useTheme();
  const location = useLocation();

  const [formData, setFormData] = useState({
    candidateName: '',
    email: '',
    phone: '',
    jobTitle: '',
    salary: '',
    bonus: '',
    benefits: '',
    joiningDate: '',
    expirationDate: '',
    customTerms: '',
  });

  useEffect(() => {
    fetchOffers();
  }, [location.search]);

  const fetchOffers = async () => {
    try {
      const dbResponse = await offerService.getAllOffers().catch(() => null);
      const dbList = dbResponse?.offers || [];
      const localList = getStoredOffers();

      const combinedMap = new Map();
      const allOffers = [...localList, ...dbList];

      allOffers.forEach((o) => {
        if (!o || (!o.candidateName && !o.id)) return;

        // Primary key by normalized candidate name
        const key = o.candidateName ? o.candidateName.toLowerCase().trim().replace(/\s+/g, ' ') : o.id;

        if (!combinedMap.has(key)) {
          combinedMap.set(key, o);
        } else {
          const existing = combinedMap.get(key);

          const validEmail = (existing.email && !existing.email.includes('example.com'))
            ? existing.email
            : ((o.email && !o.email.includes('example.com')) ? o.email : (existing.email || o.email));

          const validSalary = (existing.stipend || existing.salary) && existing.salary !== 0 && existing.salary !== '0' && existing.salary !== '₹0'
            ? (existing.stipend || existing.salary)
            : (o.stipend || o.salary);

          combinedMap.set(key, {
            ...o,
            ...existing,
            id: existing.id || o.id,
            email: validEmail,
            candidateEmail: validEmail,
            salary: validSalary,
            stipend: existing.stipend || o.stipend || validSalary,
            postProbationCtc: existing.postProbationCtc || o.postProbationCtc,
            location: existing.location || o.location,
            trainingStartDate: existing.trainingStartDate || o.trainingStartDate || existing.joiningDate || o.joiningDate,
            joiningDate: existing.joiningDate || o.joiningDate || existing.trainingStartDate || o.trainingStartDate,
            trainingEndDate: existing.trainingEndDate || o.trainingEndDate,
            ojtStartDate: existing.ojtStartDate || o.ojtStartDate,
            ojtEndDate: existing.ojtEndDate || o.ojtEndDate,
            workTiming: existing.workTiming || o.workTiming,
            workingHours: existing.workingHours || o.workingHours,
            jobType: existing.jobType || o.jobType,
            hrEmail: existing.hrEmail || o.hrEmail,
            hrPhone: existing.hrPhone || o.hrPhone,
            companyWebsite: existing.companyWebsite || o.companyWebsite,
            hrManagerName: existing.hrManagerName || o.hrManagerName,
          });
        }
      });

      const sanitizeOfferTerms = (off) => {
        let terms = off.customTerms;
        if (typeof terms === 'string' && (terms.trim().startsWith('{') || terms.includes('"olPrefix"'))) {
          try {
            const parsed = JSON.parse(terms);
            terms = parsed.customTermsText || parsed.notes || '';
          } catch (e) {
            terms = '';
          }
        }
        return { ...off, customTerms: terms };
      };

      const merged = Array.from(combinedMap.values()).map(sanitizeOfferTerms);
      setOffers(merged);

      // Check if candidateId search param is passed (e.g. /offers?candidateId=cand-bda-1)
      const queryParams = new URLSearchParams(location.search);
      const targetCandidateId = queryParams.get('candidateId');
      if (targetCandidateId) {
        const found = merged.find((o) => o.candidateId === targetCandidateId || o.id === targetCandidateId);
        if (found) {
          handleOpenEditModal(found);
        } else {
          // Find in candidates store if not in offers list yet
          const candidateStore = getStoredCandidates();
          const cand = candidateStore.find((c) => c.id === targetCandidateId);
          if (cand) {
            const newOfferEntry = syncUpdateOffer({
              candidateId: cand.id,
              candidateName: `${cand.firstName} ${cand.lastName}`,
              email: cand.email,
              phone: cand.phone,
              jobTitle: cand.currentPosition || 'Business Development Associate (BDA)',
              salary: cand.offerDetails?.salary || 550000,
              bonus: cand.offerDetails?.bonus || 100000,
              joiningDate: cand.offerDetails?.joiningDate || '2026-09-01',
              expirationDate: cand.offerDetails?.expirationDate || '2026-08-30',
              customTerms: cand.offerDetails?.customTerms || 'Standard Adyapan Edutech employment terms apply.',
              benefits: cand.offerDetails?.benefits || ['Health Insurance', 'Performance Incentives'],
              status: cand.status === 'SHORTLISTED' ? 'READY_TO_SEND' : 'SENT',
            });
            setOffers(getStoredOffers());
            handleOpenEditModal(newOfferEntry);
          }
        }
      }
    } catch (error) {
      setOffers(getStoredOffers());
    } finally {
      setLoading(false);
    }
  };

  const handleSendEmail = async (offer) => {
    const candidateEmail = offer.email || offer.candidateEmail || `${offer.candidateName.toLowerCase().replace(/\s+/g, '.')}@example.com`;
    try {
      await offerService.sendEmail({
        olNo: offer.olNo || `ADP04${Math.floor(10 + Math.random() * 90)}`,
        offerDate: offer.offerDate || '14-May-2026',
        candidateName: offer.candidateName || 'Valued Candidate',
        candidateEmail,
        jobTitle: offer.jobTitle || 'COMMUNITY DEVELOPMENT INTERN',
        trainingStartDate: offer.trainingStartDate || offer.joiningDate || '25-May-2026',
        trainingEndDate: offer.trainingEndDate || '06-Jun-2026',
        ojtStartDate: offer.ojtStartDate || '07-Jun-2026',
        ojtEndDate: offer.ojtEndDate || '07-Dec-2026',
        location: offer.location || 'HYDERABAD',
        stipend: offer.stipend || (typeof offer.salary === 'number' ? `INR ${offer.salary}/-PerMonth` : offer.salary) || 'INR 20000/-PerMonth',
        incentives: offer.incentives || 'Up to 10,000/- INCENTIVES.',
        postProbationCtc: offer.postProbationCtc || 'Rs. 8 LPA ( 6 Fixed + 2 Variable )',
        reportingDate: offer.reportingDate || offer.joiningDate || '25-May-2026',
        workingHours: offer.workingHours || '9 Hours a day (Inc. Lunch Break).',
        workTiming: offer.workTiming || '11AM - 8 PM.',
        jobType: offer.jobType || 'Full Time Training',
        hrEmail: offer.hrEmail || 'hr@adyapan.com',
        hrPhone: offer.hrPhone || '8179124566',
        companyWebsite: offer.companyWebsite || 'www.adyapanschool.com',
        hrManagerName: offer.hrManagerName || 'HR MANAGER',
        ...offer,
      });
      syncUpdateOffer({ ...offer, status: 'SENT', email: candidateEmail });
      setOffers(getStoredOffers());
      toast.success(`Official 4-Page Adyapan Offer Letter dispatched via Resend to ${candidateEmail}! ✉️📄🎉`);
    } catch (e) {
      toast.error('Failed to send offer email');
    }
  };

  const handleDeleteOffer = async (offer) => {
    const name = offer.candidateName || 'this candidate';
    if (!window.confirm(`Delete offer for "${name}" permanently from DB, backend & frontend?`)) return;
    // Remove from DB
    if (offer.id) {
      try { await offerService.deleteOffer(offer.id); } catch (e) {}
    }
    // Remove from localStorage
    try {
      const stored = getStoredOffers().filter((o) => o.id !== offer.id && o.candidateName !== offer.candidateName);
      saveOffersList(stored);
    } catch (e) {}
    setOffers((prev) => prev.filter((o) => o.id !== offer.id && o.candidateName !== offer.candidateName));
    toast.success(`Offer for "${name}" deleted! 🗑️`);
  };

  const [viewingPdfOffer, setViewingPdfOffer] = useState(null);
  const [viewingPdfUrl, setViewingPdfUrl] = useState(null);

  const handleViewOfferPdf = async (offer) => {
    try {
      toast.loading(`Generating Candidate PDF Offer Letter for ${offer.candidateName}...`, { id: 'pdf-toast' });
      const globalTpl = getGlobalOfferTemplate();

      // Generate dynamic personalized PDF blob overlaying candidate name onto uploaded company template
      const blob = await offerService.generatePDF({
        olNo: offer.olNo || `ADP04${Math.floor(10 + Math.random() * 90)}`,
        offerDate: offer.offerDate || '14-May-2026',
        candidateName: offer.candidateName || 'Valued Candidate',
        jobTitle: offer.jobTitle || 'COMMUNITY DEVELOPMENT INTERN',
        trainingStartDate: offer.trainingStartDate || offer.joiningDate || '25-May-2026',
        trainingEndDate: offer.trainingEndDate || '06-Jun-2026',
        ojtStartDate: offer.ojtStartDate || '07-Jun-2026',
        ojtEndDate: offer.ojtEndDate || '07-Dec-2026',
        location: offer.location || 'HYDERABAD',
        stipend: offer.stipend || (typeof offer.salary === 'number' ? `INR ${offer.salary}/-PerMonth` : offer.salary) || 'INR 20000/-PerMonth',
        incentives: offer.incentives || 'Up to 10,000/- INCENTIVES.',
        postProbationCtc: offer.postProbationCtc || 'Rs. 8 LPA ( 6 Fixed + 2 Variable )',
        reportingDate: offer.reportingDate || offer.joiningDate || '25-May-2026',
        workingHours: offer.workingHours || '9 Hours a day (Inc. Lunch Break).',
        workTiming: offer.workTiming || '11AM - 8 PM.',
        jobType: offer.jobType || 'Full Time Training',
        hrEmail: offer.hrEmail || 'hr@adyapan.com',
        hrPhone: offer.hrPhone || '8179124566',
        companyWebsite: offer.companyWebsite || 'www.adyapanschool.com',
        hrManagerName: offer.hrManagerName || 'HR MANAGER',
        ...offer,
        companyTemplateName: globalTpl.templateName,
        templateDataUrl: globalTpl.templateDataUrl,
      });

      const pdfBlob = new Blob([blob], { type: 'application/pdf' });
      const targetPdfUrl = window.URL.createObjectURL(pdfBlob);

      setViewingPdfUrl(targetPdfUrl);
      setViewingPdfOffer(offer);

      toast.success(`Opening Candidate PDF Offer Letter for ${offer.candidateName}! 👁️📄`, { id: 'pdf-toast' });
    } catch (e) {
      toast.error('Failed to generate PDF offer letter preview', { id: 'pdf-toast' });
    }
  };

  const handleRejectCandidate = async (offer) => {
    const candidateEmail = offer.email || offer.candidateEmail || (offer.candidateName ? `${offer.candidateName.toLowerCase().replace(/\s+/g, '.')}@example.com` : 'dks241655@gmail.com');
    const updated = syncUpdateOffer({ ...offer, status: 'REJECTED', email: candidateEmail });
    setOffers(getStoredOffers());

    try {
      await candidateService.sendRejectionEmail({
        candidateName: offer.candidateName,
        candidateEmail,
        jobTitle: offer.jobTitle || 'Business Development Associate (BDA)',
      });
      toast.error(`Offer for ${offer.candidateName} marked as Rejected. Rejection email dispatched via Resend to ${candidateEmail}! ✉️❌`);
    } catch (e) {
      toast.error(`Offer for ${offer.candidateName} marked as Rejected.`);
    }
  };

  const handleTemplateUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setCompanyTemplate(file.name);

      const reader = new FileReader();
      reader.onload = (event) => {
        const dataUrl = event.target.result;
        setCompanyTemplateUrl(dataUrl);
        saveGlobalOfferTemplate(file.name, dataUrl);
        toast.success(`Global Company Offer Letter Template uploaded: "${file.name}" 📄`);

        // If a PDF is currently being viewed, refresh preview with new global template
        if (viewingPdfOffer) {
          handleViewOfferPdf(viewingPdfOffer);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleViewTemplate = async () => {
    const globalTpl = getGlobalOfferTemplate();
    if (globalTpl.templateDataUrl) {
      try {
        let blobUrl = globalTpl.templateDataUrl;
        if (globalTpl.templateDataUrl.startsWith('data:')) {
          const response = await fetch(globalTpl.templateDataUrl);
          const blob = await response.blob();
          blobUrl = URL.createObjectURL(blob);
        }

        const link = document.createElement('a');
        link.href = blobUrl;
        link.download = globalTpl.templateName || 'Company_Offer_Template.pdf';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        if (blobUrl.startsWith('blob:')) {
          setTimeout(() => URL.revokeObjectURL(blobUrl), 2000);
        }
        toast.success(`Downloaded Active Global Company Offer Letter Template: "${globalTpl.templateName}" 📄`);
      } catch (err) {
        toast.error('Failed to open template file');
      }
    } else {
      handleViewOfferPdf({
        candidateName: '[Company Standard Template]',
        jobTitle: 'Business Development Associate (BDA)',
        salary: 550000,
        bonus: 100000,
        joiningDate: '2026-09-01',
        expirationDate: '2026-08-30',
        customTerms: 'Standard Adyapan Edutech Corporate Offer Terms.',
      });
    }
  };

  const handleAddOffer = async (e) => {
    e.preventDefault();
    const candidateEmail = formData.email || `${formData.candidateName.toLowerCase().replace(/\s+/g, '.')}@example.com`;
    const globalTpl = getGlobalOfferTemplate();

    const newOffer = {
      id: `off-${Date.now()}`,
      candidateName: formData.candidateName,
      email: candidateEmail,
      phone: formData.phone || '+91 98765-43210',
      jobTitle: formData.jobTitle,
      salary: parseFloat(formData.salary) || 500000,
      bonus: parseFloat(formData.bonus) || 50000,
      joiningDate: formData.joiningDate,
      expirationDate: formData.expirationDate,
      status: 'SENT',
      templateName: globalTpl.templateName,
      benefits: formData.benefits ? formData.benefits.split(',').map((b) => b.trim()) : ['Health Insurance'],
      customTerms: formData.customTerms,
    };

    try {
      await offerService.sendEmail({
        candidateName: newOffer.candidateName,
        candidateEmail: newOffer.email,
        jobTitle: newOffer.jobTitle,
        salary: newOffer.salary,
        joiningDate: newOffer.joiningDate,
        companyTemplateName: globalTpl.templateName,
        templateDataUrl: globalTpl.templateDataUrl,
      });
    } catch (err) {
      toast.error('Offer saved locally but failed to send email.');
    }

    syncUpdateOffer(newOffer);
    setOffers(getStoredOffers());
    toast.success('Offer Letter created and approved! 🎉');
    setShowAddModal(false);
  };

  const getCleanTermsDisplay = (terms) => {
    if (!terms) return null;
    if (typeof terms === 'object' && terms !== null) {
      if (terms.customTermsText && typeof terms.customTermsText === 'string' && !terms.customTermsText.startsWith('{')) {
        return terms.customTermsText;
      }
      if (terms.notes && typeof terms.notes === 'string' && !terms.notes.startsWith('{')) {
        return terms.notes;
      }
      if (terms.customTerms && typeof terms.customTerms === 'string' && !terms.customTerms.startsWith('{')) {
        return terms.customTerms;
      }
      return null;
    }
    if (typeof terms === 'string') {
      const trimmed = terms.trim();
      if (trimmed.startsWith('{') || trimmed.startsWith('[') || trimmed.includes('"olPrefix"') || trimmed.includes('"olNo"')) {
        return null; // Hide system PDF JSON metadata completely
      }
      if (trimmed.length > 0 && !trimmed.toLowerCase().includes('standard adyapan')) {
        return trimmed;
      }
    }
    return null;
  };

  const formatDisplaySalary = (sal, stipend) => {
    if (stipend) return stipend;
    if (typeof sal === 'number' && sal > 0) return `₹${sal.toLocaleString()}`;
    if (typeof sal === 'string' && sal.length > 0) return sal;
    return 'INR 20000/-PerMonth';
  };

  const handleSaveEditedOffer = (e) => {
    e.preventDefault();
    if (!editingOffer) return;

    const offerToSave = {
      ...editingOffer,
      salary: parseFloat(editingOffer.salary) || 0,
      bonus: parseFloat(editingOffer.bonus) || 0,
      benefits: editingOffer.benefitsText ? editingOffer.benefitsText.split(',').map((b) => b.trim()) : editingOffer.benefits,
    };

    const savedOffer = syncUpdateOffer(offerToSave);
    const updatedList = getStoredOffers();
    setOffers(updatedList);

    toast.success(`Offer Letter for ${editingOffer.candidateName} updated successfully! ✏️`);

    if (viewingPdfOffer && (viewingPdfOffer.id === editingOffer.id || viewingPdfOffer.email === editingOffer.email)) {
      handleViewOfferPdf(savedOffer);
    }

    setEditingOffer(null);
  };


  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header Bar */}
        <div className={`p-6 rounded-3xl border transition-all flex flex-col md:flex-row md:items-center justify-between gap-4 relative overflow-hidden shadow-sm ${
          theme === 'dark' ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-amber-200/80 text-slate-900'
        }`}>
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500" />

          <div className="space-y-1.5 pt-1">
            <div className="inline-flex items-center gap-2 px-3 py-0.5 rounded-full text-xs font-semibold bg-amber-500/15 text-amber-700 dark:text-amber-300 border border-amber-500/30">
              📄 Adyapan Offer Letter Management
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
              Offer Letters & Hired Candidates
            </h1>
            <p className="text-xs text-slate-600 dark:text-slate-300 font-normal">
              Manage hired candidates, edit salary terms, upload official company offer letter templates, and dispatch offer letters.
            </p>
          </div>
        </div>

        {/* Global Company Offer Letter Template Header Banner */}
        <div className={`p-6 rounded-3xl border shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4 ${
          theme === 'dark' ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-amber-200/80 text-slate-900'
        }`}>
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-2xl bg-amber-500/15 text-amber-600 dark:text-amber-400 text-xl flex items-center justify-center border border-amber-500/30 shadow-sm shrink-0">
              📄
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-bold">Active Global Company Offer Letter Template</h2>
                <span className="px-2.5 py-0.5 text-xs font-semibold bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 rounded-full border border-emerald-500/30">
                  Active
                </span>
              </div>
              <p className="text-xs font-normal text-slate-600 dark:text-slate-300 mt-0.5">
                Uploaded File: <strong className="text-amber-600 dark:text-amber-400 font-bold">{companyTemplate}</strong>
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={handleViewTemplate}
              className={`px-3.5 py-2 text-xs font-semibold rounded-xl border transition-all flex items-center gap-1.5 ${
                theme === 'dark' ? 'bg-slate-950 text-slate-200 border-slate-800' : 'bg-slate-100 text-slate-700 border-slate-200'
              }`}
              title="Click to view or download the active global company offer letter template"
            >
              <span>👁️</span> View / Download Active Template
            </button>

            <label className="cursor-pointer px-4 py-2 text-xs font-bold text-white bg-amber-500 hover:bg-amber-600 rounded-xl shadow-sm transition-all flex items-center gap-1.5">
              <span>📤</span> Upload / Replace Template (PDF/DOCX)
              <input
                type="file"
                accept=".pdf,.docx,.doc"
                onChange={handleTemplateUpload}
                className="hidden"
              />
            </label>
          </div>
        </div>

        {/* Unified Candidates Offer Cards List */}
        <div className="space-y-4">
          {offers.map((offer) => (
            <div
              key={offer.id}
              className={`p-6 rounded-3xl border shadow-sm hover:shadow-md transition-all flex flex-col lg:flex-row lg:items-center justify-between gap-5 relative overflow-hidden ${
                theme === 'dark' ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-amber-200/80 text-slate-900'
              }`}
            >
              <div className="space-y-3 flex-1">
                {/* Header Pills: Job Role & Status */}
                <div className="flex flex-wrap items-center gap-2.5">
                  <span className="px-3 py-0.5 text-xs font-semibold rounded-full bg-amber-500/15 text-amber-800 dark:text-amber-300 border border-amber-500/30">
                    🎓 {offer.jobTitle || 'Student / Fresher'}
                  </span>

                  <span
                    className={`px-3 py-0.5 text-xs font-bold rounded-full border ${
                      offer.status === 'ACCEPTED'
                        ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800'
                        : offer.status === 'SENT'
                        ? 'bg-blue-100 text-blue-800 dark:bg-blue-950/60 dark:text-blue-300 border-blue-300 dark:border-blue-800'
                        : offer.status === 'REJECTED'
                        ? 'bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300 border-rose-300 dark:border-rose-800'
                        : 'bg-orange-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 border-amber-300 dark:border-amber-800'
                    }`}
                  >
                    ● Status: {offer.status}
                  </span>
                </div>

                {/* Candidate Name & Contact */}
                <div className="flex items-center gap-3">
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white tracking-tight">{offer.candidateName}</h3>
                  <span className="text-xs font-normal text-slate-600 dark:text-slate-300">
                    (📧 {offer.email || offer.candidateEmail || 'candidate@example.com'})
                  </span>
                </div>

                {/* Compensation & Joining Date Grid */}
                <div className="flex flex-wrap items-center gap-2.5 text-xs font-semibold">
                  <span className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700">
                    💰 Fixed Base: <strong className="text-amber-700 dark:text-amber-300 font-bold">{formatDisplaySalary(offer.salary, offer.stipend)}</strong>
                  </span>
                  {offer.bonus > 0 && (
                    <span className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700">
                      🎁 Variable Bonus: <strong className="text-amber-700 dark:text-amber-300 font-bold">₹{offer.bonus?.toLocaleString('en-IN')}</strong>
                    </span>
                  )}
                  <span className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700">
                    📅 Joining Date: <strong className="text-slate-900 dark:text-white font-bold">{offer.trainingStartDate || offer.joiningDate || '25-Aug-2026'}</strong>
                  </span>
                </div>

                {/* Key Offer Details Pills Grid */}
                <div className="flex flex-wrap items-center gap-2 text-xs font-medium pt-0.5">
                  <span className="px-2.5 py-1 rounded-xl bg-amber-500/10 text-amber-800 dark:text-amber-300 border border-amber-500/20">
                    📍 Location: <strong className="font-semibold">{offer.location || 'HYDERABAD / Remote'}</strong>
                  </span>
                  <span className="px-2.5 py-1 rounded-xl bg-indigo-500/10 text-indigo-800 dark:text-indigo-300 border border-indigo-500/20">
                    ⏱️ Training: <strong className="font-semibold">{offer.duration || '6 MONTHS'} ({offer.jobType || 'Full Time'})</strong>
                  </span>
                  {offer.postProbationCtc && (
                    <span className="px-2.5 py-1 rounded-xl bg-emerald-500/10 text-emerald-800 dark:text-emerald-300 border border-emerald-500/20">
                      🚀 Post Probation: <strong className="font-semibold">{offer.postProbationCtc}</strong>
                    </span>
                  )}
                  {offer.workTiming && (
                    <span className="px-2.5 py-1 rounded-xl bg-blue-500/10 text-blue-800 dark:text-blue-300 border border-blue-500/20">
                      ⏰ Shift: <strong className="font-semibold">{offer.workTiming}</strong>
                    </span>
                  )}
                </div>

                {/* Benefits Badges */}
                <div className="flex flex-wrap gap-1.5">
                  {(offer.benefits || ['Health Insurance', 'Performance Incentives']).map((b) => (
                    <span
                      key={b}
                      className="px-2.5 py-1 text-xs font-normal rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700"
                    >
                      ✓ {b}
                    </span>
                  ))}
                </div>

                {/* Clean Recruiter Note if Present */}
                {getCleanTermsDisplay(offer.customTerms) && (
                  <p className="text-xs font-normal text-slate-600 dark:text-slate-300 pt-0.5">
                    📄 <strong className="font-semibold text-slate-800 dark:text-slate-200">Recruiter Note:</strong> {getCleanTermsDisplay(offer.customTerms)}
                  </p>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-2 shrink-0 border-t lg:border-t-0 pt-4 lg:pt-0 border-slate-200 dark:border-slate-800">
                {offer.status !== 'REJECTED' && (
                  <button
                    onClick={() => handleSendEmail(offer)}
                    className="px-3.5 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition-all shadow-sm flex items-center gap-1.5"
                    title="Send official 4-Page Adyapan Offer Letter to candidate email"
                  >
                    <span>✉️</span> Send Offer Letter
                  </button>
                )}

                <button
                  onClick={() => {
                    setSelectedCandidateForAdyapan(offer);
                    setShowAdyapanModal(true);
                  }}
                  className="px-4 py-2 text-xs font-bold text-white bg-amber-500 hover:bg-amber-600 rounded-xl transition-all flex items-center gap-1.5 shadow-sm"
                  title="View, customize, or print official 4-Page Adyapan Offer Letter PDF"
                >
                  <span>📄</span> View Offer Letter
                </button>

                {offer.status !== 'REJECTED' && (
                  <button
                    onClick={() => handleRejectCandidate(offer)}
                    className="px-3.5 py-2 text-xs font-semibold text-rose-700 dark:text-rose-300 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 hover:bg-rose-100 rounded-xl transition-all flex items-center gap-1.5"
                    title="Reject or mark offer as declined"
                  >
                    <span>❌</span> Reject
                  </button>
                )}

                <Link
                  to={offer.candidateId ? `/candidates/${offer.candidateId}` : `/offers/${offer.id}`}
                  className={`px-3.5 py-2 text-xs font-semibold rounded-xl border transition-all flex items-center gap-1.5 ${
                    theme === 'dark'
                      ? 'bg-slate-800 text-slate-200 border-slate-700 hover:bg-slate-700'
                      : 'bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-200'
                  }`}
                  title="View full candidate profile & compensation details"
                >
                  <span>👤</span> Candidate Details
                </Link>

                <button
                  onClick={() => handleDeleteOffer(offer)}
                  className="px-3 py-2 text-xs font-semibold text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 hover:bg-rose-100 rounded-xl transition-all flex items-center gap-1.5"
                  title="Delete this offer permanently from DB, backend & frontend"
                >
                  <span>🗑️</span> Delete Offer
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Add Offer Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-slate-950/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className={`rounded-2xl max-w-md w-full p-6 space-y-4 shadow-xl border ${theme === 'dark' ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-slate-200 text-slate-900'
            }`}>
            <h2 className="text-base font-bold border-b border-slate-100 dark:border-slate-800 pb-3">Create New Candidate Offer Letter</h2>
            <form onSubmit={handleAddOffer} className="space-y-3 text-xs font-medium">
              <div>
                <label className="block mb-1 font-semibold">Candidate Name *</label>
                <input
                  type="text"
                  required
                  value={formData.candidateName}
                  onChange={(e) => setFormData({ ...formData, candidateName: e.target.value })}
                  className={`w-full p-2.5 rounded-xl font-medium border ${theme === 'dark' ? 'bg-slate-950 border-slate-700 text-white' : 'bg-slate-50 border-slate-200 text-slate-800'
                    }`}
                />
              </div>

              <div>
                <label className="block mb-1 font-semibold">Candidate Email Address *</label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="rahul.s@example.com"
                  className={`w-full p-2.5 rounded-xl font-medium border ${theme === 'dark' ? 'bg-slate-950 border-slate-700 text-white' : 'bg-slate-50 border-slate-200 text-slate-800'
                    }`}
                />
              </div>

              <div>
                <label className="block mb-1 font-semibold">Job Role Title *</label>
                <input
                  type="text"
                  required
                  value={formData.jobTitle}
                  onChange={(e) => setFormData({ ...formData, jobTitle: e.target.value })}
                  className={`w-full p-2.5 rounded-xl font-medium border ${theme === 'dark' ? 'bg-slate-950 border-slate-700 text-white' : 'bg-slate-50 border-slate-200 text-slate-800'
                    }`}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block mb-1 font-semibold">Fixed Base Salary (₹) *</label>
                  <input
                    type="number"
                    required
                    value={formData.salary}
                    onChange={(e) => setFormData({ ...formData, salary: e.target.value })}
                    className={`w-full p-2.5 rounded-xl font-medium border ${theme === 'dark' ? 'bg-slate-950 border-slate-700 text-white' : 'bg-slate-50 border-slate-200 text-slate-800'
                      }`}
                  />
                </div>
                <div>
                  <label className="block mb-1 font-semibold">Variable Bonus (₹)</label>
                  <input
                    type="number"
                    value={formData.bonus}
                    onChange={(e) => setFormData({ ...formData, bonus: e.target.value })}
                    className={`w-full p-2.5 rounded-xl font-medium border ${theme === 'dark' ? 'bg-slate-950 border-slate-700 text-white' : 'bg-slate-50 border-slate-200 text-slate-800'
                      }`}
                  />
                </div>
              </div>

              <div>
                <label className="block mb-1 font-semibold">Benefits (comma-separated)</label>
                <input
                  type="text"
                  value={formData.benefits}
                  onChange={(e) => setFormData({ ...formData, benefits: e.target.value })}
                  className={`w-full p-2.5 rounded-xl font-medium border ${theme === 'dark' ? 'bg-slate-950 border-slate-700 text-white' : 'bg-slate-50 border-slate-200 text-slate-800'
                    }`}
                />
              </div>

              <div>
                <label className="block mb-1 font-semibold">Custom Terms / Probation Rules</label>
                <textarea
                  rows="2"
                  value={formData.customTerms}
                  onChange={(e) => setFormData({ ...formData, customTerms: e.target.value })}
                  className={`w-full p-2.5 rounded-xl font-medium border ${theme === 'dark' ? 'bg-slate-950 border-slate-700 text-white' : 'bg-slate-50 border-slate-200 text-slate-800'
                    }`}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block mb-1 font-semibold">Joining Date *</label>
                  <input
                    type="date"
                    required
                    value={formData.joiningDate}
                    onChange={(e) => setFormData({ ...formData, joiningDate: e.target.value })}
                    className={`w-full p-2.5 rounded-xl font-medium border ${theme === 'dark' ? 'bg-slate-950 border-slate-700 text-white' : 'bg-slate-50 border-slate-200 text-slate-800'
                      }`}
                  />
                </div>
                <div>
                  <label className="block mb-1 font-semibold">Expiration Date *</label>
                  <input
                    type="date"
                    required
                    value={formData.expirationDate}
                    onChange={(e) => setFormData({ ...formData, expirationDate: e.target.value })}
                    className={`w-full p-2.5 rounded-xl font-medium border ${theme === 'dark' ? 'bg-slate-950 border-slate-700 text-white' : 'bg-slate-50 border-slate-200 text-slate-800'
                      }`}
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button type="submit" className="flex-1 py-2.5 font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-sm">
                  Approve & Create Offer
                </button>
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className={`flex-1 py-2.5 font-medium rounded-xl border ${theme === 'dark' ? 'bg-slate-800 border-slate-700 text-slate-300' : 'bg-slate-100 border-slate-200 text-slate-700'
                    }`}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Offer Letter Modal */}
      {editingOffer && (
        <div className="fixed inset-0 bg-slate-950/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className={`rounded-2xl max-w-md w-full p-6 space-y-4 shadow-xl border ${theme === 'dark' ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-slate-200 text-slate-900'
            }`}>
            <h2 className="text-base font-bold border-b border-slate-100 dark:border-slate-800 pb-3 flex items-center justify-between">
              <span>✏️ Edit Offer Letter for {editingOffer.candidateName}</span>
              <button onClick={() => setEditingOffer(null)} className="text-slate-400 hover:text-slate-600">✕</button>
            </h2>

            <form onSubmit={handleSaveEditedOffer} className="space-y-3 text-xs font-medium">
              <div>
                <label className="block mb-1 font-semibold">Candidate Name</label>
                <input
                  type="text"
                  required
                  value={editingOffer.candidateName}
                  onChange={(e) => setEditingOffer({ ...editingOffer, candidateName: e.target.value })}
                  className={`w-full p-2.5 rounded-xl font-medium border ${theme === 'dark' ? 'bg-slate-950 border-slate-700 text-white' : 'bg-slate-50 border-slate-200 text-slate-800'
                    }`}
                />
              </div>

              <div>
                <label className="block mb-1 font-semibold">Candidate Email Address</label>
                <input
                  type="email"
                  required
                  value={editingOffer.email}
                  onChange={(e) => setEditingOffer({ ...editingOffer, email: e.target.value })}
                  className={`w-full p-2.5 rounded-xl font-medium border ${theme === 'dark' ? 'bg-slate-950 border-slate-700 text-white' : 'bg-slate-50 border-slate-200 text-slate-800'
                    }`}
                />
              </div>

              <div>
                <label className="block mb-1 font-semibold">Job Role Title</label>
                <input
                  type="text"
                  required
                  value={editingOffer.jobTitle}
                  onChange={(e) => setEditingOffer({ ...editingOffer, jobTitle: e.target.value })}
                  className={`w-full p-2.5 rounded-xl font-medium border ${theme === 'dark' ? 'bg-slate-950 border-slate-700 text-white' : 'bg-slate-50 border-slate-200 text-slate-800'
                    }`}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block mb-1 font-semibold">Fixed Base Salary (₹)</label>
                  <input
                    type="number"
                    required
                    value={editingOffer.salary}
                    onChange={(e) => setEditingOffer({ ...editingOffer, salary: e.target.value })}
                    className={`w-full p-2.5 rounded-xl font-medium border ${theme === 'dark' ? 'bg-slate-950 border-slate-700 text-white' : 'bg-slate-50 border-slate-200 text-slate-800'
                      }`}
                  />
                </div>
                <div>
                  <label className="block mb-1 font-semibold">Variable Bonus (₹)</label>
                  <input
                    type="number"
                    value={editingOffer.bonus}
                    onChange={(e) => setEditingOffer({ ...editingOffer, bonus: e.target.value })}
                    className={`w-full p-2.5 rounded-xl font-medium border ${theme === 'dark' ? 'bg-slate-950 border-slate-700 text-white' : 'bg-slate-50 border-slate-200 text-slate-800'
                      }`}
                  />
                </div>
              </div>

              <div>
                <label className="block mb-1 font-semibold">Benefits (comma-separated)</label>
                <input
                  type="text"
                  value={editingOffer.benefitsText}
                  onChange={(e) => setEditingOffer({ ...editingOffer, benefitsText: e.target.value })}
                  className={`w-full p-2.5 rounded-xl font-medium border ${theme === 'dark' ? 'bg-slate-950 border-slate-700 text-white' : 'bg-slate-50 border-slate-200 text-slate-800'
                    }`}
                />
              </div>

              <div>
                <label className="block mb-1 font-semibold">Custom Terms & Conditions</label>
                <textarea
                  rows="2"
                  value={editingOffer.customTerms || ''}
                  onChange={(e) => setEditingOffer({ ...editingOffer, customTerms: e.target.value })}
                  className={`w-full p-2.5 rounded-xl font-medium border ${theme === 'dark' ? 'bg-slate-950 border-slate-700 text-white' : 'bg-slate-50 border-slate-200 text-slate-800'
                    }`}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block mb-1 font-semibold">Joining Date</label>
                  <input
                    type="date"
                    required
                    value={editingOffer.joiningDate}
                    onChange={(e) => setEditingOffer({ ...editingOffer, joiningDate: e.target.value })}
                    className={`w-full p-2.5 rounded-xl font-medium border ${theme === 'dark' ? 'bg-slate-950 border-slate-700 text-white' : 'bg-slate-50 border-slate-200 text-slate-800'
                      }`}
                  />
                </div>
                <div>
                  <label className="block mb-1 font-semibold">Expiration Date</label>
                  <input
                    type="date"
                    required
                    value={editingOffer.expirationDate}
                    onChange={(e) => setEditingOffer({ ...editingOffer, expirationDate: e.target.value })}
                    className={`w-full p-2.5 rounded-xl font-medium border ${theme === 'dark' ? 'bg-slate-950 border-slate-700 text-white' : 'bg-slate-50 border-slate-200 text-slate-800'
                      }`}
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button type="submit" className="flex-1 py-2.5 font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-sm">
                  Save Changes
                </button>
                <button
                  type="button"
                  onClick={() => setEditingOffer(null)}
                  className={`flex-1 py-2.5 font-medium rounded-xl border ${theme === 'dark' ? 'bg-slate-800 border-slate-700 text-slate-300' : 'bg-slate-100 border-slate-200 text-slate-700'
                    }`}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Full-screen Candidate PDF Viewer Modal */}
      {viewingPdfOffer && viewingPdfUrl && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md flex items-center justify-center z-50 p-4">
          <div className={`rounded-2xl max-w-5xl w-full h-[90vh] p-6 space-y-4 shadow-2xl border flex flex-col ${
            theme === 'dark' ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-slate-200 text-slate-900'
          }`}>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-3 shrink-0">
              <div>
                <h2 className="text-base font-bold flex items-center gap-2">
                  <span>👁️ Candidate Official Offer Agreement: {viewingPdfOffer.candidateName}</span>
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                  Active Corporate Template: <strong className="text-indigo-600 dark:text-indigo-400">{companyTemplate}</strong>
                </p>
              </div>
              <div className="flex items-center gap-3">
                <a
                  href={viewingPdfUrl}
                  download={`${viewingPdfOffer.candidateName.replace(/\s+/g, '_')}_Official_Offer_Letter.pdf`}
                  className="px-3.5 py-1.5 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-sm transition-all flex items-center gap-1.5"
                >
                  <span>📥</span> Download Copy
                </a>
                <button onClick={() => setViewingPdfOffer(null)} className="text-slate-400 hover:text-slate-600 font-bold text-base px-2">✕</button>
              </div>
            </div>

            {/* Candidate Appointment Header Card */}
            <div className={`p-4 rounded-xl border space-y-2 text-xs font-medium shrink-0 ${
              theme === 'dark' ? 'bg-slate-950 border-slate-800' : 'bg-emerald-50/70 border-emerald-200 text-slate-900'
            }`}>
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-emerald-200 dark:border-slate-800 pb-2">
                <div>
                  <span className="text-[10px] font-bold text-emerald-700 dark:text-emerald-400 uppercase tracking-wider block">Candidate Name</span>
                  <span className="text-sm font-bold text-slate-900 dark:text-white">{viewingPdfOffer.candidateName}</span>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase block">Offered Position</span>
                  <span className="font-bold text-indigo-600 dark:text-indigo-400">{viewingPdfOffer.jobTitle}</span>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase block">Offered Base CTC</span>
                  <span className="font-bold text-emerald-600 dark:text-emerald-400">₹{viewingPdfOffer.salary?.toLocaleString()}</span>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase block">Target Joining Date</span>
                  <span className="font-bold text-slate-800 dark:text-slate-200">{viewingPdfOffer.joiningDate}</span>
                </div>
              </div>

              {viewingPdfOffer.customTerms && (
                <p className="text-slate-700 dark:text-slate-300 italic pt-1">
                  <strong>📝 Customized Agreement Terms:</strong> {viewingPdfOffer.customTerms}
                </p>
              )}
            </div>

            {/* Embedded Active Company Offer Template PDF */}
            <div className="flex-1 w-full h-full rounded-xl overflow-hidden border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-950 shadow-inner">
              <iframe
                src={viewingPdfUrl}
                className="w-full h-full rounded-xl"
                title={`Candidate PDF Offer Letter Preview - ${viewingPdfOffer.candidateName}`}
              />
            </div>
          </div>
        </div>
      )}

      {/* Adyapan Official 4-Page Offer Letter Generator Modal */}
      <AdyapanOfferGeneratorModal
        isOpen={showAdyapanModal}
        onClose={() => setShowAdyapanModal(false)}
        initialCandidate={selectedCandidateForAdyapan}
        onOfferSaved={fetchOffers}
      />
    </DashboardLayout>
  );
};

export default Offers;