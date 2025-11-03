import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from '../../config/axios';
import { Container, Spinner, Card, Button } from 'react-bootstrap';
import { toast } from 'react-toastify';

const VerifyPasswordCounselorPsychologist = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState('loading');
  const [message, setMessage] = useState('');

  useEffect(() => {
    const verifyPassword = async () => {
      try {
        const res = await axios.get(
          `/counselorpsychologist/verify-password-change/${token}`
        );
        setStatus('success');
        setMessage(res.data.message || 'Password changed successfully.');
        localStorage.removeItem("token");
        setTimeout(() => navigate('/login'), 2000);
      } catch (error) {
        setStatus('error');
        setMessage(error.response?.data?.message || 'Verification failed.');
        toast.error('Verification failed.');
      }
    };

    if (token) verifyPassword();
  }, [token, navigate]);

  return (
    <Container className="d-flex justify-content-center align-items-center vh-100">
      <Card className="p-4 shadow-lg text-center" style={{ width: '380px' }}>
        {status === 'loading' && (
          <>
            <Spinner animation="border" className="mb-3" />
            <h5>Verifying password...</h5>
          </>
        )}

        {status === 'success' && (
          <>
            <h4 className="text-success mb-3">✅ Password Updated!</h4>
            <p>{message}</p>
          </>
        )}

        {status === 'error' && (
          <>
            <h4 className="text-danger mb-3">❌ Verification Failed</h4>
            <p>{message}</p>
            <Button variant="secondary" onClick={() => navigate('/login')}>
              Back to Login
            </Button>
          </>
        )}
      </Card>
    </Container>
  );
};

export default VerifyPasswordCounselorPsychologist;