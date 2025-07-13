import React, { useEffect, useState } from 'react';
import axios from '../../config/axios';
import CustomTable from '../../components/CustomTable';
import { toast } from 'react-toastify';
import { Container, Card, Spinner } from 'react-bootstrap';

const Feedback = () => {
    const [feedbacks, setFeedbacks] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchFeedbacks = async () => {
        try {
            const res = await axios.get('counselorPsychologist/feedback');
            setFeedbacks(res.data);
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to fetch feedbacks');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchFeedbacks();
    }, []);

    const columns = [
        { header: '#', accessor: (_, idx) => idx + 1 },
        { header: 'Student', accessor: (item) => item.StudentId?.AliasId || 'N/A' },
        { header: 'Rating', accessor: 'Rating' },
        { header: 'Comment', accessor: 'Comment' },
        {
            header: 'Session Date & Time',
            accessor: (item) =>
                item.AppointmentId?.SlotDate
                    ? `${new Date(item.AppointmentId.SlotDate).toLocaleDateString('en-GB')}
                     (${item.AppointmentId.SlotStartTime} - ${item.AppointmentId.SlotEndTime})`
                    : '—'
        }
    ];

    return (
        <Container>
            <Card className="p-4 shadow-lg rounded-4">
                <h4 className="fw-bold text-dark text-center mb-4">Session Feedbacks</h4>

                {loading ? (
                    <div className="text-center"><Spinner animation="border" /></div>
                ) : (
                    <CustomTable
                        columns={columns}
                        data={feedbacks}
                        rowKey={(item) => item._id}
                    />
                )}
            </Card>
        </Container>
    );
};

export default Feedback;