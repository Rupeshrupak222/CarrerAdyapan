import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import * as XLSX from 'xlsx';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { candidateService } from '../../services/candidateService';
import { interviewService } from '../../services/interviewService';
import { applicationService } from '../../services/applicationService';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';
import { 
  Users, 
  Search, 
  Filter, 
  Download, 
  Upload, 
  Plus, 
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
  ExternalLink,
  ChevronRight,
  UserCheck,
  RefreshCw,
  Eye,
  SlidersHorizontal
} from 'lucide-react';

const Candidates: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [candidates, setCandidates] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [hrFilter, setHrFilter] = useState('ALL');
  const [roundFilter, setRoundFilter] = useState('ALL');
  const [viewMode, setViewMode] = useState<'table' | 'grid'>('table');

  // Single Candidate Scheduling Modal
  const [schedulingCandidate, setSchedulingCandidate] = useState<any>(null);
  const [scheduleModalOpen, setScheduleModalOpen] = useState(false);
  const [scheduleFormData, setScheduleFormData] = useState({
    roundNumber: 1,
    roundName: 'Round 1: Screening / HR',
    scheduledAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().slice(0, 16),
    duration: 30,
    type: 'VIDEO',
    meetingLink: user?.meetLink || 'https://meet.google.com/adyapan-interview',
    instructions: 'Please be ready with a quiet setup and video enabled.',
  });

  // Manual Add Candidate Modal
  const [showAddModal, setShowAddModal] = useState(false);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    currentPosition: 'Business Development Associate',
    experience: '1',
    location: 'Hyderabad',
    skills: 'Sales, Communication, Lead Generation',
  });

  useEffect(() => {
    fetchCandidates();
  }, [user]);

  const fetchCandidates = async () => {
    try {
      setLoading(true);
      const res = await candidateService.getAllCandidates(true);
      if (res?.candidates && Array.isArray(res.candidates)) {
        setCandidates(res.candidates);
      } else {
        setCandidates([]);
      }
    } catch (error) {
      console.warn('Candidates fetch error:', error);
      setCandidates([]);
    } finally {
      setLoading(false);
    }
  };

  const handleExportExcel = () => {
    if (candidates.length === 0) {
      toast.error('No candidates available to export.');
      return;
    }

    const exportData = candidates.map((cand) => {
      const app = cand.applications?.[0];
      return {
        'Candidate ID': cand.candidateCode || 'CAND-000000',
        'Full Name': `${cand.firstName} ${cand.lastName}`,
        'Email Address': cand.email,
        'Phone': cand.phone || 'N/A',
        'Role Applied': app?.job?.title || 'BDA',
        'Current Round': app?.currentRound !== undefined ? `Round ${app.currentRound}` : 'Applied',
        'Pipeline Status': app?.overallStatus || app?.status || 'APPLIED',
        'ATS Score (%)': cand.aiScore || 80,
        'Assigned HR': app?.assignedHr?.name || 'Unassigned',
        'Applied Date': new Date(cand.createdAt).toLocaleDateString(),
      };
    });

    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Candidates_Master');
    XLSX.writeFile(workbook, `Adyapan_Candidates_Directory_${new Date().toISOString().split('T')[0]}.xlsx`);
    toast.success('Candidates directory exported to Excel!');
  };

  const handleAddCandidateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const toastId = toast.loading('Creating candidate record...');
    try {
      await candidateService.createCandidate({
        ...formData,
        skills: formData.skills.split(',').map((s) => s.trim()),
      });
      toast.success('Candidate profile created successfully!', { id: toastId });
      setShowAddModal(false);
      fetchCandidates();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Failed to create candidate', { id: toastId });
    }
  };

  const handleOpenSchedule = (cand: any) => {
    const app = cand.applications?.[0];
    const nextRound = (app?.currentRound || 0) + 1;
    let roundTitle = `Round ${nextRound}: Assessment`;
    if (nextRound === 1) roundTitle = 'Round 1: Screening / HR';
    else if (nextRound === 2) roundTitle = 'Round 2: Technical / Sales Pitch';
    else if (nextRound === 3) roundTitle = 'Round 3: Final Management HR';

    setSchedulingCandidate(cand);
    setScheduleFormData({
      roundNumber: nextRound,
      roundName: roundTitle,
      scheduledAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().slice(0, 16),
      duration: 30,
      type: 'VIDEO',
      meetingLink: user?.meetLink || 'https://meet.google.com/adyapan-interview',
      instructions: 'Please be seated in a quiet room with video enabled.',
    });
    setScheduleModalOpen(true);
  };

  const handleScheduleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!schedulingCandidate) return;
    const app = schedulingCandidate.applications?.[0];
    const toastId = toast.loading(`Scheduling ${scheduleFormData.roundName}...`);
    try {
      await interviewService.createInterview({
        applicationId: app?.id,
        candidateId: schedulingCandidate.id,
        candidateName: `${schedulingCandidate.firstName} ${schedulingCandidate.lastName}`,
        candidateEmail: schedulingCandidate.email,
        jobTitle: app?.job?.title || 'Business Development Associate',
        jobId: app?.jobId,
        hrId: user?.id,
        roundNumber: scheduleFormData.roundNumber,
        roundName: scheduleFormData.roundName,
        scheduledAt: new Date(scheduleFormData.scheduledAt).toISOString(),
        duration: scheduleFormData.duration,
        type: scheduleFormData.type,
        meetingLink: scheduleFormData.meetingLink,
      });

      toast.success(`${scheduleFormData.roundName} scheduled & candidate emailed!`, { id: toastId });
      setScheduleModalOpen(false);
      fetchCandidates();
    } catch (err: any) {
      toast.error('Failed to schedule interview', { id: toastId });
    }
  };

  const isHR = user?.role === 'HR';

  const filteredCandidates = candidates.filter((cand) => {
    const q = search.toLowerCase();
    const fullName = `${cand.firstName} ${cand.lastName}`.toLowerCase();
    const email = (cand.email || '').toLowerCase();
    const code = (cand.candidateCode || '').toLowerCase();
    const matchesSearch = !q || fullName.includes(q) || email.includes(q) || code.includes(q);

    const app = cand.applications?.[0];

    // STRICT HR ISOLATION: HR Specialist sees ONLY their assigned candidates
    if (isHR && user?.id) {
      const isAssignedToMe = 
        app?.assignedHrId === user.id || 
        app?.assignedHr?.email?.toLowerCase() === user.email?.toLowerCase();
      if (!isAssignedToMe) return false;
    }

    const matchesStatus = statusFilter === 'ALL' || (app?.overallStatus || app?.status) === statusFilter;
    const matchesRound = roundFilter === 'ALL' || String(app?.currentRound) === roundFilter;
    const matchesHr = hrFilter === 'ALL' || app?.assignedHrId === hrFilter || app?.assignedHr?.email === hrFilter;

    return matchesSearch && matchesStatus && matchesRound && matchesHr;
  });

  return (
    <DashboardLayout>
      <div className="space-y-6 animate-fadeIn">
        {/* Top Header Banner */}
        <div className="p-6 sm:p-8 rounded-3xl bg-white border border-slate-200 shadow-sm relative overflow-hidden">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-amber-50 border border-amber-200 text-amber-800 text-xs font-bold uppercase tracking-wider mb-2">
                <Users className="w-3.5 h-3.5 text-amber-600" />
                Talent Pool Directory
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
                Candidate Management Hub
              </h1>
              <p className="text-slate-500 text-sm mt-1">
                Showing <strong>{filteredCandidates.length}</strong> of <strong>{candidates.length}</strong> active applicants.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <button
                onClick={handleExportExcel}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold transition-all border border-slate-200"
              >
                <Download className="w-4 h-4 text-emerald-600" /> Export Excel
              </button>

              <button
                onClick={() => setShowAddModal(true)}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white font-extrabold text-xs transition-all shadow-md shadow-amber-500/25"
              >
                <Plus className="w-4 h-4" /> Add Candidate
              </button>

              <button
                onClick={fetchCandidates}
                className="p-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition-all border border-slate-200"
                title="Refresh"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Filter & Search Bar */}
        <div className="p-4 rounded-2xl bg-white border border-slate-200 flex flex-col lg:flex-row items-center justify-between gap-3 shadow-sm">
          <div className="relative w-full lg:w-96">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search candidate name, email, code..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs placeholder:text-slate-400 focus:border-amber-500 outline-none"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2.5 w-full lg:w-auto">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-700 text-xs font-semibold focus:border-amber-500 outline-none"
            >
              <option value="ALL">All Statuses</option>
              <option value="APPLIED">Applied</option>
              <option value="SHORTLISTED">Shortlisted</option>
              <option value="HR_ASSIGNED">HR Assigned</option>
              <option value="INTERVIEWING">Interviewing</option>
              <option value="SELECTED">Selected</option>
              <option value="OFFER_PENDING">Offer Pending</option>
              <option value="OFFER_ACCEPTED">Offer Accepted</option>
              <option value="DOCUMENT_VERIFICATION">Onboarding</option>
              <option value="JOINED">Joined</option>
              <option value="REJECTED">Rejected</option>
            </select>

            <select
              value={roundFilter}
              onChange={(e) => setRoundFilter(e.target.value)}
              className="px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-700 text-xs font-semibold focus:border-amber-500 outline-none"
            >
              <option value="ALL">All Rounds</option>
              <option value="0">Screened (Round 0)</option>
              <option value="1">Round 1 (Screening)</option>
              <option value="2">Round 2 (Technical)</option>
              <option value="3">Round 3 (Final)</option>
            </select>

            <div className="flex items-center rounded-xl bg-slate-100 border border-slate-200 p-1">
              <button
                onClick={() => setViewMode('table')}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                  viewMode === 'table' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                Table
              </button>
              <button
                onClick={() => setViewMode('grid')}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                  viewMode === 'grid' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                Cards
              </button>
            </div>
          </div>
        </div>

        {/* Candidates View: Table or Grid */}
        {viewMode === 'table' ? (
          <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider">
                    <th className="py-4 px-5">Candidate Code & Name</th>
                    <th className="py-4 px-5">Job Opening</th>
                    <th className="py-4 px-5">ATS AI Score</th>
                    <th className="py-4 px-5">Assigned HR</th>
                    <th className="py-4 px-5">Current Round</th>
                    <th className="py-4 px-5">Status</th>
                    <th className="py-4 px-5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {loading ? (
                    <tr>
                      <td colSpan={7} className="py-16 text-center text-slate-400">
                        <div className="w-8 h-8 border-2 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
                        Loading candidate records...
                      </td>
                    </tr>
                  ) : filteredCandidates.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-16 text-center text-slate-400 font-medium">
                        No candidates found matching selected filters.
                      </td>
                    </tr>
                  ) : (
                    filteredCandidates.map((cand) => {
                      const app = cand.applications?.[0];
                      const score = Math.round(cand.aiScore || app?.aiScore || 75);
                      return (
                        <tr key={cand.id} className="hover:bg-slate-50/80 transition-colors">
                          <td className="py-4 px-5">
                            <div className="flex items-center gap-3">
                              <div className="w-9 h-9 rounded-xl bg-amber-50 border border-amber-200 text-amber-700 font-black text-xs flex items-center justify-center shrink-0">
                                {cand.firstName?.[0] || 'C'}
                              </div>
                              <div>
                                <Link to={`/candidates/${cand.id}`} className="font-bold text-slate-900 text-sm hover:text-amber-600 transition-colors">
                                  {cand.firstName} {cand.lastName}
                                </Link>
                                <span className="text-[11px] text-slate-400 block font-mono">
                                  {cand.candidateCode || 'CAND-000000'} • {cand.email}
                                </span>
                              </div>
                            </div>
                          </td>

                          <td className="py-4 px-5">
                            <span className="font-semibold text-slate-800 block">{app?.job?.title || 'BDA'}</span>
                            <span className="text-[11px] text-slate-500">{cand.location || 'Hyderabad'}</span>
                          </td>

                          <td className="py-4 px-5">
                            <div className="flex items-center gap-2">
                              <div className="w-12 h-2 rounded-full bg-slate-100 overflow-hidden">
                                <div
                                  className={`h-full rounded-full ${
                                    score >= 80 ? 'bg-emerald-500' : score >= 65 ? 'bg-amber-500' : 'bg-red-500'
                                  }`}
                                  style={{ width: `${score}%` }}
                                ></div>
                              </div>
                              <span className="font-bold text-slate-800 text-xs">{score}%</span>
                            </div>
                          </td>

                          <td className="py-4 px-5">
                            <span className="px-2.5 py-1 rounded-xl bg-slate-100 text-slate-700 font-medium">
                              {app?.assignedHr?.name?.split(' ')?.[0] || 'Unassigned'}
                            </span>
                          </td>

                          <td className="py-4 px-5">
                            <span className="px-2.5 py-1 rounded-xl bg-amber-50 text-amber-700 font-bold border border-amber-200">
                              {app?.currentRound === 0 || !app?.currentRound ? 'Screened' : `Round ${app.currentRound}`}
                            </span>
                          </td>

                          <td className="py-4 px-5">
                            <span className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase ${
                              (app?.overallStatus || app?.status) === 'SELECTED' || (app?.overallStatus || app?.status) === 'JOINED'
                                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                : (app?.overallStatus || app?.status) === 'REJECTED'
                                ? 'bg-red-50 text-red-700 border border-red-200'
                                : 'bg-amber-50 text-amber-700 border border-amber-200'
                            }`}>
                              {app?.overallStatus || app?.status || 'APPLIED'}
                            </span>
                          </td>

                          <td className="py-4 px-5 text-right">
                            <div className="flex items-center justify-end gap-2">
                              {cand.resumeUrl && (
                                <a
                                  href={cand.resumeUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 transition-all"
                                  title="View Resume"
                                >
                                  <FileText className="w-4 h-4" />
                                </a>
                              )}

                              <button
                                onClick={() => handleOpenSchedule(cand)}
                                className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white font-bold transition-all shadow-sm"
                              >
                                Schedule
                              </button>

                              <Link
                                to={`/candidates/${cand.id}`}
                                className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 transition-all"
                                title="View 360 Profile"
                              >
                                <Eye className="w-4 h-4" />
                              </Link>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          /* Grid View */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredCandidates.map((cand) => {
              const app = cand.applications?.[0];
              const score = Math.round(cand.aiScore || app?.aiScore || 75);
              return (
                <div key={cand.id} className="p-6 rounded-3xl bg-white border border-slate-200 hover:border-amber-400 transition-all shadow-sm space-y-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-11 h-11 rounded-2xl bg-amber-50 border border-amber-200 text-amber-700 font-black text-sm flex items-center justify-center shrink-0">
                        {cand.firstName?.[0] || 'C'}
                      </div>
                      <div>
                        <Link to={`/candidates/${cand.id}`} className="font-bold text-slate-900 text-base hover:text-amber-600 transition-colors block">
                          {cand.firstName} {cand.lastName}
                        </Link>
                        <span className="text-[11px] text-slate-400 font-mono">{cand.candidateCode || 'CAND-000000'}</span>
                      </div>
                    </div>

                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase ${
                      (app?.overallStatus || app?.status) === 'SELECTED'
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        : (app?.overallStatus || app?.status) === 'REJECTED'
                        ? 'bg-red-50 text-red-700 border border-red-200'
                        : 'bg-amber-50 text-amber-700 border border-amber-200'
                    }`}>
                      {app?.overallStatus || app?.status || 'APPLIED'}
                    </span>
                  </div>

                  <div className="space-y-2 text-xs text-slate-600">
                    <div className="flex items-center gap-2">
                      <Mail className="w-3.5 h-3.5 text-slate-400" />
                      <span className="truncate">{cand.email}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Phone className="w-3.5 h-3.5 text-slate-400" />
                      <span>{cand.phone || '+91 98765-43210'}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <UserCheck className="w-3.5 h-3.5 text-amber-600" />
                      <span>Assigned HR: <strong>{app?.assignedHr?.name || 'Unassigned'}</strong></span>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                      <span className="font-bold text-slate-800 text-xs">{score}% Match</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleOpenSchedule(cand)}
                        className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 text-white font-bold text-xs transition-all shadow-sm"
                      >
                        Schedule
                      </button>
                      <Link
                        to={`/candidates/${cand.id}`}
                        className="p-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 text-xs transition-all"
                      >
                        <ChevronRight className="w-4 h-4" />
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Schedule Round Modal */}
        {scheduleModalOpen && (
          <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="max-w-md w-full bg-white border border-slate-200 rounded-3xl p-6 shadow-2xl animate-fadeIn">
              <h3 className="text-xl font-extrabold text-slate-900 mb-1">
                Schedule {scheduleFormData.roundName}
              </h3>
              <p className="text-xs text-slate-500 mb-5">
                Candidate: <strong className="text-amber-600">{schedulingCandidate?.firstName} {schedulingCandidate?.lastName}</strong>
              </p>

              <form onSubmit={handleScheduleSubmit} className="space-y-4 text-xs">
                <div>
                  <label className="text-slate-600 font-semibold uppercase">Round Name</label>
                  <input
                    type="text"
                    value={scheduleFormData.roundName}
                    onChange={(e) => setScheduleFormData({ ...scheduleFormData, roundName: e.target.value })}
                    className="mt-1 w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 font-medium outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="text-slate-600 font-semibold uppercase">Date & Time</label>
                  <input
                    type="datetime-local"
                    value={scheduleFormData.scheduledAt}
                    onChange={(e) => setScheduleFormData({ ...scheduleFormData, scheduledAt: e.target.value })}
                    className="mt-1 w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 font-medium outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="text-slate-600 font-semibold uppercase">Google Meet Call Link</label>
                  <input
                    type="text"
                    value={scheduleFormData.meetingLink}
                    onChange={(e) => setScheduleFormData({ ...scheduleFormData, meetingLink: e.target.value })}
                    className="mt-1 w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 font-medium outline-none focus:border-amber-500"
                  />
                </div>

                <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setScheduleModalOpen(false)}
                    className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 text-white font-extrabold shadow-md shadow-amber-500/25"
                  >
                    Confirm & Send Email
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Add Candidate Modal */}
        {showAddModal && (
          <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="max-w-md w-full bg-white border border-slate-200 rounded-3xl p-6 shadow-2xl animate-fadeIn">
              <h3 className="text-xl font-extrabold text-slate-900 mb-1">Add Candidate Profile</h3>
              <p className="text-xs text-slate-500 mb-5">Create a candidate profile in the ATS database.</p>

              <form onSubmit={handleAddCandidateSubmit} className="space-y-3.5 text-xs">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-slate-600 font-semibold uppercase">First Name</label>
                    <input
                      type="text"
                      required
                      value={formData.firstName}
                      onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                      className="mt-1 w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 outline-none focus:border-amber-500"
                    />
                  </div>
                  <div>
                    <label className="text-slate-600 font-semibold uppercase">Last Name</label>
                    <input
                      type="text"
                      value={formData.lastName}
                      onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                      className="mt-1 w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 outline-none focus:border-amber-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-slate-600 font-semibold uppercase">Email</label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="mt-1 w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="text-slate-600 font-semibold uppercase">Phone</label>
                  <input
                    type="text"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="mt-1 w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 outline-none focus:border-amber-500"
                  />
                </div>

                <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 text-white font-extrabold shadow-md shadow-amber-500/25"
                  >
                    Create Candidate
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default Candidates;