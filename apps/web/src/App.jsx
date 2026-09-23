import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import CompanyDashboard from './pages/CompanyDashboard';
import SkillProfile from './pages/SkillProfile';
import JobSearchPage from './pages/JobSearchPage';
import ApplicantTrackingSystem from './pages/ApplicantTrackingSystem';
import MyApplications from './pages/MyApplications';
import CareerAssistant from './pages/CareerAssistant';
import ResumeParser from './pages/ResumeParser';
import SkillAssessment from './pages/SkillAssessment';
import AssessmentCenter from './pages/AssessmentCenter';
import SkillGapDashboard from './pages/SkillGapDashboard';
import InstitutionAnalytics from './pages/InstitutionAnalytics';
import ResumeBuilder from './pages/ResumeBuilder';
import RecruiterAnalytics from './pages/RecruiterAnalytics';
import VerificationDashboard from './pages/VerificationDashboard';
import { useAuthStore } from './store/authStore';

const ProtectedRoute = ({ children }) => {
  const { token } = useAuthStore();
  return token ? children : <Navigate to="/login" />;
};

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route
          path="/ats"
          element={
            <ProtectedRoute>
              <ApplicantTrackingSystem />
            </ProtectedRoute>
          }
        />
        <Route
          path="/company/dashboard"
          element={
            <ProtectedRoute>
              <CompanyDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/resume-parser"
          element={
            <ProtectedRoute>
              <ResumeParser />
            </ProtectedRoute>
          }
        />
        <Route
          path="/ai-assistant"
          element={
            <ProtectedRoute>
              <CareerAssistant />
            </ProtectedRoute>
          }
        />
        <Route
          path="/my-applications"
          element={
            <ProtectedRoute>
              <MyApplications />
            </ProtectedRoute>
          }
        />
        <Route
          path="/opportunities"
          element={
            <ProtectedRoute>
              <JobSearchPage />
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
          path="/profile" 
          element={
            <ProtectedRoute>
              <SkillProfile />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/assess" 
          element={
            <ProtectedRoute>
              <AssessmentCenter />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/assess/:skillId" 
          element={
            <ProtectedRoute>
              <SkillAssessment />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/gap-analysis" 
          element={
            <ProtectedRoute>
              <SkillGapDashboard />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/analytics" 
          element={
            <ProtectedRoute>
              <InstitutionAnalytics />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/recruiter-analytics" 
          element={
            <ProtectedRoute>
              <RecruiterAnalytics />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/resume-builder" 
          element={
            <ProtectedRoute>
              <ResumeBuilder />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/verify" 
          element={
            <ProtectedRoute>
              <VerificationDashboard />
            </ProtectedRoute>
          } 
        />
        <Route path="/" element={<Navigate to="/dashboard" />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
