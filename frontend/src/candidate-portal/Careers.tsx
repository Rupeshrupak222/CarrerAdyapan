import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import CandidateNavbar from '../components/layout/CandidateNavbar';
import Footer from '../components/layout/Footer';
import { useTheme } from '../context/ThemeContext';
import { useCandidateAuth } from '../context/CandidateAuthContext';
import { jobService } from '../services/jobService';

const CAREER_JOURNEYS = [
  {
    title: 'Students and new grads',
    stepNumber: '01',
    tag: 'EARLY CAREER & INTERNSHIPS',
    description:
      'Launch your career with high-impact learning. We offer fast-paced paid internships, structured mentorship from senior leaders, and a direct conversion path into full-time roles across EdTech sales, technology, and operations.',
    highlights: [
      'Comprehensive 1-on-1 mentorship',
      'Real project ownership from Day 1',
      'Fast-track performance appraisals',
      'Competitive stipend & incentives',
    ],
    cta: 'Explore Early Career Roles',
    image: 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=800&h=1000&fit=crop&q=80',
  },
  {
    title: 'Experienced professionals',
    stepNumber: '02',
    tag: 'LEADERSHIP & DOMAIN EXPERTS',
    description:
      'Drive scale, strategy, and innovation. Bring your domain expertise in sales leadership, curriculum engineering, full-stack architecture, and institutional partnerships to shape the future of Indian education.',
    highlights: [
      'High-ownership leadership tracks',
      'Direct cross-functional impact',
      'Merit-based compensation packages',
      'Hybrid & flexible work environment',
    ],
    cta: 'Explore Experienced Openings',
    image: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=800&h=1000&fit=crop&q=80',
  },
  {
    title: 'Alumni & continuous learning',
    stepNumber: '03',
    tag: 'UPSKILLING & NETWORK',
    description:
      'Our commitment to your growth never stops. Benefit from continuous learning allowances, access to 65+ certified courses, executive roundtables, and co-branded certifications with Microsoft, Cisco, and Adobe.',
    highlights: [
      '100% sponsored global certifications',
      'Active alumni network & referral bonus',
      'Internal mobility & domain switching',
      'Executive skill masterclasses',
    ],
    cta: 'Discover Lifelong Learning',
    image: 'https://images.unsplash.com/photo-1531482615713-2afd69097998?w=800&h=1000&fit=crop&q=80',
  },
  {
    title: 'Returnship & career restart',
    stepNumber: '04',
    tag: 'WELCOME BACK PROGRAM',
    description:
      'Restarting your career after a break? Our Returnship initiative provides tailored onboarding, refresher masterclasses, and empathetic peer support to help you smoothly transition back into leadership.',
    highlights: [
      'Structured 90-day ramp-up plan',
      'Flexible scheduling & hybrid options',
      'Dedicated onboarding buddy & coach',
      'Equitable pay from Day 1',
    ],
    cta: 'Explore Returnship Roles',
    image: 'https://images.unsplash.com/photo-1551836022-d5d88e9218df?w=800&h=1000&fit=crop&q=80',
  },
];

const CERT_PARTNERS = [
  { name: 'ISO 9001:2015', desc: 'Quality Management' },
  { name: 'NSDC', desc: 'Skill Development' },
  { name: 'Skill India', desc: 'Digital Hub Partner' },
  { name: 'MSME', desc: 'Govt. of India' },
  { name: 'Microsoft', desc: 'Certification Partner' },
  { name: 'Cisco', desc: 'Networking Academy' },
  { name: 'Adobe', desc: 'Creative Ecosystem' },
  { name: 'Meta', desc: 'Digital Marketing' },
];

