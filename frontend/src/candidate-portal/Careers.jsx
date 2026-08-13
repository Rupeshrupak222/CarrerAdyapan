import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import AdyapanLogo from '../components/common/AdyapanLogo';
import { useTheme } from '../context/ThemeContext';
import { jobService } from '../services/jobService';

const Careers = () => {
  const { theme, toggleTheme } = useTheme();
  const [searchTerm, setSearchTerm] = useState('');
  const [department, setDepartment] = useState('ALL');
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLiveJobs();
  }, []);

  const fetchLiveJobs = async () => {
    try {
      const res = await jobService.getAllJobs();
      if (res?.jobs) {
        setJobs(res.jobs.filter((j) => j.status === 'PUBLISHED'));
      }
    } catch (e) {
      console.warn('Failed to load published jobs:', e);
    } finally {
      setLoading(false);
    }
  };

  const filteredJobs = jobs.filter((job) => {
    const matchesSearch =
      (job.title || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (job.description || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (job.department || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDept = department === 'ALL' || (job.department || '').toUpperCase() === department.toUpperCase();
    return matchesSearch && matchesDept;
  });

  const formatSalary = (min, max) => {
    if (!min && !max) return 'Best in Industry';
    const fmt = (n) => {
      if (n >= 100000) return `₹${(n / 100000).toFixed(n % 100000 === 0 ? 0 : 1)} LPA`;
      return `₹${n?.toLocaleString('en-IN')}`;
    };
    if (min && max) return `${fmt(min)} - ${fmt(max)} / yr`;
    if (min) return `${fmt(min)}+ / yr`;
    return `Up to ${fmt(max)} / yr`;
  };

  return (
    <div className={`min-h-screen font-sans antialiased transition-colors ${theme === 'dark' ? 'bg-slate-950 text-white' : 'bg-gradient-to-br from-slate-50 via-white to-amber-50/20 text-slate-900'
      }`}>
      {/* Adyapan Brand Glassmorphic Navbar */}
      <nav className={`sticky top-0 z-50 px-3.5 sm:px-6 py-2.5 sm:py-3.5 backdrop-blur-xl border-b transition-all ${theme === 'dark'
          ? 'bg-slate-950/90 border-slate-800/80 shadow-2xl shadow-slate-950'
          : 'bg-white/90 border-amber-200/80 shadow-md shadow-amber-500/5'
        }`}>
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-2 sm:gap-4">
          {/* Logo & Brand Identity */}
          <Link to="/careers" className="flex items-center gap-2 group shrink-0">
            <AdyapanLogo variant={theme === 'dark' ? 'dark' : 'light'} size="small" />
          </Link>

          {/* Quick Nav Links */}
          <div className="hidden md:flex items-center gap-3 text-xs font-bold">
            <a
              href="#openings"
              className={`px-3.5 py-1.5 rounded-xl border transition-all flex items-center gap-1.5 ${theme === 'dark'
                  ? 'bg-slate-900 border-slate-700 text-slate-200 hover:border-amber-400'
                  : 'bg-white border-amber-200 text-amber-900 hover:bg-orange-100 shadow-sm'
                }`}
            >
              <span>💼 Active Roles</span>
            </a>

            <a
              href="https://www.adyapan.com"
              target="_blank"
              rel="noreferrer"
              className={`px-3.5 py-1.5 rounded-xl border transition-all flex items-center gap-1.5 ${theme === 'dark'
                  ? 'bg-slate-900 border-slate-700 text-slate-200 hover:border-amber-400'
                  : 'bg-white border-slate-200 text-slate-700 hover:border-amber-400 shadow-sm'
                }`}
            >
              <span>🌐 adyapan.com</span>
              <span className="text-amber-500 font-extrabold">↗</span>
            </a>
          </div>

          {/* Right Action Buttons */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            <button
              onClick={toggleTheme}
              className={`px-2.5 sm:px-3.5 py-1.5 sm:py-2 rounded-xl text-xs font-extrabold transition-all flex items-center gap-1.5 border shadow-sm ${theme === 'dark'
                  ? 'bg-slate-900 text-amber-300 border-slate-800 hover:bg-slate-800'
                  : 'bg-white text-slate-800 border-slate-200 hover:bg-slate-100'
                }`}
            >
              <span className="hidden sm:inline">{theme === 'dark' ? '🌙 Dark Mode' : '☀️ Light Mode'}</span>
              <span className="sm:hidden">{theme === 'dark' ? '🌙' : '☀️'}</span>
            </button>

            <Link
              to="/login"
              className="px-3 sm:px-4 py-2 sm:py-2.5 text-xs font-extrabold text-white bg-gradient-to-r from-amber-600 via-amber-500 to-amber-500 hover:from-amber-500 hover:to-amber-600 rounded-xl transition-all shadow-md shadow-amber-500/25 uppercase tracking-wider flex items-center gap-1 shrink-0"
            >
              <span>🔐</span>
              <span className="hidden sm:inline">HR Login</span>
              <span className="sm:hidden">Login</span>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section with Adyapan Colors */}
      <header className={`border-b py-10 sm:py-16 px-4 sm:px-6 text-center relative overflow-hidden ${theme === 'dark'
          ? 'border-slate-800/80 bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950'
          : 'border-amber-200/60 bg-gradient-to-b from-amber-50/40 via-white to-white'
        }`}>
        {/* Glow backdrop effects */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-amber-500/10 blur-3xl rounded-full pointer-events-none" />

        <div className="relative max-w-4xl mx-auto space-y-4 sm:space-y-5">
          <div className="inline-flex items-center gap-2 px-3 sm:px-4 py-1.5 text-[10px] sm:text-xs font-extrabold bg-amber-500/15 text-amber-700 dark:text-amber-300 border border-amber-500/30 rounded-full shadow-sm">
            <span>✨ OFFICIAL ADYAPAN EDUTECH CAREERS PORTAL</span>
          </div>

          <h1 className="text-2xl sm:text-4xl md:text-5xl font-black tracking-tight leading-tight text-slate-900 dark:text-white">
            Build Your Career With <br className="hidden sm:inline" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-500 via-amber-600 to-amber-600 dark:from-amber-400 dark:via-amber-400 dark:to-amber-400">
              India's Premier EdTech Platform
            </span>
          </h1>

          <p className="text-sm md:text-base font-medium text-slate-600 dark:text-slate-300 max-w-2xl mx-auto leading-relaxed">
            Join Adyapan Edutech Pvt. Ltd. and help thousands of students across India achieve career excellence through quality education, student counselling, and industry placements.
          </p>

          {/* Accreditation Badges */}
          <div className="pt-2 flex flex-wrap justify-center items-center gap-2.5 text-[11px] font-extrabold">
            <span className={`px-3.5 py-1.5 rounded-full border ${theme === 'dark' ? 'bg-slate-900 border-slate-800 text-amber-400' : 'bg-white border-amber-200 text-amber-800 shadow-sm'
              }`}>★ ISO 9001:2015 Certified</span>
            <span className={`px-3.5 py-1.5 rounded-full border ${theme === 'dark' ? 'bg-slate-900 border-slate-800 text-amber-300' : 'bg-white border-amber-200 text-amber-800 shadow-sm'
              }`}>🇮🇳 Skill India Digital Partner</span>
            <span className={`px-3.5 py-1.5 rounded-full border ${theme === 'dark' ? 'bg-slate-900 border-slate-800 text-emerald-400' : 'bg-white border-emerald-200 text-emerald-800 shadow-sm'
              }`}>🏢 MSME Govt. Recognized</span>
          </div>

          {/* Highlight Metrics */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-6 max-w-3xl mx-auto">
            <div className={`p-3.5 rounded-2xl border text-center ${theme === 'dark' ? 'bg-slate-900/80 border-slate-800' : 'bg-white/80 border-amber-200/80 shadow-sm'
              }`}>
              <div className="text-xl font-black text-amber-500">100%</div>
              <div className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">AI Screening</div>
            </div>
            <div className={`p-3.5 rounded-2xl border text-center ${theme === 'dark' ? 'bg-slate-900/80 border-slate-800' : 'bg-white/80 border-amber-200/80 shadow-sm'
              }`}>
              <div className="text-xl font-black text-amber-500">500+</div>
              <div className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">Hiring Partners</div>
            </div>
            <div className={`p-3.5 rounded-2xl border text-center ${theme === 'dark' ? 'bg-slate-900/80 border-slate-800' : 'bg-white/80 border-amber-200/80 shadow-sm'
              }`}>
              <div className="text-xl font-black text-amber-500">15,000+</div>
              <div className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">Students Skilled</div>
            </div>
            <div className={`p-3.5 rounded-2xl border text-center ${theme === 'dark' ? 'bg-slate-900/80 border-slate-800' : 'bg-white/80 border-amber-200/80 shadow-sm'
              }`}>
              <div className="text-xl font-black text-amber-500">Fast-Track</div>
              <div className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">Direct Offers</div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main id="openings" className="max-w-6xl mx-auto px-6 py-12 space-y-8">
        {/* Search & Department Filters */}
        <div className={`p-5 rounded-3xl border shadow-xl flex flex-col md:flex-row items-center justify-between gap-4 ${theme === 'dark' ? 'bg-slate-900 border-slate-800' : 'bg-white border-amber-200/80'
          }`}>
          <div className="relative w-full md:w-80">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-amber-500 font-bold">🔍</span>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search BDA, Counsellor, Telecaller, Tech..."
              className={`w-full pl-10 pr-4 py-2.5 rounded-2xl text-xs font-bold focus:outline-none border transition-all ${theme === 'dark'
                  ? 'bg-slate-950 border-slate-700 text-white focus:border-amber-400'
                  : 'bg-slate-50 border-slate-200 text-slate-900 focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20'
                }`}
            />
          </div>

          <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
            {['ALL', 'Sales & Growth', 'Student Admissions', 'Inside Sales', 'Engineering'].map((dept) => (
              <button
                key={dept}
                onClick={() => setDepartment(dept)}
                className={`px-3.5 py-2 rounded-xl text-xs font-extrabold transition-all border ${department === dept
                    ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-md shadow-amber-500/20'
                    : theme === 'dark'
                      ? 'bg-slate-950 border-slate-800 text-slate-300 hover:border-slate-700'
                      : 'bg-slate-100 border-slate-200 text-slate-700 hover:bg-slate-200'
                  }`}
              >
                {dept === 'ALL' ? 'All Roles' : dept}
              </button>
            ))}
          </div>
        </div>

        {/* Loading Skeleton */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[1, 2, 3, 4].map((n) => (
              <div key={n} className="h-64 rounded-3xl bg-slate-200 dark:bg-slate-900 animate-pulse border border-slate-300 dark:border-slate-800" />
            ))}
          </div>
        ) : filteredJobs.length === 0 ? (
          /* Empty State */
          <div className={`p-12 rounded-3xl border text-center space-y-4 shadow-xl ${theme === 'dark' ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-amber-200 text-slate-900'
            }`}>
            <div className="w-16 h-16 rounded-3xl bg-amber-500/20 text-amber-500 flex items-center justify-center text-3xl mx-auto shadow-inner">
              💼
            </div>
            <h3 className="text-lg font-black">No Roles Currently Match Your Search</h3>
            <p className="text-xs font-medium text-slate-500 dark:text-slate-400 max-w-md mx-auto">
              Try adjusting your search terms or selecting "All Roles" above. New opportunities are published daily!
            </p>
            <button
              onClick={() => { setSearchTerm(''); setDepartment('ALL'); }}
              className="px-5 py-2.5 text-xs font-extrabold text-white bg-amber-500 hover:bg-amber-600 rounded-xl transition-all shadow-md shadow-amber-400/20"
            >
              Reset Search & View All Openings
            </button>
          </div>
        ) : (
          /* Job Cards Grid */
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredJobs.map((job) => (
              <div
                key={job.id || job._id}
                className={`rounded-3xl p-7 transition-all duration-300 flex flex-col justify-between space-y-5 border shadow-xl hover:shadow-2xl hover:-translate-y-1.5 relative overflow-hidden group ${theme === 'dark'
                    ? 'bg-slate-900 border-slate-800 hover:border-amber-500/50'
                    : 'bg-white border-amber-200/80 hover:border-amber-400 shadow-amber-500/5'
                  }`}
              >
                {/* Accent Top Strip */}
                <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500" />

                <div className="space-y-4 pt-1">
                  {/* Category Header */}
                  <div className="flex items-center justify-between">
                    <span className="px-3 py-1 text-[11px] font-extrabold bg-amber-500/15 text-amber-700 dark:text-amber-300 rounded-full border border-amber-500/30">
                      🏢 {job.department || 'EdTech Role'}
                    </span>
                    <span className="px-2.5 py-0.5 text-[10px] font-extrabold bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 rounded-full border border-emerald-500/30">
                      ● Active Hiring
                    </span>
                  </div>

                  {/* Role Title */}
                  <h2 className="text-xl font-black text-slate-900 dark:text-white group-hover:text-amber-500 transition-colors leading-snug">
                    {job.title}
                  </h2>

                  {/* Detail Badges */}
                  <div className="flex flex-wrap gap-2 text-xs font-bold">
                    <span className={`px-3 py-1.5 rounded-xl border ${theme === 'dark' ? 'bg-slate-950 border-slate-800 text-slate-300' : 'bg-slate-50 border-slate-200 text-slate-700'
                      }`}>
                      📍 {job.location || 'India'}
                    </span>
                    <span className={`px-3 py-1.5 rounded-xl border ${theme === 'dark' ? 'bg-slate-950 border-slate-800 text-slate-300' : 'bg-slate-50 border-slate-200 text-slate-700'
                      }`}>
                      💼 {job.type === 'FULL_TIME' ? 'Full Time' : job.type || 'Full Time'}
                    </span>
                    <span className="px-3 py-1.5 rounded-xl bg-amber-500/15 text-amber-700 dark:text-amber-300 border border-amber-500/30 font-extrabold">
                      💰 {formatSalary(job.salaryMin, job.salaryMax)}
                    </span>
                  </div>

                  {/* Brief Overview Description */}
                  <p className="text-xs font-medium text-slate-600 dark:text-slate-300 leading-relaxed line-clamp-3">
                    {job.description}
                  </p>
                </div>

                {/* Card Action Button */}
                <div className="pt-4 border-t border-slate-200 dark:border-slate-800/80">
                  <Link
                    to={`/careers/${job.slug || job.id}`}
                    className="w-full inline-flex items-center justify-center gap-2 py-3 text-xs font-extrabold text-slate-950 bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 hover:from-amber-400 hover:to-amber-400 rounded-2xl transition-all shadow-md shadow-amber-500/20 uppercase tracking-wider group-hover:scale-[1.01]"
                  >
                    <span>View Role Specifications & Apply</span>
                    <span>→</span>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Official Adyapan Edutech Footer */}
      <footer className={`border-t py-10 px-6 text-center text-xs font-medium ${theme === 'dark' ? 'border-slate-800 bg-slate-950 text-slate-400' : 'border-amber-200/80 bg-white text-slate-600 shadow-inner'
        }`}>
        <div className="max-w-4xl mx-auto space-y-3">
          <div className="flex justify-center">
            <AdyapanLogo variant={theme === 'dark' ? 'dark' : 'light'} size="small" />
          </div>
          <p className="font-bold text-slate-800 dark:text-slate-200">
            Adyapan Edutech Pvt. Ltd. — Empowering Students, Counsellors & Tech Leaders Across India.
          </p>
          <p>© 2026 Adyapan Edutech. All rights reserved. Sattva Magnus, Sabza Colony, Toli Chowki, Hyderabad, Telangana 500008</p>
        </div>
      </footer>
    </div>
  );
};

export default Careers;

