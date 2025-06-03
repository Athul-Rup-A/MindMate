import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import ProtectedRoute from '../components/Protectedroute';

import Signup from '../pages/Signup';
import Login from '../pages/Login';
import Profile from '../pages/Profile';
import ForceResetPassword from '../components/ForceResetPassword';

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
    </Routes>
  </BrowserRouter>
);

export default StudentRoutes;