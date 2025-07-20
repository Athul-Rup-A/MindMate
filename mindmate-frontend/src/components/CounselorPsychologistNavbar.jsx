import React, { useState, useEffect } from 'react';
import axios from '../config/axios'
import { Button, Offcanvas, Modal, Form } from 'react-bootstrap';
import { useLocation, useNavigate } from 'react-router-dom';
import ChatBox from '../components/ChatBox';
import socket from '../config/socket';

const CounselorPsychologistNavbar = () => {
    const [firstName, setFirstName] = useState('');
    const navigate = useNavigate();
    const [showLogoutModal, setShowLogoutModal] = useState(false);
    const [showMenu, setShowMenu] = useState(false);
    const location = useLocation();

    const [students, setStudents] = useState([]);
    const [chatWithStudentId, setChatWithStudentId] = useState('');
    const [showChatBox, setShowChatBox] = useState(false);
    const [unreadMessages, setUnreadMessages] = useState(() => {
        const stored = localStorage.getItem('unreadMessages');
        return stored ? JSON.parse(stored) : {};
    });
    const [counselorId, setCounselorId] = useState('');

    useEffect(() => {
        const fetchName = async () => {
            try {
                const res = await axios.get('counselorPsychologist/profile');
                setCounselorId(res.data._id);

                const fullName = res.data?.FullName || '';
                const first = fullName.split(' ')[0];
                const capFirst = (str) => str.charAt(0).toUpperCase() + str.slice(1);
                setFirstName(capFirst(first));

                const studentsRes = await axios.get('counselorPsychologist/my-students');
                setStudents(studentsRes.data);

            } catch (err) {
                console.error('Failed to fetch name');
            }
        };

        fetchName();
    }, []);

    useEffect(() => {
        if (counselorId) {
            socket.emit('join', counselorId);
            console.log("📡 Joined counselor room:", counselorId);
        }
    }, [counselorId]);

    useEffect(() => {
        if (students.length === 0 || !counselorId) return;

        const handleReceive = (msg) => {
            console.log('🔴 Message received from:', msg.from);
            console.log('👥 Known students:', students.map((s) => s._id));

            if (!showChatBox || chatWithStudentId !== msg.from) {
                if (students.some((s) => s._id === msg.from)) {

                    setUnreadMessages(prev => {
                        const updated = {
                            ...prev,
                            [msg.from]: (prev[msg.from] || 0) + 1
                        };
                        localStorage.setItem('unreadMessages', JSON.stringify(updated));
                        return updated;
                    });
                }
            }
        };

        socket.on('receiveMessage', handleReceive);

        return () => {
            socket.off('receiveMessage', handleReceive);
        };
    }, [students, chatWithStudentId, counselorId]);

    useEffect(() => {
        localStorage.setItem('unreadMessages', JSON.stringify(unreadMessages));
    }, [unreadMessages]);

    return (
        <div className="d-flex justify-content-between align-items-center p-3 text-dark shadow-sm flex-wrap"
            style={{
                backgroundColor: 'transparent',
                position: 'sticky',
                top: 0,
                zIndex: 1000,
                borderBottom: '1px solid rgba(255,255,255,0.2)',
            }}>
            <h4 className="m-0">
                {firstName ? (
                    <>
                        {firstName}'s • <span style={{ color: 'white' }}>MindMentor</span>
                    </>
                ) : (
                    <span style={{ color: 'white' }}>MindMentor</span>
                )}
            </h4>

            <div className="d-md-none">
                <Button variant="outline-dark" size="sm"
                    style={{
                        padding: '4px 10px'
                    }}
                    onClick={() => setShowMenu(true)}>
                </Button>
            </div>

            <div className="d-none d-md-flex gap-4 ms-auto">

                <div style={{ position: 'relative', display: 'inline-block' }}>
                    <Form.Select
                        size="sm"
                        className="w-auto"
                        style={{ minWidth: '93px' }}
                        value={chatWithStudentId}
                        onChange={(e) => {
                            const selectedId = e.target.value;

                            if (selectedId) {
                                setChatWithStudentId(selectedId);
                                setShowChatBox(true);

                                setUnreadMessages((prev) => {
                                    const updated = { ...prev, [selectedId]: 0 };
                                    localStorage.setItem('unreadMessages', JSON.stringify(updated));
                                    return updated;
                                });
                            }
                        }}
                    >
                        <option value="">💬 Chat</option>
                        {students.map((s) => (
                            <option key={s._id} value={s._id}>
                                {s.AliasId}
                                {(unreadMessages[s._id] ?? 0) > 0 ? ` (${unreadMessages[s._id]})` : ''}
                            </option>
                        ))}
                    </Form.Select>

                    {/* Red dot */}
                    {students.some(s => (unreadMessages[s._id] ?? 0) > 0) && (
                        <span style={{
                            position: 'absolute',
                            top: '5px',
                            right: '5px',
                            height: '8px',
                            width: '8px',
                            backgroundColor: 'red',
                            borderRadius: '50%',
                            display: 'inline-block'
                        }} />
                    )}

                </div>
                <Button variant="link" size="sm"
                    className='text-decoration-none text-dark'
                    style={location.pathname === '/counselorpsychologist/appointments' ? { borderBottom: '2px solid black' } : {}}
                    onClick={() => navigate('/counselorpsychologist/appointments')}>Home</Button>
                <Button variant="link" size="sm"
                    className='text-decoration-none text-dark'
                    style={location.pathname === '/counselorpsychologist/profile' ? { borderBottom: '2px solid black' } : {}}
                    onClick={() => navigate('/counselorpsychologist/profile')}>Profile</Button>
                <Button variant="link" size="sm"
                    className='text-decoration-none text-dark'
                    style={location.pathname === '/counselorpsychologist/availability' ? { borderBottom: '2px solid black' } : {}}
                    onClick={() => navigate('/counselorpsychologist/availability')}>Availability</Button>
                <Button variant="dark" size="sm" onClick={() => setShowMenu(true)}>Menu</Button>
            </div>

            <Offcanvas show={showMenu} onHide={() => setShowMenu(false)} placement="end">
                <Offcanvas.Header closeButton>
                    <Offcanvas.Title className="fs-4">
                        {firstName ? `${firstName}'s • Desk` : "Mentor's • Desk"}
                    </Offcanvas.Title>
                </Offcanvas.Header>
                <Offcanvas.Body className="d-flex flex-column gap-2">
                    <Button className="d-md-none"
                        variant={location.pathname === '/counselorpsychologist/appointments' ? 'light' : 'outline-dark'}
                        onClick={() => {
                            navigate('/counselorpsychologist/appointments');
                            setShowMenu(false);
                        }}>Home</Button>
                    <Button className="d-md-none"
                        variant={location.pathname === '/counselorpsychologist/profile' ? 'light' : 'outline-dark'}
                        onClick={() => {
                            navigate('/counselorpsychologist/profile');
                            setShowMenu(false);
                        }}>Profile</Button>
                    <Button className="d-md-none"
                        variant={location.pathname === '/counselorpsychologist/approval' ? 'light' : 'outline-dark'}
                        onClick={() => {
                            navigate('/counselorpsychologist/availability');
                            setShowMenu(false);
                        }}>Availability</Button>

                    <Button variant={location.pathname === '/counselorpsychologist/resource' ? 'light' : 'outline-dark'}
                        onClick={() => {
                            navigate('/counselorpsychologist/resource');
                            setShowMenu(false);
                        }}>Manage Resources</Button>
                    <Button variant={location.pathname === '/counselorpsychologist/wellness' ? 'light' : 'outline-dark'}
                        onClick={() => {
                            navigate('/counselorpsychologist/wellness');
                            setShowMenu(false);
                        }}>Wellness View</Button>
                    <Button variant={location.pathname === '/counselorpsychologist/feedback' ? 'light' : 'outline-dark'}
                        onClick={() => {
                            navigate('/counselorpsychologist/feedback');
                            setShowMenu(false);
                        }}>Feedbacks</Button>
                    <Button variant={location.pathname === '/counselorpsychologist/sos' ? 'light' : 'outline-dark'}
                        onClick={() => {
                            navigate('/counselorpsychologist/sos');
                            setShowMenu(false);
                        }}>SOS Logs</Button>
                    <Button variant="danger" onClick={() => setShowLogoutModal(true)}>Logout</Button>
                </Offcanvas.Body>

                <div className="mt-auto text-center small pt-2 pb-2 border-top">
                    Empathy ✦ Support ✦ Guidance
                </div>

            </Offcanvas>

            <Modal show={showLogoutModal} onHide={() => setShowLogoutModal(false)} centered>
                <Modal.Header className="justify-content-center border-0">
                    <Modal.Title className="text-center w-100">Are you sure you want to log out?</Modal.Title>
                </Modal.Header>
                <Modal.Footer className="d-flex flex-column gap-2">
                    <Button className="w-50" variant="danger" onClick={() => {
                        localStorage.removeItem('token');
                        navigate('/', { replace: true });
                        window.history.pushState(null, '', window.location.href);
                        window.onpopstate = () => {
                            window.history.pushState(null, '', window.location.href);
                        };
                    }}>Logout</Button>
                    <Button className="w-50" variant="secondary" onClick={() => setShowLogoutModal(false)}>
                        Cancel
                    </Button>
                </Modal.Footer>
            </Modal>

            {showChatBox && chatWithStudentId && (
                <div style={{
                    position: 'fixed',
                    bottom: '20px',
                    right: '20px',
                    zIndex: 9999,
                    maxWidth: '300px'
                }}>
                    <ChatBox
                        myId={counselorId}
                        targetId={chatWithStudentId}
                        onClose={() => {
                            setShowChatBox(false);
                            setChatWithStudentId('');
                        }}
                    />
                </div>
            )}

        </div>
    );
};

export default CounselorPsychologistNavbar;