import React, { useEffect, useState } from 'react';
import {Container, Nav, Navbar, NavDropdown} from 'react-bootstrap';
import '../App.css';

function Navbars() {
    const [token, setToken] = useState(localStorage.getItem('token'));

    useEffect(() => {
        const handleStorageChange = () => {
            setToken(localStorage.getItem('token'));
        };
        window.addEventListener('storage', handleStorageChange);

        return () => {
            window.removeEventListener('storage', handleStorageChange);
        };
    }, []);

    const logout = () => {
        localStorage.removeItem('token');
        setToken(null);
        window.location.reload();
    };

    return (
        <Navbar expand="lg" className="mb-5">
            <Container>
                <Navbar.Brand href="/"><h2>HomeApp</h2></Navbar.Brand>
                <Navbar.Toggle aria-controls="basic-navbar-nav">
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="30"
                        height="30"
                        viewBox="0 0 30 30"
                        fill="none"
                        className="custom-toggle-icon"
                    >
                        <rect width="30" height="30" fill="transparent" />
                        <path
                            d="M4 7h22M4 15h22M4 23h22"
                            stroke="white"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        />
                    </svg>
                </Navbar.Toggle>

                <Navbar.Collapse id="navbarScroll">
                    <Nav className="me-auto my-2 my-lg-0" navbarScroll>
                        {token ? (
                            <>
                                <Nav.Link href="/CompanyPage" className="nav-link">Company</Nav.Link>
            <NavDropdown title="Company" id="basic-nav-dropdown">
              <NavDropdown.Item href="/CompanyPage">Company details</NavDropdown.Item>

              <NavDropdown.Item href="/CategoriesandServices">
                Manage Categories
              </NavDropdown.Item>

              <NavDropdown.Item href="/Employee">
                Employees
              </NavDropdown.Item>

                <NavDropdown.Divider />
              <NavDropdown.Item href="#action/3.4">
                Separated link
              </NavDropdown.Item>
            </NavDropdown>                                <Nav.Link href="#" onClick={logout} className="nav-link">Logout</Nav.Link>
                            </>
                        ) : (
                            <>
                                <Nav.Link href="/Login" className="nav-link"><strong>Login</strong></Nav.Link>
                                <Nav.Link href="/Register" className="nav-link">Register</Nav.Link>
                            </>
                        )}
                    </Nav>
                </Navbar.Collapse>
            </Container>
        </Navbar>
    );
}

export default Navbars;
