import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Formik, Form as FormikForm, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import axios from 'axios';
import { Container, Form, Button, Card, InputGroup, OverlayTrigger, Tooltip } from 'react-bootstrap';
import { LockFill, InfoCircle, EyeFill, EyeSlashFill } from 'react-bootstrap-icons';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const ADMIN_URL = import.meta.env.VITE_ADMIN_BASE_URL;
const CP_URL = import.meta.env.VITE_CP_BASE_URL;
const STUDENT_URL = import.meta.env.VITE_STUDENT_BASE_URL;

const ForceResetPassword = () => {

  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();
  const userId = location.state?.userId;
  const role = location.state?.role || 'student';
  const BASE_URL =
    role === 'admin'
      ? ADMIN_URL
      : role === 'counselorPsychologist'
        ? CP_URL
        : STUDENT_URL;

  const minLengths = {
    student: 6,
    counselorPsychologist: 8,
    admin: 10,
  };
  const minLength = minLengths[role] || 6;

  const ResetSchema = (role) => {

    return Yup.object().shape({
      newPassword: Yup.string()
        .required('Password is required')
        .min(minLength, `Password must be at least ${minLength} characters`)
        .matches(/[A-Za-z]/, 'At least one letter required')
        .matches(/[0-9]/, 'At least one number required')
        .matches(/^[A-Za-z0-9]+$/, 'Only letters and numbers allowed'),
      confirmPassword: Yup.string()
        .required('Please confirm your password')
        .oneOf([Yup.ref('newPassword')], 'Passwords must match'),
    });
  };

  useEffect(() => {
    window.history.pushState(null, '', window.location.href);
    const handlePopState = () => {
      window.history.pushState(null, '', window.location.href);
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const handleSubmit = async (values, { setSubmitting }) => {
    if (!userId) {
      toast.error('Session expired. Please log in again.');

      const loginPath =
        role === 'admin'
          ? '/admin/login'
          : role === 'counselorPsychologist'
            ? '/counselorpsychologist/login'
            : '/student/login';

      navigate(loginPath);
      return;
    }

    try {
      const res = await axios.put(`${BASE_URL}/set-new-password`, {
        userId,
        newPassword: values.newPassword,
      });

      toast.success(res.data.message || 'Password reset successful, Please Login again!');
      setTimeout(() => {

        const loginPath =
          role === 'admin'
            ? '/admin/login'
            : role === 'counselorPsychologist'
              ? '/counselorpsychologist/login'
              : '/student/login';

        navigate(loginPath);
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
        background: 'url("pngtree-pa.jpg")',
        backgroundSize: 'cover',
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
            validationSchema={ResetSchema(role)}
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
                          Minimum {minLength} characters with atleast one letter and one number required.
                        </Tooltip>
                      }
                    >
                      <InfoCircle style={{ cursor: 'pointer' }} />
                    </OverlayTrigger>
                  </Form.Label>
                  <InputGroup>
                    <InputGroup.Text><LockFill /></InputGroup.Text>
                    <Field
                      type={showNewPassword ? 'text' : 'password'}
                      name="newPassword"
                      as={Form.Control}
                      placeholder="Enter new password"
                    />
                    <Button
                      variant="outline-secondary"
                      onClick={() => setShowNewPassword(prev => !prev)}
                    >
                      {showNewPassword ? <EyeSlashFill /> : <EyeFill />}
                    </Button>
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
                      type={showConfirmPassword ? 'text' : 'password'}
                      name="confirmPassword"
                      as={Form.Control}
                      placeholder="Confirm new password"
                    />
                    <Button
                      variant="outline-secondary"
                      onClick={() => setShowConfirmPassword(prev => !prev)}
                    >
                      {showConfirmPassword ? <EyeSlashFill /> : <EyeFill />}
                    </Button>
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