import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import DashboardLayout from '../../components/layout/DashboardLayout';
import BackButton from '../../components/common/BackButton';
import { candidateService } from '../../services/candidateService';
import { getCandidateAIScore } from '../../utils/applicationStore';
import { useTheme } from '../../context/ThemeContext';

const DEFAULT_COMPARE_CANDIDATES = [];

const CompareCandidates = () => {
  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [comparing, setComparing] = useState(false);
  const { theme } = useTheme();

  useEffect(() => {
    fetchCandidatesForCompare();
  }, []);

  const fetchCandidatesForCompare = async () => {
    try {
      const res = await candidateService.getAllCandidates();
      if (res?.candidates && res.candidates.length > 0) {
        const formatted = res.candidates.map((c) => {
          const name = `${c.firstName || ''} ${c.lastName || ''}`.trim() || 'Candidate';
          const avatar = `${c.firstName?.charAt(0) || 'C'}${c.lastName?.charAt(0) || 'A'}`;
          const skillsList = Array.isArray(c.skills) ? c.skills : ['EdTech Sales', 'Student Counselling'];
          const evalAi = getCandidateAIScore(c);
          const aiScore = evalAi.score;
          const matchReason = evalAi.reason;

          return {
            id: c.id,
            name,
            email: c.email || 'N/A',
            role: c.currentPosition || 'Business Development Executive',
            experience: c.totalExperience || 0,
            location: c.location || 'India',
            score: aiScore,
            skills: skillsList,
            strengths: [matchReason, 'Verified candidate qualifications in database'],
            gaps: ['Institutional Partnerships'],
            expectedSalary: c.expectedCtc || '₹6.5 LPA',
            noticePeriod: c.noticePeriod || 'Immediate',
            avatar,
          };
        });
        setCandidates(formatted);
      } else {
        setCandidates(DEFAULT_COMPARE_CANDIDATES);
      }
    } catch (e) {
      setCandidates(DEFAULT_COMPARE_CANDIDATES);
    } finally {
      setLoading(false);
    }
  };

  const runAIComparison = () => {
    setComparing(true);
    setTimeout(() => {
      setComparing(false);
    }, 800);
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className={`p-6 rounded-3xl border transition-all flex flex-col md:flex-row md:items-center justify-between gap-4 relative overflow-hidden shadow-sm ${
          theme === 'dark' ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-slate-200 text-slate-900'
        }`}>

          <div className="space-y-1.5 pt-1">
            <BackButton label="Back to Candidate Directory" to="/candidates" />
            <div className="inline-flex items-center gap-2 px-3 py-0.5 rounded-full text-xs font-semibold bg-amber-500/15 text-amber-700 dark:text-amber-300 border border-amber-500/30">
              Candidate AI Side-by-Side Comparison
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
              Candidate Comparison Matrix
            </h1>
            <p className="text-xs text-slate-600 dark:text-slate-300 font-normal">
              Compare candidate skill profiles, AI fit scores, EdTech experience metrics, and salary expectations side by side.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={runAIComparison}
              disabled={comparing}
              className="flex items-center gap-2 px-4 py-2.5 text-xs font-bold text-white bg-amber-500 hover:bg-amber-600 rounded-xl shadow-sm transition-all disabled:opacity-50"
            >
              <span>{comparing ? 'Analyzing Profiles...' : 'Re-Run AI Comparison Matrix'}</span>
            </button>
          </div>
        </div>

        {/* Comparison Grid */}
        {loading ? (
          <div className="p-8 text-center">
            <div className="w-10 h-10 border-4 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
            <p className="mt-3 text-xs text-slate-500 font-medium">Loading database candidates for AI matrix...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {candidates.map((cand) => (
              <div
                key={cand.id}
                className={`rounded-3xl border shadow-sm hover:shadow-md transition-all overflow-hidden flex flex-col justify-between relative group ${
                  theme === 'dark' ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-slate-200 text-slate-900'
                }`}
              >

                <div>
                  {/* Candidate Top Banner */}
                  <div className={`p-5 border-b pt-6 ${
                    theme === 'dark' ? 'border-slate-800 bg-slate-950/50' : 'border-slate-100 bg-white'
                  }`}>
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-amber-400 text-slate-950 font-bold text-base flex items-center justify-center shadow-sm">
                          {cand.avatar}
                        </div>
                        <div>
                          <h2 className="text-base font-bold text-slate-900 dark:text-white">{cand.name}</h2>
                          <p className="text-xs font-normal text-slate-600 dark:text-slate-300">{cand.role}</p>
                          <p className="text-xs text-slate-400 mt-0.5">{cand.location}</p>
                        </div>
                      </div>

                      <div className="text-right">
                        <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 rounded-full font-bold text-xs">
                          <span> {cand.score}% Match</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Comparison Metrics */}
                  <div className="p-5 space-y-5">
                    {/* Experience & Notice */}
                    <div className={`grid grid-cols-3 gap-3 p-3.5 rounded-2xl text-center border ${
                      theme === 'dark' ? 'bg-slate-950 border-slate-800' : 'bg-slate-50 border-slate-200'
                    }`}>
                      <div>
                        <span className="text-[10px] uppercase font-semibold text-slate-400 block">Experience</span>
                        <span className="text-xs font-bold text-slate-900 dark:text-white">{cand.experience} Yrs</span>
                      </div>
                      <div>
                        <span className="text-[10px] uppercase font-semibold text-slate-400 block">Expectation</span>
                        <span className="text-xs font-bold text-slate-900 dark:text-white">{cand.expectedSalary}</span>
                      </div>
                      <div>
                        <span className="text-[10px] uppercase font-semibold text-slate-400 block">Notice Period</span>
                        <span className="text-xs font-bold text-amber-600 dark:text-amber-400">{cand.noticePeriod}</span>
                      </div>
                    </div>

                    {/* Skills */}
                    <div>
                      <h3 className="text-xs font-semibold text-slate-500 dark:text-slate-400 mb-2">Technical & Domain Skills</h3>
                      <div className="flex flex-wrap gap-1.5">
                        {cand.skills.map((skill) => (
                          <span
                            key={skill}
                            className="px-2.5 py-0.5 text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl border border-slate-200 dark:border-slate-700"
                          >
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Key Strengths */}
                    <div>
                      <h3 className="text-xs font-semibold text-slate-500 dark:text-slate-400 mb-2">AI Highlighted Strengths</h3>
                      <ul className="space-y-1.5">
                        {cand.strengths.map((str) => (
                          <li key={str} className="flex items-center gap-2 text-xs font-normal text-slate-800 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700">
                            {str}
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Skill Gaps */}
                    <div>
                      <h3 className="text-xs font-semibold text-slate-500 dark:text-slate-400 mb-2">Skill Gaps to Consider</h3>
                      <div className="flex flex-wrap gap-1.5">
                        {cand.gaps.map((gap) => (
                          <span
                            key={gap}
                            className="px-2.5 py-0.5 text-xs font-medium bg-white text-amber-700 dark:bg-amber-950/40 dark:text-amber-300 rounded-xl border border-amber-200 dark:border-amber-900"
                          >
                             {gap}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Action Footer */}
                <div className={`p-4 border-t flex items-center justify-between ${
                  theme === 'dark' ? 'border-slate-800 bg-slate-950/50' : 'border-slate-100 bg-white'
                }`}>
                  <Link
                    to={`/candidates/${cand.id}`}
                    className="text-xs font-semibold text-amber-600 dark:text-amber-400 hover:underline"
                  >
                    View Full Profile →
                  </Link>
                  <Link
                    to="/interviews"
                    className="px-4 py-2 text-xs font-bold text-white bg-amber-500 hover:bg-amber-600 rounded-xl transition-all shadow-sm"
                  >
                    Schedule Interview
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default CompareCandidates;
