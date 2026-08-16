import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import AdyapanLogo from '../components/common/AdyapanLogo';
import Footer from '../components/layout/Footer';
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
    <div className={`min-h-screen font-sans antialiased transition-colors ${
      theme === 'dark' ? 'bg-slate-950 text-white' : 'bg-slate-100 text-slate-900'
    }`}>
      
      {/* 1. Fully Transparent Glassmorphic Navbar */}
      <nav className={`sticky top-0 z-50 px-3.5 sm:px-6 py-2.5 sm:py-3.5 backdrop-blur-xl border-b transition-all ${
        theme === 'dark'
          ? 'bg-slate-950/40 border-white/10 shadow-2xl'
          : 'bg-white/30 border-white/40 shadow-sm'
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
              className={`px-3.5 py-1.5 rounded-xl border backdrop-blur-md transition-all flex items-center gap-1.5 ${
                theme === 'dark'
                  ? 'bg-slate-900/50 border-white/20 text-slate-200 hover:border-amber-400'
                  : 'bg-white/40 border-white/40 text-slate-800 hover:bg-white/60 shadow-sm'
              }`}
            >
              <span>Active Roles</span>
            </a>

            <Link
              to="/contact"
              className={`px-3.5 py-1.5 rounded-xl border backdrop-blur-md transition-all flex items-center gap-1.5 ${
                theme === 'dark'
                  ? 'bg-slate-900/50 border-white/20 text-slate-200 hover:border-amber-400'
                  : 'bg-white/40 border-white/40 text-slate-800 hover:border-amber-400 shadow-sm'
              }`}
            >
              <span>Contact Us</span>
            </Link>

            <a
              href="https://www.adyapan.com"
              target="_blank"
              rel="noreferrer"
              className={`px-3.5 py-1.5 rounded-xl border backdrop-blur-md transition-all flex items-center gap-1.5 ${
                theme === 'dark'
                  ? 'bg-slate-900/50 border-white/20 text-slate-200 hover:border-amber-400'
                  : 'bg-white/40 border-white/40 text-slate-800 hover:border-amber-400 shadow-sm'
              }`}
            >
              <span>adyapan.com</span>
              <span className="text-amber-500 font-extrabold">↗</span>
            </a>
          </div>

          {/* Right Action Buttons */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            <button
              onClick={toggleTheme}
              className={`px-2.5 sm:px-3.5 py-1.5 sm:py-2 rounded-xl text-xs font-extrabold transition-all flex items-center gap-1.5 border backdrop-blur-md shadow-sm ${
                theme === 'dark'
                  ? 'bg-slate-900/60 text-amber-300 border-white/20 hover:bg-slate-800/80'
                  : 'bg-white/50 text-slate-800 border-white/40 hover:bg-white/70'
              }`}
            >
              <span className="hidden sm:inline">{theme === 'dark' ? 'Dark Mode' : 'Light Mode'}</span>
            </button>

            <Link
              to="/login"
              className="px-3 sm:px-4 py-2 sm:py-2.5 text-xs font-extrabold text-white bg-amber-500 hover:bg-amber-600 rounded-xl transition-all shadow-md uppercase tracking-wider flex items-center gap-1 shrink-0"
            >
              <span className="hidden sm:inline">HR Login</span>
              <span className="sm:hidden">Login</span>
            </Link>
          </div>
        </div>
      </nav>

      {/* 2. Hero Section with Original Full-Color Video & Transparent Boxes */}
      <header className="border-b border-white/20 py-12 sm:py-20 px-4 sm:px-6 text-center relative overflow-hidden select-none">
        {/* Background Video (Original Full Color) */}
        <video
          autoPlay
          loop
          muted
          playsInline
          className="absolute inset-0 w-full h-full object-cover z-0"
        >
          <source src="/hero-typing.mp4" type="video/mp4" />
        </video>

        {/* Soft frosted overlay */}
        <div className="absolute inset-0 bg-black/40 backdrop-blur-[1px] z-0" />

        <div className="relative max-w-4xl mx-auto space-y-4 sm:space-y-5 z-10 text-white">
          <div className="inline-flex items-center gap-2 px-3.5 sm:px-4 py-1.5 text-[10px] sm:text-xs font-extrabold bg-amber-400 text-slate-950 rounded-full shadow-lg">
            <span>OFFICIAL ADYAPAN EDUTECH CAREERS PORTAL</span>
          </div>

          <h1 className="text-2xl sm:text-4xl md:text-5xl font-black tracking-tight leading-tight text-white drop-shadow-lg" style={{ color: '#ffffff' }}>
            Build Your Career With <br className="hidden sm:inline" />
            <span className="text-amber-400 drop-shadow-md">
              India's Premier EdTech Platform
            </span>
          </h1>

          <p className="text-sm md:text-base font-bold text-white max-w-2xl mx-auto leading-relaxed drop-shadow-lg" style={{ color: '#ffffff' }}>
            Join Adyapan Edutech Pvt. Ltd. and help thousands of students across India achieve career excellence through quality education, student counselling, and industry placements.
          </p>

          {/* Transparent Accreditation Badges */}
          <div className="pt-2 flex flex-wrap justify-center items-center gap-2.5 text-[11px] font-extrabold text-white">
            <span className="px-3.5 py-1.5 rounded-full border border-white/40 bg-black/40 backdrop-blur-md text-white shadow-md" style={{ color: '#ffffff' }}>ISO 9001:2015 Certified</span>
            <span className="px-3.5 py-1.5 rounded-full border border-white/40 bg-black/40 backdrop-blur-md text-white shadow-md" style={{ color: '#ffffff' }}>Skill India Digital Partner</span>
            <span className="px-3.5 py-1.5 rounded-full border border-white/40 bg-black/40 backdrop-blur-md text-white shadow-md" style={{ color: '#ffffff' }}>MSME Govt. Recognized</span>
          </div>

          {/* Transparent Highlight Metrics Boxes */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-6 max-w-3xl mx-auto">
            <div className="p-3.5 rounded-2xl border border-white/30 bg-black/40 backdrop-blur-md text-center shadow-xl">
              <div className="text-xl font-black text-amber-400">100%</div>
              <div className="text-[11px] font-bold text-white drop-shadow" style={{ color: '#ffffff' }}>AI Screening</div>
            </div>
            <div className="p-3.5 rounded-2xl border border-white/30 bg-black/40 backdrop-blur-md text-center shadow-xl">
              <div className="text-xl font-black text-amber-400">500+</div>
              <div className="text-[11px] font-bold text-white drop-shadow" style={{ color: '#ffffff' }}>Hiring Partners</div>
            </div>
            <div className="p-3.5 rounded-2xl border border-white/30 bg-black/40 backdrop-blur-md text-center shadow-xl">
              <div className="text-xl font-black text-amber-400">15,000+</div>
              <div className="text-[11px] font-bold text-white drop-shadow" style={{ color: '#ffffff' }}>Students Skilled</div>
            </div>
            <div className="p-3.5 rounded-2xl border border-white/30 bg-black/40 backdrop-blur-md text-center shadow-xl">
              <div className="text-xl font-black text-amber-400">Fast-Track</div>
              <div className="text-[11px] font-bold text-white drop-shadow" style={{ color: '#ffffff' }}>Direct Offers</div>
            </div>
          </div>
        </div>
      </header>

      {/* 3. Main Content Area with Transparent Search Box & Job Cards */}
      <main id="openings" className="max-w-6xl mx-auto px-6 py-12 space-y-8">
        
        {/* Transparent Search & Department Filter Card */}
        <div className={`p-5 rounded-3xl border backdrop-blur-xl shadow-xl flex flex-col md:flex-row items-center justify-between gap-4 ${
          theme === 'dark'
            ? 'bg-slate-900/50 border-white/10'
            : 'bg-white/40 border-white/60 shadow-amber-500/5'
        }`}>
          <div className="relative w-full md:w-80">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-amber-500 font-bold"></span>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search BDA, Counsellor, Telecaller, Tech..."
              className={`w-full pl-10 pr-4 py-2.5 rounded-2xl text-xs font-bold focus:outline-none border backdrop-blur-md transition-all ${
                theme === 'dark'
                  ? 'bg-slate-950/60 border-white/20 text-white focus:border-amber-400'
                  : 'bg-white/60 border-white/60 text-slate-900 focus:border-amber-500'
              }`}
            />
          </div>

          <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
            {['ALL', 'Sales & Growth', 'Student Admissions', 'Inside Sales', 'Engineering'].map((dept) => (
              <button
                key={dept}
                onClick={() => setDepartment(dept)}
                className={`px-3.5 py-2 rounded-xl text-xs font-extrabold backdrop-blur-md transition-all border ${
                  department === dept
                    ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-md'
                    : theme === 'dark'
                      ? 'bg-slate-900/60 border-white/15 text-slate-200 hover:border-amber-400'
                      : 'bg-white/50 border-white/50 text-slate-800 hover:bg-white/80'
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
              <div key={n} className="h-64 rounded-3xl bg-white/30 dark:bg-slate-900/40 backdrop-blur-xl animate-pulse border border-white/20" />
            ))}
          </div>
        ) : filteredJobs.length === 0 ? (
          /* Empty State */
          <div className={`p-12 rounded-3xl border backdrop-blur-xl text-center space-y-4 shadow-xl ${
            theme === 'dark'
              ? 'bg-slate-900/50 border-white/10 text-white'
              : 'bg-white/50 border-white/60 text-slate-900'
          }`}>
            <h3 className="text-lg font-black">No Roles Currently Match Your Search</h3>
            <p className="text-xs font-medium text-slate-600 dark:text-slate-300 max-w-md mx-auto">
              Try adjusting your search terms or selecting "All Roles" above. New opportunities are published daily!
            </p>
            <button
              onClick={() => { setSearchTerm(''); setDepartment('ALL'); }}
              className="px-5 py-2.5 text-xs font-extrabold text-white bg-amber-500 hover:bg-amber-600 rounded-xl transition-all shadow-md"
            >
              Reset Search & View All Openings
            </button>
          </div>
        ) : (
          /* Transparent Job Cards Grid */
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredJobs.map((job) => (
              <div
                key={job.id || job._id}
                className={`rounded-3xl p-7 transition-all duration-300 flex flex-col justify-between space-y-5 border backdrop-blur-xl shadow-xl hover:shadow-2xl hover:-translate-y-1.5 relative overflow-hidden group ${
                  theme === 'dark'
                    ? 'bg-slate-900/40 border-white/10 hover:border-amber-400'
                    : 'bg-white/50 border-white/60 hover:border-amber-500 shadow-amber-500/5'
                }`}
              >
                {/* Accent Top Strip */}
                <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500" />

                <div className="space-y-4 pt-1">
                  {/* Category Header */}
                  <div className="flex items-center justify-between">
                    <span className="px-3 py-1 text-[11px] font-extrabold bg-amber-500/20 text-amber-800 dark:text-amber-300 rounded-full border border-amber-500/30 backdrop-blur-md">
                      {job.department || 'EdTech Role'}
                    </span>
                    <span className="px-2.5 py-0.5 text-[10px] font-extrabold bg-emerald-500/20 text-emerald-800 dark:text-emerald-300 rounded-full border border-emerald-500/30 backdrop-blur-md">
                      ● Active Hiring
                    </span>
                  </div>

                  {/* Role Title */}
                  <h2 className="text-xl font-black text-slate-900 dark:text-white group-hover:text-amber-500 transition-colors leading-snug">
                    {job.title}
                  </h2>

                  {/* Detail Badges */}
                  <div className="flex flex-wrap gap-2 text-xs font-bold">
                    <span className={`px-3 py-1.5 rounded-xl border backdrop-blur-md ${
                      theme === 'dark'
                        ? 'bg-slate-950/40 border-white/10 text-slate-300'
                        : 'bg-white/60 border-white/40 text-slate-800'
                    }`}>
                      {job.location || 'India'}
                    </span>
                    <span className={`px-3 py-1.5 rounded-xl border backdrop-blur-md ${
                      theme === 'dark'
                        ? 'bg-slate-950/40 border-white/10 text-slate-300'
                        : 'bg-white/60 border-white/40 text-slate-800'
                    }`}>
                      {job.type === 'FULL_TIME' ? 'Full Time' : job.type || 'Full Time'}
                    </span>
                    <span className="px-3 py-1.5 rounded-xl bg-amber-500/20 text-amber-800 dark:text-amber-300 border border-amber-500/30 font-extrabold backdrop-blur-md">
                      {formatSalary(job.salaryMin, job.salaryMax)}
                    </span>
                  </div>

                  {/* Brief Overview Description */}
                  <p className="text-xs font-medium text-slate-700 dark:text-slate-300 leading-relaxed line-clamp-3">
                    {job.description}
                  </p>
                </div>

                {/* Card Action Button */}
                <div className="pt-4 border-t border-white/20">
                  <Link
                    to={`/careers/${job.slug || job.id}`}
                    className="w-full inline-flex items-center justify-center gap-2 py-3 text-xs font-extrabold text-slate-950 bg-amber-400 hover:bg-amber-500 rounded-2xl transition-all shadow-md uppercase tracking-wider group-hover:scale-[1.01]"
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

      <Footer isPublic={true} />
    </div>
  );
};

export default Careers;
