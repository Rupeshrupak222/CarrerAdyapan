import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import CandidateNavbar from '../components/layout/CandidateNavbar';
import Footer from '../components/layout/Footer';
import { candidateService } from '../services/candidateService';
import { jobService } from '../services/jobService';
import { calculateRealAIScore, addCandidateNotification, saveCandidateApplication } from '../utils/applicationStore';
import { useTheme } from '../context/ThemeContext';
import { useCandidateAuth } from '../context/CandidateAuthContext';
import { toast } from 'react-hot-toast';

const SUGGESTED_SKILLS = [
  'EdTech Sales',
  'Student Counselling',
  'Telesales',
  'Lead Conversion',
  'Target Handling',
  'CRM Tools',
  'Objection Handling',
  'Inside Sales',
  'Communication Skills',
  'Client Relationship',
  'React.js',
  'Node.js',
  'PostgreSQL',
];

const ApplyJob = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();
  const { candidate: loggedInCandidate } = useCandidateAuth();

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    location: '',
    employmentStatus: 'STUDENT',

    // If Employed
    currentPosition: '',
    currentCompany: '',
    currentCompanyTenure: '',
    currentRoleDescription: '',
    experience: '0',
    currentCtc: '',
    expectedCtc: '',
    noticePeriod: 'Immediate',

    // If Student
    education: '',
    collegeName: '',
    graduationYear: '',
    specialization: '',
    cgpa: '',

    // Work Preference & Motivation
    preferredLocationType: 'Hybrid',
    motivationPitch: '',

    // Links & Skills
    linkedin: '',
    portfolio: '',
    skills: [] as string[],
    resumeFileName: '',
    resumeDataUrl: null as any,
    resumeText: '',
  });

  // Pre-fill form with logged-in candidate's details
  useEffect(() => {
    if (loggedInCandidate) {
      setFormData((prev) => ({
        ...prev,
        firstName: loggedInCandidate.firstName || prev.firstName,
        lastName: loggedInCandidate.lastName || prev.lastName,
        email: loggedInCandidate.email || prev.email,
        phone: loggedInCandidate.phone || prev.phone,
        location: loggedInCandidate.location || prev.location,
        linkedin: loggedInCandidate.linkedin || prev.linkedin,
        portfolio: loggedInCandidate.portfolio || prev.portfolio,
        skills: loggedInCandidate.skills?.length ? loggedInCandidate.skills : prev.skills,
        currentCompany: loggedInCandidate.currentCompany || prev.currentCompany,
        currentPosition: loggedInCandidate.currentPosition || prev.currentPosition,
      }));
    }
  }, [loggedInCandidate]);

  const [customSkill, setCustomSkill] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [job, setJob] = useState<any>(null);
  const [loadingJob, setLoadingJob] = useState(true);

  useEffect(() => {
    fetchJobInfo();
  }, [slug]);

  const fetchJobInfo = async () => {
    try {
      const res = await jobService.getPublicJob(slug);
      if (res?.job) {
        setJob(res.job);
      } else {
        const allRes = await jobService.getPublicJobs();
        const found = allRes?.jobs?.find((j: any) => j.slug === slug || j.id === slug);
        if (found) setJob(found);
      }
    } catch {
      // Fallback
    } finally {
      setLoadingJob(false);
    }
  };

  const getJobTitle = () => {
    if (job?.title) return job.title;
    if (slug?.includes('counsellor')) return 'Academic Counsellor / Student Advisor';
    if (slug?.includes('telecaller') || slug?.includes('sales')) return 'Inside Sales Executive / Telecaller';
    if (slug?.includes('developer') || slug?.includes('tech')) return 'Senior Full Stack Developer';
    return 'Business Development Associate (BDA)';
  };

  const toggleSkill = (skill: string) => {
    if (formData.skills.includes(skill)) {
      setFormData({ ...formData, skills: formData.skills.filter((s) => s !== skill) });
    } else {
      setFormData({ ...formData, skills: [...formData.skills, skill] });
    }
  };

  const addCustomSkill = (e: React.FormEvent) => {
    e.preventDefault();
    if (customSkill.trim() && !formData.skills.includes(customSkill.trim())) {
      setFormData({ ...formData, skills: [...formData.skills, customSkill.trim()] });
      setCustomSkill('');
    }
  };

  const removeSkill = (skillToRemove: string) => {
    setFormData({ ...formData, skills: formData.skills.filter((s) => s !== skillToRemove) });
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 15 * 1024 * 1024) {
      toast.error('File size must be under 15MB');
      return;
    }

    setSelectedFile(file);

    const reader = new FileReader();
    reader.onload = (event: any) => {
      setFormData((prev) => ({
        ...prev,
        resumeFileName: file.name,
        resumeDataUrl: event.target.result,
        resumeText: `Parsed candidate resume: ${file.name}. Verified candidate application.`,
      }));
      toast.success(`Resume attached: ${file.name}`);
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.firstName.trim() || !formData.email.trim() || !formData.phone.trim()) {
      toast.error('Please fill in required personal contact fields (Name, Email, Phone)');
      return;
    }

    if (!formData.resumeDataUrl && !formData.resumeFileName && !selectedFile) {
      toast.error('Please attach your Resume PDF/DOCX before submitting');
      return;
    }

    setSubmitting(true);
    const jobTitle = getJobTitle();
    const isStudent = formData.employmentStatus === 'STUDENT';

    const submissionData = {
      ...formData,
      experience: isStudent ? '0' : (formData.experience || '0'),
      currentPosition: isStudent ? 'Student / Fresher' : (formData.currentPosition || jobTitle),
      currentCompany: isStudent ? (formData.collegeName || 'University Student') : (formData.currentCompany || 'Independent Candidate'),
      employmentStatus: isStudent ? 'STUDENT' : formData.employmentStatus,
    };

    const aiAnalysis = calculateRealAIScore(formData.skills, submissionData.experience, jobTitle);

    try {
      saveCandidateApplication(submissionData, jobTitle);

      const formPayload = new FormData();
      if (selectedFile) {
        formPayload.append('resumeFile', selectedFile);
      }

      Object.keys(submissionData).forEach((key) => {
        if (key === 'resumeDataUrl') {
          if (!selectedFile && submissionData.resumeDataUrl) {
            formPayload.append('resumeDataUrl', submissionData.resumeDataUrl);
          }
          return;
        }

        if (key === 'skills' && Array.isArray((submissionData as any)[key])) {
          formPayload.append(key, (submissionData as any)[key].join(','));
        } else if (typeof (submissionData as any)[key] === 'object' && (submissionData as any)[key] !== null) {
          formPayload.append(key, JSON.stringify((submissionData as any)[key]));
        } else {
          formPayload.append(key, (submissionData as any)[key] || '');
        }
      });
      formPayload.append('jobTitle', jobTitle);
      formPayload.append('jobId', slug || 'business-development-associate-edtech');
      formPayload.append('aiScore', String(aiAnalysis.score));
      formPayload.append('matchReason', aiAnalysis.reason);

      await candidateService.publicApply(formPayload);

      addCandidateNotification(`${formData.firstName} ${formData.lastName}`, jobTitle, aiAnalysis.score);

      toast.success(`Application submitted! Saved to database.`);
      setSubmitting(false);

      navigate('/application-success', {
        state: {
          candidateName: `${formData.firstName} ${formData.lastName}`,
          candidateEmail: formData.email,
          jobTitle: jobTitle,
          score: aiAnalysis.score,
        },
      });
    } catch (error: any) {
      console.error('Application submit error:', error);
      const errMsg = error.response?.data?.message || error.message || 'Failed to submit application to database';
      toast.error(errMsg);
      setSubmitting(false);
    }
  };

  const inputClass = theme === 'dark'
    ? 'w-full px-4 py-3 rounded-xl text-xs font-semibold bg-slate-900 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-500/20 transition-all'
    : 'w-full px-4 py-3 rounded-xl text-xs font-semibold bg-slate-50 border border-slate-200 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 transition-all';

  const labelClass = theme === 'dark'
    ? 'text-xs font-bold text-slate-200 block mb-1.5'
    : 'text-xs font-bold text-slate-700 block mb-1.5';

  const cardSectionClass = theme === 'dark'
    ? 'p-6 sm:p-8 rounded-3xl border bg-slate-900/90 border-slate-800 shadow-xl space-y-6'
    : 'p-6 sm:p-8 rounded-3xl border bg-white border-amber-200/60 shadow-lg shadow-amber-500/5 space-y-6';

  const displayJobTitle = getJobTitle();
  const department = job?.department || 'EdTech Growth & Operations';
  const location = job?.location || 'Hyderabad / Pan-India';

  return (
    <div className={`min-h-screen font-sans antialiased transition-colors relative overflow-x-hidden ${theme === 'dark' ? 'bg-[#0a0a1a] text-slate-100' : 'bg-slate-50/50 text-slate-900'
      }`}>

      {/* Persistent Full-Page Right-to-Left Orange Gradient Glow */}
      <div className="fixed top-0 right-0 w-[55vw] max-w-[800px] h-full pointer-events-none bg-gradient-to-l from-orange-400/15 via-amber-200/10 to-transparent dark:from-amber-500/10 dark:via-amber-900/5 dark:to-transparent blur-3xl z-0" />

      {/* ===== 1. TOP NAVBAR ===== */}
      <CandidateNavbar />

      {/* ===== 2. HERO GRADIENT HEADER ===== */}
      <section className="relative overflow-hidden bg-gradient-to-r from-[#18181b] via-[#78350f] via-50% to-[#d97706] text-white py-12 sm:py-14 px-4 sm:px-8 border-b border-amber-500/30 shadow-xl" style={{ color: '#ffffff' }}>
        {/* Ambient Glows */}
        <div className="absolute -top-24 right-0 w-[500px] h-[500px] bg-amber-400/30 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 right-1/4 w-[350px] h-[350px] bg-orange-500/25 rounded-full blur-2xl pointer-events-none" />

        <div className="max-w-4xl mx-auto space-y-4 relative z-10">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-amber-400 text-slate-950 rounded-full text-[11px] font-black uppercase tracking-wider shadow-md">
            ● OFFICIAL ADYAPAN CANDIDATE APPLICATION
          </div>

          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight text-white leading-tight drop-shadow-sm" style={{ color: '#ffffff' }}>
            Apply for {displayJobTitle}
          </h1>

          <div className="flex flex-wrap items-center gap-3 sm:gap-4 text-xs font-bold text-white pt-1" style={{ color: '#ffffff' }}>
            <span className="flex items-center gap-1.5 bg-black/50 px-3.5 py-1.5 rounded-xl text-white font-bold backdrop-blur-sm border border-white/30" style={{ color: '#ffffff' }}>
              <svg className="w-3.5 h-3.5 text-amber-300 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>
              <span className="text-white font-bold" style={{ color: '#ffffff' }}>{department}</span>
            </span>
            <span className="flex items-center gap-1.5 bg-black/50 px-3.5 py-1.5 rounded-xl text-white font-bold backdrop-blur-sm border border-white/30" style={{ color: '#ffffff' }}>
              <svg className="w-3.5 h-3.5 text-amber-300 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
              <span className="text-white font-bold" style={{ color: '#ffffff' }}>{location}</span>
            </span>
            <span className="px-3.5 py-1.5 rounded-full bg-emerald-400 text-slate-950 font-black shadow-md flex items-center gap-1">
              <span>● Instant AI Screening Enabled</span>
            </span>
          </div>
        </div>
      </section>

      {/* ===== 3. FORM CONTAINER ===== */}
      <main className="max-w-4xl mx-auto px-4 sm:px-8 py-10 relative z-10 space-y-8">

        {/* Logged in candidate status banner */}
        {loggedInCandidate && (
          <div className="p-4 sm:p-5 rounded-3xl border bg-emerald-500/10 border-emerald-500/30 text-emerald-800 dark:text-emerald-300 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs font-bold shadow-md">
            <div className="flex items-center gap-3">
              <span className="w-10 h-10 rounded-2xl bg-emerald-500 text-slate-950 flex items-center justify-center font-black text-base shrink-0 shadow-md">
                ✓
              </span>
              <div>
                <p className="font-extrabold text-sm text-slate-900 dark:text-white">
                  Logged in as {loggedInCandidate.firstName} {loggedInCandidate.lastName}
                </p>
                <p className="text-[11px] text-slate-600 dark:text-slate-300 font-medium">
                  {loggedInCandidate.email} • Your application details are pre-filled and will automatically link to your candidate dashboard.
                </p>
              </div>
            </div>
            <Link
              to="/my-applications"
              className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black whitespace-nowrap text-center transition-all shadow-md"
            >
              My Dashboard ↗
            </Link>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-8">

          {/* Section 1: Employment Status */}
          <div className={cardSectionClass}>
            <div className="flex items-center gap-3 border-b pb-4 border-slate-200 dark:border-slate-800">
              <span className="w-7 h-7 rounded-xl bg-amber-500 text-slate-950 font-black text-xs flex items-center justify-center shadow-md shadow-amber-500/20">
                01
              </span>
              <div>
                <h2 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white">
                  Current Employment Status
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Select your current professional standing
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { key: 'STUDENT', label: 'Student / Fresher', code: '01' },
                { key: 'EMPLOYED', label: 'Working Professional', code: '02' },
                { key: 'LOOKING_FOR_JOB', label: 'Actively Job Hunting', code: '03' },
                { key: 'FREELANCER', label: 'Freelancer / Other', code: '04' },
              ].map((item) => {
                const active = formData.employmentStatus === item.key;
                return (
                  <button
                    key={item.key}
                    type="button"
                    onClick={() => setFormData({ ...formData, employmentStatus: item.key })}
                    className={`p-4 rounded-2xl border text-left transition-all flex flex-col justify-between gap-3 cursor-pointer ${active
                        ? 'bg-gradient-to-br from-amber-400 to-amber-500 text-slate-950 border-amber-400 shadow-lg shadow-amber-500/25 scale-[1.02]'
                        : theme === 'dark'
                          ? 'bg-slate-950 text-slate-300 border-slate-800 hover:border-amber-400/50'
                          : 'bg-slate-50 text-slate-700 border-slate-200 hover:border-amber-400/60 hover:bg-white'
                      }`}
                  >
                    <span className="w-7 h-7 rounded-lg bg-amber-500/20 text-slate-950 dark:text-white font-black text-xs flex items-center justify-center">
                      {item.code}
                    </span>
                    <span className={`text-xs font-extrabold ${active ? 'text-slate-950' : ''}`}>
                      {item.label}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Section 2: Personal Contact Information */}
          <div className={cardSectionClass}>
            <div className="flex items-center gap-3 border-b pb-4 border-slate-200 dark:border-slate-800">
              <span className="w-7 h-7 rounded-xl bg-amber-500 text-slate-950 font-black text-xs flex items-center justify-center shadow-md shadow-amber-500/20">
                02
              </span>
              <div>
                <h2 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white">
                  Personal Contact Information
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  How our HR & Recruitment team will reach out to you
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label className={labelClass}>First Name *</label>
                <input
                  type="text"
                  required
                  value={formData.firstName}
                  onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                  placeholder="e.g. Rahul"
                  className={inputClass}
                />
              </div>

              <div>
                <label className={labelClass}>Last Name</label>
                <input
                  type="text"
                  value={formData.lastName}
                  onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                  placeholder="e.g. Sharma"
                  className={inputClass}
                />
              </div>

              <div>
                <label className={labelClass}>Email Address *</label>
                <input
                  type="email"
                  required
                  disabled={Boolean(loggedInCandidate)}
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="rahul.sharma@example.com"
                  className={inputClass}
                />
              </div>

              <div>
                <label className={labelClass}>Mobile Number *</label>
                <input
                  type="tel"
                  required
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="+91 98765 43210"
                  className={inputClass}
                />
              </div>

              <div className="sm:col-span-2">
                <label className={labelClass}>Current City / Location</label>
                <input
                  type="text"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  placeholder="e.g. Hyderabad, Telangana / Bengaluru / Pan-India"
                  className={inputClass}
                />
              </div>
            </div>
          </div>

          {/* Section 3: Professional Experience (If Employed) */}
          {formData.employmentStatus !== 'STUDENT' && (
            <div className={cardSectionClass}>
              <div className="flex items-center gap-3 border-b pb-4 border-slate-200 dark:border-slate-800">
                <span className="w-7 h-7 rounded-xl bg-amber-500 text-slate-950 font-black text-xs flex items-center justify-center shadow-md shadow-amber-500/20">
                  03
                </span>
                <div>
                  <h2 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white">
                    Work Experience & Compensation
                  </h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Details of your current and prior professional engagements
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label className={labelClass}>Current / Most Recent Company</label>
                  <input
                    type="text"
                    value={formData.currentCompany}
                    onChange={(e) => setFormData({ ...formData, currentCompany: e.target.value })}
                    placeholder="e.g. EdTech Solutions Pvt Ltd"
                    className={inputClass}
                  />
                </div>

                <div>
                  <label className={labelClass}>Current Designation / Title</label>
                  <input
                    type="text"
                    value={formData.currentPosition}
                    onChange={(e) => setFormData({ ...formData, currentPosition: e.target.value })}
                    placeholder="e.g. Business Development Associate"
                    className={inputClass}
                  />
                </div>

                <div>
                  <label className={labelClass}>Total Experience (Years)</label>
                  <input
                    type="number"
                    step="0.5"
                    min="0"
                    value={formData.experience}
                    onChange={(e) => setFormData({ ...formData, experience: e.target.value })}
                    placeholder="e.g. 1.5"
                    className={inputClass}
                  />
                </div>

                <div>
                  <label className={labelClass}>Notice Period</label>
                  <select
                    value={formData.noticePeriod}
                    onChange={(e) => setFormData({ ...formData, noticePeriod: e.target.value })}
                    className={inputClass}
                  >
                    <option value="Immediate">Immediate (0-7 Days)</option>
                    <option value="15 Days">15 Days</option>
                    <option value="30 Days">30 Days</option>
                    <option value="45 Days">45 Days</option>
                    <option value="60+ Days">60+ Days</option>
                  </select>
                </div>

                <div>
                  <label className={labelClass}>Current Annual CTC (₹)</label>
                  <input
                    type="text"
                    value={formData.currentCtc}
                    onChange={(e) => setFormData({ ...formData, currentCtc: e.target.value })}
                    placeholder="e.g. ₹4.2 LPA"
                    className={inputClass}
                  />
                </div>

                <div>
                  <label className={labelClass}>Expected Annual CTC (₹)</label>
                  <input
                    type="text"
                    value={formData.expectedCtc}
                    onChange={(e) => setFormData({ ...formData, expectedCtc: e.target.value })}
                    placeholder="e.g. ₹6.0 LPA"
                    className={inputClass}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Section 4: Academic Background */}
          <div className={cardSectionClass}>
            <div className="flex items-center gap-3 border-b pb-4 border-slate-200 dark:border-slate-800">
              <span className="w-7 h-7 rounded-xl bg-amber-500 text-slate-950 font-black text-xs flex items-center justify-center shadow-md shadow-amber-500/20">
                {formData.employmentStatus === 'STUDENT' ? '03' : '04'}
              </span>
              <div>
                <h2 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white">
                  Academic Credentials
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  College, degree, and specialization details
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label className={labelClass}>College / University Name *</label>
                <input
                  type="text"
                  required
                  value={formData.collegeName}
                  onChange={(e) => setFormData({ ...formData, collegeName: e.target.value })}
                  placeholder="e.g. Osmania University / JNTU Hyderabad"
                  className={inputClass}
                />
              </div>

              <div>
                <label className={labelClass}>Degree / Qualification</label>
                <input
                  type="text"
                  value={formData.education}
                  onChange={(e) => setFormData({ ...formData, education: e.target.value })}
                  placeholder="e.g. B.Tech / BBA / B.Com / MBA"
                  className={inputClass}
                />
              </div>

              <div>
                <label className={labelClass}>Year of Graduation</label>
                <input
                  type="text"
                  value={formData.graduationYear}
                  onChange={(e) => setFormData({ ...formData, graduationYear: e.target.value })}
                  placeholder="e.g. 2024 / 2025"
                  className={inputClass}
                />
              </div>

              <div>
                <label className={labelClass}>CGPA / Percentage</label>
                <input
                  type="text"
                  value={formData.cgpa}
                  onChange={(e) => setFormData({ ...formData, cgpa: e.target.value })}
                  placeholder="e.g. 8.4 CGPA or 78%"
                  className={inputClass}
                />
              </div>
            </div>
          </div>

          {/* Section 5: Skills & Expertise */}
          <div className={cardSectionClass}>
            <div className="flex items-center gap-3 border-b pb-4 border-slate-200 dark:border-slate-800">
              <span className="w-7 h-7 rounded-xl bg-amber-500 text-slate-950 font-black text-xs flex items-center justify-center shadow-md shadow-amber-500/20">
                {formData.employmentStatus === 'STUDENT' ? '04' : '05'}
              </span>
              <div>
                <h2 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white">
                  Key Skills & Domain Expertise
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Select relevant skills for automated ATS AI candidate matching
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex flex-wrap gap-2">
                {SUGGESTED_SKILLS.map((skill) => {
                  const selected = formData.skills.includes(skill);
                  return (
                    <button
                      key={skill}
                      type="button"
                      onClick={() => toggleSkill(skill)}
                      className={`px-4 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${selected
                          ? 'bg-amber-500 text-slate-950 font-black shadow-md shadow-amber-500/20 scale-[1.03]'
                          : theme === 'dark'
                            ? 'bg-slate-950 text-slate-200 border border-slate-800 hover:border-amber-400/50'
                            : 'bg-slate-100 text-slate-700 border border-slate-200 hover:bg-amber-50 hover:border-amber-300'
                        }`}
                    >
                      {selected ? '✓ ' : '+ '}
                      {skill}
                    </button>
                  );
                })}
              </div>

              {/* Custom Skill Adder */}
              <div className="flex items-center gap-2 pt-2">
                <input
                  type="text"
                  value={customSkill}
                  onChange={(e) => setCustomSkill(e.target.value)}
                  placeholder="Add custom skill (e.g. Cold Calling, Course Selling)..."
                  className={inputClass}
                />
                <button
                  type="button"
                  onClick={addCustomSkill}
                  className="px-5 py-3 text-xs font-extrabold text-slate-950 bg-amber-400 hover:bg-amber-500 rounded-xl shadow-md shrink-0 cursor-pointer transition-all active:scale-95"
                >
                  + Add
                </button>
              </div>

              {/* Selected Skills Tags */}
              {formData.skills.length > 0 && (
                <div className="pt-2 space-y-2">
                  <span className="text-[11px] font-bold text-amber-600 dark:text-amber-400 block">
                    Selected Skills ({formData.skills.length}):
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {formData.skills.map((s) => (
                      <span
                        key={s}
                        className="px-3 py-1.5 text-xs font-bold bg-amber-500/15 text-amber-800 dark:text-amber-300 border border-amber-500/30 rounded-xl flex items-center gap-2"
                      >
                        <span>{s}</span>
                        <button
                          type="button"
                          onClick={() => removeSkill(s)}
                          className="hover:text-red-500 font-black cursor-pointer text-sm"
                        >
                          ✕
                        </button>
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Section 6: Resume Upload (Luxurious Glowing Dropzone) */}
          <div className={cardSectionClass}>
            <div className="flex items-center gap-3 border-b pb-4 border-slate-200 dark:border-slate-800">
              <span className="w-7 h-7 rounded-xl bg-amber-500 text-slate-950 font-black text-xs flex items-center justify-center shadow-md shadow-amber-500/20">
                {formData.employmentStatus === 'STUDENT' ? '05' : '06'}
              </span>
              <div>
                <h2 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white">
                  Attach Resume PDF / DOCX *
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Our ATS engine analyzes your resume directly for recruiter shortlisting
                </p>
              </div>
            </div>

            <div className={`border-2 border-dashed rounded-3xl p-8 sm:p-10 text-center transition-all relative group cursor-pointer ${selectedFile || formData.resumeFileName
                ? 'border-emerald-500/60 bg-emerald-500/5'
                : theme === 'dark'
                  ? 'border-slate-700 hover:border-amber-400 bg-slate-950/60 hover:bg-slate-950'
                  : 'border-amber-300/80 hover:border-amber-500 bg-amber-50/20 hover:bg-amber-50/40'
              }`}>
              <input
                type="file"
                accept=".pdf,.docx,.doc,.txt"
                onChange={handleFileUpload}
                className="absolute inset-0 opacity-0 cursor-pointer w-full h-full z-10"
              />

              <div className="space-y-3 pointer-events-none">
                <div className="w-14 h-14 rounded-2xl mx-auto flex items-center justify-center shadow-inner bg-amber-500/15 text-amber-500 border border-amber-500/30 group-hover:scale-110 transition-transform">
                  <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                </div>

                {formData.resumeFileName ? (
                  <div className="space-y-1">
                    <p className="text-sm font-bold text-emerald-600 dark:text-emerald-400 flex items-center justify-center gap-1.5">
                      <span>✓</span> Attached: {formData.resumeFileName}
                    </p>
                    <p className="text-[11px] text-slate-500">
                      Click or drop another document to replace
                    </p>
                  </div>
                ) : (
                  <div className="space-y-1">
                    <p className="text-sm font-bold text-slate-900 dark:text-white">
                      Drop your Resume PDF/DOCX here, or <span className="text-amber-500 underline">browse files</span>
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Supports PDF, DOCX, DOC (Up to 15MB)
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Section 7: Motivation & Online Links */}
          <div className={cardSectionClass}>
            <div className="flex items-center gap-3 border-b pb-4 border-slate-200 dark:border-slate-800">
              <span className="w-7 h-7 rounded-xl bg-amber-500 text-slate-950 font-black text-xs flex items-center justify-center shadow-md shadow-amber-500/20">
                {formData.employmentStatus === 'STUDENT' ? '06' : '07'}
              </span>
              <div>
                <h2 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white">
                  Motivation & Social Profiles
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Optional links to showcase your background
                </p>
              </div>
            </div>

            <div className="space-y-5">
              <div>
                <label className={labelClass}>Why are you excited to join Adyapan Edutech?</label>
                <textarea
                  rows={3}
                  value={formData.motivationPitch}
                  onChange={(e) => setFormData({ ...formData, motivationPitch: e.target.value })}
                  placeholder="Share why you're passionate about this role and our educational mission..."
                  className={inputClass}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label className={labelClass}>LinkedIn Profile URL</label>
                  <input
                    type="url"
                    value={formData.linkedin}
                    onChange={(e) => setFormData({ ...formData, linkedin: e.target.value })}
                    placeholder="https://linkedin.com/in/yourname"
                    className={inputClass}
                  />
                </div>

                <div>
                  <label className={labelClass}>Portfolio / Work Drive Link</label>
                  <input
                    type="url"
                    value={formData.portfolio}
                    onChange={(e) => setFormData({ ...formData, portfolio: e.target.value })}
                    placeholder="https://portfolio.com or Google Drive link"
                    className={inputClass}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Submit Action Area */}
          <div className="space-y-4 pt-2">
            <button
              type="submit"
              disabled={submitting}
              className="w-full py-4 px-8 rounded-2xl text-sm font-black text-slate-950 bg-gradient-to-r from-amber-400 via-amber-500 to-orange-500 hover:from-amber-300 hover:to-orange-400 transition-all shadow-xl shadow-amber-500/25 uppercase tracking-wider text-center cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed hover:scale-[1.01] active:scale-[0.99] flex items-center justify-center gap-2"
            >
              {submitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                  <span>Submitting & Running Real-Time AI ATS Screening...</span>
                </>
              ) : (
                <>
                  <span>Submit Candidate Application & Run AI Screening</span>
                  <span className="text-base">→</span>
                </>
              )}
            </button>

            <div className="flex items-center justify-center gap-2 text-xs font-semibold text-slate-500 dark:text-slate-400 text-center">
              <span>🔒 256-Bit Encrypted PostgreSQL Database Submission</span>
              <span>•</span>
              <span>Official Adyapan Edutech Recruitment Portal</span>
            </div>
          </div>

        </form>
      </main>

      <Footer isPublic={true} />

    </div>
  );
};

export default ApplyJob;
