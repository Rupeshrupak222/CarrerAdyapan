import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import AdyapanLogo from '../components/common/AdyapanLogo';
import Footer from '../components/layout/Footer';
import { useTheme } from '../context/ThemeContext';
import { useCandidateAuth } from '../context/CandidateAuthContext';
import { jobService } from '../services/jobService';

const PublicJobs = () => {
  const { theme, toggleTheme } = useTheme();
  const { candidate } = useCandidateAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [locationTerm, setLocationTerm] = useState('');
  const [department, setDepartment] = useState('ALL');
  const [jobType, setJobType] = useState('ALL');
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

  const departments = ['ALL', ...Array.from(new Set(jobs.map((j: any) => j.department).filter(Boolean)))];
  const jobTypes = ['ALL', 'FULL_TIME', 'PART_TIME', 'INTERNSHIP', 'CONTRACT'];

  const filteredJobs = jobs.filter((job: any) => {
    const matchesSearch =
      (job.title || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (job.description || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (job.department || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchesLocation = !locationTerm || (job.location || '').toLowerCase().includes(locationTerm.toLowerCase());
    const matchesDept = department === 'ALL' || (job.department || '').toUpperCase() === department.toUpperCase();
    const matchesType = jobType === 'ALL' || (job.type || '') === jobType;
    return matchesSearch && matchesLocation && matchesDept && matchesType;
  });

  const formatSalary = (min: number, max: number) => {
    if (!min && !max) return 'Competitive';
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

  return (
    <div className={`min-h-screen font-sans antialiased transition-colors ${theme === 'dark' ? 'bg-[#0a0a1a] text-white' : 'bg-white text-slate-900'}`}>

      {/* ===== NAV ===== */}
      <nav className={`sticky top-0 z-50 px-4 sm:px-8 py-4 border-b backdrop-blur-xl transition-all ${theme === 'dark'
        ? 'bg-[#0a0a1a]/95 border-slate-800'
        : 'bg-white/95 border-slate-200'
        }`}>
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Link to="/careers" className="flex items-center gap-2">
            <AdyapanLogo variant={theme === 'dark' ? 'dark' : 'light'} size="small" />
          </Link>

          <div className="hidden lg:flex items-center gap-8 text-sm font-medium">
            <Link to="/open-positions" className="text-amber-500 font-semibold">Jobs</Link>
            <Link to="/careers#life" className={`hover:text-amber-500 transition-colors ${theme === 'dark' ? 'text-slate-200' : 'text-slate-700'}`}>Life at Adyapan</Link>
            <a href="https://www.adyapan.com" target="_blank" rel="noreferrer" className={`hover:text-amber-500 transition-colors ${theme === 'dark' ? 'text-slate-200' : 'text-slate-700'}`}>About Us</a>
            <Link to="/contact" className={`hover:text-amber-500 transition-colors ${theme === 'dark' ? 'text-slate-200' : 'text-slate-700'}`}>Contact</Link>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={toggleTheme}
              className={`p-2 rounded-lg transition-colors ${theme === 'dark' ? 'text-slate-400 hover:text-amber-400 hover:bg-slate-800' : 'text-slate-500 hover:text-amber-500 hover:bg-slate-100'}`}
              aria-label="Toggle theme"
            >
              {theme === 'dark' ? (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
              ) : (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" /></svg>
              )}
            </button>
            {candidate ? (
              <Link to="/my-applications" className="px-4 py-2 text-sm font-semibold text-white bg-amber-500 hover:bg-amber-600 rounded-lg transition-all">
                My Applications
              </Link>
            ) : (
              <Link to="/login" className="px-4 py-2 text-sm font-semibold text-white bg-amber-500 hover:bg-amber-600 rounded-lg transition-all">
                Sign In
              </Link>
            )}
          </div>
        </div>
      </nav>

      {/* ===== PAGE HEADER ===== */}
      <section className={`border-b ${theme === 'dark' ? 'border-slate-800 bg-[#0d0d20]' : 'border-slate-100 bg-slate-50'}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-8 py-10">
          <h1 className="text-3xl font-bold mb-2">Find Your Role</h1>
          <p className={`text-sm ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>
            Explore current openings and apply for positions that match your skills
          </p>
        </div>
      </section>

      {/* ===== SEARCH & FILTERS ===== */}
      <section className={`border-b sticky top-[65px] z-40 ${theme === 'dark' ? 'border-slate-800 bg-[#0a0a1a]/95 backdrop-blur-xl' : 'border-slate-200 bg-white/95 backdrop-blur-xl'}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-8 py-4">
          <div className="flex flex-col lg:flex-row items-stretch lg:items-center gap-3">
            {/* Search inputs */}
            <div className={`flex flex-1 items-stretch rounded-lg border overflow-hidden ${theme === 'dark' ? 'border-slate-700 bg-slate-900' : 'border-slate-200 bg-slate-50'}`}>
              <div className="relative flex-1">
                <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Job title or keyword"
                  className={`w-full pl-10 pr-4 py-2.5 text-sm border-0 focus:outline-none ${theme === 'dark' ? 'bg-transparent text-white placeholder-slate-500' : 'bg-transparent text-slate-900 placeholder-slate-400'}`}
                />
              </div>
              <div className={`w-px self-stretch ${theme === 'dark' ? 'bg-slate-700' : 'bg-slate-200'}`} />
              <div className="relative flex-1">
                <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                </svg>
                <input
                  type="text"
                  value={locationTerm}
                  onChange={(e) => setLocationTerm(e.target.value)}
                  placeholder="Location"
                  className={`w-full pl-10 pr-4 py-2.5 text-sm border-0 focus:outline-none ${theme === 'dark' ? 'bg-transparent text-white placeholder-slate-500' : 'bg-transparent text-slate-900 placeholder-slate-400'}`}
                />
              </div>
            </div>

            {/* Filters */}
            <div className="flex flex-wrap items-center gap-2">
              <select
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                className={`px-3 py-2.5 rounded-lg text-xs font-medium border focus:outline-none focus:ring-2 focus:ring-amber-500/30 ${theme === 'dark' ? 'bg-slate-900 border-slate-700 text-white' : 'bg-white border-slate-200 text-slate-700'}`}
              >
                <option value="ALL">All Departments</option>
                {departments.filter(d => d !== 'ALL').map(d => <option key={d} value={d}>{d}</option>)}
              </select>
              <select
                value={jobType}
                onChange={(e) => setJobType(e.target.value)}
                className={`px-3 py-2.5 rounded-lg text-xs font-medium border focus:outline-none focus:ring-2 focus:ring-amber-500/30 ${theme === 'dark' ? 'bg-slate-900 border-slate-700 text-white' : 'bg-white border-slate-200 text-slate-700'}`}
              >
                <option value="ALL">All Types</option>
                <option value="FULL_TIME">Full Time</option>
                <option value="PART_TIME">Part Time</option>
                <option value="INTERNSHIP">Internship</option>
                <option value="CONTRACT">Contract</option>
              </select>
              {(searchTerm || locationTerm || department !== 'ALL' || jobType !== 'ALL') && (
                <button
                  onClick={() => { setSearchTerm(''); setLocationTerm(''); setDepartment('ALL'); setJobType('ALL'); }}
                  className="px-3 py-2.5 rounded-lg text-xs font-medium text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                >
                  Clear
                </button>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ===== JOB LISTINGS ===== */}
      <section className="max-w-7xl mx-auto px-4 sm:px-8 py-8">
        <p className={`text-xs font-medium mb-6 ${theme === 'dark' ? 'text-slate-500' : 'text-slate-400'}`}>
          {filteredJobs.length} result{filteredJobs.length !== 1 ? 's' : ''} found
        </p>

        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3, 4, 5].map((n) => (
              <div key={n} className={`h-24 rounded-xl animate-pulse ${theme === 'dark' ? 'bg-slate-800' : 'bg-slate-100'}`} />
            ))}
          </div>
        ) : filteredJobs.length === 0 ? (
          <div className={`text-center py-20 rounded-2xl border ${theme === 'dark' ? 'bg-slate-900/50 border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
            <div className="text-3xl mb-3">🔍</div>
            <h3 className="text-lg font-bold mb-2">No positions found</h3>
            <p className={`text-sm mb-4 ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>
              Try adjusting your search or filters
            </p>
            <button
              onClick={() => { setSearchTerm(''); setLocationTerm(''); setDepartment('ALL'); setJobType('ALL'); }}
              className="text-sm font-semibold text-amber-500 hover:text-amber-600 transition-colors"
            >
              Clear all filters
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredJobs.map((job: any) => (
              <Link
                key={job.id || job._id}
                to={`/careers/${job.slug || job.id}`}
                className={`block p-5 sm:p-6 rounded-xl border transition-all group hover:shadow-lg ${theme === 'dark'
                  ? 'bg-slate-900/50 border-slate-800 hover:border-amber-500/40'
                  : 'bg-white border-slate-200 hover:border-amber-300'
                  }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <h3 className="text-base font-bold group-hover:text-amber-500 transition-colors mb-1.5">
                      {job.title}
                    </h3>
                    <div className={`flex flex-wrap items-center gap-3 text-xs ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>
                      <span className="flex items-center gap-1">
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>
                        {job.department || 'General'}
                      </span>
                      <span className="flex items-center gap-1">
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                        {job.location || 'India'}
                      </span>
                      <span className="flex items-center gap-1">
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                        {formatType(job.type)}
                      </span>
                      <span className="font-semibold text-amber-600 dark:text-amber-400">
                        {formatSalary(job.salaryMin, job.salaryMax)}
                      </span>
                    </div>
                    {job.description && (
                      <p className={`mt-2 text-xs line-clamp-1 ${theme === 'dark' ? 'text-slate-500' : 'text-slate-400'}`}>
                        {job.description}
                      </p>
                    )}
                  </div>
                  <div className="shrink-0">
                    <span className={`inline-flex items-center gap-1.5 px-5 py-2.5 rounded-lg text-xs font-semibold transition-all ${theme === 'dark'
                      ? 'bg-slate-800 text-slate-300 group-hover:bg-amber-500 group-hover:text-white'
                      : 'bg-slate-100 text-slate-700 group-hover:bg-amber-500 group-hover:text-white'
                      }`}>
                      View & Apply
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>

      <Footer isPublic={true} />
    </div>
  );
};

export default PublicJobs;
