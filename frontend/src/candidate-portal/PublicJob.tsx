import React, { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  ArrowRight,
  Bookmark,
  Briefcase,
  Building2,
  Calendar,
  CheckCircle2,
  Clock3,
  GraduationCap,
  Heart,
  HelpCircle,
  IndianRupee,
  MapPin,
  Share2,
  ShieldCheck,
  Sparkles,
  TrendingUp,
  UsersRound,
  Zap,
} from 'lucide-react';
import SiteShell from '../components/layout/SiteShell';
import { jobService } from '../services/jobService';
import toast from 'react-hot-toast';

const fallbackJob = {
  id: '1',
  slug: 'business-development-associate',
  title: 'Business Development Associate (BDA)',
  company: 'Adyapan Edutech Pvt. Ltd.',
  location: 'Hyderabad, India (On-Site)',
  type: 'Full Time',
  experienceLevel: '0–2 Years',
  department: 'Sales & Student Advisory',
  salaryMin: 400000,
  salaryMax: 800000,
  salary: '₹4.0 – 8.0 LPA',
  description: `Adyapan Edutech is rapidly expanding India's leading student upskilling and career development ecosystem. We are looking for ambitious, high-energy individuals to join our advisory team.

In this role, you will have direct ownership of student interactions, high-impact counseling sessions, and revenue growth. You will collaborate closely with founders and senior leaders with fast-track 6-month evaluation cycles for accelerated leadership promotions.`,
  responsibilities: [
    'Engage with prospective students and working professionals to understand their career goals and consult them on relevant certification programs.',
    'Build and nurture qualified candidate pipelines through structured consultations, webinars, and inbound lead outreach.',
    'Conduct 1-on-1 counseling calls to explain course value propositions, learning roadmaps, and career placement support.',
    'Achieve and exceed weekly and monthly enrollment targets with uncapped performance incentives.',
    'Maintain accurate CRM updates, follow-ups, and student feedback loops.',
  ],
  requirements: [
    'Excellent verbal and written English communication skills with strong consultative persuasion.',
    'High energy, self-motivated, and target-driven mindset with genuine interest in the EdTech sector.',
    'Bachelor’s degree in any discipline (B.Tech, BBA, B.Com, B.Sc, MBA, etc.).',
    'Open to freshers, recent graduates, or candidates with 0–2 years of experience in sales, admissions, or customer advisory.',
    'Comfortable working in a fast-paced, high-growth startup environment.',
  ],
  benefits: [
    'Competitive base salary + Uncapped weekly and monthly cash incentives.',
    'Fast-track 6-month performance evaluation and leadership promotion track.',
    'Direct 1-on-1 mentorship from experienced founders and industry experts.',
    'Energetic, toxic-free work culture with Friday games, cricket matches, and win celebrations.',
    'Comprehensive healthcare, team outings, and skill development allowances.',
  ],
};

const parseToList = (val: any): string[] => {
  if (Array.isArray(val)) return val.filter(Boolean);
  if (typeof val === 'string') {
    return val
      .split('\n')
      .map((s) => s.replace(/^[-*•\d.]\s*/, '').trim())
      .filter((s) => s.length > 0);
  }
  return [];
};

const formatSalary = (min?: number | null, max?: number | null, raw?: string) => {
  if (raw && typeof raw === 'string' && raw.trim()) return raw;
  if (min && max) {
    const minLPA = (min / 100000).toFixed(1);
    const maxLPA = (max / 100000).toFixed(1);
    return `₹${minLPA} – ${maxLPA} LPA`;
  }
  if (min) return `₹${(min / 100000).toFixed(1)} LPA+`;
  return 'Competitive + Uncapped Incentives';
};

