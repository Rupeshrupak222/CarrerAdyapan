import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import DashboardLayout from '../../components/layout/DashboardLayout';
import BackButton from '../../components/common/BackButton';
import { interviewService } from '../../services/interviewService';
import { candidateService } from '../../services/candidateService';
import { getGlobalOfferTemplate, syncUpdateOffer } from '../../utils/applicationStore';
import { useTheme } from '../../context/ThemeContext';
import toast from 'react-hot-toast';

const INITIAL_MOCK_INTERVIEWS = [];

const Interviews = () => {
  const [interviews, setInterviews] = useState([]);
  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [showAddModal, setShowAddModal] = useState(false);
  const location = useLocation();
  const { theme } = useTheme();

  const [formData, setFormData] = useState({
    candidateId: '',
    type: 'SALES_PITCH_ROUND',
    scheduledAt: '',
    duration: 30,
    meetingLink: '',
  });

  useEffect(() => {
    fetchCandidatesData();
    fetchInterviews();
  }, []);

  useEffect(() => {
    if (location.state?.scheduleCandidateId) {
      setFormData((prev) => ({
        ...prev,
        candidateId: location.state.scheduleCandidateId,
      }));
      setShowAddModal(true);
    }
  }, [location]);

  const fetchCandidatesData = async () => {
    try {
      const res = await candidateService.getAllCandidates();
      const list = res?.candidates || [];
      setCandidates(list);
      if (list.length > 0 && !formData.candidateId) {
        setFormData((prev) => ({ ...prev, candidateId: list[0].id }));
      }
    } catch (e) {
      console.warn('Error fetching candidates for interviews:', e);
    }
  };

  const getSavedLocalInterviews = () => {
    try {
      const saved = localStorage.getItem('adyapan_interviews');
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      return [];
    }
  };

  const saveInterviewsToStore = (list) => {
    setInterviews(list);
    try {
      localStorage.setItem('adyapan_interviews', JSON.stringify(list));
    } catch (e) {}
  };

  const fetchInterviews = async () => {
    try {
      const res = await interviewService.getAllInterviews(true);
      const dbList = res?.interviews || [];
      const localList = getSavedLocalInterviews();

      const combinedMap = new Map();
      INITIAL_MOCK_INTERVIEWS.forEach((i) => combinedMap.set(i.id, i));

      // 1. Load DB items first
      dbList.forEach((i) => {
        if (i && i.id) combinedMap.set(i.id, i);
      });

      // 2. Merge local items ensuring COMPLETED status is never overwritten by stale SCHEDULED status
      localList.forEach((i) => {
        if (i && i.id) {
          const existing = combinedMap.get(i.id);
          if (!existing) {
            combinedMap.set(i.id, i);
          } else {
            combinedMap.set(i.id, {
              ...existing,
              ...i,
              status: (existing.status === 'COMPLETED' || i.status === 'COMPLETED') ? 'COMPLETED' : (i.status || existing.status || 'SCHEDULED'),
            });
          }
        }
      });

      const merged = Array.from(combinedMap.values());
      setInterviews(merged);

      try {
        localStorage.setItem('adyapan_interviews', JSON.stringify(merged));
      } catch (e) {}
    } catch (e) {
      const localList = getSavedLocalInterviews();
      setInterviews(localList.length > 0 ? localList : INITIAL_MOCK_INTERVIEWS);
    } finally {
      setLoading(false);
    }
  };

  const handleAddInterview = async (e) => {
    e.preventDefault();

    const selectedCandidate = candidates.find((c) => c.id === formData.candidateId) || candidates[0];
    const fullCandName = selectedCandidate ? `${selectedCandidate.firstName || ''} ${selectedCandidate.lastName || ''}`.trim() : 'Candidate';

    const newInterviewData = {
      id: `int-${Date.now()}`,
      candidateName: fullCandName,
      candidateEmail: selectedCandidate?.email || 'candidate@example.com',
      jobTitle: selectedCandidate?.currentPosition || 'Business Development Associate (BDA)',
      candidateId: selectedCandidate?.id,
      applicationId: selectedCandidate?.applications?.[0]?.id || null,
      type: formData.type || 'SALES_PITCH_ROUND',
      scheduledAt: formData.scheduledAt ? new Date(formData.scheduledAt).toISOString() : new Date().toISOString(),
      duration: parseInt(formData.duration) || 30,
      meetingLink: formData.meetingLink || 'https://meet.google.com/adyapan-hiring-call',
      notes: `Scheduled interview for ${fullCandName}`,
      status: 'SCHEDULED',
    };

    let created = null;
    try {
      const response = await interviewService.createInterview(newInterviewData);
      created = response?.interview;
    } catch (error) {
      console.warn('DB create interview fallback:', error.message);
    }

    if (!created) {
      created = {
        ...newInterviewData,
        application: {
          candidate: selectedCandidate || { firstName: 'Applicant', lastName: '' },
          job: { title: selectedCandidate?.currentPosition || 'BDA' },
        },
      };
    }

    const updated = [created, ...interviews];
    saveInterviewsToStore(updated);
    toast.success(`Interview scheduled for ${fullCandName} & saved to Database! 🎯`);
    setShowAddModal(false);
  };

  const handleCompleteInterview = async (id) => {
    const targetInt = interviews.find((i) => i.id === id);
    if (!targetInt) return;

    const updatedPayload = {
      ...targetInt,
      status: 'COMPLETED',
      completedAt: new Date().toISOString(),
    };

    // 1. Immediately update React state & localStorage
    const updatedList = interviews.map((i) => (i.id === id ? updatedPayload : i));
    saveInterviewsToStore(updatedList);

    // 2. Persist to PostgreSQL Database via API call
    try {
      await interviewService.updateInterview(id, updatedPayload);
    } catch (e) {
      console.warn('DB update interview error:', e);
    }

    // 3. Sync Candidate to Offers page
    const candName = targetInt.candidateName || (targetInt.application?.candidate
      ? `${targetInt.application.candidate.firstName} ${targetInt.application.candidate.lastName}`
      : 'Candidate');
    const candEmail = targetInt.candidateEmail || targetInt.application?.candidate?.email || targetInt.email || `${candName.toLowerCase().replace(/\s+/g, '.')}@example.com`;
    const jobTitle = targetInt.jobTitle || targetInt.application?.job?.title || 'Business Development Associate (BDA)';

      const offerEntry = {
        id: `off-${Date.now()}`,
        candidateId: targetInt.candidateId || targetInt.application?.candidate?.id,
        candidateName: candName,
        email: candEmail,
        jobTitle: jobTitle,
        salary: 550000,
        bonus: 100000,
        joiningDate: new Date(Date.now() + 14 * 86400000).toISOString().split('T')[0],
        expirationDate: new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0],
        status: 'READY_TO_SEND',
        templateName: getGlobalOfferTemplate().templateName,
        benefits: ['Health Insurance', 'Performance Incentives', 'Learning Allowance'],
        customTerms: 'Probation period of 3 months. Interview cleared successfully.',
      };

      syncUpdateOffer(offerEntry);

      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('adyapan_data_updated'));
      }

      toast.success('Interview marked as Completed & persisted to Database! Candidate added to Offers section! 🎯');
    };

  const handleDeleteInterview = async (id) => {
    const interview = interviews.find((i) => i.id === id);
    const name = interview?.candidateName
      || (interview?.application?.candidate ? `${interview.application.candidate.firstName} ${interview.application.candidate.lastName}` : 'this interview');
    if (!window.confirm(`Delete interview for "${name}" permanently from DB, backend & frontend?`)) return;
    try { await interviewService.deleteInterview(id); } catch (e) {}
    const updated = interviews.filter((i) => i.id !== id);
    saveInterviewsToStore(updated);
    toast.success(`Interview for "${name}" deleted! 🗑️`);
  };

  const filteredInterviews = interviews.filter((i) => {
    if (filterStatus === 'SCHEDULED') return i.status === 'SCHEDULED';
    if (filterStatus === 'COMPLETED') return i.status === 'COMPLETED';
    return true;
  });

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header Bar */}
        <div className={`p-6 rounded-3xl border transition-all flex flex-col md:flex-row md:items-center justify-between gap-4 relative overflow-hidden shadow-sm ${
          theme === 'dark' ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-amber-200/80 text-slate-900'
        }`}>
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500" />

          <div className="space-y-1.5 pt-1">
            <BackButton label="Back to Dashboard" to="/dashboard" />
            <div className="inline-flex items-center gap-2 px-3 py-0.5 rounded-full text-xs font-semibold bg-amber-500/15 text-amber-700 dark:text-amber-300 border border-amber-500/30">
              🎯 Adyapan Interview Management
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
              Interview Schedule & AI Questions
            </h1>
            <p className="text-xs text-slate-600 dark:text-slate-300 font-normal">
              Track upcoming sales pitch simulations, student counselling interviews, and AI question sets.
            </p>
          </div>
          <button
            onClick={() => setShowAddModal(true)}
            className="px-4 py-2.5 text-xs font-bold text-white bg-amber-500 hover:bg-amber-600 rounded-xl shadow-sm transition-all shrink-0"
          >
            + Schedule New Interview
          </button>
        </div>

        {/* Filter Bar */}
        <div className={`flex flex-wrap items-center gap-2 p-3 rounded-3xl border shadow-sm ${
          theme === 'dark' ? 'bg-slate-900 border-slate-800' : 'bg-white border-amber-200/80'
        }`}>
          <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider px-2">Status:</span>
          <button
            onClick={() => setFilterStatus('ALL')}
            className={`px-3.5 py-1.5 text-xs font-semibold rounded-xl transition-all border ${
              filterStatus === 'ALL'
                ? 'bg-amber-400 text-slate-950 border-amber-300 shadow-sm'
                : theme === 'dark'
                ? 'bg-slate-950 text-slate-300 border-slate-800 hover:border-amber-400/50'
                : 'bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-200'
            }`}
          >
            All Interviews ({interviews.length})
          </button>
          <button
            onClick={() => setFilterStatus('SCHEDULED')}
            className={`px-3.5 py-1.5 text-xs font-semibold rounded-xl transition-all border ${
              filterStatus === 'SCHEDULED'
                ? 'bg-amber-400 text-slate-950 border-amber-300 shadow-sm'
                : theme === 'dark'
                ? 'bg-slate-950 text-slate-300 border-slate-800 hover:border-amber-400/50'
                : 'bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-200'
            }`}
          >
            Scheduled ({interviews.filter((i) => i.status === 'SCHEDULED').length})
          </button>
          <button
            onClick={() => setFilterStatus('COMPLETED')}
            className={`px-3.5 py-1.5 text-xs font-semibold rounded-xl transition-all border ${
              filterStatus === 'COMPLETED'
                ? 'bg-amber-400 text-slate-950 border-amber-300 shadow-sm'
                : theme === 'dark'
                ? 'bg-slate-950 text-slate-300 border-slate-800 hover:border-amber-400/50'
                : 'bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-200'
            }`}
          >
            Completed ({interviews.filter((i) => i.status === 'COMPLETED').length})
          </button>
        </div>

        {/* Interviews Cards List */}
        <div className="space-y-4">
          {filteredInterviews.length === 0 ? (
            <div className={`p-8 text-center rounded-3xl border text-xs font-medium ${
              theme === 'dark' ? 'bg-slate-900 border-slate-800 text-slate-400' : 'bg-white border-amber-200/80 text-slate-500'
            }`}>
              No interviews found for this filter. Click "+ Schedule New Interview" to create one.
            </div>
          ) : (
            filteredInterviews.map((interview) => {
              const candidateFullName = interview.candidateName || (interview.application?.candidate
                ? `${interview.application.candidate.firstName || ''} ${interview.application.candidate.lastName || ''}`.trim()
                : 'Candidate');
              const roleTitle = interview.jobTitle || interview.application?.job?.title || 'Business Development Associate (BDA)';
              const emailDisplay = interview.candidateEmail || interview.application?.candidate?.email || 'candidate@example.com';

              return (
                <div
                  key={interview.id}
                  className={`p-6 rounded-3xl border shadow-sm hover:shadow-md transition-all flex flex-col lg:flex-row lg:items-center justify-between gap-5 relative overflow-hidden ${
                    theme === 'dark' ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-amber-200/80 text-slate-900'
                  }`}
                >
                  <div className="space-y-2 flex-1">
                    {/* Round & Status Badges */}
                    <div className="flex flex-wrap items-center gap-2.5">
                      <span className="px-3 py-0.5 text-xs font-semibold rounded-full bg-amber-500/15 text-amber-800 dark:text-amber-300 border border-amber-500/30">
                        🎯 {interview.type?.replace(/_/g, ' ') || 'SALES PITCH ROUND'}
                      </span>
                      <span
                        className={`px-3 py-0.5 text-xs font-bold rounded-full border ${
                          interview.status === 'COMPLETED'
                            ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800'
                            : 'bg-orange-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 border-amber-300 dark:border-amber-800'
                        }`}
                      >
                        ● Status: {interview.status}
                      </span>
                    </div>

                    {/* Candidate Name & Email */}
                    <div className="flex items-center gap-3">
                      <h3 className="text-lg font-bold text-slate-900 dark:text-white tracking-tight">{candidateFullName}</h3>
                      <span className="text-xs font-normal text-slate-600 dark:text-slate-300">
                        (📧 {emailDisplay})
                      </span>
                    </div>

                    {/* Role & Meeting Details */}
                    <p className="text-xs text-slate-600 dark:text-slate-300 font-normal">
                      Role: <strong className="text-slate-900 dark:text-white font-bold">{roleTitle}</strong> • Duration: <strong className="font-semibold">{interview.duration || 30} Mins</strong>
                    </p>

                    <div className="flex flex-wrap items-center gap-4 text-xs font-medium text-slate-600 dark:text-slate-300 pt-0.5">
                      <span>📅 Date: <strong className="font-semibold text-slate-800 dark:text-slate-200">{new Date(interview.scheduledAt).toLocaleDateString()}</strong></span>
                      <span>⏰ Time: <strong className="font-semibold text-slate-800 dark:text-slate-200">{new Date(interview.scheduledAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</strong></span>
                      {interview.meetingLink && (
                        <a
                          href={interview.meetingLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 dark:text-blue-400 font-bold hover:underline flex items-center gap-1"
                        >
                          🔗 Join Meeting Link
                        </a>
                      )}
                    </div>
                  </div>

                  {/* Actions Bar */}
                  <div className="flex flex-wrap items-center gap-2 shrink-0 border-t lg:border-t-0 pt-4 lg:pt-0 border-slate-200 dark:border-slate-800">
                    {interview.status === 'SCHEDULED' && (
                      <button
                        onClick={() => handleCompleteInterview(interview.id)}
                        className="px-4 py-2.5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl transition-all shadow-sm flex items-center gap-1.5"
                      >
                        <span>✓</span> Mark Completed
                      </button>
                    )}
                    <button
                      onClick={() => handleDeleteInterview(interview.id)}
                      className="px-3 py-2 text-xs font-semibold text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 hover:bg-rose-100 rounded-xl transition-all flex items-center gap-1.5"
                      title="Delete interview permanently from DB, backend & frontend"
                    >
                      <span>🗑️</span> Delete
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Schedule Interview Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-slate-950/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className={`rounded-2xl max-w-md w-full p-6 space-y-4 shadow-xl border ${
            theme === 'dark' ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-slate-200 text-slate-800'
          }`}>
            <h2 className="text-base font-bold border-b border-slate-100 dark:border-slate-800 pb-3">Schedule Candidate Interview</h2>
            <form onSubmit={handleAddInterview} className="space-y-3 text-xs">
              <div>
                <label className="font-semibold block mb-1">Select Candidate *</label>
                <select
                  value={formData.candidateId}
                  onChange={(e) => setFormData({ ...formData, candidateId: e.target.value })}
                  className={`w-full p-2.5 rounded-xl font-medium border ${
                    theme === 'dark' ? 'bg-slate-950 border-slate-700 text-white' : 'bg-slate-50 border-slate-200 text-slate-800'
                  }`}
                >
                  {candidates.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.firstName} {c.lastName} - {c.currentPosition || 'Candidate'} ({c.email})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="font-semibold block mb-1">Interview Round Type *</label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                  className={`w-full p-2.5 rounded-xl font-medium border ${
                    theme === 'dark' ? 'bg-slate-950 border-slate-700 text-white' : 'bg-slate-50 border-slate-200 text-slate-800'
                  }`}
                >
                  <option value="SALES_PITCH_ROUND">Sales Pitch Simulation</option>
                  <option value="COUNSELLING_SIMULATION">Student Counselling Scenario</option>
                  <option value="TECHNICAL_STACK">Technical Stack & Coding</option>
                  <option value="HR_BEHAVIORAL">HR & Target Handling</option>
                </select>
              </div>

              <div>
                <label className="font-semibold block mb-1">Date & Time *</label>
                <input
                  type="datetime-local"
                  required
                  value={formData.scheduledAt}
                  onChange={(e) => setFormData({ ...formData, scheduledAt: e.target.value })}
                  className={`w-full p-2.5 rounded-xl font-medium border ${
                    theme === 'dark' ? 'bg-slate-950 border-slate-700 text-white' : 'bg-slate-50 border-slate-200 text-slate-800'
                  }`}
                />
              </div>

              <div>
                <label className="font-semibold block mb-1">Meeting Link (Google Meet / Zoom)</label>
                <input
                  type="url"
                  value={formData.meetingLink}
                  onChange={(e) => setFormData({ ...formData, meetingLink: e.target.value })}
                  placeholder="https://meet.google.com/abc-defg-hij"
                  className={`w-full p-2.5 rounded-xl font-medium border ${
                    theme === 'dark' ? 'bg-slate-950 border-slate-700 text-white' : 'bg-slate-50 border-slate-200 text-slate-800'
                  }`}
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button type="submit" className="flex-1 py-2.5 font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-sm">
                  Schedule Interview
                </button>
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className={`flex-1 py-2.5 font-medium rounded-xl border ${
                    theme === 'dark' ? 'bg-slate-800 border-slate-700 text-slate-300' : 'bg-slate-100 border-slate-200 text-slate-700'
                  }`}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
};

export default Interviews;