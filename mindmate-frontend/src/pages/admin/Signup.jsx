import React from 'react';
import axios from '../../config/axios';
import FormField from '../../components/FormField';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { Container, Form, Button, Card, Row, Col, OverlayTrigger, Tooltip } from 'react-bootstrap';
import { InfoCircle, ClipboardFill, LockFill, TelephoneFill, EnvelopeFill } from 'react-bootstrap-icons';
import { Formik, Form as FormikForm, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';

const AdminSignupSchema = Yup.object().shape({
    AliasId: Yup.string()
        .matches(/^[a-zA-Z0-9_]{4,20}$/, 'Alias ID must be 4–20 characters, alphanumeric or underscore only')
        .required('Alias ID is required'),
    password: Yup.string()
        .matches(/^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d@$!%*?&]{10,}$/, 'Minimum 10 characters with 1 letter and 1 number')
        .required('Password is required'),
    email: Yup.string().email('Invalid email format').required('Email is required'),
    phone: Yup.string()
        .matches(/^[6-9]\d{9}$/, 'Enter a valid 10-digit Indian phone number')
        .required('Phone number is required'),
    role: Yup.string().oneOf(['admin', 'moderator'], 'Invalid role').required('Role is required'),
});

const Signup = () => {
    const navigate = useNavigate();

    const handleSubmit = async (values, { resetForm }) => {
        try {
            await axios.post('/admin/signup', values);
            toast.success('Admin signup successful!');
            resetForm();
            setTimeout(() => navigate('/login/admin'), 2500);
        } catch (err) {
            const msg = err?.response?.data?.message || 'Signup failed';
            toast.error(msg);
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
                    <h2 className="text-center fw-bold text-dark mb-1">Admin / Moderator Signup</h2>
                    <p className="text-center text-muted mb-4">Register to manage MindMate securely🛡️</p>

                    <Formik
                        initialValues={{
                            AliasId: '',
                            password: '',
                            email: '',
                            phone: '',
                            role: '',
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
                                                    Alias ID{' '}
                                                    <OverlayTrigger
                                                        placement="right"
                                                        overlay={<Tooltip>Use a nickname.<br></br> This will be your login ID</Tooltip>}
                                                    >
                                                        <InfoCircle style={{ cursor: 'pointer', position: 'relative', top: '-1px' }} />
                                                    </OverlayTrigger>
                                                </>
                                            }
                                            name="AliasId"
                                            placeholder="Ex. ADM001"
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
                                                                Minimum 10 characters with at least 1 letter and 1 number
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

                                        <Form.Group className="mb-4">
                                            <Form.Label>Role</Form.Label>
                                            <Field as="select" name="role" className="form-select">
                                                <option value="">Select Role</option>
                                                <option value="admin">Admin</option>
                                                <option value="moderator">Moderator</option>
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
                                    style={{ letterSpacing: '0.5px' }}
                                >
                                    {isSubmitting ? 'Signing Up...' : 'Sign Up'}
                                </Button>

                                <div className="text-center mt-3">
                                    <Button
                                        variant="link"
                                        className="text-decoration-none text-dark"
                                        onClick={() => navigate('/login/admin')}
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