export const PublicJob: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const [job, setJob] = useState<any>(fallbackJob);
  const [loading, setLoading] = useState(true);
  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    const fetchJob = async () => {
      setLoading(true);
      try {
        const res = await jobService.getAllJobs();
        const apiJobs = Array.isArray(res) ? res : res?.jobs || res?.data || [];
        const found = apiJobs.find(
          (j: any) =>
            (j.slug && j.slug.toLowerCase() === (slug || '').toLowerCase()) ||
            (j.id && j.id.toString() === (slug || '').toString()) ||
            (j.title && j.title.toLowerCase().includes((slug || '').toLowerCase()))
        );

        if (found) {
          const respList = parseToList(found.responsibilities);
          const reqList = parseToList(found.requirements);

          setJob({
            ...found,
            id: found.id || found._id || '1',
            slug: found.slug || found.id || slug,
            title: found.title || 'Career Opportunity',
            company: found.company || 'Adyapan Edutech Pvt. Ltd.',
            department: found.department || 'Growth & Operations',
            location: found.location || 'Hyderabad, India',
            type: found.type === 'FULL_TIME' ? 'Full Time' : found.type || 'Full Time',
            experienceLevel: found.experienceLevel || found.experience || '0–2 Years',
            salary: formatSalary(found.salaryMin, found.salaryMax, found.salary),
            description: found.description || fallbackJob.description,
            responsibilities: respList.length > 0 ? respList : fallbackJob.responsibilities,
            requirements: reqList.length > 0 ? reqList : fallbackJob.requirements,
            benefits: fallbackJob.benefits,
          });
        }
      } catch (e) {
        console.error('Error fetching job details:', e);
      } finally {
        setLoading(false);
      }
    };

    if (slug) {
      fetchJob();
    }
  }, [slug]);

  // Check saved state in localStorage
  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem('adyapan_saved_jobs') || '[]');
      setIsSaved(saved.includes(job.id || slug));
    } catch { }
  }, [job.id, slug]);

  const toggleSaveJob = () => {
    try {
      const saved = JSON.parse(localStorage.getItem('adyapan_saved_jobs') || '[]');
      const id = job.id || slug;
      let next: string[];
      if (saved.includes(id)) {
        next = saved.filter((x: string) => x !== id);
        setIsSaved(false);
        toast('Job removed from saved list', { icon: '🔖' });
      } else {
        next = [...saved, id];
        setIsSaved(true);
        toast.success('Job saved successfully!');
      }
      localStorage.setItem('adyapan_saved_jobs', JSON.stringify(next));
    } catch { }
  };

  const copyShareLink = () => {
    navigator.clipboard.writeText(window.location.href);
    toast.success('Direct job link copied to clipboard!');
  };

  const shareLinkedIn = () => {
    const url = encodeURIComponent(window.location.href);
    window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${url}`, '_blank');
  };

  const shareTwitter = () => {
    const text = encodeURIComponent(`We are hiring: ${job.title} at Adyapan Edutech! Apply here:`);
    const url = encodeURIComponent(window.location.href);
    window.open(`https://twitter.com/intent/tweet?text=${text}&url=${url}`, '_blank');
  };

  const applyUrl = `/careers/${job.slug || job.id || slug}/apply`;

  return (
    <SiteShell>
      <main className="bg-[#faf7f2] dark:bg-[#121110] text-stone-900 dark:text-stone-100 min-h-screen py-8 sm:py-12">
        <div className="max-w-[1380px] mx-auto px-4 sm:px-6 lg:px-8 space-y-8">

          {/* ── BREADCRUMB & BACK LINK ── */}
          <div className="flex items-center justify-between">
            <Link
              to="/open-positions"
              className="inline-flex items-center gap-2 text-xs sm:text-sm font-bold text-stone-600 dark:text-stone-400 hover:text-amber-500 dark:hover:text-amber-400 transition-colors"
            >
              <ArrowLeft size={16} />
              <span>Back to Open Positions</span>
            </Link>

            <span className="text-xs font-semibold text-stone-400">
              Job ID: <code className="font-mono text-stone-600 dark:text-stone-300">{String(job.id).slice(-8)}</code>
            </span>
          </div>

          {/* ── HERO JOB HEADER BANNER (ADYAPAN BRAND GRADIENT) ── */}
          <div className="bg-gradient-to-br from-amber-500 via-orange-500 to-amber-600 rounded-3xl p-6 sm:p-10 border border-amber-400/40 shadow-2xl relative overflow-hidden text-white">
            {/* Ambient decorative glow */}
            <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />

            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
              <div className="space-y-4">
                <div className="flex flex-wrap items-center gap-2.5">
                  <span className="px-3.5 py-1 rounded-full text-xs font-black bg-white/20 text-white border border-white/30 backdrop-blur-md uppercase tracking-wider">
                    {job.department || 'EdTech Career'}
                  </span>
                  <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full text-xs font-black bg-emerald-950/40 text-emerald-200 border border-emerald-300/30 backdrop-blur-md">
                    <ShieldCheck size={14} className="text-emerald-300" />
                    <span>Verified Official Hiring</span>
                  </span>
                </div>

                <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight leading-tight">
                  {job.title}
                </h1>

                <div className="flex flex-wrap items-center gap-4 sm:gap-6 text-xs sm:text-sm font-bold text-white/95">
                  <span className="inline-flex items-center gap-1.5 bg-black/15 px-3 py-1.5 rounded-xl backdrop-blur-sm border border-white/10">
                    <Building2 size={16} className="text-amber-200" />
                    <span>{job.company}</span>
                  </span>
                  <span className="inline-flex items-center gap-1.5 bg-black/15 px-3 py-1.5 rounded-xl backdrop-blur-sm border border-white/10">
                    <MapPin size={16} className="text-amber-200" />
                    <span>{job.location}</span>
                  </span>
                  <span className="inline-flex items-center gap-1.5 bg-black/15 px-3 py-1.5 rounded-xl backdrop-blur-sm border border-white/10">
                    <Briefcase size={16} className="text-amber-200" />
                    <span>{job.type}</span>
                  </span>
                  <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-white text-stone-900 font-black shadow-lg shadow-black/10">
                    <IndianRupee size={15} className="text-amber-600" />
                    <span>{job.salary ? String(job.salary).replace(/^₹\s*/, '') : 'Competitive'}</span>
                  </span>
                </div>
              </div>

              {/* Quick Actions in Header */}
              <div className="flex flex-wrap items-center gap-3 pt-2 lg:pt-0">
                <button
                  onClick={toggleSaveJob}
                  className={`p-3.5 rounded-2xl border transition-all flex items-center justify-center cursor-pointer ${
                    isSaved
                      ? 'bg-white text-rose-600 border-white shadow-md'
                      : 'bg-white/20 hover:bg-white/30 text-white border-white/30 backdrop-blur-md'
                  }`}
                  title={isSaved ? 'Job Saved' : 'Save Job'}
                >
                  <Heart size={18} className={isSaved ? 'fill-rose-600 text-rose-600' : ''} />
                </button>

                <button
                  onClick={copyShareLink}
                  className="p-3.5 rounded-2xl border border-white/30 bg-white/20 hover:bg-white/30 text-white backdrop-blur-md transition-all cursor-pointer"
                  title="Share Job Link"
                >
                  <Share2 size={18} />
                </button>

                <Link
                  to={applyUrl}
                  className="px-8 py-3.5 rounded-2xl bg-white hover:bg-stone-100 text-stone-900 font-black text-sm shadow-2xl hover:scale-105 transition-all inline-flex items-center gap-2"
                >
                  <span>Apply For This Position</span>
                  <ArrowRight size={16} />
                </Link>
              </div>
            </div>
          </div>

          {/* ── 2-COLUMN DETAILED SPECIFICATIONS LAYOUT ── */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

            {/* LEFT COLUMN: FULL JOB CONTENT (8 Cols) */}
            <div className="lg:col-span-8 space-y-8">

              {/* Role Overview Card */}
              <div className="bg-white dark:bg-stone-900 rounded-3xl p-6 sm:p-8 border border-stone-200/80 dark:border-stone-800 shadow-md space-y-4">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 font-extrabold text-xs">
                  <Sparkles size={13} />
                  <span>ROLE OVERVIEW</span>
                </div>
                <h2 className="text-xl sm:text-2xl font-black text-stone-900 dark:text-white">
                  About The Opportunity
                </h2>
                <div className="text-stone-600 dark:text-stone-300 text-sm sm:text-base leading-relaxed whitespace-pre-line font-medium">
                  {job.description}
                </div>
              </div>

              {/* Key Responsibilities Card */}
              <div className="bg-white dark:bg-stone-900 rounded-3xl p-6 sm:p-8 border border-stone-200/80 dark:border-stone-800 shadow-md space-y-4">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-extrabold text-xs">
                  <Zap size={13} />
                  <span>RESPONSIBILITIES</span>
                </div>
                <h2 className="text-xl sm:text-2xl font-black text-stone-900 dark:text-white">
                  What You Will Do
                </h2>
                <div className="space-y-3 pt-1">
                  {job.responsibilities.map((resp: string, idx: number) => (
                    <div
                      key={idx}
                      className="flex items-start gap-3.5 p-3.5 rounded-2xl bg-[#fdfbf7] dark:bg-stone-850/60 border border-stone-100 dark:border-stone-800 text-xs sm:text-sm font-medium text-stone-700 dark:text-stone-200"
                    >
                      <CheckCircle2 size={18} className="text-emerald-500 shrink-0 mt-0.5" />
                      <span className="leading-relaxed">{resp}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Requirements & Candidate Profile Card */}
              <div className="bg-white dark:bg-stone-900 rounded-3xl p-6 sm:p-8 border border-stone-200/80 dark:border-stone-800 shadow-md space-y-4">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 font-extrabold text-xs">
                  <GraduationCap size={13} />
                  <span>REQUIREMENTS</span>
                </div>
                <h2 className="text-xl sm:text-2xl font-black text-stone-900 dark:text-white">
                  What We Look For
                </h2>
                <div className="space-y-3 pt-1">
                  {job.requirements.map((req: string, idx: number) => (
                    <div
                      key={idx}
                      className="flex items-start gap-3.5 p-3.5 rounded-2xl bg-[#fdfbf7] dark:bg-stone-850/60 border border-stone-100 dark:border-stone-800 text-xs sm:text-sm font-medium text-stone-700 dark:text-stone-200"
                    >
                      <span className="w-2 h-2 rounded-full bg-amber-500 shrink-0 mt-2" />
                      <span className="leading-relaxed">{req}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Benefits & Perks Card */}
              <div className="bg-white dark:bg-stone-900 rounded-3xl p-6 sm:p-8 border border-stone-200/80 dark:border-stone-800 shadow-md space-y-4">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-500/10 text-rose-600 dark:text-rose-400 font-extrabold text-xs">
                  <Heart size={13} />
                  <span>BENEFITS & PERKS</span>
                </div>
                <h2 className="text-xl sm:text-2xl font-black text-stone-900 dark:text-white">
                  Life & Growth at Adyapan
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                  {job.benefits.map((b: string, idx: number) => (
                    <div
                      key={idx}
                      className="p-4 rounded-2xl bg-[#fdfbf7] dark:bg-stone-850/60 border border-amber-200/40 dark:border-stone-800 text-xs font-semibold text-stone-700 dark:text-stone-200 flex items-start gap-2.5"
                    >
                      <Sparkles size={16} className="text-amber-500 shrink-0 mt-0.5" />
                      <span>{b}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Bottom Apply CTA Card */}
              <div className="p-8 rounded-3xl bg-gradient-to-br from-amber-500 via-orange-500 to-amber-600 text-white shadow-2xl flex flex-col sm:flex-row items-center justify-between gap-6">
                <div className="space-y-1 text-center sm:text-left">
                  <h3 className="text-2xl font-black">Ready to apply?</h3>
                  <p className="text-xs sm:text-sm text-white/90 font-medium">
                    Submit your application in 2 minutes. Our recruitment team reviews resumes within 48 hours.
                  </p>
                </div>
                <Link
                  to={applyUrl}
                  className="px-8 py-4 rounded-2xl bg-white hover:bg-stone-100 text-stone-900 font-black text-sm shadow-xl transition-all hover:scale-105 shrink-0 inline-flex items-center gap-2"
                >
                  <span>Apply Now</span>
                  <ArrowRight size={16} />
                </Link>
              </div>

            </div>

            {/* RIGHT COLUMN: STICKY QUICK SNAPSHOT & ACTIONS (4 Cols) */}
            <div className="lg:col-span-4 lg:sticky lg:top-24 space-y-6">

              {/* Primary Floating Action Box */}
              <div className="bg-white dark:bg-stone-900 rounded-3xl p-6 border border-stone-200/80 dark:border-stone-800 shadow-xl space-y-5">
                <h3 className="text-base font-black text-stone-900 dark:text-white">
                  Join The Team
                </h3>

                <Link
                  to={applyUrl}
                  className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-extrabold text-sm shadow-lg shadow-amber-500/25 transition-all text-center flex items-center justify-center gap-2 hover:scale-[1.02]"
                >
                  <span>Apply Now</span>
                  <ArrowRight size={16} />
                </Link>

                <div className="space-y-2.5 pt-2 text-xs font-semibold text-stone-500 dark:text-stone-400">
                  <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400">
                    <CheckCircle2 size={16} />
                    <span>100% Free Application (Zero Fees)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock3 size={16} className="text-amber-500" />
                    <span>Quick 48-Hour HR Review</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <UsersRound size={16} className="text-amber-500" />
                    <span>Direct Founder Mentorship</span>
                  </div>
                </div>
              </div>

              {/* Role Snapshot Summary Card */}
              <div className="bg-white dark:bg-stone-900 rounded-3xl p-6 border border-stone-200/80 dark:border-stone-800 shadow-md space-y-4">
                <h4 className="text-xs font-black uppercase tracking-wider text-amber-500">
                  Role Snapshot
                </h4>

                <div className="space-y-3 text-xs">
                  <div className="flex items-center justify-between py-2 border-b border-stone-100 dark:border-stone-800">
                    <span className="text-stone-500 dark:text-stone-400 font-medium">Department</span>
                    <span className="font-bold text-stone-900 dark:text-white">{job.department || 'EdTech'}</span>
                  </div>

                  <div className="flex items-center justify-between py-2 border-b border-stone-100 dark:border-stone-800">
                    <span className="text-stone-500 dark:text-stone-400 font-medium">Employment Type</span>
                    <span className="font-bold text-stone-900 dark:text-white">{job.type}</span>
                  </div>

                  <div className="flex items-center justify-between py-2 border-b border-stone-100 dark:border-stone-800">
                    <span className="text-stone-500 dark:text-stone-400 font-medium">Location</span>
                    <span className="font-bold text-stone-900 dark:text-white">{job.location}</span>
                  </div>

                  <div className="flex items-center justify-between py-2 border-b border-stone-100 dark:border-stone-800">
                    <span className="text-stone-500 dark:text-stone-400 font-medium">Experience</span>
                    <span className="font-bold text-amber-600 dark:text-amber-400">{job.experienceLevel}</span>
                  </div>

                  <div className="flex items-center justify-between py-2">
                    <span className="text-stone-500 dark:text-stone-400 font-medium">Compensation</span>
                    <span className="font-black text-emerald-600 dark:text-emerald-400">{job.salary}</span>
                  </div>
                </div>
              </div>

              {/* Social Share Box */}
              <div className="bg-white dark:bg-stone-900 rounded-3xl p-6 border border-stone-200/80 dark:border-stone-800 shadow-md space-y-3 text-xs">
                <span className="font-extrabold text-stone-900 dark:text-white block">
                  Share this opening
                </span>
                <div className="flex items-center gap-2.5">
                  <button
                    onClick={shareLinkedIn}
                    className="flex-1 py-2 rounded-xl bg-stone-100 dark:bg-stone-800 hover:bg-sky-500 hover:text-white text-stone-700 dark:text-stone-300 font-bold transition-all text-center"
                  >
                    LinkedIn
                  </button>
                  <button
                    onClick={shareTwitter}
                    className="flex-1 py-2 rounded-xl bg-stone-100 dark:bg-stone-800 hover:bg-stone-950 hover:text-white text-stone-700 dark:text-stone-300 font-bold transition-all text-center"
                  >
                    X / Twitter
                  </button>
                  <button
                    onClick={copyShareLink}
                    className="flex-1 py-2 rounded-xl bg-stone-100 dark:bg-stone-800 hover:bg-amber-500 hover:text-white text-stone-700 dark:text-stone-300 font-bold transition-all text-center"
                  >
                    Copy Link
                  </button>
                </div>
              </div>

            </div>

          </div>

        </div>
      </main>
    </SiteShell>
  );
};

export default PublicJob;
