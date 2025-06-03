import React, { useState } from 'react';
import axios from 'axios';
import { useLocation, useNavigate } from 'react-router-dom';
import { Container, Form, Button, Alert } from 'react-bootstrap';

const ForceResetPassword = () => {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const location = useLocation();
  const navigate = useNavigate();
  const studentId = location.state?.studentId;

  const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/students';

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!studentId) {
      setMessage({ type: 'danger', text: 'Invalid session. Please login again.' });
      return;
    }

    if (newPassword !== confirmPassword) {
      setMessage({ type: 'danger', text: 'Passwords do not match.' });
      return;
    }

    setSubmitting(true);
    try {
      const res = await axios.put(`${BASE_URL}/set-new-password`, { studentId, newPassword });
      setMessage({ type: 'success', text: res.data.message });
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    } catch (err) {
      console.error(err);
      setMessage({ type: 'danger', text: err.response?.data?.message || 'Reset failed' });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Container className="mt-5" style={{ maxWidth: '500px' }}>
      <h3>Reset Your Password</h3>
      {message && <Alert variant={message.type}>{message.text}</Alert>}
      <Form onSubmit={handleSubmit}>
        <Form.Group className="mb-3">
          <Form.Label>New Password</Form.Label>
          <Form.Control
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            required
          />
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label>Confirm Password</Form.Label>
          <Form.Control
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
          />
        </Form.Group>

        <Button variant="primary" type="submit" disabled={submitting}>
          {submitting ? 'Resetting...' : 'Reset Password'}
        </Button>
      </Form>
    </Container>
  );
};

export default ForceResetPassword;
