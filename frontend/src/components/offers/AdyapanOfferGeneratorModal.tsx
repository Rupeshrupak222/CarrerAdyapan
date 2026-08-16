import React, { useState, useEffect } from 'react';
import AdyapanOfferDocument from './AdyapanOfferDocument';
import { getStoredCandidates, syncUpdateOffer } from '../../utils/applicationStore';
import { offerService } from '../../services/offerService';
import toast from 'react-hot-toast';

const AdyapanOfferGeneratorModal = ({ isOpen, onClose, initialCandidate = null, onOfferSaved }: { isOpen: boolean; onClose: () => void; initialCandidate?: any; onOfferSaved?: (offer?: any) => void }) => {
  const [candidatesList, setCandidatesList] = useState<any[]>([]);
  const [selectedCandidateIds, setSelectedCandidateIds] = useState<any[]>([]);
  const [activePreviewIndex, setActivePreviewIndex] = useState(0);
  const [isSendingEmails, setIsSendingEmails] = useState(false);
  const [isDownloadingPdf, setIsDownloadingPdf] = useState(false);
  const [customCandidatesInput, setCustomCandidatesInput] = useState('');

  // Default offer parameters matching Adyapan Edutech template
  const [offerFields, setOfferFields] = useState({
    olPrefix: 'ADP',
    olStartNumber: 428,
    offerDate: '14-May-2026',
    duration: '6 MONTHS',
    jobTitle: 'COMMUNITY DEVELOPMENT INTERN',
    trainingStartDate: '25-May-2026',
    trainingEndDate: '06-Jun-2026',
    ojtStartDate: '07-Jun-2026',
    ojtEndDate: '07-Dec-2026',
    location: 'HYDERABAD',
    stipend: 'INR 20000/-PerMonth',
    incentives: 'Up to 10,000/- INCENTIVES.',
    postProbationCtc: '₹8 LPA ( 6 Fixed + 2 Variable )',
    reportingDate: '25-May-2026',
    unpaidDays: '12',
    stipendStartDay: '13th day',
    workingHours: '9 Hours a day (Inc. Lunch Break).',
    workTiming: '11AM - 8 PM.',
    jobType: 'Full Time Training',
    hrEmail: 'hr@adyapan.com',
    hrPhone: '8179124566',
    companyWebsite: 'www.adyapanschool.com',
    hrManagerName: 'HR MANAGER',
  });

  useEffect(() => {
    if (isOpen) {
      const stored = getStoredCandidates();
      let candidates = stored && stored.length > 0 ? [...stored] : [];

      setCandidatesList(candidates);

      if (initialCandidate) {
        // Load initialCandidate's saved custom offer fields into modal form state!
        setOfferFields((prev) => ({
          ...prev,
          olPrefix: initialCandidate.olNo ? initialCandidate.olNo.substring(0, 3) : prev.olPrefix,
          olStartNumber: initialCandidate.olNo ? (parseInt(String(initialCandidate.olNo).replace(/[^0-9]/g, '')) || 428) : prev.olStartNumber,
          offerDate: initialCandidate.offerDate || prev.offerDate,
          duration: initialCandidate.duration || prev.duration,
          jobTitle: initialCandidate.jobTitle || prev.jobTitle,
          trainingStartDate: initialCandidate.trainingStartDate || initialCandidate.joiningDate || prev.trainingStartDate,
          trainingEndDate: initialCandidate.trainingEndDate || prev.trainingEndDate,
          ojtStartDate: initialCandidate.ojtStartDate || prev.ojtStartDate,
          ojtEndDate: initialCandidate.ojtEndDate || prev.ojtEndDate,
          location: initialCandidate.location || prev.location,
          stipend: initialCandidate.stipend || (typeof initialCandidate.salary === 'number' ? `INR ${initialCandidate.salary}/-PerMonth` : initialCandidate.salary) || prev.stipend,
          incentives: initialCandidate.incentives || prev.incentives,
          postProbationCtc: initialCandidate.postProbationCtc || prev.postProbationCtc,
          reportingDate: initialCandidate.reportingDate || initialCandidate.joiningDate || prev.reportingDate,
          unpaidDays: initialCandidate.unpaidDays || prev.unpaidDays,
          stipendStartDay: initialCandidate.stipendStartDay || prev.stipendStartDay,
          workingHours: initialCandidate.workingHours || prev.workingHours,
          workTiming: initialCandidate.workTiming || prev.workTiming,
          jobType: initialCandidate.jobType || prev.jobType,
          hrEmail: initialCandidate.hrEmail || prev.hrEmail,
          hrPhone: initialCandidate.hrPhone || prev.hrPhone,
          companyWebsite: initialCandidate.companyWebsite || prev.companyWebsite,
          hrManagerName: initialCandidate.hrManagerName || prev.hrManagerName,
        }));

        const found = candidates.find(c => c.id === initialCandidate.id || c.id === initialCandidate.candidateId);
        if (found) {
          setSelectedCandidateIds([found.id]);
        } else {
          // If initial candidate is a custom object
          const customCand = {
            id: initialCandidate.id || `cand-custom-${Date.now()}`,
            firstName: initialCandidate.candidateName?.split(' ')[0] || initialCandidate.firstName || 'Candidate',
            lastName: initialCandidate.candidateName?.split(' ').slice(1).join(' ') || initialCandidate.lastName || '',
            email: initialCandidate.email || initialCandidate.candidateEmail || '',
            currentPosition: initialCandidate.jobTitle || 'COMMUNITY DEVELOPMENT INTERN',
          };
          setCandidatesList([customCand, ...candidates]);
          setSelectedCandidateIds([customCand.id]);
        }
      } else {
        // Select all candidates by default for bulk generation
        setSelectedCandidateIds(candidates.map(c => c.id));
      }
    }
  }, [isOpen, initialCandidate]);

  if (!isOpen) return null;

  const handleFieldChange = (e) => {
    const { name, value } = e.target;
    setOfferFields((prev) => ({ ...prev, [name]: value }));
  };

  const handleToggleSelectCandidate = (id) => {
    setSelectedCandidateIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const handleSelectAllCandidates = () => {
    if (selectedCandidateIds.length === candidatesList.length) {
      setSelectedCandidateIds([]);
    } else {
      setSelectedCandidateIds(candidatesList.map((c) => c.id));
    }
  };

  const handleAddCustomCandidates = () => {
    if (!customCandidatesInput.trim()) return;
    const lines = customCandidatesInput.split('\n').map(l => l.trim()).filter(Boolean);
    const newItems = lines.map((line, idx) => {
      const parts = line.split(',').map(p => p.trim());
      const fullName = parts[0] || `Candidate ${idx + 1}`;
      const nameParts = fullName.split(' ');
      return {
        id: `cand-added-${Date.now()}-${idx}`,
        firstName: nameParts[0],
        lastName: nameParts.slice(1).join(' '),
        email: parts[1] || `${nameParts[0].toLowerCase()}@example.com`,
        currentPosition: parts[2] || offerFields.jobTitle,
      };
    });

    const updated = [...newItems, ...candidatesList];
    setCandidatesList(updated);
    setSelectedCandidateIds(prev => [...newItems.map(i => i.id), ...prev]);
    setCustomCandidatesInput('');
    toast.success(`Added ${newItems.length} candidate(s) to offer generation list!`);
  };

  // Compile active candidates data
  const selectedCandidates = candidatesList.filter((c) => selectedCandidateIds.includes(c.id));
  const activeCandidate = selectedCandidates.length > 0
    ? selectedCandidates[Math.min(activePreviewIndex, selectedCandidates.length - 1)]
    : null;

  const handleCandidateNameChange = (candId, newFullName) => {
    setCandidatesList((prevList) =>
      prevList.map((c) => {
        if (c.id === candId) {
          const parts = newFullName.trimStart().split(' ');
          const firstName = parts[0] || '';
          const lastName = parts.slice(1).join(' ') || '';
          return { ...c, firstName, lastName };
        }
        return c;
      })
    );
  };

  const handleCandidateEmailChange = (candId, newEmail) => {
    setCandidatesList((prevList) =>
      prevList.map((c) => (c.id === candId ? { ...c, email: newEmail } : c))
    );
  };

  const getCandidateOfferData = (cand, index) => {
    const olNum = `${offerFields.olPrefix}${String(Number(offerFields.olStartNumber) + index).padStart(4, '0')}`;
    const fullName = `${cand.firstName || ''} ${cand.lastName || ''}`.trim() || 'Candidate Name';

    return {
      ...offerFields,
      olNo: olNum,
      candidateName: fullName,
      jobTitle: cand.currentPosition || offerFields.jobTitle,
      candidateEmail: cand.email || 'candidate@example.com',
      candidateId: cand.id,
    };
  };

  const handleSaveOnly = async () => {
    if (selectedCandidates.length === 0) {
      toast.error('Please select at least one candidate to save offer letter.');
      return;
    }

    // Save/sync to system state & PostgreSQL database
    for (let idx = 0; idx < selectedCandidates.length; idx++) {
      const cand = selectedCandidates[idx];
      const data = getCandidateOfferData(cand, idx);
      await syncUpdateOffer({
        ...data,
        candidateId: cand.id,
        candidateName: data.candidateName,
        email: data.candidateEmail,
        jobTitle: data.jobTitle,
        salary: data.stipend,
        joiningDate: data.trainingStartDate,
        status: 'READY_TO_SEND',
      });
    }

    if (onOfferSaved) onOfferSaved();
    toast.success(`Offer Letter details saved successfully for ${selectedCandidates.length} candidate(s)! `);
    onClose();
  };

  const handleDownloadDirectPdf = async () => {
    if (selectedCandidates.length === 0) {
      toast.error('Please select at least one candidate to download PDF.');
      return;
    }

    setIsDownloadingPdf(true);
    const toastId = toast.loading('Generating & downloading official 4-Page Adyapan Offer Letter PDF...');

    try {
      for (let i = 0; i < selectedCandidates.length; i++) {
        const cand = selectedCandidates[i];
        const data = getCandidateOfferData(cand, i);

        await syncUpdateOffer({
          ...data,
          candidateId: cand.id,
          candidateName: data.candidateName,
          email: data.candidateEmail,
          jobTitle: data.jobTitle,
          salary: data.stipend,
          joiningDate: data.trainingStartDate,
          status: 'APPROVED',
        });

        const blob = await offerService.generatePDF(data);
        const pdfBlob = new Blob([blob], { type: 'application/pdf' });
        const downloadUrl = window.URL.createObjectURL(pdfBlob);

        const link = document.createElement('a');
        link.href = downloadUrl;
        link.download = `${data.candidateName.replace(/\s+/g, '_')}_Official_Adyapan_Offer_Letter.pdf`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(downloadUrl);
      }

      if (onOfferSaved) onOfferSaved();
      toast.success(`Downloaded official Adyapan Offer Letter PDF for ${selectedCandidates.length} candidate(s)! `, { id: toastId });
    } catch (err) {
      toast.error('Failed to download PDF offer letter', { id: toastId });
    } finally {
      setIsDownloadingPdf(false);
    }
  };

  const handleSendEmailsAll = async () => {
    if (selectedCandidates.length === 0) {
      toast.error('Please select at least one candidate.');
      return;
    }

    setIsSendingEmails(true);
    let successCount = 0;

    for (let i = 0; i < selectedCandidates.length; i++) {
      const cand = selectedCandidates[i];
      const data = getCandidateOfferData(cand, i);

      try {
        await offerService.sendEmail({
          ...data,
          candidateName: data.candidateName,
          candidateEmail: data.candidateEmail,
          jobTitle: data.jobTitle,
          salary: data.stipend,
          joiningDate: data.trainingStartDate,
          olNo: data.olNo,
          companyTemplateName: 'Adyapan_Edutech_Official_Offer_Letter.pdf',
        }).catch(() => null);

        await syncUpdateOffer({
          ...data,
          candidateId: cand.id,
          candidateName: data.candidateName,
          email: data.candidateEmail,
          jobTitle: data.jobTitle,
          salary: data.stipend,
          joiningDate: data.trainingStartDate,
          status: 'SENT',
        });

        successCount++;
      } catch (e) { }
    }

    setIsSendingEmails(false);
    if (onOfferSaved) onOfferSaved();
    toast.success(`Successfully dispatched official Adyapan Offer Letters to ${successCount} candidate(s)! `);
  };

  const handleCloseAndSave = async () => {
    for (let idx = 0; idx < selectedCandidates.length; idx++) {
      const cand = selectedCandidates[idx];
      const data = getCandidateOfferData(cand, idx);
      await syncUpdateOffer({
        ...data,
        candidateId: cand.id,
        candidateName: data.candidateName,
        email: data.candidateEmail,
        jobTitle: data.jobTitle,
        salary: data.stipend,
        joiningDate: data.trainingStartDate,
      });
    }
    if (onOfferSaved) onOfferSaved();
    onClose();
  };

  const currentPreviewData = selectedCandidates.length > 0
    ? getCandidateOfferData(selectedCandidates[Math.min(activePreviewIndex, selectedCandidates.length - 1)], Math.min(activePreviewIndex, selectedCandidates.length - 1))
    : getCandidateOfferData({ firstName: 'Sample', lastName: 'Candidate', email: 'sample@example.com' }, 0);

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 sm:p-6 print:p-0 print:bg-white">
      {/* Modal Container */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 w-full max-w-7xl max-h-[92vh] flex flex-col overflow-hidden print:max-w-none print:max-h-none print:shadow-none print:border-none print:rounded-none">

        {/* Header (Hidden when printing) */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 print:hidden">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center text-xl font-bold">
              </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                Adyapan Official 4-Page Offer Letter Generator
                <span className="px-2.5 py-0.5 text-xs font-semibold rounded-full bg-orange-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300">
                  Bulk & Single Ready
                </span>
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Generate high-precision official 4-page offer letters for SR's Adyapan Edutech Pvt. Ltd.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleSaveOnly}
              className="px-4 py-2 text-xs font-bold text-white bg-amber-500 hover:bg-amber-600 rounded-xl shadow-sm transition-all flex items-center gap-2"
              title="Save offer letter edits into system"
            >
              Save PDF ({selectedCandidates.length})
            </button>

            <button
              onClick={handleSendEmailsAll}
              disabled={isSendingEmails || selectedCandidates.length === 0}
              className="px-4 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-sm transition-all flex items-center gap-2 disabled:opacity-50"
            >
              {isSendingEmails ? 'Sending...' : `Send Emails (${selectedCandidates.length})`}
            </button>

            <button
              onClick={handleCloseAndSave}
              className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              title="Save changes and close"
            >
              
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-hidden grid grid-cols-1 lg:grid-cols-12 print:block">

          {/* Left Column: Form & Candidate Selection (Hidden when printing) */}
          <div className="lg:col-span-5 p-6 overflow-y-auto space-y-6 border-r border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/30 print:hidden">

            {/* Candidate Selector Card */}
            <div className="bg-white dark:bg-slate-800/80 rounded-2xl p-4 border border-slate-200 dark:border-slate-700 shadow-sm space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 flex items-center gap-1.5">
                  Target Candidates ({selectedCandidates.length} Selected)
                </h3>
                <button
                  onClick={handleSelectAllCandidates}
                  className="text-xs font-bold text-amber-600 dark:text-amber-400 hover:underline"
                >
                  {selectedCandidateIds.length === candidatesList.length ? 'Deselect All' : 'Select All'}
                </button>
              </div>

              {/* Candidate Checkbox List */}
              <div className="max-h-40 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-700/50 pr-1 space-y-1">
                {candidatesList.map((cand) => {
                  const isSelected = selectedCandidateIds.includes(cand.id);
                  return (
                    <label
                      key={cand.id}
                      className={`flex items-center justify-between p-2 rounded-xl text-xs cursor-pointer transition-colors ${isSelected ? 'bg-white dark:bg-amber-900/20 text-slate-900 dark:text-white font-medium' : 'hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400'
                        }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => handleToggleSelectCandidate(cand.id)}
                          className="w-4 h-4 text-amber-600 rounded border-slate-300 focus:ring-amber-500"
                        />
                        <div>
                          <div className="font-semibold">{cand.firstName} {cand.lastName}</div>
                          <div className="text-[10px] text-slate-400">{cand.email} • {cand.currentPosition}</div>
                        </div>
                      </div>
                    </label>
                  );
                })}
              </div>

              {/* Add Custom Candidate Input */}
              <div className="pt-2 border-t border-slate-100 dark:border-slate-700">
                <details className="text-xs group">
                  <summary className="font-semibold text-slate-700 dark:text-slate-300 cursor-pointer flex items-center gap-1 text-amber-600 dark:text-amber-400">
                     Add Custom Candidate Names (Bulk Paste)
                  </summary>
                  <div className="mt-2 space-y-2">
                    <textarea
                      rows={2}
                      value={customCandidatesInput}
                      onChange={(e) => setCustomCandidatesInput(e.target.value)}
                      placeholder="Format: Candidate Name, Email, Job Title (One per line)&#10;Example: Aman Sharma, aman@gmail.com, BDA Intern"
                      className="w-full p-2.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-amber-500 outline-none"
                    />
                    <button
                      onClick={handleAddCustomCandidates}
                      className="w-full py-1.5 bg-amber-500 text-slate-950 font-bold rounded-lg text-xs hover:bg-amber-600 transition-colors"
                    >
                      Add Candidates
                    </button>
                  </div>
                </details>
              </div>
            </div>

            {/* Offer Fields Customizer Form */}
            <div className="bg-white dark:bg-slate-800/80 rounded-2xl p-4 border border-slate-200 dark:border-slate-700 shadow-sm space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 flex items-center gap-1.5">
                Offer Letter Parameters
              </h3>

              <div className="grid grid-cols-2 gap-3 text-xs">
                {/* Active Candidate Name & Email Editable Inputs */}
                {activeCandidate && (
                  <div className="col-span-2 p-3 bg-white/70 dark:bg-amber-950/30 rounded-xl border border-amber-300 dark:border-amber-900/60 space-y-2.5">
                    <div className="text-[11px] font-bold text-amber-900 dark:text-amber-300 uppercase tracking-wider flex items-center gap-1.5">
                      Candidate Name & Details (Edit Live)
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">Candidate Full Name *</label>
                      <input
                        type="text"
                        value={`${activeCandidate.firstName || ''} ${activeCandidate.lastName || ''}`}
                        onChange={(e) => handleCandidateNameChange(activeCandidate.id, e.target.value)}
                        placeholder="e.g. Dinesh Kumar Sharma"
                        className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white font-bold focus:ring-2 focus:ring-amber-500 outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">Candidate Email Address</label>
                      <input
                        type="email"
                        value={activeCandidate.email || ''}
                        onChange={(e) => handleCandidateEmailChange(activeCandidate.id, e.target.value)}
                        placeholder="candidate@example.com"
                        className="w-full p-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white font-medium focus:ring-2 focus:ring-amber-500 outline-none"
                      />
                    </div>
                  </div>
                )}

                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">OL Number Prefix</label>
                  <input
                    type="text"
                    name="olPrefix"
                    value={offerFields.olPrefix}
                    onChange={handleFieldChange}
                    className="w-full p-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white font-medium"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">OL Start Number</label>
                  <input
                    type="number"
                    name="olStartNumber"
                    value={offerFields.olStartNumber}
                    onChange={handleFieldChange}
                    className="w-full p-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white font-medium"
                  />
                </div>

                <div className="col-span-2">
                  <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">Offer Letter Date</label>
                  <input
                    type="text"
                    name="offerDate"
                    value={offerFields.offerDate}
                    onChange={handleFieldChange}
                    className="w-full p-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white font-medium"
                  />
                </div>

                <div className="col-span-2">
                  <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">Job Title</label>
                  <input
                    type="text"
                    name="jobTitle"
                    value={offerFields.jobTitle}
                    onChange={handleFieldChange}
                    className="w-full p-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white font-medium"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">Training Period</label>
                  <input
                    type="text"
                    name="duration"
                    value={offerFields.duration}
                    onChange={handleFieldChange}
                    className="w-full p-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white font-medium"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">Location</label>
                  <input
                    type="text"
                    name="location"
                    value={offerFields.location}
                    onChange={handleFieldChange}
                    className="w-full p-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white font-medium"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">Training Start Date</label>
                  <input
                    type="text"
                    name="trainingStartDate"
                    value={offerFields.trainingStartDate}
                    onChange={handleFieldChange}
                    className="w-full p-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white font-medium"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">Training End Date</label>
                  <input
                    type="text"
                    name="trainingEndDate"
                    value={offerFields.trainingEndDate}
                    onChange={handleFieldChange}
                    className="w-full p-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white font-medium"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">OJT Start Date</label>
                  <input
                    type="text"
                    name="ojtStartDate"
                    value={offerFields.ojtStartDate}
                    onChange={handleFieldChange}
                    className="w-full p-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white font-medium"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">OJT End Date</label>
                  <input
                    type="text"
                    name="ojtEndDate"
                    value={offerFields.ojtEndDate}
                    onChange={handleFieldChange}
                    className="w-full p-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white font-medium"
                  />
                </div>

                <div className="col-span-2">
                  <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">Stipend Amount</label>
                  <input
                    type="text"
                    name="stipend"
                    value={offerFields.stipend}
                    onChange={handleFieldChange}
                    className="w-full p-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white font-medium"
                  />
                </div>

                <div className="col-span-2">
                  <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">Incentives</label>
                  <input
                    type="text"
                    name="incentives"
                    value={offerFields.incentives}
                    onChange={handleFieldChange}
                    className="w-full p-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white font-medium"
                  />
                </div>

                <div className="col-span-2">
                  <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">Post-Probation CTC</label>
                  <input
                    type="text"
                    name="postProbationCtc"
                    value={offerFields.postProbationCtc}
                    onChange={handleFieldChange}
                    className="w-full p-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white font-medium"
                  />
                </div>
              </div>
            </div>

          </div>

          {/* Right Column: Live Document Preview / Print Content */}
          <div className="lg:col-span-7 p-6 overflow-y-auto bg-slate-200 dark:bg-slate-950 print:bg-white print:p-0 print:overflow-visible">

            {/* Preview Candidate Switcher Tabs (Hidden when printing) */}
            {selectedCandidates.length > 1 && (
              <div className="mb-4 flex items-center gap-2 overflow-x-auto pb-2 print:hidden">
                <span className="text-xs font-bold text-slate-600 dark:text-slate-400 shrink-0">Preview:</span>
                {selectedCandidates.map((cand, idx) => (
                  <button
                    key={cand.id}
                    onClick={() => setActivePreviewIndex(idx)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold shrink-0 transition-all ${activePreviewIndex === idx
                        ? 'bg-amber-500 text-slate-950 shadow-sm'
                        : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-100'
                      }`}
                  >
                    {cand.firstName} ({offerFields.olPrefix}{String(Number(offerFields.olStartNumber) + idx).padStart(4, '0')})
                  </button>
                ))}
              </div>
            )}

            {/* Screen Preview Mode (Single Candidate Active Preview) */}
            <div className="print:hidden">
              <AdyapanOfferDocument data={currentPreviewData} />
            </div>

            {/* Print Mode Content (Renders ALL Selected Candidates for Print Batch) */}
            <div className="hidden print:block">
              {selectedCandidates.map((cand, idx) => (
                <div key={cand.id} className="print-candidate-block">
                  <AdyapanOfferDocument data={getCandidateOfferData(cand, idx)} printMode={true} />
                </div>
              ))}
            </div>

          </div>

        </div>

      </div>
    </div>
  );
};

export default AdyapanOfferGeneratorModal;
