import React, { useState, useEffect, useMemo } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import {
  ArrowRight,
  Briefcase,
  CheckCircle2,
  Clock3,
  Flame,
  Heart,
  HelpCircle,
  LayoutGrid,
  List,
  MapPin,
  MessageSquare,
  Search,
  SlidersHorizontal,
  Sparkles,
  Star,
  Target,
  TrendingUp,
  User,
  UsersRound,
  X,
  Zap,
} from 'lucide-react';
import logo from '../assets/adyapan-logo.png';
import SiteShell from '../components/layout/SiteShell';
import { jobService } from '../services/jobService';
import toast from 'react-hot-toast';

const fallbackJobs = [
  {
    id: '1',
    slug: 'cybersecurity-analyst',
    title: 'Cybersecurity Analyst',
    company: 'Adyapan Technologies',
    department: 'IT & Security',
    location: 'Hyderabad',
    type: 'Full Time',
    experienceLevel: '3–5 Years',
    salaryMin: 350000,
    salaryMax: 600000,
    salary: '₹3.5 – 6.0 LPA',
    matchScore: '92% Match',
    postedTime: 'Posted 2d ago',
    skills: ['Network Security', 'SIEM', 'Threat Analysis', 'Compliance'],
  },
  {
    id: '2',
    slug: 'senior-full-stack-developer',
    title: 'Senior Full Stack Developer (React & Node.js)',
    company: 'Adyapan Technologies',
    department: 'Engineering',
    location: 'Remote',
    type: 'Full Time',
    experienceLevel: '3+ Years',
    salaryMin: 800000,
    salaryMax: 1400000,
    salary: '₹8.0 – 14.0 LPA',
    matchScore: '95% Match',
    postedTime: 'Posted 1d ago',
    skills: ['React', 'Node.js', 'TypeScript', 'PostgreSQL'],
  },
  {
    id: '3',
    slug: 'inside-sales-executive-telecaller',
    title: 'Inside Sales Executive / Telecaller',
    company: 'Adyapan Technologies',
    department: 'Sales & Advisory',
    location: 'Bangalore / On-site',
    type: 'Full Time',
    experienceLevel: '0–2 Years',
    salaryMin: 400000,
    salaryMax: 800000,
    salary: '₹4.0 – 8.0 LPA',
    matchScore: '89% Match',
    postedTime: 'Posted 3d ago',
    skills: ['Direct Sales', 'Client Advisory', 'Lead Gen', 'CRM'],
  },
  {
    id: '4',
    slug: 'ai-ml-engineer-intern',
    title: 'AI / ML Engineer Intern',
    company: 'Adyapan Technologies',
    department: 'AI & Data Science',
    location: 'Hyderabad / Remote',
    type: 'Internship',
    experienceLevel: 'Fresher',
    salaryMin: 300000,
    salaryMax: 500000,
    salary: '₹25,000 / mo',
    matchScore: '96% Match',
    postedTime: 'Posted Today',
    skills: ['Python', 'PyTorch', 'LLMs', 'NLP'],
  },
  {
    id: '5',
    slug: 'senior-academic-counselor',
    title: 'Senior Academic Counselor',
    company: 'Adyapan Technologies',
    department: 'Student Success',
    location: 'Hyderabad',
    type: 'Full Time',
    experienceLevel: '1–3 Years',
    salaryMin: 450000,
    salaryMax: 750000,
    salary: '₹4.5 – 7.5 LPA',
    matchScore: '91% Match',
    postedTime: 'Posted 4d ago',
    skills: ['Counseling', 'EdTech Outreach', 'Student Mentorship'],
  },
];

const popularSearches = [
  'React.js',
  'Marketing',
  'Sales',
  'Cybersecurity',
  'Customer Support',
  'Data Analyst',
  'AI / ML',
];

const formatSalaryPackage = (min?: number | string | null, max?: number | string | null, rawSalary?: string): string => {
  if (min != null && max != null && !isNaN(Number(min)) && !isNaN(Number(max)) && Number(min) > 0) {
    const numMin = Number(min);
    const numMax = Number(max);
    const minLPA = numMin >= 10000 ? (numMin / 100000).toFixed(1).replace(/\.0$/, '') : String(numMin);
    const maxLPA = numMax >= 10000 ? (numMax / 100000).toFixed(1).replace(/\.0$/, '') : String(numMax);
    return `₹${minLPA} – ${maxLPA} LPA`;
  }
  if (min != null && !isNaN(Number(min)) && Number(min) > 0) {
    const numMin = Number(min);
    const minLPA = numMin >= 10000 ? (numMin / 100000).toFixed(1).replace(/\.0$/, '') : String(numMin);
    return `₹${minLPA} LPA+`;
  }
  if (rawSalary && typeof rawSalary === 'string' && rawSalary.trim()) {
    return rawSalary.startsWith('₹') ? rawSalary : `₹${rawSalary}`;
  }
  return '₹4.0 – 8.0 LPA';
};

const normalizeJobType = (val?: string): string => {
  if (!val) return 'Full Time';
  const u = val.toUpperCase().trim();
  if (u === 'FULL_TIME' || u === 'FULL TIME') return 'Full Time';
  if (u === 'PART_TIME' || u === 'PART TIME') return 'Part Time';
  if (u === 'INTERNSHIP') return 'Internship';
  if (u === 'CONTRACT') return 'Contract';
  if (u === 'REMOTE') return 'Remote';
  return val.replace(/_/g, ' ');
};

const normalizeExperience = (val?: string): string => {
  if (!val) return '0–2 Years';
  const u = val.toUpperCase().trim();
  if (u === 'ENTRY' || u === 'FRESHER') return 'Fresher';
  if (u === 'MID') return '1–3 Years';
  if (u === 'SENIOR' || u === 'LEAD') return '5+ Years';
  return val.replace(/-/g, '–');
};

