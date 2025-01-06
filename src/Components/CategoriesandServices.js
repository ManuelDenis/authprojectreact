import React, { useState, useEffect } from "react";
import axios from "axios";
import { Container, Accordion, Button, Modal, Form, Alert, Spinner } from "react-bootstrap";
import {Col, Row} from "reactstrap";
import {FaEdit} from "react-icons/fa";
import {BsPlusCircleFill} from "react-icons/bs";
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import {IoMdSettings} from "react-icons/io";

const CategoriesAndServices = () => {
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [categoryToDelete, setCategoryToDelete] = useState(null);
  const [categoryToUpdate, setCategoryToUpdate] = useState(null);
  const [updatedCategoryName, setUpdatedCategoryName] = useState("");

  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [showUpdateCategoryModal, setShowUpdateCategoryModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);


  const [newServiceName, setNewServiceName] = useState("");
  const [updatedServiceName, setUpdatedServiceName] = useState("");
  const [serviceToUpdate, setServiceToUpdate] = useState(null);
  const [serviceToDelete, setServiceToDelete] = useState(null);

  const [showServiceModal, setShowServiceModal] = useState(false);
  const [showDeleteServiceModal, setShowDeleteServiceModal] = useState(false);
  const [showUpdateModal, setShowUpdateModal] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const [token] = useState(localStorage.getItem("token"));

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

    fetchCategories();
  }, [token]);


  const handleAddCategory = async () => {
  if (!newCategoryName) {
    setError("Please enter a category name.");
    return;
  }

  try {
    setLoading(true);
    const response = await axios.post(
      "http://127.0.0.1:8000/api/service_category/",
      { name: newCategoryName },
      {
        headers: { Authorization: `Token ${token}` },
      }
    );

    setCategories([response.data, ...categories]);
    setSuccess("Category added successfully. You can add more categories");
    setNewCategoryName("");
  } catch (err) {
    // Capturăm mesajul de eroare din backend și îl afișăm utilizatorului
    if (err.response && err.response.data.detail) {
      setError(err.response.data.detail);
    } else {
      setError("Failed to add category.");
    }
  } finally {
    setLoading(false);
  }
  };

  const handleUpdateCategory = async () => {
  if (!updatedCategoryName) {
    setError("Category name cannot be empty.");
    return;
  }

  try {
    setLoading(true);
    const response = await axios.put(
      `http://127.0.0.1:8000/api/service_category/${categoryToUpdate.id}/`,
      { name: updatedCategoryName },
      {
        headers: { Authorization: `Token ${token}` },
      }
    );

    const updatedCategories = categories.map((category) =>
      category.id === categoryToUpdate.id
        ? { ...category, name: response.data.name }
        : category
    );

    setCategories(updatedCategories);
    setSuccess("Category updated successfully.");
    handleCloseUpdateCategoryModal();
  } catch (err) {
    console.error("Error response:", err.response?.data || err.message);
    setError(err.response?.data?.detail || "Failed to update category.");
  } finally {
    setLoading(false);
  }
};

  const handleDeleteCategory = async () => {
    if (!categoryToDelete) return;

    try {
      setLoading(true);
      await axios.delete(`http://127.0.0.1:8000/api/service_category/${categoryToDelete.id}/`, {
        headers: { Authorization: `Token ${token}` },
      });

      setCategories(categories.filter((category) => category.id !== categoryToDelete.id));
      setCategoryToDelete(null);
      setShowDeleteModal(false);
      setSuccess("Category deleted successfully.");
    } catch (err) {
      setError("Failed to delete category.");
    } finally {
      setLoading(false);
    }
  };

  const handleCloseCategoryModal = () => {
    setShowCategoryModal(false);
    setSuccess(null);
    setError(null);
  };

  const handleOpenUpdateCategoryModal = (category) => {
  setCategoryToUpdate(category); // Stocăm categoria selectată
  setUpdatedCategoryName(category.name); // Pre-setăm numele categoriei în câmp
  setShowUpdateCategoryModal(true);
  setSuccess(null);
  setError(null);
};

  const handleCloseUpdateCategoryModal = () => {
  setShowUpdateCategoryModal(false);
  setCategoryToUpdate(null);
  setUpdatedCategoryName("");
  setSuccess(null);
  setError(null);
};



  const handleAddService = async () => {
    if (!selectedCategory || !newServiceName) {
      setError("Please enter a service name.");
      return;
    }

    try {
      setLoading(true);
      const response = await axios.post(
        "http://127.0.0.1:8000/api/services/",
        { name: newServiceName, service_category: selectedCategory.id },
        {
          headers: { Authorization: `Token ${token}` },
        }
      );

      const updatedCategories = categories.map((category) =>
        category.id === selectedCategory.id
          ? { ...category, services: [...category.services, response.data] }
          : category
      );
      setCategories(updatedCategories);
      setSuccess("Service added successfully, you can continue to add more services");
      setNewServiceName("");
    } catch (err) {
      setError("Failed to add service.");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateService = async () => {
  if (!updatedServiceName) {
    setError("Service name cannot be empty.");
    return;
  }

  if (!serviceToUpdate) {
    setError("No service selected for update.");
    return;
  }

  try {
    setLoading(true);
    const response = await axios.put(
      `http://127.0.0.1:8000/api/services/${serviceToUpdate.id}/`,
      {
        name: updatedServiceName,
        service_category: serviceToUpdate.service_category // Include service_category în cerere
      },
      {
        headers: { Authorization: `Token ${token}` },
      }
    );

    const updatedCategories = categories.map((category) =>
      category.id === serviceToUpdate.service_category
        ? {
            ...category,
            services: category.services.map((service) =>
              service.id === serviceToUpdate.id ? response.data : service
            ),
          }
        : category
    );

    setCategories(updatedCategories);
    setSuccess("Service updated successfully.");
    setShowUpdateModal(false);
    setServiceToUpdate(null);
    setUpdatedServiceName("");
  } catch (err) {
    console.error("Error response:", err.response?.data || err.message);
    setError(err.response?.data?.detail || "Failed to update service.");
  } finally {
    setLoading(false);
  }
  };

  const handleDeleteService = async () => {
  if (!serviceToDelete) return;

  try {
    setLoading(true);
    await axios.delete(`http://127.0.0.1:8000/api/services/${serviceToDelete.id}/`, {
      headers: { Authorization: `Token ${token}` },
    });

    // Actualizează lista de categorii eliminând serviciul șters
    const updatedCategories = categories.map((category) => ({
      ...category,
      services: category.services.filter((service) => service.id !== serviceToDelete.id),
    }));

    setCategories(updatedCategories);
    setSuccess("Service deleted successfully.");
    setShowDeleteServiceModal(false);
    setServiceToDelete(null);
  } catch (err) {
    setError("Failed to delete service.");
  } finally {
    setLoading(false);
  }
  };

  const handleCloseServiceModal = () => {
    setShowServiceModal(false);
    setSuccess(null);
    setError(null);
  };


  const handleCloseDeleteModal = () => {
    setShowDeleteModal(false);
    setCategoryToDelete(null);
    setSuccess(null);
    setError(null);
  };

  const handleOpenUpdateModal = (service) => {
  setServiceToUpdate(service); // Stocăm întregul obiect service
  setUpdatedServiceName(service.name); // Pre-setăm numele serviciului
  setShowUpdateModal(true);
  setSuccess(null);
  setError(null);
};

  const handleCloseUpdateModal = () => {
    setShowUpdateModal(false);
    setServiceToUpdate(null);
    setUpdatedServiceName("");
    setSuccess(null);
    setError(null);
  };


  return (
    <Container className="mt-5">
      <Row>
        <h4 className='mb-5'>Edit categories and services</h4>
        <Col lg={6}>
      {loading && <Spinner animation="border" className="d-block mx-auto" />}


      <div className='d-flex justify-content-between'>
      <div className="mb-3 text-center" title="Add new category" style={{ cursor: "pointer" }}>
          <BsPlusCircleFill
      className='text-info h1'
      onClick={() => setShowCategoryModal(true)}
          /> New category
      </div>
      </div>


      <Accordion>
        {categories.map((category) => (
          <Accordion.Item eventKey={category.id} key={category.id}>
            <Accordion.Header><p className='fw-bolder text-secondary'>{category.name}</p></Accordion.Header>
            <Accordion.Body className='bg-secondary-subtle rounded-bottom-4 mt-1'>


    <div className="d-flex justify-content-between rounded-2 bg-secondary-subtle">

      <Button
          className="btn-sm rounded-5 bg-transparent border-0 text-primary"
          onClick={() => handleOpenUpdateCategoryModal(category)}
      >
        <EditIcon /> Edit category
      </Button>
      |

      <Button
          className="btn-sm rounded-5 bg-transparent border-0 text-secondary"
          onClick={() => {
                    setCategoryToDelete(category);
                    setShowDeleteModal(true);
                  }}
      >
        <DeleteIcon /> Delete Category
      </Button>

              </div>


  { /*-- employee list start --*/}
     <div className='rounded-3 mt-3 pt-5 pb-5'>

  <h5>Employees</h5>

  <a href='/Employee' className='text-decoration-none linkintern'>
    <h6><IoMdSettings className='m-2'></IoMdSettings>Manage employees</h6>
  </a>

  {category.employees?.length === 0 ? (
    <p>No employees available in this category.</p>
  ) : (
    <ul className='list-unstyled'>
      {category.employees.map((employee) => (
        <li key={employee.id} className='d-flex justify-content-between bg-light-subtle p-2 mt-1 m-1 rounded'>
          <span>{employee.name}</span>
        </li>
      ))}
    </ul>
  )}

</div>
  { /*-- employee list end --*/}


  { /*-- service list start --*/}
     <div className='mt-3 pt-3 pb-5'>
     <h5>Services</h5>

<p onClick={() => {
    setSelectedCategory(category);
    setShowServiceModal(true);
      }}
         className='linkintern'>
  <h6><AddIcon className='m-2'></AddIcon>Add new service</h6>
</p>

              {category.services?.length === 0 ? (
                <p>No services available in this category.</p>
              ) : (
                  <div>
                <ul className='list-unstyled'>
                  {category.services.map((service) => (

                        <li key={service.id} className='d-flex justify-content-between bg-light-subtle p-2 mt-1 m-1 rounded'>
                        <span>{service.name}</span>


          <div className='d-flex justify-content-end align-items-center'>
          <FaEdit
            style={{ cursor: "pointer", color: "dimgrey", fontSize: '20px'}}
            onClick={() => handleOpenUpdateModal(service)}
          /> |

          <DeleteIcon
            style={{ cursor: "pointer", color: "orangered", fontSize: '23px'}}
          onClick={() => {
            setServiceToDelete(service);
            setShowDeleteServiceModal(true);
          }}
          />
          </div>

                        </li>
                  ))}
                </ul>
                </div>

              )}
     </div>
  { /*-- service list end --*/}


            </Accordion.Body>
          </Accordion.Item>
        ))}
      </Accordion>



      <Modal show={showServiceModal} onHide={handleCloseServiceModal}>
        <Modal.Header closeButton>
          <Modal.Title>Add Service to {selectedCategory?.name || ""}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>Category</Form.Label>
              <Form.Control type="text" value={selectedCategory?.name || ""} readOnly />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Service Name</Form.Label>
              <Form.Control
                type="text"
                placeholder="Enter service name"
                value={newServiceName}
                onChange={(e) => setNewServiceName(e.target.value)}
              />
            </Form.Group>
          </Form>
          {success && <Alert variant="success" className="mt-3">{success}</Alert>}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseServiceModal}>
            Close
          </Button>
          <Button variant="primary" onClick={handleAddService}>
            Add Service
          </Button>
        </Modal.Footer>
      </Modal>
      <Modal show={showDeleteServiceModal} onHide={() => setShowDeleteServiceModal(false)}>
  <Modal.Header closeButton>
    <Modal.Title>Confirm Delete</Modal.Title>
  </Modal.Header>
  <Modal.Body>
    Are you sure you want to delete the service "{serviceToDelete?.name}"?
  </Modal.Body>
  <Modal.Footer>
    <Button variant="secondary" onClick={() => setShowDeleteServiceModal(false)}>
      Cancel
    </Button>
    <Button variant="danger" onClick={handleDeleteService}>
      Confirm Delete
    </Button>
  </Modal.Footer>
</Modal>
      <Modal show={showCategoryModal} onHide={handleCloseCategoryModal}>
        <Modal.Header closeButton>
          <Modal.Title>Add Category</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>Category Name</Form.Label>
              <Form.Control
                type="text"
                placeholder="Enter category name"
                value={newCategoryName}
                onChange={(e) => setNewCategoryName(e.target.value)}
              />
            </Form.Group>
          </Form>
          {success && <Alert variant="success" className="mt-3">{success}</Alert>}
          {error && <Alert variant="danger">{error}</Alert>}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseCategoryModal}>
            Close
          </Button>
          <Button variant="primary" onClick={handleAddCategory}>
            Add Category
          </Button>
        </Modal.Footer>
      </Modal>
      <Modal show={showUpdateCategoryModal} onHide={handleCloseUpdateCategoryModal}>
  <Modal.Header closeButton>
    <Modal.Title>Update Category</Modal.Title>
  </Modal.Header>
  <Modal.Body>
    <Form>
      <Form.Group className="mb-3">
        <Form.Label>Category Name</Form.Label>
        <Form.Control
          type="text"
          placeholder="Enter new category name"
          value={updatedCategoryName}
          onChange={(e) => setUpdatedCategoryName(e.target.value)}
        />
      </Form.Group>
    </Form>
    {success && <Alert variant="success" className="mt-3">{success}</Alert>}
    {error && <Alert variant="danger" className="mt-3">{error}</Alert>}
  </Modal.Body>
  <Modal.Footer>
    <Button variant="secondary" onClick={handleCloseUpdateCategoryModal}>
      Close
    </Button>
    <Button variant="primary" onClick={handleUpdateCategory}>
      Update Category
    </Button>
  </Modal.Footer>
</Modal>
      <Modal show={showDeleteModal} onHide={handleCloseDeleteModal}>
        <Modal.Header closeButton>
          <Modal.Title>Confirm Delete</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          Are you sure you want to delete the category "{categoryToDelete?.name}"? All services in this category will
          also be deleted.
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseDeleteModal}>
            Cancel
          </Button>
          <Button variant="danger" onClick={handleDeleteCategory}>
            Confirm Delete
          </Button>
        </Modal.Footer>
      </Modal>
      <Modal show={showUpdateModal} onHide={handleCloseUpdateModal}>
            <Modal.Header closeButton>
              <Modal.Title>Update Service</Modal.Title>
            </Modal.Header>
            <Modal.Body>
              <Form>
                <Form.Group className="mb-3">
                  <Form.Label>Service Name: {serviceToUpdate?.name || ""}</Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="Enter new service name"
                    value={updatedServiceName}
                    onChange={(e) => setUpdatedServiceName(e.target.value)}
                  />
                </Form.Group>
              </Form>
              {success && <Alert variant="success" className="mt-3">{success}</Alert>}
            </Modal.Body>
            <Modal.Footer>
              <Button variant="secondary" onClick={handleCloseUpdateModal}>
                Close
              </Button>
              <Button variant="primary" onClick={handleUpdateService}>
                Update Service
              </Button>
            </Modal.Footer>
          </Modal>

        </Col>
      </Row>

    </Container>
  );
};

export default CategoriesAndServices;
