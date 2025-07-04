import React, { useState, useEffect } from 'react';
import axios from '../config/axios';
import { useNavigate } from 'react-router-dom';
import { Button, Modal, Offcanvas } from 'react-bootstrap';

const AdminNavbar = () => {
    const [firstName, setFirstName] = useState('');
    const [showLogoutModal, setShowLogoutModal] = useState(false);
    const [showMenu, setShowMenu] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchName = async () => {
            try {
                const res = await axios.get('/admin/profile');
                const fullName = res.data?.FullName || '';
                const first = fullName.split(' ')[0];
                const capFirst = (str) => str.charAt(0).toUpperCase() + str.slice(1);
                setFirstName(capFirst(first));
            } catch (err) {
                console.error('Failed to fetch admin name');
            }
        };

        fetchName();
    }, []);

    const handleLogout = () => {
        localStorage.removeItem('token');
        navigate('/login/admin', { replace: true });
        window.history.pushState(null, '', window.location.href);
        window.onpopstate = () => {
            window.history.pushState(null, '', window.location.href);
        };
    };

    return (
        <div className="d-flex justify-content-between align-items-center p-3 text-dark shadow-sm flex-wrap">
            <h4 className="m-0">
                {firstName ? (
                    <>
                        <span className="text-light">{firstName}'s</span> • MindMate Admin
                    </>
                ) : (
                    'MindMate • Admin'
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
                <Button variant="" size="sm" onClick={() => navigate('/profile/admin')}>Profile</Button>
                <Button variant="" size="sm" onClick={() => navigate('/approval/admin')}>Manage Approvals</Button>
                <Button variant="dark" size="sm" onClick={() => setShowMenu(true)}>
                    Menu
                </Button>
            </div>

            <Offcanvas show={showMenu} onHide={() => setShowMenu(false)} placement="end">
                <Offcanvas.Header closeButton>
                    <Offcanvas.Title className="fs-4">
                        {firstName ? `${firstName}'s • Panel` : 'Admin Panel'}
                    </Offcanvas.Title>
                </Offcanvas.Header>
                <Offcanvas.Body className="d-flex flex-column gap-2">
                    <Button variant="outline-dark" className="d-md-none" onClick={() => navigate('/profile/admin')}>Profile</Button>
                    <Button variant="outline-dark" className="d-md-none" onClick={() => navigate('/approval/admin')}>Manage Approvals</Button>
                    <Button variant="outline-dark" onClick={() => navigate('/adminmanage/admin')}>Manage Admins</Button>
                    <Button variant="outline-dark" onClick={() => navigate('/content/admin')}>Content Moderation</Button>
                    <Button variant="outline-dark" onClick={() => navigate('/report/admin')}>Report Moderation</Button>
                    <Button variant="danger" onClick={() => setShowLogoutModal(true)}>Logout</Button>
                </Offcanvas.Body>
            </Offcanvas>

            <Modal show={showLogoutModal} onHide={() => setShowLogoutModal(false)} centered>
                <Modal.Header className="justify-content-center border-0">
                    <Modal.Title className="text-center w-100">Are you sure you want to log out?</Modal.Title>
                </Modal.Header>
                <Modal.Footer className="d-flex flex-column gap-2">
                    <Button className="w-50" variant="danger" onClick={handleLogout}>
                        Logout
                    </Button>
                    <Button className="w-50" variant="secondary" onClick={() => setShowLogoutModal(false)}>
                        Cancel
                    </Button>
                </Modal.Footer>
            </Modal>
        </div>
    );
};

export default AdminNavbar;