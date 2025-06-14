import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Container, Table, Button, Form, Spinner, Row, Col } from 'react-bootstrap';
import { Formik, Form as FormikForm, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useNavigate } from 'react-router-dom';
import authHeader from '../../config/authHeader';
import Select from 'react-select';
import CustomTable from '../components/CustomTable';
import GoHomeButton from '../components/GoHomeButton';

const Wellness = () => {
    const [moodEntries, setMoodEntries] = useState([]);
    const [habitLogs, setHabitLogs] = useState([]);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const [editMoodIndex, setEditMoodIndex] = useState(null);
    const [editMoodValues, setEditMoodValues] = useState(null);

    const [editIndex, setEditIndex] = useState(null);
    const [editValues, setEditValues] = useState(null);

    const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/students';

    const validMoods = ['happy', 'sad', 'stressed', 'anxious', 'motivated'];
    const validTags = ['productive', 'positive', 'tired', 'focussed', 'lonely', 'social', 'bored', 'energetic'];

    useEffect(() => {
        fetchMoodEntries();
        fetchHabitLogs();
    }, []);

    const fetchMoodEntries = async () => {
        try {
            setLoading(true);
            const res = await axios.get(`${BASE_URL}/mood`, authHeader());
            setMoodEntries(res.data);
        } catch (err) {
            toast.error('Failed to fetch mood entries');
        } finally {
            setLoading(false);
        }
    };

    const fetchHabitLogs = async () => {
        try {
            setLoading(true);
            const res = await axios.get(`${BASE_URL}/habits`, authHeader());
            setHabitLogs(res.data);
        } catch (err) {
            toast.error('Failed to fetch habit logs');
        } finally {
            setLoading(false);
        }
    };

    const moodSchema = Yup.object().shape({
        Mood: Yup.string().oneOf(validMoods, 'Invalid mood').required('Mood is required'),
        Note: Yup.string(),
        Tags: Yup.array()
            .min(1, 'At least one tag is required')
            .of(Yup.string().oneOf(validTags, 'Invalid tag used'))
    });

    const habitSchema = Yup.object().shape({
        Exercise: Yup.boolean(),
        Hydration: Yup.number()
            .typeError('Hydration is required')
            .min(0, 'Min is 0')
            .max(10000, 'Max is 10000')
            .required('Hydration is required'),
        ScreenTime: Yup.number()
            .typeError('Screen Time is required')
            .min(0, 'Min is 0')
            .max(24, 'Max is 24')
            .required('Screen Time is required'),
        SleepHours: Yup.number()
            .typeError('Sleep Hours is required')
            .min(0, 'Min is 0')
            .max(24, 'Max is 24')
            .required('Sleep Hours is required'),
    });

    const handleMoodSubmit = async (values, { resetForm }) => {
        try {
            const formatted = {
                ...values
            };

            await axios.post(`${BASE_URL}/mood`, formatted, authHeader());
            toast.success('Mood added');
            fetchMoodEntries();
            resetForm();
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to add mood');
            console.error(err);
        }
    };

    const handleDeleteMood = async (index) => {
        try {
            await axios.delete(`${BASE_URL}/mood/${index}`, authHeader());
            toast.success('Mood entry deleted');
            fetchMoodEntries();
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to delete mood');
        }
    };

    const handleUpdateMood = async (values, index) => {
        try {
            const payload = {
                ...values,
                Tags: Array.isArray(values.Tags)
                    ? values.Tags.map(tag => tag.trim()).filter(Boolean)
                    : typeof values.Tags === 'string'
                        ? values.Tags.split(',').map(tag => tag.trim()).filter(Boolean)
                        : [],
            };

            await axios.put(`${BASE_URL}/mood/${index}`, payload, authHeader());
            toast.success('Mood updated');
            fetchMoodEntries();
            setEditMoodIndex(null);
            setEditMoodValues(null);
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to update mood');
        }
    };

    const handleHabitSubmit = async (values, { resetForm }) => {
        try {
            const payload = {
                Exercise: values.Exercise,
                Hydration: values.Hydration ? Number(values.Hydration) : 0,
                ScreenTime: values.ScreenTime ? Number(values.ScreenTime) : 0,
                SleepHours: values.SleepHours ? Number(values.SleepHours) : 0,
            };

            await axios.post(`${BASE_URL}/habits`, payload, authHeader());
            toast.success('Habit logged');
            fetchHabitLogs();
            resetForm();
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to log habit');
            console.error(err);
        }
    };

    const handleUpdateHabit = async (values, index) => {
        try {
            await axios.put(`${BASE_URL}/habits/${index}`, values, authHeader());
            toast.success("Habit log updated");
            fetchHabitLogs();
        } catch (err) {
            toast.error(err.response?.data?.message || "Update failed");
        }
    };

    const handleDeleteHabit = async (index) => {
        try {
            await axios.delete(`${BASE_URL}/habits/${index}`, authHeader());
            toast.success("Habit log deleted");
            fetchHabitLogs();
        } catch (err) {
            toast.error(err.response?.data?.message || "Delete failed");
        }
    };

    return (
        <Container
            fluid
            className="py-5"
            style={{
                minHeight: '100vh',
                background: 'linear-gradient(to right, #e0f7fa, #f3e5f5)',
                padding: '2rem',
                borderRadius: '20px',
            }}
        >
            <ToastContainer position="top-right" autoClose={3000} />
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h2>Wellness Tracker</h2>

                <GoHomeButton />

            </div>

            {/* Mood Form */}
            <h4>Mood Entry</h4>
            <Formik
                initialValues={{ Mood: '', Note: '', Tags: [] }}
                validationSchema={moodSchema}
                onSubmit={handleMoodSubmit}
                validateOnBlur={true}
                validateOnChange={true}
            >
                {({ values, isSubmitting, isValid, dirty }) => (
                    <FormikForm className="mb-4">
                        <Row>
                            <Col md={3}>
                                <Form.Label>Mood</Form.Label>
                                <Field as="select" name="Mood" className="form-control">
                                    <option value="">Select Mood</option>
                                    {validMoods.map((m) => (
                                        <option key={m} value={m}>{m}</option>
                                    ))}
                                </Field>
                                <ErrorMessage name="Mood" component="div" className="text-danger" />
                            </Col>
                            <Col md={3}>
                                <Form.Label>Tags</Form.Label>
                                <Field name="Tags">
                                    {({ field, form }) => (
                                        <Select
                                            isMulti
                                            name="Tags"
                                            options={validTags.map(tag => ({ label: tag, value: tag }))}
                                            className="basic-multi-select"
                                            classNamePrefix="select"
                                            value={field.value.map(tag => ({ label: tag, value: tag }))}
                                            onChange={(selectedOptions) => {
                                                const tags = selectedOptions.map(option => option.value);
                                                form.setFieldValue('Tags', tags);
                                            }}
                                            onBlur={() => form.setFieldTouched('Tags', true)}
                                        />
                                    )}
                                </Field>
                                <ErrorMessage name="Tags" component="div" className="text-danger" />
                            </Col>
                            <Col md={3}>
                                <Form.Label>Note</Form.Label>
                                <Field name="Note" className="form-control" placeholder="Optional note" />
                            </Col>
                        </Row>
                        <Button type="submit" className="mt-3" disabled={!dirty || !isValid || isSubmitting}>
                            Add Mood
                        </Button>
                    </FormikForm>
                )}
            </Formik>

            {/* Habit Form */}
            <h4>Habit Log</h4>
            <Formik
                initialValues={{ Exercise: false, Hydration: '', ScreenTime: '', SleepHours: '' }}
                validationSchema={habitSchema}
                onSubmit={handleHabitSubmit}
                validateOnBlur={true}
                validateOnChange={true}
            >
                {({ values, isSubmitting, dirty, isValid }) => (
                    <FormikForm className="mb-4">
                        <Row>
                            <Col md={2} className="d-flex align-items-center justify-content-start">
                                <Form.Label className="mb-0 me-2">Exercise</Form.Label>
                                <Field type="checkbox" name="Exercise" className="form-check-input" />
                            </Col>
                            <Col md={2}>
                                <Form.Label>Hydration</Form.Label>
                                <Field type="number" name="Hydration" className="form-control" placeholder="Max 10000 ml/day" />
                                <ErrorMessage name="Hydration" component="div" className="text-danger" />
                            </Col>
                            <Col md={2}>
                                <Form.Label>Screen Time</Form.Label>
                                <Field type="number" name="ScreenTime" className="form-control" placeholder="Max 24 hrs" />
                                <ErrorMessage name="ScreenTime" component="div" className="text-danger" />
                            </Col>
                            <Col md={2}>
                                <Form.Label>Sleep Hours</Form.Label>
                                <Field type="number" name="SleepHours" className="form-control" placeholder="Max 24 hrs" />
                                <ErrorMessage name="SleepHours" component="div" className="text-danger" />
                            </Col>
                        </Row>
                        <Button type="submit" className="mt-3" disabled={!dirty || !isValid || isSubmitting}>
                            Log Habit
                        </Button>
                    </FormikForm>
                )}
            </Formik>

            {/* Mood Entries Table */}
            <h5 className="mt-5">Mood Entries</h5>
            {loading ? (
                <Spinner animation="border" />
            ) : (
                <CustomTable
                    columns={[
                        { header: '#', accessor: (_, idx) => idx + 1 },
                        { header: 'Date', accessor: (entry) => new Date(entry.Date).toLocaleDateString() },
                        { header: 'Mood', accessor: 'Mood' },
                        { header: 'Tags', accessor: (entry) => entry.Tags?.join(', ') },
                        { header: 'Note', accessor: 'Note' }
                    ]}
                    data={moodEntries}
                    actions={[
                        {
                            label: 'Edit',
                            variant: 'warning',
                            onClick: (entry, idx) => {
                                setEditMoodIndex(idx);
                                setEditMoodValues({
                                    Mood: entry.Mood || '',
                                    Note: entry.Note || '',
                                    Tags: Array.isArray(entry.Tags) ? entry.Tags : [],
                                });
                            }
                        },
                        {
                            label: 'Delete',
                            variant: 'danger',
                            onClick: (_, idx) => handleDeleteMood(idx)
                        }
                    ]}
                    renderExpandedRow={(entry, idx) => {
                        if (editMoodIndex !== idx) return null;
                        return (
                            <tr>
                                <td colSpan="6">
                                    <Formik
                                        enableReinitialize
                                        initialValues={editMoodValues}
                                        validationSchema={moodSchema}
                                        onSubmit={(values, { resetForm }) => {
                                            handleUpdateMood(values, idx);
                                            setEditMoodIndex(null);
                                            setEditMoodValues(null);
                                            resetForm();
                                        }}
                                    >
                                        {({ isSubmitting, dirty, isValid }) => (
                                            <FormikForm>
                                                <Row className="p-2">
                                                    <Col md={3}>
                                                        <Form.Label>Mood</Form.Label>
                                                        <Field as="select" name="Mood" className="form-control">
                                                            <option value="">Select Mood</option>
                                                            {validMoods.map((m) => (
                                                                <option key={m} value={m}>{m}</option>
                                                            ))}
                                                        </Field>
                                                        <ErrorMessage name="Mood" component="div" className="text-danger" />
                                                    </Col>
                                                    <Col md={3}>
                                                        <Form.Label>Tags</Form.Label>
                                                        <Field name="Tags">
                                                            {({ field, form }) => (
                                                                <Select
                                                                    isMulti
                                                                    name="Tags"
                                                                    options={validTags.map(tag => ({ label: tag, value: tag }))}
                                                                    className="basic-multi-select"
                                                                    classNamePrefix="select"
                                                                    value={(field.value || []).map(tag => ({ label: tag, value: tag }))}
                                                                    onChange={(selectedOptions) => {
                                                                        const tags = selectedOptions.map(option => option.value);
                                                                        form.setFieldValue('Tags', tags);
                                                                    }}
                                                                    onBlur={() => form.setFieldTouched('Tags', true)}
                                                                />
                                                            )}
                                                        </Field>
                                                        <ErrorMessage name="Tags" component="div" className="text-danger" />
                                                    </Col>
                                                    <Col md={3}>
                                                        <Form.Label>Note</Form.Label>
                                                        <Field name="Note" as="textarea" className="form-control" />
                                                    </Col>
                                                    <Col md={3} className="d-flex align-items-end">
                                                        <Button
                                                            type="submit"
                                                            variant="success"
                                                            disabled={!dirty || !isValid || isSubmitting}
                                                        >
                                                            Update
                                                        </Button>
                                                        <Button
                                                            variant="secondary"
                                                            className="ms-2"
                                                            onClick={() => {
                                                                setEditMoodIndex(null);
                                                                setEditMoodValues(null);
                                                            }}
                                                        >
                                                            Cancel
                                                        </Button>
                                                    </Col>
                                                </Row>
                                            </FormikForm>
                                        )}
                                    </Formik>
                                </td>
                            </tr>
                        );
                    }}
                    rowKey={(_, idx) => `mood-${idx}`}
                />
            )}

            {/* Habit Logs Table */}
            <h5 className="mt-5">Habit Logs</h5>
            {loading ? (
                <Spinner animation="border" />
            ) : (
                <CustomTable
                    columns={[
                        { header: '#', accessor: (_, idx) => idx + 1 },
                        { header: 'Date', accessor: (entry) => new Date(entry.Date).toLocaleDateString() },
                        { header: 'Exercise', accessor: (entry) => (entry.Exercise ? 'Yes' : 'No') },
                        { header: 'Hydration', accessor: (entry) => `${entry.Hydration} ml` },
                        { header: 'Screen Time', accessor: (entry) => `${entry.ScreenTime} hrs` },
                        { header: 'Sleep Hours', accessor: (entry) => `${entry.SleepHours} hrs` },
                    ]}
                    data={habitLogs}
                    actions={[
                        {
                            label: 'Edit',
                            variant: 'warning',
                            onClick: (entry, idx) => {
                                setEditIndex(idx);
                                setEditValues({
                                    Exercise: entry.Exercise,
                                    Hydration: entry.Hydration,
                                    ScreenTime: entry.ScreenTime,
                                    SleepHours: entry.SleepHours,
                                });
                            }
                        },
                        {
                            label: 'Delete',
                            variant: 'danger',
                            onClick: (_, idx) => handleDeleteHabit(idx)
                        }
                    ]}
                    renderExpandedRow={(entry, idx) => {
                        if (editIndex !== idx) return null;
                        return (
                            <tr>
                                <td colSpan="7">
                                    <Formik
                                        enableReinitialize
                                        initialValues={editValues}
                                        validationSchema={habitSchema}
                                        onSubmit={(values, { resetForm }) => {
                                            handleUpdateHabit(values, editIndex);
                                            setEditIndex(null);
                                            setEditValues(null);
                                            resetForm();
                                        }}
                                    >
                                        {({ isSubmitting, dirty, isValid }) => (
                                            <FormikForm>
                                                <Row className="p-2">
                                                    <Col xs={12} sm={6} md={2} className="mb-3">
                                                        <Form.Label>Exercise</Form.Label><br />
                                                        <Field type="checkbox" name="Exercise" className="form-check-input ms-2" />
                                                    </Col>
                                                    <Col xs={12} sm={6} md={2} className="mb-3">
                                                        <Form.Label>Hydration</Form.Label>
                                                        <Field type="number" name="Hydration" className="form-control" />
                                                        <ErrorMessage name="Hydration" component="div" className="text-danger" />
                                                    </Col>
                                                    <Col xs={12} sm={6} md={2} className="mb-3">
                                                        <Form.Label>Screen Time</Form.Label>
                                                        <Field type="number" name="ScreenTime" className="form-control" />
                                                        <ErrorMessage name="ScreenTime" component="div" className="text-danger" />
                                                    </Col>
                                                    <Col xs={12} sm={6} md={2} className="mb-3">
                                                        <Form.Label>Sleep Hours</Form.Label>
                                                        <Field type="number" name="SleepHours" className="form-control" />
                                                        <ErrorMessage name="SleepHours" component="div" className="text-danger" />
                                                    </Col>
                                                    <Col xs={12} md={4} className="d-flex align-items-end mb-3">
                                                        <Button
                                                            type="submit"
                                                            variant="success"
                                                            disabled={!dirty || !isValid || isSubmitting}
                                                        >
                                                            Update
                                                        </Button>
                                                        <Button
                                                            variant="secondary"
                                                            className="ms-2"
                                                            onClick={() => {
                                                                setEditIndex(null);
                                                                setEditValues(null);
                                                            }}
                                                        >
                                                            Cancel
                                                        </Button>
                                                    </Col>
                                                </Row>
                                            </FormikForm>
                                        )}
                                    </Formik>
                                </td>
                            </tr>
                        );
                    }}
                    rowKey={(_, idx) => `habit-${idx}`}
                />
            )}
        </Container>
    );
};

export default Wellness;