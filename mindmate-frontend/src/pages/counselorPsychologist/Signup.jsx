import React, { useState } from 'react';
import axios from '../../config/axios';
import FormField from '../../components/FormField';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { Container, Form, Button, Card, Row, Col, OverlayTrigger, Tooltip } from 'react-bootstrap';
import { InfoCircle, PersonFill, TelephoneFill, LockFill, EnvelopeFill, ClipboardFill, BriefcaseFill } from 'react-bootstrap-icons';
import { Formik, Form as FormikForm, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';

const SignupSchema = Yup.object().shape({
    fullName: Yup.string().required('Full name is required'),
    AliasId: Yup.string()
        .matches(/^[a-zA-Z0-9_]{4,20}$/, 'Alias ID must be 4–20 characters, alphanumeric or underscore only')
        .required('Alias ID is required'),
    password: Yup.string()
        .required('Password is required')
        .matches(/^[A-Za-z0-9]{6,}$/, 'At least 6 characters, alphanumeric only')
        .matches(/[A-Za-z]/, 'At least one letter required')
        .matches(/[0-9]/, 'At least one number required'),
    email: Yup.string().email('Invalid email').required('Email is required'),
    phone: Yup.string()
        .matches(/^[6-9]\d{9}$/, 'Enter a valid 10-digit Indian phone number')
        .required('Phone number is required'),
    credentials: Yup.string().required('Credentials are required'),
    specialization: Yup.string().required('Specialization is required'),
    role: Yup.string().oneOf(['counselor', 'psychologist'], 'Invalid role').required('Role is required'),
});

const Signup = () => {
    const navigate = useNavigate();

    const handleSubmit = async (values, { resetForm }) => {
        try {
            await axios.post('counselorPsychologist/signup', values);
            toast.success('Signup successful! Await admin approval.');
            resetForm();
            setTimeout(() => navigate('/counselorpsychologist/login'), 2500);
        } catch (err) {
            const msg = err?.response?.data?.message || 'Something went wrong';
            toast.error(msg);
        }
    };

    return (
        <div
            style={{
                backgroundImage: 'url("/Gpt2.png")',
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                minHeight: '100vh',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '40px 0',
            }}
        >
            <Container style={{ maxWidth: '900px', }}>
                <Card className="p-4 shadow-lg rounded-4"
                    style={{
                        background: 'transparent',
                        backdropFilter: 'blur(10px)',
                        border: '1px solid rgba(255,255,255,0.3)',
                        boxShadow: '0 8px 32px rgba(0,0,0,0.2)',
                    }}
                >
                    <h3 className="text-center fw-bold text-dark mb-1">MindMate Counselor/Psychologist SignUp</h3>
                    <p className="text-center text-muted mb-4">
                        Make a difference in students’ lives today 🌿
                    </p>

                    <Formik
                        initialValues={{
                            fullName: '',
                            AliasId: '',
                            password: '',
                            email: '',
                            phone: '',
                            credentials: '',
                            specialization: '',
                            role: '',
                        }}
                        validationSchema={SignupSchema}
                        onSubmit={handleSubmit}
                    >
                        {({ isSubmitting }) => (
                            <FormikForm>
                                <Row>
                                    <Col md={6}>
                                        <FormField
                                            label="Full Name"
                                            name="fullName"
                                            placeholder="Enter your full name"
                                            icon={<PersonFill />}
                                        />
                                        <FormField
                                            label={
                                                <>
                                                    Alias ID{' '}
                                                    <OverlayTrigger
                                                        placement="right"
                                                        overlay={
                                                            <Tooltip>
                                                                This will serve as your LoginID!
                                                            </Tooltip>
                                                        }
                                                    >
                                                        <InfoCircle style={{ cursor: 'pointer', position: 'relative', top: '-1px' }} />
                                                    </OverlayTrigger>
                                                </>
                                            }
                                            name="AliasId"
                                            placeholder="Ex. PSY001"
                                            icon={<ClipboardFill />}
                                        />
                                        <FormField
                                            label="Email"
                                            name="email"
                                            type="email"
                                            placeholder="Enter email"
                                            icon={<EnvelopeFill />}
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
                                                                At least 6 characters, including 1 letter, and 1 number
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
                                            label="Credentials"
                                            name="credentials"
                                            placeholder="Ex. M.Phil in Clinical Psychology"
                                            icon={<InfoCircle />}
                                        />
                                        <FormField
                                            label="Specialization"
                                            name="specialization"
                                            placeholder="Ex. Adolescent Therapy"
                                            icon={<BriefcaseFill />}
                                        />
                                        <Form.Group className="mb-4">
                                            <Form.Label>Role</Form.Label>
                                            <Field as="select" name="role" className="form-select">
                                                <option value="">Select Role</option>
                                                <option value="counselor">Counselor</option>
                                                <option value="psychologist">Psychologist</option>
                                            </Field>
                                            <ErrorMessage name="role" component="div" className="text-danger small mt-1" />
                                        </Form.Group>
                                    </Col>
                                </Row>

                                <Button
                                    type="submit"
                                    className="w-100 mt-3 fw-semibold"
                                    variant="dark"
                                    disabled={isSubmitting}
                                >
                                    {isSubmitting ? 'Signing Up...' : 'Sign Up'}
                                </Button>

                                <div className="text-center mt-3">
                                    <Button
                                        variant="link"
                                        className="text-decoration-none text-dark"
                                        onClick={() => navigate('/counselorpsychologist/login')}
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