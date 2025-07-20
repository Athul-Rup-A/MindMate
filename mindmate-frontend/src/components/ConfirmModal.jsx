import React from 'react';
import { Modal, Button } from 'react-bootstrap';

const ConfirmModal = ({ show, onHide, onConfirm, message = "Are you sure?", darkMode = false }) => (
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