import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Container, Card, Button, Form, Row, Col, Spinner, Modal } from 'react-bootstrap';
import authHeader from '../../config/authHeader';
import { Formik, Field, Form as FormikForm, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { toast } from 'react-toastify';
import getCurrentUserId from '../../config/getCurrentUserId';
import ConfirmModal from '../../components/ConfirmModal'

const VentWall = () => {
  const [vents, setVents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showMyVentsModal, setShowMyVentsModal] = useState(false);
  const [myVents, setMyVents] = useState([]);
  const [showConfirm, setShowConfirm] = useState(false);
  const [ventToDelete, setVentToDelete] = useState(null);
  const [isMyVentDelete, setIsMyVentDelete] = useState(false);
  const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/students';

  const currentUserId = getCurrentUserId();

  const fetchAllVents = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${BASE_URL}/vents/all`, authHeader());
      setVents(res.data);
    } catch (err) {
      toast.error('Failed to fetch community vents.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllVents();
  }, []);

  const handleLike = async (ventId) => {
    try {
      const res = await axios.put(`${BASE_URL}/vents/${ventId}/like`, {}, authHeader());
      setVents(vents.map(v =>
        v._id === ventId ? { ...v, Likes: res.data.Likes } : v
      ));
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to like the post.');
    }
  };

  const handleReport = async (ventId) => {
    try {
      const res = await axios.put(`${BASE_URL}/vents/${ventId}/report`, {}, authHeader());
      setVents(vents.map(v =>
        v._id === ventId ? { ...v, Reports: res.data.Reports } : v
      ));
    } catch (error) {
      toast.error(error.response?.data?.message || 'Already reported or failed to report.');
    }
  };

  const handleSubmit = async (values, { resetForm }) => {
    try {
      await axios.post(`${BASE_URL}/vents`, values, authHeader());
      toast.success('Vent posted anonymously');
      fetchAllVents();
      resetForm();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to post vent.');
    }
  };

  const handleDelete = async (ventId) => {
    try {
      await axios.delete(`${BASE_URL}/vents/${ventId}`, authHeader());
      toast.success('Vent deleted successfully');
      fetchAllVents();
    } catch (err) {
      toast.error('Failed to delete vent.');
    }
  };

  const validationSchema = Yup.object({
    Topic: Yup.string().max(10, 'Max 10 characters').required('Topic is required'),
    Content: Yup.string().min(10, 'Minimum 10 characters').required('Content is required'),
  });

  return (
    <>
      <Container
        className="position-relative"
        style={{
          background: 'transparent',
          backgroundColor: 'rgba(255, 255, 255, 0.9)',
          backdropFilter: 'blur(4px)',
          borderRadius: '20px',
          padding: '2rem',
          boxShadow: '0 0 10px rgba(0,0,0,0.1)',
        }}>

        <h2 className="text-center mb-4">Anonymous Community Vent Wall</h2>

        <Formik
          initialValues={{ Topic: '', Content: '' }}
          validationSchema={validationSchema}
          onSubmit={handleSubmit}
        >
          {({ handleSubmit, isSubmitting }) => (
            <FormikForm onSubmit={handleSubmit}>
              <Row className="mb-3">
                <Col md={4}>
                  <Form.Group>
                    <Form.Label>Topic</Form.Label>
                    <Field name="Topic" className="form-control" />
                    <div className="text-danger small"><ErrorMessage name="Topic" /></div>
                  </Form.Group>
                </Col>
                <Col md={8}>
                  <Form.Group>
                    <Form.Label>Content</Form.Label>
                    <Field as="textarea" name="Content" className="form-control" rows={2} />
                    <div className="text-danger small"><ErrorMessage name="Content" /></div>
                  </Form.Group>
                </Col>
              </Row>
              <div className="text-end">
                <Button type="submit" disabled={isSubmitting}>Post Vent</Button>
              </div>
            </FormikForm>
          )}
        </Formik>

        <hr className="my-4" />
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h4 className="mb-3">All Anonymous Vents</h4>
          <Button variant="secondary" className='mb-3' onClick={() => {
            const filtered = vents.filter(v => (v.StudentId?._id || v.StudentId) === currentUserId);
            setMyVents(filtered);
            setShowMyVentsModal(true);
          }}>
            View My Vents
          </Button>
        </div>

        {loading ? (
          <div className="text-center"><Spinner animation="border" /></div>
        ) : vents.length === 0 ? (
          <p>No vents yet.</p>
        ) : (
          vents.map((vent) => (
            <Card key={vent._id} className="mb-3 shadow-sm border-0">
              <Card.Body>
                <Card.Title className="text-capitalize">{vent.Topic}</Card.Title>
                <Card.Text>{vent.Content}</Card.Text>

                <div className="d-flex justify-content-between align-items-center mt-2">
                  <div className="text-muted small">
                    Posted anonymously • {new Date(vent.createdAt).toLocaleString()}
                  </div>

                  <div className="d-flex gap-2 align-items-center">
                    <Button
                      size="sm"
                      variant='outline-dark'
                      onClick={() => handleLike(vent._id)}
                    >
                      {vent.Likes?.some(id => id === currentUserId) ? '❤️' : '🤍'} {vent.Likes?.length || 0}
                    </Button>
                    <Button
                      size="sm"
                      variant='outline-dark'
                      onClick={() => handleReport(vent._id)}
                    >
                      {vent.Reports?.some(id => id === currentUserId) ? '🚩' : '🏳️'} {vent.Reports?.length || 0}
                    </Button>
                    {(vent.StudentId?._id || vent.StudentId)?.toString() === currentUserId && (
                      <Button
                        size="sm"
                        variant="outline-dark"
                        onClick={() => {
                          setVentToDelete(vent._id);
                          setIsMyVentDelete(false);
                          setShowConfirm(true);
                        }}
                      >
                        ❌
                      </Button>
                    )}
                  </div>
                </div>
              </Card.Body>
            </Card>
          ))
        )}
      </Container>

      <ConfirmModal
        show={showConfirm}
        onHide={() => setShowConfirm(false)}
        onConfirm={async () => {
          if (!ventToDelete) return;
          await handleDelete(ventToDelete);

          if (isMyVentDelete) {
            setMyVents(prev => prev.filter(v => v._id !== ventToDelete));
            setIsMyVentDelete(false);
          }

          setVentToDelete(null);
          setShowConfirm(false);
        }}
        message="Are you sure you want to delete this vent?"
        darkMode={isMyVentDelete}
      />

      <Modal show={showMyVentsModal} onHide={() => setShowMyVentsModal(false)} centered size="lg">
        <Modal.Header closeButton>
          <Modal.Title>My Vents</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {myVents.length === 0 ? (
            <p>You haven't posted any vents yet.</p>
          ) : (
            myVents.map((vent) => (
              <Card key={vent._id} className="mb-3 shadow-sm border-0">
                <Card.Body>
                  <Card.Title className="text-capitalize">{vent.Topic}</Card.Title>
                  <Card.Text>{vent.Content}</Card.Text>
                  <div className="text-muted small">
                    Posted on {new Date(vent.createdAt).toLocaleString()}
                  </div>
                  <div className="mt-2 text-end">
                    <Button
                      size="sm"
                      variant="outline-danger"
                      onClick={() => {
                        // handleDelete(vent._id);
                        // setMyVents(myVents.filter(v => v._id !== vent._id));
                        setVentToDelete(vent._id);
                        setIsMyVentDelete(true); // Set context
                        setShowConfirm(true);
                      }}
                    >
                      Delete
                    </Button>
                  </div>
                </Card.Body>
              </Card>
            ))
          )}
        </Modal.Body>
      </Modal>
    </>
  );
};

export default VentWall;