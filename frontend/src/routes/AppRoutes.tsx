import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCandidateAuth } from '../context/CandidateAuthContext';

// Recruiter Dashboard Pages
import Dashboard from '../pages/dashboard/Dashboard';
import Jobs from '../pages/jobs/Jobs';
import CreateJob from '../pages/jobs/CreateJob';
import JobDetails from '../pages/jobs/JobDetails';
import Candidates from '../pages/candidates/Candidates';
import CandidateDetails from '../pages/candidates/CandidateDetails';
import CompareCandidates from '../pages/candidates/CompareCandidates';
import Interviews from '../pages/interviews/Interviews';
import InterviewDetails from '../pages/interviews/InterviewDetails';
import Offers from '../pages/offers/Offers';
import OfferDetails from '../pages/offers/OfferDetails';
import AnalyticsPage from '../pages/analytics/AnalyticsPage';
import AIAssistant from '../pages/assistant/AIAssistant';
import AdminProfile from '../pages/profile/AdminProfile';
import AdminContactUs from '../pages/contact/AdminContactUs';

// Dedicated ATS Workflow Pages (HR Manager & Admin)
import HRManagerDashboard from '../pages/hr-manager/HRManagerDashboard';
import ScreeningApprovalsPage from '../pages/hr-manager/ScreeningApprovalsPage';
import WorkloadDistributionPage from '../pages/hr-manager/WorkloadDistributionPage';
import FinalRoundSelectedPage from '../pages/hr-manager/FinalRoundSelectedPage';
import CommunicationHistoryPage from '../pages/hr-manager/CommunicationHistoryPage';
import HiringReportsPage from '../pages/hr-manager/HiringReportsPage';
import AuditLogsPage from '../pages/admin/AuditLogsPage';

// Dedicated ATS Workflow Pages (HR Specialist)
import HRDashboard from '../pages/hr/HRDashboard';
import HRSpecialistCandidatesPage from '../pages/hr/HRSpecialistCandidatesPage';
import HRSpecialistRound1Page from '../pages/hr/HRSpecialistRound1Page';
import HRSpecialistRound2Page from '../pages/hr/HRSpecialistRound2Page';
import HRSpecialistEvaluationsPage from '../pages/hr/HRSpecialistEvaluationsPage';

// Public Secure Candidate Token Pages (NO LOGIN REQUIRED)
import SecureInterviewPage from '../candidate-portal/secure/SecureInterviewPage';
import SecureOfferPage from '../candidate-portal/secure/SecureOfferPage';
import SecureOnboardingPage from '../candidate-portal/secure/SecureOnboardingPage';

// Auth Pages
import Login from '../pages/auth/Login';
import AuthPage from '../candidate-portal/AuthPage';

// Public Career Portal Pages (Intact & Preserved)
import Careers from '../candidate-portal/Careers';
import PublicJobs from '../candidate-portal/PublicJobs';
import PublicJob from '../candidate-portal/PublicJob';
import ApplyJob from '../candidate-portal/ApplyJob';
import ApplicationSuccess from '../candidate-portal/ApplicationSuccess';
import MyApplications from '../candidate-portal/MyApplications';
import AboutUs from '../candidate-portal/AboutUs';
import LifeAtAdyapan from '../candidate-portal/LifeAtAdyapan';
import ContactUs from '../pages/contact/ContactUs';
import LegalPrivacy from '../pages/legal/LegalPrivacy';
import LegalTerms from '../pages/legal/LegalTerms';

// Admin Protected Route
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-3 border-amber-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-sm font-medium text-slate-500">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

// Candidate Protected Route
const CandidateProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { candidate } = useCandidateAuth();

  if (!candidate) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

