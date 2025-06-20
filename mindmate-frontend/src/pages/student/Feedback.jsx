import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Container, Button, Form, Table, Modal, Spinner } from 'react-bootstrap';
import { Formik, Form as FormikForm, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import authHeader from '../../config/authHeader';
import { useNavigate } from 'react-router-dom';
import CustomTable from '../../components/CustomTable'
import GoHomeButton from '../../components/GoHomeButton';

const Feedback = () => {
    const [feedbacks, setFeedbacks] = useState([]);
    const [loading, setLoading] = useState(false);
    const [editingFeedback, setEditingFeedback] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [appointments, setAppointments] = useState([]);
    const navigate = useNavigate();

    const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/students';

    const fetchFeedbacks = async () => {
        try {
            setLoading(true);
            const res = await axios.get(`${BASE_URL}/feedbacks`, authHeader());
            setFeedbacks(res.data);
        } catch (error) {
            toast.error('Failed to fetch feedbacks');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {

        const fetchAppointments = async () => {
            try {
                const res = await axios.get(`${BASE_URL}/appointments`, authHeader());
                console.log('Fetched Appointments:', res.data);

                setAppointments(res.data);
            } catch (err) {
                toast.error('Failed to fetch appointments');
            }
        };
        fetchAppointments();

        fetchFeedbacks();
    }, []);

    const feedbackSchema = Yup.object().shape({
        Type: Yup.string()
            .required('Feedback type is required')
            .oneOf(['session', 'platform', 'content', 'SOS']),
        CounselorPsychologistId: Yup.string().when('Type', {
            is: 'session',
            then: (schema) => schema.required('Please select a session'),
            otherwise: (schema) => schema.notRequired(), // ✅ FIXED
        }),
        Rating: Yup.number()
            .required('Rating is required')
            .min(1, 'Minimum is 1')
            .max(5, 'Maximum is 5'),
        Comment: Yup.string(),
    });

    const handleCreate = async (values, { resetForm }) => {
        try {
            if (values.Type !== 'session') {
                delete values.CounselorPsychologistId;
            };

            await axios.post(`${BASE_URL}/feedbacks`, values, authHeader());
            toast.success('Feedback submitted');
            resetForm();
            fetchFeedbacks();
        } catch (err) {
            toast.error(err.response?.data?.message || 'Submit failed');
        }
    };

    const handleUpdate = async (values, { resetForm }) => {
        console.log('Updating feedback with:', values);

        try {
            await axios.put(`${BASE_URL}/feedbacks/${editingFeedback._id}`, values, authHeader());
            toast.success('Feedback updated');
            resetForm();
            setEditingFeedback(null);
            setShowModal(false);
            fetchFeedbacks();
        } catch (err) {
            toast.error(err.response?.data?.message || 'Update failed');
        }
    };

    const handleDelete = async (id) => {
        try {
            await axios.delete(`${BASE_URL}/feedbacks/${id}`, authHeader());
            toast.success('Feedback deleted');
            fetchFeedbacks();
        } catch (err) {
            toast.error('Delete failed');
        }
    };

    return (
        <Container
            className="py-5 position-relative mt-4"
            style={{
                background: 'linear-gradient(to right, #e0f7fa, #fce4ec)',
                borderRadius: '20px',
                padding: '2rem',
                boxShadow: '0 0 10px rgba(0,0,0,0.1)',
            }}
        >
            <GoHomeButton />

            <h2 className="mb-4 text-center">Submit Feedback</h2>
            <Formik
                initialValues={{
                    CounselorPsychologistId: '',
                    Rating: editingFeedback?.Rating || '',
                    Type: editingFeedback?.Type || '',
                    Comment: editingFeedback?.Comment || ''
                }}
                validationSchema={feedbackSchema}
                validateOnBlur={true}
                validateOnChange={true}
                onSubmit={handleCreate}
            >
                {({ isSubmitting, values, setFieldValue }) => (
                    <FormikForm className="mb-4">
                        <Form.Group className="mb-2">
                            <Form.Label>Rating (1-5)</Form.Label>
                            <Field name="Rating" type="number" className="form-control" />
                            <ErrorMessage name="Rating" component="div" className="text-danger" />
                        </Form.Group>

                        <Form.Group className="mb-2">
                            <Form.Label>Type</Form.Label>
                            <Field
                                name="Type"
                                as="select"
                                className="form-control"
                                onChange={(e) => {
                                    const selected = e.target.value;
                                    setFieldValue("Type", selected);
                                    if (selected !== "session") {
                                        setFieldValue("CounselorPsychologistId", ""); // Clear session if not type session
                                    }
                                }}
                            >
                                <option value="">Select</option>
                                <option value="session">Session</option>
                                <option value="platform">Platform</option>
                                <option value="content">Content</option>
                                <option value="SOS">SOS</option>
                            </Field>
                            <ErrorMessage name="Type" component="div" className="text-danger" />
                        </Form.Group>

                        <Form.Group className="mb-2">
                            <Form.Label>Select Session (Counselor/Psychologist)</Form.Label>
                            <Field
                                name="CounselorPsychologistId"
                                as="select"
                                className="form-control"
                                disabled={values.Type !== 'session'} // Conditionally disable here
                            >
                                <option value="">Select a session</option>
                                {appointments.map((app) => (
                                    <option
                                        key={app._id}
                                        value={app.CounselorPsychologistId?._id || ''}
                                    >
                                        {app.CounselorPsychologistId?.FullName || 'Unknown'} –{" "}
                                        {new Date(app.SlotDate).toLocaleDateString()} ({app.SlotStartTime} -{" "}
                                        {app.SlotEndTime})
                                    </option>
                                ))}
                            </Field>
                            <ErrorMessage
                                name="CounselorPsychologistId"
                                component="div"
                                className="text-danger"
                            />
                        </Form.Group>

                        <Form.Group className="mb-3">
                            <Form.Label>Comment</Form.Label>
                            <Field name="Comment" as="textarea" className="form-control" />
                            <ErrorMessage name="Comment" component="div" className="text-danger" />
                        </Form.Group>

                        <Button type="submit" disabled={isSubmitting}>Submit</Button>
                    </FormikForm>
                )}
            </Formik>

            <h4 className="text-center">My Feedbacks</h4>
            {loading ? (
                <Spinner animation="border" />
            ) : (
                <CustomTable
                    columns={[
                        {
                            header: 'Session',
                            accessor: (item) =>
                                item.Type === 'session'
                                    ? item.CounselorPsychologistId?.FullName || 'No counselor name'
                                    : 'Not applicable',
                        },
                        {
                            header: 'Date',
                            accessor: (item) =>
                                item.Type === 'session' && item.AppointmentId?.SlotDate
                                    ? new Date(item.AppointmentId.SlotDate).toLocaleDateString()
                                    : 'Not applicable',
                        },
                        { header: 'Rating', accessor: 'Rating' },
                        { header: 'Type', accessor: 'Type' },
                        { header: 'Comment', accessor: 'Comment' },
                    ]}
                    data={feedbacks}
                    actions={[
                        {
                            label: 'Edit',
                            variant: 'info',
                            onClick: (item) => {
                                setEditingFeedback(item);
                                setShowModal(true);
                            },
                        },
                        {
                            label: 'Delete',
                            variant: 'danger',
                            onClick: (item) => handleDelete(item._id),
                        },
                    ]}
                />
            )}

            <Modal show={showModal} onHide={() => setShowModal(false)}>
                <Modal.Header closeButton>
                    <Modal.Title>Edit Feedback</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Formik
                        enableReinitialize
                        initialValues={{
                            Rating: editingFeedback?.Rating || '',
                            Type: editingFeedback?.Type || '',
                            Comment: editingFeedback?.Comment || ''
                        }}
                        validationSchema={feedbackSchema}
                        onSubmit={handleUpdate}
                    >
                        {({ isSubmitting, dirty }) => (
                            <FormikForm>
                                <Form.Group className="mb-2">
                                    <Form.Label>Rating (1-5)</Form.Label>
                                    <Field name="Rating" type="number" className="form-control" />
                                    <ErrorMessage name="Rating" component="div" className="text-danger" />
                                </Form.Group>
                                <Form.Group className="mb-2">
                                    <Form.Label>Type</Form.Label>
                                    <Field name="Type" as="select" className="form-control">
                                        <option value="">Select</option>
                                        <option value="session">Session</option>
                                        <option value="platform">Platform</option>
                                        <option value="content">Content</option>
                                        <option value="SOS">SOS</option>
                                    </Field>
                                    <ErrorMessage name="Type" component="div" className="text-danger" />
                                </Form.Group>
                                <Form.Group className="mb-2">
                                    <Form.Label>Comment</Form.Label>
                                    <Field name="Comment" as="textarea" className="form-control" />
                                    <ErrorMessage name="Comment" component="div" className="text-danger" />
                                </Form.Group>
                                <Button type="submit" disabled={isSubmitting || !dirty}>Update</Button>
                            </FormikForm>
                        )}
                    </Formik>
                </Modal.Body>
            </Modal>
            <ToastContainer position="top-right" autoClose={3000} />
        </Container>
    );
};

export default Feedback;