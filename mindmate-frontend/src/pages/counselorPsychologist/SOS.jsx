import React, { useEffect, useState } from 'react';
import axios from '../../config/axios';
import CustomTable from '../../components/CustomTable';
import CouncPsychHome from '../../components/CouncPsychHome';
import { toast } from 'react-toastify';
import { Card, Container, Spinner } from 'react-bootstrap';

const SOS = () => {
    const [sosLogs, setSosLogs] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchSOSLogs = async () => {
        try {
            const res = await axios.get('counselorPsychologist/sos');
            setSosLogs(res.data);
        } catch (error) {
            toast.error(error?.response?.data?.message || 'Failed to fetch SOS logs');
        } finally {
            setLoading(false);
        }
    };

    const respondToSOS = async (logId) => {
        try {
            await axios.put(`counselorPsychologist/sos/respond/${logId}`);
            toast.success('Responded to SOS successfully!');
            fetchSOSLogs();
        } catch (error) {
            toast.error(error?.response?.data?.message || 'Failed to respond');
        }
    };

    useEffect(() => {
        fetchSOSLogs();
    }, []);

    const columns = [
        { header: 'Student Alias ID', accessor: (item) => item.StudentId?.AliasId || 'Unknown' },
        { header: 'Triggered At', accessor: (item) => new Date(item.TriggeredAt).toLocaleString() },
        { header: 'Method', accessor: 'Method' },
        { header: 'Status', accessor: 'Status' },
        { header: 'Responded At', accessor: (item) => item.RespondedAt ? new Date(item.RespondedAt).toLocaleString() : 'Not responded' }
    ];

    const actions = [
        {
            label: 'Respond',
            variant: 'success',
            show: (item) => item.Status !== 'responded',
            onClick: (item) => respondToSOS(item._id)
        }
    ];

    return (
        <div
            style={{
                background: 'linear-gradient(to right, #83a4d4, #b6fbff)',
                minHeight: '100vh',
                paddingTop: '40px',
            }}
        >
            <Container style={{ maxWidth: '1200px' }}>

                <CouncPsychHome />

                <Card className="p-4 shadow-lg rounded-4">
                    <h4 className="fw-bold text-dark text-center mb-4">SOS Logs</h4>
                    {loading ? (
                        <div className="text-center"><Spinner animation="border" /></div>
                    ) : (
                        <CustomTable
                            columns={columns}
                            data={sosLogs}
                            actions={actions}
                            rowKey={(item) => item._id}
                        />
                    )}
                </Card>
            </Container>
        </div>
    );
};

export default SOS;