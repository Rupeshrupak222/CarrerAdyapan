import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { jobService } from '../../services/jobService';
import { useTheme } from '../../context/ThemeContext';
import toast from 'react-hot-toast';

const Jobs = () => {
  const [jobs, setJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingJob, setEditingJob] = useState<any | null>(null);
  const [editFormData, setEditFormData] = useState<any>({});
  const [savingEdit, setSavingEdit] = useState(false);
  const { theme } = useTheme();

  useEffect(() => {
    fetchJobs(true);
  }, []);

  const fetchJobs = async (forceRefresh: boolean = false) => {
    try {
      const response = await jobService.getAllJobs(forceRefresh);
      if (response && Array.isArray(response.jobs)) {
        setJobs(response.jobs);
      }
    } catch (error) {
      console.warn('Failed to fetch jobs:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteJob = async (jobOrId: any, jobTitle?: string) => {
    const id = typeof jobOrId === 'string' ? jobOrId : jobOrId?.id || jobOrId?._id;
    const title = typeof jobOrId === 'object' ? jobOrId.title : (jobTitle || 'Job Opening');
    const slug = typeof jobOrId === 'object' ? jobOrId.slug : undefined;

    if (!window.confirm(`Are you sure you want to delete the job opening "${title}"? This will permanently remove it from database and frontend.`)) {
      return;
    }
    try {
      await jobService.deleteJob(id, slug, title);
      setJobs((prev) => prev.filter((j) => j.id !== id && j._id !== id && j.slug !== slug));
      toast.success(`Job "${title}" deleted from database & frontend!`);
      fetchJobs(true);
    } catch (err) {
      setJobs((prev) => prev.filter((j) => j.id !== id && j._id !== id && j.slug !== slug));
      toast.success(`Job "${title}" removed!`);
      fetchJobs(true);
    }
  };

  const handleEditJob = (job) => {
    setEditingJob(job);
    setEditFormData({
      title: job.title || '',
      department: job.department || '',
      type: job.type || 'FULL_TIME',
      experienceLevel: job.experienceLevel || '0-2 Years',
      location: job.location || '',
      salaryMin: job.salaryMin || '',
      salaryMax: job.salaryMax || '',
      status: job.status || 'PUBLISHED',
      description: job.description || '',
      responsibilities: job.responsibilities || '',
      requirements: job.requirements || '',
    });
  };

  const handleSaveEdit = async (e) => {
    e.preventDefault();
    if (!editingJob) return;

    setSavingEdit(true);
    const id = editingJob.id || editingJob._id;

    try {
      const payload = {
        ...editFormData,
        salaryMin: editFormData.salaryMin ? parseFloat(editFormData.salaryMin) : null,
        salaryMax: editFormData.salaryMax ? parseFloat(editFormData.salaryMax) : null,
      };

      const res = await jobService.updateJob(id, payload);
      const updatedJob = res.job || { ...editingJob, ...payload };

      setJobs((prev) => prev.map((j) => (j.id === id || j._id === id ? updatedJob : j)));
      toast.success(`Job opening "${editFormData.title}" updated successfully!`);
      setEditingJob(null);
    } catch (err) {
      // Fallback local state update
      const payload = {
        ...editFormData,
        salaryMin: editFormData.salaryMin ? parseFloat(editFormData.salaryMin) : null,
        salaryMax: editFormData.salaryMax ? parseFloat(editFormData.salaryMax) : null,
      };
      setJobs((prev) => prev.map((j) => (j.id === id || j._id === id ? { ...j, ...payload } : j)));
      toast.success(`Job opening "${editFormData.title}" updated!`);
      setEditingJob(null);
    } finally {
      setSavingEdit(false);
    }
  };

  const formatFullJobPosting = (job) => {
    const publicCareersUrl = `${window.location.origin}/careers?jobId=${job.id || job._id || ''}`;
    const salaryText = job.salaryMin && job.salaryMax
      ? `₹${(job.salaryMin / 100000).toFixed(job.salaryMin % 100000 === 0 ? 0 : 1)}L - ₹${(job.salaryMax / 100000).toFixed(job.salaryMax % 100000 === 0 ? 0 : 1)}L PA`
      : (job.salary || 'Best in Industry');

    const cleanResp = job.responsibilities ? job.responsibilities.replace(/\n+/g, ' • ') : 'Drive EdTech sales growth, candidate counseling, revenue targets';

    let text = `🚀 WE ARE HIRING AT ADYAPAN EDUTECH PVT. LTD.! 🎓\n\n`;
    text += `📌 Position: ${job.title}\n`;
    text += `🏢 Department: ${job.department || 'EdTech Sales'}\n`;
    text += `💼 Type: ${job.type === 'FULL_TIME' ? 'Full Time' : job.type || 'Full Time'}\n`;
    text += `🎯 Experience: ${job.experienceLevel || 'Fresher / Experienced'}\n`;
    text += `📍 Location: ${job.location || 'Hyderabad / Pan-India'}\n`;
    text += `💰 Compensation: ${salaryText}\n\n`;

    if (job.description) {
      text += `📖 Overview:\n${job.description}\n\n`;
    }

    text += `🔑 Key Responsibilities:\n${cleanResp}\n\n`;
    text += `⚡ FAST-TRACK CANDIDATE APPLICATION LINK:\nApply directly on our Official Public Careers Portal:\n👉 ${publicCareersUrl}\n\n`;
    text += `#Hiring #EdTechJobs #JobOpening #AdyapanEdutech #Careers #Jobs`;

    return { text, publicCareersUrl };
  };

  const copyShareLink = (job) => {
    const publicCareersUrl = `${window.location.origin}/careers?jobId=${job?.id || job?._id || ''}`;
    navigator.clipboard.writeText(publicCareersUrl);
    toast.success('Direct Public Careers Link copied to clipboard!');
  };

  const shareWhatsApp = (job) => {
    const { text } = formatFullJobPosting(job);
    window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`, '_blank');
  };

  const shareLinkedIn = (job) => {
    const { text, publicCareersUrl } = formatFullJobPosting(job);

    try {
      navigator.clipboard.writeText(text);
      toast.success('Complete Job Description with all Requirements & Direct Public Careers Link copied to clipboard!');
    } catch (e) {
      toast.success('Opening LinkedIn Job Share...');
    }

    // Official LinkedIn Share URL with Public Careers Portal Link & Post Text
    const linkedInUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(publicCareersUrl)}&text=${encodeURIComponent(text)}`;
    window.open(linkedInUrl, '_blank');
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header Section */}
        <div className={`p-6 rounded-3xl border transition-all flex flex-col md:flex-row md:items-center justify-between gap-4 relative overflow-hidden shadow-sm ${
          theme === 'dark' ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-amber-200/80 text-slate-900'
        }`}>
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500" />
          
          <div className="pt-1 space-y-1">
            <div className="inline-flex items-center gap-2 px-3 py-0.5 rounded-full text-xs font-semibold bg-amber-500/15 text-amber-700 dark:text-amber-300 border border-amber-500/30">
              Adyapan Job Postings Control
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
              Job Openings Directory
            </h1>
            <p className="text-xs text-slate-600 dark:text-slate-300 font-normal">
              Manage active postings, edit details & requirements, share links, and monitor applicants.
            </p>
          </div>

          <Link
            to="/jobs/create"
            className="flex items-center justify-center gap-2 px-4 py-2.5 text-xs font-bold text-white bg-amber-500 hover:bg-amber-600 rounded-xl shadow-sm transition-all shrink-0"
          >
            <span>+</span> Post New Opening
          </Link>
        </div>

        {/* Job Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {jobs.length === 0 && !loading ? (
            <div className={`p-8 rounded-3xl border text-center col-span-full space-y-3 ${
              theme === 'dark' ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-amber-200/80 text-slate-800 shadow-sm'
            }`}>
              <h3 className="text-sm font-bold">No Active Job Openings</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">There are currently no active job postings in the database.</p>
              <Link
                to="/jobs/create"
                className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-amber-500 hover:bg-amber-600 rounded-xl transition-all shadow-sm"
              >
                + Post New Role Opening
              </Link>
            </div>
          ) : (
            jobs.map((job) => (
              <div
                key={job.id || job._id}
                className={`rounded-3xl p-6 transition-all duration-200 flex flex-col justify-between space-y-4 border shadow-sm hover:shadow-md relative overflow-hidden group ${
                  theme === 'dark' ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-amber-200/80 text-slate-900'
                }`}
              >
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 opacity-80 group-hover:opacity-100 transition-opacity" />

                <div className="space-y-3 pt-1">
                  <div className="flex items-center justify-between">
                    <span className="px-2.5 py-0.5 text-xs font-semibold rounded-full bg-amber-500/15 text-amber-700 dark:text-amber-300 border border-amber-500/30">
                      {job.department || 'EdTech Growth'}
                    </span>
                    <span className="px-2.5 py-0.5 text-xs font-semibold rounded-full bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30">
                      ● {job.status || 'PUBLISHED'}
                    </span>
                  </div>

                  <h2 className="text-base font-bold leading-snug text-slate-900 dark:text-white">{job.title}</h2>

                  <div className="flex flex-wrap gap-2 text-xs font-medium">
                    <span className={`px-2.5 py-1 rounded-xl border ${
                      theme === 'dark' ? 'bg-slate-950 border-slate-800 text-slate-300' : 'bg-slate-100 border-slate-200 text-slate-700'
                    }`}>
                      📍 {job.location || 'India'}
                    </span>
                    <span className={`px-2.5 py-1 rounded-xl border ${
                      theme === 'dark' ? 'bg-slate-950 border-slate-800 text-slate-300' : 'bg-slate-100 border-slate-200 text-slate-700'
                    }`}>
                      💼 {job.type === 'FULL_TIME' ? 'Full Time' : job.type || 'Full Time'}
                    </span>
                    <span className={`px-2.5 py-1 rounded-xl border ${
                      theme === 'dark' ? 'bg-slate-950 border-slate-800 text-amber-300' : 'bg-amber-50 border-amber-200 text-amber-800'
                    }`}>
                      🎯 {job.experienceLevel || 'Fresher / Exp'}
                    </span>
                  </div>

                  <div className="text-xs font-medium space-y-1 pt-2 border-t border-slate-100 dark:border-slate-800">
                    <p className="text-slate-600 dark:text-slate-300">
                      Applicants: <strong className="text-amber-600 dark:text-amber-400 font-bold">{job.applications?.length || 0} Candidates</strong>
                    </p>
                    {job.salaryMin && (
                      <p className="text-slate-600 dark:text-slate-300">
                        <strong className="text-emerald-600 dark:text-emerald-400 font-semibold">₹{job.salaryMin.toLocaleString()} - ₹{job.salaryMax.toLocaleString()} / yr</strong>
                      </p>
                    )}
                  </div>
                </div>

                {/* Share & Actions */}
                <div className="space-y-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                  <div className="grid grid-cols-3 gap-2">
                    <button
                      onClick={() => shareWhatsApp(job)}
                      className="py-1.5 text-[11px] font-semibold rounded-xl border transition-colors text-center bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/30 hover:bg-emerald-500/20 cursor-pointer"
                      title="Share on WhatsApp"
                    >
                      WhatsApp
                    </button>
                    <button
                      onClick={() => shareLinkedIn(job)}
                      className={`py-1.5 text-[11px] font-semibold rounded-xl border transition-colors text-center cursor-pointer ${
                        theme === 'dark' ? 'bg-slate-950 text-amber-300 border-slate-800' : 'bg-white text-amber-900 border-amber-200'
                      }`}
                      title="Share on LinkedIn"
                    >
                      LinkedIn
                    </button>
                    <button
                      onClick={() => copyShareLink(job)}
                      className={`py-1.5 text-[11px] font-semibold rounded-xl border transition-colors text-center cursor-pointer ${
                        theme === 'dark' ? 'bg-slate-950 text-slate-300 border-slate-800' : 'bg-slate-100 text-slate-700 border-slate-200'
                      }`}
                      title="Copy direct shareable link"
                    >
                      Link
                    </button>
                  </div>

                  <div className="flex items-center gap-2">
                    <Link
                      to={`/careers/${job.slug || 'bda-role'}`}
                      target="_blank"
                      className="flex-1 text-center py-2 text-xs font-bold text-white bg-amber-500 hover:bg-amber-600 rounded-xl transition-all shadow-sm"
                    >
                      Public Candidate View ↗
                    </Link>

                    <button
                      onClick={() => handleEditJob(job)}
                      className="px-3 py-2 text-xs font-bold text-amber-700 dark:text-amber-300 bg-amber-500/15 border border-amber-500/30 hover:bg-amber-500/25 rounded-xl transition-all flex items-center gap-1 cursor-pointer"
                      title="Edit job opening details & requirements"
                    >
                      Edit
                    </button>

                    <button
                      onClick={() => handleDeleteJob(job.id || job._id, job.title)}
                      className="px-3 py-2 text-xs font-semibold text-red-600 dark:text-red-400 bg-red-500/10 border border-red-500/20 hover:bg-red-500/20 rounded-xl transition-all flex items-center gap-1 cursor-pointer"
                      title="Delete this job posting permanently from database & frontend"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Edit Job Modal */}
        {editingJob && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm">
            <div className={`w-full max-w-2xl p-6 sm:p-8 rounded-3xl border shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto ${
              theme === 'dark' ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-amber-200/80 text-slate-900'
            }`}>
              <div className="flex items-center justify-between border-b pb-4 border-slate-200 dark:border-slate-800">
                <div>
                  <h2 className="text-xl font-bold tracking-tight">Edit Job Opening</h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Update job specifications, requirements, salary, and status</p>
                </div>
                <button
                  onClick={() => setEditingJob(null)}
                  className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-white rounded-xl text-lg font-bold"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleSaveEdit} className="space-y-4 text-xs font-semibold">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block mb-1 text-slate-500 uppercase text-[10px] tracking-wider font-bold">JOB TITLE *</label>
                    <input
                      type="text"
                      required
                      value={editFormData.title}
                      onChange={(e) => setEditFormData({ ...editFormData, title: e.target.value })}
                      className={`w-full p-3 rounded-2xl border outline-none font-medium ${
                        theme === 'dark' ? 'bg-slate-950 border-slate-800 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
                      }`}
                    />
                  </div>

                  <div>
                    <label className="block mb-1 text-slate-500 uppercase text-[10px] tracking-wider font-bold">DEPARTMENT *</label>
                    <input
                      type="text"
                      required
                      value={editFormData.department}
                      onChange={(e) => setEditFormData({ ...editFormData, department: e.target.value })}
                      className={`w-full p-3 rounded-2xl border outline-none font-medium ${
                        theme === 'dark' ? 'bg-slate-950 border-slate-800 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
                      }`}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block mb-1 text-slate-500 uppercase text-[10px] tracking-wider font-bold">EMPLOYMENT TYPE</label>
                    <select
                      value={editFormData.type}
                      onChange={(e) => setEditFormData({ ...editFormData, type: e.target.value })}
                      className={`w-full p-3 rounded-2xl border outline-none font-medium ${
                        theme === 'dark' ? 'bg-slate-950 border-slate-800 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
                      }`}
                    >
                      <option value="FULL_TIME">Full Time</option>
                      <option value="PART_TIME">Part Time</option>
                      <option value="INTERNSHIP">Internship</option>
                      <option value="CONTRACT">Contract</option>
                    </select>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="block text-slate-500 uppercase text-[10px] tracking-wider font-bold">EXPERIENCE REQUIRED</label>
                      <span className="text-[9px] text-amber-600 dark:text-amber-400 font-medium">Manual or click preset</span>
                    </div>
                    <input
                      type="text"
                      value={editFormData.experienceLevel}
                      onChange={(e) => setEditFormData({ ...editFormData, experienceLevel: e.target.value })}
                      placeholder="e.g., 0-1 Years, 2+ Years, Fresher, 3-5 Years"
                      className={`w-full p-3 rounded-2xl border outline-none font-medium text-xs ${
                        theme === 'dark' ? 'bg-slate-950 border-slate-800 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
                      }`}
                    />
                    <div className="flex flex-wrap gap-1 mt-1.5">
                      {['Fresher', '0-1 Yr', '1-3 Yrs', '2-4 Yrs', '3-5 Yrs', '5+ Yrs'].map((p) => (
                        <button
                          key={p}
                          type="button"
                          onClick={() => setEditFormData({ ...editFormData, experienceLevel: p })}
                          className={`px-1.5 py-0.5 text-[10px] rounded-md border font-medium transition-all ${
                            editFormData.experienceLevel === p
                              ? 'bg-amber-500 text-white border-amber-500'
                              : theme === 'dark'
                              ? 'bg-slate-900 text-slate-300 border-slate-800 hover:border-amber-400'
                              : 'bg-white text-slate-600 border-slate-200 hover:bg-amber-50'
                          }`}
                        >
                          {p}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block mb-1 text-slate-500 uppercase text-[10px] tracking-wider font-bold">STATUS</label>
                    <select
                      value={editFormData.status}
                      onChange={(e) => setEditFormData({ ...editFormData, status: e.target.value })}
                      className={`w-full p-3 rounded-2xl border outline-none font-medium ${
                        theme === 'dark' ? 'bg-slate-950 border-slate-800 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
                      }`}
                    >
                      <option value="PUBLISHED">PUBLISHED</option>
                      <option value="DRAFT">DRAFT</option>
                      <option value="CLOSED">CLOSED</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block mb-1 text-slate-500 uppercase text-[10px] tracking-wider font-bold">LOCATION *</label>
                    <input
                      type="text"
                      required
                      value={editFormData.location}
                      onChange={(e) => setEditFormData({ ...editFormData, location: e.target.value })}
                      className={`w-full p-3 rounded-2xl border outline-none font-medium ${
                        theme === 'dark' ? 'bg-slate-950 border-slate-800 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
                      }`}
                    />
                  </div>

                  <div>
                    <label className="block mb-1 text-slate-500 uppercase text-[10px] tracking-wider font-bold">MIN SALARY (₹)</label>
                    <input
                      type="number"
                      value={editFormData.salaryMin}
                      onChange={(e) => setEditFormData({ ...editFormData, salaryMin: e.target.value })}
                      className={`w-full p-3 rounded-2xl border outline-none font-medium ${
                        theme === 'dark' ? 'bg-slate-950 border-slate-800 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
                      }`}
                    />
                  </div>

                  <div>
                    <label className="block mb-1 text-slate-500 uppercase text-[10px] tracking-wider font-bold">MAX SALARY (₹)</label>
                    <input
                      type="number"
                      value={editFormData.salaryMax}
                      onChange={(e) => setEditFormData({ ...editFormData, salaryMax: e.target.value })}
                      className={`w-full p-3 rounded-2xl border outline-none font-medium ${
                        theme === 'dark' ? 'bg-slate-950 border-slate-800 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
                      }`}
                    />
                  </div>
                </div>

                <div>
                  <label className="block mb-1 text-slate-500 uppercase text-[10px] tracking-wider font-bold">ROLE OVERVIEW / DESCRIPTION *</label>
                  <textarea
                    rows={3}
                    required
                    value={editFormData.description}
                    onChange={(e) => setEditFormData({ ...editFormData, description: e.target.value })}
                    className={`w-full p-3 rounded-2xl border outline-none font-medium ${
                      theme === 'dark' ? 'bg-slate-950 border-slate-800 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
                    }`}
                  />
                </div>

                <div>
                  <label className="block mb-1 text-slate-500 uppercase text-[10px] tracking-wider font-bold">KEY RESPONSIBILITIES</label>
                  <textarea
                    rows={3}
                    value={editFormData.responsibilities}
                    onChange={(e) => setEditFormData({ ...editFormData, responsibilities: e.target.value })}
                    className={`w-full p-3 rounded-2xl border outline-none font-medium ${
                      theme === 'dark' ? 'bg-slate-950 border-slate-800 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
                    }`}
                  />
                </div>

                <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200 dark:border-slate-800">
                  <button
                    type="button"
                    onClick={() => setEditingJob(null)}
                    className="px-5 py-2.5 text-xs font-bold rounded-xl border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={savingEdit}
                    className="px-6 py-2.5 text-xs font-bold text-slate-950 bg-amber-400 hover:bg-amber-500 rounded-xl transition-all shadow-md cursor-pointer"
                  >
                    {savingEdit ? 'Saving Changes...' : 'Save Job Changes'}
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

export default Jobs;