import React from 'react'
import {Col, Row} from "react-bootstrap";

const ConfirmationSent = () => {
  return (
    <div>
        <Row className="justify-content-md-center">
            <Col lg={6} className="text-center">
      <h3 className="text-white text-2xl font-bold">A confirmation link has been sent to your email address. Please check your inbox.</h3>
            </Col>
        </Row>
    </div>
  )
}

export default ConfirmationSent