const getJobColorAccent = (title: string, dept: string) => {
  const t = `${title} ${dept}`.toLowerCase();
  if (t.includes('cyber') || t.includes('security')) {
    return {
      border: 'border-l-amber-500',
      badgeBg: 'bg-amber-500/10 text-amber-600 dark:text-amber-400',
      iconBg: 'bg-amber-50 dark:bg-amber-950/40 border-amber-200/60 dark:border-amber-800/40',
    };
  }
  if (t.includes('developer') || t.includes('frontend') || t.includes('stack') || t.includes('engineer')) {
    return {
      border: 'border-l-emerald-500',
      badgeBg: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400',
      iconBg: 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200/60 dark:border-emerald-800/40',
    };
  }
  if (t.includes('sales') || t.includes('bda') || t.includes('telecaller')) {
    return {
      border: 'border-l-purple-500',
      badgeBg: 'bg-purple-500/10 text-purple-600 dark:text-purple-400',
      iconBg: 'bg-purple-50 dark:bg-purple-950/40 border-purple-200/60 dark:border-purple-800/40',
    };
  }
  if (t.includes('counselor') || t.includes('academic') || t.includes('support')) {
    return {
      border: 'border-l-sky-500',
      badgeBg: 'bg-sky-500/10 text-sky-600 dark:text-sky-400',
      iconBg: 'bg-sky-50 dark:bg-sky-950/40 border-sky-200/60 dark:border-sky-800/40',
    };
  }
  if (t.includes('ai') || t.includes('ml') || t.includes('data')) {
    return {
      border: 'border-l-teal-500',
      badgeBg: 'bg-teal-500/10 text-teal-600 dark:text-teal-400',
      iconBg: 'bg-teal-50 dark:bg-teal-950/40 border-teal-200/60 dark:border-teal-800/40',
    };
  }
  return {
    border: 'border-l-rose-500',
    badgeBg: 'bg-rose-500/10 text-rose-600 dark:text-rose-400',
    iconBg: 'bg-rose-50 dark:bg-rose-950/40 border-rose-200/60 dark:border-rose-800/40',
  };
};

