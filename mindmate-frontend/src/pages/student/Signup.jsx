import React, { useState } from 'react';
import { Formik, Form as FormikForm, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { Container, Form, Button, InputGroup, OverlayTrigger, Tooltip, Card } from 'react-bootstrap';
import { EyeFill, EyeSlashFill, InfoCircle, PersonFill, TelephoneFill, LockFill } from 'react-bootstrap-icons';
import { toast } from 'react-toastify';

const Signup = () => {
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const BASE_URL = `${import.meta.env.VITE_API_URL}students`;

  const SignupSchema = Yup.object().shape({
    Username: Yup.string()
      .matches(/^[a-zA-Z0-9_]{4,20}$/, 'Username must be 4–20 characters, alphanumeric or underscore only')
      .required('Username is required'),
    email: Yup.string()
      .email('Enter a valid email address')
      .required('Email is required'),
    phone: Yup.string()
      .matches(/^[6-9]\d{9}$/, 'Enter a valid 10-digit Indian phone number')
      .required('Phone is required'),
    password: Yup.string()
      .matches(/^[A-Za-z0-9]{8,}$/, 'At least 8 characters, alphanumeric only')
      .matches(/[A-Za-z]/, 'At least one letter required')
      .matches(/[0-9]/, 'At least one number required')
      .required('Password is required'),
  });

  const handleSubmit = async (values, { setSubmitting }) => {
    try {

      await axios.post(`${BASE_URL}/signup`, values);
      toast.success('Signup successful! You can now log in.');
      setTimeout(() => navigate('/login'), 3700);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Signup failed');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      style={{
        background: 'url("/blue.jpg")',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '40px 0',
      }}
    >
      <Container style={{ maxWidth: '600px' }}>
        <Card
          className="p-4 shadow-lg rounded-4"
          style={{
            background: 'transparent',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(255,255,255,0.3)',
            boxShadow: '0 8px 32px rgba(0,0,0,0.2)',
          }}
        >
          <h3 className="text-center mb-1 fw-bold text-dark">Join MindMate</h3>
          <p className="text-center text-muted mb-4">
            Your safe, anonymous space for self-care 🌿
          </p>

          <Formik
            initialValues={{ Username: '', email: '', password: '', phone: '' }}
            validationSchema={SignupSchema}
            onSubmit={handleSubmit}
          >
            {({ isSubmitting }) => (
              <FormikForm>

                {/* Username */}
                <Form.Group className="mb-3">
                  <Form.Label>
                    Username{' '}
                    <OverlayTrigger
                      placement="right"
                      overlay={
                        <Tooltip>
                          Use a nickname or dummy name. No real names needed.
                        </Tooltip>
                      }
                    >
                      <InfoCircle style={{ cursor: 'pointer' }} />
                    </OverlayTrigger>
                  </Form.Label>
                  <InputGroup>
                    <InputGroup.Text>
                      <PersonFill />
                    </InputGroup.Text>
                    <Field name="Username" as={Form.Control} placeholder="Enter Username" />
                  </InputGroup>
                  <div className="text-danger small mt-1">
                    <ErrorMessage name="Username" />
                  </div>
                </Form.Group>

                {/* Email */}
                <Form.Group className="mb-3">
                  <Form.Label>Email</Form.Label>
                  <InputGroup>
                    <InputGroup.Text>
                      @
                    </InputGroup.Text>
                    <Field
                      name="email"
                      type="email"
                      as={Form.Control}
                      placeholder="Enter your email address"
                    />
                  </InputGroup>
                  <div className="text-danger small mt-1">
                    <ErrorMessage name="email" />
                  </div>
                </Form.Group>

                {/* Phone */}
                <Form.Group className="mb-3">
                  <Form.Label>Phone</Form.Label>
                  <InputGroup>
                    <InputGroup.Text>
                      <TelephoneFill />
                    </InputGroup.Text>
                    <Field name="phone" as={Form.Control} placeholder="10-digit phone number" />
                  </InputGroup>
                  <div className="text-danger small mt-1">
                    <ErrorMessage name="phone" />
                  </div>
                </Form.Group>

                {/* Password */}
                <Form.Group className="mb-3">
                  <Form.Label>
                    Password{' '}
                    <OverlayTrigger
                      placement="right"
                      overlay={
                        <Tooltip>
                          8 characters including atleast one letter and one number.
                        </Tooltip>
                      }
                    >
                      <InfoCircle style={{ cursor: 'pointer' }} />
                    </OverlayTrigger>
                  </Form.Label>
                  <InputGroup>
                    <InputGroup.Text>
                      <LockFill />
                    </InputGroup.Text>
                    <Field
                      name="password"
                      as={Form.Control}
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Create a secure password"
                    />
                    <Button
                      variant="outline-secondary"
                      onClick={() => setShowPassword(!showPassword)}
                      type="button"
                    >
                      {showPassword ? <EyeSlashFill /> : <EyeFill />}
                    </Button>
                  </InputGroup>
                  <div className="text-danger small mt-1">
                    <ErrorMessage name="password" />
                  </div>
                </Form.Group>

                <Button
                  type="submit"
                  variant="dark"
                  className="w-100 mt-3 fw-semibold"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Signing Up...' : 'Sign Up'}
                </Button>

                <div className="text-center mt-3">
                  <Button
                    variant="link"
                    className="text-decoration-none text-dark"
                    onClick={() => navigate('/login')}
                  >
                    Already have an account?
                  </Button>
                </div>
              </FormikForm>
            )}
          </Formik>
        </Card>
      </Container>

    </div>
  );
};

export default Signup;