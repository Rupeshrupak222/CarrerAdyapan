import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import CandidateNavbar from '../components/layout/CandidateNavbar';
import Footer from '../components/layout/Footer';
import { useTheme } from '../context/ThemeContext';
import { useCandidateAuth } from '../context/CandidateAuthContext';

const LEADERSHIP_TEAM = [
  {
    name: 'SAI CHARAN',
    role: 'Founder',
    quote: '"Upskilling isn\'t optional anymore. Adyapan ensures every student learns with purpose, practices with mentors, and grows with confidence."',
    image: '/team/sai-charan.avif',
    linkedin: 'https://www.linkedin.com/in/saii-m-871712171/',
    twitter: 'https://twitter.com/adyapan',
  },
  {
    name: 'NIRANJAN REDDY',
    role: 'Co- Founder',
    quote: '"The world is full of opportunities, but students need the right direction. Adyapan helps them access global careers without feeling lost."',
    image: '/team/niranjan-reddy.avif',
    linkedin: 'https://www.linkedin.com/in/niranjan-reddy-abb1861b6/',
    twitter: 'https://twitter.com/adyapan',
  },
  {
    name: 'MONIKA Y',
    role: 'Core Team & Operations Lead',
    quote: '"The cross-functional collaboration and daily innovation make every day at Adyapan an opportunity to level up your career."',
    image: '/team/monika-y.avif',
    linkedin: 'https://www.linkedin.com/company/adyapan-edutech-pvt-ltd',
    twitter: 'https://twitter.com/adyapan',
  },
];

const OFFICE_LOCATIONS = [
  {
    title: 'Headquarters & Executive Hub',
    building: 'Sattva Magnus',
    address: 'Sabza Colony, Toli Chowki, Hyderabad, Telangana 500008',
    mapQuery: 'ADYAPAN+EDUTECH+PRIVATE+LIMITED+Shaikpet+Hyderabad+Telangana',
    badge: 'HQ',
  },
  {
    title: 'Growth & Business Development Hub',
    building: 'Cluster Malkajgiri 82',
    address: 'X Road, Khajaguda - Nanakramguda Rd, Radhe Nagar, Rai Durg, Hyderabad 500104',
    mapQuery: 'ADYAPAN+EDUTECH+PRIVATE+LIMITED+Khajaguda+Rai+Durg+Hyderabad+500104',
    badge: 'Sales',
  },
  {
    title: 'Technology & AI Innovation Center',
    building: 'IndiQube Pearl',
    address: 'Mindspace Rd, Gachibowli, Hyderabad, Telangana 500032',
    mapQuery: 'ADYAPAN+EDUTECH+PRIVATE+LIMITED+Gachibowli+Hyderabad',
    badge: 'Tech',
  },
];

const CAREER_GROWTH_FRAMEWORK = [
  {
    step: '01',
    title: 'Onboard & Mentor',
    tag: 'Days 1 - 30',
    desc: 'Structured 1-on-1 mentorship with senior leaders, clear KPI roadmaps, and immediate immersion into live projects.',
  },
  {
    step: '02',
    title: 'Build & Execute',
    tag: 'Months 1 - 6',
    desc: 'Own mission-critical pods across sales, technology, or operations with high autonomy and real-time performance feedback.',
  },
  {
    step: '03',
    title: 'Lead & Innovate',
    tag: 'Months 6 - 12',
    desc: 'Lead strategic initiatives, mentor incoming team members, and implement game-changing ideas directly with leadership.',
  },
  {
    step: '04',
    title: 'Advance & Thrive',
    tag: 'Year 1 & Beyond',
    desc: 'Rapid bi-annual appraisal cycles, merit-based leadership promotions, and performance-based incentive bonuses.',
  },
];

