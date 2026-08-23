import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { 
  ShieldCheck, 
  User, 
  MapPin, 
  GraduationCap, 
  CreditCard, 
  UploadCloud, 
  CheckCircle2, 
  AlertCircle, 
  FileText, 
  ArrowRight,
  ArrowLeft,
  Sparkles,
  HelpCircle,
  Clock
} from 'lucide-react';
import toast from 'react-hot-toast';
import onboardingService from '../../services/onboardingService';

const SecureOnboardingPage: React.FC = () => {
  const { token } = useParams<{ token: string }>();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [candidate, setCandidate] = useState<any>(null);
  const [job, setJob] = useState<any>(null);
  const [currentStep, setCurrentStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  // Form State
  const [personalDetails, setPersonalDetails] = useState({
    fullName: '',
    phone: '',
    email: '',
    dateOfBirth: '',
    gender: 'Male',
    currentAddress: '',
    permanentAddress: '',
  });

  const [emergencyContact, setEmergencyContact] = useState({
    contactName: '',
    relationship: 'Parent',
    phone: '',
  });

  const [educationDetails, setEducationDetails] = useState({
    highestDegree: 'B.Tech / B.E.',
    collegeName: '',
    yearOfPassing: '2025',
    percentageOrCgpa: '',
  });

  const [bankDetails, setBankDetails] = useState({
    accountHolderName: '',
    accountNumber: '',
    confirmAccountNumber: '',
    ifscCode: '',
    bankName: '',
    panNumber: '',
    aadhaarNumber: '',
  });

  // Document Uploads State
  const [documents, setDocuments] = useState<any[]>([
    { documentType: 'IDENTITY_PROOF', title: 'Aadhaar Card / Passport (Govt. ID)', fileUrl: '', fileName: '', status: 'PENDING' },
    { documentType: 'ADDRESS_PROOF', title: 'Address Proof Document', fileUrl: '', fileName: '', status: 'PENDING' },
    { documentType: 'EDUCATION_CERT', title: 'Degree / Provisional Certificate', fileUrl: '', fileName: '', status: 'PENDING' },
    { documentType: 'PHOTO', title: 'Passport Size Photograph', fileUrl: '', fileName: '', status: 'PENDING' },
    { documentType: 'BANK_DOC', title: 'Cancelled Cheque / Bank Passbook Front Page', fileUrl: '', fileName: '', status: 'PENDING' },
  ]);

  useEffect(() => {
    if (!token) {
      setError('Missing onboarding token. Please use the secure link sent to your email.');
      setLoading(false);
      return;
    }
    fetchOnboardingProfile();
  }, [token]);

  const fetchOnboardingProfile = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await onboardingService.getOnboardingByToken(token!);
      if (res?.success) {
        setCandidate(res.candidate);
        setJob(res.job);
        if (res.candidate) {
          setPersonalDetails((prev) => ({
            ...prev,
            fullName: `${res.candidate.firstName} ${res.candidate.lastName}`.trim(),
            email: res.candidate.email || '',
            phone: res.candidate.phone || '',
          }));
          setBankDetails((prev) => ({
            ...prev,
            accountHolderName: `${res.candidate.firstName} ${res.candidate.lastName}`.trim(),
          }));
        }
        if (res.onboarding?.status === 'DOCUMENTS_SUBMITTED' || res.onboarding?.status === 'VERIFIED') {
          setIsSubmitted(true);
        }
      } else {
        setError(res?.message || 'Invalid or expired onboarding link.');
      }
    } catch (err: any) {
      setError(err?.response?.data?.message || 'This onboarding session is invalid or has expired.');
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = (docIndex: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      toast.error('File size must be under 10MB.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      setDocuments((prev) => {
        const updated = [...prev];
        updated[docIndex] = {
          ...updated[docIndex],
          fileUrl: dataUrl,
          fileName: file.name,
          fileSize: file.size,
        };
        return updated;
      });
      toast.success(`${documents[docIndex].title} attached!`);
    };
    reader.readAsDataURL(file);
  };

  const handleSubmitOnboarding = async () => {
    if (!token) return;

    // Validate Bank info
    if (bankDetails.accountNumber !== bankDetails.confirmAccountNumber) {
      toast.error('Bank account numbers do not match.');
      setCurrentStep(3);
      return;
    }

    // Validate Documents
    const missingDoc = documents.find((d) => !d.fileUrl);
    if (missingDoc) {
      toast.error(`Please upload: ${missingDoc.title}`);
      setCurrentStep(4);
      return;
    }

    setSubmitting(true);
    const toastId = toast.loading('Encrypting and submitting onboarding verification profile...');
    try {
      const payload = {
        token,
        personalDetails,
        addressDetails: {
          currentAddress: personalDetails.currentAddress,
          permanentAddress: personalDetails.permanentAddress,
        },
        educationDetails,
        bankDetails,
        emergencyContact,
        documents: documents.map((d) => ({
          documentType: d.documentType,
          title: d.title,
          fileUrl: d.fileUrl,
          fileName: d.fileName,
          fileSize: d.fileSize,
        })),
      };

      const res = await onboardingService.submitOnboarding(payload);
      if (res?.success) {
        setIsSubmitted(true);
        toast.success('Onboarding documents submitted successfully! Our HR team will review your verification shortly.', { id: toastId });
      } else {
        toast.error(res?.message || 'Submission failed.', { id: toastId });
      }
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Failed to submit onboarding profile.', { id: toastId });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
        <div className="flex flex-col items-center gap-4 text-center">
          <div className="w-12 h-12 border-4 border-amber-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-slate-400 font-medium text-sm">Opening secure candidate onboarding session...</p>
        </div>
      </div>
    );
  }

  if (error || !candidate) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-slate-900 border border-slate-800 rounded-3xl p-8 text-center shadow-2xl">
          <div className="w-16 h-16 bg-red-500/10 text-red-400 rounded-2xl flex items-center justify-center mx-auto mb-5">
            <AlertCircle className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-bold text-white mb-2">Onboarding Session Expired</h2>
          <p className="text-slate-400 text-sm mb-6 leading-relaxed">
            {error || 'This onboarding session could not be verified or has already expired.'}
          </p>
          <a
            href="mailto:hr@adyapan.com"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-sm transition-all"
          >
            <HelpCircle className="w-4 h-4" /> Contact HR Team
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between py-8 px-4 sm:px-6">
      {/* Top Navbar */}
      <header className="max-w-4xl w-full mx-auto flex items-center justify-between pb-6 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-amber-500 to-amber-600 flex items-center justify-center text-slate-950 font-black text-xl shadow-lg shadow-amber-500/20">
            A
          </div>
          <div>
            <span className="font-extrabold text-lg text-white tracking-tight">Adyapan Edutech</span>
            <span className="block text-[11px] font-semibold text-amber-400 uppercase tracking-widest">Candidate Onboarding Portal</span>
          </div>
        </div>

        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold">
          <ShieldCheck className="w-4 h-4" />
          <span>SSL 256-Bit Encrypted</span>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-3xl w-full mx-auto my-8">
        {isSubmitted ? (
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 sm:p-12 text-center shadow-2xl">
            <div className="w-20 h-20 rounded-3xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto mb-6 shadow-xl">
              <CheckCircle2 className="w-10 h-10" />
            </div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold uppercase tracking-wider mb-3">
              <Sparkles className="w-3.5 h-3.5" />
              Verification In Progress
            </div>
            <h1 className="text-3xl font-extrabold text-white mb-3">Onboarding Profile Submitted!</h1>
            <p className="text-slate-400 text-sm max-w-lg mx-auto leading-relaxed mb-8">
              Thank you, <strong className="text-slate-200">{personalDetails.fullName}</strong>. Your personal, bank, and verification documents have been securely transmitted to the Adyapan Talent Acquisition & Verification team.
            </p>

            <div className="max-w-md mx-auto p-5 rounded-2xl bg-slate-950/60 border border-slate-800 text-left space-y-3 text-xs sm:text-sm text-slate-300">
              <div className="flex items-center gap-3">
                <Clock className="w-5 h-5 text-amber-400 shrink-0" />
                <span>HR Document Verification TAT: <strong>24 to 48 Hours</strong></span>
              </div>
              <div className="flex items-center gap-3">
                <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                <span>Joining confirmation and Employee ID will be emailed to <strong>{candidate.email}</strong></span>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-10 shadow-2xl">
            {/* Header Banner */}
            <div className="pb-6 border-b border-slate-800">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                <div>
                  <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
                    Employee Onboarding Verification
                  </h1>
                  <p className="text-slate-400 text-xs sm:text-sm mt-1">
                    Candidate: <strong className="text-amber-400">{candidate.firstName} {candidate.lastName}</strong> • Position: {job?.title || 'Business Development Associate'}
                  </p>
                </div>
                <span className="px-3 py-1 rounded-full bg-slate-800 border border-slate-700 text-slate-300 text-xs font-semibold">
                  Step {currentStep} of 4
                </span>
              </div>

              {/* Step Progress Tabs */}
              <div className="grid grid-cols-4 gap-2 mt-6">
                {[
                  { num: 1, label: 'Personal' },
                  { num: 2, label: 'Education' },
                  { num: 3, label: 'Bank & Tax' },
                  { num: 4, label: 'Documents' },
                ].map((s) => (
                  <button
                    key={s.num}
                    onClick={() => setCurrentStep(s.num)}
                    className={`py-2 px-1 text-center rounded-xl text-xs font-bold transition-all ${
                      currentStep === s.num
                        ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                        : currentStep > s.num
                        ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                        : 'bg-slate-800 text-slate-400 hover:bg-slate-750'
                    }`}
                  >
                    {s.num}. {s.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Step 1: Personal & Emergency Contact */}
            {currentStep === 1 && (
              <div className="space-y-6 pt-6 animate-fadeIn">
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <User className="w-5 h-5 text-amber-400" /> Personal & Emergency Details
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-semibold text-slate-400 uppercase">Full Legal Name</label>
                    <input
                      type="text"
                      value={personalDetails.fullName}
                      onChange={(e) => setPersonalDetails({ ...personalDetails, fullName: e.target.value })}
                      className="mt-1 w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-800 text-white text-sm focus:border-amber-500 outline-none"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-slate-400 uppercase">Phone Number</label>
                    <input
                      type="text"
                      value={personalDetails.phone}
                      onChange={(e) => setPersonalDetails({ ...personalDetails, phone: e.target.value })}
                      className="mt-1 w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-800 text-white text-sm focus:border-amber-500 outline-none"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-slate-400 uppercase">Date of Birth</label>
                    <input
                      type="date"
                      value={personalDetails.dateOfBirth}
                      onChange={(e) => setPersonalDetails({ ...personalDetails, dateOfBirth: e.target.value })}
                      className="mt-1 w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-800 text-white text-sm focus:border-amber-500 outline-none"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-slate-400 uppercase">Gender</label>
                    <select
                      value={personalDetails.gender}
                      onChange={(e) => setPersonalDetails({ ...personalDetails, gender: e.target.value })}
                      className="mt-1 w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-800 text-white text-sm focus:border-amber-500 outline-none"
                    >
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-400 uppercase">Current Residential Address</label>
                  <textarea
                    rows={2}
                    value={personalDetails.currentAddress}
                    onChange={(e) => setPersonalDetails({ ...personalDetails, currentAddress: e.target.value })}
                    placeholder="Street, Area, City, State, PIN Code"
                    className="mt-1 w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-800 text-white text-sm focus:border-amber-500 outline-none"
                  />
                </div>

                <div className="pt-4 border-t border-slate-800">
                  <h4 className="text-sm font-bold text-slate-300 uppercase tracking-wider mb-3">Emergency Contact</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label className="text-xs font-semibold text-slate-400 uppercase">Contact Name</label>
                      <input
                        type="text"
                        placeholder="e.g. Ramesh Kumar"
                        value={emergencyContact.contactName}
                        onChange={(e) => setEmergencyContact({ ...emergencyContact, contactName: e.target.value })}
                        className="mt-1 w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-sm focus:border-amber-500 outline-none"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-slate-400 uppercase">Relationship</label>
                      <input
                        type="text"
                        placeholder="e.g. Father / Mother / Spouse"
                        value={emergencyContact.relationship}
                        onChange={(e) => setEmergencyContact({ ...emergencyContact, relationship: e.target.value })}
                        className="mt-1 w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-sm focus:border-amber-500 outline-none"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-slate-400 uppercase">Emergency Phone</label>
                      <input
                        type="text"
                        placeholder="e.g. +91 9876543210"
                        value={emergencyContact.phone}
                        onChange={(e) => setEmergencyContact({ ...emergencyContact, phone: e.target.value })}
                        className="mt-1 w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-sm focus:border-amber-500 outline-none"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex justify-end pt-4">
                  <button
                    onClick={() => setCurrentStep(2)}
                    className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-sm transition-all"
                  >
                    Next: Education <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            {/* Step 2: Education Background */}
            {currentStep === 2 && (
              <div className="space-y-6 pt-6 animate-fadeIn">
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <GraduationCap className="w-5 h-5 text-amber-400" /> Academic Qualifications
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-semibold text-slate-400 uppercase">Highest Degree / Diploma</label>
                    <input
                      type="text"
                      placeholder="e.g. B.Tech (Computer Science), B.Com, MBA"
                      value={educationDetails.highestDegree}
                      onChange={(e) => setEducationDetails({ ...educationDetails, highestDegree: e.target.value })}
                      className="mt-1 w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-800 text-white text-sm focus:border-amber-500 outline-none"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-slate-400 uppercase">College / University Name</label>
                    <input
                      type="text"
                      placeholder="e.g. Delhi University / JNTU"
                      value={educationDetails.collegeName}
                      onChange={(e) => setEducationDetails({ ...educationDetails, collegeName: e.target.value })}
                      className="mt-1 w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-800 text-white text-sm focus:border-amber-500 outline-none"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-slate-400 uppercase">Year of Passing</label>
                    <input
                      type="text"
                      placeholder="e.g. 2025"
                      value={educationDetails.yearOfPassing}
                      onChange={(e) => setEducationDetails({ ...educationDetails, yearOfPassing: e.target.value })}
                      className="mt-1 w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-800 text-white text-sm focus:border-amber-500 outline-none"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-slate-400 uppercase">CGPA / Percentage</label>
                    <input
                      type="text"
                      placeholder="e.g. 8.4 CGPA or 78%"
                      value={educationDetails.percentageOrCgpa}
                      onChange={(e) => setEducationDetails({ ...educationDetails, percentageOrCgpa: e.target.value })}
                      className="mt-1 w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-800 text-white text-sm focus:border-amber-500 outline-none"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between pt-4">
                  <button
                    onClick={() => setCurrentStep(1)}
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-sm transition-all"
                  >
                    <ArrowLeft className="w-4 h-4" /> Back
                  </button>
                  <button
                    onClick={() => setCurrentStep(3)}
                    className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-sm transition-all"
                  >
                    Next: Bank & Payroll <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            {/* Step 3: Bank & Tax Details */}
            {currentStep === 3 && (
              <div className="space-y-6 pt-6 animate-fadeIn">
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <CreditCard className="w-5 h-5 text-amber-400" /> Bank & Statutory Payroll Info
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-semibold text-slate-400 uppercase">Account Holder Name</label>
                    <input
                      type="text"
                      value={bankDetails.accountHolderName}
                      onChange={(e) => setBankDetails({ ...bankDetails, accountHolderName: e.target.value })}
                      className="mt-1 w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-800 text-white text-sm focus:border-amber-500 outline-none"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-slate-400 uppercase">Bank Name</label>
                    <input
                      type="text"
                      placeholder="e.g. HDFC Bank / ICICI / SBI"
                      value={bankDetails.bankName}
                      onChange={(e) => setBankDetails({ ...bankDetails, bankName: e.target.value })}
                      className="mt-1 w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-800 text-white text-sm focus:border-amber-500 outline-none"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-slate-400 uppercase">Bank Account Number</label>
                    <input
                      type="password"
                      placeholder="Enter account number"
                      value={bankDetails.accountNumber}
                      onChange={(e) => setBankDetails({ ...bankDetails, accountNumber: e.target.value })}
                      className="mt-1 w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-800 text-white text-sm focus:border-amber-500 outline-none"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-slate-400 uppercase">Confirm Account Number</label>
                    <input
                      type="text"
                      placeholder="Re-enter account number"
                      value={bankDetails.confirmAccountNumber}
                      onChange={(e) => setBankDetails({ ...bankDetails, confirmAccountNumber: e.target.value })}
                      className="mt-1 w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-800 text-white text-sm focus:border-amber-500 outline-none"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-slate-400 uppercase">IFSC Code</label>
                    <input
                      type="text"
                      placeholder="e.g. HDFC0001234"
                      value={bankDetails.ifscCode}
                      onChange={(e) => setBankDetails({ ...bankDetails, ifscCode: e.target.value.toUpperCase() })}
                      className="mt-1 w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-800 text-white text-sm focus:border-amber-500 outline-none uppercase"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-slate-400 uppercase">PAN Card Number</label>
                    <input
                      type="text"
                      placeholder="e.g. ABCDE1234F"
                      value={bankDetails.panNumber}
                      onChange={(e) => setBankDetails({ ...bankDetails, panNumber: e.target.value.toUpperCase() })}
                      className="mt-1 w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-800 text-white text-sm focus:border-amber-500 outline-none uppercase"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between pt-4">
                  <button
                    onClick={() => setCurrentStep(2)}
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-sm transition-all"
                  >
                    <ArrowLeft className="w-4 h-4" /> Back
                  </button>
                  <button
                    onClick={() => setCurrentStep(4)}
                    className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-sm transition-all"
                  >
                    Next: Upload Documents <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            {/* Step 4: Secure Document Upload */}
            {currentStep === 4 && (
              <div className="space-y-6 pt-6 animate-fadeIn">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-bold text-white flex items-center gap-2">
                    <UploadCloud className="w-5 h-5 text-amber-400" /> Mandatory Document Uploads
                  </h3>
                  <span className="text-xs text-slate-400">PDF, JPG, PNG under 10MB</span>
                </div>

                <div className="space-y-3.5">
                  {documents.map((doc, idx) => (
                    <div
                      key={idx}
                      className={`p-4 rounded-2xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                        doc.fileUrl
                          ? 'bg-emerald-950/20 border-emerald-500/30'
                          : 'bg-slate-950/60 border-slate-800'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                          doc.fileUrl ? 'bg-emerald-500/20 text-emerald-400' : 'bg-slate-800 text-slate-400'
                        }`}>
                          <FileText className="w-5 h-5" />
                        </div>
                        <div>
                          <p className="text-sm font-bold text-white">{doc.title}</p>
                          {doc.fileName ? (
                            <span className="text-xs text-emerald-400 flex items-center gap-1 mt-0.5">
                              <CheckCircle2 className="w-3.5 h-3.5" /> {doc.fileName}
                            </span>
                          ) : (
                            <span className="text-xs text-slate-500">Document required for verification</span>
                          )}
                        </div>
                      </div>

                      <label className="cursor-pointer inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-semibold text-xs transition-all border border-slate-700 shrink-0">
                        <UploadCloud className="w-4 h-4 text-amber-400" />
                        <span>{doc.fileUrl ? 'Replace File' : 'Upload File'}</span>
                        <input
                          type="file"
                          accept=".pdf,.jpg,.jpeg,.png"
                          onChange={(e) => handleFileUpload(idx, e)}
                          className="hidden"
                        />
                      </label>
                    </div>
                  ))}
                </div>

                <div className="flex items-center justify-between pt-6 border-t border-slate-800">
                  <button
                    onClick={() => setCurrentStep(3)}
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-sm transition-all"
                  >
                    <ArrowLeft className="w-4 h-4" /> Back
                  </button>

                  <button
                    onClick={handleSubmitOnboarding}
                    disabled={submitting}
                    className="inline-flex items-center gap-2 px-8 py-3.5 rounded-2xl bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white font-extrabold text-base transition-all shadow-xl shadow-emerald-500/25 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50"
                  >
                    {submitting ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        Submitting Verification Profile...
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="w-5 h-5" />
                        Complete & Submit Onboarding
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="text-center text-xs text-slate-600 py-4">
        &copy; {new Date().getFullYear()} Adyapan Edutech Pvt. Ltd. All rights reserved. Secure ATS recruitment automation.
      </footer>
    </div>
  );
};

export default SecureOnboardingPage;
