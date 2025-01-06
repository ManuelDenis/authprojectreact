import React, { useState, useEffect } from "react";
import { Container, Alert } from "react-bootstrap";

const HomePage = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [token, setToken] = useState(localStorage.getItem('token'));

  useEffect(() => {
    // Check if the token exists in localStorage
    const storedToken = localStorage.getItem("token");
    if (storedToken) {
      setIsLoggedIn(true);
      setToken(storedToken);
    } else {
      setIsLoggedIn(false);
    }
  }, []);

  return (
    <Container className="mt-5">
      {isLoggedIn ? (
        <>
          <Alert variant="success">
            <h4>You are logged in!</h4>
            <p>
              <strong>Token:</strong> {token}
            </p>
          </Alert>
        </>
      ) : (
        <Alert variant="danger">
          <h4>You are not logged in!</h4>
          <p>Please log in to access your account.</p>
        </Alert>
      )}
    </Container>
  );
};

export default HomePage;
