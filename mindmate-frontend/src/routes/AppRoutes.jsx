import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import ProtectedRoute from '../components/Protectedroute';
import StudentLayout from '../Layout/StudentLayout';
import CounselorPsychologistLayout from '../Layout/CounselorPsychologistLayout';
import AdminLayout from '../Layout/AdminLayout';
import VerifyUpdateStudent from '../pages/student/VerifyUpdateStudent';
import VerifyPasswordStudent from '../pages/student/VerifyPasswordStudent';
import VerifyUpdateCounselorPsychologist from '../pages/counselorPsychologist/VerifyUpdateCounselorPsychologist';
import VerifyPasswordCounselorPsychologist from '../pages/counselorPsychologist/VerifyPasswordCounselorPsychologist';
import VerifyUpdateAdmin from '../pages/admin/VerifyUpdateAdmin';
import VerifyPasswordAdmin from '../pages/admin/VerifyPasswordAdmin';

// Welcome page
import Welcome from '../components/Welcome';

// Login for All
import CentralizedLogin from '../pages/CentralizedLogin';

// Student pages
import StudentSignup from '../pages/student/Signup';
import Profile from '../pages/student/Profile';
import ForceResetPassword from '../components/ForceResetPassword';
import Appointment from '../pages/student/Appointment';
import StudentHome from '../pages/student/StudentHome';
import VentWall from '../pages/student/VentWall';
import Feedback from '../pages/student/Feedback';
import Resource from '../pages/student/Resource';
import Report from '../pages/student/Report';

// CounselorPsychologist pages
import CounselorPsychologistSignup from '../pages/counselorPsychologist/Signup';
import CounselorPsychologistProfile from '../pages/counselorPsychologist/Profile';
import CounselorPsychologistAppointment from '../pages/counselorPsychologist/Appointment';
import CounselorPsychologistAvailability from '../pages/counselorPsychologist/Availability';
import CounselorPsychologistFeedback from '../pages/counselorPsychologist/Feedback';
import CounselorPsychologistResource from '../pages/counselorPsychologist/Resource';
import CouncPsychoDash from '../components/CouncPsychDash';

// Admin pages
import AdminSignup from '../pages/admin/Signup'
import AdminStat from '../pages/admin/Stat'
import AdminProfile from '../pages/admin/Profile'
import AdminApproval from '../pages/admin/Approval'
import AdminAdmin from '../pages/admin/Admin'
import AdminContent from '../pages/admin/Content'
import AdminReport from '../pages/admin/Report'

// Call Wrappers
import CouncPsychoVideoCallWrapper from '../pages/CouncPsychoVideoCallWrapper';
import StudentVideoCallWrapper from '../pages/StudentVideoCallWrapper';

const AppRoutes = () => (
  <BrowserRouter>
    <Routes>
      {/* Entry Point */}
      <Route path="/" element={<Welcome />} />
      <Route path="/login" element={<CentralizedLogin />} />

      {/* Shared Routes */}
      <Route path="/force-reset-password" element={<ForceResetPassword />} />
      <Route path="/students/verify-profile-update/:token" element={<VerifyUpdateStudent />} />
      <Route path="/students/verify-password-change/:token" element={<VerifyPasswordStudent />} />
      <Route
        path="/counselorpsychologist/verify-profile-update/:token"
        element={<VerifyUpdateCounselorPsychologist />}
      />
      <Route
        path="/counselorpsychologist/verify-password-change/:token"
        element={<VerifyPasswordCounselorPsychologist />}
      />
      <Route path="/admin/verify-profile-update/:token" element={<VerifyUpdateAdmin />} />
      <Route path="/admin/verify-password-change/:token" element={<VerifyPasswordAdmin />} />

      {/* Student Public Routes */}
      <Route path="/student/signup" element={<StudentSignup />} />

      {/* Counselor&Psychologist Public Routes */}
      <Route path="/counselorpsychologist/signup" element={<CounselorPsychologistSignup />} />

      {/* Admin Public Routes */}
      <Route path="/admin/signup" element={<AdminSignup />} />


      {/* Student Protected Routes */}
      <Route path="student" element={<StudentLayout />}>

        <Route path="profile" element={
          <ProtectedRoute><Profile /></ProtectedRoute>
        } />
        <Route path="appointments" element={
          <ProtectedRoute><Appointment /></ProtectedRoute>
        } />
        <Route path="appointments/:id" element={
          <ProtectedRoute><Appointment /></ProtectedRoute>
        } />
        <Route path="home" element={
          <ProtectedRoute><StudentHome /></ProtectedRoute>
        } />
        <Route path="ventwall" element={
          <ProtectedRoute><VentWall /></ProtectedRoute>
        } />
        <Route path="feedback" element={
          <ProtectedRoute><Feedback /></ProtectedRoute>
        } />
        <Route path="resource" element={
          <ProtectedRoute><Resource /></ProtectedRoute>
        } />
        <Route path="report" element={
          <ProtectedRoute><Report /></ProtectedRoute>
        } />
      </Route>

      {/* Counselor&Psychologist Protected Routes */}
      <Route path="counselorpsychologist" element={<CounselorPsychologistLayout />}>
        <Route path="stats" element={
          <ProtectedRoute><CouncPsychoDash /></ProtectedRoute>}
        />

        <Route path="profile" element={
          <ProtectedRoute><CounselorPsychologistProfile /></ProtectedRoute>
        } />

        <Route path="appointments" element={
          <ProtectedRoute><CounselorPsychologistAppointment /></ProtectedRoute>
        } />

        <Route path="availability" element={
          <ProtectedRoute><CounselorPsychologistAvailability /></ProtectedRoute>
        } />

        <Route path="feedback" element={
          <ProtectedRoute><CounselorPsychologistFeedback /></ProtectedRoute>
        } />

        <Route path="resource" element={
          <ProtectedRoute><CounselorPsychologistResource /></ProtectedRoute>
        } />
      </Route>

      {/* Admin Protected Routes */}
      <Route path="admin" element={<AdminLayout />}>

        <Route path="stat" element={
          <ProtectedRoute><AdminStat /></ProtectedRoute>
        } />

        <Route path="profile" element={
          <ProtectedRoute><AdminProfile /></ProtectedRoute>
        } />

        <Route path="approval" element={
          <ProtectedRoute><AdminApproval /></ProtectedRoute>
        } />

        <Route path="adminmanage" element={
          <ProtectedRoute><AdminAdmin /></ProtectedRoute>
        } />

        <Route path="content" element={
          <ProtectedRoute><AdminContent /></ProtectedRoute>
        } />

        <Route path="report" element={
          <ProtectedRoute><AdminReport /></ProtectedRoute>
        } />
      </Route>

      {/* Call Routes */}
      <Route path="/video/counselor/:myId/:targetId" element={<CouncPsychoVideoCallWrapper />} />
      <Route path="/video/student/:studentId" element={<StudentVideoCallWrapper />} />

    </Routes>
  </BrowserRouter>
);

export default AppRoutes;