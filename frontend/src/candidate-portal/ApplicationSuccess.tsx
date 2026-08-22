import React, { useMemo } from 'react';
import { useLocation, Link } from 'react-router-dom';
import {
  ArrowRight,
  Briefcase,
  Calendar,
  CheckCircle2,
  Clock3,
  FileCheck,
  Globe2,
  Mail,
  MapPin,
  MessageSquare,
  ShieldCheck,
  Sparkles,
  UserCheck,
} from 'lucide-react';
import SiteShell from '../components/layout/SiteShell';

export const ApplicationSuccess: React.FC = () => {
  const location = useLocation();
  const state = location.state || {};

  const refId = useMemo(() => {
    return `APP-ADY-${Math.floor(100000 + Math.random() * 900000)}`;
  }, []);

  const submissionDate = useMemo(() => {
    return new Date().toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  }, []);

  return (
    <SiteShell>
      <main className="bg-[#faf7f2] dark:bg-[#121110] text-stone-900 dark:text-stone-100 min-h-screen relative py-16">

        {/* Ambient Decorative Glows */}
        <div className="absolute inset-0 bg-dotted-grid pointer-events-none opacity-35" />
        <div className="absolute top-1/4 left-1/3 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 space-y-8">

          {/* ── MAIN SUCCESS CARD ── */}
          <div className="bg-white dark:bg-stone-900 rounded-3xl p-8 sm:p-12 border border-stone-200/80 dark:border-stone-800 shadow-2xl text-center space-y-7 relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-amber-500 via-orange-500 to-amber-500" />

            {/* Celebration Badge */}
            <div className="w-20 h-20 bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 rounded-3xl flex items-center justify-center mx-auto shadow-lg shadow-emerald-500/10 animate-bounce">
              <CheckCircle2 size={42} />
            </div>

            {/* Headings & Context */}
            <div className="space-y-3">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/25 text-emerald-700 dark:text-emerald-300 font-black text-xs uppercase tracking-wider">
                <Sparkles size={14} className="text-emerald-500" />
                <span>APPLICATION RECEIVED</span>
              </div>

              <h1 className="text-3xl sm:text-4xl font-black text-stone-900 dark:text-white tracking-tight">
                You're officially in. 🎉
              </h1>

              <p className="text-sm sm:text-base text-stone-600 dark:text-stone-300 font-medium max-w-lg mx-auto leading-relaxed">
                Thank you, <strong className="text-stone-900 dark:text-white font-extrabold">{state.candidateName || 'Applicant'}</strong>. Your application for{' '}
                <strong className="text-amber-600 dark:text-amber-400 font-black">{state.jobTitle || 'Career Opportunity'}</strong> has been submitted to the Adyapan talent acquisition team.
              </p>
            </div>

            {/* Application Metadata Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-5 rounded-2xl bg-stone-100 dark:bg-stone-800 border border-stone-200/60 dark:border-stone-700 text-left text-xs">
              <div className="space-y-1">
                <span className="text-stone-400 font-bold uppercase text-[10px] tracking-wider block">
                  Application Reference
                </span>
                <b className="font-mono font-black text-amber-600 dark:text-amber-400 text-sm">
                  {refId}
                </b>
              </div>

              <div className="space-y-1 sm:text-right">
                <span className="text-stone-400 font-bold uppercase text-[10px] tracking-wider block">
                  Submission Date
                </span>
                <b className="font-extrabold text-stone-800 dark:text-stone-200 text-xs">
                  {submissionDate}
                </b>
              </div>
            </div>

            {/* ── VERTICAL NEXT STEPS TIMELINE ── */}
            <div className="space-y-4 text-left pt-2 border-t border-stone-100 dark:border-stone-800">
              <span className="text-xs font-black uppercase tracking-wider text-stone-500 dark:text-stone-400 block">
                What happens next?
              </span>

              <div className="space-y-3.5 text-xs font-semibold">
                {[
                  { step: '01', title: 'Application Received', desc: 'Profile and resume indexed in Adyapan ATS', isDone: true, icon: FileCheck },
                  { step: '02', title: 'Resume Review', desc: 'HR talent team verifies experience and skill alignment', isCurrent: true, icon: UserCheck },
                  { step: '03', title: 'Recruiter Evaluation', desc: 'Telephonic pre-screening and culture fitment discussion', isPending: true, icon: MessageSquare },
                  { step: '04', title: 'Technical / Domain Interview', desc: '1-on-1 interview with hiring lead and domain mentors', isPending: true, icon: Briefcase },
                  { step: '05', title: 'Final Selection & Offer Rollout', desc: 'Fast-track offer release and onboarding orientation', isPending: true, icon: ShieldCheck },
                ].map((item) => {
                  const Icon = item.icon;
                  return (
                    <div key={item.step} className="flex items-start gap-3.5 p-3 rounded-xl bg-stone-50/70 dark:bg-stone-800/70 border border-stone-200/40 dark:border-stone-700">
                      <div
                        className={`w-7 h-7 rounded-lg flex items-center justify-center font-black text-[11px] shrink-0 ${
                          item.isDone
                            ? 'bg-emerald-500 text-white'
                            : item.isCurrent
                            ? 'bg-amber-500 text-white animate-pulse'
                            : 'bg-stone-200 dark:bg-stone-700 text-stone-500'
                        }`}
                      >
                        {item.isDone ? '✓' : item.step}
                      </div>
                      <div className="space-y-0.5">
                        <b className={`text-xs font-black block ${item.isCurrent ? 'text-amber-600 dark:text-amber-400' : 'text-stone-900 dark:text-white'}`}>
                          {item.title}
                        </b>
                        <p className="text-[11px] text-stone-500 font-medium">
                          {item.desc}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Reassurance Microcopy */}
            <p className="text-xs text-stone-500 font-medium italic">
              "We'll contact you through the email or phone number provided in your application if your profile moves forward."
            </p>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
              <Link
                to="/open-positions"
                className="w-full sm:flex-1 py-3.5 px-6 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-extrabold text-xs shadow-xl shadow-amber-500/25 transition-all text-center cursor-pointer"
              >
                Explore More Opportunities
              </Link>
              <Link
                to="/careers"
                className="w-full sm:flex-1 py-3.5 px-6 rounded-2xl border border-stone-200 dark:border-stone-700 hover:border-amber-500 text-stone-800 dark:text-stone-200 font-bold text-xs bg-stone-100 dark:bg-stone-800 transition-all text-center cursor-pointer"
              >
                Back to Careers Home
              </Link>
            </div>

          </div>

        </div>

      </main>
    </SiteShell>
  );
};

export default ApplicationSuccess;
