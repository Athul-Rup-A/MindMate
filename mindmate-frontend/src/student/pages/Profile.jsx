import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import authHeader from '../../config/authHeader';
import { Container, Form, Button, Spinner, Alert, Modal } from 'react-bootstrap';

const Profile = () => {
  const [profile, setProfile] = useState({ AliasId: '', Phone: '', Status: '' });
  const [loading, setLoading] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const navigate = useNavigate();

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
  });
  const [passwordChanging, setPasswordChanging] = useState(false);
  const [message, setMessage] = useState(null);
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/students';

  const fetchProfile = async () => {
    try {
      const response = await axios.get(`${BASE_URL}/profile`, authHeader());
      const data = response.data;
      setProfile({
        AliasId: data.AliasId || '',
        Phone: data.Phone || '',
        Status: data.Status || '',
      });
    } catch (err) {
      console.error('Error loading profile:', err);
      alert('Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {

    // Phone validation: exactly 10 digits
    if (!/^\d{10}$/.test(profile.Phone)) {
      alert('Phone number must be exactly 10 digits');
      return;
    }

    try {
      // Send only editable fields (Phone)
      await axios.put(`${BASE_URL}/profile`, { Phone: profile.Phone }, authHeader());
      alert('Profile updated successfully!');
      setEditMode(false);
    } catch (err) {
      console.error('Error updating profile:', err);
      alert('Failed to update profile');
    }
  };

  const handleChange = (e) => {
    setProfile({ ...profile, [e.target.name]: e.target.value });
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    setPasswordChanging(true);
    setMessage(null);
    try {
      const response = await axios.put(`${BASE_URL}/change-profile-password`, passwordData, authHeader());
      setMessage({ type: 'success', text: response.data.message });
      setPasswordData({ currentPassword: '', newPassword: '' });
      setTimeout(() => setMessage(null), 3000);
    } catch (err) {
      console.error('Error changing password:', err);
      setMessage({
        type: 'danger',
        text: err.response?.data?.message || 'Failed to change password',
      });
      setTimeout(() => setMessage(null), 5000);
    } finally {
      setPasswordChanging(false);
    }
  };

  const handleLogoutClick = () => setShowLogoutModal(true);
  const handleCancelLogout = () => setShowLogoutModal(false);
  const handleConfirmLogout = () => {
    setShowLogoutModal(false);
    // alert('Logged out successfully');
    localStorage.removeItem('token');
    navigate('/login');
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  if (loading) {
    return (
      <Container className="mt-5 text-center">
        <Spinner animation="border" />
        <p>Loading profile...</p>
      </Container>
    );
  }

  return (
    <Container className="mt-5" style={{ maxWidth: '500px' }}>
      <h2>My Profile</h2>
      <Form>
        <Form.Group className="mb-3" controlId="formAliasId">
          <Form.Label>Alias ID</Form.Label>
          <Form.Control
            type="text"
            name="AliasId"
            value={profile.AliasId}
            disabled
          />
        </Form.Group>

        <Form.Group className="mb-3" controlId="formStatus">
          <Form.Label>Status</Form.Label>
          <Form.Control
            type="text"
            name="Status"
            value={profile.Status}
            disabled
          />
        </Form.Group>

        <Form.Group className="mb-3" controlId="formPhone">
          <Form.Label>Phone</Form.Label>
          <Form.Control
            type="text"
            name="Phone"
            value={profile.Phone}
            disabled={!editMode}
            onChange={handleChange}
          />
        </Form.Group>

        {!editMode ? (
          <Button variant="primary" onClick={() => setEditMode(true)}>
            Edit
          </Button>
        ) : (
          <>
            <Button variant="success" className="me-2" onClick={handleSave}>
              Save
            </Button>
            <Button variant="secondary" onClick={() => setEditMode(false)}>
              Cancel
            </Button>
          </>
        )}
      </Form>

      <hr />

      <h4>Change Password</h4>
      {message && <Alert variant={message.type}>{message.text}</Alert>}
      <Form onSubmit={handlePasswordChange}>
        <Form.Group className="mb-3" controlId="currentPassword">
          <Form.Label>Current Password</Form.Label>
          <Form.Control
            type="password"
            value={passwordData.currentPassword}
            onChange={(e) =>
              setPasswordData({ ...passwordData, currentPassword: e.target.value })
            }
            required
          />
        </Form.Group>

        <Form.Group className="mb-3" controlId="newPassword">
          <Form.Label>New Password</Form.Label>
          <Form.Control
            type="password"
            value={passwordData.newPassword}
            onChange={(e) =>
              setPasswordData({ ...passwordData, newPassword: e.target.value })
            }
            required
          />
        </Form.Group>

        <Button variant="warning" type="submit" disabled={passwordChanging}>
          {passwordChanging ? 'Updating...' : 'Change Password'}
        </Button>
      </Form>

      <Button variant="danger" className="mt-3" onClick={handleLogoutClick}>
        Logout
      </Button>

      <Modal show={showLogoutModal} onHide={handleCancelLogout} centered>
        <Modal.Header className="justify-content-center border-0">
          <Modal.Title className="text-center w-100">
            Are you sure you want to log out?
          </Modal.Title>
        </Modal.Header>
        {/* <Modal.Body className="text-center">
  <p className="fs-5">Are you sure you want to log out?</p>
</Modal.Body> */}
        <Modal.Footer className="d-flex flex-column gap-2">
          <Button variant="danger" onClick={handleConfirmLogout} className="w-50">
            Yes
          </Button>
          <Button variant="secondary" onClick={handleCancelLogout} className="w-50">
            No
          </Button>
        </Modal.Footer>
      </Modal>

    </Container>
  );
};

export default Profile;