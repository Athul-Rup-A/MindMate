import React, { useEffect, useState } from 'react';
import axios from '../../config/axios';
import FormField from '../../components/FormField';
import CouncPsychHome from '../../components/CouncPsychHome'
import { toast } from 'react-toastify';
import { Container, Card, Button, Row, Col, Spinner } from 'react-bootstrap';
import { Formik, Form as FormikForm } from 'formik';
import * as Yup from 'yup';

const ProfileSchema = Yup.object().shape({
    FullName: Yup.string().required('Full name is required'),
    Phone: Yup.string()
        .matches(/^[6-9]\d{9}$/, 'Enter a valid 10-digit phone number')
        .required('Phone number is required'),
    Email: Yup.string()
        .email('Invalid email format')
        .required('Email is required'),
    Credentials: Yup.string().required('Credentials are required'),
    Specialization: Yup.string().required('Specialization is required'),
});

const PasswordSchema = Yup.object().shape({
    currentPassword: Yup.string().required('Current password is required'),
    newPassword: Yup.string()
        .matches(/^(?=.*[A-Za-z])(?=.*\d).{6,}$/, 'At least 6 characters, 1 letter and 1 number')
        .required('New password is required'),
});

const Profile = () => {
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);

    const fetchProfile = async () => {
        try {
            const res = await axios.get('counselorPsychologist/profile');
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

    const handleProfileUpdate = async (values, { setSubmitting, resetForm, dirty }) => {
        if (!dirty) {
            toast.info('No changes made');
            setSubmitting(false);
            return;
        }

        try {
            const res = await axios.put('counselorPsychologist/profile', values);
            toast.success('Profile updated successfully');
            setProfile(res.data);
            resetForm({ values: res.data });
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to update profile');
        } finally {
            setSubmitting(false);
        }
    };

    const handlePasswordChange = async (values, { resetForm, setSubmitting }) => {
        try {
            await axios.put('counselorPsychologist/change-profile-password', values);
            toast.success('Password changed successfully');
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
        <div
            style={{
                background: 'linear-gradient(to right, #93c5fd, #e9d5ff, #93e5bd)',
                minHeight: '100vh',
                paddingTop: '20px',
                paddingBottom: '20px'
            }}
        >
            <Container className="py-4">

                <CouncPsychHome />

                <Row className="g-4">
                    <Col md={6}>
                        <Card className="p-4 shadow-lg rounded-4 h-100">
                            <h4 className="fw-bold text-primary text-center mb-3">Your Profile</h4>
                            <Formik
                                initialValues={{
                                    FullName: profile?.FullName || '',
                                    Phone: profile?.Phone || '',
                                    Email: profile?.Email || '',
                                    Credentials: profile?.Credentials || '',
                                    Specialization: profile?.Specialization || '',
                                    AliasId: profile?.AliasId || '',
                                    Role: profile?.Role || '',
                                }}
                                validationSchema={ProfileSchema}
                                enableReinitialize
                                onSubmit={handleProfileUpdate}
                            >
                                {({ isSubmitting, dirty }) => (
                                    <FormikForm>

                                        <Row>
                                            <FormField name="FullName" label="Full Name" placeholder="Enter your full name" />
                                            <Col md={6}>
                                                <FormField name="Credentials" label="Credentials" placeholder="Enter your credentials" />
                                                <FormField name="Phone" label="Phone Number" placeholder="Enter your phone number" />
                                            </Col>

                                            <Col md={6}>
                                                <FormField name="Specialization" label="Specialization" placeholder="Enter your specialization" />
                                                <FormField name="Email" label="Email" placeholder="Enter your email address" />
                                            </Col>
                                        </Row>

                                        <Button type="submit" disabled={isSubmitting} className="w-100 mt-3" variant="primary">
                                            {isSubmitting ? 'Updating...' : 'Update Profile'}
                                        </Button>
                                    </FormikForm>
                                )}
                            </Formik>
                        </Card>
                    </Col>

                    <Col md={6}>
                        <Card className="p-4 shadow-lg rounded-4 h-100">
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
                                            placeholder="Enter your current password"
                                        />
                                        <FormField
                                            name="newPassword"
                                            label="New Password"
                                            type="password"
                                            placeholder="Enter your new password"
                                        />
                                        <Button variant="danger" type="submit" disabled={isSubmitting} className="w-100 mt-2">
                                            {isSubmitting ? 'Changing...' : 'Change Password'}
                                        </Button>
                                    </FormikForm>
                                )}
                            </Formik>
                        </Card>
                    </Col>
                </Row>
            </Container>
        </div>
    );
};

export default Profile;