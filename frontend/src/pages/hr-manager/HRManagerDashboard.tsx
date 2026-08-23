import React, { useState, useEffect } from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { 
  Users, 
  UserCheck, 
  Award, 
  RefreshCw, 
  Send, 
  Check, 
  AlertTriangle
} from 'lucide-react';
import toast from 'react-hot-toast';
import applicationService from '../../services/applicationService';
import authService from '../../services/authService';
import offerService from '../../services/offerService';
import { useAuth } from '../../context/AuthContext';
import { Link } from 'react-router-dom';

const HRManagerDashboard: React.FC = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [applications, setApplications] = useState<any[]>([]);
  const [activeHRs, setActiveHRs] = useState<any[]>([]);

  // Reassign Modal
  const [reassignModalOpen, setReassignModalOpen] = useState(false);
  const [selectedAppForReassign, setSelectedAppForReassign] = useState<any>(null);
  const [targetHrId, setTargetHrId] = useState('');
  const [reassignReason, setReassignReason] = useState('WORKLOAD_BALANCING');

  // Offer Release Modal
  const [offerModalOpen, setOfferModalOpen] = useState(false);
  const [selectedAppForOffer, setSelectedAppForOffer] = useState<any>(null);
  const [offerFormData, setOfferFormData] = useState({
    stipend: 'INR 20,000/- Per Month (During 6-Month Training)',
    salary: 20000,
    trainingStartDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    location: 'Hyderabad / Hybrid',
    notes: 'Approved by Head of Talent Acquisition',
  });

  useEffect(() => {
    loadManagerData();
  }, []);

  const loadManagerData = async () => {
    try {
      setLoading(true);
      const [appsRes, hrsRes] = await Promise.all([
        applicationService.getAllApplications(),
        authService.getActiveHRs(),
      ]);

      if (appsRes?.applications) setApplications(appsRes.applications);
      if (hrsRes?.hrs) setActiveHRs(hrsRes.hrs);
    } catch (err: any) {
      toast.error('Failed to load manager operations data');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenReassignModal = (app: any) => {
    setSelectedAppForReassign(app);
    setTargetHrId(activeHRs[0]?.id || '');
    setReassignModalOpen(true);
  };

  const handleReassignSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAppForReassign || !targetHrId) return;

    const toastId = toast.loading('Reassigning candidate...');
    try {
      await applicationService.reassignHR(selectedAppForReassign.id, targetHrId, reassignReason);
      toast.success('Candidate reassigned successfully', { id: toastId });
      setReassignModalOpen(false);
      loadManagerData();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Reassignment failed', { id: toastId });
    }
  };

  const handleApproveRound3 = async (appId: string) => {
    const toastId = toast.loading('Approving candidate for offer release...');
    try {
      await applicationService.approveOffer(appId);
      toast.success('Candidate approved for Offer Letter release', { id: toastId });
      loadManagerData();
    } catch (err: any) {
      toast.error('Failed to approve candidate', { id: toastId });
    }
  };

  const handleOpenOfferModal = (app: any) => {
    setSelectedAppForOffer(app);
    setOfferModalOpen(true);
  };

  const handleSendOfferSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAppForOffer) return;

    const toastId = toast.loading('Dispatching official offer letter...');
    try {
      await offerService.createOffer({
        applicationId: selectedAppForOffer.id,
        candidateId: selectedAppForOffer.candidateId,
        candidateName: `${selectedAppForOffer.candidate?.firstName} ${selectedAppForOffer.candidate?.lastName}`,
        candidateEmail: selectedAppForOffer.candidate?.email,
        jobTitle: selectedAppForOffer.job?.title || 'Business Development Associate',
        salary: offerFormData.salary,
        stipend: offerFormData.stipend,
        joiningDate: offerFormData.trainingStartDate,
        location: offerFormData.location,
        notes: offerFormData.notes,
      });

      toast.success(`Offer Letter sent to ${selectedAppForOffer.candidate?.email}`, { id: toastId });
      setOfferModalOpen(false);
      loadManagerData();
    } catch (err: any) {
      toast.error('Failed to dispatch offer letter', { id: toastId });
    }
  };

  // Metrics
  const totalApps = applications.length;
  const round3Apps = applications.filter((a) => a.currentRound === 3);
  const pendingApprovals = applications.filter((a) => a.currentRound === 3 && !a.managerApproved);
  const approvedReadyForOffer = applications.filter((a) => a.managerApproved && !a.offer);

  return (
    <DashboardLayout>
      <div className="space-y-6 animate-fadeIn">
        {/* Simple Header Banner */}
        <div className="p-6 rounded-2xl bg-white border border-slate-200 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
              HR Operations Management
            </span>
            <h1 className="text-2xl font-bold text-slate-900 mt-1">
              HR Manager Approvals & Workload Matrix
            </h1>
            <p className="text-slate-500 text-xs sm:text-sm mt-0.5">
              Managing <strong>{totalApps} Total Applications</strong> and workload balance across {activeHRs.length} HR specialists.
            </p>
          </div>

          <button
            onClick={loadManagerData}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-white hover:bg-slate-50 text-slate-800 text-xs font-semibold border border-slate-300 transition-all"
          >
            <RefreshCw className="w-3.5 h-3.5" /> Refresh
          </button>
        </div>

        {/* 4 Clean Metric Tiles */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <div className="p-4 rounded-xl bg-white border border-slate-200">
            <span className="text-[11px] font-semibold text-slate-500 block">Active HR Team</span>
            <p className="text-2xl font-bold text-slate-900 mt-1">{activeHRs.length} Members</p>
          </div>

          <div className="p-4 rounded-xl bg-white border border-slate-200">
            <span className="text-[11px] font-semibold text-slate-500 block">Round 3 Ready</span>
            <p className="text-2xl font-bold text-slate-900 mt-1">{round3Apps.length}</p>
          </div>

          <div className="p-4 rounded-xl bg-white border border-slate-200">
            <span className="text-[11px] font-semibold text-slate-500 block">Pending Approval</span>
            <p className="text-2xl font-bold text-slate-900 mt-1">{pendingApprovals.length}</p>
          </div>

          <div className="p-4 rounded-xl bg-white border border-slate-200">
            <span className="text-[11px] font-semibold text-slate-500 block">Ready for Offer</span>
            <p className="text-2xl font-bold text-slate-900 mt-1">{approvedReadyForOffer.length}</p>
          </div>
        </div>

        {/* Workload Balance Matrix */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 space-y-4">
          <div>
            <h2 className="text-sm font-bold text-slate-900">
              HR Team Workload Distribution
            </h2>
            <p className="text-xs text-slate-500">Live candidate allocation across the 5 HR team members.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
            {activeHRs.map((hr) => {
              const hrApps = applications.filter((a) => a.assignedHrId === hr.id);
              const count = hrApps.length;
              return (
                <div key={hr.id} className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5">
                  <span className="font-bold text-slate-900 text-xs block">{hr.name}</span>
                  <p className="text-xl font-bold text-slate-900">{count} <span className="text-xs font-normal text-slate-500">candidates</span></p>
                  <div className="w-full h-1.5 rounded-full bg-slate-200 overflow-hidden">
                    <div className="h-full bg-slate-800 rounded-full" style={{ width: `${Math.min(count * 20, 100)}%` }}></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Round 3 Approvals Queue */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 space-y-3">
          <div>
            <h2 className="text-sm font-bold text-slate-900">
              Round 3 Approvals & Offer Letter Release Queue
            </h2>
            <p className="text-xs text-slate-500">Approve final selections and dispatch offer letters.</p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase tracking-wider">
                  <th className="py-3 px-4">Candidate</th>
                  <th className="py-3 px-4">Assigned HR</th>
                  <th className="py-3 px-4">Round</th>
                  <th className="py-3 px-4">Manager Approval</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {applications.filter((a) => a.currentRound >= 2 || a.managerApproved).map((app) => (
                  <tr key={app.id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-3 px-4">
                      <p className="font-bold text-slate-900">{app.candidate?.firstName} {app.candidate?.lastName}</p>
                      <span className="text-[10px] text-slate-400 font-mono">{app.candidateCode} • {app.candidate?.email}</span>
                    </td>

                    <td className="py-3 px-4 text-slate-700">
                      {app.assignedHr?.name || 'HR Specialist'}
                    </td>

                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-800 font-medium">
                        Round {app.currentRound} ({app.overallStatus})
                      </span>
                    </td>

                    <td className="py-3 px-4">
                      {app.managerApproved ? (
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-slate-100 text-slate-800 border border-slate-200">
                          Approved
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-slate-50 text-slate-500 border border-slate-200">
                          Pending
                        </span>
                      )}
                    </td>

                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => handleOpenReassignModal(app)}
                          className="px-2.5 py-1 rounded-lg bg-white hover:bg-slate-50 text-slate-700 font-semibold text-xs border border-slate-300"
                        >
                          Reassign
                        </button>

                        {!app.managerApproved ? (
                          <button
                            onClick={() => handleApproveRound3(app.id)}
                            className="px-3 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs"
                          >
                            Approve
                          </button>
                        ) : (
                          <button
                            onClick={() => handleOpenOfferModal(app)}
                            className="px-3 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs"
                          >
                            Release Offer
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Reassign Modal */}
        {reassignModalOpen && (
          <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="max-w-md w-full bg-white border border-slate-300 rounded-2xl p-6 shadow-xl animate-fadeIn">
              <h3 className="text-lg font-bold text-slate-900 mb-1">Reassign Candidate</h3>
              <p className="text-xs text-slate-500 mb-4">
                Candidate: <strong>{selectedAppForReassign?.candidate?.firstName} {selectedAppForReassign?.candidate?.lastName}</strong>
              </p>

              <form onSubmit={handleReassignSubmit} className="space-y-3.5 text-xs">
                <div>
                  <label className="text-slate-600 font-semibold uppercase">Target HR Specialist</label>
                  <select
                    value={targetHrId}
                    onChange={(e) => setTargetHrId(e.target.value)}
                    className="mt-1 w-full px-3 py-2 rounded-lg bg-slate-50 border border-slate-300 text-slate-900 font-medium outline-none"
                  >
                    {activeHRs.map((hr) => (
                      <option key={hr.id} value={hr.id}>
                        {hr.name} ({hr.email})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-slate-600 font-semibold uppercase">Reason</label>
                  <select
                    value={reassignReason}
                    onChange={(e) => setReassignReason(e.target.value)}
                    className="mt-1 w-full px-3 py-2 rounded-lg bg-slate-50 border border-slate-300 text-slate-900 font-medium outline-none"
                  >
                    <option value="WORKLOAD_BALANCING">Workload Balancing</option>
                    <option value="SPECIALIZATION_MATCH">Domain Specialization Match</option>
                    <option value="LEAVE_ABSENCE">HR On Leave</option>
                    <option value="ESCALATION">Manager Escalation</option>
                  </select>
                </div>

                <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200">
                  <button
                    type="button"
                    onClick={() => setReassignModalOpen(false)}
                    className="px-3.5 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white font-semibold"
                  >
                    Confirm Reassign
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Release Offer Modal */}
        {offerModalOpen && (
          <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="max-w-md w-full bg-white border border-slate-300 rounded-2xl p-6 shadow-xl animate-fadeIn">
              <h3 className="text-lg font-bold text-slate-900 mb-1">Issue Official Offer Letter</h3>
              <p className="text-xs text-slate-500 mb-4">
                Candidate: <strong>{selectedAppForOffer?.candidate?.firstName} {selectedAppForOffer?.candidate?.lastName}</strong>
              </p>

              <form onSubmit={handleSendOfferSubmit} className="space-y-3.5 text-xs">
                <div>
                  <label className="text-slate-600 font-semibold uppercase">Stipend / CTC Terms</label>
                  <input
                    type="text"
                    value={offerFormData.stipend}
                    onChange={(e) => setOfferFormData({ ...offerFormData, stipend: e.target.value })}
                    className="mt-1 w-full px-3 py-2 rounded-lg bg-slate-50 border border-slate-300 text-slate-900 outline-none"
                  />
                </div>

                <div>
                  <label className="text-slate-600 font-semibold uppercase">Joining Date</label>
                  <input
                    type="date"
                    value={offerFormData.trainingStartDate}
                    onChange={(e) => setOfferFormData({ ...offerFormData, trainingStartDate: e.target.value })}
                    className="mt-1 w-full px-3 py-2 rounded-lg bg-slate-50 border border-slate-300 text-slate-900 outline-none"
                  />
                </div>

                <div>
                  <label className="text-slate-600 font-semibold uppercase">Location</label>
                  <input
                    type="text"
                    value={offerFormData.location}
                    onChange={(e) => setOfferFormData({ ...offerFormData, location: e.target.value })}
                    className="mt-1 w-full px-3 py-2 rounded-lg bg-slate-50 border border-slate-300 text-slate-900 outline-none"
                  />
                </div>

                <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200">
                  <button
                    type="button"
                    onClick={() => setOfferModalOpen(false)}
                    className="px-3.5 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white font-semibold"
                  >
                    Dispatch Offer Email
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default HRManagerDashboard;
