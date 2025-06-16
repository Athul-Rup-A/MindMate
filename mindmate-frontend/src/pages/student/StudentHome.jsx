import React, { useState } from 'react';
import { Container } from 'react-bootstrap';
import CounselorPsychologistDash from '../../components/CounselorPsychologistDash';
import StudentNavbar from '../../components/StudentNavbar';
import Footer from '../../components/Footer';

const StudentHome = () => {

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
    </div>
  );
};

export default StudentHome;