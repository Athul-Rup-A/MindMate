import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Container, Table, Button, Form, Spinner, Modal } from 'react-bootstrap';
import { Formik, Form as FormikForm, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import authHeader from '../../config/authHeader';
import { useNavigate } from 'react-router-dom';
import CustomTable from '../components/CustomTable';
import GoHomeButton from '../components/GoHomeButton';

const SOS = () => {
    const [sosLogs, setSosLogs] = useState([]);
    const [counselorPsychologists, setCounselorPsychologists] = useState([]);
    const [loading, setLoading] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [confirmData, setConfirmData] = useState(null);
    const [showConfirm, setShowConfirm] = useState(false);
    const navigate = useNavigate();

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
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to trigger SOS');
        }
    };

    const handleSubmitWithConfirm = (values) => {
        const selected = counselorPsychologists.find(
            (c) => c._id === values.AlertedTo
        );
        setConfirmData({
            ...values,
            AlertedToName: selected?.FullName || 'Unknown',
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

    const filteredCounselors = counselorPsychologists.filter((c) =>
        c.FullName.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <Container
            fluid
            className="py-5"
            style={{
                minHeight: '100vh',
                background: 'linear-gradient(to right, #e3f2fd, #fce4ec)',
                padding: '2rem',
                borderRadius: '20px',
            }}
        >
            <ToastContainer position="top-right" autoClose={3000} />

            <GoHomeButton />

            <h2 className="text-center mb-4">Trigger SOS</h2>

            <Formik
                initialValues={{ AlertedTo: '', Method: '' }}
                validationSchema={sosSchema}
                onSubmit={handleSubmitWithConfirm}
            >
                {({ isSubmitting }) => (
                    <FormikForm className="mb-4">
                        <Form.Group className="mb-3">
                            <Form.Label>Search Counselor/Psychologist</Form.Label>
                            <Form.Control
                                type="text"
                                placeholder="Type name to search"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </Form.Group>

                        <Form.Group className="mb-3">
                            <Form.Label>Select Counselor/Psychologist</Form.Label>
                            <Field name="AlertedTo" as="select" className="form-control">
                                <option value="">-- Select --</option>
                                {filteredCounselors.map((counselorPsychologist) => (
                                    <option key={counselorPsychologist._id} value={counselorPsychologist._id}>
                                        {counselorPsychologist.FullName} ({counselorPsychologist.Specialization})
                                    </option>
                                ))}
                            </Field>
                            <ErrorMessage name="AlertedTo" component="div" className="text-danger" />
                        </Form.Group>

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

            <h4 className="mt-5 text-center">My SOS Logs</h4>

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
                                    ? log.AlertedTo.map((id) => <div key={id}>{id}</div>)
                                    : 'None',
                        },
                    ]}
                    data={sosLogs}
                    actions={[
                        {
                            label: 'Delete',
                            variant: 'danger',
                            onClick: (log) => handleDelete(log._id),
                        },
                    ]}
                    rowKey={(log) => `sos-${log._id}`}
                />
            )}
        </Container>
    );
};

export default SOS;