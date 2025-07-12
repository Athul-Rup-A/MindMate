import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import ProtectedRoute from '../components/Protectedroute';
import AdminLayout from '../Layout/AdminLayout';

// Welcome page
import Welcome from '../components/Welcome';

// Student pages
import StudentSignup from '../pages/student/Signup';
import Login from '../pages/student/Login';
import Profile from '../pages/student/Profile';
import ForceResetPassword from '../components/ForceResetPassword';
import Appointment from '../pages/student/Appointment';
import StudentHome from '../pages/student/StudentHome';
import VentWall from '../pages/student/VentWall';
import Feedback from '../pages/student/Feedback';
import SOS from '../pages/student/SOS';
import Wellness from '../pages/student/Wellness';
import Resource from '../pages/student/Resource';
import Report from '../pages/student/Report';

// CounselorPsychologist pages
import CounselorPsychologistSignup from '../pages/counselorPsychologist/Signup';
import CounselorPsychologistLogin from '../pages/counselorPsychologist/Login';
import CounselorPsychologistProfile from '../pages/counselorPsychologist/Profile';
import CounselorPsychologistAppointment from '../pages/counselorPsychologist/Appointment';
import CounselorPsychologistAvailability from '../pages/counselorPsychologist/Availability';
import CounselorPsychologistFeedback from '../pages/counselorPsychologist/Feedback';
import CounselorPsychologistSOS from '../pages/counselorPsychologist/SOS';
import CounselorPsychologistResource from '../pages/counselorPsychologist/Resource';
import CounselorPsychologistWellness from '../pages/counselorPsychologist/Wellness';

// Admin pages
import AdminSignup from '../pages/admin/Signup'
import AdminLogin from '../pages/admin/Login'
import AdminStat from '../pages/admin/Stat'
import AdminProfile from '../pages/admin/Profile'
import AdminApproval from '../pages/admin/Approval'
import AdminAdmin from '../pages/admin/Admin'
import AdminContent from '../pages/admin/Content'
import AdminReport from '../pages/admin/Report'

const AppRoutes = () => (
  <BrowserRouter>
    <Routes>
      {/* Entry Point */}
      <Route path="/" element={<Welcome />} />

      {/* Shared Routes */}
      <Route path="/force-reset-password" element={<ForceResetPassword />} />

      {/* Student Public Routes */}
      <Route path="/signup/student" element={<StudentSignup />} />
      <Route path="/login/student" element={<Login />} />

      {/* Counselor&Psychologist Public Routes */}
      <Route path="/signup/counselorpsychologist" element={<CounselorPsychologistSignup />} />
      <Route path="/login/counselorpsychologist" element={<CounselorPsychologistLogin />} />

      {/* Admin Public Routes */}
      <Route path="/admin/signup" element={<AdminSignup />} />
      <Route path="/admin/login" element={<AdminLogin />} />

      {/* Student Protected Routes */}
      <Route path="/profile" element={
        <ProtectedRoute><Profile /></ProtectedRoute>
      } />
      <Route path="/appointments" element={
        <ProtectedRoute><Appointment /></ProtectedRoute>
      } />
      <Route path="/appointments/:id" element={
        <ProtectedRoute><Appointment /></ProtectedRoute>
      } />
      <Route path="/home" element={
        <ProtectedRoute><StudentHome /></ProtectedRoute>
      } />
      <Route path="/ventwall" element={
        <ProtectedRoute><VentWall /></ProtectedRoute>
      } />
      <Route path="/feedback" element={
        <ProtectedRoute><Feedback /></ProtectedRoute>
      } />
      <Route path="/sos" element={
        <ProtectedRoute><SOS /></ProtectedRoute>
      } />
      <Route path="/wellness" element={
        <ProtectedRoute><Wellness /></ProtectedRoute>
      } />
      <Route path="/resource" element={
        <ProtectedRoute><Resource /></ProtectedRoute>
      } />
      <Route path="/report" element={
        <ProtectedRoute><Report /></ProtectedRoute>
      } />

      {/* Counselor&Psychologist Protected Routes */}
      <Route path="/profile/counselorpsychologist" element={
        <ProtectedRoute><CounselorPsychologistProfile /></ProtectedRoute>
      } />

      <Route path="/appointments/counselorpsychologist" element={
        <ProtectedRoute><CounselorPsychologistAppointment /></ProtectedRoute>
      } />

      <Route path="/availability/counselorpsychologist" element={
        <ProtectedRoute><CounselorPsychologistAvailability /></ProtectedRoute>
      } />

      <Route path="/feedback/counselorpsychologist" element={
        <ProtectedRoute><CounselorPsychologistFeedback /></ProtectedRoute>
      } />

      <Route path="/sos/counselorpsychologist" element={
        <ProtectedRoute><CounselorPsychologistSOS /></ProtectedRoute>
      } />

      <Route path="/resource/counselorpsychologist" element={
        <ProtectedRoute><CounselorPsychologistResource /></ProtectedRoute>
      } />

      <Route path="/wellness/counselorpsychologist" element={
        <ProtectedRoute><CounselorPsychologistWellness /></ProtectedRoute>
      } />

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

    </Routes>
  </BrowserRouter>
);

export default AppRoutes;