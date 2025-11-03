import React, { useEffect, useState } from 'react';
import axios from '../../config/axios';
import FormField from '../../components/FormField';
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
    CustomSpecialization: Yup.string().when("Specialization", (Specialization, schema) => {
        return Specialization === "Other"
            ? schema.required("Please enter your specialization")
            : schema.notRequired();
    })
});

const PasswordSchema = Yup.object().shape({
    currentPassword: Yup.string().required('Current password is required'),
    newPassword: Yup.string()
        .matches(/^(?=.*[A-Za-z])(?=.*\d).{6,}$/, 'Minimum 6 characters with atleast one letter and one number, alphanumeric only')
        .required('New password is required'),
});

const Profile = () => {
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);

    const [selectedImage, setSelectedImage] = useState(null);
    const [previewImage, setPreviewImage] = useState(null);

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

    const handleImageUpload = async () => {
        if (!selectedImage) {
            toast.error("Please select an image");
            return;
        }

        const formData = new FormData();
        formData.append("ProfileImage", selectedImage);

        try {
            const res = await axios.put(
                "counselorPsychologist/profile-image",
                formData,
            );
            console.log("Profile Image URL:", res.data.ProfileImage);
            toast.success("Image updated successfully!");
            setProfile((prev) => ({
                ...prev,
                ProfileImage: res.data.ProfileImage
            }));
            setSelectedImage(null);
            setPreviewImage(null);
        } catch (err) {
            toast.error(err.response?.data?.message || "Image upload failed");
        }
    };

    const handleProfileUpdate = async (values, { setSubmitting, resetForm, dirty }) => {
        const isSame = (a, b) =>
            ['FullName', 'Phone', 'Email', 'Credentials', 'Specialization']
                .every((key) => a[key] === b[key]);

        if (isSame(values, profile)) {
            toast.info('No changes made');
            setSubmitting(false);
            return;
        }

        const submitValues = {
            FullName: values.FullName,
            Phone: values.Phone,
            Email: values.Email,
            Credentials: values.Credentials,
            Specialization: values.Specialization === "Other"
                ? values.CustomSpecialization
                : values.Specialization,
        };

        try {
            const res = await axios.post('counselorPsychologist/request-profile-update', submitValues);
            toast.success('Verification email sent. Please check your inbox to confirm changes.');
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to update profile');
        } finally {
            setSubmitting(false);
        }
    };

    const handlePasswordChange = async (values, { resetForm, setSubmitting }) => {
        try {
            await axios.post('counselorPsychologist/request-password-change', values);
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

    const specializationOptions = [
        "Clinical",
        "Counseling",
        "Child",
        "Rehabilitation",
        "Other",
    ];

    const normalizedSpecialization = profile?.Specialization?.trim().toLowerCase();
    const isCustom = profile && !specializationOptions
        .map(opt => opt.trim().toLowerCase())
        .includes(normalizedSpecialization);

    return (
        <Container>
            <Row className="g-4 align-items-stretch">
                <Col md={6} className="d-flex flex-column">
                    <Card className="p-4 shadow-lg rounded-4 flex-grow-1 d-flex flex-column justify-content-between h-100">
                        <h4 className="fw-bold text-primary text-center mb-3">Your Profile</h4>
                        <Formik
                            initialValues={{
                                FullName: profile?.FullName || '',
                                Phone: profile?.Phone || '',
                                Email: profile?.Email || '',
                                Credentials: profile?.Credentials || '',
                                Specialization: isCustom ? "Other" : profile?.Specialization || "",
                                CustomSpecialization: isCustom ? profile?.Specialization : ""
                            }}
                            validationSchema={ProfileSchema}
                            enableReinitialize
                            onSubmit={handleProfileUpdate}
                        >
                            {({ isSubmitting, values, errors, touched, setFieldValue, dirty }) => (
                                <FormikForm>

                                    <Row>

                                        <div className="text-center mb-4">
                                            <img
                                                src={
                                                    previewImage ||
                                                    `${profile?.ProfileImage}?t=${Date.now()}` ||
                                                    "/default-avatar.png"
                                                }
                                                alt="Profile"
                                                className="rounded-circle border"
                                                style={{ width: "110px", height: "110px", objectFit: "cover" }}
                                            />

                                            <div>
                                                <input
                                                    type="file"
                                                    accept="image/*"
                                                    onChange={(e) => {
                                                        const file = e.target.files[0];
                                                        setSelectedImage(file);
                                                        setPreviewImage(URL.createObjectURL(file));
                                                    }}
                                                />

                                                <Button
                                                    variant="success"
                                                    className="mb-1"
                                                    disabled={!selectedImage}
                                                    onClick={handleImageUpload}
                                                >
                                                    Upload Image
                                                </Button>
                                            </div>
                                        </div>

                                        <Col md={6}>
                                            <FormField name="FullName" label="Full Name" placeholder="Enter your full name" />
                                        </Col>
                                        <Col md={6}>
                                            <FormField name="Email" label="Email" placeholder="Enter your email address" />
                                        </Col>

                                        <Col md={6}>
                                            <FormField name="Phone" label="Phone Number" placeholder="Enter your phone number" />
                                        </Col>
                                        <Col md={6}>
                                            <FormField name="Credentials" label="Credentials" placeholder="Enter your credentials" />
                                        </Col>

                                        <Col md={6}>
                                            <div className="mb-3">
                                                <label className="form-label">Specialization</label>
                                                <select
                                                    name="Specialization"
                                                    className="form-control"
                                                    value={values.Specialization}
                                                    onChange={(e) => {
                                                        const val = e.target.value;
                                                        setFieldValue("Specialization", val);
                                                        if (val !== "Other") {
                                                            setFieldValue("CustomSpecialization", "");
                                                        }
                                                    }}
                                                >
                                                    <option value="" disabled>-- Select Specialization --</option>
                                                    {specializationOptions.map((opt) => (
                                                        <option key={opt} value={opt}>{opt}</option>
                                                    ))}
                                                </select>
                                                {errors.Specialization && touched.Specialization && (
                                                    <div className="text-danger small">{errors.Specialization}</div>
                                                )}
                                            </div>

                                        </Col>

                                        <Col md={6}>
                                            {/* Custom input shown only when "Other" is selected */}
                                            {values.Specialization === "Other" && (
                                                <FormField
                                                    name="CustomSpecialization"
                                                    label="Specified Specialization"
                                                    placeholder="Enter specialization"
                                                />
                                            )}
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

                <Col md={6} className="d-flex flex-column">
                    <Card className="p-4 shadow-lg rounded-4">
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
                                        className="mb-3"
                                    />
                                    <FormField
                                        name="newPassword"
                                        label="New Password"
                                        type="password"
                                        placeholder="Enter your new password"
                                        className="mb-3"
                                    />
                                    <Button variant="danger" type="submit" disabled={isSubmitting} className="w-100">
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