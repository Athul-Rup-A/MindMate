import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';

import Signup from '../pages/Signup';
import Login from '../pages/Login';
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
    </Routes>
  </BrowserRouter>
);

export default StudentRoutes;