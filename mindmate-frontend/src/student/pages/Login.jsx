import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { Container, Form, Button } from 'react-bootstrap';

const Login = () => {
  const [formData, setFormData] = useState({ AliasId: '', password: '', phone: '' });
  const [showPhone, setShowPhone] = useState(false);
  const [phonePurpose, setPhonePurpose] = useState(''); // Forgot-Section
  const navigate = useNavigate();

  const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/students';

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post(`${BASE_URL}/login`, {
        AliasId: formData.AliasId,
        password: formData.password,
      });


      const { token, student, mustChangePassword } = res.data;
      localStorage.setItem('token', token);

      if (mustChangePassword) {
        alert('Logged in with temporary password. Please change your password.');
        // ⚠ Redirect to password reset with student ID
        navigate('/force-reset-password', { state: { studentId: student._id } });
      } else {
        alert('Login successful!');
        navigate('/profile');
      }

    } catch (err) {
      console.error('Login error:', err);
      alert(err.response?.data?.message || 'Login failed');
    }
  };

  const handlePhoneAction = async () => {
    if (!formData.phone) {
      alert('Please enter your phone number.');
      return;
    }

    try {
      const endpoint =
        phonePurpose === 'forgot-password' ? 'forgot-password' : 'forgot-aliasid';

      const res = await axios.post(`${BASE_URL}/${endpoint}`, {
        phone: formData.phone,
      });

      alert(res.data.message || 'Request successful.');
      setShowPhone(false);
      setFormData({ ...formData, phone: '' });
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || 'Request failed.');
    }
  };

  return (
    <Container className="mt-5" style={{ maxWidth: '500px' }}>
      <h2>Student Login</h2>
      <Form onSubmit={handleSubmit}>
        <Form.Group className="mb-3" controlId="loginAliasId">
          <Form.Label>Alias ID</Form.Label>
          <Form.Control
            type="text"
            name="AliasId"
            value={formData.AliasId}
            onChange={handleChange}
            required
          />
        </Form.Group>

        <Form.Group className="mb-3" controlId="loginPassword">
          <Form.Label>Password</Form.Label>
          <Form.Control
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            required
          />
        </Form.Group>

        {showPhone && (
          <>
            <Form.Group className="mb-3" controlId="loginPhone">
              <Form.Label>Phone Number</Form.Label>
              <Form.Control
                type="text"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="Enter your phone number"
                required
              />
            </Form.Group>
            <div className="d-flex gap-2">
              <Button variant="warning" onClick={handlePhoneAction}>
                Submit
              </Button>
              <Button variant="secondary" onClick={() => setShowPhone(false)}>
                Back
              </Button>
            </div>

          </>
        )}

        {!showPhone && (
          <>
            <Button variant="success" type="submit" className="mb-3">
              Log In
            </Button>
            <div className="d-flex flex-column">
              <Button
                variant="link"
                className="p-0 text-start"
                onClick={() => {
                  navigate('/signup')
                }}
              >
                Don't have an account?
              </Button>
              <Button
                variant="link"
                className="p-0 text-start"
                onClick={() => {
                  setPhonePurpose('forgot-password');
                  setShowPhone(true);
                }}
              >
                Forgot Password?
              </Button>
              <Button
                variant="link"
                className="p-0 text-start"
                onClick={() => {
                  setPhonePurpose('forgot-aliasid');
                  setShowPhone(true);
                }}
              >
                Forgot Alias ID?
              </Button>
            </div>
          </>
        )}
      </Form>
    </Container>
  );
};

export default Login;