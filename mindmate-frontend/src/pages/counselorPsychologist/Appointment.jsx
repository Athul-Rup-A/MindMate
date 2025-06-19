import React, { useEffect, useState } from 'react';
import axios from '../../config/axios';
import { toast } from 'react-toastify';
import CustomTable from '../../components/CustomTable';
import { Container, Card, Spinner, Form } from 'react-bootstrap';
import Navbar from '../../components/CounselorPsychologistNavbar'
import Footer from '../../components/Footer'

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

    const columns = [
        { header: '#', accessor: (_, idx) => idx + 1 },
        { header: 'Student', accessor: (item) => item.StudentId?.AliasId || 'N/A' },
        {
            header: 'Day & Date',
            accessor: (item) => formatFullDateWithDay(item.SlotDate),
        },
        { header: 'Start Time', accessor: 'SlotStartTime' },
        { header: 'End Time', accessor: 'SlotEndTime' },
        {
            header: 'Status',
            accessor: (item) => (
                <Form.Select
                    size="sm"
                    value={item.Status || 'pending'}
                    onChange={(e) => handleStatusChange(item._id, e.target.value)}
                    disabled={updatingId === item._id}
                >
                    <option value="pending" disabled>
                        pending
                    </option>
                    {statusOptions.map((s) => (
                        <option key={s} value={s}>
                            {s}
                        </option>
                    ))}
                </Form.Select>
            ),
        },
    ];

    return (
        <>
            <div
                style={{
                    background: 'linear-gradient(to right, #a18cd1, #00e3ae)',
                    minHeight: '100vh',
                }}
            >
                <Navbar />

                <Container style={{
                    maxWidth: '1300px',
                    paddingTop: '40px'
                }}>
                    <Card
                        style={{
                            background: 'linear-gradient(to right, #00e3ae, #a18cd1)',
                        }}
                        className="p-4 shadow-lg rounded-4">
                        <h4 className="fw-bold text-dark text-center mb-4">Your Appointments</h4>

                        {loading ? (
                            <div className="text-center">
                                <Spinner animation="border" />
                            </div>
                        ) : (
                            <CustomTable
                                columns={columns}
                                data={appointments}
                                rowKey={(item) => item._id}
                            />
                        )}
                    </Card>
                </Container>
            </div>

            <Footer />
        </>
    );
};

export default Appointment;