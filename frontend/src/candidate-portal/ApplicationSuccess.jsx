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
    <div className={`min-h-screen font-sans antialiased flex flex-col items-center justify-center p-6 transition-colors ${theme === 'dark' ? 'bg-slate-950 text-slate-100' : 'bg-gradient-to-br from-slate-50 via-white to-amber-50/20 text-slate-900'
      }`}>
      {/* Navigation Bar */}
      <div className="w-full max-w-md flex items-center justify-between mb-6">
        <Link to="/careers">
          <AdyapanLogo variant={theme === 'dark' ? 'dark' : 'light'} size="normal" />
        </Link>
        <button
          onClick={toggleTheme}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-extrabold border ${theme === 'dark' ? 'bg-slate-900 text-amber-300 border-slate-800' : 'bg-white text-slate-900 border-slate-200 shadow-sm'
            }`}
        >
          {theme === 'dark' ? 'Dark' : 'Light'}
        </button>
      </div>

      <div className={`max-w-md w-full p-8 rounded-3xl text-center space-y-6 shadow-2xl border relative overflow-hidden ${theme === 'dark' ? 'bg-slate-900 border-slate-800' : 'bg-white border-amber-200/80'
        }`}>
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500" />

        <div className="w-16 h-16 bg-amber-500/20 text-amber-500 border border-amber-500/30 rounded-2xl flex items-center justify-center text-3xl mx-auto shadow-md pt-1">
          </div>

        <div className="space-y-2">
          <h1 className="text-2xl font-black text-slate-900 dark:text-white">Application Submitted!</h1>
          <p className="text-xs font-bold text-slate-600 dark:text-slate-300 leading-relaxed">
            Thank you, <strong className="text-slate-900 dark:text-white font-black">{state.candidateName || 'Applicant'}</strong>. Your application for{' '}
            <strong className="text-amber-600 dark:text-amber-400 font-black">{state.jobTitle || 'the role'}</strong> at Adyapan Edutech has been received.
          </p>
        </div>

        <div className={`p-4 rounded-2xl border text-left text-xs space-y-2.5 ${theme === 'dark' ? 'bg-slate-950/80 border-slate-800 text-slate-200' : 'bg-white border-amber-200/60 text-slate-800'
          }`}>
          <p className="flex items-center gap-2 font-bold">
            <span className="text-emerald-500 font-extrabold"></span> AI Screening Complete ({state.score || 92}% Match Score).
          </p>
          <p className="flex items-center gap-2 font-bold">
            <span className="text-emerald-500 font-extrabold"></span> Recruiter HR Notification Dispatched.
          </p>
          <p className="flex items-center gap-2 font-bold">
            <span className="text-emerald-500 font-extrabold"></span> Application Ref ID: <code className="text-amber-600 dark:text-amber-400 font-mono font-bold">APP-ADY-{Date.now().toString().slice(-6)}</code>
          </p>
        </div>

        <div className="pt-2">
          <Link
            to="/careers"
            className="inline-block w-full py-3.5 text-xs font-black text-slate-950 bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 hover:from-amber-400 hover:to-amber-400 rounded-2xl transition-all shadow-xl shadow-amber-500/25 uppercase tracking-wider"
          >
            Explore More Role Opportunities →
          </Link>
        </div>
      </div>
      <div className="w-full mt-12">
        <Footer />
      </div>
    </div>
  );
};

export default ApplicationSuccess;
