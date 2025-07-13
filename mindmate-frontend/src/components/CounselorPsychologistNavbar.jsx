import React, { useState, useEffect } from 'react';
import axios from '../config/axios'
import { Button, Offcanvas, Modal } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';

const CounselorPsychologistNavbar = () => {
    const [firstName, setFirstName] = useState('');
    const navigate = useNavigate();
    const [showLogoutModal, setShowLogoutModal] = useState(false);
    const [showMenu, setShowMenu] = useState(false);

    useEffect(() => {
        const fetchName = async () => {
            try {
                const res = await axios.get('counselorPsychologist/profile');
                const fullName = res.data?.FullName || '';
                const first = fullName.split(' ')[0];
                const capFirst = (str) => str.charAt(0).toUpperCase() + str.slice(1);
                setFirstName(capFirst(first));

            } catch (err) {
                console.error('Failed to fetch name');
            }
        };

        fetchName();
    }, []);

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

            <div className="d-none d-md-flex gap-3 ms-auto">
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

        </div>
    );
};

export default CounselorPsychologistNavbar;