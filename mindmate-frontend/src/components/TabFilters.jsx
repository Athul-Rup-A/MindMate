import React from "react";
import { Form, Button } from "react-bootstrap";

const TabFilters = ({
  activeTab,
  searchTerm,
  setSearchTerm,
  resourceType,
  setResourceType,
  feedbackType,
  setFeedbackType,
  feedbackRating,
  setFeedbackRating,
}) => {
  const handleClear = () => {
    setSearchTerm("");
    setResourceType("");
    setFeedbackType("");
    setFeedbackRating("");
  };

  return (
    <div
      className="d-flex align-items-center gap-2 mb-3 flex-wrap"
      style={{ width: "100%" }}
    >
      {/* Global Search */}
      <Form.Control
        type="text"
        placeholder="Search..."
        style={{ width: "250px" }}
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />

      {/* Resources Dropdown */}
      {activeTab === "resources" && (
        <Form.Select
          style={{ width: "200px" }}
          value={resourceType}
          onChange={(e) => setResourceType(e.target.value)}
        >
          <option value="">All Categories</option>
          <option value="video">Video</option>
          <option value="article">Article</option>
          <option value="pdf">PDF</option>
        </Form.Select>
      )}

      {/* Feedback Filters */}
      {activeTab === "feedbacks" && (
        <>
          <Form.Select
            style={{ width: "180px" }}
            value={feedbackType}
            onChange={(e) => setFeedbackType(e.target.value)}
          >
            <option value="">All Types</option>
            <option value="session">Session</option>
            <option value="platform">Platform</option>
            <option value="content">Content</option>
          </Form.Select>

          <Form.Select
            style={{ width: "150px" }}
            value={feedbackRating}
            onChange={(e) => setFeedbackRating(e.target.value)}
          >
            <option value="">All Ratings</option>
            <option value="1">⭐ 1</option>
            <option value="2">⭐ 2</option>
            <option value="3">⭐ 3</option>
            <option value="4">⭐ 4</option>
            <option value="5">⭐ 5</option>
          </Form.Select>
        </>
      )}

      {/* Clear Button */}
      <Button variant="secondary" onClick={handleClear}>
        Clear
      </Button>
    </div>
  );
};

export default TabFilters;