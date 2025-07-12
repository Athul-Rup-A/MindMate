import React, { useEffect, useState } from 'react';
import axios from '../../config/axios';
import { Container, Card, Spinner, Button, Badge, Row, Col } from 'react-bootstrap';
import { toast } from 'react-toastify';

const Report = () => {
    const [reports, setReports] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchReports = async () => {
        try {
            const res = await axios.get('admin/reports');
            setReports(res.data);
        } catch (err) {
            toast.error(err?.response?.data?.message || 'Failed to fetch reports');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchReports();
    }, []);

    const handleReview = async (reportId) => {
        try {
            await axios.put(`/admin/reports/${reportId}/review`);
            toast.success('Report marked as reviewed');
            fetchReports();
        } catch (err) {
            toast.error(err?.response?.data?.message || 'Failed to mark as reviewed');
        }
    };

    const handleResolve = async (reportId) => {
        try {
            await axios.put(`admin/reports/${reportId}/resolve`);
            toast.success('Report marked as resolved');
            fetchReports();
        } catch (err) {
            toast.error(err?.response?.data?.message || 'Failed to resolve report');
        }
    };

    const renderStatusBadge = (status) => {
        const variant = status === 'resolved'
            ? 'success'
            : status === 'reviewed'
                ? 'warning'
                : 'secondary';
        return <Badge bg={variant} className="text-capitalize">{status}</Badge>;
    };

    return (
        <Container>
            <h3 className="mb-4 fw-bold text-center">Reported Items</h3>

            {loading ? (
                <div className="text-center"><Spinner animation="border" /></div>
            ) : reports.length === 0 ? (
                <p className="text-center text-muted">No reports found</p>
            ) : (
                <Row xs={1} md={2} lg={2} className="g-4">
                    {reports.map((report) => (
                        <Col key={report._id}>
                            <Card className="shadow-sm border-0 rounded-4 p-3">
                                <Card.Body>
                                    <Card.Title className="mb-2 fw-bold text-dark">
                                        {report.TargetType} Report
                                    </Card.Title>

                                    <p className="mb-1"><strong>Reporter:</strong> {report.ReporterId?.AliasId || 'Unknown'}</p>
                                    <p className="mb-1"><strong>Target:</strong> {report.TargetId?.FullName || report.TargetAliasId || 'N/A'}</p>
                                    <p className="mb-1"><strong>Reason:</strong> {report.Reason}</p>
                                    <p className="mb-2"><strong>Status:</strong> {renderStatusBadge(report.Status)}</p>

                                    <div className="d-flex gap-2 mt-2">
                                        {report.Status === 'pending' && (
                                            <>
                                                <Button
                                                    size="sm"
                                                    variant="outline-warning"
                                                    onClick={() => handleReview(report._id)}
                                                >
                                                    Mark Reviewed
                                                </Button>
                                                <Button
                                                    size="sm"
                                                    variant="outline-success"
                                                    onClick={() => handleResolve(report._id)}
                                                >
                                                    Resolve
                                                </Button>
                                            </>
                                        )}

                                        {report.Status === 'reviewed' && (
                                            <Button
                                                size="sm"
                                                variant="outline-success"
                                                onClick={() => handleResolve(report._id)}
                                            >
                                                Resolve
                                            </Button>
                                        )}

                                        {report.Status === 'resolved' && (
                                            <span className="text-muted">No Action</span>
                                        )}
                                    </div>
                                </Card.Body>
                            </Card>
                        </Col>
                    ))}
                </Row>
            )}

        </Container>
    );
};

export default Report;