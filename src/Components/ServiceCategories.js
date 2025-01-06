import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Container, Table, Alert, Spinner } from 'react-bootstrap';

const ServiceCategories = () => {
  const [categories, setCategories] = useState([]); // Stocăm categoriile
  const [loading, setLoading] = useState(true); // Starea de încărcare
  const [error, setError] = useState(null); // Starea de eroare

  const token = localStorage.getItem('token'); // Obținem token-ul din localStorage

  useEffect(() => {
    const fetchCategories = async () => {
      if (!token) {
        setError('User not authenticated. Please log in.');
        setLoading(false);
        return;
      }

      try {
        const response = await axios.get('http://127.0.0.1:8000/api/service_category/', {
          headers: {
            Authorization: `Token ${token}`,
          },
        });
        setCategories(response.data);
      } catch (err) {
        setError('Failed to fetch service categories. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, [token]);

  if (loading) {
    return (
      <Container className="d-flex justify-content-center align-items-center" style={{ height: '100vh' }}>
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

  return (
    <Container className="mt-5">
      <h2>Service Categories</h2>

      {categories.length > 0 ? (
        <Table striped bordered hover>
          <thead>
            <tr>
              <th>#</th>
              <th>Name</th>
            </tr>
          </thead>
          <tbody>
            {categories.map((category, index) => (
              <tr key={category.id}>
                <td>{index + 1}</td>
                <td>{category.name}</td>
              </tr>
            ))}
          </tbody>
        </Table>
      ) : (
        <Alert variant="warning">No service categories found.</Alert>
      )}
    </Container>
  );
};

export default ServiceCategories;
