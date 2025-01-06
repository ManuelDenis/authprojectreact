import React, { useState } from "react";
import axios from "axios";
import { Container, Form, Button, Alert, Spinner } from "react-bootstrap";
import { useNavigate } from "react-router-dom";

const AddCategory = () => {
  const [name, setName] = useState("");
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [token] = useState(localStorage.getItem("token"));
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      await axios.post(
        "http://127.0.0.1:8000/api/service_category/",
        { name },
        { headers: { Authorization: `Token ${token}` } }
      );
      setSuccess(true);
      setTimeout(() => navigate("/"), 2000); // Navigate back after success
    } catch (err) {
      setError(err.response?.data?.detail || "Failed to add category.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container className="mt-5">
      <h2>Add New Category</h2>
      {error && <Alert variant="danger">{error}</Alert>}
      {success && <Alert variant="success">Category added successfully!</Alert>}

      <Form onSubmit={handleSubmit}>
        <Form.Group className="mb-3" controlId="categoryName">
          <Form.Label>Category Name</Form.Label>
          <Form.Control
            type="text"
            placeholder="Enter category name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </Form.Group>
        <Button variant="primary" type="submit" disabled={loading}>
          {loading ? <Spinner animation="border" size="sm" /> : "Add Category"}
        </Button>
      </Form>
    </Container>
  );
};

export default AddCategory;
