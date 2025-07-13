import React, { useEffect, useState } from 'react';
import axios from '../../config/axios';
import { toast } from 'react-toastify';
import { Container, Card, Spinner, Form } from 'react-bootstrap';

const statusOptions = ['confirmed', 'rejected', 'completed'];

const Appointment = () => {
    const [appointments, setAppointments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [updatingId, setUpdatingId] = useState(null);

    const formatFullDateWithDay = (dateStr) => {
        const date = new Date(dateStr);
        return date.toLocaleDateString('en-GB', {
            weekday: 'long',
            day: '2-digit',
            month: 'long',
            year: 'numeric',
        });
    };

    const fetchAppointments = async () => {
        try {
            const res = await axios.get('counselorPsychologist/appointments');
            setAppointments(res.data);
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to fetch appointments');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAppointments();
    }, []);

    const handleStatusChange = async (appointmentId, newStatus) => {
        try {
            setUpdatingId(appointmentId);
            await axios.put(`counselorPsychologist/appointments/${appointmentId}/status`, { status: newStatus });
            toast.success('Appointment status updated');
            fetchAppointments();
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to update status');
        } finally {
            setUpdatingId(null);
        }
    };

    return (
        <Container>
            <Card
                style={{
                    background: 'transparent',
                    backdropFilter: 'blur(10px)',
                    border: '1px solid rgba(255, 255, 255, 0.2)'
                }}
                className="p-4 shadow-lg rounded-4">
                <h4 className="fw-bold text-dark text-center mb-4">Your Appointments</h4>

                {loading ? (
                    <div className="text-center">
                        <Spinner animation="border" />
                    </div>
                ) : (
                    <div className="row row-cols-1 row-cols-md-2 g-4">
                        {appointments.map((item, idx) => (
                            <div className="col" key={item._id}>
                                <Card className="p-3 shadow-sm border-0" style={{ backgroundColor: 'rgba(255,255,255,0.5)' }}>
                                    <Card.Body>
                                        <Card.Title className="fw-bold text-primary">
                                            Appointment #{idx + 1}
                                        </Card.Title>
                                        <p><strong>Student:</strong> {item.StudentId?.AliasId || 'N/A'}</p>
                                        <p><strong>Day & Date:</strong> {formatFullDateWithDay(item.SlotDate)}</p>
                                        <p><strong>Start Time:</strong> {item.SlotStartTime}</p>
                                        <p><strong>End Time:</strong> {item.SlotEndTime}</p>
                                        <Form.Group>
                                            <Form.Label className="fw-semibold">Status</Form.Label>
                                            <Form.Select
                                                size="sm"
                                                value={item.Status || 'pending'}
                                                onChange={(e) => handleStatusChange(item._id, e.target.value)}
                                                disabled={updatingId === item._id}
                                            >
                                                <option value="pending" disabled>pending</option>
                                                {statusOptions.map((s) => (
                                                    <option key={s} value={s}>{s}</option>
                                                ))}
                                            </Form.Select>
                                        </Form.Group>
                                    </Card.Body>
                                </Card>
                            </div>
                        ))}
                    </div>
                )}
            </Card>
        </Container>
    );
};

export default Appointment;