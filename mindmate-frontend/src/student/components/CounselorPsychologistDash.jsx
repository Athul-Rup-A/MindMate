import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Card, Button, Container, Row, Col } from 'react-bootstrap';
import { StarFill, CalendarCheckFill } from 'react-bootstrap-icons';
import { useNavigate } from 'react-router-dom';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const CounselorPsychologistDash = () => {
    const [counselorPsychologists, setCounselorPsychologists] = useState([]);
    const navigate = useNavigate();

    const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/students';

    useEffect(() => {
        const fetchCounselorPsychologists = async () => {
            try {
                const token = localStorage.getItem('token');

                if (!token) {
                    toast.error('Authentication token not found. Please log in again.');
                    navigate('/login');
                    return;
                }

                const res = await axios.get(`${BASE_URL}/counselorPsychologist`, {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                });
                setCounselorPsychologists(res.data);
            } catch (err) {
                toast.error('Failed to fetch counselor/psychologists');
            }
        };

        fetchCounselorPsychologists();
    }, []);

    const formatSlots = (slots = []) => {
        return slots.map((slot, i) => `${slot.StartTime} to ${slot.EndTime}`).join(', ');
    };

    return (
        <Container className="py-5">
            <h2 className="mb-4 text-center">Available Counselors & Psychologists</h2>
            <Row className="g-4">
                {counselorPsychologists.length > 0 ? (
                    counselorPsychologists.map((counselorPsychologist) => (
                        <Col
                            key={counselorPsychologist._id}
                            xs={12} sm={6} md={4}
                            className="d-flex justify-content-center"
                        >
                            <Card
                                className="shadow-sm rounded-4 p-3 d-flex flex-column"
                                style={{
                                    width: '320px',
                                    minHeight: '430px',
                                }}
                            >
                                <Card.Img
                                    variant="top"
                                    src={`https://api.dicebear.com/7.x/initials/svg?seed=${counselorPsychologist.FullName}`}
                                    style={{ height: '120px', objectFit: 'cover', borderRadius: '8px' }}
                                />
                                <Card.Body className="d-flex flex-column flex-grow-1">
                                    <Card.Title className="fw-bold">{counselorPsychologist.FullName}</Card.Title>
                                    <Card.Subtitle className="mb-2 text-muted">Alias ID: {counselorPsychologist.AliasId}</Card.Subtitle>

                                    <p className="mb-1"><strong>Role:</strong> {counselorPsychologist.Role}</p>
                                    <p className="mb-1"><strong>Specialization:</strong> {counselorPsychologist.Specialization}</p>
                                    <p className="mb-1"><strong>Credentials:</strong> {counselorPsychologist.Credentials || 'N/A'}</p>
                                    <p className="mb-1"><strong>Available Time:</strong> {formatSlots(counselorPsychologist.AvailabilitySlots)}</p>

                                    <div className="d-flex align-items-center mt-auto">
                                        <StarFill className="text-warning me-1" />
                                        <span>4.8</span>
                                    </div>

                                    <Button
                                        variant="primary"
                                        className="mt-3"
                                        onClick={() => navigate(`/appointments/${counselorPsychologist._id}`)}
                                    >
                                        <CalendarCheckFill className="me-2" /> Book Appointment
                                    </Button>
                                </Card.Body>
                            </Card>
                        </Col>
                    ))
                ) : (
                    <p className="text-center">No counselor/psychologist available at the moment.</p>
                )}
            </Row>
            <ToastContainer position="top-right" autoClose={3000} />
        </Container>
    );
};

export default CounselorPsychologistDash;