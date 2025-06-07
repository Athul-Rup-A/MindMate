import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Container, Button, Form, Table, Modal, Spinner } from 'react-bootstrap';
import { Formik, Form as FormikForm, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import authHeader from '../../config/authHeader';
import { useNavigate } from 'react-router-dom';

const Feedback = () => {
    const [feedbacks, setFeedbacks] = useState([]);
    const [loading, setLoading] = useState(false);
    const [editingFeedback, setEditingFeedback] = useState(null);
    const [showModal, setShowModal] = useState(false);
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
        fetchFeedbacks();
    }, []);

    const feedbackSchema = Yup.object().shape({
        Rating: Yup.number().required().min(1).max(5),
        Type: Yup.string().required().oneOf(['session', 'platform', 'content', 'SOS']),
        Comment: Yup.string(),
    });

    const handleCreate = async (values, { resetForm }) => {
        try {
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
            <Button
                variant="outline-dark"
                className="position-absolute top-0 end-0 m-3"
                onClick={() => navigate('/home')}
            >
                Home
            </Button>

            <h2 className="mb-4 text-center">Submit Feedback</h2>
            <Formik
                initialValues={{
                    Rating: editingFeedback?.Rating || '',
                    Type: editingFeedback?.Type || '',
                    Comment: editingFeedback?.Comment || ''
                }}
                validationSchema={feedbackSchema}
                onSubmit={handleCreate}
            >
                {({ isSubmitting }) => (
                    <FormikForm className="mb-4">
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
            {loading ? <Spinner animation="border" /> : (
                <Table striped bordered hover>
                    <thead>
                        <tr>
                            <th>Rating</th>
                            <th>Type</th>
                            <th>Comment</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {feedbacks.map((f) => (
                            <tr key={f._id}>
                                <td>{f.Rating}</td>
                                <td>{f.Type}</td>
                                <td>{f.Comment}</td>
                                <td>
                                    <Button
                                        size="sm"
                                        variant="info"
                                        onClick={() => {
                                            setEditingFeedback(f);
                                            setShowModal(true);
                                        }}
                                    >Edit</Button>{' '}
                                    <Button size="sm" variant="danger" onClick={() => handleDelete(f._id)}>Delete</Button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </Table>
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