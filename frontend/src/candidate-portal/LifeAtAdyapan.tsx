import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Sparkles,
  Users,
  UsersRound,
  Target,
  Coffee,
  Compass,
  ShieldCheck,
  Zap,
  Briefcase,
  MessageSquareQuote,
  CheckCircle2,
  Quote,
  Mail,
  Award,
  ArrowRight
} from 'lucide-react';
import SiteShell from '../components/layout/SiteShell';
import { useScrollReveal } from '../hooks/useScrollReveal';

import adyapanTeam from '../assets/adyapan-team.jpg';
import cultureTeamProfessional from '../assets/culture-team-professional.jpg';
import techTeam from '../assets/tech-team-hd-production.webp';
import nonTechTeam from '../assets/non-tech-team-hd-production.webp';
import managementTeam from '../assets/management-hr-team-hd-production.webp';
import adyapanOffice from '../assets/about-hero-office-reference.jpg';
import lifeCultureAiFeature from '../assets/life-culture-ai-feature.jpg';
import lifeCultureAiIllustration from '../assets/life-culture-ai-illustration.jpg';

const LifeAtAdyapan: React.FC = () => {
  useScrollReveal();
  const [activeDept, setActiveDept] = useState<'tech' | 'growth' | 'management'>('tech');

  const photos = [
    {
      src: '/team.avif',
      alt: 'Adyapan team life',
      title: 'Collaboration & Culture',
    },
    {
      src: 'https://adyapan-website-storage.s3.ap-south-1.amazonaws.com/images/room-teaching.jpg',
      alt: 'Adyapan classroom',
      title: 'Interactive Workshops',
    },
    {
      src: '/cricket.jpg',
      alt: 'Adyapan cricket activity',
      title: 'Team Sports & Energy',
    },
    {
      src: '/party.jpeg',
      alt: 'Adyapan team celebration',
      title: 'Milestones & Celebrations',
    },
    {
      src: '/HR-team.jpeg',
      alt: 'Adyapan team gathering',
      title: 'People & Leadership',
    },
    {
      src: '/Founders.jpeg',
      alt: 'Adyapan founders',
      title: 'Visionary Mentorship',
    },
  ];

  const stats = [
    ['200+', 'People joined'],
    ['50+', 'Current company projects'],
    ['64+', 'Completed projects'],
    ['25+', 'Open roles'],
  ];

  const pillars = [
    {
      icon: <Sparkles size={28} className="text-orange-600 dark:text-orange-400" />,
      title: 'Innovation First',
      desc: 'We encourage bold experimentation, hackathons, and creative freedom to build next-generation educational technologies.'
    },
    {
      icon: <UsersRound size={28} className="text-blue-600 dark:text-blue-400" />,
      title: 'Radical Inclusivity',
      desc: 'Diverse minds solving complex hiring and learning challenges together across transparent, ego-free work environments.'
    },
    {
      icon: <Target size={28} className="text-purple-600 dark:text-purple-400" />,
      title: 'Ownership & Impact',
      desc: 'Every contributor owns their roadmap. Your code, strategy, and ideas directly impact learners and hiring partners worldwide.'
    },
    {
      icon: <Coffee size={28} className="text-amber-600 dark:text-amber-400" />,
      title: 'Work-Life Harmony',
      desc: 'Flexible work schedules, mental wellness support, fitness benefits, and periodic offsite team celebrations.'
    },
    {
      icon: <Compass size={28} className="text-emerald-600 dark:text-emerald-400" />,
      title: 'Continuous Mentorship',
      desc: 'Direct 1-on-1 coaching from industry veterans, leadership workshops, and full learning stipends.'
    },
    {
      icon: <ShieldCheck size={28} className="text-red-600 dark:text-red-400" />,
      title: 'Psychological Safety',
      desc: 'An open-door culture where every query is valued, mistakes are treated as learning steps, and transparency reigns.'
    }
  ];

  const dayTimeline = [
    { time: '09:30 AM', title: 'Daily Sync & Standup', desc: 'Agile pod alignments, roadmap checkpoints, and morning coffee chit-chats.' },
    { time: '11:00 AM', title: 'Deep Focus Sprint', desc: 'Uninterrupted focus time dedicated to high-impact coding, design, and content creation.' },
    { time: '01:00 PM', title: 'Community Lunch & Lounge', desc: 'Nutritious team lunches, indoor games, table tennis tournaments, and casual bonding.' },
    { time: '03:30 PM', title: 'Cross-Pod Synergy Session', desc: 'Engineering, Product, HR, and Operations teams coming together to brainstorm.' },
    { time: '05:30 PM', title: 'Showcases & Wins Wrap-Up', desc: 'Celebrating product launches, demo days, peer shoutouts, and setting up the next day.' }
  ];

  const perks = [
    { title: 'Competitive Salary & ESOPs', desc: 'Market-leading pay with equity opportunities for high impact.' },
    { title: 'Comprehensive Health Cover', desc: 'Holistic medical insurance covering you and your immediate family.' },
    { title: 'Skill Development Budget', desc: 'Annual allowance for courses, certifications, and conferences.' },
    { title: 'Hybrid & Modern Work Setup', desc: 'Ergonomic workstations, MacBooks, and flexible working arrangements.' },
    { title: 'Annual Retreats & Getaways', desc: 'Rejuvenating offsite trips, hackathon retreats, and cultural fests.' },
    { title: 'Wellness & Parental Leaves', desc: 'Generous wellness time-offs, paternity/maternity support, and sabbaticals.' }
  ];

  const testimonials = [
    {
      quote: "Joining Adyapan transformed my trajectory. You're given ownership from Day 1 and the support system is unmatched.",
      author: 'Senior Full Stack Engineer',
      team: 'Platform Pod',
      tenure: '2+ Years at Adyapan'
    },
    {
      quote: 'The transparency and positive energy are genuine. Every department works with a shared vision to impact thousands of learners.',
      author: 'Talent Acquisition Specialist',
      team: 'People & Culture Pod',
      tenure: '1.5 Years at Adyapan'
    },
    {
      quote: "We don't just build software; we build careers and opportunities. It's rewarding to see our daily work make real differences.",
      author: 'Product Growth Strategist',
      team: 'Operations & Partnerships',
      tenure: '2+ Years at Adyapan'
    }
  ];

  return (
    <SiteShell>
      <main className="life-page overflow-x-hidden bg-white dark:bg-[#0d0d0b] text-stone-900 dark:text-white transition-colors duration-300">
        
        {/* ══════════════════════════════════════════════════════════
            1. HERO SECTION (ORBIT ANIMATION & OFFICE BACKGROUND)
           ══════════════════════════════════════════════════════════ */}
        <section className="life-page-hero reveal" data-reveal>
          <div className="life-page-hero-office" aria-hidden="true">
            <img src={cultureTeamProfessional} alt="Adyapan Team Professional" />
          </div>
          <div className="life-page-hero-pattern" aria-hidden="true" />

          <div className="life-page-hero-inner max-w-[1380px] mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
            <div className="life-page-hero-copy">
              <span className="kicker">LIFE AT ADYAPAN</span>
              <h1>
                Work with purpose.
                <br />
                <em>Grow together.</em>
              </h1>
              <p>See the people, moments and experiences that make life at Adyapan different.</p>
            </div>
            <div className="life-page-hero-orbit" aria-hidden="true">
              <div className="life-page-hero-orbit-center">
                <img
                  src="/adyapan-logo.jpeg"
                  alt="Adyapan Logo"
                  className="w-full h-full object-cover scale-[1.18] rounded-full"
                />
              </div>
              <span />
              <span />
              <span />
            </div>
          </div>
        </section>

        {/* ══════════════════════════════════════════════════════════
            2. LIFE GALLERY SECTION (INSIDE ADYAPAN 6-PHOTO MOSAIC)
           ══════════════════════════════════════════════════════════ */}
        <section className="life-gallery-section py-20 sm:py-28 bg-[#fdfbf7] dark:bg-[#121110] border-b border-stone-200/70 dark:border-stone-800 transition-colors duration-300 reveal" data-reveal>
          <div className="max-w-[1380px] mx-auto px-4 sm:px-6 lg:px-8">
            <div className="life-gallery-heading mb-12 sm:mb-16">
              <div>
                <span className="kicker">INSIDE ADYAPAN</span>
                <h2>
                  Life is better
                  <br />
                  <em>together.</em>
                </h2>
              </div>
              <p>
                From focused learning and real projects to celebrations, games and everyday team moments — these are the
                people and experiences behind Adyapan.
              </p>
            </div>

            <div className="life-mosaic">
              {photos.map((photo, i) => (
                <div className={`life-mosaic-card life-mosaic-${i + 1}`} key={photo.src} data-reveal>
                  <img
                    src={photo.src}
                    alt={photo.alt}
                    loading={i > 1 ? 'lazy' : 'eager'}
                    decoding="async"
                    onError={(e) => {
                      if (i === 0) e.currentTarget.src = adyapanTeam;
                    }}
                  />
                  <span className="life-mosaic-number">0{i + 1}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ══════════════════════════════════════════════════════════
            3. LIFE STATS SECTION
           ══════════════════════════════════════════════════════════ */}
        <section className="life-stats py-16 sm:py-20 bg-[#f8f5ee] dark:bg-[#161512] border-b border-stone-200/70 dark:border-stone-800 transition-colors duration-300 reveal" data-reveal>
          <div className="max-w-[1380px] mx-auto px-4 sm:px-6 lg:px-8">
            <div className="life-stats-grid">
              {stats.map(([value, label]) => (
                <div className="life-stat bg-white dark:bg-[#1c1b18] border border-stone-200/80 dark:border-stone-800" key={label}>
                  <strong>{value}</strong>
                  <span>{label}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ══════════════════════════════════════════════════════════
            4. DEPARTMENT SHOWCASE WITH ANIMATED TABS
           ══════════════════════════════════════════════════════════ */}
        <section className="py-20 sm:py-28 bg-[#fdfbf7] dark:bg-[#121110] border-b border-stone-200/70 dark:border-stone-800 transition-colors duration-300 reveal" data-reveal>
          <div className="max-w-[1380px] mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-6 mb-12 sm:mb-14">
              <div>
                <span className="kicker">CROSS-FUNCTIONAL PODS</span>
                <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-stone-950 dark:text-white tracking-tight leading-tight mt-2">
                  Meet The Minds Behind <em>Adyapan</em>
                </h2>
              </div>
              <div className="flex items-center gap-2 bg-white dark:bg-[#1c1b18] border border-stone-200 dark:border-stone-800 p-1.5 rounded-2xl shadow-xs">
                {[
                  { id: 'tech', label: 'Tech & Product' },
                  { id: 'growth', label: 'Operations & Growth' },
                  { id: 'management', label: 'Management & HR' }
                ].map((tab) => (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setActiveDept(tab.id as any)}
                    className={`ady-tab-btn ${activeDept === tab.id ? 'active' : ''}`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="ady-glass-card p-6 sm:p-12 grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-14 items-center">
              <div>
                <span className="text-xs font-black uppercase tracking-wider text-orange-600 bg-orange-500/10 px-3.5 py-1.5 rounded-lg inline-block">
                  {activeDept === 'tech' ? 'Engineering & Innovation' : activeDept === 'growth' ? 'Student Success & Outreach' : 'People & Leadership'}
                </span>
                <h3 className="text-2xl sm:text-3xl font-black text-stone-950 dark:text-white tracking-tight mt-4 mb-3 leading-snug">
                  {activeDept === 'tech' && 'Architecting Cutting-Edge Educational & Hiring Tech'}
                  {activeDept === 'growth' && 'Expanding Horizons & Delivering Seamless Partnerships'}
                  {activeDept === 'management' && 'Nurturing Talent & Driving Transparent Leadership'}
                </h3>
                <p className="text-stone-600 dark:text-stone-300 text-sm sm:text-base leading-relaxed">
                  {activeDept === 'tech' && 'Our engineering and design teams work in high-speed agile squads, building resilient architectures, smart matching systems, and delightful student-recruiter interfaces.'}
                  {activeDept === 'growth' && 'From university connect programs to corporate relations, our business and operations pod bridges the gap between ambitious talent and top hiring organizations.'}
                  {activeDept === 'management' && 'Our people operations and executive leaders ensure every team member receives mentorship, career pathways, empathetic support, and growth avenues.'}
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 mt-8">
                  <div className="flex items-center gap-2.5 text-xs sm:text-sm font-bold text-stone-800 dark:text-stone-200">
                    <CheckCircle2 size={18} className="text-emerald-500 shrink-0" /> Agile 2-week sprints
                  </div>
                  <div className="flex items-center gap-2.5 text-xs sm:text-sm font-bold text-stone-800 dark:text-stone-200">
                    <CheckCircle2 size={18} className="text-emerald-500 shrink-0" /> Mentorship on demand
                  </div>
                  <div className="flex items-center gap-2.5 text-xs sm:text-sm font-bold text-stone-800 dark:text-stone-200">
                    <CheckCircle2 size={18} className="text-emerald-500 shrink-0" /> Regular demo sessions
                  </div>
                  <div className="flex items-center gap-2.5 text-xs sm:text-sm font-bold text-stone-800 dark:text-stone-200">
                    <CheckCircle2 size={18} className="text-emerald-500 shrink-0" /> Transparent culture
                  </div>
                </div>
              </div>
              <div className="rounded-3xl overflow-hidden h-[300px] sm:h-[380px] shadow-2xl border border-stone-200 dark:border-stone-800">
                <img
                  src={activeDept === 'tech' ? techTeam : activeDept === 'growth' ? nonTechTeam : managementTeam}
                  alt="Adyapan Pod"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          </div>
        </section>

        {/* ══════════════════════════════════════════════════════════
            5. FOUNDERS SECTION (OUR STORY: CRAFTING FUTURES)
           ══════════════════════════════════════════════════════════ */}
        <section className="py-20 sm:py-28 bg-[#fbf9f4] dark:bg-[#0d0d0b] text-stone-900 dark:text-white relative overflow-hidden border-b border-stone-200/80 dark:border-stone-800 transition-colors duration-300" id="founders">
          <div className="max-w-[1380px] mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="text-center max-w-3xl mx-auto mb-16 sm:mb-20" data-reveal="up">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-600 dark:text-amber-400 font-extrabold text-xs uppercase tracking-widest mb-4 shadow-sm">
                <Sparkles size={13} className="text-amber-500 dark:text-amber-400 fill-amber-500 dark:fill-amber-400" />
                <span>OUR STORY &amp; VISION</span>
              </div>
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-stone-950 dark:text-white tracking-tight leading-tight">
                Crafting Futures, <br className="hidden sm:inline" />
                <span className="text-amber-500 dark:text-amber-400">Not Just Careers.</span>
              </h2>
              <p className="text-stone-600 dark:text-stone-300 text-sm sm:text-base mt-4 font-medium leading-relaxed max-w-2xl mx-auto">
                At Adyapan, we are more than an education platform. We are the bridge between learning and professional launching.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-10 max-w-5xl mx-auto">
              {/* Founder 1: Sai Charan */}
              <div
                data-reveal="left"
                className="group relative rounded-3xl bg-white dark:bg-[#151412] border border-stone-200/90 dark:border-stone-800/90 hover:border-amber-500/60 dark:hover:border-amber-500/60 p-8 sm:p-9 flex flex-col justify-between shadow-xl shadow-stone-200/40 dark:shadow-2xl transition-all duration-500 hover:-translate-y-2 hover:shadow-amber-500/10"
              >
                <div className="space-y-5 relative z-10">
                  <div className="flex items-center gap-5">
                    <div className="relative shrink-0">
                      <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full p-1 bg-gradient-to-tr from-amber-500 via-orange-500 to-amber-300 shadow-xl shadow-amber-500/20 group-hover:scale-105 transition-transform duration-500">
                        <img
                          src="/team/sai-charan.avif"
                          alt="Sai Charan - Founder"
                          className="w-full h-full object-cover rounded-full"
                          onError={(e) => {
                            e.currentTarget.src = '/Founders.jpeg';
                          }}
                        />
                      </div>
                      <span className="absolute bottom-0 right-0 w-5 h-5 rounded-full bg-amber-500 text-stone-950 flex items-center justify-center font-black text-[11px] shadow-md">
                        ✓
                      </span>
                    </div>

                    <div>
                      <span className="inline-block text-amber-600 dark:text-amber-500 font-extrabold text-xs uppercase tracking-wider mb-0.5">
                        Founder
                      </span>
                      <h3 className="text-2xl sm:text-3xl font-black text-stone-950 dark:text-white tracking-tight">
                        Sai Charan
                      </h3>
                      <p className="text-xs font-semibold text-amber-600/90 dark:text-amber-400/90 mt-0.5">
                        Vision, Talent Transformation &amp; Strategic Growth
                      </p>
                    </div>
                  </div>

                  <div className="relative p-5 sm:p-6 rounded-2xl bg-amber-500/[0.04] dark:bg-black/50 border border-amber-500/15 dark:border-stone-800/80">
                    <Quote size={20} className="text-amber-500/30 dark:text-amber-500/40 absolute top-3.5 right-4" />
                    <p className="text-stone-700 dark:text-stone-300 text-xs sm:text-sm leading-relaxed font-medium italic">
                      "Upskilling isn't optional anymore. Adyapan ensures every student learns with purpose, practices with mentors, and grows with confidence."
                    </p>
                  </div>

                  <p className="text-xs sm:text-sm text-stone-600 dark:text-stone-300 leading-relaxed font-normal">
                    Spearheading Adyapan's core mission to democratize industry-ready tech learning, cultivate visionary mentorship, and architect career-launching pathways for thousands of ambitious professionals nationwide.
                  </p>

                  <div className="flex flex-wrap gap-2 pt-1">
                    <span className="px-3 py-1 rounded-xl bg-stone-100 dark:bg-white/5 border border-stone-200 dark:border-white/10 text-[11px] font-semibold text-stone-700 dark:text-stone-300 flex items-center gap-1.5">
                      <Sparkles size={12} className="text-amber-500 shrink-0" />
                      <span>Industry-Led Upskilling</span>
                    </span>
                    <span className="px-3 py-1 rounded-xl bg-stone-100 dark:bg-white/5 border border-stone-200 dark:border-white/10 text-[11px] font-semibold text-stone-700 dark:text-stone-300 flex items-center gap-1.5">
                      <Users size={12} className="text-amber-500 shrink-0" />
                      <span>1-on-1 Mentorship</span>
                    </span>
                    <span className="px-3 py-1 rounded-xl bg-stone-100 dark:bg-white/5 border border-stone-200 dark:border-white/10 text-[11px] font-semibold text-stone-700 dark:text-stone-300 flex items-center gap-1.5">
                      <Award size={12} className="text-amber-500 shrink-0" />
                      <span>Ecosystem Growth</span>
                    </span>
                  </div>
                </div>

                <div className="pt-5 mt-5 border-t border-stone-200/80 dark:border-stone-800 flex items-center justify-between relative z-10">
                  <span className="text-xs text-stone-500 dark:text-stone-400 font-medium">
                    SR's Adyapan Edutech Pvt. Ltd.
                  </span>
                  <div className="flex items-center gap-2">
                    <a
                      href="https://www.linkedin.com/in/saii-m-871712171/"
                      target="_blank"
                      rel="noreferrer"
                      aria-label="Sai Charan LinkedIn"
                      className="w-9 h-9 rounded-xl bg-stone-100 dark:bg-[#201e1a] border border-stone-200 dark:border-stone-700/80 hover:border-amber-500 hover:bg-amber-500 hover:text-stone-950 text-amber-600 dark:text-amber-400 flex items-center justify-center transition-all duration-300 shadow-sm"
                    >
                      <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                        <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
                      </svg>
                    </a>
                    <a
                      href="mailto:support@adyapan.com?subject=Connect%20with%20Sai%20Charan"
                      aria-label="Email"
                      className="w-9 h-9 rounded-xl bg-stone-100 dark:bg-[#201e1a] border border-stone-200 dark:border-stone-700/80 hover:border-amber-500 hover:bg-amber-500 hover:text-stone-950 text-amber-600 dark:text-amber-400 flex items-center justify-center transition-all duration-300 shadow-sm"
                    >
                      <Mail size={15} />
                    </a>
                  </div>
                </div>
              </div>

              {/* Founder 2: Niranjan Reddy */}
              <div
                data-reveal="right"
                className="group relative rounded-3xl bg-white dark:bg-[#151412] border border-stone-200/90 dark:border-stone-800/90 hover:border-amber-500/60 dark:hover:border-amber-500/60 p-8 sm:p-9 flex flex-col justify-between shadow-xl shadow-stone-200/40 dark:shadow-2xl transition-all duration-500 hover:-translate-y-2 hover:shadow-amber-500/10"
              >
                <div className="space-y-5 relative z-10">
                  <div className="flex items-center gap-5">
                    <div className="relative shrink-0">
                      <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full p-1 bg-gradient-to-tr from-amber-500 via-orange-500 to-amber-300 shadow-xl shadow-amber-500/20 group-hover:scale-105 transition-transform duration-500">
                        <img
                          src="/team/niranjan-reddy.avif"
                          alt="Niranjan Reddy - Co-Founder"
                          className="w-full h-full object-cover rounded-full"
                          onError={(e) => {
                            e.currentTarget.src = '/Founders.jpeg';
                          }}
                        />
                      </div>
                      <span className="absolute bottom-0 right-0 w-5 h-5 rounded-full bg-amber-500 text-stone-950 flex items-center justify-center font-black text-[11px] shadow-md">
                        ✓
                      </span>
                    </div>

                    <div>
                      <span className="inline-block text-amber-600 dark:text-amber-500 font-extrabold text-xs uppercase tracking-wider mb-0.5">
                        Co- Founder
                      </span>
                      <h3 className="text-2xl sm:text-3xl font-black text-stone-950 dark:text-white tracking-tight">
                        Niranjan Reddy
                      </h3>
                      <p className="text-xs font-semibold text-amber-600/90 dark:text-amber-400/90 mt-0.5">
                        Global Operations, Corporate Placement &amp; Strategy
                      </p>
                    </div>
                  </div>

                  <div className="relative p-5 sm:p-6 rounded-2xl bg-amber-500/[0.04] dark:bg-black/50 border border-amber-500/15 dark:border-stone-800/80">
                    <Quote size={20} className="text-amber-500/30 dark:text-amber-500/40 absolute top-3.5 right-4" />
                    <p className="text-stone-700 dark:text-stone-300 text-xs sm:text-sm leading-relaxed font-medium italic">
                      "The world is full of opportunities, but students need the right direction. Adyapan helps them access global careers without feeling lost."
                    </p>
                  </div>

                  <p className="text-xs sm:text-sm text-stone-600 dark:text-stone-300 leading-relaxed font-normal">
                    Leading strategic corporate alliances, enterprise hiring partnerships, and student placement acceleration to build sustainable global career pathways for tech and non-tech talent.
                  </p>

                  <div className="flex flex-wrap gap-2 pt-1">
                    <span className="px-3 py-1 rounded-xl bg-stone-100 dark:bg-white/5 border border-stone-200 dark:border-white/10 text-[11px] font-semibold text-stone-700 dark:text-stone-300 flex items-center gap-1.5">
                      <Briefcase size={12} className="text-amber-500 shrink-0" />
                      <span>300+ Corporate Partners</span>
                    </span>
                    <span className="px-3 py-1 rounded-xl bg-stone-100 dark:bg-white/5 border border-stone-200 dark:border-white/10 text-[11px] font-semibold text-stone-700 dark:text-stone-300 flex items-center gap-1.5">
                      <Award size={12} className="text-amber-500 shrink-0" />
                      <span>Fast-Track Placement</span>
                    </span>
                    <span className="px-3 py-1 rounded-xl bg-stone-100 dark:bg-white/5 border border-stone-200 dark:border-white/10 text-[11px] font-semibold text-stone-700 dark:text-stone-300 flex items-center gap-1.5">
                      <Users size={12} className="text-amber-500 shrink-0" />
                      <span>Corporate Strategy</span>
                    </span>
                  </div>
                </div>

                <div className="pt-5 mt-5 border-t border-stone-200/80 dark:border-stone-800 flex items-center justify-between relative z-10">
                  <span className="text-xs text-stone-500 dark:text-stone-400 font-medium">
                    SR's Adyapan Edutech Pvt. Ltd.
                  </span>
                  <div className="flex items-center gap-2">
                    <a
                      href="https://www.linkedin.com/in/niranjan-reddy-abb1861b6/"
                      target="_blank"
                      rel="noreferrer"
                      aria-label="Niranjan Reddy LinkedIn"
                      className="w-9 h-9 rounded-xl bg-stone-100 dark:bg-[#201e1a] border border-stone-200 dark:border-stone-700/80 hover:border-amber-500 hover:bg-amber-500 hover:text-stone-950 text-amber-600 dark:text-amber-400 flex items-center justify-center transition-all duration-300 shadow-sm"
                    >
                      <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                        <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
                      </svg>
                    </a>
                    <a
                      href="mailto:support@adyapan.com?subject=Connect%20with%20Niranjan%20Reddy"
                      aria-label="Email"
                      className="w-9 h-9 rounded-xl bg-stone-100 dark:bg-[#201e1a] border border-stone-200 dark:border-stone-700/80 hover:border-amber-500 hover:bg-amber-500 hover:text-stone-950 text-amber-600 dark:text-amber-400 flex items-center justify-center transition-all duration-300 shadow-sm"
                    >
                      <Mail size={15} />
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ══════════════════════════════════════════════════════════
            6. GUIDING CULTURE PILLARS
           ══════════════════════════════════════════════════════════ */}
        <section className="py-20 sm:py-28 bg-[#fdfbf7] dark:bg-[#121110] border-b border-stone-200/70 dark:border-stone-800 transition-colors duration-300 reveal" data-reveal>
          <div className="max-w-[1380px] mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-2xl mx-auto mb-16" data-reveal="up">
              <span className="kicker">OUR GUIDING PRINCIPLES</span>
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-stone-950 dark:text-white tracking-tight leading-tight mt-2">
                How We Build, Support &amp; <em>Thrive</em>
              </h2>
              <p className="text-stone-600 dark:text-stone-300 text-sm sm:text-base mt-3 font-medium">
                Culture isn't just words on a poster; it's the daily standard we set to support each other's growth.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
              {pillars.map((pillar, idx) => (
                <div key={idx} className="ady-glass-card p-8 bg-white dark:bg-[#1c1b18] border border-stone-200 dark:border-stone-800 rounded-3xl" data-reveal>
                  <div className="w-14 h-14 rounded-2xl bg-orange-500/10 dark:bg-orange-500/15 flex items-center justify-center mb-6">
                    {pillar.icon}
                  </div>
                  <h3 className="text-xl font-bold text-stone-950 dark:text-white mb-2">{pillar.title}</h3>
                  <p className="text-stone-600 dark:text-stone-300 text-sm leading-relaxed">{pillar.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ══════════════════════════════════════════════════════════
            7. A TYPICAL DAY IN THE LIFE TIMELINE
           ══════════════════════════════════════════════════════════ */}
        <section className="py-20 sm:py-28 bg-[#f8f5ee] dark:bg-[#0e0d0b] border-b border-stone-200/70 dark:border-stone-800 transition-colors duration-300 reveal" data-reveal>
          <div className="max-w-[1380px] mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-2xl mx-auto mb-16" data-reveal="up">
              <span className="kicker">A TYPICAL DAY</span>
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-stone-950 dark:text-white tracking-tight leading-tight mt-2">
                How a Day Unfolds at <em>Adyapan</em>
              </h2>
              <p className="text-stone-600 dark:text-stone-300 text-sm sm:text-base mt-3 font-medium">
                Focused deep work, purposeful collaborative sprints, and genuine camaraderie from morning to wrap-up.
              </p>
            </div>

            <div className="ady-timeline-wrapper">
              {dayTimeline.map((item, idx) => (
                <div key={idx} className="ady-timeline-item" data-reveal>
                  <div className="ady-timeline-marker" />
                  <div className="ady-glass-card p-6 sm:p-8 bg-white dark:bg-[#1c1b18] border border-stone-200 dark:border-stone-800 rounded-3xl">
                    <div className="text-xs font-black text-orange-600 uppercase tracking-widest">{item.time}</div>
                    <h4 className="text-xl font-bold text-stone-950 dark:text-white mt-1 mb-2">{item.title}</h4>
                    <p className="text-stone-600 dark:text-stone-300 text-sm leading-relaxed">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ══════════════════════════════════════════════════════════
            8. PERKS & BENEFITS WITH WORKPLACE PHOTO
           ══════════════════════════════════════════════════════════ */}
        <section className="py-20 sm:py-28 bg-[#090d16] text-white border-b border-slate-800 transition-colors duration-300 reveal" data-reveal>
          <div className="max-w-[1380px] mx-auto px-4 sm:px-6 lg:px-8 perks-benefit-grid">
            <div className="perks-copy-pane">
              <span className="text-xs font-black uppercase tracking-wider text-orange-500 bg-orange-500/15 px-3.5 py-1.5 rounded-lg inline-block">
                PERKS &amp; BENEFITS
              </span>
              <h2 className="perks-heading">
                Designed to Support You in Every Dimension
              </h2>
              <p className="perks-lead">
                We take care of the essentials so you can focus on building, learning, and accelerating your career journey.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {perks.map((perk, idx) => (
                  <div key={idx} className="ady-perk-box">
                    <div className="flex items-center gap-2 font-bold text-sm text-slate-100">
                      <Zap size={18} className="text-orange-500 shrink-0" /> {perk.title}
                    </div>
                    <p className="text-xs text-slate-400 mt-2 leading-relaxed">{perk.desc}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="perks-image-pane">
              <img src={adyapanOffice} alt="Adyapan Modern Workplace" />
            </div>
          </div>
        </section>

        {/* ══════════════════════════════════════════════════════════
            9. VOICES FROM WITHIN (TESTIMONIALS)
           ══════════════════════════════════════════════════════════ */}
        <section className="py-20 sm:py-28 bg-[#fdfbf7] dark:bg-[#121110] border-b border-stone-200/70 dark:border-stone-800 transition-colors duration-300 reveal" data-reveal>
          <div className="max-w-[1380px] mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-2xl mx-auto mb-16" data-reveal="up">
              <span className="kicker">VOICES FROM WITHIN</span>
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-stone-950 dark:text-white tracking-tight leading-tight mt-2">
                Hear What Our <em>Teammates</em> Say
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {testimonials.map((t, idx) => (
                <div key={idx} className="ady-glass-card p-8 bg-white dark:bg-[#1c1b18] border border-stone-200 dark:border-stone-800 rounded-3xl flex flex-col justify-between" data-reveal>
                  <div>
                    <MessageSquareQuote size={36} className="text-orange-600 dark:text-orange-400 opacity-90 mb-5" />
                    <p className="italic text-sm sm:text-base text-stone-700 dark:text-stone-200 leading-relaxed">
                      "{t.quote}"
                    </p>
                  </div>
                  <div className="mt-8 pt-5 border-t border-stone-200/80 dark:border-stone-800">
                    <div className="font-extrabold text-sm text-stone-950 dark:text-white">{t.author}</div>
                    <div className="text-xs text-orange-600 font-bold mt-0.5">{t.team}</div>
                    <div className="text-[11px] text-stone-400 mt-0.5">{t.tenure}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ══════════════════════════════════════════════════════════
            10. CULTURE IN ACTION (WITH AI CULTURE SCENE)
           ══════════════════════════════════════════════════════════ */}
        <section className="py-20 sm:py-28 bg-[#f8f5ee] dark:bg-[#0e0d0b] border-b border-stone-200/70 dark:border-stone-800 transition-colors duration-300 reveal" data-reveal>
          <div className="max-w-[1380px] mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-2xl mx-auto mb-16" data-reveal="up">
              <span className="kicker">OUR CULTURE IN ACTION</span>
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-stone-950 dark:text-white tracking-tight leading-tight mt-2">
                Moments that <em>make Adyapan.</em>
              </h2>
              <p className="text-stone-600 dark:text-stone-300 text-sm sm:text-base mt-3 font-medium">
                Culture is built in the small things — asking questions, helping a teammate, celebrating a win and making space for everyone to grow.
              </p>
            </div>

            <div className="life-culture-grid">
              <article className="ady-glass-card p-8 bg-white dark:bg-[#1c1b18] border border-stone-200 dark:border-stone-800 rounded-3xl">
                <span className="life-culture-icon">✦</span>
                <h3 className="text-xl font-bold text-stone-950 dark:text-white">Be Curious</h3>
                <p className="text-stone-600 dark:text-stone-300 text-sm mt-2">Ask questions, explore ideas and keep learning.</p>
              </article>
              <article className="ady-glass-card p-8 bg-white dark:bg-[#1c1b18] border border-stone-200 dark:border-stone-800 rounded-3xl">
                <span className="life-culture-icon">↗</span>
                <h3 className="text-xl font-bold text-stone-950 dark:text-white">Collaborate</h3>
                <p className="text-stone-600 dark:text-stone-300 text-sm mt-2">Work together, share openly and celebrate each other.</p>
              </article>
              <article className="ady-glass-card p-8 bg-white dark:bg-[#1c1b18] border border-stone-200 dark:border-stone-800 rounded-3xl">
                <span className="life-culture-icon">●</span>
                <h3 className="text-xl font-bold text-stone-950 dark:text-white">Make Impact</h3>
                <p className="text-stone-600 dark:text-stone-300 text-sm mt-2">Focus on useful work that creates real-world change.</p>
              </article>
              <article className="ady-glass-card p-8 bg-white dark:bg-[#1c1b18] border border-stone-200 dark:border-stone-800 rounded-3xl">
                <span className="life-culture-icon">♥</span>
                <h3 className="text-xl font-bold text-stone-950 dark:text-white">Stay Kind</h3>
                <p className="text-stone-600 dark:text-stone-300 text-sm mt-2">Treat people with respect, empathy and gratitude.</p>
              </article>
            </div>

            <div className="life-added-feature">
              <div className="life-added-feature-copy">
                <span className="text-xs font-black uppercase tracking-wider text-orange-200 mb-2 block">
                  LIFE @ ADYAPAN
                </span>
                <h3>
                  More than a workplace.
                  <br />
                  It's a place to belong,
                  <br />
                  grow and make a difference.
                </h3>
                <Link to="/open-positions">
                  Explore Jobs <ArrowRight size={18} />
                </Link>
              </div>
              <div className="life-added-feature-image">
                <img src={lifeCultureAiFeature} alt="Adyapan culture scene" loading="lazy" />
              </div>
            </div>
          </div>
        </section>

        {/* ══════════════════════════════════════════════════════════
            11. CLOSING ILLUSTRATION & SHARED VALUES
           ══════════════════════════════════════════════════════════ */}
        <section className="py-20 sm:py-28 bg-[#fdfbf7] dark:bg-[#121110] border-b border-stone-200/70 dark:border-stone-800 transition-colors duration-300 reveal" data-reveal>
          <div className="max-w-[1380px] mx-auto px-4 sm:px-6 lg:px-8 life-added-closing-grid">
            <div className="life-added-closing-art">
              <img src={lifeCultureAiIllustration} alt="Teammates celebrating together" loading="lazy" />
            </div>
            <div className="life-added-closing-copy">
              <span className="kicker">A PLACE TO GROW</span>
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-stone-950 dark:text-white tracking-tight leading-tight mt-2 mb-4">
                Bring your ideas.
                <br />
                <em>Build something meaningful.</em>
              </h2>
              <p className="text-stone-600 dark:text-stone-300 text-sm sm:text-base leading-relaxed">
                At Adyapan, every idea has a voice and every person has the power to create impact. If you're curious, passionate and ready to grow — you'll feel right at home here.
              </p>
              <div className="life-closing-values">
                <div>
                  <strong>✦</strong>
                  <span><b>Learn</b>Continuously</span>
                </div>
                <div>
                  <strong>↗</strong>
                  <span><b>Take Ownership</b>Make it yours</span>
                </div>
                <div>
                  <strong>♥</strong>
                  <span><b>Grow Together</b>Make it count</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ══════════════════════════════════════════════════════════
            12. PULSE GLOW CTA BANNER
           ══════════════════════════════════════════════════════════ */}
        <section className="py-16 sm:py-24 bg-white dark:bg-[#0d0d0b] transition-colors duration-300 reveal" data-reveal>
          <div className="max-w-[1380px] mx-auto px-4 sm:px-6 lg:px-8">
            <div className="rounded-3xl p-10 sm:p-16 text-center text-white bg-gradient-to-r from-orange-600 via-amber-500 to-orange-500 shadow-2xl shadow-orange-500/30">
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight">
                Ready to Build the Future With Us?
              </h2>
              <p className="max-w-2xl mx-auto mt-4 mb-8 text-sm sm:text-base text-orange-100 leading-relaxed font-medium">
                We're continuously looking for talented minds across engineering, product, outreach, and talent development.
              </p>
              <Link
                to="/open-positions"
                className="inline-flex items-center gap-2 px-8 py-4 rounded-full bg-white text-orange-600 font-extrabold text-sm sm:text-base shadow-xl hover:bg-orange-50 hover:scale-105 transition-all duration-300"
              >
                <Briefcase size={20} /> View Open Positions
              </Link>
            </div>
          </div>
        </section>

      </main>
    </SiteShell>
  );
};

export default LifeAtAdyapan;
