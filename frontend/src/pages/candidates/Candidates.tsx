import React, { useState, useEffect, useMemo, useRef } from 'react';
import { createPortal } from 'react-dom';
import { Link } from 'react-router-dom';
import * as XLSX from 'xlsx';
import DashboardLayout from '../../components/layout/DashboardLayout';
import applicationService from '../../services/applicationService';
import { candidateService } from '../../services/candidateService';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';
import { 
  Users, 
  Search, 
  Filter, 
  Download, 
  Calendar, 
  FileText, 
  Mail, 
  Phone, 
  MapPin, 
  Award, 
  Sparkles, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  ChevronRight, 
  UserCheck, 
  RotateCw, 
  Eye, 
  SlidersHorizontal,
  ChevronLeft,
  Trash2,
  AlertTriangle
} from 'lucide-react';
import ResumeViewerModal from '../../components/ats/ResumeViewerModal';
import CandidatePreviewModal from '../../components/ats/CandidatePreviewModal';

export const Candidates: React.FC = () => {
  const { user } = useAuth();
  const [applications, setApplications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [jobFilter, setJobFilter] = useState('ALL');
  const [hrFilter, setHrFilter] = useState('ALL');
  const [roundFilter, setRoundFilter] = useState('ALL');

  // Dynamic Options from DB
  const [hrSpecialists, setHrSpecialists] = useState<any[]>([]);
  const [jobsList, setJobsList] = useState<any[]>([]);

  // Modals
  const [resumeModalOpen, setResumeModalOpen] = useState(false);
  const [activeResumeUrl, setActiveResumeUrl] = useState('');
  const [activeCandidateName, setActiveCandidateName] = useState('');

  const [previewModalOpen, setPreviewModalOpen] = useState(false);
  const [selectedAppForPreview, setSelectedAppForPreview] = useState<any>(null);

  // Delete Candidate Modal
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [candidateToDelete, setCandidateToDelete] = useState<any>(null);
  const [deleting, setDeleting] = useState(false);

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(25);
  const [totalApplications, setTotalApplications] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  // Load Applications and Filter Metadata
  const loadData = async (pageToLoad: number = currentPage) => {
    setLoading(true);
    try {
      const queryParams: any = {
        page: pageToLoad,
        limit: pageSize,
      };

      if (searchQuery.trim()) queryParams.search = searchQuery.trim();
      if (statusFilter !== 'ALL') queryParams.status = statusFilter;
      if (jobFilter !== 'ALL') queryParams.jobId = jobFilter;
      if (hrFilter !== 'ALL') queryParams.assignedHrId = hrFilter;
      if (roundFilter !== 'ALL') queryParams.roundNumber = roundFilter;

      const [appsRes, statsRes] = await Promise.all([
        applicationService.getAllApplications(queryParams),
        applicationService.getWorkloadStats(),
      ]);

      const apps = appsRes.applications || appsRes.data || (Array.isArray(appsRes) ? appsRes : []);
      setApplications(apps);
      setTotalApplications(appsRes.total !== undefined ? appsRes.total : apps.length);
      setTotalPages(appsRes.totalPages !== undefined ? appsRes.totalPages : Math.ceil((appsRes.total || apps.length) / pageSize) || 1);
      setCurrentPage(pageToLoad);

      if (statsRes?.stats?.specialists) {
        setHrSpecialists(statsRes.stats.specialists);
      }
    } catch (err: any) {
      toast.error('Failed to load candidate applications: ' + (err.message || 'Error'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData(1);
  }, [statusFilter, jobFilter, hrFilter, roundFilter]);

  // Debounced Search
  useEffect(() => {
    const timer = setTimeout(() => {
      loadData(1);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Extract unique jobs from current applications pool or stats
  useEffect(() => {
    const uniqueJobsMap = new Map<string, string>();
    applications.forEach((a) => {
      if (a.job?.id && a.job?.title) {
        uniqueJobsMap.set(a.job.id, a.job.title);
      }
    });
    setJobsList(Array.from(uniqueJobsMap.entries()).map(([id, title]) => ({ id, title })));
  }, [applications]);

  // Export to Excel
  const handleExportExcel = () => {
    if (applications.length === 0) {
      toast.error('No candidate applications available to export.');
      return;
    }

    const exportData = applications.map((app) => {
      const cand = app.candidate || {};
      return {
        'Candidate ID': app.candidateCode || 'CAND-000000',
        'Full Name': `${cand.firstName || ''} ${cand.lastName || ''}`.trim() || 'Candidate',
        'Email Address': cand.email || 'N/A',
        'Phone': cand.phone || 'N/A',
        'Role Applied': app.job?.title || 'Open Position',
        'Hiring Stage': app.status || 'APPLIED',
        'Current Round': app.currentRound ? `Round ${app.currentRound}` : 'Screening',
        'ATS Score (%)': app.atsScore || cand.aiScore || 75,
        'Assigned HR': app.assignedHr?.name || 'Unassigned',
        'Applied Date': new Date(app.appliedAt || app.createdAt).toLocaleDateString('en-GB'),
      };
    });

    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Candidates_Lifecycle_Master');
    XLSX.writeFile(workbook, `Adyapan_All_Candidates_${new Date().toISOString().split('T')[0]}.xlsx`);
    toast.success('Candidates directory exported to Excel!');
  };

  const handleOpenResume = (resumeUrl: string, candidateName: string) => {
    setActiveResumeUrl(resumeUrl);
    setActiveCandidateName(candidateName);
    setResumeModalOpen(true);
  };

  const handleOpenPreview = (app: any) => {
    setSelectedAppForPreview(app);
    setPreviewModalOpen(true);
  };

  const handleOpenDeleteModal = (app: any) => {
    setCandidateToDelete(app);
    setDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!candidateToDelete) return;
    setDeleting(true);
    const toastId = toast.loading('Permanently deleting candidate from all database records...');
    try {
      const targetId = candidateToDelete.candidateId || candidateToDelete.candidate?.id || candidateToDelete.id;
      await candidateService.deleteCandidate(targetId);
      toast.success('Candidate and all associated data permanently deleted.', { id: toastId });
      setDeleteModalOpen(false);
      setCandidateToDelete(null);
      loadData(currentPage);
    } catch (err: any) {
      toast.error('Failed to delete candidate: ' + (err.message || 'Error'), { id: toastId });
    } finally {
      setDeleting(false);
    }
  };

  const isManager = user?.role === 'HR_MANAGER';
  const isAdmin = user?.role === 'ADMIN';
  const canDelete = isManager || isAdmin;

  return (
    <DashboardLayout>
      <div className="space-y-6 animate-fadeIn pb-12">
        {/* Header Title */}
        <div className="p-6 rounded-2xl bg-white border border-slate-200 flex flex-col lg:flex-row lg:items-center justify-between gap-4 shadow-xs">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-extrabold text-orange-600 uppercase tracking-wider block">
                Talent Directory
              </span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-orange-100 text-orange-800">
                👥 Complete Lifecycle History
              </span>
            </div>
            <h1 className="text-2xl font-black text-slate-900 mt-1">All Candidates</h1>
            <p className="text-slate-500 text-xs sm:text-sm mt-0.5">
              Comprehensive hiring pipeline records spanning Screening, Round 1, Round 2, Final Selection, Offer Letters, and Onboarding.
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={handleExportExcel}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white hover:bg-slate-50 text-slate-800 text-xs font-bold border border-slate-300 shadow-2xs transition-all"
            >
              <Download className="w-3.5 h-3.5 text-slate-600" /> Export Excel
            </button>

            <button
              onClick={() => loadData(currentPage)}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white hover:bg-slate-50 text-slate-800 text-xs font-bold border border-slate-300 shadow-2xs transition-all"
            >
              <RotateCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} /> Refresh
            </button>
          </div>
        </div>

        {/* Database Filters Bar */}
        <div className="p-4 rounded-2xl bg-white border border-slate-200 space-y-3 shadow-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
            {/* Search */}
            <div className="relative lg:col-span-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search name, ID, email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 outline-none focus:border-orange-500 focus:bg-white transition-all font-medium"
              />
            </div>

            {/* Status Filter */}
            <div>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 outline-none focus:border-orange-500 focus:bg-white transition-all font-medium"
              >
                <option value="ALL">All Hiring Stages</option>
                <option value="APPLIED">Applied / New</option>
                <option value="SHORTLISTED">Shortlisted (Workload)</option>
                <option value="ASSIGNED">Assigned to HR</option>
                <option value="ROUND_1_PENDING">Round 1 Scheduled</option>
                <option value="ROUND_1_SELECTED">Round 1 Cleared</option>
                <option value="ROUND_1_REJECTED">Round 1 Rejected</option>
                <option value="ROUND_2_PENDING">Round 2 Scheduled</option>
                <option value="ROUND_2_SELECTED">Round 2 Cleared</option>
                <option value="ROUND_2_REJECTED">Round 2 Rejected</option>
                <option value="FINAL_ROUND">Final Round Selected</option>
                <option value="OFFER_SENT">Offer Sent</option>
                <option value="JOINED">Joined / Onboarded</option>
                <option value="REJECTED">Rejected (General)</option>
              </select>
            </div>

            {/* Job Filter */}
            <div>
              <select
                value={jobFilter}
                onChange={(e) => setJobFilter(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 outline-none focus:border-orange-500 focus:bg-white transition-all font-medium"
              >
                <option value="ALL">All Job Roles</option>
                {jobsList.map((j) => (
                  <option key={j.id} value={j.id}>{j.title}</option>
                ))}
              </select>
            </div>

            {/* HR Specialist Filter */}
            <div>
              <select
                value={hrFilter}
                onChange={(e) => setHrFilter(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 outline-none focus:border-orange-500 focus:bg-white transition-all font-medium"
              >
                <option value="ALL">All HR Specialists</option>
                {hrSpecialists.map((hr) => (
                  <option key={hr.id} value={hr.id}>{hr.name}</option>
                ))}
              </select>
            </div>

            {/* Round Filter */}
            <div>
              <select
                value={roundFilter}
                onChange={(e) => setRoundFilter(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 outline-none focus:border-orange-500 focus:bg-white transition-all font-medium"
              >
                <option value="ALL">All Rounds</option>
                <option value="1">Round 1 (Screening & Domain)</option>
                <option value="2">Round 2 (Technical & Sales Pitch)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Candidates Table */}
        <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50/80 text-slate-500 font-extrabold uppercase tracking-wider">
                  <th className="py-3 px-4">Candidate ID</th>
                  <th className="py-3 px-4">Candidate</th>
                  <th className="py-3 px-4">Job Role</th>
                  <th className="py-3 px-3">ATS Match</th>
                  <th className="py-3 px-3">Lifecycle Stage</th>
                  <th className="py-3 px-3">Assigned HR</th>
                  <th className="py-3 px-3">Applied Date</th>
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
                        <p className="font-semibold text-xs text-slate-500">Loading candidate history from database...</p>
                      </div>
                    </td>
                  </tr>
                ) : applications.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="py-12 text-center text-slate-400">
                      <p className="font-semibold text-xs">No candidate applications found for the selected criteria.</p>
                    </td>
                  </tr>
                ) : (
                  applications.map((app) => {
                    const candidate = app.candidate || {};
                    const candName = `${candidate.firstName || ''} ${candidate.lastName || ''}`.trim() || 'Candidate';
                    const appId = app.candidateCode || app.id?.slice(0, 10) || 'APP-2026';
                    const atsScore = app.atsScore || candidate.aiScore;

                    const isCleared = ['ROUND_1_SELECTED', 'ROUND_2_SELECTED', 'FINAL_ROUND', 'OFFER_SENT', 'JOINED'].includes(app.status);
                    const isRejected = ['REJECTED', 'ROUND_1_REJECTED', 'ROUND_2_REJECTED'].includes(app.status);

                    return (
                      <tr key={app.id} className="hover:bg-orange-50/20 transition-colors">
                        <td className="py-3.5 px-4 font-mono font-bold text-slate-700">{appId}</td>

                        <td className="py-3.5 px-4">
                          <div className="font-bold text-slate-900">{candName}</div>
                          <div className="text-[11px] text-slate-500 font-mono mt-0.5">{candidate.email}</div>
                        </td>

                        <td className="py-3.5 px-4 font-semibold text-slate-700 max-w-[180px] truncate">
                          {app.job?.title || 'Open Position'}
                        </td>

                        <td className="py-3.5 px-3 whitespace-nowrap">
                          {atsScore ? (
                            <span className="font-extrabold text-orange-700 bg-orange-50 px-2 py-0.5 rounded-md border border-orange-200/60">
                              {atsScore}%
                            </span>
                          ) : (
                            <span className="text-slate-400">--</span>
                          )}
                        </td>

                        <td className="py-3.5 px-3 whitespace-nowrap">
                          <span
                            className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase ${
                              isCleared
                                ? 'bg-emerald-100 text-emerald-800'
                                : isRejected
                                ? 'bg-red-100 text-red-800'
                                : app.status === 'SHORTLISTED'
                                ? 'bg-amber-100 text-amber-800'
                                : app.status === 'ASSIGNED' || app.status?.includes('PENDING')
                                ? 'bg-blue-100 text-blue-800'
                                : 'bg-slate-100 text-slate-700'
                            }`}
                          >
                            {app.status || 'APPLIED'}
                          </span>
                        </td>

                        <td className="py-3.5 px-3 text-slate-700 font-semibold whitespace-nowrap">
                          {app.assignedHr?.name ? (
                            <div className="flex items-center gap-1.5">
                              <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0"></span>
                              <span>{app.assignedHr.name}</span>
                            </div>
                          ) : (
                            <span className="text-slate-400 italic">Unassigned</span>
                          )}
                        </td>

                        <td className="py-3.5 px-3 text-slate-500 whitespace-nowrap">
                          {new Date(app.appliedAt || app.createdAt).toLocaleDateString('en-GB', {
                            day: '2-digit',
                            month: 'short',
                            year: 'numeric',
                          })}
                        </td>

                        <td className="py-3.5 px-4 whitespace-nowrap">
                          <button
                            onClick={() => handleOpenResume(candidate.resumeUrl, candName)}
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold text-xs transition-all"
                          >
                            <FileText className="w-3.5 h-3.5 text-orange-600" /> View
                          </button>
                        </td>

                        <td className="py-3.5 px-4 text-right whitespace-nowrap">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => handleOpenPreview(app)}
                              className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition-all"
                            >
                              Profile
                            </button>

                            {canDelete && (
                              <button
                                onClick={() => handleOpenDeleteModal(app)}
                                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 font-bold text-xs transition-all"
                                title="Delete candidate permanently"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                                <span>Delete</span>
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

          {/* Pagination Toolbar */}
          <div className="p-4 border-t border-slate-200 bg-slate-50 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
            <div className="text-slate-500 font-medium">
              Showing <span className="font-bold text-slate-900">{totalApplications > 0 ? (currentPage - 1) * pageSize + 1 : 0}</span> to{' '}
              <span className="font-bold text-slate-900">{Math.min(currentPage * pageSize, totalApplications)}</span> of{' '}
              <span className="font-bold text-slate-900">{totalApplications}</span> candidate applications
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

        {/* Viewport-Centered Delete Confirmation Modal rendered via Portal */}
        {deleteModalOpen && candidateToDelete && typeof document !== 'undefined' && createPortal(
          <div 
            className="fixed inset-0 z-[99999] bg-slate-950/75 backdrop-blur-sm overflow-y-auto flex items-center justify-center p-4 min-h-screen animate-fadeIn"
            onClick={() => !deleting && setDeleteModalOpen(false)}
          >
            <div 
              className="max-w-md w-full bg-white border border-slate-200 rounded-3xl p-6 sm:p-7 shadow-2xl space-y-4 my-auto relative animate-scaleUp"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-red-100 border border-red-200 flex items-center justify-center text-red-600 shrink-0">
                  <AlertTriangle className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-slate-900">
                    Delete Candidate Permanently
                  </h3>
                  <p className="text-xs text-slate-500 font-mono">
                    {candidateToDelete.candidateCode || candidateToDelete.id}
                  </p>
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-1">
                <div>
                  <span className="text-slate-500 font-medium">Candidate Name: </span>
                  <strong className="text-slate-900">{candidateToDelete.candidate?.firstName} {candidateToDelete.candidate?.lastName}</strong>
                </div>
                <div>
                  <span className="text-slate-500 font-medium">Email Address: </span>
                  <strong className="text-slate-900 font-mono">{candidateToDelete.candidate?.email}</strong>
                </div>
                <div>
                  <span className="text-slate-500 font-medium">Applied Position: </span>
                  <strong className="text-slate-900">{candidateToDelete.job?.title || 'Open Position'}</strong>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-900 text-[11px] leading-relaxed">
                <strong>⚠️ Warning:</strong> This action is permanent and cannot be undone. All application records, interview feedback, test evaluations, and offer letters for this candidate will be deleted everywhere in the database.
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setDeleteModalOpen(false)}
                  disabled={deleting}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition-all disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleConfirmDelete}
                  disabled={deleting}
                  className="inline-flex items-center gap-1.5 px-5 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white font-extrabold text-xs shadow-xs transition-all disabled:opacity-50"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>{deleting ? 'Deleting Everywhere...' : 'Confirm & Delete Everywhere'}</span>
                </button>
              </div>
            </div>
          </div>,
          document.body
        )}

        {/* Modals */}
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
          showActions={isManager || isAdmin}
          onViewResume={(url, name) => {
            setActiveResumeUrl(url);
            setActiveCandidateName(name);
            setResumeModalOpen(true);
          }}
        />
      </div>
    </DashboardLayout>
  );
};

export default Candidates;