import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useLocation, useParams } from 'react-router-dom';
import { Container, Card, Form, Button, Spinner, Row, Col } from 'react-bootstrap';
import { toast } from 'react-toastify';
import authHeader from '../../config/authHeader';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import ConfirmModal from '../../components/ConfirmModal';

const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

const hours = Array.from({ length: 24 }, (_, i) => {
  const start = i.toString().padStart(2, '0') + ':00';
  const end = ((i + 1) % 24).toString().padStart(2, '0') + ':00';
  return { StartTime: start, EndTime: end, label: `${start} - ${end}` };
});

const Appointment = () => {
  const { id: counselorPsychologistId } = useParams();
  const location = useLocation();
  const state = location.state ?? {};
  const counselorName = state?.name || '';
  const passedAvailability = Array.isArray(state?.availability) ? state.availability : [];
  const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/students';

  const [selectedDay, setSelectedDay] = useState(null);
  const [availability, setAvailability] = useState(
    Array.isArray(passedAvailability) ? passedAvailability : []
  );
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [booking, setBooking] = useState(false);
  const [failedSlots, setFailedSlots] = useState([]);

  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [appointmentToCancel, setAppointmentToCancel] = useState(null);

  const fetchAppointments = async () => {
    try {
      const res = await axios.get(`${BASE_URL}/appointments`, authHeader());
      setAppointments(res.data);
    } catch (err) {
      toast.error('Failed to load appointments');
    } finally {
      setLoading(false);
    }
  };

  if (!passedAvailability) {
    toast.error('Availability not provided. Please go back and select a counselor again.');
  };

  const showBookingSection = state && state.name && passedAvailability.length > 0;

  useEffect(() => {
    fetchAppointments();
  }, [counselorPsychologistId]);

  const isSlotAvailable = (day, start, end) => {
    return availability.some(
      slot => slot.Day === day && slot.StartTime === start && slot.EndTime === end
    );
  };

  const handleBook = async (start, end) => {
    if (!selectedDay) return;

    const localDate = new Date(
      selectedDay.getFullYear(),
      selectedDay.getMonth(),
      selectedDay.getDate()
    );
    const isoDate = localDate.toISOString();

    if (!counselorPsychologistId) {
      toast.error('Counselor ID missing. Please select a valid counselor.');
      return;
    };

    try {
      setBooking(true);
      await axios.post(`${BASE_URL}/appointments`, {
        CounselorPsychologistId: counselorPsychologistId,
        SlotDate: isoDate,
        SlotStartTime: start,
        SlotEndTime: end,
      }, authHeader());

      toast.success(`Booked ${start} - ${end} on ${selectedDay}`);
      fetchAppointments();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Booking failed');

      setFailedSlots(prev => [...prev, { date: isoDate, start: start }]);

    } finally {
      setBooking(false);
    }
  };

  const handleCancelClick = (appointmentId) => {
    setAppointmentToCancel(appointmentId);
    setShowConfirmModal(true);
  };

  const confirmCancel = async () => {
    if (!appointmentToCancel) return;
    try {
      await axios.delete(`${BASE_URL}/appointments/${appointmentToCancel}`, authHeader());
      toast.success("Appointment cancelled");
      fetchAppointments();
    } catch (err) {
      toast.error("Failed to cancel appointment");
    } finally {
      setShowConfirmModal(false);
      setAppointmentToCancel(null);
    }
  };

  return (
    <Container>

      {showBookingSection && (
        <Card className="p-4 rounded-4 shadow mb-4">
          <h4 className="mb-3">Booking with: <span className="text-primary">{counselorName || 'Unknown Counselor'}</span></h4>
          <Form.Group>
            <DatePicker
              selected={selectedDay}
              onChange={(date) => setSelectedDay(date)}
              dateFormat="yyyy-MM-dd"
              className="form-control"
              minDate={new Date()}
              placeholderText="Select Appointment Date"
            />
          </Form.Group>

          {selectedDay !== null && (
            <>
              <div className="mt-4 mb-3"><strong>Available Time Slots:</strong></div>
              <div className="d-flex flex-wrap gap-2">
                {hours.map(({ StartTime, EndTime, label }, i) => {
                  const isoDate = selectedDay ? selectedDay.toISOString().split('T')[0] : '';
                  const selectedWeekday = selectedDay ? daysOfWeek[selectedDay.getDay()] : '';

                  const isAvailable = isSlotAvailable(selectedWeekday, StartTime, EndTime);
                  const alreadyBooked = appointments.some(
                    (a) =>
                      a.SlotDate.split('T')[0] === isoDate &&
                      a.SlotStartTime === StartTime &&
                      a.SlotEndTime === EndTime &&
                      a.CounselorPsychologistId?._id === counselorPsychologistId
                  );

                  // Prevent past slots for today
                  const now = new Date();
                  const isToday = selectedDay && selectedDay.toDateString() === now.toDateString();

                  const slotTime = new Date(selectedDay);
                  slotTime.setHours(parseInt(StartTime.split(':')[0]), 0, 0, 0);

                  const isInPast = isToday && slotTime < now;

                  return (
                    <Button
                      key={i}
                      variant={
                        alreadyBooked
                          ? 'warning'
                          : isAvailable
                            ? 'success'
                            : 'danger'
                      }
                      disabled={!isAvailable || alreadyBooked || isInPast || booking}
                      onClick={() => handleBook(StartTime, EndTime)}
                      size="sm"
                    >
                      {label}
                    </Button>
                  );
                })}
              </div>
            </>
          )}
        </Card>
      )}
      <Card className="p-4 rounded-4 shadow"
        style={{
          backdropFilter: 'blur(12px)',
          background: 'rgba(0, 123, 255, 0.1)',
          border: '1px solid rgba(255, 255, 255, 0.2)',
        }}>
        <h4 className="mb-3">My Appointments</h4>
        {loading ? (
          <div className="text-center">
            <Spinner animation="border" />
          </div>
        ) : appointments.length === 0 ? (
          <p>No appointments found.</p>
        ) : (
          <Row className="g-4">
            {appointments.map((appt) => {
              const counselorName = appt.CounselorPsychologistId?.FullName || 'Unknown';
              const slotDate = new Date(appt.SlotDate).toLocaleDateString('en-IN', {
                weekday: 'short',
                year: 'numeric',
                month: 'short',
                day: 'numeric',
                timeZone: 'Asia/Kolkata',
              });

              const endDateTime = new Date(`${appt.SlotDate.split('T')[0]}T${appt.SlotEndTime}`);
              const now = new Date();
              const isPast = endDateTime < now;

              return (
                <Col key={appt._id} xs={12} sm={6} md={4}>
                  <Card
                    className="shadow-sm border-0 rounded-4 p-3"
                    style={{
                      background: 'transparent',
                      backgroundColor: 'rgba(255, 255, 255, 0.7)',
                      backdropFilter: 'blur(4px)',
                      borderRadius: '20px',
                      padding: '2rem',
                      boxShadow: '0 0 10px rgba(0,0,0,0.1)',
                    }}
                  >
                    <Card.Body>
                      <h6 className="fw-bold">{counselorName}</h6>
                      <p className="mb-1"><strong>Date:</strong> {slotDate}</p>
                      <p className="mb-1"><strong>Time:</strong> {appt.SlotStartTime} - {appt.SlotEndTime}</p>
                      <p className="mb-2"><strong>Status:</strong> {appt.Status?.toUpperCase() || 'N/A'}</p>
                      <Button
                        variant="outline-dark"
                        size="sm"
                        disabled={isPast}
                        onClick={() => handleCancelClick(appt._id)}
                      >
                        Cancel
                      </Button>
                    </Card.Body>
                  </Card>
                </Col>
              );
            })}
          </Row>
        )}
      </Card>

      <ConfirmModal
        show={showConfirmModal}
        onHide={() => setShowConfirmModal(false)}
        onConfirm={confirmCancel}
        message="Are you sure you want to cancel this appointment?"
      />

    </Container>
  );
};

export default Appointment;