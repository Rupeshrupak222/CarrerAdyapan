import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { offerService } from '../../services/offerService';
import { applicationService } from '../../services/applicationService';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';
import { 
  Award, 
  Download, 
  Send, 
  CheckCircle2, 
  Clock, 
  Search, 
  Filter, 
  FileText, 
  Sparkles, 
  Calendar, 
  Plus, 
  RefreshCw,
  Eye,
  Edit3,
  ExternalLink,
  MapPin,
  Building2,
  Mail,
  User,
  ShieldCheck,
  X
} from 'lucide-react';
import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const Offers: React.FC = () => {
  const { user } = useAuth();
  const isHR = user?.role === 'HR';

  const [offers, setOffers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [downloadingId, setDownloadingId] = useState<string | null>(null);
  const [sendingId, setSendingId] = useState<string | null>(null);

  // Modals
  const [showAddModal, setShowAddModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedOffer, setSelectedOffer] = useState<any>(null);

  const [eligibleApplications, setEligibleApplications] = useState<any[]>([]);

  // Create Form Data
  const [offerFormData, setOfferFormData] = useState({
    applicationId: '',
    stipend: 'INR 20,000/- Per Month (During 6-Month Training)',
    salary: 20000,
    trainingStartDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    location: 'Hyderabad / Hybrid',
    notes: 'Approved by Talent Acquisition Team',
  });

  // Edit Form Data
  const [editFormData, setEditFormData] = useState({
    id: '',
    candidateName: '',
    candidateEmail: '',
    jobTitle: '',
    stipend: '',
    salary: 20000,
    trainingStartDate: '',
    location: '',
    notes: '',
  });

  useEffect(() => {
    fetchOffersData();
  }, [user]);

  const fetchOffersData = async () => {
    try {
      setLoading(true);
      const [offersRes, appsRes] = await Promise.all([
        offerService.getAllOffers().catch(() => null),
        applicationService.getAllApplications().catch(() => null),
      ]);

      let fetchedOffers = offersRes?.offers || [];
      let fetchedApps = appsRes?.applications || [];

      // STRICT HR ISOLATION: HR Specialist sees only their assigned candidate offers
      if (isHR && user?.id) {
        fetchedOffers = fetchedOffers.filter((o: any) => {
          const app = o.application;
          return (
            app?.assignedHrId === user.id ||
            app?.assignedHr?.email?.toLowerCase() === user.email?.toLowerCase() ||
            o.candidateEmail?.toLowerCase() === user.email?.toLowerCase()
          );
        });

        fetchedApps = fetchedApps.filter((a: any) => 
          a.assignedHrId === user.id || 
          a.assignedHr?.email?.toLowerCase() === user.email?.toLowerCase()
        );
      }

      setOffers(fetchedOffers);
      setEligibleApplications(fetchedApps.filter((a: any) => a.managerApproved || a.currentRound >= 2));
    } catch (err: any) {
      toast.error('Failed to load offers');
    } finally {
      setLoading(false);
    }
  };

  // 1. Send / Resend Offer Email Action
  const handleSendOfferEmail = async (offer: any) => {
    setSendingId(offer.id);
    const toastId = toast.loading(`Sending official offer letter to ${offer.candidateEmail}...`);
    try {
      await offerService.sendEmail(offer.id, {
        candidateName: offer.candidateName,
        candidateEmail: offer.candidateEmail,
        jobTitle: offer.jobTitle,
        salary: offer.salary,
        stipend: offer.stipend || (offer.salary ? `INR ${offer.salary}/- Per Month` : 'INR 20,000/- Per Month'),
        joiningDate: offer.trainingStartDate || offer.joiningDate,
        location: offer.location || 'Hyderabad',
      });

      toast.success(`Offer Letter email sent to ${offer.candidateEmail}!`, { id: toastId });
      fetchOffersData();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Failed to send offer email.', { id: toastId });
    } finally {
      setSendingId(null);
    }
  };

  // 2. View Offer Letter Modal
  const handleOpenViewModal = (offer: any) => {
    setSelectedOffer(offer);
    setShowViewModal(true);
  };

  // 3. Edit Offer Letter Modal
  const handleOpenEditModal = (offer: any) => {
    setSelectedOffer(offer);
    setEditFormData({
      id: offer.id,
      candidateName: offer.candidateName || '',
      candidateEmail: offer.candidateEmail || '',
      jobTitle: offer.jobTitle || 'Business Development Associate',
      stipend: offer.stipend || (offer.salary ? `INR ${offer.salary}/- Per Month` : 'INR 20,000/- Per Month (During 6-Month Training)'),
      salary: offer.salary || 20000,
      trainingStartDate: offer.trainingStartDate ? new Date(offer.trainingStartDate).toISOString().split('T')[0] : (offer.joiningDate ? new Date(offer.joiningDate).toISOString().split('T')[0] : new Date().toISOString().split('T')[0]),
      location: offer.location || 'Hyderabad / Hybrid',
      notes: offer.notes || 'Official offer released by Talent Acquisition Team.',
    });
    setShowEditModal(true);
  };

  const handleEditSubmit = async (e: React.FormEvent, sendEmailAfterSave = false) => {
    e.preventDefault();
    if (!selectedOffer) return;
    const toastId = toast.loading('Saving offer letter modifications...');

    try {
      await offerService.createOffer({
        id: selectedOffer.id,
        candidateId: selectedOffer.candidateId,
        candidateName: editFormData.candidateName,
        candidateEmail: editFormData.candidateEmail,
        jobTitle: editFormData.jobTitle,
        salary: editFormData.salary,
        stipend: editFormData.stipend,
        joiningDate: editFormData.trainingStartDate,
        location: editFormData.location,
        notes: editFormData.notes,
        sendEmail: sendEmailAfterSave,
      });

      toast.success(sendEmailAfterSave ? 'Offer updated and re-sent to candidate!' : 'Offer modifications saved!', { id: toastId });
      setShowEditModal(false);
      fetchOffersData();
    } catch (err: any) {
      toast.error('Failed to update offer letter', { id: toastId });
    }
  };

  // 4. Download 4-Page PDF
  const handleDownloadPdf = async (offer: any) => {
    setDownloadingId(offer.id);
    const toastId = toast.loading('Generating 4-Page Adyapan Offer Letter PDF...');
    try {
      const res = await axios.post(
        `${API_BASE}/offers/generate-pdf`,
        {
          candidateName: offer.candidateName,
          jobTitle: offer.jobTitle,
          stipend: offer.stipend || (offer.salary ? `INR ${offer.salary}/- Per Month` : 'INR 20,000/- Per Month'),
          location: offer.location || 'Hyderabad',
          trainingStartDate: offer.trainingStartDate || offer.joiningDate,
        },
        { responseType: 'blob' }
      );

      const blob = new Blob([res.data], { type: 'application/pdf' });
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = `${offer.candidateName.replace(/\s+/g, '_')}_Official_Offer_Letter.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(downloadUrl);
      toast.success('Offer Letter downloaded successfully!', { id: toastId });
    } catch (err) {
      toast.error('Failed to download PDF offer letter.', { id: toastId });
    } finally {
      setDownloadingId(null);
    }
  };

  // 5. Create Offer
  const handleCreateOfferSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!offerFormData.applicationId) {
      toast.error('Please select an eligible candidate');
      return;
    }

    const app = eligibleApplications.find((a) => a.id === offerFormData.applicationId);
    const toastId = toast.loading('Generating Offer Letter and dispatching email...');

    try {
      await offerService.createOffer({
        applicationId: app.id,
        candidateId: app.candidateId,
        candidateName: `${app.candidate?.firstName} ${app.candidate?.lastName}`,
        candidateEmail: app.candidate?.email,
        jobTitle: app.job?.title || 'Business Development Associate',
        salary: offerFormData.salary,
        stipend: offerFormData.stipend,
        joiningDate: offerFormData.trainingStartDate,
        location: offerFormData.location,
        notes: offerFormData.notes,
        sendEmail: true,
      });

      toast.success(`Offer Letter email dispatched to ${app.candidate?.email}!`, { id: toastId });
      setShowAddModal(false);
      fetchOffersData();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Failed to dispatch offer', { id: toastId });
    }
  };

  const totalOffers = offers.length;
  const acceptedOffers = offers.filter((o) => o.status === 'ACCEPTED').length;
  const pendingOffers = offers.filter((o) => o.status === 'SENT' || o.status === 'PENDING' || o.status === 'READY_TO_SEND').length;

  const filteredOffers = offers.filter((off) => {
    const q = search.toLowerCase();
    const candName = (off.candidateName || '').toLowerCase();
    const candEmail = (off.candidateEmail || '').toLowerCase();
    const jobTitle = (off.jobTitle || '').toLowerCase();
    const matchesSearch = !q || candName.includes(q) || candEmail.includes(q) || jobTitle.includes(q);

    const matchesStatus = statusFilter === 'ALL' || off.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  return (
    <DashboardLayout>
      <div className="space-y-6 animate-fadeIn">
        {/* Top Header Banner */}
        <div className="p-6 sm:p-8 rounded-3xl bg-white border border-orange-200 shadow-sm relative overflow-hidden">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-orange-50 border border-orange-200 text-orange-800 text-xs font-bold uppercase tracking-wider mb-2">
                <Award className="w-3.5 h-3.5 text-orange-600" />
                {isHR ? 'My Candidate Offer Letters' : 'Official Offer Letters Management'}
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
                Offer Letter & Onboarding Center
              </h1>
              <p className="text-slate-500 text-sm mt-1">
                View, edit, generate 4-page official PDFs, and dispatch secure email offers with 1-click acceptance.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <button
                onClick={() => setShowAddModal(true)}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-extrabold text-xs transition-all shadow-md shadow-orange-500/25"
              >
                <Plus className="w-4 h-4" /> Issue Offer Letter
              </button>

              <button
                onClick={fetchOffersData}
                className="p-2.5 rounded-xl bg-white hover:bg-orange-50 text-slate-700 transition-all border border-orange-200"
                title="Refresh"
              >
                <RefreshCw className="w-4 h-4 text-orange-600" />
              </button>
            </div>
          </div>
        </div>

        {/* Offer KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-5 rounded-2xl bg-white border border-orange-200 shadow-sm">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">Total Offers Issued</span>
            <p className="text-2xl font-black text-slate-900 mt-1">{totalOffers}</p>
          </div>

          <div className="p-5 rounded-2xl bg-white border border-orange-200 shadow-sm">
            <span className="text-[11px] font-bold text-emerald-600 uppercase tracking-wider block">Offers Accepted (Hired)</span>
            <p className="text-2xl font-black text-emerald-600 mt-1">{acceptedOffers}</p>
          </div>

          <div className="p-5 rounded-2xl bg-white border border-orange-200 shadow-sm">
            <span className="text-[11px] font-bold text-orange-600 uppercase tracking-wider block">Awaiting Candidate Acceptance</span>
            <p className="text-2xl font-black text-orange-600 mt-1">{pendingOffers}</p>
          </div>
        </div>

        {/* Filter Toolbar */}
        <div className="p-4 rounded-2xl bg-white border border-orange-200 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-sm">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search candidate name, role, email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-xl bg-orange-50/30 border border-orange-200 text-slate-900 text-xs placeholder:text-slate-400 focus:border-orange-500 outline-none"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3.5 py-2 rounded-xl bg-white border border-orange-200 text-slate-700 text-xs font-semibold focus:border-orange-500 outline-none"
          >
            <option value="ALL">All Statuses</option>
            <option value="ACCEPTED">Accepted (Hired)</option>
            <option value="SENT">Sent to Candidate</option>
            <option value="PENDING">Pending</option>
          </select>
        </div>

        {/* Offers Table with View, Edit, Send Offer actions */}
        <div className="bg-white border border-orange-200 rounded-3xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-orange-50/50 border-b border-orange-100 text-slate-600 font-bold uppercase tracking-wider">
                  <th className="py-4 px-5">Candidate</th>
                  <th className="py-4 px-5">Role</th>
                  <th className="py-4 px-5">Compensation</th>
                  <th className="py-4 px-5">Joining Date</th>
                  <th className="py-4 px-5">Acceptance Status</th>
                  <th className="py-4 px-5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {loading ? (
                  <tr>
                    <td colSpan={6} className="py-16 text-center text-slate-400">
                      <div className="w-8 h-8 border-2 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
                      Loading offer letters...
                    </td>
                  </tr>
                ) : filteredOffers.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-16 text-center text-slate-400 font-medium">
                      No offer letters found matching your criteria.
                    </td>
                  </tr>
                ) : (
                  filteredOffers.map((off) => (
                    <tr key={off.id} className="hover:bg-orange-50/30 transition-colors">
                      <td className="py-4 px-5">
                        <p className="font-bold text-slate-900 text-sm">{off.candidateName}</p>
                        <span className="text-[11px] text-slate-400 font-mono">{off.candidateEmail}</span>
                      </td>

                      <td className="py-4 px-5">
                        <span className="font-bold text-slate-800 block">{off.jobTitle}</span>
                        <span className="text-[11px] text-slate-500">{off.location || 'Hyderabad'}</span>
                      </td>

                      <td className="py-4 px-5">
                        <span className="font-bold text-orange-700 text-xs">
                          {off.stipend || (off.salary ? `INR ${off.salary}/- Per Month` : 'INR 20,000/- Per Month')}
                        </span>
                      </td>

                      <td className="py-4 px-5">
                        <div className="flex items-center gap-1.5 text-slate-700">
                          <Calendar className="w-3.5 h-3.5 text-slate-400" />
                          <span>{new Date(off.trainingStartDate || off.joiningDate).toLocaleDateString()}</span>
                        </div>
                      </td>

                      <td className="py-4 px-5">
                        {off.status === 'ACCEPTED' ? (
                          <div>
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                              Accepted & Confirmed
                            </span>
                            {off.acceptedAt && (
                              <span className="text-[10px] text-slate-400 block mt-0.5 pl-1">
                                On {new Date(off.acceptedAt).toLocaleDateString()}
                              </span>
                            )}
                          </div>
                        ) : off.status === 'SENT' ? (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold bg-amber-50 text-amber-800 border border-amber-200">
                            <CheckCircle2 className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                            Sent • Awaiting Response
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold bg-slate-100 text-slate-700 border border-slate-200">
                            <Clock className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                            Draft • Ready to Send
                          </span>
                        )}
                      </td>

                      <td className="py-4 px-5 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* Send / Already Sent (Resend) / Accepted */}
                          {off.status === 'ACCEPTED' ? (
                            <span className="px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-800 font-bold text-xs inline-flex items-center gap-1.5 border border-emerald-200">
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                              Hired
                            </span>
                          ) : off.status === 'SENT' ? (
                            <button
                              onClick={() => handleSendOfferEmail(off)}
                              disabled={sendingId === off.id}
                              className="px-3 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 font-bold text-xs inline-flex items-center gap-1.5 transition-all shadow-2xs disabled:opacity-50"
                              title="Offer was already sent. Click to re-dispatch email"
                            >
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                              <span>{sendingId === off.id ? 'Sending...' : 'Already Sent (Resend)'}</span>
                            </button>
                          ) : (
                            <button
                              onClick={() => handleSendOfferEmail(off)}
                              disabled={sendingId === off.id}
                              className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-extrabold text-xs inline-flex items-center gap-1.5 transition-all shadow-sm shadow-orange-500/25 disabled:opacity-50"
                              title="Send Official Offer Letter Email to Candidate"
                            >
                              <Send className="w-3.5 h-3.5" />
                              <span>{sendingId === off.id ? 'Sending...' : 'Send Offer'}</span>
                            </button>
                          )}

                          {/* View Offer Button */}
                          <button
                            onClick={() => handleOpenViewModal(off)}
                            className="p-2 rounded-xl bg-white hover:bg-orange-50 text-slate-700 hover:text-orange-700 border border-orange-200 transition-all shadow-2xs"
                            title="View Offer Letter Details"
                          >
                            <Eye className="w-3.5 h-3.5 text-orange-600" />
                          </button>

                          {/* Edit Offer Button */}
                          <button
                            onClick={() => handleOpenEditModal(off)}
                            className="p-2 rounded-xl bg-white hover:bg-orange-50 text-slate-700 hover:text-orange-700 border border-orange-200 transition-all shadow-2xs"
                            title="Edit Offer Letter Terms"
                          >
                            <Edit3 className="w-3.5 h-3.5 text-slate-700" />
                          </button>

                          {/* Download PDF Button */}
                          <button
                            onClick={() => handleDownloadPdf(off)}
                            disabled={downloadingId === off.id}
                            className="p-2 rounded-xl bg-white hover:bg-orange-50 text-slate-700 hover:text-orange-700 border border-orange-200 transition-all shadow-2xs disabled:opacity-50"
                            title="Download 4-Page PDF"
                          >
                            <Download className="w-3.5 h-3.5 text-slate-600" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* 1. VIEW OFFER MODAL */}
        {showViewModal && selectedOffer && (
          <div 
            className="fixed inset-0 z-50 bg-slate-950/65 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn"
            onClick={() => setShowViewModal(false)}
          >
            <div 
              className="max-w-2xl w-full bg-white border border-orange-200 rounded-3xl p-6 sm:p-8 shadow-2xl max-h-[90vh] overflow-y-auto space-y-6 animate-scaleUp my-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between border-b border-orange-100 pb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-orange-500 to-amber-500 text-white font-black text-lg flex items-center justify-center shadow-sm">
                    A
                  </div>
                  <div>
                    <h3 className="text-lg font-extrabold text-slate-900">Official Employment Offer Letter</h3>
                    <p className="text-xs text-orange-600 font-bold">SR's Adyapan Edutech Pvt. Ltd.</p>
                  </div>
                </div>

                <button
                  onClick={() => setShowViewModal(false)}
                  className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-500 transition-all"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Offer Letter Body Preview */}
              <div className="p-6 rounded-2xl bg-orange-50/30 border border-orange-100 space-y-4 text-xs text-slate-700 leading-relaxed">
                <div className="grid grid-cols-2 gap-4 pb-4 border-b border-orange-200/60">
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Candidate Name</span>
                    <p className="text-sm font-extrabold text-slate-900">{selectedOffer.candidateName}</p>
                    <p className="text-[11px] text-slate-500">{selectedOffer.candidateEmail}</p>
                  </div>

                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Designation</span>
                    <p className="text-sm font-extrabold text-slate-900">{selectedOffer.jobTitle}</p>
                    <p className="text-[11px] text-slate-500">{selectedOffer.location || 'Hyderabad'}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 pb-4 border-b border-orange-200/60">
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Compensation / Stipend</span>
                    <p className="text-sm font-extrabold text-orange-800">
                      {selectedOffer.stipend || (selectedOffer.salary ? `INR ${selectedOffer.salary}/- Per Month` : 'INR 20,000/- Per Month')}
                    </p>
                  </div>

                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Date of Joining / Training</span>
                    <p className="text-sm font-extrabold text-slate-900">
                      {new Date(selectedOffer.trainingStartDate || selectedOffer.joiningDate).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Key Offer Terms & Conditions</span>
                  <p className="text-xs text-slate-600 bg-white p-3.5 rounded-xl border border-orange-100">
                    {selectedOffer.notes || '6-Month Structured Training followed by full-time absorption based on target KPIs. Comprehensive medical insurance and performance incentives included.'}
                  </p>
                </div>

                <div className="flex items-center justify-between pt-2">
                  <span className="text-[11px] font-semibold text-slate-500">
                    Acceptance Status: <strong className="text-orange-700">{selectedOffer.status}</strong>
                  </span>
                  {selectedOffer.acceptedAt && (
                    <span className="text-[11px] text-emerald-600 font-bold">
                      Accepted On: {new Date(selectedOffer.acceptedAt).toLocaleString()}
                    </span>
                  )}
                </div>
              </div>

              {/* Modal Footer Actions */}
              <div className="flex items-center justify-between pt-2">
                <button
                  onClick={() => handleDownloadPdf(selectedOffer)}
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white hover:bg-orange-50 text-slate-800 font-bold text-xs border border-orange-200 transition-all shadow-sm"
                >
                  <Download className="w-3.5 h-3.5 text-orange-600" />
                  Download 4-Page PDF
                </button>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      setShowViewModal(false);
                      handleOpenEditModal(selectedOffer);
                    }}
                    className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs transition-all"
                  >
                    Edit Terms
                  </button>

                  <button
                    onClick={() => {
                      setShowViewModal(false);
                      handleSendOfferEmail(selectedOffer);
                    }}
                    className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 text-white font-extrabold text-xs shadow-md shadow-orange-500/25"
                  >
                    <Send className="w-3.5 h-3.5" />
                    Dispatch Offer Email
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 2. EDIT OFFER MODAL */}
        {showEditModal && (
          <div 
            className="fixed inset-0 z-50 bg-slate-950/65 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn"
            onClick={() => setShowEditModal(false)}
          >
            <div 
              className="max-w-md w-full bg-white border border-orange-200 rounded-3xl p-6 sm:p-8 shadow-2xl max-h-[90vh] overflow-y-auto space-y-5 animate-scaleUp my-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between border-b border-orange-100 pb-3">
                <div>
                  <h3 className="text-xl font-extrabold text-slate-900">Edit Offer Letter</h3>
                  <p className="text-xs text-slate-500">Candidate: <strong className="text-orange-600">{editFormData.candidateName}</strong></p>
                </div>
                <button
                  onClick={() => setShowEditModal(false)}
                  className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-500 transition-all"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={(e) => handleEditSubmit(e, false)} className="space-y-4 text-xs">
                <div>
                  <label className="text-slate-600 font-semibold uppercase">Job Title / Designation</label>
                  <input
                    type="text"
                    required
                    value={editFormData.jobTitle}
                    onChange={(e) => setEditFormData({ ...editFormData, jobTitle: e.target.value })}
                    className="mt-1 w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 font-medium outline-none focus:border-orange-500"
                  />
                </div>

                <div>
                  <label className="text-slate-600 font-semibold uppercase">Stipend / CTC Terms</label>
                  <input
                    type="text"
                    required
                    value={editFormData.stipend}
                    onChange={(e) => setEditFormData({ ...editFormData, stipend: e.target.value })}
                    className="mt-1 w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 font-medium outline-none focus:border-orange-500"
                  />
                </div>

                <div>
                  <label className="text-slate-600 font-semibold uppercase">Date of Joining / Training</label>
                  <input
                    type="date"
                    required
                    value={editFormData.trainingStartDate}
                    onChange={(e) => setEditFormData({ ...editFormData, trainingStartDate: e.target.value })}
                    className="mt-1 w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 font-medium outline-none focus:border-orange-500"
                  />
                </div>

                <div>
                  <label className="text-slate-600 font-semibold uppercase">Work Location</label>
                  <input
                    type="text"
                    required
                    value={editFormData.location}
                    onChange={(e) => setEditFormData({ ...editFormData, location: e.target.value })}
                    className="mt-1 w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 font-medium outline-none focus:border-orange-500"
                  />
                </div>

                <div>
                  <label className="text-slate-600 font-semibold uppercase">Terms & Notes</label>
                  <textarea
                    rows={3}
                    value={editFormData.notes}
                    onChange={(e) => setEditFormData({ ...editFormData, notes: e.target.value })}
                    className="mt-1 w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 outline-none focus:border-orange-500"
                  />
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setShowEditModal(false)}
                    className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold"
                  >
                    Cancel
                  </button>

                  <div className="flex items-center gap-2">
                    <button
                      type="submit"
                      className="px-4 py-2.5 rounded-xl bg-white hover:bg-orange-50 border border-orange-200 text-orange-800 font-bold text-xs transition-all shadow-2xs"
                    >
                      Save Only
                    </button>

                    <button
                      type="button"
                      onClick={(e) => handleEditSubmit(e, true)}
                      className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 text-white font-extrabold text-xs shadow-md shadow-orange-500/25"
                    >
                      <Send className="w-3.5 h-3.5" />
                      Save & Send
                    </button>
                  </div>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* 3. ISSUE NEW OFFER MODAL */}
        {showAddModal && (
          <div 
            className="fixed inset-0 z-50 bg-slate-950/65 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn"
            onClick={() => setShowAddModal(false)}
          >
            <div 
              className="max-w-md w-full bg-white border border-orange-200 rounded-3xl p-6 sm:p-8 shadow-2xl max-h-[90vh] overflow-y-auto space-y-4 animate-scaleUp my-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between border-b border-orange-100 pb-3">
                <h3 className="text-xl font-extrabold text-slate-900">Issue Official Offer Letter</h3>
                <button
                  onClick={() => setShowAddModal(false)}
                  className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-500 transition-all"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleCreateOfferSubmit} className="space-y-4 text-xs">
                <div>
                  <label className="text-slate-600 font-semibold uppercase">Candidate</label>
                  <select
                    value={offerFormData.applicationId}
                    onChange={(e) => setOfferFormData({ ...offerFormData, applicationId: e.target.value })}
                    className="mt-1 w-full px-3.5 py-2.5 rounded-xl bg-orange-50/40 border border-orange-200 text-slate-900 font-bold outline-none focus:border-orange-500"
                  >
                    <option value="">-- Select Candidate --</option>
                    {eligibleApplications.map((app) => (
                      <option key={app.id} value={app.id}>
                        {app.candidate?.firstName} {app.candidate?.lastName} ({app.job?.title})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-slate-600 font-semibold uppercase">Stipend / CTC Terms</label>
                  <input
                    type="text"
                    value={offerFormData.stipend}
                    onChange={(e) => setOfferFormData({ ...offerFormData, stipend: e.target.value })}
                    className="mt-1 w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 font-medium outline-none focus:border-orange-500"
                  />
                </div>

                <div>
                  <label className="text-slate-600 font-semibold uppercase">Joining Date</label>
                  <input
                    type="date"
                    value={offerFormData.trainingStartDate}
                    onChange={(e) => setOfferFormData({ ...offerFormData, trainingStartDate: e.target.value })}
                    className="mt-1 w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 font-medium outline-none focus:border-orange-500"
                  />
                </div>

                <div>
                  <label className="text-slate-600 font-semibold uppercase">Location</label>
                  <input
                    type="text"
                    value={offerFormData.location}
                    onChange={(e) => setOfferFormData({ ...offerFormData, location: e.target.value })}
                    className="mt-1 w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 font-medium outline-none focus:border-orange-500"
                  />
                </div>

                <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 text-white font-extrabold shadow-md shadow-orange-500/25"
                  >
                    Generate PDF & Dispatch Email
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

export default Offers;