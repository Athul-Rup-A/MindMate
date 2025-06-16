import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import authHeader from '../../config/authHeader';
import { Container, Row, Col, Card, Button, Modal } from 'react-bootstrap';
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import GoHomeButton from '../../components/GoHomeButton';

const Profile = () => {
  const [profile, setProfile] = useState({ AliasId: '', Phone: '' });
  const [loading, setLoading] = useState(true);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const navigate = useNavigate();

  const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/students';

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await axios.get(`${BASE_URL}/profile`, authHeader());
        setProfile({
          AliasId: res.data.AliasId || '',
          Phone: res.data.Phone || '',
        });
      } catch (err) {
        toast.error('Failed to fetch profile');
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  const profileSchema = Yup.object().shape({
    Phone: Yup.string().matches(/^\d{10}$/, 'Phone must be 10 digits').required('Required'),
  });

  const passwordSchema = Yup.object().shape({
    currentPassword: Yup.string().required('Required'),
    newPassword: Yup.string()
      .required('Required')
      .matches(
        /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/,
        'At least 8 characters, 1 letter & 1 number'
      ),
  });

  const goHome = () => navigate('/home');

  return (
    <Container
      className="py-5"
      style={{ background: 'linear-gradient(to right, #e3f2fd,rgb(253, 247, 189))', minHeight: '100vh' }}
    >
      <ToastContainer position="top-right" autoClose={3000} />

      {/* Top Right Home Button */}
      <GoHomeButton />

      <Row className="g-4">
        {/* Profile Edit */}
        <Col md={6}>
          <Card className="p-4 shadow rounded-4">
            <h4 className="mb-3 fw-bold text-center">My Profile</h4>
            <Formik
              initialValues={{ Phone: profile.Phone }}
              enableReinitialize
              validationSchema={profileSchema}
              onSubmit={async (values) => {
                if (values.Phone === profile.Phone) {
                  toast.info('No changes made');
                  return;
                }
                try {
                  await axios.put(`${BASE_URL}/profile`, values, authHeader());
                  toast.success('Profile updated successfully');
                  setProfile((prev) => ({ ...prev, Phone: values.Phone }));
                } catch (err) {
                  toast.error('Error updating profile, try a new one');
                }
              }}
            >
              {({ isSubmitting }) => (
                <Form>
                  <div className="mb-3">
                    <label className="form-label">Alias ID</label>
                    <input type="text" className="form-control" value={profile.AliasId} disabled />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Phone</label>
                    <Field name="Phone" className="form-control" />
                    <div className="text-danger small">
                      <ErrorMessage name="Phone" />
                    </div>
                  </div>
                  <Button type="submit" variant="primary" disabled={isSubmitting} className="w-100">
                    Save Changes
                  </Button>
                </Form>
              )}
            </Formik>
          </Card>
        </Col>

        {/* Password Change */}
        <Col md={6}>
          <Card className="p-4 shadow rounded-4">
            <h4 className="mb-3 fw-bold text-center">Change Password</h4>
            <Formik
              initialValues={{ currentPassword: '', newPassword: '' }}
              validationSchema={passwordSchema}
              onSubmit={async (values, { resetForm }) => {
                try {
                  const res = await axios.put(`${BASE_URL}/change-profile-password`, values, authHeader());
                  toast.success(res.data.message);
                  resetForm();
                } catch (err) {
                  toast.error(err.response?.data?.message || 'Failed to change password');
                }
              }}
            >
              {({ isSubmitting }) => (
                <Form>
                  <div className="mb-3">
                    <label className="form-label">Current Password</label>
                    <div className="input-group">
                      <Field
                        name="currentPassword"
                        type={showCurrentPassword ? 'text' : 'password'}
                        className="form-control"
                      />
                      <span className="input-group-text" onClick={() => setShowCurrentPassword(prev => !prev)} style={{ cursor: 'pointer' }}>
                        {showCurrentPassword ? <FaEyeSlash /> : <FaEye />}
                      </span>
                    </div>
                    <div className="text-danger small">
                      <ErrorMessage name="currentPassword" />
                    </div>
                  </div>

                  <div className="mb-3">
                    <label className="form-label">New Password</label>
                    <div className="input-group">
                      <Field
                        name="newPassword"
                        type={showNewPassword ? 'text' : 'password'}
                        className="form-control"
                      />
                      <span className="input-group-text" onClick={() => setShowNewPassword(prev => !prev)} style={{ cursor: 'pointer' }}>
                        {showNewPassword ? <FaEyeSlash /> : <FaEye />}
                      </span>
                    </div>
                    <div className="text-danger small">
                      <ErrorMessage name="newPassword" />
                    </div>
                  </div>

                  <Button type="submit" variant="warning" disabled={isSubmitting} className="w-100">
                    Change Password
                  </Button>
                </Form>
              )}
            </Formik>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default Profile;