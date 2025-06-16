import React, { useState } from 'react';
import { Button, Offcanvas, Modal } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';

const StudentNavbar = () => {
    const navigate = useNavigate();
    const [showLogoutModal, setShowLogoutModal] = useState(false);
    const [showMenu, setShowMenu] = useState(false);

    return (
        <div className="d-flex justify-content-between align-items-center p-3 bg-dark text-white border-bottom shadow-sm">
            <h4 className="m-0">MindMate</h4>
            <div className="d-flex gap-3">
                <Button variant="outline-light" size="sm" onClick={() => navigate('/profile')}>Profile</Button>
                <Button variant="outline-light" size="sm" onClick={() => navigate('/appointments')}>Appointments</Button>
                <Button variant="light" size="sm" onClick={() => setShowMenu(true)}>Menu</Button>
            </div>

            <Offcanvas show={showMenu} onHide={() => setShowMenu(false)} placement="end">
                <Offcanvas.Header closeButton>
                    <Offcanvas.Title>Navigation</Offcanvas.Title>
                </Offcanvas.Header>
                <Offcanvas.Body className="d-flex flex-column gap-2">
                    <Button variant="outline-dark" onClick={() => navigate('/ventwall')}>VentWall</Button>
                    <Button variant="outline-dark" onClick={() => navigate('/wellness')}>Wellness</Button>
                    <Button variant="outline-dark" onClick={() => navigate('/resource')}>Resource</Button>
                    <Button variant="outline-dark" onClick={() => navigate('/feedback')}>Feedback</Button>
                    <Button variant="outline-dark" onClick={() => navigate('/report')}>Report</Button>
                    <Button variant="outline-dark" onClick={() => navigate('/sos')}>SOS</Button>
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
                        navigate('/login');
                    }}>Logout</Button>
                    <Button className="w-50" variant="secondary" onClick={() => setShowLogoutModal(false)}>
                        Cancel
                    </Button>
                </Modal.Footer>
            </Modal>

        </div>
    );
};

export default StudentNavbar;