import React, { useState, useEffect } from 'react';
import axios from '../config/axios';
import { useLocation, useNavigate } from 'react-router-dom';
import { Button, Modal, Offcanvas } from 'react-bootstrap';

const AdminNavbar = () => {
    const [firstName, setFirstName] = useState('');
    const [showLogoutModal, setShowLogoutModal] = useState(false);
    const [showMenu, setShowMenu] = useState(false);
    const navigate = useNavigate();
    const location = useLocation();

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
        navigate('/admin/login', { replace: true });
        window.history.pushState(null, '', window.location.href);
        window.onpopstate = () => {
            window.history.pushState(null, '', window.location.href);
        };
    };

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
                        {firstName}'s • <span className="text-light">MindMate Admin</span>
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
                <Button variant="link" size="sm"
                    className='text-decoration-none text-dark'
                    style={location.pathname === '/admin/stat' ? { borderBottom: '2px solid black' } : {}}
                    onClick={() => navigate('/admin/stat')}>Home</Button>
                <Button variant="link" size="sm"
                    className='text-decoration-none text-dark'
                    style={location.pathname === '/admin/profile' ? { borderBottom: '2px solid black' } : {}}
                    onClick={() => navigate('/admin/profile')}>Profile</Button>
                <Button variant="link" size="sm"
                    className='text-decoration-none text-dark'
                    style={location.pathname === '/admin/approval' ? { borderBottom: '2px solid black' } : {}}
                    onClick={() => navigate('/admin/approval')}>Manage Approvals</Button>
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
                    <Button className="d-md-none"
                        variant={location.pathname === '/admin/stat' ? 'light' : 'outline-dark'}
                        onClick={() => {
                            navigate('/admin/stat');
                            setShowMenu(false);
                        }}>Home</Button>
                    <Button className="d-md-none"
                        variant={location.pathname === '/admin/profile' ? 'light' : 'outline-dark'}
                        onClick={() => {
                            navigate('/admin/profile');
                            setShowMenu(false);
                        }}>Profile</Button>
                    <Button className="d-md-none"
                        variant={location.pathname === '/admin/approval' ? 'light' : 'outline-dark'}
                        onClick={() => {
                            navigate('/admin/approval');
                            setShowMenu(false);
                        }}>Manage Approvals</Button>

                    <Button variant={location.pathname === '/admin/adminmanage' ? 'light' : 'outline-dark'}
                        onClick={() => {
                            navigate('/admin/adminmanage');
                            setShowMenu(false);
                        }}>Manage Admins</Button>
                    <Button variant={location.pathname === '/admin/content' ? 'light' : 'outline-dark'}
                        onClick={() => {
                            navigate('/admin/content');
                            setShowMenu(false);
                        }}>Content Moderation</Button>
                    <Button variant={location.pathname === '/admin/report' ? 'light' : 'outline-dark'}
                        onClick={() => {
                            navigate('/admin/report');
                            setShowMenu(false);
                        }}>Reporting Moderation</Button>
                    <Button variant="danger" onClick={() => setShowLogoutModal(true)}>Logout</Button>
                </Offcanvas.Body>

                <div className="mt-auto text-center small pt-2 pb-2 border-top">
                    Balance ✦ Clarity ✦ Oversight
                </div>

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