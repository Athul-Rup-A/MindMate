import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Container, Row, Col, Card, Button, Modal, Form } from 'react-bootstrap';
import { toast } from 'react-toastify';
import { Formik, Field } from 'formik';
import * as Yup from 'yup';
import authHeader from '../../config/authHeader';
import { useNavigate } from 'react-router-dom';
import GoHomeButton from '../../components/GoHomeButton';

const BASE_URL = 'http://localhost:5000/api/students';

const ResourceSchema = Yup.object().shape({
    language: Yup.string().optional(),
});

const Resource = () => {
    const [resources, setResources] = useState([]);
    const [allResources, setAllResources] = useState([]);
    const [filteredResources, setFilteredResources] = useState([]);
    const [selectedType, setSelectedType] = useState('');
    const [selected, setSelected] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const navigate = useNavigate();

    const fetchResources = async () => {
        try {
            const res = await axios.get(`${BASE_URL}/resources`, authHeader());
            setResources(res.data);
            setAllResources(res.data);
            setFilteredResources(res.data);
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

    const filterResources = (type, language) => {
        const filtered = allResources.filter((r) => {
            return (
                (!type || r.type === type) &&
                (!language || r.language === language)
            );
        });
        setFilteredResources(filtered);
    };

    const handleTypeChange = (e, setFieldValue, language) => {
        const selected = e.target.value;
        setSelectedType(selected);
        filterResources(selected, language);
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

                <GoHomeButton variant='outline-light' />

                <h2 className="text-center text-white mb-4">Mental Health Resources</h2>

                <Formik
                    initialValues={{ language: '' }}
                    validationSchema={ResourceSchema}
                    onSubmit={() => { }}
                >
                    {({ values, setFieldValue }) => (
                        <div className="mb-4 d-flex justify-content-center gap-3 flex-wrap">

                            {/* Language Dropdown */}
                            <Field
                                as="select"
                                name="language"
                                className="form-control w-25"
                                onChange={(e) => {
                                    setFieldValue('language', e.target.value);
                                    filterResources(selectedType, e.target.value);
                                }}
                            >
                                <option value="">All Languages</option>
                                <option value="English">English</option>
                                <option value="Hindi">Hindi</option>
                                <option value="Tamil">Tamil</option>
                                <option value="Malayalam">Malayalam</option>
                            </Field>

                            {/* Type Dropdown */}
                            <Form.Select
                                value={selectedType}
                                className="form-control w-25"
                                onChange={(e) => handleTypeChange(e, setFieldValue, values.language)}
                            >
                                <option value="">All Types</option>
                                <option value="video">Video</option>
                                <option value="article">Article</option>
                                <option value="podcast">Podcast</option>
                                <option value="guide">Guide</option>
                            </Form.Select>
                        </div>
                    )}
                </Formik>

                <Row>
                    {filteredResources.length === 0 ? (
                        <p className="text-center text-white">No resources found for selected filters.</p>
                    ) : (
                        filteredResources.map((res, idx) => (
                            <Col md={4} key={idx} className="mb-4">
                                <Card className="shadow-sm h-100">
                                    <Card.Body>
                                        <Card.Title>{res.title}</Card.Title>
                                        <Card.Subtitle className="mb-2 text-muted">
                                            {res.type} ({res.language})
                                        </Card.Subtitle>
                                        <Card.Text>
                                            Tags: {res.tags?.join(', ') || 'None'}
                                        </Card.Text>
                                        <Button variant="primary" onClick={() => fetchSingleResource(res._id)}>
                                            View Resource
                                        </Button>
                                    </Card.Body>
                                </Card>
                            </Col>
                        ))
                    )}
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