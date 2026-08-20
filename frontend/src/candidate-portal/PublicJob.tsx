import React, { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import CandidateNavbar from '../components/layout/CandidateNavbar';
import Footer from '../components/layout/Footer';
import { useTheme } from '../context/ThemeContext';
import { useCandidateAuth } from '../context/CandidateAuthContext';
import { jobService } from '../services/jobService';
import toast from 'react-hot-toast';

const PublicJob = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();
  const { candidate, logout } = useCandidateAuth();
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);

  const [job, setJob] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    fetchJobFromDB();
    checkSavedStatus();
  }, [slug]);

  const checkSavedStatus = () => {
    try {
      const saved = JSON.parse(localStorage.getItem('adyapan_saved_jobs') || '[]');
      setIsSaved(saved.includes(slug));
    } catch {
      setIsSaved(false);
    }
  };

  const toggleSaveJob = () => {
    try {
      const saved = JSON.parse(localStorage.getItem('adyapan_saved_jobs') || '[]');
      let updated;
      if (saved.includes(slug)) {
        updated = saved.filter((s: string) => s !== slug);
        setIsSaved(false);
        toast.success('Job removed from saved roles');
      } else {
        updated = [...saved, slug];
        setIsSaved(true);
        toast.success('Job saved to your favorites!');
      }
      localStorage.setItem('adyapan_saved_jobs', JSON.stringify(updated));
    } catch {
      setIsSaved(!isSaved);
    }
  };

  const fetchJobFromDB = async () => {
    try {
      const res = await jobService.getPublicJob(slug);
      if (res?.job) {
        setJob(res.job);
      } else {
        const allRes = await jobService.getPublicJobs();
        const found = allRes?.jobs?.find((j: any) => j.slug === slug || j.id === slug);
        if (found) setJob(found);
      }
    } catch (e) {
      console.warn('Failed to fetch job by slug, trying public jobs list:', e);
      try {
        const allRes = await jobService.getPublicJobs();
        const found = allRes?.jobs?.find((j: any) => j.slug === slug || j.id === slug);
        if (found) setJob(found);
      } catch (e2) {
        console.error('Failed to load job:', e2);
      }
    } finally {
      setLoading(false);
    }
  };

  const parseToList = (text: any) => {
    if (!text) return [];
    if (Array.isArray(text)) return text;
    return String(text)
      .split(/[\n;•]+/)
      .map((s) => s.trim().replace(/^[-•*]\s*/, ''))
      .filter((s) => s.length > 2);
  };

  const formatSalary = (min?: number, max?: number) => {
    if (!min && !max) return 'Competitive / Best in Industry';
    const fmt = (n: number) => {
      if (n >= 100000) return `₹${(n / 100000).toFixed(n % 100000 === 0 ? 0 : 1)} LPA`;
      return `₹${n?.toLocaleString('en-IN')}`;
    };
    if (min && max) return `${fmt(min)} - ${fmt(max)} / year`;
    if (min) return `${fmt(min)}+ / year`;
    return `Up to ${fmt(max)} / year`;
  };

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return 'Aug 19 2026';
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    } catch {
      return 'Recently Posted';
    }
  };

  const copyShareLink = () => {
    navigator.clipboard.writeText(window.location.href);
    toast.success('Direct Role link copied to clipboard!');
  };

  const shareLinkedIn = () => {
    const text = `🚀 We are hiring at Adyapan Edutech! Explore the ${job?.title} role and apply directly here: ${window.location.href}`;
    window.open(`https://www.linkedin.com/feed/?shareActive=true&text=${encodeURIComponent(text)}`, '_blank');
  };

  const shareTwitter = () => {
    const text = `🚀 Adyapan Edutech is hiring for ${job?.title}! Apply online:`;
    window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(window.location.href)}`, '_blank');
  };

  const shareFacebook = () => {
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.href)}`, '_blank');
  };

  const shareEmail = () => {
    const subject = encodeURIComponent(`Job Opportunity at Adyapan Edutech: ${job?.title}`);
    const body = encodeURIComponent(`Hi,\n\nI wanted to share this exciting job opening with you:\n\nRole: ${job?.title}\nDepartment: ${job?.department}\nLocation: ${job?.location}\nApply directly here: ${window.location.href}\n\nBest regards,\nAdyapan Recruitment Team`);
    window.location.href = `mailto:?subject=${subject}&body=${body}`;
  };

  if (loading) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${theme === 'dark' ? 'bg-[#0a0a1a] text-white' : 'bg-white text-slate-900'}`}>
        <div className="text-center space-y-3">
          <div className="w-10 h-10 border-4 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs font-bold text-slate-500">Loading Job Specifications...</p>
        </div>
      </div>
    );
  }

  if (!job) {
    return (
      <div className={`min-h-screen flex items-center justify-center p-6 ${theme === 'dark' ? 'bg-[#0a0a1a] text-white' : 'bg-slate-50 text-slate-900'}`}>
        <div className="text-center space-y-4 max-w-md">
          <div className="w-14 h-14 bg-amber-500/20 text-amber-500 rounded-2xl flex items-center justify-center text-2xl mx-auto">
            🔍
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

  const salaryRange = job.salaryMin && job.salaryMax
    ? `₹${(job.salaryMin / 100000).toFixed(1)}L - ₹${(job.salaryMax / 100000).toFixed(1)}L PA + Lucrative Incentives`
    : 'Industry Leading Fixed CTC + Performance Bonus';

  const responsibilities = Array.isArray(job.responsibilities) && job.responsibilities.length > 0
    ? job.responsibilities
    : [
      'Engage with prospective students, working professionals, and parents to understand educational requirements.',
      'Present and counsel candidates on Adyapan’s accredited programs and certification courses.',
      'Manage and optimize lead pipelines through inside sales calls, live webinars, and CRM follow-ups.',
      'Achieve and exceed weekly/monthly student enrollment and revenue targets with team collaboration.',
      'Maintain high conversion quality and adhere strictly to ethical counselling guidelines.',
    ];

  const benefits = Array.isArray(job.benefits) && job.benefits.length > 0
    ? job.benefits
    : [
      'Uncapped Weekly Performance Incentives & Spot Cash Bonuses',
      'Transparent 6-Month Merit Appraisal & Fast-Track Promotion Track',
      'Sponsored Certifications with Microsoft, Cisco & Adobe Ecosystems',
      'Comprehensive Health & Family Insurance Coverage',
      'Hybrid & Flexible Work Model with Vibrant Team Retreats',
    ];

  const reqId = job.id ? `REQ-ADY-${job.id.slice(0, 8).toUpperCase()}` : 'REQ-ADY-HYD2026';
  const publishedDate = job.publishedAt || job.createdAt ? new Date(job.publishedAt || job.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : 'Active';

  return (
    <div className={`min-h-screen font-sans antialiased transition-colors relative overflow-x-hidden ${theme === 'dark'
      ? 'bg-gradient-to-l from-amber-950/40 via-amber-950/15 via-30% to-[#0a0a1a] text-white'
      : 'bg-gradient-to-l from-orange-300/40 via-amber-100/30 via-40% to-white text-slate-900'
      }`}>

      {/* Persistent Full-Page Right-to-Left Orange Gradient Glow */}
      <div className="fixed top-0 right-0 w-[60vw] max-w-[900px] h-full pointer-events-none bg-gradient-to-l from-orange-400/20 via-amber-200/10 via-45% to-transparent dark:from-amber-500/10 dark:via-amber-900/5 dark:to-transparent blur-3xl z-0" />

      {/* ===== 1. TOP NAVBAR ===== */}
      <CandidateNavbar activePage="jobs" />

      {/* ===== 2. HERO HEADER (Adyapan Signature Warm Amber & Charcoal Gradient Banner) ===== */}
      <section className="relative overflow-hidden bg-gradient-to-r from-[#18181b] via-[#78350f] via-50% to-[#d97706] text-white py-12 sm:py-16 px-4 sm:px-8 border-b border-amber-500/30 shadow-xl" style={{ color: '#ffffff' }}>
        {/* Subtle Ambient Glows */}
        <div className="absolute -top-24 right-0 w-[500px] h-[500px] bg-amber-400/25 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 right-1/4 w-[350px] h-[350px] bg-orange-500/20 rounded-full blur-2xl pointer-events-none" />

        <div className="max-w-7xl mx-auto space-y-5 relative z-10">

          {/* Main Title & Req Code */}
          <div className="space-y-2.5">
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-white leading-tight drop-shadow-sm" style={{ color: '#ffffff' }}>
              {job.title}
            </h1>
            <div className="inline-flex items-center gap-2 px-3.5 py-1 bg-white/15 text-white border border-white/30 rounded-full text-xs font-bold tracking-wider backdrop-blur-sm" style={{ color: '#ffffff' }}>
              <span style={{ color: '#ffffff' }}>● {reqId}</span>
            </div>
          </div>

          {/* Metadata Horizontal Bar */}
          <div className="flex flex-wrap items-center gap-x-8 gap-y-4 pt-4 text-xs sm:text-sm border-t border-white/25">
            <div>
              <p className="text-white text-xs font-bold uppercase tracking-wider opacity-90" style={{ color: '#ffffff' }}>Date published</p>
              <p className="font-bold text-white text-sm mt-0.5" style={{ color: '#ffffff' }}>{publishedDate}</p>
            </div>
            <div>
              <p className="text-white text-xs font-bold uppercase tracking-wider opacity-90" style={{ color: '#ffffff' }}>Location</p>
              <p className="font-bold text-white text-sm mt-0.5" style={{ color: '#ffffff' }}>{job.location || 'Hyderabad / Pan-India'}</p>
            </div>
            <div>
              <p className="text-white text-xs font-bold uppercase tracking-wider opacity-90" style={{ color: '#ffffff' }}>Job category</p>
              <p className="font-bold text-white text-sm mt-0.5" style={{ color: '#ffffff' }}>{job.department || 'EdTech & Growth'}</p>
            </div>
            <div>
              <p className="text-white text-xs font-bold uppercase tracking-wider opacity-90" style={{ color: '#ffffff' }}>Experience & Type</p>
              <p className="font-bold text-white text-sm mt-0.5" style={{ color: '#ffffff' }}>{job.experienceLevel || 'Fresher / Experienced'} • {job.type === 'FULL_TIME' ? 'Full Time' : job.type || 'Full Time'}</p>
            </div>
            <div>
              <p className="text-white text-xs font-bold uppercase tracking-wider opacity-90" style={{ color: '#ffffff' }}>Compensation</p>
              <p className="font-bold text-white text-sm mt-0.5" style={{ color: '#ffffff' }}>{salaryRange}</p>
            </div>
          </div>
        </div>
      </section>

      {/* ===== 3. MAIN BODY & COGNIZANT ACTION SIDEBAR ===== */}
      <main className="max-w-7xl mx-auto px-4 sm:px-8 py-10 lg:py-14 relative">
        <div className="grid lg:grid-cols-12 gap-10 items-start">

          {/* Left Column: Comprehensive Job Details & Specifications (8 Cols) */}
          <div className="lg:col-span-8 space-y-10 text-sm sm:text-base leading-relaxed">

            {/* Role Introduction / Overview */}
            <div className="space-y-4">
              <p className={`font-normal leading-relaxed ${theme === 'dark' ? 'text-slate-200' : 'text-slate-800'}`}>
                As a <strong className="font-bold text-slate-900 dark:text-white">{job.title}</strong> at <strong className="font-bold text-amber-600 dark:text-amber-400">Adyapan Edutech Pvt. Ltd.</strong>, you will provide dynamic service and support in relation to education innovation, student career counselling, and business growth. Dedicated to quality, you will use your communication and problem-solving skills to continuously deliver value to our student community and enterprise partners.
              </p>
              {job.description && (
                <p className={`font-normal leading-relaxed whitespace-pre-line ${theme === 'dark' ? 'text-slate-300' : 'text-slate-700'}`}>
                  {job.description}
                </p>
              )}
            </div>

            {/* Key Responsibilities Section */}
            {responsibilities.length > 0 && (
              <div className="space-y-4">
                <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
                  Roles and responsibilities may include, but are not limited to:
                </h2>
                <ul className="space-y-3 pl-2">
                  {responsibilities.map((r: string, idx: number) => (
                    <li key={idx} className="flex items-start gap-3 text-sm">
                      <span className="w-1.5 h-1.5 rounded-full bg-slate-900 dark:bg-amber-400 mt-2 shrink-0" />
                      <span className={`${theme === 'dark' ? 'text-slate-200' : 'text-slate-700'} leading-relaxed`}>{r}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Professional Skills & Preferred Competencies */}
            <div className="space-y-4">
              <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
                Professional Skills & Core Capabilities:
              </h2>
              <ul className="space-y-3 pl-2">
                <li className="flex items-start gap-3 text-sm">
                  <span className="w-1.5 h-1.5 rounded-full bg-slate-900 dark:bg-amber-400 mt-2 shrink-0" />
                  <span className={`${theme === 'dark' ? 'text-slate-200' : 'text-slate-700'} leading-relaxed`}>
                    <strong>Experience Level:</strong> {job.experienceLevel || 'Fresher / Experienced candidates welcome'}.
                  </span>
                </li>
                <li className="flex items-start gap-3 text-sm">
                  <span className="w-1.5 h-1.5 rounded-full bg-slate-900 dark:bg-amber-400 mt-2 shrink-0" />
                  <span className={`${theme === 'dark' ? 'text-slate-200' : 'text-slate-700'} leading-relaxed`}>
                    Excellent communication (verbal and written), facilitation, and interpersonal counseling skills.
                  </span>
                </li>
                <li className="flex items-start gap-3 text-sm">
                  <span className="w-1.5 h-1.5 rounded-full bg-slate-900 dark:bg-amber-400 mt-2 shrink-0" />
                  <span className={`${theme === 'dark' ? 'text-slate-200' : 'text-slate-700'} leading-relaxed`}>
                    Passion for educational transformation, target orientation, and ensuring a world-class student experience.
                  </span>
                </li>
                <li className="flex items-start gap-3 text-sm">
                  <span className="w-1.5 h-1.5 rounded-full bg-slate-900 dark:bg-amber-400 mt-2 shrink-0" />
                  <span className={`${theme === 'dark' ? 'text-slate-200' : 'text-slate-700'} leading-relaxed`}>
                    Ability to work collaboratively in high-energy teams while managing individual performance metrics.
                  </span>
                </li>
              </ul>
            </div>

            {/* About Adyapan Edutech */}
            <div className={`pt-6 border-t ${theme === 'dark' ? 'border-slate-800' : 'border-slate-200'} space-y-3`}>
              <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
                About Adyapan:
              </h2>
              <p className={`text-sm leading-relaxed ${theme === 'dark' ? 'text-slate-300' : 'text-slate-600'}`}>
                Adyapan Edutech Pvt. Ltd. is an <strong>ISO 9001:2015 Certified, MSME Recognized</strong> educational leader and <strong>Skill India Partner</strong> bridging the gap between talent and top industry opportunities. We empower learners and young professionals nationwide with industry-aligned skill acceleration, career counseling, and high-impact placements.
              </p>
            </div>

            {/* Equal Employment Opportunity (EEO) Statement */}
            <div className={`pt-6 border-t ${theme === 'dark' ? 'border-slate-800' : 'border-slate-200'} space-y-3 text-xs leading-relaxed text-slate-500 dark:text-slate-400`}>
              <h3 className="font-bold text-slate-700 dark:text-slate-300 text-sm">
                Additional Employment Information
              </h3>
              <p>
                Compensation information is accurate as of the date of this posting. Adyapan Edutech reserves the right to modify this information at any time, subject to applicable guidelines.
              </p>
              <p>
                Adyapan is an equal opportunity employer. Your application and candidacy will not be considered based on race, color, sex, religion, creed, sexual orientation, gender identity, national origin, or disability.
              </p>
              <p>
                If you have an inquiry or require assistance during the recruitment process, please reach out to our talent team at <a href="mailto:careers@adyapan.com" className="text-amber-500 underline font-semibold">careers@adyapan.com</a>.
              </p>
            </div>

          </div>

          {/* Right Column: Cognizant-Style Floating Action Area (4 Cols) */}
          <div className="lg:col-span-4 lg:sticky lg:top-24 space-y-6 pt-2">

            {/* Primary Action Buttons Box */}
            <div className="flex items-center gap-3">
              <button
                onClick={() => {
                  const targetApplyUrl = `/careers/${job.slug || job.id || slug}/apply`;
                  /*
                  // Authentication Gate (Commented out - open direct application enabled):
                  const token = localStorage.getItem('candidateToken') || localStorage.getItem('token');
                  if (!candidate && !token) {
                    toast('Please create an account or sign in to apply', { icon: '🔐' });
                    navigate(`/register?redirect=${encodeURIComponent(targetApplyUrl)}`);
                    return;
                  }
                  */
                  navigate(targetApplyUrl);
                }}
                className="flex-1 py-3.5 px-6 rounded-full text-sm font-extrabold text-slate-950 bg-gradient-to-r from-amber-400 via-amber-500 to-orange-500 hover:from-amber-300 hover:to-orange-400 transition-all shadow-lg shadow-amber-500/25 text-center cursor-pointer tracking-wide flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-[0.98]"
              >
                <span>Apply now</span>
                <span className="text-base">→</span>
              </button>

              {/* Save / Favorite Heart Button */}
              <button
                onClick={toggleSaveJob}
                className={`p-3.5 rounded-full border transition-all flex items-center justify-center shrink-0 cursor-pointer ${isSaved
                  ? 'bg-red-500/15 border-red-500 text-red-500'
                  : theme === 'dark'
                    ? 'border-slate-700 text-slate-300 hover:border-amber-400 bg-slate-900'
                    : 'border-slate-300 text-slate-600 hover:border-amber-500 bg-white shadow-sm'
                  }`}
                title={isSaved ? 'Job Saved' : 'Save Job'}
                aria-label="Save Job"
              >
                <svg className={`w-5 h-5 ${isSaved ? 'fill-red-500 stroke-red-500' : 'fill-none stroke-currentColor'}`} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
              </button>
            </div>

            {/* Share Social Links (Cognizant Style) */}
            <div className="flex items-center gap-4 text-xs font-semibold text-slate-600 dark:text-slate-400 pt-2">
              <span>Share</span>

              {/* LinkedIn */}
              <button
                onClick={shareLinkedIn}
                className="p-1 text-slate-600 dark:text-slate-300 hover:text-sky-500 transition-colors cursor-pointer"
                title="Share on LinkedIn"
              >
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                  <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.46 10.9v8.37H9.2V10.9H6.46M7.83 6.25a1.62 1.62 0 0 0-1.62 1.63c0 .9.72 1.63 1.62 1.63s1.63-.73 1.63-1.63c0-.9-.73-1.63-1.63-1.63Z" />
                </svg>
              </button>

              {/* Email */}
              <button
                onClick={shareEmail}
                className="p-1 text-slate-600 dark:text-slate-300 hover:text-amber-500 transition-colors cursor-pointer"
                title="Share via Email"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </button>

              {/* X / Twitter */}
              <button
                onClick={shareTwitter}
                className="p-1 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer"
                title="Share on X"
              >
                <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                </svg>
              </button>

              {/* Facebook */}
              <button
                onClick={shareFacebook}
                className="p-1 text-slate-600 dark:text-slate-300 hover:text-blue-600 transition-colors cursor-pointer"
                title="Share on Facebook"
              >
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                </svg>
              </button>

              {/* Copy Link */}
              <button
                onClick={copyShareLink}
                className="p-1 text-slate-600 dark:text-slate-300 hover:text-amber-500 transition-colors cursor-pointer"
                title="Copy Direct Link"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
              </button>
            </div>

            {/* Quick Information Summary Card */}
            <div className={`p-6 rounded-2xl border ${theme === 'dark' ? 'bg-slate-900/60 border-slate-800' : 'bg-slate-50 border-slate-200'} space-y-3.5 text-xs`}>
              <h4 className="font-bold text-slate-900 dark:text-white uppercase tracking-wider text-[11px]">
                Role Snapshot
              </h4>
              <div className="flex items-center justify-between py-1 border-b border-slate-200 dark:border-slate-800">
                <span className="text-slate-500 dark:text-slate-400">Position Type</span>
                <span className="font-semibold">{job.type === 'FULL_TIME' ? 'Full Time' : job.type || 'Full Time'}</span>
              </div>
              <div className="flex items-center justify-between py-1 border-b border-slate-200 dark:border-slate-800">
                <span className="text-slate-500 dark:text-slate-400">Location</span>
                <span className="font-semibold">{job.location || 'India'}</span>
              </div>
              <div className="flex items-center justify-between py-1 border-b border-slate-200 dark:border-slate-800">
                <span className="text-slate-500 dark:text-slate-400">Experience</span>
                <span className="font-semibold text-amber-600 dark:text-amber-400">{job.experienceLevel || 'Fresher / Experienced'}</span>
              </div>
              <div className="flex items-center justify-between py-1">
                <span className="text-slate-500 dark:text-slate-400">Compensation</span>
                <span className="font-bold text-emerald-600 dark:text-emerald-400">{salaryRange}</span>
              </div>
            </div>

          </div>

        </div>
      </main>

      {/* ===== FOOTER ===== */}
      <Footer isPublic={true} />

    </div>
  );
};

export default PublicJob;
