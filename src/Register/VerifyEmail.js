import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../api";

const VerifyEmail = () => {
  const { key } = useParams(); // Preluăm cheia din URL
  const [status, setStatus] = useState(""); // Stocăm statusul răspunsului
  const navigate = useNavigate();

  useEffect(() => {
    if (key) {
      verifyEmail();
    }
  }, [key]);

  const verifyEmail = async () => {
    try {
      const response = await api.post(
        "users/verify-email/", // Endpoint-ul backend
        { key } // Payload-ul
      );
      setStatus("Email verified successfully!");
      // Navighează la pagina de login după verificare
      setTimeout(() => navigate("/login"), 3000);
    } catch (error) {
      setStatus(
        "Failed to verify email. Please ensure the link is correct or try again."
      );
    }
  };

  return (
    <div style={{ textAlign: "center", marginTop: "50px" }}>
      <h1>Verify Email</h1>
      {status ? (
        <p>{status}</p>
      ) : (
        <p>Verifying your email, please wait...</p>
      )}
    </div>
  );
};

export default VerifyEmail;
