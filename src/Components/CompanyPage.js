import React, { useEffect, useState } from "react";
import axios from "axios";
import { Container, Spinner, Alert, Button, Tab, Tabs, Accordion, Card } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import {Col, Row} from "reactstrap";

const CompanyPage = () => {
  const [token] = useState(localStorage.getItem("token"));
  const [company, setCompany] = useState(null);
  const [serviceCategories, setServiceCategories] = useState([]); // Lista de categorii și servicii
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [key, setKey] = useState("details"); // State pentru tab-urile active
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCompany = async () => {
      try {
        const response = await axios.get("http://127.0.0.1:8000/api/company/", {
          headers: { Authorization: `Token ${token}` },
        });
        setCompany(response.data[0]); // Presupunem că API-ul returnează o singură companie
      } catch (err) {
        setError(err.response?.data?.detail || "Failed to fetch company data.");
      }
    };

    const fetchServiceCategories = async () => {
      try {
        const response = await axios.get("http://127.0.0.1:8000/api/service_category/", {
          headers: { Authorization: `Token ${token}` },
        });
        setServiceCategories(response.data); // Setăm categoriile cu serviciile aferente
      } catch (err) {
        setError(err.response?.data?.detail || "Failed to fetch service categories.");
      }
    };

    const fetchData = async () => {
      setLoading(true);
      await Promise.all([fetchCompany(), fetchServiceCategories()]);
      setLoading(false);
    };

    fetchData();
  }, [token]);

  if (loading) {
    return (
      <Container className="d-flex justify-content-center align-items-center" style={{ height: "100vh" }}>
        <Spinner animation="border" />
      </Container>
    );
  }

  if (error) {
    return (
      <Container className="mt-5">
        <Alert variant="danger">{error}</Alert>
      </Container>
    );
  }

  if (!company) {
    return (
      <Container className="mt-5 text-center">
        <Alert variant="warning">No company data found.</Alert>
        <Button variant="primary" onClick={() => navigate("/addcompany")}>
          Add a Company
        </Button>
      </Container>
    );
  }

  return (
    <Container className="mt-5">
      <h2>Company Details</h2>
      <Tabs
        id="company-tabs"
        activeKey={key}
        onSelect={(k) => setKey(k)}
        className="mb-3"
      >
        {/* First Tab: Company Details */}
        <Tab eventKey="details" title="Details">
          <p>
            <strong>Name:</strong> {company.name}
          </p>
          <Button
            variant="warning"
            onClick={() => navigate(`/UpdateCompany/${company.id}`)}
          >
            Update Company
          </Button>
        </Tab>


        {/* Third Tab: Placeholder Example */}
        <Tab eventKey="other" title="Other Info">
          <p>More information about the company can go here.</p>
        </Tab>
      </Tabs>
    </Container>
  );
};

export default CompanyPage;
