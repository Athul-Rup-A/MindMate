import React from 'react';
import { Button } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';

const AdminHome = ({
    className = 'd-flex justify-content-end mb-3',
    variant = 'outline-dark',
    size,
}) => {
    const navigate = useNavigate();

    return (
        <div className={className}>
            <Button variant={variant} size={'sm'} onClick={() => navigate('/stat/admin')}>
                Home
            </Button>
        </div>
    );
};

export default AdminHome;