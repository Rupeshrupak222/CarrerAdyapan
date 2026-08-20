import React from 'react';
import { useLocation, Link } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import AdyapanLogo from '../components/common/AdyapanLogo';
import Footer from '../components/layout/Footer';

const ApplicationSuccess = () => {
  const location = useLocation();
  const state = location.state || {};
  const { theme, toggleTheme } = useTheme();

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
            className={`p-2 rounded-xl transition-colors border ${
              theme === 'dark' ? 'bg-slate-900 text-amber-300 border-slate-800' : 'bg-white text-slate-600 border-slate-200 shadow-sm'
            }`}
            aria-label="Toggle theme"
          >
            {theme === 'dark' ? '🌙' : '☀️'}
          </button>
        </div>
      </nav>

      {/* Main Success Card */}
      <main className="max-w-lg w-full px-4 py-12 relative z-10">
        <div className={`p-8 sm:p-10 rounded-3xl text-center space-y-6 shadow-2xl border relative overflow-hidden ${
          theme === 'dark' ? 'bg-slate-900/90 border-slate-800' : 'bg-white border-amber-200/80 shadow-amber-500/10'
        }`}>
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-amber-500 via-amber-400 to-orange-500" />

          <div className="w-16 h-16 bg-emerald-500/15 text-emerald-500 border border-emerald-500/30 rounded-2xl flex items-center justify-center text-3xl mx-auto shadow-md">
            ✓
          </div>

          <div className="space-y-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30">
              ● ACCOUNT CREATED & SAVED IN DATABASE
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
              Application Submitted!
            </h1>
            <p className="text-xs font-bold text-slate-600 dark:text-slate-300 leading-relaxed">
              Thank you, <strong className="text-slate-900 dark:text-white font-black">{state.candidateName || 'Applicant'}</strong>. Your application for{' '}
              <strong className="text-amber-600 dark:text-amber-400 font-black">{state.jobTitle || 'the position'}</strong> at Adyapan Edutech has been successfully stored in our database.
            </p>
          </div>

          <div className={`p-5 rounded-2xl border text-left text-xs space-y-3 ${
            theme === 'dark' ? 'bg-slate-950/80 border-slate-800 text-slate-200' : 'bg-amber-50/40 border-amber-200/80 text-slate-800'
          }`}>
            <p className="flex items-center gap-2 font-bold">
              <span className="text-emerald-500 font-extrabold text-sm">✓</span>
              <span>Candidate Account Registered & Logged In</span>
            </p>
            <p className="flex items-center gap-2 font-bold">
              <span className="text-emerald-500 font-extrabold text-sm">✓</span>
              <span>AI ATS Resume Match Score: <strong className="text-amber-600 dark:text-amber-400">{state.score || 88}%</strong></span>
            </p>
            <p className="flex items-center gap-2 font-bold">
              <span className="text-emerald-500 font-extrabold text-sm">✓</span>
              <span>Recruiter HR Notification Dispatched</span>
            </p>
            <p className="flex items-center gap-2 font-bold text-slate-500">
              <span className="text-slate-400 text-sm">📋</span>
              <span>Ref ID: <code className="text-amber-600 dark:text-amber-400 font-mono font-bold">APP-ADY-{Date.now().toString().slice(-6)}</code></span>
            </p>
          </div>

          <div className="space-y-3 pt-2">
            <Link
              to="/my-applications"
              className="inline-flex items-center justify-center gap-2 w-full py-4 text-xs font-black text-slate-950 bg-gradient-to-r from-amber-400 via-amber-500 to-orange-500 hover:from-amber-300 hover:to-orange-400 rounded-2xl transition-all shadow-xl shadow-amber-500/25 uppercase tracking-wider hover:scale-[1.02] active:scale-[0.98]"
            >
              <span>Go to My Candidate Dashboard</span>
              <span>→</span>
            </Link>

            <Link
              to="/open-positions"
              className={`inline-block w-full py-3 text-xs font-bold rounded-2xl border transition-all ${
                theme === 'dark'
                  ? 'border-slate-800 text-slate-300 hover:bg-slate-800'
                  : 'border-slate-200 text-slate-700 hover:bg-slate-100'
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
