import React, { useState } from 'react';
import { Container, Modal, Button } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import CounselorPsychologistDash from '../components/CounselorPsychologistDash';
import StudentNavbar from '../components/studentNavbar';
import Footer from '../components/studentFooter';

const StudentHome = () => {
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const navigate = useNavigate();

  return (
    <div style={{
      background: 'linear-gradient(to right,rgb(201, 224, 126),rgb(88, 206, 169))',
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column'
    }}>
      <StudentNavbar />

      <Container className="flex-grow-1 my-4">
        <h2 className="fw-bold mb-4 text-center">Meet Your Mental Health Support Team</h2>
        <CounselorPsychologistDash />
      </Container>

      <Footer />

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

export default StudentHome;