const WHY_WORK_AT_ADYAPAN = [
  {
    number: '01',
    title: 'Fast-Track Career Velocity',
    desc: 'Transparent 6-month appraisal cycles, rapid merit promotions, and tailored leadership progression roadmaps.',
  },
  {
    number: '02',
    title: 'AI & Next-Gen Tech Stacks',
    desc: 'Work on automated ATS candidate scoring, predictive AI screening engines, and high-scale full-stack cloud architecture.',
  },
  {
    number: '03',
    title: 'Uncapped Lucrative Rewards',
    desc: 'Industry-leading base pay, aggressive weekly/monthly sales incentives, annual performance bonuses, and President’s Club trips.',
  },
  {
    number: '04',
    title: 'Zero Bureaucracy Culture',
    desc: 'Direct open-door executive collaboration, vibrant festival galas, offsite retreats, and inclusive, energetic team pods.',
  },
  {
    number: '05',
    title: 'Flexible Hybrid & Wellness',
    desc: 'Modern work policies with hybrid options, mental wellness days, family health coverage, and ergonomic perks.',
  },
  {
    number: '06',
    title: 'Direct National Impact',
    desc: 'Directly empower 50,000+ students and job seekers across 28 Indian states to break barriers and launch dream careers.',
  },
];

const AboutUs = () => {
  const { theme, toggleTheme } = useTheme();
  const { candidate, logout } = useCandidateAuth();
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);

  return (
    <div className={`min-h-screen font-sans antialiased transition-colors relative overflow-x-hidden ${theme === 'dark'
        ? 'bg-gradient-to-l from-amber-950/40 via-amber-950/15 via-30% to-[#0a0a1a] text-white'
        : 'bg-gradient-to-l from-orange-300/40 via-amber-100/30 via-40% to-white text-slate-900'
      }`}>

      {/* Persistent Full-Page Right-to-Left Orange Gradient Glow */}
      <div className="fixed top-0 right-0 w-[60vw] max-w-[900px] h-full pointer-events-none bg-gradient-to-l from-orange-400/20 via-amber-200/10 via-45% to-transparent dark:from-amber-500/10 dark:via-amber-900/5 dark:to-transparent blur-3xl z-0" />

      {/* ===== 1. MAIN NAV ===== */}
      <CandidateNavbar activePage="about" />

      {/* ===== 2. HERO GRADIENT BANNER ===== */}
      <section className="relative overflow-hidden bg-gradient-to-r from-[#18181b] via-[#78350f] via-55% to-[#d97706] text-white py-16 sm:py-24 px-4 sm:px-8 border-b border-amber-500/30 shadow-2xl">
        <div className="absolute -top-24 right-0 w-[550px] h-[550px] bg-amber-400/30 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] bg-orange-500/25 rounded-full blur-2xl pointer-events-none" />

        <div className="max-w-7xl mx-auto space-y-6 relative z-10">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-amber-400 text-slate-950 rounded-full text-[11px] font-black uppercase tracking-wider shadow-md">
            ● ABOUT ADYAPAN EDUTECH & CAREERS
          </div>

          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight text-white leading-tight max-w-4xl drop-shadow-sm">
            Empowering Careers. Accelerating India’s Future.
          </h1>

          <p className="text-base sm:text-lg text-white font-medium max-w-3xl leading-relaxed drop-shadow-sm">
            Adyapan Edutech is India’s premier talent enablement and recruitment engine. We build bridges between ambitious graduates, high-velocity corporate recruiters, and cutting-edge industry training.
          </p>

          <div className="flex flex-wrap items-center gap-4 pt-2">
            <Link
              to="/open-positions"
              className="px-7 py-3.5 rounded-full text-xs font-black text-slate-950 bg-gradient-to-r from-amber-400 via-amber-300 to-amber-500 hover:from-white hover:to-amber-200 transition-all shadow-xl shadow-amber-950/40 uppercase tracking-wider"
            >
              Explore Open Positions →
            </Link>
            <a
              href="#culture"
              className="px-7 py-3.5 rounded-full text-xs font-bold text-white bg-black/40 hover:bg-black/60 border border-white/20 backdrop-blur-sm transition-all"
            >
              Life & Culture at Adyapan
            </a>
          </div>
        </div>
      </section>

      {/* ===== 3. IMPACT NUMBERS ===== */}
      <section className="relative z-10 -mt-8 max-w-7xl mx-auto px-4 sm:px-8">
        <div className={`grid grid-cols-2 md:grid-cols-4 gap-4 p-6 sm:p-8 rounded-3xl border shadow-2xl backdrop-blur-xl ${theme === 'dark' ? 'bg-slate-900/95 border-slate-800' : 'bg-white border-amber-200/80 shadow-amber-500/10'
          }`}>
          {[
            { label: 'Learners & Candidates Trained', value: '50,000+', desc: 'Across 28 Indian States' },
            { label: 'Corporate Hiring Partners', value: '300+', desc: 'Top Tech & EdTech Brands' },
            { label: 'Candidate Placement Rate', value: '94%', desc: 'Verified Hiring Funnel' },
            { label: 'Certified Industry Courses', value: '65+', desc: 'NSDC & ISO Accredited' },
          ].map((stat) => (
            <div key={stat.label} className="text-center p-3 space-y-1">
              <p className="text-2xl sm:text-4xl font-black text-amber-500 tracking-tight">
                {stat.value}
              </p>
              <p className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white">
                {stat.label}
              </p>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                {stat.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* ===== 4. CORE PRINCIPLES (Clean Minimalist Cards) ===== */}
      <section id="culture" className="max-w-7xl mx-auto px-4 sm:px-8 py-16 sm:py-24 space-y-12">
        <div className="space-y-4 text-center max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-amber-500/15 text-amber-700 dark:text-amber-300 border border-amber-500/30 rounded-full text-[11px] font-extrabold uppercase">
            OUR WORKPLACE DNA
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 dark:text-white">
            Three Principles That Guide How We Work
          </h2>
          <p className={`text-sm sm:text-base ${theme === 'dark' ? 'text-slate-400' : 'text-slate-600'}`}>
            The core values that shape our day-to-day collaboration, decision-making, and growth mindset.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            {
              number: '01',
              title: 'High Autonomy & Ownership',
              desc: 'We trust our team members to lead with conviction. You will own outcomes, make real decisions, and see the immediate impact of your work.',
            },
            {
              number: '02',
              title: 'Radical Mentorship & Collaboration',
              desc: 'Zero politics, zero silos. Senior founders and domain leads work shoulder-to-shoulder with you, actively coaching your skill acceleration.',
            },
            {
              number: '03',
              title: 'Speed, Execution & Merit',
              desc: 'Great ideas win regardless of title or tenure. We recognize high performance immediately with tangible rewards, promotions, and expanded scope.',
            },
          ].map((principle) => (
            <div
              key={principle.title}
              className={`p-8 rounded-3xl border transition-all flex flex-col justify-between gap-6 hover:-translate-y-1 ${theme === 'dark'
                  ? 'bg-slate-900/80 border-slate-800 hover:border-amber-500/60 shadow-xl'
                  : 'bg-white border-amber-200/60 hover:border-amber-400 hover:shadow-2xl shadow-sm'
                }`}
            >
              <div className="space-y-4">
                <div className="w-12 h-12 rounded-2xl bg-amber-500/15 text-amber-600 dark:text-amber-400 font-black text-sm flex items-center justify-center border border-amber-500/30 shadow-inner">
                  {principle.number}
                </div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                  {principle.title}
                </h3>
                <p className={`text-sm leading-relaxed ${theme === 'dark' ? 'text-slate-300' : 'text-slate-600'}`}>
                  {principle.desc}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ===== 5. THE 4-STEP CAREER ACCELERATION FRAMEWORK ===== */}
      <section className={`border-t py-16 sm:py-24 relative overflow-hidden ${theme === 'dark' ? 'border-slate-800 bg-[#0d0d20]' : 'border-slate-200/80 bg-white'
        }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-8 space-y-12">
          <div className="text-center space-y-3 max-w-2xl mx-auto">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-amber-500/15 text-amber-700 dark:text-amber-300 border border-amber-500/30 rounded-full text-[11px] font-extrabold uppercase">
              CAREER VELOCITY AT ADYAPAN
            </div>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 dark:text-white">
              Your Growth Roadmap With Us
            </h2>
            <p className={`text-sm sm:text-base ${theme === 'dark' ? 'text-slate-400' : 'text-slate-600'}`}>
              How joining Adyapan systematically accelerates your professional progression from Day 1.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {CAREER_GROWTH_FRAMEWORK.map((m) => (
              <div
                key={m.step}
                className={`p-6 sm:p-7 rounded-3xl border transition-all flex flex-col justify-between gap-6 hover:-translate-y-1 ${theme === 'dark'
                    ? 'bg-slate-900/70 border-slate-800 hover:border-amber-500/60 shadow-lg'
                    : 'bg-slate-50 border-slate-200 hover:border-amber-400 hover:shadow-xl shadow-sm'
                  }`}
              >
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="w-10 h-10 rounded-2xl bg-amber-500 text-slate-950 font-black text-sm flex items-center justify-center shadow-md shadow-amber-500/20">
                      {m.step}
                    </span>
                    <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-amber-500/15 text-amber-700 dark:text-amber-300 border border-amber-500/30">
                      {m.tag}
                    </span>
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                      {m.title}
                    </h3>
                    <p className={`text-xs mt-2 leading-relaxed ${theme === 'dark' ? 'text-slate-300' : 'text-slate-600'}`}>
                      {m.desc}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== 6. LEADERSHIP & FOUNDER COMMITMENT ===== */}
      <section className={`border-t py-16 sm:py-24 relative overflow-hidden ${theme === 'dark' ? 'border-slate-800 bg-[#0a0a1a]' : 'border-slate-200/80 bg-slate-50/50'
        }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-8 space-y-14">
          <div className="text-center space-y-3 max-w-2xl mx-auto">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-amber-500/15 text-amber-700 dark:text-amber-300 border border-amber-500/30 rounded-full text-[11px] font-extrabold uppercase">
              LEADERSHIP & MENTORS
            </div>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 dark:text-white">
              Meet The Leaders You'll Build With
            </h2>
            <p className={`text-sm sm:text-base ${theme === 'dark' ? 'text-slate-400' : 'text-slate-600'}`}>
              Learn from and collaborate directly with leaders dedicated to your professional success.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {LEADERSHIP_TEAM.map((leader) => (
              <div
                key={leader.name}
                className={`rounded-3xl border p-7 sm:p-8 transition-all duration-300 flex flex-col justify-between group hover:-translate-y-2 text-left ${
                  theme === 'dark'
                    ? 'bg-slate-900/90 border-slate-800 hover:border-amber-500/60 hover:shadow-2xl hover:shadow-amber-500/10 shadow-xl'
                    : 'bg-white border-slate-200 hover:border-amber-400 hover:shadow-2xl hover:shadow-amber-500/15 shadow-sm'
                }`}
              >
                <div className="space-y-5">
                  {/* Circular Avatar with Amber Ring */}
                  <div className="relative w-32 h-32 sm:w-36 sm:h-36">
                    <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-amber-500 to-orange-500 blur-md opacity-30 group-hover:opacity-75 transition-opacity" />
                    <div className="relative w-full h-full rounded-full p-1 bg-gradient-to-tr from-amber-400 via-amber-500 to-orange-500 shadow-xl">
                      <div className="w-full h-full rounded-full overflow-hidden bg-slate-950">
                        <img
                          src={leader.image}
                          alt={leader.name}
                          className="w-full h-full object-cover object-center transition-transform duration-700 group-hover:scale-110"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Name & Role */}
                  <div className="space-y-1 pt-1">
                    <h3 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight uppercase">
                      {leader.name}
                    </h3>
                    <p className="text-sm sm:text-base font-bold text-amber-600 dark:text-amber-500">
                      {leader.role}
                    </p>
                  </div>

                  {/* Quote / Details */}
                  <p className={`text-xs sm:text-sm leading-relaxed ${theme === 'dark' ? 'text-slate-300' : 'text-slate-600'}`}>
                    {leader.quote}
                  </p>
                </div>

                {/* Social Icon Buttons */}
                <div className="flex items-center gap-3 pt-6 mt-4 border-t border-slate-100 dark:border-slate-800">
                  {/* LinkedIn */}
                  <a
                    href={leader.linkedin}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-9 h-9 rounded-full bg-amber-500/10 dark:bg-amber-950/70 border border-amber-500/30 text-amber-600 dark:text-amber-400 flex items-center justify-center hover:bg-amber-500 hover:text-slate-950 dark:hover:bg-amber-500 dark:hover:text-slate-950 transition-all hover:scale-110 shadow-sm cursor-pointer"
                    title={`${leader.name} LinkedIn`}
                  >
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
                    </svg>
                  </a>

                  {/* Twitter / Bird */}
                  <a
                    href={leader.twitter}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-9 h-9 rounded-full bg-amber-500/10 dark:bg-amber-950/70 border border-amber-500/30 text-amber-600 dark:text-amber-400 flex items-center justify-center hover:bg-amber-500 hover:text-slate-950 dark:hover:bg-amber-500 dark:hover:text-slate-950 transition-all hover:scale-110 shadow-sm cursor-pointer"
                    title={`${leader.name} Twitter`}
                  >
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.936 9.936 0 0024 4.59z" />
                    </svg>
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== 7. THE 6 PILLARS OF BUILDING YOUR CAREER AT ADYAPAN ===== */}
      <section className={`border-t py-16 sm:py-24 relative overflow-hidden ${theme === 'dark' ? 'border-slate-800 bg-[#0d0d20]' : 'border-slate-200/80 bg-white'
        }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-8 space-y-12">
          <div className="text-center space-y-3 max-w-2xl mx-auto">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-amber-500/15 text-amber-700 dark:text-amber-300 border border-amber-500/30 rounded-full text-[11px] font-extrabold uppercase">
              EMPLOYEE VALUE PROPOSITION
            </div>
            <h2 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white">
              Why High Performers Choose Adyapan
            </h2>
            <p className={`text-sm sm:text-base ${theme === 'dark' ? 'text-slate-400' : 'text-slate-600'}`}>
              The 6 concrete reasons ambitious talent builds their long-term careers with us.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {WHY_WORK_AT_ADYAPAN.map((pillar) => (
              <div
                key={pillar.title}
                className={`p-7 rounded-3xl border transition-all space-y-4 hover:-translate-y-1 ${theme === 'dark'
                    ? 'bg-slate-900/70 border-slate-800 hover:border-amber-500/60 shadow-lg'
                    : 'bg-slate-50 border-slate-200 hover:border-amber-400 hover:shadow-xl shadow-sm'
                  }`}
              >
                <div className="w-10 h-10 rounded-2xl bg-amber-500/15 text-amber-600 dark:text-amber-400 font-black text-xs flex items-center justify-center border border-amber-500/30 shadow-inner">
                  {pillar.number}
                </div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                  {pillar.title}
                </h3>
                <p className={`text-xs leading-relaxed ${theme === 'dark' ? 'text-slate-300' : 'text-slate-600'}`}>
                  {pillar.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== 8. OFFICE HUBS ===== */}
      <section className="max-w-7xl mx-auto px-4 sm:px-8 py-16 sm:py-24 space-y-12">
        <div className="text-center space-y-3 max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-amber-500/15 text-amber-700 dark:text-amber-300 border border-amber-500/30 rounded-full text-[11px] font-extrabold uppercase">
            CAMPUS & HUBS
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 dark:text-white">
            Our Workspaces Across Hyderabad
          </h2>
          <p className={`text-sm sm:text-base ${theme === 'dark' ? 'text-slate-400' : 'text-slate-600'}`}>
            Modern, collaborative infrastructure designed for creativity, high performance, and team connection.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {OFFICE_LOCATIONS.map((office) => (
            <div
              key={office.title}
              className={`p-8 rounded-3xl border transition-all flex flex-col justify-between gap-6 hover:-translate-y-1 ${theme === 'dark'
                  ? 'bg-slate-900/80 border-slate-800 hover:border-amber-500/60 shadow-xl'
                  : 'bg-white border-amber-200/80 hover:border-amber-400 hover:shadow-2xl shadow-sm'
                }`}
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase bg-amber-500/15 text-amber-700 dark:text-amber-300 border border-amber-500/30">
                    {office.badge}
                  </span>
                  <span className="text-xs text-slate-400 font-bold">Hyderabad</span>
                </div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                  {office.title}
                </h3>
                <p className="text-sm font-semibold text-amber-600 dark:text-amber-400">
                  {office.building}
                </p>
                <p className={`text-xs leading-relaxed ${theme === 'dark' ? 'text-slate-300' : 'text-slate-600'}`}>
                  {office.address}
                </p>
              </div>

              <a
                href={`https://www.google.com/maps/search/?api=1&query=${office.mapQuery}`}
                target="_blank"
                rel="noreferrer"
                className="w-full py-3 rounded-2xl text-xs font-black text-center border transition-all flex items-center justify-center gap-1.5 border-slate-200 dark:border-slate-800 hover:border-amber-500 hover:text-amber-500"
              >
                <span>Navigate on Google Maps</span>
                <span>↗</span>
              </a>
            </div>
          ))}
        </div>
      </section>

      {/* ===== 9. FOOTER ===== */}
      <Footer isPublic={true} />

    </div>
  );
};

export default AboutUs;
