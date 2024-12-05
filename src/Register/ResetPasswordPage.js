import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { Container, Form, Button, Row, Col } from 'react-bootstrap';
import api from "../api";

const ResetPasswordPage = () => {
  const { uid, token } = useParams();  // Extrage `uid` și `token` din URL
  const [newPassword1, setNewPassword1] = useState('');
  const [newPassword2, setNewPassword2] = useState('');
  const [message, setMessage] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();

    // Trimite cererea POST către URL-ul care include `uid` și `token`
    api.post(`password-reset-confirm/${uid}/${token}/`, {
      new_password1: newPassword1,
      new_password2: newPassword2,
      uid: uid,    // Asigură-te că sunt incluse și în corpul cererii
      token: token,
    })
      .then((response) => {
        setMessage(response.data.detail);
      })
      .catch((error) => {
        setMessage(error.response?.data?.detail || "An error occurred.");
        console.error('Error resetting password:', error);
      });
  };

  return (
    <Container>
      <Row className="justify-content-md-center">
        <Col lg={4}>
          <h2 className="text-center pb-5">Password Reset</h2>
          <Form onSubmit={handleSubmit}>
            <Form.Group controlId="newPassword1">
              <Form.Label>New Password</Form.Label>
              <Form.Control
                type="password"
                value={newPassword1}
                onChange={(e) => setNewPassword1(e.target.value)}
                required
              />
            </Form.Group>

            <Form.Group controlId="newPassword2">
              <Form.Label>Confirm New Password</Form.Label>
              <Form.Control
                type="password"
                value={newPassword2}
                onChange={(e) => setNewPassword2(e.target.value)}
                required
              />
            </Form.Group>

            <Button variant="primary" type="submit" className="mt-3">
              Reset Password
            </Button>
          </Form>
          <p className="mt-3">{message}</p>
        </Col>
      </Row>
    </Container>
  );
};

export default ResetPasswordPage;
