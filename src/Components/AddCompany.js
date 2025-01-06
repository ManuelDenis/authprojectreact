import React, { useState, useEffect } from 'react';
import { Container, Alert, Button } from 'react-bootstrap';
import axios from 'axios';
import { useNavigate } from "react-router-dom";

const AddCompany = () => {
  const [name, setName] = useState('');
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [loading, setLoading] = useState(true); // To handle the initial loading state
  const [hasCompany, setHasCompany] = useState(false); // To check if the user already has a company
  const navigate = useNavigate();

  useEffect(() => {
    const checkUserCompany = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        setError('User not authenticated. Please log in.');
        setLoading(false);
        return;
      }

      try {
        const response = await axios.get('http://127.0.0.1:8000/api/company/', {
          headers: {
            Authorization: `Token ${token}`,
          },
        });

        if (response.data.length > 0) {
          // User already has a company
          setHasCompany(true);
        }
      } catch (err) {
        if (err.response && err.response.status === 401) {
          setError('User not authenticated. Please log in.');
        } else {
          setError('Failed to load company data. Please try again.');
        }
      } finally {
        setLoading(false);
      }
    };

    checkUserCompany();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    const token = localStorage.getItem('token');
    if (!token) {
      setError('User not authenticated. Please log in.');
      return;
    }

    try {
      const response = await axios.post(
        'http://127.0.0.1:8000/api/company/',
        { name }, // Only the name is sent
        {
          headers: {
            Authorization: `Token ${token}`,
          },
        }
      );

      setSuccess('Company added successfully!');
      setName('');
    } catch (err) {
      if (err.response && err.response.data.detail) {
        setError(err.response.data.detail);
      } else {
        setError('Something went wrong. Please try again.');
      }
    }
  };

  if (loading) {
    return (
      <Container className="mt-5">
        <p>Loading...</p>
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

  if (hasCompany) {
    return (
      <Container className="mt-5">
        <Alert variant="info">
          You already have a company associated with your account. You cannot add another one.
        </Alert>
      </Container>
    );
  }

  return (
    <Container className="mt-5">
      <h2>Add Company</h2>

      {success && (
        <Alert variant="success">
          {success}
          <div className="mt-3">
            <Button variant="primary" onClick={() => navigate('/CompanyPage')}>
              Go to Company Page
            </Button>
          </div>
        </Alert>
      )}
      {error && <Alert variant="danger">{error}</Alert>}

      {!success && (
        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label htmlFor="companyName" className="form-label">
              Company Name
            </label>
            <input
              type="text"
              id="companyName"
              className="form-control"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          <Button type="submit" variant="primary">
            Add Company
          </Button>
        </form>
      )}
    </Container>
  );
};

export default AddCompany;
