import React, { useState, useEffect, useMemo } from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { 
  Users, 
  Calendar, 
  Clock, 
  CheckCircle2, 
  FileText, 
  Search, 
  RotateCw, 
  ArrowRight,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import toast from 'react-hot-toast';
import applicationService from '../../services/applicationService';
import { useAuth } from '../../context/AuthContext';
import { Link } from 'react-router-dom';
import ResumeViewerModal from '../../components/ats/ResumeViewerModal';
import CandidatePreviewModal from '../../components/ats/CandidatePreviewModal';

const HRDashboard: React.FC = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [applications, setApplications] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Modals
  const [resumeModalOpen, setResumeModalOpen] = useState(false);
  const [activeResumeUrl, setActiveResumeUrl] = useState('');
  const [activeCandidateName, setActiveCandidateName] = useState('');

  const [previewModalOpen, setPreviewModalOpen] = useState(false);
  const [selectedAppForPreview, setSelectedAppForPreview] = useState<any>(null);

  useEffect(() => {
    fetchMyCandidates();
  }, [user]);

  const fetchMyCandidates = async () => {
    try {
      setLoading(true);
      const queryParams: any = {};
      if (user?.role === 'HR' && user?.id) {
        queryParams.assignedHrId = user.id;
      }
      const res = await applicationService.getAllApplications(queryParams);
      if (res?.applications) {
        setApplications(res.applications);
      }
    } catch (err: any) {
      toast.error('Failed to load candidate applications');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenResume = (url: string, name: string) => {
    setActiveResumeUrl(url);
    setActiveCandidateName(name);
    setResumeModalOpen(true);
  };

  const totalCandidates = applications.length;

  const round1Pending = applications.filter((a) =>
    (['ASSIGNED', 'ROUND_1_PENDING', 'PENDING', 'SHORTLISTED'].includes(a.status) || (a.status === 'INTERVIEW_SCHEDULED' && (a.currentRound === 1 || !a.currentRound))) &&
    !['ROUND_1_SELECTED', 'ROUND_1_REJECTED', 'ROUND_2_PENDING', 'ROUND_2_SELECTED', 'ROUND_2_REJECTED', 'FINAL_ROUND', 'FINAL_SELECTED', 'REJECTED', 'OFFER_SENT', 'JOINED'].includes(a.status) &&
    !a.finalSelected
  ).length;

  const round1Cleared = applications.filter((a) =>
    ['ROUND_1_SELECTED', 'ROUND_2_PENDING', 'ROUND_2_SELECTED', 'ROUND_2_REJECTED', 'FINAL_ROUND', 'FINAL_SELECTED', 'OFFER_SENT', 'JOINED'].includes(a.status) ||
    a.interviews?.some((i: any) => i.roundNumber === 1 && (i.result === 'SELECTED' || i.result === 'PASSED'))
  ).length;

  const round1Rejected = applications.filter((a) =>
    a.status === 'ROUND_1_REJECTED' ||
    (a.status === 'REJECTED' && ((a.currentRound === 1 || !a.currentRound) || a.interviews?.some((i: any) => i.roundNumber === 1 && i.result === 'REJECTED')))
  ).length;

  const round2Pending = applications.filter((a) =>
    (['ROUND_1_SELECTED', 'ROUND_2_PENDING'].includes(a.status) || (a.status === 'INTERVIEW_SCHEDULED' && a.currentRound === 2)) &&
    !['ROUND_2_SELECTED', 'ROUND_2_REJECTED', 'FINAL_ROUND', 'FINAL_SELECTED', 'REJECTED', 'OFFER_SENT', 'JOINED'].includes(a.status) &&
    !a.finalSelected
  ).length;

  const round2Cleared = applications.filter((a) =>
    ['ROUND_2_SELECTED', 'FINAL_ROUND', 'FINAL_SELECTED', 'OFFER_SENT', 'JOINED'].includes(a.status) ||
    a.finalSelected ||
    a.interviews?.some((i: any) => i.roundNumber === 2 && (i.result === 'SELECTED' || i.result === 'PASSED'))
  ).length;

  const round2Rejected = applications.filter((a) =>
    a.status === 'ROUND_2_REJECTED' ||
    (a.status === 'REJECTED' && a.currentRound === 2 && a.interviews?.some((i: any) => i.roundNumber === 2 && i.result === 'REJECTED'))
  ).length;

  const finalSelected = applications.filter((a) =>
    ['ROUND_2_SELECTED', 'FINAL_ROUND', 'FINAL_SELECTED', 'OFFER_SENT', 'OFFER_ACCEPTED', 'JOINED'].includes(a.status) ||
    a.finalSelected
  ).length;

  const filteredApps = useMemo(() => {
    return applications.filter((app) => {
      const q = searchQuery.toLowerCase().trim();
      const fullName = `${app.candidate?.firstName || ''} ${app.candidate?.lastName || ''}`.toLowerCase();
      const email = (app.candidate?.email || '').toLowerCase();
      const code = (app.candidateCode || '').toLowerCase();
      return !q || fullName.includes(q) || email.includes(q) || code.includes(q);
    });
  }, [applications, searchQuery]);

  // Pagination Slice
  const totalPages = Math.ceil(filteredApps.length / itemsPerPage) || 1;
  const paginatedApps = useMemo(() => {
    const startIdx = (currentPage - 1) * itemsPerPage;
    return filteredApps.slice(startIdx, startIdx + itemsPerPage);
  }, [filteredApps, currentPage, itemsPerPage]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery]);

  return (
    <DashboardLayout>
      <div className="space-y-6 animate-fadeIn pb-12">
        {/* Simple Header Banner */}
        <div className="p-6 rounded-2xl bg-white border border-slate-200 flex flex-col lg:flex-row lg:items-center justify-between gap-4 shadow-xs">
          <div>
            <span className="text-xs font-bold text-orange-600 uppercase tracking-wider block">
              {user?.role === 'ADMIN' ? 'HR Workspace • Admin Overview' : 'HR Specialist Workspace'}
            </span>
            <h1 className="text-2xl font-black text-slate-900 mt-1">
              Welcome, {user?.name || 'Recruitment Team'}
            </h1>
            <p className="text-slate-500 text-xs sm:text-sm mt-0.5">
              Managing <strong>{totalCandidates} assigned candidate applications</strong> in your personal talent queue.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={fetchMyCandidates}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white hover:bg-slate-50 text-slate-800 text-xs font-bold border border-slate-300 shadow-2xs transition-all"
            >
              <RotateCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} /> Refresh Workspace
            </button>
          </div>
        </div>

        {/* 8 Granular Real-Time Funnel Metric Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
          <div className="p-3.5 rounded-xl bg-white border border-slate-200 shadow-xs">
            <span className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider block">Assigned Pool</span>
            <p className="text-xl font-black text-slate-900 mt-1">{totalCandidates}</p>
          </div>

          <div className="p-3.5 rounded-xl bg-white border border-slate-200 shadow-xs">
            <span className="text-[10px] font-extrabold text-amber-700 uppercase tracking-wider block">Round 1 Pending</span>
            <p className="text-xl font-black text-amber-700 mt-1">{round1Pending}</p>
          </div>

          <div className="p-3.5 rounded-xl bg-white border border-slate-200 shadow-xs">
            <span className="text-[10px] font-extrabold text-emerald-700 uppercase tracking-wider block">Round 1 Cleared</span>
            <p className="text-xl font-black text-emerald-700 mt-1">{round1Cleared}</p>
          </div>

          <div className="p-3.5 rounded-xl bg-white border border-slate-200 shadow-xs">
            <span className="text-[10px] font-extrabold text-rose-600 uppercase tracking-wider block">Round 1 Rejected</span>
            <p className="text-xl font-black text-rose-600 mt-1">{round1Rejected}</p>
          </div>

          <div className="p-3.5 rounded-xl bg-white border border-slate-200 shadow-xs">
            <span className="text-[10px] font-extrabold text-blue-700 uppercase tracking-wider block">Round 2 Pending</span>
            <p className="text-xl font-black text-blue-700 mt-1">{round2Pending}</p>
          </div>

          <div className="p-3.5 rounded-xl bg-white border border-slate-200 shadow-xs">
            <span className="text-[10px] font-extrabold text-blue-800 uppercase tracking-wider block">Round 2 Cleared</span>
            <p className="text-xl font-black text-blue-800 mt-1">{round2Cleared}</p>
          </div>

          <div className="p-3.5 rounded-xl bg-white border border-slate-200 shadow-xs">
            <span className="text-[10px] font-extrabold text-rose-600 uppercase tracking-wider block">Round 2 Rejected</span>
            <p className="text-xl font-black text-rose-600 mt-1">{round2Rejected}</p>
          </div>

          <div className="p-3.5 rounded-xl bg-white border border-slate-200 shadow-xs">
            <span className="text-[10px] font-extrabold text-emerald-700 uppercase tracking-wider block">Final Selected</span>
            <p className="text-xl font-black text-emerald-700 mt-1">{finalSelected}</p>
          </div>
        </div>

        {/* Filter Bar */}
        <div className="p-4 rounded-2xl bg-white border border-slate-200 flex items-center justify-between shadow-xs">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search candidate name, email, ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs placeholder:text-slate-400 focus:border-orange-500 focus:bg-white outline-none transition-all"
            />
          </div>

          <span className="text-xs font-bold text-slate-500">
            {filteredApps.length} Assigned Candidate(s)
          </span>
        </div>

        {/* Clean Assigned Overview Table */}
        <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-500 font-extrabold uppercase tracking-wider">
                  <th className="py-3 px-4">Application ID</th>
                  <th className="py-3 px-4">Candidate</th>
                  <th className="py-3 px-4">Job Role</th>
                  <th className="py-3 px-3">Current Stage</th>
                  <th className="py-3 px-3">Assigned Date</th>
                  <th className="py-3 px-4">Resume</th>
                  <th className="py-3 px-4 text-center min-w-[200px]">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {loading ? (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-slate-400">
                      <div className="flex flex-col items-center gap-2">
                        <div className="w-7 h-7 border-3 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
                        <p className="font-semibold text-xs text-slate-500">Loading assigned candidates...</p>
                      </div>
                    </td>
                  </tr>
                ) : paginatedApps.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-slate-400">
                      <p className="font-semibold text-xs">No candidates found in your talent queue.</p>
                    </td>
                  </tr>
                ) : (
                  paginatedApps.map((app) => {
                    const candidate = app.candidate || {};
                    const candName = `${candidate.firstName || ''} ${candidate.lastName || ''}`.trim() || 'Candidate';
                    const appId = app.candidateCode || app.id?.slice(0, 10) || 'APP-2026';

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
                          <span
                            className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase ${
                              app.finalSelected || app.status === 'ROUND_2_SELECTED' || app.status === 'FINAL_ROUND'
                                ? 'bg-emerald-100 text-emerald-800'
                                : app.status === 'ROUND_1_SELECTED'
                                ? 'bg-blue-100 text-blue-800'
                                : app.status?.includes('REJECTED')
                                ? 'bg-red-100 text-red-800'
                                : app.status?.includes('PENDING')
                                ? 'bg-indigo-100 text-indigo-800'
                                : 'bg-amber-100 text-amber-800'
                            }`}
                          >
                            {app.finalSelected
                              ? 'FINAL SELECTED'
                              : app.status === 'ROUND_1_SELECTED'
                              ? 'ROUND 1 CLEARED'
                              : app.status === 'ROUND_1_PENDING'
                              ? 'ROUND 1 SCHEDULED'
                              : app.status === 'ROUND_2_PENDING'
                              ? 'ROUND 2 SCHEDULED'
                              : app.status || 'ASSIGNED'}
                          </span>
                        </td>
                        <td className="py-3.5 px-3 text-slate-500 whitespace-nowrap">
                          {new Date(app.assignedAt || app.updatedAt).toLocaleDateString('en-GB', {
                            day: '2-digit',
                            month: 'short',
                          })}
                        </td>
                        <td className="py-3.5 px-4 whitespace-nowrap">
                          <button
                            onClick={() => handleOpenResume(candidate.resumeUrl, candName)}
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold text-xs"
                          >
                            <FileText className="w-3.5 h-3.5 text-orange-600" /> View
                          </button>
                        </td>
                        <td className="py-3.5 px-4 text-center whitespace-nowrap">
                          <div className="flex items-center justify-center gap-1.5">
                            <button
                              onClick={() => {
                                setSelectedAppForPreview(app);
                                setPreviewModalOpen(true);
                              }}
                              className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs"
                            >
                              Preview
                            </button>
                            {app.finalSelected ? (
                              <span className="px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-700 font-extrabold text-xs border border-emerald-200">
                                Final Selected
                              </span>
                            ) : app.currentRound === 2 || app.status === 'ROUND_1_SELECTED' || app.status === 'ROUND_2_PENDING' ? (
                              <Link
                                to="/hr/round-2"
                                className="inline-flex items-center gap-1 px-3 py-1 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs shadow-xs"
                              >
                                Round 2 <ArrowRight className="w-3 h-3" />
                              </Link>
                            ) : (
                              <Link
                                to="/hr/round-1"
                                className="inline-flex items-center gap-1 px-3 py-1 rounded-lg bg-orange-600 hover:bg-orange-700 text-white font-extrabold text-xs shadow-xs"
                              >
                                Round 1 <ArrowRight className="w-3 h-3" />
                              </Link>
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

          {/* Pagination Controls */}
          {filteredApps.length > 0 && (
            <div className="px-6 py-4 border-t border-slate-200 bg-slate-50/50 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
              <div className="text-slate-500 font-medium">
                Showing <strong className="text-slate-800">{(currentPage - 1) * itemsPerPage + 1}</strong> to{' '}
                <strong className="text-slate-800">
                  {Math.min(currentPage * itemsPerPage, filteredApps.length)}
                </strong>{' '}
                of <strong className="text-slate-800">{filteredApps.length}</strong> candidates
              </div>

              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                  disabled={currentPage === 1}
                  className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-slate-300 bg-white font-bold text-slate-700 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                >
                  <ChevronLeft className="w-4 h-4" /> Prev
                </button>

                <div className="flex items-center gap-1">
                  {Array.from({ length: totalPages }, (_, idx) => idx + 1)
                    .filter((page) => page === 1 || page === totalPages || Math.abs(page - currentPage) <= 1)
                    .map((page, idx, arr) => (
                      <React.Fragment key={page}>
                        {idx > 0 && arr[idx - 1] !== page - 1 && (
                          <span className="px-1 text-slate-400">...</span>
                        )}
                        <button
                          onClick={() => setCurrentPage(page)}
                          className={`w-7 h-7 rounded-lg font-bold text-xs transition-all ${
                            currentPage === page
                              ? 'bg-orange-600 text-white shadow-xs'
                              : 'bg-white border border-slate-300 text-slate-700 hover:bg-slate-100'
                          }`}
                        >
                          {page}
                        </button>
                      </React.Fragment>
                    ))}
                </div>

                <button
                  onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-slate-300 bg-white font-bold text-slate-700 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                >
                  Next <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>

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
          onViewResume={handleOpenResume}
          showActions={false}
        />
      </div>
    </DashboardLayout>
  );
};

export default HRDashboard;

