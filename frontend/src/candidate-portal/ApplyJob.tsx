import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import {
  ArrowLeft,
  ArrowRight,
  Briefcase,
  Building2,
  Calendar,
  Check,
  CheckCircle2,
  Clock3,
  FileCheck2,
  FileText,
  FileUp,
  Globe2,
  GraduationCap,
  Heart,
  HelpCircle,
  IndianRupee,
  Layers,
  MapPin,
  Plus,
  Search,
  ShieldCheck,
  Sparkles,
  Star,
  Trash2,
  Upload,
  User,
  UsersRound,
  X,
  Zap,
} from 'lucide-react';
import SiteShell from '../components/layout/SiteShell';
import { candidateService } from '../services/candidateService';
import { jobService } from '../services/jobService';
import { calculateRealAIScore, addCandidateNotification, saveCandidateApplication } from '../utils/applicationStore';
import { useCandidateAuth } from '../context/CandidateAuthContext';
import { toast } from 'react-hot-toast';

const SUGGESTED_SKILLS = [
  'React.js',
  'Node.js',
  'TypeScript',
  'JavaScript',
  'Python',
  'SQL',
  'PostgreSQL',
  'AWS',
  'Network Security',
  'SIEM',
  'Direct Sales',
  'Student Counselling',
  'Client Advisory',
  'Lead Generation',
  'CRM Tools',
  'Communication Skills',
  'Problem Solving',
  'Leadership',
];

const STEPS = [
  { id: 1, label: 'Profile', desc: 'Personal details' },
  { id: 2, label: 'Experience', desc: 'Career history' },
  { id: 3, label: 'Education', desc: 'Qualifications' },
  { id: 4, label: 'Skills', desc: 'Core strengths' },
  { id: 5, label: 'Resume', desc: 'Upload document' },
  { id: 6, label: 'Final Details', desc: 'Pitch & links' },
  { id: 7, label: 'Review', desc: 'Verify & submit' },
];

