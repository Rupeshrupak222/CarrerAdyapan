import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import AdyapanLogo from '../common/AdyapanLogo';
import { useTheme } from '../../context/ThemeContext';
import toast from 'react-hot-toast';

const Footer = ({ isPublic = false }: { isPublic?: boolean }) => {
  const { theme } = useTheme();
  const location = useLocation();
  const [newsletterEmail, setNewsletterEmail] = useState('');

  const isPublicPage = isPublic || ['/careers', '/contact', '/privacy', '/terms', '/login', '/register', '/application-success'].some(path => location.pathname.startsWith(path));

  const handleSubscribe = (e) => {
    e.preventDefault();
    if (!newsletterEmail || !newsletterEmail.includes('@')) {
      toast.error('Please enter a valid work email address.');
      return;
    }
    toast.success(`Subscribed ${newsletterEmail} to Adyapan Recruitment Updates!`);
    setNewsletterEmail('');
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className={`border-t transition-colors mt-auto select-none ${
      theme === 'dark'
        ? 'bg-slate-900 border-slate-800 text-slate-400'
        : 'bg-white border-slate-200/90 text-slate-600 shadow-inner'
    }`}>
      {/* Top Banner: Quick Subscribe & Announcement Bar (Public Career Portal Only) */}
      {isPublicPage && (
        <div className={`border-b px-4 sm:px-6 lg:px-8 py-4 ${
          theme === 'dark' ? 'bg-slate-950/60 border-slate-800/80' : 'bg-amber-50/50 border-amber-200/60'
        }`}>
          <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3 text-xs font-semibold text-slate-800 dark:text-slate-200">
              <span className="px-2.5 py-1 rounded-full bg-amber-500/20 text-amber-700 dark:text-amber-300 font-bold border border-amber-500/30 shrink-0">
                Adyapan EdTech
              </span>
              <span>Stay updated with recruitment drives, candidate evaluations, and career opportunities.</span>
            </div>

            <form onSubmit={handleSubscribe} className="flex items-center gap-2 w-full md:w-auto">
              <input
                type="email"
                value={newsletterEmail}
                onChange={(e) => setNewsletterEmail(e.target.value)}
                placeholder="Enter your work email..."
                className={`px-3.5 py-1.5 text-xs font-medium border rounded-xl focus:outline-none w-full md:w-60 ${
                  theme === 'dark'
                    ? 'bg-slate-900 border-slate-700 text-white placeholder-slate-500 focus:border-amber-400'
                    : 'bg-white border-amber-200 text-slate-800 placeholder-slate-400 focus:border-amber-500'
                }`}
              />
              <button
                type="submit"
                className="px-4 py-1.5 text-xs font-bold text-slate-950 bg-amber-400 hover:bg-amber-500 rounded-xl shadow-sm transition-all shrink-0 cursor-pointer"
              >
                Subscribe
              </button>
            </form>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
          
          {/* Col 1: Brand & Description */}
          <div className="space-y-4">
            <AdyapanLogo size="normal" variant={theme} />
            <p className="text-xs leading-relaxed text-slate-600 dark:text-slate-300 font-normal">
              Official AI Recruitment, ATS Resume Scoring, Candidate Evaluation, and Executive Offer Management Portal for <strong>Adyapan Edutech Pvt. Ltd.</strong>
            </p>

            <div className="pt-1 flex flex-wrap items-center gap-2">
              <a
                href="https://www.linkedin.com/company/adyapan-edutech-pvt-ltd"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-[#0a66c2]/10 text-[#0a66c2] dark:bg-[#0a66c2]/20 dark:text-[#70b5f9] border border-[#0a66c2]/30 hover:bg-[#0a66c2] hover:text-white transition-all shadow-sm group"
              >
                <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                  <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
                </svg>
                <span>LinkedIn ↗</span>
              </a>

              <a
                href="https://www.instagram.com/adyapan_?igsh=MWw1NGwwNTIwZXU2eQ%3D%3D"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-pink-500/10 text-pink-600 dark:bg-pink-500/20 dark:text-pink-400 border border-pink-500/30 hover:bg-gradient-to-r hover:from-purple-600 hover:to-pink-600 hover:text-white transition-all shadow-sm group"
              >
                <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                </svg>
                <span>Instagram ↗</span>
              </a>
            </div>
          </div>

          {/* Col 2: Candidate Portal Links */}
          <div className="space-y-3 text-xs font-medium">
            <h3 className="text-xs font-bold uppercase tracking-wider text-amber-500 flex items-center gap-1.5">
              <span>For Candidates</span>
            </h3>
            <ul className="space-y-2">
              <li>
                <Link to="/careers" className="hover:text-amber-500 transition-all hover:translate-x-1 inline-block">
                  → Browse Open Positions
                </Link>
              </li>
              <li>
                <Link to="/login" className="hover:text-amber-500 transition-all hover:translate-x-1 inline-block">
                  → Sign In / Track Applications
                </Link>
              </li>
              <li>
                <Link to="/register" className="hover:text-amber-500 transition-all hover:translate-x-1 inline-block">
                  → Create Account
                </Link>
              </li>
              <li>
                <Link to="/contact" className="hover:text-amber-500 transition-all hover:translate-x-1 inline-block">
                  → Contact & Support
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 3: Company Links */}
          <div className="space-y-3 text-xs font-medium">
            <h3 className="text-xs font-bold uppercase tracking-wider text-amber-500 flex items-center gap-1.5">
              <span>Company</span>
            </h3>
            <ul className="space-y-2">
              <li>
                <a href="https://www.adyapan.com" target="_blank" rel="noreferrer" className="hover:text-amber-500 transition-all hover:translate-x-1 inline-block">
                  → About Adyapan
                </a>
              </li>
              <li>
                <Link to="/privacy" className="hover:text-amber-500 transition-all hover:translate-x-1 inline-block">
                  → Privacy Policy
                </Link>
              </li>
              <li>
                <Link to="/terms" className="hover:text-amber-500 transition-all hover:translate-x-1 inline-block">
                  → Terms of Service
                </Link>
              </li>
              {!isPublicPage && (
                <>
                  <li>
                    <Link to="/dashboard" className="hover:text-amber-500 transition-all hover:translate-x-1 inline-block">
                      → Admin Dashboard
                    </Link>
                  </li>
                  <li>
                    <Link to="/analytics" className="hover:text-amber-500 transition-all hover:translate-x-1 inline-block">
                      → Recruitment Analytics
                    </Link>
                  </li>
                </>
              )}
            </ul>
          </div>

          {/* Col 4: Corporate Contact Info */}
          <div id="contact" className="space-y-4 scroll-mt-24">
            <Link to={isPublicPage ? "/contact" : "/admin-contact"} className="flex items-center gap-2 text-xs font-bold tracking-widest text-amber-500 uppercase hover:underline">
              <span className="w-4 h-[2px] bg-amber-500 inline-block" />
              <span>CONTACT</span>
            </Link>

            {/* Phone Item */}
            <div className="flex items-center gap-3 group">
              <div className="w-9 h-9 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-500 shrink-0 shadow-sm group-hover:scale-110 transition-transform">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
              </div>
              <a href="tel:+918179124566" className="text-xs font-bold text-slate-900 dark:text-white hover:text-amber-500 transition-colors">
                +91 81791 24566
              </a>
            </div>

            {/* Email Item */}
            <div className="flex items-center gap-3 group">
              <div className="w-9 h-9 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-500 shrink-0 shadow-sm group-hover:scale-110 transition-transform">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <a href="mailto:support@adyapan.com" className="text-xs font-bold text-slate-900 dark:text-white hover:text-amber-500 transition-colors">
                support@adyapan.com
              </a>
            </div>

            {/* Head Office Address Item with Google Maps Link */}
            <div className="flex items-start gap-3 group">
              <div className="w-9 h-9 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-500 shrink-0 mt-0.5 shadow-sm group-hover:scale-110 transition-transform">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <div>
                <a
                  href="https://maps.google.com/?q=Sattva+Magnus+Sabza+Colony+Toli+Chowki+Hyderabad"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group/loc cursor-pointer block"
                >
                  <h4 className="text-xs font-bold text-slate-900 dark:text-white group-hover/loc:text-amber-500 transition-colors">
                    Adyapan Edutech Pvt Ltd ↗
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 group-hover/loc:text-amber-500 transition-colors font-normal leading-relaxed mt-0.5">
                    Sattva Magnus, Sabza Colony, Toli Chowki, Hyderabad, Telangana 500008
                  </p>
                </a>
              </div>
            </div>
          </div>

        </div>

        {/* Bottom Bar: Copyright, Legal Links & Back To Top */}
        <div className="pt-6 border-t border-slate-200 dark:border-slate-800 flex flex-col md:flex-row items-center justify-between gap-4 text-xs font-medium">
          <div className="flex flex-wrap items-center gap-3 text-slate-600 dark:text-slate-400">
            <p>© {new Date().getFullYear()} SR'S ADYAPAN EDUTECH PRIVATE LIMITED. All rights reserved.</p>
          </div>

          {/* Specified Legal & External Links */}
          <div className="flex flex-wrap items-center gap-4 text-xs font-semibold text-slate-700 dark:text-slate-300">
            <Link to="/privacy" className="text-amber-600 dark:text-amber-400 font-bold hover:underline">
              Privacy Policy
            </Link>
            <span>•</span>
            <Link to="/terms" className="hover:text-amber-500 transition-colors font-semibold">
              Terms of Service
            </Link>
            <span>•</span>
            <Link to="/contact" className="hover:text-amber-500 transition-colors font-semibold">
              Contact Us
            </Link>
            <span>•</span>
            <a href="https://adyapan.com/" target="_blank" rel="noopener noreferrer" className="hover:text-amber-500 transition-colors font-bold">
              Home ↗
            </a>

            <button
              onClick={scrollToTop}
              className="ml-2 px-3.5 py-1.5 text-xs font-semibold rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:bg-amber-500 hover:text-slate-950 dark:hover:bg-amber-500 dark:hover:text-slate-950 transition-all flex items-center gap-1.5 shadow-sm cursor-pointer"
              title="Scroll back to top of page"
            >
              <span>↑ Back to Top</span>
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
