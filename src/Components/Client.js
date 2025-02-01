import React, { useEffect, useState } from "react";
import axios from "axios";
import { Table, Container, Spinner, Alert, Button, Modal, Form } from "react-bootstrap";
import { FaTrash } from "react-icons/fa";
import { BsPlusCircleFill } from "react-icons/bs"; // Pentru iconița Add
import AddClientModal from "./AddClientModal"; // Importăm AddClientModal

function ClientTable() {
  const [clients, setClients] = useState([]);
  const [clientToDelete, setClientToDelete] = useState(null);
  const [clientToEdit, setClientToEdit] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false); // Pentru controlul modalului AddClientModal
  const token = localStorage.getItem("token");

  useEffect(() => {
    if (token) {
      fetchClients();
    }
  }, [token]);

  const fetchClients = async () => {
    try {
      setLoading(true);
      const response = await axios.get("http://127.0.0.1:8000/api/clients/", {
        headers: { Authorization: `Token ${token}` },
      });
      setClients(response.data);
    } catch (err) {
      setError("Failed to fetch clients.");
    } finally {
      setLoading(false);
    }
  };

  const handleClientAdded = (newClient) => {
    setClients([...clients, newClient]);
    setSuccess("Client added successfully.");
  };

  const handleEditClient = (client) => {
    setClientToEdit(client);
    setShowEditModal(true);
  };

  const saveClientChanges = async () => {
    if (!clientToEdit.name.trim() || !clientToEdit.email.trim()) {
      setError("Both name and email are required.");
      return;
    }

    try {
      setLoading(true);
      const response = await axios.put(
        `http://127.0.0.1:8000/api/clients/${clientToEdit.id}/`,
        {
          name: clientToEdit.name,
          email: clientToEdit.email,
        },
        {
          headers: { Authorization: `Token ${token}` },
        }
      );

      setClients((prevClients) =>
        prevClients.map((client) =>
          client.id === response.data.id ? response.data : client
        )
      );

      setSuccess("Client updated successfully.");
      setShowEditModal(false);
    } catch (err) {
      setError("Failed to update client.");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteClick = (client) => {
    setClientToDelete(client);
  };

  const confirmDelete = async () => {
    if (clientToDelete) {
      try {
        await axios.delete(`http://127.0.0.1:8000/api/clients/${clientToDelete.id}/`, {
          headers: { Authorization: `Token ${token}` },
        });
        setClients(clients.filter((c) => c.id !== clientToDelete.id));
        setClientToDelete(null);
      } catch (err) {
        setError("Failed to delete client.");
      }
    }
  };

  return (
    <Container>
      <h3>Client List</h3>
      {loading && <Spinner animation="border" role="status"><span className="visually-hidden">Loading...</span></Spinner>}
      {error && <Alert variant="danger">{error}</Alert>}
      {success && <Alert variant="success">{success}</Alert>}
      <div className="mt-3 mb-3">
        <BsPlusCircleFill
          className="text-success h3"
          style={{ cursor: "pointer" }}
          onClick={() => setShowAddModal(true)}
        />
        Add Client
      </div>
      <Table striped bordered hover>
        <thead>
          <tr>
            <th>#</th>
            <th>Name</th>
            <th>Email</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {clients.map((client, index) => (
            <tr key={client.id}>
              <td>{index + 1}</td>
              <td onClick={() => handleEditClient(client)} style={{ cursor: "pointer" }}>
                {client.name}
              </td>
              <td>{client.email}</td>
              <td>
                <Button variant="danger" size="sm" onClick={() => handleDeleteClick(client)}>
                  <FaTrash /> Delete
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>

      {/* Add Client Modal */}
      <AddClientModal
        show={showAddModal}
        onClose={() => setShowAddModal(false)}
        onClientAdded={handleClientAdded}
      />

      {/* Edit Client Modal */}
      <Modal show={showEditModal} onHide={() => setShowEditModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Edit Client</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form noValidate>
            <Form.Group className="mb-3">
              <Form.Label>Name</Form.Label>
              <Form.Control
                type="text"
                value={clientToEdit?.name || ""}
                onChange={(e) =>
                  setClientToEdit((prev) => ({ ...prev, name: e.target.value }))
                }
                isInvalid={!clientToEdit?.name?.trim()}
              />
              <Form.Control.Feedback type="invalid">
                Name is required.
              </Form.Control.Feedback>
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Email</Form.Label>
              <Form.Control
                type="email"
                value={clientToEdit?.email || ""}
                onChange={(e) =>
                  setClientToEdit((prev) => ({ ...prev, email: e.target.value }))
                }
                isInvalid={
                  clientToEdit?.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(clientToEdit.email)
                }
              />
              <Form.Control.Feedback type="invalid">
                Please enter a valid email address.
              </Form.Control.Feedback>
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowEditModal(false)}>
            Close
          </Button>
          <Button
            variant="primary"
            onClick={saveClientChanges}
            disabled={
              !clientToEdit?.name?.trim() ||
              !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(clientToEdit?.email)
            }
          >
            Save Changes
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Confirm Delete Modal */}
      <Modal show={!!clientToDelete} onHide={() => setClientToDelete(null)}>
        <Modal.Header closeButton>
          <Modal.Title>Confirm Deletion</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          Are you sure you want to delete the client{" "}
          <strong>{clientToDelete?.name}</strong>?
          <br />
          This action cannot be undone.
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setClientToDelete(null)}>
            Cancel
          </Button>
          <Button variant="danger" onClick={confirmDelete}>
            Delete
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
}

export default ClientTable;
