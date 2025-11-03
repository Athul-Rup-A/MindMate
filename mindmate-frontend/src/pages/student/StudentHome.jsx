import React, { useState } from 'react';
import { Container } from 'react-bootstrap';
import CounselorPsychologistDash from '../../components/CounselorPsychologistDash';
import StudentSidebar from '../../components/StudentSidebar';

const StudentHome = () => {

  return (
    <div style={{ marginLeft: '60px' }}>
      <StudentSidebar />
      <Container>
        <h2 className="fw-bold mb-2 me-5 text-center">Meet Your Mental Health Support Team</h2>

        <CounselorPsychologistDash />

      </Container>
    </div>
  );
};

export default StudentHome;