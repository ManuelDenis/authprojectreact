import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Table, Alert, Container, Spinner, Button} from 'react-bootstrap';
import { format } from 'date-fns';
import { Link } from 'react-router-dom';
import {BsPlusCircleFill} from "react-icons/bs";

const AppointmentList = () => {
  const [sortedAppointments, setSortedAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sortConfig, setSortConfig] = useState({ key: '', direction: 'asc' });

  const token = localStorage.getItem('token');

  const fetchAppointments = async () => {
    try {
      setLoading(true);
      const response = await axios.get('http://127.0.0.1:8000/api/appointments/', {
        headers: { Authorization: `Token ${token}` },
      });
      setSortedAppointments(response.data); // Initialize sorted list
    } catch (err) {
      console.error('Error fetching appointments:', err);
      setError('Failed to fetch appointments.');
    } finally {
      setLoading(false);
    }
  };

  const handleSort = (key) => {
    let direction = 'asc';

    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }

    setSortConfig({ key, direction });

    const sorted = [...sortedAppointments].sort((a, b) => {
      let aKey = a[key];
      let bKey = b[key];

      if (key === 'client' || key === 'service' || key === 'employee') {
        aKey = a[key]?.name?.toLowerCase();
        bKey = b[key]?.name?.toLowerCase();
      } else if (key === 'date') {
        aKey = new Date(a[key]);
        bKey = new Date(b[key]);
      }

      if (aKey < bKey) return direction === 'asc' ? -1 : 1;
      if (aKey > bKey) return direction === 'asc' ? 1 : -1;
      return 0;
    });

    setSortedAppointments(sorted);
  };

  useEffect(() => {
    fetchAppointments();
  }, []);

  return (
    <Container>
      <h3 className="my-4">Appointment List</h3>

<div className='d-flex justify-content-between align-items-center'>
  {/* Buton pentru adăugarea unei noi categorii */}
  <div
    className="mb-3 text-center d-flex align-items-center gap-2"
    title="Add new category"
    style={{ cursor: "pointer" }}
    onClick={() => window.location.href = '/AddAppointment'} // Navighează la pagina pentru adăugarea categoriei
  >
    <BsPlusCircleFill className='text-info h1' />
    <span className='text-info'>New Appointment</span>
  </div>
</div>


      {error && <Alert variant="danger">{error}</Alert>}
      {loading ? (
        <Spinner animation="border" variant="primary" />
      ) : (
        <>
          <Table striped bordered hover responsive>
            <thead>
              <tr>
                <th>#</th>
                <th style={{ cursor: 'pointer' }} onClick={() => handleSort('client')}>
                  Client {sortConfig.key === 'client' ? (sortConfig.direction === 'asc' ? '↑' : '↓') : ''}
                </th>
                <th style={{ cursor: 'pointer' }} onClick={() => handleSort('service')}>
                  Service {sortConfig.key === 'service' ? (sortConfig.direction === 'asc' ? '↑' : '↓') : ''}
                </th>
                <th style={{ cursor: 'pointer' }} onClick={() => handleSort('employee')}>
                  Employee {sortConfig.key === 'employee' ? (sortConfig.direction === 'asc' ? '↑' : '↓') : ''}
                </th>
                <th style={{ cursor: 'pointer' }} onClick={() => handleSort('date')}>
                  Date {sortConfig.key === 'date' ? (sortConfig.direction === 'asc' ? '↑' : '↓') : ''}
                </th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {sortedAppointments.length > 0 ? (
                sortedAppointments.map((appointment, index) => (
                  <tr key={appointment.id}>
                    <td>{index + 1}</td>
<td>
  <Link to={`/appointments/${appointment.id}`}>
    {appointment.client?.name}
  </Link>
</td>               <td>{appointment.service?.name}</td>
                    <td>{appointment.employee?.name}</td>
                    <td>{format(new Date(appointment.date), 'yyyy-MM-dd HH:mm')}</td>
                    <td>{appointment.status}</td>
                    <td>
                      <Button
                        variant="danger"
                        size="sm"
                        onClick={() => console.log('Delete appointment', appointment.id)}
                      >
                        Delete
                      </Button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" className="text-center">
                    No appointments found.
                  </td>
                </tr>
              )}
            </tbody>
          </Table>
        </>
      )}
    </Container>
  );
};

export default AppointmentList;