const AppRoutes = () => {
  return (
    <Routes>
      {/* ===== PUBLIC CANDIDATE PORTAL (100% PRESERVED & UNTOUCHED) ===== */}
      <Route path="/" element={<Careers />} />
      <Route path="/careers" element={<Careers />} />
      <Route path="/open-positions" element={<PublicJobs />} />
      <Route path="/jobs-all" element={<PublicJobs />} />
      <Route path="/careers/jobs" element={<PublicJobs />} />
      <Route path="/careers/:slug" element={<PublicJob />} />
      <Route path="/careers/:slug/apply" element={<ApplyJob />} />
      <Route path="/open-positions/:slug" element={<PublicJob />} />
      <Route path="/open-positions/:slug/apply" element={<ApplyJob />} />
      <Route path="/job/:slug" element={<PublicJob />} />
      <Route path="/apply/:slug" element={<ApplyJob />} />
      <Route path="/application-success" element={<ApplicationSuccess />} />
      <Route path="/about" element={<AboutUs />} />
      <Route path="/about-us" element={<AboutUs />} />
      <Route path="/life" element={<LifeAtAdyapan />} />
      <Route path="/life-at-adyapan" element={<LifeAtAdyapan />} />
      <Route path="/contact" element={<ContactUs />} />
      <Route path="/contact-us" element={<ContactUs />} />
      <Route path="/support" element={<ContactUs />} />
      <Route path="/help" element={<ContactUs />} />
      <Route path="/privacy" element={<LegalPrivacy />} />
      <Route path="/privacy-policy" element={<LegalPrivacy />} />
      <Route path="/terms" element={<LegalTerms />} />
      <Route path="/terms-of-service" element={<LegalTerms />} />

      {/* ===== PUBLIC CANDIDATE SECURE TOKEN PAGES (NO LOGIN REQUIRED) ===== */}
      <Route path="/secure/interview/:token" element={<SecureInterviewPage />} />
      <Route path="/secure/offer/:token" element={<SecureOfferPage />} />
      <Route path="/offers/accept" element={<SecureOfferPage />} />
      <Route path="/secure/onboarding/:token" element={<SecureOnboardingPage />} />
      <Route path="/secure/documents/:token" element={<SecureOnboardingPage />} />

      {/* ===== AUTH ===== */}
      <Route path="/auth" element={<AuthPage />} />
      <Route path="/login" element={<AuthPage />} />
      <Route path="/register" element={<AuthPage />} />
      <Route path="/admin/login" element={<Login />} />
      <Route path="/admin" element={<Navigate to="/dashboard" replace />} />

      {/* ===== CANDIDATE PROTECTED ===== */}
      <Route
        path="/my-applications"
        element={
          <CandidateProtectedRoute>
            <MyApplications />
          </CandidateProtectedRoute>
        }
      />

      {/* ===== HR MANAGER DEDICATED ATS WORKFLOW ROUTES ===== */}
      <Route path="/hr-manager/dashboard" element={<ProtectedRoute><HRManagerDashboard /></ProtectedRoute>} />
      <Route path="/hr-manager/candidates" element={<ProtectedRoute><Candidates /></ProtectedRoute>} />
      <Route path="/hr-manager/screening" element={<ProtectedRoute><ScreeningApprovalsPage /></ProtectedRoute>} />
      <Route path="/hr-manager/workload" element={<ProtectedRoute><WorkloadDistributionPage /></ProtectedRoute>} />
      <Route path="/hr-manager/final-selected" element={<ProtectedRoute><FinalRoundSelectedPage /></ProtectedRoute>} />
      <Route path="/hr-manager/communications" element={<ProtectedRoute><CommunicationHistoryPage /></ProtectedRoute>} />
      <Route path="/hr-manager/reports" element={<ProtectedRoute><HiringReportsPage /></ProtectedRoute>} />

      {/* ===== HR SPECIALIST DEDICATED WORKFLOW ROUTES ===== */}
      <Route path="/hr/dashboard" element={<ProtectedRoute><HRDashboard /></ProtectedRoute>} />
      <Route path="/hr/candidates" element={<ProtectedRoute><HRSpecialistCandidatesPage /></ProtectedRoute>} />
      <Route path="/hr/round-1" element={<ProtectedRoute><HRSpecialistRound1Page /></ProtectedRoute>} />
      <Route path="/hr/round-2" element={<ProtectedRoute><HRSpecialistRound2Page /></ProtectedRoute>} />
      <Route path="/hr/evaluations" element={<ProtectedRoute><HRSpecialistEvaluationsPage /></ProtectedRoute>} />

      {/* ===== ADMIN RECRUITER & MANAGEMENT ROUTES ===== */}
      <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
      <Route path="/admin/candidates" element={<ProtectedRoute><Candidates /></ProtectedRoute>} />
      <Route path="/admin/screening" element={<ProtectedRoute><ScreeningApprovalsPage /></ProtectedRoute>} />
      <Route path="/admin/workload" element={<ProtectedRoute><WorkloadDistributionPage /></ProtectedRoute>} />
      <Route path="/admin/final-selected" element={<ProtectedRoute><FinalRoundSelectedPage /></ProtectedRoute>} />
      <Route path="/admin/communications" element={<ProtectedRoute><CommunicationHistoryPage /></ProtectedRoute>} />
      <Route path="/admin/reports" element={<ProtectedRoute><HiringReportsPage /></ProtectedRoute>} />
      <Route path="/admin/audit-logs" element={<ProtectedRoute><AuditLogsPage /></ProtectedRoute>} />

      {/* Job Management */}
      <Route path="/jobs" element={<ProtectedRoute><Jobs /></ProtectedRoute>} />
      <Route path="/jobs/new" element={<ProtectedRoute><CreateJob /></ProtectedRoute>} />
      <Route path="/jobs/create" element={<ProtectedRoute><CreateJob /></ProtectedRoute>} />
      <Route path="/jobs/:id" element={<ProtectedRoute><JobDetails /></ProtectedRoute>} />
      <Route path="/admin/jobs" element={<ProtectedRoute><Jobs /></ProtectedRoute>} />
      <Route path="/admin/jobs/new" element={<ProtectedRoute><CreateJob /></ProtectedRoute>} />
      <Route path="/admin/jobs/create" element={<ProtectedRoute><CreateJob /></ProtectedRoute>} />
      <Route path="/admin/jobs/:id" element={<ProtectedRoute><JobDetails /></ProtectedRoute>} />

      {/* Candidate Hub & Directory */}
      <Route path="/candidates" element={<ProtectedRoute><Candidates /></ProtectedRoute>} />
      <Route path="/candidates/compare" element={<ProtectedRoute><CompareCandidates /></ProtectedRoute>} />
      <Route path="/candidates/:id" element={<ProtectedRoute><CandidateDetails /></ProtectedRoute>} />
      <Route path="/interviews" element={<ProtectedRoute><Interviews /></ProtectedRoute>} />
      <Route path="/interviews/:id" element={<ProtectedRoute><InterviewDetails /></ProtectedRoute>} />
      <Route path="/offers" element={<ProtectedRoute><Offers /></ProtectedRoute>} />
      <Route path="/offers/:id" element={<ProtectedRoute><OfferDetails /></ProtectedRoute>} />
      <Route path="/analytics" element={<ProtectedRoute><AnalyticsPage /></ProtectedRoute>} />
      <Route path="/assistant" element={<ProtectedRoute><AIAssistant /></ProtectedRoute>} />
      <Route path="/profile" element={<ProtectedRoute><AdminProfile /></ProtectedRoute>} />
      <Route path="/admin-contact" element={<ProtectedRoute><AdminContactUs /></ProtectedRoute>} />

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/careers" replace />} />
    </Routes>
  );
};

export default AppRoutes;
