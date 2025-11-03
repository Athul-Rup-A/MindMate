import React, { useState } from 'react';
import axios from '../../src/config/axios';
import FormField from '../../src/components/FormField';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { Container, Card, Row, Col, Button, Form } from 'react-bootstrap';
import { TelephoneFill, ClipboardFill, LockFill } from 'react-bootstrap-icons';
import { Formik, Form as FormikForm } from 'formik';
import * as Yup from 'yup';

const roles = [
    { label: 'Student', value: 'student' },
    { label: 'Counselor/Psychologist', value: 'counselorPsychologist' },
    { label: 'Admin', value: 'admin' },
];

const LoginSchema = (showPhone, phonePurpose) =>
    Yup.object().shape({
        Username: Yup.string()
            .matches(/^[a-zA-Z0-9_]{4,20}$/, 'Username must be 4–20 characters, alphanumeric or underscore only')
            .test('Username-required', 'Username is required', function (value) {
                return showPhone && phonePurpose === 'forgot-username' ? true : !!value;
            }),
        password: Yup.string()
            .matches(/^[A-Za-z0-9]{6,}$/, 'At least 6 characters, alphanumeric only')
            .matches(/[A-Za-z]/, 'At least one letter required')
            .matches(/[0-9]/, 'At least one number required')
            .test('password-required', 'Password is required', function (value) {
                return showPhone && phonePurpose === 'forgot-password' ? true : !!value;
            }),
        phone: Yup.string()
            .matches(/^[6-9]\d{9}$/, 'Enter a valid 10-digit phone number')
            .test('phone-required', 'Phone number is required', function (value) {
                return showPhone ? !!value : true;
            }),
        role: Yup.string().test(
            'role-required',
            'Select role',
            function (value) {
                return showPhone ? !!value : true;
            }
        ),
    });

