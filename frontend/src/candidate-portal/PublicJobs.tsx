import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import CandidateNavbar from '../components/layout/CandidateNavbar';
import Footer from '../components/layout/Footer';
import { useTheme } from '../context/ThemeContext';
import { useCandidateAuth } from '../context/CandidateAuthContext';
import { jobService } from '../services/jobService';

const DEPARTMENT_FILTERS = [
  'All',
  'Sales & Growth',
  'Technology & AI',
  'Academic Counselling',
  'Marketing & Brand',
  'Operations & Success',
  'Curriculum & Content',
];

const TYPE_FILTERS = [
  { key: 'ALL', label: 'All Types' },
  { key: 'FULL_TIME', label: 'Full Time' },
  { key: 'INTERNSHIP', label: 'Internship' },
  { key: 'PART_TIME', label: 'Part Time' },
  { key: 'CONTRACT', label: 'Contract' },
];

const PublicJobs = () => {
  const [searchParams] = useSearchParams();
  const { theme, toggleTheme } = useTheme();
  const { candidate, logout } = useCandidateAuth();
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);

  const [searchTerm, setSearchTerm] = useState(searchParams.get('q') || '');
  const [locationTerm, setLocationTerm] = useState(searchParams.get('location') || '');
  const [selectedDept, setSelectedDept] = useState(searchParams.get('department') || 'All');
  const [selectedType, setSelectedType] = useState('ALL');
  const [jobs, setJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLiveJobs();
  }, []);

  const fetchLiveJobs = async () => {
    try {
      const res = await jobService.getPublicJobs();
      if (res?.jobs) {
        setJobs(res.jobs.filter((j: any) => j.status === 'PUBLISHED'));
      }
    } catch {
      try {
        const res = await jobService.getAllJobs();
        if (res?.jobs) {
          setJobs(res.jobs.filter((j: any) => j.status === 'PUBLISHED'));
        }
      } catch (e2) {
        console.error('Failed to load jobs:', e2);
      }
    } finally {
      setLoading(false);
    }
  };

  const filteredJobs = jobs.filter((job: any) => {
    const q = searchTerm.toLowerCase();
    const matchesSearch =
      !q ||
      (job.title || '').toLowerCase().includes(q) ||
      (job.description || '').toLowerCase().includes(q) ||
      (job.department || '').toLowerCase().includes(q) ||
      (job.skills || []).some((s: string) => s.toLowerCase().includes(q));

    const matchesLocation = !locationTerm || (job.location || '').toLowerCase().includes(locationTerm.toLowerCase());

    const matchesDept =
      selectedDept === 'All' ||
      (job.department || '').toLowerCase().includes(selectedDept.toLowerCase()) ||
      (selectedDept === 'Sales & Growth' && (job.title || '').toLowerCase().includes('sales')) ||
      (selectedDept === 'Technology & AI' && ((job.title || '').toLowerCase().includes('developer') || (job.title || '').toLowerCase().includes('tech'))) ||
      (selectedDept === 'Academic Counselling' && (job.title || '').toLowerCase().includes('counsellor'));

    const matchesType = selectedType === 'ALL' || (job.type || '') === selectedType;

    return matchesSearch && matchesLocation && matchesDept && matchesType;
  });

  const formatSalary = (min?: number, max?: number) => {
    if (!min && !max) return 'Competitive / Best in Industry';
    const fmt = (n: number) => {
      if (n >= 100000) return `₹${(n / 100000).toFixed(n % 100000 === 0 ? 0 : 1)} LPA`;
      return `₹${n?.toLocaleString('en-IN')}`;
    };
    if (min && max) return `${fmt(min)} - ${fmt(max)}`;
    if (min) return `${fmt(min)}+`;
    return `Up to ${fmt(max)}`;
  };

  const formatType = (type: string) => {
    switch (type) {
      case 'FULL_TIME': return 'Full Time';
      case 'PART_TIME': return 'Part Time';
      case 'INTERNSHIP': return 'Internship';
      case 'CONTRACT': return 'Contract';
      default: return type || 'Full Time';
    }
  };

  const clearAllFilters = () => {
    setSearchTerm('');
    setLocationTerm('');
    setSelectedDept('All');
    setSelectedType('ALL');
  };

  const hasActiveFilters = Boolean(searchTerm || locationTerm || selectedDept !== 'All' || selectedType !== 'ALL');

  return (
    <div className={`min-h-screen font-sans antialiased transition-colors relative overflow-x-hidden ${theme === 'dark' ? 'bg-[#0a0a1a] text-slate-100' : 'bg-slate-50/50 text-slate-900'
      }`}>

      {/* Persistent Full-Page Right-to-Left Orange Gradient Glow */}
      <div className="fixed top-0 right-0 w-[55vw] max-w-[800px] h-full pointer-events-none bg-gradient-to-l from-orange-400/15 via-amber-200/10 to-transparent dark:from-amber-500/10 dark:via-amber-900/5 dark:to-transparent blur-3xl z-0" />

      {/* ===== 1. TOP NAVBAR ===== */}
      <CandidateNavbar activePage="jobs" />

      {/* ===== 2. HERO GRADIENT HEADER ===== */}
      <section className="relative overflow-hidden bg-gradient-to-r from-[#18181b] via-[#78350f] via-50% to-[#d97706] text-white py-14 sm:py-16 px-4 sm:px-8 border-b border-amber-500/30 shadow-xl">
        {/* Ambient Glows */}
        <div className="absolute -top-24 right-0 w-[500px] h-[500px] bg-amber-400/30 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 right-1/4 w-[350px] h-[350px] bg-orange-500/25 rounded-full blur-2xl pointer-events-none" />

        <div className="max-w-7xl mx-auto space-y-4 relative z-10">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-amber-400 text-slate-950 rounded-full text-[11px] font-black uppercase tracking-wider shadow-md">
            ● OFFICIAL ADYAPAN CAREERS DIRECTORY
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-white leading-tight drop-shadow-sm">
            Find Your Ideal Role at Adyapan
          </h1>

          <p className="text-sm sm:text-base text-white font-medium max-w-2xl leading-relaxed drop-shadow-sm">
            Explore verified open positions across sales, technology, curriculum architecture, and student success. Accelerate your career with India's leading education platform.
          </p>

          <div className="flex flex-wrap items-center gap-3 sm:gap-4 text-xs font-bold text-white pt-2">
            <span className="flex items-center gap-1.5 bg-black/40 px-3.5 py-1.5 rounded-xl text-white font-bold backdrop-blur-sm border border-white/20">
              🏢 ISO 9001:2015 & MSME Certified
            </span>
            <span className="flex items-center gap-1.5 bg-black/40 px-3.5 py-1.5 rounded-xl text-white font-bold backdrop-blur-sm border border-white/20">
              ⚡ Instant AI Screening Enabled
            </span>
            <span className="px-3.5 py-1.5 rounded-full bg-emerald-400 text-slate-950 font-black shadow-md">
              {jobs.length} Verified Position{jobs.length !== 1 ? 's' : ''} Live
            </span>
          </div>
        </div>
      </section>

      {/* ===== 3. SEARCH & FILTERS CONTROLS ===== */}
      <section className="max-w-7xl mx-auto px-4 sm:px-8 -mt-6 relative z-20">
        <div className={`p-4 sm:p-6 rounded-3xl border shadow-2xl space-y-4 ${theme === 'dark' ? 'bg-slate-900/95 border-slate-700 backdrop-blur-xl' : 'bg-white/95 border-amber-200/80 backdrop-blur-xl'
          }`}>

          {/* Main Search Inputs */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
            <div className={`md:col-span-6 flex items-center px-4 py-3 rounded-2xl border ${theme === 'dark' ? 'bg-slate-950 border-slate-700 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
              }`}>
              <svg className="w-5 h-5 text-amber-500 mr-3 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search by job title, skill (e.g. Sales, React, Telecaller)..."
                className="w-full bg-transparent text-sm font-semibold border-0 focus:outline-none placeholder-slate-400"
              />
            </div>

            <div className={`md:col-span-4 flex items-center px-4 py-3 rounded-2xl border ${theme === 'dark' ? 'bg-slate-950 border-slate-700 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
              }`}>
              <svg className="w-5 h-5 text-amber-500 mr-3 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <input
                type="text"
                value={locationTerm}
                onChange={(e) => setLocationTerm(e.target.value)}
                placeholder="Location (e.g. Hyderabad, Remote)..."
                className="w-full bg-transparent text-sm font-semibold border-0 focus:outline-none placeholder-slate-400"
              />
            </div>

            <div className="md:col-span-2 flex items-center gap-2">
              <select
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
                className={`w-full px-4 py-3 rounded-2xl text-xs font-bold border focus:outline-none cursor-pointer ${theme === 'dark' ? 'bg-slate-950 border-slate-700 text-white' : 'bg-slate-50 border-slate-200 text-slate-800'
                  }`}
              >
                {TYPE_FILTERS.map((t) => (
                  <option key={t.key} value={t.key}>
                    {t.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Department Pills & Clear Filter Button */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-1 border-t border-slate-100 dark:border-slate-800">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-bold text-slate-500 dark:text-slate-400 mr-1">
                Department:
              </span>
              {DEPARTMENT_FILTERS.map((dept) => {
                const active = selectedDept === dept;
                return (
                  <button
                    key={dept}
                    onClick={() => setSelectedDept(dept)}
                    className={`px-3.5 py-1.5 rounded-xl text-xs font-extrabold transition-all cursor-pointer ${active
                        ? 'bg-amber-500 text-slate-950 font-black shadow-md shadow-amber-500/20 scale-105'
                        : theme === 'dark'
                          ? 'bg-slate-950 text-slate-300 border border-slate-800 hover:border-amber-400/50'
                          : 'bg-slate-100 text-slate-700 border border-slate-200 hover:bg-slate-200'
                      }`}
                  >
                    {dept}
                  </button>
                );
              })}
            </div>

            {hasActiveFilters && (
              <button
                onClick={clearAllFilters}
                className="text-xs font-extrabold text-red-500 hover:text-red-600 flex items-center gap-1 cursor-pointer transition-colors px-2 py-1"
              >
                <span>✕</span>
                <span>Clear Filters</span>
              </button>
            )}
          </div>

        </div>
      </section>

      {/* ===== 4. JOB LISTINGS DIRECTORY ===== */}
      <main className="max-w-7xl mx-auto px-4 sm:px-8 py-10 relative z-10 space-y-6">

        <div className="flex items-center justify-between">
          <p className="text-xs sm:text-sm font-bold text-slate-600 dark:text-slate-400">
            Showing <strong className="text-amber-500 font-extrabold">{filteredJobs.length}</strong> available position{filteredJobs.length !== 1 ? 's' : ''}
          </p>
        </div>

        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((n) => (
              <div key={n} className={`h-36 rounded-3xl animate-pulse border ${theme === 'dark' ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
                }`} />
            ))}
          </div>
        ) : filteredJobs.length === 0 ? (
          <div className={`text-center py-20 px-6 rounded-3xl border space-y-4 ${theme === 'dark' ? 'bg-slate-900/60 border-slate-800' : 'bg-white border-amber-200/80 shadow-md'
            }`}>
            <div className="w-16 h-16 rounded-3xl bg-amber-500/15 text-amber-500 text-3xl flex items-center justify-center mx-auto shadow-inner">
              🔍
            </div>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white">
              No matching positions found
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto">
              We couldn't find any roles matching your current search or filter criteria. Try searching with different keywords or clear filters.
            </p>
            <button
              onClick={clearAllFilters}
              className="px-6 py-2.5 rounded-full text-xs font-black text-slate-950 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-orange-400 shadow-md transition-all cursor-pointer uppercase tracking-wider"
            >
              Reset All Filters
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredJobs.map((job: any) => (
              <Link
                key={job.id || job._id}
                to={`/careers/${job.slug || job.id}`}
                className={`block p-6 sm:p-7 rounded-3xl border transition-all duration-300 group hover:-translate-y-1 ${theme === 'dark'
                    ? 'bg-slate-900/80 border-slate-800 hover:border-amber-500/60 hover:bg-slate-900 shadow-lg hover:shadow-amber-500/10'
                    : 'bg-white border-amber-200/60 hover:border-amber-400 hover:shadow-xl hover:shadow-amber-500/10 shadow-sm'
                  }`}
              >
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">

                  {/* Left Role Info */}
                  <div className="space-y-3 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="px-3 py-1 rounded-full text-[11px] font-black uppercase tracking-wider bg-amber-500/15 text-amber-800 dark:text-amber-300 border border-amber-500/30">
                        {job.department || 'EdTech Growth'}
                      </span>
                      <span className="px-3 py-1 rounded-full text-[11px] font-bold bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30">
                        ● Verified Official Position
                      </span>
                    </div>

                    <h2 className="text-xl sm:text-2xl font-bold group-hover:text-amber-500 transition-colors text-slate-900 dark:text-white leading-tight">
                      {job.title}
                    </h2>

                    {/* Metadata Chips */}
                    <div className="flex flex-wrap items-center gap-3 sm:gap-4 text-xs font-semibold text-slate-600 dark:text-slate-300">
                      <span className="flex items-center gap-1.5">
                        📍 {job.location || 'Hyderabad / Pan-India'}
                      </span>
                      <span>•</span>
                      <span className="flex items-center gap-1.5">
                        💼 {formatType(job.type)}
                      </span>
                      <span>•</span>
                      <span className="flex items-center gap-1.5">
                        🎯 {job.experienceLevel || 'Fresher / Experienced'}
                      </span>
                      <span>•</span>
                      <span className="font-extrabold text-amber-600 dark:text-amber-400">
                        💰 {formatSalary(job.salaryMin, job.salaryMax)}
                      </span>
                    </div>

                    {job.description && (
                      <p className="text-xs leading-relaxed line-clamp-2 text-slate-500 dark:text-slate-400 pt-1">
                        {job.description}
                      </p>
                    )}
                  </div>

                  {/* Right Action Button */}
                  <div className="shrink-0 flex items-center lg:flex-col justify-between lg:justify-center gap-3 pt-2 lg:pt-0 border-t lg:border-t-0 border-slate-100 dark:border-slate-800">
                    <span className="px-6 py-3 rounded-full text-xs font-extrabold text-slate-950 bg-gradient-to-r from-amber-400 via-amber-500 to-orange-500 group-hover:from-amber-300 group-hover:to-orange-400 shadow-md shadow-amber-500/20 flex items-center gap-2 group-hover:scale-105 transition-all">
                      <span>View & Apply</span>
                      <span className="text-sm font-bold">→</span>
                    </span>
                  </div>

                </div>
              </Link>
            ))}
          </div>
        )}

      </main>

      {/* ===== 5. FOOTER ===== */}
      <Footer isPublic={true} />

    </div>
  );
};

export default PublicJobs;
