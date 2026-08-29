import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { jobService } from '../../services/jobService';
import { useTheme } from '../../context/ThemeContext';
import toast from 'react-hot-toast';
import {
  Edit3,
  Plus,
  Trash2,
  X,
  Check,
  Save,
  Sparkles,
  Building2,
  MapPin,
  DollarSign,
  Calendar,
  Clock,
  Briefcase,
  Users,
  ExternalLink,
  Share2,
  AlertCircle
} from 'lucide-react';

const JobDetails: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { theme } = useTheme();
  const [job, setJob] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Edit Modal State
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editFormData, setEditFormData] = useState({
    title: '',
    department: '',
    location: '',
    type: 'FULL_TIME',
    experienceLevel: '',
    status: 'PUBLISHED',
    salaryMin: '',
    salaryMax: '',
    description: '',
    requirements: '',
    responsibilities: '',
    interviewRounds: [] as any[],
  });

  useEffect(() => {
    fetchJobDetails();
  }, [id]);

  const fetchJobDetails = async () => {
    try {
      if (!id) return;
      const response = await jobService.getJobById(id);
      if (response?.job) {
        setJob(response.job);
        populateEditForm(response.job);
      } else {
        setJob(null);
      }
    } catch (error) {
      console.warn('Failed to load job from DB:', error);
      setJob(null);
    } finally {
      setLoading(false);
    }
  };

  const populateEditForm = (jobData: any) => {
    let rounds = [];
    if (Array.isArray(jobData.interviewRounds) && jobData.interviewRounds.length > 0) {
      rounds = jobData.interviewRounds;
    } else {
      rounds = [
        { roundNumber: 1, name: 'Round 1: Screening & Domain', type: 'VIDEO' },
        { roundNumber: 2, name: 'Round 2: Technical / Functional Round', type: 'VIDEO' },
        { roundNumber: 3, name: 'Round 3: Leadership & Final Fitment', type: 'VIDEO' },
      ];
    }

    setEditFormData({
      title: jobData.title || '',
      department: jobData.department || '',
      location: jobData.location || '',
      type: jobData.type || 'FULL_TIME',
      experienceLevel: jobData.experienceLevel || '',
      status: jobData.status || 'PUBLISHED',
      salaryMin: jobData.salaryMin ? String(jobData.salaryMin) : '',
      salaryMax: jobData.salaryMax ? String(jobData.salaryMax) : '',
      description: jobData.description || '',
      requirements: jobData.requirements || '',
      responsibilities: jobData.responsibilities || '',
      interviewRounds: rounds,
    });
  };

  const handleOpenEditModal = () => {
    if (job) {
      populateEditForm(job);
      setIsEditModalOpen(true);
    }
  };

  const handleAddRound = () => {
    const nextNum = editFormData.interviewRounds.length + 1;
    setEditFormData({
      ...editFormData,
      interviewRounds: [
        ...editFormData.interviewRounds,
        { roundNumber: nextNum, name: `Round ${nextNum}: Evaluation Round`, type: 'VIDEO' },
      ],
    });
  };

  const handleRemoveRound = (index: number) => {
    if (editFormData.interviewRounds.length <= 1) {
      toast.error('At least 1 interview round is required.');
      return;
    }
    const updated = editFormData.interviewRounds
      .filter((_, i) => i !== index)
      .map((r, i) => ({
        ...r,
        roundNumber: i + 1,
      }));
    setEditFormData({ ...editFormData, interviewRounds: updated });
  };

  const handleRoundNameChange = (index: number, newName: string) => {
    const updated = [...editFormData.interviewRounds];
    updated[index] = { ...updated[index], name: newName };
    setEditFormData({ ...editFormData, interviewRounds: updated });
  };

  const handleSaveJob = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editFormData.title.trim() || !editFormData.department.trim() || !editFormData.location.trim()) {
      toast.error('Please fill in required fields (Title, Department, Location)');
      return;
    }

    setSaving(true);
    const toastId = toast.loading('Saving updated job requisition...');

    try {
      const payload = {
        ...editFormData,
        salaryMin: editFormData.salaryMin ? parseFloat(editFormData.salaryMin) : null,
        salaryMax: editFormData.salaryMax ? parseFloat(editFormData.salaryMax) : null,
        totalRounds: editFormData.interviewRounds.length,
      };

      const response = await jobService.updateJob(job.id, payload);
      if (response?.job) {
        setJob(response.job);
        populateEditForm(response.job);
      } else {
        setJob((prev: any) => ({ ...prev, ...payload }));
      }

      toast.success('Job details updated successfully!', { id: toastId });
      setIsEditModalOpen(false);
    } catch (err: any) {
      console.error('Save job error:', err);
      toast.error(err?.response?.data?.message || 'Failed to update job', { id: toastId });
    } finally {
      setSaving(false);
    }
  };

  const copyShareLink = () => {
    const shareUrl = `${window.location.origin}/careers/${job?.slug || 'bda-role'}`;
    navigator.clipboard.writeText(shareUrl);
    toast.success('Public Job URL copied to clipboard!');
  };

  const shareWhatsApp = () => {
    const shareUrl = `${window.location.origin}/careers/${job?.slug || 'bda-role'}`;
    const text = encodeURIComponent(`🚀 We are hiring at Adyapan Edutech! Check out the ${job?.title} position and apply directly here: ${shareUrl}`);
    window.open(`https://api.whatsapp.com/send?text=${text}`, '_blank');
  };

  const shareLinkedIn = () => {
    const publicCareersUrl = `${window.location.origin}/careers/${job?.slug || 'bda-role'}`;
    const salaryText = job?.salaryMin && job?.salaryMax
      ? `₹${(job.salaryMin / 100000).toFixed(job.salaryMin % 100000 === 0 ? 0 : 1)}L - ₹${(job.salaryMax / 100000).toFixed(job.salaryMax % 100000 === 0 ? 0 : 1)}L PA`
      : 'Competitive / Best in Industry';

    const cleanResp = job?.responsibilities ? job.responsibilities.replace(/\n+/g, ' • ') : '';

    let text = `🚀 WE ARE HIRING AT ADYAPAN EDUTECH PVT. LTD.! 🎓\n\n`;
    text += `📌 Position: ${job?.title || 'Job Opening'}\n`;
    text += `🏢 Department: ${job?.department || 'EdTech Sales & Growth'}\n`;
    text += `💼 Job Type: ${job?.type === 'FULL_TIME' ? 'Full Time' : job?.type || 'Full Time'}\n`;
    text += `🎯 Experience Required: ${job?.experienceLevel || 'Fresher / Experienced'}\n`;
    text += `📍 Location: ${job?.location || 'Hyderabad / Pan-India'}\n`;
    text += `💰 Compensation: ${salaryText}\n\n`;

    if (job?.description) {
      text += `📖 Role Overview:\n${job.description}\n\n`;
    }

    if (cleanResp) {
      text += `🔑 Key Responsibilities:\n• ${cleanResp}\n\n`;
    }

    text += `⚡ DIRECT CANDIDATE APPLICATION LINK:\nApply directly on our Official Public Careers Portal:\n👉 ${publicCareersUrl}\n\n`;
    text += `#Hiring #JobOpening #AdyapanEdutech #Careers #Jobs #Recruitment`;

    try {
      navigator.clipboard.writeText(text);
      toast.success('Complete Job Description & Direct Careers Link copied to clipboard!');
    } catch (e) {
      toast.success('Opening LinkedIn Job Share...');
    }

    const linkedInUrl = `https://www.linkedin.com/feed/?shareActive=true&text=${encodeURIComponent(text)}`;
    window.open(linkedInUrl, '_blank');
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-96">
          <div className="text-center space-y-3">
            <div className="w-10 h-10 border-4 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
            <p className="text-xs font-semibold text-slate-500">Loading job specifications from database...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (!job) {
    return (
      <DashboardLayout>
        <div className="space-y-6">
          <Link to="/jobs" className="text-xs font-semibold text-amber-600 dark:text-amber-400 hover:underline flex items-center gap-1">
            ← Back to Job Openings Directory
          </Link>
          <div className={`p-12 rounded-3xl border text-center space-y-4 shadow-sm ${
            theme === 'dark' ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-slate-200 text-slate-900'
          }`}>
            <div className="w-16 h-16 rounded-full bg-amber-500/10 text-amber-500 flex items-center justify-center mx-auto text-2xl font-bold">
              🔍
            </div>
            <h2 className="text-xl font-bold">Job Opening Not Found</h2>
            <p className="text-xs text-slate-500 max-w-md mx-auto">
              The requested job opening does not exist in the database or may have been deactivated.
            </p>
            <Link
              to="/jobs"
              className="inline-block px-5 py-2.5 bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold rounded-xl transition-all shadow-sm"
            >
              Browse All Active Jobs
            </Link>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  const salaryDisplay = job.salaryMin && job.salaryMax
    ? `₹${(job.salaryMin / 100000).toFixed(job.salaryMin % 100000 === 0 ? 0 : 1)}L - ₹${(job.salaryMax / 100000).toFixed(job.salaryMax % 100000 === 0 ? 0 : 1)}L PA`
    : job.salaryMin
    ? `₹${(job.salaryMin / 100000).toFixed(1)}L+ PA`
    : 'Not Specified';

  const roundsList = Array.isArray(job.interviewRounds) && job.interviewRounds.length > 0
    ? job.interviewRounds
    : [];

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <Link to="/jobs" className="text-xs font-semibold text-amber-600 dark:text-amber-400 hover:underline flex items-center gap-1">
            ← Back to Job Openings Directory
          </Link>
          
          <button
            onClick={handleOpenEditModal}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-extrabold text-xs shadow-md shadow-amber-500/25 transition-all cursor-pointer hover:scale-105 active:scale-95"
          >
            <Edit3 size={15} />
            <span>Edit Job Requisition</span>
          </button>
        </div>

        {/* Job Header Card */}
        <div className={`rounded-3xl border p-6 md:p-8 shadow-sm space-y-6 relative overflow-hidden ${
          theme === 'dark' ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-slate-200 text-slate-900'
        }`}>

          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pt-1">
            <div className="space-y-3">
              <div className="flex flex-wrap items-center gap-2">
                <span className="px-3 py-1 text-xs font-bold bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/20 rounded-full uppercase tracking-wider">
                  {job.department}
                </span>
                <span className={`px-3 py-1 text-xs font-bold rounded-full border ${
                  job.status === 'PUBLISHED'
                    ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30'
                    : job.status === 'CLOSED'
                    ? 'bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/30'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-300 dark:border-slate-700'
                }`}>
                  ● {job.status || 'PUBLISHED'}
                </span>
              </div>

              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">{job.title}</h1>
              
              <div className="flex flex-wrap items-center gap-4 text-xs text-slate-600 dark:text-slate-300">
                <span className="flex items-center gap-1.5 font-medium">
                  <MapPin size={14} className="text-amber-500" /> {job.location}
                </span>
                <span className="flex items-center gap-1.5 font-medium">
                  <Briefcase size={14} className="text-amber-500" /> {job.type === 'FULL_TIME' ? 'Full Time' : job.type === 'PART_TIME' ? 'Part Time' : job.type}
                </span>
                <span className="flex items-center gap-1.5 font-medium">
                  <Clock size={14} className="text-amber-500" /> Experience: <strong className="text-slate-900 dark:text-white font-bold">{job.experienceLevel || 'Fresher / Experienced'}</strong>
                </span>
                {salaryDisplay !== 'Not Specified' && (
                  <span className="flex items-center gap-1.5 font-medium text-emerald-600 dark:text-emerald-400 font-bold">
                    <DollarSign size={14} className="text-emerald-500" /> {salaryDisplay}
                  </span>
                )}
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2.5">
              <button
                onClick={handleOpenEditModal}
                className="px-4 py-2 text-xs font-bold text-slate-900 dark:text-white bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/30 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <Edit3 size={14} className="text-amber-600 dark:text-amber-400" />
                <span>Edit</span>
              </button>
              <button
                onClick={shareWhatsApp}
                className="px-3.5 py-2 text-xs font-semibold text-slate-700 dark:text-slate-300 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer"
              >
                WhatsApp
              </button>
              <button
                onClick={shareLinkedIn}
                className="px-3.5 py-2 text-xs font-semibold text-slate-700 dark:text-slate-300 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer"
              >
                LinkedIn
              </button>
              <button
                onClick={copyShareLink}
                className={`px-3.5 py-2 text-xs font-semibold rounded-xl border transition-all flex items-center gap-1.5 cursor-pointer ${
                  theme === 'dark' ? 'bg-slate-950 text-slate-200 border-slate-800 hover:border-slate-600' : 'bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-200'
                }`}
              >
                Copy Link
              </button>
              <Link
                to={`/careers/${job.slug || 'bda-role'}`}
                target="_blank"
                className="px-4 py-2 text-xs font-bold text-white bg-amber-500 hover:bg-amber-600 rounded-xl transition-all shadow-sm flex items-center gap-1.5"
              >
                <span>Public Candidate View</span>
                <ExternalLink size={13} />
              </Link>
            </div>
          </div>
        </div>

        {/* Details & Description */}
        <div className={`rounded-3xl border p-6 shadow-sm space-y-5 ${
          theme === 'dark' ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-slate-200 text-slate-900'
        }`}>
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
            <h2 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Briefcase size={16} className="text-amber-500" />
              <span>Job Overview &amp; Role Details</span>
            </h2>
            <button
              onClick={handleOpenEditModal}
              className="text-xs font-bold text-amber-600 dark:text-amber-400 hover:underline flex items-center gap-1 cursor-pointer"
            >
              <Edit3 size={13} /> Edit Description
            </button>
          </div>

          <p className="text-xs sm:text-sm font-normal text-slate-700 dark:text-slate-200 leading-relaxed whitespace-pre-line">
            {job.description || 'No detailed overview provided for this role.'}
          </p>
          
          {job.responsibilities && (
            <div className={`p-4 rounded-2xl border text-xs leading-relaxed space-y-1.5 ${
              theme === 'dark' ? 'bg-slate-950 border-slate-800 text-slate-200' : 'bg-amber-500/[0.03] border-amber-500/20 text-slate-800'
            }`}>
              <strong className="text-slate-900 dark:text-white font-bold block mb-1">Key Responsibilities:</strong>
              <p className="whitespace-pre-line text-slate-700 dark:text-slate-300">{job.responsibilities}</p>
            </div>
          )}

          {job.requirements && (
            <div className={`p-4 rounded-2xl border text-xs leading-relaxed space-y-1.5 ${
              theme === 'dark' ? 'bg-slate-950 border-slate-800 text-slate-200' : 'bg-blue-500/[0.03] border-blue-500/20 text-slate-800'
            }`}>
              <strong className="text-slate-900 dark:text-white font-bold block mb-1">Requirements &amp; Qualifications:</strong>
              <p className="whitespace-pre-line text-slate-700 dark:text-slate-300">{job.requirements}</p>
            </div>
          )}
        </div>

        {/* Configured Interview Rounds */}
        {roundsList.length > 0 && (
          <div className={`rounded-3xl border p-6 shadow-sm space-y-4 ${
            theme === 'dark' ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-slate-200 text-slate-900'
          }`}>
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h2 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Calendar size={16} className="text-amber-500" />
                <span>Configured Interview Pipeline ({roundsList.length} Rounds)</span>
              </h2>
              <button
                onClick={handleOpenEditModal}
                className="text-xs font-bold text-amber-600 dark:text-amber-400 hover:underline flex items-center gap-1 cursor-pointer"
              >
                <Edit3 size={13} /> Modify Rounds
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3.5">
              {roundsList.map((round: any, idx: number) => (
                <div
                  key={idx}
                  className={`p-3.5 rounded-2xl border flex items-center gap-3 ${
                    theme === 'dark' ? 'bg-slate-950 border-slate-800' : 'bg-slate-50 border-slate-200'
                  }`}
                >
                  <div className="w-8 h-8 rounded-xl bg-amber-500/15 text-amber-600 dark:text-amber-400 font-extrabold text-xs flex items-center justify-center shrink-0">
                    R{round.roundNumber || idx + 1}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="font-bold text-xs text-slate-900 dark:text-white truncate">
                      {round.name || `Round ${idx + 1}`}
                    </div>
                    <span className="text-[10px] text-slate-500 uppercase font-semibold">
                      {round.type || 'VIDEO'} Interview
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Applicants */}
        <div className={`rounded-3xl border p-6 shadow-sm space-y-4 ${
          theme === 'dark' ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-slate-200 text-slate-900'
        }`}>
          <h2 className="text-sm font-bold text-slate-900 dark:text-white border-b border-slate-100 dark:border-slate-800 pb-3 flex items-center gap-2">
            <Users size={16} className="text-amber-500" />
            <span>Candidates Applied ({job.applications?.length || 0})</span>
          </h2>

          {(!job.applications || job.applications.length === 0) ? (
            <div className="text-center py-8 text-xs font-medium text-slate-500 dark:text-slate-400">
              No candidates have applied for this job opening yet.
            </div>
          ) : (
            <div className="space-y-3">
              {job.applications.map((app: any) => (
                <div key={app.id} className={`flex items-center justify-between p-4 rounded-2xl border ${
                  theme === 'dark' ? 'bg-slate-950 border-slate-800' : 'bg-slate-50 border-slate-200'
                }`}>
                  <div className="flex items-center gap-3">
                    <span className="font-bold text-xs text-slate-900 dark:text-white">
                      {app.candidate?.firstName} {app.candidate?.lastName}
                    </span>
                    {app.aiScore !== undefined && app.aiScore !== null && (
                      <span className="px-2.5 py-0.5 text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 rounded-full">
                        AI Match: {Math.round(app.aiScore)}%
                      </span>
                    )}
                  </div>
                  <Link to={`/candidates/${app.candidate?.id || 'cand-1'}`} className="text-xs font-semibold text-amber-600 dark:text-amber-400 hover:underline">
                    View Candidate Profile →
                  </Link>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ══════════════════════════════════════════════════════════
          EDIT JOB REQUISITION MODAL
         ══════════════════════════════════════════════════════════ */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
          <div className={`w-full max-w-3xl max-h-[90vh] overflow-y-auto rounded-3xl border shadow-2xl p-6 sm:p-8 space-y-6 ${
            theme === 'dark' ? 'bg-[#151412] border-stone-800 text-white' : 'bg-white border-stone-200 text-stone-900'
          }`}>
            <div className="flex items-center justify-between border-b border-stone-200 dark:border-stone-800 pb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-2xl bg-amber-500/15 text-amber-600 dark:text-amber-400 flex items-center justify-center">
                  <Edit3 size={20} />
                </div>
                <div>
                  <h3 className="text-lg font-black text-stone-950 dark:text-white">Edit Job Requisition</h3>
                  <p className="text-xs text-stone-500 dark:text-stone-400">Update title, salary, descriptions and interview rounds.</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsEditModalOpen(false)}
                className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-stone-100 dark:hover:bg-stone-800 text-stone-500 transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveJob} className="space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 dark:text-stone-300 mb-1.5">
                    Job Title *
                  </label>
                  <input
                    type="text"
                    required
                    value={editFormData.title}
                    onChange={(e) => setEditFormData({ ...editFormData, title: e.target.value })}
                    placeholder="e.g. Inside Sales Executive / Telecaller"
                    className="w-full px-4 py-2.5 rounded-xl border border-stone-300 dark:border-stone-700 bg-stone-50 dark:bg-stone-900 text-xs text-stone-950 dark:text-white focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 dark:text-stone-300 mb-1.5">
                    Department *
                  </label>
                  <input
                    type="text"
                    required
                    value={editFormData.department}
                    onChange={(e) => setEditFormData({ ...editFormData, department: e.target.value })}
                    placeholder="e.g. Inside Sales / EdTech Growth"
                    className="w-full px-4 py-2.5 rounded-xl border border-stone-300 dark:border-stone-700 bg-stone-50 dark:bg-stone-900 text-xs text-stone-950 dark:text-white focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 dark:text-stone-300 mb-1.5">
                    Location *
                  </label>
                  <input
                    type="text"
                    required
                    value={editFormData.location}
                    onChange={(e) => setEditFormData({ ...editFormData, location: e.target.value })}
                    placeholder="e.g. Bangalore / On-site"
                    className="w-full px-4 py-2.5 rounded-xl border border-stone-300 dark:border-stone-700 bg-stone-50 dark:bg-stone-900 text-xs text-stone-950 dark:text-white focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 dark:text-stone-300 mb-1.5">
                    Job Type
                  </label>
                  <select
                    value={editFormData.type}
                    onChange={(e) => setEditFormData({ ...editFormData, type: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl border border-stone-300 dark:border-stone-700 bg-stone-50 dark:bg-stone-900 text-xs text-stone-950 dark:text-white focus:outline-none focus:border-amber-500"
                  >
                    <option value="FULL_TIME">Full Time</option>
                    <option value="PART_TIME">Part Time</option>
                    <option value="CONTRACT">Contract</option>
                    <option value="INTERNSHIP">Internship</option>
                    <option value="REMOTE">Remote</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 dark:text-stone-300 mb-1.5">
                    Experience Level
                  </label>
                  <input
                    type="text"
                    value={editFormData.experienceLevel}
                    onChange={(e) => setEditFormData({ ...editFormData, experienceLevel: e.target.value })}
                    placeholder="e.g. 0-2 Years / 1-3 Years"
                    className="w-full px-4 py-2.5 rounded-xl border border-stone-300 dark:border-stone-700 bg-stone-50 dark:bg-stone-900 text-xs text-stone-950 dark:text-white focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 dark:text-stone-300 mb-1.5">
                    Job Status
                  </label>
                  <select
                    value={editFormData.status}
                    onChange={(e) => setEditFormData({ ...editFormData, status: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl border border-stone-300 dark:border-stone-700 bg-stone-50 dark:bg-stone-900 text-xs text-stone-950 dark:text-white focus:outline-none focus:border-amber-500"
                  >
                    <option value="PUBLISHED">Published (Active on Career Portal)</option>
                    <option value="DRAFT">Draft (Hidden)</option>
                    <option value="CLOSED">Closed (Archived)</option>
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 dark:text-stone-300 mb-1.5">
                      Min Salary (₹ PA)
                    </label>
                    <input
                      type="number"
                      value={editFormData.salaryMin}
                      onChange={(e) => setEditFormData({ ...editFormData, salaryMin: e.target.value })}
                      placeholder="e.g. 350000"
                      className="w-full px-3 py-2.5 rounded-xl border border-stone-300 dark:border-stone-700 bg-stone-50 dark:bg-stone-900 text-xs text-stone-950 dark:text-white focus:outline-none focus:border-amber-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 dark:text-stone-300 mb-1.5">
                      Max Salary (₹ PA)
                    </label>
                    <input
                      type="number"
                      value={editFormData.salaryMax}
                      onChange={(e) => setEditFormData({ ...editFormData, salaryMax: e.target.value })}
                      placeholder="e.g. 600000"
                      className="w-full px-3 py-2.5 rounded-xl border border-stone-300 dark:border-stone-700 bg-stone-50 dark:bg-stone-900 text-xs text-stone-950 dark:text-white focus:outline-none focus:border-amber-500"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 dark:text-stone-300 mb-1.5">
                  Job Overview / Description
                </label>
                <textarea
                  rows={4}
                  value={editFormData.description}
                  onChange={(e) => setEditFormData({ ...editFormData, description: e.target.value })}
                  placeholder="Provide an engaging summary of this job role..."
                  className="w-full px-4 py-2.5 rounded-xl border border-stone-300 dark:border-stone-700 bg-stone-50 dark:bg-stone-900 text-xs text-stone-950 dark:text-white focus:outline-none focus:border-amber-500 leading-relaxed"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 dark:text-stone-300 mb-1.5">
                  Key Responsibilities
                </label>
                <textarea
                  rows={4}
                  value={editFormData.responsibilities}
                  onChange={(e) => setEditFormData({ ...editFormData, responsibilities: e.target.value })}
                  placeholder="* Make inbound and outbound calls...&#10;* Understand customer requirements..."
                  className="w-full px-4 py-2.5 rounded-xl border border-stone-300 dark:border-stone-700 bg-stone-50 dark:bg-stone-900 text-xs text-stone-950 dark:text-white focus:outline-none focus:border-amber-500 leading-relaxed font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 dark:text-stone-300 mb-1.5">
                  Requirements &amp; Qualifications
                </label>
                <textarea
                  rows={3}
                  value={editFormData.requirements}
                  onChange={(e) => setEditFormData({ ...editFormData, requirements: e.target.value })}
                  placeholder="* Excellent communication skills...&#10;* Proven experience in sales or counseling..."
                  className="w-full px-4 py-2.5 rounded-xl border border-stone-300 dark:border-stone-700 bg-stone-50 dark:bg-stone-900 text-xs text-stone-950 dark:text-white focus:outline-none focus:border-amber-500 leading-relaxed font-mono"
                />
              </div>

              {/* Interview Rounds Customization */}
              <div className="space-y-3 pt-2 border-t border-stone-200 dark:border-stone-800">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 dark:text-stone-300">
                    Configured Interview Rounds ({editFormData.interviewRounds.length})
                  </label>
                  <button
                    type="button"
                    onClick={handleAddRound}
                    className="inline-flex items-center gap-1 px-3 py-1 rounded-lg bg-amber-500/15 hover:bg-amber-500/25 text-amber-700 dark:text-amber-400 font-bold text-xs transition-colors"
                  >
                    <Plus size={14} /> Add Round
                  </button>
                </div>

                <div className="space-y-2">
                  {editFormData.interviewRounds.map((round, idx) => (
                    <div
                      key={idx}
                      className="flex items-center gap-2.5 p-3 rounded-xl border border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-stone-900"
                    >
                      <span className="w-7 h-7 rounded-lg bg-amber-500/20 text-amber-700 dark:text-amber-400 font-black text-xs flex items-center justify-center shrink-0">
                        {round.roundNumber || idx + 1}
                      </span>
                      <input
                        type="text"
                        value={round.name}
                        onChange={(e) => handleRoundNameChange(idx, e.target.value)}
                        placeholder={`Round ${idx + 1} Name`}
                        className="flex-1 px-3 py-1.5 rounded-lg border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-950 text-xs text-stone-950 dark:text-white focus:outline-none focus:border-amber-500"
                      />
                      <button
                        type="button"
                        onClick={() => handleRemoveRound(idx)}
                        className="p-1.5 rounded-lg text-red-500 hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors"
                        title="Delete Round"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-stone-200 dark:border-stone-800">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  disabled={saving}
                  className="px-5 py-2.5 rounded-xl border border-stone-300 dark:border-stone-700 text-stone-700 dark:text-stone-300 text-xs font-bold hover:bg-stone-100 dark:hover:bg-stone-800 transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white text-xs font-black shadow-lg shadow-amber-500/25 transition-all cursor-pointer disabled:opacity-50"
                >
                  <Save size={15} />
                  <span>{saving ? 'Saving Changes...' : 'Save Job Requisition'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
};

export default JobDetails;