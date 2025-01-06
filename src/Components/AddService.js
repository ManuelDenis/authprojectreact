import React, { useState, useEffect } from "react";
import axios from "axios";
import { Container, Form, Button, Alert, Spinner } from "react-bootstrap";
import { useNavigate } from "react-router-dom";

const AddService = () => {
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [serviceName, setServiceName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [token] = useState(localStorage.getItem("token"));
  const navigate = useNavigate();

  // Fetch service categories for the logged-in user
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoading(true);
        const response = await axios.get("http://127.0.0.1:8000/api/service_category/", {
          headers: { Authorization: `Token ${token}` },
        });
        setCategories(response.data);
      } catch (err) {
        setError("Failed to fetch categories. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, [token]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!selectedCategory || !serviceName) {
      setError("Please fill in all fields.");
      return;
    }

    try {
      setLoading(true);
      const response = await axios.post(
        "http://127.0.0.1:8000/api/services/",
        { name: serviceName, service_category: selectedCategory },
        {
          headers: { Authorization: `Token ${token}` },
        }
      );
      setSuccess("Service added successfully!");
      setServiceName("");
      setSelectedCategory("");
    } catch (err) {
      setError("Failed to add service. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (loading && categories.length === 0) {
    return (
      <Container className="d-flex justify-content-center align-items-center" style={{ height: "100vh" }}>
        <Spinner animation="border" />
      </Container>
    );
  }

  return (
    <Container className="mt-5">
      <h2>Add New Service</h2>
      {error && <Alert variant="danger">{error}</Alert>}
      {success && <Alert variant="success">{success}</Alert>}
      <Form onSubmit={handleSubmit}>
        <Form.Group className="mb-3">
          <Form.Label>Select Category</Form.Label>
          <Form.Select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            required
          >
            <option value="">-- Select a Category --</option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </Form.Select>
        </Form.Group>
        <Form.Group className="mb-3">
          <Form.Label>Service Name</Form.Label>
          <Form.Control
            type="text"
            placeholder="Enter service name"
            value={serviceName}
            onChange={(e) => setServiceName(e.target.value)}
            required
          />
        </Form.Group>
        <Button type="submit" variant="primary" disabled={loading}>
          {loading ? "Adding Service..." : "Add Service"}
        </Button>
        <Button variant="secondary" className="ms-3" onClick={() => navigate(-1)}>
          Cancel
        </Button>
      </Form>
    </Container>
  );
};

export default AddService;
