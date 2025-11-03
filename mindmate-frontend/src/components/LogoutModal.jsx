import React from 'react';
import { Button } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';

const LogoutModal = ({ show, onClose }) => {
  const navigate = useNavigate();

  if (!show) return null; // Hide modal when not active

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login', { replace: true });
    window.history.pushState(null, '', window.location.href);
    window.onpopstate = () => {
      window.history.pushState(null, '', window.location.href);
    };
  };

  return (
    <div
      className="modal fade show"
      style={{
        display: 'block',
        backgroundColor: 'rgba(0,0,0,0.5)',
        zIndex: 2000,
      }}
    >
      <div
        className="modal-dialog modal-dialog-centered"
        style={{ maxWidth: '400px' }}
      >
        <div className="modal-content text-center p-4 shadow-lg rounded-3">
          <h5 className="mb-3">Are you sure you want to log out?</h5>
          <div className="mt-3 d-flex justify-content-around">
            <Button variant="danger" onClick={handleLogout}>
              Logout
            </Button>
            <Button variant="secondary" onClick={onClose}>
              Cancel
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LogoutModal;