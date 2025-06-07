import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import ProtectedRoute from '../components/Protectedroute';

import Signup from '../pages/Signup';
import Login from '../pages/Login';
import Profile from '../pages/Profile';
import ForceResetPassword from '../components/ForceResetPassword';
import Appointment from '../pages/Appointment';
import StudentHome from '../pages/StudentHome';
import VentWall from '../pages/VentWall';

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
    </Routes>
  </BrowserRouter>
);

export default StudentRoutes;