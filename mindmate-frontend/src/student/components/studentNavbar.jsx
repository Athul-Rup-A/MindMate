import React, { useState } from 'react';
import { Button, Offcanvas } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';

const StudentNavbar = () => {
    const navigate = useNavigate();
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
                    <Button variant="danger" onClick={() => {
                        localStorage.removeItem('token');
                        navigate('/login');
                    }}>Logout</Button>
                </Offcanvas.Body>
            </Offcanvas>
        </div>
    );
};

export default StudentNavbar;