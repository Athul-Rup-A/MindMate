import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Container, Button, Form, Spinner, Row, Col, Card } from 'react-bootstrap';
import { Formik, Form as FormikForm, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { toast } from 'react-toastify';
import authHeader from '../../config/authHeader';
import Select from 'react-select';
import isToday from '../../Utils/isToday'

const Wellness = () => {
  const [moodEntries, setMoodEntries] = useState([]);
  const [habitLogs, setHabitLogs] = useState([]);
  const [loading, setLoading] = useState(false);

  const [editMoodIndex, setEditMoodIndex] = useState(null);
  const [editMoodValues, setEditMoodValues] = useState(null);

  const [editIndex, setEditIndex] = useState(null);
  const [editValues, setEditValues] = useState(null);

  const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/students';

  const validMoods = ['happy', 'sad', 'stressed', 'anxious', 'motivated'];
  const validTags = ['productive', 'positive', 'tired', 'focussed', 'lonely', 'social', 'bored', 'energetic'];

  useEffect(() => {
    fetchMoodEntries();
    fetchHabitLogs();
  }, []);

  const fetchMoodEntries = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${BASE_URL}/mood`, authHeader());
      const sorted = [...res.data].sort((a, b) => new Date(b.Date) - new Date(a.Date));
      setMoodEntries(sorted);
    } catch (err) {
      toast.error('Failed to fetch mood entries');
    } finally {
      setLoading(false);
    }
  };

  const fetchHabitLogs = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${BASE_URL}/habits`, authHeader());
      const sorted = [...res.data].sort((a, b) => new Date(b.Date) - new Date(a.Date));
      setHabitLogs(sorted);
    } catch (err) {
      toast.error('Failed to fetch habit logs');
    } finally {
      setLoading(false);
    }
  };

  const moodSchema = Yup.object().shape({
    Mood: Yup.string().oneOf(validMoods, 'Invalid mood').required('Mood is required'),
    Note: Yup.string(),
    Tags: Yup.array()
      .min(1, 'At least one tag is required')
      .of(Yup.string().oneOf(validTags, 'Invalid tag used'))
  });

  const habitSchema = Yup.object().shape({
    Exercise: Yup.boolean(),
    Hydration: Yup.number()
      .typeError('Hydration is required')
      .min(0, 'Min is 0')
      .max(10000, 'Max is 10000')
      .required('Hydration is required'),
    ScreenTime: Yup.number()
      .typeError('Screen Time is required')
      .min(0, 'Min is 0')
      .max(24, 'Max is 24')
      .required('Screen Time is required'),
    SleepHours: Yup.number()
      .typeError('Sleep Hours is required')
      .min(0, 'Min is 0')
      .max(24, 'Max is 24')
      .required('Sleep Hours is required'),
  });

  const handleMoodSubmit = async (values, { resetForm }) => {
    try {
      const formatted = {
        ...values
      };

      await axios.post(`${BASE_URL}/mood`, formatted, authHeader());
      toast.success('Mood added');
      fetchMoodEntries();
      resetForm();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to add mood');
      console.error(err);
    }
  };

  const handleDeleteMood = async (index) => {
    try {
      await axios.delete(`${BASE_URL}/mood/${index}`, authHeader());
      toast.success('Mood entry deleted');
      fetchMoodEntries();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete mood');
    }
  };

  const handleUpdateMood = async (values, index) => {
    try {
      const payload = {
        ...values,
        Tags: Array.isArray(values.Tags)
          ? values.Tags.map(tag => tag.trim()).filter(Boolean)
          : typeof values.Tags === 'string'
            ? values.Tags.split(',').map(tag => tag.trim()).filter(Boolean)
            : [],
      };

      await axios.put(`${BASE_URL}/mood/${index}`, payload, authHeader());
      toast.success('Mood updated');
      fetchMoodEntries();
      setEditMoodIndex(null);
      setEditMoodValues(null);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update mood');
    }
  };

  const handleHabitSubmit = async (values, { resetForm }) => {
    try {
      const payload = {
        Exercise: values.Exercise,
        Hydration: values.Hydration ? Number(values.Hydration) : 0,
        ScreenTime: values.ScreenTime ? Number(values.ScreenTime) : 0,
        SleepHours: values.SleepHours ? Number(values.SleepHours) : 0,
      };

      await axios.post(`${BASE_URL}/habits`, payload, authHeader());
      toast.success('Habit logged');
      fetchHabitLogs();
      resetForm();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to log habit');
      console.error(err);
    }
  };

  const handleUpdateHabit = async (values, index) => {
    try {
      await axios.put(`${BASE_URL}/habits/${index}`, values, authHeader());
      toast.success("Habit log updated");
      fetchHabitLogs();
    } catch (err) {
      toast.error(err.response?.data?.message || "Update failed");
    }
  };

  const handleDeleteHabit = async (index) => {
    try {
      await axios.delete(`${BASE_URL}/habits/${index}`, authHeader());
      toast.success("Habit log deleted");
      fetchHabitLogs();
    } catch (err) {
      toast.error(err.response?.data?.message || "Delete failed");
    }
  };

  return (
    <Container
      className="position-relative"
      style={{
        minHeight: '100vh',
        background: 'linear-gradient(to right, rgba(255,255,255,0.7), rgba(240,240,255,0.7))',
        backdropFilter: 'blur(10px)',
        padding: '2rem',
        borderRadius: '20px',
      }}
    >
      <div className="d-flex justify-content-center align-items-center mb-4">
        <h2>Wellness Tracker</h2>
      </div>

      <Row className="gx-4 align-items-stretch" style={{ minHeight: '100%' }}>

        {/* Mood Entry Form */}
        <Col md={6} className="d-flex flex-column h-100 gap-4" style={{ height: '100%' }}>
          <Card className="p-3 shadow-sm rounded-4 flex-grow-1 d-flex flex-column">
            <h4>Mood Entry</h4>
            <Formik
              initialValues={{ Mood: '', Note: '', Tags: [] }}
              validationSchema={moodSchema}
              onSubmit={handleMoodSubmit}
            >
              {({ isSubmitting, isValid, dirty }) => (
                <FormikForm>
                  <Form.Group className="mb-3 mt-2">
                    <Form.Label>Mood</Form.Label>
                    <Field as="select" name="Mood" className="form-control">
                      <option value="">Select Mood</option>
                      {validMoods.map((m) => (
                        <option key={m} value={m}>{m}</option>
                      ))}
                    </Field>
                    <ErrorMessage name="Mood" component="div" className="text-danger" />
                  </Form.Group>

                  <Form.Group className="mb-3">
                    <Form.Label>Tags</Form.Label>
                    <Field name="Tags">
                      {({ field, form }) => (
                        <Select
                          isMulti
                          options={validTags.map(tag => ({ label: tag, value: tag }))}
                          value={field.value.map(tag => ({ label: tag, value: tag }))}
                          onChange={(selected) =>
                            form.setFieldValue('Tags', selected.map(opt => opt.value))
                          }
                          onBlur={() => form.setFieldTouched('Tags', true)}
                        />
                      )}
                    </Field>
                    <ErrorMessage name="Tags" component="div" className="text-danger" />
                  </Form.Group>

                  <Form.Group className="mb-3">
                    <Form.Label>Note</Form.Label>
                    <Field name="Note" className="form-control" placeholder="Optional note" />
                  </Form.Group>

                  <Button
                    type="submit"
                    disabled={!dirty || !isValid || isSubmitting}
                    className="mt-2"
                  >
                    Add Mood
                  </Button>
                </FormikForm>
              )}
            </Formik>
          </Card>

          {/* Mood Entries Data */}
          <h5 className="mt-5">Mood Entries</h5>
          {loading ? (
            <Spinner animation="border" />
          ) : moodEntries.length === 0 ? (
            <p>No mood entries yet.</p>
          ) : (
            <div className="d-flex flex-column gap-3">
              {moodEntries.map((entry, idx) => (
                <Card key={idx} className="shadow-sm rounded-4 p-3">
                  <div className="d-flex justify-content-between align-items-start">
                    <div>
                      <h6 className="mb-1">Mood: {entry.Mood}</h6>
                      <small>
                        <p className="mb-1"><strong>Date: </strong>{new Date(entry.Date).toLocaleDateString()}</p>
                      </small>
                      <p className="mb-1"><strong>Tags:</strong> {entry.Tags?.join(', ') || 'None'}</p>
                      {entry.Note && (
                        <>
                          <p className="mb-1"><strong>Note:</strong></p>
                          <div
                            style={{
                              maxHeight: '80px',
                              overflowY: 'auto',
                              wordBreak: 'break-word',
                              backgroundColor: '#f8f9fa',
                              padding: '0.5rem',
                              borderRadius: '6px',
                              border: '1px solid #dee2e6',
                              width: '100%',
                            }}
                          >
                            <p className="mb-0" style={{ whiteSpace: 'pre-wrap' }}>{entry.Note}</p>
                          </div>
                        </>
                      )}
                    </div>
                    <div className="d-flex flex-column gap-2">
                      {isToday(entry.Date) && (
                        <Button size="sm" variant="warning" onClick={() => {
                          setEditMoodIndex(idx);
                          setEditMoodValues({
                            Mood: entry.Mood || '',
                            Note: entry.Note || '',
                            Tags: Array.isArray(entry.Tags) ? entry.Tags : [],
                          });
                        }}>
                          Edit
                        </Button>
                      )}
                      <Button size="sm" variant="danger" onClick={() => handleDeleteMood(idx)}>
                        Delete
                      </Button>
                    </div>
                  </div>
                  {editMoodIndex === idx && (
                    <Formik
                      enableReinitialize
                      initialValues={{
                        Mood: editMoodValues?.Mood || '',
                        Note: editMoodValues?.Note || '',
                        Tags: editMoodValues?.Tags || [],
                      }}
                      validationSchema={moodSchema}
                      onSubmit={(values, { resetForm }) => {
                        handleUpdateMood(values, idx);
                        setEditMoodIndex(null);
                        setEditMoodValues(null);
                        resetForm();
                      }}
                    >
                      {({ isSubmitting, dirty, isValid }) => (
                        <FormikForm className="mt-3 border-top pt-3">
                          <Row>
                            <Col md={4}>
                              <Form.Label>Mood</Form.Label>
                              <Field as="select" name="Mood" className="form-control">
                                <option value="">Select Mood</option>
                                {validMoods.map((m) => (
                                  <option key={m} value={m}>{m}</option>
                                ))}
                              </Field>
                              <ErrorMessage name="Mood" component="div" className="text-danger" />
                            </Col>
                            <Col md={4}>
                              <Form.Label>Tags</Form.Label>
                              <Field name="Tags">
                                {({ field, form }) => (
                                  <Select
                                    isMulti
                                    options={validTags.map(tag => ({ label: tag, value: tag }))}
                                    value={(form.values.Tags || []).map(tag => ({ label: tag, value: tag }))}
                                    onChange={(selectedOptions) => {
                                      const tags = selectedOptions.map(option => option.value);
                                      form.setFieldValue('Tags', tags);
                                    }}
                                    onBlur={() => form.setFieldTouched('Tags', true)}
                                  />
                                )}
                              </Field>
                              <ErrorMessage name="Tags" component="div" className="text-danger" />
                            </Col>
                            <Col md={4}>
                              <Form.Label>Note</Form.Label>
                              <Field name="Note" className="form-control" placeholder="Optional note" />
                              <div className="d-flex justify-content-end mt-2">
                                <Button type="submit" size="sm" variant="success" disabled={!dirty || !isValid || isSubmitting}>Update</Button>
                                <Button size="sm" variant="secondary" className="ms-2" onClick={() => setEditMoodIndex(null)}>Cancel</Button>
                              </div>
                            </Col>
                          </Row>
                        </FormikForm>
                      )}
                    </Formik>
                  )}
                </Card>
              ))}
            </div>
          )}

        </Col>

        {/* Habit Log Form */}
        <Col md={6} className="d-flex flex-column h-100 gap-4 mt-5 mt-md-0" style={{ height: '100%' }}>
          <Card className="p-3 shadow-sm rounded-4 flex-grow-1 d-flex flex-column">
            <h4>Habit Log</h4>
            <Formik
              initialValues={{ Exercise: false, Hydration: '', ScreenTime: '', SleepHours: '' }}
              validationSchema={habitSchema}
              onSubmit={handleHabitSubmit}
            >
              {({ isSubmitting, dirty, isValid }) => (
                <FormikForm>
                  <Form.Group className="mb-2 d-flex align-items-center gap-2">
                    <Field type="checkbox" name="Exercise" className="form-check-input" />
                    <Form.Label className="mb-0">Exercise</Form.Label>
                  </Form.Group>

                  <Form.Group className="mb-2">
                    <Form.Label>Hydration (ml)</Form.Label>
                    <Field
                      type="number"
                      name="Hydration"
                      className="form-control"
                      placeholder="Max 10000"
                    />
                    <ErrorMessage name="Hydration" component="div" className="text-danger" />
                  </Form.Group>

                  <Form.Group className="mb-2">
                    <Form.Label>Screen Time (hrs)</Form.Label>
                    <Field
                      type="number"
                      name="ScreenTime"
                      className="form-control"
                      placeholder="Max 24"
                    />
                    <ErrorMessage name="ScreenTime" component="div" className="text-danger" />
                  </Form.Group>

                  <Form.Group className="mb-2">
                    <Form.Label>Sleep Hours (hrs)</Form.Label>
                    <Field
                      type="number"
                      name="SleepHours"
                      className="form-control"
                      placeholder="Max 24"
                    />
                    <ErrorMessage name="SleepHours" component="div" className="text-danger" />
                  </Form.Group>

                  <Button
                    type="submit"
                    disabled={!dirty || !isValid || isSubmitting}
                    className="mt-2"
                  >
                    Log Habit
                  </Button>
                </FormikForm>
              )}
            </Formik>
          </Card>

          {/* Habit Logs Data */}
          <h5 className="mt-5">Habit Logs</h5>
          {loading ? (
            <Spinner animation="border" />
          ) : habitLogs.length === 0 ? (
            <p>No habit logs yet.</p>
          ) : (
            <div className="d-flex flex-column gap-3">
              {habitLogs.map((entry, idx) => (
                <Card key={idx} className="shadow-sm rounded-4 p-3">
                  <div className="d-flex justify-content-between align-items-start">
                    <div>
                      <h6 className="mb-1">Date: {new Date(entry.Date).toLocaleDateString()}</h6>
                      <p className="mb-1"><strong>Exercise:</strong> {entry.Exercise ? 'Yes' : 'No'}</p>
                      <p className="mb-1"><strong>Hydration:</strong> {entry.Hydration} ml</p>
                      <p className="mb-1"><strong>Screen Time:</strong> {entry.ScreenTime} hrs</p>
                      <p className="mb-1"><strong>Sleep Hours:</strong> {entry.SleepHours} hrs</p>
                    </div>
                    <div className="d-flex flex-column gap-2">
                      {isToday(entry.Date) && (
                        <Button size="sm" variant="warning" onClick={() => {
                          setEditIndex(idx);
                          setEditValues({
                            Exercise: entry.Exercise,
                            Hydration: entry.Hydration,
                            ScreenTime: entry.ScreenTime,
                            SleepHours: entry.SleepHours,
                          });
                        }}>
                          Edit
                        </Button>
                      )}
                      <Button size="sm" variant="danger" onClick={() => handleDeleteHabit(idx)}>
                        Delete
                      </Button>
                    </div>
                  </div>
                  {editIndex === idx && (
                    <Formik
                      enableReinitialize
                      initialValues={editValues}
                      validationSchema={habitSchema}
                      onSubmit={(values, { resetForm }) => {
                        handleUpdateHabit(values, editIndex);
                        setEditIndex(null);
                        setEditValues(null);
                        resetForm();
                      }}
                    >
                      {({ isSubmitting, dirty, isValid }) => (
                        <FormikForm className="mt-3 border-top pt-3">
                          <Row>
                            <Col md={2} className="d-flex align-items-center gap-2">
                              <Form.Label className="mb-0">Exercise</Form.Label>
                              <Field type="checkbox" name="Exercise" className="form-check-input" />
                            </Col>
                            <Col md={2}>
                              <Form.Label>Hydration</Form.Label>
                              <Field name="Hydration" className="form-control" type="number" />
                              <ErrorMessage name="Hydration" component="div" className="text-danger" />
                            </Col>
                            <Col md={2}>
                              <Form.Label>Screen Time</Form.Label>
                              <Field name="ScreenTime" className="form-control" type="number" />
                              <ErrorMessage name="ScreenTime" component="div" className="text-danger" />
                            </Col>
                            <Col md={2}>
                              <Form.Label>Sleep Hours</Form.Label>
                              <Field name="SleepHours" className="form-control" type="number" />
                              <ErrorMessage name="SleepHours" component="div" className="text-danger" />
                            </Col>
                            <Col md={4} className="d-flex align-items-end">
                              <Button type="submit" variant="success" disabled={!dirty || !isValid || isSubmitting}>Update</Button>
                              <Button variant="secondary" className="ms-2" onClick={() => setEditIndex(null)}>Cancel</Button>
                            </Col>
                          </Row>
                        </FormikForm>
                      )}
                    </Formik>
                  )}
                </Card>
              ))}
            </div>
          )}
        </Col>
      </Row>
    </Container>
  );
};

export default Wellness;