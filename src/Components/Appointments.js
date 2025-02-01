import React, { useState, useEffect } from 'react';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import axios from 'axios';
import { Container, Row, Col, ListGroup, Alert, Spinner } from 'react-bootstrap';

const Appointments = () => {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [appointments, setAppointments] = useState([]);
  const [filteredAppointments, setFilteredAppointments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Fetch all appointments when component mounts
    const fetchAppointments = async () => {
      try {
        setLoading(true);
        const response = await axios.get('http://127.0.0.1:8000/api/appointments/', {
          headers: { Authorization: `Token ${localStorage.getItem('token')}` },
        });
        setAppointments(response.data);
      } catch (err) {
        console.error('Error fetching appointments:', err);
        setError('Failed to fetch appointments. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchAppointments();
  }, []);

  useEffect(() => {
    // Filter appointments based on selected date
    const filtered = appointments.filter((appointment) => {
      const appointmentDate = new Date(appointment.date).toDateString();
      return appointmentDate === selectedDate.toDateString();
    });
    setFilteredAppointments(filtered);
  }, [selectedDate, appointments]);

  const handleDateChange = (date) => {
    setSelectedDate(date);
  };

  return (
    <Container fluid className="appointments-page">
      <Row>
        {/* Lista programărilor */}
        <Col md={9} className="appointments-list">
          <h4>Appointments on {selectedDate.toDateString()}</h4>
          {loading && <Spinner animation="border" variant="primary" />}
          {error && <Alert variant="danger">{error}</Alert>}
          {!loading && filteredAppointments.length === 0 && (
            <Alert variant="info">No appointments for this day.</Alert>
          )}
          <ListGroup>
            {filteredAppointments.map((appointment) => (
              <ListGroup.Item key={appointment.id}>
                <div>
                  <strong>Client:</strong> {appointment.client.name}
                </div>
                <div>
                  <strong>Service:</strong> {appointment.service.name}
                </div>
                <div>
                  <strong>Employee:</strong> {appointment.employee.name}
                </div>
                <div>
                  <strong>Time:</strong> {new Date(appointment.date).toLocaleTimeString()}
                </div>
              </ListGroup.Item>
            ))}
          </ListGroup>
        </Col>

        {/* Calendarul */}
        <Col md={3} className="calendar-section">
          <h4>Select a Date</h4>
          <Calendar value={selectedDate} onChange={handleDateChange} />
        </Col>
      </Row>
    </Container>
  );
};

export default Appointments;