export const ApplyJob: React.FC = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { candidate: loggedInCandidate } = useCandidateAuth();

  const [currentStep, setCurrentStep] = useState(1);
  const [job, setJob] = useState<any>(null);
  const [loadingJob, setLoadingJob] = useState(true);

  // Form State
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    location: '',

    // Experience
    employmentStatus: 'WORKING', // FRESHER | WORKING | HUNTING | OTHER
    experience: '1-3 Years',
    currentCompany: '',
    currentPosition: '',
    currentCtc: '',
    expectedCtc: '',
    noticePeriod: 'Immediate',
    currentRoleDescription: '',

    // Education
    highestQualification: "Bachelor's Degree",
    collegeName: '',
    degree: 'B.Tech / B.E.',
    fieldOfStudy: 'Computer Science / Engineering',
    graduationYear: '2024',
    cgpa: '',

    // Skills
    skills: ['Communication Skills', 'Problem Solving'] as string[],

    // Resume
    resumeFileName: '',
    resumeFileSize: '',
    resumeDataUrl: null as any,
    resumeText: '',

    // Final Details
    motivationPitch: '',
    linkedin: '',
    portfolio: '',
    github: '',
  });

  const [customSkill, setCustomSkill] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitStage, setSubmitStage] = useState(1); // 1: Validating, 2: Uploading, 3: Processing
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  // Pre-fill logged-in candidate profile
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

  // Load Job info
  useEffect(() => {
    const fetchJob = async () => {
      setLoadingJob(true);
      try {
        const res = await jobService.getPublicJob(slug);
        if (res?.job) {
          setJob(res.job);
        } else {
          const allRes = await jobService.getPublicJobs();
          const found = allRes?.jobs?.find((j: any) => j.slug === slug || j.id === slug);
          if (found) setJob(found);
        }
      } catch (e) {
        console.error('Error fetching job details:', e);
      } finally {
        setLoadingJob(false);
      }
    };
    fetchJob();
  }, [slug]);

  const displayJobTitle = useMemo(() => {
    if (job?.title) return job.title;
    if (slug?.includes('cyber')) return 'Cybersecurity Analyst';
    if (slug?.includes('developer') || slug?.includes('stack')) return 'Senior Full Stack Developer';
    if (slug?.includes('sales') || slug?.includes('telecaller')) return 'Inside Sales Executive / Telecaller';
    if (slug?.includes('counselor') || slug?.includes('advisory')) return 'Senior Academic Counselor';
    return 'Business Development Associate (BDA)';
  }, [job, slug]);

  const displaySalary = useMemo(() => {
    if (job?.salaryMin && job?.salaryMax) {
      const min = job.salaryMin >= 10000 ? (job.salaryMin / 100000).toFixed(1) : job.salaryMin;
      const max = job.salaryMax >= 10000 ? (job.salaryMax / 100000).toFixed(1) : job.salaryMax;
      return `₹${min} – ${max} LPA`;
    }
    return job?.salary || '₹3.5 – 6.0 LPA';
  }, [job]);

  // Handle Input Changes
  const handleChange = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => {
        const copy = { ...prev };
        delete copy[field];
        return copy;
      });
    }
  };

  // Skill Management
  const toggleSkill = (skill: string) => {
    if (formData.skills.includes(skill)) {
      handleChange('skills', formData.skills.filter((s) => s !== skill));
    } else {
      handleChange('skills', [...formData.skills, skill]);
    }
  };

  const addCustomSkill = (e: React.FormEvent) => {
    e.preventDefault();
    if (customSkill.trim() && !formData.skills.includes(customSkill.trim())) {
      handleChange('skills', [...formData.skills, customSkill.trim()]);
      setCustomSkill('');
    }
  };

  const removeSkill = (skillToRemove: string) => {
    handleChange('skills', formData.skills.filter((s) => s !== skillToRemove));
  };

  // File Upload
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 15 * 1024 * 1024) {
      toast.error('Resume size must be under 15MB');
      return;
    }

    const fileSizeStr = file.size > 1024 * 1024
      ? `${(file.size / (1024 * 1024)).toFixed(1)} MB`
      : `${Math.round(file.size / 1024)} KB`;

    setSelectedFile(file);

    const reader = new FileReader();
    reader.onload = (event: any) => {
      setFormData((prev) => ({
        ...prev,
        resumeFileName: file.name,
        resumeFileSize: fileSizeStr,
        resumeDataUrl: event.target.result,
        resumeText: `Parsed candidate resume: ${file.name}. Verified application.`,
      }));
      toast.success(`Resume attached: ${file.name}`);
    };
    reader.readAsDataURL(file);
  };

  // Validation per step
  const validateCurrentStep = () => {
    const newErrors: { [key: string]: string } = {};

    if (currentStep === 1) {
      if (!formData.firstName.trim()) newErrors.firstName = 'First name is required';
      if (!formData.lastName.trim()) newErrors.lastName = 'Last name is required';
      if (!formData.email.trim() || !formData.email.includes('@')) newErrors.email = 'Valid email address is required';
      if (!formData.phone.trim() || formData.phone.length < 10) newErrors.phone = 'Valid phone number is required';
    }

    if (currentStep === 5) {
      if (!selectedFile && !formData.resumeFileName && !formData.resumeDataUrl) {
        newErrors.resume = 'Please attach your resume PDF or DOCX';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const nextStep = () => {
    if (!validateCurrentStep()) {
      toast.error('Please complete the required fields to continue');
      return;
    }
    setCurrentStep((prev) => Math.min(STEPS.length, prev + 1));
    window.scrollTo({ top: 220, behavior: 'smooth' });
  };

  const prevStep = () => {
    setCurrentStep((prev) => Math.max(1, prev - 1));
    window.scrollTo({ top: 220, behavior: 'smooth' });
  };

  // Final Application Submission
  const handleSubmitApplication = async () => {
    setSubmitting(true);
    setSubmitStage(1);

    const jobTitle = displayJobTitle;
    const isStudent = formData.employmentStatus === 'FRESHER';

    const submissionData = {
      ...formData,
      experience: isStudent ? 'Fresher (0 Yrs)' : formData.experience,
      currentPosition: isStudent ? 'Student / Fresher' : (formData.currentPosition || jobTitle),
      currentCompany: isStudent ? (formData.collegeName || 'University Student') : (formData.currentCompany || 'Independent Candidate'),
      employmentStatus: isStudent ? 'STUDENT' : formData.employmentStatus,
    };

    const aiAnalysis = calculateRealAIScore(formData.skills, submissionData.experience, jobTitle);

    try {
      setTimeout(() => setSubmitStage(2), 700);

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

      setTimeout(() => setSubmitStage(3), 1400);

      await candidateService.publicApply(formPayload);

      addCandidateNotification(`${formData.firstName} ${formData.lastName}`, jobTitle, aiAnalysis.score);

      toast.success('Application submitted successfully!');
      setSubmitting(false);

      navigate('/application-success', {
        state: {
          candidateName: `${formData.firstName} ${formData.lastName}`,
          candidateEmail: formData.email,
          jobTitle: jobTitle,
          company: job?.company || 'Adyapan Technologies',
          location: job?.location || 'Hyderabad',
          score: aiAnalysis.score,
        },
      });
    } catch (error: any) {
      console.error('Application submit error:', error);
      const errMsg = error.response?.data?.message || error.message || 'Failed to submit application';
      toast.error(errMsg);
      setSubmitting(false);
    }
  };

  const progressPercent = Math.round((currentStep / STEPS.length) * 100);

  return (
    <SiteShell>
      <main className="bg-[#faf7f2] dark:bg-[#121110] text-stone-900 dark:text-stone-100 min-h-screen relative pb-20">

        {/* Background glow and subtle dots */}
        <div className="absolute inset-0 bg-dotted-grid pointer-events-none opacity-35" />
        <div className="absolute top-10 left-1/3 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* ── COMPACT APPLICATION HERO ── */}
        <section className="pt-6 pb-8 relative z-10 border-b border-stone-200/60 dark:border-stone-800 bg-[#fdfbf7] dark:bg-[#141312]">
          <div className="max-w-[1380px] mx-auto px-4 sm:px-6 lg:px-8">

            {/* Top Back Navigation Breadcrumb */}
            <div className="mb-4">
              <Link
                to={`/careers/${job?.slug || slug || ''}`}
                className="inline-flex items-center gap-2 text-xs sm:text-sm font-bold text-stone-600 dark:text-stone-400 hover:text-amber-500 dark:hover:text-amber-400 transition-colors"
              >
                <ArrowLeft size={16} />
                <span>Back to Job Details</span>
              </Link>
            </div>

            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">

              {/* Left Role Details */}
              <div className="space-y-3">
                <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-amber-500/10 border border-amber-500/25 text-amber-700 dark:text-amber-400 font-bold text-xs uppercase tracking-wider">
                  <Sparkles size={13} className="text-amber-500 fill-amber-500" />
                  <span>DIRECT APPLICATION</span>
                </div>

                <div>
                  <h1 className="text-2xl sm:text-3xl lg:text-5xl font-bold text-stone-900 dark:text-white tracking-tight">
                    Build your next career move.
                  </h1>
                  <p className="text-xs sm:text-sm text-stone-500 font-semibold pt-0.5">
                    You are applying for:{' '}
                    <strong className="text-amber-600 dark:text-amber-400 font-bold">
                      {displayJobTitle}
                    </strong>{' '}
                    at {job?.company || 'Adyapan Technologies'}
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-3 text-xs font-bold text-stone-600 dark:text-stone-200 pt-1">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 shadow-sm">
                    <MapPin size={13} className="text-amber-500" />
                    <span>{job?.location || 'Hyderabad'}</span>
                  </span>
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 shadow-sm">
                    <Clock3 size={13} className="text-amber-500" />
                    <span>{job?.type || 'Full Time'}</span>
                  </span>
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-amber-500/15 text-amber-700 dark:text-amber-400 font-bold">
                    <IndianRupee size={13} />
                    <span>{displaySalary}</span>
                  </span>
                </div>
              </div>

              {/* Right Mini Photo & Verified Floating Card */}
              <div className="hidden md:flex items-center gap-4">
                <div className="relative w-44 h-24 rounded-2xl overflow-hidden shadow-lg border-2 border-white dark:border-stone-800 bg-stone-900 shrink-0">
                  <img
                    src="/largest-student-community.jpeg"
                    alt="Adyapan"
                    className="w-full h-full object-cover object-center"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                  <span className="absolute bottom-2 left-2 text-[10px] font-bold text-white">
                    Hyderabad Hub
                  </span>
                </div>

                <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 p-3 rounded-2xl shadow-md space-y-1">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-600 dark:text-emerald-400">
                    <ShieldCheck size={16} />
                    <span>Verified Official Opening</span>
                  </div>
                  <p className="text-[11px] text-stone-500 font-medium">
                    Direct HR placement pipeline
                  </p>
                </div>
              </div>

            </div>
          </div>
        </section>

        {/* ── GLOBAL APPLICATION PROGRESS TIMELINE ── */}
        <section className="py-6 border-b border-stone-200/60 dark:border-stone-800 bg-white/70 dark:bg-stone-900/70 backdrop-blur-md sticky top-[64px] z-30 shadow-sm">
          <div className="max-w-[1380px] mx-auto px-4 sm:px-6 lg:px-8">

            {/* Desktop Horizontal Timeline */}
            <div className="hidden lg:flex items-center justify-between relative">
              {STEPS.map((step, idx) => {
                const isCompleted = currentStep > step.id;
                const isCurrent = currentStep === step.id;

                return (
                  <React.Fragment key={step.id}>
                    <button
                      onClick={() => {
                        if (isCompleted) setCurrentStep(step.id);
                      }}
                      disabled={!isCompleted && !isCurrent}
                      className={`flex items-center gap-3 transition-all select-none text-left cursor-pointer ${!isCompleted && !isCurrent ? 'opacity-50 cursor-not-allowed' : ''
                        }`}
                    >
                      <div
                        className={`w-9 h-9 rounded-2xl flex items-center justify-center font-bold text-xs transition-all shadow-sm ${isCompleted
                          ? 'bg-emerald-500 text-white'
                          : isCurrent
                            ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white scale-110 shadow-amber-500/30'
                            : 'bg-stone-100 dark:bg-stone-800 text-stone-500'
                          }`}
                      >
                        {isCompleted ? <Check size={16} /> : `0${step.id}`}
                      </div>

                      <div>
                        <b
                          className={`text-xs block font-bold ${isCurrent
                            ? 'text-amber-500'
                            : isCompleted
                              ? 'text-stone-900 dark:text-white'
                              : 'text-stone-400'
                            }`}
                        >
                          {step.label}
                        </b>
                        <small className="text-[10px] text-stone-400 font-semibold block">
                          {step.desc}
                        </small>
                      </div>
                    </button>

                    {idx < STEPS.length - 1 && (
                      <div
                        className={`flex-1 h-0.5 mx-3 rounded-full transition-all ${currentStep > step.id
                          ? 'bg-emerald-500'
                          : 'bg-stone-200 dark:bg-stone-800'
                          }`}
                      />
                    )}
                  </React.Fragment>
                );
              })}
            </div>

            {/* Mobile Compact Progress Bar */}
            <div className="lg:hidden flex items-center justify-between gap-4">
              <div className="space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-amber-500 block">
                  STEP {currentStep} OF {STEPS.length}
                </span>
                <b className="text-sm font-bold text-stone-900 dark:text-white block">
                  {STEPS[currentStep - 1]?.label}: {STEPS[currentStep - 1]?.desc}
                </b>
              </div>

              <div className="w-32 bg-stone-100 dark:bg-stone-800 h-2.5 rounded-full overflow-hidden">
                <div
                  className="bg-gradient-to-r from-amber-500 to-orange-500 h-full rounded-full transition-all duration-300"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>

          </div>
        </section>

        {/* ── TWO-COLUMN MAIN APPLICATION LAYOUT ── */}
        <section className="pt-10 max-w-[1380px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

            {/* ── LEFT COLUMN: MAIN CURRENT STEP FORM (65% / 8 Cols) ── */}
            <div className="lg:col-span-8 bg-white dark:bg-stone-900 rounded-3xl p-6 sm:p-10 border border-stone-200/80 dark:border-stone-800 shadow-xl relative overflow-hidden space-y-8">
              <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-amber-500 via-orange-500 to-amber-500" />

              {/* ── STEP 01: PROFILE ── */}
              {currentStep === 1 && (
                <div className="space-y-6 animate-fadeIn">
                  <div className="space-y-1.5">
                    <span className="text-xs font-bold uppercase tracking-wider text-amber-500">
                      Step 01 of 07
                    </span>
                    <h2 className="text-2xl sm:text-3xl font-bold text-stone-900 dark:text-white">
                      Let's get to know you.
                    </h2>
                    <p className="text-xs sm:text-sm text-stone-500 font-medium">
                      Tell us a little about yourself so our talent acquisition team can reach out.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 pt-2">
                    <div className="space-y-1.5">
                      <label className="text-xs font-extrabold text-stone-700 dark:text-stone-300">
                        First Name <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={formData.firstName}
                        onChange={(e) => handleChange('firstName', e.target.value)}
                        placeholder="e.g. Dinesh"
                        className={`w-full px-4 py-3.5 rounded-2xl bg-stone-50 dark:bg-stone-800 border ${errors.firstName ? 'border-rose-500' : 'border-stone-200 dark:border-stone-700'
                          } text-stone-900 dark:text-white placeholder:text-stone-400 dark:placeholder:text-stone-500 font-semibold text-xs sm:text-sm outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 transition-all`}
                      />
                      {errors.firstName && <span className="text-[11px] text-rose-500 font-bold">{errors.firstName}</span>}
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-extrabold text-stone-700 dark:text-stone-300">
                        Last Name <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={formData.lastName}
                        onChange={(e) => handleChange('lastName', e.target.value)}
                        placeholder="e.g. Sharma"
                        className={`w-full px-4 py-3.5 rounded-2xl bg-stone-50 dark:bg-stone-800 border ${errors.lastName ? 'border-rose-500' : 'border-stone-200 dark:border-stone-700'
                          } text-stone-900 dark:text-white placeholder:text-stone-400 dark:placeholder:text-stone-500 font-semibold text-xs sm:text-sm outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 transition-all`}
                      />
                      {errors.lastName && <span className="text-[11px] text-rose-500 font-bold">{errors.lastName}</span>}
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-extrabold text-stone-700 dark:text-stone-300">
                        Email Address <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="email"
                        value={formData.email}
                        onChange={(e) => handleChange('email', e.target.value)}
                        placeholder="dinesh@example.com"
                        className={`w-full px-4 py-3.5 rounded-2xl bg-stone-50 dark:bg-stone-800 border ${errors.email ? 'border-rose-500' : 'border-stone-200 dark:border-stone-700'
                          } text-stone-900 dark:text-white placeholder:text-stone-400 dark:placeholder:text-stone-500 font-semibold text-xs sm:text-sm outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 transition-all`}
                      />
                      {errors.email && <span className="text-[11px] text-rose-500 font-bold">{errors.email}</span>}
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-extrabold text-stone-700 dark:text-stone-300">
                        Phone Number <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => handleChange('phone', e.target.value)}
                        placeholder="+91 98765 43210"
                        className={`w-full px-4 py-3.5 rounded-2xl bg-stone-50 dark:bg-stone-800 border ${errors.phone ? 'border-rose-500' : 'border-stone-200 dark:border-stone-700'
                          } text-stone-900 dark:text-white placeholder:text-stone-400 dark:placeholder:text-stone-500 font-semibold text-xs sm:text-sm outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 transition-all`}
                      />
                      {errors.phone && <span className="text-[11px] text-rose-500 font-bold">{errors.phone}</span>}
                    </div>

                    <div className="sm:col-span-2 space-y-1.5">
                      <label className="text-xs font-extrabold text-stone-700 dark:text-stone-300">
                        Current City / Location
                      </label>
                      <input
                        type="text"
                        value={formData.location}
                        onChange={(e) => handleChange('location', e.target.value)}
                        placeholder="e.g. Hyderabad, Telangana / Remote"
                        className="w-full px-4 py-3.5 rounded-2xl bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-stone-900 dark:text-white placeholder:text-stone-400 dark:placeholder:text-stone-500 font-semibold text-xs sm:text-sm outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 transition-all"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* ── STEP 02: EXPERIENCE ── */}
              {currentStep === 2 && (
                <div className="space-y-6 animate-fadeIn">
                  <div className="space-y-1.5">
                    <span className="text-xs font-bold uppercase tracking-wider text-amber-500">
                      Step 02 of 07
                    </span>
                    <h2 className="text-2xl sm:text-3xl font-bold text-stone-900 dark:text-white">
                      Tell us about your experience.
                    </h2>
                    <p className="text-xs sm:text-sm text-stone-500 font-medium">
                      Help us understand where you are in your professional career journey.
                    </p>
                  </div>

                  {/* Employment Status Selection Cards */}
                  <div className="space-y-2">
                    <label className="text-xs font-extrabold text-stone-700 dark:text-stone-300">
                      Current Employment Status
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                      {[
                        { id: 'FRESHER', title: 'Fresher / Student', desc: 'Starting career / Graduating soon', icon: GraduationCap },
                        { id: 'WORKING', title: 'Working Professional', desc: 'Currently employed in a role', icon: Briefcase },
                        { id: 'HUNTING', title: 'Actively Job Hunting', desc: 'Available for immediate joining', icon: Zap },
                        { id: 'OTHER', title: 'Freelance / Consultant', desc: 'Independent contractor or other', icon: User },
                      ].map((card) => {
                        const Icon = card.icon;
                        const isSelected = formData.employmentStatus === card.id;

                        return (
                          <div
                            key={card.id}
                            onClick={() => handleChange('employmentStatus', card.id)}
                            className={`p-4 rounded-2xl border-2 transition-all cursor-pointer flex items-start gap-3.5 select-none ${isSelected
                              ? 'border-amber-500 bg-amber-500/10 shadow-md shadow-amber-500/10'
                              : 'border-stone-200 dark:border-stone-700 hover:border-amber-400 bg-stone-50/50 dark:bg-stone-800/80'
                              }`}
                          >
                            <div
                              className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold shrink-0 ${isSelected ? 'bg-amber-500 text-white' : 'bg-stone-200 dark:bg-stone-700 text-stone-600 dark:text-stone-300'
                                }`}
                            >
                              <Icon size={18} />
                            </div>
                            <div className="space-y-0.5 flex-1">
                              <b className={`text-xs sm:text-sm block font-bold ${isSelected ? 'text-amber-600 dark:text-amber-400' : 'text-stone-900 dark:text-white'}`}>
                                {card.title}
                              </b>
                              <small className="text-[11px] text-stone-500 dark:text-stone-400 font-semibold block">
                                {card.desc}
                              </small>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Conditional Experience Fields */}
                  {formData.employmentStatus !== 'FRESHER' ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 pt-3 border-t border-stone-100 dark:border-stone-800">
                      <div className="space-y-1.5">
                        <label className="text-xs font-extrabold text-stone-700 dark:text-stone-300">
                          Total Relevant Experience
                        </label>
                        <select
                          value={formData.experience}
                          onChange={(e) => handleChange('experience', e.target.value)}
                          className="w-full px-4 py-3.5 rounded-2xl bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-stone-900 dark:text-white font-semibold text-xs sm:text-sm outline-none focus:border-amber-500"
                        >
                          <option value="0-1 Years" className="bg-white dark:bg-stone-900 text-stone-900 dark:text-white">0–1 Years</option>
                          <option value="1-3 Years" className="bg-white dark:bg-stone-900 text-stone-900 dark:text-white">1–3 Years</option>
                          <option value="3-5 Years" className="bg-white dark:bg-stone-900 text-stone-900 dark:text-white">3–5 Years</option>
                          <option value="5+ Years" className="bg-white dark:bg-stone-900 text-stone-900 dark:text-white">5+ Years</option>
                        </select>
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-xs font-extrabold text-stone-700 dark:text-stone-300">
                          Current Company
                        </label>
                        <input
                          type="text"
                          value={formData.currentCompany}
                          onChange={(e) => handleChange('currentCompany', e.target.value)}
                          placeholder="e.g. Cognizant / TCS / Startup"
                          className="w-full px-4 py-3.5 rounded-2xl bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-stone-900 dark:text-white placeholder:text-stone-400 dark:placeholder:text-stone-500 font-semibold text-xs sm:text-sm outline-none focus:border-amber-500"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-xs font-extrabold text-stone-700 dark:text-stone-300">
                          Current Designation
                        </label>
                        <input
                          type="text"
                          value={formData.currentPosition}
                          onChange={(e) => handleChange('currentPosition', e.target.value)}
                          placeholder="e.g. Associate Analyst / Developer"
                          className="w-full px-4 py-3.5 rounded-2xl bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-stone-900 dark:text-white placeholder:text-stone-400 dark:placeholder:text-stone-500 font-semibold text-xs sm:text-sm outline-none focus:border-amber-500"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-xs font-extrabold text-stone-700 dark:text-stone-300">
                          Notice Period
                        </label>
                        <select
                          value={formData.noticePeriod}
                          onChange={(e) => handleChange('noticePeriod', e.target.value)}
                          className="w-full px-4 py-3.5 rounded-2xl bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-stone-900 dark:text-white font-semibold text-xs sm:text-sm outline-none focus:border-amber-500"
                        >
                          <option value="Immediate" className="bg-white dark:bg-stone-900 text-stone-900 dark:text-white">Immediate / Serving Notice</option>
                          <option value="15 Days" className="bg-white dark:bg-stone-900 text-stone-900 dark:text-white">15 Days</option>
                          <option value="30 Days" className="bg-white dark:bg-stone-900 text-stone-900 dark:text-white">30 Days</option>
                          <option value="60+ Days" className="bg-white dark:bg-stone-900 text-stone-900 dark:text-white">60+ Days</option>
                        </select>
                      </div>
                    </div>
                  ) : (
                    <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center gap-3">
                      <Sparkles size={18} className="text-emerald-600 shrink-0" />
                      <p className="text-xs text-emerald-800 dark:text-emerald-300 font-semibold leading-relaxed">
                        Fresher friendly! Adyapan offers comprehensive training, founder mentorship, and fast-track promotion paths for emerging talent.
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* ── STEP 03: EDUCATION ── */}
              {currentStep === 3 && (
                <div className="space-y-6 animate-fadeIn">
                  <div className="space-y-1.5">
                    <span className="text-xs font-bold uppercase tracking-wider text-amber-500">
                      Step 03 of 07
                    </span>
                    <h2 className="text-2xl sm:text-3xl font-bold text-stone-900 dark:text-white">
                      Your learning journey.
                    </h2>
                    <p className="text-xs sm:text-sm text-stone-500 font-medium">
                      Tell us about the education and qualifications that shaped your skills.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 pt-2">
                    <div className="space-y-1.5">
                      <label className="text-xs font-extrabold text-stone-700 dark:text-stone-300">
                        Highest Qualification
                      </label>
                      <select
                        value={formData.highestQualification}
                        onChange={(e) => handleChange('highestQualification', e.target.value)}
                        className="w-full px-4 py-3.5 rounded-2xl bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-stone-900 dark:text-white font-semibold text-xs sm:text-sm outline-none focus:border-amber-500"
                      >
                        <option value="Bachelor's Degree" className="bg-white dark:bg-stone-900 text-stone-900 dark:text-white">Bachelor's Degree (B.Tech / B.E / B.Sc / B.Com)</option>
                        <option value="Master's Degree" className="bg-white dark:bg-stone-900 text-stone-900 dark:text-white">Master's Degree (M.Tech / MBA / MCA)</option>
                        <option value="Diploma / Polytechnic" className="bg-white dark:bg-stone-900 text-stone-900 dark:text-white">Diploma / Polytechnic</option>
                        <option value="Doctorate / PhD" className="bg-white dark:bg-stone-900 text-stone-900 dark:text-white">Doctorate / PhD</option>
                      </select>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-extrabold text-stone-700 dark:text-stone-300">
                        College / University Name
                      </label>
                      <input
                        type="text"
                        value={formData.collegeName}
                        onChange={(e) => handleChange('collegeName', e.target.value)}
                        placeholder="e.g. Lovely Professional University / JNTU"
                        className="w-full px-4 py-3.5 rounded-2xl bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-stone-900 dark:text-white placeholder:text-stone-400 dark:placeholder:text-stone-500 font-semibold text-xs sm:text-sm outline-none focus:border-amber-500"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-extrabold text-stone-700 dark:text-stone-300">
                        Specialization / Branch
                      </label>
                      <input
                        type="text"
                        value={formData.fieldOfStudy}
                        onChange={(e) => handleChange('fieldOfStudy', e.target.value)}
                        placeholder="e.g. Computer Science / Electronics / Business"
                        className="w-full px-4 py-3.5 rounded-2xl bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-stone-900 dark:text-white placeholder:text-stone-400 dark:placeholder:text-stone-500 font-semibold text-xs sm:text-sm outline-none focus:border-amber-500"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-extrabold text-stone-700 dark:text-stone-300">
                        Year of Graduation
                      </label>
                      <select
                        value={formData.graduationYear}
                        onChange={(e) => handleChange('graduationYear', e.target.value)}
                        className="w-full px-4 py-3.5 rounded-2xl bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-stone-900 dark:text-white font-semibold text-xs sm:text-sm outline-none focus:border-amber-500"
                      >
                        {['2027', '2026', '2025', '2024', '2023', '2022', '2021', '2020', 'Prior'].map((yr) => (
                          <option key={yr} value={yr} className="bg-white dark:bg-stone-900 text-stone-900 dark:text-white">{yr}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>
              )}

              {/* ── STEP 04: SKILLS ── */}
              {currentStep === 4 && (
                <div className="space-y-6 animate-fadeIn">
                  <div className="space-y-1.5">
                    <span className="text-xs font-bold uppercase tracking-wider text-amber-500">
                      Step 04 of 07
                    </span>
                    <h2 className="text-2xl sm:text-3xl font-bold text-stone-900 dark:text-white">
                      What are you great at?
                    </h2>
                    <p className="text-xs sm:text-sm text-stone-500 font-medium">
                      Select your key strengths. You currently have{' '}
                      <b className="text-amber-500">{formData.skills.length} skills</b> selected.
                    </p>
                  </div>

                  {/* Add Custom Skill Form */}
                  <form onSubmit={addCustomSkill} className="flex gap-2">
                    <input
                      type="text"
                      value={customSkill}
                      onChange={(e) => setCustomSkill(e.target.value)}
                      placeholder="Add a custom skill (e.g. PyTorch, B2B Sales)..."
                      className="flex-1 px-4 py-3 rounded-2xl bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-xs sm:text-sm font-semibold outline-none focus:border-amber-500 text-stone-900 dark:text-white placeholder:text-stone-400 dark:placeholder:text-stone-500"
                    />
                    <button
                      type="submit"
                      className="px-5 py-3 rounded-2xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs shadow-md shadow-amber-500/20 transition-all flex items-center gap-1.5 shrink-0 cursor-pointer"
                    >
                      <Plus size={15} />
                      <span>Add</span>
                    </button>
                  </form>

                  {/* Interactive Skill Chips */}
                  <div className="space-y-3 pt-2">
                    <label className="text-xs font-extrabold text-stone-700 dark:text-stone-300">
                      Suggested & Available Skills:
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {SUGGESTED_SKILLS.map((skill) => {
                        const isSelected = formData.skills.includes(skill);
                        return (
                          <button
                            key={skill}
                            type="button"
                            onClick={() => toggleSkill(skill)}
                            className={`px-3.5 py-1.5 rounded-xl font-bold text-xs transition-all flex items-center gap-1.5 cursor-pointer ${isSelected
                              ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-md shadow-amber-500/20 scale-105'
                              : 'bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-stone-800 dark:text-stone-200 hover:border-amber-400'
                              }`}
                          >
                            <span>{skill}</span>
                            {isSelected ? <Check size={13} /> : <Plus size={13} className="text-stone-400" />}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Selected Custom Chips */}
                  {formData.skills.filter((s) => !SUGGESTED_SKILLS.includes(s)).length > 0 && (
                    <div className="space-y-2 pt-2">
                      <label className="text-xs font-extrabold text-stone-700 dark:text-stone-300">
                        Custom Added Skills:
                      </label>
                      <div className="flex flex-wrap gap-2">
                        {formData.skills
                          .filter((s) => !SUGGESTED_SKILLS.includes(s))
                          .map((custom) => (
                            <span
                              key={custom}
                              className="px-3.5 py-1.5 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-700 dark:text-amber-300 font-bold text-xs flex items-center gap-1.5"
                            >
                              <span>{custom}</span>
                              <button
                                onClick={() => removeSkill(custom)}
                                className="hover:text-rose-500 p-0.5 cursor-pointer"
                              >
                                <X size={13} />
                              </button>
                            </span>
                          ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* ── STEP 05: RESUME ── */}
              {currentStep === 5 && (
                <div className="space-y-6 animate-fadeIn">
                  <div className="space-y-1.5">
                    <span className="text-xs font-bold uppercase tracking-wider text-amber-500">
                      Step 05 of 07
                    </span>
                    <h2 className="text-2xl sm:text-3xl font-bold text-stone-900 dark:text-white">
                      Let's add your resume.
                    </h2>
                    <p className="text-xs sm:text-sm text-stone-500 font-medium">
                      Your resume helps our talent acquisition team review your background quickly.
                    </p>
                  </div>

                  {/* Upload Card */}
                  <div className="border-2 border-dashed border-stone-200 dark:border-stone-700 rounded-3xl p-8 sm:p-12 text-center bg-stone-50/50 dark:bg-stone-800/50 hover:border-amber-500 transition-all group">
                    <input
                      type="file"
                      id="resume-upload"
                      accept=".pdf,.doc,.docx"
                      onChange={handleFileUpload}
                      className="hidden"
                    />

                    {formData.resumeFileName ? (
                      <div className="space-y-4 max-w-sm mx-auto">
                        <div className="w-16 h-16 rounded-2xl bg-emerald-500/15 text-emerald-600 flex items-center justify-center mx-auto shadow-md">
                          <FileCheck2 size={32} />
                        </div>
                        <div className="space-y-1">
                          <b className="text-sm font-bold text-stone-900 dark:text-white block truncate">
                            {formData.resumeFileName}
                          </b>
                          <small className="text-xs text-stone-500 font-bold block">
                            {formData.resumeFileSize || 'Ready for submission'} · Verified
                          </small>
                        </div>
                        <label
                          htmlFor="resume-upload"
                          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-stone-200 dark:bg-stone-800 hover:bg-amber-500 hover:text-white text-xs font-bold text-stone-700 dark:text-stone-300 transition-all cursor-pointer"
                        >
                          <Upload size={14} />
                          <span>Replace File</span>
                        </label>
                      </div>
                    ) : (
                      <label htmlFor="resume-upload" className="cursor-pointer space-y-4 block">
                        <div className="w-16 h-16 rounded-2xl bg-amber-500/15 text-amber-600 flex items-center justify-center mx-auto group-hover:scale-110 transition-transform">
                          <FileUp size={30} />
                        </div>
                        <div className="space-y-1">
                          <b className="text-base font-bold text-stone-900 dark:text-white block">
                            Upload your resume
                          </b>
                          <p className="text-xs text-stone-500 font-medium">
                            Drag & drop your file here, or{' '}
                            <span className="text-amber-500 font-bold underline">browse files</span>
                          </p>
                        </div>
                        <span className="inline-block text-[11px] font-bold text-stone-400 px-3 py-1 rounded-full bg-stone-200/60 dark:bg-stone-800">
                          Supports PDF, DOC, DOCX up to 15MB
                        </span>
                      </label>
                    )}
                  </div>

                  {errors.resume && (
                    <p className="text-xs text-rose-500 font-bold text-center">{errors.resume}</p>
                  )}
                </div>
              )}

              {/* ── STEP 06: FINAL DETAILS ── */}
              {currentStep === 6 && (
                <div className="space-y-6 animate-fadeIn">
                  <div className="space-y-1.5">
                    <span className="text-xs font-bold uppercase tracking-wider text-amber-500">
                      Step 06 of 07
                    </span>
                    <h2 className="text-2xl sm:text-3xl font-bold text-stone-900 dark:text-white">
                      One last thing.
                    </h2>
                    <p className="text-xs sm:text-sm text-stone-500 font-medium">
                      A few final details and links before we review your application.
                    </p>
                  </div>

                  {/* Motivation Textarea with 500 Char limit */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-extrabold text-stone-700 dark:text-stone-300">
                        Why are you interested in this role at Adyapan?
                      </label>
                      <span className="text-[11px] font-bold text-stone-400">
                        {formData.motivationPitch.length} / 500
                      </span>
                    </div>
                    <textarea
                      rows={4}
                      maxLength={500}
                      value={formData.motivationPitch}
                      onChange={(e) => handleChange('motivationPitch', e.target.value)}
                      placeholder="Tell us why this role interests you and what strengths you bring to our high-growth team..."
                      className="w-full px-4 py-3.5 rounded-2xl bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-stone-900 dark:text-white placeholder:text-stone-400 dark:placeholder:text-stone-500 font-semibold text-xs sm:text-sm outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 transition-all resize-none"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 pt-2">
                    <div className="space-y-1.5">
                      <label className="text-xs font-extrabold text-stone-700 dark:text-stone-300 flex items-center gap-1.5">
                        <Globe2 size={14} className="text-sky-600" />
                        <span>LinkedIn Profile URL</span>
                      </label>
                      <input
                        type="url"
                        value={formData.linkedin}
                        onChange={(e) => handleChange('linkedin', e.target.value)}
                        placeholder="https://linkedin.com/in/username"
                        className="w-full px-4 py-3.5 rounded-2xl bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-stone-900 dark:text-white placeholder:text-stone-400 dark:placeholder:text-stone-500 font-semibold text-xs sm:text-sm outline-none focus:border-amber-500"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-extrabold text-stone-700 dark:text-stone-300 flex items-center gap-1.5">
                        <Globe2 size={14} className="text-amber-500" />
                        <span>Portfolio / Website / GitHub</span>
                      </label>
                      <input
                        type="url"
                        value={formData.portfolio}
                        onChange={(e) => handleChange('portfolio', e.target.value)}
                        placeholder="https://yourportfolio.com or github.com"
                        className="w-full px-4 py-3.5 rounded-2xl bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-stone-900 dark:text-white placeholder:text-stone-400 dark:placeholder:text-stone-500 font-semibold text-xs sm:text-sm outline-none focus:border-amber-500"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* ── STEP 07: REVIEW ── */}
              {currentStep === 7 && (
                <div className="space-y-6 animate-fadeIn">
                  <div className="space-y-1.5">
                    <span className="text-xs font-bold uppercase tracking-wider text-amber-500">
                      Step 07 of 07
                    </span>
                    <h2 className="text-2xl sm:text-3xl font-bold text-stone-900 dark:text-white">
                      Review your application.
                    </h2>
                    <p className="text-xs sm:text-sm text-stone-500 font-medium">
                      Everything looks good? You're ready to submit to Adyapan hiring team.
                    </p>
                  </div>

                  {/* Readiness Card */}
                  <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-xl bg-emerald-500 text-white flex items-center justify-center font-bold">
                        <Check size={16} />
                      </div>
                      <div>
                        <b className="text-xs sm:text-sm font-bold text-emerald-800 dark:text-emerald-300 block">
                          APPLICATION READY
                        </b>
                        <small className="text-[11px] text-emerald-700/80 dark:text-emerald-400 font-semibold block">
                          All 7 verification steps completed
                        </small>
                      </div>
                    </div>
                    <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 px-3 py-1 rounded-full bg-emerald-500/20">
                      100% Complete
                    </span>
                  </div>

                  {/* Segmented Review Cards with Edit Links */}
                  <div className="space-y-4">

                    {/* Profile Summary */}
                    <div className="p-4 rounded-2xl bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 flex items-start justify-between">
                      <div className="space-y-1">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-amber-500">
                          01 Profile
                        </span>
                        <b className="text-sm font-bold text-stone-900 dark:text-white block">
                          {formData.firstName} {formData.lastName}
                        </b>
                        <p className="text-xs text-stone-600 dark:text-stone-300 font-semibold">
                          {formData.email} · {formData.phone}
                        </p>
                      </div>
                      <button
                        onClick={() => setCurrentStep(1)}
                        className="text-xs font-bold text-amber-500 hover:underline cursor-pointer"
                      >
                        Edit
                      </button>
                    </div>

                    {/* Experience Summary */}
                    <div className="p-4 rounded-2xl bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 flex items-start justify-between">
                      <div className="space-y-1">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-amber-500">
                          02 Experience
                        </span>
                        <b className="text-sm font-bold text-stone-900 dark:text-white block">
                          {formData.employmentStatus === 'FRESHER' ? 'Fresher / Student' : `${formData.experience} Experience`}
                        </b>
                        <p className="text-xs text-stone-600 dark:text-stone-300 font-semibold">
                          {formData.employmentStatus === 'FRESHER'
                            ? formData.collegeName || 'University Student'
                            : `${formData.currentPosition || 'Candidate'} at ${formData.currentCompany || 'Previous Company'}`}
                        </p>
                      </div>
                      <button
                        onClick={() => setCurrentStep(2)}
                        className="text-xs font-bold text-amber-500 hover:underline cursor-pointer"
                      >
                        Edit
                      </button>
                    </div>

                    {/* Resume & Skills Summary */}
                    <div className="p-4 rounded-2xl bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 flex items-start justify-between">
                      <div className="space-y-1">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-amber-500">
                          05 Resume & Skills
                        </span>
                        <b className="text-sm font-bold text-stone-900 dark:text-white block">
                          📄 {formData.resumeFileName || 'Resume.pdf'}
                        </b>
                        <p className="text-xs text-stone-600 dark:text-stone-300 font-semibold">
                          {formData.skills.length} skills listed ({formData.skills.slice(0, 3).join(', ')}...)
                        </p>
                      </div>
                      <button
                        onClick={() => setCurrentStep(5)}
                        className="text-xs font-bold text-amber-500 hover:underline cursor-pointer"
                      >
                        Edit
                      </button>
                    </div>

                  </div>
                </div>
              )}

              {/* ── STEP ACTION BUTTONS (BACK & CONTINUE / SUBMIT) ── */}
              <div className="flex items-center justify-between gap-3 pt-6 border-t border-stone-100 dark:border-stone-800">
                {currentStep > 1 ? (
                  <button
                    type="button"
                    onClick={prevStep}
                    className="inline-flex items-center gap-2 px-5 sm:px-6 py-3 rounded-2xl bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 dark:hover:bg-stone-700 text-stone-700 dark:text-stone-200 font-extrabold text-xs sm:text-sm transition-all cursor-pointer shrink-0"
                  >
                    <ArrowLeft size={16} />
                    <span>Back</span>
                  </button>
                ) : (
                  <Link
                    to={`/careers/${job?.slug || slug || ''}`}
                    className="inline-flex items-center gap-2 px-5 sm:px-6 py-3 rounded-2xl bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 dark:hover:bg-stone-700 text-stone-700 dark:text-stone-200 font-extrabold text-xs sm:text-sm transition-all cursor-pointer shrink-0"
                  >
                    <ArrowLeft size={16} />
                    <span>Back to Job</span>
                  </Link>
                )}

                {currentStep < 7 ? (
                  <button
                    type="button"
                    onClick={nextStep}
                    className="inline-flex items-center gap-2 px-6 sm:px-8 py-3.5 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-bold text-xs sm:text-sm shadow-xl shadow-amber-500/25 hover:scale-105 transition-all cursor-pointer shrink-0"
                  >
                    <span>Continue</span>
                    <ArrowRight size={16} />
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={handleSubmitApplication}
                    disabled={submitting}
                    className="inline-flex items-center gap-2 px-6 sm:px-10 py-4 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-bold text-xs sm:text-sm shadow-2xl shadow-amber-500/30 hover:scale-105 transition-all cursor-pointer disabled:opacity-50 shrink-0"
                  >
                    <span>Submit Application</span>
                    <ArrowRight size={16} />
                  </button>
                )}
              </div>

            </div>

            {/* ── RIGHT COLUMN: STICKY APPLICATION SUMMARY (35% / 4 Cols) ── */}
            <div className="lg:col-span-4 space-y-6 lg:sticky lg:top-28">

              <div className="bg-white dark:bg-stone-900 rounded-3xl p-6 border border-stone-200/80 dark:border-stone-800 shadow-xl space-y-5">
                <span className="text-[10px] font-bold uppercase tracking-wider text-amber-500 block">
                  YOUR APPLICATION
                </span>

                <div className="space-y-1 pb-3 border-b border-stone-100 dark:border-stone-800">
                  <h3 className="font-bold text-lg text-stone-900 dark:text-white leading-tight">
                    {displayJobTitle}
                  </h3>
                  <p className="text-xs font-bold text-stone-500">
                    {job?.company || 'Adyapan Technologies'}
                  </p>
                  <div className="flex items-center gap-3 text-xs font-semibold text-stone-500 pt-1">
                    <span>{job?.location || 'Hyderabad'}</span>
                    <span>·</span>
                    <span>{job?.type || 'Full Time'}</span>
                    <span>·</span>
                    <span className="text-amber-500 font-bold">{displaySalary}</span>
                  </div>
                </div>

                {/* Live Progress Bar */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs font-bold">
                    <span className="text-stone-700 dark:text-stone-300">Application Progress</span>
                    <span className="text-amber-500">{progressPercent}%</span>
                  </div>
                  <div className="w-full bg-stone-100 dark:bg-stone-800 h-2.5 rounded-full overflow-hidden">
                    <div
                      className="bg-gradient-to-r from-amber-500 to-orange-500 h-full rounded-full transition-all duration-300"
                      style={{ width: `${progressPercent}%` }}
                    />
                  </div>
                </div>

                {/* Step Checklist */}
                <div className="space-y-2 pt-2 text-xs font-bold">
                  {STEPS.map((s) => {
                    const isDone = currentStep > s.id;
                    const isCurrent = currentStep === s.id;

                    return (
                      <div
                        key={s.id}
                        className={`flex items-center gap-2.5 ${isDone
                          ? 'text-emerald-600 dark:text-emerald-400'
                          : isCurrent
                            ? 'text-amber-500 font-bold'
                            : 'text-stone-400'
                          }`}
                      >
                        <span className="text-sm">{isDone ? '✓' : isCurrent ? '●' : '○'}</span>
                        <span>{s.label}</span>
                      </div>
                    );
                  })}
                </div>

                <Link
                  to={`/careers/${slug}`}
                  className="block text-center text-xs font-bold text-amber-500 hover:text-amber-600 pt-2"
                >
                  View Job Details →
                </Link>
              </div>

            </div>

          </div>
        </section>

        {/* ── MULTI-STAGE SUBMITTING MODAL OVERLAY ── */}
        {submitting && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-md flex items-center justify-center p-4">
            <div className="bg-white dark:bg-stone-900 rounded-3xl p-8 max-w-md w-full text-center space-y-6 shadow-2xl border border-stone-200 dark:border-stone-800 animate-scaleUp">
              <div className="w-16 h-16 border-4 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto" />

              <div className="space-y-2">
                <h3 className="font-bold text-xl text-stone-900 dark:text-white">
                  Submitting your application...
                </h3>
                <p className="text-xs text-stone-500 font-medium">
                  Please hold on while we process your profile and documents.
                </p>
              </div>

              <div className="space-y-2.5 text-xs font-bold text-left p-4 rounded-2xl bg-stone-100 dark:bg-stone-800">
                <div className="flex items-center gap-2 text-emerald-600">
                  <span>✓</span>
                  <span>Validating candidate information</span>
                </div>
                <div className={`flex items-center gap-2 ${submitStage >= 2 ? 'text-emerald-600' : 'text-amber-500'}`}>
                  <span>{submitStage >= 2 ? '✓' : '●'}</span>
                  <span>Attaching and parsing resume document</span>
                </div>
                <div className={`flex items-center gap-2 ${submitStage >= 3 ? 'text-emerald-600' : 'text-stone-400'}`}>
                  <span>{submitStage >= 3 ? '✓' : '○'}</span>
                  <span>Saving application to Adyapan recruitment database</span>
                </div>
              </div>
            </div>
          </div>
        )}

      </main>
    </SiteShell>
  );
};

export default ApplyJob;
