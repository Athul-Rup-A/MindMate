import React, { useEffect, useState } from 'react';
import axios from '../../config/axios';
import CustomTable from '../../components/CustomTable';
import { toast } from 'react-toastify';
import { Container, Card, Spinner, Row, Col, Badge, Form, InputGroup } from 'react-bootstrap';
import { Search } from 'react-bootstrap-icons';

const Wellness = () => {
    const [students, setStudents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [expanded, setExpanded] = useState({});

    const fetchData = async () => {
        try {
            const res = await axios.get('counselorPsychologist/wellness');
            setStudents(res.data || []);
        } catch (err) {
            toast.error(err?.response?.data?.message || 'Failed to fetch student logs');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const toggleExpand = (id, type) => {
        setExpanded((prev) => ({
            ...prev,
            [id]: {
                ...prev[id],
                [type]: !prev[id]?.[type],
            },
        }));
    };

    const moodColumns = [
        { header: 'Date', accessor: (m) => new Date(m.Date).toLocaleDateString() },
        { header: 'Mood', accessor: (m) => <Badge bg="info" className="text-capitalize">{m.Mood}</Badge> },
        { header: 'Note', accessor: 'Note' },
        { header: 'Tags', accessor: (m) => m.Tags?.map((t, i) => <Badge bg="secondary" className="me-1" key={i}>{t}</Badge>) },
    ];

    const habitColumns = [
        { header: 'Date', accessor: (h) => new Date(h.Date).toLocaleDateString() },
        { header: 'Exercise', accessor: (h) => h.Exercise ? 'Yes' : 'No' },
        { header: 'Hydration (ml)', accessor: 'Hydration' },
        { header: 'Screen Time (hrs)', accessor: 'ScreenTime' },
        { header: 'Sleep (hrs)', accessor: 'SleepHours' },
    ];

    const filteredStudents = students.filter((s) =>
        s.AliasId.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <Container>
            <h3 className="text-center fw-bold mb-3">Student Mood & Habit Logs</h3>

            <InputGroup className="mb-4">
                <InputGroup.Text><Search /></InputGroup.Text>
                <Form.Control
                    placeholder="Search by Alias ID"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                />
            </InputGroup>

            {loading ? (
                <div className="text-center">
                    <Spinner animation="border" variant="primary" />
                </div>
            ) : filteredStudents.length === 0 ? (
                <p className="text-muted text-center">No matching students found</p>
            ) : (
                filteredStudents.map((student) => {
                    const moodExpanded = expanded[student._id]?.mood || false;
                    const habitExpanded = expanded[student._id]?.habit || false;

                    const moodData = moodExpanded
                        ? student.MoodEntries
                        : student.MoodEntries.slice(0, 2);

                    const habitData = habitExpanded
                        ? student.HabitLogs
                        : student.HabitLogs.slice(0, 2);

                    return (
                        <Card key={student._id} className="mb-4 shadow-sm rounded-4 p-3">
                            <h5 className="fw-semibold text-info">Alias ID: {student.AliasId}</h5>

                            <Row className="mt-3">
                                <Col md={12}>
                                    <h6 className="text-secondary d-flex justify-content-between align-items-center">
                                        Mood Logs:
                                        {student.MoodEntries.length > 2 && (
                                            <span
                                                style={{ cursor: 'pointer', fontSize: '0.9rem' }}
                                                className="text-primary"
                                                onClick={() => toggleExpand(student._id, 'mood')}
                                            >
                                                {moodExpanded ? 'Hide' : 'View All'}
                                            </span>
                                        )}
                                    </h6>
                                    {student.MoodEntries.length > 0 ? (
                                        <CustomTable
                                            columns={moodColumns}
                                            data={moodData}
                                            rowKey={(item, i) => `mood-${i}`}
                                        />
                                    ) : (
                                        <p className="text-muted">No mood logs found.</p>
                                    )}
                                </Col>
                            </Row>

                            <Row className="mt-4">
                                <Col md={12}>
                                    <h6 className="text-secondary d-flex justify-content-between align-items-center">
                                        Habit Logs:
                                        {student.HabitLogs.length > 2 && (
                                            <span
                                                style={{ cursor: 'pointer', fontSize: '0.9rem' }}
                                                className="text-primary"
                                                onClick={() => toggleExpand(student._id, 'habit')}
                                            >
                                                {habitExpanded ? 'Hide' : 'View All'}
                                            </span>
                                        )}
                                    </h6>
                                    {student.HabitLogs.length > 0 ? (
                                        <CustomTable
                                            columns={habitColumns}
                                            data={habitData}
                                            rowKey={(item, i) => `habit-${i}`}
                                        />
                                    ) : (
                                        <p className="text-muted">No habit logs found.</p>
                                    )}
                                </Col>
                            </Row>
                        </Card>
                    );
                })
            )}
        </Container>
    );
};

export default Wellness;