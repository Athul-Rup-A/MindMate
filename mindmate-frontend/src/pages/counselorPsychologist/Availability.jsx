import React, { useEffect, useState } from 'react';
import axios from '../../config/axios';
import CustomTable from '../../components/CustomTable';
import CouncPsychHome from '../../components/CouncPsychHome'
import { toast } from 'react-toastify';
import { Container, Card, Spinner, Button, Row, Col, Form } from 'react-bootstrap';

const hours = Array.from({ length: 24 }, (_, i) => {
    const start = i.toString().padStart(2, '0') + ':00';
    const end = ((i + 1) % 24).toString().padStart(2, '0') + ':00';
    return { StartTime: start, EndTime: end, label: `${start} - ${end}` };
});

const daysOfWeek = [
    'Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'
];

const Availability = () => {
    const [slots, setSlots] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedDay, setSelectedDay] = useState('');
    const [selectedTimes, setSelectedTimes] = useState([]);

    const fetchAvailability = async () => {
        try {
            const res = await axios.get('counselorPsychologist/availability');
            setSlots(res.data);
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to fetch availability');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAvailability();
    }, []);

    const handleToggleTime = (timeObj) => {
        const exists = selectedTimes.find(
            (t) => t.StartTime === timeObj.StartTime && t.EndTime === timeObj.EndTime
        );
        if (exists) {
            setSelectedTimes((prev) =>
                prev.filter((t) => !(t.StartTime === timeObj.StartTime && t.EndTime === timeObj.EndTime))
            );
        } else {
            setSelectedTimes((prev) => [...prev, timeObj]);
        }
    };

    const handleSubmit = async () => {
        if (!selectedDay || selectedTimes.length === 0) {
            toast.warning('Select at least one time slot');
            return;
        }

        const newSlots = selectedTimes.map((t) => ({
            Day: selectedDay,
            StartTime: t.StartTime,
            EndTime: t.EndTime,
        }));

        const updated = [...slots, ...newSlots];

        try {
            await axios.put('counselorPsychologist/availability', {
                AvailabilitySlots: updated,
            });
            toast.success('Availability updated');
            setSlots(updated);
            setSelectedTimes([]);
            setSelectedDay('');
        } catch (err) {
            toast.error(err.response?.data?.message || 'Update failed');
        }
    };

    const handleDeleteSlot = async (index) => {
        const updated = slots.filter((_, i) => i !== index);
        try {
            await axios.put('counselorPsychologist/availability', {
                AvailabilitySlots: updated,
            });
            setSlots(updated);
            toast.success('Slot deleted');
        } catch (err) {
            toast.error(err.response?.data?.message || 'Delete failed');
        }
    };

    const columns = [
        { header: '#', accessor: (_, idx) => idx + 1 },
        { header: 'Day', accessor: 'Day' },
        { header: 'Start Time', accessor: 'StartTime' },
        { header: 'End Time', accessor: 'EndTime' },
    ];

    return (
        <>
            <div
                style={{
                    background: 'linear-gradient(to right, #a18cd1, #00e3ae)',
                    minHeight: '100vh',
                }}
            >
                <Container style={{ maxWidth: '1100px', paddingTop: '40px' }}>

                    <CouncPsychHome />

                    <Card className="p-4 shadow-lg rounded-4">
                        <h4 className="fw-bold text-dark text-center mb-4">Manage Availability</h4>

                        {loading ? (
                            <div className="text-center"><Spinner animation="border" /></div>
                        ) : (
                            <CustomTable
                                columns={columns}
                                data={slots}
                                rowKey={(_, idx) => idx}
                                actions={[
                                    {
                                        label: 'Delete',
                                        variant: 'danger',
                                        onClick: (_, idx) => handleDeleteSlot(idx),
                                    },
                                ]}
                            />
                        )}

                        <hr className="my-4" />
                        <h5 className="fw-semibold text-primary">Add Slot</h5>

                        <Row className="mb-3">
                            <Col md={4}>
                                <Form.Group>
                                    <Form.Select
                                        value={selectedDay}
                                        onChange={(e) => setSelectedDay(e.target.value)}
                                    >
                                        <option value="">Select Day</option>
                                        {daysOfWeek.map((d) => (
                                            <option key={d} value={d}>
                                                {d}
                                            </option>
                                        ))}
                                    </Form.Select>
                                </Form.Group>
                            </Col>
                        </Row>

                        {selectedDay && (
                            <>
                                <h6 className="mt-2 mb-2">Select Time Slots</h6>
                                <div className="d-flex flex-wrap gap-2 mb-3">
                                    {hours.map((hour, idx) => {
                                        const selected = selectedTimes.find(
                                            (t) => t.StartTime === hour.StartTime && t.EndTime === hour.EndTime
                                        ) || slots.find(
                                            (t) =>
                                                t.Day === selectedDay &&
                                                t.StartTime === hour.StartTime &&
                                                t.EndTime === hour.EndTime
                                        );
                                        return (
                                            <Button
                                                key={idx}
                                                size="sm"
                                                variant={selected ? 'success' : 'outline-danger'}
                                                onClick={() => handleToggleTime(hour)}
                                            >
                                                {hour.label}
                                            </Button>
                                        );
                                    })}
                                </div>
                                <div className="text-end">
                                    <Button variant="success" onClick={handleSubmit}>
                                        Save Slot
                                    </Button>
                                </div>
                            </>
                        )}
                    </Card>
                </Container>
            </div>
        </>
    );
};

export default Availability;