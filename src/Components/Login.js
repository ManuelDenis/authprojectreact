import React, { useState, useEffect } from 'react';
import { Form, Button, Alert } from 'react-bootstrap';
import { Col, Row } from 'reactstrap';
import { useNavigate } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import api from "../api";

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [googleIdToken, setGoogleIdToken] = useState('');
  const navigate = useNavigate(); // Hook pentru navigare

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const response = await api.post('users/login/', {
        email: email,
        password: password,
      });
      localStorage.setItem('token', response.data.access_token);
      window.location.href = '/';
    } catch (err) {
      if (err.response && err.response.data && err.response.data.detail) {
        setError(err.response.data.detail);
      } else {
        setError('Autentificare eșuată. Verifică datele introduse.');
      }
    }
  };

  const handleGoogleLoginSuccess = async (response) => {
    if (response.credential) {
      setGoogleIdToken(response.credential);

      try {
        const res = await api.post('users/auth/google/', {
          token: response.credential,
        });

        localStorage.setItem('token', res.data.access_token);
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
        client_id: 'xxxxxxxxxxxxxxx',
        callback: handleGoogleLoginSuccess,
        auto_select: false, // Ensures the user is prompted to select an account
      });

      window.google.accounts.id.renderButton(
        document.getElementById("google-login-button"),
        { theme: "outline", size: "large", prompt_parent_id: "google-login-button" }
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

  const handlePasswordReset = () => {
    navigate('/PasswordReset/');
  };

  return (
    <div className="login-container">
      <Row>
        <Col lg={4}>
          <h2>Login</h2>
          <div id="google-login-button"></div>
          <br/>

          {error && <Alert variant="danger">
            {error}
            <div className="mt-1">
            <Button variant="link" onClick={handlePasswordReset}>
              Reseteaza parola
            </Button>
          </div>
          </Alert>}

          <Form onSubmit={handleLogin}>
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

            <Form.Group controlId="formBasicPassword">
              <Form.Label>Password</Form.Label>
              <Form.Control
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </Form.Group>

            <Button variant="primary" type="submit" className='mt-3'>
              Login
            </Button>
          </Form>

            <a onClick={handlePasswordReset} href="#" className='link-light'>
               Reseteaza parola
            </a>

        </Col>
      </Row>
    </div>
  );
};

export default Login;
