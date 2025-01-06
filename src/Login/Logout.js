import axios from "axios";
import api from "../api";

const Logout = () => {

    const handleLogout = async () => {
        api.post('users/logout/')
      .then(response => {
        localStorage.removeItem('token');
        window.location.href = '/';
      })
      .catch(error => {
        console.error('Eroare la logout:', error);
      });
  };
    handleLogout();




}

export default Logout