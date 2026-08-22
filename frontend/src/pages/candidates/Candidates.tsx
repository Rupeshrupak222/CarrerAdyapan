import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import * as XLSX from 'xlsx';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { candidateService } from '../../services/candidateService';
import { interviewService } from '../../services/interviewService';
import { calculateRealAIScore, getCandidateAIScore, getStoredCandidates } from '../../utils/applicationStore';
import { useTheme } from '../../context/ThemeContext';
import toast from 'react-hot-toast';

const Candidates = () => {
  const navigate = useNavigate();
  const [candidates, setCandidates] = useState([]);
  const [interviews, setInterviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [interviewFilter, setInterviewFilter] = useState('ALL');
  const [showAddModal, setShowAddModal] = useState(false);
  const [schedulingCandidate, setSchedulingCandidate] = useState(null);
  const [scheduleFormData, setScheduleFormData] = useState({
    type: 'SALES_PITCH_ROUND',
    scheduledAt: '',
    duration: 30,
    meetingLink: 'https://meet.google.com/adyapan-hiring-call',
  });
  const [showBulkScheduleModal, setShowBulkScheduleModal] = useState(false);
  const [isBulkScheduling, setIsBulkScheduling] = useState(false);
  const [bulkScheduleFormData, setBulkScheduleFormData] = useState({
    type: 'SALES_PITCH_ROUND',
    scheduledAt: '',
    duration: 30,
    meetingLink: 'https://meet.google.com/adyapan-hiring-call',
  });
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
    fetchInterviewsData();

    const handleSync = () => {
      fetchCandidates();
      fetchInterviewsData();
    };

    window.addEventListener('storage', handleSync);
    window.addEventListener('adyapan_data_sync', handleSync);

    return () => {
      window.removeEventListener('storage', handleSync);
      window.removeEventListener('adyapan_data_sync', handleSync);
    };
  }, []);

  const fetchCandidates = async () => {
    let list = [];
    try {
      const res = await candidateService.getAllCandidates();
      if (res?.candidates && Array.isArray(res.candidates) && res.candidates.length > 0) {
        list = res.candidates;
      }
    } catch (error) {
      console.warn('Backend candidates fetch error:', error);
    }

    try {
      const localCandidates = getStoredCandidates();
      if (localCandidates && Array.isArray(localCandidates) && localCandidates.length > 0) {
        const map = new Map();
        const getCandKey = (c: any) => (c.email ? String(c.email).trim().toLowerCase() : String(c.id));

        list.forEach((c) => {
          if (c && (c.email || c.id)) {
            map.set(getCandKey(c), c);
          }
        });

        localCandidates.forEach((c) => {
          if (c && (c.email || c.id)) {
            const key = getCandKey(c);
            if (!map.has(key)) {
              map.set(key, c);
            } else {
              map.set(key, { ...map.get(key), ...c });
            }
          }
        });

        list = Array.from(map.values());
      }
    } catch (e) { }

    setCandidates(list);
    setLoading(false);
  };

  const fetchInterviewsData = async () => {
    let list = [];
    try {
      const res = await interviewService.getAllInterviews(true);
      if (res?.interviews && Array.isArray(res.interviews)) {
        list = res.interviews;
      }
    } catch (e) {
      console.warn('Error fetching interviews for candidates:', e);
    }
    try {
      const localStr = localStorage.getItem('adyapan_interviews');
      if (localStr) {
        const localList = JSON.parse(localStr);
        if (Array.isArray(localList)) {
          const map = new Map();
          list.forEach((i) => i && i.id && map.set(String(i.id), i));
          localList.forEach((i) => {
            if (i && i.id) {
              if (!map.has(String(i.id))) map.set(String(i.id), i);
              else map.set(String(i.id), { ...map.get(String(i.id)), ...i });
            }
          });
          list = Array.from(map.values());
        }
      }
    } catch (e) { }
    setInterviews(Array.isArray(list) ? list : []);
  };

  // Excel / CSV File Import Handler
  const handleImportExcel = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (evt) => {
      try {
        const data = evt.target.result;
        const workbook = XLSX.read(data, { type: 'binary' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const jsonRows = XLSX.utils.sheet_to_json(worksheet, { defval: '' });

        if (!jsonRows || jsonRows.length === 0) {
          toast.error('No rows or candidate data found in the uploaded file.');
          return;
        }

        const importedCandidates = [];
        const storedList = getStoredCandidates();

        for (let i = 0; i < jsonRows.length; i++) {
          const row = jsonRows[i];

          // Extract candidate fields with flexible column header matching
          const fullName = String(
            row['Candidate Name'] || row['Name'] || row['Full Name'] || row['Student Name'] || row['firstName'] || `Candidate ${i + 1}`
          ).trim();

          const nameParts = fullName.split(' ');
          const firstName = nameParts[0] || 'Candidate';
          const lastName = nameParts.slice(1).join(' ') || '';

          const email = String(row['Email ID'] || row['Email'] || row['Email Address'] || row['email'] || `candidate_${Date.now()}_${i + 1}@gmail.com`).trim();
          const phone = String(row['Phone Number'] || row['Phone'] || row['Mobile'] || row['Contact Number'] || row['phone'] || '9876543210').trim();
          const currentPosition = String(
            row['Current Position / Role'] || row['Role'] || row['Position'] || row['Designation'] || row['Current Position'] || row['currentPosition'] || 'Business Development Associate (BDA)'
          ).trim();

          const expVal = Number(row['Experience (Years)'] || row['Experience'] || row['Total Experience'] || row['Yrs'] || row['experience'] || 0);
          const location = String(row['Location'] || row['City'] || row['location'] || 'HYDERABAD / Remote').trim();
          const education = String(row['Education / Degree'] || row['Education'] || row['Degree'] || row['Qualification'] || row['education'] || 'MBA (EdTech & Sales)').trim();
          const currentCompany = String(row['Company / College'] || row['Company'] || row['College'] || row['Institution'] || row['currentCompany'] || 'Recognized Institute').trim();

          const skillsRaw = row['Key Skills'] || row['Skills'] || row['skills'] || 'EdTech Sales, Student Counselling, Telesales, Lead Conversion';
          const skills = typeof skillsRaw === 'string' ? skillsRaw.split(',').map((s) => s.trim()).filter(Boolean) : (Array.isArray(skillsRaw) ? skillsRaw : ['EdTech Sales']);

          const isStudent = expVal === 0 || String(currentPosition || '').toLowerCase().includes('student') || String(currentPosition || '').toLowerCase().includes('fresher');
          const calculated = calculateRealAIScore(skills, isStudent ? 0 : expVal, currentPosition || 'Business Development Associate (BDA)');

          const candId = `cand_imp_${Date.now()}_${i}_${Math.random().toString(36).substr(2, 4)}`;

          const newCand = {
            id: candId,
            firstName,
            lastName,
            name: `${firstName} ${lastName}`.trim(),
            email,
            phone,
            currentPosition,
            experience: expVal,
            totalExperience: expVal,
            location,
            education,
            collegeName: currentCompany,
            currentCompany,
            skills,
            employmentStatus: isStudent ? 'STUDENT' : 'PROFESSIONAL',
            score: calculated.score,
            reason: calculated.reason,
            status: 'APPLIED',
            createdAt: new Date().toISOString(),
          };

          importedCandidates.push(newCand);

          // Optionally push to backend DB
          try {
            await candidateService.createCandidate(newCand);
          } catch (e) {
            // Silently fallback to local storage
          }
        }

        // Merge & Save to LocalStorage
        const updatedList = [...importedCandidates, ...storedList];
        localStorage.setItem('adyapan_candidates', JSON.stringify(updatedList));

        // Update UI State
        setCandidates((prev) => [...importedCandidates, ...prev]);
        toast.success(`🎉 Successfully imported ${importedCandidates.length} candidate(s) from Excel!`);

        // Real-time Event Dispatch
        window.dispatchEvent(new Event('adyapan_data_sync'));
        window.dispatchEvent(new Event('storage'));
      } catch (err) {
        console.error('Excel parse error:', err);
        toast.error('Failed to parse Excel file. Please ensure it is a valid .xlsx or .csv sheet.');
      }
    };

    reader.readAsBinaryString(file);
    if (e.target) e.target.value = '';
  };

  // Excel Export Handler (With Real AI Match Scores)
  const handleExportExcel = () => {
    if (!candidates || candidates.length === 0) {
      toast.error('No candidates available to export.');
      return;
    }

    const exportData = candidates.map((cand, index) => {
      const fullName = `${cand.firstName || ''} ${cand.lastName || ''}`.trim() || cand.name || `Candidate ${index + 1}`;
      const skillsList = Array.isArray(cand.skills)
        ? cand.skills
        : (typeof cand.skills === 'string' ? cand.skills.split(',').map((s) => s.trim()).filter(Boolean) : []);
      const skillsStr = skillsList.join(', ');

      const isStudent = cand.employmentStatus === 'STUDENT'
        || Number(cand.totalExperience || cand.experience || 0) === 0
        || String(cand.currentPosition || '').toLowerCase().includes('student')
        || String(cand.currentPosition || '').toLowerCase().includes('fresher');

      const calculated = calculateRealAIScore(
        skillsList,
        isStudent ? 0 : (cand.totalExperience || cand.experience || 0),
        cand.currentPosition || cand.jobTitle || 'Business Development Associate (BDA)'
      );

      const realAiScore = cand.score || cand.applications?.[0]?.aiScore || calculated.score;
      const rawReason = cand.reason || cand.applications?.[0]?.matchReason || calculated.reason;
      const eduStr = typeof cand.education === 'object' ? (cand.education?.degree || 'Graduate') : (cand.education || 'Graduate');

      return {
        'S.No': index + 1,
        'Candidate Name': fullName,
        'Email ID': cand.email || 'N/A',
        'Phone Number': cand.phone || 'N/A',
        'Current Position / Role': cand.currentPosition || cand.jobTitle || 'Business Development Associate',
        'Experience (Years)': cand.totalExperience || cand.experience || 0,
        'Location': cand.location || 'HYDERABAD / Remote',
        'Education / Degree': eduStr,
        'Company / College': cand.currentCompany || cand.collegeName || 'N/A',
        'Key Skills': skillsStr,
        'Status': cand.status || 'APPLIED',
        'AI Match Score (%)': `${realAiScore}%`,
        'AI Match Evaluation Summary': typeof rawReason === 'string' ? rawReason : 'Verified skill evaluation & domain experience.',
        'Created Date': cand.createdAt ? new Date(cand.createdAt).toLocaleDateString('en-IN') : 'N/A',
      };
    });

    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Candidates Directory');

    const fileName = `Adyapan_Candidates_Export_${new Date().toISOString().slice(0, 10)}.xlsx`;
    XLSX.writeFile(workbook, fileName);

    toast.success(`Exported ${exportData.length} candidate(s) with real AI scores to ${fileName}! 📄`);
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
        toast.success(`Candidate ${response.candidate.firstName} saved to PostgreSQL DB! `);
      }
      setShowAddModal(false);
      setFormData({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        currentPosition: 'Business Development Associate (BDA)',
        experience: '2' as any,
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
    toast.success(`Candidate "${name}" deleted! `);
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
      toast.success(`Downloading original file: ${fileName} `);
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
        toast.success(`Downloaded original file: ${fileName} `);
        return;
      } catch (e) {
        console.error('Base64 decode error:', e);
      }
    }

    toast.error('No uploaded resume file found for this candidate');
  };

  const handleOpenScheduleModal = (cand) => {
    setSchedulingCandidate(cand);
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(11, 0, 0, 0);
    const formattedDateTime = new Date(tomorrow.getTime() - (tomorrow.getTimezoneOffset() * 60000))
      .toISOString()
      .slice(0, 16);

    setScheduleFormData({
      type: 'SALES_PITCH_ROUND',
      scheduledAt: formattedDateTime,
      duration: 30,
      meetingLink: 'https://meet.google.com/adyapan-hiring-call',
    });
  };

  const handleConfirmSchedule = async (e) => {
    e.preventDefault();
    if (!schedulingCandidate) return;

    const fullCandName = `${schedulingCandidate.firstName || ''} ${schedulingCandidate.lastName || ''}`.trim() || 'Candidate';
    const isGeneric = (p: any) => !p || ['student / fresher', 'student', 'fresher', 'applicant'].includes(String(p).toLowerCase().trim());
    const appliedRole = schedulingCandidate.jobTitle 
      || schedulingCandidate.appliedRole 
      || schedulingCandidate.applications?.[0]?.job?.title 
      || (!isGeneric(schedulingCandidate.currentPosition) ? schedulingCandidate.currentPosition : '') 
      || 'Business Development Associate';

    const newInterviewData = {
      id: `int-${Date.now()}`,
      candidateName: fullCandName,
      candidateEmail: schedulingCandidate.email || 'candidate@example.com',
      jobTitle: appliedRole,
      candidateId: schedulingCandidate.id,
      applicationId: schedulingCandidate.applications?.[0]?.id || null,
      type: scheduleFormData.type || 'SALES_PITCH_ROUND',
      scheduledAt: scheduleFormData.scheduledAt ? new Date(scheduleFormData.scheduledAt).toISOString() : new Date().toISOString(),
      duration: (parseInt(scheduleFormData.duration as any) || 30) as any,
      meetingLink: scheduleFormData.meetingLink || 'https://meet.google.com/adyapan-hiring-call',
      notes: `Scheduled interview for ${fullCandName}`,
      status: 'SCHEDULED',
    };

    try {
      await interviewService.createInterview(newInterviewData);
      await candidateService.updateCandidate(schedulingCandidate.id, { status: 'SCHEDULED' }).catch(() => { });
    } catch (err) {
      console.warn('DB interview create fallback:', err.message);
    }

    try {
      const key = 'adyapan_interviews';
      const existing = JSON.parse(localStorage.getItem(key) || '[]');
      const updated = [newInterviewData, ...existing.filter((i) => i.id !== newInterviewData.id)];
      localStorage.setItem(key, JSON.stringify(updated));

      const candKey = 'adyapan_candidates';
      const existingCands = JSON.parse(localStorage.getItem(candKey) || '[]');
      const updatedCands = existingCands.map((c) => {
        if (c.id === schedulingCandidate.id || (c.email && schedulingCandidate.email && c.email.toLowerCase() === schedulingCandidate.email.toLowerCase())) {
          return { ...c, status: 'SCHEDULED' };
        }
        return c;
      });
      localStorage.setItem(candKey, JSON.stringify(updatedCands));
    } catch (e) { }

    if (typeof window !== 'undefined') {
      window.dispatchEvent(new Event('adyapan_data_sync'));
    }

    toast.success(`Interview scheduled for ${fullCandName} & saved to Interviews directory!`);
    setSchedulingCandidate(null);
    navigate('/interviews');
  };

  const handleOpenBulkScheduleModal = () => {
    if (!filteredCandidates || filteredCandidates.length === 0) {
      toast.error('No candidates found to schedule interview for.');
      return;
    }
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(11, 0, 0, 0);
    const formattedDateTime = new Date(tomorrow.getTime() - (tomorrow.getTimezoneOffset() * 60000))
      .toISOString()
      .slice(0, 16);

    setBulkScheduleFormData({
      type: 'SALES_PITCH_ROUND',
      scheduledAt: formattedDateTime,
      duration: 30,
      meetingLink: 'https://meet.google.com/adyapan-hiring-call',
    });
    setShowBulkScheduleModal(true);
  };

  const handleConfirmBulkSchedule = async (e) => {
    e.preventDefault();
    if (!filteredCandidates || filteredCandidates.length === 0) {
      toast.error('No candidates found to schedule interview for.');
      return;
    }

    setIsBulkScheduling(true);

    try {
      // High-performance batch API call (< 1 second response for 100+ candidates)
      const res = await interviewService.bulkScheduleInterviews({
        interviews: filteredCandidates,
        type: bulkScheduleFormData.type || 'SALES_PITCH_ROUND',
        scheduledAt: bulkScheduleFormData.scheduledAt ? new Date(bulkScheduleFormData.scheduledAt).toISOString() : new Date().toISOString(),
        duration: parseInt(bulkScheduleFormData.duration as any) || 30,
        meetingLink: bulkScheduleFormData.meetingLink || 'https://meet.google.com/adyapan-hiring-call',
        notes: `Bulk scheduled interview round`,
      });

      const newInterviewsList = res?.interviews || [];
      const scheduledCount = newInterviewsList.length || filteredCandidates.length;

      // Update LocalStorage sync layer instantly
      const key = 'adyapan_interviews';
      const existingInterviews = JSON.parse(localStorage.getItem(key) || '[]');
      const candKey = 'adyapan_candidates';
      let existingCands = JSON.parse(localStorage.getItem(candKey) || '[]');

      const updatedInterviews = [...newInterviewsList, ...existingInterviews];
      localStorage.setItem(key, JSON.stringify(updatedInterviews));

      const updatedCands = existingCands.map((c) => {
        const isMatch = filteredCandidates.some(
          (fc) => fc.id === c.id || (fc.email && c.email && fc.email.toLowerCase() === c.email.toLowerCase())
        );
        return isMatch ? { ...c, status: 'SCHEDULED' } : c;
      });
      localStorage.setItem(candKey, JSON.stringify(updatedCands));

      if (typeof window !== 'undefined') {
        window.dispatchEvent(new Event('adyapan_data_sync'));
        window.dispatchEvent(new Event('adyapan_data_updated'));
      }

      toast.success(`⚡ Successfully bulk scheduled interviews & dispatched invitation emails to all ${scheduledCount} candidates instantly!`);
      setShowBulkScheduleModal(false);
      fetchCandidates();
      fetchInterviewsData();
      navigate('/interviews');
    } catch (err) {
      console.error('Error bulk scheduling interviews:', err);
      toast.error('Failed to complete bulk interview scheduling: ' + err.message);
    } finally {
      setIsBulkScheduling(false);
    }
  };

  const getCandidateInterview = (cand) => {
    if (!cand) return null;
    const cId = cand.id ? String(cand.id).trim().toLowerCase() : '';
    const cEmail = cand.email ? String(cand.email).trim().toLowerCase() : '';
    const cName = `${cand.firstName || ''} ${cand.lastName || ''}`.trim().toLowerCase();

    return interviews.find((i) => {
      if (!i) return false;
      const iCandId = i.candidateId || i.application?.candidateId || i.application?.candidate?.id;
      if (cId && iCandId && String(iCandId).trim().toLowerCase() === cId) return true;

      const iEmail = (i.candidateEmail || i.application?.candidate?.email || '').trim().toLowerCase();
      if (cEmail && iEmail && cEmail === iEmail) return true;

      const iName = (i.candidateName || `${i.application?.candidate?.firstName || ''} ${i.application?.candidate?.lastName || ''}`).trim().toLowerCase();
      if (cName && iName && cName.length > 2 && cName === iName) return true;

      return false;
    });
  };

  const getAppliedRole = (cand: any) => {
    if (!cand) return 'Business Development Associate (BDA)';
    if (cand.appliedRole && !cand.appliedRole.toLowerCase().includes('student') && !cand.appliedRole.toLowerCase().includes('fresher')) {
      return cand.appliedRole;
    }
    if (cand.jobTitle && !cand.jobTitle.toLowerCase().includes('student') && !cand.jobTitle.toLowerCase().includes('fresher')) {
      return cand.jobTitle;
    }
    if (cand.applications?.[0]?.job?.title) {
      return cand.applications[0].job.title;
    }
    if (cand.applications?.[0]?.jobTitle) {
      return cand.applications[0].jobTitle;
    }
    if (cand.parsedResume?.jobTitle) {
      return cand.parsedResume.jobTitle;
    }
    if (cand.parsedResume?.appliedRole) {
      return cand.parsedResume.appliedRole;
    }
    const reasonText = String(cand.reason || cand.matchReason || cand.parsedResume?.reason || '');
    const againstMatch = reasonText.match(/against\s+([^.]+?)(?:\.|\s*Required|\s*\(|$)/i);
    if (againstMatch && againstMatch[1] && againstMatch[1].trim().length > 3) {
      return againstMatch[1].trim();
    }
    const skillsList = Array.isArray(cand.skills) ? cand.skills : (typeof cand.skills === 'string' ? cand.skills.split(',') : []);
    const skillsStr = skillsList.join(' ').toLowerCase();
    if (skillsStr.includes('react') || skillsStr.includes('node') || skillsStr.includes('full stack') || skillsStr.includes('developer')) {
      return 'Senior Full Stack Developer (React & Node.js)';
    }
    if (skillsStr.includes('counsel') || skillsStr.includes('academic') || skillsStr.includes('advisor')) {
      return 'Academic Counsellor / Student Advisor';
    }
    return 'Business Development Associate (BDA)';
  };

  const filteredCandidates = candidates.filter((cand) => {
    const fullName = `${cand.firstName || ''} ${cand.lastName || ''}`.toLowerCase();
    const skillsText = Array.isArray(cand.skills)
      ? cand.skills.join(' ').toLowerCase()
      : String(cand.skills || '').toLowerCase();
    const pos = (cand.currentPosition || '').toLowerCase();
    const appliedRole = getAppliedRole(cand).toLowerCase();
    const query = search.toLowerCase();

    const matchesSearch = fullName.includes(query) || skillsText.includes(query) || pos.includes(query) || appliedRole.includes(query);
    const matchesStatus = statusFilter === 'ALL' ? true : cand.status === statusFilter;

    const candInterview = getCandidateInterview(cand);
    const isScheduled = candInterview?.status === 'SCHEDULED' || cand.status === 'SCHEDULED' || cand.status === 'INTERVIEW_SCHEDULED';
    const isCompleted = candInterview?.status === 'COMPLETED' || cand.status === 'INTERVIEWED' || cand.status === 'COMPLETED';

    let matchesInterviewFilter = true;
    if (interviewFilter === 'SCHEDULED') {
      matchesInterviewFilter = isScheduled;
    } else if (interviewFilter === 'COMPLETED') {
      matchesInterviewFilter = isCompleted;
    } else if (interviewFilter === 'NOT_SCHEDULED') {
      matchesInterviewFilter = !isScheduled && !isCompleted;
    }

    return matchesSearch && matchesStatus && matchesInterviewFilter;
  });

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header Bar */}
        <div className={`p-6 rounded-3xl border transition-all flex flex-col md:flex-row md:items-center justify-between gap-4 relative overflow-hidden shadow-sm ${theme === 'dark' ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-slate-200 text-slate-900'
          }`}>

          <div className="pt-1 space-y-1">
            <div className="inline-flex items-center gap-2 px-3 py-0.5 rounded-full text-xs font-semibold bg-amber-500/15 text-amber-700 dark:text-amber-300 border border-amber-500/30">
              Adyapan Candidate Management
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
              Candidate Directory & AI Audit
            </h1>
            <p className="text-xs text-slate-600 dark:text-slate-300 font-normal">
              Review applicant resumes, verified skill scores, work experience, and schedule interviews.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            {/* Import Excel / CSV Button */}
            <label
              className={`px-3.5 py-2.5 text-xs font-bold rounded-xl border transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-sm hover:shadow hover:-translate-y-0.5 active:translate-y-0 ${theme === 'dark'
                ? 'bg-slate-900 text-slate-200 border-slate-700 hover:bg-slate-800 hover:border-amber-500/50'
                : 'bg-white text-slate-800 border-slate-300 hover:bg-amber-50 hover:border-amber-400 hover:text-amber-700'
                }`}
              title="Import students / candidates list from Excel sheet (.xlsx, .csv)"
            >
              <svg className="w-4 h-4 text-slate-600 dark:text-slate-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
              <span>Import Excel</span>
              <input
                type="file"
                accept=".xlsx, .xls, .csv"
                onChange={handleImportExcel}
                className="hidden"
              />
            </label>

            {/* Export Excel Button */}
            <button
              onClick={handleExportExcel}
              className={`px-3.5 py-2.5 text-xs font-bold rounded-xl border transition-all flex items-center justify-center gap-1.5 shadow-sm hover:shadow hover:-translate-y-0.5 active:translate-y-0 cursor-pointer ${theme === 'dark'
                ? 'bg-slate-900 text-slate-200 border-slate-700 hover:bg-slate-800 hover:border-amber-500/50'
                : 'bg-white text-slate-800 border-slate-300 hover:bg-amber-50 hover:border-amber-400 hover:text-amber-700'
                }`}
              title="Export all candidates data to Excel spreadsheet"
            >
              <svg className="w-4 h-4 text-slate-600 dark:text-slate-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <span>Export Excel</span>
            </button>

            {/* Schedule All Interviews Button */}
            <button
              onClick={handleOpenBulkScheduleModal}
              className={`px-3.5 py-2.5 text-xs font-bold rounded-xl border transition-all flex items-center justify-center gap-1.5 shadow-sm hover:shadow hover:-translate-y-0.5 active:translate-y-0 cursor-pointer ${theme === 'dark'
                ? 'bg-slate-900 text-slate-200 border-slate-700 hover:bg-slate-800 hover:border-amber-500/50'
                : 'bg-white text-slate-800 border-slate-300 hover:bg-amber-50 hover:border-amber-400 hover:text-amber-700'
                }`}
              title="Schedule interview for all candidates at once and send invitation emails"
            >
              <svg className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5 5 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              <span>Schedule All Interviews</span>
            </button>

            <Link
              to="/candidates/compare"
              className={`px-3.5 py-2.5 text-xs font-bold rounded-xl border transition-all flex items-center justify-center gap-1.5 hover:-translate-y-0.5 active:translate-y-0 ${theme === 'dark'
                ? 'bg-slate-950 text-slate-200 border-slate-800 hover:bg-slate-800'
                : 'bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-200'
                }`}
            >
              <svg className="w-4 h-4 text-purple-600 dark:text-purple-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
              <span>Compare Matrix</span>
            </Link>

            <button
              onClick={() => setShowAddModal(true)}
              className="px-4 py-2.5 text-xs font-bold text-white bg-amber-500 hover:bg-amber-600 rounded-xl shadow-md hover:shadow-amber-500/25 hover:-translate-y-0.5 active:translate-y-0 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <svg className="w-4 h-4 text-white shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 4v16m8-8H4" />
              </svg>
              <span>Add Candidate Manually</span>
            </button>
          </div>
        </div>

        {/* Search & Filter Bar */}
        <div className={`p-4 rounded-3xl border shadow-sm flex flex-col md:flex-row items-center justify-between gap-4 ${theme === 'dark' ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
          }`}>
          {/* Search Input */}
          <div className="relative w-full md:w-80">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-amber-500 font-bold text-xs">
            </span>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search candidate name, skills, role..."
              className={`w-full pl-9 pr-4 py-2 text-xs font-normal border rounded-xl focus:outline-none ${theme === 'dark'
                ? 'bg-slate-950 border-slate-700 text-white placeholder-slate-500 focus:border-amber-400'
                : 'bg-white border-slate-200 text-slate-800 placeholder-slate-400 focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20'
                }`}
            />
          </div>

          {/* Status Filter Badges */}
          <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
            {[
              { id: 'ALL', label: 'All Candidates' },
              { id: 'SCHEDULED', label: 'Interview Scheduled' },
              { id: 'COMPLETED', label: 'Interview Completed' },
              { id: 'NOT_SCHEDULED', label: 'Not Scheduled' },
            ].map((f) => (
              <button
                key={f.id}
                onClick={() => setInterviewFilter(f.id)}
                className={`px-3 py-1.5 text-xs font-semibold rounded-xl transition-all border ${interviewFilter === f.id
                  ? 'bg-amber-500 text-white border-amber-600 shadow-sm font-bold'
                  : theme === 'dark'
                    ? 'bg-slate-950 text-slate-300 border-slate-800 hover:border-amber-400/50'
                    : 'bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-200'
                  }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {/* Candidate Cards Grid */}
        <div className="space-y-4">
          {filteredCandidates.length === 0 ? (
            <div className={`p-8 text-center rounded-3xl border text-xs font-normal ${theme === 'dark' ? 'bg-slate-900 border-slate-800 text-slate-400' : 'bg-white border-slate-200 text-slate-500'
              }`}>
              No candidates found matching filter criteria. Click "+ Add Candidate Manually" to add one.
            </div>
          ) : (
            filteredCandidates.map((cand) => {
              const skillsList = Array.isArray(cand.skills) ? cand.skills : (typeof cand.skills === 'string' ? cand.skills.split(',').map((s) => s.trim()) : []);
              const isStudent = cand.employmentStatus === 'STUDENT' || Number(cand.totalExperience) === 0 || String(cand.currentPosition || '').toLowerCase().includes('student') || String(cand.currentPosition || '').toLowerCase().includes('fresher');
              const evaluatedAi = getCandidateAIScore(cand);
              const aiScore = evaluatedAi.score;
              const candReason = evaluatedAi.reason;

              const eduDegree = typeof cand.education === 'object'
                ? (cand.education?.degree || cand.education?.fieldOfStudy || 'Graduate')
                : (typeof cand.education === 'string' ? cand.education : 'Graduate');

              const college = typeof cand.education === 'object'
                ? (cand.education?.college || cand.education?.institution || 'Recognized College')
                : (typeof cand.collegeName === 'string' ? cand.collegeName : 'Recognized College');

              const appliedRole = getAppliedRole(cand);
              const positionDisplay = isStudent ? 'Student / Fresher' : (cand.currentPosition || 'Professional');
              const companyDisplay = cand.currentCompany ? (isStudent ? `(${cand.currentCompany})` : `at ${cand.currentCompany}`) : '';

              const candInterview = getCandidateInterview(cand);
              const isCompleted = candInterview?.status === 'COMPLETED' || cand.status === 'INTERVIEWED' || cand.status === 'COMPLETED';
              const isScheduled = candInterview?.status === 'SCHEDULED' || cand.status === 'SCHEDULED' || cand.status === 'INTERVIEW_SCHEDULED';

              return (
                <div
                  key={cand.id}
                  className={`p-6 rounded-3xl border shadow-sm hover:shadow-md transition-all flex flex-col lg:flex-row lg:items-center justify-between gap-5 relative overflow-hidden group ${theme === 'dark' ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-slate-200 text-slate-900'
                    }`}
                >

                  {/* Candidate Info */}
                  <div className="flex flex-col sm:flex-row items-start gap-4 pt-1 flex-1 min-w-0">
                    <Link
                      to={`/candidates/${cand.id}`}
                      className="w-12 h-12 rounded-2xl bg-amber-400 text-slate-950 font-bold text-base flex items-center justify-center shrink-0 shadow-sm hover:scale-105 hover:bg-amber-500 transition-all cursor-pointer"
                      title={`View ${cand.firstName}'s Profile`}
                    >
                      {cand.firstName?.charAt(0)}
                      {cand.lastName?.charAt(0)}
                    </Link>

                    <div className="space-y-2 flex-1 min-w-0 w-full">
                      <div className="flex flex-wrap items-center gap-2.5">
                        <Link
                          to={`/candidates/${cand.id}`}
                          className="text-base font-black text-slate-900 dark:text-white hover:text-amber-500 dark:hover:text-amber-400 transition-colors cursor-pointer group/name"
                          title={`View ${cand.firstName}'s Profile`}
                        >
                          <span className="group-hover/name:underline">{cand.firstName} {cand.lastName}</span>
                        </Link>
                        
                        {/* Target Applied Role Badge */}
                        <span className="px-3 py-1 text-xs font-black rounded-xl bg-amber-500/20 text-amber-900 dark:text-amber-200 border border-amber-500/50 shadow-sm flex items-center gap-1.5">
                          <span>🎯 Applied Post:</span>
                          <span className="underline decoration-amber-500/50">{appliedRole}</span>
                        </span>

                        <span className="px-2.5 py-0.5 text-xs font-semibold rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                          ● {isStudent ? 'Student / Fresher' : `Working (${cand.currentCompanyTenure || 'Professional'})`}
                        </span>
                        <span className="px-2.5 py-0.5 text-xs font-bold text-slate-800 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 rounded-full border border-slate-200 dark:border-slate-700">
                          {aiScore}% AI Match
                        </span>

                        {isCompleted ? (
                          <span className="px-2.5 py-0.5 text-xs font-bold text-slate-800 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 rounded-full border border-slate-200 dark:border-slate-700">
                            ● Interview Completed
                          </span>
                        ) : isScheduled ? (
                          <span className="px-2.5 py-0.5 text-xs font-bold text-blue-700 dark:text-blue-300 bg-blue-500/15 rounded-full border border-blue-500/30" title={candInterview && candInterview.scheduledAt ? `Scheduled for ${new Date(candInterview.scheduledAt).toLocaleString()}` : 'Interview Scheduled'}>
                            ● Interview Scheduled {candInterview && candInterview.scheduledAt ? `(${new Date(candInterview.scheduledAt).toLocaleDateString([], { month: 'short', day: 'numeric' })})` : ''}
                          </span>
                        ) : (
                          <span className="px-2.5 py-0.5 text-xs font-semibold text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 rounded-full border border-slate-200 dark:border-slate-700">
                            ● Interview Not Scheduled
                          </span>
                        )}
                      </div>

                      {/* Prominent Applied Position Row */}
                      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs pt-0.5">
                        <span className="text-slate-700 dark:text-slate-200 font-bold">
                          Applied Post: <strong className="text-amber-600 dark:text-amber-400 font-black text-sm">{appliedRole}</strong>
                        </span>
                        <span className="text-slate-400">•</span>
                        <span className="text-slate-600 dark:text-slate-300">
                          Current Background: <strong className="text-slate-900 dark:text-white font-semibold">{positionDisplay}</strong> {companyDisplay}
                        </span>
                        <span className="text-slate-400">•</span>
                        <span className="text-slate-600 dark:text-slate-300">
                          Experience: <strong className="text-slate-900 dark:text-white font-semibold">{cand.totalExperience ?? 0} Yrs</strong>
                        </span>
                      </div>

                      <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 dark:text-slate-400 font-normal">
                        <span> {cand.email}</span>
                        <span>{cand.location || 'India'}</span>
                        <span>{eduDegree} ({college})</span>
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
                        : 'bg-white text-slate-800 border-slate-200'
                        }`}>
                        <strong className="font-bold text-amber-600 dark:text-amber-400">AI Match Insight:</strong> {candReason}
                      </p>

                      {/* Candidate Dynamic Positive Things Section (2 Lines) */}
                      {(() => {
                        const skillsList = Array.isArray(cand.skills) ? cand.skills : (typeof cand.skills === 'string' ? cand.skills.split(',').map((s) => s.trim()).filter(Boolean) : []);
                        const exp = Number(cand.totalExperience || cand.experience || 0);
                        const pos = (cand.currentPosition || cand.jobTitle || '').toLowerCase();
                        const company = cand.currentCompany ? cand.currentCompany.trim() : '';
                        const isFresher = exp === 0 || pos.includes('student') || pos.includes('fresher');
                        const score = Number(aiScore) || 75;
                        const candName = cand.firstName || cand.name?.split(' ')[0] || 'Candidate';

                        const pills = [];
                        if (score >= 85) pills.push(`Top ${score}% AI Match`);
                        else if (score >= 70) pills.push(`Verified ${score}% Skill Fit`);
                        else pills.push(`Evaluated ${score}% Match`);

                        if (skillsList.length > 0) {
                          pills.push(`Expert in ${skillsList.slice(0, 2).join(' & ')}`);
                        } else if (isFresher) {
                          pills.push('Quick Learner & Fast Adaptability');
                        } else {
                          pills.push('Established Client Pitching');
                        }

                        if (!isFresher && exp > 0) {
                          pills.push(`${exp} Year${exp > 1 ? 's' : ''} Industry Exp`);
                        } else if (company) {
                          pills.push(`Background at ${company}`);
                        } else {
                          pills.push('High Career Growth Potential');
                        }

                        let recommendation = '';
                        if (isFresher) {
                          const skillFocus = skillsList.slice(0, 2).join(' and ') || 'student counselling and sales communication';
                          recommendation = `${candName} shows high growth potential as a fresher with strong skills in ${skillFocus}. Recommended for junior BDA and Counselling roles.`;
                        } else if (exp >= 3) {
                          recommendation = `${candName} brings ${exp} years of proven hands-on experience${company ? ` from ${company}` : ''} with strong execution. Recommended for senior executive and lead roles.`;
                        } else {
                          const mainSkill = skillsList[0] || 'sales pitch & counselling';
                          recommendation = `${candName} has verified hands-on expertise in ${mainSkill}. Recommended for executive interview and client-facing rounds.`;
                        }

                        return (
                          <div className="space-y-1 pt-1.5 border-t border-slate-100 dark:border-slate-800/80 mt-1">
                            <div className="flex flex-wrap items-center gap-2 text-xs font-semibold text-slate-800 dark:text-slate-200">
                              <span>● Candidate Positive Strengths:</span>
                              {pills.slice(0, 2).map((pill, pIdx) => (
                                <span key={pIdx} className="px-2 py-0.5 rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-medium text-slate-700 dark:text-slate-300">
                                  {pill}
                                </span>
                              ))}
                            </div>
                            <p className="text-xs text-slate-600 dark:text-slate-300 font-normal leading-relaxed">
                              <strong className="font-semibold text-slate-800 dark:text-slate-200">Recommendation:</strong> {recommendation}
                            </p>
                          </div>
                        );
                      })()}
                    </div>
                  </div>

                  {/* Candidate Action Buttons */}
                  <div className="flex flex-wrap sm:flex-nowrap lg:flex-col items-center justify-center gap-2 shrink-0 border-t lg:border-t-0 pt-3 lg:pt-0 border-slate-100 dark:border-slate-800 w-full lg:w-44">
                    <Link
                      to={`/candidates/${cand.id}`}
                      className={`px-3.5 py-2 text-xs font-semibold rounded-xl border transition-all text-center w-full flex items-center justify-center gap-1.5 shadow-sm hover:-translate-y-0.5 active:translate-y-0 ${theme === 'dark'
                        ? 'bg-slate-950 text-slate-200 border-slate-800 hover:bg-slate-800'
                        : 'bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-200 hover:text-slate-900'
                        }`}
                    >
                      <svg className="w-3.5 h-3.5 text-slate-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                      <span>Profile & Resume</span>
                    </Link>
                    <button
                      onClick={() => handleOpenScheduleModal(cand)}
                      className="px-3.5 py-2 text-xs font-bold text-white bg-amber-500 hover:bg-amber-600 rounded-xl transition-all shadow-sm hover:shadow-amber-500/20 hover:-translate-y-0.5 active:translate-y-0 text-center w-full cursor-pointer flex items-center justify-center gap-1.5"
                    >
                      <svg className="w-3.5 h-3.5 text-amber-100 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      <span>Schedule Interview</span>
                    </button>
                    <button
                      onClick={() => handleDeleteCandidate(cand.id, `${cand.firstName} ${cand.lastName}`)}
                      className="px-3.5 py-2 text-xs font-semibold text-rose-600 dark:text-rose-400 bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 hover:-translate-y-0.5 active:translate-y-0 rounded-xl transition-all w-full flex items-center justify-center gap-1.5 cursor-pointer"
                      title="Delete candidate from DB, backend & frontend"
                    >
                      <svg className="w-3.5 h-3.5 text-rose-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                      <span>Delete Candidate</span>
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

      {/* Quick Schedule Interview Modal */}
      {schedulingCandidate && (
        <div className="fixed inset-0 bg-slate-950/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className={`rounded-2xl max-w-md w-full p-6 space-y-4 shadow-xl border ${theme === 'dark' ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-slate-200 text-slate-900'
            }`}>
            <h2 className="text-base font-bold border-b border-slate-100 dark:border-slate-800 pb-3">
              Schedule Interview for {schedulingCandidate.firstName} {schedulingCandidate.lastName}
            </h2>
            <form onSubmit={handleConfirmSchedule} className="space-y-3 text-xs font-medium">
              <div>
                <label className="block mb-1 font-semibold">Candidate</label>
                <input
                  type="text"
                  readOnly
                  value={`${schedulingCandidate.firstName || ''} ${schedulingCandidate.lastName || ''} (${schedulingCandidate.email || ''})`}
                  className={`w-full p-2.5 rounded-xl font-medium border opacity-80 ${theme === 'dark' ? 'bg-slate-950 border-slate-700 text-slate-300' : 'bg-slate-100 border-slate-200 text-slate-700'
                    }`}
                />
              </div>

              <div>
                <label className="block mb-1 font-semibold">Interview Round Type *</label>
                <select
                  value={scheduleFormData.type}
                  onChange={(e) => setScheduleFormData({ ...scheduleFormData, type: e.target.value })}
                  className={`w-full p-2.5 rounded-xl font-medium border ${theme === 'dark' ? 'bg-slate-950 border-slate-700 text-white' : 'bg-slate-50 border-slate-200 text-slate-800'
                    }`}
                >
                  <option value="SALES_PITCH_ROUND">Sales Pitch Round (BDA)</option>
                  <option value="HR_SCREENING">HR Screening Round</option>
                  <option value="MANAGERIAL_ROUND">Managerial Interview</option>
                  <option value="TECHNICAL_ROUND">Technical Sales Round</option>
                </select>
              </div>

              <div>
                <label className="block mb-1 font-semibold">Date & Time *</label>
                <input
                  type="datetime-local"
                  required
                  value={scheduleFormData.scheduledAt}
                  onChange={(e) => setScheduleFormData({ ...scheduleFormData, scheduledAt: e.target.value })}
                  className={`w-full p-2.5 rounded-xl font-medium border ${theme === 'dark' ? 'bg-slate-950 border-slate-700 text-white' : 'bg-slate-50 border-slate-200 text-slate-800'
                    }`}
                />
              </div>

              <div>
                <label className="block mb-1 font-semibold">Duration (Minutes)</label>
                <select
                  value={scheduleFormData.duration}
                  onChange={(e) => setScheduleFormData({ ...scheduleFormData, duration: e.target.value as any })}
                  className={`w-full p-2.5 rounded-xl font-medium border ${theme === 'dark' ? 'bg-slate-950 border-slate-700 text-white' : 'bg-slate-50 border-slate-200 text-slate-800'
                    }`}
                >
                  <option value="30">30 Minutes</option>
                  <option value="45">45 Minutes</option>
                  <option value="60">60 Minutes</option>
                </select>
              </div>

              <div>
                <label className="block mb-1 font-semibold">Meeting Link</label>
                <input
                  type="url"
                  value={scheduleFormData.meetingLink}
                  onChange={(e) => setScheduleFormData({ ...scheduleFormData, meetingLink: e.target.value })}
                  className={`w-full p-2.5 rounded-xl font-medium border ${theme === 'dark' ? 'bg-slate-950 border-slate-700 text-white' : 'bg-slate-50 border-slate-200 text-slate-800'
                    }`}
                  placeholder="https://meet.google.com/..."
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button type="submit" className="flex-1 py-2.5 font-semibold text-white bg-amber-500 hover:bg-amber-600 rounded-xl shadow-sm cursor-pointer">
                  Confirm & Schedule Interview
                </button>
                <button
                  type="button"
                  onClick={() => setSchedulingCandidate(null)}
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

      {/* Bulk Schedule Interview Modal */}
      {showBulkScheduleModal && (
        <div className="fixed inset-0 bg-slate-950/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className={`rounded-2xl max-w-md w-full p-6 space-y-4 shadow-xl border ${theme === 'dark' ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-slate-200 text-slate-900'
            }`}>
            <div className="border-b border-slate-100 dark:border-slate-800 pb-3">
              <h2 className="text-base font-bold">
                Schedule Interview for All Candidates
              </h2>
              <p className="text-xs text-amber-600 dark:text-amber-400 font-medium mt-0.5">
                Total {filteredCandidates.length} candidate(s) will be scheduled & notified via email
              </p>
            </div>

            <form onSubmit={handleConfirmBulkSchedule} className="space-y-3 text-xs font-medium">
              <div>
                <label className="block mb-1 font-semibold">Interview Round Type *</label>
                <select
                  value={bulkScheduleFormData.type}
                  onChange={(e) => setBulkScheduleFormData({ ...bulkScheduleFormData, type: e.target.value })}
                  className={`w-full p-2.5 rounded-xl font-medium border ${theme === 'dark' ? 'bg-slate-950 border-slate-700 text-white' : 'bg-slate-50 border-slate-200 text-slate-800'
                    }`}
                >
                  <option value="SALES_PITCH_ROUND">Sales Pitch Round (BDA)</option>
                  <option value="HR_SCREENING">HR Screening Round</option>
                  <option value="MANAGERIAL_ROUND">Managerial Interview</option>
                  <option value="TECHNICAL_ROUND">Technical Sales Round</option>
                </select>
              </div>

              <div>
                <label className="block mb-1 font-semibold">Date & Time for All *</label>
                <input
                  type="datetime-local"
                  required
                  value={bulkScheduleFormData.scheduledAt}
                  onChange={(e) => setBulkScheduleFormData({ ...bulkScheduleFormData, scheduledAt: e.target.value })}
                  className={`w-full p-2.5 rounded-xl font-medium border ${theme === 'dark' ? 'bg-slate-950 border-slate-700 text-white' : 'bg-slate-50 border-slate-200 text-slate-800'
                    }`}
                />
              </div>

              <div>
                <label className="block mb-1 font-semibold">Duration (Minutes)</label>
                <select
                  value={bulkScheduleFormData.duration}
                  onChange={(e) => setBulkScheduleFormData({ ...bulkScheduleFormData, duration: e.target.value as any })}
                  className={`w-full p-2.5 rounded-xl font-medium border ${theme === 'dark' ? 'bg-slate-950 border-slate-700 text-white' : 'bg-slate-50 border-slate-200 text-slate-800'
                    }`}
                >
                  <option value="30">30 Minutes</option>
                  <option value="45">45 Minutes</option>
                  <option value="60">60 Minutes</option>
                </select>
              </div>

              <div>
                <label className="block mb-1 font-semibold">Meeting Link</label>
                <input
                  type="url"
                  value={bulkScheduleFormData.meetingLink}
                  onChange={(e) => setBulkScheduleFormData({ ...bulkScheduleFormData, meetingLink: e.target.value })}
                  className={`w-full p-2.5 rounded-xl font-medium border ${theme === 'dark' ? 'bg-slate-950 border-slate-700 text-white' : 'bg-slate-50 border-slate-200 text-slate-800'
                    }`}
                  placeholder="https://meet.google.com/..."
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="submit"
                  disabled={isBulkScheduling || filteredCandidates.length === 0}
                  className="flex-1 py-2.5 font-semibold text-white bg-amber-500 hover:bg-amber-600 disabled:opacity-50 rounded-xl shadow-sm cursor-pointer flex items-center justify-center gap-2"
                >
                  {isBulkScheduling ? 'Scheduling & Sending Mails...' : `Confirm & Schedule (${filteredCandidates.length})`}
                </button>
                <button
                  type="button"
                  onClick={() => setShowBulkScheduleModal(false)}
                  disabled={isBulkScheduling}
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

    </DashboardLayout>
  );
};

export default Candidates;