import React, { useState } from 'react';
import axios from '../../config/axios';
import FormField from '../../components/FormField';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { Container, Card, Row, Col, Button, OverlayTrigger, Tooltip } from 'react-bootstrap';
import { TelephoneFill, ClipboardFill, LockFill, InfoCircle } from 'react-bootstrap-icons';
import { Formik, Form as FormikForm } from 'formik';
import * as Yup from 'yup';

const LoginSchema = (showPhone, phonePurpose) =>
    Yup.object().shape({
        AliasId: Yup.string()
            .matches(/^[a-zA-Z0-9_]{4,20}$/, 'Alias ID must be 4–20 characters, alphanumeric or underscore only')
            .test(
                'AliasId-required',
                'Alias ID is required',
                function (value) {
                    return showPhone && phonePurpose === 'forgot-aliasid' ? true : !!value;
                }
            ),
        password: Yup.string()
            .matches(
                /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{10,}$/,
                'At least 10 characters including one letter and one number, alphanumeric only'
            )
            .test(
                'password-required',
                'Password is required',
                function (value) {
                    return showPhone && phonePurpose === 'forgot-password' ? true : !!value;
                }
            ),
        phone: Yup.string()
            .matches(/^[6-9]\d{9}$/, 'Enter a valid 10-digit phone number')
            .test('phone-required', 'Phone number is required', function (value) {
                return showPhone ? !!value : true;
            }),
    });

const Login = () => {
    const [showPhone, setShowPhone] = useState(false);
    const [phonePurpose, setPhonePurpose] = useState('');
    const navigate = useNavigate();

    const handleLogin = async (values, { setSubmitting }) => {
        try {
            const res = await axios.post('/admin/login', {
                AliasId: values.AliasId,
                password: values.password,
            });

            const { token, user, mustChangePassword, message } = res.data;
            localStorage.setItem('token', token);

            if (mustChangePassword) {
                toast.info(message || 'Temporary password. Please reset it.');
                setTimeout(() => {
                    navigate('/force-reset-password', {
                        state: { userId: user._id, role: 'admin' }
                    });
                }, 3500);
            } else {
                toast.success('Login successful!');
                setTimeout(() => {
                    navigate('/admin/stat');
                }, 3500);
            }
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

        try {
            const endpoint = phonePurpose === 'forgot-password' ? 'forgot-password' : 'forgot-aliasid';
            const res = await axios.post(`/admin/${endpoint}`, { phone: values.phone });

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
                    <h3 className="text-center fw-bold text-dark mb-1">
                        {showPhone
                            ? phonePurpose === 'forgot-password'
                                ? 'Reset Password'
                                : 'Recover Alias ID'
                            : 'MindMate Admin/Moderator Login'}
                    </h3>
                    <p className="text-center text-muted mb-4">
                        {showPhone
                            ? `Enter your registered phone to receive your ${phonePurpose === 'forgot-password' ? 'temporary password' : 'Alias ID'
                            }`
                            : 'Securely manage MindMate operations🔐'}
                    </p>

                    <Formik
                        initialValues={{ AliasId: '', password: '', phone: '' }}
                        validationSchema={LoginSchema(showPhone, phonePurpose)}
                        validateOnBlur={true}
                        validateOnChange={false}
                        onSubmit={handleLogin}
                    >
                        {({ isSubmitting, values, resetForm }) => (
                            <FormikForm>
                                <Row>
                                    <Col md={12}>
                                        {!showPhone && (
                                            <>
                                                {phonePurpose !== 'forgot-aliasid' && (
                                                    <FormField
                                                        name="AliasId"
                                                        label="Alias ID"
                                                        placeholder="Enter your Alias ID"
                                                        icon={<ClipboardFill />}
                                                    />
                                                )}
                                                {phonePurpose !== 'forgot-password' && (
                                                    <FormField
                                                        name="password"
                                                        label={
                                                            <>
                                                                Password{' '}
                                                                <OverlayTrigger
                                                                    placement="right"
                                                                    overlay={
                                                                        <Tooltip>
                                                                            Your secure password with at-least 10 characters including 1 letter and 1 number.
                                                                        </Tooltip>
                                                                    }
                                                                >
                                                                    <InfoCircle style={{ cursor: 'pointer', position: 'relative', top: '-1px' }} />
                                                                </OverlayTrigger>
                                                            </>
                                                        }
                                                        type="password"
                                                        placeholder="Enter your password"
                                                        icon={<LockFill />}
                                                    />
                                                )}
                                            </>
                                        )}

                                        {showPhone && (
                                            <>
                                                <FormField
                                                    name="phone"
                                                    label="Phone Number"
                                                    placeholder="Enter your phone number"
                                                    icon={<TelephoneFill />}
                                                />
                                                <div className="d-flex gap-2">
                                                    <Button
                                                        variant="warning"
                                                        className="w-100 fw-semibold"
                                                        type="button"
                                                        onClick={() => handlePhoneAction(values)}
                                                    >
                                                        Submit
                                                    </Button>
                                                    <Button
                                                        variant="secondary"
                                                        className="w-100 fw-semibold"
                                                        type="button"
                                                        onClick={() => {
                                                            setShowPhone(false);
                                                            setPhonePurpose('');
                                                            resetForm();
                                                        }}
                                                    >
                                                        Back
                                                    </Button>
                                                </div>
                                            </>
                                        )}
                                    </Col>
                                </Row>

                                {!showPhone && (
                                    <>
                                        <Button
                                            type="submit"
                                            className="w-100 fw-semibold mt-2"
                                            variant="dark"
                                            disabled={isSubmitting}
                                        >
                                            {isSubmitting ? 'Logging in...' : 'Login'}
                                        </Button>

                                        <div className="d-flex flex-column text-center mt-3 text-muted small">
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
                                                    setPhonePurpose('forgot-aliasid');
                                                    setShowPhone(true);
                                                    resetForm();
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
        </div>
    );
};

export default Login;