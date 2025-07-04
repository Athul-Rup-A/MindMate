import React, { useEffect, useState } from 'react';
import axios from '../../config/axios';
import CustomTable from '../../components/CustomTable';
import AdminHome from '../../components/AdminHome';
import ConfirmModal from '../../components/ConfirmModal';
import { toast } from 'react-toastify';
import { Container, Spinner, Card, Collapse, } from 'react-bootstrap';
import { ChatDots, StarFill, FileEarmarkText } from 'react-bootstrap-icons';

const Content = () => {
  const [loading, setLoading] = useState(true);
  const [vents, setVents] = useState([]);
  const [resources, setResources] = useState([]);
  const [feedbacks, setFeedbacks] = useState([]);
  const [showConfirm, setShowConfirm] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState({ type: '', id: null });

  const [expandedSection, setExpandedSection] = useState(null);

  const toggleSection = (section) => {
    setExpandedSection((prev) => (prev === section ? null : section));
  };

  const fetchData = async () => {
    try {
      const [v, r, f] = await Promise.all([
        axios.get('admin/vents'),
        axios.get('admin/resources'),
        axios.get('admin/feedbacks'),
      ]);
      setVents(v.data);
      setResources(r.data);
      setFeedbacks(f.data);
    } catch (err) {
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleDeleteClick = (type, item) => {
    setDeleteTarget({ type, id: item._id });
    setShowConfirm(true);
  };

  const handleConfirmDelete = async () => {
    try {
      await axios.delete(`/admin/${deleteTarget.type}/${deleteTarget.id}`);
      toast.success(`${deleteTarget.type} deleted successfully`);
      fetchData();
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to delete');
    } finally {
      setShowConfirm(false);
    }
  };

  const makeActions = (type) => [
    {
      label: 'Delete',
      variant: 'danger',
      onClick: (item) => handleDeleteClick(type, item),
    },
  ];

  const renderCard = (key, title, icon, data, columns, type) => (
    <Card
      key={key}
      className="shadow-sm rounded-4 mb-3"
      style={{ cursor: 'pointer' }}
    >
      <Card.Header
        className="d-flex justify-content-between align-items-center bg-light"
        onClick={() => toggleSection(key)}
      >
        <div className="d-flex align-items-center gap-2">
          {icon}
          <h5 className="mb-0 fw-bold text-primary">{title}</h5>
        </div>
        <span className="badge bg-primary rounded-pill">{data?.length || 0}</span>
      </Card.Header>
      <Collapse in={expandedSection === key}>
        <div>
          <Card.Body>
            {loading ? (
              <div className="text-center">
                <Spinner animation="border" />
              </div>
            ) : (
              <CustomTable
                columns={columns}
                data={data}
                actions={makeActions(type)}
                rowKey={(item) => item._id}
              />
            )}
          </Card.Body>
        </div>
      </Collapse>
    </Card>
  );

  return (
    <div
      style={{
        background: 'linear-gradient(to right, #f0f4f8, #e0f7fa)',
        minHeight: '100vh',
        paddingTop: '40px',
        paddingBottom: '40px',
      }}
    >
      <Container>
        <AdminHome />

        {renderCard(
          'vents',
          'VentWall Posts',
          <ChatDots size={22} />,
          vents,
          [
            { header: 'Topic', accessor: 'Topic' },
            { header: 'Content', accessor: 'Content' },
          ],
          'Vent'
        )}

        {renderCard(
          'feedbacks',
          'Feedbacks',
          <StarFill size={22} />,
          feedbacks,
          [
            { header: 'Type', accessor: 'Type' },
            { header: 'Comment', accessor: 'Comment' },
            { header: 'Rating', accessor: 'Rating' },
          ],
          'Feedback'
        )}

        {renderCard(
          'resources',
          'Resources',
          <FileEarmarkText size={22} />,
          resources,
          [
            { header: 'Title', accessor: 'title' },
            { header: 'Category', accessor: 'type' },
            { header: 'Link', accessor: 'link' },
          ],
          'Resource'
        )}

        <ConfirmModal
          show={showConfirm}
          onHide={() => setShowConfirm(false)}
          onConfirm={handleConfirmDelete}
          message={
            <p>
              Are you sure you want to delete this{' '}
              <span className="fw-bold">{deleteTarget.type}</span>?
            </p>
          }
        />
      </Container>
    </div>
  );
};

export default Content;