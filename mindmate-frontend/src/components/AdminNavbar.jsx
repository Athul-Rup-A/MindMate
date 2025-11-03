import React, { useState, useEffect } from 'react';
import axios from '../config/axios';
import { useLocation, useNavigate } from 'react-router-dom';
import { Button, Modal, Offcanvas } from 'react-bootstrap';

const AdminNavbar = () => {
    const [firstName, setFirstName] = useState('');
    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        const fetchName = async () => {
            try {
                const res = await axios.get('admin/profile');
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

    return (
        <div className="d-flex justify-content-between align-items-center p-3 text-dark shadow-sm flex-wrap"
            style={{
                backgroundColor: 'transparent',
                position: 'sticky',
                top: 0,
                left: '60px',
                right: 0,
                height: '70px',
                display: 'flex',
                marginLeft: '60px',
                alignItems: 'center',
                justifyContent: 'space-between',
                zIndex: 1000,
                borderBottom: '1px solid rgba(255,255,255,0.2)',
            }}>
            <h4 className="m-0">
                {firstName ? (
                    <>
                        <span className="text-light">MindMate Admin</span> • {firstName}
                    </>
                ) : (
                    'MindMate • Admin'
                )}
            </h4>
        </div>
    );
};

export default AdminNavbar;