const CULTURE_PILLARS = [
  {
    id: 'growth',
    title: 'Growth & Rapid Progression',
    category: 'Career',
    stepNumber: '01',
    image: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=700&h=450&fit=crop&q=80',
    shortDesc: 'Clear 6-month appraisal cycles, 1-on-1 executive mentoring, and rapid promotion roadmaps.',
    fullStory:
      'We believe ambition should never be bottlenecked by bureaucracy. At Adyapan, high performers are recognized and promoted fast. Every team member receives an individualized career roadmap, direct executive mentorship, and quarterly progression milestones.',
    perks: [
      'Bi-annual performance review & merit appraisals',
      '100% sponsored certification vouchers (Microsoft, Cisco)',
      'Leadership training & executive shadowing',
      'Cross-departmental lateral mobility',
    ],
    quote: '"I joined as an intern and within 14 months was leading my own team of 8 advisors. The growth velocity here is truly unmatched."',
    quoteAuthor: 'Pooja R. — Senior Team Lead',
  },
  {
    id: 'innovation',
    title: 'Innovation & Real AI at Scale',
    category: 'Technology',
    stepNumber: '02',
    image: 'https://images.unsplash.com/photo-1531482615713-2afd69097998?w=700&h=450&fit=crop&q=80',
    shortDesc: 'Proprietary AI candidate matching, interactive LMS tools, and data-driven student coaching.',
    fullStory:
      'We build tools that make a real-world difference. From our automated ATS candidate ranking engine to interactive learning dashboards, our engineers and curriculum developers work on the cutting edge of generative AI and educational technology.',
    perks: [
      'Access to state-of-the-art AI tooling & APIs',
      'Quarterly innovation hackathons with cash prizes',
      'Modern tech stack (React, Node, PostgreSQL, Python)',
      'Autonomy to prototype and ship experimental features',
    ],
    quote: '"Building AI solutions that directly help students land jobs across India is the most fulfilling engineering work I have done."',
    quoteAuthor: 'Arjun M. — Full Stack Engineer',
  },
  {
    id: 'culture',
    title: 'Collaborative & High-Energy Culture',
    category: 'Culture',
    stepNumber: '03',
    image: 'https://images.unsplash.com/photo-1511632765486-a01980e01a18?w=700&h=450&fit=crop&q=80',
    shortDesc: 'Vibrant team celebrations, quarterly offsites, milestone awards, and inclusive camaraderie.',
    fullStory:
      'Work is more than just tasks—it is about the people you build with. Our workplace is energized with daily wins, weekly game hours, festival celebrations, and open-door leadership where every idea is heard and valued.',
    perks: [
      'Quarterly team offsites and adventure retreats',
      'Weekly team celebrations & reward galas',
      'Zero-hierarchy communication & open door policy',
      'Vibrant festival events & creative workshops',
    ],
    quote: '"The energy on the floor is contagious. You are surrounded by teammates who genuinely push and celebrate each other every single day."',
    quoteAuthor: 'Sneha K. — Inside Sales Specialist',
  },
  {
    id: 'rewards',
    title: 'Top Tier Pay & Performance Wealth',
    category: 'Rewards',
    stepNumber: '04',
    image: 'https://images.unsplash.com/photo-1551836022-d5d88e9218df?w=700&h=450&fit=crop&q=80',
    shortDesc: 'Aggressive uncapped incentives, competitive base salary, and milestone equity bonuses.',
    fullStory:
      'We believe in rewarding hard work generously. In addition to industry-leading base salaries, our sales and growth professionals enjoy lucrative uncapped commissions, quarterly bonuses, and annual performance rewards.',
    perks: [
      'Uncapped weekly & monthly sales incentives',
      'Performance bonuses & President Club luxury trips',
      'Comprehensive health coverage for family',
      'Milestone achievement trophies and tech rewards',
    ],
    quote: '"The incentive structure is completely transparent and uncapped. If you deliver results, your earning potential has no ceiling."',
    quoteAuthor: 'Vikram S. — Business Development Manager',
  },
  {
    id: 'flexibility',
    title: 'Flexible Hybrid Work & Wellness',
    category: 'Wellness',
    stepNumber: '05',
    image: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=700&h=450&fit=crop&q=80',
    shortDesc: 'Work from our modern Hyderabad hub or hybrid remote. Flexible hours & wellness leave.',
    fullStory:
      'We understand life happens outside of work. Our modern work policies support flexible scheduling, hybrid arrangements, mental health days, and generous leave allowances so you can do your best work without burning out.',
    perks: [
      'Flexible hybrid office & remote options',
      'Dedicated mental health & wellness days',
      'Generous paid annual leave & festival breaks',
      'Ergonomic workspace allowances',
    ],
    quote: '"Having the flexibility to work hybrid while staying tightly connected with the team has made my work-life balance incredible."',
    quoteAuthor: 'Ananya D. — Curriculum Designer',
  },
  {
    id: 'impact',
    title: 'Direct National Education Impact',
    category: 'Impact',
    stepNumber: '06',
    image: 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=700&h=450&fit=crop&q=80',
    shortDesc: 'Directly empower 50,000+ students and young graduates across India to land dream careers.',
    fullStory:
      'Every program we design and candidate we place creates a ripple effect of upward mobility across families and communities. Building at Adyapan means contributing directly to national skilling and meaningful employment.',
    perks: [
      'Direct contribution to 50,000+ learner lives',
      'Partnerships with top tier universities across India',
      'CSR initiatives & student scholarship programs',
      'Verified social and educational impact tracking',
    ],
    quote: '"Knowing our daily effort directly helps a student get placed at their dream company gives our work immense purpose."',
    quoteAuthor: 'Ramesh T. — Academic Advisor',
  },
];

