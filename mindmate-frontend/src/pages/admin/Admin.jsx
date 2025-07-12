import React, { useEffect, useState } from 'react';
import axios from '../../config/axios';
import FormField from '../../components/FormField';
import getCurrentUserId from '../../config/getCurrentUserId';
import ConfirmModal from '../../components/ConfirmModal';
import { toast } from 'react-toastify';
import { Container, Spinner, Card, Modal, Button, Form, Row, Col, Badge, } from 'react-bootstrap';
import { Formik, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';

const Admin = () => {
  const [adminList, setAdminList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [adminToDelete, setAdminToDelete] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [forbidden, setForbidden] = useState(false);
  const currentUserId = getCurrentUserId();
  const [firstAdminId, setFirstAdminId] = useState(null);

  const fetchAdmins = async () => {
    try {
      const res = await axios.get('admin/users');
      setAdminList(res.data);
      const sorted = [...res.data].sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
      setFirstAdminId(sorted[0]?._id); // Store the first admin's ID
    } catch (err) {
      if (err?.response?.status === 403) {
        setForbidden(true);
      } else {
        toast.error(err?.response?.data?.message || 'Failed to fetch admins');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdmins();
  }, []);

  const handleResendTempPassword = async (admin) => {
    try {
      await axios.post(`admin/resend-temp-password/${admin._id}`);
      toast.success(`Temp password resent to ${admin.AliasId}`);
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to resend password');
    }
  };

  const handleDeleteAdmin = async () => {
    try {
      await axios.delete(`admin/${adminToDelete._id}`);
      toast.success(`${adminToDelete.AliasId} deleted`);
      fetchAdmins();
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to delete admin');
    } finally {
      setShowDeleteModal(false);
    }
  };

  const handleCreateAdmin = async (values, { resetForm }) => {
    try {
      await axios.post('admin/create', values);
      toast.success(`${values.AliasId} created and credentials sent`);
      setShowCreateModal(false);
      fetchAdmins();
      resetForm();
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to create admin');
    }
  };

  if (forbidden) {
    return (
      <div className="text-center p-5">
        <h3 className="text-danger fw-bold">Access Denied</h3>
        <p>You do not have permission to view this page.</p>
      </div>
    );
  };

  return (
    <Container>
      <Card
        className="p-4 shadow-lg rounded-4"
        style={{
          background: 'transparent',
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(255, 255, 255, 0.2)'
        }}
      >
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h3 className="fw-bold m-0">Manage Admins&Moderators</h3>
          <Button variant="primary" onClick={() => setShowCreateModal(true)}>
            + Create
          </Button>
        </div>

        {loading ? (
          <div className="text-center">
            <Spinner animation="border" />
          </div>
        ) : (
          <Row xs={1} md={2} lg={2} className="g-4">
            {adminList.map((admin) => (
              <Col key={admin._id}>
                <Card
                  className="shadow-sm border-0 rounded-4 p-3 h-100"
                  style={{
                    boxShadow: '0 8px 32px rgba(0,0,0,0.2)',
                    backdropFilter: 'blur(10px)',
                    border: '1px solid rgba(255, 255, 255, 0.2)'
                  }}
                >
                  <Card.Body>
                    <Card.Title className="fw-bold text-primary">
                      {admin.AliasId}
                      {admin._id === currentUserId && (
                        <Badge bg="info" className="ms-2">You</Badge>
                      )}
                    </Card.Title>
                    <Card.Text className="mb-1"><strong>Role:</strong> {admin.Role}</Card.Text>
                    <Card.Text className="mb-1"><strong>Email:</strong> {admin.Email}</Card.Text>
                    <Card.Text className="mb-3"><strong>Phone:</strong> {admin.Phone}</Card.Text>

                    <div className="d-flex gap-2">
                      {currentUserId === firstAdminId && admin._id !== currentUserId && (
                        <>
                          <Button
                            variant="outline-warning"
                            size="sm"
                            onClick={() => handleResendTempPassword(admin)}
                          >
                            Resend Password
                          </Button>
                          <Button
                            variant="outline-danger"
                            size="sm"
                            onClick={() => {
                              setAdminToDelete(admin);
                              setShowDeleteModal(true);
                            }}
                          >
                            Delete
                          </Button>
                        </>
                      )}
                    </div>
                  </Card.Body>
                </Card>
              </Col>
            ))}
          </Row>
        )}
      </Card>

      <ConfirmModal
        show={showDeleteModal}
        onHide={() => setShowDeleteModal(false)}
        onConfirm={handleDeleteAdmin}
        message={
          <p>
            Are you sure you want to delete{' '}
            <span className="fw-bold">
              {adminToDelete?.Role === 'moderator' ? 'Moderator' : 'Admin'}{' '}
              <span className='text-primary'>
                {adminToDelete?.AliasId}
              </span>
            </span>?
          </p>
        }
      />

      <Modal show={showCreateModal} onHide={() => setShowCreateModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Create New Admin/Moderator</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Formik
            initialValues={{
              AliasId: '',
              fullName: '',
              email: '',
              phone: '',
              role: 'admin',
            }}
            validationSchema={Yup.object({
              AliasId: Yup.string()
                .matches(/^[a-zA-Z0-9_]{4,20}$/, 'Alias ID must be 4–20 characters, alphanumeric or underscore only')
                .required('Alias ID is required'),
              fullName: Yup.string().required('Full Name is required'),
              email: Yup.string().email('Invalid email').required('Email is required'),
              phone: Yup.string()
                .matches(/^[6-9]\d{9}$/, 'Enter a valid 10-digit Indian phone number')
                .required('Phone number is required'),
              role: Yup.string().oneOf(['admin', 'moderator'], 'Invalid role').required('Role is required'),
            })}
            onSubmit={handleCreateAdmin}
          >
            {({ handleSubmit }) => (
              <Form onSubmit={handleSubmit} className="d-flex flex-column">
                <FormField name="AliasId" label="Alias ID" placeholder="Enter Alias ID" />
                <FormField name="fullName" label="Full Name" placeholder="Enter Full Name" />
                <FormField name="email" type="email" label="Email" placeholder="Enter Email" />
                <FormField name="phone" label="Phone" placeholder="Enter 10-digit Phone" />

                <Form.Group>
                  <Form.Label>Role</Form.Label>
                  <Field as="select" name="role" className="form-select">
                    <option value="admin">Admin</option>
                    <option value="moderator">Moderator</option>
                  </Field>
                  <ErrorMessage name="role" component="div" className="text-danger small mt-1" />
                </Form.Group>

                <div className="d-flex justify-content-end gap-2 mt-3">
                  <Button variant="secondary" onClick={() => setShowCreateModal(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" variant="success">
                    Create
                  </Button>
                </div>
              </Form>
            )}
          </Formik>
        </Modal.Body>
      </Modal>

    </Container>
  );
};

export default Admin;