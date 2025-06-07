import React, { useState } from 'react';
import { Container, Table, Button, Modal, Form, Alert, Spinner } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import CounselorPsychologistDash from '../components/CounselorPsychologistDash';

const StudentHome = () => {
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const handleLogoutClick = () => setShowLogoutModal(true);
  const navigate = useNavigate();

  return (
    <div style={{
      padding: '2rem',
      background: 'linear-gradient(to right,rgb(201, 224, 126),rgb(88, 206, 169))',
      minHeight: '100vh'
    }}>
      <div className="mb-4 d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center">
        <h2 className="fw-bold mb-3 mb-md-0">Meet Your Mental Health Support Team</h2>
        <div className="d-flex flex-wrap gap-2">
          <Button variant="primary" onClick={() => navigate('/appointments')}>Manage Appointments</Button>
          <Button variant="primary" onClick={() => navigate('/profile')}>Profile</Button>
          <Button variant="primary" onClick={() => navigate('/feedback')}>Feedback</Button>
          <Button variant="primary" onClick={() => navigate('/ventwall')}>VentWall</Button>
          <Button variant="danger" onClick={handleLogoutClick}>Logout</Button>
        </div>
      </div>

      <CounselorPsychologistDash />

      <Modal show={showLogoutModal} onHide={() => setShowLogoutModal(false)} centered>
        <Modal.Header className='justify-content-center border-0'>
          <Modal.Title className='text-center w-100'>Are you sure you want to log out?</Modal.Title>
        </Modal.Header>
        <Modal.Footer className='d-flex flex-column gap-2'>
          <Button className='w-50' variant="danger" onClick={() => {
            localStorage.removeItem('token');
            navigate('/login');
          }}>
            Logout
          </Button>
          <Button className='w-50' variant="secondary" onClick={() => setShowLogoutModal(false)}>
            Cancel
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default StudentHome;
