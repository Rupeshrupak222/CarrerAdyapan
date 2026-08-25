import React from 'react';
import { Link } from 'react-router-dom';
import { Phone, Mail } from 'lucide-react';
import logo from '../../assets/adyapan-logo.png';

interface FooterProps {
  isPublic?: boolean;
  variant?: 'dark' | 'white';
}

const Footer: React.FC<FooterProps> = ({ variant = 'dark' }) => {
  const isWhite = variant === 'white';

  return (
    <footer
      className={`w-full pt-14 pb-8 select-none transition-colors duration-300 ${
        isWhite
          ? 'bg-white text-slate-800 border-t border-slate-200'
          : 'bg-[#17120d] text-white border-t border-[#302a24]'
      }`}
    >
      <div className="max-w-[1380px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-8 lg:gap-10 mb-12">
          {/* Column 1: Brand, About & Socials */}
          <div className="sm:col-span-2 lg:col-span-4 space-y-4">
            <Link className="inline-flex items-center gap-3 select-none group transition-all duration-300" to="/">
              <img
                src={logo}
                alt="Adyapan"
                className={`w-11 h-11 object-contain rounded-full ring-2 transition-all duration-300 shrink-0 ${
                  isWhite
                    ? 'ring-orange-200 group-hover:ring-orange-500 group-hover:scale-105'
                    : 'ring-amber-500/30 group-hover:ring-amber-500 group-hover:scale-105'
                }`}
              />
              <span
                className={`font-bold text-2xl tracking-tight font-['Inter'] transition-colors duration-300 ${
                  isWhite
                    ? 'text-slate-900 group-hover:text-orange-600'
                    : 'text-white group-hover:text-amber-500'
                }`}
              >
                Adyapan
              </span>
            </Link>
            <p
              className={`text-xs leading-relaxed max-w-sm ${
                isWhite ? 'text-slate-600' : 'text-[#a9a198]'
              }`}
            >
              Transforming India's talent landscape through industry-relevant education, real-world experience, and career-focused programs.
            </p>
            <div className="flex items-center gap-3 pt-2" aria-label="Adyapan social links">
              {/* Instagram */}
              <a
                href="https://www.instagram.com/adyapan_?igsh=MWw1NGwwNTIwZXU2eQ=="
                target="_blank"
                rel="noreferrer"
                aria-label="Instagram"
                className={`w-9 h-9 rounded-full inline-flex items-center justify-center transition-all duration-300 shadow-sm shrink-0 ${
                  isWhite
                    ? 'border border-orange-200 bg-orange-50/80 text-orange-600 hover:bg-orange-500 hover:text-white hover:border-orange-500 hover:scale-110'
                    : 'border border-[#3a3129] bg-[#221b14]/60 text-[#ff9a1f] hover:bg-amber-500 hover:text-stone-950 hover:border-amber-500 hover:scale-110'
                }`}
              >
                <svg className="w-4 h-4 fill-current block shrink-0" viewBox="0 0 24 24">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                </svg>
              </a>
              {/* LinkedIn */}
              <a
                href="https://www.linkedin.com/company/adyapan-edutech-pvt-ltd/posts/?feedView=all"
                target="_blank"
                rel="noreferrer"
                aria-label="LinkedIn"
                className={`w-9 h-9 rounded-full inline-flex items-center justify-center transition-all duration-300 shadow-sm shrink-0 ${
                  isWhite
                    ? 'border border-orange-200 bg-orange-50/80 text-orange-600 hover:bg-orange-500 hover:text-white hover:border-orange-500 hover:scale-110'
                    : 'border border-[#3a3129] bg-[#221b14]/60 text-[#ff9a1f] hover:bg-amber-500 hover:text-stone-950 hover:border-amber-500 hover:scale-110'
                }`}
              >
                <svg className="w-3.5 h-3.5 fill-current block shrink-0" viewBox="0 0 24 24">
                  <path d="M4.98 3.5c0 1.381-1.11 2.5-2.48 2.5s-2.48-1.119-2.48-2.5c0-1.38 1.11-2.5 2.48-2.5s2.48 1.12 2.48 2.5zm.02 4.5h-5v16h5v-16zm7.982 0h-4.968v16h4.969v-8.399c0-4.67 6.029-5.052 6.029 0v8.399h4.988v-10.131c0-7.88-8.922-7.593-11.018-3.714v-2.155z" />
                </svg>
              </a>
              {/* YouTube */}
              <a
                href="https://www.youtube.com/@adyapan21"
                target="_blank"
                rel="noreferrer"
                aria-label="YouTube"
                className={`w-9 h-9 rounded-full inline-flex items-center justify-center transition-all duration-300 shadow-sm shrink-0 ${
                  isWhite
                    ? 'border border-orange-200 bg-orange-50/80 text-orange-600 hover:bg-orange-500 hover:text-white hover:border-orange-500 hover:scale-110'
                    : 'border border-[#3a3129] bg-[#221b14]/60 text-[#ff9a1f] hover:bg-amber-500 hover:text-stone-950 hover:border-amber-500 hover:scale-110'
                }`}
              >
                <svg className="w-4 h-4 fill-current block shrink-0" viewBox="0 0 24 24">
                  <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
                </svg>
              </a>
            </div>
          </div>

          {/* Column 2: Contact */}
          <div className="sm:col-span-1 lg:col-span-2 space-y-3">
            <h4
              className={`text-xs font-bold uppercase tracking-widest mb-4 ${
                isWhite ? 'text-slate-900' : 'text-white'
              }`}
            >
              Contact
            </h4>
            <a
              href="tel:8179124566"
              className={`group flex items-center gap-2.5 text-xs transition-all duration-300 hover:translate-x-1 ${
                isWhite
                  ? 'text-slate-600 hover:text-orange-600'
                  : 'text-[#a9a198] hover:text-amber-500'
              }`}
            >
              <Phone
                size={14}
                className={`transition-all duration-300 shrink-0 ${
                  isWhite ? 'text-orange-600' : 'text-[#ff9a1f]'
                }`}
              />
              <b className={`font-bold transition-colors duration-300 ${isWhite ? 'text-slate-800' : 'text-stone-200'}`}>
                +91 81791 24566
              </b>
            </a>
            <a
              href="mailto:support@adyapan.com"
              className={`group flex items-center gap-2.5 text-xs transition-all duration-300 hover:translate-x-1 ${
                isWhite
                  ? 'text-slate-600 hover:text-orange-600'
                  : 'text-[#a9a198] hover:text-amber-500'
              }`}
            >
              <Mail
                size={14}
                className={`transition-all duration-300 shrink-0 ${
                  isWhite ? 'text-orange-600' : 'text-[#ff9a1f]'
                }`}
              />
              <b className={`font-bold transition-colors duration-300 ${isWhite ? 'text-slate-800' : 'text-stone-200'}`}>
                support@adyapan.com
              </b>
            </a>
          </div>

          {/* Column 3: Head Office & Second Office */}
          <div className="sm:col-span-1 lg:col-span-3 space-y-4">
            <div>
              <h4
                className={`text-xs font-bold uppercase tracking-widest mb-2 ${
                  isWhite ? 'text-slate-900' : 'text-white'
                }`}
              >
                Head Office
              </h4>
              <a
                href="https://maps.google.com/?q=ADYAPAN+EDUTECH+PRIVATE+LIMITED+Shaikpet+Hyderabad+Telangana"
                target="_blank"
                rel="noreferrer"
                className={`group text-xs transition-all duration-300 block hover:translate-x-1 cursor-pointer`}
              >
                <b className={`font-bold block transition-colors duration-300 ${isWhite ? 'text-slate-800 group-hover:text-orange-500' : 'text-stone-200 group-hover:text-orange-400'}`}>
                  Adyapan Edutech Pvt Ltd
                </b>
                <span className={`text-[11px] block mt-0.5 leading-relaxed transition-colors duration-300 ${isWhite ? 'text-slate-500 group-hover:text-orange-500' : 'text-stone-400 group-hover:text-orange-400'}`}>
                  Sattva Magnus, Sabza Colony, Toli Chowki, Hyderabad, Telangana 500008
                </span>
              </a>
            </div>

            <div className="pt-2">
              <h4
                className={`text-xs font-bold uppercase tracking-widest mb-2 ${
                  isWhite ? 'text-slate-900' : 'text-white'
                }`}
              >
                Second Office
              </h4>
              <a
                href="https://maps.google.com/?q=ADYAPAN+EDUTECH+PRIVATE+LIMITED+Khajaguda+Rai+Durg+Hyderabad+500104"
                target="_blank"
                rel="noreferrer"
                className={`group text-xs transition-all duration-300 block hover:translate-x-1 cursor-pointer`}
              >
                <b className={`font-bold block transition-colors duration-300 ${isWhite ? 'text-slate-800 group-hover:text-orange-500' : 'text-stone-200 group-hover:text-orange-400'}`}>
                  Adyapan Edutech Pvt Ltd
                </b>
                <span className={`text-[11px] block mt-0.5 leading-relaxed transition-colors duration-300 ${isWhite ? 'text-slate-500 group-hover:text-orange-500' : 'text-stone-400 group-hover:text-orange-400'}`}>
                  Cluster_malkajgiri 82, X Road, Khajaguda - Nanakramguda Rd, Radhe Nagar, Rai Durg, Telangana 500104
                </span>
              </a>
            </div>
          </div>

          {/* Column 4: Third Office */}
          <div className="sm:col-span-2 lg:col-span-3 space-y-3">
            <h4
              className={`text-xs font-bold uppercase tracking-widest mb-2 ${
                isWhite ? 'text-slate-900' : 'text-white'
              }`}
            >
              Third Office
            </h4>
            <a
              href="https://www.google.com/maps/search/?api=1&query=ADYAPAN+EDUTECH+PRIVATE+LIMITED+Gachibowli+Hyderabad"
              target="_blank"
              rel="noreferrer"
              className={`group text-xs transition-all duration-300 block hover:translate-x-1 cursor-pointer`}
            >
              <b className={`font-bold block transition-colors duration-300 ${isWhite ? 'text-slate-800 group-hover:text-orange-500' : 'text-stone-200 group-hover:text-orange-400'}`}>
                Adyapan Edutech Pvt Ltd
              </b>
              <span className={`text-[11px] block mt-0.5 leading-relaxed transition-colors duration-300 ${isWhite ? 'text-slate-500 group-hover:text-orange-500' : 'text-stone-400 group-hover:text-orange-400'}`}>
                IndiQube Pearl, Mindspace Rd, Gachibowli, Hyderabad, Telangana 500032
              </span>
            </a>
          </div>
        </div>

        {/* Footer Bottom Strip */}
        <div
          className={`pt-6 border-t flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] ${
            isWhite ? 'border-slate-200 text-slate-500' : 'border-[#302a24] text-[#777]'
          }`}
        >
          <span>
            © 2026{' '}
            <b className={isWhite ? 'text-slate-800 font-bold' : 'text-[#a9a198] font-bold'}>
              SR's Adyapan Edutech Pvt. Ltd.
            </b>{' '}
            All rights reserved.
          </span>
          <div className="flex items-center gap-6">
            <Link
              to="/privacy"
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
              className={`transition-all duration-300 cursor-pointer ${
                isWhite ? 'text-slate-600 hover:text-orange-600' : 'text-[#888] hover:text-amber-500'
              }`}
            >
              Privacy
            </Link>
            <Link
              to="/terms"
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
              className={`transition-all duration-300 cursor-pointer ${
                isWhite ? 'text-slate-600 hover:text-orange-600' : 'text-[#888] hover:text-amber-500'
              }`}
            >
              Terms
            </Link>
            <Link
              to="/support"
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
              className={`transition-all duration-300 cursor-pointer ${
                isWhite ? 'text-slate-600 hover:text-orange-600' : 'text-[#888] hover:text-amber-500'
              }`}
            >
              Support
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
