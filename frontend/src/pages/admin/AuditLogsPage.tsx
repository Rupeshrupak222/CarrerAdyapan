import React, { useState, useEffect } from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { 
  ShieldCheck, 
  Search, 
  Filter, 
  Clock, 
  User, 
  Activity, 
  RefreshCw, 
  ChevronLeft, 
  ChevronRight,
  Database,
  Tag
} from 'lucide-react';
import toast from 'react-hot-toast';
import auditService from '../../services/auditService';

const AuditLogsPage: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [logs, setLogs] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [actionFilter, setActionFilter] = useState('ALL');
  const [entityFilter, setEntityFilter] = useState('ALL');

  useEffect(() => {
    fetchAuditLogs(page);
  }, [page, actionFilter, entityFilter]);

  const fetchAuditLogs = async (currentPage: number) => {
    try {
      setLoading(true);
      const params: any = { page: currentPage, limit: 25 };
      if (actionFilter !== 'ALL') params.action = actionFilter;
      if (entityFilter !== 'ALL') params.entity = entityFilter;

      const res = await auditService.getAuditLogs(params);
      if (res?.logs) {
        setLogs(res.logs);
        setTotal(res.pagination?.total || res.logs.length);
        setTotalPages(res.pagination?.totalPages || 1);
      }
    } catch (err: any) {
      toast.error('Failed to load audit trail');
    } finally {
      setLoading(false);
    }
  };

  const actionColors: Record<string, string> = {
    CANDIDATE_APPLIED: 'bg-blue-50 text-blue-700 border-blue-200',
    SCREENING_COMPLETED: 'bg-purple-50 text-purple-700 border-purple-200',
    HR_ASSIGNED: 'bg-amber-50 text-amber-800 border-amber-200',
    HR_REASSIGNED: 'bg-amber-100 text-amber-900 border-amber-300',
    INTERVIEW_SCHEDULED: 'bg-indigo-50 text-indigo-700 border-indigo-200',
    ROUND_SELECTED: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    ROUND_REJECTED: 'bg-red-50 text-red-700 border-red-200',
    OFFER_APPROVED: 'bg-emerald-100 text-emerald-800 border-emerald-300',
    OFFER_RELEASED: 'bg-yellow-50 text-yellow-800 border-yellow-200',
    OFFER_ACCEPTED: 'bg-emerald-100 text-emerald-800 border-emerald-300',
    ONBOARDING_COMPLETED: 'bg-teal-50 text-teal-700 border-teal-200',
    DOCUMENT_VERIFIED: 'bg-cyan-50 text-cyan-700 border-cyan-200',
    JOINING_CONFIRMED: 'bg-emerald-100 text-emerald-800 border-emerald-300',
  };

  return (
    <DashboardLayout>
      <div className="space-y-6 animate-fadeIn">
        {/* Header Banner */}
        <div className="p-6 sm:p-8 rounded-3xl bg-white border border-slate-200 shadow-sm relative overflow-hidden">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-amber-50 border border-amber-200 text-amber-800 text-xs font-bold uppercase tracking-wider mb-2">
                <ShieldCheck className="w-3.5 h-3.5 text-amber-600" />
                Immutable System Audit Trail
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
                Compliance & Event Log Stream
              </h1>
              <p className="text-slate-500 text-sm mt-1">
                Real-time tracking of candidate status changes, HR assignments, scorecard locks, and offer dispatches.
              </p>
            </div>

            <button
              onClick={() => fetchAuditLogs(page)}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold transition-all border border-slate-200"
            >
              <RefreshCw className="w-4 h-4" /> Refresh Trail
            </button>
          </div>
        </div>

        {/* Filter Bar */}
        <div className="p-4 rounded-2xl bg-white border border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-sm">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-600 uppercase tracking-wider">
            <Filter className="w-4 h-4 text-amber-600" /> Filter Logs ({total} events recorded)
          </div>

          <div className="flex flex-wrap items-center gap-2.5 w-full sm:w-auto">
            <select
              value={actionFilter}
              onChange={(e) => {
                setActionFilter(e.target.value);
                setPage(1);
              }}
              className="px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-700 text-xs font-semibold focus:border-amber-500 outline-none"
            >
              <option value="ALL">All Actions</option>
              <option value="CANDIDATE_APPLIED">Candidate Applied</option>
              <option value="SCREENING_COMPLETED">Screening Completed</option>
              <option value="HR_ASSIGNED">HR Assigned</option>
              <option value="HR_REASSIGNED">HR Reassigned</option>
              <option value="INTERVIEW_SCHEDULED">Interview Scheduled</option>
              <option value="ROUND_SELECTED">Round Selected</option>
              <option value="ROUND_REJECTED">Round Rejected</option>
              <option value="OFFER_APPROVED">Offer Approved</option>
              <option value="OFFER_RELEASED">Offer Released</option>
              <option value="OFFER_ACCEPTED">Offer Accepted</option>
              <option value="ONBOARDING_COMPLETED">Onboarding Completed</option>
              <option value="DOCUMENT_VERIFIED">Document Verified</option>
              <option value="JOINING_CONFIRMED">Joining Confirmed</option>
            </select>

            <select
              value={entityFilter}
              onChange={(e) => {
                setEntityFilter(e.target.value);
                setPage(1);
              }}
              className="px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-700 text-xs font-semibold focus:border-amber-500 outline-none"
            >
              <option value="ALL">All Entities</option>
              <option value="APPLICATION">Application</option>
              <option value="INTERVIEW">Interview</option>
              <option value="OFFER">Offer</option>
              <option value="ONBOARDING">Onboarding</option>
              <option value="DOCUMENT">Document</option>
            </select>
          </div>
        </div>

        {/* Audit Log Table */}
        <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider">
                  <th className="py-4 px-5">Timestamp</th>
                  <th className="py-4 px-5">Action</th>
                  <th className="py-4 px-5">Actor / User</th>
                  <th className="py-4 px-5">Target Entity</th>
                  <th className="py-4 px-5">Details / Delta</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-mono text-[11px]">
                {loading ? (
                  <tr>
                    <td colSpan={5} className="py-16 text-center text-slate-400">
                      <div className="w-8 h-8 border-2 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
                      Loading audit telemetry...
                    </td>
                  </tr>
                ) : logs.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-16 text-center text-slate-400 font-sans text-xs">
                      No audit events found matching filters.
                    </td>
                  </tr>
                ) : (
                  logs.map((log) => (
                    <tr key={log.id} className="hover:bg-slate-50/80 transition-colors font-sans">
                      <td className="py-3.5 px-5 text-slate-500 whitespace-nowrap text-xs">
                        {new Date(log.createdAt).toLocaleString()}
                      </td>

                      <td className="py-3.5 px-5">
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase border ${
                          actionColors[log.action] || 'bg-slate-100 text-slate-700 border-slate-200'
                        }`}>
                          {log.action}
                        </span>
                      </td>

                      <td className="py-3.5 px-5">
                        <span className="font-bold text-slate-900 text-xs block">{log.userName || 'System Automated'}</span>
                        <span className="text-[10px] text-slate-400">{log.userRole || 'SYSTEM'}</span>
                      </td>

                      <td className="py-3.5 px-5">
                        <span className="px-2 py-0.5 rounded-lg bg-slate-100 text-slate-700 font-mono text-[11px] border border-slate-200">
                          {log.entity}:{log.entityId?.slice(0, 8)}...
                        </span>
                      </td>

                      <td className="py-3.5 px-5 text-slate-700 text-xs">
                        {log.details ? (
                          <pre className="text-[11px] font-mono text-slate-600 max-w-xs truncate">
                            {typeof log.details === 'object' ? JSON.stringify(log.details) : String(log.details)}
                          </pre>
                        ) : (
                          <span className="text-slate-300">—</span>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="p-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
              <span>Page {page} of {totalPages}</span>
              <div className="flex items-center gap-2">
                <button
                  disabled={page <= 1}
                  onClick={() => setPage(page - 1)}
                  className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 disabled:opacity-30"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  disabled={page >= totalPages}
                  onClick={() => setPage(page + 1)}
                  className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 disabled:opacity-30"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default AuditLogsPage;
