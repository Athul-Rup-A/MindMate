import React, { useState } from 'react';
import axios from '../../config/axios';
import FormField from '../../components/FormField';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { Container, Button, Card, Row, Col, OverlayTrigger, Tooltip } from 'react-bootstrap';
import { InfoCircle, ClipboardFill, LockFill, TelephoneFill, EnvelopeFill, PersonFill } from 'react-bootstrap-icons';
import { Formik, Form as FormikForm } from 'formik';
import * as Yup from 'yup';

const AdminSignupSchema = Yup.object().shape({
    Username: Yup.string()
        .matches(/^[a-zA-Z0-9_]{4,20}$/, 'Username must be 4–20 characters, alphanumeric or underscore only')
        .required('Username is required'),
    FullName: Yup.string().required('Full name is required'),
    password: Yup.string()
        .matches(/^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d@$!%*?&]{10,}$/, 'Minimum 10 characters with atleast 1 letter and 1 number, alphanumeric only')
        .required('Password is required'),
    email: Yup.string().email('Invalid email format').required('Email is required'),
    phone: Yup.string()
        .matches(/^[6-9]\d{9}$/, 'Enter a valid 10-digit Indian phone number')
        .required('Phone number is required'),
});

const Signup = () => {
    const [adminExists, setAdminExists] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (values, { resetForm }) => {
        try {
            await axios.post('/admin/signup', values);
            toast.success('Admin signup successful!');
            resetForm();
            setTimeout(() => navigate('/login'), 2500);
        } catch (err) {
            const msg = err?.response?.data?.message || 'Signup failed';

            if (msg === 'Signup not allowed. Admin already exists.') {
                setAdminExists(true);
            } else {
                toast.error(msg);
            }
        }
    };

    return (
        <div
            style={{
                backgroundImage: 'url("/pngtree-abstract.jpg")',
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                minHeight: '100vh',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '40px 0',
            }}
        >
            <Container style={{ maxWidth: '850px' }}>
                <Card
                    className="p-4 shadow-lg rounded-4"
                    style={{
                        background: 'transparent',
                        backdropFilter: 'blur(10px)',
                        border: '1px solid rgba(255,255,255,0.3)',
                        boxShadow: '0 8px 32px rgba(0,0,0,0.2)',
                    }}
                >
                    <h2 className="text-center fw-bold text-dark mb-1">MindMate Admin SignUp</h2>
                    <p className="text-center text-muted mb-4">Register to manage MindMate securely🛡️</p>

                    {adminExists ? (
                        <div className="text-center">
                            <h4 className="text-danger fw-bold mb-3">Admin Already Exists</h4>
                            <p className="text-muted fs-5">
                                This platform is already managed by an administrator.<br />
                                Please <span className="fw-semibold">log in</span> instead.
                            </p>
                            <Button
                                variant="dark"
                                className="mt-3"
                                onClick={() => navigate('/admin/login')}
                            >
                                Go to Login
                            </Button>
                        </div>
                    ) : (
                        <Formik
                            initialValues={{
                                Username: '',
                                FullName: '',
                                password: '',
                                email: '',
                                phone: '',
                            }}
                            validationSchema={AdminSignupSchema}
                            onSubmit={handleSubmit}
                        >
                            {({ isSubmitting }) => (
                                <FormikForm>
                                    <Row>
                                        <Col md={6}>
                                            <FormField
                                                label={
                                                    <>
                                                        Username{' '}
                                                        <OverlayTrigger
                                                            placement="right"
                                                            overlay={<Tooltip>Use a nickname.<br></br> This will be your login ID</Tooltip>}
                                                        >
                                                            <InfoCircle style={{ cursor: 'pointer', position: 'relative', top: '-1px' }} />
                                                        </OverlayTrigger>
                                                    </>
                                                }
                                                name="Username"
                                                placeholder="Ex. ADM001"
                                                icon={<ClipboardFill />}
                                            />

                                            <FormField
                                                label="Full Name"
                                                name="FullName"
                                                placeholder="Enter your full name"
                                                icon={<PersonFill />}
                                            />

                                            <FormField
                                                label="Phone"
                                                name="phone"
                                                placeholder="10-digit number"
                                                icon={<TelephoneFill />}
                                            />
                                        </Col>

                                        <Col md={6}>
                                            <FormField
                                                label={
                                                    <>
                                                        Password{' '}
                                                        <OverlayTrigger
                                                            placement="right"
                                                            overlay={
                                                                <Tooltip>
                                                                    Minimum 10 characters with at least one letter and one number
                                                                </Tooltip>
                                                            }
                                                        >
                                                            <InfoCircle style={{ cursor: 'pointer', position: 'relative', top: '-1px' }} />
                                                        </OverlayTrigger>
                                                    </>
                                                }
                                                name="password"
                                                type="password"
                                                placeholder="Create password"
                                                icon={<LockFill />}
                                            />

                                            <FormField
                                                label="Email"
                                                name="email"
                                                type="email"
                                                placeholder="Enter email"
                                                icon={<EnvelopeFill />}
                                            />
                                        </Col>
                                    </Row>

                                    <Button
                                        type="submit"
                                        className="w-100 mt-3 fw-semibold"
                                        variant="dark"
                                        disabled={isSubmitting}
                                        style={{ letterSpacing: '0.5px' }}
                                    >
                                        {isSubmitting ? 'Signing Up...' : 'Sign Up'}
                                    </Button>

                                    <div className="text-center mt-3">
                                        <Button
                                            variant="link"
                                            className="text-decoration-none text-dark"
                                            onClick={() => navigate('/admin/login')}
                                        >
                                            Already have an account?
                                        </Button>
                                    </div>
                                </FormikForm>
                            )}
                        </Formik>
                    )}
                </Card>
            </Container>
        </div>
    );
};

export default Signup;