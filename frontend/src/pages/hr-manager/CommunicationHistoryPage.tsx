import React, { useState, useEffect, useMemo } from 'react';
import { 
  Mail, 
  Search, 
  RotateCw, 
  Send, 
  CheckCircle2, 
  Clock, 
  FileText, 
  Calendar, 
  Award, 
  ShieldCheck 
} from 'lucide-react';
import toast from 'react-hot-toast';
import DashboardLayout from '../../components/layout/DashboardLayout';
import applicationService from '../../services/applicationService';

export const CommunicationHistoryPage: React.FC = () => {
  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTypeFilter, setSelectedTypeFilter] = useState('ALL');

  const loadData = async () => {
    setLoading(true);
    try {
      const res = await applicationService.getCommunicationHistory();
      const records = res.history || res.data || (Array.isArray(res) ? res : []);
      setHistory(records);
    } catch (err: any) {
      toast.error('Failed to load communication history: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const filteredHistory = useMemo(() => {
    return history.filter((item) => {
      if (selectedTypeFilter !== 'ALL' && item.emailType !== selectedTypeFilter) {
        return false;
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const cand = (item.candidateName || '').toLowerCase();
        const email = (item.recipientEmail || '').toLowerCase();
        const appId = (item.applicationId || '').toLowerCase();
        if (!cand.includes(q) && !email.includes(q) && !appId.includes(q)) {
          return false;
        }
      }
      return true;
    });
  }, [history, selectedTypeFilter, searchQuery]);

  return (
    <DashboardLayout>
      <div className="space-y-6 animate-fadeIn pb-12">
        {/* Header Title */}
        <div className="p-6 rounded-2xl bg-white border border-slate-200 flex flex-col lg:flex-row lg:items-center justify-between gap-4 shadow-xs">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-extrabold text-orange-600 uppercase tracking-wider block">
                Audit Trail & Delivery Logs
              </span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-orange-100 text-orange-800">
                📧 Candidate Communications
              </span>
            </div>
            <h1 className="text-2xl font-black text-slate-900 mt-1">Communication History</h1>
            <p className="text-slate-500 text-xs sm:text-sm mt-0.5">
              Complete chronological audit of all candidate email dispatches including application receipts, shortlist notices, interview invitations, rejection updates, and official offer letters.
            </p>
          </div>

          <button
            onClick={loadData}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white hover:bg-slate-50 text-slate-800 text-xs font-bold border border-slate-300 shadow-2xs transition-all"
          >
            <RotateCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} /> Refresh Logs
          </button>
        </div>

        {/* Search & Filter Bar */}
        <div className="p-4 rounded-2xl bg-white border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
          <div className="flex items-center gap-3 w-full sm:w-auto">
            {/* Search */}
            <div className="relative w-full sm:w-72">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search candidate / email / ID..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 outline-none focus:border-orange-500 focus:bg-white transition-all"
              />
            </div>

            {/* Email Type Filter */}
            <div>
              <select
                value={selectedTypeFilter}
                onChange={(e) => setSelectedTypeFilter(e.target.value)}
                className="px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 outline-none focus:border-orange-500 focus:bg-white font-medium"
              >
                <option value="ALL">All Email Types</option>
                <option value="Shortlist Email">Shortlist Email</option>
                <option value="Rejection Email">Rejection Email</option>
                <option value="Interview Schedule Invitation">Interview Invitation</option>
                <option value="Official Offer Letter">Official Offer Letter</option>
                <option value="Application Notice">Application Receipt</option>
              </select>
            </div>
          </div>

          <span className="text-xs font-bold text-slate-500">
            {filteredHistory.length} Delivered Communication Records
          </span>
        </div>

        {/* Communication Table */}
        <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50/80 text-slate-500 font-extrabold uppercase tracking-wider">
                  <th className="py-3 px-4">Application ID</th>
                  <th className="py-3 px-4">Candidate / Recipient</th>
                  <th className="py-3 px-4">Communication Type</th>
                  <th className="py-3 px-4">Dispatched By</th>
                  <th className="py-3 px-4">Sent Date & Time</th>
                  <th className="py-3 px-4 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {loading ? (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-slate-400">
                      <div className="flex flex-col items-center gap-2">
                        <div className="w-7 h-7 border-3 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
                        <p className="font-semibold text-xs text-slate-500">Loading communication logs...</p>
                      </div>
                    </td>
                  </tr>
                ) : filteredHistory.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-slate-400">
                      <p className="font-semibold text-xs">No email communication logs found.</p>
                    </td>
                  </tr>
                ) : (
                  filteredHistory.map((item) => (
                    <tr key={item.id} className="hover:bg-orange-50/20 transition-colors">
                      {/* ID */}
                      <td className="py-3.5 px-4 font-mono font-bold text-slate-700">
                        {item.applicationId?.slice(0, 12) || 'APP-LOG'}
                      </td>

                      {/* Candidate */}
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-slate-900">{item.candidateName}</div>
                        <div className="text-[11px] text-slate-500 font-mono mt-0.5">{item.recipientEmail}</div>
                      </td>

                      {/* Type */}
                      <td className="py-3.5 px-4">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold ${
                          item.emailType.includes('Offer')
                            ? 'bg-amber-100 text-amber-800'
                            : item.emailType.includes('Shortlist')
                            ? 'bg-emerald-100 text-emerald-800'
                            : item.emailType.includes('Reject')
                            ? 'bg-red-100 text-red-800'
                            : 'bg-blue-100 text-blue-800'
                        }`}>
                          <Mail className="w-3 h-3" />
                          {item.emailType}
                        </span>
                      </td>

                      {/* Sent By */}
                      <td className="py-3.5 px-4 font-medium text-slate-700">
                        {item.sentBy || 'HR Operations'}
                      </td>

                      {/* Sent Date */}
                      <td className="py-3.5 px-4 text-slate-500 whitespace-nowrap">
                        {new Date(item.sentDate).toLocaleString('en-GB', {
                          day: '2-digit',
                          month: 'short',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </td>

                      {/* Delivery Status */}
                      <td className="py-3.5 px-4 text-right whitespace-nowrap">
                        <span className="inline-flex items-center gap-1 text-[11px] font-extrabold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                          <CheckCircle2 className="w-3 h-3" /> DELIVERED
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default CommunicationHistoryPage;
