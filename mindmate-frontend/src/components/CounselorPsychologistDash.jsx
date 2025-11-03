import React, { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import { Card, Button, Container, Row, Col, Overlay, Popover } from 'react-bootstrap';
import { StarFill, CalendarCheckFill } from 'react-bootstrap-icons';
import { useNavigate } from 'react-router-dom';
import { toast, ToastContainer } from 'react-toastify';
import authHeader from '../config/authHeader';
import 'react-toastify/dist/ReactToastify.css';

const CounselorPsychologistDash = () => {
    const [counselorPsychologists, setCounselorPsychologists] = useState([]);
    const [ratings, setRatings] = useState({});
    const navigate = useNavigate();

    const [showPopover, setShowPopover] = useState(false);
    const [target, setTarget] = useState(null);
    const [selectedAvailability, setSelectedAvailability] = useState([]);
    const [selectedName, setSelectedName] = useState('');
    const popoverRef = useRef(null);

    const BASE_URL = `${import.meta.env.VITE_API_URL}students`;

    useEffect(() => {
        const fetchCounselorPsychologists = async () => {
            try {
                const token = localStorage.getItem('token');

                if (!token) {
                    toast.error('Authentication token not found. Please log in again.');
                    navigate('/student/login');
                    return;
                }

                const res = await axios.get(`${BASE_URL}/counselorPsychologist`, authHeader());
                setCounselorPsychologists(res.data);
            } catch (err) {
                toast.error('Failed to fetch counselor/psychologists');
            }
        };

        fetchCounselorPsychologists();
        fetchRatings();
    }, []);

    const handleTogglePopover = (event, availability, name) => {
        setTarget(event.target);
        setSelectedAvailability(availability || []);
        setSelectedName(name);
        setShowPopover(!showPopover);
    };

    const fetchRatings = async () => {
        try {
            const res = await axios.get(`${BASE_URL}/feedbacks/ratings`, authHeader());
            // Convert to a map for easier access by ID
            const ratingsMap = {};
            res.data.forEach(r => {
                ratingsMap[r.counPsychId] = {
                    averageRating: r.averageRating,
                    count: r.count
                };
            });
            setRatings(ratingsMap);
        } catch (err) {
            toast.error('Failed to fetch ratings');
        }
    };

    const formatSlotsSeparated = (slots = []) => {
        return slots.map(({ Day, StartTime, EndTime }, index) => (
            <div key={index} className="mb-1">
                <strong>Day:</strong> {Day}<br />
                <strong>Available Time:</strong> {StartTime} to {EndTime}
            </div>
        ));
    };

    return (
        <Container className="py-4">
            <Row className="g-4">
                {counselorPsychologists.length > 0 ? (
                    counselorPsychologists.map((counselorPsychologist) => (
                        <Col
                            key={counselorPsychologist._id}
                            xs={12} sm={6} md={4}
                            className="d-flex justify-content-center"
                        >
                            <Card
                                className="shadow-sm rounded-4 p-3 me-5 d-flex flex-column"
                                style={{
                                    width: '350px',
                                    minHeight: '430px',
                                }}
                            >
                                <Card.Img
                                    variant="top"
                                    src={
                                        counselorPsychologist.ProfileImage
                                            ? counselorPsychologist.ProfileImage
                                            : `https://api.dicebear.com/7.x/initials/svg?seed=${counselorPsychologist.FullName}`
                                    }
                                    style={{ height: '230px', objectFit: 'contain', borderRadius: '8px' }}
                                />
                                <Card.Body className="d-flex flex-column flex-grow-1">
                                    <Card.Title className="fw-bold">{counselorPsychologist.FullName}</Card.Title>
                                    <Card.Subtitle className="mb-2 mt-0 text-muted">Specialization: {counselorPsychologist.Specialization}</Card.Subtitle>

                                    <p className="mb-1"><strong>Role:</strong> {counselorPsychologist.Role}</p>
                                    <p className="mb-1"><strong>Credentials:</strong> {counselorPsychologist.Credentials || 'N/A'}</p>
                                    <Button
                                        ref={popoverRef}
                                        variant="outline-secondary"
                                        size="sm"
                                        className='mt-2'
                                        onClick={(e) =>
                                            handleTogglePopover(
                                                e,
                                                counselorPsychologist.AvailabilitySlots,
                                                counselorPsychologist.FullName
                                            )
                                        }
                                    >
                                        View Availability
                                    </Button>

                                    <div className="d-flex align-items-center mt-auto">
                                        <StarFill className="text-warning me-1" />
                                        <span>
                                            {ratings[counselorPsychologist._id]?.averageRating?.toFixed(1) || 'N/A'}
                                            {' '}
                                            ({ratings[counselorPsychologist._id]?.count || 0})
                                        </span>
                                    </div>

                                    <Button
                                        variant="primary"
                                        className="mt-3"
                                        onClick={() =>
                                            navigate(`/student/appointments/${counselorPsychologist._id}`, {
                                                state: {
                                                    name: counselorPsychologist.FullName,
                                                    availability: Array.isArray(counselorPsychologist.AvailabilitySlots)
                                                        ? counselorPsychologist.AvailabilitySlots
                                                        : [],
                                                },
                                            })
                                        }
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

            <Overlay
                show={showPopover}
                target={target}
                placement="bottom"
                containerPadding={10}
                rootClose
                onHide={() => setShowPopover(false)}
            >
                <Popover id="availability-popover">
                    <Popover.Body>
                        {selectedAvailability.length > 0 ? (
                            selectedAvailability.map(({ Day, StartTime, EndTime }, idx) => (
                                <div
                                    key={idx}
                                    className="mb-1"
                                    style={{ fontSize: '0.9rem', whiteSpace: 'nowrap' }}
                                >
                                    <strong style={{ minWidth: '80px', display: 'inline-block' }}>
                                        {Day} :
                                    </strong>
                                    {StartTime} – {EndTime}
                                </div>
                            ))
                        ) : (
                            <p>No availability info.</p>
                        )}
                    </Popover.Body>
                </Popover>
            </Overlay>

            <ToastContainer position="top-right" autoClose={3000} />
        </Container>
    );
};

export default CounselorPsychologistDash;