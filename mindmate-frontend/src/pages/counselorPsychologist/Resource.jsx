import React, { useEffect, useState } from 'react';
import { Container, Button, Modal, Spinner, Form, Card } from 'react-bootstrap';
import { Formik, Field, Form as FormikForm, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import axios from '../../config/axios';
import CustomTable from '../../components/CustomTable';
import CouncPsychHome from '../../components/CouncPsychHome';
import { toast } from 'react-toastify';

const allowedTypes = ['video', 'article', 'podcast', 'guide'];
const allowedLanguages = ['English', 'Hindi', 'Tamil', 'Malayalam'];
const allowedTags = ['anxiety', 'study', 'sleep'];

const validationSchema = Yup.object().shape({
    title: Yup.string().required('Title is required'),
    type: Yup.string().oneOf(allowedTypes).required('Type is required'),
    language: Yup.string().oneOf(allowedLanguages).required('Language is required'),
    link: Yup.string().url('Invalid URL format').required('Link is required'),
    tags: Yup.array().of(Yup.string().oneOf(allowedTags))
});

const Resource = () => {
    const [resources, setResources] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingResource, setEditingResource] = useState(null);

    const fetchResources = async () => {
        try {
            const res = await axios.get('counselorpsychologist/resources');
            setResources(res.data);
        } catch (err) {
            toast.error(err?.response?.data?.error || 'Failed to fetch resources');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchResources();
    }, []);

    const handleSubmit = async (values, { resetForm }) => {
        try {
            if (editingResource) {

                const isUnchanged =
                    editingResource.title === values.title &&
                    editingResource.type === values.type &&
                    editingResource.language === values.language &&
                    editingResource.link === values.link &&
                    JSON.stringify(editingResource.tags.sort()) === JSON.stringify(values.tags.sort());

                if (isUnchanged) {
                    toast.info('No changes made');
                    setShowModal(false);
                    setEditingResource(null);
                    return;
                }

                await axios.put(`counselorpsychologist/resources/${editingResource._id}`, values);
                toast.success('Resource updated successfully');
            } else {
                await axios.post('counselorpsychologist/resources', values);
                toast.success('Resource added successfully');
            }
            fetchResources();
            resetForm();
            setShowModal(false);
            setEditingResource(null);
        } catch (err) {
            toast.error(err?.response?.data?.error || 'Failed to save resource');
        }
    };

    const handleEdit = (resource) => {
        setEditingResource(resource);
        setShowModal(true);
    };

    const handleDelete = async (id) => {
        try {
            await axios.delete(`counselorpsychologist/resources/${id}`);
            toast.success('Resource deleted successfully');
            fetchResources();
        } catch (err) {
            toast.error(err?.response?.data?.error || 'Delete failed');
        }
    };

    const columns = [
        { header: 'Title', accessor: 'title' },
        { header: 'Type', accessor: 'type' },
        { header: 'Language', accessor: 'language' },
        { header: 'Link', accessor: (item) => <a href={item.link} target="_blank" rel="noopener noreferrer">Open</a> },
        { header: 'Tags', accessor: (item) => item.tags?.join(', ') || '-' }
    ];

    const actions = [
        {
            label: 'Edit',
            variant: 'warning',
            onClick: (item) => handleEdit(item)
        },
        {
            label: 'Delete',
            variant: 'danger',
            onClick: (item) => handleDelete(item._id)
        }
    ];

    return (
        <div
            style={{
                background: 'linear-gradient(to right, #a1c4fd, #c2e9fb)',
                minHeight: '100vh',
                paddingTop: '30px',
                paddingBottom: '30px'
            }}
        >
            <Container style={{ maxWidth: '1300px' }}>
                <CouncPsychHome />

                <Card className="p-4 shadow-lg rounded-4 mb-4">
                    <h3 className="text-center fw-bold text-primary mb-1">Manage Resources</h3>

                    <div className="text-end mb-3">
                        <Button onClick={() => { setShowModal(true); setEditingResource(null); }}>
                            Add Resource
                        </Button>
                    </div>

                    {loading ? (
                        <div className="text-center"><Spinner animation="border" variant="primary" /></div>
                    ) : (
                        <CustomTable
                            columns={columns}
                            data={resources}
                            actions={actions}
                            rowKey={(item) => item._id}
                        />
                    )}
                </Card>

                {/* Modal */}
                <Modal show={showModal} onHide={() => setShowModal(false)} centered>
                    <Modal.Header closeButton>
                        <Modal.Title>{editingResource ? 'Edit Resource' : 'Add Resource'}</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        <Formik
                            initialValues={{
                                title: editingResource?.title || '',
                                type: editingResource?.type || '',
                                language: editingResource?.language || '',
                                link: editingResource?.link || '',
                                tags: editingResource?.tags || []
                            }}
                            validationSchema={validationSchema}
                            onSubmit={handleSubmit}
                        >
                            {({ values, handleChange }) => (
                                <FormikForm>
                                    <Form.Group className="mb-3">
                                        <Form.Label>Title</Form.Label>
                                        <Field name="title" as={Form.Control} placeholder="Enter title" />
                                        <ErrorMessage name="title" component="div" className="text-danger small" />
                                    </Form.Group>

                                    <Form.Group className="mb-3">
                                        <Form.Label>Type</Form.Label>
                                        <Field as="select" name="type" className="form-select">
                                            <option value="">Select type</option>
                                            {allowedTypes.map(type => <option key={type} value={type}>{type}</option>)}
                                        </Field>
                                        <ErrorMessage name="type" component="div" className="text-danger small" />
                                    </Form.Group>

                                    <Form.Group className="mb-3">
                                        <Form.Label>Language</Form.Label>
                                        <Field as="select" name="language" className="form-select">
                                            <option value="">Select language</option>
                                            {allowedLanguages.map(lang => <option key={lang} value={lang}>{lang}</option>)}
                                        </Field>
                                        <ErrorMessage name="language" component="div" className="text-danger small" />
                                    </Form.Group>

                                    <Form.Group className="mb-3">
                                        <Form.Label>Link</Form.Label>
                                        <Field name="link" as={Form.Control} placeholder="Enter resource link" />
                                        <ErrorMessage name="link" component="div" className="text-danger small" />
                                    </Form.Group>

                                    <Form.Group className="mb-3">
                                        <Form.Label>Tags</Form.Label>
                                        {allowedTags.map(tag => (
                                            <Form.Check
                                                key={tag}
                                                type="checkbox"
                                                label={tag}
                                                value={tag}
                                                checked={values.tags.includes(tag)}
                                                onChange={e => {
                                                    const checked = e.target.checked;
                                                    const val = e.target.value;
                                                    const updatedTags = checked
                                                        ? [...values.tags, val]
                                                        : values.tags.filter(t => t !== val);
                                                    handleChange({ target: { name: 'tags', value: updatedTags } });
                                                }}
                                            />
                                        ))}
                                        <ErrorMessage name="tags" component="div" className="text-danger small" />
                                    </Form.Group>

                                    <div className="text-end">
                                        <Button type="submit">{editingResource ? 'Update' : 'Create'}</Button>
                                    </div>
                                </FormikForm>
                            )}
                        </Formik>
                    </Modal.Body>
                </Modal>
            </Container>
        </div>
    );
};

export default Resource;