import React from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  Sparkles,
  UsersRound,
  Heart,
  CheckCircle2,
  BriefcaseBusiness,
  Globe2,
} from 'lucide-react';
import SiteShell from '../components/layout/SiteShell';
import { useScrollReveal } from '../hooks/useScrollReveal';

import aboutHeroOffice from '../assets/about-hero-office-reference.jpg';
import techTeam from '../assets/tech-team-hd-production.webp';
import nonTechTeam from '../assets/non-tech-team-hd-production.webp';
import managementTeam from '../assets/management-hr-team-hd-production.webp';
import teamCultureImage from '../assets/culture-team-professional.jpg';
import teamAvif from '../assets/team.avif';
import adyapanTeam from '../assets/adyapan-team.jpg';

const AboutUs: React.FC = () => {
  useScrollReveal();

  const teams = [
    {
      number: '01',
      eyebrow: 'TECH TEAM',
      title: 'Building the systems behind better opportunities.',
      subtitle: 'Building the Future, Every Day',
      text: 'Our technology team designs, builds and scales the digital experiences that power learning, assessment and career discovery. Engineering, product thinking and thoughtful execution come together to create reliable experiences for learners and hiring teams.',
      image: techTeam,
      icon: <Sparkles size={22} />,
      bullets: [
        'Passionate about innovation & scalable architecture',
        'Focused on real-time performance & high reliability',
        'Committed to secure, delightful candidate experiences',
      ],
    },
    {
      number: '02',
      eyebrow: 'NON-TECH TEAM',
      title: 'Driving excellence behind the scenes.',
      subtitle: 'Driving Excellence Behind the Scenes',
      text: 'From content and operations to marketing, talent and learner support, our non-technical teams keep everything moving smoothly. They bring empathy, precision and a learner-first mindset to every candidate interaction.',
      image: nonTechTeam,
      icon: <UsersRound size={22} />,
      bullets: [
        'Stronger processes, seamless operations',
        'Learner & candidate-first empathetic mindset',
        'Execution with speed, precision & high impact',
      ],
    },
    {
      number: '03',
      eyebrow: 'MANAGEMENT & HR TEAM',
      title: 'Leading people. Building culture.',
      subtitle: 'Leading People, Building Culture',
      text: 'Our leaders and HR team shape the culture, support talent and create an environment where everyone can grow, lead and thrive. They keep people, purpose and performance moving in the same direction.',
      image: managementTeam,
      icon: <Heart size={22} />,
      bullets: [
        'People-first transparent leadership',
        'Culture of trust, recognition & zero bureaucracy',
        'Continuous career growth, upskilling & wellbeing',
      ],
    },
  ];

  const purposeItems = [
    {
      icon: <Sparkles size={24} className="text-white" />,
      title: 'Our Mission',
      text: 'To empower learners with skills, exposure and opportunities that lead to meaningful careers and lifelong growth.',
    },
    {
      icon: <UsersRound size={24} className="text-white" />,
      title: 'Our Vision',
      text: "To become India's most trusted ecosystem for talent transformation and fast-track career acceleration.",
    },
    {
      icon: <Heart size={24} className="text-white" />,
      title: 'Our Purpose',
      text: 'To create impact at scale by connecting ambitious talent, high-impact learning and direct corporate opportunities.',
    },
  ];

  const lifeValues = [
    {
      icon: <Sparkles size={22} />,
      title: 'Ownership',
      text: 'We empower you to take initiative, make decisions, and create measurable impact.',
    },
    {
      icon: <Heart size={22} />,
      title: 'Growth',
      text: 'We invest heavily in your learning, mentorship, and accelerated promotions.',
    },
    {
      icon: <UsersRound size={22} />,
      title: 'Collaboration',
      text: 'We achieve extraordinary outcomes through mutual trust, teamwork, and openness.',
    },
    {
      icon: <BriefcaseBusiness size={22} />,
      title: 'Innovation',
      text: 'We encourage bold ideas that challenge the status quo and solve real problems.',
    },
    {
      icon: <Globe2 size={22} />,
      title: 'Impact',
      text: 'We work tirelessly for candidates, careers, and a brighter economic tomorrow.',
    },
  ];

  return (
    <SiteShell>
      <main className="about-reference-page overflow-x-hidden text-stone-900 dark:text-stone-100 bg-[#fdfbf7] dark:bg-[#141312]">

        {/* ══════════════════════════════════════════════════════════
            HERO SECTION (EXACT HARSHITHA COMPOSITION)
           ══════════════════════════════════════════════════════════ */}
        <section className="about-ref-hero">
          <div className="about-ref-hero-grid">
            <div className="about-ref-hero-copy" data-reveal="left">
              <span className="about-ref-kicker">ABOUT ADYAPAN</span>
              <h1>
                Building India’s
                <br />
                <em>Future-Ready Talent</em>
              </h1>
              <p>
                At Adyapan, we’re reimagining how talent is discovered, developed and deployed.
                Through industry-relevant education, real-world experience and career-focused opportunities,
                we’re creating a bridge between ambition and achievement.
              </p>
              <div className="about-ref-mini-stats">
                <div>
                  <span>
                    Industry Aligned
                    <br />
                    Programs
                  </span>
                  <b>50+</b>
                </div>
                <div>
                  <span>
                    Learners
                    <br />
                    Impacted
                  </span>
                  <b>1M+</b>
                </div>
              </div>
            </div>
            <div className="about-ref-hero-visual" data-reveal="right">
              <div className="about-ref-hero-photo">
                <img src={aboutHeroOffice} alt="Adyapan office and workplace" />
                <div className="about-ref-hero-photo-shade" />
              </div>
              <div className="about-ref-hero-dot-grid" />
            </div>
          </div>
        </section>

        {/* ══════════════════════════════════════════════════════════
            MISSION / VISION / PURPOSE (FULL-WIDTH 3-COLUMN BANNER)
           ══════════════════════════════════════════════════════════ */}
        <section className="py-14 bg-gradient-to-r from-amber-600 via-orange-500 to-amber-500 text-white shadow-xl">
          <div className="max-w-[1380px] mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-0 md:divide-x divide-white/20">
              {purposeItems.map((item, idx) => (
                <div
                  key={item.title}
                  data-reveal="up"
                  data-delay={idx * 150}
                  className="flex items-start gap-4 px-2 md:px-8"
                >
                  <div className="w-12 h-12 rounded-2xl bg-white/15 backdrop-blur-md border border-white/30 flex items-center justify-center flex-shrink-0 shadow-inner">
                    {item.icon}
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white">{item.title}</h3>
                    <p className="text-xs sm:text-sm text-amber-100 mt-2 leading-relaxed font-medium">
                      {item.text}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ══════════════════════════════════════════════════════════
            TEAMS SECTION (THE HEART OF ADYAPAN)
           ══════════════════════════════════════════════════════════ */}
        <section className="pt-16 pb-8 sm:pt-24 sm:pb-10 border-b border-stone-200/70 dark:border-stone-800">
          <div className="max-w-[1380px] mx-auto px-4 sm:px-6 lg:px-8">

            {/* Section Heading */}
            <div className="text-center max-w-2xl mx-auto mb-16" data-reveal="up">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/25 text-amber-700 dark:text-amber-400 font-extrabold text-xs uppercase tracking-wider mb-3">
                <UsersRound size={14} className="text-amber-500" />
                <span>THE HEART OF ADYAPAN</span>
              </div>
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-stone-950 dark:text-white tracking-tight leading-tight">
                Teams That Build, <br />
                <span className="text-amber-500">Create &amp; Inspire.</span>
              </h2>
              <p className="text-stone-600 dark:text-stone-300 text-sm sm:text-base mt-3 font-medium">
                Different minds. One mission. Endless impact across technology, operations, and leadership.
              </p>
            </div>

            {/* Team Cards List */}
            <div className="space-y-10">
              {teams.map((team, idx) => {
                const isEven = idx % 2 === 1;
                return (
                  <div
                    key={team.number}
                    data-reveal="up"
                    className="interactive-card p-6 sm:p-8 lg:p-10 rounded-3xl bg-white dark:bg-stone-900 border border-stone-200/80 dark:border-stone-800 shadow-xl grid grid-cols-1 lg:grid-cols-12 gap-8 items-center"
                  >
                    {/* Image Column */}
                    <div
                      className={`lg:col-span-5 relative rounded-2xl overflow-hidden shadow-lg h-[280px] sm:h-[360px] bg-stone-100 dark:bg-stone-800 ${isEven ? 'lg:order-2' : 'lg:order-1'
                        }`}
                    >
                      <img
                        src={team.image}
                        alt={`${team.eyebrow} at Adyapan`}
                        className="w-full h-full object-cover object-center transform hover:scale-105 transition-transform duration-700"
                        loading={idx === 0 ? 'eager' : 'lazy'}
                      />
                      <span className="absolute top-4 left-4 w-9 h-9 rounded-full bg-black/70 backdrop-blur-md text-white font-bold text-xs flex items-center justify-center border border-white/20">
                        {team.number}
                      </span>
                    </div>

                    {/* Content Column */}
                    <div
                      className={`lg:col-span-7 space-y-4 ${isEven ? 'lg:order-1' : 'lg:order-2'
                        }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-11 h-11 rounded-xl bg-amber-500/15 text-amber-600 dark:text-amber-400 flex items-center justify-center flex-shrink-0 shadow-xs">
                          {team.icon}
                        </div>
                        <div>
                          <span className="text-xs font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400 block">
                            {team.eyebrow}
                          </span>
                          <span className="text-xs text-stone-500 dark:text-stone-400 font-semibold">
                            {team.subtitle}
                          </span>
                        </div>
                      </div>

                      <h3 className="text-xl sm:text-2xl font-bold text-stone-900 dark:text-white leading-snug">
                        {team.title}
                      </h3>

                      <p className="text-stone-600 dark:text-stone-300 text-xs sm:text-sm leading-relaxed">
                        {team.text}
                      </p>

                      <ul className="space-y-2 pt-2 border-t border-stone-100 dark:border-stone-800">
                        {team.bullets.map((bullet) => (
                          <li
                            key={bullet}
                            className="flex items-start gap-2.5 text-xs sm:text-sm font-semibold text-stone-800 dark:text-stone-200"
                          >
                            <CheckCircle2 size={16} className="text-emerald-500 flex-shrink-0 mt-0.5" />
                            <span>{bullet}</span>
                          </li>
                        ))}
                      </ul>

                      <div className="pt-3 flex items-center justify-between text-[11px] font-bold text-stone-400 uppercase tracking-wider">
                        <span>TEAM {team.number}</span>
                        <span className="text-amber-600 dark:text-amber-400 font-extrabold">ADYAPAN · PEOPLE · IMPACT</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

          </div>
        </section>

        {/* ══════════════════════════════════════════════════════════
            OUR CULTURE SECTION (HARSHITHA DESIGN COMPOSITION)
           ══════════════════════════════════════════════════════════ */}
        <section className="py-16 sm:py-24 border-b border-stone-200/70 dark:border-stone-800 bg-[#fbf9f4] dark:bg-[#11100e]">
          <div className="max-w-[1380px] mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-2xl mx-auto mb-14" data-reveal="up">
              <span className="inline-block px-3 py-1 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 font-extrabold text-xs uppercase tracking-wider mb-2">
                OUR CULTURE
              </span>
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-stone-950 dark:text-white tracking-tight">
                Strong teams build <span className="text-amber-500">stronger futures.</span>
              </h2>
              <p className="text-stone-600 dark:text-stone-300 text-sm sm:text-base mt-3 leading-relaxed">
                Our culture is designed around ownership, learning and respect. Every team plays a different role, but the standard stays the same: build thoughtfully, communicate openly and keep candidate experience at the center.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
              {[
                { num: '01', img: adyapanTeam, label: 'Continuous Learning & Growth' },
                { num: '02', img: 'https://adyapan-website-storage.s3.ap-south-1.amazonaws.com/images/room-teaching.jpg', label: 'Mentorship in Action' },
                { num: '03', img: teamCultureImage, label: 'Energy & Shared Ambition' }
              ].map((item, i) => (
                <div 
                  key={item.num} 
                  data-reveal="up" 
                  data-delay={i * 120} 
                  className="group relative rounded-3xl overflow-hidden shadow-lg h-[280px] sm:h-[340px] border border-stone-200 dark:border-stone-800"
                >
                  <img 
                    src={item.img} 
                    alt={`Adyapan culture ${item.num}`} 
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                    loading="lazy" 
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex flex-col justify-end p-6 text-white">
                    <span className="text-xs font-black text-amber-400 uppercase tracking-widest">{item.num}</span>
                    <span className="text-base sm:text-lg font-bold mt-1">{item.label}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ══════════════════════════════════════════════════════════
            PEOPLE CULTURE BANNER
           ══════════════════════════════════════════════════════════ */}
        <section className="pt-6 pb-14 sm:pt-8 sm:pb-18">
          <div className="max-w-[1380px] mx-auto px-4 sm:px-6 lg:px-8">
            <div
              data-reveal="up"
              className="p-8 sm:p-12 lg:p-14 rounded-3xl bg-gradient-to-br from-amber-500 via-orange-500 to-amber-600 text-white shadow-2xl grid grid-cols-1 lg:grid-cols-12 gap-8 items-center relative overflow-hidden"
            >
              {/* Decorative Circle */}
              <div className="absolute right-0 top-0 w-96 h-96 bg-white/10 rounded-full blur-2xl pointer-events-none -mr-20 -mt-20" />

              {/* Copy */}
              <div className="lg:col-span-7 space-y-4 relative z-10">
                <span className="inline-block px-3 py-1 rounded-full bg-white/20 text-white font-extrabold text-xs uppercase tracking-wider">
                  THE ADYAPAN PEOPLE
                </span>

                <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white leading-tight">
                  Built by people who <br />
                  <span className="text-amber-100">believe in people.</span>
                </h2>

                <p className="text-amber-100 text-sm sm:text-base leading-relaxed max-w-xl font-medium">
                  Behind every platform, opportunity and candidate story is a team working with one shared purpose —
                  to transform India’s talent landscape through industry-relevant education, real-world experience and
                  career-focused opportunities.
                </p>

                <div className="pt-2">
                  <Link
                    to="/open-positions"
                    className="inline-flex items-center gap-2 px-7 py-3.5 rounded-full text-xs sm:text-sm font-extrabold text-stone-950 bg-white hover:bg-amber-50 shadow-xl hover:scale-105 active:scale-95 transition-all"
                  >
                    <span>Join Our Team</span>
                    <ArrowRight size={15} />
                  </Link>
                </div>
              </div>

              {/* Image */}
              <div className="lg:col-span-5 relative z-10 flex justify-center">
                <div className="w-full h-[260px] sm:h-[320px] rounded-2xl overflow-hidden shadow-xl border-2 border-white/30 bg-stone-900">
                  <img
                    src={teamAvif}
                    alt="Adyapan team"
                    className="w-full h-full object-cover object-center"
                    onError={(e) => {
                      e.currentTarget.src = '/team.avif';
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ══════════════════════════════════════════════════════════
            LIFE VALUES GRID & CTA
           ══════════════════════════════════════════════════════════ */}
        <section className="py-16 sm:py-24 bg-[#faf6f0] dark:bg-[#181715] border-t border-stone-200/70 dark:border-stone-800">
          <div className="max-w-[1380px] mx-auto px-4 sm:px-6 lg:px-8">

            <div className="text-center max-w-2xl mx-auto mb-14" data-reveal="up">
              <span className="text-xs font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400 block mb-2">
                LIFE AT ADYAPAN
              </span>
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-stone-950 dark:text-white">
                A culture of ownership, growth &amp; meaningful impact.
              </h2>
            </div>

            {/* 5-Column Responsive Values Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-5 mb-14">
              {lifeValues.map((item, idx) => (
                <div
                  key={item.title}
                  data-reveal="up"
                  data-delay={idx * 100}
                  className="interactive-card p-6 rounded-2xl bg-white dark:bg-stone-900 border border-stone-200/80 dark:border-stone-800 shadow-sm text-center flex flex-col items-center justify-between hover:border-amber-500/40 transition-all"
                >
                  <div className="w-12 h-12 rounded-full bg-amber-500/15 text-amber-600 dark:text-amber-400 flex items-center justify-center mb-4">
                    {item.icon}
                  </div>
                  <h3 className="text-base font-bold text-stone-900 dark:text-white">
                    {item.title}
                  </h3>
                  <p className="text-xs text-stone-500 dark:text-stone-400 mt-2 leading-relaxed">
                    {item.text}
                  </p>
                </div>
              ))}
            </div>

            {/* Bottom CTA Box */}
            <div
              data-reveal="up"
              className="p-8 sm:p-10 rounded-3xl bg-white dark:bg-stone-900 border border-amber-200 dark:border-stone-800 shadow-md flex flex-col md:flex-row items-center justify-between gap-6"
            >
              <div>
                <h3 className="text-2xl sm:text-3xl font-bold text-stone-900 dark:text-white">
                  Be a part of something <span className="text-amber-500">bigger than a job.</span>
                </h3>
                <p className="text-xs sm:text-sm text-stone-500 dark:text-stone-400 mt-1 font-medium">
                  Join a team that’s transforming how India learns, grows and builds meaningful careers.
                </p>
              </div>

              <Link
                to="/open-positions"
                className="inline-flex items-center gap-2 px-7 py-3.5 rounded-full text-xs sm:text-sm font-extrabold text-stone-950 bg-amber-500 hover:bg-amber-400 shadow-lg shadow-amber-500/25 hover:scale-105 active:scale-95 transition-all flex-shrink-0"
              >
                <span>Explore Open Roles</span>
                <ArrowRight size={15} />
              </Link>
            </div>

          </div>
        </section>

      </main>
    </SiteShell>
  );
};

export default AboutUs;
