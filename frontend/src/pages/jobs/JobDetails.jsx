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
        setJob(getFallbackJob(id));
      }
    } catch (error) {
      setJob(getFallbackJob(id));
    } finally {
      setLoading(false);
    }
  };

  const getFallbackJob = (jobId) => ({
    id: jobId || 'job-bda-101',
    title: 'Business Development Associate (BDA)',
    slug: 'business-development-associate-edtech',
    department: 'Sales & Growth',
    location: 'Mumbai (Hybrid)',
    type: 'FULL_TIME',
    experienceLevel: 'ENTRY',
    status: 'PUBLISHED',
    salaryMin: 350000,
    salaryMax: 600000,
    description: 'We are seeking an energetic Business Development Associate to drive student course enrolments, manage sales pipelines, conduct counselling calls, and achieve monthly revenue targets for Adyapan learning programs.',
    requirements: '1-3 years sales or telesales experience in EdTech or education; excellent English & Hindi communication; strong target achievement mindset; negotiation skills.',
    responsibilities: 'Connect with prospective student leads; conduct detailed course counselling sessions; meet monthly enrolment targets; maintain CRM lead status.',
    applications: [
      { id: 'app-1', candidate: { id: 'cand-1', firstName: 'Rahul', lastName: 'Sharma' }, aiScore: 96, status: 'SHORTLISTED', appliedAt: new Date().toISOString() },
      { id: 'app-2', candidate: { id: 'cand-2', firstName: 'Priya', lastName: 'Verma' }, aiScore: 91, status: 'INTERVIEW_SCHEDULED', appliedAt: new Date().toISOString() },
    ],
  });

  const copyShareLink = () => {
    const shareUrl = `${window.location.origin}/careers/${job?.slug || 'bda-role'}`;
    navigator.clipboard.writeText(shareUrl);
    toast.success('Public Job URL copied! ');
  };

  const shareWhatsApp = () => {
    const shareUrl = `${window.location.origin}/careers/${job?.slug || 'bda-role'}`;
    const text = encodeURIComponent(`We are hiring! Check out the ${job?.title} position at Adyapan Edutech and apply here: ${shareUrl}`);
    window.open(`https://api.whatsapp.com/send?text=${text}`, '_blank');
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-96">
          <div className="text-center space-y-3">
            <div className="w-10 h-10 border-4 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
            <p className="text-xs font-semibold text-slate-500">Loading job specifications...</p>
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
          theme === 'dark' ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-amber-200/80 text-slate-900'
        }`}>
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500" />

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 pt-1">
            <div className="space-y-2">
              <div className="flex flex-wrap items-center gap-2">
                <span className="px-3 py-1 text-xs font-semibold bg-amber-500/15 text-amber-700 dark:text-amber-300 border border-amber-500/30 rounded-full">
                   {job.department}
                </span>
                <span className="px-3 py-1 text-xs font-semibold bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30 rounded-full">
                  ● {job.status}
                </span>
              </div>

              <h1 className="text-2xl font-bold text-slate-900 dark:text-white">{job.title}</h1>
              <p className="text-xs text-slate-600 dark:text-slate-300">{job.location} • {job.type}</p>
            </div>

            <div className="flex flex-wrap items-center gap-2.5">
              <button
                onClick={shareWhatsApp}
                className="px-3.5 py-2 text-xs font-semibold text-emerald-700 dark:text-emerald-300 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 rounded-xl transition-all flex items-center gap-1.5"
              >
                WhatsApp
              </button>
              <button
                onClick={copyShareLink}
                className={`px-3.5 py-2 text-xs font-semibold rounded-xl border transition-all flex items-center gap-1.5 ${
                  theme === 'dark' ? 'bg-slate-950 text-slate-200 border-slate-800' : 'bg-slate-100 text-slate-700 border-slate-200'
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

        {/* Details & Requirements */}
        <div className={`rounded-3xl border p-6 shadow-sm space-y-4 ${
          theme === 'dark' ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-amber-200/80 text-slate-900'
        }`}>
          <h2 className="text-sm font-bold text-slate-900 dark:text-white border-b border-slate-100 dark:border-slate-800 pb-3 flex items-center gap-2">
            <span className="text-amber-500"></span> Job Overview & Requirements
          </h2>
          <p className="text-xs font-normal text-slate-700 dark:text-slate-200 leading-relaxed whitespace-pre-line">{job.description}</p>
          
          <div className={`p-4 rounded-2xl border text-xs leading-relaxed ${
            theme === 'dark' ? 'bg-slate-950 border-slate-800 text-slate-200' : 'bg-white border-amber-200/60 text-slate-800'
          }`}>
            <strong className="text-amber-600 dark:text-amber-400 font-bold">Key Requirements:</strong> {job.requirements}
          </div>
        </div>

        {/* Applicants */}
        <div className={`rounded-3xl border p-6 shadow-sm space-y-4 ${
          theme === 'dark' ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-amber-200/80 text-slate-900'
        }`}>
          <h2 className="text-sm font-bold text-slate-900 dark:text-white border-b border-slate-100 dark:border-slate-800 pb-3 flex items-center gap-2">
            <span className="text-amber-500"></span> Candidates Applied ({job.applications?.length || 0})
          </h2>

          <div className="space-y-3">
            {job.applications?.map((app) => (
              <div key={app.id} className={`flex items-center justify-between p-4 rounded-2xl border ${
                theme === 'dark' ? 'bg-slate-950 border-slate-800' : 'bg-slate-50 border-slate-200'
              }`}>
                <div className="flex items-center gap-3">
                  <span className="font-bold text-xs text-slate-900 dark:text-white">{app.candidate?.firstName} {app.candidate?.lastName}</span>
                  <span className="px-2.5 py-0.5 text-xs font-semibold bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30 rounded-full">
                    AI Match: {app.aiScore}%
                  </span>
                </div>
                <Link to={`/candidates/${app.candidate?.id || 'cand-1'}`} className="text-xs font-semibold text-amber-600 dark:text-amber-400 hover:underline">
                  View Candidate Profile →
                </Link>
              </div>
            ))}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default JobDetails;