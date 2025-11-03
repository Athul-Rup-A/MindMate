import React from 'react';
import { Row, Col, Form, Button } from 'react-bootstrap';
import Select from 'react-select';

const FilterBar = ({
  filterStatus, setFilterStatus,
  filterDate, setFilterDate,
  filterCounselor, setFilterCounselor,
  allCounselors, selectedCounselor, setSelectedCounselor
}) => {

  const handleClear = () => {
    setFilterStatus('');
    setFilterDate('');
    setFilterCounselor('');
    setSelectedCounselor(null);
  };

  return (
    <Row className="g-3 align-items-center mb-3">
      <Col xs={12} sm={4}>
        <Form.Select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          style={{
            backgroundColor: 'rgba(255,255,255,0.5)',
            color: '#000',
            border: '1px solid rgba(0,0,0,0.2)',
          }}
        >
          <option value="">Filter by Status</option>
          <option value="pending">Pending</option>
          <option value="confirmed">Confirmed</option>
          <option value="rejected">Rejected</option>
          <option value="completed">Completed</option>
        </Form.Select>
      </Col>

      <Col xs={12} sm={3}>
        <Form.Control
          type="date"
          value={filterDate}
          style={{
            backgroundColor: 'rgba(255,255,255,0.5)',
            color: '#000',
            border: '1px solid rgba(0,0,0,0.2)',
          }}
          onChange={(e) => setFilterDate(e.target.value)}
          placeholder="Filter by Date"
        />
      </Col>

      <Col xs={12} sm={4}>
        <Select
          value={selectedCounselor}
          onChange={(option) => {
            setSelectedCounselor(option);
            setFilterCounselor(option?.value || '');
          }}
          options={allCounselors}
          isClearable
          placeholder="Filter by Counselor/Psychologist"
          styles={{
            control: (base) => ({
              ...base,
              backgroundColor: 'rgba(255,255,255,0.5)',
              borderColor: 'rgba(0,0,0,0.2)',
              color: '#000',
            }),
            placeholder: (base) => ({
              ...base,
              color: '#000',
              opacity: 1,
            }),
            singleValue: (base) => ({ ...base, color: '#000' }),
            menu: (base) => ({
              ...base,
              backgroundColor: 'rgba(255,255,255,0.9)',
            }),
          }}
        />
      </Col>

      <Col xs={12} sm={1} className="d-flex justify-content-center">
        <Button variant="secondary" size="sm" onClick={handleClear}>
          Clear
        </Button>
      </Col>
    </Row>
  );
};

export default FilterBar;