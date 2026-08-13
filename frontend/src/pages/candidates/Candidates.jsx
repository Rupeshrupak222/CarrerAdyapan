import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { candidateService } from '../../services/candidateService';
import { calculateRealAIScore } from '../../utils/applicationStore';
import { useTheme } from '../../context/ThemeContext';
import toast from 'react-hot-toast';

const DEFAULT_FALLBACK_CANDIDATES = [];

const Candidates = () => {
  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showAtsModal, setShowAtsModal] = useState(false);
  const [atsResumeText, setAtsResumeText] = useState('');
  const [atsResumeFile, setAtsResumeFile] = useState(null);
  const [atsTargetJobTitle, setAtsTargetJobTitle] = useState('Senior Business Development Associate (BDA)');
  const [atsLoading, setAtsLoading] = useState(false);
  const [atsResult, setAtsResult] = useState(null);
  const { theme } = useTheme();

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    currentPosition: '',
    experience: '',
    location: '',
    skills: '',
  });

  useEffect(() => {
    fetchCandidates();
  }, []);

  const fetchCandidates = async () => {
    try {
      const res = await candidateService.getAllCandidates();
      if (res?.candidates && res.candidates.length > 0) {
        setCandidates(res.candidates);
      } else {
        setCandidates(DEFAULT_FALLBACK_CANDIDATES);
      }
    } catch (error) {
      console.warn('Backend candidates fetch error, using fallback:', error);
      setCandidates(DEFAULT_FALLBACK_CANDIDATES);
    } finally {
      setLoading(false);
    }
  };

  const handleAddCandidate = async (e) => {
    e.preventDefault();
    if (!formData.firstName || !formData.email) {
      toast.error('First name and email are required');
      return;
    }

    try {
      const response = await candidateService.createCandidate(formData);
      if (response?.candidate) {
        setCandidates([response.candidate, ...candidates]);
        toast.success(`Candidate ${response.candidate.firstName} saved to PostgreSQL DB! 🎉`);
      }
      setShowAddModal(false);
      setFormData({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        currentPosition: 'Business Development Associate (BDA)',
        experience: 2,
        location: 'Mumbai',
        skills: 'EdTech Sales, Student Counselling, Telesales, Target Handling',
      });
    } catch (error) {
      toast.error('Failed to create candidate in database');
    }
  };

  const handleDeleteCandidate = async (id, name) => {
    if (!window.confirm(`Delete candidate "${name}" permanently from DB, backend & frontend?`)) return;
    try {
      await candidateService.deleteCandidate(id);
    } catch (err) {
      // ignore errors — still remove from UI
    }
    setCandidates((prev) => prev.filter((c) => c.id !== id));
    // Also remove from localStorage
    try {
      const key = 'adyapan_candidates';
      const stored = JSON.parse(localStorage.getItem(key) || '[]');
      localStorage.setItem(key, JSON.stringify(stored.filter((c) => c.id !== id)));
    } catch (e) { }
    toast.success(`Candidate "${name}" deleted! 🗑️`);
  };

  const handleRunAtsEngine = async (e) => {
    e.preventDefault();
    if (!atsResumeText && !atsResumeFile) {
      return toast.error('Please enter resume text or upload a PDF/DOCX file');
    }

    setAtsLoading(true);
    try {
      let payload;
      if (atsResumeFile) {
        payload = new FormData();
        payload.append('resumeFile', atsResumeFile);
        payload.append('jobTitle', atsTargetJobTitle);
      } else {
        payload = {
          resumeText: atsResumeText,
          jobTitle: atsTargetJobTitle,
        };
      }

      const res = await candidateService.parseAndScoreResume(payload);
      if (res?.success) {
        setAtsResult(res);
        toast.success(`ATS AI Resume Analysis Complete! Score: ${res.atsResult?.aiScore}% ⚡`);
      } else {
        toast.error('Failed to calculate ATS score');
      }
    } catch (err) {
      toast.error('ATS Engine processing error');
    } finally {
      setAtsLoading(false);
    }
  };

  const handleDownloadCandidateResume = (cand) => {
    if (!cand) return;
    const fileUrl = cand.resumeUrl || cand.resumeDataUrl || cand.parsedResume?.resumeUrl || cand.parsedResume?.resumeDataUrl;
    const fileName = cand.resumeFileName || cand.parsedResume?.resumeFileName || `${cand.firstName || 'Candidate'}_${cand.lastName || ''}_Resume.pdf`;

    // 1. Download original file URL from backend static uploads folder (http://localhost:5000/uploads/resumes/...)
    if (fileUrl && typeof fileUrl === 'string' && (fileUrl.startsWith('http://') || fileUrl.startsWith('https://')) && !fileUrl.includes('example.com')) {
      const link = document.createElement('a');
      link.href = fileUrl;
      link.download = fileName;
      link.target = '_blank';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      toast.success(`Downloading original file: ${fileName} 📥`);
      return;
    }

    // 2. Download original base64 file data if present
    if (fileUrl && typeof fileUrl === 'string' && fileUrl.startsWith('data:')) {
      try {
        const parts = fileUrl.split(',');
        const mimeMatch = parts[0].match(/:(.*?);/);
        const mimeType = mimeMatch ? mimeMatch[1] : 'application/pdf';
        const base64Data = parts[1];

        const binaryString = atob(base64Data);
        const len = binaryString.length;
        const bytes = new Uint8Array(len);
        for (let i = 0; i < len; i++) {
          bytes[i] = binaryString.charCodeAt(i);
        }

        const blob = new Blob([bytes], { type: mimeType });
        const blobUrl = URL.createObjectURL(blob);

        const link = document.createElement('a');
        link.href = blobUrl;
        link.download = fileName;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        setTimeout(() => URL.revokeObjectURL(blobUrl), 3000);
        toast.success(`Downloaded original file: ${fileName} 📥`);
        return;
      } catch (e) {
        console.error('Base64 decode error:', e);
      }
    }

    toast.error('No uploaded resume file found for this candidate');
  };

  const filteredCandidates = candidates.filter((cand) => {
    const fullName = `${cand.firstName || ''} ${cand.lastName || ''}`.toLowerCase();
    const skillsText = Array.isArray(cand.skills)
      ? cand.skills.join(' ').toLowerCase()
      : String(cand.skills || '').toLowerCase();
    const pos = (cand.currentPosition || '').toLowerCase();
    const query = search.toLowerCase();

    const matchesSearch = fullName.includes(query) || skillsText.includes(query) || pos.includes(query);
    const matchesStatus = statusFilter === 'ALL' ? true : cand.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header Bar */}
        <div className={`p-6 rounded-3xl border transition-all flex flex-col md:flex-row md:items-center justify-between gap-4 relative overflow-hidden shadow-sm ${theme === 'dark' ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-orange-200/80 text-slate-900'
          }`}>
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-orange-600 via-orange-500 to-orange-500" />

          <div className="pt-1 space-y-1">
            <div className="inline-flex items-center gap-2 px-3 py-0.5 rounded-full text-xs font-semibold bg-orange-500/15 text-orange-700 dark:text-orange-300 border border-orange-500/30">
              👥 Adyapan Candidate Management
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
              Candidate Directory & AI Audit
            </h1>
            <p className="text-xs text-slate-600 dark:text-slate-300 font-normal">
              Review applicant resumes, verified skill scores, work experience, and schedule interviews.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <Link
              to="/candidates/compare"
              className={`px-3.5 py-2.5 text-xs font-semibold rounded-xl border transition-all flex items-center gap-1.5 ${theme === 'dark'
                  ? 'bg-slate-950 text-slate-200 border-slate-800 hover:bg-slate-800'
                  : 'bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-200'
                }`}
            >
              <span>⚡ Compare Matrix</span>
            </Link>

            <button
              onClick={() => setShowAddModal(true)}
              className="px-4 py-2.5 text-xs font-bold text-white bg-orange-500 hover:bg-orange-600 rounded-xl shadow-sm transition-all"
            >
              + Add Candidate Manually
            </button>
          </div>
        </div>

        {/* Search & Filter Bar */}
        <div className={`p-4 rounded-3xl border shadow-sm flex flex-col md:flex-row items-center justify-between gap-4 ${theme === 'dark' ? 'bg-slate-900 border-slate-800' : 'bg-white border-orange-200/80'
          }`}>
          {/* Search Input */}
          <div className="relative w-full md:w-80">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-orange-500 font-bold text-xs">
              🔍
            </span>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search candidate name, skills, role..."
              className={`w-full pl-9 pr-4 py-2 text-xs font-normal border rounded-xl focus:outline-none ${theme === 'dark'
                  ? 'bg-slate-950 border-slate-700 text-white placeholder-slate-500 focus:border-orange-400'
                  : 'bg-orange-50/40 border-orange-200/80 text-slate-800 placeholder-slate-400 focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20'
                }`}
            />
          </div>

          {/* Status Filter Badges */}
          <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
            {['ALL', 'SHORTLISTED', 'INTERVIEWED', 'AI_SCREENED'].map((st) => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`px-3 py-1.5 text-xs font-semibold rounded-xl transition-all border ${statusFilter === st
                    ? 'bg-orange-400 text-slate-950 border-orange-300 shadow-sm'
                    : theme === 'dark'
                      ? 'bg-slate-950 text-slate-300 border-slate-800 hover:border-orange-400/50'
                      : 'bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-200'
                  }`}
              >
                {st === 'ALL' ? 'All Applicants' : st.replace('_', ' ')}
              </button>
            ))}
          </div>
        </div>

        {/* Candidate Cards Grid */}
        <div className="space-y-4">
          {filteredCandidates.length === 0 ? (
            <div className={`p-8 text-center rounded-3xl border text-xs font-normal ${theme === 'dark' ? 'bg-slate-900 border-slate-800 text-slate-400' : 'bg-white border-orange-200/80 text-slate-500'
              }`}>
              No candidates found matching filter criteria. Click "+ Add Candidate Manually" to add one.
            </div>
          ) : (
            filteredCandidates.map((cand) => {
              const skillsList = Array.isArray(cand.skills) ? cand.skills : (typeof cand.skills === 'string' ? cand.skills.split(',').map((s) => s.trim()) : []);
              const isStudent = cand.employmentStatus === 'STUDENT' || Number(cand.totalExperience) === 0 || String(cand.currentPosition || '').toLowerCase().includes('student') || String(cand.currentPosition || '').toLowerCase().includes('fresher');
              const calculated = calculateRealAIScore(skillsList, isStudent ? 0 : (cand.totalExperience || 0), cand.currentPosition || cand.jobTitle || 'Business Development Associate (BDA)');

              const aiScore = cand.score || cand.applications?.[0]?.aiScore || calculated.score;
              const candReason = cand.reason || cand.applications?.[0]?.matchReason || calculated.reason;
              const eduDegree = typeof cand.education === 'object' && cand.education?.degree ? cand.education.degree : (cand.education || 'Graduate');
              const college = typeof cand.education === 'object' && cand.education?.college ? cand.education.college : (cand.collegeName || 'Recognized College');

              const positionDisplay = cand.currentPosition || (isStudent ? 'Student / Fresher' : 'Applicant');
              const companyDisplay = cand.currentCompany ? (isStudent ? `(${cand.currentCompany})` : `at ${cand.currentCompany}`) : '';

              return (
                <div
                  key={cand.id}
                  className={`p-6 rounded-3xl border shadow-sm hover:shadow-md transition-all flex flex-col lg:flex-row lg:items-center justify-between gap-5 relative overflow-hidden group ${theme === 'dark' ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-orange-200/80 text-slate-900'
                    }`}
                >
                  <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-orange-500 via-orange-400 to-orange-500 opacity-80 group-hover:opacity-100 transition-opacity" />

                  {/* Candidate Info */}
                  <div className="flex items-start gap-4 pt-1">
                    <Link
                      to={`/candidates/${cand.id}`}
                      className="w-12 h-12 rounded-2xl bg-orange-400 text-slate-950 font-bold text-base flex items-center justify-center shrink-0 shadow-sm hover:scale-105 hover:bg-orange-500 transition-all cursor-pointer"
                      title={`View ${cand.firstName}'s Profile`}
                    >
                      {cand.firstName?.charAt(0)}
                      {cand.lastName?.charAt(0)}
                    </Link>

                    <div className="space-y-1.5">
                      <div className="flex flex-wrap items-center gap-2.5">
                        <Link
                          to={`/candidates/${cand.id}`}
                          className="text-base font-bold text-slate-900 dark:text-white hover:text-orange-500 dark:hover:text-orange-400 transition-colors cursor-pointer group/name"
                          title={`View ${cand.firstName}'s Profile`}
                        >
                          <span className="group-hover/name:underline">{cand.firstName} {cand.lastName}</span>
                        </Link>
                        <span className="px-2.5 py-0.5 text-xs font-semibold rounded-full bg-orange-500/15 text-orange-700 dark:text-orange-300 border border-orange-500/30">
                          ● {isStudent ? 'Student / Fresher' : `Working (${cand.currentCompanyTenure || 'Professional'})`}
                        </span>
                        <span className="px-2.5 py-0.5 text-xs font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-500/15 rounded-full border border-emerald-500/30">
                          ✨ {aiScore}% AI Match
                        </span>
                      </div>

                      <p className="text-xs text-slate-600 dark:text-slate-300 font-normal">
                        Role: <strong className="text-slate-900 dark:text-white font-semibold">{positionDisplay}</strong> {companyDisplay} • Experience: <strong className="text-slate-900 dark:text-white font-semibold">{cand.totalExperience ?? 0} Yrs</strong>
                      </p>

                      <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 dark:text-slate-400 font-normal">
                        <span>📧 {cand.email}</span>
                        <span>📍 {cand.location || 'India'}</span>
                        <span>🎓 {eduDegree} ({college})</span>
                      </div>

                      {/* Skill Badges */}
                      <div className="flex flex-wrap gap-1.5 pt-1">
                        {skillsList.map((sk) => (
                          <span
                            key={sk}
                            className={`px-2.5 py-0.5 text-xs font-medium rounded-xl border ${theme === 'dark'
                                ? 'bg-slate-950 text-slate-300 border-slate-800'
                                : 'bg-slate-100 text-slate-700 border-slate-200'
                              }`}
                          >
                            {sk}
                          </span>
                        ))}
                      </div>

                      <p className={`text-xs font-normal mt-1 p-3 rounded-2xl border leading-relaxed ${theme === 'dark'
                          ? 'bg-slate-950 text-slate-300 border-slate-800'
                          : 'bg-orange-50/50 text-slate-800 border-orange-200/60'
                        }`}>
                        🤖 <strong className="font-bold text-orange-600 dark:text-orange-400">AI Match Insight:</strong> {candReason}
                      </p>
                    </div>
                  </div>

                  {/* Candidate Action Buttons */}
                  <div className="flex flex-wrap lg:flex-col items-end justify-center gap-2 shrink-0 border-t lg:border-t-0 pt-3 lg:pt-0 border-slate-100 dark:border-slate-800">
                    <Link
                      to={`/candidates/${cand.id}`}
                      className={`px-3.5 py-2 text-xs font-semibold rounded-xl border transition-all text-center w-full ${theme === 'dark'
                          ? 'bg-slate-950 text-slate-200 border-slate-800 hover:bg-slate-800'
                          : 'bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-200'
                        }`}
                    >
                      Profile & Resume →
                    </Link>
                    <Link
                      to={`/interviews?candidateId=${cand.id}`}
                      className="px-3.5 py-2 text-xs font-bold text-white bg-orange-500 hover:bg-orange-600 rounded-xl transition-all shadow-sm text-center w-full"
                    >
                      Schedule Interview
                    </Link>
                    <button
                      onClick={() => handleDeleteCandidate(cand.id, `${cand.firstName} ${cand.lastName}`)}
                      className="px-3.5 py-2 text-xs font-semibold text-red-600 dark:text-red-400 bg-red-500/10 border border-red-500/20 hover:bg-red-500/20 rounded-xl transition-all w-full flex items-center justify-center gap-1.5"
                      title="Delete candidate from DB, backend & frontend"
                    >
                      🗑️ Delete Candidate
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Add Candidate Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-slate-950/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className={`rounded-2xl max-w-md w-full p-6 space-y-4 shadow-xl border ${theme === 'dark' ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-slate-200 text-slate-900'
            }`}>
            <h2 className="text-base font-bold border-b border-slate-100 dark:border-slate-800 pb-3">Add Candidate Manually</h2>
            <form onSubmit={handleAddCandidate} className="space-y-3 text-xs font-medium">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block mb-1 font-semibold">First Name *</label>
                  <input
                    type="text"
                    required
                    value={formData.firstName}
                    onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                    className={`w-full p-2.5 rounded-xl font-medium border ${theme === 'dark' ? 'bg-slate-950 border-slate-700 text-white' : 'bg-slate-50 border-slate-200 text-slate-800'
                      }`}
                  />
                </div>
                <div>
                  <label className="block mb-1 font-semibold">Last Name</label>
                  <input
                    type="text"
                    value={formData.lastName}
                    onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                    className={`w-full p-2.5 rounded-xl font-medium border ${theme === 'dark' ? 'bg-slate-950 border-slate-700 text-white' : 'bg-slate-50 border-slate-200 text-slate-800'
                      }`}
                  />
                </div>
              </div>

              <div>
                <label className="block mb-1 font-semibold">Email Address *</label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className={`w-full p-2.5 rounded-xl font-medium border ${theme === 'dark' ? 'bg-slate-950 border-slate-700 text-white' : 'bg-slate-50 border-slate-200 text-slate-800'
                    }`}
                />
              </div>

              <div>
                <label className="block mb-1 font-semibold">Current Role Title *</label>
                <input
                  type="text"
                  required
                  value={formData.currentPosition}
                  onChange={(e) => setFormData({ ...formData, currentPosition: e.target.value })}
                  className={`w-full p-2.5 rounded-xl font-medium border ${theme === 'dark' ? 'bg-slate-950 border-slate-700 text-white' : 'bg-slate-50 border-slate-200 text-slate-800'
                    }`}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block mb-1 font-semibold">Total Experience (Yrs)</label>
                  <input
                    type="number"
                    step="0.5"
                    value={formData.experience}
                    onChange={(e) => setFormData({ ...formData, experience: e.target.value })}
                    className={`w-full p-2.5 rounded-xl font-medium border ${theme === 'dark' ? 'bg-slate-950 border-slate-700 text-white' : 'bg-slate-50 border-slate-200 text-slate-800'
                      }`}
                  />
                </div>
                <div>
                  <label className="block mb-1 font-semibold">Location</label>
                  <input
                    type="text"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    className={`w-full p-2.5 rounded-xl font-medium border ${theme === 'dark' ? 'bg-slate-950 border-slate-700 text-white' : 'bg-slate-50 border-slate-200 text-slate-800'
                      }`}
                  />
                </div>
              </div>

              <div>
                <label className="block mb-1 font-semibold">Skills (comma-separated)</label>
                <input
                  type="text"
                  value={formData.skills}
                  onChange={(e) => setFormData({ ...formData, skills: e.target.value })}
                  className={`w-full p-2.5 rounded-xl font-medium border ${theme === 'dark' ? 'bg-slate-950 border-slate-700 text-white' : 'bg-slate-50 border-slate-200 text-slate-800'
                    }`}
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button type="submit" className="flex-1 py-2.5 font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-sm">
                  Add & AI Audit Candidate
                </button>
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className={`flex-1 py-2.5 font-medium rounded-xl border ${theme === 'dark' ? 'bg-slate-800 border-slate-700 text-slate-300' : 'bg-slate-100 border-slate-200 text-slate-700'
                    }`}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Real-Time ATS AI Resume Matcher & Score Engine Modal */}
      {showAtsModal && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-md flex items-center justify-center z-50 p-4">
          <div className={`rounded-2xl max-w-2xl w-full p-6 space-y-4 shadow-2xl border max-h-[90vh] overflow-y-auto ${theme === 'dark' ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-slate-200 text-slate-900'
            }`}>
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div>
                <h2 className="text-base font-bold flex items-center gap-2">
                  <span>⚡ Real-Time ATS AI Resume Parsing & Scoring Engine</span>
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                  Upload PDF/DOCX or paste resume text to extract skills and calculate real-time ATS job requirements score.
                </p>
              </div>
              <button onClick={() => setShowAtsModal(false)} className="text-slate-400 hover:text-slate-600 font-bold text-sm">✕</button>
            </div>

            <form onSubmit={handleRunAtsEngine} className="space-y-4 text-xs font-medium">
              <div>
                <label className="block mb-1 font-semibold">Targeted Job Opening *</label>
                <select
                  value={atsTargetJobTitle}
                  onChange={(e) => setAtsTargetJobTitle(e.target.value)}
                  className={`w-full p-2.5 rounded-xl font-medium border ${theme === 'dark' ? 'bg-slate-950 border-slate-700 text-white' : 'bg-slate-50 border-slate-200 text-slate-800'
                    }`}
                >
                  <option value="Senior Business Development Associate (BDA)">Senior Business Development Associate (BDA)</option>
                  <option value="Academic Counsellor / Student Advisor">Academic Counsellor / Student Advisor</option>
                  <option value="Inside Sales Executive / Telecaller">Inside Sales Executive / Telecaller</option>
                </select>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block mb-1 font-semibold">Upload PDF / DOCX Resume File</label>
                  <input
                    type="file"
                    accept=".pdf,.docx,.doc"
                    onChange={(e) => setAtsResumeFile(e.target.files[0])}
                    className={`w-full p-2 rounded-xl text-xs border ${theme === 'dark' ? 'bg-slate-950 border-slate-700 text-slate-300' : 'bg-slate-50 border-slate-200 text-slate-700'
                      }`}
                  />
                  {atsResumeFile && (
                    <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold mt-1">
                      📄 File Attached: {atsResumeFile.name}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block mb-1 font-semibold">OR Paste Raw Resume Content</label>
                  <textarea
                    rows="3"
                    value={atsResumeText}
                    onChange={(e) => setAtsResumeText(e.target.value)}
                    placeholder="Paste candidate resume text, skills, and work history..."
                    className={`w-full p-2.5 rounded-xl font-medium border ${theme === 'dark' ? 'bg-slate-950 border-slate-700 text-white placeholder:text-slate-600' : 'bg-slate-50 border-slate-200 text-slate-800 placeholder:text-slate-400'
                      }`}
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={atsLoading}
                className="w-full py-3 font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-sm transition-all disabled:opacity-50 flex items-center justify-center gap-2"
              >
                <span>⚡</span> {atsLoading ? 'Parsing & Scoring ATS Match...' : 'Run ATS AI Match Engine'}
              </button>
            </form>

            {/* ATS Scoring Result View */}
            {atsResult && (
              <div className={`p-4 rounded-xl border space-y-3 ${theme === 'dark' ? 'bg-slate-950 border-slate-800' : 'bg-indigo-50/50 border-indigo-200'
                }`}>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 dark:border-slate-800 pb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-14 h-14 rounded-2xl bg-indigo-600 text-white font-extrabold text-lg flex items-center justify-center shadow-md">
                      {atsResult.atsResult?.aiScore}%
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-sm font-bold">ATS AI Match Score</h3>
                        <span className="px-2 py-0.5 text-[10px] font-bold bg-indigo-100 text-indigo-800 dark:bg-indigo-900/60 dark:text-indigo-300 rounded-md">
                          {atsResult.atsResult?.atsCategory}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                        Target Role: <strong>{atsResult.job?.title || atsTargetJobTitle}</strong>
                      </p>
                    </div>
                  </div>
                </div>

                {/* Extracted Skills & Experience */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs font-medium">
                  <div className="p-3 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                    <span className="text-slate-400 text-[10px] font-bold block uppercase">Matched Key Skills</span>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {(atsResult.atsResult?.matchedSkills || []).map((s) => (
                        <span key={s} className="px-2 py-0.5 text-[10px] font-semibold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 rounded-md">
                          ✓ {s}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="p-3 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                    <span className="text-slate-400 text-[10px] font-bold block uppercase">Missing / Recommended Skills</span>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {(atsResult.atsResult?.missingSkills || ['None']).map((s) => (
                        <span key={s} className="px-2 py-0.5 text-[10px] font-semibold bg-orange-100 text-orange-800 dark:bg-orange-950 dark:text-orange-300 rounded-md">
                          ! {s}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Match Reason Explanation */}
                <div className="p-3 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs leading-relaxed">
                  <strong className="text-slate-700 dark:text-slate-300 block mb-1">🤖 AI ATS Match Reason Explanation:</strong>
                  <p className="text-slate-600 dark:text-slate-400 italic">
                    "{atsResult.atsResult?.matchReason}"
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </DashboardLayout>
  );
};

export default Candidates;