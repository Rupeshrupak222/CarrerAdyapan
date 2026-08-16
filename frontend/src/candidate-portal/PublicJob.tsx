import React, { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import AdyapanLogo from '../components/common/AdyapanLogo';
import Footer from '../components/layout/Footer';
import { useTheme } from '../context/ThemeContext';
import { jobService } from '../services/jobService';
import toast from 'react-hot-toast';

const PublicJob = () => {
  const { slug } = useParams();
  const { theme, toggleTheme } = useTheme();
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchJobFromDB();
  }, [slug]);

  const fetchJobFromDB = async () => {
    try {
      const res = await jobService.getPublicJob(slug);
      if (res?.job) {
        setJob(res.job);
      } else {
        const allRes = await jobService.getAllJobs();
        const found = allRes?.jobs?.find((j) => j.slug === slug || j.id === slug);
        if (found) setJob(found);
      }
    } catch (e) {
      console.warn('Failed to fetch job by slug, trying all jobs:', e);
      try {
        const allRes = await jobService.getAllJobs();
        const found = allRes?.jobs?.find((j) => j.slug === slug || j.id === slug);
        if (found) setJob(found);
      } catch (e2) {
        console.error('Failed to load job:', e2);
      }
    } finally {
      setLoading(false);
    }
  };

  const copyShareLink = () => {
    navigator.clipboard.writeText(window.location.href);
    toast.success('Public job link copied! ');
  };

  const shareWhatsApp = () => {
    const text = encodeURIComponent(`We are hiring! Check out the ${job?.title || 'role'} at Adyapan Edutech: ${window.location.href}`);
    window.open(`https://api.whatsapp.com/send?text=${text}`, '_blank');
  };

  const parseToList = (text) => {
    if (!text) return [];
    if (Array.isArray(text)) return text;
    return text.split('\n').map((s) => s.trim()).filter((s) => s.length > 0);
  };

  const formatSalary = (min, max) => {
    if (!min && !max) return 'Best in Industry';
    const fmt = (n) => {
      if (n >= 100000) return `₹${(n / 100000).toFixed(n % 100000 === 0 ? 0 : 1)} LPA`;
      return `₹${n?.toLocaleString('en-IN')}`;
    };
    if (min && max) return `${fmt(min)} - ${fmt(max)} / year`;
    if (min) return `${fmt(min)}+ / year`;
    return `Up to ${fmt(max)} / year`;
  };

  if (loading) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${theme === 'dark' ? 'bg-slate-950 text-white' : 'bg-slate-50 text-slate-900'}`}>
        <div className="text-center space-y-3">
          <div className="w-10 h-10 border-4 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs font-bold text-slate-500">Loading Job Specifications...</p>
        </div>
      </div>
    );
  }

  if (!job) {
    return (
      <div className={`min-h-screen flex items-center justify-center p-6 ${theme === 'dark' ? 'bg-slate-950 text-white' : 'bg-slate-50 text-slate-900'}`}>
        <div className="text-center space-y-4 max-w-md">
          <div className="w-14 h-14 bg-amber-500/20 text-amber-500 rounded-2xl flex items-center justify-center text-2xl mx-auto">
            </div>
          <h2 className="text-xl font-black">Role Posting Not Found</h2>
          <p className="text-xs font-medium text-slate-500">This job opening may have been closed or fulfilled.</p>
          <Link to="/careers" className="px-6 py-2.5 text-xs font-extrabold text-white bg-amber-500 hover:bg-amber-600 rounded-xl inline-block shadow-md">
            ← Return to All Careers
          </Link>
        </div>
      </div>
    );
  }

  const responsibilities = parseToList(job.responsibilities);
  const requirements = parseToList(job.requirements);
  const salaryRange = formatSalary(job.salaryMin, job.salaryMax);

  return (
    <div className={`min-h-screen font-sans antialiased py-4 sm:py-8 px-3.5 sm:px-6 transition-colors ${theme === 'dark' ? 'bg-slate-950 text-white' : 'bg-gradient-to-br from-slate-50 via-white to-amber-50/20 text-slate-900'
      }`}>
      <div className="max-w-4xl mx-auto space-y-4 sm:space-y-6">
        {/* Navigation Bar */}
        <div className={`flex items-center justify-between border-b pb-3 sm:pb-4 gap-2 ${theme === 'dark' ? 'border-slate-800' : 'border-amber-200/80'
          }`}>
          <Link to="/careers" className="shrink-0">
            <AdyapanLogo variant={theme === 'dark' ? 'dark' : 'light'} size="small" />
          </Link>

          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            <a
              href="https://www.adyapan.com"
              target="_blank"
              rel="noreferrer"
              className={`px-3 py-1.5 rounded-xl border text-xs font-bold transition-all items-center gap-1.5 hidden sm:flex ${theme === 'dark'
                  ? 'bg-slate-900 border-slate-700 text-slate-200 hover:border-amber-400'
                  : 'bg-white border-slate-200 text-slate-700 hover:border-amber-400 shadow-sm'
                }`}
            >
              <span>adyapan.com</span>
              <span className="text-amber-500 font-extrabold">↗</span>
            </a>

            <button
              onClick={toggleTheme}
              className={`px-2.5 sm:px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all border ${theme === 'dark'
                  ? 'bg-slate-900 text-amber-300 border-slate-800'
                  : 'bg-white text-slate-800 border-slate-200'
                }`}
            >
              <span className="hidden sm:inline">{theme === 'dark' ? 'Dark Mode' : 'Light Mode'}</span>
              <span className="sm:hidden">{theme === 'dark' ? '' : ''}</span>
            </button>

            <Link
              to="/careers"
              className="px-3 sm:px-4 py-1.5 text-xs font-bold text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-900 hover:bg-slate-200 rounded-xl border border-slate-200 dark:border-slate-800 transition-all shrink-0"
            >
              ← <span className="hidden sm:inline">All Roles</span><span className="sm:hidden">Roles</span>
            </Link>
          </div>
        </div>

        {/* Job Header Card */}
        <div className={`p-8 rounded-3xl space-y-6 shadow-xl border relative overflow-hidden ${theme === 'dark' ? 'bg-slate-900 border-slate-800' : 'bg-white border-amber-200/80'
          }`}>
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500" />

          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pt-1">
            <div className="space-y-3">
              <div className="flex flex-wrap items-center gap-2">
                <span className="px-3 py-1 text-xs font-extrabold bg-amber-500/15 text-amber-700 dark:text-amber-300 rounded-full border border-amber-500/30">
                   {job.department || 'EdTech Growth'}
                </span>
                <span className="px-3 py-1 text-xs font-extrabold bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 rounded-full border border-emerald-500/30">
                  ● Verified Official Position
                </span>
              </div>

              <h1 className="text-3xl font-black text-slate-900 dark:text-white leading-tight">
                {job.title}
              </h1>

              <div className="flex flex-wrap gap-3 text-xs font-extrabold text-slate-700 dark:text-slate-200">
                <span className={`px-3 py-1 rounded-xl border ${theme === 'dark' ? 'bg-slate-950 border-slate-800' : 'bg-slate-100 border-slate-200'}`}>
                  {job.location || 'India'}
                </span>
                <span className={`px-3 py-1 rounded-xl border ${theme === 'dark' ? 'bg-slate-950 border-slate-800' : 'bg-slate-100 border-slate-200'}`}>
                  {job.type === 'FULL_TIME' ? 'Full Time' : job.type || 'Full Time'}
                </span>
                <span className="px-3 py-1 rounded-xl bg-amber-500/15 text-amber-700 dark:text-amber-300 border border-amber-500/30">
                   {salaryRange}
                </span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 shrink-0">
              <button
                onClick={shareWhatsApp}
                className="px-4 py-3 text-xs font-extrabold text-emerald-700 dark:text-emerald-300 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 rounded-2xl transition-all text-center"
              >
                WhatsApp
              </button>
              <Link
                to={`/careers/${job.slug || job.id}/apply`}
                className="px-6 py-3 text-xs font-black text-slate-950 bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 hover:from-amber-400 hover:to-amber-400 rounded-2xl transition-all shadow-lg shadow-amber-500/25 text-center uppercase tracking-wider"
              >
                Apply For Role →
              </Link>
            </div>
          </div>
        </div>

        {/* Detailed Role Specifications Card */}
        <div className={`p-8 rounded-3xl space-y-8 shadow-xl border ${theme === 'dark' ? 'bg-slate-900 border-slate-800' : 'bg-white border-amber-200/80'
          }`}>
          <div>
            <h2 className="text-base font-black mb-3 flex items-center gap-2 text-slate-900 dark:text-white">
              <span className="text-amber-500"></span> Role Overview at Adyapan Edutech
            </h2>
            <p className="text-sm font-medium text-slate-700 dark:text-slate-200 leading-relaxed whitespace-pre-line">
              {job.description}
            </p>
          </div>

          {responsibilities.length > 0 && (
            <div className="space-y-3">
              <h2 className="text-base font-black flex items-center gap-2 text-slate-900 dark:text-white">
                <span className="text-amber-500"></span> Key Responsibilities
              </h2>
              <div className="space-y-2.5">
                {responsibilities.map((r, idx) => (
                  <div key={idx} className={`p-3.5 rounded-2xl border flex items-start gap-3 text-xs font-semibold ${theme === 'dark' ? 'bg-slate-950 border-slate-800 text-slate-200' : 'bg-white border-amber-200/60 text-slate-800'
                    }`}>
                    <span className="text-amber-500 font-extrabold text-sm">•</span>
                    <span className="leading-relaxed">{r}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {requirements.length > 0 && (
            <div className="space-y-3">
              <h2 className="text-base font-black flex items-center gap-2 text-slate-900 dark:text-white">
                <span className="text-emerald-500"></span> Key Requirements & Skills
              </h2>
              <div className="space-y-2.5">
                {requirements.map((r, idx) => (
                  <div key={idx} className={`p-3.5 rounded-2xl border flex items-start gap-3 text-xs font-semibold ${theme === 'dark' ? 'bg-slate-950 border-slate-800 text-slate-200' : 'bg-slate-50 border-slate-200 text-slate-800'
                    }`}>
                    <span className="text-emerald-500 font-extrabold text-sm"></span>
                    <span className="leading-relaxed">{r}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Bottom Action Footer */}
          <div className={`pt-6 border-t flex flex-col sm:flex-row items-center justify-between gap-4 ${theme === 'dark' ? 'border-slate-800' : 'border-amber-200/80'
            }`}>
            <button
              onClick={copyShareLink}
              className="text-xs font-extrabold text-slate-700 dark:text-slate-300 hover:text-amber-500 flex items-center gap-1.5"
            >
              Copy Shareable Role Link
            </button>
            <Link
              to={`/careers/${job.slug || job.id}/apply`}
              className="w-full sm:w-auto px-8 py-3.5 text-xs font-black text-slate-950 bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 hover:from-amber-400 hover:to-amber-400 rounded-2xl transition-all shadow-xl shadow-amber-500/25 text-center uppercase tracking-wider"
            >
              Proceed To Candidate Application →
            </Link>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default PublicJob;

