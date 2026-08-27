import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import {
  X,
  Send,
  Users,
  CheckCircle2,
  AlertCircle,
  Clock,
  RotateCw,
  Sparkles,
  ShieldCheck,
  FileCheck,
  Layers,
  ArrowRight,
  Info,
  CheckSquare,
  Square,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { applicationService } from '../../services/applicationService';

interface BulkOfferModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  selectedCandidates?: any[];
}

export const BulkOfferModal: React.FC<BulkOfferModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  selectedCandidates = [],
}) => {
  const [step, setStep] = useState<'SETUP' | 'PREVIEW' | 'EXECUTING' | 'REPORT'>('SETUP');
  const [mode, setMode] = useState<'SELECTED' | 'RANGE'>('RANGE');
  const [loading, setLoading] = useState(false);

  // Range Inputs
  const [fromId, setFromId] = useState('CAND-001');
  const [toId, setToId] = useState('CAND-020');

  // Common Offer Details
  const [jobTitle, setJobTitle] = useState('COMMUNITY DEVELOPMENT INTERN');
  const [offerDate, setOfferDate] = useState(
    new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }).replace(/ /g, '-')
  );
  const [duration, setDuration] = useState('6 MONTHS');
  const [trainingStartDate, setTrainingStartDate] = useState('01-Sep-2026');
  const [trainingEndDate, setTrainingEndDate] = useState('15-Sep-2026');
  const [ojtStartDate, setOjtStartDate] = useState('16-Sep-2026');
  const [ojtEndDate, setOjtEndDate] = useState('16-Mar-2027');
  const [location, setLocation] = useState('HYDERABAD');
  const [stipend, setStipend] = useState('INR 20000/-PerMonth');
  const [incentives, setIncentives] = useState('Up to 10,000/- INCENTIVES.');
  const [postProbationCtc, setPostProbationCtc] = useState('₹8 LPA ( 6 Fixed + 2 Variable )');
  const [reportingDate, setReportingDate] = useState('01-Sep-2026');
  const [customTerms, setCustomTerms] = useState('');

  // Preview Data
  const [previewData, setPreviewData] = useState<{
    totalExpected: number;
    totalFound: number;
    eligibleCount: number;
    alreadyOfferedCount: number;
    ineligibleCount: number;
    candidates: any[];
  } | null>(null);

  // Execution Results
  const [executionResult, setExecutionResult] = useState<{
    totalProcessed: number;
    successCount: number;
    failedCount: number;
    results: any[];
  } | null>(null);

  useEffect(() => {
    if (isOpen) {
      if (selectedCandidates && selectedCandidates.length > 0) {
        setMode('SELECTED');
      } else {
        setMode('RANGE');
      }
      setStep('SETUP');
      setPreviewData(null);
      setExecutionResult(null);
    }
  }, [isOpen, selectedCandidates]);

  if (!isOpen) return null;

  const buildSelectedCandidateList = (apps: any[]) => {
    const list = apps.map((app) => {
      const cand = app.candidate || {};
      const candName = `${cand.firstName || ''} ${cand.lastName || ''}`.trim() || 'Candidate';
      const code = app.candidateCode || cand.candidateCode || app.id?.slice(0, 10) || 'APP-2026';

      const isAlreadyOffered = 
        app.status === 'OFFER_SENT' || 
        app.status === 'OFFER_ACCEPTED' || 
        app.status === 'OFFER_RELEASED' || 
        app.offer?.status === 'SENT' || 
        app.offer?.status === 'ACCEPTED';

      const isRejectedOrWithdrawn = 
        ['REJECTED', 'ROUND_1_REJECTED', 'ROUND_2_REJECTED', 'WITHDRAWN'].includes(app.status);

      const isFinalRoundCleared = 
        app.finalSelected === true || 
        app.managerApproved === true || 
        ['FINAL_ROUND', 'ROUND_2_SELECTED', 'FINAL_SELECTED'].includes(app.status) || 
        app.currentRound >= 2;

      const hasValidEmail = Boolean(cand.email && cand.email.includes('@') && !cand.email.includes('example.com'));

      let offerStatus: 'READY' | 'ALREADY_OFFERED' | 'INELIGIBLE' = 'INELIGIBLE';
      let reason = '';

      if (isAlreadyOffered) {
        offerStatus = 'ALREADY_OFFERED';
        reason = 'Offer already released / active';
      } else if (isRejectedOrWithdrawn) {
        offerStatus = 'INELIGIBLE';
        reason = `Candidate status is ${app.status}`;
      } else if (!hasValidEmail) {
        offerStatus = 'INELIGIBLE';
        reason = 'Missing or invalid candidate email address';
      } else if (isFinalRoundCleared) {
        offerStatus = 'READY';
        reason = 'Final round cleared & ready for offer';
      } else {
        offerStatus = 'INELIGIBLE';
        reason = 'Candidate has not cleared final round selection yet';
      }

      return {
        id: app.id,
        candidateId: app.candidateId,
        candidateCode: code,
        candidateName: candName,
        email: cand.email || 'N/A',
        jobTitle: app.job?.title || 'Open Position',
        currentStatus: app.status,
        offerStatus,
        reason,
      };
    });

    const eligibleCount = list.filter((c) => c.offerStatus === 'READY').length;
    const alreadyOfferedCount = list.filter((c) => c.offerStatus === 'ALREADY_OFFERED').length;
    const ineligibleCount = list.filter((c) => c.offerStatus === 'INELIGIBLE').length;

    return {
      totalExpected: apps.length,
      totalFound: apps.length,
      eligibleCount,
      alreadyOfferedCount,
      ineligibleCount,
      candidates: list,
    };
  };

  const handlePreview = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    if (mode === 'SELECTED') {
      if (!selectedCandidates || selectedCandidates.length === 0) {
        toast.error('No candidates selected.');
        return;
      }
      const data = buildSelectedCandidateList(selectedCandidates);
      setPreviewData(data);
      setStep('PREVIEW');
      toast.success(`Prepared ${data.totalFound} selected candidates (${data.eligibleCount} ready for offer)`);
      return;
    }

    // Range Mode
    if (!fromId.trim() || !toId.trim()) {
      toast.error('Please specify both From ID and To ID range.');
      return;
    }

    setLoading(true);
    const toastId = toast.loading('Verifying ID range and checking candidate eligibility...');
    try {
      const res = await applicationService.getBulkOfferRangePreview(fromId.trim(), toId.trim());
      if (res.success) {
        setPreviewData(res);
        setStep('PREVIEW');
        toast.success(`Found ${res.totalFound} candidates (${res.eligibleCount} eligible for offer)`, { id: toastId });
      } else {
        toast.error(res.message || 'Failed to fetch range preview', { id: toastId });
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || err.message || 'Error checking range', { id: toastId });
    } finally {
      setLoading(false);
    }
  };

  const handleExecuteBulkSend = async (candidateIdsToProcess?: string[]) => {
    setLoading(true);
    setStep('EXECUTING');
    const toastId = toast.loading('Generating individual PDFs and sending offer emails...');

    const commonOfferData = {
      offerDate,
      jobTitle,
      duration,
      joiningDate: trainingStartDate,
      trainingStartDate,
      trainingEndDate,
      ojtStartDate,
      ojtEndDate,
      location,
      stipend,
      incentives,
      postProbationCtc,
      reportingDate,
      customTerms,
      hrManagerName: 'HR MANAGER',
      hrEmail: 'hr@adyapan.com',
      hrPhone: '8179124566',
      companyWebsite: 'www.adyapanschool.com',
    };

    const targetCandidateIds = candidateIdsToProcess || (
      mode === 'SELECTED' && previewData
        ? previewData.candidates.filter((c) => c.offerStatus === 'READY').map((c) => c.id)
        : undefined
    );

    try {
      const res = await applicationService.executeBulkOfferSend({
        fromId: fromId.trim(),
        toId: toId.trim(),
        commonOfferData,
        candidateIdsToProcess: targetCandidateIds,
      });

      if (res.success) {
        setExecutionResult(res);
        setStep('REPORT');
        if (res.failedCount === 0) {
          toast.success(`Successfully sent offers to all ${res.successCount} candidates!`, { id: toastId });
        } else {
          toast.success(`Sent: ${res.successCount} successful, ${res.failedCount} failed`, { id: toastId });
        }
        onSuccess();
      } else {
        toast.error(res.message || 'Failed to complete bulk send', { id: toastId });
        setStep('PREVIEW');
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || err.message || 'Execution error', { id: toastId });
      setStep('PREVIEW');
    } finally {
      setLoading(false);
    }
  };

  const handleRetryFailedOnly = () => {
    if (!executionResult) return;
    const failedIds = executionResult.results
      .filter((r) => r.status === 'FAILED')
      .map((r) => r.id);

    if (failedIds.length === 0) {
      toast('No failed candidates to retry.');
      return;
    }
    handleExecuteBulkSend(failedIds);
  };

  const modalContent = (
    <div 
      className="fixed inset-0 z-[9999] overflow-y-auto bg-slate-950/75 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 animate-fadeIn"
      onClick={onClose}
    >
      <div 
        className="w-full max-w-4xl bg-white border border-slate-200 rounded-2xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden animate-scaleUp my-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 bg-gradient-to-r from-orange-50 to-amber-50 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-orange-500 to-amber-500 text-white flex items-center justify-center font-black shadow-md shadow-orange-500/20">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-slate-900">
                Bulk Offer Rollout by ID Range
              </h3>
              <p className="text-xs text-slate-500">
                Targeted batch release with individual 4-page PDFs, unique OL numbers, and email delivery
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {step === 'PREVIEW' && (
              <button
                type="button"
                onClick={() => setStep('SETUP')}
                className="px-3 py-1.5 rounded-lg bg-white hover:bg-slate-100 text-slate-700 font-bold text-xs border border-slate-300"
              >
                Back to Settings
              </button>
            )}
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Scrollable Modal Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-thin text-xs text-slate-700">
          {/* STEP 1: SETUP FORM */}
          {step === 'SETUP' && (
            <form onSubmit={handlePreview} className="space-y-5">
              {/* Selection Mode Toggle */}
              <div className="p-1 rounded-xl bg-slate-100 border border-slate-200 flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => setMode('SELECTED')}
                  disabled={!selectedCandidates || selectedCandidates.length === 0}
                  className={`flex-1 py-2 px-3 rounded-lg text-xs font-extrabold transition-all flex items-center justify-center gap-2 ${
                    mode === 'SELECTED'
                      ? 'bg-white text-orange-700 shadow-xs border border-orange-200'
                      : selectedCandidates && selectedCandidates.length > 0
                      ? 'text-slate-600 hover:text-slate-900 cursor-pointer'
                      : 'text-slate-400 cursor-not-allowed opacity-50'
                  }`}
                >
                  <CheckSquare className="w-3.5 h-3.5" />
                  <span>Selected Candidates ({selectedCandidates?.length || 0})</span>
                </button>

                <button
                  type="button"
                  onClick={() => setMode('RANGE')}
                  className={`flex-1 py-2 px-3 rounded-lg text-xs font-extrabold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                    mode === 'RANGE'
                      ? 'bg-white text-orange-700 shadow-xs border border-orange-200'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <Layers className="w-3.5 h-3.5" />
                  <span>By Candidate ID Range</span>
                </button>
              </div>

              {/* Mode 1: Selected Candidates Box */}
              {mode === 'SELECTED' && (
                <div className="p-4 rounded-xl bg-orange-500/5 border border-orange-200/80 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-orange-950 font-bold text-sm">
                      <Users className="w-4 h-4 text-orange-600" />
                      <span>Selected Candidates for Offer Rollout ({selectedCandidates.length})</span>
                    </div>
                    <span className="text-[11px] font-bold text-orange-700 bg-orange-100 px-2 py-0.5 rounded-full">
                      Manually Selected via Checkboxes
                    </span>
                  </div>

                  <div className="max-h-36 overflow-y-auto pr-1 space-y-1.5 scrollbar-thin">
                    {selectedCandidates.map((candApp, idx) => {
                      const cand = candApp.candidate || {};
                      const candName = `${cand.firstName || ''} ${cand.lastName || ''}`.trim() || 'Candidate';
                      const code = candApp.candidateCode || candApp.id?.slice(0, 10) || 'APP-2026';
                      return (
                        <div
                          key={candApp.id || idx}
                          className="flex items-center justify-between p-2 rounded-lg bg-white border border-slate-200 text-xs"
                        >
                          <div className="flex items-center gap-2">
                            <span className="font-mono font-bold text-slate-700">{code}</span>
                            <span className="font-bold text-slate-900">{candName}</span>
                            <span className="text-slate-400 font-mono text-[11px]">({cand.email || 'N/A'})</span>
                          </div>
                          <span className="text-[10px] font-semibold text-slate-600 bg-slate-100 px-2 py-0.5 rounded">
                            {candApp.job?.title || 'Open Position'}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Mode 2: ID Range Input Box */}
              {mode === 'RANGE' && (
                <div className="p-4 rounded-xl bg-orange-500/5 border border-orange-200/80 space-y-3">
                  <div className="flex items-center gap-2 text-orange-950 font-bold text-sm">
                    <Users className="w-4 h-4 text-orange-600" />
                    <span>1. Specify Candidate ID Range</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1">
                        From Candidate ID / Code <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={fromId}
                        onChange={(e) => setFromId(e.target.value)}
                        placeholder="e.g. CAND-001"
                        className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs font-mono font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-orange-500"
                        required={mode === 'RANGE'}
                      />
                      <span className="text-[10px] text-slate-500 mt-0.5 block">Starting ID in range</span>
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1">
                        To Candidate ID / Code <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={toId}
                        onChange={(e) => setToId(e.target.value)}
                        placeholder="e.g. CAND-020"
                        className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs font-mono font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-orange-500"
                        required={mode === 'RANGE'}
                      />
                      <span className="text-[10px] text-slate-500 mt-0.5 block">Ending ID in range</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Common Offer Parameters Form */}
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-slate-900 font-bold text-sm">
                    <FileCheck className="w-4 h-4 text-slate-700" />
                    <span>2. Common Offer Details (Applied to all candidates in batch)</span>
                  </div>
                  <span className="text-[11px] font-medium text-slate-500">
                    Each letter is individually personalized
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">Designation / Job Title</label>
                    <input
                      type="text"
                      value={jobTitle}
                      onChange={(e) => setJobTitle(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs text-slate-900 font-medium focus:ring-2 focus:ring-orange-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">Offer Release Date</label>
                    <input
                      type="text"
                      value={offerDate}
                      onChange={(e) => setOfferDate(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs text-slate-900 font-medium focus:ring-2 focus:ring-orange-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">Work Location</label>
                    <input
                      type="text"
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs text-slate-900 font-medium focus:ring-2 focus:ring-orange-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">Monthly Stipend</label>
                    <input
                      type="text"
                      value={stipend}
                      onChange={(e) => setStipend(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs text-slate-900 font-medium focus:ring-2 focus:ring-orange-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">Performance Incentives</label>
                    <input
                      type="text"
                      value={incentives}
                      onChange={(e) => setIncentives(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs text-slate-900 font-medium focus:ring-2 focus:ring-orange-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">Post-Probation CTC</label>
                    <input
                      type="text"
                      value={postProbationCtc}
                      onChange={(e) => setPostProbationCtc(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs text-slate-900 font-medium focus:ring-2 focus:ring-orange-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">Training Start Date</label>
                    <input
                      type="text"
                      value={trainingStartDate}
                      onChange={(e) => setTrainingStartDate(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs text-slate-900 font-medium focus:ring-2 focus:ring-orange-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">Training End Date</label>
                    <input
                      type="text"
                      value={trainingEndDate}
                      onChange={(e) => setTrainingEndDate(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs text-slate-900 font-medium focus:ring-2 focus:ring-orange-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">Internship Duration</label>
                    <input
                      type="text"
                      value={duration}
                      onChange={(e) => setDuration(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs text-slate-900 font-medium focus:ring-2 focus:ring-orange-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">OJT Start Date</label>
                    <input
                      type="text"
                      value={ojtStartDate}
                      onChange={(e) => setOjtStartDate(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs text-slate-900 font-medium focus:ring-2 focus:ring-orange-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">OJT End Date</label>
                    <input
                      type="text"
                      value={ojtEndDate}
                      onChange={(e) => setOjtEndDate(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs text-slate-900 font-medium focus:ring-2 focus:ring-orange-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">Reporting Date</label>
                    <input
                      type="text"
                      value={reportingDate}
                      onChange={(e) => setReportingDate(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs text-slate-900 font-medium focus:ring-2 focus:ring-orange-500"
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Safety & Duplicate Protection Notice */}
              <div className="p-3.5 rounded-xl bg-blue-50 border border-blue-200/80 flex items-start gap-3">
                <ShieldCheck className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
                <div className="text-xs text-blue-900">
                  <strong>Safe Verification & Duplicate Protection:</strong> Clicking "Check Range & Preview" will analyze every candidate in the specified range. Already offered or ineligible candidates will be clearly highlighted and protected from duplicate sends.
                </div>
              </div>

              {/* Action Button */}
              <div className="flex justify-end pt-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-extrabold text-xs shadow-md shadow-orange-500/25 transition-all disabled:opacity-50 cursor-pointer"
                >
                  <Sparkles className="w-4 h-4" />
                  {mode === 'SELECTED' ? 'Verify & Preview Selected Candidates' : 'Check Range & Preview Candidates'}
                </button>
              </div>
            </form>
          )}

          {/* STEP 2: PREVIEW BREAKDOWN & CONFIRMATION */}
          {step === 'PREVIEW' && previewData && (
            <div className="space-y-5">
              {/* Summary Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    {mode === 'SELECTED' ? 'Total Selected' : 'Total in Range'}
                  </span>
                  <p className="text-xl font-black text-slate-900 mt-1">{previewData.totalFound}</p>
                  <span className="text-[10px] text-slate-500 font-mono">
                    {mode === 'SELECTED' ? 'Checked Candidates' : `${fromId} → ${toId}`}
                  </span>
                </div>

                <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600">Eligible to Send</span>
                  <p className="text-xl font-black text-emerald-700 mt-1">{previewData.eligibleCount}</p>
                  <span className="text-[10px] text-emerald-600 font-medium">Ready for offer rollout</span>
                </div>

                <div className="p-3.5 rounded-xl bg-blue-50 border border-blue-200">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600">Already Offered</span>
                  <p className="text-xl font-black text-blue-700 mt-1">{previewData.alreadyOfferedCount}</p>
                  <span className="text-[10px] text-blue-600 font-medium">Skipped (Duplicate Safe)</span>
                </div>

                <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-rose-600">Ineligible / Pending</span>
                  <p className="text-xl font-black text-rose-700 mt-1">{previewData.ineligibleCount}</p>
                  <span className="text-[10px] text-rose-600 font-medium">Not final selected / Invalid email</span>
                </div>
              </div>

              {/* Candidate Table */}
              <div className="border border-slate-200 rounded-xl overflow-hidden shadow-2xs">
                <div className="px-4 py-2.5 bg-slate-100 border-b border-slate-200 flex items-center justify-between">
                  <span className="font-extrabold text-slate-800 text-xs">
                    {mode === 'SELECTED' ? 'Selected Candidates Breakdown' : 'Candidates Range Breakdown'}
                  </span>
                  <span className="text-[11px] text-slate-500 font-medium">
                    Showing {previewData.candidates.length} candidates
                  </span>
                </div>
                <div className="max-h-60 overflow-y-auto divide-y divide-slate-100">
                  <table className="w-full text-left border-collapse">
                    <thead className="bg-slate-50 sticky top-0 z-10 text-[10px] font-extrabold uppercase tracking-wider text-slate-500">
                      <tr>
                        <th className="py-2 px-3">Candidate ID</th>
                        <th className="py-2 px-3">Name & Email</th>
                        <th className="py-2 px-3">Role</th>
                        <th className="py-2 px-3">Current Status</th>
                        <th className="py-2 px-3 text-right">Offer Readiness</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-xs">
                      {previewData.candidates.map((cand) => (
                        <tr key={cand.id} className="hover:bg-slate-50/80">
                          <td className="py-2.5 px-3 font-mono font-bold text-slate-800">{cand.candidateCode}</td>
                          <td className="py-2.5 px-3">
                            <strong className="text-slate-900 block">{cand.candidateName}</strong>
                            <span className="text-slate-500 text-[11px]">{cand.email}</span>
                          </td>
                          <td className="py-2.5 px-3 text-slate-700">{cand.jobTitle}</td>
                          <td className="py-2.5 px-3">
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-700">
                              {cand.currentStatus}
                            </span>
                          </td>
                          <td className="py-2.5 px-3 text-right">
                            {cand.offerStatus === 'READY' && (
                              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-100 text-emerald-800">
                                <CheckCircle2 className="w-3 h-3" /> Ready to Send
                              </span>
                            )}
                            {cand.offerStatus === 'ALREADY_OFFERED' && (
                              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-blue-100 text-blue-800">
                                <Info className="w-3 h-3" /> Already Offered (Skip)
                              </span>
                            )}
                            {cand.offerStatus === 'INELIGIBLE' && (
                              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-rose-100 text-rose-800" title={cand.reason}>
                                <AlertCircle className="w-3 h-3" /> Ineligible ({cand.reason})
                              </span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Execution Summary & Dispatch Button */}
              <div className="p-4 rounded-xl bg-orange-50 border border-orange-200 flex flex-col sm:flex-row items-center justify-between gap-3">
                <div>
                  <h4 className="font-extrabold text-slate-900 text-xs">Ready to Release Offers</h4>
                  <p className="text-[11px] text-slate-600 mt-0.5">
                    Will generate {previewData.eligibleCount} unique 4-page PDFs and send {previewData.eligibleCount} individual emails.
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setStep('SETUP')}
                    className="px-4 py-2 rounded-xl bg-white hover:bg-slate-100 text-slate-800 font-bold text-xs border border-slate-300 shadow-2xs"
                  >
                    Adjust Details
                  </button>

                  <button
                    type="button"
                    disabled={previewData.eligibleCount === 0 || loading}
                    onClick={() => handleExecuteBulkSend()}
                    className="inline-flex items-center gap-2 px-6 py-2 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-extrabold text-xs shadow-md shadow-orange-500/25 transition-all disabled:opacity-50"
                  >
                    <Send className="w-4 h-4" /> Send to {previewData.eligibleCount} Eligible Candidates
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* STEP 3: EXECUTING SPINNER */}
          {step === 'EXECUTING' && (
            <div className="py-12 flex flex-col items-center justify-center space-y-4 text-center">
              <div className="w-14 h-14 rounded-full border-4 border-orange-500/30 border-t-orange-500 animate-spin flex items-center justify-center" />
              <div>
                <h4 className="text-base font-extrabold text-slate-900">Processing Bulk Offer Letters...</h4>
                <p className="text-xs text-slate-500 max-w-md mx-auto mt-1">
                  Generating candidate-specific 4-page PDF attachments with unique sequential OL numbers and dispatching individual emails.
                </p>
              </div>
            </div>
          )}

          {/* STEP 4: FINAL EXECUTION REPORT */}
          {step === 'REPORT' && executionResult && (
            <div className="space-y-5">
              {/* Outcome Banner */}
              <div className={`p-4 rounded-xl border flex items-center gap-3 ${
                executionResult.failedCount === 0 
                  ? 'bg-emerald-50 border-emerald-200 text-emerald-950' 
                  : 'bg-amber-50 border-amber-200 text-amber-950'
              }`}>
                {executionResult.failedCount === 0 ? (
                  <CheckCircle2 className="w-6 h-6 text-emerald-600 shrink-0" />
                ) : (
                  <AlertCircle className="w-6 h-6 text-amber-600 shrink-0" />
                )}
                <div>
                  <h4 className="font-extrabold text-sm">Bulk Rollout Completed</h4>
                  <p className="text-xs opacity-90 mt-0.5">
                    <strong>{executionResult.successCount}</strong> offers successfully generated and dispatched. 
                    {executionResult.failedCount > 0 && ` ${executionResult.failedCount} candidate(s) failed or require attention.`}
                  </p>
                </div>
              </div>

              {/* Execution Results Table */}
              <div className="border border-slate-200 rounded-xl overflow-hidden shadow-2xs">
                <div className="px-4 py-2.5 bg-slate-100 border-b border-slate-200 flex items-center justify-between">
                  <span className="font-extrabold text-slate-800 text-xs">Candidate Execution Status</span>
                  <span className="text-[11px] text-slate-500">
                    Total Processed: {executionResult.totalProcessed}
                  </span>
                </div>
                <div className="max-h-64 overflow-y-auto divide-y divide-slate-100">
                  <table className="w-full text-left border-collapse">
                    <thead className="bg-slate-50 sticky top-0 z-10 text-[10px] font-extrabold uppercase tracking-wider text-slate-500">
                      <tr>
                        <th className="py-2 px-3">Candidate ID</th>
                        <th className="py-2 px-3">Name & Email</th>
                        <th className="py-2 px-3">Assigned OL No</th>
                        <th className="py-2 px-3 text-right">Result</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-xs">
                      {executionResult.results.map((res, idx) => (
                        <tr key={idx} className="hover:bg-slate-50/80">
                          <td className="py-2.5 px-3 font-mono font-bold text-slate-800">{res.candidateCode}</td>
                          <td className="py-2.5 px-3">
                            <strong className="text-slate-900 block">{res.candidateName}</strong>
                            <span className="text-slate-500 text-[11px]">{res.email}</span>
                          </td>
                          <td className="py-2.5 px-3 font-mono font-bold text-orange-600">
                            {res.olNo || 'N/A'}
                          </td>
                          <td className="py-2.5 px-3 text-right">
                            {res.status === 'SUCCESS' && (
                              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-100 text-emerald-800">
                                <CheckCircle2 className="w-3 h-3" /> Offer Released & Emailed
                              </span>
                            )}
                            {res.status === 'SKIPPED' && (
                              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-blue-100 text-blue-800">
                                Skipped (Already Sent)
                              </span>
                            )}
                            {res.status === 'FAILED' && (
                              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-rose-100 text-rose-800" title={res.reason}>
                                <AlertCircle className="w-3 h-3" /> Failed: {res.reason}
                              </span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-between pt-2">
                <div>
                  {executionResult.failedCount > 0 && (
                    <button
                      type="button"
                      onClick={handleRetryFailedOnly}
                      className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-extrabold text-xs shadow-xs transition-all"
                    >
                      <RotateCw className="w-3.5 h-3.5" /> Retry Failed Candidates Only ({executionResult.failedCount})
                    </button>
                  )}
                </div>

                <button
                  type="button"
                  onClick={onClose}
                  className="px-6 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-xs shadow-md transition-all"
                >
                  Done & Refresh List
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  return typeof document !== 'undefined' ? createPortal(modalContent, document.body) : null;
};

export default BulkOfferModal;
