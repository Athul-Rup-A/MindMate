import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Container, Button, Form, Spinner, Modal, Row, Col } from 'react-bootstrap';
import { Formik, Form as FormikForm, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { toast } from 'react-toastify';
import authHeader from '../../config/authHeader';
import CustomTable from '../../components/CustomTable';
import Select from 'react-select';
import getPastCounPsycho from '../../Utils/getPastCounPsycho';

const SOS = () => {
    const [sosLogs, setSosLogs] = useState([]);
    const [counselorPsychologists, setCounselorPsychologists] = useState([]);
    const [loading, setLoading] = useState(false);
    const [confirmData, setConfirmData] = useState(null);
    const [showConfirm, setShowConfirm] = useState(false);
    const [appointments, setAppointments] = useState([]);

    const BASE_URL =
        import.meta.env.VITE_API_URL || 'http://localhost:5000/api/students';

    const fetchSOSLogs = async () => {
        try {
            setLoading(true);
            const res = await axios.get(`${BASE_URL}/sos`, authHeader());
            setSosLogs(res.data);
        } catch (err) {
            toast.error('Failed to fetch SOS logs');
        } finally {
            setLoading(false);
        }
    };

    const fetchAppointments = async () => {
        try {
            const res = await axios.get(`${BASE_URL}/appointments`, authHeader());
            setAppointments(res.data);
            console.log('📅 Appointments:', res.data);
            console.log("🎯 Past Counselors:", getPastCounPsycho(res.data));
        } catch (err) {
            toast.error('Failed to fetch appointments');
        }
    };

    const fetchCounselorPsychologists = async () => {
        try {
            const res = await axios.get(
                `${BASE_URL}/resources/counselorPsychologist`,
                authHeader()
            );
            setCounselorPsychologists(res.data);
        } catch (err) {
            toast.error('Failed to fetch counselor/psychologist');
        }
    };

    useEffect(() => {
        fetchSOSLogs();
        fetchCounselorPsychologists();
        fetchAppointments();
    }, []);

    const sosSchema = Yup.object().shape({
        AlertedTo: Yup.string()
            .required('Counselor/Psychologist is required')
            .test('valid-object-id', 'Invalid ID format', (val) =>
                /^[0-9a-fA-F]{24}$/.test(val)
            ),
        Method: Yup.string()
            .oneOf(['call', 'sms', 'app'], 'Invalid Method')
            .required('Method is required'),
    });

    const handleTrigger = async () => {
        try {
            const payload = {
                AlertedTo: [confirmData.AlertedTo],
                Method: confirmData.Method,
            };
            await axios.post(`${BASE_URL}/sos`, payload, authHeader());
            toast.success('SOS triggered successfully');
            setConfirmData(null);
            setShowConfirm(false);
            fetchSOSLogs();

            if (confirmData?.resetForm) {
                confirmData.resetForm();
            }
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to trigger SOS');
        }
    };

    const handleSubmitWithConfirm = (values, resetForm) => {
        const selected = counselorPsychologists.find(
            (c) => c._id === values.AlertedTo
        );
        setConfirmData({
            ...values,
            AlertedToName: selected?.FullName || 'Unknown',
            resetForm,
        });
        setShowConfirm(true);
    };

    const handleDelete = async (id) => {
        try {
            await axios.delete(`${BASE_URL}/sos/${id}`, authHeader());
            toast.success('SOS log deleted');
            fetchSOSLogs();
        } catch (err) {
            toast.error('Failed to delete SOS log');
        }
    };

    return (
        <Container
            className="position-relative"
            style={{
                background: 'transparent',
                backgroundColor: 'rgba(255, 255, 255, 0.3)',
                backdropFilter: 'blur(4px)',
                borderRadius: '20px',
                padding: '2rem',
                boxShadow: '0 0 10px rgba(0,0,0,0.1)',
            }}
        >
            <h3 className="text-center mb-4">Trigger SOS</h3>

            <Formik
                initialValues={{ AlertedTo: '', Method: '' }}
                validationSchema={sosSchema}
                onSubmit={(values, { resetForm }) => handleSubmitWithConfirm(values, resetForm)}
            >
                {({ isSubmitting }) => (
                    <FormikForm className="mb-4">
                        <Row>
                            <Col>
                                <Form.Group className="mb-3">
                                    <Form.Label>Select Counselor/Psychologist</Form.Label>
                                    <Field name="AlertedTo">
                                        {({ field, form }) => (
                                            <Select
                                                options={getPastCounPsycho(appointments)}
                                                value={getPastCounPsycho(appointments).find((opt) => opt.value === field.value) || null}
                                                onChange={(option) => form.setFieldValue('AlertedTo', option?.value || '')}
                                                placeholder="Search and select..."
                                                isClearable
                                            />
                                        )}
                                    </Field>
                                    <ErrorMessage name="AlertedTo" component="div" className="text-danger" />
                                </Form.Group>
                            </Col>

                            <Col>
                                <Form.Group className="mb-3">
                                    <Form.Label>Method</Form.Label>
                                    <Field name="Method" as="select" className="form-control">
                                        <option value="">-- Select --</option>
                                        <option value="call">Call</option>
                                        <option value="sms">SMS</option>
                                        <option value="app">App</option>
                                    </Field>
                                    <ErrorMessage name="Method" component="div" className="text-danger" />
                                </Form.Group>
                            </Col>
                        </Row>

                        <Button type="submit" disabled={isSubmitting}>
                            Trigger SOS
                        </Button>
                    </FormikForm>
                )}
            </Formik>

            <Modal show={showConfirm} onHide={() => setShowConfirm(false)} centered>
                <Modal.Header closeButton>
                    <Modal.Title>Confirm SOS Trigger</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <p>Are you sure you want to trigger an SOS to:</p>
                    <strong>{confirmData?.AlertedToName}</strong>
                    <p>via <strong>{confirmData?.Method?.toUpperCase()}</strong>?</p>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowConfirm(false)}>
                        Cancel
                    </Button>
                    <Button variant="danger" onClick={handleTrigger}>
                        Confirm SOS
                    </Button>
                </Modal.Footer>
            </Modal>

            <h5 className="mt-5 text-center">My SOS Logs</h5>

            {loading ? (
                <div className="text-center">
                    <Spinner animation="border" />
                </div>
            ) : sosLogs.length === 0 ? (
                <p className="text-center">No SOS logs found</p>
            ) : (
                <CustomTable
                    columns={[
                        { header: '#', accessor: (_, idx) => idx + 1 },
                        { header: 'Method', accessor: 'Method' },
                        {
                            header: 'Triggered At',
                            accessor: (log) => new Date(log.TriggeredAt).toLocaleString(),
                        },
                        {
                            header: 'Alerted To',
                            accessor: (log) =>
                                log.AlertedTo.length > 0
                                    ? log.AlertedTo
                                        .map((id) => {
                                            const counselor = counselorPsychologists.find((coun) => coun._id === id);
                                            return <div key={id}>{counselor?.FullName || 'Unknown'}</div>;
                                        })
                                    : 'None',
                        },
                        {
                            header: 'Responded At',
                            accessor: (log) =>
                                log.RespondedAt
                                    ? new Date(log.RespondedAt).toLocaleString()
                                    : 'Not Responded',
                        },
                    ]}
                    data={sosLogs}
                    actions={[
                        {
                            label: 'Delete',
                            variant: 'danger',
                            onClick: (log) => handleDelete(log._id),
                            disabled: (log) => !!log.RespondedAt, // Disable if responded
                        },
                    ]}
                    rowKey={(log) => `sos-${log._id}`}
                />
            )}
        </Container>
    );
};

export default SOS;