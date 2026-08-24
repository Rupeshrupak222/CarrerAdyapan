import React, { useState, useEffect, useMemo } from 'react';
import {
  Search,
  Filter,
  RotateCw,
  Sparkles,
  FileText,
  Eye,
  UserCheck,
  UserX,
  CheckSquare,
  Square,
  Download,
  Award,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Layers,
  Clock,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import toast from 'react-hot-toast';
import DashboardLayout from '../../components/layout/DashboardLayout';
import applicationService from '../../services/applicationService';
import ATSDrawer from '../../components/ats/ATSDrawer';
import ResumeViewerModal from '../../components/ats/ResumeViewerModal';
import CandidatePreviewModal from '../../components/ats/CandidatePreviewModal';
import ConfirmActionModal from '../../components/ats/ConfirmActionModal';

export const ScreeningApprovalsPage: React.FC = () => {
  const [applications, setApplications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedJobFilter, setSelectedJobFilter] = useState('ALL');
  const [selectedStatusFilter, setSelectedStatusFilter] = useState('ALL');
  const [selectedAtsFilter, setSelectedAtsFilter] = useState('ALL');
  const [selectedAppIds, setSelectedAppIds] = useState<string[]>([]);

  // Server-side Pagination State (20 candidates per page)
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(20);
  const [totalCandidates, setTotalCandidates] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  // Bulk ATS Loading
  const [bulkAtsLoading, setBulkAtsLoading] = useState(false);

  // Modals state
  const [atsModalOpen, setAtsModalOpen] = useState(false);
  const [selectedAppForAts, setSelectedAppForAts] = useState<any>(null);
  const [atsResultData, setAtsResultData] = useState<any>(null);
  const [atsLoading, setAtsLoading] = useState(false);

  const [resumeModalOpen, setResumeModalOpen] = useState(false);
  const [activeResumeUrl, setActiveResumeUrl] = useState('');
  const [activeCandidateName, setActiveCandidateName] = useState('');

  const [previewModalOpen, setPreviewModalOpen] = useState(false);
  const [selectedAppForPreview, setSelectedAppForPreview] = useState<any>(null);

  const [confirmModalData, setConfirmModalData] = useState<{
    open: boolean;
    type: 'SHORTLIST' | 'REJECT';
    app: any;
  }>({ open: false, type: 'SHORTLIST', app: null });

  // Load Applications with Server-side Pagination (20 per page)
  const loadData = async (pageToLoad: number = currentPage) => {
    setLoading(true);
    try {
      const queryParams: any = {
        page: pageToLoad,
        limit: pageSize,
      };

      if (searchQuery.trim()) queryParams.search = searchQuery.trim();
      if (selectedJobFilter !== 'ALL') queryParams.jobId = selectedJobFilter;
      if (selectedStatusFilter !== 'ALL') queryParams.status = selectedStatusFilter;

      const res = await applicationService.getAllApplications(queryParams);
      const apps = res.applications || res.data || (Array.isArray(res) ? res : []);
      setApplications(apps);
      setTotalCandidates(res.total !== undefined ? res.total : apps.length);
      setTotalPages(res.totalPages !== undefined ? res.totalPages : Math.ceil((res.total || apps.length) / pageSize) || 1);
      setCurrentPage(pageToLoad);
    } catch (err: any) {
      toast.error('Failed to load applications: ' + (err.message || 'Error'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData(1);
  }, [selectedJobFilter, selectedStatusFilter]);

  // Debounced Search
  useEffect(() => {
    const timer = setTimeout(() => {
      loadData(1);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Filtered Applications for in-memory ATS matching
  const filteredApps = useMemo(() => {
    if (selectedAtsFilter === 'ALL') return applications;
    return applications.filter((app) => {
      if (selectedAtsFilter === 'CHECKED' && (!app.atsScore || app.atsStatus === 'ATS_NOT_CHECKED')) return false;
      if (selectedAtsFilter === 'NOT_CHECKED' && app.atsScore && app.atsStatus !== 'ATS_NOT_CHECKED') return false;
      if (selectedAtsFilter === 'HIGH_MATCH' && (app.atsScore || 0) < 80) return false;
      return true;
    });
  }, [applications, selectedAtsFilter]);

  // Unique Job List from applications for filter
  const uniqueJobs = useMemo(() => {
    const set = new Map<string, string>();
    applications.forEach((a) => {
      if (a.job?.id && a.job?.title) {
        set.set(a.job.id, a.job.title);
      }
    });
    return Array.from(set.entries()).map(([id, title]) => ({ id, title }));
  }, [applications]);

  // Individual ATS Check Handler
  const handleOpenAtsCheck = async (app: any) => {
    setSelectedAppForAts(app);
    setAtsModalOpen(true);
    setAtsLoading(true);
    try {
      const res = await applicationService.runAtsCheck(app.id);
      if (res.success) {
        setAtsResultData(res.atsResult || res.application?.atsResult);
        setApplications((prev) =>
          prev.map((item) =>
            item.id === app.id
              ? {
                ...item,
                atsScore: res.application?.atsScore || res.atsScore,
                atsStatus: 'ATS_COMPLETED',
              }
              : item
          )
        );
        toast.success(`ATS Score: ${res.application?.atsScore || res.atsScore}/100`);
      }
    } catch (err: any) {
      toast.error('ATS Check Error: ' + err.message);
    } finally {
      setAtsLoading(false);
    }
  };

  // Bulk ATS Evaluation Handler (Gemini Batch Engine)
  const handleBulkRunAts = async () => {
    if (selectedAppIds.length === 0) {
      toast.error('Please select candidate(s) to evaluate ATS.');
      return;
    }

    setBulkAtsLoading(true);
    const toastId = toast.loading(`Running Gemini ATS Analysis for ${selectedAppIds.length} candidate(s)...`);
    try {
      const res = await applicationService.bulkRunAtsCheck(selectedAppIds);
      if (res.success) {
        toast.success(res.message || `ATS evaluation complete for ${selectedAppIds.length} candidate(s)!`, { id: toastId });
        loadData(currentPage);
      } else {
        toast.error('Batch ATS finished with notices', { id: toastId });
      }
    } catch (err: any) {
      toast.error('Batch ATS failed: ' + err.message, { id: toastId });
    } finally {
      setBulkAtsLoading(false);
    }
  };

  // Resume Handlers
  const handleViewResume = (resumeUrl: string, candidateName: string) => {
    setActiveResumeUrl(resumeUrl);
    setActiveCandidateName(candidateName);
    setResumeModalOpen(true);
  };

  const handleDownloadResume = async (url: string, name: string) => {
    if (!url) {
      toast.error('No resume document available to download.');
      return;
    }
    const filename = `${name.replace(/\s+/g, '_')}_Resume.pdf`;
    try {
      const response = await fetch(url);
      if (!response.ok) throw new Error('Network error');
      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(blobUrl);
      toast.success('Resume downloaded successfully.');
    } catch {
      const link = document.createElement('a');
      link.href = url;
      link.target = '_blank';
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  // Preview Handler
  const handlePreviewCandidate = (app: any) => {
    setSelectedAppForPreview(app);
    setPreviewModalOpen(true);
  };

  // Shortlist / Reject Decision Executions
  const handleConfirmDecision = async (appId: string, reason?: string) => {
    try {
      if (confirmModalData.type === 'SHORTLIST') {
        await applicationService.shortlistApplication(appId);
        toast.success('Candidate shortlisted and moved to Workload Distribution.');
        setApplications((prev) =>
          prev.map((a) => (a.id === appId ? { ...a, status: 'SHORTLISTED', overallStatus: 'SHORTLISTED' } : a))
        );
      } else {
        await applicationService.rejectApplication(appId, reason);
        toast.success('Candidate rejected and notification email sent.');
        setApplications((prev) =>
          prev.map((a) => (a.id === appId ? { ...a, status: 'REJECTED', overallStatus: 'REJECTED' } : a))
        );
      }
    } catch (err: any) {
      toast.error('Action failed: ' + err.message);
    }
  };

  // Bulk Actions
  const handleBulkShortlist = async () => {
    if (selectedAppIds.length === 0) return;
    const toastId = toast.loading(`Shortlisting ${selectedAppIds.length} candidate(s)...`);
    try {
      const res = await applicationService.bulkShortlist(selectedAppIds);
      toast.success(res.message || `${selectedAppIds.length} candidate(s) shortlisted to Workload Distribution.`, { id: toastId });
      setSelectedAppIds([]);
      loadData(currentPage);
    } catch (err: any) {
      toast.error('Bulk shortlist failed: ' + err.message, { id: toastId });
    }
  };

  const handleBulkReject = async () => {
    if (selectedAppIds.length === 0) return;
    const toastId = toast.loading(`Rejecting ${selectedAppIds.length} candidate(s)...`);
    try {
      const res = await applicationService.bulkReject(selectedAppIds);
      toast.success(res.message || `${selectedAppIds.length} candidate(s) rejected with email notifications.`, { id: toastId });
      setSelectedAppIds([]);
      loadData(currentPage);
    } catch (err: any) {
      toast.error('Bulk reject failed: ' + err.message, { id: toastId });
    }
  };

  // Select All 20 Visible on Current Page
  const toggleSelectAllVisible = () => {
    const visibleIds = filteredApps.map((a) => a.id);
    const allVisibleSelected = visibleIds.every((id) => selectedAppIds.includes(id));

    if (allVisibleSelected) {
      setSelectedAppIds((prev) => prev.filter((id) => !visibleIds.includes(id)));
    } else {
      setSelectedAppIds((prev) => Array.from(new Set([...prev, ...visibleIds])));
    }
  };

  const toggleSelectOne = (id: string) => {
    setSelectedAppIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const isAllVisibleSelected = filteredApps.length > 0 && filteredApps.every((a) => selectedAppIds.includes(a.id));

  return (
    <DashboardLayout>
      <div className="space-y-6 animate-fadeIn pb-12">
        {/* Header Title */}
        <div className="p-6 rounded-2xl bg-white border border-slate-200 flex flex-col lg:flex-row lg:items-center justify-between gap-4 shadow-xs">
          <div>
            {/* <div className="flex items-center gap-2">
              <span className="text-xs font-extrabold text-orange-600 uppercase tracking-wider block">
                Screening Console
              </span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-orange-100 text-orange-800">
                🎯 20 Candidates / Page
              </span>
            </div> */}
            <h1 className="text-2xl font-black text-slate-900 mt-1">Screening & Approvals</h1>
            <p className="text-slate-500 text-xs sm:text-sm mt-0.5">
              Review incoming applications, run on-demand or batch Gemini ATS evaluations, inspect resumes, and shortlist to Workload Distribution or reject with email notice.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => loadData(currentPage)}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white hover:bg-slate-50 text-slate-800 text-xs font-bold border border-slate-300 shadow-2xs transition-all"
            >
              <RotateCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} /> Refresh Table
            </button>
          </div>
        </div>

        {/* Filters & Bulk Action Bar */}
        <div className="p-4 rounded-2xl bg-white border border-slate-200 space-y-3 shadow-xs">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
            {/* Search */}
            <div className="relative md:col-span-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search Candidate / ID / Email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 outline-none focus:border-orange-500 focus:bg-white transition-all font-medium"
              />
            </div>

            {/* Job Filter */}
            <div>
              <select
                value={selectedJobFilter}
                onChange={(e) => setSelectedJobFilter(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 outline-none focus:border-orange-500 focus:bg-white transition-all font-medium"
              >
                <option value="ALL">All Job Roles</option>
                {uniqueJobs.map((j) => (
                  <option key={j.id} value={j.id}>{j.title}</option>
                ))}
              </select>
            </div>

            {/* Status Filter */}
            <div>
              <select
                value={selectedStatusFilter}
                onChange={(e) => setSelectedStatusFilter(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 outline-none focus:border-orange-500 focus:bg-white transition-all font-medium"
              >
                <option value="ALL">All Hiring Statuses</option>
                <option value="NEW">New Applications (SUBMITTED)</option>
                <option value="SHORTLISTED">Shortlisted Candidates</option>
                <option value="ASSIGNED">Assigned to HR Specialist</option>
                <option value="REJECTED">Rejected</option>
              </select>
            </div>

            {/* ATS Status Filter */}
            <div>
              <select
                value={selectedAtsFilter}
                onChange={(e) => setSelectedAtsFilter(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 outline-none focus:border-orange-500 focus:bg-white transition-all font-medium"
              >
                <option value="ALL">All ATS Checks</option>
                <option value="CHECKED">ATS Evaluated</option>
                <option value="NOT_CHECKED">ATS Not Checked Yet</option>
                <option value="HIGH_MATCH">Strong Match (80+ Score)</option>
              </select>
            </div>
          </div>

          {/* Bulk Action Controls Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-100">
            <div className="flex items-center gap-3">
              <button
                onClick={toggleSelectAllVisible}
                className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold transition-all"
              >
                {isAllVisibleSelected ? (
                  <CheckSquare className="w-4 h-4 text-orange-600" />
                ) : (
                  <Square className="w-4 h-4 text-slate-400" />
                )}
                <span>Select All {filteredApps.length} Visible</span>
              </button>

              {selectedAppIds.length > 0 && (
                <span className="text-xs font-bold text-orange-700 bg-orange-50 px-2.5 py-1 rounded-lg border border-orange-200">
                  {selectedAppIds.length} candidate(s) selected
                </span>
              )}
            </div>

            <div className="flex items-center gap-2">
              {/* Batch Gemini ATS Run */}
              <button
                onClick={handleBulkRunAts}
                disabled={selectedAppIds.length === 0 || bulkAtsLoading}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-extrabold text-xs shadow-xs transition-all disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <Sparkles className={`w-3.5 h-3.5 ${bulkAtsLoading ? 'animate-spin' : ''}`} />
                <span>{bulkAtsLoading ? 'Evaluating ATS...' : 'Run ATS for Selected'}</span>
              </button>

              {/* Bulk Shortlist */}
              <button
                onClick={handleBulkShortlist}
                disabled={selectedAppIds.length === 0}
                className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs shadow-xs transition-all disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Shortlist Selected
              </button>

              {/* Bulk Reject */}
              <button
                onClick={handleBulkReject}
                disabled={selectedAppIds.length === 0}
                className="px-3 py-1.5 rounded-xl bg-red-50 hover:bg-red-100 text-red-700 font-bold text-xs border border-red-200 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Reject Selected
              </button>
            </div>
          </div>
        </div>

        {/* Screening Table */}
        <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50/80 text-slate-500 font-extrabold uppercase tracking-wider">
                  <th className="py-3 px-4 w-10 text-center">
                    <button onClick={toggleSelectAllVisible} className="text-slate-400 hover:text-slate-700">
                      {isAllVisibleSelected ? (
                        <CheckSquare className="w-4 h-4 text-orange-600" />
                      ) : (
                        <Square className="w-4 h-4" />
                      )}
                    </button>
                  </th>
                  <th className="py-3 px-3">Application ID</th>
                  <th className="py-3 px-4">Candidate</th>
                  <th className="py-3 px-4">Job Role</th>
                  <th className="py-3 px-3">Applied</th>
                  <th className="py-3 px-3">Hiring Status</th>
                  <th className="py-3 px-4">ATS Evaluation</th>
                  <th className="py-3 px-4">Resume</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {loading ? (
                  <tr>
                    <td colSpan={9} className="py-12 text-center text-slate-400">
                      <div className="flex flex-col items-center gap-2">
                        <div className="w-7 h-7 border-3 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
                        <p className="font-semibold text-xs text-slate-500">Loading screening candidates...</p>
                      </div>
                    </td>
                  </tr>
                ) : filteredApps.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="py-12 text-center text-slate-400">
                      <p className="font-semibold text-xs">No candidate applications match the selected criteria.</p>
                    </td>
                  </tr>
                ) : (
                  filteredApps.map((app) => {
                    const isSelected = selectedAppIds.includes(app.id);
                    const candidate = app.candidate || {};
                    const candName = `${candidate.firstName || ''} ${candidate.lastName || ''}`.trim() || 'Candidate';
                    const appId = app.candidateCode || app.id?.slice(0, 10) || 'APP-2026';
                    const hasAts = app.atsScore !== null && app.atsScore !== undefined;

                    return (
                      <tr
                        key={app.id}
                        className={`hover:bg-orange-50/20 transition-colors ${isSelected ? 'bg-orange-50/40' : ''
                          }`}
                      >
                        {/* Checkbox */}
                        <td className="py-3 px-4 text-center">
                          <button onClick={() => toggleSelectOne(app.id)} className="text-slate-400 hover:text-slate-700">
                            {isSelected ? (
                              <CheckSquare className="w-4 h-4 text-orange-600" />
                            ) : (
                              <Square className="w-4 h-4" />
                            )}
                          </button>
                        </td>

                        {/* Application ID */}
                        <td className="py-3 px-3 font-mono font-bold text-slate-700">{appId}</td>

                        {/* Candidate */}
                        <td className="py-3 px-4">
                          <div className="font-bold text-slate-900 leading-tight">{candName}</div>
                          <div className="text-[11px] text-slate-500 font-mono mt-0.5">{candidate.email}</div>
                        </td>

                        {/* Job Role */}
                        <td className="py-3 px-4 font-semibold text-slate-700 max-w-[180px] truncate">
                          {app.job?.title || 'Open Position'}
                        </td>

                        {/* Applied Date */}
                        <td className="py-3 px-3 text-slate-500 whitespace-nowrap">
                          {new Date(app.appliedAt || app.createdAt).toLocaleDateString('en-GB', {
                            day: '2-digit',
                            month: 'short',
                          })}
                        </td>

                        {/* Hiring Status */}
                        <td className="py-3 px-3 whitespace-nowrap">
                          <span
                            className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase ${app.status === 'SHORTLISTED'
                                ? 'bg-emerald-100 text-emerald-800'
                                : app.status === 'REJECTED'
                                  ? 'bg-red-100 text-red-800'
                                  : app.status === 'ASSIGNED'
                                    ? 'bg-blue-100 text-blue-800'
                                    : 'bg-slate-100 text-slate-700'
                              }`}
                          >
                            {app.status || 'SUBMITTED'}
                          </span>
                        </td>

                        {/* ATS Evaluation Button / Score */}
                        <td className="py-3 px-4 whitespace-nowrap">
                          {hasAts ? (
                            <button
                              onClick={() => handleOpenAtsCheck(app)}
                              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-orange-50 hover:bg-orange-100 text-orange-800 border border-orange-200 font-extrabold transition-all text-xs"
                            >
                              <Sparkles className="w-3.5 h-3.5 text-orange-600" />
                              <span>{app.atsScore}/100</span>
                              <span className="text-[10px] text-orange-600 underline ml-0.5">View</span>
                            </button>
                          ) : (
                            <button
                              onClick={() => handleOpenAtsCheck(app)}
                              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 font-bold transition-all text-xs shadow-2xs"
                            >
                              <Sparkles className="w-3 h-3 text-orange-500" /> Run ATS
                            </button>
                          )}
                        </td>

                        {/* Resume Actions */}
                        <td className="py-3 px-4 whitespace-nowrap">
                          <div className="flex items-center gap-1.5">
                            <button
                              onClick={() => handleViewResume(candidate.resumeUrl, candName)}
                              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold text-xs transition-all"
                            >
                              <FileText className="w-3.5 h-3.5 text-orange-600" /> View
                            </button>
                            {candidate.resumeUrl && (
                              <button
                                onClick={() => handleDownloadResume(candidate.resumeUrl, candName)}
                                className="p-1 rounded-lg text-slate-400 hover:text-orange-600 hover:bg-orange-50 transition-colors"
                                title="Download Resume"
                              >
                                <Download className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                        </td>

                        {/* Row Actions: Preview, Shortlist, Reject */}
                        <td className="py-3 px-4 text-right whitespace-nowrap">
                          {(() => {
                            const isProcessed = [
                              'SHORTLISTED', 'ASSIGNED', 'ROUND_1_PENDING', 'ROUND_1_SELECTED',
                              'ROUND_1_REJECTED', 'ROUND_2_PENDING', 'ROUND_2_SELECTED',
                              'ROUND_2_REJECTED', 'FINAL_SELECTED', 'FINAL_ROUND', 'OFFER_SENT',
                              'OFFER_ACCEPTED', 'JOINED', 'REJECTED'
                            ].includes(app.status) || app.finalSelected || app.status?.includes('REJECTED');

                            return (
                              <div className="flex items-center justify-end gap-1.5">
                                <button
                                  onClick={() => handlePreviewCandidate(app)}
                                  className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition-all"
                                >
                                  Preview
                                </button>

                                <button
                                  onClick={() => setConfirmModalData({ open: true, type: 'SHORTLIST', app })}
                                  disabled={isProcessed}
                                  className={`px-3 py-1 rounded-lg font-extrabold text-xs transition-all ${isProcessed
                                      ? 'bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed'
                                      : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-2xs'
                                    }`}
                                  title={isProcessed ? 'Candidate has already advanced beyond screening' : 'Shortlist Candidate'}
                                >
                                  Shortlist
                                </button>

                                <button
                                  onClick={() => setConfirmModalData({ open: true, type: 'REJECT', app })}
                                  disabled={isProcessed}
                                  className={`px-2.5 py-1 rounded-lg font-bold text-xs border transition-all ${isProcessed
                                      ? 'bg-slate-50 text-slate-300 border-slate-200 cursor-not-allowed'
                                      : 'bg-red-50 hover:bg-red-100 text-red-700 border-red-200'
                                    }`}
                                  title={isProcessed ? 'Candidate has already advanced beyond screening' : 'Reject Candidate'}
                                >
                                  Reject
                                </button>
                              </div>
                            );
                          })()}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Server-Side Pagination Bar (20 candidates per page) */}
          <div className="p-4 border-t border-slate-200 bg-slate-50 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
            <div className="text-slate-500 font-medium">
              Showing <span className="font-bold text-slate-900">{totalCandidates > 0 ? (currentPage - 1) * pageSize + 1 : 0}</span> to{' '}
              <span className="font-bold text-slate-900">{Math.min(currentPage * pageSize, totalCandidates)}</span> of{' '}
              <span className="font-bold text-slate-900">{totalCandidates}</span> total applications
            </div>

            <div className="flex items-center gap-1.5">
              <button
                onClick={() => loadData(currentPage - 1)}
                disabled={currentPage <= 1 || loading}
                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-white hover:bg-slate-100 text-slate-700 font-bold border border-slate-300 transition-all disabled:opacity-40 disabled:cursor-not-allowed shadow-2xs"
              >
                <ChevronLeft className="w-4 h-4" /> Previous
              </button>

              <div className="flex items-center gap-1 px-2 font-bold text-slate-700">
                Page {currentPage} of {totalPages}
              </div>

              <button
                onClick={() => loadData(currentPage + 1)}
                disabled={currentPage >= totalPages || loading}
                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-white hover:bg-slate-100 text-slate-700 font-bold border border-slate-300 transition-all disabled:opacity-40 disabled:cursor-not-allowed shadow-2xs"
              >
                Next <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Viewport Centered Popups */}
        <ATSDrawer
          isOpen={atsModalOpen}
          onClose={() => setAtsModalOpen(false)}
          application={selectedAppForAts}
          atsResult={atsResultData}
          loading={atsLoading}
          onRerunAts={(appId) => handleOpenAtsCheck({ id: appId })}
          onViewResume={(url, name) => handleViewResume(url, name)}
          onShortlist={(app) => {
            setAtsModalOpen(false);
            setConfirmModalData({ open: true, type: 'SHORTLIST', app });
          }}
          onReject={(app) => {
            setAtsModalOpen(false);
            setConfirmModalData({ open: true, type: 'REJECT', app });
          }}
        />

        <ResumeViewerModal
          isOpen={resumeModalOpen}
          onClose={() => setResumeModalOpen(false)}
          resumeUrl={activeResumeUrl}
          candidateName={activeCandidateName}
        />

        <CandidatePreviewModal
          isOpen={previewModalOpen}
          onClose={() => setPreviewModalOpen(false)}
          application={selectedAppForPreview}
          onRunAts={(app) => handleOpenAtsCheck(app)}
          onViewResume={(url, name) => handleViewResume(url, name)}
          onShortlist={(app) => {
            setPreviewModalOpen(false);
            setConfirmModalData({ open: true, type: 'SHORTLIST', app });
          }}
          onReject={(app) => {
            setPreviewModalOpen(false);
            setConfirmModalData({ open: true, type: 'REJECT', app });
          }}
        />

        <ConfirmActionModal
          isOpen={confirmModalData.open}
          onClose={() => setConfirmModalData({ open: false, type: 'SHORTLIST', app: null })}
          actionType={confirmModalData.type}
          application={confirmModalData.app}
          onConfirm={handleConfirmDecision}
        />
      </div>
    </DashboardLayout>
  );
};

export default ScreeningApprovalsPage;
