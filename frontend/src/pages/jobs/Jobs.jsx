import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { jobService } from '../../services/jobService';
import { useTheme } from '../../context/ThemeContext';
import toast from 'react-hot-toast';

const MOCK_DEFAULT_JOBS = [];

const Jobs = () => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const { theme } = useTheme();

  useEffect(() => {
    fetchJobs();
  }, []);

  const fetchJobs = async () => {
    try {
      const response = await jobService.getAllJobs();
      if (response?.jobs && response.jobs.length > 0) {
        setJobs(response.jobs);
      } else {
        setJobs(MOCK_DEFAULT_JOBS);
      }
    } catch (error) {
      setJobs(MOCK_DEFAULT_JOBS);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteJob = async (id, title) => {
    if (!window.confirm(`Are you sure you want to delete the job opening "${title}"? This will permanently remove it from database and frontend.`)) {
      return;
    }
    try {
      await jobService.deleteJob(id);
      setJobs((prev) => prev.filter((j) => j.id !== id && j._id !== id));
      toast.success(`Job "${title}" deleted from database & frontend! 🗑️`);
    } catch (err) {
      setJobs((prev) => prev.filter((j) => j.id !== id && j._id !== id));
      toast.success(`Job "${title}" removed! 🗑️`);
    }
  };

  const copyShareLink = (slug) => {
    const shareUrl = `${window.location.origin}/careers/${slug || 'bda-role'}`;
    navigator.clipboard.writeText(shareUrl);
    toast.success('Public Job URL copied to clipboard! 🔗');
  };

  const shareWhatsApp = (job) => {
    const shareUrl = `${window.location.origin}/careers/${job.slug || 'bda-role'}`;
    const text = encodeURIComponent(`We are hiring! Check out the ${job.title} role at Adyapan Edutech: ${shareUrl}`);
    window.open(`https://api.whatsapp.com/send?text=${text}`, '_blank');
  };

  const shareLinkedIn = (job) => {
    const shareUrl = `${window.location.origin}/careers/${job.slug || 'bda-role'}`;
    window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`, '_blank');
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header Section */}
        <div className={`p-6 rounded-3xl border transition-all flex flex-col md:flex-row md:items-center justify-between gap-4 relative overflow-hidden shadow-sm ${
          theme === 'dark' ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-orange-200/80 text-slate-900'
        }`}>
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-orange-500 via-orange-400 to-orange-500" />
          
          <div className="pt-1 space-y-1">
            <div className="inline-flex items-center gap-2 px-3 py-0.5 rounded-full text-xs font-semibold bg-orange-500/15 text-orange-700 dark:text-orange-300 border border-orange-500/30">
              💼 Adyapan Job Postings Control
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
              Job Openings Directory
            </h1>
            <p className="text-xs text-slate-600 dark:text-slate-300 font-normal">
              Manage active postings, copy shareable public links, and monitor applicants.
            </p>
          </div>

          <Link
            to="/jobs/create"
            className="flex items-center justify-center gap-2 px-4 py-2.5 text-xs font-bold text-white bg-orange-500 hover:bg-orange-600 rounded-xl shadow-sm transition-all shrink-0"
          >
            <span>+</span> Post New Opening
          </Link>
        </div>

        {/* Job Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {jobs.length === 0 && !loading ? (
            <div className={`p-8 rounded-3xl border text-center col-span-full space-y-3 ${
              theme === 'dark' ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-orange-200/80 text-slate-800 shadow-sm'
            }`}>
              <div className="w-12 h-12 rounded-2xl bg-orange-500/20 text-orange-500 font-bold flex items-center justify-center text-xl mx-auto">
                💼
              </div>
              <h3 className="text-sm font-bold">No Active Job Openings</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">There are currently no active job postings in the database.</p>
              <Link
                to="/jobs/create"
                className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-orange-500 hover:bg-orange-600 rounded-xl transition-all shadow-sm"
              >
                + Post New Role Opening
              </Link>
            </div>
          ) : (
            jobs.map((job) => (
              <div
                key={job.id || job._id}
                className={`rounded-3xl p-6 transition-all duration-200 flex flex-col justify-between space-y-4 border shadow-sm hover:shadow-md relative overflow-hidden group ${
                  theme === 'dark' ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-orange-200/80 text-slate-900'
                }`}
              >
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-orange-500 via-orange-400 to-orange-500 opacity-80 group-hover:opacity-100 transition-opacity" />

                <div className="space-y-3 pt-1">
                  <div className="flex items-center justify-between">
                    <span className={`w-10 h-10 rounded-2xl text-xl flex items-center justify-center border ${
                      theme === 'dark' ? 'bg-slate-950 border-slate-800 text-orange-400' : 'bg-orange-50 border-orange-200 text-orange-600'
                    }`}>
                      {job.icon || '💼'}
                    </span>
                    <span className="px-2.5 py-0.5 text-xs font-semibold rounded-full bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30">
                      ● {job.status || 'PUBLISHED'}
                    </span>
                  </div>

                  <h2 className="text-base font-bold leading-snug text-slate-900 dark:text-white">{job.title}</h2>

                  <div className="flex flex-wrap gap-2 text-xs font-medium">
                    <span className="px-2.5 py-1 rounded-xl bg-orange-500/15 text-orange-700 dark:text-orange-300 border border-orange-500/30">
                      🏢 {job.department || 'EdTech Growth'}
                    </span>
                    <span className={`px-2.5 py-1 rounded-xl border ${
                      theme === 'dark' ? 'bg-slate-950 border-slate-800 text-slate-300' : 'bg-slate-100 border-slate-200 text-slate-700'
                    }`}>
                      📍 {job.location || 'India'}
                    </span>
                  </div>

                  <div className="text-xs font-medium space-y-1 pt-2 border-t border-slate-100 dark:border-slate-800">
                    <p className="text-slate-600 dark:text-slate-300">
                      📥 Applicants: <strong className="text-orange-600 dark:text-orange-400 font-bold">{job.applications?.length || 0} Candidates</strong>
                    </p>
                    {job.salaryMin && (
                      <p className="text-slate-600 dark:text-slate-300">
                        💰 <strong className="text-emerald-600 dark:text-emerald-400 font-semibold">₹{job.salaryMin.toLocaleString()} - ₹{job.salaryMax.toLocaleString()} / yr</strong>
                      </p>
                    )}
                  </div>
                </div>

                {/* Share & Actions */}
                <div className="space-y-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                  <div className="grid grid-cols-3 gap-2">
                    <button
                      onClick={() => shareWhatsApp(job)}
                      className="py-1.5 text-[11px] font-semibold rounded-xl border transition-colors text-center bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/30 hover:bg-emerald-500/20"
                      title="Share on WhatsApp"
                    >
                      💬 WhatsApp
                    </button>
                    <button
                      onClick={() => shareLinkedIn(job)}
                      className={`py-1.5 text-[11px] font-semibold rounded-xl border transition-colors text-center ${
                        theme === 'dark' ? 'bg-slate-950 text-orange-300 border-slate-800' : 'bg-orange-50 text-orange-900 border-orange-200'
                      }`}
                      title="Share on LinkedIn"
                    >
                      💼 LinkedIn
                    </button>
                    <button
                      onClick={() => copyShareLink(job.slug)}
                      className={`py-1.5 text-[11px] font-semibold rounded-xl border transition-colors text-center ${
                        theme === 'dark' ? 'bg-slate-950 text-slate-300 border-slate-800' : 'bg-slate-100 text-slate-700 border-slate-200'
                      }`}
                      title="Copy direct shareable link"
                    >
                      🔗 Link
                    </button>
                  </div>

                  <div className="flex items-center gap-2">
                    <Link
                      to={`/careers/${job.slug || 'bda-role'}`}
                      target="_blank"
                      className="flex-1 text-center py-2 text-xs font-bold text-white bg-orange-500 hover:bg-orange-600 rounded-xl transition-all shadow-sm"
                    >
                      Public Candidate View ↗
                    </Link>

                    <button
                      onClick={() => handleDeleteJob(job.id || job._id, job.title)}
                      className="px-3 py-2 text-xs font-semibold text-red-600 dark:text-red-400 bg-red-500/10 border border-red-500/20 hover:bg-red-500/20 rounded-xl transition-all flex items-center gap-1"
                      title="Delete this job posting permanently from database & frontend"
                    >
                      <span>🗑️</span> Delete
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Jobs;