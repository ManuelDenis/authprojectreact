import React, { useState, useEffect } from 'react';
import api from "../api";

const UserProfile = () => {
  const [userInfo, setUserInfo] = useState({});
  const token = localStorage.getItem('token');

  useEffect(() => {
    if (token) {
      api.get('/api/auth/user_info/', {
        headers: {
          Authorization: `Token ${token}`,
        },
      })
      .then(response => {
        setUserInfo(response.data);
      })
      .catch(error => {
        console.error('Eroare la obținerea informațiilor utilizatorului:', error);
      });
    }
  }, [token]);

  return (
    <div>
      <h2>Informații despre Utilizator</h2>
      <p>Username: {userInfo.username}</p>
      <p>Email: {userInfo.email}</p>
      {/* Alte informații */}
    </div>
  );
};

export default UserProfile;
