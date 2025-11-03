import React, { useEffect, useState } from 'react';
import axios from '../../config/axios';
import FormField from '../../components/FormField';
import { toast } from 'react-toastify';
import { Container, Card, Button, Row, Col, Spinner } from 'react-bootstrap';
import { Formik, Form as FormikForm } from 'formik';
import * as Yup from 'yup';

const ProfileSchema = Yup.object().shape({
    Phone: Yup.string()
        .matches(/^[6-9]\d{9}$/, 'Enter a valid 10-digit phone number')
        .required('Phone number is required'),
    Email: Yup.string().email('Invalid email format').required('Email is required'),
});

const PasswordSchema = Yup.object().shape({
    currentPassword: Yup.string().required('Current password is required'),
    newPassword: Yup.string()
        .matches(/^(?=.*[A-Za-z])(?=.*\d).{10,}$/, 'Minimum 10 characters with atleast one letter and one number, alphanumeric only')
        .required('New password is required'),
});

const Profile = () => {
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);

    const fetchProfile = async () => {
        try {
            const res = await axios.get('admin/profile');
            setProfile(res.data);
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to load profile');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProfile();
    }, []);

    const handleProfileUpdate = async (values, { setSubmitting, resetForm }) => {
        const isSame = (a, b) => ['Phone', 'Email'].every(key => a[key] === b[key]);
        if (isSame(values, profile)) {
            toast.info('No changes made');
            setSubmitting(false);
            return;
        }

        try {
            const res = await axios.post('admin/request-profile-update', values);
            toast.success('Verification email sent. Please check your inbox to confirm changes.');
            // setProfile(res.data);
            // resetForm({ values: res.data });
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to update profile');
        } finally {
            setSubmitting(false);
        }
    };

    const handlePasswordChange = async (values, { resetForm, setSubmitting }) => {
        try {
            await axios.post('admin/request-password-change', values);
            toast.success('Verification email sent. Please check your inbox to confirm password change.');
            resetForm();
        } catch (err) {
            toast.error(err.response?.data?.message || 'Password change failed');
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return (
            <Container className="text-center mt-5">
                <Spinner animation="border" />
            </Container>
        );
    }

    return (
        <Container className="py-4">
            <Row className="g-4 align-items-stretch">
                <Col md={6} className="d-flex flex-column">
                    <Card className="p-4 shadow-lg rounded-4 flex-grow-1 d-flex flex-column justify-content-between h-100 bg-transparent">
                        <h4 className="fw-bold text-primary text-center mb-3">Admin Profile</h4>
                        <Formik
                            enableReinitialize
                            initialValues={{
                                Phone: profile?.Phone || '',
                                Email: profile?.Email || '',
                            }}
                            validationSchema={ProfileSchema}
                            onSubmit={handleProfileUpdate}
                        >
                            {({ isSubmitting, dirty }) => (
                                <FormikForm>
                                    <FormField
                                        name="Phone"
                                        label="Phone Number"
                                        placeholder="Enter your phone number"
                                    />
                                    <FormField
                                        name="Email"
                                        label="Email"
                                        placeholder="Enter your email address"
                                    />
                                    <Button
                                        type="submit"
                                        disabled={isSubmitting}
                                        className="w-100 mt-3"
                                        variant="primary"
                                    >
                                        {isSubmitting ? 'Updating...' : 'Update'}
                                    </Button>
                                </FormikForm>
                            )}
                        </Formik>
                    </Card>
                </Col>

                <Col md={6} className="d-flex flex-column">
                    <Card className="p-4 shadow-lg rounded-4 flex-grow-1 d-flex flex-column justify-content-between h-100 bg-transparent">
                        <h4 className="fw-bold text-danger text-center mb-3">Change Password</h4>
                        <Formik
                            initialValues={{ currentPassword: '', newPassword: '' }}
                            validationSchema={PasswordSchema}
                            onSubmit={handlePasswordChange}
                        >
                            {({ isSubmitting }) => (
                                <FormikForm>
                                    <FormField
                                        name="currentPassword"
                                        label="Current Password"
                                        type="password"
                                        placeholder="Enter current password"
                                    />
                                    <FormField
                                        name="newPassword"
                                        label="New Password"
                                        type="password"
                                        placeholder="Enter new password"
                                    />
                                    <Button
                                        variant="danger"
                                        type="submit"
                                        disabled={isSubmitting}
                                        className="w-100 mt-2"
                                    >
                                        {isSubmitting ? 'Changing...' : 'Change Password'}
                                    </Button>
                                </FormikForm>
                            )}
                        </Formik>
                    </Card>
                </Col>
            </Row>

        </Container>
    );
};

export default Profile;