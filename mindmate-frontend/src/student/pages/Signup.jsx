import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { Container, Form, Button } from 'react-bootstrap';

const Signup = () => {
  const [formData, setFormData] = useState({ AliasId: '', password: '', phone: '' });
  const navigate = useNavigate();

  const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/students';

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${BASE_URL}/signup`, formData);
      alert('Signup successful! You can now log in.');
      navigate('/login');
    } catch (err) {
      console.error('Signup failed:', err);
      alert(err.response?.data?.message || 'Signup failed');
    }
  };

  return (
    <Container className="mt-5" style={{ maxWidth: '500px' }}>
      <h2>Student Signup</h2>
      <Form onSubmit={handleSubmit}>
        <Form.Group className="mb-3" controlId="signupAliasId">
          <Form.Label>Alias ID</Form.Label>
          <Form.Control
            type="text"
            name="AliasId"
            value={formData.AliasId}
            onChange={handleChange}
            required
          />
        </Form.Group>

        <Form.Group className="mb-3" controlId="signupPhone">
          <Form.Label>Phone</Form.Label>
          <Form.Control
            type="text"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            required
          />
        </Form.Group>

        <Form.Group className="mb-3" controlId="signupPassword">
          <Form.Label>Password</Form.Label>
          <Form.Control
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            required
          />
        </Form.Group>
        <Button variant="primary" type="submit" className="mb-3">
          Sign Up
        </Button>
        <div>
          <Button
            variant="link"
            className="p-0 text-start"
            onClick={() => {
              navigate('/login')
            }}
          >
            Already have an account?
          </Button>
        </div>
      </Form>
    </Container>
  );
};

export default Signup;