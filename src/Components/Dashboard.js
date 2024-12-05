import React, {useState} from 'react'
import {Col, Row} from "react-bootstrap";
import Container from "react-bootstrap/Container";
import 'bootstrap/dist/css/bootstrap.css';
import Login from "./Login";


const Dashboard = () => {
    const [token, setToken] = useState(localStorage.getItem('token'));

    if(!token){
        {return <Login />}
    }
    return (
      <Container>
          <Row>
              <Col lg={6}>
          <p>Dashboard</p>
              </Col>
          </Row>
      </Container>
  )
}

export default Dashboard