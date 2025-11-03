import React, { useEffect, useState } from 'react';
import axios from '../../config/axios';
import { toast } from 'react-toastify';
import { Container, Card, Spinner, Form } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import ConfirmModal from '../../components/ConfirmModal';

const statusOptions = ['confirmed', 'rejected', 'completed'];

const Appointment = () => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState(null);

  const [counselorId, setCounselorId] = useState('');

  const [showModal, setShowModal] = useState(false);
  const [selectedAppointmentId, setSelectedAppointmentId] = useState(null);

  const [showReasonModal, setShowReasonModal] = useState(false);
  const [statusToUpdate, setStatusToUpdate] = useState('');
  const [reasonInput, setReasonInput] = useState('');

  const formatFullDateWithDay = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-GB', {
      weekday: 'long',
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    });
  };

  const fetchAppointments = async () => {
    try {
      const res = await axios.get('counselorPsychologist/appointments');
      setAppointments(res.data);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to fetch appointments');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAppointments();
  }, []);

  const handleStatusChange = async (appointmentId, newStatus, reason = '') => {
    try {
      setUpdatingId(appointmentId);
      await axios.put(`counselorPsychologist/appointments/${appointmentId}/status`, { status: newStatus, reason });
      toast.success('Appointment status updated');
      fetchAppointments();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update status');
    } finally {
      setUpdatingId(null);
    }
  };

  useEffect(() => {
    const fetchCounselorId = async () => {
      try {
        const res = await axios.get('counselorPsychologist/profile');
        setCounselorId(res.data._id);
      } catch (err) {
        console.error('Failed to fetch counselor ID');
      }
    };

    fetchCounselorId();
  }, []);

  return (
    <Container>
      <Card
        style={{
          background: 'transparent',
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(255, 255, 255, 0.2)'
        }}
        className="p-4 shadow-lg rounded-4">
        <h4 className="fw-bold text-dark text-center mb-4">Your Appointments</h4>

        {loading ? (
          <div className="text-center">
            <Spinner animation="border" />
          </div>
        ) : (
          <div className="row row-cols-1 row-cols-md-2 g-4">
            {appointments.map((item, idx) => {
              return (
                <div className="col" key={item._id}>
                  <Card className="p-3 shadow-sm border-0" style={{ backgroundColor: 'rgba(255,255,255,0.5)' }}>
                    <Card.Body>
                      <Card.Title className="fw-bold text-primary">
                        Appointment #{idx + 1}
                      </Card.Title>
                      <p><strong>Student:</strong> {item.StudentId?.Username || 'N/A'}</p>
                      <p><strong>Day & Date:</strong> {formatFullDateWithDay(item.SlotDate)}</p>
                      <p><strong>Start Time:</strong> {item.SlotStartTime}</p>
                      <p><strong>End Time:</strong> {item.SlotEndTime}</p>
                      <Form.Group>
                        <Form.Label className="fw-semibold">Status</Form.Label>
                        <Form.Select
                          size="sm"
                          className='w-50'
                          value={item.Status || 'pending'}
                          onChange={(e) => {
                            const newStatus = e.target.value;
                            if (newStatus === 'completed') {
                              setSelectedAppointmentId(item._id);
                              setShowModal(true);
                            } else if (newStatus === 'rejected') {
                              setSelectedAppointmentId(item._id);
                              setStatusToUpdate(newStatus);
                              setShowReasonModal(true);
                            } else if (newStatus === 'confirmed') {
                              handleStatusChange(item._id, newStatus);
                            }
                          }}
                          disabled={updatingId === item._id || item.Status === 'completed'}
                        >
                          <option value="pending" disabled>pending</option>
                          {statusOptions.map((s) => (
                            <option key={s} value={s}>{s}</option>
                          ))}
                        </Form.Select>
                      </Form.Group>
                      <Link to={`/video/counselor/${counselorId}/${item.StudentId._id}`}>
                        <button className="btn btn-sm btn-success mt-3"
                          onClick={() => {
                            localStorage.setItem("lastCounselorId", counselorId);
                          }}>
                          Start Video Call
                        </button>
                      </Link>
                    </Card.Body>
                  </Card>
                </div>
              )
            })}
          </div>
        )}
      </Card>

      <ConfirmModal
        show={showModal}
        onHide={() => {
          setShowModal(false);
          setSelectedAppointmentId(null);
        }}
        onConfirm={async () => {
          if (selectedAppointmentId) {
            await handleStatusChange(selectedAppointmentId, 'completed');
            setShowModal(false);
            setSelectedAppointmentId(null);
          }
        }}
        message="Are you sure you want to mark this appointment as completed? This action cannot be undone."
      />

      <ConfirmModal
        show={showReasonModal}
        onHide={() => {
          setShowReasonModal(false);
          setReasonInput('');
          setSelectedAppointmentId(null);
        }}
        onConfirm={async () => {
          if (!reasonInput.trim()) {
            toast.error('Please enter a reason.');
            return;
          }
          await handleStatusChange(selectedAppointmentId, statusToUpdate, reasonInput);
          setShowReasonModal(false);
          setReasonInput('');
          setSelectedAppointmentId(null);
        }}
        message={
          <div>
            <p>Please provide a reason for {statusToUpdate} the appointment:</p>
            <textarea
              className="form-control"
              value={reasonInput}
              onChange={(e) => setReasonInput(e.target.value)}
            />
          </div>
        }
      />

    </Container>
  );
};

export default Appointment;