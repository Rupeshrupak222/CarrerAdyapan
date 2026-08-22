import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  Award,
  BookOpen,
  Briefcase,
  BriefcaseBusiness,
  Building2,
  Calendar,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  Clock3,
  Compass,
  Flame,
  Globe2,
  GraduationCap,
  Heart,
  HelpCircle,
  IndianRupee,
  Laptop,
  Mail,
  MapPin,
  MessageSquare,
  Palmtree,
  PartyPopper,
  Phone,
  Quote,
  Rocket,
  Search,
  ShieldCheck,
  Smile,
  Sparkles,
  Star,
  Target,
  TrendingUp,
  Trophy,
  User,
  UsersRound,
  Zap,
} from 'lucide-react';
import logo from '../assets/adyapan-logo.png';
import SiteShell from '../components/layout/SiteShell';
import { useScrollReveal } from '../hooks/useScrollReveal';
import VideoReelCard from './components/VideoReelCard';

// Video URLs
export const WHY_JOIN_VIDEO_URL = '/why-join-video.mp4';
export const DREAM_JOB_VIDEO_URL = '/dream-job.mp4';

// ── LIVE ANIMATED COUNTER ──
const AnimatedCounter: React.FC<{
  end: number;
  suffix?: string;
  prefix?: string;
  duration?: number;
}> = ({ end, suffix = '', prefix = '', duration = 1800 }) => {
  const [count, setCount] = useState(0);
  const [hasStarted, setHasStarted] = useState(false);
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasStarted) {
          setHasStarted(true);
        }
      },
      { threshold: 0.1 }
    );

    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [hasStarted]);

  useEffect(() => {
    if (!hasStarted) return;
    let startTime: number | null = null;
    let animationFrameId: number;

    const updateCount = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      const easeOut = 1 - Math.pow(1 - progress, 3);
      setCount(easeOut * end);

      if (progress < 1) {
        animationFrameId = requestAnimationFrame(updateCount);
      } else {
        setCount(end);
      }
    };

    animationFrameId = requestAnimationFrame(updateCount);
    return () => cancelAnimationFrame(animationFrameId);
  }, [hasStarted, end, duration]);

  return (
    <span ref={ref}>
      {prefix}
      {Math.round(count).toLocaleString('en-IN')}
      {suffix}
    </span>
  );
};

// ── TESTIMONIALS DATA (REAL ADYAPAN EDUTECH WORKING REVIEWS) ──
const testimonials = [
  {
    featured: true,
    quote:
      "Started as an Inside Sales Specialist Intern with ₹18K stipend. Within 5 months, the direct mentorship from leadership and the transparent target culture helped me bag a full-time PPO of ₹10 LPA. If you are hungry to perform and grow fast in sales & edtech, Adyapan is the best launchpad.",
    name: 'Dinesh Kumar Sharma',
    role: 'Inside Sales Specialist (PPO Converted)',
    growth: 'Intern to Full-Time · ₹10 LPA',
    company: 'Adyapan Edutech Hyderabad Hub',
  },
  {
    featured: false,
    quote:
      'The work environment at the Hyderabad office is super supportive and energetic. Management genuinely values freshers, providing 1-on-1 counseling training with zero toxic pressure and high uncapped weekly incentives.',
    name: 'Ritesh',
    role: 'Senior Academic Counselor',
    growth: '₹45K+ Monthly Incentives',
  },
  {
    featured: false,
    quote:
      'Hands-on learning with direct access to founders. Every target achieved is celebrated with Friday team games, cricket matches, and instant rewards. Best culture for anyone wanting fast corporate sales and leadership exposure.',
    name: 'Rishu',
    role: 'Business Development Specialist',
    growth: 'Top Performer Award',
  },
];

// ── FAQ DATA ──
const faqList = [
  {
    q: 'How do I apply for a career opportunity at Adyapan?',
    a: 'Simply click "Explore Opportunities", pick the role that matches your skills, and submit your resume. Our AI ATS instantly screens your profile and alerts our corporate recruitment team within minutes.',
  },
  {
    q: 'Can freshers and final-year college students apply?',
    a: 'Yes! We have dedicated fresher-friendly roles with structured hands-on training, flexible work shifts, and fast evaluation cycles designed for ambitious beginners.',
  },
  {
    q: 'What happens after I submit my application?',
    a: 'Our recruiting team reviews your ATS score within 24 to 48 hours. Shortlisted candidates receive a direct WhatsApp and Email invite for an interview round.',
  },
  {
    q: 'How do I track my application status in real time?',
    a: 'You can log into your Candidate Portal under "My Applications" anytime to see live status updates from Shortlisted, Interview Scheduled, to Offer Rollout.',
  },
  {
    q: 'What is the typical hiring and offer timeline?',
    a: 'Our entire process takes between 48 to 72 business hours from resume submission to formal offer letter rollout.',
  },
  {
    q: 'Are internships and flexible shifts available?',
    a: 'Yes, we offer both full-time positions and paid corporate internships with flexible morning/evening shift options.',
  },
  {
    q: 'Is there any registration or application fee?',
    a: 'No. Applying at Adyapan Career is 100% free of charge. We never charge candidates for job applications or interview rounds.',
  },
];

// ── PHOTO STORIES & WORKPLACE MEMORIES DATA ──
const PHOTO_STORIES = [
  {
    image: '/team.avif',
    title: 'Hyderabad Headquarters',
    tag: '🏆 Main Innovation Hub',
    desc: 'Our vibrant headquarters in Hyderabad housing 200+ engineers, counselors, and recruitment specialists driving next-gen hiring solutions.',
    stats: '200+ Team Members · Hyderabad Hub',
  },
  {
    image: '/Founders.jpeg',
    title: 'Leadership & Vision',
    tag: '✨ Executive Leadership',
    desc: 'Direct founder mentorship and accessible leadership where every team member is empowered to build, innovate, and make decisions.',
    stats: 'Zero Hierarchy · 1-on-1 Mentorship',
  },
  {
    image: '/HR-team.jpeg',
    title: 'People & Operations',
    tag: '🤝 HR & Culture Team',
    desc: 'A dedicated people-first operations squad ensuring rapid onboardings, vibrant work culture, weekly celebrations, and career growth.',
    stats: '48-72h Fast Onboarding · Happy Culture',
  },
];

