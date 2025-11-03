import React, { useEffect, useState } from 'react';
import Select from 'react-select';
import axios from 'axios';
import { useLocation, useParams, useNavigate } from 'react-router-dom';
import { Container, Card, Button, Row, Col, Spinner, Badge, Form } from 'react-bootstrap';
import { toast } from 'react-toastify';
import authHeader from '../../config/authHeader';
import ConfirmModal from '../../components/ConfirmModal';
import FilterPanel from '../../components/FilterPanel'

const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

// Next 22 days for quick booking
const next14Days = Array.from({ length: 22 }, (_, i) => {
  const date = new Date();
  date.setDate(date.getDate() + i);
  return date;
});

const hours = Array.from({ length: 24 }, (_, i) => {
  const start = i.toString().padStart(2, '0') + ':00';
  const end = ((i + 1) % 24).toString().padStart(2, '0') + ':00';
  return { StartTime: start, EndTime: end, label: `${start} - ${end}` };
});

const Appointment = () => {
  const navigate = useNavigate();
  const { id: counselorPsychologistId } = useParams();
  const location = useLocation();
  const state = location.state ?? {};
  const counselorName = state?.name || '';
  const passedAvailability = Array.isArray(state?.availability) ? state.availability : [];
  const BASE_URL = `${import.meta.env.VITE_API_URL}students`;

  const [selectedDay, setSelectedDay] = useState(null);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [availability, setAvailability] = useState(passedAvailability);
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [booking, setBooking] = useState(false);

  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [appointmentToCancel, setAppointmentToCancel] = useState(null);

  const [bookingCompleted, setBookingCompleted] = useState(false);
  const [filterStatus, setFilterStatus] = useState('');
  const [filterDate, setFilterDate] = useState('');
  const [filterCounselor, setFilterCounselor] = useState('');
  const [allCounselors, setAllCounselors] = useState([]);
  const [selectedCounselor, setSelectedCounselor] = useState(null);

  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelReason, setCancelReason] = useState('');

  const [showEditModal, setShowEditModal] = useState(false);
  const [editingAppointment, setEditingAppointment] = useState(null);
  const [editSelectedDay, setEditSelectedDay] = useState(null);
  const [editSelectedSlot, setEditSelectedSlot] = useState(null);

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

  useEffect(() => {
    fetchAppointments();
  }, [counselorPsychologistId]);

  useEffect(() => {
    const fetchCounselors = async () => {
      try {
        const res = await axios.get(`${BASE_URL}/counselorPsychologist`, authHeader());
        setAllCounselors(res.data.map(c => ({
          value: c.FullName,
          label: `${c.FullName} (${c.Role})`
        })));
      } catch (err) {
        toast.error("Failed to load counselors/psychologists");
      }
    };

    fetchCounselors();
  }, []);

  useEffect(() => {
    window.history.pushState(null, document.title, window.location.href);

    const handleBack = () => {
      navigate("/student/home", { replace: true });
    };

    window.addEventListener("popstate", handleBack);

    return () => {
      window.removeEventListener("popstate", handleBack);
    };
  }, [navigate]);

  const isSlotAvailable = (day, start, end) => {
    return availability.some(slot =>
      slot.Day === day &&
      slot.StartTime === start &&
      slot.EndTime === end
    );
  };

  const isCounselorAvailableOn = (date) => {
    const weekday = daysOfWeek[date.getDay()];
    return availability.some(slot => slot.Day === weekday);
  };

  const handleCancelClick = (appointmentId) => {
    setAppointmentToCancel(appointmentId);
    setShowCancelModal(true);
  };

  const handleEditClick = (appointment) => {
    setEditingAppointment(appointment);
    setEditSelectedDay(new Date(appointment.SlotDate));
    setEditSelectedSlot({
      start: appointment.SlotStartTime,
      end: appointment.SlotEndTime
    });

    setAvailability(
      appointment.CounselorPsychologistId?.AvailabilitySlots || []
    );

    setShowEditModal(true);
  };

  const confirmCancel = async () => {
    if (!appointmentToCancel || !cancelReason.trim()) {
      toast.info("Please provide a reason before confirming.");
      return;
    }
    try {
      await axios.delete(`${BASE_URL}/appointments/${appointmentToCancel}`, {
        ...authHeader(),
        data: { reason: cancelReason },
      });
      toast.success("Appointment cancelled");
      fetchAppointments();
    } catch (err) {
      toast.error("Failed to cancel appointment");
    } finally {
      setShowCancelModal(false);
      setAppointmentToCancel(null);
      setCancelReason('');
    }
  };

  const showBookingSection = state && state.name && passedAvailability.length > 0;

  return (
    <Container>

      {!showBookingSection && (
        <FilterPanel
          filterStatus={filterStatus}
          setFilterStatus={setFilterStatus}
          filterDate={filterDate}
          setFilterDate={setFilterDate}
          filterCounselor={filterCounselor}
          setFilterCounselor={setFilterCounselor}
          selectedCounselor={selectedCounselor}
          setSelectedCounselor={setSelectedCounselor}
          allCounselors={allCounselors}
        />
      )}

      {showBookingSection && (
        <Card className="p-4 rounded-4 shadow mb-4">
          <h4 className="mb-3">
            Booking with: <span className="text-primary">{counselorName || 'Unknown Counselor'}</span>
          </h4>

          {/* Date Selection */}
          <h6 className='mt-2'><strong>Select a Date:</strong></h6>
          <div className="d-flex flex-wrap gap-2 my-3">
            {next14Days.map((date, i) => {
              const available = isCounselorAvailableOn(date);
              const formatted = date.toLocaleDateString('en-IN', { weekday: 'short', month: 'short', day: 'numeric' });
              const isSelected = selectedDay && selectedDay.toDateString() === date.toDateString();
              return (
                <Button
                  key={i}
                  variant={available ? 'success' : 'danger'}
                  disabled={!available}
                  onClick={() => setSelectedDay(date)}
                  active={isSelected}
                  size="sm"
                  className="px-3 py-2 rounded-pill"
                >
                  {formatted}
                </Button>
              );
            })}
          </div>

          {/* Time Slots */}
          {selectedDay && (
            <>
              <div className="mt-4 mb-2"><strong>Time Slots:</strong></div>
              {/* Color Legend */}
              <div className="mb-2 d-flex gap-2">
                <Badge bg="success">Available</Badge>
                <Badge bg="info" text="dark">Selected</Badge>
                <Badge bg="warning" text="dark">Booked</Badge>
              </div>
              <div className="d-flex flex-wrap gap-2">
                {hours.map(({ StartTime, EndTime, label }, i) => {
                  const isoDate = selectedDay.toISOString().split('T')[0];
                  const selectedWeekday = daysOfWeek[selectedDay.getDay()];
                  const isAvailable = isSlotAvailable(selectedWeekday, StartTime, EndTime);

                  const alreadyBooked = appointments.some(
                    a => a.SlotDate.split('T')[0] === isoDate &&
                      a.SlotStartTime === StartTime &&
                      a.SlotEndTime === EndTime &&
                      a.CounselorPsychologistId?._id === counselorPsychologistId
                  );

                  const now = new Date();
                  const isToday = selectedDay.toDateString() === now.toDateString();
                  const slotTime = new Date(selectedDay);
                  slotTime.setHours(parseInt(StartTime.split(':')[0]), 0, 0, 0);
                  const isInPast = isToday && slotTime < now;

                  const isSelected = selectedSlot &&
                    selectedSlot.start === StartTime &&
                    selectedSlot.end === EndTime &&
                    new Date(selectedSlot.date).toDateString() === selectedDay.toDateString();

                  return (
                    <Button
                      key={i}
                      variant={
                        alreadyBooked ? 'warning' :
                          isSelected ? 'info' :
                            isAvailable ? 'success' : 'outline-danger'
                      }
                      disabled={alreadyBooked || !isAvailable || isInPast}
                      onClick={() => {
                        if (!alreadyBooked) setSelectedSlot({ date: selectedDay.toISOString(), start: StartTime, end: EndTime });
                      }}
                      size="sm"
                    >
                      {label}
                    </Button>
                  );
                })}
              </div>

              {/* Confirm Button */}
              <div className="d-flex justify-content-end mt-4">
                <Button
                  variant="primary"
                  size="md"
                  disabled={!selectedSlot}
                  onClick={async () => {
                    if (!selectedSlot) return toast.info("Please select a time slot!");
                    try {
                      setBooking(true);
                      await axios.post(`${BASE_URL}/appointments`, {
                        CounselorPsychologistId: counselorPsychologistId,
                        SlotDate: selectedSlot.date,
                        SlotStartTime: selectedSlot.start,
                        SlotEndTime: selectedSlot.end,
                      }, authHeader());
                      toast.success("Appointment confirmed successfully!");
                      fetchAppointments();
                      setTimeout(() => {
                        navigate("/student/appointments");
                      }, 3500);
                      setBookingCompleted(true);
                    } catch (err) {
                      toast.error(err.response?.data?.message || "Booking failed");
                    } finally { setBooking(false); }
                  }}
                >
                  Confirm Appointment →
                </Button>
              </div>
            </>
          )}
        </Card>
      )}

      {/* My Appointments */}
      {!showBookingSection && (
        <Card className="p-4 rounded-4 shadow" style={{ backdropFilter: 'blur(12px)', background: 'rgba(0, 123, 255, 0.1)', border: '1px solid rgba(255, 255, 255, 0.2)' }}>
          <h4 className="mb-3">My Appointments</h4>

          {loading ? (
            <div className="text-center"><Spinner animation="border" /></div>
          ) : appointments.length === 0 ? (
            <p>No appointments found.</p>
          ) : (
            <>

              {/* Filter appointments */}
              {(() => {
                const filteredAppointments = appointments
                  .filter(appt => {
                    const slotDate = new Date(appt.SlotDate).toISOString().split('T')[0];
                    const counselorName = appt.CounselorPsychologistId?.FullName || '';

                    const statusMatch = filterStatus ? appt.Status?.toLowerCase() === filterStatus.toLowerCase() : true;
                    const dateMatch = filterDate ? slotDate === filterDate : true;
                    const counselorMatch = filterCounselor ? counselorName.toLowerCase().includes(filterCounselor.toLowerCase()) : true;

                    return statusMatch && dateMatch && counselorMatch;
                  })
                  .sort((a, b) => new Date(b.SlotDate) - new Date(a.SlotDate)); // sort descending


                return (
                  <Row className="g-4">
                    {filteredAppointments.map(appt => {
                      const counselorName = appt.CounselorPsychologistId?.FullName || 'Unknown';
                      const slotDate = new Date(appt.SlotDate).toLocaleDateString('en-IN', {
                        weekday: 'short', year: 'numeric', month: 'short', day: 'numeric', timeZone: 'Asia/Kolkata'
                      });
                      const endDateTime = new Date(`${appt.SlotDate.split('T')[0]}T${appt.SlotEndTime}`);
                      const isPast = endDateTime < new Date();

                      return (
                        <Col key={appt._id} xs={12} sm={6} md={4}>
                          <Card className="shadow-sm border-0 rounded-4 p-3" style={{ background: 'rgba(255,255,255,0.7)', backdropFilter: 'blur(4px)', borderRadius: '20px', padding: '2rem', boxShadow: '0 0 10px rgba(0,0,0,0.1)' }}>
                            <Card.Body>
                              <h6 className="fw-bold">{counselorName}</h6>
                              <p className="mb-1"><strong>Date:</strong> {slotDate}</p>
                              <p className="mb-1"><strong>Time:</strong> {appt.SlotStartTime} - {appt.SlotEndTime}</p>
                              <p className="mb-2"><strong>Status:</strong> {appt.Status?.toUpperCase() || 'N/A'}</p>
                              <Button
                                variant="outline-primary"
                                size="sm"
                                disabled={isPast || appt.Status?.toLowerCase() === 'confirmed'}
                                className="me-2"
                                onClick={() => {
                                  if (appt.Status?.toLowerCase() !== 'confirmed') {
                                    handleEditClick(appt);
                                  } else {
                                    toast.info('Confirmed appointments cannot be edited.');
                                  }
                                }}
                              >
                                Edit
                              </Button>
                              <Button variant="outline-dark" size="sm" disabled={isPast} onClick={() => handleCancelClick(appt._id)}>Cancel</Button>
                            </Card.Body>
                          </Card>
                        </Col>
                      );
                    })}
                  </Row>
                );
              })()}
            </>
          )}
        </Card>
      )}

      <ConfirmModal
        show={showCancelModal}
        onHide={() => setShowCancelModal(false)}
        onConfirm={confirmCancel}
        message="Are you sure you want to cancel this appointment?"
        showReasonBox={true}
        reason={cancelReason}
        setReason={setCancelReason}
        reasonLabel="Please provide a reason for cancellation:"
      />

      {showEditModal && editingAppointment && (
        <Card
          className="p-4 rounded-4 shadow position-fixed top-50 start-50 translate-middle"
          style={{
            width: '500px',
            background: 'rgba(255,255,255,0.95)',
            zIndex: 9999
          }}
        >
          <h5 className="mb-3 text-center">Edit Appointment</h5>
          <p className="text-muted text-center">
            {editingAppointment.CounselorPsychologistId?.FullName || 'Unknown Counselor'}
          </p>

          {/* Day Selection */}
          <h6><strong>Select New Date:</strong></h6>
          <div className="d-flex flex-wrap gap-2 my-2 justify-content-center">
            {next14Days.map((date, i) => {
              const available = isCounselorAvailableOn(date);
              const formatted = date.toLocaleDateString('en-IN', { weekday: 'short', month: 'short', day: 'numeric' });
              const isSelected = editSelectedDay && editSelectedDay.toDateString() === date.toDateString();
              return (
                <Button
                  key={i}
                  variant={available ? 'success' : 'danger'}
                  disabled={!available}
                  active={isSelected}
                  size="sm"
                  onClick={() => setEditSelectedDay(date)}
                >
                  {formatted}
                </Button>
              );
            })}
          </div>

          {editSelectedDay && (
            <>
              <div className="mt-3 mb-2 text-center"><strong>Select New Time:</strong></div>
              <div className="d-flex flex-wrap gap-2 justify-content-center">
                {hours.map(({ StartTime, EndTime, label }, i) => {
                  const selectedWeekday = daysOfWeek[editSelectedDay.getDay()];
                  const isAvailable = isSlotAvailable(selectedWeekday, StartTime, EndTime);
                  const isoDate = editSelectedDay.toISOString().split('T')[0];

                  const alreadyBooked = appointments.some(
                    a => a.SlotDate.split('T')[0] === isoDate &&
                      a.SlotStartTime === StartTime &&
                      a.SlotEndTime === EndTime &&
                      a.CounselorPsychologistId?._id === editingAppointment.CounselorPsychologistId?._id &&
                      a._id !== editingAppointment._id
                  );

                  const isSelected = editSelectedSlot?.start === StartTime && editSelectedSlot?.end === EndTime;

                  return (
                    <Button
                      key={i}
                      variant={
                        alreadyBooked ? 'warning' :
                          isSelected ? 'info' :
                            isAvailable ? 'success' : 'outline-danger'
                      }
                      disabled={alreadyBooked || !isAvailable}
                      onClick={() => setEditSelectedSlot({ start: StartTime, end: EndTime })}
                      size="sm"
                    >
                      {label}
                    </Button>
                  );
                })}
              </div>
            </>
          )}

          <div className="d-flex justify-content-end mt-4 gap-2">
            <Button variant="secondary" onClick={() => setShowEditModal(false)}>
              Cancel
            </Button>
            <Button
              variant="primary"
              disabled={!editSelectedDay || !editSelectedSlot}
              onClick={async () => {
                try {
                  await axios.put(
                    `${BASE_URL}/appointments/${editingAppointment._id}`,
                    {
                      SlotDate: editSelectedDay.toISOString(),
                      SlotStartTime: editSelectedSlot.start,
                      SlotEndTime: editSelectedSlot.end,
                    },
                    authHeader()
                  );
                  toast.success("Appointment rescheduled successfully!");
                  setShowEditModal(false);
                  fetchAppointments();
                } catch (err) {
                  toast.error(err.response?.data?.message || "Failed to update appointment");
                }
              }}
            >
              Save Changes
            </Button>
          </div>
        </Card>
      )}

    </Container>
  );
};

export default Appointment;