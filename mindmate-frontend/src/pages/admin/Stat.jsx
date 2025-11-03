import React, { useEffect, useState } from 'react';
import axios from '../../config/axios';
import { toast } from 'react-toastify';
import { Container, Row, Col, Card, Spinner, Modal, Button, Form } from 'react-bootstrap';
import { PeopleFill, PersonWorkspace, PersonBadgeFill, ExclamationTriangleFill, ChatDotsFill, CalendarFill, } from 'react-bootstrap-icons';

const Stat = () => {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [modalShow, setModalShow] = useState(false);
    const [modalData, setModalData] = useState([]);
    const [modalTitle, setModalTitle] = useState('');

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const res = await axios.get('/admin/stats');
                setStats(res.data);
            } catch (err) {
                toast.error(err.response?.data?.message || 'Failed to fetch stats');
            } finally {
                setLoading(false);
            }
        };

        fetchStats();
    }, []);

    const handleCardClick = async (type) => {
        let endpoint = '';
        let title = '';
        switch (type) {
            case 'admins':
                endpoint = '/admin/users';
                title = 'Admins';
                break;
            case 'counselors':
                endpoint = '/admin/counselorPsychologist';
                title = 'Counselors & Psychologists';
                break;
            case 'students':
                endpoint = '/admin/students';
                title = 'Students';
                break;
            case 'reports':
                endpoint = '/admin/reports';
                title = 'Reports';
                break;
            case 'vents':
                endpoint = '/admin/vents';
                title = 'Vents';
                break;
            case 'appointments':
                endpoint = '/admin/appointments';
                title = 'Appointments';
                break;
            default:
                return;
        }

        try {
            const res = await axios.get(endpoint);
            setModalData(res.data);
            setModalTitle(title);
            setModalShow(true);
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to fetch details');
        }
    };

    const cardData = [
        {
            title: 'Total Admins',
            value: stats?.totalAdmins,
            icon: <PersonBadgeFill size={28} className="text-primary" />,
            type: 'admins',
        },
        {
            title: 'Counselors / Psychologists',
            value: stats?.totalCouncPsych,
            icon: <PersonWorkspace size={28} className="text-success" />,
            type: 'counselors',
        },
        {
            title: 'Total Students',
            value: stats?.totalStudents,
            icon: <PeopleFill size={28} className="text-info" />,
            type: 'students',
        },
        {
            title: 'Total Vents',
            value: stats?.totalVents,
            icon: <ChatDotsFill size={28} className="text-warning" />,
            type: 'vents',
        },
        {
            title: 'Total Appointments',
            value: stats?.totalAppointments,
            icon: <CalendarFill size={28} className="text-warning" />,
            type: 'appointments',
        },
        {
            title: 'Total Reports',
            value: stats?.totalReports,
            icon: <ExclamationTriangleFill size={28} className="text-danger" />,
            type: 'reports',
        },
    ];

    const handleStatusChange = async (id, status, role) => {
        try {
            const url =
                role === 'student'
                    ? `admin/student/${id}/status`
                    : `admin/counselorPsychologist/${id}/status`;

            await axios.put(
                url,
                { status },
            );

            toast.success(`${role} status updated to ${status}`);

            setModalData((prevData) =>
                prevData.map((item) =>
                    item._id === id ? { ...item, Status: status } : item
                )
            );
        } catch (err) {
            toast.error('Failed to update status');
        }
    };

    return (
        <Container>
            <h2 className="text-center fw-bold text-dark mb-4">Platform Statistics</h2>
            {loading ? (
                <div className="d-flex justify-content-center align-items-center" style={{ height: '300px' }}>
                    <Spinner animation="border" variant="primary" />
                </div>
            ) : (
                <Row className="g-4 justify-content-center">
                    {cardData.map((card, idx) => (
                        <Col key={idx} xs={12} sm={6} md={4}>
                            <Card
                                className="shadow rounded-4 text-center card-hover"
                                style={{ cursor: 'pointer', minHeight: '250px', background: 'transparent' }}
                                onClick={() => handleCardClick(card.type)}
                            >
                                <Card.Body className="d-flex flex-column align-items-center justify-content-center">
                                    <div className="mb-2">{card.icon}</div>
                                    <Card.Title className="fs-5 fw-semibold">{card.title}</Card.Title>
                                    <Card.Text className="fs-4 fw-bold text-dark">{card.value}</Card.Text>
                                </Card.Body>
                            </Card>
                        </Col>
                    ))}
                </Row>
            )}

            <Modal
                show={modalShow}
                onHide={() => setModalShow(false)}
                size="lg"
                centered
            >
                <Modal.Header closeButton>
                    <Modal.Title>{modalTitle}</Modal.Title>
                </Modal.Header>
                <Modal.Body style={{ maxHeight: '60vh', overflowY: 'auto' }}>
                    {modalData.length === 0 ? (
                        <p className="text-muted">No data available.</p>
                    ) : (
                        <>
                            {modalTitle === 'Admins' && (
                                <Row>
                                    {modalData.map((admin) => (
                                        <Col md={6} key={admin._id} className="mb-3">
                                            <Card className="shadow-sm border-0 h-100">
                                                <Card.Body>
                                                    <Card.Title className="text-primary">{admin.Username}</Card.Title>
                                                    <div><strong>Role:</strong> {admin.Role}</div>
                                                    <div><strong>Email:</strong> {admin.Email}</div>
                                                    <div><strong>Phone:</strong> {admin.Phone}</div>
                                                    <div><strong>Created At:</strong> {new Date(admin.createdAt).toLocaleString()}</div>
                                                </Card.Body>
                                            </Card>
                                        </Col>
                                    ))}
                                </Row>
                            )}

                            {modalTitle === 'Counselors & Psychologists' && (
                                <Row>
                                    {modalData.map((counpsycho) => (
                                        <Col md={6} key={counpsycho._id} className="mb-3">
                                            <Card className="shadow-sm border-0 h-100">
                                                <Card.Body>
                                                    <Card.Title className="text-primary">{counpsycho.FullName}</Card.Title>
                                                    <Card.Subtitle className="mb-1 text-muted text-capitalize">{counpsycho.Role}</Card.Subtitle>
                                                    <div><strong>Username:</strong> {counpsycho.Username}</div>
                                                    <div><strong>Email:</strong> {counpsycho.Email}</div>
                                                    <div><strong>Phone:</strong> {counpsycho.Phone}</div>
                                                    <div><strong>Specialization:</strong> {counpsycho.Specialization}</div>
                                                    <div><strong>Credentials:</strong> {counpsycho.Credentials}</div>
                                                    <div>
                                                        <strong>Availability:</strong>
                                                        <ul className="mb-0">
                                                            {counpsycho.AvailabilitySlots.map((slot, idx) => (
                                                                <li key={idx}>{slot.Day} – {slot.StartTime} to {slot.EndTime}</li>
                                                            ))}
                                                        </ul>
                                                    </div>
                                                    <div><strong>Created At:</strong> {new Date(counpsycho.createdAt).toLocaleDateString()}</div>
                                                    <div className="mb-2">
                                                        <strong>Status:</strong>{' '}
                                                        <Form.Select
                                                            value={counpsycho.Status}
                                                            onChange={(e) =>
                                                                handleStatusChange(counpsycho._id, e.target.value, 'counselor')
                                                            }
                                                            className="mt-1"
                                                        >
                                                            <option value="active">Active</option>
                                                            <option value="inactive">Inactive</option>
                                                            <option value="blocked">Blocked</option>
                                                        </Form.Select>
                                                    </div>
                                                </Card.Body>
                                            </Card>
                                        </Col>
                                    ))}
                                </Row>
                            )}

                            {modalTitle === 'Students' && (
                                <Row>
                                    {modalData.map((student) => (
                                        <Col md={6} key={student._id} className="mb-3">
                                            <Card className="shadow-sm border-0 h-100">
                                                <Card.Body>
                                                    <Card.Title className="text-primary">{student.Username}</Card.Title>
                                                    <div><strong>Email:</strong> {student.Email || 'N/A'}</div>
                                                    <div><strong>Phone:</strong> {student.Phone || 'N/A'}</div>
                                                    <div><strong>Created At:</strong> {new Date(student.createdAt).toLocaleDateString()}</div>
                                                    <div className="mt-2">
                                                        <strong>Status:</strong>{' '}
                                                        <Form.Select
                                                            value={student.Status}
                                                            onChange={(e) =>
                                                                handleStatusChange(student._id, e.target.value, 'student')
                                                            }
                                                            className="mt-1"
                                                        >
                                                            <option value="active">Active</option>
                                                            <option value="inactive">Inactive</option>
                                                            <option value="blocked">Blocked</option>
                                                        </Form.Select>
                                                    </div>
                                                </Card.Body>
                                            </Card>
                                        </Col>
                                    ))}
                                </Row>
                            )}

                            {modalTitle === 'Reports' && (
                                <Row>
                                    {modalData.map((report) => (
                                        <Col md={6} key={report._id} className="mb-3">
                                            <Card className="shadow-sm border-0 h-100">
                                                <Card.Body>
                                                    <Card.Title className="text-danger">Report ID: {report._id.slice(-6)}</Card.Title>
                                                    <div><strong>Reason:</strong> {report.Reason}</div>
                                                    <div><strong>Status:</strong>{' '}
                                                        <span className={`badge ${report.Status === 'resolved' ? 'bg-success' : 'bg-warning'}`}>
                                                            {report.Status}
                                                        </span>
                                                    </div>
                                                    <div><strong>Reporter:</strong> {report.ReporterId?.Username || 'Unknown'}</div>
                                                    <div><strong>Target Name:</strong> {report.TargetId?.FullName || report.TargetId?.Username || 'Unknown'}</div>
                                                    <div><strong>Date:</strong> {new Date(report.createdAt).toLocaleString()}</div>
                                                </Card.Body>
                                            </Card>
                                        </Col>
                                    ))}
                                </Row>
                            )}

                            {modalTitle === 'Vents' && (
                                <Row>
                                    {modalData.map((vent) => (
                                        <Col md={6} key={vent._id} className="mb-3">
                                            <Card className="shadow-sm border-0 h-100">
                                                <Card.Body>
                                                    <Card.Title className="text-info">{vent.Topic || 'Untitled Topic'}</Card.Title>
                                                    <div><strong>Content:</strong> {vent.Content}</div>
                                                    <div><strong>Likes:</strong> {vent.Likes?.length || 0}</div>
                                                    {vent.Likes?.length > 0 && (
                                                        <div>
                                                            <strong>Liked By:</strong>{' '}
                                                            {vent.Likes.map((s) => s?.Username || 'Unknown').join(', ')}
                                                        </div>
                                                    )}
                                                    <div><strong>Reports:</strong> {vent.Reports?.length || 0}</div>
                                                    {vent.Reports?.length > 0 && (
                                                        <div>
                                                            <strong>Reported By:</strong>{' '}
                                                            {vent.Reports.map((s) => s?.Username || 'Unknown').join(', ')}
                                                        </div>
                                                    )}
                                                    <div><strong>Posted By:</strong> {vent.StudentId?.Username || 'Anonymous'}</div>
                                                    <div><strong>Date:</strong> {new Date(vent.createdAt).toLocaleString()}</div>
                                                </Card.Body>
                                            </Card>
                                        </Col>
                                    ))}
                                </Row>
                            )}

                            {modalTitle === 'Appointments' && (
                                <Row>
                                    {modalData.map((appointments) => (
                                        <Col md={6} key={appointments._id} className="mb-3">
                                            <Card className="shadow-sm border-0 h-100">
                                                <Card.Body>
                                                    <Card.Title className="text-danger">Appointment ID: {appointments._id.slice(-6)}</Card.Title>
                                                    <div><strong>Date:</strong> {new Date(appointments.SlotDate).toLocaleDateString()}</div>
                                                    <div><strong>Time:</strong> {appointments.SlotStartTime} - {appointments.SlotEndTime}</div>
                                                    <div><strong>Status:</strong>
                                                        <span className={`ms-2 fw-bold text-${appointments.Status === 'confirmed' ? 'success' :
                                                            appointments.Status === 'pending' ? 'warning' :
                                                                appointments.Status === 'completed' ? 'primary' :
                                                                    'danger'
                                                            }`}>
                                                            {appointments.Status.toUpperCase()}
                                                        </span>
                                                    </div>

                                                    <div><strong>Status reason:</strong>
                                                        {' '}{appointments.StatusReason || 'N/A'}</div>

                                                    <hr />

                                                    <div><strong>Student:</strong>
                                                        {' '}{appointments.StudentId?.Username || 'N/A'}</div>

                                                    <div><strong>Counselor/Psychologist:</strong>
                                                        {' '}{appointments.CounselorPsychologistId?.FullName || 'Unknown'}</div>

                                                    <div><strong>Specialization:</strong>
                                                        {' '}{appointments.CounselorPsychologistId?.Specialization || 'Not specified'}</div>

                                                    <div><strong>Role:</strong>
                                                        {' '}{appointments.CounselorPsychologistId?.Role || 'N/A'}</div>

                                                    <div><strong>Booked on:</strong>
                                                        {' '}{appointments.createdAt ? new Date(appointments.createdAt).toLocaleString() : 'N/A'}</div>

                                                    {appointments.StatusReason && (
                                                        <div><strong>Status Reason:</strong> {appointments.StatusReason}</div>
                                                    )}
                                                </Card.Body>
                                            </Card>
                                        </Col>
                                    ))}
                                </Row>
                            )}
                        </>
                    )}
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setModalShow(false)}>
                        Close
                    </Button>
                </Modal.Footer>
            </Modal>

        </Container>
    );
};

export default Stat;