const Careers = () => {
  const { theme, toggleTheme } = useTheme();
  const { candidate, logout } = useCandidateAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [searchTerm, setSearchTerm] = useState('');
  const [locationTerm, setLocationTerm] = useState('');
  const [jobs, setJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeJourney, setActiveJourney] = useState(0);

  // Life at Adyapan Interactive Modal & Filter State
  const [selectedCultureModal, setSelectedCultureModal] = useState<any | null>(null);
  const [cultureFilter, setCultureFilter] = useState('All');
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);

  useEffect(() => {
    fetchLiveJobs();
  }, []);

  // Smooth scroll to section if hash is in URL (e.g. /careers#life or /careers#journey)
  useEffect(() => {
    if (location.hash) {
      const targetId = location.hash.replace('#', '');
      const timer = setTimeout(() => {
        const element = document.getElementById(targetId);
        if (element) {
          const navOffset = 80;
          const elementPosition = element.getBoundingClientRect().top;
          const offsetPosition = elementPosition + window.pageYOffset - navOffset;
          window.scrollTo({
            top: offsetPosition,
            behavior: 'smooth'
          });
        }
      }, 150);
      return () => clearTimeout(timer);
    }
  }, [location.hash, location.pathname]);

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

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    navigate(`/open-positions?q=${encodeURIComponent(searchTerm)}&location=${encodeURIComponent(locationTerm)}`);
  };

  const filteredPillars = cultureFilter === 'All'
    ? CULTURE_PILLARS
    : CULTURE_PILLARS.filter((p) => p.category === cultureFilter);

  return (
    <div className={`min-h-screen font-sans antialiased transition-colors relative overflow-x-hidden ${theme === 'dark'
      ? 'bg-gradient-to-l from-amber-950/40 via-amber-950/15 via-30% to-[#0a0a1a] text-white'
      : 'bg-gradient-to-l from-orange-300/40 via-amber-100/30 via-40% to-white text-slate-900'
      }`}>

      {/* Persistent Full-Page Right-to-Left Orange Gradient Glow */}
      <div className="fixed top-0 right-0 w-[60vw] max-w-[900px] h-full pointer-events-none bg-gradient-to-l from-orange-400/20 via-amber-200/10 via-45% to-transparent dark:from-amber-500/10 dark:via-amber-900/5 dark:to-transparent blur-3xl z-0" />

      {/* ===== MAIN NAV ===== */}
      <CandidateNavbar activePage="careers" />

      {/* ===== 1. HERO SECTION ===== */}
      <section className="relative overflow-hidden">
        {/* Right-to-Left Orange Fade Gradient Background Layers */}
        <div className="absolute inset-0 pointer-events-none bg-gradient-to-l from-orange-400/30 via-amber-200/15 via-45% to-transparent dark:from-amber-600/20 dark:via-amber-900/10 dark:to-transparent" />
        <div className="absolute top-0 right-0 w-[650px] h-[650px] rounded-full blur-[120px] pointer-events-none bg-gradient-to-l from-orange-500/40 via-amber-400/25 to-transparent dark:from-amber-500/20 dark:via-amber-800/10" />
        <div className="absolute bottom-0 right-10 w-[450px] h-[450px] rounded-full blur-[100px] pointer-events-none bg-gradient-to-l from-amber-400/30 via-orange-300/15 to-transparent dark:from-amber-600/15 dark:via-amber-950/10" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-8 py-20 sm:py-28 lg:py-32">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left Content */}
            <div className="space-y-6 sm:space-y-8">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-black uppercase tracking-wider bg-amber-500/15 text-amber-700 dark:text-amber-400 border border-amber-500/30">
                ● OFFICIAL ADYAPAN CAREERS PORTAL
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-[1.1]">
                Shape India's Education. Elevate Your{' '}
                <span className="bg-gradient-to-r from-amber-500 via-amber-400 to-orange-500 bg-clip-text text-transparent">
                  Career Velocity.
                </span>
              </h1>

              <p className={`text-base sm:text-lg leading-relaxed max-w-xl ${theme === 'dark' ? 'text-slate-300' : 'text-slate-600'}`}>
                Join one of India’s fastest-growing talent platforms. Collaborate with visionary educators, build AI-driven recruitment engines, and accelerate your growth with uncapped performance rewards.
              </p>

              {/* Search Box Form */}
              <form onSubmit={handleSearch} className={`flex flex-col sm:flex-row gap-2 sm:gap-0 p-2 rounded-2xl shadow-xl border ${theme === 'dark' ? 'bg-slate-900/90 border-slate-700/80 shadow-black/40' : 'bg-white border-amber-200/80 shadow-amber-500/10'}`}>
                <div className="flex-1 relative">
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search jobs (e.g. Sales, React, Telecaller)"
                    className={`w-full px-5 py-4 text-sm font-medium border-0 focus:outline-none ${theme === 'dark' ? 'bg-slate-900 text-white placeholder-slate-500' : 'bg-white text-slate-900 placeholder-slate-400'}`}
                  />
                </div>
                <div className={`w-px self-stretch ${theme === 'dark' ? 'bg-slate-700' : 'bg-slate-200'} hidden sm:block`} />
                <div className="flex-1 relative">
                  <input
                    type="text"
                    value={locationTerm}
                    onChange={(e) => setLocationTerm(e.target.value)}
                    placeholder="Location (e.g. Hyderabad, Remote)"
                    className={`w-full px-5 py-4 text-sm font-medium border-0 focus:outline-none ${theme === 'dark' ? 'bg-slate-900 text-white placeholder-slate-500' : 'bg-white text-slate-900 placeholder-slate-400'}`}
                  />
                </div>
                <button
                  type="submit"
                  className="px-7 py-4 bg-gradient-to-r from-amber-400 via-amber-500 to-orange-500 hover:from-amber-300 hover:to-orange-400 transition-all flex items-center justify-center cursor-pointer font-black text-slate-950 rounded-xl"
                >
                  <span>Search Jobs</span>
                </button>
              </form>
            </div>

            {/* Right - Hero Visual */}
            <div className="hidden lg:block relative">
              <div className={`absolute -inset-4 rounded-3xl rotate-3 ${theme === 'dark' ? 'bg-gradient-to-br from-amber-500/20 to-orange-500/10' : 'bg-gradient-to-br from-amber-200 to-orange-100'}`} />
              <div className="relative rounded-2xl overflow-hidden shadow-2xl aspect-[4/3] border border-white/20">
                <img
                  src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=800&h=600&fit=crop&q=80"
                  alt="Team collaborating at Adyapan"
                  className="w-full h-full object-cover"
                />
                <div className={`absolute inset-0 ${theme === 'dark' ? 'bg-gradient-to-t from-[#0a0a1a]/90 via-transparent to-transparent' : 'bg-gradient-to-t from-slate-950/80 via-transparent to-transparent'}`} />
                <div className="absolute bottom-0 left-0 right-0 p-6">
                  <p className="text-white text-xs font-bold uppercase tracking-wider">
                    ISO 9001:2015 Certified • MSME Recognized • Skill India Partner
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ===== 2. RECOGNITION & CULTURE BANNER ===== */}
      <section className={`border-t py-16 sm:py-20 relative overflow-hidden ${theme === 'dark' ? 'border-slate-800 bg-[#0d0d20]' : 'border-slate-200/80 bg-white'
        }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-8">
          <div className="grid lg:grid-cols-12 gap-10 sm:gap-14 items-center">

            {/* Left: Certification Seal Card */}
            <div className="lg:col-span-5 relative group">
              <div className="relative rounded-3xl overflow-hidden shadow-2xl aspect-[4/3] bg-gradient-to-br from-red-600 via-rose-700 to-amber-700 p-8 flex flex-col justify-between text-white border border-white/20">
                <img
                  src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=800&h=600&fit=crop&q=80"
                  alt="Team Culture at Adyapan"
                  className="absolute inset-0 w-full h-full object-cover mix-blend-overlay opacity-35 group-hover:scale-105 transition-transform duration-700"
                />

                <div className="relative z-10 bg-[#e11d48] text-white p-6 rounded-2xl shadow-2xl border border-white/30 text-center max-w-[280px] mx-auto my-auto space-y-2">
                  <div className="text-2xl sm:text-3xl font-black uppercase tracking-tight leading-tight drop-shadow-md">
                    Great Place To Grow
                  </div>
                  <div className="h-0.5 w-16 bg-white/50 mx-auto" />
                  <div className="text-xs font-black tracking-widest uppercase bg-white/25 py-1 rounded-lg">
                    Certified 2026-2027
                  </div>
                  <div className="text-[11px] font-bold tracking-wider text-white/95">
                    ISO 9001:2015 • MSME • INDIA
                  </div>
                </div>

                <div className="relative z-10 text-center text-xs font-bold text-white/90 tracking-wide">
                  Skill India Partner • 300+ Corporate Hiring Networks
                </div>
              </div>
            </div>

            {/* Right: Copy & CTA */}
            <div className="lg:col-span-7 space-y-6">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-black uppercase tracking-wider bg-amber-500/15 text-amber-700 dark:text-amber-400 border border-amber-500/30">
                ● PURPOSE-DRIVEN WORKPLACE EXCELLENCE
              </div>

              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight leading-[1.15]">
                We're recognized for our impact, culture & people!
              </h2>

              <p className={`text-base sm:text-lg leading-relaxed ${theme === 'dark' ? 'text-slate-300' : 'text-slate-600'}`}>
                Our team has spoken. At <strong className="text-amber-500 font-bold">Adyapan Edutech</strong>, you'll find more than a job—you'll find meaningful work transforming education across India, fast-track career progression, and an energetic team that empowers you to thrive.
              </p>

              <div className="flex flex-wrap gap-4 pt-2">
                <a
                  href="#life"
                  className="px-7 py-3.5 rounded-full text-sm font-bold text-slate-950 bg-gradient-to-r from-amber-400 via-amber-500 to-orange-500 hover:from-amber-300 hover:to-orange-400 transition-all shadow-lg shadow-amber-500/25 flex items-center gap-2 hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
                >
                  <span>Discover the Adyapan culture</span>
                  <span>→</span>
                </a>
                <Link
                  to="/open-positions"
                  className={`px-7 py-3.5 rounded-full text-sm font-bold transition-all border ${theme === 'dark'
                    ? 'border-slate-700 text-slate-200 hover:bg-slate-800'
                    : 'border-slate-300 text-slate-700 hover:bg-slate-100 bg-white shadow-sm'
                    }`}
                >
                  Explore Open Positions
                </Link>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ===== 3. CAREER JOURNEY PATHWAYS ===== */}
      <section id="journey" className={`border-t py-16 sm:py-24 relative overflow-hidden ${theme === 'dark' ? 'border-slate-800 bg-[#0a0a1a]' : 'border-slate-200/80 bg-slate-50/50'
        }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-8">

          <div className="mb-12 space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-amber-500/15 text-amber-700 dark:text-amber-300 border border-amber-500/30 rounded-full text-[11px] font-extrabold uppercase">
              TAILORED CAREER PATHWAYS
            </div>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-slate-900 dark:text-white">
              Where are you in your career journey?
            </h2>
            <p className={`text-base sm:text-lg max-w-2xl ${theme === 'dark' ? 'text-slate-400' : 'text-slate-600'}`}>
              Whether you're starting out, taking the next big leap, or returning to the workforce—we have tailored pathways designed for your success.
            </p>
          </div>

          <div className="grid lg:grid-cols-12 gap-10 items-start">

            {/* Left: Interactive Accordion Tabs */}
            <div className="lg:col-span-7 space-y-4">
              {CAREER_JOURNEYS.map((journey, idx) => {
                const isOpen = activeJourney === idx;
                return (
                  <div
                    key={journey.title}
                    className={`rounded-3xl border transition-all overflow-hidden ${isOpen
                      ? theme === 'dark'
                        ? 'bg-slate-900 border-amber-500/60 shadow-xl'
                        : 'bg-white border-amber-400 shadow-xl shadow-amber-500/10'
                      : theme === 'dark'
                        ? 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
                        : 'bg-white border-slate-200 hover:border-amber-300 shadow-sm'
                      }`}
                  >
                    <button
                      onClick={() => setActiveJourney(idx)}
                      className="w-full p-6 text-left flex items-center justify-between gap-4 cursor-pointer"
                    >
                      <div className="flex items-center gap-3">
                        <span className="w-8 h-8 rounded-xl bg-amber-500/15 text-amber-600 dark:text-amber-400 font-black text-xs flex items-center justify-center border border-amber-500/30">
                          {journey.stepNumber}
                        </span>
                        <span className={`text-xl sm:text-2xl font-black transition-colors ${isOpen ? 'text-amber-500' : theme === 'dark' ? 'text-white' : 'text-slate-800'
                          }`}>
                          {journey.title}
                        </span>
                      </div>
                      <span className={`w-8 h-8 rounded-full flex items-center justify-center text-lg font-bold transition-transform ${isOpen
                        ? 'bg-amber-500 text-slate-950 rotate-45 shadow-md shadow-amber-500/20'
                        : theme === 'dark' ? 'bg-slate-800 text-slate-300' : 'bg-slate-100 text-slate-600'
                        }`}>
                        +
                      </span>
                    </button>

                    {isOpen && (
                      <div className="px-6 pb-6 pt-1 space-y-4 text-sm sm:text-base border-t border-slate-100 dark:border-slate-800/80">
                        <p className={`leading-relaxed ${theme === 'dark' ? 'text-slate-300' : 'text-slate-600'}`}>
                          {journey.description}
                        </p>
                        <div className="flex flex-wrap gap-2 pt-1">
                          {journey.highlights.map((h: string) => (
                            <span
                              key={h}
                              className="px-3 py-1 text-xs font-bold rounded-xl bg-amber-500/15 text-amber-800 dark:text-amber-300 border border-amber-500/30"
                            >
                              ✓ {h}
                            </span>
                          ))}
                        </div>
                        <div className="pt-2">
                          <Link
                            to="/open-positions"
                            className="inline-flex items-center gap-2 text-xs sm:text-sm font-black text-amber-600 dark:text-amber-400 hover:text-amber-500 uppercase tracking-wider"
                          >
                            <span>{journey.cta}</span>
                            <span>→</span>
                          </Link>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Right: Dynamic Visual Display */}
            <div className="lg:col-span-5 relative">
              <div className="relative rounded-3xl overflow-hidden shadow-2xl aspect-[4/5] border border-white/20 group">
                <img
                  src={CAREER_JOURNEYS[activeJourney].image}
                  alt={CAREER_JOURNEYS[activeJourney].title}
                  className="w-full h-full object-cover transition-all duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/40 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-6 sm:p-8 space-y-1.5 text-white" style={{ color: '#ffffff' }}>
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-amber-400 text-slate-950 inline-block mb-1 shadow-md">
                    {CAREER_JOURNEYS[activeJourney].tag}
                  </span>
                  <h3 className="text-xl sm:text-2xl font-black text-white drop-shadow-lg" style={{ color: '#ffffff' }}>
                    {CAREER_JOURNEYS[activeJourney].title}
                  </h3>
                  <p className="text-xs text-white/90 leading-relaxed font-medium" style={{ color: '#ffffff' }}>
                    Empowering ambitious minds across India with world-class education.
                  </p>
                </div>
              </div>
            </div>

          </div>

        </div>
      </section>

      {/* ===== 4. CERTIFIED BY INDUSTRY LEADERS ===== */}
      <section className={`border-t py-14 border-b ${theme === 'dark' ? 'border-slate-800 bg-[#0d0d20]' : 'border-slate-200/80 bg-white'
        }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-8 text-center space-y-8">
          <div>
            <p className="text-xs font-extrabold uppercase tracking-widest text-amber-500">
              TRUSTED & ACCREDITED ECOSYSTEM
            </p>
            <h2 className="text-2xl sm:text-3xl font-black mt-1">
              Recognized & Certified by Industry Leaders
            </h2>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3 sm:gap-4">
            {CERT_PARTNERS.map((partner) => (
              <div
                key={partner.name}
                className={`p-4 rounded-2xl border text-center transition-all hover:scale-105 ${theme === 'dark'
                  ? 'bg-slate-900/60 border-slate-800 hover:border-amber-500/50'
                  : 'bg-slate-50 border-slate-200 hover:border-amber-300 shadow-sm'
                  }`}
              >
                <p className="text-sm font-black text-slate-900 dark:text-white">
                  {partner.name}
                </p>
                <p className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 mt-0.5">
                  {partner.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== 5. DEPARTMENT CATEGORIES ===== */}
      <section id="categories" className={`border-t py-16 sm:py-20 relative overflow-hidden ${theme === 'dark' ? 'border-slate-800 bg-[#0a0a1a]' : 'border-slate-200/80 bg-slate-50/50'
        }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-amber-500/15 text-amber-700 dark:text-amber-300 border border-amber-500/30 rounded-full text-[11px] font-extrabold uppercase mb-3">
                CAREER DOMAINS
              </div>
              <h2 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white">
                Explore by Department
              </h2>
              <p className={`text-sm sm:text-base mt-1.5 max-w-xl ${theme === 'dark' ? 'text-slate-400' : 'text-slate-600'}`}>
                Discover specialized teams across Adyapan and find the perfect role matching your strengths.
              </p>
            </div>

            <Link
              to="/open-positions"
              className="inline-flex items-center gap-2 text-xs sm:text-sm font-black text-amber-600 dark:text-amber-400 hover:text-amber-500 uppercase tracking-wider shrink-0"
            >
              <span>View All Open Positions</span>
              <span>→</span>
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                name: 'Sales & Growth',
                code: 'SLS',
                desc: 'Inside sales, BDA, enterprise partnerships & student lead conversions.',
                searchQuery: 'Sales',
              },
              {
                name: 'Technology & AI',
                code: 'ENG',
                desc: 'Full-stack software engineering, AI screening engines, and cloud architecture.',
                searchQuery: 'Developer',
              },
              {
                name: 'Academic Counselling',
                code: 'CNS',
                desc: 'Student career advisory, personalized learning roadmaps & mentor matchmaking.',
                searchQuery: 'Counsellor',
              },
              {
                name: 'Marketing & Brand',
                code: 'MKT',
                desc: 'Performance marketing, social media campaigns, brand storytelling & growth.',
                searchQuery: 'Marketing',
              },
              {
                name: 'Operations & Success',
                code: 'OPS',
                desc: 'Corporate placement logistics, student onboarding & recruiter network operations.',
                searchQuery: 'Operations',
              },
              {
                name: 'Curriculum & Content',
                code: 'CUR',
                desc: 'Pedagogy development, verified industry skill modules & co-branded certifications.',
                searchQuery: 'Content',
              },
            ].map((cat) => {
              const count = jobs.filter(j =>
                (j.department || '').toLowerCase().includes(cat.searchQuery.toLowerCase()) ||
                (j.title || '').toLowerCase().includes(cat.searchQuery.toLowerCase())
              ).length;

              return (
                <div
                  key={cat.name}
                  onClick={() => { navigate(`/open-positions?q=${encodeURIComponent(cat.searchQuery)}`); }}
                  className={`p-6 sm:p-7 rounded-3xl border text-left transition-all duration-300 group cursor-pointer flex flex-col justify-between gap-6 hover:-translate-y-1 ${theme === 'dark'
                    ? 'bg-slate-900/70 border-slate-800 hover:border-amber-500/60 hover:bg-slate-900 shadow-lg hover:shadow-amber-500/10'
                    : 'bg-white border-slate-200 hover:border-amber-400 hover:shadow-xl hover:shadow-amber-500/10 shadow-sm'
                    }`}
                >
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="w-12 h-12 rounded-2xl bg-amber-500/15 text-amber-600 dark:text-amber-400 font-black text-xs flex items-center justify-center border border-amber-500/30 group-hover:scale-110 transition-transform">
                        {cat.code}
                      </div>
                      <span className={`px-3 py-1 text-[11px] font-extrabold rounded-full border ${count > 0
                        ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/30'
                        : 'bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-500/20'
                        }`}>
                        {count > 0 ? `${count} Open Role${count !== 1 ? 's' : ''}` : 'Active Hiring'}
                      </span>
                    </div>

                    <div>
                      <h3 className={`text-lg font-bold group-hover:text-amber-500 transition-colors ${theme === 'dark' ? 'text-white' : 'text-slate-900'
                        }`}>
                        {cat.name}
                      </h3>
                      <p className={`text-xs mt-1.5 leading-relaxed ${theme === 'dark' ? 'text-slate-400' : 'text-slate-600'
                        }`}>
                        {cat.desc}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 text-xs font-black text-amber-500 pt-2 border-t border-slate-100 dark:border-slate-800">
                    <span>Explore Roles</span>
                    <span className="group-hover:translate-x-1 transition-transform">→</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ===== 6. LIFE AT ADYAPAN ===== */}
      <section id="life" className={`border-t py-16 sm:py-24 relative overflow-hidden ${theme === 'dark' ? 'border-slate-800 bg-[#0d0d20]' : 'border-slate-200/80 bg-white'
        }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-8 space-y-12">

          {/* Header & Category Filter */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div className="space-y-3">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-amber-500/15 text-amber-700 dark:text-amber-300 border border-amber-500/30 rounded-full text-[11px] font-extrabold uppercase">
                CULTURE & COMMUNITY
              </div>
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 dark:text-white">
                Life at Adyapan
              </h2>
              <p className={`text-sm sm:text-base max-w-xl ${theme === 'dark' ? 'text-slate-400' : 'text-slate-600'}`}>
                We believe in empowering passionate builders. Explore our core culture pillars, real teammate stories, and comprehensive benefits.
              </p>
            </div>

            {/* Filter Pills */}
            <div className="flex flex-wrap gap-2">
              {['All', 'Career', 'Technology', 'Culture', 'Rewards', 'Wellness', 'Impact'].map((cat) => (
                <button
                  key={cat}
                  onClick={() => setCultureFilter(cat)}
                  className={`px-4 py-2 rounded-xl text-xs font-extrabold transition-all cursor-pointer ${cultureFilter === cat
                    ? 'bg-amber-500 text-slate-950 font-black shadow-md shadow-amber-500/20 scale-105'
                    : theme === 'dark'
                      ? 'bg-slate-900 text-slate-300 border border-slate-800 hover:border-amber-400/50'
                      : 'bg-slate-100 text-slate-700 border border-slate-200 hover:bg-slate-200'
                    }`}
                >
                  {cat === 'All' ? 'All Pillars' : cat}
                </button>
              ))}
            </div>
          </div>

          {/* 6 Rich Visual Pillar Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {filteredPillars.map((pillar) => (
              <div
                key={pillar.id}
                onClick={() => setSelectedCultureModal(pillar)}
                className={`rounded-3xl border overflow-hidden transition-all duration-300 flex flex-col justify-between group cursor-pointer hover:-translate-y-1.5 ${theme === 'dark'
                  ? 'bg-slate-900/80 border-slate-800 hover:border-amber-500/60 hover:bg-slate-900 shadow-xl hover:shadow-amber-500/10'
                  : 'bg-white border-slate-200 hover:border-amber-400 hover:shadow-2xl hover:shadow-amber-500/15 shadow-sm'
                  }`}
              >
                {/* Photo Header */}
                <div className="relative aspect-[16/10] overflow-hidden">
                  <img
                    src={pillar.image}
                    alt={pillar.title}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                  <div className={`absolute inset-0 ${theme === 'dark'
                    ? 'bg-gradient-to-t from-slate-900 via-slate-900/40 to-transparent'
                    : 'bg-gradient-to-t from-slate-950/80 via-transparent to-transparent'
                    }`} />
                  <div className="absolute top-4 left-4">
                    <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-amber-500 text-slate-950 shadow-md">
                      {pillar.category}
                    </span>
                  </div>
                  <div className="absolute bottom-3 left-4 text-xs font-black px-2 py-1 rounded-lg bg-black/60 text-white backdrop-blur-sm">
                    Pillar {pillar.stepNumber}
                  </div>
                </div>

                {/* Content */}
                <div className="p-6 space-y-3 flex-1 flex flex-col justify-between">
                  <div>
                    <h3 className={`text-lg font-bold group-hover:text-amber-500 transition-colors ${theme === 'dark' ? 'text-white' : 'text-slate-900'
                      }`}>
                      {pillar.title}
                    </h3>
                    <p className={`text-xs mt-2 leading-relaxed ${theme === 'dark' ? 'text-slate-300' : 'text-slate-600'
                      }`}>
                      {pillar.shortDesc}
                    </p>
                  </div>

                  <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs font-extrabold text-amber-500">
                    <span>Read Story & Perks</span>
                    <span className="group-hover:translate-x-1.5 transition-transform text-sm font-bold">→</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== CULTURE DETAILS MODAL ===== */}
      {selectedCultureModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-fadeIn">
          <div className={`w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-3xl border shadow-2xl relative ${theme === 'dark' ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-amber-200 text-slate-900'
            }`}>
            <button
              onClick={() => setSelectedCultureModal(null)}
              className="absolute top-5 right-5 w-9 h-9 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 flex items-center justify-center font-black text-sm z-10 hover:bg-amber-500 hover:text-slate-950 transition-colors cursor-pointer"
            >
              ✕
            </button>

            <div className="relative aspect-[16/9] w-full overflow-hidden">
              <img
                src={selectedCultureModal.image}
                alt={selectedCultureModal.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/40 to-transparent" />
              <div className="absolute bottom-6 left-6 right-6 text-white space-y-1" style={{ color: '#ffffff' }}>
                <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-amber-400 text-slate-950 inline-block mb-1 shadow-md">
                  {selectedCultureModal.category}
                </span>
                <h3 className="text-2xl sm:text-3xl font-black text-white drop-shadow-lg" style={{ color: '#ffffff' }}>
                  {selectedCultureModal.title}
                </h3>
              </div>
            </div>

            <div className="p-6 sm:p-8 space-y-6">
              <p className={`text-sm sm:text-base leading-relaxed ${theme === 'dark' ? 'text-slate-300' : 'text-slate-700'
                }`}>
                {selectedCultureModal.fullStory}
              </p>

              <div className="space-y-3">
                <h4 className="text-xs font-black uppercase tracking-wider text-amber-500">
                  Key Benefits & Teammate Advantages:
                </h4>
                <div className="grid sm:grid-cols-2 gap-3">
                  {selectedCultureModal.perks.map((perk: string) => (
                    <div
                      key={perk}
                      className={`p-3.5 rounded-2xl border text-xs font-bold flex items-start gap-2.5 ${theme === 'dark'
                        ? 'bg-slate-950/80 border-slate-800 text-slate-200'
                        : 'bg-amber-50/50 border-amber-200/80 text-slate-800'
                        }`}
                    >
                      <span className="text-emerald-500 font-extrabold text-sm shrink-0">✓</span>
                      <span className="leading-snug">{perk}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className={`p-5 rounded-2xl border italic text-xs leading-relaxed ${theme === 'dark' ? 'bg-slate-950/60 border-slate-800 text-amber-200/90' : 'bg-amber-50/40 border-amber-200 text-slate-800'
                }`}>
                <p>{selectedCultureModal.quote}</p>
                <p className="font-extrabold text-amber-600 dark:text-amber-400 not-italic mt-2">
                  — {selectedCultureModal.quoteAuthor}
                </p>
              </div>

              <div className="pt-2 flex items-center justify-end gap-3">
                <button
                  onClick={() => setSelectedCultureModal(null)}
                  className={`px-5 py-2.5 rounded-xl text-xs font-bold border transition-colors ${theme === 'dark'
                    ? 'border-slate-700 text-slate-300 hover:bg-slate-800'
                    : 'border-slate-200 text-slate-700 hover:bg-slate-100'
                    }`}
                >
                  Close
                </button>
                <Link
                  to="/open-positions"
                  className="px-6 py-2.5 rounded-xl text-xs font-black text-slate-950 bg-gradient-to-r from-amber-400 via-amber-500 to-orange-500 hover:from-amber-300 hover:to-orange-400 shadow-md uppercase tracking-wider"
                >
                  Explore Related Roles →
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ===== 7. FOOTER ===== */}
      <Footer isPublic={true} />

    </div>
  );
};

export default Careers;
