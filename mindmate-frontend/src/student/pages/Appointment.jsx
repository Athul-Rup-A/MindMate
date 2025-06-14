import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate, useParams } from 'react-router-dom';
import { Container, Table, Button, Modal, Form, Spinner } from 'react-bootstrap';
import authHeader from '../../config/authHeader';

import { Formik, Form as FormikForm, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';

import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import CustomTable from '../components/CustomTable';
import GoHomeButton from '../components/GoHomeButton';

const Appointment = () => {
  const { id: counselorPsychologistIdFromURL } = useParams();
  const navigate = useNavigate();

  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [refresh, setRefresh] = useState(false);
  const [filterOption, setFilterOption] = useState('all');
  const [fromCounselorPsychologistCard, setFromCounselorPsychologistCard] = useState(!!counselorPsychologistIdFromURL);

  const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/students';

  const fetchAppointments = async () => {
    try {
      const res = await axios.get(`${BASE_URL}/appointments`, authHeader());
      setAppointments(res.data);
    } catch (err) {
      console.error(err);
      toast.error('Failed to fetch appointments');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAppointments();
  }, [refresh]);

  useEffect(() => {
    if (counselorPsychologistIdFromURL) {
      setShowModal(true);
    }
  }, [counselorPsychologistIdFromURL]);

  const validationSchema = Yup.object().shape({
    CounselorPsychologistId: Yup.string().required('Counselor ID is required'),
    SlotDate: Yup.date()
      .required('Date is required')
      .min(new Date(new Date().setHours(0, 0, 0, 0)), 'Date cannot be in the past'),
    SlotStartTime: Yup.string().required('Start time is required'),

    SlotEndTime: Yup.string()
      .required('End time is required')
      .test('is-after-start', 'End time must be after start time', function (endTime) {
        const { SlotStartTime } = this.parent;
        if (!SlotStartTime || !endTime) return true;

        // Parse times into minutes from midnight
        const [startH, startM] = SlotStartTime.split(':').map(Number);
        const [endH, endM] = endTime.split(':').map(Number);

        const startMinutes = startH * 60 + startM;
        const endMinutes = endH * 60 + endM;

        // If endMinutes <= startMinutes, assume end is next day
        const adjustedEndMinutes = endMinutes <= startMinutes ? endMinutes + 24 * 60 : endMinutes;

        return adjustedEndMinutes > startMinutes;
      })
      .test('max-one-hour', 'Appointment duration must not exceed 1 hour', function (endTime) {
        const { SlotStartTime } = this.parent;
        if (!SlotStartTime || !endTime) return true;

        const [startH, startM] = SlotStartTime.split(':').map(Number);
        const [endH, endM] = endTime.split(':').map(Number);

        const startMinutes = startH * 60 + startM;
        const endMinutes = endH * 60 + endM;

        // Adjust for crossing midnight
        const adjustedEndMinutes = endMinutes <= startMinutes ? endMinutes + 24 * 60 : endMinutes;

        const diff = adjustedEndMinutes - startMinutes;
        return diff <= 60;
      }),

  });

  // Filter appointments based on selected option
  const filteredAppointments = appointments.filter((app) => {
    const now = new Date();
    const appDate = new Date(app.SlotDate);

    switch (filterOption) {
      case 'today':
        return (
          appDate.getDate() === now.getDate() &&
          appDate.getMonth() === now.getMonth() &&
          appDate.getFullYear() === now.getFullYear()
        );
      case 'week': {
        const startOfWeek = new Date(now);
        startOfWeek.setDate(now.getDate() - now.getDay());
        const endOfWeek = new Date(startOfWeek);
        endOfWeek.setDate(startOfWeek.getDate() + 6);
        return appDate >= startOfWeek && appDate <= endOfWeek;
      }
      case 'month':
        return appDate.getMonth() === now.getMonth() && appDate.getFullYear() === now.getFullYear();
      case 'pending':
      case 'completed':
        return app.Status === filterOption;
      case 'all':
      default:
        return true;
    }
  });

  const handleCancel = async (id) => {
    try {
      await axios.delete(`${BASE_URL}/appointments/${id}`, authHeader());
      toast.success('Appointment canceled');
      setRefresh((prev) => !prev);
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || 'Failed to cancel appointment');
    }
  };

  const handleSubmit = async (values, { setSubmitting, resetForm }) => {
    try {
      await axios.post(`${BASE_URL}/appointments`, values, authHeader());
      toast.success('Appointment created successfully');
      setShowModal(false);
      navigate('/appointments');
      setFromCounselorPsychologistCard(false);
      resetForm();
      setRefresh((prev) => !prev);
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || 'Failed to create appointment');
    } finally {
      setSubmitting(false);
    }
  };

  const columns = [
    {
      header: 'Counselor/Psychologist',
      accessor: 'CounselorPsychologistId',
    },
    {
      header: 'Date',
      accessor: (item) => new Date(item.SlotDate).toLocaleDateString(),
    },
    {
      header: 'Start Time',
      accessor: 'SlotStartTime',
    },
    {
      header: 'End Time',
      accessor: 'SlotEndTime',
    },
    {
      header: 'Status',
      accessor: (item) => item.Status.charAt(0).toUpperCase() + item.Status.slice(1),
    },
  ];

  const actions = [
    {
      label: 'Cancel',
      variant: 'danger',
      onClick: (item) => handleCancel(item._id),
      show: (item) => item.Status === 'pending', // Only show cancel if status is pending
    },
  ];

  return (
    <div
      style={{
        background: 'linear-gradient(to right, #c8a2c8, #a2c2f3)',
        minHeight: '100vh',
        paddingTop: '20px',
      }}
    > <Container
      className="mt-4">
        <ToastContainer position="top-right" autoClose={3000} />

        <div className="d-flex flex-wrap justify-content-between align-items-center gap-2 mb-3">
          <Form.Select
            style={{ width: '220px' }}
            value={filterOption}
            onChange={(e) => setFilterOption(e.target.value)}
            aria-label="Filter appointments"
          >
            <option value="all">All</option>
            <option value="today">Date – Today</option>
            <option value="week">Date – This Week</option>
            <option value="month">Date – This Month</option>
            <option value="pending">Pending</option>
            <option value="completed">Completed</option>
          </Form.Select>

          <GoHomeButton />

        </div>

        <div className="p-4 bg-light rounded shadow-sm mb-4">
          <h4 className="mb-3">My Appointments</h4>

          {loading ? (
            <Spinner animation="border" />
          ) : (
            <>
              <CustomTable
                columns={columns}
                data={filteredAppointments}
                actions={actions}
                rowKey={(item) => item._id}
              />
            </>
          )}
        </div>

        <Modal show={showModal} onHide={() => setShowModal(false)} centered>
          <Modal.Header closeButton>
            <Modal.Title>Book Appointment</Modal.Title>
          </Modal.Header>

          <Formik
            key={fromCounselorPsychologistCard ? counselorPsychologistIdFromURL : 'new'}
            initialValues={{
              CounselorPsychologistId: fromCounselorPsychologistCard ? counselorPsychologistIdFromURL : '',
              SlotDate: '',
              SlotStartTime: '',
              SlotEndTime: '',
            }}
            validationSchema={validationSchema}
            onSubmit={handleSubmit}
            enableReinitialize
          >
            {({ handleSubmit, isSubmitting, values, setFieldValue }) => (
              <FormikForm onSubmit={handleSubmit}>
                <Modal.Body>
                  <Form.Group className="mb-3" controlId="counselorPsychologistId">
                    <Form.Label>Counselor/Psychologist ID</Form.Label>
                    <Field
                      name="CounselorPsychologistId"
                      type="text"
                      className="form-control"
                      readOnly={!!fromCounselorPsychologistCard}
                      value={values.CounselorPsychologistId}
                      onChange={(e) => setFieldValue('CounselorPsychologistId', e.target.value)}
                    />
                    <div className="text-danger small mt-1">
                      <ErrorMessage name="CounselorPsychologistId" />
                    </div>
                  </Form.Group>

                  <Form.Group className="mb-3" controlId="slotDate">
                    <Form.Label>Date</Form.Label>
                    <Field
                      name="SlotDate"
                      type="date"
                      className="form-control"
                      value={values.SlotDate}
                      onChange={(e) => setFieldValue('SlotDate', e.target.value)}
                    />
                    <div className="text-danger small mt-1">
                      <ErrorMessage name="SlotDate" />
                    </div>
                  </Form.Group>

                  <Form.Group className="mb-3" controlId="slotStartTime">
                    <Form.Label>Start Time (HH:mm)</Form.Label>
                    <Field
                      name="SlotStartTime"
                      type="time"
                      className="form-control"
                      value={values.SlotStartTime}
                      onChange={(e) => setFieldValue('SlotStartTime', e.target.value)}
                    />
                    <div className="text-danger small mt-1">
                      <ErrorMessage name="SlotStartTime" />
                    </div>
                  </Form.Group>

                  <Form.Group className="mb-3" controlId="slotEndTime">
                    <Form.Label>End Time (HH:mm)</Form.Label>
                    <Field
                      name="SlotEndTime"
                      type="time"
                      className="form-control"
                      value={values.SlotEndTime}
                      onChange={(e) => setFieldValue('SlotEndTime', e.target.value)}
                    />
                    <div className="text-danger small mt-1">
                      <ErrorMessage name="SlotEndTime" />
                    </div>
                  </Form.Group>
                </Modal.Body>

                <Modal.Footer>
                  <Button variant="success" type="submit" disabled={isSubmitting}>
                    {isSubmitting ? 'Submitting...' : 'Submit'}
                  </Button>
                  <Button variant="secondary" onClick={() => setShowModal(false)} disabled={isSubmitting}>
                    Cancel
                  </Button>
                </Modal.Footer>
              </FormikForm>
            )}
          </Formik>
        </Modal>
      </Container>
    </div>
  );
};

export default Appointment;