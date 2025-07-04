import React, { useEffect, useState } from 'react';
import axios from '../../config/axios';
import CustomTable from '../../components/CustomTable';
import FormField from '../../components/FormField';
import getCurrentUserId from '../../config/getCurrentUserId';
import AdminHome from '../../components/AdminHome';
import ConfirmModal from '../../components/ConfirmModal';
import { toast } from 'react-toastify';
import { Container, Spinner, Card, Modal, Button, Form, } from 'react-bootstrap';
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

  const columns = [
    {
      header: 'Alias ID',
      accessor: (admin) =>
        admin._id === currentUserId ? (
          <>
            {admin.AliasId} <span className="badge bg-info">You</span>
          </>
        ) : (
          admin.AliasId
        ),
    },
    { header: 'Role', accessor: 'Role' },
    { header: 'Phone', accessor: 'Phone' },
    { header: 'Email', accessor: 'Email' },
  ];

  const actions = [
    {
      label: 'ResendPassword',
      variant: 'warning',
      show: (admin) =>
        currentUserId === firstAdminId && admin._id !== currentUserId,
      onClick: handleResendTempPassword,
    },
    {
      label: 'Delete',
      variant: 'danger',
      show: (admin) =>
        currentUserId === firstAdminId && admin._id !== currentUserId, // First admin can delete others only
      onClick: (admin) => {
        setAdminToDelete(admin);
        setShowDeleteModal(true);
      },
    },
  ];

  if (forbidden) {
    return (
      <div className="text-center p-5">
        <AdminHome />
        <h3 className="text-danger fw-bold">Access Denied</h3>
        <p>You do not have permission to view this page.</p>
      </div>
    );
  };

  return (
    <div
      style={{
        background: 'linear-gradient(to right, #e0f7fa, #f0f4f8)',
        minHeight: '100vh',
        paddingTop: '40px',
        paddingBottom: '40px',
      }}
    >
      <Container>
        <AdminHome />
        <Card className="p-4 shadow-lg rounded-4">
          <div className="d-flex justify-content-between align-items-center mb-4">
            <h3 className="fw-bold text-primary m-0">Manage Admins&Moderators</h3>
            <Button variant="primary" onClick={() => setShowCreateModal(true)}>
              + Create
            </Button>
          </div>

          {loading ? (
            <div className="text-center">
              <Spinner animation="border" />
            </div>
          ) : (
            <CustomTable
              columns={columns}
              data={adminList}
              actions={actions}
              rowKey={(item) => item._id}
            />
          )}
        </Card>
      </Container>

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
              AliasId: Yup.string().required('Alias ID is required'),
              fullName: Yup.string().required('Full Name is required'),
              email: Yup.string().email('Invalid email').required('Email is required'),
              phone: Yup.string().matches(/^\d{10}$/, 'Phone must be 10 digits').required('Phone is required'),
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
    </div>
  );
};

export default Admin;