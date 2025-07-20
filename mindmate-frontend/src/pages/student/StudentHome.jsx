import React, { useState } from 'react';
import { Container } from 'react-bootstrap';
import CounselorPsychologistDash from '../../components/CounselorPsychologistDash';

const StudentHome = () => {

  return (
    <>
      <Container className="flex-grow-1">
        <h2 className="fw-bold mb-2 text-center">Meet Your Mental Health Support Team</h2>

        <CounselorPsychologistDash />

      </Container>
    </>
  );
};

export default StudentHome;