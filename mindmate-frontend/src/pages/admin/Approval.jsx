import React, { useEffect, useState } from 'react';
import axios from '../../config/axios';
import CustomTable from '../../components/CustomTable';
import ConfirmModal from '../../components/ConfirmModal';
import { toast } from 'react-toastify';
import { Container, Spinner, Card, } from 'react-bootstrap';

const Approval = () => {
  const [pendingList, setPendingList] = useState([]);
  const [loading, setLoading] = useState(true);

  const [showModal, setShowModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [actionType, setActionType] = useState('');
  const [forbidden, setForbidden] = useState(false);

  const [counpsycho, setCounPsycho] = useState([]);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const fetchPendingApprovals = async () => {
    try {
      const res = await axios.get('admin/pending-approvals');
      setPendingList(res.data);
    } catch (err) {
      if (err?.response?.status === 403) {
        setForbidden(true);
      } else {
        toast.error(err?.response?.data?.message || 'Failed to fetch pending approvals');
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchCounselorPsychologists = async () => {
    try {
      const res = await axios.get('admin/counselorPsychologist');
      const approvedOnly = res.data.filter((person) => person.ApprovedByAdmin === true);
      setCounPsycho(approvedOnly);
    } catch (err) {
      toast.error('Failed to load counselor/psychologists');
    }
  };

  useEffect(() => {
    fetchPendingApprovals();
    fetchCounselorPsychologists();
  }, []);

  const confirmAction = async () => {
    if (!selectedUser) return;

    try {
      if (actionType === 'approve') {
        await axios.put(`admin/approve/${selectedUser._id}`);
        toast.success(`${selectedUser.FullName} approved`);
      } else {
        await axios.put(`admin/reject/${selectedUser._id}`);
        toast.info(`${selectedUser.FullName} rejected`);
      }
      fetchPendingApprovals();
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Action failed');
    } finally {
      setShowModal(false);
    }
  };

  const handleActionClick = (user, type) => {
    setSelectedUser(user);
    setActionType(type);
    setShowModal(true);
  };

  const handleDeleteClick = (item) => {
    setDeleteTarget(item);
    setShowDeleteModal(true);
  };

  const handleConfirmDelete = async () => {
    try {
      await axios.delete(`/admin/counselorpsychologist/${deleteTarget._id}`);
      toast.success(`${deleteTarget.FullName} deleted`);
      setShowDeleteModal(false);
      const res = await axios.get('admin/counselorPsychologist');
      setCounPsycho(res.data);
    } catch (err) {
      toast.error('Failed to delete');
    }
  };

  const columns = [
    { header: 'Name', accessor: 'FullName' },
    { header: 'Role', accessor: 'Role' },
    { header: 'Specialization', accessor: 'Specialization' },
    { header: 'Phone', accessor: 'Phone' },
    { header: 'Email', accessor: 'Email' },
  ];

  const actions = [
    {
      label: 'Approve',
      variant: 'success',
      onClick: (user) => handleActionClick(user, 'approve'),
    },
    {
      label: 'Reject',
      variant: 'danger',
      onClick: (user) => handleActionClick(user, 'reject'),
    },
  ];

  const counselorPsychologistColumns = [
    { header: 'Full Name', accessor: 'FullName' },
    { header: 'Role', accessor: 'Role' },
    { header: 'Specialization', accessor: 'Specialization' },
    { header: 'Phone', accessor: 'Phone' },
    { header: 'Email', accessor: 'Email' },
  ];

  const counselorPsychologistActions = [
    {
      label: 'Delete',
      variant: 'danger',
      onClick: (item) => handleDeleteClick(item),
    },
  ];

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
        }}>
        <h3 className="text-center mb-4 fw-bold text-primary">Pending Approvals</h3>
        {loading ? (
          <div className="text-center">
            <Spinner animation="border" />
          </div>
        ) : (
          <CustomTable
            columns={columns}
            data={pendingList}
            actions={actions}
            rowKey={(item) => item._id}
          />
        )}
      </Card>

      <Card
        className="p-4 shadow-lg rounded-4 mt-4"
        style={{
          background: 'transparent',
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(255, 255, 255, 0.2)'
        }}>
        <h4 className="fw-bold text-primary mb-3">Counselors & Psychologists</h4>
        {loading ? (
          <div className="text-center">
            <Spinner animation="border" />
          </div>
        ) : (
          <CustomTable
            columns={counselorPsychologistColumns}
            data={counpsycho}
            actions={counselorPsychologistActions}
            rowKey={(item) => item._id}
          />
        )}
      </Card>

      <ConfirmModal
        show={showModal}
        onHide={() => setShowModal(false)}
        onConfirm={confirmAction}
        message={
          <p>
            Are you sure you want to{' '}
            <strong>{actionType === 'approve' ? 'Approve' : 'Reject'}</strong>{' '}
            <span className="text-primary fw-bold">{selectedUser?.FullName}</span>?
          </p>
        }
      />

      <ConfirmModal
        show={showDeleteModal}
        onHide={() => setShowDeleteModal(false)}
        onConfirm={handleConfirmDelete}
        message={
          <p>
            Are you sure you want to delete this{' '}
            <span className="fw-bold">
              {deleteTarget?.Role === 'psychologist' ? 'Psychologist' : 'Counselor'}
            </span>{' '}
            <span className="text-primary fw-bold">{deleteTarget?.FullName}</span>?
          </p>
        }
      />

    </Container>
  );
};

export default Approval;