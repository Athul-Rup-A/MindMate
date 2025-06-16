import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import ProtectedRoute from '../components/Protectedroute';

import Signup from '../pages/student/Signup';
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

const StudentRoutes = () => (
  <BrowserRouter>
    <Routes>
      <Route path="/" element={<Signup />} />
      <Route path="/signup" element={<Signup />} />
      <Route path="/login" element={<Login />} />
      <Route path="/force-reset-password"
        element={<ForceResetPassword />}
      />
      <Route path="/profile" element={
        <ProtectedRoute>
          <Profile />
        </ProtectedRoute>
      }
      />
      <Route path="/appointments" element={
        <ProtectedRoute>
          <Appointment />
        </ProtectedRoute>
      }
      />
      <Route path="/appointments/:id" element={
        <ProtectedRoute>
          <Appointment />
        </ProtectedRoute>
      }
      />
      <Route path="/home" element={
        <ProtectedRoute>
          <StudentHome />
        </ProtectedRoute>
      }
      />
      <Route path="/ventwall" element={
        <ProtectedRoute>
          <VentWall />
        </ProtectedRoute>
      }
      />
      <Route path="/feedback" element={
        <ProtectedRoute>
          <Feedback />
        </ProtectedRoute>
      }
      />
      <Route path="/sos" element={
        <ProtectedRoute>
          <SOS />
        </ProtectedRoute>
      }
      />
      <Route path="/wellness" element={
        <ProtectedRoute>
          <Wellness />
        </ProtectedRoute>
      }
      />
      <Route path="/resource" element={
        <ProtectedRoute>
          <Resource />
        </ProtectedRoute>
      }
      />
      <Route path="/report" element={
        <ProtectedRoute>
          <Report />
        </ProtectedRoute>
      }
      />
    </Routes>
  </BrowserRouter>
);

export default StudentRoutes;