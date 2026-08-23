import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { jobService } from '../../services/jobService';
import { useTheme } from '../../context/ThemeContext';
import toast from 'react-hot-toast';

const JobDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { theme } = useTheme();
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchJobDetails();
  }, [id]);

  const fetchJobDetails = async () => {
    try {
      const response = await jobService.getJobById(id);
      if (response?.job) {
        setJob(response.job);
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

  const copyShareLink = () => {
    const shareUrl = `${window.location.origin}/careers/${job?.slug || 'bda-role'}`;
    navigator.clipboard.writeText(shareUrl);
    toast.success('Public Job URL copied! ');
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

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <Link to="/jobs" className="text-xs font-semibold text-amber-600 dark:text-amber-400 hover:underline flex items-center gap-1">
          ← Back to Job Openings Directory
        </Link>

        {/* Job Header Card */}
        <div className={`rounded-3xl border p-6 md:p-8 shadow-sm space-y-6 relative overflow-hidden ${
          theme === 'dark' ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-slate-200 text-slate-900'
        }`}>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 pt-1">
            <div className="space-y-2">
              <div className="flex flex-wrap items-center gap-2">
                <span className="px-3 py-1 text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 rounded-full">
                   {job.department}
                </span>
                <span className="px-3 py-1 text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 rounded-full">
                  ● {job.status}
                </span>
              </div>

              <h1 className="text-2xl font-bold text-slate-900 dark:text-white">{job.title}</h1>
              <p className="text-xs text-slate-600 dark:text-slate-300">
                📍 {job.location} • 💼 {job.type === 'FULL_TIME' ? 'Full Time' : job.type} • 🎯 Experience: <span className="font-semibold text-slate-900 dark:text-white">{job.experienceLevel || 'Fresher / Experienced'}</span>
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2.5">
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
                className="px-4 py-2 text-xs font-bold text-white bg-amber-500 hover:bg-amber-600 rounded-xl transition-all shadow-sm"
              >
                Public Candidate View ↗
              </Link>
            </div>
          </div>
        </div>

        {/* Details & Description */}
        <div className={`rounded-3xl border p-6 shadow-sm space-y-4 ${
          theme === 'dark' ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-slate-200 text-slate-900'
        }`}>
          <h2 className="text-sm font-bold text-slate-900 dark:text-white border-b border-slate-100 dark:border-slate-800 pb-3 flex items-center gap-2">
            <span className="text-amber-500"></span> Job Overview & Role Details
          </h2>
          <p className="text-xs font-normal text-slate-700 dark:text-slate-200 leading-relaxed whitespace-pre-line">{job.description}</p>
          
          {job.responsibilities && (
            <div className={`p-4 rounded-2xl border text-xs leading-relaxed space-y-1.5 ${
              theme === 'dark' ? 'bg-slate-950 border-slate-800 text-slate-200' : 'bg-white border-slate-200 text-slate-800'
            }`}>
              <strong className="text-slate-900 dark:text-white font-bold block mb-1">Key Responsibilities:</strong>
              <p className="whitespace-pre-line">{job.responsibilities}</p>
            </div>
          )}
        </div>

        {/* Applicants */}
        <div className={`rounded-3xl border p-6 shadow-sm space-y-4 ${
          theme === 'dark' ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-slate-200 text-slate-900'
        }`}>
          <h2 className="text-sm font-bold text-slate-900 dark:text-white border-b border-slate-100 dark:border-slate-800 pb-3 flex items-center gap-2">
            <span className="text-amber-500"></span> Candidates Applied ({job.applications?.length || 0})
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
    </DashboardLayout>
  );
};

export default JobDetails;