import React, { useState } from "react";
import { Modal, Button, Form, Alert, Spinner } from "react-bootstrap";
import axios from "axios";

const AddClientModal = ({ show, onClose, onClientAdded }) => {
    const [newClientName, setNewClientName] = useState("");
    const [newClientEmail, setNewClientEmail] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const token = localStorage.getItem("token");

    const handleAddClient = async () => {
        if (!newClientName.trim() || !newClientEmail.trim()) {
            setError("Both name and email are required.");
            return;
        }

        try {
            setLoading(true);
            const response = await axios.post(
                "http://127.0.0.1:8000/api/clients/",
                {
                    name: newClientName,
                    email: newClientEmail,
                },
                {
                    headers: { Authorization: `Token ${token}` },
                }
            );

            onClientAdded(response.data); // Notifică părintele cu clientul adăugat
            setNewClientName("");
            setNewClientEmail("");
            onClose(); // Închide modalul
        } catch (err) {
            setError("Failed to add client.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal show={show} onHide={onClose}>
            <Modal.Header closeButton>
                <Modal.Title>Add Client</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                {error && <Alert variant="danger">{error}</Alert>}
                <Form>
                    <Form.Group className="mb-3">
                        <Form.Label>Name</Form.Label>
                        <Form.Control
                            type="text"
                            placeholder="Enter client name"
                            value={newClientName}
                            onChange={(e) => setNewClientName(e.target.value)}
                        />
                    </Form.Group>
                    <Form.Group className="mb-3">
                        <Form.Label>Email</Form.Label>
                        <Form.Control
                            type="email"
                            placeholder="Enter client email"
                            value={newClientEmail}
                            onChange={(e) => setNewClientEmail(e.target.value)}
                        />
                    </Form.Group>
                </Form>
            </Modal.Body>
            <Modal.Footer>
                <Button variant="secondary" onClick={onClose}>
                    Close
                </Button>
                <Button
                    variant="primary"
                    onClick={handleAddClient}
                    disabled={!newClientName || !newClientEmail}
                >
                    {loading ? <Spinner animation="border" size="sm" /> : "Add Client"}
                </Button>
            </Modal.Footer>
        </Modal>
    );
};

export default AddClientModal;
