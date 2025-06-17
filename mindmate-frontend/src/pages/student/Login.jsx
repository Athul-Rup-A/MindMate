import React, { useState } from 'react';
import { Formik, Form as FormikForm, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { Container, Form, Button, InputGroup, OverlayTrigger, Tooltip, Card } from 'react-bootstrap';
import { EyeFill, EyeSlashFill, InfoCircle, PersonFill, LockFill, TelephoneFill } from 'react-bootstrap-icons';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const Login = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [showPhone, setShowPhone] = useState(false);
  const [phonePurpose, setPhonePurpose] = useState('');
  const navigate = useNavigate();

  const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/students';

  const LoginSchema = Yup.object().shape({
    AliasId: Yup.string().required('Alias ID is required'),
    password: Yup.string().required('Password is required'),
    phone: Yup.string().when([], {
      is: () => showPhone,
      then: () =>
        Yup.string()
          .matches(/^[6-9]\d{9}$/, 'Enter a valid 10-digit phone number')
          .required('Phone number is required'),
    }),
  });

  const handleLogin = async (values, { setSubmitting }) => {
    try {
      const res = await axios.post(`${BASE_URL}/login`, {
        AliasId: values.AliasId,
        password: values.password,
      });

      const { token, student, mustChangePassword } = res.data;
      localStorage.setItem('token', token);

      if (mustChangePassword) {
        toast.info('Temporary password. Please reset it.');
        setTimeout(() => {
          navigate('/force-reset-password', {
            state: {
              userId: student._id,
              role: 'student',
            },
          });
        }, 3700);
      } else {
        toast.success('Login successful!');
        setTimeout(() => {
          navigate('/home');
        }, 3700);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed');
    } finally {
      setSubmitting(false);
    }
  };

  const handlePhoneAction = async (values) => {
    if (!values.phone) {
      toast.warning('Please enter your phone number');
      return;
    }

    try {
      const endpoint =
        phonePurpose === 'forgot-password' ? 'forgot-password' : 'forgot-aliasid';

      const res = await axios.post(`${BASE_URL}/${endpoint}`, {
        phone: values.phone,
      });

      toast.success(res.data.message || 'Request successful.');
      setShowPhone(false);
      setPhonePurpose('');  // Reload the login form correctly
    } catch (err) {
      toast.error(err.response?.data?.message || 'Request failed');
    }
  };

  return (
    <div
      style={{
        background: 'linear-gradient(to right,rgb(190, 126, 182),rgb(120, 123, 228))',
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: 'Segoe UI, sans-serif',
      }}
    >
      <Container style={{ maxWidth: '500px' }}>
        <Card className="p-4 shadow-lg" style={{ borderRadius: '20px', backgroundColor: 'white' }}>

          {showPhone ? (
            <>
              <h3 className="text-center mb-1 fw-bold">
                {phonePurpose === 'forgot-password' ? 'Reset Password' : 'Recover Alias ID'}
              </h3>
              <p className="text-center text-muted mb-4">
                Enter your registered phone number to receive {phonePurpose === 'forgot-password' ? 'a new temporary password' : 'your Alias ID'} via Email.
              </p>
            </>
          ) : (
            <>
              <h3 className="text-center mb-1 fw-bold text-primary">Welcome Back</h3>
              <p className="text-center text-muted mb-4">Log in to continue your journey 🌱</p>
            </>
          )}

          <Formik
            initialValues={{ AliasId: '', password: '', phone: '' }}
            validationSchema={LoginSchema}
            onSubmit={handleLogin}
          >
            {({ isSubmitting, values, resetForm }) => (
              <FormikForm>
                {!showPhone && (
                  <>

                    {/* Alias ID */}
                    {phonePurpose !== 'forgot-aliasid' && (
                      <Form.Group className="mb-3">
                        <Form.Label>
                          Alias ID{' '}
                          <OverlayTrigger
                            placement="right"
                            overlay={<Tooltip>Use your chosen nickname or dummy name</Tooltip>}
                          >
                            <InfoCircle style={{ cursor: 'pointer' }} />
                          </OverlayTrigger>
                        </Form.Label>
                        <InputGroup>
                          <InputGroup.Text><PersonFill /></InputGroup.Text>
                          <Field name="AliasId" as={Form.Control} placeholder="Enter your Alias ID" />
                        </InputGroup>
                        <div className="text-danger small mt-1">
                          <ErrorMessage name="AliasId" />
                        </div>
                      </Form.Group>
                    )}

                    {/* Password */}
                    {phonePurpose !== 'forgot-password' && (
                      <Form.Group className="mb-3">
                        <Form.Label>
                          Password{' '}
                          <OverlayTrigger
                            placement="right"
                            overlay={<Tooltip>Your secure login password which contain at least 8 characters, 1 letter, and 1 number.</Tooltip>}
                          >
                            <InfoCircle style={{ cursor: 'pointer' }} />
                          </OverlayTrigger>
                        </Form.Label>
                        <InputGroup>
                          <InputGroup.Text><LockFill /></InputGroup.Text>
                          <Field
                            name="password"
                            as={Form.Control}
                            type={showPassword ? 'text' : 'password'}
                            placeholder="Enter password"
                          />
                          <Button
                            variant="outline-secondary"
                            onClick={() => setShowPassword(!showPassword)}
                          >
                            {showPassword ? <EyeSlashFill /> : <EyeFill />}
                          </Button>
                        </InputGroup>
                        <div className="text-danger small mt-1">
                          <ErrorMessage name="password" />
                        </div>
                      </Form.Group>
                    )}
                  </>
                )}

                {/* Phone Input */}
                {showPhone && (
                  <>
                    <Form.Group className="mb-3">
                      <Form.Label>Phone Number</Form.Label>
                      <InputGroup>
                        <InputGroup.Text><TelephoneFill /></InputGroup.Text>
                        <Field
                          name="phone"
                          as={Form.Control}
                          placeholder="Enter your phone number"
                        />
                      </InputGroup>
                      <div className="text-danger small mt-1">
                        <ErrorMessage name="phone" />
                      </div>
                    </Form.Group>

                    <div className="d-flex gap-2">
                      <Button
                        variant="warning"
                        onClick={() => handlePhoneAction(values)}
                      >
                        Submit
                      </Button>
                      <Button
                        variant="secondary"
                        onClick={() => {
                          setShowPhone(false);
                          setPhonePurpose(''); // Reset phone purpose to show all login fields again
                          resetForm(); // Clear all fields
                        }}
                      >
                        Back
                      </Button>
                    </div>
                  </>
                )}

                {!showPhone && (
                  <>
                    <Button
                      type="submit"
                      variant="primary"
                      className="w-100 mt-3 fw-semibold"
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? 'Logging in...' : 'Log In'}
                    </Button>

                    <div className="text-center mt-3 d-flex flex-column">
                      <Button
                        variant="link"
                        className="text-decoration-none"
                        onClick={() => navigate('/signup/student')}
                      >
                        Don't have an account?
                      </Button>
                      <Button
                        variant="link"
                        className="text-decoration-none"
                        onClick={() => {
                          setPhonePurpose('forgot-password');
                          setShowPhone(true);
                          resetForm(); // Clear all fields
                        }}
                      >
                        Forgot Password?
                      </Button>
                      <Button
                        variant="link"
                        className="text-decoration-none"
                        onClick={() => {
                          setPhonePurpose('forgot-aliasid');
                          setShowPhone(true);
                          resetForm(); // Clear all fields
                        }}
                      >
                        Forgot Alias ID?
                      </Button>
                    </div>
                  </>
                )}
              </FormikForm>
            )}
          </Formik>
        </Card>
      </Container>

      <ToastContainer position="top-right" autoClose={3000} />
    </div>
  );
};

export default Login;