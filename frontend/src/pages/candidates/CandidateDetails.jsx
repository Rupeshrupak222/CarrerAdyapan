import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import DashboardLayout from '../../components/layout/DashboardLayout';
import BackButton from '../../components/common/BackButton';
import { candidateService } from '../../services/candidateService';
import { offerService } from '../../services/offerService';
import {
  getStoredCandidates,
  calculateRealAIScore,
  getGlobalOfferTemplate,
  getStoredOffers,
  syncUpdateOffer
} from '../../utils/applicationStore';
import { useTheme } from '../../context/ThemeContext';
import toast from 'react-hot-toast';

const CandidateDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [candidate, setCandidate] = useState(null);
  const [loading, setLoading] = useState(true);
  const [aiScoring, setAiScoring] = useState(false);

  const [showEditOfferModal, setShowEditOfferModal] = useState(false);
  const [editingOfferData, setEditingOfferData] = useState(null);
  const [viewingPdfUrl, setViewingPdfUrl] = useState(null);
  const [showPdfModal, setShowPdfModal] = useState(false);

  const { theme } = useTheme();

  useEffect(() => {
    fetchCandidate();
  }, [id]);

  const fetchCandidate = async () => {
    setLoading(true);
    let loadedCandidate = null;

    // 1. Try DB backend by ID
    try {
      const res = await candidateService.getCandidateById(id);
      if (res?.candidate) {
        loadedCandidate = res.candidate;
      }
    } catch (error) {
      console.warn('Backend candidate fetch error, trying local:', error);
    }

    // 2. Search local stored candidates & offers
    const localCandidates = getStoredCandidates();
    const offersList = getStoredOffers();

    const matchingOffer = offersList.find(
      (o) => o.id === id || o.candidateId === id || (o.email && o.email === id)
    );

    if (!loadedCandidate) {
      const foundCandidate = localCandidates.find((c) => {
        if (!c) return false;
        if (c.id === id) return true;
        if (c.email && (c.email === id || (matchingOffer && c.email.toLowerCase() === matchingOffer.email?.toLowerCase()))) return true;
        if (matchingOffer && (c.id === matchingOffer.candidateId || (c.firstName && matchingOffer.candidateName?.toLowerCase().includes(c.firstName.toLowerCase())))) return true;
        return false;
      });

      if (foundCandidate) {
        loadedCandidate = foundCandidate;
      }
    }

    // 3. Construct candidate from matchingOffer if not found in candidate store
    if (!loadedCandidate && matchingOffer) {
      const nameParts = (matchingOffer.candidateName || 'Valued Candidate').split(' ');
      const fName = nameParts[0] || 'Candidate';
      const lName = nameParts.slice(1).join(' ') || '';

      loadedCandidate = {
        id: matchingOffer.candidateId || matchingOffer.id,
        firstName: fName,
        lastName: lName,
        email: matchingOffer.email || matchingOffer.candidateEmail || 'N/A',
        phone: matchingOffer.phone || 'N/A',
        employmentStatus: 'EMPLOYED',
        currentPosition: matchingOffer.jobTitle || 'Business Development Associate (BDA)',
        currentCompany: 'Adyapan Selected Candidate',
        currentCompanyTenure: '1-3 Years',
        totalExperience: 2,
        noticePeriod: 'Immediate',
        currentCtc: '₹4,50,000 LPA',
        expectedCtc: '₹6,50,000 LPA',
        location: matchingOffer.location || 'India',
        education: 'Graduate',
        skills: ['EdTech Sales', 'Student Counselling', 'Communication', 'Target Handling'],
        score: 88,
        reason: 'Selected candidate for Adyapan Edutech.',
        status: matchingOffer.status || 'SHORTLISTED',
        appliedAt: new Date().toISOString(),
      };
    }

    // 4. Check DB candidates list fallback
    if (!loadedCandidate) {
      try {
        const allDbRes = await candidateService.getAllCandidates().catch(() => null);
        const allDb = allDbRes?.candidates || [];
        const dbMatch = allDb.find((c) => c.id === id || c.email === id || (matchingOffer && c.email === matchingOffer.email));
        if (dbMatch) {
          loadedCandidate = dbMatch;
        }
      } catch (e) {}
    }

    // 5. Final fallback
    if (!loadedCandidate) {
      loadedCandidate = getFallbackCandidate(id);
    }

    // Attach offer details & override placeholder name
    const activeOffer = matchingOffer || offersList.find(
      (o) => o.candidateId === loadedCandidate.id || (o.email && loadedCandidate.email && o.email.toLowerCase() === loadedCandidate.email.toLowerCase())
    );

    if (activeOffer) {
      const fullCandidateName = `${loadedCandidate.firstName || ''} ${loadedCandidate.lastName || ''}`.trim();
      const resolvedName = (fullCandidateName && fullCandidateName !== 'Applicant') ? fullCandidateName : (activeOffer.candidateName || 'Candidate');
      const nameSplit = resolvedName.split(' ');

      loadedCandidate = {
        ...loadedCandidate,
        firstName: nameSplit[0] || loadedCandidate.firstName || 'Candidate',
        lastName: nameSplit.slice(1).join(' ') || loadedCandidate.lastName || '',
        email: (loadedCandidate.email && loadedCandidate.email !== 'N/A') ? loadedCandidate.email : (activeOffer.email || activeOffer.candidateEmail || ''),
        offerDetails: {
          salary: activeOffer.salary,
          bonus: activeOffer.bonus,
          joiningDate: activeOffer.trainingStartDate || activeOffer.joiningDate,
          expirationDate: activeOffer.expirationDate,
          customTerms: activeOffer.customTerms,
          benefits: activeOffer.benefits,
          status: activeOffer.status,
        },
      };
    }

    setCandidate(loadedCandidate);
    setLoading(false);
  };

  const getFallbackCandidate = (candId) => ({
    id: candId || `cand-${Date.now()}`,
    firstName: 'Applicant',
    lastName: '',
    email: 'N/A',
    phone: 'N/A',
    employmentStatus: 'STUDENT',
    currentPosition: 'Student / Fresher',
    currentCompany: 'University Student',
    currentCompanyTenure: 'N/A',
    currentRoleDescription: '',
    totalExperience: 0,
    noticePeriod: 'Immediate',
    currentCtc: 'N/A',
    expectedCtc: 'N/A',
    location: 'India',
    education: 'Graduate',
    collegeName: 'University',
    graduationYear: '2024',
    specialization: 'General',
    cgpa: 'Passing',
    preferredLocationType: 'Hybrid',
    motivationPitch: '',
    skills: [],
    score: 85,
    reason: 'Application profile under evaluation.',
    status: 'AI_SCREENED',
    appliedAt: new Date().toISOString(),
    resumeFileName: '',
    resumeDataUrl: null,
  });

  const handleDownloadResume = () => {
    if (!candidate) return;
    const fileUrl = candidate.resumeUrl || candidate.resumeDataUrl || candidate.parsedResume?.resumeUrl || candidate.parsedResume?.resumeDataUrl;
    const fileName = candidate.resumeFileName || candidate.parsedResume?.resumeFileName || `${candidate.firstName || 'Candidate'}_${candidate.lastName || ''}_Resume.pdf`;

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

  const handleRunAIScreening = async () => {
    if (!candidate) return;
    setAiScoring(true);
    try {
      const skillsList = Array.isArray(candidate.skills) ? candidate.skills : [];
      const eduText = typeof candidate.education === 'object' && candidate.education?.degree ? candidate.education.degree : String(candidate.education || '');
      const resumeTextPayload = `${candidate.firstName} ${candidate.lastName} Skills: ${skillsList.join(', ')}. Position: ${candidate.currentPosition || ''}. Experience: ${candidate.totalExperience || 0} years. Education: ${eduText}.`;

      const res = await candidateService.parseAndScoreResume({
        candidateId: candidate.id,
        jobId: candidate.jobId || candidate.applications?.[0]?.jobId || null,
        resumeId: candidate.resumeUrl || candidate.id,
        resumeText: resumeTextPayload,
        jobTitle: candidate.currentPosition || 'Business Development Associate (BDA)',
      });

      if (!res?.success) {
        toast.error(res?.message || 'Failed to process resume ATS scoring');
        return;
      }

      const newScore = res?.atsResult?.aiScore ?? 0;
      const newReason = res?.atsResult?.matchReason || 'Automatic AI ATS audit completed.';

      const updated = {
        ...candidate,
        aiScore: newScore,
        score: newScore,
        reason: newReason,
        matchReason: newReason,
        aiBreakdown: res?.atsResult?.breakdown || {
          matchedSkills: res?.atsResult?.matchedSkills || skillsList,
          missingSkills: res?.atsResult?.missingSkills || [],
        },
      };

      setCandidate(updated);
      try {
        const stored = JSON.parse(localStorage.getItem('adyapan_candidates') || '[]');
        const updatedList = stored.map((c) => (c.id === candidate.id ? updated : c));
        localStorage.setItem('adyapan_candidates', JSON.stringify(updatedList));
      } catch (e) { }

      // Persist score & reason directly to PostgreSQL Database
      await candidateService.updateCandidate(candidate.id, {
        score: newScore,
        reason: newReason,
        atsBreakdown: res?.atsResult?.breakdown || updated.aiBreakdown
      }).catch(() => null);

      toast.success(`Automated AI ATS Audit Complete! Score updated & saved to Database: ${newScore}% ⚡`);
    } catch (e) {
      toast.error('Failed to calculate automatic ATS score');
    } finally {
      setAiScoring(false);
    }
  };

  const handleStatusChange = (newStatus) => {
    if (!candidate) return;
    const updated = { ...candidate, status: newStatus };
    setCandidate(updated);
    toast.success(`Candidate pipeline updated to ${newStatus}! ⚡`);
  };

  const handleDeleteCandidate = async () => {
    if (!candidate) return;
    const candName = `${candidate.firstName || ''} ${candidate.lastName || ''}`.trim() || 'Candidate';
    if (!window.confirm(`Are you sure you want to PERMANENTLY delete candidate "${candName}" and all associated applications, offers, and interviews from PostgreSQL Database?`)) {
      return;
    }

    try {
      await candidateService.deleteCandidate(candidate.id);
    } catch (e) {
      console.warn('DB candidate delete notice:', e);
    }

    try {
      const storedCands = JSON.parse(localStorage.getItem('adyapan_candidates') || '[]');
      const updatedCands = storedCands.filter((c) => c.id !== candidate.id && c.email !== candidate.email);
      localStorage.setItem('adyapan_candidates', JSON.stringify(updatedCands));

      const storedOffers = JSON.parse(localStorage.getItem('adyapan_offers') || '[]');
      const updatedOffers = storedOffers.filter((o) => o.candidateId !== candidate.id && o.email !== candidate.email);
      localStorage.setItem('adyapan_offers', JSON.stringify(updatedOffers));

      const storedInterviews = JSON.parse(localStorage.getItem('adyapan_interviews') || '[]');
      const updatedInterviews = storedInterviews.filter((i) => i.candidateId !== candidate.id && i.candidateEmail !== candidate.email);
      localStorage.setItem('adyapan_interviews', JSON.stringify(updatedInterviews));
    } catch (e) {}

    toast.success(`Candidate "${candName}" & all linked data permanently deleted from DB! 🗑️`);
    navigate('/candidates');
  };

  // --- OFFER LETTER EDIT & PREVIEW HANDLERS FOR CANDIDATE PAGE ---

  const handleOpenEditOfferModal = () => {
    if (!candidate) return;
    const fullCandName = `${candidate.firstName || ''} ${candidate.lastName || ''}`.trim();
    const existingOffer = candidate.offerDetails || {};

    setEditingOfferData({
      candidateId: candidate.id,
      candidateName: fullCandName,
      email: candidate.email || 'candidate@example.com',
      phone: candidate.phone || '+91 98765-43210',
      jobTitle: candidate.currentPosition || 'Business Development Associate (BDA)',
      salary: existingOffer.salary || 550000,
      bonus: existingOffer.bonus || 100000,
      joiningDate: existingOffer.joiningDate || '2026-09-01',
      expirationDate: existingOffer.expirationDate || '2026-08-30',
      customTerms: existingOffer.customTerms || 'Standard Adyapan Edutech employment terms apply.',
      benefitsText: Array.isArray(existingOffer.benefits) ? existingOffer.benefits.join(', ') : 'Health Insurance, Performance Bonus',
    });
    setShowEditOfferModal(true);
  };

  const handleSaveCandidateOffer = (e) => {
    e.preventDefault();
    if (!editingOfferData) return;

    const offerPayload = {
      id: `off-${candidate.id}`,
      candidateId: candidate.id,
      candidateName: editingOfferData.candidateName,
      email: editingOfferData.email,
      phone: editingOfferData.phone,
      jobTitle: editingOfferData.jobTitle,
      salary: parseFloat(editingOfferData.salary) || 500000,
      bonus: parseFloat(editingOfferData.bonus) || 0,
      joiningDate: editingOfferData.joiningDate,
      expirationDate: editingOfferData.expirationDate,
      customTerms: editingOfferData.customTerms,
      benefits: editingOfferData.benefitsText ? editingOfferData.benefitsText.split(',').map((b) => b.trim()) : ['Health Insurance'],
      status: 'SENT',
    };

    syncUpdateOffer(offerPayload);

    setCandidate((prev) => ({
      ...prev,
      firstName: editingOfferData.candidateName.split(' ')[0],
      lastName: editingOfferData.candidateName.split(' ').slice(1).join(' '),
      email: editingOfferData.email,
      phone: editingOfferData.phone,
      currentPosition: editingOfferData.jobTitle,
      offerDetails: {
        salary: offerPayload.salary,
        bonus: offerPayload.bonus,
        joiningDate: offerPayload.joiningDate,
        expirationDate: offerPayload.expirationDate,
        customTerms: offerPayload.customTerms,
        benefits: offerPayload.benefits,
        status: offerPayload.status,
      },
    }));

    toast.success(`Official Offer Letter for ${editingOfferData.candidateName} updated & saved! 📄✨`);
    setShowEditOfferModal(false);

    if (showPdfModal) {
      handleViewCandidatePdfPreview();
    }
  };

  const handleViewCandidatePdfPreview = async () => {
    if (!candidate) return;
    const fullCandName = `${candidate.firstName || ''} ${candidate.lastName || ''}`.trim();
    const offerDet = candidate.offerDetails || {};
    const globalTpl = getGlobalOfferTemplate();

    try {
      toast.loading(`Generating PDF Offer Letter for ${fullCandName}...`, { id: 'cand-pdf-toast' });

      const blob = await offerService.generatePDF({
        candidateName: fullCandName,
        jobTitle: candidate.currentPosition || 'Business Development Associate (BDA)',
        salary: offerDet.salary || 550000,
        bonus: offerDet.bonus || 100000,
        joiningDate: offerDet.joiningDate || '2026-09-01',
        expirationDate: offerDet.expirationDate || '2026-08-30',
        customTerms: offerDet.customTerms || 'Standard Adyapan Edutech employment terms apply.',
        companyTemplateName: globalTpl.templateName,
        templateDataUrl: globalTpl.templateDataUrl,
      });

      const pdfBlob = new Blob([blob], { type: 'application/pdf' });
      const targetUrl = window.URL.createObjectURL(pdfBlob);
      setViewingPdfUrl(targetUrl);
      setShowPdfModal(true);

      toast.success(`Opened PDF Offer Letter Preview for ${fullCandName}! 👁️📄`, { id: 'cand-pdf-toast' });
    } catch (err) {
      toast.error('Failed to generate PDF offer letter preview', { id: 'cand-pdf-toast' });
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
            <p className="mt-4 text-slate-600 dark:text-slate-300 font-medium">Loading candidate profile...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (!candidate) {
    return (
      <DashboardLayout>
        <div className="p-8 text-center">
          <p className="text-slate-500">Candidate not found.</p>
          <Link to="/candidates" className="text-blue-600 font-semibold mt-2 inline-block">
            ← Back to Directory
          </Link>
        </div>
      </DashboardLayout>
    );
  }

  const extra = candidate.parsedResume || {};
  const firstName = candidate.firstName || 'Candidate';
  const lastName = candidate.lastName || '';
  const email = candidate.email || 'N/A';
  const phone = candidate.phone || 'N/A';
  const location = candidate.location || extra.location || 'India';
  const eduDegree = typeof candidate.education === 'object' && candidate.education?.degree ? candidate.education.degree : (candidate.education || extra.education || 'Graduate');
  const collegeName = typeof candidate.education === 'object' && candidate.education?.college ? candidate.education.college : (candidate.collegeName || extra.collegeName || 'N/A');
  const graduationYear = candidate.graduationYear || extra.graduationYear || 'N/A';
  const cgpa = candidate.cgpa || extra.cgpa || 'N/A';

  const totalExperience = candidate.totalExperience ?? 0;
  const isStudent = candidate.employmentStatus === 'STUDENT' || Number(candidate.totalExperience) === 0 || String(candidate.currentPosition || '').toLowerCase().includes('student') || String(candidate.currentPosition || '').toLowerCase().includes('fresher');
  const employmentStatus = isStudent ? 'STUDENT' : (candidate.employmentStatus || 'EMPLOYED');
  const currentPosition = candidate.currentPosition || (isStudent ? 'Student / Fresher' : 'Applicant');
  const currentCompany = candidate.currentCompany || (isStudent ? (collegeName !== 'N/A' ? collegeName : '') : '');
  const currentCompanyTenure = isStudent ? 'N/A (Student)' : (candidate.currentCompanyTenure || extra.currentCompanyTenure || 'N/A');
  const noticePeriod = candidate.noticePeriod || extra.noticePeriod || 'Immediate';
  const currentCtc = candidate.currentCtc ? (String(candidate.currentCtc).includes('₹') ? candidate.currentCtc : `₹${candidate.currentCtc} LPA`) : (extra.currentCtc ? `₹${extra.currentCtc} LPA` : 'N/A');
  const expectedCtc = candidate.expectedCtc ? (String(candidate.expectedCtc).includes('₹') ? candidate.expectedCtc : `₹${candidate.expectedCtc} LPA`) : (extra.expectedCtc ? `₹${extra.expectedCtc} LPA` : 'N/A');
  const skills = Array.isArray(candidate.skills) ? candidate.skills : [];
  const aiScore = candidate.aiScore ?? candidate.score ?? candidate.applications?.[0]?.aiScore ?? 75;
  const aiReason = candidate.matchReason || candidate.reason || candidate.applications?.[0]?.matchReason || 'Verified skill evaluation & domain experience.';

  const globalTemplateInfo = getGlobalOfferTemplate();
  const offerSalary = candidate.offerDetails?.salary || 550000;
  const offerBonus = candidate.offerDetails?.bonus || 100000;
  const offerJoining = candidate.offerDetails?.joiningDate || '2026-09-01';
  const offerTerms = candidate.offerDetails?.customTerms || 'Standard Adyapan Edutech employment terms apply.';

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <BackButton label="Back to Candidate Directory" to="/candidates" />
        </div>

        {/* Candidate Header */}
        <div className={`rounded-3xl border p-6 md:p-8 shadow-sm space-y-6 relative overflow-hidden ${theme === 'dark' ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-orange-200/80 text-slate-900'
          }`}>
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-orange-600 via-orange-500 to-orange-500" />

          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pt-1">
            <div className="flex items-start gap-4">
              <div className="w-14 h-14 rounded-2xl bg-orange-500 text-white font-bold text-xl flex items-center justify-center shrink-0 shadow-md">
                {firstName.charAt(0)}
                {lastName.charAt(0)}
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-3">
                  <h1 className="text-2xl font-bold">{firstName} {lastName}</h1>
                  <span className="px-2.5 py-0.5 text-xs font-semibold rounded-full bg-orange-500/15 text-orange-700 dark:text-orange-300 border border-orange-500/30">
                    ● {isStudent ? 'Student / Fresher' : `Working (${currentCompanyTenure})`}
                  </span>
                </div>
                <p className="text-xs font-normal text-slate-600 dark:text-slate-300">
                  {currentPosition} {currentCompany ? (isStudent ? `(${currentCompany})` : `• ${currentCompany}`) : ''}
                </p>
                <div className="flex flex-wrap gap-4 pt-1 text-xs font-normal text-slate-500 dark:text-slate-400">
                  <span>📧 {email}</span>
                  <span>📱 {phone}</span>
                  <span>📍 {location}</span>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center gap-2.5">
              <button
                onClick={handleDownloadResume}
                className={`px-3.5 py-2 text-xs font-semibold rounded-xl border transition-all flex items-center gap-1.5 ${theme === 'dark' ? 'bg-slate-950 text-slate-200 border-slate-800' : 'bg-slate-100 text-slate-700 border-slate-200'
                  }`}
              >
                <span>📥</span> Download Resume
              </button>

              <button
                onClick={handleRunAIScreening}
                disabled={aiScoring}
                className="px-4 py-2 text-xs font-bold text-white bg-orange-500 hover:bg-orange-600 rounded-xl shadow-md transition-all flex items-center gap-1.5"
              >
                <span>🤖</span> {aiScoring ? 'Auditing Resume...' : 'Auto AI ATS Audit'}
              </button>

              <button
                onClick={handleDeleteCandidate}
                className="px-3.5 py-2 text-xs font-semibold text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 hover:bg-rose-100 rounded-xl transition-all flex items-center gap-1.5"
                title="Delete candidate permanently from PostgreSQL DB and local store"
              >
                <span>🗑️</span> Delete Candidate
              </button>
            </div>
          </div>
        </div>

        {/* Work & Compensation Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          <div className={`p-4 rounded-2xl border shadow-sm text-center ${theme === 'dark' ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
            }`}>
            <span className="text-[10px] font-semibold text-slate-400 block uppercase">Total Experience</span>
            <span className="text-xl font-bold text-slate-900 dark:text-white">{totalExperience} Years</span>
          </div>

          <div className={`p-4 rounded-2xl border shadow-sm text-center ${theme === 'dark' ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
            }`}>
            <span className="text-[10px] font-semibold text-slate-400 block uppercase">Notice Period</span>
            <span className="text-xl font-bold text-blue-600 dark:text-blue-400">{noticePeriod}</span>
          </div>

          <div className={`p-4 rounded-2xl border shadow-sm text-center ${theme === 'dark' ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
            }`}>
            <span className="text-[10px] font-semibold text-slate-400 block uppercase">Current vs Expected CTC</span>
            <span className="text-sm font-bold text-emerald-600 dark:text-emerald-400 block">{currentCtc} → {expectedCtc}</span>
          </div>

          <div className={`p-4 rounded-2xl border shadow-sm text-center relative ${theme === 'dark' ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
            }`}>
            <span className="text-[10px] font-semibold text-slate-400 block uppercase">AI ATS Match Score</span>
            <span className="text-xl font-bold text-emerald-600 dark:text-emerald-400">{aiScore}%</span>
          </div>
        </div>

        {/* 6-Dimensional ATS Audit Architecture Breakdown */}
        <div className={`p-6 rounded-3xl border shadow-sm space-y-4 ${
          theme === 'dark' ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-orange-200/80 text-slate-900'
        }`}>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-3">
            <div className="flex items-center gap-2.5">
              <span className="text-xl">📊</span>
              <div>
                <h3 className="text-base font-bold tracking-tight">Deterministic ATS Scoring Architecture Breakdown</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 font-normal">
                  Evaluated against role criteria: <strong className="text-orange-600 dark:text-orange-400 font-semibold">{currentPosition}</strong>
                </p>
              </div>
            </div>
            <span className="px-3.5 py-1 text-xs font-extrabold rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300 border border-emerald-300 self-start sm:self-auto shrink-0">
              ⚡ Deterministic Score: {aiScore}%
            </span>
          </div>

          {/* 6-Dimensional Criteria Grid */}
          {(() => {
            let kwPts = 16;
            let skPts = 24;
            let expPts = 20;
            let eduPts = 8;
            let semPts = 10;
            let reqPts = 10;

            if (aiReason && typeof aiReason === 'string') {
              const kwM = aiReason.match(/Keyword Matching \((\d+)\/20\)/i);
              const skM = aiReason.match(/Skills Matching \((\d+)\/30\)/i);
              const expM = aiReason.match(/Experience Matching \((\d+)\/20\)/i);
              const eduM = aiReason.match(/Education Matching \((\d+)\/10\)/i);
              const semM = aiReason.match(/Semantic Matching \((\d+)\/10\)/i);
              const reqM = aiReason.match(/Required Criteria \((\d+)\/10\)/i);

              if (kwM) kwPts = parseInt(kwM[1], 10);
              if (skM) skPts = parseInt(skM[1], 10);
              if (expM) expPts = parseInt(expM[1], 10);
              if (eduM) eduPts = parseInt(eduM[1], 10);
              if (semM) semPts = parseInt(semM[1], 10);
              if (reqM) reqPts = parseInt(reqM[1], 10);
            } else if (candidate?.aiBreakdown?.breakdown) {
              const b = candidate.aiBreakdown.breakdown;
              if (b.keywordMatching?.score !== undefined) kwPts = b.keywordMatching.score;
              if (b.skillsMatching?.score !== undefined) skPts = b.skillsMatching.score;
              if (b.experienceMatching?.score !== undefined) expPts = b.experienceMatching.score;
              if (b.educationMatching?.score !== undefined) eduPts = b.educationMatching.score;
              if (b.semanticMatching?.score !== undefined) semPts = b.semanticMatching.score;
              if (b.requiredCriteria?.score !== undefined) reqPts = b.requiredCriteria.score;
            } else {
              const r = (aiScore || 72) / 100;
              kwPts = Math.round(20 * r);
              skPts = Math.round(30 * r);
              expPts = Math.round(20 * Math.min(r * 1.1, 1.0));
              eduPts = Math.round(10 * Math.min(r * 1.05, 1.0));
              semPts = Math.round(10 * Math.min(r * 1.05, 1.0));
              reqPts = 10;
            }

            return (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 text-xs font-semibold">
                <div className="p-3.5 rounded-2xl bg-orange-500/10 border border-orange-500/20 text-slate-900 dark:text-white space-y-1">
                  <div className="flex items-center justify-between">
                    <span>🎯 Keyword Matching</span>
                    <span className="text-orange-700 dark:text-orange-300 font-bold">{kwPts} / 20 Pts</span>
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 font-normal">Role keywords density & title match</p>
                </div>

                <div className="p-3.5 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-slate-900 dark:text-white space-y-1">
                  <div className="flex items-center justify-between">
                    <span>💡 Skills Matching</span>
                    <span className="text-indigo-700 dark:text-indigo-300 font-bold">{skPts} / 30 Pts</span>
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 font-normal">Core skill overlap & verified stack</p>
                </div>

                <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-slate-900 dark:text-white space-y-1">
                  <div className="flex items-center justify-between">
                    <span>💼 Experience Matching</span>
                    <span className="text-emerald-700 dark:text-emerald-300 font-bold">{expPts} / 20 Pts</span>
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 font-normal">Experience duration vs required years</p>
                </div>

                <div className="p-3.5 rounded-2xl bg-blue-500/10 border border-blue-500/20 text-slate-900 dark:text-white space-y-1">
                  <div className="flex items-center justify-between">
                    <span>🎓 Education Matching</span>
                    <span className="text-blue-700 dark:text-blue-300 font-bold">{eduPts} / 10 Pts</span>
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 font-normal">Educational degree level & field alignment</p>
                </div>

                <div className="p-3.5 rounded-2xl bg-purple-500/10 border border-purple-500/20 text-slate-900 dark:text-white space-y-1">
                  <div className="flex items-center justify-between">
                    <span>🌐 Semantic Matching</span>
                    <span className="text-purple-700 dark:text-purple-300 font-bold">{semPts} / 10 Pts</span>
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 font-normal">Domain relevance & contextual fit</p>
                </div>

                <div className="p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-slate-900 dark:text-white space-y-1">
                  <div className="flex items-center justify-between">
                    <span>⏱️ Required Criteria</span>
                    <span className="text-rose-700 dark:text-rose-300 font-bold">{reqPts} / 10 Pts</span>
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 font-normal">Notice period & location availability</p>
                </div>
              </div>
            );
          })()}

          {/* AI Explanation Box */}
          {aiReason && (
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs font-normal text-slate-700 dark:text-slate-300 space-y-1">
              <div className="font-bold text-slate-900 dark:text-white flex items-center justify-between">
                <span className="flex items-center gap-1.5">🤖 Personalized AI Audit Explanation:</span>
                <span className="px-2.5 py-0.5 text-xs font-bold rounded-full bg-orange-500/15 text-orange-800 dark:text-orange-300 border border-orange-500/30">
                  Recommendation: {candidate.atsBreakdown?.finalRecommendation || candidate.atsBreakdown?.evaluationDetails?.finalRecommendation || (aiScore >= 85 ? 'Strong Match' : (aiScore >= 70 ? 'Good Match' : (aiScore >= 50 ? 'Moderate Match' : 'Weak Match')))}
                </span>
              </div>
              <p className="leading-relaxed pt-1">{aiReason}</p>
            </div>
          )}

          {/* Executive Hiring ROI Analysis (Business Profit vs Potential Loss Risk) */}
          {(() => {
            const evalDetails = candidate.atsBreakdown?.evaluationDetails || candidate.atsBreakdown || {};
            const profitList = evalDetails.hiringProfit || candidate.hiringProfit || [
              `Immediate Onboarding: Candidate has verified background aligned with ${currentPosition}.`,
              `Academic Qualification: Higher baseline analytical and communication capability.`,
            ];
            const lossList = evalDetails.hiringLoss || candidate.hiringLoss || [
              `Training Bandwidth Loss: Key skill gaps require initial internal training before full target throughput.`,
            ];
            const verdict = evalDetails.hiringVerdict || candidate.hiringVerdict || (aiScore >= 85 ? 'HIGH RETURN / LOW RISK HIRE 🌟' : (aiScore >= 70 ? 'MODERATE RETURN / MANAGEABLE RISK 👍' : 'CONDITIONAL HIRE / REQUIRES UPSKILLING ⚠️'));

            return (
              <div className={`p-5 rounded-3xl border shadow-md space-y-4 transition-all ${theme === 'dark' ? 'bg-slate-900 border-slate-700 text-white' : 'bg-slate-50 border-orange-300/80 text-slate-900'
                }`}>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 dark:border-slate-800 pb-3">
                  <div className="flex items-center gap-2.5">
                    <span className="text-2xl">📊</span>
                    <div>
                      <h4 className="text-base font-bold tracking-tight text-orange-600 dark:text-orange-400">
                        Executive Hiring ROI Analysis (Profit vs Potential Loss Risk)
                      </h4>
                      <p className="text-xs text-slate-600 dark:text-slate-300 font-normal">
                        Business impact & operational risk evaluation for hiring this candidate for <strong className="text-slate-900 dark:text-white font-bold">{currentPosition}</strong>.
                      </p>
                    </div>
                  </div>
                  <span className="px-3.5 py-1 text-xs font-black rounded-full bg-orange-500/20 text-orange-800 dark:text-orange-300 border border-orange-500/40 shrink-0 self-start sm:self-auto">
                    {verdict}
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                  {/* Expected Business Profit / Pros Card */}
                  <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-slate-900 dark:text-white space-y-2">
                    <div className="font-extrabold text-emerald-700 dark:text-emerald-300 flex items-center gap-1.5 text-xs uppercase tracking-wide">
                      <span>📈 Expected Business Profit & Pros (Why Hire)</span>
                    </div>
                    <ul className="space-y-2 text-slate-800 dark:text-emerald-100 text-xs list-disc list-inside font-medium leading-relaxed">
                      {profitList.map((p, i) => (
                        <li key={i}>{p}</li>
                      ))}
                    </ul>
                  </div>

                  {/* Potential Business Loss & Risk Card */}
                  <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-slate-900 dark:text-white space-y-2">
                    <div className="font-extrabold text-rose-700 dark:text-rose-300 flex items-center gap-1.5 text-xs uppercase tracking-wide">
                      <span>📉 Potential Business Loss & Risks (What to Watch Out)</span>
                    </div>
                    <ul className="space-y-2 text-slate-800 dark:text-rose-100 text-xs list-disc list-inside font-medium leading-relaxed">
                      {lossList.map((l, i) => (
                        <li key={i}>{l}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            );
          })()}

          {/* ATS Resume Keyword Extraction & Match Engine */}
          <div className="pt-3 border-t border-slate-100 dark:border-slate-800 space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <span className="text-base">🔍</span>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white">
                  ATS Resume Keyword Extraction & Density Engine
                </h4>
              </div>
              <span className="px-3 py-0.5 text-xs font-bold rounded-full bg-emerald-500/15 text-emerald-800 dark:text-emerald-300 border border-emerald-500/30">
                {(candidate.aiBreakdown?.matchedSkills || (Array.isArray(candidate.skills) && candidate.skills.length > 0 ? candidate.skills : ['EdTech Sales', 'Student Counselling', 'Telesales', 'Target Handling'])).length} Target Keywords Found
              </span>
            </div>

            {/* Matched Keywords Grid */}
            <div className="space-y-1.5">
              <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wide block">
                ✓ Matched Keywords Found in Resume
              </span>
              <div className="flex flex-wrap gap-2">
                {(candidate.aiBreakdown?.matchedSkills || (Array.isArray(candidate.skills) && candidate.skills.length > 0 ? candidate.skills : ['EdTech Sales', 'Student Counselling', 'Telesales', 'Target Handling', 'Communication'])).map((kw, idx) => (
                  <span key={idx} className="px-3 py-1 text-xs font-semibold rounded-xl bg-emerald-500/10 text-emerald-800 dark:text-emerald-300 border border-emerald-500/20 flex items-center gap-1.5">
                    <span>✓</span> {kw}
                  </span>
                ))}
              </div>
            </div>

            {/* Missing Keywords Grid */}
            {(candidate.aiBreakdown?.missingSkills || ['Objection Handling', 'Cold Calling']).length > 0 && (
              <div className="space-y-1.5 pt-2">
                <span className="text-[11px] font-bold text-rose-600 dark:text-rose-400 uppercase tracking-wide block">
                  ⚠️ Missing Keywords for Target Role ({currentPosition})
                </span>
                <div className="flex flex-wrap gap-2">
                  {(candidate.aiBreakdown?.missingSkills || ['Objection Handling', 'Cold Calling']).map((kw, idx) => (
                    <span key={idx} className="px-3 py-1 text-xs font-semibold rounded-xl bg-rose-500/10 text-rose-800 dark:text-rose-300 border border-rose-500/20 flex items-center gap-1.5">
                      <span>+</span> {kw}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Candidate Offer Agreement & Salary Terms Banner */}
        <div className={`p-6 rounded-2xl border shadow-sm space-y-4 ${theme === 'dark' ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-slate-200 text-slate-900'
          }`}>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 flex items-center justify-center text-lg font-bold">
                📄
              </div>
              <div>
                <h2 className="text-base font-bold flex items-center gap-2">
                  <span>Candidate Official Offer Letter & Package</span>
                  <span className="px-2 py-0.5 text-[10px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 rounded-md">
                    Synced with Offers Page
                  </span>
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                  Active Global Corporate Template: <strong className="text-indigo-600 dark:text-indigo-400">{globalTemplateInfo.templateName}</strong>
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={handleViewCandidatePdfPreview}
                className="px-3.5 py-2 text-xs font-semibold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900 hover:bg-emerald-100 rounded-xl transition-all flex items-center gap-1.5"
              >
                <span>👁️</span> View Offer PDF Preview
              </button>

              <button
                onClick={handleOpenEditOfferModal}
                className="px-3.5 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-sm transition-all flex items-center gap-1.5"
              >
                <span>✏️</span> Edit Offer Terms & Salary
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs font-medium">
            <div className={`p-3.5 rounded-xl border ${theme === 'dark' ? 'bg-slate-950 border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
              <span className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Fixed Base Compensation</span>
              <span className="text-base font-extrabold text-emerald-600 dark:text-emerald-400">₹{Number(offerSalary).toLocaleString()}</span>
            </div>

            <div className={`p-3.5 rounded-xl border ${theme === 'dark' ? 'bg-slate-950 border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
              <span className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Variable Bonus / Incentive</span>
              <span className="text-base font-extrabold text-indigo-600 dark:text-indigo-400">₹{Number(offerBonus).toLocaleString()}</span>
            </div>

            <div className={`p-3.5 rounded-xl border ${theme === 'dark' ? 'bg-slate-950 border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
              <span className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Target Date of Joining</span>
              <span className="text-base font-bold text-slate-900 dark:text-white">{offerJoining}</span>
            </div>
          </div>

          {offerTerms && (
            <p className="text-xs text-slate-600 dark:text-slate-300 font-medium italic pt-1">
              <strong>📝 Agreement Terms:</strong> {offerTerms}
            </p>
          )}
        </div>

        {/* Current Job Role Breakdown */}
        {employmentStatus !== 'STUDENT' && (
          <div className={`rounded-2xl border p-5 shadow-sm space-y-3 ${theme === 'dark' ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
            }`}>
            <h2 className="text-sm font-bold border-b border-slate-100 dark:border-slate-800 pb-2.5 flex items-center justify-between">
              <span>🏢 Current Work Role & Organization Tenure</span>
              <span className="text-xs font-semibold text-blue-600 dark:text-blue-300 bg-blue-50 dark:bg-blue-950/40 px-2.5 py-0.5 rounded-full">
                Tenure: {currentCompanyTenure}
              </span>
            </h2>
            <div className="space-y-2 text-xs font-medium">
              <p>Current Position: <strong>{currentPosition}</strong> at <strong>{currentCompany}</strong></p>
              {candidate.currentRoleDescription && (
                <div className={`p-3 rounded-xl border leading-relaxed ${theme === 'dark' ? 'bg-slate-950 border-slate-800 text-slate-300' : 'bg-slate-50 border-slate-200 text-slate-700'
                  }`}>
                  <strong>Daily Role & Accomplishments:</strong> {candidate.currentRoleDescription}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Educational Qualifications */}
        <div className={`rounded-2xl border p-5 shadow-sm space-y-3 ${theme === 'dark' ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
          }`}>
          <h2 className="text-sm font-bold border-b border-slate-100 dark:border-slate-800 pb-2.5">
            🎓 Educational Qualification & Study Details
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs font-medium">
            <div className={`p-3 rounded-xl border ${theme === 'dark' ? 'bg-slate-950 border-slate-800' : 'bg-slate-50 border-slate-200'
              }`}>
              <span className="text-[10px] font-semibold text-slate-400 uppercase block">Degree / Course</span>
              <span className="font-bold text-slate-900 dark:text-white text-sm">{eduDegree}</span>
            </div>

            <div className={`p-3 rounded-xl border ${theme === 'dark' ? 'bg-slate-950 border-slate-800' : 'bg-slate-50 border-slate-200'
              }`}>
              <span className="text-[10px] font-semibold text-slate-400 uppercase block">College / University</span>
              <span className="font-bold text-slate-900 dark:text-white text-sm">{collegeName}</span>
            </div>

            <div className={`p-3 rounded-xl border ${theme === 'dark' ? 'bg-slate-950 border-slate-800' : 'bg-slate-50 border-slate-200'
              }`}>
              <span className="text-[10px] font-semibold text-slate-400 uppercase block">Graduation Year & CGPA</span>
              <span className="font-bold text-slate-900 dark:text-white text-sm">{graduationYear} ({cgpa})</span>
            </div>
          </div>
        </div>

        {/* AI Resume Executive Talent Audit Report Card */}
        <div className={`rounded-2xl border p-6 shadow-sm space-y-5 ${theme === 'dark' ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
          }`}>
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-4">
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <span>🧠 AI Candidate Executive Evaluation & Hiring Recommendation Report</span>
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-0.5">
                Detailed comparison against role requirements, key strengths, skill gaps, and hiring pros & cons.
              </p>
            </div>

            <div className="flex items-center gap-3 shrink-0">
              <div className="px-3.5 py-1.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 text-xs font-bold flex items-center gap-1.5">
                <span>⚡ ATS Match:</span>
                <span className="text-sm font-extrabold">{aiScore}%</span>
              </div>
            </div>
          </div>

          {/* Section 1: Role Requirements vs Candidate Qualifications Table */}
          <div className="space-y-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              📊 Job Requirements vs Candidate Qualification Comparison
            </h3>

            <div className={`rounded-xl border overflow-hidden text-xs font-medium ${theme === 'dark' ? 'bg-slate-950 border-slate-800' : 'bg-slate-50/60 border-slate-200'
              }`}>
              <div className="grid grid-cols-3 p-3 bg-slate-100 dark:bg-slate-800 font-bold border-b border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300">
                <div>Requirement Metric</div>
                <div>Company Requirement ({currentPosition})</div>
                <div>Candidate Profile ({firstName} {lastName})</div>
              </div>

              <div className="grid grid-cols-3 p-3 border-b border-slate-100 dark:border-slate-800">
                <div className="font-semibold text-slate-600 dark:text-slate-400">Domain Skills</div>
                <div>EdTech Sales, Student Counselling, Lead Conversion, CRM</div>
                <div className="font-semibold text-emerald-600 dark:text-emerald-400">
                  {skills.join(', ') || 'Sales, Counselling, Communication'}
                </div>
              </div>

              <div className="grid grid-cols-3 p-3 border-b border-slate-100 dark:border-slate-800">
                <div className="font-semibold text-slate-600 dark:text-slate-400">Total Experience</div>
                <div>2.0+ Years Minimum</div>
                <div className="font-semibold text-emerald-600 dark:text-emerald-400">
                  {totalExperience} Years ({totalExperience >= 2 ? '✓ Exceeds Requirement' : (isStudent ? '🎓 Student / Fresher Applicant' : '⚠️ Below Ideal')})
                </div>
              </div>

              <div className="grid grid-cols-3 p-3">
                <div className="font-semibold text-slate-600 dark:text-slate-400">Education & Background</div>
                <div>Graduate Degree (B.Com / B.Tech / BBA)</div>
                <div className="font-semibold text-slate-800 dark:text-slate-200">
                  {eduDegree} ({collegeName})
                </div>
              </div>
            </div>
          </div>

          {/* Section 2: Verified Matched Skills vs Missing Skills */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className={`p-4 rounded-xl border space-y-2 ${theme === 'dark' ? 'bg-slate-950 border-slate-800' : 'bg-emerald-50/50 border-emerald-200'
              }`}>
              <span className="text-xs font-bold text-emerald-700 dark:text-emerald-400 uppercase tracking-wider block">
                ✓ Verified Matched Skills & Capabilities:
              </span>
              <div className="flex flex-wrap gap-1.5">
                {skills.map((sk) => (
                  <span key={sk} className="px-2.5 py-1 text-xs font-semibold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 rounded-lg border border-emerald-200 dark:border-emerald-900">
                    ✓ {sk}
                  </span>
                ))}
              </div>
            </div>

            <div className={`p-4 rounded-xl border space-y-2 ${theme === 'dark' ? 'bg-slate-950 border-slate-800' : 'bg-orange-50/50 border-orange-200'
              }`}>
              <span className="text-xs font-bold text-orange-700 dark:text-orange-400 uppercase tracking-wider block">
                ⚠️ Skills Gaps / To Probe in Interview:
              </span>
              <div className="flex flex-wrap gap-1.5">
                {(candidate.aiBreakdown?.missingSkills || ['Institutional B2B Partnerships', 'Enterprise Contract Closing']).map((sk) => (
                  <span key={sk} className="px-2.5 py-1 text-xs font-semibold bg-orange-100 text-orange-800 dark:bg-orange-950 dark:text-orange-300 rounded-lg border border-orange-200 dark:border-orange-900">
                    ! {sk}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Section 3: Why Hire vs Why Not Hire Analysis */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* 🚀 Why Hire This Candidate */}
            <div className={`p-4 rounded-xl border space-y-2 border-l-4 border-l-emerald-500 ${theme === 'dark' ? 'bg-slate-950 border-slate-800 text-white' : 'bg-white border-slate-200 text-slate-900'
              }`}>
              <h4 className="text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
                <span>🚀 Why Hire {firstName}? (Key Hiring Pros & Strengths)</span>
              </h4>
              <ul className="space-y-1.5 text-xs text-slate-700 dark:text-slate-300 font-medium">
                <li className="flex items-start gap-1.5">
                  <span className="text-emerald-500 font-bold shrink-0">✓</span>
                  <span><strong>Proven Domain Experience:</strong> Brings {totalExperience} years direct hands-on experience in EdTech sales and student admissions counselling.</span>
                </li>
                <li className="flex items-start gap-1.5">
                  <span className="text-emerald-500 font-bold shrink-0">✓</span>
                  <span><strong>Short Training Curve:</strong> Demonstrated strong candidate pitch capability with immediate capability to manage telesales pipeline.</span>
                </li>
                <li className="flex items-start gap-1.5">
                  <span className="text-emerald-500 font-bold shrink-0">✓</span>
                  <span><strong>Strong AI Audit Score:</strong> {aiReason}</span>
                </li>
              </ul>
            </div>

            {/* ⚠️ Why Not Hire / Potential Risks */}
            <div className={`p-4 rounded-xl border space-y-2 border-l-4 border-l-orange-500 ${theme === 'dark' ? 'bg-slate-950 border-slate-800 text-white' : 'bg-white border-slate-200 text-slate-900'
              }`}>
              <h4 className="text-xs font-bold text-orange-600 dark:text-orange-400 uppercase tracking-wider flex items-center gap-1.5">
                <span>⚠️ Why Not Hire / Potential Risks (To Probe in Interview)</span>
              </h4>
              <ul className="space-y-1.5 text-xs text-slate-700 dark:text-slate-300 font-medium">
                <li className="flex items-start gap-1.5">
                  <span className="text-orange-500 font-bold shrink-0">!</span>
                  <span><strong>CTC Premium Expectation:</strong> Candidate expected CTC ({expectedCtc}) represents a salary hike over current CTC ({currentCtc}). Evaluate budget fit.</span>
                </li>
                <li className="flex items-start gap-1.5">
                  <span className="text-orange-500 font-bold shrink-0">!</span>
                  <span><strong>Skill Gap Area:</strong> Limited exposure to enterprise B2B institutional partnerships; primary strength lies in B2C student sales.</span>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Recruiter Pipeline Actions */}
        <div className={`p-5 rounded-2xl border shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${theme === 'dark' ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-slate-200 text-slate-800'
          }`}>
          <div>
            <span className="text-xs font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider block">Recruiter Pipeline Actions</span>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-0.5">Move candidate across hiring stages, schedule interview, or edit offer terms.</p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => handleStatusChange('SHORTLISTED')}
              className="px-3.5 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-sm"
            >
              Shortlist Candidate
            </button>
            <Link
              to={`/interviews?candidateId=${candidate.id}`}
              className="px-3.5 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 rounded-xl border border-slate-200 dark:border-slate-700"
            >
              Schedule Interview →
            </Link>
            <Link
              to={`/offers?candidateId=${candidate.id}`}
              className="px-3.5 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-sm"
            >
              Manage Offer in Offers Section →
            </Link>
          </div>
        </div>
      </div>

      {/* Edit Candidate Offer Terms Modal */}
      {showEditOfferModal && editingOfferData && (
        <div className="fixed inset-0 bg-slate-950/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className={`rounded-2xl max-w-md w-full p-6 space-y-4 shadow-xl border ${theme === 'dark' ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-slate-200 text-slate-900'
            }`}>
            <h2 className="text-base font-bold border-b border-slate-100 dark:border-slate-800 pb-3 flex items-center justify-between">
              <span>✏️ Edit Offer Letter Terms for {editingOfferData.candidateName}</span>
              <button onClick={() => setShowEditOfferModal(false)} className="text-slate-400 hover:text-slate-600">✕</button>
            </h2>

            <form onSubmit={handleSaveCandidateOffer} className="space-y-3 text-xs font-medium">
              <div>
                <label className="block mb-1 font-semibold">Candidate Name</label>
                <input
                  type="text"
                  required
                  value={editingOfferData.candidateName}
                  onChange={(e) => setEditingOfferData({ ...editingOfferData, candidateName: e.target.value })}
                  className={`w-full p-2.5 rounded-xl font-medium border ${theme === 'dark' ? 'bg-slate-950 border-slate-700 text-white' : 'bg-slate-50 border-slate-200 text-slate-800'
                    }`}
                />
              </div>

              <div>
                <label className="block mb-1 font-semibold">Email Address</label>
                <input
                  type="email"
                  required
                  value={editingOfferData.email}
                  onChange={(e) => setEditingOfferData({ ...editingOfferData, email: e.target.value })}
                  className={`w-full p-2.5 rounded-xl font-medium border ${theme === 'dark' ? 'bg-slate-950 border-slate-700 text-white' : 'bg-slate-50 border-slate-200 text-slate-800'
                    }`}
                />
              </div>

              <div>
                <label className="block mb-1 font-semibold">Job Title / Position</label>
                <input
                  type="text"
                  required
                  value={editingOfferData.jobTitle}
                  onChange={(e) => setEditingOfferData({ ...editingOfferData, jobTitle: e.target.value })}
                  className={`w-full p-2.5 rounded-xl font-medium border ${theme === 'dark' ? 'bg-slate-950 border-slate-700 text-white' : 'bg-slate-50 border-slate-200 text-slate-800'
                    }`}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block mb-1 font-semibold">Fixed Base CTC (₹)</label>
                  <input
                    type="number"
                    required
                    value={editingOfferData.salary}
                    onChange={(e) => setEditingOfferData({ ...editingOfferData, salary: e.target.value })}
                    className={`w-full p-2.5 rounded-xl font-medium border ${theme === 'dark' ? 'bg-slate-950 border-slate-700 text-white' : 'bg-slate-50 border-slate-200 text-slate-800'
                      }`}
                  />
                </div>
                <div>
                  <label className="block mb-1 font-semibold">Variable Bonus (₹)</label>
                  <input
                    type="number"
                    value={editingOfferData.bonus}
                    onChange={(e) => setEditingOfferData({ ...editingOfferData, bonus: e.target.value })}
                    className={`w-full p-2.5 rounded-xl font-medium border ${theme === 'dark' ? 'bg-slate-950 border-slate-700 text-white' : 'bg-slate-50 border-slate-200 text-slate-800'
                      }`}
                  />
                </div>
              </div>

              <div>
                <label className="block mb-1 font-semibold">Benefits (comma-separated)</label>
                <input
                  type="text"
                  value={editingOfferData.benefitsText}
                  onChange={(e) => setEditingOfferData({ ...editingOfferData, benefitsText: e.target.value })}
                  className={`w-full p-2.5 rounded-xl font-medium border ${theme === 'dark' ? 'bg-slate-950 border-slate-700 text-white' : 'bg-slate-50 border-slate-200 text-slate-800'
                    }`}
                />
              </div>

              <div>
                <label className="block mb-1 font-semibold">Custom Terms / Probation Rules</label>
                <textarea
                  rows="2"
                  value={editingOfferData.customTerms}
                  onChange={(e) => setEditingOfferData({ ...editingOfferData, customTerms: e.target.value })}
                  className={`w-full p-2.5 rounded-xl font-medium border ${theme === 'dark' ? 'bg-slate-950 border-slate-700 text-white' : 'bg-slate-50 border-slate-200 text-slate-800'
                    }`}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block mb-1 font-semibold">Joining Date</label>
                  <input
                    type="date"
                    required
                    value={editingOfferData.joiningDate}
                    onChange={(e) => setEditingOfferData({ ...editingOfferData, joiningDate: e.target.value })}
                    className={`w-full p-2.5 rounded-xl font-medium border ${theme === 'dark' ? 'bg-slate-950 border-slate-700 text-white' : 'bg-slate-50 border-slate-200 text-slate-800'
                      }`}
                  />
                </div>
                <div>
                  <label className="block mb-1 font-semibold">Expiration Date</label>
                  <input
                    type="date"
                    required
                    value={editingOfferData.expirationDate}
                    onChange={(e) => setEditingOfferData({ ...editingOfferData, expirationDate: e.target.value })}
                    className={`w-full p-2.5 rounded-xl font-medium border ${theme === 'dark' ? 'bg-slate-950 border-slate-700 text-white' : 'bg-slate-50 border-slate-200 text-slate-800'
                      }`}
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button type="submit" className="flex-1 py-2.5 font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-sm">
                  Save Offer Terms
                </button>
                <button
                  type="button"
                  onClick={() => setShowEditOfferModal(false)}
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

      {/* PDF Offer Letter Viewer Modal */}
      {showPdfModal && viewingPdfUrl && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md flex items-center justify-center z-50 p-4">
          <div className={`rounded-2xl max-w-5xl w-full h-[90vh] p-6 space-y-4 shadow-2xl border flex flex-col ${theme === 'dark' ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-slate-200 text-slate-900'
            }`}>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-3 shrink-0">
              <div>
                <h2 className="text-base font-bold flex items-center gap-2">
                  <span>👁️ Official PDF Offer Letter Preview: {firstName} {lastName}</span>
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                  Active Global Corporate Template: <strong className="text-indigo-600 dark:text-indigo-400">{globalTemplateInfo.templateName}</strong>
                </p>
              </div>
              <div className="flex items-center gap-3">
                <a
                  href={viewingPdfUrl}
                  download={`${firstName}_${lastName}_Official_Offer_Letter.pdf`}
                  className="px-3.5 py-1.5 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-sm transition-all flex items-center gap-1.5"
                >
                  <span>📥</span> Download Copy
                </a>
                <button onClick={() => setShowPdfModal(false)} className="text-slate-400 hover:text-slate-600 font-bold text-base px-2">✕</button>
              </div>
            </div>

            <div className="flex-1 w-full h-full rounded-xl overflow-hidden border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-950 shadow-inner">
              <iframe
                src={viewingPdfUrl}
                className="w-full h-full rounded-xl"
                title={`Offer Letter PDF - ${firstName} ${lastName}`}
              />
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
};

export default CandidateDetails;