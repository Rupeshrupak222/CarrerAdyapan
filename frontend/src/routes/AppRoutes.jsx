import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

// Auth Pages
import Login from '../pages/auth/Login';
import Register from '../pages/auth/Register';

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

// Public Candidate Portal Pages
import Careers from '../candidate-portal/Careers';
import PublicJob from '../candidate-portal/PublicJob';
import ApplyJob from '../candidate-portal/ApplyJob';
import ApplicationSuccess from '../candidate-portal/ApplicationSuccess';
import ContactUs from '../pages/contact/ContactUs';
import LegalPrivacy from '../pages/legal/LegalPrivacy';
import LegalTerms from '../pages/legal/LegalTerms';

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-3">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-sm font-medium text-slate-600">Loading HireAI Platform...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

const AppRoutes = () => {
  return (
    <Routes>
      {/* Auth Routes */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      {/* Recruiter Protected Routes */}
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/jobs"
        element={
          <ProtectedRoute>
            <Jobs />
          </ProtectedRoute>
        }
      />
      <Route
        path="/jobs/new"
        element={
          <ProtectedRoute>
            <CreateJob />
          </ProtectedRoute>
        }
      />
      <Route
        path="/jobs/create"
        element={
          <ProtectedRoute>
            <CreateJob />
          </ProtectedRoute>
        }
      />
      <Route
        path="/jobs/:id"
        element={
          <ProtectedRoute>
            <JobDetails />
          </ProtectedRoute>
        }
      />
      <Route
        path="/candidates"
        element={
          <ProtectedRoute>
            <Candidates />
          </ProtectedRoute>
        }
      />
      <Route
        path="/candidates/compare"
        element={
          <ProtectedRoute>
            <CompareCandidates />
          </ProtectedRoute>
        }
      />
      <Route
        path="/candidates/:id"
        element={
          <ProtectedRoute>
            <CandidateDetails />
          </ProtectedRoute>
        }
      />
      <Route
        path="/interviews"
        element={
          <ProtectedRoute>
            <Interviews />
          </ProtectedRoute>
        }
      />
      <Route
        path="/interviews/:id"
        element={
          <ProtectedRoute>
            <InterviewDetails />
          </ProtectedRoute>
        }
      />
      <Route
        path="/offers"
        element={
          <ProtectedRoute>
            <Offers />
          </ProtectedRoute>
        }
      />
      <Route
        path="/offers/:id"
        element={
          <ProtectedRoute>
            <OfferDetails />
          </ProtectedRoute>
        }
      />
      <Route
        path="/analytics"
        element={
          <ProtectedRoute>
            <AnalyticsPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/assistant"
        element={
          <ProtectedRoute>
            <AIAssistant />
          </ProtectedRoute>
        }
      />
      <Route
        path="/profile"
        element={
          <ProtectedRoute>
            <AdminProfile />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin-contact"
        element={
          <ProtectedRoute>
            <AdminContactUs />
          </ProtectedRoute>
        }
      />
      {/* Public Candidate Portal Routes */}
      <Route path="/careers" element={<Careers />} />
      <Route path="/careers/:slug" element={<PublicJob />} />
      <Route path="/careers/:slug/apply" element={<ApplyJob />} />
      <Route path="/application-success" element={<ApplicationSuccess />} />
      <Route path="/contact" element={<ContactUs />} />
      <Route path="/privacy" element={<LegalPrivacy />} />
      <Route path="/terms" element={<LegalTerms />} />

      {/* Fallback Redirect */}
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
};

export default AppRoutes;
