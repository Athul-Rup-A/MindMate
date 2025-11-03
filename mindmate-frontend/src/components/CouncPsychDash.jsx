import React, { useEffect, useState } from "react";
import axios from "../config/axios";
import { Container, Row, Col, Card, Spinner, Modal, Button } from "react-bootstrap";
import { toast } from "react-toastify";
import { CalendarFill, PeopleFill, StarFill, } from "react-bootstrap-icons";
import { CircularProgressbar, buildStyles } from "react-circular-progressbar";
import "react-circular-progressbar/dist/styles.css";

const CouncPsychDash = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [modalShow, setModalShow] = useState(false);
  const [modalData, setModalData] = useState([]);
  const [modalTitle, setModalTitle] = useState("");

  const formatDate = (date) => {
    if (!date) return "N/A";
    const parsed = new Date(date);
    return isNaN(parsed) ? "N/A" : parsed.toLocaleDateString();
  };

  const formatDateTime = (date) => {
    if (!date) return "N/A";
    const parsed = new Date(date);
    return isNaN(parsed) ? "N/A" : parsed.toLocaleString();
  };

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await axios.get("/counselorPsychologist/stats");
        setStats(res.data);
      } catch (err) {
        toast.error(err.response?.data?.message || "Failed to fetch stats");
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  const handleCardClick = async (type) => {
    let endpoint = "";
    let title = "";

    switch (type) {
      case "appointments":
        endpoint = "/counselorPsychologist/appointments";
        title = "My Appointments";
        break;
      case "students":
        endpoint = "/counselorPsychologist/my-students";
        title = "My Students";
        break;
      case "feedbacks":
        endpoint = "/counselorPsychologist/feedback";
        title = "Received Feedbacks";
        break;
      default:
        return;
    }

    try {
      const res = await axios.get(endpoint);
      setModalData(res.data);
      setModalTitle(title);
      setModalShow(true);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to fetch details");
    }
  };

  const cardData = [
    {
      title: "Total Appointments",
      value: stats?.totalAppointments || 0,
      icon: <CalendarFill size={28} className="text-success" />,
      type: "appointments",
    },
    {
      title: "Total Students Engaged",
      value: stats?.totalStudents || 0,
      icon: <PeopleFill size={28} className="text-primary" />,
      type: "students",
    },
    {
      title: "Feedback Received",
      value: stats?.totalFeedbacks || 0,
      icon: <StarFill size={28} className="text-warning" />,
      type: "feedbacks",
    },
  ];

  return (
    <Container className="py-4">

      {loading ? (
        <div
          className="d-flex justify-content-center align-items-center"
          style={{ height: "300px" }}
        >
          <Spinner animation="border" variant="primary" />
        </div>
      ) : (
        <Row className="pe-5 me-5 d-flex justify-content-around align-items-center text-center"
          style={{ minHeight: '425px' }}>
          {cardData.map((card, idx) => {
            const percentage = Math.min(card.value, 100);
            return (
              <Col key={idx} xs={6} sm={4} md={3} lg={2}>
                <div
                  onClick={() => handleCardClick(card.type)}
                  style={{
                    cursor: "pointer",
                    width: "280px",
                    height: "280px",
                    background: "transparent",
                    borderRadius: "50%",
                    padding: "15px",
                    boxShadow: "0 0 12px rgba(0,0,0,0.3)",
                  }}
                >
                  <CircularProgressbar
                    value={percentage}
                    text={`${card.value}`}
                    strokeWidth={8}
                    styles={buildStyles({
                      textColor: "#000",
                      pathColor: "#2554C7",
                      trailColor: "rgba(255,255,255,0.4)",
                    })}
                  />
                  <style>
                    {`
  .CircularProgressbar-text {
    dominant-baseline: middle;
    text-anchor: middle;
    // transform: translateY(1px);
  }
`}
                  </style>
                </div>
                <div className="m-4 ps-5 text-dark fw-semibold w-100">{card.title}</div>
              </Col>
            );
          })}
        </Row>
      )}

      {/* MODAL SECTION */}
      <Modal show={modalShow} onHide={() => setModalShow(false)} size="lg" centered>
        <Modal.Header closeButton>
          <Modal.Title>{modalTitle}</Modal.Title>
        </Modal.Header>
        <Modal.Body style={{ maxHeight: "60vh", overflowY: "auto" }}>
          {modalData.length === 0 ? (
            <p className="text-muted">No data available.</p>
          ) : (
            <>
              {modalTitle === "My Appointments" &&
                modalData.map((a) => (
                  <Card key={a._id} className="shadow-sm mb-3 border-0">
                    <Card.Body>
                      <Card.Title>
                        Appointment on {formatDate(a.SlotDate)}
                      </Card.Title>
                      <div>
                        <strong>Time:</strong> {a.SlotStartTime} - {a.SlotEndTime}
                      </div>
                      <div>
                        <strong>Student:</strong> {a.StudentId?.Username || "Unknown"}
                      </div>
                      <div>
                        <strong>Status:</strong>{" "}
                        <span
                          className={`fw-bold text-${a.Status === "confirmed"
                            ? "success"
                            : a.Status === "completed"
                              ? "primary"
                              : a.Status === "rejected"
                                ? "danger"
                                : "warning"
                            }`}
                        >
                          {a.Status.toUpperCase()}
                        </span>
                      </div>
                    </Card.Body>
                  </Card>
                ))}

              {modalTitle === "Received Feedbacks" &&
                modalData.map((f) => (
                  <Card key={f._id} className="shadow-sm mb-3 border-0">
                    <Card.Body>
                      <Card.Title>⭐ Rating: {f.Rating}/5</Card.Title>
                      <div><strong>Comment:</strong> {f.Comment || "No comment"}</div>
                      <div><strong>Type:</strong> {f.Type || "N/A"}</div>
                      <div><strong>Date:</strong> {formatDate(f.createdAt)}</div>
                    </Card.Body>
                  </Card>
                ))}

              {modalTitle === "My Students" &&
                modalData.map((s) => (
                  <Card key={s._id} className="shadow-sm mb-3 border-0">
                    <Card.Body>
                      <Card.Title>{s.Username}</Card.Title>
                      <div><strong>Status:</strong> {s.Status}</div>
                      <div><strong>Joined:</strong> {formatDateTime(s.createdAt)}</div>
                    </Card.Body>
                  </Card>
                ))}
            </>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setModalShow(false)}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default CouncPsychDash;