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

  const [showEditModal, setShowEditModal] = useState(false);
  const [adminToEdit, setAdminToEdit] = useState(null);

  const fetchAdmins = async () => {
    try {
      const res = await axios.get('admin/users');
      const sortedByDate = [...res.data].sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
      const firstAdminId = sortedByDate[0]?._id;
      setFirstAdminId(firstAdminId);

      // sort to show YOU at top
      const sortedByLoggedInFirst = [...res.data].sort((a, b) => {
        if (a._id === currentUserId) return -1;
        if (b._id === currentUserId) return 1;
        return 0;
      });

      setAdminList(sortedByLoggedInFirst);
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
      toast.success(`Temp password resent to ${admin.Username}`);
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to resend password');
    }
  };

  const handleDeleteAdmin = async () => {
    try {
      await axios.delete(`admin/${adminToDelete._id}`);
      toast.success(`${adminToDelete.Username} deleted`);
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
      toast.success(`${values.Username} created and credentials sent`);
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
                      {admin._id === firstAdminId ? (
                        <>
                          {admin.Username} <Badge bg="danger" className="ms-2">Super Admin</Badge>
                        </>
                      ) : (
                        admin.Username
                      )}
                      {admin._id === currentUserId && (
                        <Badge bg="info" className="ms-2">You</Badge>
                      )}
                    </Card.Title>
                    <Card.Text className="mb-1"><strong>Role:</strong> {admin.Role}</Card.Text>
                    <Card.Text className="mb-1"><strong>Email:</strong> {admin.Email}</Card.Text>
                    <Card.Text className="mb-3"><strong>Phone:</strong> {admin.Phone}</Card.Text>

                    <div className="d-flex gap-2">
                      {/* {currentUserId === firstAdminId && admin._id !== currentUserId && ( */}
                      {admin._id !== currentUserId && (
                        <>
                          <Button
                            variant="outline-warning"
                            size="sm"
                            disabled={admin._id === firstAdminId}
                            title={admin._id === firstAdminId ? "Primary admin protected" : "Resend temp password"}
                            onClick={() => handleResendTempPassword(admin)}
                          >
                            Resend Password
                          </Button>
                          <Button
                            variant="outline-info"
                            size="sm"
                            disabled={admin._id === firstAdminId}
                            onClick={() => {
                              setAdminToEdit(admin);
                              setShowEditModal(true);
                            }}
                          >
                            Edit
                          </Button>
                          {currentUserId === firstAdminId && admin._id !== currentUserId && (
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
                          )}
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
                {adminToDelete?.Username}
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
              Username: '',
              fullName: '',
              email: '',
              phone: '',
              role: 'admin',
            }}
            validationSchema={Yup.object({
              Username: Yup.string()
                .matches(/^[a-zA-Z0-9_]{4,20}$/, 'Username must be 4–20 characters, alphanumeric or underscore only')
                .required('Username is required'),
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
                <FormField name="Username" label="Username" placeholder="Enter Username" />
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

      <Modal show={showEditModal} onHide={() => setShowEditModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Edit Admin</Modal.Title>
        </Modal.Header>

        <Modal.Body>
          {adminToEdit && (
            <Formik
              initialValues={{
                fullName: adminToEdit.FullName || '',
                email: adminToEdit.Email || '',
                phone: adminToEdit.Phone || '',
                role: adminToEdit.Role || 'admin'
              }}
              validationSchema={Yup.object({
                fullName: Yup.string().required('Required'),
                email: Yup.string().email('Invalid email').required('Required'),
                phone: Yup.string()
                  .matches(/^[6-9]\d{9}$/, 'Enter valid phone')
                  .required('Required'),
                role: Yup.string().oneOf(['admin', 'moderator'], 'Invalid role')
              })}
              onSubmit={async (values) => {
                try {
                  const payload = { ...values };

                  // If current user is NOT super admin → remove role field
                  if (currentUserId !== firstAdminId) {
                    delete payload.role;
                  }

                  await axios.put(`admin/${adminToEdit._id}`, payload);
                  toast.success('Updated successfully');
                  setShowEditModal(false);
                  fetchAdmins();
                } catch (err) {
                  toast.error(err?.response?.data?.message || 'Update failed!');
                }
              }}
            >
              {({ handleSubmit }) => (
                <Form onSubmit={handleSubmit}>
                  <FormField name="fullName" label="Full Name" />
                  <FormField name="email" label="Email" type="email" />
                  <FormField name="phone" label="Phone" />

                  {currentUserId === firstAdminId && (
                    <Form.Group className="mt-2">
                      <Form.Label>Role</Form.Label>
                      <Field as="select" name="role" className="form-select">
                        <option value="admin">Admin</option>
                        <option value="moderator">Moderator</option>
                      </Field>
                      <ErrorMessage name="role" component="div" className="text-danger small mt-1" />
                    </Form.Group>
                  )}

                  {adminToEdit._id === firstAdminId && (
                    <p className="text-danger small mt-2">
                      Super Admin role cannot be modified.
                    </p>
                  )}

                  {adminToEdit._id === currentUserId && (
                    <p className="text-warning small mt-2">
                      You cannot change your own role.
                    </p>
                  )}

                  <div className="d-flex justify-content-end gap-2 mt-3">
                    <Button variant="secondary" onClick={() => setShowEditModal(false)}>Cancel</Button>
                    <Button type="submit" variant="success">Save</Button>
                  </div>
                </Form>
              )}
            </Formik>
          )}
        </Modal.Body>
      </Modal>

    </Container>
  );
};

export default Admin;