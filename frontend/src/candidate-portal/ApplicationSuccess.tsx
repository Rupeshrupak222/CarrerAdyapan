import React, { useMemo } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import AdyapanLogo from '../components/common/AdyapanLogo';
import Footer from '../components/layout/Footer';

const ApplicationSuccess = () => {
  const location = useLocation();
  const state = location.state || {};
  const { theme, toggleTheme } = useTheme();

  const refId = useMemo(() => {
    return `APP-ADY-${Math.floor(100000 + Math.random() * 900000)}`;
  }, []);

  return (
    <div className={`min-h-screen font-sans antialiased flex flex-col items-center justify-between transition-colors relative overflow-x-hidden ${
      theme === 'dark' ? 'bg-[#0a0a1a] text-slate-100' : 'bg-slate-50/60 text-slate-900'
    }`}>
      
      {/* Glow Effect */}
      <div className="fixed top-0 right-0 w-[50vw] h-full pointer-events-none bg-gradient-to-l from-orange-400/20 via-amber-200/10 to-transparent dark:from-amber-500/10 dark:to-transparent blur-3xl z-0" />

      {/* Navigation Bar */}
      <nav className={`w-full sticky top-0 z-50 px-4 sm:px-8 py-4 border-b backdrop-blur-xl transition-all ${
        theme === 'dark' ? 'bg-[#0a0a1a]/90 border-slate-800' : 'bg-white/90 border-amber-200/40'
      }`}>
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <Link to="/careers">
            <AdyapanLogo variant={theme === 'dark' ? 'dark' : 'light'} size="small" />
          </Link>
          <button
            onClick={toggleTheme}
            className={`p-2 rounded-xl transition-colors border cursor-pointer ${
              theme === 'dark' ? 'bg-slate-900 text-amber-300 border-slate-800' : 'bg-white text-slate-600 border-slate-200 shadow-sm'
            }`}
            aria-label="Toggle theme"
            title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          >
            {theme === 'dark' ? '🌙' : '☀️'}
          </button>
        </div>
      </nav>

      {/* Main Success Card */}
      <main className="max-w-lg w-full px-4 py-12 relative z-10">
        <div className={`p-8 sm:p-10 rounded-3xl text-center space-y-6 shadow-2xl border relative overflow-hidden ${
          theme === 'dark' ? 'bg-slate-900/90 border-slate-800 shadow-slate-950' : 'bg-white border-amber-200/80 shadow-amber-500/10'
        }`}>
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-amber-500 via-amber-400 to-orange-500" />

          {/* Success Checkmark Icon */}
          <div className="w-16 h-16 bg-emerald-500/15 text-emerald-500 border border-emerald-500/30 rounded-2xl flex items-center justify-center text-3xl mx-auto shadow-md">
            ✓
          </div>

          {/* Title & Personalized Note */}
          <div className="space-y-2.5">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30">
              ● APPLICATION SUBMITTED SUCCESSFULLY
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
              Application Received!
            </h1>
            <p className="text-xs sm:text-sm font-medium text-slate-600 dark:text-slate-300 leading-relaxed">
              Thank you, <strong className="text-slate-900 dark:text-white font-extrabold">{state.candidateName || 'Applicant'}</strong>. Your application for{' '}
              <strong className="text-amber-600 dark:text-amber-400 font-extrabold">{state.jobTitle || 'the position'}</strong> has been received by the Adyapan Talent Acquisition team.
            </p>
          </div>

          {/* Professional Next Steps Box */}
          <div className={`p-5 rounded-2xl border text-left text-xs space-y-3.5 ${
            theme === 'dark' ? 'bg-slate-950/80 border-slate-800 text-slate-200' : 'bg-amber-50/40 border-amber-200/80 text-slate-800'
          }`}>
            <p className="font-extrabold text-xs uppercase tracking-wider text-amber-600 dark:text-amber-400">
              What happens next?
            </p>
            <p className="flex items-start gap-2.5 leading-relaxed">
              <span className="text-emerald-500 font-extrabold text-sm shrink-0">✓</span>
              <span>Your resume and profile have been routed to our hiring managers.</span>
            </p>
            <p className="flex items-start gap-2.5 leading-relaxed">
              <span className="text-emerald-500 font-extrabold text-sm shrink-0">✓</span>
              <span>If your profile matches our requirements, our recruitment team will reach out via email/phone for the next interview round.</span>
            </p>
            <div className="pt-2 border-t border-slate-200/60 dark:border-slate-800 flex items-center justify-between text-slate-500 dark:text-slate-400 font-bold">
              <span>Application Reference:</span>
              <code className="text-amber-600 dark:text-amber-400 font-mono font-bold">{refId}</code>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-3 pt-2">
            <Link
              to="/careers"
              className="inline-flex items-center justify-center gap-2 w-full py-4 text-xs font-black text-slate-950 bg-gradient-to-r from-amber-400 via-amber-500 to-orange-500 hover:from-amber-300 hover:to-orange-400 rounded-2xl transition-all shadow-xl shadow-amber-500/25 uppercase tracking-wider hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
            >
              <span>Go to Home</span>
              <span>→</span>
            </Link>

            <Link
              to="/open-positions"
              className={`inline-block w-full py-3.5 text-xs font-bold rounded-2xl border transition-all cursor-pointer ${
                theme === 'dark'
                  ? 'border-slate-800 text-slate-300 hover:bg-slate-800 hover:text-white'
                  : 'border-slate-200 text-slate-700 hover:bg-slate-100 hover:text-slate-900 shadow-sm'
              }`}
            >
              Browse More Open Positions
            </Link>
          </div>
        </div>
      </main>

      <Footer isPublic={true} />

    </div>
  );
};

export default ApplicationSuccess;
