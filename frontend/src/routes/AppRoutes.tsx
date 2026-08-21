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

// Auth Pages
import Login from '../pages/auth/Login';

// Public Candidate Portal Pages
import Careers from '../candidate-portal/Careers';
import PublicJobs from '../candidate-portal/PublicJobs';
import PublicJob from '../candidate-portal/PublicJob';
import ApplyJob from '../candidate-portal/ApplyJob';
import ApplicationSuccess from '../candidate-portal/ApplicationSuccess';
import CandidateLogin from '../candidate-portal/CandidateLogin';
import CandidateRegister from '../candidate-portal/CandidateRegister';
import MyApplications from '../candidate-portal/MyApplications';
import AboutUs from '../candidate-portal/AboutUs';
import LifeAtAdyapan from '../candidate-portal/LifeAtAdyapan';
import ContactUs from '../pages/contact/ContactUs';
import LegalPrivacy from '../pages/legal/LegalPrivacy';
import LegalTerms from '../pages/legal/LegalTerms';

import AuthPage from '../candidate-portal/AuthPage';

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
      {/* ===== PUBLIC CANDIDATE PORTAL ===== */}
      <Route path="/" element={<Careers />} />
      <Route path="/careers" element={<Careers />} />
      <Route path="/open-positions" element={<PublicJobs />} />
      <Route path="/careers/jobs" element={<PublicJobs />} />
      <Route path="/careers/:slug" element={<PublicJob />} />
      <Route path="/careers/:slug/apply" element={<ApplyJob />} />
      <Route path="/open-positions/:slug" element={<PublicJob />} />
      <Route path="/open-positions/:slug/apply" element={<ApplyJob />} />
      <Route path="/application-success" element={<ApplicationSuccess />} />
      <Route path="/about" element={<AboutUs />} />
      <Route path="/life-at-adyapan" element={<LifeAtAdyapan />} />
      <Route path="/contact" element={<ContactUs />} />
      <Route path="/privacy" element={<LegalPrivacy />} />
      <Route path="/terms" element={<LegalTerms />} />

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

      {/* ===== ADMIN RECRUITER PROTECTED ===== */}
      <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
      <Route path="/jobs" element={<ProtectedRoute><Jobs /></ProtectedRoute>} />
      <Route path="/jobs/new" element={<ProtectedRoute><CreateJob /></ProtectedRoute>} />
      <Route path="/jobs/create" element={<ProtectedRoute><CreateJob /></ProtectedRoute>} />
      <Route path="/jobs/:id" element={<ProtectedRoute><JobDetails /></ProtectedRoute>} />
      <Route path="/admin/jobs" element={<ProtectedRoute><Jobs /></ProtectedRoute>} />
      <Route path="/admin/jobs/new" element={<ProtectedRoute><CreateJob /></ProtectedRoute>} />
      <Route path="/admin/jobs/create" element={<ProtectedRoute><CreateJob /></ProtectedRoute>} />
      <Route path="/admin/jobs/:id" element={<ProtectedRoute><JobDetails /></ProtectedRoute>} />
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
