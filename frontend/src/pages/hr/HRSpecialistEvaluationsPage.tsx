import React, { useState, useEffect, useMemo } from 'react';
import { 
  FileText, 
  RotateCw, 
  Search, 
  CheckCircle2, 
  XCircle, 
  Star, 
  Calendar,
  MessageSquare,
  Award
} from 'lucide-react';
import toast from 'react-hot-toast';
import DashboardLayout from '../../components/layout/DashboardLayout';
import interviewService from '../../services/interviewService';
import { useAuth } from '../../context/AuthContext';

export const HRSpecialistEvaluationsPage: React.FC = () => {
  const { user } = useAuth();
  const [interviews, setInterviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  const loadData = async () => {
    setLoading(true);
    try {
      const res = await interviewService.getAllInterviews();
      const list = res.interviews || res.data || (Array.isArray(res) ? res : []);
      // Filter evaluations submitted by this specialist or assigned to them
      const myEvaluations = list.filter((i: any) =>
        i.hrId === user?.id || i.interviewerId === user?.id || (i.feedback && i.status === 'COMPLETED')
      );
      setInterviews(myEvaluations);
    } catch (err: any) {
      toast.error('Failed to load evaluations: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [user?.id]);

  const filteredInterviews = useMemo(() => {
    return interviews.filter((item) => {
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const cand = (item.candidateName || '').toLowerCase();
        const email = (item.candidateEmail || '').toLowerCase();
        const job = (item.jobTitle || '').toLowerCase();
        if (!cand.includes(q) && !email.includes(q) && !job.includes(q)) {
          return false;
        }
      }
      return true;
    });
  }, [interviews, searchQuery]);

  return (
    <DashboardLayout>
      <div className="space-y-6 animate-fadeIn pb-12">
        {/* Header Title */}
        <div className="p-6 rounded-2xl bg-white border border-slate-200 flex flex-col lg:flex-row lg:items-center justify-between gap-4 shadow-xs">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-extrabold text-orange-600 uppercase tracking-wider block">
                Evaluation History
              </span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-orange-100 text-orange-800">
                📝 Scorecards & Feedback Records
              </span>
            </div>
            <h1 className="text-2xl font-black text-slate-900 mt-1">Interview Evaluations</h1>
            <p className="text-slate-500 text-xs sm:text-sm mt-0.5">
              Review all past interview scorecards, domain ratings, technical notes, and progression decisions submitted for Round 1 and Round 2.
            </p>
          </div>

          <button
            onClick={loadData}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white hover:bg-slate-50 text-slate-800 text-xs font-bold border border-slate-300 shadow-2xs transition-all"
          >
            <RotateCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} /> Refresh
          </button>
        </div>

        {/* Search */}
        <div className="p-4 rounded-2xl bg-white border border-slate-200 flex items-center justify-between shadow-xs">
          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search candidate / position..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 outline-none focus:border-orange-500 focus:bg-white transition-all"
            />
          </div>

          <span className="text-xs font-bold text-slate-500">
            {filteredInterviews.length} Submitted Scorecard(s)
          </span>
        </div>

        {/* Evaluations Table */}
        <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50/80 text-slate-500 font-extrabold uppercase tracking-wider">
                  <th className="py-3 px-4">Candidate</th>
                  <th className="py-3 px-4">Job Role</th>
                  <th className="py-3 px-3">Round</th>
                  <th className="py-3 px-3">Score</th>
                  <th className="py-3 px-3">Decision</th>
                  <th className="py-3 px-6">Feedback / Evaluation Notes</th>
                  <th className="py-3 px-4 text-right">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {loading ? (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-slate-400">
                      <div className="flex flex-col items-center gap-2">
                        <div className="w-7 h-7 border-3 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
                        <p className="font-semibold text-xs text-slate-500">Loading evaluation history...</p>
                      </div>
                    </td>
                  </tr>
                ) : filteredInterviews.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-slate-400">
                      <p className="font-semibold text-xs">No submitted interview evaluations found.</p>
                    </td>
                  </tr>
                ) : (
                  filteredInterviews.map((item) => {
                    const isSelected = item.result === 'SELECTED';
                    return (
                      <tr key={item.id} className="hover:bg-orange-50/20 transition-colors">
                        <td className="py-3.5 px-4">
                          <div className="font-bold text-slate-900">{item.candidateName || 'Candidate'}</div>
                          <div className="text-[11px] text-slate-500 font-mono mt-0.5">{item.candidateEmail}</div>
                        </td>
                        <td className="py-3.5 px-4 font-semibold text-slate-700 max-w-[160px] truncate">
                          {item.jobTitle || 'Open Position'}
                        </td>
                        <td className="py-3.5 px-3 whitespace-nowrap">
                          <span className="font-bold text-slate-800">
                            Round {item.roundNumber || 1}
                          </span>
                        </td>
                        <td className="py-3.5 px-3 whitespace-nowrap">
                          <span className="font-black text-slate-900 bg-slate-100 px-2 py-0.5 rounded-md">
                            {item.rating || item.feedbackDetails?.overallScore || 8} / 10
                          </span>
                        </td>
                        <td className="py-3.5 px-3 whitespace-nowrap">
                          <span
                            className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase ${
                              isSelected
                                ? 'bg-emerald-100 text-emerald-800'
                                : 'bg-red-100 text-red-800'
                            }`}
                          >
                            {item.result || 'COMPLETED'}
                          </span>
                        </td>
                        <td className="py-3.5 px-6 max-w-xs text-slate-600 italic">
                          "{item.feedback || item.notes || 'Evaluation completed and recorded.'}"
                        </td>
                        <td className="py-3.5 px-4 text-right text-slate-500 whitespace-nowrap">
                          {new Date(item.updatedAt || item.createdAt).toLocaleDateString('en-GB', {
                            day: '2-digit',
                            month: 'short',
                          })}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default HRSpecialistEvaluationsPage;