const Careers: React.FC = () => {
  const [faqOpen, setFaqOpen] = useState<number | null>(0);
  const [activeJourneyStep, setActiveJourneyStep] = useState<number>(0);
  const [activePhoto, setActivePhoto] = useState<number>(0);

  // Initialize scroll reveal observer
  useScrollReveal();

  return (
    <SiteShell>
      <main className="overflow-x-hidden text-stone-900 dark:text-stone-100 selection:bg-amber-500 selection:text-white">

        {/* ══════════════════════════════════════════════════════════
            SECTION 01 — HERO (PROMINENT WORKPLACE BACKGROUND)
           ══════════════════════════════════════════════════════════ */}
        <section className="relative pt-10 pb-20 md:pt-16 md:pb-28 overflow-hidden bg-[#fdfbf7] dark:bg-[#141312] border-b border-stone-200/70 dark:border-stone-800">

          {/* Full-Cover Prominently Visible Background Image (Darker & High Contrast) */}
          <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden select-none">
            <img
              src="/hero-option-1-team.jpg"
              alt="Adyapan Workplace Atmosphere"
              className="w-full h-full object-cover object-center scale-100 opacity-85 dark:opacity-60 brightness-90 contrast-110"
            />
            {/* Dark contrast & soft readability overlays */}
            <div className="absolute inset-0 bg-black/15 dark:bg-black/50" />
            <div className="absolute inset-0 bg-gradient-to-r from-[#fdfbf7]/85 via-[#fdfbf7]/50 to-transparent dark:from-[#141312]/90 dark:via-[#141312]/60 dark:to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-b from-[#fdfbf7]/30 via-transparent to-[#fdfbf7]/90 dark:from-[#141312]/40 dark:via-transparent dark:to-[#141312]/90" />
          </div>

          {/* Ambient Glowing Orbs */}
          <div className="glow-orb top-[-100px] right-[-100px] w-[500px] h-[500px] bg-amber-500/20 dark:bg-amber-500/10 pointer-events-none" />
          <div className="glow-orb bottom-[-80px] left-[-80px] w-[420px] h-[420px] bg-orange-500/15 dark:bg-orange-500/5 pointer-events-none" />

          {/* Large Watermark Typography */}
          <div className="absolute right-4 top-1/3 watermark-text text-stone-900 dark:text-white pointer-events-none select-none opacity-20">
            CAREER
          </div>

          <div className="max-w-[1380px] mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">

              {/* Left Column (Approx 55%) */}
              <div data-reveal="left" className="lg:col-span-7 space-y-6">

                {/* Small uppercase animated badge */}
                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-900 dark:text-amber-300 font-black text-xs tracking-wider uppercase shadow-xs">
                  <Sparkles size={14} className="text-amber-600 dark:text-amber-400 fill-amber-500" />
                  <span>JOIN ADYAPAN · FAST-TRACK HIRING · EXPONENTIAL GROWTH</span>
                </div>

                {/* Very Large Editorial Heading */}
                <h1 className="text-5xl sm:text-6xl lg:text-7xl xl:text-[76px] font-black tracking-tight text-stone-950 dark:text-white leading-[1.05]">
                  Accelerate <br />
                  <span className="relative inline-block text-amber-600 dark:text-amber-400">
                    your career
                    <span className="absolute left-0 bottom-1.5 w-full h-3 bg-amber-500/20 -z-10 rounded-sm" />
                  </span> <br />
                  with Adyapan.
                </h1>

                {/* Supporting Copy - Dark & Crisp */}
                <p className="text-base sm:text-lg lg:text-xl text-stone-900 dark:text-stone-100 leading-relaxed max-w-2xl font-semibold">
                  Join a high-performing team of innovators, creators, and visionaries. Explore impactful roles, fast-track promotions, industry-leading incentives, and a transparent culture built to reward your talent.
                </p>

                {/* Action Buttons */}
                <div className="flex flex-wrap items-center gap-4 pt-2">
                  <Link
                    to="/open-positions"
                    className="group inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full font-extrabold text-sm sm:text-base text-white bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 hover:from-amber-600 hover:to-orange-600 shadow-lg shadow-amber-500/25 hover:shadow-xl hover:shadow-amber-500/35 hover:-translate-y-0.5 active:translate-y-0 transition-all duration-300"
                  >
                    <span>Explore Opportunities</span>
                    <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                  </Link>

                  <a
                    href="#why-join"
                    className="inline-flex items-center gap-1 px-4 py-3 font-extrabold text-sm sm:text-base text-stone-900 dark:text-stone-100 hover:text-amber-600 dark:hover:text-amber-400 transition-colors"
                  >
                    <span>Why Work Here</span>
                    <ChevronRight size={16} />
                  </a>
                </div>

                {/* Small Benefit Pills with Multi-Color Badges */}
                <div className="flex flex-wrap items-center gap-3 pt-4 border-t border-stone-300/80 dark:border-stone-800">
                  <div className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white dark:bg-stone-900 border border-amber-300/80 dark:border-amber-900/40 text-xs font-bold text-stone-900 dark:text-stone-100 shadow-sm hover:scale-105 transition-transform">
                    <span className="w-6 h-6 rounded-lg bg-amber-500/15 text-amber-600 flex items-center justify-center">
                      <Flame size={14} className="animate-pulse" />
                    </span>
                    <span>Fast 48h Interviews</span>
                  </div>

                  <div className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white dark:bg-stone-900 border border-purple-300/80 dark:border-purple-900/40 text-xs font-bold text-stone-900 dark:text-stone-100 shadow-sm hover:scale-105 transition-transform">
                    <span className="w-6 h-6 rounded-lg bg-purple-500/15 text-purple-600 flex items-center justify-center">
                      <Trophy size={14} />
                    </span>
                    <span>Uncapped Monthly Incentives</span>
                  </div>

                  <div className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white dark:bg-stone-900 border border-emerald-300/80 dark:border-emerald-900/40 text-xs font-bold text-stone-900 dark:text-stone-100 shadow-sm hover:scale-105 transition-transform">
                    <span className="w-6 h-6 rounded-lg bg-emerald-500/15 text-emerald-600 flex items-center justify-center">
                      <Clock3 size={14} />
                    </span>
                    <span>Flexible Shifts & Zero Pressure</span>
                  </div>
                </div>

              </div>

              {/* Right Column: Visual Composition + 3 Floating Overlapping Cards */}
              <div data-reveal="right" className="lg:col-span-5 relative flex justify-center">
                {/* Decorative background glow & frame */}
                <div className="absolute -inset-4 bg-gradient-to-tr from-amber-500/25 via-orange-500/15 to-transparent rounded-[2.5rem] transform rotate-2 blur-md -z-10" />

                {/* Main Portrait Workplace Image */}
                <div className="relative w-full max-w-md h-[380px] sm:h-[530px] rounded-3xl overflow-hidden shadow-2xl border-4 border-white dark:border-stone-800 bg-stone-900 group">
                  <img
                    src="/adyapan-team-fun.png"
                    alt="Adyapan Team in modern office"
                    className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent pointer-events-none" />

                  <div className="absolute bottom-5 left-5 right-5 text-white pointer-events-none">
                    <span className="inline-block px-2.5 py-1 rounded-md bg-amber-500/90 text-[10px] font-extrabold uppercase tracking-widest text-stone-950 mb-1">
                      Hyderabad Hub · Sattva Magnus
                    </span>
                    <h3 className="text-lg sm:text-xl font-black text-white">Work Hard. Win Together.</h3>
                  </div>
                </div>

                {/* 1. Top-Right Floating Card: Verified Jobs */}
                <div className="absolute -top-3 right-0 sm:-right-6 z-20 bg-white/95 dark:bg-stone-900/95 backdrop-blur-md border border-stone-200/80 dark:border-stone-800 p-2.5 sm:p-3.5 rounded-2xl shadow-xl animate-float flex items-center gap-2.5 sm:gap-3.5">
                  <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold flex-shrink-0 shadow-sm">
                    <CheckCircle2 size={18} />
                  </div>
                  <div>
                    <b className="text-xs sm:text-sm font-black text-stone-900 dark:text-white block">
                      Verified Jobs
                    </b>
                    <small className="text-[10px] sm:text-[11px] text-stone-500 dark:text-stone-400 font-semibold">Updated Daily</small>
                  </div>
                </div>

                {/* 2. Mid-Left Floating Card: 4.8/5 */}
                <div className="absolute top-1/2 left-0 sm:-left-8 -translate-y-1/2 z-20 bg-white/95 dark:bg-stone-900/95 backdrop-blur-md border border-stone-200 dark:border-stone-800 p-2.5 sm:p-3.5 rounded-2xl shadow-xl animate-float-delayed flex items-center gap-2.5 sm:gap-3.5">
                  <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-amber-500/15 text-amber-500 flex items-center justify-center font-bold flex-shrink-0">
                    <Star size={16} className="fill-amber-500 text-amber-500" />
                  </div>
                  <div>
                    <b className="text-xs sm:text-sm font-black text-stone-900 dark:text-white block">
                      4.8 / 5.0
                    </b>
                    <small className="text-[10px] sm:text-[11px] text-stone-500 dark:text-stone-400 font-semibold">Team Satisfaction</small>
                  </div>
                </div>

                {/* 3. Bottom-Right Floating Card: Fast Recruiter Reply */}
                <div className="absolute -bottom-4 right-0 sm:right-6 z-20 bg-white/95 dark:bg-stone-900/95 backdrop-blur-md border border-emerald-200 dark:border-emerald-800/40 p-2.5 sm:p-3.5 rounded-2xl shadow-xl animate-float flex items-center gap-2.5 sm:gap-3.5 bento-glow-emerald">
                  <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white flex items-center justify-center font-bold flex-shrink-0 shadow-md">
                    <Zap size={16} />
                  </div>
                  <div>
                    <b className="text-xs sm:text-sm font-black text-stone-900 dark:text-white block">
                      ⚡ 24 - 48 Hours
                    </b>
                    <small className="text-[10px] sm:text-[11px] text-stone-500 dark:text-stone-400 font-semibold">Fast Recruiter Reply</small>
                  </div>
                </div>

              </div>

            </div>
          </div>
        </section>

        {/* ══════════════════════════════════════════════════════════
            SECTION 02 — TRUST / STATS STRIP (FAST HIRING & FAST REPLY)
           ══════════════════════════════════════════════════════════ */}
        <section className="relative z-20 -mt-6 sm:-mt-8 px-4 sm:px-6 lg:px-8 max-w-[1380px] mx-auto">
          <div className="bg-white dark:bg-[#181715] rounded-3xl p-6 sm:p-8 border border-stone-200/80 dark:border-stone-800 shadow-2xl">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-0 lg:divide-x divide-stone-200/80 dark:divide-stone-800">

              {/* Stat 1: 24h Fast Recruiter Reply */}
              <div className="flex items-center gap-4 px-2 sm:px-6">
                <div className="w-12 h-12 rounded-2xl bg-amber-500/15 text-amber-600 dark:text-amber-400 flex items-center justify-center flex-shrink-0">
                  <Zap size={22} />
                </div>
                <div>
                  <b className="text-2xl sm:text-4xl font-black text-stone-900 dark:text-white block tracking-tight">
                    <AnimatedCounter end={24} suffix="h" />
                  </b>
                  <span className="text-xs text-stone-500 dark:text-stone-400 font-bold uppercase tracking-wider">
                    Fast Recruiter Reply
                  </span>
                </div>
              </div>

              {/* Stat 2: 48-72h Direct Interview */}
              <div className="flex items-center gap-4 px-2 sm:px-6">
                <div className="w-12 h-12 rounded-2xl bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 flex items-center justify-center flex-shrink-0">
                  <Flame size={22} />
                </div>
                <div>
                  <b className="text-2xl sm:text-4xl font-black text-stone-900 dark:text-white block tracking-tight">
                    <AnimatedCounter end={48} suffix="-72h" />
                  </b>
                  <span className="text-xs text-stone-500 dark:text-stone-400 font-bold uppercase tracking-wider">
                    Direct Interview Call
                  </span>
                </div>
              </div>

              {/* Stat 3: 100% Transparent CTC */}
              <div className="flex items-center gap-4 px-2 sm:px-6">
                <div className="w-12 h-12 rounded-2xl bg-purple-500/15 text-purple-600 dark:text-purple-400 flex items-center justify-center flex-shrink-0">
                  <ShieldCheck size={22} />
                </div>
                <div>
                  <b className="text-2xl sm:text-4xl font-black text-stone-900 dark:text-white block tracking-tight">
                    <AnimatedCounter end={100} suffix="%" />
                  </b>
                  <span className="text-xs text-stone-500 dark:text-stone-400 font-bold uppercase tracking-wider">
                    Transparent CTC
                  </span>
                </div>
              </div>

              {/* Stat 4: Zero Application Fee */}
              <div className="flex items-center gap-4 px-2 sm:px-6">
                <div className="w-12 h-12 rounded-2xl bg-sky-500/15 text-sky-600 dark:text-sky-400 flex items-center justify-center flex-shrink-0">
                  <IndianRupee size={22} />
                </div>
                <div>
                  <b className="text-2xl sm:text-4xl font-black text-stone-900 dark:text-white block tracking-tight">
                    ₹0 Fee
                  </b>
                  <span className="text-xs text-stone-500 dark:text-stone-400 font-bold uppercase tracking-wider">
                    Zero Application Fee
                  </span>
                </div>
              </div>

            </div>
          </div>
        </section>

        {/* ══════════════════════════════════════════════════════════
            SECTION 03 — LIFE AT ADYAPAN / CULTURE (LAYERED COLLAGE)
           ══════════════════════════════════════════════════════════ */}
        <section className="py-24 bg-[#f7f3ec] dark:bg-[#121110] border-b border-stone-200/60 dark:border-stone-800 relative pattern-dots-subtle" id="culture">
          {/* Watermark text */}
          <div className="absolute left-6 top-1/4 watermark-text text-stone-900 dark:text-white">
            CULTURE
          </div>

          <div className="max-w-[1380px] mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">

              {/* Left Column: Heading & Culture Story */}
              <div data-reveal="left" className="lg:col-span-5 space-y-7">
                <div className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/25 text-amber-700 dark:text-amber-400 font-extrabold text-xs sm:text-sm uppercase tracking-wider">
                  <Sparkles size={15} className="text-amber-500" />
                  <span>LIFE AT ADYAPAN · CULTURE</span>
                </div>

                <h2 className="text-4xl sm:text-5xl lg:text-7xl font-black text-stone-900 dark:text-white tracking-tight leading-[1.08]">
                  Come for the opportunity. <br />
                  <span className="text-amber-500">Stay for the people.</span>
                </h2>

                <p className="text-stone-600 dark:text-stone-300 text-base sm:text-lg leading-relaxed font-medium">
                  We believe great people build great companies. At Adyapan, your ideas are listened to, your individual growth is championed, and your happiness and mental wellbeing truly matter.
                </p>

                <div className="flex flex-wrap items-center gap-5 pt-3">
                  <Link
                    to="/life-at-adyapan"
                    className="inline-flex items-center gap-2.5 px-8 py-4 rounded-full text-sm sm:text-base font-black text-white bg-amber-500 hover:bg-amber-600 shadow-xl shadow-amber-500/25 hover:scale-105 transition-all"
                  >
                    <span>Explore Life at Adyapan</span>
                    <ArrowRight size={17} />
                  </Link>

                  <span className="text-sm font-black text-stone-600 dark:text-stone-300 flex items-center gap-1.5">
                    <span>✨</span>
                    <span>94% Retention Rate</span>
                  </span>
                </div>
              </div>

              {/* Right Column: Layered Photo Collage with Floating Stickers */}
              <div data-reveal="right" className="lg:col-span-7 relative">
                <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 h-auto sm:h-[440px]">

                  {/* Main Large Team Image */}
                  <div className="sm:col-span-7 relative rounded-3xl overflow-hidden shadow-2xl border-2 border-white dark:border-stone-800 bg-stone-900 group h-[280px] sm:h-[440px]">
                    <img
                      src="/adyapan-team-fun.png"
                      alt="Adyapan Full Team"
                      className="w-full h-full object-cover object-[center_70%] group-hover:scale-105 transition-transform duration-700"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none" />

                    <div className="absolute top-4 left-4 px-3.5 py-1.5 rounded-full bg-white/95 dark:bg-stone-900/95 backdrop-blur-md text-[11px] font-extrabold text-stone-900 dark:text-white shadow-md flex items-center gap-1.5">
                      <Heart size={13} className="text-rose-500 fill-rose-500" />
                      <span>Growing Together</span>
                    </div>

                    <div className="absolute bottom-4 left-4 right-4 text-white pointer-events-none">
                      <span className="text-xs font-black uppercase tracking-wider text-amber-400 block mb-0.5">
                        Adyapan Culture
                      </span>
                      <h4 className="text-base sm:text-2xl font-black text-white leading-tight">
                        Work Hard. Laugh Harder.
                      </h4>
                    </div>
                  </div>

                  {/* Two Stacked Photos on Right */}
                  <div className="sm:col-span-5 flex flex-col gap-4 h-auto sm:h-[440px] justify-between">
                    <div className="relative rounded-2xl overflow-hidden shadow-lg border-2 border-white dark:border-stone-800 bg-stone-900 group h-[180px] sm:h-[210px]">
                      <img
                        src="/Founders.jpeg"
                        alt="Adyapan Founders & Leadership"
                        className="w-full h-full object-cover object-[center_55%] group-hover:scale-105 transition-transform duration-700"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none" />
                      <span className="absolute bottom-3 left-3 px-3 py-1 rounded-lg bg-black/70 backdrop-blur-md text-[10px] font-bold text-amber-400">
                        ✨ Leadership & Vision
                      </span>
                    </div>

                    <div className="relative rounded-2xl overflow-hidden shadow-lg border-2 border-white dark:border-stone-800 bg-stone-900 group h-[180px] sm:h-[210px]">
                      <img
                        src="/cricket.jpg"
                        alt="Adyapan Sports & Team Spirit"
                        className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-700"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none" />
                      <span className="absolute bottom-3 left-3 px-3 py-1 rounded-lg bg-black/70 backdrop-blur-md text-[10px] font-bold text-amber-400">
                        🏏 Sports & Outings
                      </span>
                    </div>
                  </div>

                </div>
              </div>

            </div>

            {/* Bottom 4 Feature Cards with Distinct Colors */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mt-20 sm:mt-24">
              <div data-reveal="up" data-delay="100" className="interactive-card p-6 rounded-3xl bg-white dark:bg-stone-900 border border-amber-200/60 dark:border-stone-800 shadow-sm bento-glow-orange">
                <div className="w-12 h-12 rounded-2xl bg-amber-500/15 text-amber-600 dark:text-amber-400 flex items-center justify-center mb-4">
                  <UsersRound size={22} />
                </div>
                <h4 className="font-extrabold text-base text-stone-900 dark:text-white">Young & Passionate Team</h4>
                <p className="text-xs text-stone-500 dark:text-stone-400 mt-2 leading-relaxed font-medium">
                  Work alongside energetic and driven people who genuinely love what they build.
                </p>
              </div>

              <div data-reveal="up" data-delay="200" className="interactive-card p-6 rounded-3xl bg-white dark:bg-stone-900 border border-orange-200/60 dark:border-stone-800 shadow-sm">
                <div className="w-12 h-12 rounded-2xl bg-orange-500/15 text-orange-600 dark:text-orange-400 flex items-center justify-center mb-4">
                  <PartyPopper size={22} />
                </div>
                <h4 className="font-extrabold text-base text-stone-900 dark:text-white">Fun & Celebrations</h4>
                <p className="text-xs text-stone-500 dark:text-stone-400 mt-2 leading-relaxed font-medium">
                  From team outings and festive parties to pizza win bashes, we celebrate every milestone.
                </p>
              </div>

              <div data-reveal="up" data-delay="300" className="interactive-card p-6 rounded-3xl bg-white dark:bg-stone-900 border border-rose-200/60 dark:border-stone-800 shadow-sm">
                <div className="w-12 h-12 rounded-2xl bg-rose-500/15 text-rose-600 dark:text-rose-400 flex items-center justify-center mb-4">
                  <Heart size={22} />
                </div>
                <h4 className="font-extrabold text-base text-stone-900 dark:text-white">Work-Life Balance</h4>
                <p className="text-xs text-stone-500 dark:text-stone-400 mt-2 leading-relaxed font-medium">
                  Flexible environment that respects your personal time, mental health, and family life.
                </p>
              </div>

              <div data-reveal="up" data-delay="400" className="interactive-card p-6 rounded-3xl bg-white dark:bg-stone-900 border border-indigo-200/60 dark:border-stone-800 shadow-sm">
                <div className="w-12 h-12 rounded-2xl bg-indigo-500/15 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mb-4">
                  <Rocket size={22} />
                </div>
                <h4 className="font-extrabold text-base text-stone-900 dark:text-white">Learn & Grow Fast</h4>
                <p className="text-xs text-stone-500 dark:text-stone-400 mt-2 leading-relaxed font-medium">
                  Direct founder mentorship and rapid 6-month evaluation cycles for accelerated promotions.
                </p>
              </div>
            </div>

          </div>
        </section>

        {/* ══════════════════════════════════════════════════════════
            SECTION 04 — FUN DAY / TEAM CULTURE (HERO-LIKE IMMERSIVE)
           ══════════════════════════════════════════════════════════ */}
        <section className="py-20 bg-[#121110] text-white relative overflow-hidden" id="team-fun">
          {/* Ambient colorful neon blobs */}
          <div className="glow-orb top-0 left-1/4 w-[400px] h-[400px] bg-amber-500/10" />
          <div className="glow-orb bottom-0 right-1/4 w-[400px] h-[400px] bg-purple-500/10" />

          <div className="max-w-[1380px] mx-auto px-4 sm:px-6 lg:px-8 relative z-10">

            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12" data-reveal="up">
              <div>
                <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-400 font-extrabold text-xs uppercase tracking-wider mb-3">
                  <PartyPopper size={14} />
                  <span>FUN DAYS AT ADYAPAN · REAL MOMENTS</span>
                </div>
                <h2 className="text-3xl sm:text-4xl lg:text-6xl font-black text-white">
                  Work hard. <span className="text-amber-400">Laugh harder.</span> Win together.
                </h2>
              </div>
              <p className="text-stone-400 text-sm max-w-md">
                Life at Adyapan is a high-energy blend of passion, celebration, and purpose. We work like a team and celebrate like a family.
              </p>
            </div>

            {/* Asymmetric Rich Photo Gallery */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
              <div data-reveal="up" data-delay="100" className="interactive-card relative rounded-3xl overflow-hidden aspect-[4/3] bg-stone-900 group shadow-xl border border-stone-800">
                <img
                  src="/adyapan-team-fun.png"
                  alt="Friday Fun Games"
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent pointer-events-none" />
                <span className="absolute bottom-3 left-3 px-3 py-1 rounded-lg bg-black/70 backdrop-blur-md text-xs font-bold text-amber-400 uppercase tracking-wide">
                  🎉 Friday Games
                </span>
              </div>

              <div data-reveal="up" data-delay="200" className="interactive-card relative rounded-3xl overflow-hidden aspect-[4/3] bg-stone-900 group shadow-xl border border-stone-800">
                <img
                  src="/cricket.jpg"
                  alt="Adyapan Cricket Outing"
                  className="w-full h-full object-cover object-center group-hover:scale-110 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent pointer-events-none" />
                <span className="absolute bottom-3 left-3 px-3 py-1 rounded-lg bg-black/70 backdrop-blur-md text-xs font-bold text-amber-400 uppercase tracking-wide">
                  🏏 Cricket Matches
                </span>
              </div>

              <div data-reveal="up" data-delay="300" className="interactive-card relative rounded-3xl overflow-hidden aspect-[4/3] bg-stone-900 group shadow-xl border border-stone-800">
                <img
                  src="/party.jpeg"
                  alt="Adyapan Team Celebrations"
                  className="w-full h-full object-cover object-center group-hover:scale-110 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent pointer-events-none" />
                <span className="absolute bottom-3 left-3 px-3 py-1 rounded-lg bg-black/70 backdrop-blur-md text-xs font-bold text-amber-400 uppercase tracking-wide">
                  🏆 Win Celebration
                </span>
              </div>

              <div data-reveal="up" data-delay="400" className="interactive-card relative rounded-3xl overflow-hidden aspect-[4/3] bg-stone-900 group shadow-xl border border-stone-800">
                <img
                  src="/charanfoo.jpeg"
                  alt="Student Community & Team Bond"
                  className="w-full h-full object-cover object-center group-hover:scale-110 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent pointer-events-none" />
                <span className="absolute bottom-3 left-3 px-3 py-1 rounded-lg bg-black/70 backdrop-blur-md text-xs font-bold text-amber-400 uppercase tracking-wide">
                  🤝 Student Community
                </span>
              </div>
            </div>

          </div>
        </section>

        {/* ══════════════════════════════════════════════════════════
            SECTION 05 — CAREER GROWTH (TRUE BENTO GRID)
           ══════════════════════════════════════════════════════════ */}
        <section className="py-24 bg-[#faf6f0] dark:bg-[#141312] border-b border-stone-200/60 dark:border-stone-800 relative pattern-dots" id="growth">
          <div className="absolute right-8 top-1/4 watermark-text text-stone-900 dark:text-white">
            GROWTH
          </div>

          <div className="max-w-[1380px] mx-auto px-4 sm:px-6 lg:px-8 relative z-10">

            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-14">
              <div data-reveal="left">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/25 text-amber-700 dark:text-amber-400 font-extrabold text-xs uppercase tracking-wider mb-3">
                  <Rocket size={13} className="text-amber-500" />
                  <span>CAREER ACCELERATION</span>
                </div>
                <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-stone-900 dark:text-white leading-tight">
                  More than a job. <br />
                  <span className="text-amber-500">A place to grow.</span>
                </h2>
              </div>
              <p data-reveal="right" className="text-sm sm:text-base text-stone-600 dark:text-stone-300 max-w-md leading-relaxed font-medium">
                We design our career trajectories for maximum acceleration. Your speed of growth is determined solely by your impact, hunger, and execution.
              </p>
            </div>

            {/* Clean & Uniform Bento Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

              {/* Card 1: Fast-Track 6-Month Appraisals */}
              <div data-reveal="up" data-delay="100" className="interactive-card p-8 rounded-3xl bg-white dark:bg-stone-900 border border-amber-200/80 dark:border-stone-800 shadow-md bento-glow-orange flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <div className="w-12 h-12 rounded-2xl bg-amber-500/15 text-amber-600 dark:text-amber-400 flex items-center justify-center shadow-xs">
                      <Rocket size={24} />
                    </div>
                    <span className="px-2.5 py-1 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 text-[10px] font-black uppercase tracking-wider">
                      MERIT-DRIVEN GROWTH
                    </span>
                  </div>

                  <h3 className="text-xl font-black text-stone-900 dark:text-white">Fast-Track 6-Month Appraisals</h3>
                  <p className="text-stone-500 dark:text-stone-400 text-xs sm:text-sm mt-2 leading-relaxed">
                    At Adyapan, meritocracy drives everything. Every 2 quarters, performance is evaluated with transparent KPIs for immediate salary escalations, milestone bonuses, and promotions.
                  </p>

                  {/* Bullet Points */}
                  <div className="space-y-2.5 mt-5 pt-4 border-t border-stone-100 dark:border-stone-800">
                    <div className="flex items-start gap-2 text-xs font-bold text-stone-800 dark:text-stone-200">
                      <span className="text-amber-500 font-black">✦</span>
                      <span>100% Objective & Transparent KPI Metrics</span>
                    </div>
                    <div className="flex items-start gap-2 text-xs font-bold text-stone-800 dark:text-stone-200">
                      <span className="text-amber-500 font-black">✦</span>
                      <span>Direct 1-on-1 Quarterly Founder Alignment</span>
                    </div>
                    <div className="flex items-start gap-2 text-xs font-bold text-stone-800 dark:text-stone-200">
                      <span className="text-amber-500 font-black">✦</span>
                      <span>Avg. 14 Months Fast-Track to Leadership</span>
                    </div>
                    <div className="flex items-start gap-2 text-xs font-bold text-stone-800 dark:text-stone-200">
                      <span className="text-amber-500 font-black">✦</span>
                      <span>Up to 45% Annual CTC Hikes for Top Talent</span>
                    </div>
                  </div>
                </div>

                <div className="pt-6 mt-4 border-t border-stone-100 dark:border-stone-800 flex items-center justify-between">
                  <span className="text-xs font-extrabold text-amber-500">
                    6-Month Evaluation Cycles →
                  </span>
                  <span className="text-[11px] font-bold text-stone-400">Bi-Annual</span>
                </div>
              </div>

              {/* Card 2: Learning & Masterclasses */}
              <div data-reveal="up" data-delay="200" className="interactive-card p-8 rounded-3xl bg-white dark:bg-stone-900 border border-blue-200/80 dark:border-stone-800 shadow-md bento-glow-blue flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <div className="w-12 h-12 rounded-2xl bg-blue-500/15 text-blue-600 dark:text-blue-400 flex items-center justify-center shadow-xs">
                      <GraduationCap size={24} />
                    </div>
                    <span className="px-2.5 py-1 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400 text-[10px] font-black uppercase tracking-wider">
                      UPSKILLING
                    </span>
                  </div>

                  <h3 className="text-xl font-black text-stone-900 dark:text-white">Masterclasses & Mentorship</h3>
                  <p className="text-stone-500 dark:text-stone-400 text-xs sm:text-sm mt-2 leading-relaxed">
                    Gain exclusive access to high-impact executive communication workshops, AI ATS tooling coaching, and leadership masterclasses designed to accelerate your mastery.
                  </p>

                  {/* Bullet Points */}
                  <div className="space-y-2.5 mt-5 pt-4 border-t border-stone-100 dark:border-stone-800">
                    <div className="flex items-start gap-2 text-xs font-bold text-stone-800 dark:text-stone-200">
                      <span className="text-blue-500 font-black">✦</span>
                      <span>AI ATS Tooling & Automated Screening Pipelines</span>
                    </div>
                    <div className="flex items-start gap-2 text-xs font-bold text-stone-800 dark:text-stone-200">
                      <span className="text-blue-500 font-black">✦</span>
                      <span>Executive Client Pitching & Negotiation Training</span>
                    </div>
                    <div className="flex items-start gap-2 text-xs font-bold text-stone-800 dark:text-stone-200">
                      <span className="text-blue-500 font-black">✦</span>
                      <span>1-on-1 Weekly Coaching with Industry Directors</span>
                    </div>
                    <div className="flex items-start gap-2 text-xs font-bold text-stone-800 dark:text-stone-200">
                      <span className="text-blue-500 font-black">✦</span>
                      <span>100% Company-Sponsored Global Certifications</span>
                    </div>
                  </div>
                </div>

                <div className="pt-6 mt-4 border-t border-stone-100 dark:border-stone-800 flex items-center justify-between">
                  <span className="text-xs font-extrabold text-blue-500">
                    100% Free Professional Coaching →
                  </span>
                  <span className="text-[11px] font-bold text-stone-400">Weekly Sessions</span>
                </div>
              </div>

              {/* Card 3: Leadership Exposure */}
              <div data-reveal="up" data-delay="300" className="interactive-card p-8 rounded-3xl bg-white dark:bg-stone-900 border border-purple-200/80 dark:border-stone-800 shadow-md bento-glow-purple flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <div className="w-12 h-12 rounded-2xl bg-purple-500/15 text-purple-600 dark:text-purple-400 flex items-center justify-center shadow-xs">
                      <Building2 size={24} />
                    </div>
                    <span className="px-2.5 py-1 rounded-full bg-purple-500/10 text-purple-600 dark:text-purple-400 text-[10px] font-black uppercase tracking-wider">
                      C-SUITE ACCESS
                    </span>
                  </div>

                  <h3 className="text-xl font-black text-stone-900 dark:text-white">Leadership Shadowing</h3>
                  <p className="text-stone-500 dark:text-stone-400 text-xs sm:text-sm mt-2 leading-relaxed">
                    Work alongside seasoned founders and recruitment directors with zero bureaucratic barriers. Gain real-world insights into business scaling, client acquisition, and operations.
                  </p>

                  {/* Bullet Points */}
                  <div className="space-y-2.5 mt-5 pt-4 border-t border-stone-100 dark:border-stone-800">
                    <div className="flex items-start gap-2 text-xs font-bold text-stone-800 dark:text-stone-200">
                      <span className="text-purple-500 font-black">✦</span>
                      <span>Quarterly Executive Strategy & Planning Offsites</span>
                    </div>
                    <div className="flex items-start gap-2 text-xs font-bold text-stone-800 dark:text-stone-200">
                      <span className="text-purple-500 font-black">✦</span>
                      <span>Zero Hierarchical Barriers & Direct Slack Access</span>
                    </div>
                    <div className="flex items-start gap-2 text-xs font-bold text-stone-800 dark:text-stone-200">
                      <span className="text-purple-500 font-black">✦</span>
                      <span>Cross-Functional High-Impact Project Ownership</span>
                    </div>
                  </div>
                </div>

                <div className="pt-6 mt-4 border-t border-stone-100 dark:border-stone-800 flex items-center justify-between">
                  <span className="text-xs font-extrabold text-purple-500">
                    High-Impact Visibility & Growth →
                  </span>
                  <span className="text-[11px] font-bold text-stone-400">Direct Sync</span>
                </div>
              </div>

              {/* Card 4: Recognition & Cash Rewards */}
              <div data-reveal="up" data-delay="400" className="interactive-card p-8 rounded-3xl bg-white dark:bg-stone-900 border border-amber-200/80 dark:border-stone-800 shadow-md bento-glow-orange flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <div className="w-12 h-12 rounded-2xl bg-amber-500/15 text-amber-600 dark:text-amber-400 flex items-center justify-center shadow-xs">
                      <Trophy size={24} />
                    </div>
                    <span className="px-2.5 py-1 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 text-[10px] font-black uppercase tracking-wider">
                      SPOT CASH
                    </span>
                  </div>

                  <h3 className="text-xl font-black text-stone-900 dark:text-white">Weekly Spot Incentives</h3>
                  <p className="text-stone-500 dark:text-stone-400 text-xs sm:text-sm mt-2 leading-relaxed">
                    Hard work gets celebrated immediately. Enjoy transparent weekly performance incentives and milestone cash payouts on top of your fixed competitive salary.
                  </p>

                  {/* Bullet Points */}
                  <div className="space-y-2.5 mt-5 pt-4 border-t border-stone-100 dark:border-stone-800">
                    <div className="flex items-start gap-2 text-xs font-bold text-stone-800 dark:text-stone-200">
                      <span className="text-amber-500 font-black">✦</span>
                      <span>Friday Spot Bonuses: ₹5,000 to ₹25,000 Instant Rewards</span>
                    </div>
                    <div className="flex items-start gap-2 text-xs font-bold text-stone-800 dark:text-stone-200">
                      <span className="text-amber-500 font-black">✦</span>
                      <span>Monthly Performer Trophies & Recognition Spotlight</span>
                    </div>
                    <div className="flex items-start gap-2 text-xs font-bold text-stone-800 dark:text-stone-200">
                      <span className="text-amber-500 font-black">✦</span>
                      <span>Annual All-Expenses-Paid International Team Trips</span>
                    </div>
                  </div>
                </div>

                <div className="pt-6 mt-4 border-t border-stone-100 dark:border-stone-800 flex items-center justify-between">
                  <span className="text-xs font-extrabold text-amber-500">
                    Instant Payouts & Trophies →
                  </span>
                  <span className="text-[11px] font-bold text-stone-400">Paid Weekly</span>
                </div>
              </div>

              {/* Card 5: Team Pods & Culture */}
              <div data-reveal="up" data-delay="500" className="interactive-card p-8 rounded-3xl bg-white dark:bg-stone-900 border border-emerald-200/80 dark:border-stone-800 shadow-md bento-glow-emerald flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <div className="w-12 h-12 rounded-2xl bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shadow-xs">
                      <UsersRound size={24} />
                    </div>
                    <span className="px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[10px] font-black uppercase tracking-wider">
                      4.9/5 RATING
                    </span>
                  </div>

                  <h3 className="text-xl font-black text-stone-900 dark:text-white">Collaborative Squads</h3>
                  <p className="text-stone-500 dark:text-stone-400 text-xs sm:text-sm mt-2 leading-relaxed">
                    Work in empowered, agile pods where your voice matters. We foster a positive, supportive work environment with zero micromanagement and zero toxic stress.
                  </p>

                  {/* Bullet Points */}
                  <div className="space-y-2.5 mt-5 pt-4 border-t border-stone-100 dark:border-stone-800">
                    <div className="flex items-start gap-2 text-xs font-bold text-stone-800 dark:text-stone-200">
                      <span className="text-emerald-500 font-black">✦</span>
                      <span>No Micromanagement & Autonomous Ownership</span>
                    </div>
                    <div className="flex items-start gap-2 text-xs font-bold text-stone-800 dark:text-stone-200">
                      <span className="text-emerald-500 font-black">✦</span>
                      <span>Daily Fun Syncs, Snack Breaks & Team Games</span>
                    </div>
                    <div className="flex items-start gap-2 text-xs font-bold text-stone-800 dark:text-stone-200">
                      <span className="text-emerald-500 font-black">✦</span>
                      <span>Mental Wellbeing First & Comprehensive Health Benefits</span>
                    </div>
                  </div>
                </div>

                <div className="pt-6 mt-4 border-t border-stone-100 dark:border-stone-800 flex items-center justify-between">
                  <span className="text-xs font-extrabold text-emerald-500">
                    Zero Toxic Stress & Politics →
                  </span>
                  <span className="text-[11px] font-bold text-stone-400">Healthy Culture</span>
                </div>
              </div>

              {/* Card 6: Fast-Track Hiring & Direct Offers */}
              <div data-reveal="up" data-delay="600" className="interactive-card p-8 rounded-3xl bg-white dark:bg-stone-900 border border-teal-200/80 dark:border-stone-800 shadow-md bento-glow-emerald flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <div className="w-12 h-12 rounded-2xl bg-teal-500/15 text-teal-600 dark:text-teal-400 flex items-center justify-center shadow-xs">
                      <Zap size={24} />
                    </div>
                    <span className="px-2.5 py-1 rounded-full bg-teal-500/10 text-teal-600 dark:text-teal-400 text-[10px] font-black uppercase tracking-wider">
                      FAST-TRACK
                    </span>
                  </div>

                  <h3 className="text-xl font-black text-stone-900 dark:text-white">48-72h Direct Hiring Pipeline</h3>
                  <p className="text-stone-500 dark:text-stone-400 text-xs sm:text-sm mt-2 leading-relaxed">
                    Experience a transparent, frictionless recruitment process with direct hiring manager interviews, instant AI ATS reviews, and rapid offer letters.
                  </p>

                  {/* Bullet Points */}
                  <div className="space-y-2.5 mt-5 pt-4 border-t border-stone-100 dark:border-stone-800">
                    <div className="flex items-start gap-2 text-xs font-bold text-stone-800 dark:text-stone-200">
                      <span className="text-teal-500 font-black">✦</span>
                      <span>Instant AI Resume & ATS Match Scoring</span>
                    </div>
                    <div className="flex items-start gap-2 text-xs font-bold text-stone-800 dark:text-stone-200">
                      <span className="text-teal-500 font-black">✦</span>
                      <span>Direct Recruiter WhatsApp & Candidate Portal Sync</span>
                    </div>
                    <div className="flex items-start gap-2 text-xs font-bold text-stone-800 dark:text-stone-200">
                      <span className="text-teal-500 font-black">✦</span>
                      <span>24-Hour Interview Feedback & Next Round Routing</span>
                    </div>
                    <div className="flex items-start gap-2 text-xs font-bold text-stone-800 dark:text-stone-200">
                      <span className="text-teal-500 font-black">✦</span>
                      <span>Formal Offer Letter Rollout in 48 to 72 Hours</span>
                    </div>
                  </div>
                </div>

                <div className="pt-6 mt-4 border-t border-stone-100 dark:border-stone-800 flex items-center justify-between">
                  <span className="text-xs font-extrabold text-teal-500">
                    Express Hiring Route →
                  </span>
                  <span className="text-[11px] font-bold text-stone-400">48-72h Offer</span>
                </div>
              </div>

            </div>
          </div>
        </section>

        {/* ══════════════════════════════════════════════════════════
            SECTION 06 — FLEXIBLE WORKING (FREEDOM & WELLBEING)
           ══════════════════════════════════════════════════════════ */}
        <section className="py-24 bg-white dark:bg-[#181715] border-b border-stone-200/60 dark:border-stone-800 relative" id="why-join">
          <div className="max-w-[1380px] mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">

              {/* Left Column (7 cols) */}
              <div data-reveal="left" className="lg:col-span-7 space-y-6">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/25 text-amber-700 dark:text-amber-400 font-extrabold text-xs uppercase tracking-wider">
                  <Clock3 size={13} className="text-amber-500" />
                  <span>FREEDOM & WELLBEING</span>
                </div>

                <h2 className="text-3xl sm:text-4xl lg:text-6xl font-black text-stone-900 dark:text-white leading-tight">
                  Flexible Working Hours, <br />
                  <span className="text-amber-500">Zero Pressure Culture</span> <br />
                  & Uncapped Growth.
                </h2>

                <p className="text-stone-600 dark:text-stone-300 text-sm sm:text-base leading-relaxed font-medium">
                  Looking for a career with true respect and autonomy? At Adyapan, we offer flexible work shifts, strong base compensation with uncapped performance bonuses, and a supportive team environment where you can earn and thrive without toxic stress or micromanagement.
                </p>

                {/* 4 Feature Cards with Colored Icons */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                  <div className="interactive-card flex items-start gap-3.5 p-4 rounded-2xl bg-[#faf6f0] dark:bg-stone-900 border border-stone-200/80 dark:border-stone-800">
                    <div className="w-10 h-10 rounded-xl bg-amber-500/15 text-amber-600 flex items-center justify-center flex-shrink-0">
                      <Clock3 size={20} />
                    </div>
                    <div>
                      <h4 className="font-extrabold text-sm text-stone-900 dark:text-white">Flexible Work Shifts</h4>
                      <p className="text-xs text-stone-500 dark:text-stone-400 mt-0.5">Customize schedule around college or family.</p>
                    </div>
                  </div>

                  <div className="interactive-card flex items-start gap-3.5 p-4 rounded-2xl bg-[#faf6f0] dark:bg-stone-900 border border-stone-200/80 dark:border-stone-800">
                    <div className="w-10 h-10 rounded-xl bg-rose-500/15 text-rose-600 flex items-center justify-center flex-shrink-0">
                      <Heart size={20} />
                    </div>
                    <div>
                      <h4 className="font-extrabold text-sm text-stone-900 dark:text-white">Work-Life Balance</h4>
                      <p className="text-xs text-stone-500 dark:text-stone-400 mt-0.5">Zero toxic pressure or unrealistic burnout.</p>
                    </div>
                  </div>

                  <div className="interactive-card flex items-start gap-3.5 p-4 rounded-2xl bg-[#faf6f0] dark:bg-stone-900 border border-stone-200/80 dark:border-stone-800">
                    <div className="w-10 h-10 rounded-xl bg-blue-500/15 text-blue-600 flex items-center justify-center flex-shrink-0">
                      <GraduationCap size={20} />
                    </div>
                    <div>
                      <h4 className="font-extrabold text-sm text-stone-900 dark:text-white">Learning Environment</h4>
                      <p className="text-xs text-stone-500 dark:text-stone-400 mt-0.5">Fresher and student-friendly mentorship.</p>
                    </div>
                  </div>

                  <div className="interactive-card flex items-start gap-3.5 p-4 rounded-2xl bg-[#faf6f0] dark:bg-stone-900 border border-stone-200/80 dark:border-stone-800">
                    <div className="w-10 h-10 rounded-xl bg-emerald-500/15 text-emerald-600 flex items-center justify-center flex-shrink-0">
                      <Trophy size={20} />
                    </div>
                    <div>
                      <h4 className="font-extrabold text-sm text-stone-900 dark:text-white">Performance Culture</h4>
                      <p className="text-xs text-stone-500 dark:text-stone-400 mt-0.5">Weekly uncapped cash rewards for winners.</p>
                    </div>
                  </div>
                </div>

                <div className="pt-3">
                  <Link
                    to="/open-positions"
                    className="inline-flex items-center gap-2 px-8 py-4 rounded-full text-sm font-extrabold text-white bg-amber-500 hover:bg-amber-600 shadow-xl shadow-amber-500/25 hover:scale-105 transition-all"
                  >
                    <span>Join Adyapan Today</span>
                    <ArrowRight size={16} />
                  </Link>
                </div>
              </div>

              {/* Right: Vertical Video Reel Poster Card (5 cols) */}
              <div className="lg:col-span-5 flex justify-center">
                <VideoReelCard
                  videoSrc={WHY_JOIN_VIDEO_URL}
                  badgeText="WHY WORK AT ADYAPAN · CULTURE"
                  title="Flexible Shifts & Stress-Free Work"
                  subtitle="Flexible Timings · Zero Pressure · High Incentives · Hyderabad Hub"
                  accentBadge="FLEXIBLE & STRESS-FREE"
                  dataReveal="right"
                />
              </div>

            </div>
          </div>
        </section>

        {/* ══════════════════════════════════════════════════════════
            SECTION 07 — DREAM JOB / OPPORTUNITY ECOSYSTEM
           ══════════════════════════════════════════════════════════ */}
        <section className="py-24 bg-[#faf6f0] dark:bg-[#121110] border-b border-stone-200/60 dark:border-stone-800 relative" id="dream-job">
          <div className="absolute left-6 top-1/4 watermark-text text-stone-900 dark:text-white">
            OPPORTUNITY
          </div>

          <div className="max-w-[1380px] mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">

              {/* Left Column: Vertical Dream Job Reel (5 cols) */}
              <div className="lg:col-span-5 order-2 lg:order-1 flex justify-center">
                <VideoReelCard
                  videoSrc={DREAM_JOB_VIDEO_URL}
                  badgeText="DREAM JOB ROADMAP · DIRECT HIRING"
                  title="Land High-Paying Dream Careers"
                  subtitle="Instant AI ATS Matching · Verified Hiring · 48-72h Fast Track"
                  accentBadge="APPLY & GET HIRED"
                  dataReveal="left"
                />
              </div>

              {/* Right Column: Narrative & 2x2 Feature Grid (7 cols) */}
              <div data-reveal="right" className="lg:col-span-7 order-1 lg:order-2 space-y-6">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/25 text-amber-700 dark:text-amber-400 font-extrabold text-xs uppercase tracking-wider">
                  <Target size={13} className="text-amber-500" />
                  <span>YOUR CAREER · YOUR OPPORTUNITY</span>
                </div>

                <h2 className="text-3xl sm:text-4xl lg:text-6xl font-black text-stone-900 dark:text-white leading-tight">
                  Where ambitious talent <br />
                  <span className="text-amber-500">applies directly & lands</span> <br />
                  their dream job.
                </h2>

                <p className="text-stone-600 dark:text-stone-300 text-sm sm:text-base leading-relaxed font-medium">
                  Stop submitting applications into recruiter black holes with zero response. At Adyapan, we review your resume directly with fast ATS evaluation, direct recruiter routing, and 48 to 72-hour interview scheduling.
                </p>

                {/* 2x2 Feature Cards Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                  <div className="interactive-card p-5 rounded-2xl bg-white dark:bg-stone-900 border border-amber-200/70 dark:border-stone-800 shadow-sm flex items-start gap-3.5">
                    <div className="w-10 h-10 rounded-xl bg-amber-500/15 text-amber-600 flex items-center justify-center flex-shrink-0">
                      <BriefcaseBusiness size={20} />
                    </div>
                    <div>
                      <h4 className="font-extrabold text-sm text-stone-900 dark:text-white">Direct Opportunities</h4>
                      <p className="text-xs text-stone-500 dark:text-stone-400 mt-0.5">Verified fast-track corporate openings.</p>
                    </div>
                  </div>

                  <div className="interactive-card p-5 rounded-2xl bg-white dark:bg-stone-900 border border-emerald-200/70 dark:border-stone-800 shadow-sm flex items-start gap-3.5">
                    <div className="w-10 h-10 rounded-xl bg-emerald-500/15 text-emerald-600 flex items-center justify-center flex-shrink-0">
                      <ShieldCheck size={20} />
                    </div>
                    <div>
                      <h4 className="font-extrabold text-sm text-stone-900 dark:text-white">Verified Hiring</h4>
                      <p className="text-xs text-stone-500 dark:text-stone-400 mt-0.5">100% verified salary & CTC transparency.</p>
                    </div>
                  </div>

                  <div className="interactive-card p-5 rounded-2xl bg-white dark:bg-stone-900 border border-purple-200/70 dark:border-stone-800 shadow-sm flex items-start gap-3.5">
                    <div className="w-10 h-10 rounded-xl bg-purple-500/15 text-purple-600 flex items-center justify-center flex-shrink-0">
                      <Zap size={20} />
                    </div>
                    <div>
                      <h4 className="font-extrabold text-sm text-stone-900 dark:text-white">AI / ATS Screening</h4>
                      <p className="text-xs text-stone-500 dark:text-stone-400 mt-0.5">Instant resume matching within seconds.</p>
                    </div>
                  </div>

                  <div className="interactive-card p-5 rounded-2xl bg-white dark:bg-stone-900 border border-blue-200/70 dark:border-stone-800 shadow-sm flex items-start gap-3.5">
                    <div className="w-10 h-10 rounded-xl bg-blue-500/15 text-blue-600 flex items-center justify-center flex-shrink-0">
                      <UsersRound size={20} />
                    </div>
                    <div>
                      <h4 className="font-extrabold text-sm text-stone-900 dark:text-white">Career Support</h4>
                      <p className="text-xs text-stone-500 dark:text-stone-400 mt-0.5">1-on-1 recruiter interview coaching.</p>
                    </div>
                  </div>
                </div>

                <div className="pt-3">
                  <Link
                    to="/open-positions"
                    className="inline-flex items-center gap-2 px-6 py-3 rounded-full text-xs sm:text-sm font-extrabold text-white bg-amber-500 hover:bg-amber-600 shadow-lg shadow-amber-500/25 hover:scale-105 transition-all"
                  >
                    <span>Explore Opportunities</span>
                    <ArrowRight size={15} />
                  </Link>
                </div>
              </div>

            </div>
          </div>
        </section>

        {/* ══════════════════════════════════════════════════════════
            SECTION 08 — CAREER JOURNEY (INTERACTIVE ANIMATED TIMELINE)
           ══════════════════════════════════════════════════════════ */}
        <section className="py-24 bg-white dark:bg-[#181715] border-b border-stone-200/60 dark:border-stone-800 relative" id="hiring-process">
          <div className="absolute right-8 top-1/4 watermark-text text-stone-900 dark:text-white">
            JOURNEY
          </div>

          <div className="max-w-[1380px] mx-auto px-4 sm:px-6 lg:px-8 relative z-10">

            <div className="text-center max-w-2xl mx-auto mb-16">
              <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-amber-500/10 border border-amber-500/25 text-amber-700 dark:text-amber-400 font-extrabold text-xs uppercase tracking-wider mb-3">
                <Compass size={14} className="text-amber-500" />
                <span>STEP-BY-STEP HIRING ROADMAP</span>
              </div>
              <h2 className="text-3xl sm:text-4xl lg:text-6xl font-black text-stone-900 dark:text-white leading-tight">
                From learning <br />
                <span className="text-amber-500">to earning.</span>
              </h2>
              <p className="text-stone-500 dark:text-stone-400 text-sm mt-3 font-medium">
                We support you at every single step of your recruitment journey to ensure you land top offers.
              </p>
            </div>

            {/* 5-Step Process with Colored Nodes & Connected Line */}
            <div className="relative">
              {/* Connecting Line on Desktop */}
              <div className="hidden lg:block absolute top-12 left-[10%] right-[10%] h-1 bg-gradient-to-r from-amber-500 via-emerald-500 to-teal-500 rounded-full -z-0 opacity-40" />

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-8 relative z-10">

                {/* Step 01: Discover */}
                <div
                  className="flex flex-col items-center text-center p-6 rounded-3xl bg-[#faf6f0] dark:bg-stone-900 border border-stone-200/80 dark:border-stone-800 transition-all duration-300 hover:border-amber-500 hover:shadow-xl hover:bento-glow-orange hover:-translate-y-2 cursor-pointer group"
                >
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-amber-500 to-orange-500 text-white shadow-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    <Search size={26} />
                  </div>
                  <span className="text-xs font-black uppercase tracking-widest text-amber-500">STAGE 01</span>
                  <h4 className="font-black text-lg text-stone-900 dark:text-white mt-1">Discover</h4>
                  <p className="text-xs text-stone-500 dark:text-stone-400 mt-2 leading-relaxed font-medium">
                    Explore curated roles that match your passion, skills, and growth ambition.
                  </p>
                </div>

                {/* Step 02: Prepare */}
                <div
                  className="flex flex-col items-center text-center p-6 rounded-3xl bg-[#faf6f0] dark:bg-stone-900 border border-stone-200/80 dark:border-stone-800 transition-all duration-300 hover:border-emerald-500 hover:shadow-xl hover:bento-glow-emerald hover:-translate-y-2 cursor-pointer group"
                >
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-emerald-500 to-teal-500 text-white shadow-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    <BookOpen size={26} />
                  </div>
                  <span className="text-xs font-black uppercase tracking-widest text-emerald-500">STAGE 02</span>
                  <h4 className="font-black text-lg text-stone-900 dark:text-white mt-1">Prepare</h4>
                  <p className="text-xs text-stone-500 dark:text-stone-400 mt-2 leading-relaxed font-medium">
                    Hone your resume with our instant AI ATS evaluation and guidance.
                  </p>
                </div>

                {/* Step 03: Apply */}
                <div
                  className="flex flex-col items-center text-center p-6 rounded-3xl bg-[#faf6f0] dark:bg-stone-900 border border-stone-200/80 dark:border-stone-800 transition-all duration-300 hover:border-purple-500 hover:shadow-xl hover:bento-glow-purple hover:-translate-y-2 cursor-pointer group"
                >
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-purple-500 to-indigo-500 text-white shadow-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    <Laptop size={26} />
                  </div>
                  <span className="text-xs font-black uppercase tracking-widest text-purple-500">STAGE 03</span>
                  <h4 className="font-black text-lg text-stone-900 dark:text-white mt-1">Apply</h4>
                  <p className="text-xs text-stone-500 dark:text-stone-400 mt-2 leading-relaxed font-medium">
                    Submit in 1-click and get direct recruiter visibility within 24 hours.
                  </p>
                </div>

                {/* Step 04: Interview */}
                <div
                  className="flex flex-col items-center text-center p-6 rounded-3xl bg-[#faf6f0] dark:bg-stone-900 border border-stone-200/80 dark:border-stone-800 transition-all duration-300 hover:border-amber-500 hover:shadow-xl hover:bento-glow-orange hover:-translate-y-2 cursor-pointer group"
                >
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-amber-500 to-rose-500 text-white shadow-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    <MessageSquare size={26} />
                  </div>
                  <span className="text-xs font-black uppercase tracking-widest text-amber-500">STAGE 04</span>
                  <h4 className="font-black text-lg text-stone-900 dark:text-white mt-1">Interview</h4>
                  <p className="text-xs text-stone-500 dark:text-stone-400 mt-2 leading-relaxed font-medium">
                    Connect directly with friendly hiring teams and ace your interview rounds.
                  </p>
                </div>

                {/* Step 05: Get Hired */}
                <div
                  className="flex flex-col items-center text-center p-6 rounded-3xl bg-[#faf6f0] dark:bg-stone-900 border border-stone-200/80 dark:border-stone-800 transition-all duration-300 hover:border-teal-500 hover:shadow-xl hover:bento-glow-emerald hover:-translate-y-2 cursor-pointer group"
                >
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-teal-500 to-emerald-600 text-white shadow-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    <Trophy size={26} />
                  </div>
                  <span className="text-xs font-black uppercase tracking-widest text-teal-500">STAGE 05</span>
                  <h4 className="font-black text-lg text-stone-900 dark:text-white mt-1">Get Hired</h4>
                  <p className="text-xs text-stone-500 dark:text-stone-400 mt-2 leading-relaxed font-medium">
                    Receive formal offer rollout and start your high-growth career journey!
                  </p>
                </div>

              </div>
            </div>

          </div>
        </section>

        {/* ══════════════════════════════════════════════════════════
            SECTION 09 — REAL PEOPLE / TESTIMONIALS (EDITORIAL PHYSICAL CARDS)
           ══════════════════════════════════════════════════════════ */}
        <section className="py-24 bg-[#f5f0e6] dark:bg-[#141312] border-b border-stone-200/60 dark:border-stone-800 relative" id="stories">
          <div className="max-w-[1380px] mx-auto px-4 sm:px-6 lg:px-8">

            <div className="mb-14" data-reveal="left">
              <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-amber-500/10 border border-amber-500/25 text-amber-700 dark:text-amber-400 font-extrabold text-xs uppercase tracking-wider mb-3">
                <Quote size={13} className="text-amber-500" />
                <span>REAL PEOPLE · REAL CAREERS</span>
              </div>
              <h2 className="text-3xl sm:text-4xl lg:text-6xl font-black text-stone-900 dark:text-white">
                Real people. <br />
                <span className="text-amber-500">Real careers.</span>
              </h2>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">

              {/* 1 Large Featured Testimonial on Left (7 cols) */}
              <div data-reveal="left" className="lg:col-span-7 interactive-card p-8 sm:p-12 rounded-3xl bg-white dark:bg-stone-900 border border-amber-200/80 dark:border-stone-800 shadow-xl flex flex-col justify-between relative overflow-hidden bento-glow-orange">
                <div className="absolute right-6 top-6 text-amber-500/10 pointer-events-none">
                  <Quote size={120} />
                </div>

                <div>
                  <div className="flex items-center gap-1.5 text-amber-400 mb-6">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} size={20} className="fill-amber-400 text-amber-400" />
                    ))}
                  </div>

                  <p className="text-lg sm:text-2xl font-medium text-stone-800 dark:text-stone-200 italic leading-relaxed">
                    "{testimonials[0].quote}"
                  </p>
                </div>

                <div className="flex items-center justify-between pt-8 border-t border-stone-100 dark:border-stone-800 mt-8">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-full bg-gradient-to-br from-amber-500 to-orange-600 text-white font-black text-2xl flex items-center justify-center shadow-lg shadow-amber-500/25 flex-shrink-0">
                      {testimonials[0].name.charAt(0)}
                    </div>
                    <div>
                      <b className="text-base font-black text-stone-900 dark:text-white block">{testimonials[0].name}</b>
                      <span className="text-xs text-stone-500 dark:text-stone-400">{testimonials[0].role} · {testimonials[0].company}</span>
                    </div>
                  </div>

                  <span className="hidden sm:inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs font-extrabold shadow-sm">
                    <TrendingUp size={14} /> {testimonials[0].growth}
                  </span>
                </div>
              </div>

              {/* 2 Stacked Smaller Testimonials on Right (5 cols) */}
              <div className="lg:col-span-5 grid grid-rows-2 gap-6">
                {testimonials.slice(1).map((t, idx) => (
                  <div data-reveal="right" data-delay={idx * 150} key={t.name} className="interactive-card p-6 sm:p-8 rounded-3xl bg-white dark:bg-stone-900 border border-stone-200/80 dark:border-stone-800 shadow-md flex flex-col justify-between">
                    <p className="text-sm text-stone-600 dark:text-stone-300 italic leading-relaxed font-medium">
                      "{t.quote}"
                    </p>
                    <div className="flex items-center justify-between pt-4 border-t border-stone-100 dark:border-stone-800 mt-4">
                      <div className="flex items-center gap-3">
                        <div className={`w-11 h-11 rounded-full flex items-center justify-center text-white font-black text-lg flex-shrink-0 shadow-md ${idx === 0
                          ? 'bg-gradient-to-br from-emerald-500 to-teal-600 shadow-emerald-500/20'
                          : 'bg-gradient-to-br from-purple-500 to-indigo-600 shadow-purple-500/20'
                          }`}>
                          {t.name.charAt(0)}
                        </div>
                        <div>
                          <b className="text-xs font-black text-stone-900 dark:text-white block">{t.name}</b>
                          <span className="text-[11px] text-stone-500 dark:text-stone-400">{t.role}</span>
                        </div>
                      </div>
                      <span className="text-[11px] font-bold text-amber-500">{t.growth}</span>
                    </div>
                  </div>
                ))}
              </div>

            </div>

          </div>
        </section>

        {/* ══════════════════════════════════════════════════════════
            SECTION 09B — LEADERSHIP SPOTLIGHT & VISION (FOUNDER'S NOTE)
           ══════════════════════════════════════════════════════════ */}
        <section className="py-24 bg-white dark:bg-[#181715] border-b border-stone-200/60 dark:border-stone-800 relative overflow-hidden" id="leadership-vision">
          {/* Subtle Ambient Glows */}
          <div className="absolute top-1/2 left-0 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none -translate-y-1/2" />
          <div className="absolute top-1/3 right-0 w-96 h-96 bg-orange-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="max-w-[1380px] mx-auto px-4 sm:px-6 lg:px-8 relative z-10">

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-14 items-center">

              {/* Left Column (5 Cols): Executive Portrait */}
              <div data-reveal="left" className="lg:col-span-5 relative flex justify-center">
                <div className="relative w-full max-w-[310px] sm:max-w-[340px]">
                  {/* Glow Backdrop */}
                  <div className="absolute -inset-3 bg-gradient-to-tr from-amber-500/30 via-orange-500/20 to-amber-500/10 rounded-[2.5rem] transform -rotate-2 blur-lg -z-10" />

                  {/* Portrait Card */}
                  <div className="relative w-full h-[460px] sm:h-[500px] rounded-3xl overflow-hidden shadow-2xl border-4 border-white dark:border-stone-800 bg-stone-900 group">
                    <img
                      src="/Rupesh.jpeg"
                      alt="Rupesh - Leadership at Adyapan"
                      className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-700"
                    />
                    {/* Subtle Gradient Shade */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-transparent pointer-events-none" />

                    {/* Leader Info Tag inside Image */}
                    <div className="absolute bottom-6 left-6 right-6 text-white pointer-events-none">
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-amber-500 text-[11px] font-extrabold uppercase tracking-widest text-stone-950 mb-2 shadow-sm">
                        <Sparkles size={13} className="fill-stone-950" />
                        <span>Executive Leadership</span>
                      </span>
                      <h3 className="text-xl sm:text-2xl font-black text-white">Rupesh Kumar Rupak</h3>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column (7 Cols): The Leadership Note & Core Pillars */}
              <div data-reveal="right" className="lg:col-span-7 space-y-6">

                {/* Top Badge */}
                <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-amber-500/10 border border-amber-500/25 text-amber-700 dark:text-amber-400 font-extrabold text-xs uppercase tracking-wider">
                  <Quote size={13} className="text-amber-500" />
                  <span>WHAT OUR LEADERS SAY</span>
                </div>

                {/* Editorial Heading */}
                <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-stone-900 dark:text-white leading-tight tracking-tight">
                  "We don't just hire for jobs — <br />
                  <span className="text-amber-500">we build leaders of tomorrow.</span>"
                </h2>

                {/* Executive Quote Body */}
                <div className="relative p-6 sm:p-7 rounded-3xl bg-[#faf6f0] dark:bg-stone-900 border border-amber-200/80 dark:border-stone-800 shadow-sm space-y-3.5">
                  <Quote size={36} className="text-amber-500/30 absolute top-5 right-5" />

                  <p className="text-stone-700 dark:text-stone-200 text-base sm:text-lg leading-relaxed font-medium italic">
                    "At Adyapan, our philosophy is anchored on trust, transparency, and meritocracy. We don’t believe in rigid corporate bureaucracy or multi-year waiting lines for recognition. If you bring passion, discipline, and execution to the table, we provide the mentorship, resources, and leadership stage to propel your career 10x faster."
                  </p>

                  <p className="text-stone-600 dark:text-stone-400 text-xs sm:text-sm leading-relaxed font-medium">
                    Whether you are starting as an intern, counselor, or senior specialist, your voice matters from day one. You will have direct access to leadership, transparent quarterly reviews, and an environment built to celebrate your wins every single week.
                  </p>
                </div>

                {/* 3 Leadership Commitment Pillars */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 pt-1">
                  <div className="p-4 rounded-2xl bg-white dark:bg-stone-900 border border-stone-200/80 dark:border-stone-800 shadow-xs">
                    <div className="w-8 h-8 rounded-lg bg-amber-500/15 text-amber-600 dark:text-amber-400 flex items-center justify-center font-black text-sm mb-2">
                      01
                    </div>
                    <h4 className="font-black text-xs sm:text-sm text-stone-900 dark:text-white">Zero Gatekeeping</h4>
                    <p className="text-[11px] text-stone-500 dark:text-stone-400 mt-1 leading-snug">Promotions based solely on merit and execution.</p>
                  </div>

                  <div className="p-4 rounded-2xl bg-white dark:bg-stone-900 border border-stone-200/80 dark:border-stone-800 shadow-xs">
                    <div className="w-8 h-8 rounded-lg bg-purple-500/15 text-purple-600 dark:text-purple-400 flex items-center justify-center font-black text-sm mb-2">
                      02
                    </div>
                    <h4 className="font-black text-xs sm:text-sm text-stone-900 dark:text-white">Direct Access</h4>
                    <p className="text-[11px] text-stone-500 dark:text-stone-400 mt-1 leading-snug">Open Slack channels and weekly founder 1-on-1s.</p>
                  </div>

                  <div className="p-4 rounded-2xl bg-white dark:bg-stone-900 border border-stone-200/80 dark:border-stone-800 shadow-xs">
                    <div className="w-8 h-8 rounded-lg bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-black text-sm mb-2">
                      03
                    </div>
                    <h4 className="font-black text-xs sm:text-sm text-stone-900 dark:text-white">Continuous Growth</h4>
                    <p className="text-[11px] text-stone-500 dark:text-stone-400 mt-1 leading-snug">Sponsored certifications & leadership grooming.</p>
                  </div>
                </div>

                {/* Call to Action Link */}
                <div className="pt-2 flex items-center gap-4">
                  <Link
                    to="/open-positions"
                    className="inline-flex items-center gap-2 px-7 py-3.5 rounded-full text-xs sm:text-sm font-extrabold text-stone-950 bg-amber-500 hover:bg-amber-400 shadow-lg shadow-amber-500/25 hover:scale-105 active:scale-95 transition-all"
                  >
                    <span>Join Our Team</span>
                    <ArrowRight size={15} />
                  </Link>

                  <a
                    href="#growth"
                    className="inline-flex items-center gap-1.5 px-4 py-3.5 text-xs sm:text-sm font-bold text-stone-700 dark:text-stone-300 hover:text-amber-500 transition-colors"
                  >
                    <span>View Career Trajectories</span>
                    <ChevronRight size={15} />
                  </a>
                </div>

              </div>

            </div>

          </div>
        </section>

        {/* ══════════════════════════════════════════════════════════
            SECTION 10 — LIFE AT ADYAPAN PHOTO STORY (EXPANDING ACCORDION)
           ══════════════════════════════════════════════════════════ */}
        <section className="py-24 bg-[#faf6f0] dark:bg-[#181715] border-b border-stone-200/60 dark:border-stone-800 overflow-hidden">
          <div className="max-w-[1380px] mx-auto px-4 sm:px-6 lg:px-8">

            <div className="text-center max-w-2xl mx-auto mb-14" data-reveal="up">
              <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-amber-500/10 border border-amber-500/25 text-amber-700 dark:text-amber-400 font-extrabold text-xs uppercase tracking-wider mb-3">
                <Sparkles size={14} className="text-amber-500" />
                <span>PHOTO STORIES & MEMORIES</span>
              </div>
              <h2 className="text-3xl sm:text-4xl lg:text-6xl font-black text-stone-900 dark:text-white leading-tight">
                Come for the opportunity. <br />
                <span className="text-amber-500">Stay for the people.</span>
              </h2>
              <p className="text-stone-600 dark:text-stone-300 text-sm sm:text-base mt-3 max-w-xl mx-auto font-medium">
                Step inside our vibrant workspace. Hover on any team photo to explore our workspace culture, leadership, and community.
              </p>
            </div>

            {/* Interactive 3-Photo Accordion Gallery */}
            <div className="flex flex-col md:flex-row gap-4 h-auto md:h-[430px] w-full">
              {PHOTO_STORIES.map((story, idx) => {
                const isActive = activePhoto === idx;
                return (
                  <div
                    key={story.title}
                    onMouseEnter={() => setActivePhoto(idx)}
                    onClick={() => setActivePhoto(idx)}
                    className="relative rounded-3xl overflow-hidden shadow-xl border-2 border-white dark:border-stone-800 bg-stone-900 cursor-pointer group transform-gpu h-52 sm:h-64 md:h-auto"
                    style={{
                      flex: isActive ? 2.5 : 1,
                      transition: 'flex 0.65s cubic-bezier(0.25, 1, 0.5, 1), transform 0.5s ease',
                    }}
                  >
                    <img
                      src={story.image}
                      alt={story.title}
                      className="w-full h-full object-cover object-center transform-gpu"
                    />

                    {/* Gradient Overlay */}
                    <div
                      className={`absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent transition-opacity duration-500 ${isActive ? 'opacity-95' : 'opacity-70 group-hover:opacity-85'
                        }`}
                    />

                    {/* Badge & Info Overlay */}
                    <div className="absolute inset-x-0 bottom-0 p-5 text-white flex flex-col justify-end">
                      <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-black/60 backdrop-blur-md text-xs font-bold text-amber-400 w-fit mb-2 border border-white/10">
                        {story.tag}
                      </div>
                      <h3 className="text-lg sm:text-xl font-black text-white leading-snug">
                        {story.title}
                      </h3>
                      {isActive && (
                        <p className="text-xs sm:text-sm text-stone-200 mt-1.5 leading-relaxed max-w-md animate-fadeIn hidden sm:block">
                          {story.desc}
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Rich 3-Card Info Deck Below Accordion */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mt-8">
              {PHOTO_STORIES.map((story, idx) => {
                const isActive = activePhoto === idx;
                return (
                  <div
                    key={story.title}
                    onMouseEnter={() => setActivePhoto(idx)}
                    onClick={() => setActivePhoto(idx)}
                    className={`p-5 rounded-2xl border transition-all duration-300 cursor-pointer ${isActive
                        ? 'bg-amber-500/10 dark:bg-amber-500/15 border-amber-500/60 shadow-lg -translate-y-1'
                        : 'bg-white dark:bg-stone-900 border-stone-200/80 dark:border-stone-800 shadow-sm hover:border-amber-500/30'
                      }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-black uppercase tracking-wider text-amber-600 dark:text-amber-400">
                        {story.tag}
                      </span>
                      <span className="text-[11px] font-bold text-stone-500 dark:text-stone-400">
                        Photo 0{idx + 1}
                      </span>
                    </div>
                    <h4 className="text-base font-black text-stone-900 dark:text-white">
                      {story.title}
                    </h4>
                    <p className="text-xs text-stone-600 dark:text-stone-300 mt-1.5 leading-relaxed">
                      {story.desc}
                    </p>
                    <div className="mt-3 pt-3 border-t border-stone-200/60 dark:border-stone-800 flex items-center justify-between text-[11px] font-bold text-stone-500 dark:text-stone-400">
                      <span>{story.stats}</span>
                      <span className="text-amber-500 font-extrabold">{isActive ? '● Active' : 'Hover →'}</span>
                    </div>
                  </div>
                );
              })}
            </div>

          </div>
        </section>

        {/* ══════════════════════════════════════════════════════════
            SECTION 11 — FULL ORANGE CTA (VERY STRONG & IMPRESSIVE)
           ══════════════════════════════════════════════════════════ */}
        <section className="py-20 sm:py-24 bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 text-white relative overflow-hidden">
          {/* Giant Transparent Watermark in Background */}
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-white/10 font-black text-[120px] sm:text-[200px] select-none pointer-events-none uppercase tracking-tighter">
            ADYAPAN
          </div>

          <div className="max-w-[1380px] mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">

              {/* Left Column: Heading & Button */}
              <div data-reveal="left" className="lg:col-span-7 space-y-4">
                <span className="inline-block px-3.5 py-1 rounded-full bg-white/20 backdrop-blur-md text-xs font-extrabold uppercase tracking-widest text-white mb-2">
                  DON'T WAIT FOR THE RIGHT MOMENT
                </span>
                <h2 className="text-4xl sm:text-6xl lg:text-7xl font-black text-white leading-tight">
                  Your next chapter <br />
                  starts here.
                </h2>
                <p className="text-amber-100 text-base sm:text-lg max-w-lg font-medium">
                  Explore opportunities, accelerate your career, and find the workplace where your potential is celebrated every single day.
                </p>

                <div className="pt-4">
                  <Link
                    to="/open-positions"
                    className="group inline-flex items-center gap-2.5 px-6 py-3.5 rounded-full text-sm sm:text-base font-extrabold text-white bg-black hover:bg-stone-900 shadow-xl hover:scale-105 active:scale-95 transition-all"
                  >
                    <span>Explore Opportunities</span>
                    <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                  </Link>
                </div>
              </div>

              {/* Right Column: 3 Stat Highlights */}
              <div data-reveal="right" className="lg:col-span-5 grid grid-cols-3 gap-4 text-center">
                <div className="p-4 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20">
                  <b className="text-2xl sm:text-3xl lg:text-4xl font-black text-white block">24h</b>
                  <span className="text-xs text-amber-100 font-bold uppercase tracking-wider">Fast Reply</span>
                </div>
                <div className="p-4 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20">
                  <b className="text-2xl sm:text-3xl lg:text-4xl font-black text-white block">48-72h</b>
                  <span className="text-xs text-amber-100 font-bold uppercase tracking-wider">Interviews</span>
                </div>
                <div className="p-4 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20">
                  <b className="text-2xl sm:text-3xl lg:text-4xl font-black text-white block">₹0 Fee</b>
                  <span className="text-xs text-amber-100 font-bold uppercase tracking-wider">Free Apply</span>
                </div>
              </div>

            </div>
          </div>
        </section>

        {/* ══════════════════════════════════════════════════════════
            SECTION 12 — FAQ (WIDE ACCORDION & CONTACT CARD)
           ══════════════════════════════════════════════════════════ */}
        <section className="py-24 bg-[#faf7f2] dark:bg-[#121110] border-b border-stone-200/60 dark:border-stone-800" id="faq">
          <div className="max-w-[1380px] mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">

              {/* Left Column: Heading + Help Card */}
              <div data-reveal="left" className="lg:col-span-5 space-y-6">
                <div>
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/25 text-amber-700 dark:text-amber-400 font-extrabold text-xs uppercase tracking-wider mb-3">
                    <HelpCircle size={13} className="text-amber-500" />
                    <span>EVERYTHING YOU NEED TO KNOW</span>
                  </div>
                  <h2 className="text-3xl sm:text-4xl lg:text-6xl font-black text-stone-900 dark:text-white leading-tight">
                    Still curious? <br />
                    <span className="text-amber-500">We've got answers.</span>
                  </h2>
                </div>

                {/* Support Card */}
                <div className="p-7 rounded-3xl bg-white dark:bg-stone-900 border border-amber-200/70 dark:border-stone-800 shadow-md space-y-4 bento-glow-orange">
                  <div className="w-12 h-12 rounded-2xl bg-amber-500/15 text-amber-600 flex items-center justify-center font-bold">
                    <Phone size={22} />
                  </div>
                  <h4 className="font-black text-base text-stone-900 dark:text-white">Have specific questions?</h4>
                  <p className="text-xs sm:text-sm text-stone-500 dark:text-stone-400 leading-relaxed font-medium">
                    Our team is here to assist you with applications, resume reviews, or technical positions.
                  </p>
                  <Link
                    to="/contact"
                    className="inline-flex items-center gap-2 text-xs sm:text-sm font-extrabold text-amber-500 hover:text-amber-600 pt-1"
                  >
                    <span>Contact Our Career Team</span>
                    <ArrowRight size={15} />
                  </Link>
                </div>
              </div>

              {/* Right Column: Accordion FAQ List */}
              <div data-reveal="right" className="lg:col-span-7 space-y-3.5">
                {faqList.map((item, idx) => {
                  const isOpen = faqOpen === idx;
                  return (
                    <div
                      key={idx}
                      className={`rounded-2xl border transition-all overflow-hidden ${isOpen
                        ? 'bg-amber-500/5 dark:bg-stone-900 border-amber-500/50 shadow-md'
                        : 'bg-white dark:bg-stone-900 border-stone-200/80 dark:border-stone-800 shadow-sm'
                        }`}
                    >
                      <button
                        onClick={() => setFaqOpen(isOpen ? null : idx)}
                        className="w-full p-5 text-left flex items-center justify-between gap-4 font-bold text-sm sm:text-base text-stone-900 dark:text-white"
                      >
                        <span className="flex items-center gap-3">
                          <span className="text-xs font-black text-amber-500">0{idx + 1}</span>
                          <span>{item.q}</span>
                        </span>
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 text-sm font-bold transition-transform ${isOpen ? 'bg-amber-500 text-white rotate-180' : 'bg-stone-100 dark:bg-stone-800 text-stone-500'
                          }`}>
                          {isOpen ? '−' : '+'}
                        </div>
                      </button>

                      {isOpen && (
                        <div className="px-6 pb-6 text-xs sm:text-sm text-stone-600 dark:text-stone-300 leading-relaxed border-t border-stone-200/40 dark:border-stone-800 pt-3 animate-fadeIn font-medium">
                          {item.a}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

            </div>
          </div>
        </section>

      </main>
    </SiteShell>
  );
};

export default Careers;
