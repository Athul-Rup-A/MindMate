import React from 'react';
import { Modal, Button, Form } from 'react-bootstrap';

const ConfirmModal = ({
    show,
    onHide,
    onConfirm,
    message = "Are you sure?",
    darkMode = false,
    showReasonBox = false,
    reason = '',
    setReason = () => { },
    reasonLabel = "Please enter a reason:",
}) => (
    <Modal show={show} onHide={onHide} centered>
        <Modal.Header
            closeButton
            style={{
                backgroundColor: darkMode ? '#f1f1f1' : '',
            }}
        >
            <Modal.Title>Confirm Action</Modal.Title>
        </Modal.Header>
        <Modal.Body
            style={{
                backgroundColor: darkMode ? '#f1f1f1' : '',
            }}
        >
            {typeof message === 'string' ? <p>{message}</p> : message}

            {/* ✅ Optional Reason Box */}
            {showReasonBox && (
                <Form.Group className="mt-3">
                    <Form.Label>{reasonLabel}</Form.Label>
                    <Form.Control
                        as="textarea"
                        rows={3}
                        value={reason}
                        onChange={(e) => setReason(e.target.value)}
                        placeholder="Type your reason here..."
                    />
                </Form.Group>
            )}

        </Modal.Body>
        <Modal.Footer
            style={{
                backgroundColor: darkMode ? '#f1f1f1' : '',
            }}
        >
            <Button variant="secondary" onClick={onHide}>Cancel</Button>
            <Button variant="danger" onClick={onConfirm}>Confirm</Button>
        </Modal.Footer>
    </Modal>
);

export default ConfirmModal;