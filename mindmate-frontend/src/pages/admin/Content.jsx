import React, { useEffect, useState } from 'react';
import axios from '../../config/axios';
import CustomTable from '../../components/CustomTable';
import ConfirmModal from '../../components/ConfirmModal';
import FilterBar from '../../components/FilterPanel';
import { toast } from 'react-toastify';
import {
  Container, Row, Col, Button, Form, Spinner, ListGroup, Card
} from 'react-bootstrap';
import { ChatDots, StarFill, FileEarmarkText } from 'react-bootstrap-icons';
import TabFilters from "../../components/TabFilters";

const Content = () => {
  const [loading, setLoading] = useState(true);
  const [vents, setVents] = useState([]);
  const [resources, setResources] = useState([]);
  const [feedbacks, setFeedbacks] = useState([]);

  const [activeTab, setActiveTab] = useState("vents");
  const [searchTerm, setSearchTerm] = useState("");

  const [resourceType, setResourceType] = useState("");
  const [feedbackType, setFeedbackType] = useState("");
  const [feedbackRating, setFeedbackRating] = useState("");

  const [showConfirm, setShowConfirm] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState({ type: '', id: null });

  const fetchData = async () => {
    try {
      const [v, r, f] = await Promise.all([
        axios.get('/admin/vents'),
        axios.get('/admin/resources'),
        axios.get('/admin/feedbacks'),
      ]);
      setVents(v.data);
      setResources(r.data);
      setFeedbacks(f.data);
    } catch {
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);
  useEffect(() => {
    setSearchTerm("");
    setResourceType("");
    setFeedbackType("");
    setFeedbackRating("");
  }, [activeTab]);

  const handleDeleteClick = (type, item) => {
    setDeleteTarget({ type, id: item._id });
    setShowConfirm(true);
  };

  const handleConfirmDelete = async () => {
    try {
      const deleteEndpoints = {
        Vent: "vents",
        Feedback: "feedbacks",
        Resource: "resources"
      };

      const endpoint = deleteEndpoints[deleteTarget.type];
      if (!endpoint) return toast.error("Invalid delete type!");

      await axios.delete(`/admin/${endpoint}/${deleteTarget.id}`);
      toast.success(`${deleteTarget.type} deleted successfully`);
      fetchData();
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to delete');
    } finally {
      setShowConfirm(false);
    }
  };

  const makeActions = (type) => [
    {
      label: 'Delete',
      variant: 'danger',
      onClick: (item) => handleDeleteClick(type, item),
    },
  ];

  const filterData = (data) => {
    if (!Array.isArray(data)) return [];

    return data.filter(item => {
      const textMatch = Object.values(item).join(" ").toLowerCase()
        .includes(searchTerm.toLowerCase());

      if (!textMatch) return false;

      if (activeTab === "resources") {
        if (resourceType && item.type !== resourceType) return false;
      }

      if (activeTab === "feedbacks") {
        if (feedbackType && item.Type !== feedbackType) return false;
        if (feedbackRating && String(item.Rating) !== String(feedbackRating)) return false;
      }

      return true;
    });
  };

  const TABS = {
    vents: {
      title: "VentWall Posts",
      icon: <ChatDots size={20} />,
      data: activeTab === "vents" ? filterData(vents) : vents,
      columns: [
        { header: "Topic", accessor: "Topic" },
        { header: "Content", accessor: "Content" },
      ],
      type: "Vent",
    },
    feedbacks: {
      title: "Feedbacks",
      icon: <StarFill size={20} />,
      data: activeTab === "feedbacks" ? filterData(feedbacks) : feedbacks,
      columns: [
        { header: "Type", accessor: "Type" },
        { header: "Comment", accessor: "Comment" },
        { header: "Rating", accessor: "Rating" },
      ],
      type: "Feedback",
    },
    resources: {
      title: "Resources",
      icon: <FileEarmarkText size={20} />,
      data: activeTab === "resources" ? filterData(resources) : resources,

      columns: [
        { header: "Title", accessor: "title" },
        { header: "Category", accessor: "type" },
        { header: "Link", accessor: "link" },
      ],
      type: "Resource",
    },
  };

  const activeData = TABS[activeTab];

  return (
    <Container fluid className="mt-3">
      <Row>

        {/* LEFT TABS — BLOCK STYLE */}
        <Col xs={3}>
          <div className="d-flex flex-column gap-3">
            {Object.keys(TABS).map(key => (
              <Button
                key={key}
                style={{
                  width: "5cm",
                  height: "4.7cm",
                  borderRadius: "14px",
                  fontSize: "0.95rem",
                  gap: "6px",
                  whiteSpace: "normal",
                  backdropFilter: "blur(14px)",
                  background: activeTab === key
                    ? "rgba(255,255,255,0.70)"   // brighter white when Active
                    : "rgba(255,255,255,0.40)",  // brighter white when Inactive
                  border: activeTab === key
                    ? "2px solid rgba(255,255,255,0.6)"
                    : "1px solid rgba(255,255,255,0.35)",
                  boxShadow: activeTab === key
                    ? "0 4px 18px rgba(255,255,255,0.35)"
                    : "0 2px 10px rgba(255,255,255,0.15)",
                  color: "#2c2c2c", // darker text
                  transition: "0.3s ease-in-out"
                }}
                onClick={() => setActiveTab(key)}
                className="d-flex flex-column justify-content-center align-items-center text-center fw-bold shadow-sm"
              >
                {TABS[key].icon}
                <span>{TABS[key].title}</span>
                <span className="badge bg-secondary rounded-pill">
                  {TABS[key].data?.length}
                </span>
              </Button>
            ))}
          </div>
        </Col>

        {/* RIGHT CONTENT */}
        <Col xs={9}>
          <Card className="shadow-sm rounded-3 p-3">

            <TabFilters
              activeTab={activeTab}
              searchTerm={searchTerm}
              setSearchTerm={setSearchTerm}
              resourceType={resourceType}
              setResourceType={setResourceType}
              feedbackType={feedbackType}
              setFeedbackType={setFeedbackType}
              feedbackRating={feedbackRating}
              setFeedbackRating={setFeedbackRating}
            />

            <h4 className="fw-bold text-primary">{activeData.title}</h4>

            {loading ? (
              <div className="text-center"><Spinner animation="border" /></div>
            ) : (
              <CustomTable
                columns={activeData.columns}
                data={activeData.data}
                actions={makeActions(activeData.type)}
                rowKey={(item) => item._id}
              />
            )}
          </Card>
        </Col>
      </Row>

      <ConfirmModal
        show={showConfirm}
        onHide={() => setShowConfirm(false)}
        onConfirm={handleConfirmDelete}
        message={
          <p>
            Are you sure you want to delete this{" "}
            <span className="fw-bold">{deleteTarget.type}</span>?
          </p>
        }
      />
    </Container>
  );
};

export default Content;