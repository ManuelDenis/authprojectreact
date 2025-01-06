import React, { useState, useEffect } from 'react';
import { Container, Alert, Button, Form } from 'react-bootstrap';
import axios from 'axios';
import { useNavigate, useParams } from 'react-router-dom';

const UpdateCompany = () => {
  const [name, setName] = useState('');
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { id } = useParams(); // The id of the company to update from the URL

  useEffect(() => {
    const fetchCompany = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        setError('User not authenticated. Please log in.');
        setLoading(false);
        return;
      }

      try {
        const response = await axios.get(`http://127.0.0.1:8000/api/company/${id}/`, {
          headers: {
            Authorization: `Token ${token}`,
          },
        });

        // Set company name in the state
        setName(response.data.name);
      } catch (err) {
        if (err.response && err.response.status === 401) {
          setError('User not authenticated. Please log in.');
        } else {
          setError('You do not have permission to update this company.');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchCompany();
  }, [id]);

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
      await axios.put(
        `http://127.0.0.1:8000/api/company/${id}/`,
        { name },
        {
          headers: {
            Authorization: `Token ${token}`,
          },
        }
      );

      setSuccess('Company updated successfully!');
      setTimeout(() => navigate('/CompanyPage'), 2000); // Redirect after 2 seconds
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

  return (
    <Container className="mt-5">
      <h2>Update Company</h2>

      {/* If not authenticated, show an error message and redirect button */}
      {error === 'User not authenticated. Please log in.' && (
        <Alert variant="danger">
          {error}
          <div className="mt-3">
            <Button variant="primary" onClick={() => navigate('/login')}>
              Go to Login Page
            </Button>
          </div>
        </Alert>
      )}

      {/* If the user is logged in but lacks permissions, show an error */}
      {error === 'You do not have permission to update this company.' && (
        <Alert variant="danger">{error}</Alert>
      )}

      {/* If success, show success message and redirect button */}
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

      {/* Show the form only if there is no error or success */}
      {!error && !success && (
        <Form onSubmit={handleSubmit}>
          <Form.Group controlId="companyName" className="mb-3">
            <Form.Label>Company Name</Form.Label>
            <Form.Control
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </Form.Group>

          <Button type="submit" variant="primary">
            Update Company
          </Button>
        </Form>
      )}
    </Container>
  );
};

export default UpdateCompany;
