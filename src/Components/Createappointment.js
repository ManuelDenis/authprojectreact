import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Alert, Container, Row, Col, Button, Spinner } from 'react-bootstrap';
import Autocomplete from '@mui/material/Autocomplete';
import TextField from '@mui/material/TextField';
import {Stack} from "@mui/material";
import AddClientModal from "./AddClientModal";
import Fab from '@mui/material/Fab';
import AddIcon from '@mui/icons-material/Add';

const CreateAppointment = () => {
    const token = localStorage.getItem("token");
    const [clients, setClients] = useState([]);
    const [showAddClientModal, setShowAddClientModal] = useState(false);

    const [categories, setCategories] = useState([]);
    const [services, setServices] = useState([]);
    const [filteredServices, setFilteredServices] = useState([]); // Servicii filtrate
    const [filteredEmployees, setFilteredEmployees] = useState([]); // Angajați filtrați
    const [selectedCategory, setSelectedCategory] = useState(null); // Categoria selectată
    const [employees, setEmployees] = useState([]);
    const [formData, setFormData] = useState({
    client: null, // va stoca întregul obiect client
    service: null, // va stoca întregul obiect service
    employee: null, // va stoca întregul obiect employee
    date: '',
    });

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(false);

    const [payload, setPayload] = useState({})


    // Fetch clients
    const fetchClients = async () => {
        try {
            setLoading(true);
            const response = await axios.get("http://127.0.0.1:8000/api/clients/", {
                headers: { Authorization: `Token ${localStorage.getItem('token')}` },
            });
            setClients(response.data);
        } catch (err) {
            console.error('Error fetching clients:', err);
            setError("Failed to fetch clients.");
        } finally {
            setLoading(false);
        }
    };
    const handleClientAdded = (newClient) => {
        setClients((prevClients) => [...prevClients, newClient]); // Adaugă clientul în lista locală
        setFormData({ ...formData, client: newClient }); // Selectează automat clientul nou creat
    };

    // Fetch services
    const fetchServices = async () => {
        try {
            setLoading(true);
            const response = await axios.get("http://127.0.0.1:8000/api/services/", {
                headers: { Authorization: `Token ${token}` },
            });
            setServices(response.data);
            setFilteredServices(response.data); // Initializează lista de servicii filtrate
        } catch (err) {
            console.error('Error fetching services:', err);
            setError("Failed to fetch services.");
        } finally {
            setLoading(false);
        }
    };
    useEffect(() => {
        // Fetch all data
        const fetchData = async () => {
            await Promise.all([fetchClients(), fetchCategories(), fetchServices(), fetchEmployees()]);
        };
        fetchData();
    }, []);

    const fetchCategories = async () => {
      try {
        setLoading(true);
        const response = await axios.get("http://127.0.0.1:8000/api/service_category/", {
          headers: { Authorization: `Token ${token}` },
        });
        setCategories(response.data);
      } catch (err) {
        setError("Failed to fetch categories.");
      } finally {
        setLoading(false);
      }
    };
    useEffect(() => {
    if (selectedCategory !== null) {
        const filtered = services.filter(
            (service) => service.service_category === selectedCategory
        );
        setFilteredServices(filtered);
    } else {
        setFilteredServices(services); // Toate serviciile dacă nicio categorie nu este selectată
    }

    // Resetează serviciul selectat
    setFormData((prevFormData) => ({
        ...prevFormData,
        service: null,
    }));
    }, [selectedCategory, services]);



    // Fetch employees
    const fetchEmployees = async () => {
        try {
            setLoading(true);
            const response = await axios.get("http://127.0.0.1:8000/api/employees/", {
                headers: { Authorization: `Token ${localStorage.getItem('token')}` },
            });
            setEmployees(response.data);
        } catch (err) {
            console.error('Error fetching employees:', err);
            setError("Failed to fetch employees.");
        } finally {
            setLoading(false);
        }
    };
    // Actualizare pentru angajați bazate pe categorie
    useEffect(() => {
    if (selectedCategory !== null) {
        // Găsește angajații din categoria selectată
        const category = categories.find((cat) => cat.id === selectedCategory);
        const categoryEmployees = category?.employees || [];

        // Creează lista completă: angajații categoriei + restul angajaților
        const allEmployees = [
            ...categoryEmployees,
            ...employees.filter((emp) => !categoryEmployees.some((catEmp) => catEmp.id === emp.id)),
        ];

        setFilteredEmployees(allEmployees);
    } else {
        setFilteredEmployees(employees); // Toți angajații dacă nicio categorie nu este selectată
    }

    // Resetează angajatul selectat
    setFormData((prevFormData) => ({
        ...prevFormData,
        employee: null,
    }));
}, [selectedCategory, categories, employees]);


    useEffect(() => {
        // Fetch all data
        const fetchData = async () => {
            await Promise.all([fetchClients(), fetchServices(), fetchEmployees()]);
        };
        fetchData();
    }, []);

    const handleChange = (name, value) => {
    setFormData({ ...formData, [name]: value });
    };

    const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    try {
        setLoading(true);

        // Trimite doar ID-urile la backend
        const payload = {
            client_id: formData.client?.id || null,
            service_id: formData.service?.id || null,
            employee_id: formData.employee?.id || null,
            date: formData.date || null, // Trimite date doar dacă este valid
        };
        setPayload(payload);

        await axios.post('http://127.0.0.1:8000/api/appointments/', payload, {
            headers: { Authorization: `Token ${token}` },
        });

        setSuccess(true);
        setFormData({
            client: null,
            service: null,
            employee: null,
            date: '',
        });
    } catch (err) {
        // Extrage eroarea specifică din răspunsul API
        if (err.response && err.response.data && err.response.data.date) {
            setError(err.response.data.date[0]); // Setează primul mesaj de eroare
        } else {
            setError('Failed to create appointment. Please try again.');
        }
        console.error('Error creating appointment:', err);
    } finally {
        setLoading(false);
    }
};

    return (
        <Container>
            <Row>
                <Col md={4}>
                    <a href="/AppointmentList">Appointments list</a>
                    <h5 className="text-secondary">Create New Appointment</h5><hr/>
                    {error && <Alert variant="danger">{error}</Alert>}
                    {success && <Alert variant="success">Appointment created successfully!</Alert>}
                    {loading && <Spinner animation="border" variant="primary" className="mb-3" />}
                    <form onSubmit={handleSubmit}>
                        <Stack spacing={3}>

<div className="d-flex flex-wrap align-items-center gap-3 mb-3">
  {/* Autocomplete component */}


<Autocomplete
  size="small"
  className="flex-grow-1 rounded-5 shadow"
  sx={{
    '& .MuiOutlinedInput-root': {
      border: 'none',
      boxShadow: 'none',
      borderRadius: '0.3',
    },
    '& .MuiOutlinedInput-notchedOutline': {
      borderRadius: '1rem', // Asigurați-vă că conturul respectă aceleași reguli
    },
  }}
  disablePortal
  options={clients}
  getOptionLabel={(option) => option.name || ''}
  isOptionEqualToValue={(option, value) => option.id === value?.id}
  value={formData.client || null}
  onChange={(e, newValue) => handleChange('client', newValue || null)}
  renderInput={(params) => (
    <TextField {...params} label="Select a client" variant="outlined" required />
  )}
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

<div className="d-flex flex-column mb-3 border-warning rounded">
  {/* Category Selection */}
  <div className="border-1 p-3 rounded">
    <Autocomplete
      sx={{
        '& .MuiOutlinedInput-root': {
          border: 'none',
          boxShadow: 'none',
          borderRadius: '0.3',
        },
        '& .MuiOutlinedInput-notchedOutline': {
          borderRadius: '1rem', // Asigurați-vă că conturul respectă aceleași reguli
        },
      }}
      size="small"
      className="rounded-5 shadow"
      options={categories}
      getOptionLabel={(option) => option.name || ''}
      isOptionEqualToValue={(option, value) => option.id === value}
      value={categories.find((category) => category.id === selectedCategory) || null} // Setează valoarea corectă
      onChange={(event, newValue) => {
        console.log('Selected category ID:', newValue ? newValue.id : null); // Debugging
        setSelectedCategory(newValue ? newValue.id : null); // Setează doar ID-ul
      }}
      renderInput={(params) => (
        <TextField
          {...params}
          label="Select a category"
          variant="outlined"
          required
        />
      )}
    />
  </div>

  {/* Service Selection */}
  <div className="border-1 p-3 rounded">
    <Autocomplete
      sx={{
        '& .MuiOutlinedInput-root': {
          border: 'none',
          boxShadow: 'none',
          borderRadius: '0.3',
        },
        '& .MuiOutlinedInput-notchedOutline': {
          borderRadius: '1rem', // Asigurați-vă că conturul respectă aceleași reguli
        },
      }}
      size="small"
      className="rounded-5 shadow"
      options={filteredServices}
      getOptionLabel={(option) => option.name || ''}
      isOptionEqualToValue={(option, value) => option.id === value?.id}
      value={formData.service || null}
      onChange={(e, newValue) => handleChange('service', newValue || null)}
      renderInput={(params) => (
        <TextField
          {...params}
          label="Select a service"
          variant="outlined"
          required
        />
      )}
    />
  </div>
</div>


    <Autocomplete
        size="small"
        className="rounded-5 shadow"
        sx={{
            '& .MuiOutlinedInput-root': {
                border: 'none',
                boxShadow: 'none',
                borderRadius: '0.3',
            },
            '& .MuiOutlinedInput-notchedOutline': {
                borderRadius: '1rem', // Asigurați-vă că conturul respectă aceleași reguli
            },
        }}
        disablePortal
        options={filteredEmployees}
        getOptionLabel={(option) => option.name || ''}
        isOptionEqualToValue={(option, value) => option.id === value?.id}
        value={formData.employee || null}
        onChange={(e, newValue) => handleChange('employee', newValue || null)}
        renderInput={(params) => (
            <TextField {...params} label="Select an employee" variant="outlined" required />
        )}
    />


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
                            Create Appointment
                        </Button>
                        </Stack>
                    </form>
                </Col>
            </Row>
        </Container>
    );
};

export default CreateAppointment;
