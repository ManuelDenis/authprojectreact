import React, { useEffect, useState } from "react";
import axios from "axios";
import {Table, Container, Spinner, Button, Modal, Form } from "react-bootstrap";
import { FaTrash } from "react-icons/fa";
import {BsPlusCircleFill} from "react-icons/bs";
import {Col, Row} from "reactstrap";
import { DemoContainer } from '@mui/x-date-pickers/internals/demo';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { TimePicker } from '@mui/x-date-pickers/TimePicker';
import { renderTimeViewClock } from '@mui/x-date-pickers/timeViewRenderers';
import Alert from '@mui/material/Alert';
import dayjs from "dayjs";

function EmployeeTable() {
  const [categories, setCategories] = useState([]);

  const [employees, setEmployees] = useState([]);
  const [newEmployeeName, setNewEmployeeName] = useState("");
  const [employeeToDelete, setEmployeeToDelete] = useState(null);
  const [employeeToEdit, setEmployeeToEdit] = useState(null);
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [showEmployeeModal, setShowEmployeeModal] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  
  const [employeeIdSchedule, setEmployeeIdSchedule] = useState(false);
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [employeeSchedule, setEmployeeSchedule] = useState([]);

  const [newSchedule, setNewSchedule] = useState({
  day_of_week: 0,
  start_time: "",
  end_time: "",
  });
  const [errorTime, setErrorTime] = useState("");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sortDirection, setSortDirection] = useState("asc");

  const [success, setSuccess] = useState(null);

  const token = localStorage.getItem("token");

  // useEffect for fetching data
  useEffect(() => {
    if (token) {
      fetchCategories(); // Call fetchCategories separately
      fetchEmployees();  // Call fetchEmployees separately
    }
  }, [token]);


  // Fetch categories function
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
  const fetchEmployees = async () => {
  try {
    const response = await axios.get("http://127.0.0.1:8000/api/employees/", {
      headers: { Authorization: `Token ${token}` },
    });

    const data = response.data.map((employee) => ({
      id: employee.id,
      name: employee.name,
      user: employee.user,
      categories: employee.service_category_names.join(", "),
      categories_id: employee.service_categories,
      work_schedules: employee.work_schedules,  // Adaugă work_schedules
    }));

    setEmployees(data);
  } catch (err) {
    setError("Failed to fetch employees.");
  } finally {
    setLoading(false);
  }
};

  const handleViewSchedule = (employee) => {
  setEmployeeIdSchedule(employee.id); // Setăm ID-ul angajatului selectat
  setEmployeeSchedule(employee.work_schedules); // Setăm programul angajatului
  setShowScheduleModal(true); // Afișăm modalul
};

  // 🔹 Funcție care verifică dacă end_time este după start_time
  const validateTimes = (start, end) => {
  if (start && end) {
    const startTime = dayjs(start, "HH:mm");
    const endTime = dayjs(end, "HH:mm");

    if (endTime.isBefore(startTime)) {
      setErrorTime("End time must be after start time.");
      return false;
    }
  }
  setErrorTime(""); // 🔹 Șterge mesajul de eroare dacă totul e corect
  return true;
};

  const handleAddSchedule = async () => {
  if (newSchedule.day_of_week === null || newSchedule.day_of_week === undefined || !newSchedule.start_time || !newSchedule.end_time) {
  setError("Please fill out all fields before adding a schedule.");
  return;
  }

  try {
    const response = await axios.post(
      "http://127.0.0.1:8000/api/workschedule/",
      {
        employee: employeeIdSchedule,
        day_of_week: newSchedule.day_of_week,
        start_time: newSchedule.start_time,
        end_time: newSchedule.end_time,
      },
      {
        headers: { Authorization: `Token ${token}` },
      }
    );

    const newScheduleEntry = response.data;

    // Actualizăm lista de programe afișată în modal
    setEmployeeSchedule((prevSchedules) => [...prevSchedules, newScheduleEntry]);

    // 🛠 Actualizăm lista principală `employees`
    setEmployees((prevEmployees) =>
      prevEmployees.map((emp) =>
        emp.id === employeeIdSchedule
          ? { ...emp, work_schedules: [...emp.work_schedules, newScheduleEntry] }
          : emp
      )
    );

    setNewSchedule({
      day_of_week: 0,
      start_time: "",
      end_time: "",
    });

    setSuccess("Schedule added successfully.");
    setTimeout(() => setSuccess(""), 2000); // 🛠️ Șterge mesajul după 2 secunde

   } catch (err) {
    if (err.response && err.response.data) {
      if (err.response.data.non_field_errors) {
        setError(err.response.data.non_field_errors[0]); // Capturăm eroarea de suprapunere
        setTimeout(() => setError(''), 5000)
      } else {
        setError("Failed to add schedule.");
      }
    } else {
      setError("An unexpected error occurred.");
    }
  }
}

  const refreshData = async () => {
  try {
    setLoading(true); // Arată un loader dacă e necesar
    await fetchEmployees();
  } catch (err) {
    setError("Failed to refresh data.");
  } finally {
    setLoading(false); // Oprește loaderul
  }
  };

  const handleAddEmployee = async () => {
  if (selectedCategories.length === 0 || !newEmployeeName.trim()) {
    setError("Please select at least one category and enter an employee name.");
    return;
  }

  try {
    setLoading(true);

    // Add the new employee
    const response = await axios.post(
      "http://127.0.0.1:8000/api/employees/",
      {
        name: newEmployeeName,
        service_categories: selectedCategories.map((category) => category.id),
      },
      {
        headers: { Authorization: `Token ${token}` },
      }
    );

    const addedEmployee = response.data;

    // Update the employee list
    setEmployees((prevEmployees) => [
      ...prevEmployees,
      {
        id: addedEmployee.id,
        name: addedEmployee.name,
        user: addedEmployee.user,
        categories: addedEmployee.service_category_names.join(", "),
      },
    ]);

    // Clear inputs and close modal
    setSuccess("Employee added successfully.");
    setTimeout(() => setSuccess(""), 2000); // 🛠️ Șterge mesajul după 2 secunde
    setNewEmployeeName("");
    setSelectedCategories([]);
    setShowEmployeeModal(false);
    await refreshData();
  } catch (err) {
    setError("Failed to add employee.");
  } finally {
    setLoading(false);
  }
  };

  const handleEditEmployee = (employee) => {
  const associatedCategories = categories.filter((category) =>
    employee.categories_id.includes(category.id) // Comparăm ID-urile categoriilor
  );

  setEmployeeToEdit(employee); // Setăm angajatul curent pentru editare
  setSelectedCategories(associatedCategories); // Preselectăm categoriile asociate
  setShowEditModal(true); // Afișăm modalul
};

  const saveEmployeeChanges = async () => {
    if (!employeeToEdit || !employeeToEdit.name.trim() || selectedCategories.length === 0) {
      setError("Please provide a valid name and select at least one category.");
      return;
    }

    try {
      setLoading(true);
      const response = await axios.put(
        `http://127.0.0.1:8000/api/employees/${employeeToEdit.id}/`,
        {
          name: employeeToEdit.name,
          service_categories: selectedCategories.map((category) => category.id),
        },
        {
          headers: { Authorization: `Token ${token}` },
        }
      );

      const updatedEmployee = response.data;
      setEmployees((prevEmployees) =>
        prevEmployees.map((emp) =>
          emp.id === updatedEmployee.id
            ? {
                ...emp,
                name: updatedEmployee.name,
                categories: updatedEmployee.service_category_names.join(", "),
              }
            : emp
        )
      );

      setSuccess("Employee updated successfully.");
      setShowEditModal(false);
      await refreshData();
    } catch (err) {
      setError("Failed to update employee.");
    } finally {
      setLoading(false);
    }
  };

  const handleSort = () => {
    const sortedData = [...employees].sort((a, b) => {
      if (a.name.toLowerCase() < b.name.toLowerCase())
        return sortDirection === "asc" ? -1 : 1;
      if (a.name.toLowerCase() > b.name.toLowerCase())
        return sortDirection === "asc" ? 1 : -1;
      return 0;
    });
    setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    setEmployees(sortedData);
  };

  const handleDeleteClick = (employee) => {
    setEmployeeToDelete(employee);
    setShowModal(true);
  };

  const confirmDelete = async () => {
    if (employeeToDelete) {
      try {
        await axios.delete(`http://127.0.0.1:8000/api/employees/${employeeToDelete.id}/`, {
          headers: { Authorization: `Token ${token}` },
        });
        setEmployees(employees.filter((e) => e.id !== employeeToDelete.id));
        setShowModal(false);
        setEmployeeToDelete(null);
      } catch (err) {
        setError("Failed to delete employee.");
      }
    }
  };

  if (!token) {
    return <Alert variant="danger">You need to be logged in to view this page.</Alert>;
  }

  return (
    <Container>
      <h3>Employee List</h3>
      {loading && (
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Loading...</span>
        </Spinner>
      )}

      {!loading && employees.length > 0 ? (
        <>

<div className="mt-3 mb-3" title="Add new category" style={{ cursor: "pointer" }}>
  <BsPlusCircleFill
    className="text-warning h3"
    onClick={() => {
      setShowEmployeeModal(true); // Deschide modalul
      setSelectedCategories([]); // Golește selecția categoriilor
    }}
  />
  New employee
</div>


      <Table striped bordered responsive='sm'>
        <thead>
          <tr>
            <th>#</th>
            <th onClick={handleSort} style={{ cursor: "pointer" }}>
              Employee Name {sortDirection === "asc" ? "▲" : "▼"}
            </th>
            <th>Service Categories</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {employees.map((employee, index) => (
            <tr key={employee.id}>
              <td>{index + 1}</td>
              <td onClick={() => handleEditEmployee(employee)} style={{ cursor: "pointer" }}>
                {employee.name}
              </td>
              <td>{employee.categories || "No categories assigned"}</td>
              <td>
                <Button className='rounded-pill' size="sm" onClick={() => handleViewSchedule(employee)}>
                    Schedule
                </Button> |

                <Button className='rounded-pill' variant="danger" size="sm" onClick={() => handleDeleteClick(employee)}>
                  <FaTrash /> Delete
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>

          {/* Modal pentru confirmarea ștergerii */}
      <Modal show={showModal} onHide={() => setShowModal(false)} centered>
            <Modal.Header closeButton>
              <Modal.Title>Confirm Delete</Modal.Title>
            </Modal.Header>
            <Modal.Body>
              Are you sure you want to delete <strong>{employeeToDelete?.name}</strong>?
            </Modal.Body>
            <Modal.Footer>
              <Button variant="secondary" onClick={() => setShowModal(false)}>
                Cancel
              </Button>
              <Button variant="danger" onClick={confirmDelete}>
                Delete
              </Button>
            </Modal.Footer>
          </Modal>
        </>
      ) : (
        !loading && <p>No employees found.</p>
      )}

      <Modal show={showEmployeeModal} onHide={() => setShowEmployeeModal(false)}>
  <Modal.Header closeButton>
    <Modal.Title>Add Employee to Categories</Modal.Title>
  </Modal.Header>
  <Modal.Body>
    <Form>
      <Form.Group className="mb-3">
        <Form.Label>Select Categories<br/><small>You can select one or more categories(Taste Ctrl)</small></Form.Label>
        <Form.Control
          as="select"
          multiple
          value={selectedCategories.map((cat) => cat.id)}
          onChange={(e) => {
            const options = e.target.options;
            const selected = [];
            for (let i = 0; i < options.length; i++) {
              if (options[i].selected) {
                selected.push(
                  categories.find((category) => category.id === parseInt(options[i].value))
                );
              }
            }
            setSelectedCategories(selected);
          }}
        >
          {categories.map((category) => (
            <option key={category.id} value={category.id}>
              {category.name}
            </option>
          ))}
        </Form.Control>
      </Form.Group>
      <Form.Group className="mb-3">
        <Form.Label>Employee Name</Form.Label>
        <Form.Control
          type="text"
          placeholder="Enter employee name"
          value={newEmployeeName}
          onChange={(e) => setNewEmployeeName(e.target.value)}
        />
      </Form.Group>
    </Form>
    {success && <Alert variant="success" className="mt-3">{success}</Alert>}
    {error && <Alert variant="danger" className="mt-3">{error}</Alert>}
  </Modal.Body>
  <Modal.Footer>
    <Button variant="secondary" onClick={() => setShowEmployeeModal(false)}>
      Close
    </Button>
    <Button variant="primary" onClick={handleAddEmployee}>
      Add Employee
    </Button>
  </Modal.Footer>
</Modal>
      <Modal show={showEditModal} onHide={() => setShowEditModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Edit Employee</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>Employee Name</Form.Label>
              <Form.Control
                type="text"
                value={employeeToEdit?.name || ""}
                onChange={(e) =>
                  setEmployeeToEdit((prev) => ({ ...prev, name: e.target.value }))
                }
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Categories <br/><small className='labelsmalltext'>(Ctrl+ for select multiple categories)</small></Form.Label>

              <Form.Control
                as="select"
                multiple
                value={selectedCategories.map((cat) => cat.id)}
                onChange={(e) => {
                  const options = e.target.options;
                  const selected = [];
                  for (let i = 0; i < options.length; i++) {
                    if (options[i].selected) {
                      selected.push(
                        categories.find((category) => category.id === parseInt(options[i].value))
                      );
                    }
                  }
                  setSelectedCategories(selected);
                }}
              >
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </Form.Control>

            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowEditModal(false)}>
            Close
          </Button>
          <Button variant="primary" onClick={saveEmployeeChanges}>
            Save Changes
          </Button>
        </Modal.Footer>
      </Modal>





      <Modal show={showScheduleModal} onHide={() => setShowScheduleModal(false)}>
  <Modal.Header closeButton>
<Modal.Title>
{employees.find(emp => emp.id === employeeIdSchedule)?.name || "Employee name missing"} <br/>
</Modal.Title>
  </Modal.Header>
  <Modal.Body>
  <h6 className='text-center'>Schedule list</h6><hr/>
    {employeeSchedule.length > 0 ? (
      <div>
        {[...Array(7).keys()].map((dayIndex) => {
          const daySchedules = employeeSchedule.filter(
            (schedule) => schedule.day_of_week === dayIndex
          );

          return daySchedules.length > 0 ? (
<ul className="list-unstyled">
  <li>
    <strong className='text-secondary'>
      {["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"][dayIndex]}
    </strong>
    <ul className="list-unstyled">
      {daySchedules.map((schedule, index) => (
        <li key={index}>
          {schedule.start_time.slice(0, 5)} - {schedule.end_time.slice(0, 5)}
        </li>
      ))}
    </ul>
  </li>
</ul>

          ) : null;
        })}
      </div>
    ) : (
      <p>No schedule available for this employee.</p>
    )}




    {/* Adaugăm formularul pentru adăugarea unui nou program */}
  <h6 className='text-center mt-5'>Add new schedule</h6><hr/>
<Form
  onSubmit={(e) => {
    e.preventDefault();
    handleAddSchedule();
  }}
>


<Form.Group className="mb-3">
  <Form.Label>Select Day</Form.Label>
  <div className="d-flex flex-wrap">
    {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((day, index) => (
      <Button
        key={index}
        variant={newSchedule.day_of_week == index ? "primary" : "outline-secondary"}
        className="m-1 small btn-sm"
        onClick={() => setNewSchedule((prev) => ({ ...prev, day_of_week: index }))}
      >
        {day}
      </Button>
    ))}
  </div>
</Form.Group>

  <Row>
    <Col md={6}>
      <Form.Group className="mb-3">
        <LocalizationProvider dateAdapter={AdapterDayjs}>
          <DemoContainer components={['TimePicker']}>
            <TimePicker
              className="small-timepicker"
              label="Start Time"
              value={newSchedule.start_time ? dayjs(newSchedule.start_time, "HH:mm") : null}
              onChange={(newValue) => {
                setNewSchedule((prev) => ({
                  ...prev,
                  start_time: newValue ? newValue.format("HH:mm") : "",
                }));
                validateTimes(newValue ? newValue.format("HH:mm") : "", newSchedule.end_time);
              }}
              minutesStep={5}
              viewRenderers={{
                hours: renderTimeViewClock,
                minutes: renderTimeViewClock,
              }}
            />
          </DemoContainer>
        </LocalizationProvider>
      </Form.Group>
    </Col>

    <Col md={6}>
      <Form.Group className="mb-3">
        <LocalizationProvider dateAdapter={AdapterDayjs}>
          <DemoContainer components={['TimePicker']}>
            <TimePicker
              className="small-timepicker"
              label="End Time"
              value={newSchedule.end_time ? dayjs(newSchedule.end_time, "HH:mm") : null}
              onChange={(newValue) => {
                setNewSchedule((prev) => ({
                  ...prev,
                  end_time: newValue ? newValue.format("HH:mm") : "",
                }));
                validateTimes(newSchedule.start_time, newValue ? newValue.format("HH:mm") : "");
              }}
              minutesStep={5}
              viewRenderers={{
                hours: renderTimeViewClock,
                minutes: renderTimeViewClock,
              }}
            />
          </DemoContainer>
        </LocalizationProvider>
        {errorTime && <p className="text-danger small mt-1">{errorTime}</p>}
      </Form.Group>
    </Col>
  </Row>

{error && <Alert severity="error" className="mt-3">{error}</Alert>}
<Row>

  <Col>
    <Button
      type="submit"
      className={`mt-3 ${success ? "bg-success-subtle text-dark" : "btn-primary"}`} // 🔄 Schimbă culoarea cu className
      disabled={errorTime} // 🔄 Dezactivează în timpul procesării
    >
      {success ? success : "Add Schedule"} {/* 🔄 Schimbă textul */}
    </Button>
  </Col>
</Row>



</Form>

  </Modal.Body>
  <Modal.Footer>
    <Button variant="secondary" onClick={() => setShowScheduleModal(false)}>
      Close
    </Button>
  </Modal.Footer>
</Modal>




    </Container>

  );
}

export default EmployeeTable;