const CentralizedLogin = () => {
    const [showPhone, setShowPhone] = useState(false);
    const [phonePurpose, setPhonePurpose] = useState('');
    const navigate = useNavigate();

    const handleLogin = async (values, { setSubmitting }) => {
        try {
            const res = await axios.post(`login`, {
                Username: values.Username,
                password: values.password,
            });

            const { token, user, mustChangePassword } = res.data;
            localStorage.setItem('token', token);

            toast.success('Login successful!');

            setTimeout(() => {
                if (mustChangePassword) {
                    navigate('/force-reset-password', { state: { userId: user._id } });
                    return;
                }

                switch (user.Role) {
                    case 'student':
                        setTimeout(() => {
                            navigate('/student/home');
                        }, 2000);
                        break;
                    case 'counselor':
                    case 'psychologist':
                    case 'counselorPsychologist':
                        setTimeout(() => {
                            navigate('/counselorpsychologist/stats');
                        }, 2000);
                        break;
                    case 'admin':
                        setTimeout(() => {
                            navigate('/admin/stat');
                        }, 2000);
                        break;
                    default:
                        toast.error('Invalid role. Contact admin!');
                }
            }, 1500);
        } catch (err) {
            toast.error(err.response?.data?.message || 'Login failed');
        } finally {
            setSubmitting(false);
        }
    };

    const handlePhoneAction = async (values) => {
        if (!values.phone || !/^[6-9]\d{9}$/.test(values.phone)) {
            toast.warning('Please enter a valid 10-digit phone number');
            return;
        }

        if (!values.role) {
            toast.warning('Please select your role');
            return;
        }

        try {
            let endpoint = '';
            if (values.role === 'student') endpoint = `students/${phonePurpose}`;
            else if (values.role === 'counselorPsychologist') endpoint = `counselorPsychologist/${phonePurpose}`;
            else if (values.role === 'admin') endpoint = `admin/${phonePurpose}`;

            const res = await axios.post(endpoint, { phone: values.phone });
            toast.success(res.data.message || 'Request successful');
            setShowPhone(false);
            setPhonePurpose('');
        } catch (err) {
            toast.error(err.response?.data?.message || 'Request failed');
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
            <Container style={{ maxWidth: '700px' }}>
                <Card className="p-4 shadow-lg rounded-4"
                    style={{
                        background: 'transparent',
                        backdropFilter: 'blur(10px)',
                        border: '1px solid rgba(255,255,255,0.3)',
                        boxShadow: '0 8px 32px rgba(0,0,0,0.2)',
                    }}
                >
                    <h2 className="text-center fw-bold text-dark mb-1">
                        {showPhone
                            ? (phonePurpose === 'forgot-password'
                                ? 'Reset Password'
                                : 'Recover Username')
                            : "MindMate Login"}
                    </h2>

                    <p className="text-center text-muted mb-4">
                        {showPhone
                            ? `Enter your registered phone to receive your ${phonePurpose === 'forgot-password' ? 'temporary password' : 'Username'
                            }`
                            : 'Empowering Mental Wellness'}
                    </p>
                    <Formik
                        initialValues={{ Username: '', password: '', phone: '', role: '' }}
                        validationSchema={LoginSchema(showPhone, phonePurpose)}
                        onSubmit={handleLogin}
                    // onSubmit={(values, helpers) => handleLogin(values, helpers)}
                    >
                        {({ isSubmitting, values, resetForm, setFieldValue }) => (
                            <FormikForm>
                                <Row>
                                    <Col md={12}>
                                        {showPhone && (
                                            <div className="mb-3">
                                                <Form.Label>Select Role</Form.Label>
                                                <div className="d-flex gap-2 mt-2">
                                                    {roles.map((r) => (
                                                        <Button
                                                            key={r.value}
                                                            type="button"
                                                            className={`flex-grow-1 fw-semibold ${values.role === r.value ? 'bg-primary text-white' : 'bg-light text-dark'
                                                                }`}
                                                            onClick={() => setFieldValue('role', r.value)}
                                                        >
                                                            {r.label}
                                                        </Button>
                                                    ))}
                                                </div>
                                            </div>
                                        )}

                                        {!showPhone ? (
                                            <>
                                                {phonePurpose !== 'forgot-username' && (
                                                    <FormField name="Username" label="Username" placeholder="Enter your Username" icon={<ClipboardFill />} />
                                                )}
                                                {phonePurpose !== 'forgot-password' && (
                                                    <FormField
                                                        name="password"
                                                        type="password"
                                                        label={"Password"}
                                                        placeholder="Enter your password"
                                                        icon={<LockFill />}
                                                    />
                                                )}
                                            </>
                                        ) : (
                                            <FormField name="phone" label="Phone Number" placeholder="Enter your phone" icon={<TelephoneFill />} />
                                        )}
                                    </Col>
                                </Row>

                                {!showPhone ? (
                                    <div className="d-flex flex-column text-center mt-3 text-muted small">
                                        <Button type="submit"
                                            className="w-100 fw-semibold mt-2 mb-2"
                                            variant="primary"
                                            disabled={isSubmitting}
                                        // onClick={(e) => e.stopPropagation()}
                                        >
                                            {isSubmitting ? 'Logging in...' : 'Login'}
                                        </Button>
                                        <Button
                                            variant="link"
                                            className="text-decoration-none text-dark"
                                            onClick={() => navigate('/')}
                                        >
                                            Don't have an account?
                                        </Button>
                                        <Button
                                            variant="link"
                                            className="text-decoration-none text-dark"
                                            onClick={() => {
                                                setPhonePurpose('forgot-password');
                                                setShowPhone(true);
                                                resetForm();
                                            }}
                                        >
                                            Forgot Password?
                                        </Button>

                                        <Button
                                            variant="link"
                                            className="text-decoration-none text-dark"
                                            onClick={() => {
                                                setPhonePurpose('forgot-username');
                                                setShowPhone(true);
                                                resetForm();
                                            }}
                                        >
                                            Forgot Username?
                                        </Button>
                                    </div>
                                ) : (
                                    <div className="d-flex gap-2 mt-3">
                                        <Button variant="warning" className="w-100 fw-semibold" type="button" onClick={() => handlePhoneAction(values)}>Submit</Button>
                                        <Button variant="secondary" className="w-100 fw-semibold" type="button" onClick={() => { setShowPhone(false); setPhonePurpose(''); resetForm(); }}>Back</Button>
                                    </div>
                                )}
                            </FormikForm>
                        )}
                    </Formik>
                </Card>
            </Container>
        </div>
    );
};

export default CentralizedLogin;