import React, { useEffect, useState } from 'react';
import axios from '../../config/axios';
import { toast } from 'react-toastify';
import { Container, Row, Col, Card, Spinner, Modal, Button, } from 'react-bootstrap';
import { PeopleFill, PersonWorkspace, PersonBadgeFill, ExclamationTriangleFill, ChatDotsFill, } from 'react-bootstrap-icons';

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
            case 'sos':
                endpoint = '/admin/sos';
                title = 'SOS Logs';
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
            title: 'Total Reports',
            value: stats?.totalReports,
            icon: <ExclamationTriangleFill size={28} className="text-danger" />,
            type: 'reports',
        },
        {
            title: 'Total Vents',
            value: stats?.totalVents,
            icon: <ChatDotsFill size={28} className="text-warning" />,
            type: 'vents',
        },
        {
            title: 'Total SOS',
            value: stats?.totalSOS,
            icon: <ExclamationTriangleFill size={28} className="text-warning" />,
            type: 'sos',
        },
    ];

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
                                                    <Card.Title className="text-primary">{admin.AliasId}</Card.Title>
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
                                                    <div><strong>Alias ID:</strong> {counpsycho.AliasId}</div>
                                                    <div><strong>Email:</strong> {counpsycho.Email}</div>
                                                    <div><strong>Phone:</strong> {counpsycho.Phone}</div>
                                                    <div><strong>Specialization:</strong> {counpsycho.Specialization}</div>
                                                    <div><strong>Credentials:</strong> {counpsycho.Credentials}</div>
                                                    <div><strong>Status:</strong>{' '}
                                                        <span className={`badge ${counpsycho.Status === 'active' ? 'bg-success' : 'bg-secondary'}`}>
                                                            {counpsycho.Status}
                                                        </span>
                                                    </div>
                                                    <div>
                                                        <strong>Availability:</strong>
                                                        <ul className="mb-0">
                                                            {counpsycho.AvailabilitySlots.map((slot, idx) => (
                                                                <li key={idx}>{slot.Day} – {slot.StartTime} to {slot.EndTime}</li>
                                                            ))}
                                                        </ul>
                                                    </div>
                                                    <div><strong>Created At:</strong> {new Date(counpsycho.createdAt).toLocaleDateString()}</div>
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
                                                    <Card.Title className="text-primary">{student.AliasId}</Card.Title>
                                                    <div><strong>Email:</strong> {student.Email || 'N/A'}</div>
                                                    <div><strong>Phone:</strong> {student.Phone || 'N/A'}</div>
                                                    <div><strong>Created At:</strong> {new Date(student.createdAt).toLocaleDateString()}</div>
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
                                                    <div><strong>Reporter:</strong> {report.ReporterId?.AliasId || 'Unknown'}</div>
                                                    <div><strong>Target Name:</strong> {report.TargetId?.FullName || report.TargetId?.AliasId || 'Unknown'}</div>
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
                                                            {vent.Likes.map((s) => s?.AliasId || 'Unknown').join(', ')}
                                                        </div>
                                                    )}
                                                    <div><strong>Reports:</strong> {vent.Reports?.length || 0}</div>
                                                    {vent.Reports?.length > 0 && (
                                                        <div>
                                                            <strong>Reported By:</strong>{' '}
                                                            {vent.Reports.map((s) => s?.AliasId || 'Unknown').join(', ')}
                                                        </div>
                                                    )}
                                                    <div><strong>Posted By:</strong> {vent.StudentId?.AliasId || 'Anonymous'}</div>
                                                    <div><strong>Date:</strong> {new Date(vent.createdAt).toLocaleString()}</div>
                                                </Card.Body>
                                            </Card>
                                        </Col>
                                    ))}
                                </Row>
                            )}

                            {modalTitle === 'SOS Logs' && (
                                <Row>
                                    {modalData.map((sos) => (
                                        <Col md={6} key={sos._id} className="mb-3">
                                            <Card className="shadow-sm border-0 h-100">
                                                <Card.Body>
                                                    <Card.Title className="text-danger">SOS ID: {sos._id.slice(-6)}</Card.Title>
                                                    <div><strong>Triggered At:</strong> {new Date(sos.TriggeredAt).toLocaleString()}</div>
                                                    <div><strong>Triggered By:</strong> {sos.StudentId?.AliasId || 'Unknown'}</div>
                                                    <div><strong>Method:</strong> {sos.Method}</div>
                                                    <div><strong>Alerted To:</strong> {sos.AlertedTo?.map((user) => user?.FullName || 'Unknown').join(', ')}</div>
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