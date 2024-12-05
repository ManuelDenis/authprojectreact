import React, { useState } from 'react';
import {Col, Container, Row} from "react-bootstrap";
import api from "../api";

const PasswordReset = () => {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();

    api.post('password-reset/', { email })
      .then((response) => {
        setMessage(response.data.detail);
      })
      .catch((error) => {
          setMessage(error.response.data.detail);
      });
  };

  return (
      <Container>
        <Row className="justify-content-md-center">
            <Col lg={4}>
      <h2 className="text-center pb-5">Password Reset</h2>
                <p>Enter your email address below to receive a link for password reset:</p>
      <form onSubmit={handleSubmit}>
        <div className="mb-3">
          <label htmlFor="email" className="form-label">Email:</label>
          <input type="email" className="form-control" id="email" value={email} onChange={(e) => setEmail(e.target.value)} />
        </div>
        <button type="submit" className="btn btn-primary">Send Reset Link</button>
      </form>
      <p className="mt-3 text-warning">{message}</p>
            </Col>
        </Row>
      </Container>
  );
};

export default PasswordReset;