export const PublicJobs: React.FC = () => {
  const [searchParams] = useSearchParams();
  const initialQuery = searchParams.get('q') || '';
  const [query, setQuery] = useState(initialQuery);
  const [locationFilter, setLocationFilter] = useState('');
  const [experienceDropdown, setExperienceDropdown] = useState('');
  const [typeDropdown, setTypeDropdown] = useState('');
  const [experienceFilter, setExperienceFilter] = useState<string[]>([]);
  const [typeFilter, setTypeFilter] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState<'relevant' | 'newest' | 'salary'>('relevant');
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');
  const [currentPage, setCurrentPage] = useState(1);
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [savedJobs, setSavedJobs] = useState<string[]>(() => {
    try {
      return JSON.parse(localStorage.getItem('adyapan_saved_jobs') || '[]');
    } catch {
      return [];
    }
  });

  const [jobs, setJobs] = useState<any[]>(fallbackJobs);
  const [loading, setLoading] = useState(false);
  const jobsPerPage = 6;

  useEffect(() => {
    const fetchJobs = async () => {
      setLoading(true);
      try {
        const res = await jobService.getAllJobs();
        const apiJobs = Array.isArray(res) ? res : res?.jobs || res?.data || [];
        if (apiJobs.length > 0) {
          const mapped = apiJobs.map((j: any, i: number) => {
            let skillList: string[] = [];
            if (Array.isArray(j.skills) && j.skills.length > 0) {
              skillList = j.skills;
            } else if (typeof j.skills === 'string' && j.skills.trim()) {
              skillList = j.skills.split(',').map((s: string) => s.trim()).filter(Boolean);
            } else if (j.requirements) {
              const reqStr = String(j.requirements);
              const tokens = reqStr.includes(',') ? reqStr.split(',') : reqStr.split('\n');
              skillList = tokens
                .map((s: string) => s.replace(/^[-*•\d.]\s*/, '').trim())
                .filter((s: string) => s.length > 0 && s.length <= 25)
                .slice(0, 4);
            }

            if (skillList.length === 0) {
              const t = (j.title || '').toLowerCase();
              if (t.includes('developer') || t.includes('frontend') || t.includes('react') || t.includes('stack')) {
                skillList = ['React', 'Node.js', 'TypeScript', 'Web Dev'];
              } else if (t.includes('sales') || t.includes('bda') || t.includes('telecaller') || t.includes('counselor')) {
                skillList = ['Direct Sales', 'Client Advisory', 'Lead Gen', 'CRM'];
              } else if (t.includes('cyber') || t.includes('security') || t.includes('analyst')) {
                skillList = ['Threat Analysis', 'Network Security', 'SIEM', 'Compliance'];
              } else if (t.includes('ai') || t.includes('ml') || t.includes('data')) {
                skillList = ['Python', 'Machine Learning', 'NLP', 'Data Science'];
              } else {
                skillList = [j.department || 'EdTech', 'Full Time', 'Career Growth'];
              }
            }

            const salaryDisplay = formatSalaryPackage(j.salaryMin, j.salaryMax, j.salary);
            const jobTypeDisplay = normalizeJobType(j.type || j.jobType);
            const expDisplay = normalizeExperience(j.experienceLevel || j.experience);

            return {
              id: String(j.id || j._id || `job-${i}`),
              slug: String(j.slug || j.id || j._id || `job-${i}`),
              title: String(j.title || 'Career Opportunity'),
              company: String(j.company || 'Adyapan Technologies'),
              department: String(j.department || 'Growth'),
              location: String(j.location || 'Hyderabad').replace(/_/g, ' '),
              type: jobTypeDisplay,
              rawType: String(j.type || j.jobType || ''),
              experience: expDisplay,
              rawExperience: String(j.experienceLevel || j.experience || ''),
              salary: salaryDisplay,
              salaryNumeric: Number(j.salaryMax || j.salaryMin || 500000),
              matchScore: `${88 + (i % 9)}% Match`,
              createdAt: j.createdAt ? new Date(j.createdAt) : new Date(),
              postedTime: j.createdAt ? new Date(j.createdAt).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' }) : '20 Aug',
              skills: skillList,
            };
          });
          setJobs(mapped);
        }
      } catch (e) {
        console.error('Error fetching jobs:', e);
      } finally {
        setLoading(false);
      }
    };
    fetchJobs();
  }, []);

  const toggleSave = (id: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    let next: string[];
    if (savedJobs.includes(id)) {
      next = savedJobs.filter((x) => x !== id);
      toast('Job removed from saved list', { icon: '🔖' });
    } else {
      next = [...savedJobs, id];
      toast.success('Job saved to bookmarks!');
    }
    setSavedJobs(next);
    localStorage.setItem('adyapan_saved_jobs', JSON.stringify(next));
  };

  const toggleExperience = (val: string) => {
    setExperienceFilter((prev) =>
      prev.includes(val) ? prev.filter((x) => x !== val) : [...prev, val]
    );
    setCurrentPage(1);
  };

  const toggleType = (val: string) => {
    setTypeFilter((prev) =>
      prev.includes(val) ? prev.filter((x) => x !== val) : [...prev, val]
    );
    setCurrentPage(1);
  };

  const clearAllFilters = () => {
    setQuery('');
    setLocationFilter('');
    setExperienceDropdown('');
    setTypeDropdown('');
    setExperienceFilter([]);
    setTypeFilter([]);
    setCurrentPage(1);
  };

  const matchExp = (filterVal: string, jobExp: string, rawExp: string): boolean => {
    const f = filterVal.toLowerCase().replace(/–/g, '-').trim();
    const str = `${jobExp} ${rawExp}`.toLowerCase().replace(/–/g, '-');

    if (f === 'fresher') {
      return str.includes('fresh') || str.includes('entry') || str.includes('0-1') || str.includes('0-2');
    }
    if (f === '0-1 years') {
      return str.includes('0-1') || str.includes('0-2') || str.includes('fresh') || str.includes('entry');
    }
    if (f === '1-3 years') {
      return str.includes('1-3') || str.includes('0-2') || str.includes('mid') || str.includes('1-2') || str.includes('2-3');
    }
    if (f === '3-5 years') {
      return str.includes('3-5') || str.includes('3+') || str.includes('mid') || str.includes('senior') || str.includes('3-4');
    }
    if (f === '5+ years') {
      return str.includes('5+') || str.includes('5-') || str.includes('senior') || str.includes('lead');
    }
    return str.includes(f);
  };

  const matchType = (filterVal: string, jobType: string, rawType: string, jobLoc: string): boolean => {
    const f = filterVal.toLowerCase().trim();
    const str = `${jobType} ${rawType} ${jobLoc}`.toLowerCase();

    if (f === 'remote') {
      return str.includes('remote');
    }
    if (f === 'full time') {
      return str.includes('full');
    }
    if (f === 'part time') {
      return str.includes('part');
    }
    if (f === 'internship') {
      return str.includes('intern');
    }
    return str.includes(f);
  };

  const filteredJobs = useMemo(() => {
    let result = (jobs || []).filter((j) => {
      if (!j) return false;
      const title = String(j.title || '');
      const company = String(j.company || '');
      const location = String(j.location || '');
      const skills = Array.isArray(j.skills) ? j.skills.join(' ') : '';

      const term = `${title} ${company} ${location} ${skills}`.toLowerCase();
      const q = query ? query.toLowerCase().trim() : '';

      const matchesQuery = !q || term.includes(q);
      const matchesLocation =
        !locationFilter ||
        location.toLowerCase().includes(locationFilter.toLowerCase().trim()) ||
        (locationFilter.toLowerCase() === 'india' && (
          location.toLowerCase().includes('hyderabad') ||
          location.toLowerCase().includes('bangalore') ||
          location.toLowerCase().includes('bengaluru') ||
          location.toLowerCase().includes('delhi') ||
          location.toLowerCase().includes('mumbai') ||
          location.toLowerCase().includes('pune') ||
          location.toLowerCase().includes('india') ||
          location.toLowerCase().includes('remote')
        ));

      const matchesExpDrop =
        !experienceDropdown || matchExp(experienceDropdown, j.experience, j.rawExperience);
      const matchesTypeDrop =
        !typeDropdown || matchType(typeDropdown, j.type, j.rawType, j.location);

      const matchesExpCheckboxes =
        experienceFilter.length === 0 ||
        experienceFilter.some((e) => matchExp(e, j.experience, j.rawExperience));
      const matchesTypeCheckboxes =
        typeFilter.length === 0 ||
        typeFilter.some((t) => matchType(t, j.type, j.rawType, j.location));

      return (
        matchesQuery &&
        matchesLocation &&
        matchesExpDrop &&
        matchesTypeDrop &&
        matchesExpCheckboxes &&
        matchesTypeCheckboxes
      );
    });

    if (sortBy === 'newest') {
      result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    } else if (sortBy === 'salary') {
      result.sort((a, b) => (b.salaryNumeric || 0) - (a.salaryNumeric || 0));
    }

    return result;
  }, [jobs, query, locationFilter, experienceDropdown, typeDropdown, experienceFilter, typeFilter, sortBy]);

  const totalPages = Math.max(1, Math.ceil(filteredJobs.length / jobsPerPage));
  const paginatedJobs = filteredJobs.slice((currentPage - 1) * jobsPerPage, currentPage * jobsPerPage);

  const getExperienceCount = (expVal: string) => {
    return jobs.filter((j) => matchExp(expVal, j.experience, j.rawExperience)).length;
  };

  const getTypeCount = (typeVal: string) => {
    return jobs.filter((j) => matchType(typeVal, j.type, j.rawType, j.location)).length;
  };

  return (
    <SiteShell>
      <main className="bg-[#faf7f2] dark:bg-[#121110] text-stone-900 dark:text-stone-100 min-h-screen relative overflow-hidden">

        {/* ── BACKGROUND DECORATIVE GLOW & DOTTED PATTERN ── */}
        <div className="absolute inset-0 bg-dotted-grid pointer-events-none opacity-45" />
        <div className="absolute top-12 left-1/4 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-80 right-10 w-96 h-96 bg-orange-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* ── HERO SECTION: LARGE VISUAL TWO-COLUMN HERO ── */}
        <section className="pt-12 pb-16 relative z-10 border-b border-stone-200/60 dark:border-stone-800 overflow-hidden bg-[#fdfbf7] dark:bg-[#141312]">

          {/* Full-Cover Prominently Visible Background Image (Darker & High Contrast) */}
          <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden select-none">
            <img
              src="/hero-option-4-celebration.jpg"
              alt="Adyapan Celebration Workplace Atmosphere"
              className="w-full h-full object-cover object-center scale-100 opacity-85 dark:opacity-60 brightness-90 contrast-110"
            />
            {/* Dark contrast & soft readability overlays */}
            <div className="absolute inset-0 bg-black/15 dark:bg-black/50" />
            <div className="absolute inset-0 bg-gradient-to-r from-[#fdfbf7]/85 via-[#fdfbf7]/50 to-transparent dark:from-[#141312]/90 dark:via-[#141312]/60 dark:to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-b from-[#fdfbf7]/30 via-transparent to-[#fdfbf7]/90 dark:from-[#141312]/40 dark:via-transparent dark:to-[#141312]/90" />
          </div>

          <div className="max-w-[1380px] mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">

              {/* LEFT COLUMN: HEADLINE, NARRATIVE & SEARCH FORM (7 Cols) */}
              <div className="lg:col-span-7 space-y-6">

                {/* Direct Opportunities Pill */}
                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-900 dark:text-amber-300 font-bold text-xs tracking-wider uppercase shadow-xs">
                  <Sparkles size={14} className="text-amber-600 dark:text-amber-400 fill-amber-500" />
                  <span>DIRECT ADYAPAN OPENINGS · FAST-TRACK HIRING · TOP COMPENSATION</span>
                </div>

                {/* Main Headline */}
                <h1 className="text-5xl sm:text-6xl lg:text-7xl xl:text-[76px] font-bold text-stone-950 dark:text-white tracking-tight leading-[1.05]">
                  Unlock your <br />
                  <span className="text-amber-600 dark:text-amber-400">career potential</span> <br />
                  at Adyapan.
                </h1>

                {/* Subtitle - Dark & Crisp */}
                <p className="text-base sm:text-lg lg:text-xl text-stone-900 dark:text-stone-100 leading-relaxed max-w-2xl font-semibold">
                  Discover high-impact roles across tech, sales, growth, operations, and leadership. Experience instant AI ATS resume screening, direct founder access, uncapped incentives, and fast-track promotions.
                </p>

                {/* ── SLEEK & COMPACT SEARCH BAR ── */}
                <div className="bg-white dark:bg-stone-900 p-2 sm:p-2.5 rounded-2xl border border-stone-200/90 dark:border-stone-800 shadow-xl space-y-2 max-w-xl">
                  {/* Tier 1: Compact Search Input */}
                  <div className="flex items-center gap-2.5 px-3.5 py-2 bg-stone-50 dark:bg-stone-800/90 border border-stone-200 dark:border-stone-700 rounded-xl focus-within:border-amber-500 focus-within:bg-white dark:focus-within:bg-stone-800 focus-within:ring-2 focus-within:ring-amber-500/20 transition-all shadow-xs">
                    <Search size={17} className="text-amber-500 flex-shrink-0" />
                    <input
                      type="text"
                      value={query}
                      onChange={(e) => {
                        setQuery(e.target.value);
                        setCurrentPage(1);
                      }}
                      placeholder="Search job title, skills, keywords..."
                      className="w-full min-w-0 flex-1 bg-transparent text-xs sm:text-sm font-semibold text-stone-950 dark:text-white placeholder:text-stone-400 dark:placeholder:text-stone-400 focus:outline-none caret-amber-500"
                    />
                    {query && (
                      <button
                        type="button"
                        onClick={() => setQuery('')}
                        className="text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 p-0.5 cursor-pointer flex-shrink-0"
                        title="Clear search"
                      >
                        <X size={14} />
                      </button>
                    )}
                  </div>

                  {/* Tier 2: Compact Filters & Search Action Button */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
                    {/* Location Dropdown */}
                    <div className="flex items-center gap-1.5 px-2.5 py-1.5 bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-lg">
                      <MapPin size={13} className="text-amber-500 flex-shrink-0" />
                      <select
                        value={locationFilter}
                        onChange={(e) => {
                          setLocationFilter(e.target.value);
                          setCurrentPage(1);
                        }}
                        className="w-full bg-transparent text-xs font-semibold text-stone-800 dark:text-stone-100 outline-none cursor-pointer"
                      >
                        <option value="" className="bg-white dark:bg-stone-900 text-stone-900 dark:text-white">Location</option>
                        <option value="Hyderabad" className="bg-white dark:bg-stone-900 text-stone-900 dark:text-white">Hyderabad</option>
                        <option value="Bangalore" className="bg-white dark:bg-stone-900 text-stone-900 dark:text-white">Bangalore</option>
                        <option value="India" className="bg-white dark:bg-stone-900 text-stone-900 dark:text-white">India</option>
                        <option value="Remote" className="bg-white dark:bg-stone-900 text-stone-900 dark:text-white">Remote</option>
                      </select>
                    </div>

                    {/* Experience Dropdown */}
                    <div className="flex items-center gap-1.5 px-2.5 py-1.5 bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-lg">
                      <Briefcase size={13} className="text-amber-500 flex-shrink-0" />
                      <select
                        value={experienceDropdown}
                        onChange={(e) => {
                          setExperienceDropdown(e.target.value);
                          setCurrentPage(1);
                        }}
                        className="w-full bg-transparent text-xs font-semibold text-stone-800 dark:text-stone-100 outline-none cursor-pointer"
                      >
                        <option value="" className="bg-white dark:bg-stone-900 text-stone-900 dark:text-white">Experience</option>
                        <option value="Fresher" className="bg-white dark:bg-stone-900 text-stone-900 dark:text-white">Fresher</option>
                        <option value="0-1 Years" className="bg-white dark:bg-stone-900 text-stone-900 dark:text-white">0–1 Years</option>
                        <option value="1-3 Years" className="bg-white dark:bg-stone-900 text-stone-900 dark:text-white">1–3 Years</option>
                        <option value="3-5 Years" className="bg-white dark:bg-stone-900 text-stone-900 dark:text-white">3–5 Years</option>
                        <option value="5+ Years" className="bg-white dark:bg-stone-900 text-stone-900 dark:text-white">5+ Years</option>
                      </select>
                    </div>

                    {/* Job Type Dropdown */}
                    <div className="flex items-center gap-1.5 px-2.5 py-1.5 bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-lg">
                      <Clock3 size={13} className="text-amber-500 flex-shrink-0" />
                      <select
                        value={typeDropdown}
                        onChange={(e) => {
                          setTypeDropdown(e.target.value);
                          setCurrentPage(1);
                        }}
                        className="w-full bg-transparent text-xs font-semibold text-stone-800 dark:text-stone-100 outline-none cursor-pointer"
                      >
                        <option value="" className="bg-white dark:bg-stone-900 text-stone-900 dark:text-white">Job Type</option>
                        <option value="Full Time" className="bg-white dark:bg-stone-900 text-stone-900 dark:text-white">Full Time</option>
                        <option value="Part Time" className="bg-white dark:bg-stone-900 text-stone-900 dark:text-white">Part Time</option>
                        <option value="Internship" className="bg-white dark:bg-stone-900 text-stone-900 dark:text-white">Internship</option>
                        <option value="Remote" className="bg-white dark:bg-stone-900 text-stone-900 dark:text-white">Remote</option>
                      </select>
                    </div>

                    {/* Search CTA Button */}
                    <button
                      type="button"
                      onClick={() => setCurrentPage(1)}
                      className="px-3 py-1.5 rounded-lg bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-bold text-xs shadow-sm hover:scale-[1.02] transition-all flex items-center justify-center gap-1 cursor-pointer"
                    >
                      <span>Search</span>
                      <ArrowRight size={13} />
                    </button>
                  </div>
                </div>

                {/* ── POPULAR SEARCHES PILLS ── */}
                <div className="flex flex-wrap items-center gap-2 pt-1 text-xs font-bold text-stone-600 dark:text-stone-300">
                  <span className="text-stone-800 dark:text-stone-200 mr-1 flex items-center gap-1">
                    <Flame size={14} className="text-orange-500 fill-orange-500" />
                    <span>Popular Searches:</span>
                  </span>
                  {popularSearches.map((term) => (
                    <button
                      key={term}
                      onClick={() => {
                        setQuery(term);
                        setCurrentPage(1);
                      }}
                      className="px-3.5 py-1.5 rounded-full bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-stone-800 dark:text-stone-200 hover:border-amber-500 hover:text-amber-600 hover:dark:text-amber-400 hover:dark:border-amber-400 transition-all shadow-sm cursor-pointer"
                    >
                      {term}
                    </button>
                  ))}
                </div>

              </div>

              {/* RIGHT COLUMN: HERO IMAGE & 3 FLOATING STAT CARDS (5 Cols) */}
              <div className="lg:col-span-5 relative flex justify-center items-center">

                <div className="absolute inset-0 bg-gradient-to-tr from-amber-500/20 to-orange-500/20 rounded-3xl blur-2xl transform scale-95" />

                <div className="relative w-full max-w-[440px] h-[360px] sm:h-[420px] rounded-3xl overflow-hidden shadow-2xl border-4 border-white dark:border-stone-800 bg-stone-900 z-10 group">
                  <img
                    src="/largest-student-community.jpeg"
                    alt="Life at Adyapan"
                    className="w-full h-full object-cover object-[center_42%] group-hover:scale-105 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

                  <div className="absolute bottom-4 left-4 right-4 text-white pointer-events-none">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400 block">
                      Direct Hiring
                    </span>
                    <b className="text-sm sm:text-base font-bold text-white">
                      Adyapan Edutech Headquarters
                    </b>
                  </div>
                </div>

                {/* Floating Cards */}
                <div className="absolute -top-4 left-0 sm:-left-8 z-20 bg-white/95 dark:bg-stone-900/95 backdrop-blur-md border border-stone-200/80 dark:border-stone-800 px-3 sm:px-4 py-2 sm:py-2.5 rounded-2xl shadow-xl flex items-center gap-2 sm:gap-3 animate-float">
                  <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-emerald-500/15 text-emerald-600 flex items-center justify-center font-bold">
                    <CheckCircle2 size={16} />
                  </div>
                  <div>
                    <b className="text-xs font-bold text-stone-900 dark:text-white block">Verified Jobs</b>
                    <small className="text-[10px] font-semibold text-stone-500 dark:text-stone-400">Updated Daily</small>
                  </div>
                </div>

                <div className="absolute top-1/2 right-0 sm:-right-8 -translate-y-1/2 z-20 bg-white/95 dark:bg-stone-900/95 backdrop-blur-md border border-stone-200/80 dark:border-stone-800 px-3 sm:px-4 py-2 sm:py-2.5 rounded-2xl shadow-xl flex items-center gap-2 sm:gap-3 animate-float-delayed">
                  <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-amber-500/15 text-amber-600 flex items-center justify-center font-bold">
                    <Star size={16} className="fill-amber-500" />
                  </div>
                  <div>
                    <b className="text-xs font-bold text-stone-900 dark:text-white block">4.8 / 5.0</b>
                    <small className="text-[10px] font-semibold text-stone-500 dark:text-stone-400">Candidate Rating</small>
                  </div>
                </div>

                <div className="absolute -bottom-4 left-0 sm:-left-6 z-20 bg-white/95 dark:bg-stone-900/95 backdrop-blur-md border border-amber-200 dark:border-amber-800/40 px-3 sm:px-4 py-2 sm:py-2.5 rounded-2xl shadow-xl flex items-center gap-2 sm:gap-3 animate-float bento-glow-orange">
                  <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 text-white flex items-center justify-center font-bold shadow-md">
                    <Zap size={16} />
                  </div>
                  <div>
                    <b className="text-xs font-bold text-stone-900 dark:text-white block">48 - 72 Hours</b>
                    <small className="text-[10px] font-semibold text-stone-500 dark:text-stone-400">Fast-Track Hiring</small>
                  </div>
                </div>

              </div>

            </div>
          </div>
        </section>

        {/* ── MAIN JOBS STREAM & 280PX FILTER SIDEBAR ── */}
        <section className="py-12 relative z-10">
          <div className="max-w-[1380px] mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

              {/* ── LEFT COLUMN: 280PX FILTER SIDEBAR (4 Cols / 280px) ── */}
              <div className="lg:col-span-4 xl:col-span-3">

                {/* Mobile Filter Toggle Trigger */}
                <button
                  onClick={() => setShowMobileFilters(!showMobileFilters)}
                  className="lg:hidden w-full mb-4 py-3 px-4 rounded-2xl bg-white dark:bg-stone-900 border border-stone-200/90 dark:border-stone-800 font-bold text-xs flex items-center justify-between shadow-md text-stone-900 dark:text-white cursor-pointer"
                >
                  <span className="flex items-center gap-2">
                    <SlidersHorizontal size={16} className="text-amber-500" />
                    <span>Filter & Refine Positions {(experienceFilter.length + typeFilter.length) > 0 ? `(${experienceFilter.length + typeFilter.length} Active)` : ''}</span>
                  </span>
                  <span className="text-amber-500 text-xs font-extrabold">{showMobileFilters ? 'Hide ▲' : 'Show ▼'}</span>
                </button>

                <div className="space-y-4">
                  {/* Filter Control Box */}
                  <div className={`bg-white dark:bg-stone-900 p-6 rounded-3xl border border-stone-200/80 dark:border-stone-800 shadow-sm space-y-6 ${showMobileFilters ? 'block' : 'hidden lg:block'}`}>
                  <div className="flex items-center justify-between pb-4 border-b border-stone-100 dark:border-stone-800">
                    <span className="font-bold text-base text-stone-900 dark:text-white flex items-center gap-2">
                      <SlidersHorizontal size={18} className="text-amber-500" />
                      <span>Filters</span>
                    </span>
                    {(experienceFilter.length > 0 || typeFilter.length > 0 || query || locationFilter) && (
                      <button
                        onClick={clearAllFilters}
                        className="text-xs font-bold text-amber-500 hover:text-amber-600 underline cursor-pointer"
                      >
                        Clear All
                      </button>
                    )}
                  </div>

                  {/* Experience Filter Checkboxes */}
                  <div className="space-y-3">
                    <h4 className="font-extrabold text-xs uppercase tracking-wider text-stone-500 dark:text-stone-400">
                      Experience
                    </h4>
                    <div className="space-y-2.5 text-xs font-semibold">
                      {['Fresher', '0-1 Years', '1-3 Years', '3-5 Years', '5+ Years'].map((exp) => {
                        const count = getExperienceCount(exp);
                        return (
                          <label
                            key={exp}
                            className="flex items-center justify-between cursor-pointer text-stone-700 dark:text-stone-300 hover:text-amber-500 select-none group"
                          >
                            <div className="flex items-center gap-2.5">
                              <input
                                type="checkbox"
                                checked={experienceFilter.includes(exp)}
                                onChange={() => toggleExperience(exp)}
                                className="w-4 h-4 rounded text-amber-500 focus:ring-amber-500 accent-amber-500 cursor-pointer"
                              />
                              <span>{exp}</span>
                            </div>
                            <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-stone-100 dark:bg-stone-800 text-stone-500 group-hover:bg-amber-500/10 group-hover:text-amber-600">
                              {count}
                            </span>
                          </label>
                        );
                      })}
                    </div>
                  </div>

                  {/* Job Type Filter Checkboxes */}
                  <div className="pt-4 border-t border-stone-100 dark:border-stone-800 space-y-3">
                    <h4 className="font-extrabold text-xs uppercase tracking-wider text-stone-500 dark:text-stone-400">
                      Job Type
                    </h4>
                    <div className="space-y-2.5 text-xs font-semibold">
                      {['Full Time', 'Part Time', 'Internship', 'Remote'].map((type) => {
                        const count = getTypeCount(type);
                        return (
                          <label
                            key={type}
                            className="flex items-center justify-between cursor-pointer text-stone-700 dark:text-stone-300 hover:text-amber-500 select-none group"
                          >
                            <div className="flex items-center gap-2.5">
                              <input
                                type="checkbox"
                                checked={typeFilter.includes(type)}
                                onChange={() => toggleType(type)}
                                className="w-4 h-4 rounded text-amber-500 focus:ring-amber-500 accent-amber-500 cursor-pointer"
                              />
                              <span>{type}</span>
                            </div>
                            <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-stone-100 dark:bg-stone-800 text-stone-500 group-hover:bg-amber-500/10 group-hover:text-amber-600">
                              {count}
                            </span>
                          </label>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* ── WHY ADYAPAN SIDEBAR CARD ── */}
                <div className="bg-[#fffdfa] dark:bg-stone-900 p-6 rounded-3xl border border-amber-200/80 dark:border-amber-900/40 shadow-sm space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-amber-500 font-bold">
                        <Sparkles size={18} className="fill-amber-500 text-amber-500" />
                      </span>
                      <h3 className="font-extrabold text-base text-amber-600 dark:text-amber-400 tracking-tight">
                        Why Adyapan?
                      </h3>
                    </div>
                  </div>

                  <ul className="space-y-3 text-xs font-bold text-stone-800 dark:text-stone-200">
                    <li className="flex items-center gap-2.5">
                      <span className="w-5 h-5 rounded-full bg-amber-500/15 text-amber-600 dark:text-amber-400 flex items-center justify-center text-[10px] shrink-0">
                        <Target size={12} />
                      </span>
                      <span>Learning &amp; Growth</span>
                    </li>
                    <li className="flex items-center gap-2.5">
                      <span className="w-5 h-5 rounded-full bg-amber-500/15 text-amber-600 dark:text-amber-400 flex items-center justify-center text-[10px] shrink-0">
                        <Sparkles size={12} />
                      </span>
                      <span>Real Impact</span>
                    </li>
                    <li className="flex items-center gap-2.5">
                      <span className="w-5 h-5 rounded-full bg-amber-500/15 text-amber-600 dark:text-amber-400 flex items-center justify-center text-[10px] shrink-0">
                        <UsersRound size={12} />
                      </span>
                      <span>Collaborative Culture</span>
                    </li>
                    <li className="flex items-center gap-2.5">
                      <span className="w-5 h-5 rounded-full bg-amber-500/15 text-amber-600 dark:text-amber-400 flex items-center justify-center text-[10px] shrink-0">
                        <TrendingUp size={12} />
                      </span>
                      <span>Career Advancement</span>
                    </li>
                  </ul>

                  <div className="pt-2 border-t border-amber-100 dark:border-stone-800">
                    <Link
                      to="/life-at-adyapan"
                      className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-600 dark:text-amber-400 hover:text-amber-700 hover:underline group"
                    >
                      <span>Explore Life at Adyapan</span>
                      <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                    </Link>
                  </div>
                </div>

                {/* ── CAREER GUIDANCE & HR SUPPORT SIDEBAR CARD (NO SIGNUP) ── */}
                <div className="bg-[#fffdfa] dark:bg-stone-900 p-6 rounded-3xl border border-amber-200/80 dark:border-amber-900/40 shadow-sm space-y-3.5">
                  <div className="flex items-center gap-2">
                    <span className="w-8 h-8 rounded-xl bg-amber-500/15 text-amber-600 dark:text-amber-400 flex items-center justify-center text-xs font-bold">
                      <MessageSquare size={16} />
                    </span>
                    <h3 className="font-extrabold text-base text-stone-900 dark:text-white tracking-tight">
                      Need Career Guidance?
                    </h3>
                  </div>
                  <p className="text-xs text-stone-600 dark:text-stone-300 font-medium leading-relaxed">
                    Have questions about role qualifications, interview processes, or growth opportunities? Our recruitment team is here to help.
                  </p>
                  <div className="pt-1">
                    <Link
                      to="/contact"
                      className="w-full py-3 px-4 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-extrabold text-xs shadow-md shadow-amber-500/20 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2"
                    >
                      <MessageSquare size={15} />
                      <span>Speak with Hiring Team</span>
                      <ArrowRight size={14} />
                    </Link>
                  </div>
                </div>

                </div>
              </div>

              {/* ── RIGHT COLUMN: JOB RESULTS HEADER & DYNAMIC CARDS (8-9 Cols) ── */}
              <div className="lg:col-span-8 xl:col-span-9 space-y-6">

                {/* Results Header: Count, Sort Dropdown, and View Toggle */}
                <div className="bg-white dark:bg-stone-900 p-4 sm:p-5 rounded-3xl border border-stone-200/80 dark:border-stone-800 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <span className="font-bold text-base text-stone-900 dark:text-white">
                      <b className="text-amber-500">{filteredJobs.length}</b> Opportunities Available
                    </span>
                    <p className="text-xs text-stone-500 font-medium">
                      Live positions updated directly from Adyapan HR dashboard
                    </p>
                  </div>

                  <div className="flex items-center gap-3">
                    {/* Sort Dropdown */}
                    <div className="flex items-center gap-2 bg-stone-100 dark:bg-stone-800 px-3.5 py-2 rounded-2xl border border-stone-200/60 dark:border-stone-700 text-xs font-bold text-stone-800 dark:text-stone-200">
                      <span className="text-stone-400">Sort by:</span>
                      <select
                        value={sortBy}
                        onChange={(e: any) => setSortBy(e.target.value)}
                        className="bg-transparent outline-none cursor-pointer font-extrabold text-stone-900 dark:text-white"
                      >
                        <option value="relevant" className="bg-white dark:bg-stone-900 text-stone-900 dark:text-white">Most Relevant</option>
                        <option value="newest" className="bg-white dark:bg-stone-900 text-stone-900 dark:text-white">Newest First</option>
                        <option value="salary" className="bg-white dark:bg-stone-900 text-stone-900 dark:text-white">Highest Salary</option>
                      </select>
                    </div>

                    {/* View Mode Toggle */}
                    <div className="hidden sm:flex items-center bg-stone-100 dark:bg-stone-800 p-1 rounded-2xl border border-stone-200/60 dark:border-stone-700">
                      <button
                        onClick={() => setViewMode('list')}
                        className={`p-2 rounded-xl transition-all cursor-pointer ${viewMode === 'list'
                          ? 'bg-amber-500 text-white shadow-md'
                          : 'text-stone-500 hover:text-stone-900 dark:hover:text-white'
                          }`}
                        title="List View"
                      >
                        <List size={16} />
                      </button>
                      <button
                        onClick={() => setViewMode('grid')}
                        className={`p-2 rounded-xl transition-all cursor-pointer ${viewMode === 'grid'
                          ? 'bg-amber-500 text-white shadow-md'
                          : 'text-stone-500 hover:text-stone-900 dark:hover:text-white'
                          }`}
                        title="Grid View"
                      >
                        <LayoutGrid size={16} />
                      </button>
                    </div>
                  </div>
                </div>

                {/* ── JOB CARDS STREAM ── */}
                {loading ? (
                  <div className="py-24 text-center text-stone-500 bg-white dark:bg-stone-900 rounded-3xl border border-stone-200 dark:border-stone-800">
                    <div className="w-9 h-9 border-3 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
                    <b className="text-sm font-bold text-stone-700 dark:text-stone-300 block">Loading active positions...</b>
                    <small className="text-xs text-stone-400">Fetching latest openings from Adyapan ATS</small>
                  </div>
                ) : paginatedJobs.length === 0 ? (
                  <div className="p-12 text-center bg-white dark:bg-stone-900 rounded-3xl border border-stone-200 dark:border-stone-800 space-y-4">
                    <div className="w-14 h-14 rounded-2xl bg-amber-500/15 text-amber-600 flex items-center justify-center mx-auto">
                      <Search size={26} />
                    </div>
                    <div className="space-y-1">
                      <h3 className="font-bold text-lg text-stone-900 dark:text-white">
                        No matching opportunities found
                      </h3>
                      <p className="text-xs text-stone-500 max-w-sm mx-auto font-medium">
                        We couldn't find any openings matching your selected filters. Try clearing filters or searching for other skills.
                      </p>
                    </div>
                    <button
                      onClick={clearAllFilters}
                      className="px-6 py-2.5 rounded-2xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold shadow-lg shadow-amber-500/25 transition-all cursor-pointer"
                    >
                      View All Opportunities
                    </button>
                  </div>
                ) : (
                  <div className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 gap-5' : 'space-y-4'}>
                    {paginatedJobs.map((job, idx) => {
                      const colorTheme = getJobColorAccent(job.title, job.department);
                      const isSaved = savedJobs.includes(job.id || job.slug);

                      return (
                        <React.Fragment key={job.id || job.slug}>
                          <div
                            className={`interactive-card p-5 sm:p-6 rounded-3xl bg-white dark:bg-stone-900 border border-stone-200/80 dark:border-stone-800 shadow-md hover:shadow-xl transition-all duration-300 relative group flex flex-col justify-between gap-5 border-l-4 ${colorTheme.border}`}
                          >
                            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-5">

                              {/* Left: Simple Minimalist Logo Badge + Role Details */}
                              <div className="flex items-start gap-3.5 flex-1">
                                {/* Simple Compact Logo Icon (w-10 h-10) */}
                                <div className={`w-10 h-10 rounded-xl flex items-center justify-center p-1.5 border shrink-0 mt-0.5 ${colorTheme.iconBg}`}>
                                  <img
                                    src={logo}
                                    alt="Adyapan"
                                    className="w-full h-full object-contain"
                                  />
                                </div>

                                <div className="space-y-1.5 flex-1">
                                  {/* Title */}
                                  <div className="flex items-center gap-2.5 flex-wrap">
                                    <Link
                                      to={`/careers/${job.slug || job.id}`}
                                      className="font-bold text-base sm:text-lg text-stone-900 dark:text-white hover:text-amber-500 transition-colors"
                                    >
                                      {job.title}
                                    </Link>
                                  </div>

                                  {/* Company Name */}
                                  <p className="text-xs font-bold text-stone-500 dark:text-stone-400">
                                    {job.company}
                                  </p>

                                  {/* Metadata Row: Location, Type, Experience */}
                                  <div className="flex items-center gap-3.5 text-xs font-bold text-stone-600 dark:text-stone-300 flex-wrap pt-0.5">
                                    <span className="inline-flex items-center gap-1.5">
                                      <MapPin size={13} className="text-amber-500" />
                                      <span>{job.location}</span>
                                    </span>
                                    <span className="inline-flex items-center gap-1.5">
                                      <Clock3 size={13} className="text-amber-500" />
                                      <span>{job.type}</span>
                                    </span>
                                    <span className="inline-flex items-center gap-1.5">
                                      <Briefcase size={13} className="text-amber-500" />
                                      <span>{job.experience}</span>
                                    </span>
                                  </div>

                                  {/* Skill Tags */}
                                  {job.skills && job.skills.length > 0 && (
                                    <div className="flex flex-wrap gap-1.5 pt-1.5">
                                      {job.skills.map((skill: string) => (
                                        <span
                                          key={skill}
                                          className="px-2.5 py-0.5 rounded-lg bg-stone-100 dark:bg-stone-800 text-stone-800 dark:text-stone-200 text-[11px] font-bold border border-stone-200/60 dark:border-stone-700"
                                        >
                                          {skill}
                                        </span>
                                      ))}
                                    </div>
                                  )}
                                </div>
                              </div>

                              {/* Right Side: Salary, Date & Actions */}
                              <div className="flex sm:flex-col items-center sm:items-end justify-between border-t sm:border-t-0 pt-3 sm:pt-0 border-stone-100 dark:border-stone-800 gap-3 shrink-0">
                                <div className="text-left sm:text-right">
                                  <b className="text-base font-bold text-stone-900 dark:text-white block">
                                    {job.salary}
                                  </b>
                                  <small className="text-[11px] font-semibold text-stone-400">
                                    {job.postedTime}
                                  </small>
                                </div>

                                <div className="flex items-center gap-2">
                                  {/* Bookmark Heart Button */}
                                  <button
                                    onClick={(e) => toggleSave(job.id || job.slug, e)}
                                    className={`p-2 rounded-xl border transition-all cursor-pointer ${isSaved
                                      ? 'bg-rose-500/15 border-rose-500 text-rose-600'
                                      : 'border-stone-200 dark:border-stone-700 text-stone-400 hover:text-amber-500 hover:border-amber-500 bg-stone-100 dark:bg-stone-800'
                                      }`}
                                    title={isSaved ? 'Job Saved' : 'Save Job'}
                                  >
                                    <Heart size={15} className={isSaved ? 'fill-rose-600' : ''} />
                                  </button>

                                  {/* View Job Button */}
                                  <Link
                                    to={`/careers/${job.slug || job.id}`}
                                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-extrabold text-xs shadow-md shadow-amber-500/20 hover:scale-105 transition-all cursor-pointer"
                                  >
                                    <span>View Job</span>
                                    <ArrowRight size={13} className="group-hover:translate-x-1 transition-transform" />
                                  </Link>
                                </div>
                              </div>
                            </div>
                          </div>
                        </React.Fragment>
                      );
                    })}
                  </div>
                )}

                {/* ── PAGINATION CONTROLS (ROUNDED ORANGE HIGHLIGHT) ── */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-center gap-2 pt-8">
                    <button
                      onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                      disabled={currentPage === 1}
                      className="w-10 h-10 rounded-2xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 text-stone-700 dark:text-stone-300 font-bold text-xs hover:border-amber-500 hover:text-amber-500 disabled:opacity-40 disabled:pointer-events-none transition-all flex items-center justify-center cursor-pointer"
                    >
                      ←
                    </button>

                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
                      <button
                        key={pageNum}
                        onClick={() => setCurrentPage(pageNum)}
                        className={`w-10 h-10 rounded-2xl font-bold text-xs transition-all flex items-center justify-center cursor-pointer ${currentPage === pageNum
                          ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-lg shadow-amber-500/25 scale-105'
                          : 'bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 text-stone-700 dark:text-stone-300 hover:bg-amber-500/10 hover:text-amber-600'
                          }`}
                      >
                        {pageNum}
                      </button>
                    ))}

                    <button
                      onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                      disabled={currentPage === totalPages}
                      className="w-10 h-10 rounded-2xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 text-stone-700 dark:text-stone-300 font-bold text-xs hover:border-amber-500 hover:text-amber-500 disabled:opacity-40 disabled:pointer-events-none transition-all flex items-center justify-center cursor-pointer"
                    >
                      →
                    </button>
                  </div>
                )}

              </div>

            </div>
          </div>
        </section>

      </main>
    </SiteShell>
  );
};

export default PublicJobs;
