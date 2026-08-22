import React, { useState, useEffect, useRef } from 'react';
import { Sparkles, Users, Award, Briefcase, Heart, CheckCircle2, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import SiteShell from '../components/layout/SiteShell';
import { useScrollReveal } from '../hooks/useScrollReveal';
import adyapanTeam from '../assets/adyapan-team.jpg';

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

const LifeAtAdyapan: React.FC = () => {
  useScrollReveal();

  const photos = [
    { src: '/team.avif', alt: 'Adyapan team life', title: 'Collaboration & Culture' },
    {
      src: 'https://adyapan-website-storage.s3.ap-south-1.amazonaws.com/images/room-teaching.jpg',
      alt: 'Adyapan classroom',
      title: 'Interactive Workshops',
    },
    { src: '/cricket.jpg', alt: 'Adyapan cricket activity', title: 'Team Sports & Energy' },
    { src: '/party.jpeg', alt: 'Adyapan team celebration', title: 'Milestones & Celebrations' },
    { src: '/HR-team.jpeg', alt: 'Adyapan team gathering', title: 'People & Leadership' },
    { src: '/Founders.jpeg', alt: 'Adyapan founders', title: 'Visionary Mentorship' },
  ];

  const stats = [
    { num: 200, suffix: '+', label: 'People Joined', icon: <Users size={20} className="text-amber-500" /> },
    { num: 50, suffix: '+', label: 'Active Projects', icon: <Briefcase size={20} className="text-amber-500" /> },
    { num: 64, suffix: '+', label: 'Completed Milestones', icon: <Award size={20} className="text-amber-500" /> },
    { num: 25, suffix: '+', label: 'Open Opportunities', icon: <Sparkles size={20} className="text-amber-500" /> },
  ];

  return (
    <SiteShell>
      <main className="life-page overflow-x-hidden text-stone-900 dark:text-stone-100 bg-[#fdfbf7] dark:bg-[#141312]">

        {/* ══════════════════════════════════════════════════════════
            HERO SECTION (EXACT HARSHITHA ORBIT COMPOSITION)
           ══════════════════════════════════════════════════════════ */}
        <section className="life-page-hero">
          <div className="life-page-hero-inner">
            <div className="life-page-hero-copy" data-reveal="left">
              <span className="kicker">LIFE AT ADYAPAN</span>
              <h1>
                Work with purpose.
                <br />
                <em>Grow together.</em>
              </h1>
              <p>
                See the people, moments and experiences that make life at Adyapan different.
              </p>
            </div>
            <div className="life-page-hero-orbit" aria-hidden="true" data-reveal="right">
              <span />
              <span />
              <span />
            </div>
          </div>
        </section>

        {/* ══════════════════════════════════════════════════════════
            GALLERY SECTION (INSIDE ADYAPAN)
           ══════════════════════════════════════════════════════════ */}
        <section className="py-20 sm:py-28 border-b border-stone-200/70 dark:border-stone-800">
          <div className="max-w-[1380px] mx-auto px-4 sm:px-6 lg:px-8">

            {/* Heading */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-14" data-reveal="up">
              <div className="max-w-2xl">
                <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-amber-500/10 border border-amber-500/25 text-amber-700 dark:text-amber-400 font-extrabold text-xs uppercase tracking-wider mb-2">
                  <Sparkles size={13} className="text-amber-500" />
                  <span>INSIDE ADYAPAN</span>
                </div>
                <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-stone-950 dark:text-white tracking-tight leading-tight">
                  Life is better <span className="text-amber-500">together.</span>
                </h2>
              </div>
              <p className="text-stone-600 dark:text-stone-400 text-xs sm:text-sm max-w-md font-medium leading-relaxed">
                From focused learning and real-world project sprints to sports events, game nights, and everyday team milestones.
              </p>
            </div>

            {/* Responsive 6-Photo Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {photos.map((photo, i) => (
                <div
                  key={photo.title}
                  data-reveal="up"
                  data-delay={i * 100}
                  className="group relative h-[280px] sm:h-[340px] rounded-3xl overflow-hidden bg-stone-100 dark:bg-stone-800 border border-stone-200/80 dark:border-stone-700 shadow-lg hover:shadow-2xl transition-all duration-500"
                >
                  <img
                    src={photo.src}
                    alt={photo.alt}
                    loading={i > 1 ? 'lazy' : 'eager'}
                    decoding="async"
                    className="w-full h-full object-cover object-center group-hover:scale-108 transition-transform duration-700 ease-out"
                    onError={(e) => {
                      if (i === 0) e.currentTarget.src = adyapanTeam;
                    }}
                  />
                  {/* Dark Shade Gradient */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-80 group-hover:opacity-90 transition-opacity" />

                  {/* Top Badge */}
                  <div className="absolute top-4 left-4 z-10 px-3 py-1 rounded-full bg-black/60 backdrop-blur-md border border-white/20 text-white font-black text-xs">
                    0{i + 1}
                  </div>

                  {/* Bottom Caption */}
                  <div className="absolute bottom-4 left-4 right-4 z-10 text-white">
                    <span className="text-[10px] font-extrabold uppercase tracking-widest text-amber-400 block mb-0.5">
                      {photo.alt}
                    </span>
                    <h4 className="text-lg font-black text-white leading-snug">
                      {photo.title}
                    </h4>
                  </div>
                </div>
              ))}
            </div>

          </div>
        </section>

        {/* ══════════════════════════════════════════════════════════
            STATS STRIP
           ══════════════════════════════════════════════════════════ */}
        <section className="py-14 sm:py-20 bg-amber-500/5 dark:bg-stone-900/40 border-b border-stone-200/70 dark:border-stone-800">
          <div className="max-w-[1380px] mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
              {stats.map((stat) => (
                <div
                  key={stat.label}
                  className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-stone-900 border border-stone-200/80 dark:border-stone-800 shadow-md flex flex-col items-center text-center justify-center"
                >
                  <div className="w-11 h-11 rounded-2xl bg-amber-500/15 flex items-center justify-center mb-3">
                    {stat.icon}
                  </div>
                  <strong className="text-3xl sm:text-4xl lg:text-5xl font-black text-amber-600 dark:text-amber-400 tracking-tight">
                    <AnimatedCounter end={stat.num} suffix={stat.suffix} />
                  </strong>
                  <span className="text-xs font-extrabold uppercase tracking-wider text-stone-500 dark:text-stone-400 mt-1">
                    {stat.label}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ══════════════════════════════════════════════════════════
            FOUNDERS SECTION (THE PEOPLE BEHIND ADYAPAN)
           ══════════════════════════════════════════════════════════ */}
        <section className="py-20 sm:py-28 border-b border-stone-200/70 dark:border-stone-800">
          <div className="max-w-[1380px] mx-auto px-4 sm:px-6 lg:px-8">

            {/* Heading */}
            <div className="text-center max-w-2xl mx-auto mb-16" data-reveal="up">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/25 text-amber-700 dark:text-amber-400 font-extrabold text-xs uppercase tracking-wider mb-3">
                <Users size={14} className="text-amber-500" />
                <span>THE PEOPLE BEHIND ADYAPAN</span>
              </div>
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-stone-950 dark:text-white tracking-tight">
                Built with purpose. <br />
                <span className="text-amber-500">Led by people.</span>
              </h2>
              <p className="text-stone-600 dark:text-stone-300 text-xs sm:text-sm mt-3 font-medium">
                Meet the leadership shaping Adyapan's mission to connect learning with real-world corporate opportunities.
              </p>
            </div>

            {/* Founders 2-Card Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

              {/* Founder 1: Sai Charan */}
              <div
                data-reveal="left"
                className="interactive-card p-6 sm:p-8 rounded-3xl bg-white dark:bg-stone-900 border border-stone-200/80 dark:border-stone-800 shadow-xl grid grid-cols-1 sm:grid-cols-12 gap-6 items-center"
              >
                <div className="sm:col-span-5 h-[240px] sm:h-[280px] rounded-2xl overflow-hidden bg-stone-100 dark:bg-stone-800 shadow-md">
                  <img
                    src="/Founders.jpeg"
                    alt="Sai Charan"
                    className="w-full h-full object-cover object-[25%_center] hover:scale-105 transition-transform duration-500"
                  />
                </div>
                <div className="sm:col-span-7 space-y-3">
                  <span className="inline-block px-3 py-1 rounded-full bg-amber-500/15 text-amber-700 dark:text-amber-400 font-extrabold text-[11px] uppercase tracking-wider">
                    FOUNDER
                  </span>
                  <h3 className="text-2xl font-black text-stone-900 dark:text-white">
                    Sai Charan
                  </h3>
                  <p className="text-xs sm:text-sm text-stone-600 dark:text-stone-300 italic leading-relaxed">
                    “Upskilling isn't optional anymore. Adyapan ensures every student learns with purpose, practices with mentors, and grows with total confidence.”
                  </p>
                </div>
              </div>

              {/* Founder 2: Niranjan Reddy */}
              <div
                data-reveal="right"
                className="interactive-card p-6 sm:p-8 rounded-3xl bg-white dark:bg-stone-900 border border-stone-200/80 dark:border-stone-800 shadow-xl grid grid-cols-1 sm:grid-cols-12 gap-6 items-center"
              >
                <div className="sm:col-span-5 h-[240px] sm:h-[280px] rounded-2xl overflow-hidden bg-stone-100 dark:bg-stone-800 shadow-md">
                  <img
                    src="/Founders.jpeg"
                    alt="Niranjan Reddy"
                    className="w-full h-full object-cover object-[75%_center] hover:scale-105 transition-transform duration-500"
                  />
                </div>
                <div className="sm:col-span-7 space-y-3">
                  <span className="inline-block px-3 py-1 rounded-full bg-amber-500/15 text-amber-700 dark:text-amber-400 font-extrabold text-[11px] uppercase tracking-wider">
                    CO-FOUNDER
                  </span>
                  <h3 className="text-2xl font-black text-stone-900 dark:text-white">
                    Niranjan Reddy
                  </h3>
                  <p className="text-xs sm:text-sm text-stone-600 dark:text-stone-300 italic leading-relaxed">
                    “The world is full of opportunities, but students need the right direction. Adyapan helps them access career acceleration without feeling lost.”
                  </p>
                </div>
              </div>

            </div>

          </div>
        </section>

        {/* ══════════════════════════════════════════════════════════
            CULTURE STATEMENT PANEL
           ══════════════════════════════════════════════════════════ */}
        <section className="py-16 sm:py-24">
          <div className="max-w-[1380px] mx-auto px-4 sm:px-6 lg:px-8">
            <div
              data-reveal="up"
              className="p-8 sm:p-12 lg:p-14 rounded-3xl bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 text-white shadow-2xl grid grid-cols-1 md:grid-cols-12 gap-8 items-center relative overflow-hidden"
            >
              <div className="md:col-span-6 space-y-3">
                <span className="text-xs font-extrabold uppercase tracking-widest text-amber-100 block">
                  LIFE AT ADYAPAN
                </span>
                <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white leading-tight">
                  Curious minds. <br />
                  <span className="text-amber-100">Kind people.</span>
                </h2>
              </div>
              <div className="md:col-span-6">
                <p className="text-sm sm:text-base text-amber-100 leading-relaxed font-medium">
                  We want talented people to do meaningful work, learn quickly, support each other and enjoy the journey. Every day is a chance to build something useful and grow together.
                </p>
                <div className="pt-4">
                  <Link
                    to="/open-positions"
                    className="inline-flex items-center gap-2 px-6 py-3 rounded-full text-xs sm:text-sm font-extrabold text-stone-950 bg-white hover:bg-amber-50 shadow-xl hover:scale-105 active:scale-95 transition-all"
                  >
                    <span>Join Our Community</span>
                    <ArrowRight size={15} />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>

      </main>
    </SiteShell>
  );
};

export default LifeAtAdyapan;
