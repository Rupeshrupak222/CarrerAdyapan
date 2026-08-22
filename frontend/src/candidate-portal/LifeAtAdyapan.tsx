import React from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, Users, Award, Briefcase, Quote, Mail, ArrowRight } from 'lucide-react';
import SiteShell from '../components/layout/SiteShell';
import { useScrollReveal } from '../hooks/useScrollReveal';
import adyapanTeam from '../assets/adyapan-team.jpg';
import cultureTeamProfessional from '../assets/culture-team-professional.jpg';

const LifeAtAdyapan: React.FC = () => {
  useScrollReveal();

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
            4. FOUNDERS SECTION (OUR STORY: CRAFTING FUTURES)
           ══════════════════════════════════════════════════════════ */}
        <section className="py-20 sm:py-28 bg-[#fbf9f4] dark:bg-[#0d0d0b] text-stone-900 dark:text-white relative overflow-hidden border-b border-stone-200/80 dark:border-stone-800 transition-colors duration-300" id="founders">
          {/* Subtle Ambient Glows */}
          <div className="absolute top-1/4 left-10 w-96 h-96 bg-amber-500/10 dark:bg-amber-500/15 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-1/4 right-10 w-96 h-96 bg-orange-500/10 dark:bg-orange-500/15 rounded-full blur-3xl pointer-events-none" />

          <div className="max-w-[1380px] mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            {/* Story & Vision Header */}
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
                At Adyapan, we are more than an education platform. We are the bridge between learning and professional launching. Our mission is to empower individuals with the real-world skills and connections to forge their own paths to success.
              </p>
            </div>

            {/* Vertical Founders Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-10 max-w-5xl mx-auto">

              {/* Founder 1: Sai Charan */}
              <div
                data-reveal="left"
                className="group relative rounded-3xl bg-white dark:bg-[#151412] border border-stone-200/90 dark:border-stone-800/90 hover:border-amber-500/60 dark:hover:border-amber-500/60 p-8 sm:p-9 flex flex-col justify-between shadow-xl shadow-stone-200/40 dark:shadow-2xl transition-all duration-500 hover:-translate-y-2 hover:shadow-amber-500/10"
              >
                {/* Glow on Hover */}
                <div className="absolute inset-0 bg-gradient-to-b from-amber-500/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 rounded-3xl transition-opacity duration-500 pointer-events-none" />

                <div className="space-y-5 relative z-10">
                  {/* Top Avatar Row */}
                  <div className="flex items-center gap-5">
                    {/* Circle Image with Glowing Ring */}
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

                  {/* Executive Quote */}
                  <div className="relative p-5 sm:p-6 rounded-2xl bg-amber-500/[0.04] dark:bg-black/50 border border-amber-500/15 dark:border-stone-800/80">
                    <Quote size={20} className="text-amber-500/30 dark:text-amber-500/40 absolute top-3.5 right-4" />
                    <p className="text-stone-700 dark:text-stone-300 text-xs sm:text-sm leading-relaxed font-medium italic">
                      "Upskilling isn't optional anymore. Adyapan ensures every student learns with purpose, practices with mentors, and grows with confidence."
                    </p>
                  </div>

                  {/* Professional Bio Paragraph */}
                  <p className="text-xs sm:text-sm text-stone-600 dark:text-stone-300 leading-relaxed font-normal">
                    Spearheading Adyapan's core mission to democratize industry-ready tech learning, cultivate visionary mentorship, and architect career-launching pathways for thousands of ambitious professionals nationwide.
                  </p>

                  {/* Strategic Focus Badges */}
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

                {/* Bottom Social & Connect Strip */}
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
                {/* Glow on Hover */}
                <div className="absolute inset-0 bg-gradient-to-b from-amber-500/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 rounded-3xl transition-opacity duration-500 pointer-events-none" />

                <div className="space-y-5 relative z-10">
                  {/* Top Avatar Row */}
                  <div className="flex items-center gap-5">
                    {/* Circle Image with Glowing Ring */}
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

                  {/* Executive Quote */}
                  <div className="relative p-5 sm:p-6 rounded-2xl bg-amber-500/[0.04] dark:bg-black/50 border border-amber-500/15 dark:border-stone-800/80">
                    <Quote size={20} className="text-amber-500/30 dark:text-amber-500/40 absolute top-3.5 right-4" />
                    <p className="text-stone-700 dark:text-stone-300 text-xs sm:text-sm leading-relaxed font-medium italic">
                      "The world is full of opportunities, but students need the right direction. Adyapan helps them access global careers without feeling lost."
                    </p>
                  </div>

                  {/* Professional Bio Paragraph */}
                  <p className="text-xs sm:text-sm text-stone-600 dark:text-stone-300 leading-relaxed font-normal">
                    Leading strategic corporate alliances, enterprise hiring partnerships, and student placement acceleration to build sustainable global career pathways for tech and non-tech talent.
                  </p>

                  {/* Strategic Focus Badges */}
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

                {/* Bottom Social & Connect Strip */}
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
            5. LIFE VALUES BANNER
           ══════════════════════════════════════════════════════════ */}
        <section className="life-values py-20 sm:py-28 bg-white dark:bg-[#0d0d0b] transition-colors duration-300 reveal" data-reveal>
          <div className="max-w-[1380px] mx-auto px-4 sm:px-6 lg:px-8">
            <div className="life-values-panel">
              <div>
                <span className="kicker">LIFE AT ADYAPAN</span>
                <h2>
                  Curious minds.
                  <br />
                  <em>Kind people.</em>
                </h2>
              </div>
              <p>
                We want talented people to do meaningful work, learn quickly, support each other and enjoy the journey.
                Every day is a chance to build something useful and grow together.
              </p>
            </div>
          </div>
        </section>
      </main>
    </SiteShell>
  );
};

export default LifeAtAdyapan;
