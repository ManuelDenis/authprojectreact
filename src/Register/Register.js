import React, { useState, useEffect } from 'react';
import { Form, Button, Alert } from 'react-bootstrap';
import Container from 'react-bootstrap/Container';
import { Col, Row } from 'reactstrap';
import { useNavigate } from 'react-router-dom';
import {useAuth} from "./AuthContext";
import api from "../api";

const Register = () => {
  const { login } = useAuth();

  const [email, setEmail] = useState('');
  const [password1, setPassword1] = useState('');
  const [password2, setPassword2] = useState('');
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [googleIdToken, setGoogleIdToken] = useState('');
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      const response = await api.post('users/register/', {
        email,
        password1,
        password2,
      });
      setSuccess(response.data.detail);
      setError(null);
    } catch (error) {
      console.error('Registration failed:', error.response ? error.response.data : error.message);
      setError(error.response ? error.response.data : 'Registration failed');
      setSuccess(null);
    }
  };

  const handleGoogleLoginSuccess = async (response) => {
    if (response.credential) {
      setGoogleIdToken(response.credential);

      try {
        const res = await api.post('users/auth/google/', {
          token: response.credential,
        });

        login(res.data.access_token); // Updates auth context
        window.location.href = '/';
      } catch (error) {
        setError('Autentificare Google eșuată.');
      }
    } else {
      setError('Credential Google invalid.');
    }
  };

  useEffect(() => {
    const initializeGoogleSignIn = () => {
      if (window.google) {
        window.google.accounts.id.initialize({
          client_id: '857988839094-5kdqt2di2smmc0c3oo1hvkif1qanmcbj.apps.googleusercontent.com',
          callback: handleGoogleLoginSuccess,
        });

        window.google.accounts.id.renderButton(
          document.getElementById("google-login-button"),
          { theme: "outline", size: "large" }
        );
      }
    };

    if (window.google) {
      initializeGoogleSignIn();
    } else {
      window.addEventListener("load", initializeGoogleSignIn);
    }

    return () => window.removeEventListener("load", initializeGoogleSignIn);
  }, []);

  return (
    <Container>
      <Row>
        <Col lg={4}>
          <h2>Register new account</h2>
          <div id="google-login-button"></div>
          <br />

          {success && <Alert variant="success">{success}</Alert>}

          {error && (
            <Alert variant="danger">
              {error.email && <div>Email: {error.email}</div>}
              {error.password1 && <div>Password1: {error.password1}</div>}
              {error.password2 && <div>Password2: {error.password2}</div>}
              {error.non_field_errors && <div>{error.non_field_errors}</div>}
            </Alert>
          )}

          <Form onSubmit={handleRegister}>
            <Form.Group controlId="formBasicEmail">
              <Form.Label>Email address</Form.Label>
              <Form.Control
                type="email"
                placeholder="Enter email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </Form.Group>

            <Form.Group controlId="formBasicPassword1">
              <Form.Label>Password</Form.Label>
              <Form.Control
                type="password"
                placeholder="Password"
                value={password1}
                onChange={(e) => setPassword1(e.target.value)}
                required
              />
            </Form.Group>

            <Form.Group controlId="formBasicPassword2">
              <Form.Label>Confirm Password</Form.Label>
              <Form.Control
                type="password"
                placeholder="Confirm Password"
                value={password2}
                onChange={(e) => setPassword2(e.target.value)}
                required
              />
            </Form.Group>

            <Button variant="primary" type="submit" className="mt-3">
              Register
            </Button>
          </Form>
        </Col>
      </Row>
    </Container>
  );
};

export default Register;
