import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import AdyapanLogo from '../components/common/AdyapanLogo';
import Footer from '../components/layout/Footer';
import { useTheme } from '../context/ThemeContext';
import { useCandidateAuth } from '../context/CandidateAuthContext';
import { jobService } from '../services/jobService';

const Careers = () => {
  const { theme, toggleTheme } = useTheme();
  const { candidate } = useCandidateAuth();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [locationTerm, setLocationTerm] = useState('');
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

  const departments = Array.from(new Set(jobs.map((j: any) => j.department).filter(Boolean)));
  const jobCategories = departments.slice(0, 6);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    navigate(`/open-positions?q=${searchTerm}&location=${locationTerm}`);
  };

  return (
    <div className={`min-h-screen font-sans antialiased transition-colors ${theme === 'dark' ? 'bg-[#0a0a1a] text-white' : 'bg-white text-slate-900'}`}>

      {/* ===== MAIN NAV ===== */}
      <nav className={`sticky top-0 z-50 px-4 sm:px-8 py-4 border-b backdrop-blur-xl transition-all ${theme === 'dark'
        ? 'bg-[#0a0a1a]/95 border-slate-800'
        : 'bg-white/95 border-slate-200'
        }`}>
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Link to="/careers" className="flex items-center gap-2">
            <AdyapanLogo variant={theme === 'dark' ? 'dark' : 'light'} size="small" />
          </Link>

          {/* Nav Links */}
          <div className="hidden lg:flex items-center gap-8 text-sm font-medium">
            <Link to="/open-positions" className={`hover:text-amber-500 transition-colors ${theme === 'dark' ? 'text-slate-200' : 'text-slate-700'}`}>
              Jobs
            </Link>
            <a href="#life" className={`hover:text-amber-500 transition-colors ${theme === 'dark' ? 'text-slate-200' : 'text-slate-700'}`}>
              Life at Adyapan
            </a>
            <a href="#categories" className={`hover:text-amber-500 transition-colors ${theme === 'dark' ? 'text-slate-200' : 'text-slate-700'}`}>
              Departments
            </a>
            <a href="https://www.adyapan.com" target="_blank" rel="noreferrer" className={`hover:text-amber-500 transition-colors ${theme === 'dark' ? 'text-slate-200' : 'text-slate-700'}`}>
              About Us
            </a>
            <Link to="/contact" className={`hover:text-amber-500 transition-colors ${theme === 'dark' ? 'text-slate-200' : 'text-slate-700'}`}>
              Contact
            </Link>
          </div>

          {/* Right */}
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
                Dashboard
              </Link>
            ) : (
              <Link to="/login" className="px-4 py-2 text-sm font-semibold text-white bg-amber-500 hover:bg-amber-600 rounded-lg transition-all">
                Sign In
              </Link>
            )}
          </div>
        </div>
      </nav>

      {/* ===== HERO SECTION (Cognizant-style) ===== */}
      <section className="relative overflow-hidden">
        {/* Decorative gradient shapes */}
        <div className={`absolute top-0 right-0 w-[500px] h-[500px] rounded-full blur-[120px] opacity-30 ${theme === 'dark' ? 'bg-amber-600' : 'bg-amber-200'}`} />
        <div className={`absolute bottom-0 left-1/4 w-[300px] h-[300px] rounded-full blur-[100px] opacity-20 ${theme === 'dark' ? 'bg-blue-600' : 'bg-blue-200'}`} />
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-8 py-20 sm:py-28 lg:py-32">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left Content */}
            <div>
              <h1 className={`text-4xl sm:text-5xl lg:text-6xl font-bold leading-[1.1] mb-6 ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>
                Welcome to careers at{' '}
                <span className="text-amber-500">Adyapan</span>
              </h1>
              <p className={`text-lg sm:text-xl leading-relaxed mb-10 max-w-lg ${theme === 'dark' ? 'text-slate-300' : 'text-slate-600'}`}>
                Where you're empowered to combine your passions with our mission to transform education across India.
              </p>

              {/* Search Box (Cognizant-style) */}
              <form onSubmit={handleSearch} className={`flex flex-col sm:flex-row items-stretch rounded-2xl overflow-hidden shadow-2xl border ${theme === 'dark' ? 'bg-slate-900 border-slate-700' : 'bg-white border-slate-200'}`}>
                <div className="flex-1 relative">
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search jobs"
                    className={`w-full px-5 py-4 text-sm font-medium border-0 focus:outline-none ${theme === 'dark' ? 'bg-slate-900 text-white placeholder-slate-500' : 'bg-white text-slate-900 placeholder-slate-400'}`}
                  />
                </div>
                <div className={`w-px self-stretch ${theme === 'dark' ? 'bg-slate-700' : 'bg-slate-200'} hidden sm:block`} />
                <div className="flex-1 relative">
                  <input
                    type="text"
                    value={locationTerm}
                    onChange={(e) => setLocationTerm(e.target.value)}
                    placeholder="Type location"
                    className={`w-full px-5 py-4 text-sm font-medium border-0 focus:outline-none ${theme === 'dark' ? 'bg-slate-900 text-white placeholder-slate-500' : 'bg-white text-slate-900 placeholder-slate-400'}`}
                  />
                  <svg className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
                <button
                  type="submit"
                  className="px-6 py-4 bg-amber-500 hover:bg-amber-600 transition-colors flex items-center justify-center"
                >
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </form>

              {/* Quick Stats */}
            </div>

            {/* Right - Hero Visual */}
            <div className="hidden lg:block relative">
              <div className={`absolute -inset-4 rounded-3xl rotate-3 ${theme === 'dark' ? 'bg-gradient-to-br from-amber-500/20 to-blue-500/10' : 'bg-gradient-to-br from-amber-100 to-blue-50'}`} />
              <div className="relative rounded-2xl overflow-hidden shadow-2xl aspect-[4/3]">
                <img
                  src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=800&h=600&fit=crop&q=80"
                  alt="Team collaborating at Adyapan"
                  className="w-full h-full object-cover"
                />
                <div className={`absolute inset-0 ${theme === 'dark' ? 'bg-gradient-to-t from-[#0a0a1a]/80 via-transparent to-transparent' : 'bg-gradient-to-t from-slate-900/60 via-transparent to-transparent'}`} />
                <div className="absolute bottom-0 left-0 right-0 p-6">
                  <p className="text-white text-sm font-semibold">ISO 9001:2015 Certified • MSME Recognized • Skill India Partner</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ===== DEPARTMENT CATEGORIES ===== */}
      <section id="categories" className={`border-t ${theme === 'dark' ? 'border-slate-800' : 'border-slate-100'}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-8 py-16">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl sm:text-3xl font-bold">Explore by Department</h2>
              <p className={`text-sm mt-1 ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>Find opportunities that match your expertise</p>
            </div>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            {(jobCategories.length > 0 ? jobCategories : ['Sales & Growth', 'Engineering', 'Student Admissions', 'Inside Sales', 'Marketing', 'Operations']).map((cat) => {
              const count = jobs.filter(j => (j.department || '').toUpperCase() === cat.toUpperCase()).length;
              return (
                <button
                  key={cat}
                  onClick={() => { navigate(`/open-positions`); }}
                  className={`p-5 rounded-xl border text-left transition-all hover:shadow-lg group ${theme === 'dark'
                    ? 'bg-slate-900/50 border-slate-800 hover:border-amber-500/50'
                    : 'bg-white border-slate-200 hover:border-amber-300 shadow-sm'
                    }`}
                >
                  <div className={`text-xs font-bold mb-2 group-hover:text-amber-500 transition-colors ${theme === 'dark' ? 'text-slate-200' : 'text-slate-800'}`}>
                    {cat}
                  </div>
                  <div className={`text-[11px] ${theme === 'dark' ? 'text-slate-500' : 'text-slate-400'}`}>
                    {count} role{count !== 1 ? 's' : ''}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* ===== LIFE AT ADYAPAN ===== */}
      <section id="life" className={`border-t ${theme === 'dark' ? 'border-slate-800 bg-[#0d0d20]' : 'border-slate-100 bg-slate-50'}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-8 py-16">
          <h2 className="text-2xl sm:text-3xl font-bold mb-3">Life at Adyapan</h2>
          <p className={`text-sm mb-10 max-w-2xl ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>
            We believe in empowering our team to do their best work. Here's what makes working with us special.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { icon: '🚀', title: 'Growth & Learning', desc: 'Continuous learning culture with clear career progression paths and mentorship programs.' },
              { icon: '💡', title: 'Innovation First', desc: 'We use AI, modern tech, and data-driven approaches to solve real problems in education.' },
              { icon: '🤝', title: 'Collaborative Culture', desc: 'Work with passionate people who believe in transforming lives through education.' },
              { icon: '🏆', title: 'Recognition & Rewards', desc: 'Performance-driven culture with competitive pay, incentives, and quarterly rewards.' },
              { icon: '🌍', title: 'Flexible Work', desc: 'Hybrid and remote options available. Work from our Hyderabad office or from home.' },
              { icon: '🎯', title: 'Impactful Mission', desc: 'Every role directly impacts thousands of students achieving career excellence across India.' },
            ].map((item) => (
              <div key={item.title} className={`p-6 rounded-xl border transition-all hover:shadow-md ${theme === 'dark' ? 'bg-slate-900/50 border-slate-800 hover:border-slate-700' : 'bg-white border-slate-200 hover:border-amber-200'}`}>
                <div className="text-3xl mb-4">{item.icon}</div>
                <h3 className="text-sm font-bold mb-2">{item.title}</h3>
                <p className={`text-xs leading-relaxed ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== BROWSE OPENINGS CTA ===== */}
      <section id="openings" className={`border-t ${theme === 'dark' ? 'border-slate-800' : 'border-slate-100'}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-8 py-16 text-center">
          <h2 className="text-2xl sm:text-3xl font-bold mb-3">Ready to find your next role?</h2>
          <p className={`text-sm mb-8 max-w-md mx-auto ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>
            Browse all open positions, filter by department or location, and apply directly.
          </p>
          <Link
            to="/open-positions"
            className="inline-flex items-center gap-2 px-8 py-3.5 text-sm font-semibold text-white bg-amber-500 hover:bg-amber-600 rounded-lg transition-all shadow-lg shadow-amber-500/20"
          >
            View All Open Positions
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </Link>
        </div>
      </section>

      {/* ===== CTA SECTION ===== */}
      <section className={`border-t ${theme === 'dark' ? 'border-slate-800 bg-gradient-to-r from-[#0d0d20] to-[#12122a]' : 'border-slate-100 bg-gradient-to-r from-slate-50 to-amber-50/30'}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-8 py-16 flex flex-col md:flex-row items-center justify-between gap-8">
          <div>
            <h2 className="text-2xl font-bold mb-2">Join our Talent Community</h2>
            <p className={`text-sm max-w-md ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>
              Create an account to get notified about new positions, track your applications, and stay connected.
            </p>
          </div>
          {!candidate && (
            <Link
              to="/register"
              className="px-8 py-3.5 text-sm font-semibold text-white bg-amber-500 hover:bg-amber-600 rounded-lg transition-all shadow-lg shadow-amber-500/20 whitespace-nowrap"
            >
              Create Account →
            </Link>
          )}
        </div>
      </section>

      <Footer isPublic={true} />
    </div>
  );
};

export default Careers;
