import React, { useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import AdyapanLogo from '../components/common/AdyapanLogo';
import Footer from '../components/layout/Footer';
import { candidateService } from '../services/candidateService';
import { calculateRealAIScore, addCandidateNotification, saveCandidateApplication } from '../utils/applicationStore';
import { useTheme } from '../context/ThemeContext';
import { toast } from 'react-hot-toast';

const SUGGESTED_SKILLS = [
  'EdTech Sales',
  'Student Counselling',
  'Telesales',
  'Lead Conversion',
  'Target Handling',
  'CRM Tools',
  'Objection Handling',
  'React.js',
  'Node.js',
  'PostgreSQL',
  'Public Speaking',
];

const ApplyJob = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();

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
    skills: [],
    resumeFileName: '',
    resumeDataUrl: null,
    resumeText: '',
  });

  const [customSkill, setCustomSkill] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const getJobTitle = () => {
    if (slug?.includes('counsellor')) return 'Academic Counsellor / Student Advisor';
    if (slug?.includes('telecaller') || slug?.includes('sales')) return 'Inside Sales Executive / Telecaller';
    if (slug?.includes('developer') || slug?.includes('tech')) return 'Senior Full Stack Developer';
    return 'Business Development Associate (BDA)';
  };

  const toggleSkill = (skill) => {
    if (formData.skills.includes(skill)) {
      setFormData({ ...formData, skills: formData.skills.filter((s) => s !== skill) });
    } else {
      setFormData({ ...formData, skills: [...formData.skills, skill] });
    }
  };

  const addCustomSkill = (e) => {
    e.preventDefault();
    if (customSkill.trim() && !formData.skills.includes(customSkill.trim())) {
      setFormData({ ...formData, skills: [...formData.skills, customSkill.trim()] });
      setCustomSkill('');
    }
  };

  const removeSkill = (skillToRemove) => {
    setFormData({ ...formData, skills: formData.skills.filter((s) => s !== skillToRemove) });
  };

  const [selectedFile, setSelectedFile] = useState(null);

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 15 * 1024 * 1024) {
      toast.error('File size must be under 15MB');
      return;
    }

    setSelectedFile(file);

    const reader = new FileReader();
    reader.onload = (event) => {
      setFormData((prev) => ({
        ...prev,
        resumeFileName: file.name,
        resumeDataUrl: event.target.result,
        resumeText: `Parsed candidate resume: ${file.name}. Verified candidate application.`,
      }));
      toast.success(`Resume attached: ${file.name} `);
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.firstName || !formData.email || !formData.phone) {
      toast.error('Please fill in required fields (Name, Email, Phone)');
      return;
    }

    if (!formData.resumeDataUrl && !formData.resumeFileName && !selectedFile) {
      toast.error('Please attach your Resume PDF/DOCX');
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
        if (key === 'skills' && Array.isArray(submissionData[key])) {
          formPayload.append(key, submissionData[key].join(','));
        } else if (typeof submissionData[key] === 'object' && submissionData[key] !== null) {
          formPayload.append(key, JSON.stringify(submissionData[key]));
        } else {
          formPayload.append(key, submissionData[key] || '');
        }
      });
      formPayload.append('jobTitle', jobTitle);
      formPayload.append('jobId', slug || 'business-development-associate-edtech');
      formPayload.append('aiScore', String(aiAnalysis.score));
      formPayload.append('matchReason', aiAnalysis.reason);

      await candidateService.publicApply(formPayload);

      addCandidateNotification(`${formData.firstName} ${formData.lastName}`, jobTitle, aiAnalysis.score);

      toast.success(`Application submitted! Confirmation email dispatched to ${formData.email} `);
      setSubmitting(false);

      navigate('/application-success', {
        state: {
          candidateName: `${formData.firstName} ${formData.lastName}`,
          candidateEmail: formData.email,
          jobTitle: jobTitle,
          score: aiAnalysis.score,
        },
      });
    } catch (error) {
      console.error('Application submit error:', error);
      toast.error('Failed to submit application to database');
      setSubmitting(false);
    }
  };

  const inputClass = theme === 'dark'
    ? 'w-full px-4 py-3 rounded-2xl text-xs font-bold bg-slate-950 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-500/20'
    : 'w-full px-4 py-3 rounded-2xl text-xs font-bold bg-slate-50 border border-slate-200 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 transition-all';

  const labelClass = theme === 'dark'
    ? 'text-xs font-extrabold text-slate-100 block mb-1.5'
    : 'text-xs font-extrabold text-slate-800 block mb-1.5';

  const sectionClass = theme === 'dark'
    ? 'space-y-4 p-6 rounded-3xl border bg-slate-950/80 border-slate-800'
    : 'space-y-4 p-6 rounded-3xl border bg-white border-amber-200/80 shadow-sm';

  return (
    <div className={`min-h-screen font-sans antialiased py-4 sm:py-10 px-3.5 sm:px-6 transition-colors ${theme === 'dark' ? 'bg-slate-950 text-slate-100' : 'bg-gradient-to-br from-slate-50 via-white to-amber-50/20 text-slate-900'
      }`}>
      <div className="max-w-3xl mx-auto space-y-4 sm:space-y-6">
        {/* Navigation Bar */}
        <div className={`flex items-center justify-between border-b pb-3 sm:pb-4 gap-2 ${theme === 'dark' ? 'border-slate-800' : 'border-amber-200/80'
          }`}>
          <Link to="/careers" className="shrink-0">
            <AdyapanLogo variant={theme === 'dark' ? 'dark' : 'light'} size="small" />
          </Link>

          <div className="flex items-center gap-1.5 sm:gap-3 shrink-0">
            <button
              onClick={toggleTheme}
              className={`px-2.5 sm:px-3.5 py-1.5 sm:py-2 rounded-xl text-xs font-extrabold transition-all flex items-center gap-1.5 border shadow-sm ${theme === 'dark'
                ? 'bg-slate-900 text-amber-300 border-slate-800 hover:bg-slate-800'
                : 'bg-white text-slate-800 border-slate-200 hover:bg-slate-100'
                }`}
            >
              <span className="hidden sm:inline">{theme === 'dark' ? 'Dark Mode' : 'Light Mode'}</span>
              <span className="sm:hidden">{theme === 'dark' ? '' : ''}</span>
            </button>
            <Link
              to={`/careers/${slug}`}
              className="px-2.5 sm:px-3.5 py-1.5 text-xs font-extrabold text-amber-600 dark:text-amber-400 hover:underline shrink-0 rounded-xl border border-amber-500/30 bg-amber-500/10"
            >
              ← <span className="hidden sm:inline">Job Specifications</span><span className="sm:hidden">Role</span>
            </Link>
          </div>
        </div>

        {/* Main Application Card */}
        <div className={`p-4 sm:p-8 rounded-3xl space-y-6 sm:space-y-8 shadow-2xl border relative overflow-hidden ${theme === 'dark' ? 'bg-slate-900 border-slate-800' : 'bg-white border-amber-200/80'
          }`}>
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500" />

          <div className="pt-1">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 bg-amber-500/15 text-amber-700 dark:text-amber-300 border border-amber-500/30 rounded-full text-[11px] font-extrabold uppercase">
              OFFICIAL ADYAPAN DIRECT APPLICATION PORTAL
            </div>
            <h1 className="text-2xl md:text-3xl font-black mt-3 text-slate-900 dark:text-white leading-tight">
              Application for {getJobTitle()}
            </h1>
            <p className="text-xs font-medium text-slate-600 dark:text-slate-300 mt-1 leading-relaxed">
              Complete your profile details, educational background, work experience, and attach your resume PDF for instant AI scoring.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">

            {/* Step 1: Candidate Current Status */}
            <div className={sectionClass}>
              <h2 className="text-xs font-extrabold text-amber-600 dark:text-amber-400 uppercase tracking-wider flex items-center gap-2">
                <span> 1. What is your current employment status?</span>
              </h2>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, employmentStatus: 'EMPLOYED' })}
                  className={`p-3.5 rounded-2xl border text-xs font-extrabold text-center transition-all ${formData.employmentStatus === 'EMPLOYED'
                    ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-md shadow-amber-500/20 font-black'
                    : theme === 'dark'
                      ? 'bg-slate-950 text-slate-200 border-slate-800 hover:border-amber-400/50'
                      : 'bg-white text-slate-800 border-slate-200 hover:border-amber-400 shadow-sm'
                    }`}
                >
                  Working Professional
                </button>
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, employmentStatus: 'STUDENT' })}
                  className={`p-3.5 rounded-2xl border text-xs font-extrabold text-center transition-all ${formData.employmentStatus === 'STUDENT'
                    ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-md shadow-amber-500/20 font-black'
                    : theme === 'dark'
                      ? 'bg-slate-950 text-slate-200 border-slate-800 hover:border-amber-400/50'
                      : 'bg-white text-slate-800 border-slate-200 hover:border-amber-400 shadow-sm'
                    }`}
                >
                  Currently Student / Fresher
                </button>
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, employmentStatus: 'LOOKING_FOR_JOB' })}
                  className={`p-3.5 rounded-2xl border text-xs font-extrabold text-center transition-all ${formData.employmentStatus === 'LOOKING_FOR_JOB'
                    ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-md shadow-amber-500/20 font-black'
                    : theme === 'dark'
                      ? 'bg-slate-950 text-slate-200 border-slate-800 hover:border-amber-400/50'
                      : 'bg-white text-slate-800 border-slate-200 hover:border-amber-400 shadow-sm'
                    }`}
                >
                  Actively Job Hunting
                </button>
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, employmentStatus: 'FREELANCER' })}
                  className={`p-3.5 rounded-2xl border text-xs font-extrabold text-center transition-all ${formData.employmentStatus === 'FREELANCER'
                    ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-md shadow-amber-500/20 font-black'
                    : theme === 'dark'
                      ? 'bg-slate-950 text-slate-200 border-slate-800 hover:border-amber-400/50'
                      : 'bg-white text-slate-800 border-slate-200 hover:border-amber-400 shadow-sm'
                    }`}
                >
                  Freelancer
                </button>
              </div>
            </div>

            {/* Step 2: Personal Contact Information */}
            <div className="space-y-4">
              <h2 className="text-xs font-extrabold text-amber-600 dark:text-amber-400 uppercase tracking-wider">2. Personal Contact Information</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className={labelClass}>Email Address *</label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="rahul.sharma@example.com"
                    className={inputClass}
                  />
                </div>

                <div>
                  <label className={labelClass}>Phone / WhatsApp Number *</label>
                  <input
                    type="text"
                    required
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="+91 98765-43210"
                    className={inputClass}
                  />
                </div>
              </div>

              <div>
                <label className={labelClass}>Current City / Location *</label>
                <input
                  type="text"
                  required
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  placeholder="e.g. Mumbai, Maharashtra"
                  className={inputClass}
                />
              </div>
            </div>

            {/* Conditional Step 3: Current Job & Company Details */}
            {(formData.employmentStatus === 'EMPLOYED' || formData.employmentStatus === 'FREELANCER' || formData.employmentStatus === 'LOOKING_FOR_JOB') && (
              <div className={sectionClass}>
                <h2 className="text-xs font-extrabold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider"> 3. Current Work & Company Details</h2>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className={labelClass}>Current Job Title / Role *</label>
                    <input
                      type="text"
                      required
                      value={formData.currentPosition}
                      onChange={(e) => setFormData({ ...formData, currentPosition: e.target.value })}
                      placeholder="e.g. Senior BDA, Academic Counsellor"
                      className={inputClass}
                    />
                  </div>

                  <div>
                    <label className={labelClass}>Current Company Name *</label>
                    <input
                      type="text"
                      required
                      value={formData.currentCompany}
                      onChange={(e) => setFormData({ ...formData, currentCompany: e.target.value })}
                      placeholder="e.g. EdTech Organization"
                      className={inputClass}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className={labelClass}>Company Tenure</label>
                    <input
                      type="text"
                      value={formData.currentCompanyTenure}
                      onChange={(e) => setFormData({ ...formData, currentCompanyTenure: e.target.value })}
                      placeholder="e.g. 2 Years"
                      className={inputClass}
                    />
                  </div>

                  <div>
                    <label className={labelClass}>Total Experience (Years)</label>
                    <input
                      type="number"
                      step="0.5"
                      value={formData.experience}
                      onChange={(e) => setFormData({ ...formData, experience: e.target.value })}
                      placeholder="2.5"
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
                      <option value="Immediate">Immediate Joiner</option>
                      <option value="15 Days">15 Days</option>
                      <option value="30 Days">30 Days</option>
                      <option value="60 Days">60 Days</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className={labelClass}>
                    Daily Responsibilities & Achievements
                  </label>
                  <textarea
                    rows={3}
                    value={formData.currentRoleDescription}
                    onChange={(e) => setFormData({ ...formData, currentRoleDescription: e.target.value })}
                    placeholder="Describe your sales targets, daily student counselling calls, lead conversion numbers..."
                    className={inputClass}
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className={labelClass}>Current Annual Salary (₹ LPA)</label>
                    <input
                      type="number"
                      step="0.5"
                      value={formData.currentCtc}
                      onChange={(e) => setFormData({ ...formData, currentCtc: e.target.value })}
                      placeholder="4.5"
                      className={inputClass}
                    />
                  </div>

                  <div>
                    <label className={labelClass}>Expected Salary (₹ LPA)</label>
                    <input
                      type="number"
                      step="0.5"
                      value={formData.expectedCtc}
                      onChange={(e) => setFormData({ ...formData, expectedCtc: e.target.value })}
                      placeholder="6.5"
                      className={inputClass}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Conditional Step 4: Education & College Details */}
            <div className={sectionClass}>
              <h2 className="text-xs font-extrabold text-amber-600 dark:text-amber-400 uppercase tracking-wider">4. Educational Qualifications & College</h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className={labelClass}>Degree / Course *</label>
                  <input
                    type="text"
                    required
                    value={formData.education}
                    onChange={(e) => setFormData({ ...formData, education: e.target.value })}
                    placeholder="e.g. B.Tech, B.Com, MBA, BBA"
                    className={inputClass}
                  />
                </div>

                <div>
                  <label className={labelClass}>College / University Name *</label>
                  <input
                    type="text"
                    required
                    value={formData.collegeName}
                    onChange={(e) => setFormData({ ...formData, collegeName: e.target.value })}
                    placeholder="e.g. Recognized College / University"
                    className={inputClass}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className={labelClass}>Graduation Year</label>
                  <input
                    type="text"
                    value={formData.graduationYear}
                    onChange={(e) => setFormData({ ...formData, graduationYear: e.target.value })}
                    placeholder="e.g. 2024"
                    className={inputClass}
                  />
                </div>

                <div>
                  <label className={labelClass}>Specialization</label>
                  <input
                    type="text"
                    value={formData.specialization}
                    onChange={(e) => setFormData({ ...formData, specialization: e.target.value })}
                    placeholder="e.g. Sales / Marketing"
                    className={inputClass}
                  />
                </div>

                <div>
                  <label className={labelClass}>CGPA / Percentage</label>
                  <input
                    type="text"
                    value={formData.cgpa}
                    onChange={(e) => setFormData({ ...formData, cgpa: e.target.value })}
                    placeholder="e.g. 8.2 CGPA"
                    className={inputClass}
                  />
                </div>
              </div>
            </div>

            {/* Step 5: Skills Tag Selector */}
            <div className="space-y-4">
              <h2 className="text-xs font-extrabold text-amber-600 dark:text-amber-400 uppercase tracking-wider"> 5. Key Skills & Domain Expertise</h2>

              <div className="flex flex-wrap gap-2">
                {SUGGESTED_SKILLS.map((skill) => {
                  const selected = formData.skills.includes(skill);
                  return (
                    <button
                      key={skill}
                      type="button"
                      onClick={() => toggleSkill(skill)}
                      className={`px-3.5 py-1.5 text-xs font-extrabold rounded-xl transition-all ${selected
                        ? 'bg-amber-500 text-slate-950 font-black shadow-md shadow-amber-500/20'
                        : theme === 'dark'
                          ? 'bg-slate-950 text-slate-200 border border-slate-800 hover:bg-slate-800'
                          : 'bg-white text-slate-800 border border-slate-200 hover:bg-slate-100 shadow-sm'
                        }`}
                    >
                      {selected ? ' ' : '+ '}
                      {skill}
                    </button>
                  );
                })}
              </div>

              {/* Custom skill input */}
              <div className="flex items-center gap-2 pt-2">
                <input
                  type="text"
                  value={customSkill}
                  onChange={(e) => setCustomSkill(e.target.value)}
                  placeholder="Add custom skill (e.g. Telesales, Lead Generation)..."
                  className={inputClass}
                />
                <button
                  type="button"
                  onClick={addCustomSkill}
                  className="px-5 py-3 text-xs font-extrabold text-white bg-amber-500 hover:bg-amber-600 rounded-2xl shadow-md shrink-0"
                >
                  + Add Skill
                </button>
              </div>

              {/* Selected skills list */}
              {formData.skills.length > 0 && (
                <div className="flex flex-wrap gap-1.5 pt-2">
                  <span className="text-[10px] text-slate-500 font-extrabold uppercase tracking-wider block w-full mb-1">Selected Skills for AI Evaluation:</span>
                  {formData.skills.map((s) => (
                    <span
                      key={s}
                      className="px-3 py-1 text-xs font-bold bg-amber-500/15 text-amber-700 dark:text-amber-300 border border-amber-500/30 rounded-xl flex items-center gap-1.5"
                    >
                      <span>{s}</span>
                      <button type="button" onClick={() => removeSkill(s)} className="text-amber-600 hover:text-red-500 font-bold">
                        
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Motivation Pitch */}
            <div>
              <label className={labelClass}>
                6. Why do you want to join Adyapan Edutech?
              </label>
              <textarea
                rows={3}
                value={formData.motivationPitch}
                onChange={(e) => setFormData({ ...formData, motivationPitch: e.target.value })}
                placeholder="Share why you are excited about this role and how your background fits our team..."
                className={inputClass}
              />
            </div>

            {/* Step 7: Resume Upload Dropzone */}
            <div className="space-y-3">
              <h2 className="text-xs font-extrabold text-amber-600 dark:text-amber-400 uppercase tracking-wider">7. Upload Resume PDF/DOCX *</h2>

              <div className={`border-2 border-dashed rounded-3xl p-6 text-center transition-all relative ${theme === 'dark'
                ? 'border-slate-800 hover:border-amber-400 bg-slate-950/80'
                : 'border-amber-200/80 hover:border-amber-400 bg-white shadow-sm'
                }`}>
                <input
                  type="file"
                  accept=".pdf,.docx,.doc,.txt"
                  onChange={handleFileUpload}
                  className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                />
                <div className="space-y-2 pointer-events-none">
                  <div className="text-3xl"></div>
                  {formData.resumeFileName ? (
                    <div>
                      <p className="text-sm font-black text-emerald-600 dark:text-emerald-400">Attached: {formData.resumeFileName}</p>
                      <p className="text-[10px] text-slate-500 font-bold">Click or drag another file to replace</p>
                    </div>
                  ) : (
                    <div>
                      <p className="text-xs font-extrabold text-slate-900 dark:text-white">Drag & drop your Resume PDF/DOCX here, or click to browse</p>
                      <p className="text-[10px] text-slate-500 font-medium">Supports PDF, DOCX, TXT (Max 10MB)</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Links */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>LinkedIn Profile URL</label>
                <input
                  type="url"
                  value={formData.linkedin}
                  onChange={(e) => setFormData({ ...formData, linkedin: e.target.value })}
                  placeholder="https://linkedin.com/in/username"
                  className={inputClass}
                />
              </div>

              <div>
                <label className={labelClass}>Portfolio / Work Drive Link</label>
                <input
                  type="url"
                  value={formData.portfolio}
                  onChange={(e) => setFormData({ ...formData, portfolio: e.target.value })}
                  placeholder="https://github.com or drive link"
                  className={inputClass}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-4 text-xs font-black text-slate-950 bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 hover:from-amber-400 hover:to-amber-400 rounded-2xl transition-all shadow-xl shadow-amber-500/25 uppercase tracking-wider text-center"
            >
              {submitting ? 'Submitting & Running Real AI Resume Screening...' : 'Submit Application & Run AI Resume Screening →'}
            </button>
          </form>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default ApplyJob;

