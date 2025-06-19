import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import ProtectedRoute from '../components/Protectedroute';

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

    </Routes>
  </BrowserRouter>
);

export default AppRoutes;