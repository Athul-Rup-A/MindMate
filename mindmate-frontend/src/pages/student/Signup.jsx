import React, { useState } from 'react';
import { Formik, Form as FormikForm, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { Container, Form, Button, InputGroup, OverlayTrigger, Tooltip, Card } from 'react-bootstrap';
import { EyeFill, EyeSlashFill, InfoCircle, PersonFill, TelephoneFill, LockFill } from 'react-bootstrap-icons';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const Signup = () => {
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/students';

  const SignupSchema = Yup.object().shape({
    AliasId: Yup.string().required('Alias ID is required'),
    email: Yup.string()
      .email('Enter a valid email address')
      .required('Email is required'),
    phone: Yup.string()
      .matches(/^[6-9]\d{9}$/, 'Enter a valid 10-digit Indian phone number')
      .required('Phone is required'),
    password: Yup.string()
      .matches(
        /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/,
        'At least 8 characters, including 1 letter & 1 number'
      )
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
        background: 'linear-gradient(to right, #89f7fe,rgb(137, 62, 202))',
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: 'Segoe UI, sans-serif',
      }}
    >
      <Container style={{ maxWidth: '500px' }}>
        <Card
          className="p-4 shadow-lg"
          style={{
            borderRadius: '20px',
            backgroundColor: 'white',
          }}
        >
          <h3 className="text-center mb-1 fw-bold text-primary">Join MindMate</h3>
          <p className="text-center text-muted mb-4">
            Your safe, anonymous space for self-care 🌿
          </p>

          <Formik
            initialValues={{ AliasId: '', email: '', password: '', phone: '' }}
            validationSchema={SignupSchema}
            onSubmit={handleSubmit}
          >
            {({ isSubmitting }) => (
              <FormikForm>

                {/* Alias ID */}
                <Form.Group className="mb-3">
                  <Form.Label>
                    Alias ID{' '}
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
                    <Field name="AliasId" as={Form.Control} placeholder="Enter Alias ID" />
                  </InputGroup>
                  <div className="text-danger small mt-1">
                    <ErrorMessage name="AliasId" />
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
                          At least 8 characters, 1 letter, 1 number.
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
                  variant="primary"
                  className="w-100 mt-3 fw-semibold"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Signing Up...' : 'Sign Up'}
                </Button>

                <div className="text-center mt-3">
                  <Button
                    variant="link"
                    className="text-decoration-none"
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

      <ToastContainer position="top-right" autoClose={3000} />
    </div>
  );
};

export default Signup;