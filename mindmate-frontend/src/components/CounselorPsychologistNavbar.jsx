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
        <div className="d-flex justify-content-between align-items-center p-3 text-dark shadow-sm">
            <h4 className="m-0">MindMate</h4>

            <div className="d-flex gap-3">
                <Button variant="outline-dark" size="sm" onClick={() => navigate('/profile/counselorpsychologist')}>Profile</Button>
                <Button variant="outline-dark" size="sm" onClick={() => navigate('/availability/counselorpsychologist')}>Availability</Button>
                <Button variant="dark" size="sm" onClick={() => setShowMenu(true)}>Menu</Button>
            </div>

            <Offcanvas show={showMenu} onHide={() => setShowMenu(false)} placement="end">
                <Offcanvas.Header closeButton>
                    <Offcanvas.Title className="fs-4">
                        {firstName ? `${firstName}'s • MindMentor` : 'MindMentor'}
                    </Offcanvas.Title>
                </Offcanvas.Header>
                <Offcanvas.Body className="d-flex flex-column gap-2">
                    <Button variant="outline-dark" onClick={() => navigate('/resource/counselorpsychologist')}>Manage Resources</Button>
                    <Button variant="outline-dark" onClick={() => navigate('/wellness/counselorpsychologist')}>Wellness View</Button>
                    <Button variant="outline-dark" onClick={() => navigate('/feedback/counselorpsychologist')}>Feedbacks</Button>
                    <Button variant="outline-dark" onClick={() => navigate('/sos/counselorpsychologist')}>SOS Logs</Button>
                    <Button variant="danger" onClick={() => setShowLogoutModal(true)}>Logout</Button>
                </Offcanvas.Body>
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