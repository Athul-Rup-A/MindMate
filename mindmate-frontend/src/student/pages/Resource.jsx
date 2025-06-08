import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Container, Row, Col, Card, Button, Modal } from 'react-bootstrap';
import { toast } from 'react-toastify';
import { Formik, Form, Field } from 'formik';
import * as Yup from 'yup';
import authHeader from '../../config/authHeader';
import 'react-toastify/dist/ReactToastify.css';
import { useNavigate } from 'react-router-dom';

const BASE_URL = 'http://localhost:5000/api/students';

const ResourceSchema = Yup.object().shape({
    language: Yup.string().optional(),
    type: Yup.string().optional(),
});

const Resource = () => {
    const [resources, setResources] = useState([]);
    const [allResources, setAllResources] = useState([]);
    const [selected, setSelected] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const navigate = useNavigate();

    const fetchResources = async () => {
        try {
            const res = await axios.get(`${BASE_URL}/resources`, authHeader());
            setResources(res.data);
            setAllResources(res.data); // store the full unfiltered list
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to load resources');
        }
    };

    const fetchSingleResource = async (id) => {
        try {
            const res = await axios.get(`${BASE_URL}/resources/${id}`, authHeader());
            setSelected(res.data);
            setShowModal(true);
        } catch (error) {
            toast.error('Could not fetch resource details');
        }
    };

    useEffect(() => {
        fetchResources();
    }, []);

    return (
        <div
            style={{
                background: 'linear-gradient(to right, #87CEEB, #001F54)',
                minHeight: '100vh',
                padding: '2rem',
            }}
        >
            <Container>
                <div className="d-flex justify-content-end mb-3">
                    <Button variant="outline-light" onClick={() => navigate('/home')}>Home</Button>
                </div>
                <h2 className="text-center text-white mb-4">Mental Health Resources</h2>

                <Formik
                    initialValues={{ language: '', type: '' }}
                    validationSchema={ResourceSchema}
                    onSubmit={(values) => {
                        const filtered = allResources.filter((r) => {
                            return (
                                (!values.language || r.language === values.language) &&
                                (!values.type || r.type === values.type)
                            );
                        });
                        setResources(filtered);
                    }}
                >
                    {() => (
                        <Form className="mb-4 d-flex justify-content-center gap-3">
                            <Field as="select" name="language" className="form-control w-25">
                                <option value="">All Languages</option>
                                <option value="English">English</option>
                                <option value="Hindi">Hindi</option>
                                <option value="Tamil">Tamil</option>
                                <option value="Malayalam">Malayalam</option>
                            </Field>

                            <Field as="select" name="type" className="form-control w-25">
                                <option value="">All Types</option>
                                <option value="video">Video</option>
                                <option value="article">Article</option>
                                <option value="podcast">Podcast</option>
                                <option value="guide">Guide</option>
                            </Field>

                            <Button type="submit" variant="light">Filter</Button>
                        </Form>
                    )}
                </Formik>

                <Row>
                    {resources.map((res, idx) => (
                        <Col md={4} key={idx} className="mb-4">
                            <Card className="shadow-sm h-100">
                                <Card.Body>
                                    <Card.Title>{res.title}</Card.Title>
                                    <Card.Subtitle className="mb-2 text-muted">{res.type} ({res.language})</Card.Subtitle>
                                    <Card.Text>
                                        Tags: {res.tags?.join(', ') || 'None'}
                                    </Card.Text>
                                    <Button variant="primary" onClick={() => fetchSingleResource(res._id)}>
                                        View Resource
                                    </Button>
                                </Card.Body>
                            </Card>
                        </Col>
                    ))}
                </Row>

                {/* Modal */}
                <Modal show={showModal} onHide={() => setShowModal(false)} centered>
                    <Modal.Header closeButton>
                        <Modal.Title>{selected?.title}</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        <p><strong>Type:</strong> {selected?.type}</p>
                        <p><strong>Language:</strong> {selected?.language}</p>
                        <p><strong>Tags:</strong> {selected?.tags?.join(', ') || 'None'}</p>
                        <a href={selected?.link} target="_blank" rel="noreferrer" className="btn btn-info w-100">
                            Open Resource
                        </a>
                    </Modal.Body>
                </Modal>
            </Container>
        </div>
    );
};

export default Resource;