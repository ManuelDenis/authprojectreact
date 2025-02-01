import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { Alert, Container, Row, Col, Button, Spinner } from 'react-bootstrap';
import Autocomplete from '@mui/material/Autocomplete';
import TextField from '@mui/material/TextField';
import { Stack } from '@mui/material';
import AddClientModal from "./AddClientModal";
import Fab from '@mui/material/Fab';
import AddIcon from '@mui/icons-material/Add';

const AppointmentDetails = () => {
  const { id } = useParams(); // Extragem id-ul programării din URL
  const token = localStorage.getItem('token');
  const [clients, setClients] = useState([]);
  const [categories, setCategories] = useState([]);
  const [services, setServices] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [filteredServices, setFilteredServices] = useState([]);
  const [filteredEmployees, setFilteredEmployees] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [showAddClientModal, setShowAddClientModal] = useState(false);

  const [formData, setFormData] = useState({
    client: null,
    service: null,
    employee: null,
    date: '',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  // Fetch appointment details
  const fetchAppointmentDetails = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`http://127.0.0.1:8000/api/appointments/${id}/`, {
        headers: { Authorization: `Token ${token}` },
      });
      const appointment = response.data;
      setFormData({
        client: appointment.client,
        service: appointment.service,
        employee: appointment.employee,
        date: new Date(appointment.date).toISOString().slice(0, 16), // Format pentru <input type="datetime-local">
      });

      // Setăm categoria selectată bazată pe serviciu
      if (appointment.service?.service_category) {
        setSelectedCategory(appointment.service.service_category);
      }
    } catch (err) {
      console.error('Error fetching appointment details:', err);
      setError('Failed to fetch appointment details.');
    } finally {
      setLoading(false);
    }
  };

  // Fetch clients
  const fetchClients = async () => {
    try {
      const response = await axios.get('http://127.0.0.1:8000/api/clients/', {
        headers: { Authorization: `Token ${token}` },
      });
      setClients(response.data);
    } catch (err) {
      console.error('Error fetching clients:', err);
      setError('Failed to fetch clients.');
    }
  };
    const handleClientAdded = (newClient) => {
        setClients((prevClients) => [...prevClients, newClient]); // Adaugă clientul în lista locală
        setFormData({ ...formData, client: newClient }); // Selectează automat clientul nou creat
    };  // Fetch categories


  const fetchCategories = async () => {
    try {
      const response = await axios.get('http://127.0.0.1:8000/api/service_category/', {
        headers: { Authorization: `Token ${token}` },
      });
      setCategories(response.data);
    } catch (err) {
      console.error('Error fetching categories:', err);
      setError('Failed to fetch categories.');
    }
  };

  // Fetch services
  const fetchServices = async () => {
    try {
      const response = await axios.get('http://127.0.0.1:8000/api/services/', {
        headers: { Authorization: `Token ${token}` },
      });
      setServices(response.data);
      setFilteredServices(response.data);
    } catch (err) {
      console.error('Error fetching services:', err);
      setError('Failed to fetch services.');
    }
  };

  // Fetch employees
  const fetchEmployees = async () => {
    try {
      const response = await axios.get('http://127.0.0.1:8000/api/employees/', {
        headers: { Authorization: `Token ${token}` },
      });
      setEmployees(response.data);
    } catch (err) {
      console.error('Error fetching employees:', err);
      setError('Failed to fetch employees.');
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      await Promise.all([fetchClients(), fetchCategories(), fetchServices(), fetchEmployees()]);
      await fetchAppointmentDetails();
    };
    fetchData();
  }, []);

  useEffect(() => {
    // Actualizează lista de servicii filtrate bazată pe categoria selectată
    if (selectedCategory !== null) {
      setFilteredServices(services.filter((service) => service.service_category === selectedCategory));
    } else {
      setFilteredServices(services);
    }

    setFormData((prevFormData) => ({ ...prevFormData, service: null }));
  }, [selectedCategory, services]);

  useEffect(() => {
    // Actualizează lista de angajați filtrată
    if (selectedCategory !== null) {
      const category = categories.find((cat) => cat.id === selectedCategory);
      const categoryEmployees = category?.employees || [];
      const allEmployees = [
        ...categoryEmployees,
        ...employees.filter((emp) => !categoryEmployees.some((catEmp) => catEmp.id === emp.id)),
      ];
      setFilteredEmployees(allEmployees);
    } else {
      setFilteredEmployees(employees);
    }

    setFormData((prevFormData) => ({ ...prevFormData, employee: null }));
  }, [selectedCategory, categories, employees]);

  const handleChange = (name, value) => {
    setFormData({ ...formData, [name]: value });
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    const payload = {
      client_id: formData.client?.id || null,
      service_id: formData.service?.id || null,
      employee_id: formData.employee?.id || null,
      date: formData.date || null,
    };

    try {
      setLoading(true);
      await axios.put(`http://127.0.0.1:8000/api/appointments/${id}/`, payload, {
        headers: { Authorization: `Token ${token}` },
      });
      setSuccess(true);
    } catch (err) {
      console.error('Error updating appointment:', err);
      setError('Failed to update appointment. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container>
      <Row>
        <Col md={4}>
          <h5 className="text-secondary">Update Appointment</h5>
          <hr />
          {error && <Alert variant="danger">{error}</Alert>}
          {success && <Alert variant="success">Appointment updated successfully!</Alert>}
          {loading && <Spinner animation="border" variant="primary" className="mb-3" />}
          <form onSubmit={handleSave}>
            <Stack spacing={3}>


              {/* Client Selection */}
<div className="d-flex flex-wrap align-items-center gap-3 mb-3">
              <Autocomplete
  className="flex-grow-1 rounded-5 shadow"
                  size='small'
  sx={{
    '& .MuiOutlinedInput-root': {
      border: 'none',
      boxShadow: 'none',
      borderRadius: '0.3',
    },
    '& .MuiOutlinedInput-notchedOutline': {
      borderRadius: '1rem', // Asigurați-vă că conturul respectă aceleași reguli
    },
  }}                options={clients}
                getOptionLabel={(option) => option.name || ''}
                value={formData.client || null}
                onChange={(e, newValue) => handleChange('client', newValue || null)}
                renderInput={(params) => <TextField {...params} label="Select a client" required />}
              />

    <div className='bg-info ps-1 rounded-pill shadow'>
    Add new

  {/* Add New Client Button */}
 <Fab
     className='ms-1'
    size='small'
    color="primary"
    aria-label="add"
    onClick={() => setShowAddClientModal(true)}
>
  <AddIcon />
</Fab>
</div>


  {/* Add Client Modal */}
  <AddClientModal
    show={showAddClientModal}
    onClose={() => setShowAddClientModal(false)}
    onClientAdded={handleClientAdded}
  />
</div>

              {/* Category Selection */}
              <Autocomplete
                  size='small'
  sx={{
    '& .MuiOutlinedInput-root': {
      border: 'none',
      boxShadow: 'none',
      borderRadius: '0.3',
    },
    '& .MuiOutlinedInput-notchedOutline': {
      borderRadius: '1rem', // Asigurați-vă că conturul respectă aceleași reguli
    },
  }}                 options={categories}
                getOptionLabel={(option) => option.name || ''}
                value={categories.find((cat) => cat.id === selectedCategory) || null}
                onChange={(e, newValue) => setSelectedCategory(newValue?.id || null)}
                renderInput={(params) => <TextField {...params} label="Select a category" required />}
              />

              {/* Service Selection */}
              <Autocomplete
                  size='small'
  sx={{
    '& .MuiOutlinedInput-root': {
      border: 'none',
      boxShadow: 'none',
      borderRadius: '0.3',
    },
    '& .MuiOutlinedInput-notchedOutline': {
      borderRadius: '1rem', // Asigurați-vă că conturul respectă aceleași reguli
    },
  }}                 options={filteredServices}
                getOptionLabel={(option) => option.name || ''}
                value={formData.service || null}
                onChange={(e, newValue) => handleChange('service', newValue || null)}
                renderInput={(params) => <TextField {...params} label="Select a service" required />}
              />

              {/* Employee Selection */}
              <Autocomplete
                  size='small'
  sx={{
    '& .MuiOutlinedInput-root': {
      border: 'none',
      boxShadow: 'none',
      borderRadius: '0.3',
    },
    '& .MuiOutlinedInput-notchedOutline': {
      borderRadius: '1rem', // Asigurați-vă că conturul respectă aceleași reguli
    },
  }}                 options={filteredEmployees}
                getOptionLabel={(option) => option.name || ''}
                value={formData.employee || null}
                onChange={(e, newValue) => handleChange('employee', newValue || null)}
                renderInput={(params) => <TextField {...params} label="Select an employee" required />}
              />

              {/* Date & Time */}
              <TextField
                label="Date & Time"
                type="datetime-local"
                fullWidth
                value={formData.date}
                onChange={(e) => handleChange('date', e.target.value)}
                InputLabelProps={{ shrink: true }}
                margin="normal"
              />

              <Button type="submit" variant="primary" className="w-100">
                Update
              </Button>
            </Stack>
          </form>
        </Col>
      </Row>
    </Container>
  );
};

export default AppointmentDetails;
