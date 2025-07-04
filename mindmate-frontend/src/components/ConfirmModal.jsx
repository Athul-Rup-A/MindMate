import React from 'react';
import { Modal, Button } from 'react-bootstrap';

const ConfirmModal = ({ show, onHide, onConfirm, message = "Are you sure?" }) => (
    <Modal show={show} onHide={onHide} centered>
        <Modal.Header closeButton>
            <Modal.Title>Confirm Action</Modal.Title>
        </Modal.Header>
        <Modal.Body>
            {typeof message === 'string' ? <p>{message}</p> : message}
        </Modal.Body>
        <Modal.Footer>
            <Button variant="secondary" onClick={onHide}>Cancel</Button>
            <Button variant="danger" onClick={onConfirm}>Confirm</Button>
        </Modal.Footer>
    </Modal>
);

export default ConfirmModal;