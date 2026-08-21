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
export const WHY_JOIN_VIDEO_URL =
  'https://adyapan-website-storage.s3.ap-south-1.amazonaws.com/videos/final-web-video.mp4';
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
    name: 'Pranay Varma',
    role: 'Inside Sales Specialist (PPO Converted)',
    growth: 'Intern to Full-Time · ₹10 LPA',
    company: 'Adyapan Edutech Hyderabad Hub',
  },
  {
    featured: false,
    quote:
      'The work environment at the Hyderabad office is super supportive and energetic. Management genuinely values freshers, providing 1-on-1 counseling training with zero toxic pressure and high uncapped weekly incentives.',
    name: 'Divya Sri',
    role: 'Senior Academic Counselor',
    growth: '₹45K+ Monthly Incentives',
  },
  {
    featured: false,
    quote:
      'Hands-on learning with direct access to founders. Every target achieved is celebrated with Friday team games, cricket matches, and instant rewards. Best culture for anyone wanting fast corporate sales and leadership exposure.',
    name: 'Karthik Nambiar',
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

const Careers: React.FC = () => {
  const [faqOpen, setFaqOpen] = useState<number | null>(0);
  const [activeJourneyStep, setActiveJourneyStep] = useState<number>(0);

  // Initialize scroll reveal observer
  useScrollReveal();

  return (
    <SiteShell>
      <main className="overflow-x-hidden text-stone-900 dark:text-stone-100 selection:bg-amber-500 selection:text-white">

        {/* ══════════════════════════════════════════════════════════
            SECTION 01 — HERO (EXACT APPROVED SCREENSHOT LAYOUT)
           ══════════════════════════════════════════════════════════ */}
        <section className="relative pt-10 pb-20 md:pt-16 md:pb-28 overflow-hidden bg-[#fdfbf7] dark:bg-[#141312] border-b border-stone-200/70 dark:border-stone-850 pattern-dots">
          {/* Ambient Glowing Orbs */}
          <div className="glow-orb top-[-100px] right-[-100px] w-[500px] h-[500px] bg-amber-500/15 dark:bg-amber-500/10" />
          <div className="glow-orb bottom-[-80px] left-[-80px] w-[420px] h-[420px] bg-orange-500/10 dark:bg-orange-500/5" />

          {/* Large Watermark Typography */}
          <div className="absolute right-4 top-1/3 watermark-text text-stone-900 dark:text-white">
            CAREER
          </div>

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">

              {/* Left Column (Approx 55%) */}
              <div data-reveal="left" className="lg:col-span-7 space-y-6">

                {/* Small uppercase animated badge */}
                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-gradient-to-r from-amber-500/15 via-orange-500/10 to-amber-500/15 border border-amber-500/30 text-amber-700 dark:text-amber-400 font-extrabold text-xs tracking-wider uppercase shadow-sm">
                  <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping" />
                  <span>ADYAPAN CAREER · DIRECT OPPORTUNITIES · FAST HIRING</span>
                </div>

                {/* Very Large Editorial Heading */}
                <h1 className="text-4xl sm:text-5xl lg:text-[62px] font-black tracking-tight text-stone-900 dark:text-white leading-[1.08]">
                  Your next <br />
                  <span className="relative inline-block text-amber-500">
                    career move
                    <span className="absolute left-0 bottom-1.5 w-full h-3 bg-amber-500/15 -z-10 rounded-sm" />
                  </span> <br />
                  starts here.
                </h1>

                {/* Supporting Copy */}
                <p className="text-base sm:text-lg text-stone-600 dark:text-stone-300 max-w-xl leading-relaxed font-medium">
                  Discover high-paying job opportunities, get instant AI ATS screening on your resume, and connect directly with hiring managers within 48 hours.
                </p>

                {/* Action Buttons */}
                <div className="flex flex-wrap items-center gap-4 pt-2">
                  <Link
                    to="/open-positions"
                    className="group inline-flex items-center justify-center gap-2.5 px-8 py-4 rounded-full font-extrabold text-sm text-white bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 hover:from-amber-600 hover:to-orange-600 shadow-xl shadow-amber-500/25 hover:shadow-2xl hover:shadow-amber-500/35 hover:-translate-y-0.5 active:translate-y-0 transition-all duration-300"
                  >
                    <span>Explore Opportunities</span>
                    <ArrowRight size={17} className="group-hover:translate-x-1 transition-transform" />
                  </Link>

                  <a
                    href="#why-join"
                    className="inline-flex items-center gap-1.5 px-5 py-4 font-bold text-sm text-stone-800 dark:text-stone-200 hover:text-amber-500 dark:hover:text-amber-400 transition-colors"
                  >
                    <span>Why Work Here</span>
                    <ChevronRight size={16} />
                  </a>
                </div>

                {/* Small Benefit Pills with Multi-Color Badges */}
                <div className="flex flex-wrap items-center gap-3 pt-4 border-t border-stone-200/80 dark:border-stone-800">
                  <div className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white dark:bg-stone-900 border border-amber-200/80 dark:border-amber-900/40 text-xs font-bold text-stone-800 dark:text-stone-200 shadow-sm hover:scale-105 transition-transform">
                    <span className="w-6 h-6 rounded-lg bg-amber-500/15 text-amber-600 flex items-center justify-center">
                      <Flame size={14} className="animate-pulse" />
                    </span>
                    <span>Fast 48h Interviews</span>
                  </div>

                  <div className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white dark:bg-stone-900 border border-purple-200/80 dark:border-purple-900/40 text-xs font-bold text-stone-800 dark:text-stone-200 shadow-sm hover:scale-105 transition-transform">
                    <span className="w-6 h-6 rounded-lg bg-purple-500/15 text-purple-600 flex items-center justify-center">
                      <Trophy size={14} />
                    </span>
                    <span>Uncapped Monthly Incentives</span>
                  </div>

                  <div className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white dark:bg-stone-900 border border-emerald-200/80 dark:border-emerald-900/40 text-xs font-bold text-stone-800 dark:text-stone-200 shadow-sm hover:scale-105 transition-transform">
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
                <div className="relative w-full max-w-md h-[470px] sm:h-[530px] rounded-3xl overflow-hidden shadow-2xl border-4 border-white dark:border-stone-800 bg-stone-900 group">
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
                    <h3 className="text-xl font-black text-white">Work Hard. Win Together.</h3>
                  </div>
                </div>

                {/* 1. Top-Right Floating Card: Verified Jobs */}
                <div className="absolute -top-3 -right-2 sm:-right-6 z-20 bg-white/95 dark:bg-stone-900/95 backdrop-blur-md border border-stone-200/80 dark:border-stone-800 p-3.5 rounded-2xl shadow-xl animate-float flex items-center gap-3.5">
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold flex-shrink-0 shadow-sm">
                    <CheckCircle2 size={19} />
                  </div>
                  <div>
                    <b className="text-xs sm:text-sm font-black text-stone-900 dark:text-white block">
                      Verified Jobs
                    </b>
                    <small className="text-[11px] text-stone-500 dark:text-stone-400 font-semibold">Updated Daily</small>
                  </div>
                </div>

                {/* 2. Mid-Left Floating Card: 4.8/5 */}
                <div className="absolute top-1/2 -left-3 sm:-left-8 -translate-y-1/2 z-20 bg-white/95 dark:bg-stone-900/95 backdrop-blur-md border border-stone-200 dark:border-stone-800 p-3.5 rounded-2xl shadow-xl animate-float-delayed flex items-center gap-3.5">
                  <div className="w-10 h-10 rounded-xl bg-amber-500/15 text-amber-500 flex items-center justify-center font-bold flex-shrink-0">
                    <Star size={18} className="fill-amber-500 text-amber-500" />
                  </div>
                  <div>
                    <b className="text-xs sm:text-sm font-black text-stone-900 dark:text-white block">
                      4.8 / 5.0
                    </b>
                    <small className="text-[11px] text-stone-500 dark:text-stone-400 font-semibold">Team Satisfaction</small>
                  </div>
                </div>

                {/* 3. Bottom-Right Floating Card: 10,000+ Opportunities */}
                <div className="absolute -bottom-5 right-2 sm:right-6 z-20 bg-white/95 dark:bg-stone-900/95 backdrop-blur-md border border-emerald-200 dark:border-emerald-800/40 p-3.5 rounded-2xl shadow-xl animate-float flex items-center gap-3.5 bento-glow-emerald">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white flex items-center justify-center font-bold flex-shrink-0 shadow-md">
                    <CheckCircle2 size={18} />
                  </div>
                  <div>
                    <b className="text-xs sm:text-sm font-black text-stone-900 dark:text-white block">
                      10,000+
                    </b>
                    <small className="text-[11px] text-stone-500 dark:text-stone-400 font-semibold">Opportunities Available</small>
                  </div>
                </div>

              </div>

            </div>
          </div>
        </section>

        {/* ══════════════════════════════════════════════════════════
            SECTION 02 — TRUST / STATS STRIP (FLOATING CONTAINER)
           ══════════════════════════════════════════════════════════ */}
        <section className="relative z-20 -mt-6 sm:-mt-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
          <div className="bg-white dark:bg-[#181715] rounded-3xl p-6 sm:p-8 border border-stone-200/80 dark:border-stone-800 shadow-2xl">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-0 lg:divide-x divide-stone-200/80 dark:divide-stone-800">

              {/* Stat 1: Orange */}
              <div data-reveal="up" data-delay="100" className="interactive-card flex items-center gap-4 px-2 sm:px-6">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-500/20 to-orange-500/20 text-amber-600 dark:text-amber-400 flex items-center justify-center flex-shrink-0 shadow-inner">
                  <Briefcase size={22} />
                </div>
                <div>
                  <b className="text-2xl sm:text-3xl font-black text-stone-900 dark:text-white block tracking-tight">
                    <AnimatedCounter end={10000} suffix="+" />
                  </b>
                  <span className="text-xs text-stone-500 dark:text-stone-400 font-bold uppercase tracking-wider">
                    Opportunities
                  </span>
                </div>
              </div>

              {/* Stat 2: Mint Green */}
              <div data-reveal="up" data-delay="200" className="interactive-card flex items-center gap-4 px-2 sm:px-6">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-500/20 to-teal-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center flex-shrink-0 shadow-inner">
                  <UsersRound size={22} />
                </div>
                <div>
                  <b className="text-2xl sm:text-3xl font-black text-stone-900 dark:text-white block tracking-tight">
                    <AnimatedCounter end={500} suffix="+" />
                  </b>
                  <span className="text-xs text-stone-500 dark:text-stone-400 font-bold uppercase tracking-wider">
                    Hiring Partners
                  </span>
                </div>
              </div>

              {/* Stat 3: Purple */}
              <div data-reveal="up" data-delay="300" className="interactive-card flex items-center gap-4 px-2 sm:px-6">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-purple-500/20 to-indigo-500/20 text-purple-600 dark:text-purple-400 flex items-center justify-center flex-shrink-0 shadow-inner">
                  <GraduationCap size={22} />
                </div>
                <div>
                  <b className="text-2xl sm:text-3xl font-black text-stone-900 dark:text-white block tracking-tight">
                    <AnimatedCounter end={50000} suffix="+" />
                  </b>
                  <span className="text-xs text-stone-500 dark:text-stone-400 font-bold uppercase tracking-wider">
                    Placed Learners
                  </span>
                </div>
              </div>

              {/* Stat 4: Sky Blue */}
              <div data-reveal="up" data-delay="400" className="interactive-card flex items-center gap-4 px-2 sm:px-6">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-sky-500/20 to-blue-500/20 text-sky-600 dark:text-sky-400 flex items-center justify-center flex-shrink-0 shadow-inner">
                  <Zap size={22} />
                </div>
                <div>
                  <b className="text-2xl sm:text-3xl font-black text-stone-900 dark:text-white block tracking-tight">
                    <AnimatedCounter end={48} suffix="h" />
                  </b>
                  <span className="text-xs text-stone-500 dark:text-stone-400 font-bold uppercase tracking-wider">
                    Interview Call
                  </span>
                </div>
              </div>

            </div>
          </div>
        </section>

        {/* ══════════════════════════════════════════════════════════
            SECTION 03 — LIFE AT ADYAPAN / CULTURE (LAYERED COLLAGE)
           ══════════════════════════════════════════════════════════ */}
        <section className="py-24 bg-[#f7f3ec] dark:bg-[#121110] border-b border-stone-200/60 dark:border-stone-850 relative pattern-dots-subtle" id="culture">
          {/* Watermark text */}
          <div className="absolute left-6 top-1/4 watermark-text text-stone-900 dark:text-white">
            CULTURE
          </div>

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">

              {/* Left Column: Heading & Culture Story */}
              <div data-reveal="left" className="lg:col-span-5 space-y-7">
                <div className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/25 text-amber-700 dark:text-amber-400 font-extrabold text-xs sm:text-sm uppercase tracking-wider">
                  <Sparkles size={15} className="text-amber-500" />
                  <span>LIFE AT ADYAPAN · CULTURE</span>
                </div>

                <h2 className="text-4xl sm:text-5xl lg:text-6xl font-black text-stone-900 dark:text-white tracking-tight leading-[1.08]">
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
                <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 h-[440px] max-h-[440px]">

                  {/* Main Large Team Image */}
                  <div className="sm:col-span-7 relative rounded-3xl overflow-hidden shadow-2xl border-2 border-white dark:border-stone-800 bg-stone-900 group h-[440px]">
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
                      <h4 className="text-base sm:text-lg font-black text-white leading-tight">
                        Work Hard. Laugh Harder.
                      </h4>
                    </div>
                  </div>

                  {/* Two Stacked Photos on Right */}
                  <div className="sm:col-span-5 flex flex-col gap-4 h-[440px] justify-between">
                    <div className="relative rounded-2xl overflow-hidden shadow-lg border-2 border-white dark:border-stone-800 bg-stone-900 group h-[210px]">
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

                    <div className="relative rounded-2xl overflow-hidden shadow-lg border-2 border-white dark:border-stone-800 bg-stone-900 group h-[210px]">
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

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">

            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12" data-reveal="up">
              <div>
                <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-400 font-extrabold text-xs uppercase tracking-wider mb-3">
                  <PartyPopper size={14} />
                  <span>FUN DAYS AT ADYAPAN · REAL MOMENTS</span>
                </div>
                <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white">
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
        <section className="py-24 bg-[#faf6f0] dark:bg-[#141312] border-b border-stone-200/60 dark:border-stone-850 relative pattern-dots" id="growth">
          <div className="absolute right-8 top-1/4 watermark-text text-stone-900 dark:text-white">
            GROWTH
          </div>

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">

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

            {/* Bento Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

              {/* Bento Card 1: Fast-Track 6-Month Evaluations (Spans 2 columns) */}
              <div data-reveal="up" data-delay="100" className="md:col-span-2 interactive-card p-8 sm:p-10 rounded-3xl bg-white dark:bg-stone-900 border border-amber-200/70 dark:border-stone-800 shadow-md flex flex-col justify-between bento-glow-orange">
                <div>
                  <div className="flex items-center justify-between gap-4 mb-6">
                    <div className="w-14 h-14 rounded-2xl bg-amber-500/15 text-amber-600 dark:text-amber-400 flex items-center justify-center font-bold">
                      <Rocket size={28} />
                    </div>
                    <div className="text-right">
                      <span className="text-3xl sm:text-4xl font-black text-amber-500 block">06</span>
                      <small className="text-xs font-bold uppercase tracking-wider text-stone-500">Months Cycle</small>
                    </div>
                  </div>

                  <h3 className="text-2xl font-black text-stone-900 dark:text-white">
                    Fast-Track 6-Month Promotions
                  </h3>
                  <p className="text-stone-600 dark:text-stone-300 text-sm mt-3 leading-relaxed max-w-xl">
                    No waiting for years for annual appraisal cycles. Every 6 months, high-performing advisors, specialists, and engineers are directly reviewed for team lead, managerial promotions, and salary escalations.
                  </p>
                </div>

                <div className="mt-8 pt-6 border-t border-stone-100 dark:border-stone-800 flex flex-wrap items-center gap-3">
                  <span className="px-3.5 py-1.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs font-extrabold flex items-center gap-1">
                    <CheckCircle2 size={13} /> Transparent Metrics
                  </span>
                  <span className="px-3.5 py-1.5 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 text-xs font-extrabold flex items-center gap-1">
                    <Star size={13} /> Direct Founder Sync
                  </span>
                </div>
              </div>

              {/* Bento Card 2: Learning & Masterclasses */}
              <div data-reveal="up" data-delay="200" className="interactive-card p-8 rounded-3xl bg-white dark:bg-stone-900 border border-blue-200/70 dark:border-stone-800 shadow-md flex flex-col justify-between bento-glow-blue">
                <div>
                  <div className="w-12 h-12 rounded-2xl bg-blue-500/15 text-blue-600 dark:text-blue-400 flex items-center justify-center mb-6">
                    <GraduationCap size={24} />
                  </div>
                  <h3 className="text-xl font-black text-stone-900 dark:text-white">Masterclasses & Mentorship</h3>
                  <p className="text-stone-500 dark:text-stone-400 text-xs sm:text-sm mt-2 leading-relaxed">
                    Gain exclusive access to executive communication workshops, AI ATS tooling coaching, and sales masterclasses.
                  </p>
                </div>
                <span className="text-xs font-extrabold text-blue-500 mt-6 block">
                  100% Free Professional Coaching →
                </span>
              </div>

              {/* Bento Card 3: Leadership Exposure */}
              <div data-reveal="up" data-delay="300" className="interactive-card p-8 rounded-3xl bg-white dark:bg-stone-900 border border-purple-200/70 dark:border-stone-800 shadow-md bento-glow-purple flex flex-col justify-between">
                <div>
                  <div className="w-12 h-12 rounded-2xl bg-purple-500/15 text-purple-600 dark:text-purple-400 flex items-center justify-center mb-6">
                    <Building2 size={24} />
                  </div>
                  <h3 className="text-xl font-black text-stone-900 dark:text-white">Leadership Shadowing</h3>
                  <p className="text-stone-500 dark:text-stone-400 text-xs sm:text-sm mt-2 leading-relaxed">
                    Work alongside seasoned founders and recruitment directors with zero bureaucratic barriers.
                  </p>
                </div>
                <span className="text-xs font-extrabold text-purple-500 mt-6 block">
                  High-Impact Visibility →
                </span>
              </div>

              {/* Bento Card 4: Recognition & Cash Rewards */}
              <div data-reveal="up" data-delay="400" className="interactive-card p-8 rounded-3xl bg-white dark:bg-stone-900 border border-amber-200/70 dark:border-stone-800 shadow-md bento-glow-orange flex flex-col justify-between">
                <div>
                  <div className="w-12 h-12 rounded-2xl bg-amber-500/15 text-amber-600 dark:text-amber-400 flex items-center justify-center mb-6">
                    <Trophy size={24} />
                  </div>
                  <h3 className="text-xl font-black text-stone-900 dark:text-white">Weekly Spot Incentives</h3>
                  <p className="text-stone-500 dark:text-stone-400 text-xs sm:text-sm mt-2 leading-relaxed">
                    Weekly cash rewards, milestone trophies, and spotlight recognition for high performers.
                  </p>
                </div>
                <span className="text-xs font-extrabold text-amber-500 mt-6 block">
                  Instant Payouts & Trophies →
                </span>
              </div>

              {/* Bento Card 5: Team Pods & Culture */}
              <div data-reveal="up" data-delay="500" className="interactive-card p-8 rounded-3xl bg-white dark:bg-stone-900 border border-emerald-200/70 dark:border-stone-800 shadow-md bento-glow-emerald flex flex-col justify-between">
                <div>
                  <div className="w-12 h-12 rounded-2xl bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mb-6">
                    <UsersRound size={24} />
                  </div>
                  <h3 className="text-xl font-black text-stone-900 dark:text-white">Collaborative Squads</h3>
                  <p className="text-stone-500 dark:text-stone-400 text-xs sm:text-sm mt-2 leading-relaxed">
                    Supportive pod leads and colleagues who back you up at every step. Zero office politics.
                  </p>
                </div>
                <span className="text-xs font-extrabold text-emerald-500 mt-6 block">
                  Zero Toxic Stress →
                </span>
              </div>

            </div>
          </div>
        </section>

        {/* ══════════════════════════════════════════════════════════
            SECTION 06 — FLEXIBLE WORKING (FREEDOM & WELLBEING)
           ══════════════════════════════════════════════════════════ */}
        <section className="py-24 bg-white dark:bg-[#181715] border-b border-stone-200/60 dark:border-stone-850 relative" id="why-join">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">

              {/* Left Column (7 cols) */}
              <div data-reveal="left" className="lg:col-span-7 space-y-6">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/25 text-amber-700 dark:text-amber-400 font-extrabold text-xs uppercase tracking-wider">
                  <Clock3 size={13} className="text-amber-500" />
                  <span>FREEDOM & WELLBEING</span>
                </div>

                <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-stone-900 dark:text-white leading-tight">
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
        <section className="py-24 bg-gradient-to-b from-[#faf6f0] to-[#fff8ee] dark:bg-[#121110] border-b border-stone-200/60 dark:border-stone-850 relative" id="dream-job">
          <div className="absolute left-6 top-1/4 watermark-text text-stone-900 dark:text-white">
            OPPORTUNITY
          </div>

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">

              {/* Left Column: Vertical Dream Job Reel (5 cols) */}
              <div className="lg:col-span-5 order-2 lg:order-1 flex justify-center">
                <VideoReelCard
                  videoSrc={DREAM_JOB_VIDEO_URL}
                  badgeText="DREAM JOB ROADMAP · 500+ RECRUITERS"
                  title="Land High-Paying Dream Careers"
                  subtitle="Instant AI ATS Matching · 500+ Corporate Partners · 48h Fast Track"
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

                <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-stone-900 dark:text-white leading-tight">
                  Where ambitious talent <br />
                  <span className="text-amber-500">applies directly & lands</span> <br />
                  their dream job.
                </h2>

                <p className="text-stone-600 dark:text-stone-300 text-sm sm:text-base leading-relaxed font-medium">
                  Stop submitting applications into recruiter black holes with zero response. At Adyapan, we match your resume directly with 500+ verified corporate recruiters, offering instant ATS evaluation and fast 48-hour interview scheduling.
                </p>

                {/* 2x2 Feature Cards Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                  <div className="interactive-card p-5 rounded-2xl bg-white dark:bg-stone-900 border border-amber-200/70 dark:border-stone-800 shadow-sm flex items-start gap-3.5">
                    <div className="w-10 h-10 rounded-xl bg-amber-500/15 text-amber-600 flex items-center justify-center flex-shrink-0">
                      <BriefcaseBusiness size={20} />
                    </div>
                    <div>
                      <h4 className="font-extrabold text-sm text-stone-900 dark:text-white">Direct Opportunities</h4>
                      <p className="text-xs text-stone-500 dark:text-stone-400 mt-0.5">500+ corporate recruitment openings.</p>
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
                    className="inline-flex items-center gap-2 px-8 py-4 rounded-full text-sm font-extrabold text-white bg-amber-500 hover:bg-amber-600 shadow-xl shadow-amber-500/25 hover:scale-105 transition-all"
                  >
                    <span>Explore Opportunities</span>
                    <ArrowRight size={16} />
                  </Link>
                </div>
              </div>

            </div>
          </div>
        </section>

        {/* ══════════════════════════════════════════════════════════
            SECTION 08 — CAREER JOURNEY (INTERACTIVE ANIMATED TIMELINE)
           ══════════════════════════════════════════════════════════ */}
        <section className="py-24 bg-white dark:bg-[#181715] border-b border-stone-200/60 dark:border-stone-850 relative" id="hiring-process">
          <div className="absolute right-8 top-1/4 watermark-text text-stone-900 dark:text-white">
            JOURNEY
          </div>

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">

            <div className="text-center max-w-2xl mx-auto mb-16">
              <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-amber-500/10 border border-amber-500/25 text-amber-700 dark:text-amber-400 font-extrabold text-xs uppercase tracking-wider mb-3">
                <Compass size={14} className="text-amber-500" />
                <span>STEP-BY-STEP HIRING ROADMAP</span>
              </div>
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-stone-900 dark:text-white leading-tight">
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
        <section className="py-24 bg-[#f5f0e6] dark:bg-[#141312] border-b border-stone-200/60 dark:border-stone-850 relative" id="stories">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

            <div className="mb-14" data-reveal="left">
              <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-amber-500/10 border border-amber-500/25 text-amber-700 dark:text-amber-400 font-extrabold text-xs uppercase tracking-wider mb-3">
                <Quote size={13} className="text-amber-500" />
                <span>REAL PEOPLE · REAL CAREERS</span>
              </div>
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-stone-900 dark:text-white">
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
            SECTION 10 — LIFE AT ADYAPAN PHOTO STORY (MASONRY COLLAGE)
           ══════════════════════════════════════════════════════════ */}
        <section className="py-24 bg-[#faf6f0] dark:bg-[#181715] border-b border-stone-200/60 dark:border-stone-850">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

            <div className="text-center max-w-2xl mx-auto mb-14" data-reveal="up">
              <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-amber-500/10 border border-amber-500/25 text-amber-700 dark:text-amber-400 font-extrabold text-xs uppercase tracking-wider mb-3">
                <Sparkles size={14} className="text-amber-500" />
                <span>PHOTO STORIES & MEMORIES</span>
              </div>
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-stone-900 dark:text-white">
                Come for the opportunity. <br />
                <span className="text-amber-500">Stay for the people.</span>
              </h2>
            </div>

            {/* Editorial Photo Masonry Collage */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              <div className="sm:col-span-2 relative rounded-3xl overflow-hidden shadow-xl border-2 border-white dark:border-stone-800 bg-stone-900 group h-[340px]">
                <img
                  src="/adyapan-team-fun.png"
                  alt="Team Life"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute bottom-4 left-4 px-3.5 py-1.5 rounded-xl bg-black/70 backdrop-blur-md text-xs font-bold text-white">
                  🏆 Adyapan Hyderabad Headquarters
                </div>
              </div>

              <div className="relative rounded-3xl overflow-hidden shadow-xl border-2 border-white dark:border-stone-800 bg-stone-900 group h-[340px]">
                <img
                  src="/Founders.jpeg"
                  alt="Adyapan Leadership"
                  className="w-full h-full object-cover object-[center_55%] group-hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute bottom-4 left-4 px-3.5 py-1.5 rounded-xl bg-black/70 backdrop-blur-md text-xs font-bold text-white">
                  ✨ Leadership & Vision
                </div>
              </div>
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

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">

              {/* Left Column: Heading & Button */}
              <div data-reveal="left" className="lg:col-span-7 space-y-4">
                <span className="inline-block px-3.5 py-1 rounded-full bg-white/20 backdrop-blur-md text-xs font-extrabold uppercase tracking-widest text-white mb-2">
                  DON'T WAIT FOR THE RIGHT MOMENT
                </span>
                <h2 className="text-4xl sm:text-6xl font-black text-white leading-tight">
                  Your next chapter <br />
                  starts here.
                </h2>
                <p className="text-amber-100 text-base sm:text-lg max-w-lg font-medium">
                  Explore opportunities, accelerate your career, and find the workplace where your potential is celebrated every single day.
                </p>

                <div className="pt-4">
                  <Link
                    to="/open-positions"
                    className="group inline-flex items-center gap-3 px-9 py-4 rounded-full text-base font-extrabold text-white bg-black hover:bg-stone-900 shadow-2xl hover:scale-105 active:scale-95 transition-all"
                  >
                    <span>Explore Opportunities</span>
                    <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                  </Link>
                </div>
              </div>

              {/* Right Column: 3 Stat Highlights */}
              <div data-reveal="right" className="lg:col-span-5 grid grid-cols-3 gap-4 text-center">
                <div className="p-4 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20">
                  <b className="text-3xl sm:text-4xl font-black text-white block">10K+</b>
                  <span className="text-xs text-amber-100 font-bold uppercase tracking-wider">Jobs</span>
                </div>
                <div className="p-4 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20">
                  <b className="text-3xl sm:text-4xl font-black text-white block">500+</b>
                  <span className="text-xs text-amber-100 font-bold uppercase tracking-wider">Companies</span>
                </div>
                <div className="p-4 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20">
                  <b className="text-3xl sm:text-4xl font-black text-white block">48h</b>
                  <span className="text-xs text-amber-100 font-bold uppercase tracking-wider">Offers</span>
                </div>
              </div>

            </div>
          </div>
        </section>

        {/* ══════════════════════════════════════════════════════════
            SECTION 12 — FAQ (WIDE ACCORDION & CONTACT CARD)
           ══════════════════════════════════════════════════════════ */}
        <section className="py-24 bg-[#faf7f2] dark:bg-[#121110] border-b border-stone-200/60 dark:border-stone-850" id="faq">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">

              {/* Left Column: Heading + Help Card */}
              <div data-reveal="left" className="lg:col-span-5 space-y-6">
                <div>
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/25 text-amber-700 dark:text-amber-400 font-extrabold text-xs uppercase tracking-wider mb-3">
                    <HelpCircle size={13} className="text-amber-500" />
                    <span>EVERYTHING YOU NEED TO KNOW</span>
                  </div>
                  <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-stone-900 dark:text-white leading-tight">
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
