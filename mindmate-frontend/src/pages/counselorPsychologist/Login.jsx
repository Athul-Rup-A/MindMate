import React, { useState } from 'react';
import axios from '../../config/axios';
import FormField from '../../components/FormField';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { Container, Card, Row, Col, Button } from 'react-bootstrap';
import { TelephoneFill, ClipboardFill, LockFill } from 'react-bootstrap-icons';
import { Formik, Form as FormikForm } from 'formik';
import * as Yup from 'yup';

const Login = () => {
    const [showPhone, setShowPhone] = useState(false);
    const [phonePurpose, setPhonePurpose] = useState('');
    const navigate = useNavigate();

    const LoginSchema = Yup.object().shape({
        AliasId: Yup.string().test(
            'AliasId-required',
            'Alias ID is required',
            function (value) {
                const { showPhone, phonePurpose } = this.options.context || {};
                return showPhone && phonePurpose === 'forgot-aliasid' ? true : !!value;
            }
        ),
        password: Yup.string().test(
            'password-required',
            'Password is required',
            function (value) {
                const { showPhone, phonePurpose } = this.options.context || {};
                return showPhone && phonePurpose === 'forgot-password' ? true : !!value;
            }
        ),
        phone: Yup.string()
                    .matches(/^[6-9]\d{9}$/, 'Enter a valid 10-digit phone number')
            .test('phone-required', 'Phone number is required', function (value) {
                const { showPhone } = this.options.context || {};
                return showPhone ? !!value : true;
        }),
    });

    const handleLogin = async (values, { setSubmitting }) => {
        try {
            const res = await axios.post('counselorPsychologist/login', {
                AliasId: values.AliasId,
                password: values.password,
            });

            const { token, user, mustChangePassword } = res.data;
            localStorage.setItem('token', token);

            if (mustChangePassword) {
                toast.info('Temporary password. Please reset it.');
                setTimeout(() => {
                    navigate('/force-reset-password', {
                        state: { userId: user._id, role: 'counselorPsychologist' }
                    });
                }, 3500);
            } else {
                toast.success('Login successful!');
            }
        } catch (err) {
            toast.error(err.response?.data?.message || 'Login failed');
        } finally {
            setSubmitting(false);
        }
    };

    const handlePhoneAction = async (values) => {
        if (!values.phone) {
            toast.warning('Please enter your phone number');
            return;
        }

        try {
            const endpoint = phonePurpose === 'forgot-password' ? 'forgot-password' : 'forgot-aliasid';
            const res = await axios.post(`counselorPsychologist/${endpoint}`, { phone: values.phone });

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
                background: 'linear-gradient(to right, rgb(100, 180, 200), rgb(224, 195, 252))',
                minHeight: '100vh',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
            }}
        >
            <Container style={{ maxWidth: '700px' }}>
                <Card className="p-4 shadow-lg rounded-4">
                    <h3 className="text-center fw-bold text-primary mb-1">
                        {showPhone
                            ? phonePurpose === 'forgot-password'
                                ? 'Reset Password'
                                : 'Recover Alias ID'
                            : 'Counselor / Psychologist Login'}
                    </h3>
                    <p className="text-center text-muted mb-4">
                        {showPhone
                            ? `Enter your registered phone to receive your ${phonePurpose === 'forgot-password' ? 'temporary password' : 'Alias ID'}`
                            : 'Empower mental wellness in students 🌱'}
                    </p>

                    <Formik
                        initialValues={{ AliasId: '', password: '', phone: '' }}
                        validationSchema={LoginSchema}
                        validateOnBlur={false}
                        validateOnChange={false}
                        context={{ showPhone, phonePurpose }}
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
                                                        label="Password"
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
                                            variant="primary"
                                            disabled={isSubmitting}
                                        >
                                            {isSubmitting ? 'Logging in...' : 'Login'}
                                        </Button>

                                        <div className="d-flex flex-column text-center mt-3 text-muted small">
                                            <Button
                                                variant="link"
                                                className="text-decoration-none"
                                                onClick={() => navigate('/signup/counselorpsychologist')}
                                            >
                                                Don't have an account?
                                            </Button>
                                            <Button
                                                variant="link"
                                                className="text-decoration-none"
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
                                                className="text-decoration-none"
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