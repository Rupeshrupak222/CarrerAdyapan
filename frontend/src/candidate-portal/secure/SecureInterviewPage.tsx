import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { 
  Calendar, 
  Clock, 
  Video, 
  Building2, 
  User, 
  CheckCircle2, 
  AlertCircle, 
  ExternalLink,
  ShieldCheck,
  Sparkles,
  HelpCircle
} from 'lucide-react';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const SecureInterviewPage: React.FC = () => {
  const { token } = useParams<{ token: string }>();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [interviewData, setInterviewData] = useState<any>(null);

  useEffect(() => {
    fetchInterviewDetails();
  }, [token]);

  const fetchInterviewDetails = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await axios.get(`${API_BASE}/interviews/token/${token}`);
      if (res.data?.success) {
        setInterviewData(res.data);
      } else {
        setError(res.data?.message || 'Invalid or expired interview link.');
      }
    } catch (err: any) {
      setError(err?.response?.data?.message || 'This interview link is invalid or has expired. Please contact your HR manager.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
        <div className="flex flex-col items-center gap-4 text-center">
          <div className="w-12 h-12 border-4 border-amber-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-slate-400 font-medium text-sm">Verifying secure interview credentials...</p>
        </div>
      </div>
    );
  }

  if (error || !interviewData) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-slate-900 border border-slate-800 rounded-3xl p-8 text-center shadow-2xl">
          <div className="w-16 h-16 bg-red-500/10 text-red-400 rounded-2xl flex items-center justify-center mx-auto mb-5">
            <AlertCircle className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-bold text-white mb-2">Link Expired or Invalid</h2>
          <p className="text-slate-400 text-sm mb-6 leading-relaxed">
            {error || 'We could not verify this interview link. It may have expired or already been completed.'}
          </p>
          <a
            href="mailto:support@adyapan.com"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-sm transition-all"
          >
            <HelpCircle className="w-4 h-4" /> Contact HR Support
          </a>
        </div>
      </div>
    );
  }

  const { interview, candidate, job } = interviewData;
  const scheduledDate = new Date(interview.scheduledAt);
  const formattedDate = scheduledDate.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
  const formattedTime = scheduledDate.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  });

  const meetUrl = interview.meetingLink || 'https://meet.google.com/adyapan-interview';

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between py-8 px-4 sm:px-6">
      {/* Top Navbar */}
      <header className="max-w-4xl w-full mx-auto flex items-center justify-between pb-6 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-amber-500 to-amber-600 flex items-center justify-center text-slate-950 font-black text-xl shadow-lg shadow-amber-500/20">
            A
          </div>
          <div>
            <span className="font-extrabold text-lg text-white tracking-tight">Adyapan Edutech</span>
            <span className="block text-[11px] font-semibold text-amber-400 uppercase tracking-widest">Hiring Portal</span>
          </div>
        </div>

        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold">
          <ShieldCheck className="w-4 h-4" />
          <span>Encrypted Session</span>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-3xl w-full mx-auto my-8">
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-10 shadow-2xl">
          {/* Header Banner */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-8 border-b border-slate-800">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-bold uppercase tracking-wider mb-3">
                <Sparkles className="w-3.5 h-3.5" />
                {interview.roundName || `Round ${interview.roundNumber}`}
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
                Interview Scheduled
              </h1>
              <p className="text-slate-400 text-sm mt-1">
                Candidate: <strong className="text-slate-200">{candidate?.firstName} {candidate?.lastName}</strong> ({candidate?.email})
              </p>
            </div>

            <div className="px-4 py-2 rounded-2xl bg-slate-800/80 border border-slate-700/60 text-right">
              <span className="text-[11px] uppercase tracking-wider text-slate-400 font-semibold block">Position</span>
              <span className="text-sm font-bold text-amber-400">{job?.title || interview.jobTitle}</span>
            </div>
          </div>

          {/* Key Schedule Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 my-8">
            <div className="p-5 rounded-2xl bg-slate-950/60 border border-slate-800/80 flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center shrink-0">
                <Calendar className="w-6 h-6" />
              </div>
              <div>
                <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">Date</span>
                <p className="text-base font-bold text-white mt-0.5">{formattedDate}</p>
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-slate-950/60 border border-slate-800/80 flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center shrink-0">
                <Clock className="w-6 h-6" />
              </div>
              <div>
                <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">Time & Duration</span>
                <p className="text-base font-bold text-white mt-0.5">{formattedTime} ({interview.duration || 30} Mins)</p>
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-slate-950/60 border border-slate-800/80 flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center shrink-0">
                <User className="w-6 h-6" />
              </div>
              <div>
                <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">Assigned HR Interviewer</span>
                <p className="text-base font-bold text-white mt-0.5">{interview.hr?.name || 'Talent Acquisition Team'}</p>
                <span className="text-xs text-slate-400">{interview.hr?.designation || 'HR Specialist'}</span>
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-slate-950/60 border border-slate-800/80 flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center shrink-0">
                <Building2 className="w-6 h-6" />
              </div>
              <div>
                <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">Mode</span>
                <p className="text-base font-bold text-white mt-0.5">Online Video (Google Meet)</p>
              </div>
            </div>
          </div>

          {/* Join Call CTA Button */}
          <div className="p-6 rounded-2xl bg-gradient-to-br from-amber-500/10 via-amber-600/5 to-transparent border border-amber-500/30 text-center my-6">
            <h3 className="text-lg font-bold text-white mb-2">Ready for your Interview?</h3>
            <p className="text-slate-300 text-sm max-w-md mx-auto mb-5 leading-relaxed">
              Please join 5 minutes prior to the scheduled time. Click the button below to open your direct Google Meet call.
            </p>

            <a
              href={meetUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2.5 px-8 py-4 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-extrabold text-base transition-all shadow-xl shadow-amber-500/20 hover:scale-[1.02] active:scale-[0.98]"
            >
              <Video className="w-5 h-5" />
              Join Google Meet Interview
              <ExternalLink className="w-4 h-4 opacity-75" />
            </a>

            <p className="text-xs text-slate-500 mt-4 break-all">
              Direct Link: <a href={meetUrl} target="_blank" rel="noopener noreferrer" className="text-amber-400 underline">{meetUrl}</a>
            </p>
          </div>

          {/* Preparation Instructions */}
          <div className="mt-8 pt-6 border-t border-slate-800">
            <h4 className="text-sm font-bold text-slate-300 uppercase tracking-wider mb-4 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" /> Important Guidelines
            </h4>
            <ul className="space-y-2.5 text-xs sm:text-sm text-slate-400">
              <li className="flex items-start gap-2">
                <span className="text-amber-400 font-bold">•</span>
                Ensure a stable high-speed internet connection and quiet environment.
              </li>
              <li className="flex items-start gap-2">
                <span className="text-amber-400 font-bold">•</span>
                Keep your camera on and test your microphone beforehand.
              </li>
              <li className="flex items-start gap-2">
                <span className="text-amber-400 font-bold">•</span>
                Have your updated resume and portfolio ready for screen share if requested.
              </li>
            </ul>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="text-center text-xs text-slate-600 py-4">
        &copy; {new Date().getFullYear()} Adyapan Edutech Pvt. Ltd. All rights reserved. Secure recruitment automation system.
      </footer>
    </div>
  );
};

export default SecureInterviewPage;
