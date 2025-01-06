import React, { useEffect, useState } from "react";
import axios from "axios";
import {Table, Container, Spinner, Alert, Button, Modal, Form} from "react-bootstrap";
import { FaTrash } from "react-icons/fa";
import {BsPlusCircleFill} from "react-icons/bs"; // Pentru iconița Delete

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

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sortDirection, setSortDirection] = useState("asc");

  const [success, setSuccess] = useState(null);

  const token = localStorage.getItem("token");

  useEffect(() => {
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
    if (token) {
      fetchCategories();
      fetchEmployees();

    }
  }, [token]);

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
        }));

        setEmployees(data);
      } catch (err) {
        setError("Failed to fetch employees.");
      } finally {
        setLoading(false);
      }
    };

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

      {error && <Alert variant="danger">{error}</Alert>}
      {!loading && !error && employees.length > 0 ? (
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
                <Button variant="danger" size="sm" onClick={() => handleDeleteClick(employee)}>
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
    </Container>

  );
}

export default EmployeeTable;
