import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Formik, Form as FormikForm, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import axios from 'axios';
import { Container, Form, Button, Card, InputGroup, OverlayTrigger, Tooltip } from 'react-bootstrap';
import { LockFill, InfoCircle } from 'react-bootstrap-icons';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const ForceResetPassword = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const studentId = location.state?.studentId;
  const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/students';

  const ResetSchema = Yup.object().shape({
    newPassword: Yup.string()
      .required('Password is required')
      .min(8, 'Password must be at least 8 characters')
      .matches(/[A-Za-z]/, 'At least one letter required')
      .matches(/[0-9]/, 'At least one number required'),
    confirmPassword: Yup.string()
      .required('Please confirm your password')
      .oneOf([Yup.ref('newPassword')], 'Passwords must match'),
  });

  const handleSubmit = async (values, { setSubmitting }) => {
    if (!studentId) {
      toast.error('Session expired. Please log in again.');
      navigate('/login');
      return;
    }

    try {
      const res = await axios.put(`${BASE_URL}/set-new-password`, {
        studentId,
        newPassword: values.newPassword,
      });

      toast.success(res.data.message || 'Password reset successful');
      setTimeout(() => {
        navigate('/login');
      }, 4000);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to reset password');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      style={{
        background: 'linear-gradient(to right, rgb(102, 142, 147), rgb(233, 227, 225))',
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: 'Segoe UI, sans-serif',
      }}
    >
      <Container style={{ maxWidth: '500px' }}>
        <Card className="p-4 shadow-lg" style={{ borderRadius: '20px', backgroundColor: 'white' }}>
          <h3 className="text-center mb-2 fw-bold text-danger">Set New Password</h3>
          <p className="text-center text-muted mb-4">
            Your temporary password has expired. Please choose a new one to continue.
          </p>

          <Formik
            initialValues={{ newPassword: '', confirmPassword: '' }}
            validationSchema={ResetSchema}
            onSubmit={handleSubmit}
          >
            {({ isSubmitting }) => (
              <FormikForm>
                <Form.Group className="mb-3">
                  <Form.Label>
                    New Password{' '}
                    <OverlayTrigger
                      placement="right"
                      overlay={
                        <Tooltip>
                          Minimum 8 characters, 1 letter & 1 number required.
                        </Tooltip>
                      }
                    >
                      <InfoCircle style={{ cursor: 'pointer' }} />
                    </OverlayTrigger>
                  </Form.Label>
                  <InputGroup>
                    <InputGroup.Text><LockFill /></InputGroup.Text>
                    <Field
                      type="password"
                      name="newPassword"
                      as={Form.Control}
                      placeholder="Enter new password"
                    />
                  </InputGroup>
                  <div className="text-danger small mt-1">
                    <ErrorMessage name="newPassword" />
                  </div>
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Confirm Password</Form.Label>
                  <InputGroup>
                    <InputGroup.Text><LockFill /></InputGroup.Text>
                    <Field
                      type="password"
                      name="confirmPassword"
                      as={Form.Control}
                      placeholder="Confirm new password"
                    />
                  </InputGroup>
                  <div className="text-danger small mt-1">
                    <ErrorMessage name="confirmPassword" />
                  </div>
                </Form.Group>

                <Button
                  type="submit"
                  variant="primary"
                  className="w-100 fw-semibold mt-2"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Resetting...' : 'Reset Password'}
                </Button>
              </FormikForm>
            )}
          </Formik>
        </Card>
      </Container>
      <ToastContainer position="top-right" autoClose={3000} />
    </div>
  );
};

export default ForceResetPassword;