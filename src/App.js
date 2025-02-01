import './App.css';
import { Row } from "react-bootstrap";
import Container from "react-bootstrap/Container";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import 'bootstrap/dist/css/bootstrap.css';
import Dashboard from "./Components/Dashboard";
import Register from "./Register/Register";
import ConfirmationSent from "./Register/ConfirmationSent";
import PasswordReset from "./Register/PasswordReset";
import ResetPasswordPage from "./Register/ResetPasswordPage";
import VerifyEmail from "./Register/VerifyEmail";
import Navbar from "./Components/Navbar";
import Homepage from "./Components/Homepage";
import Login from "./Components/Login";
import Logout from "./Login/Logout";
import {GoogleLogin} from "@react-oauth/google";
import {AuthProvider} from "./Register/AuthContext";
import CompanyPage from "./Components/CompanyPage";
import AddCompany from "./Components/AddCompany";
import UpdateCompany from "./Components/UpdateCompany";
import ServiceCategories from "./Components/ServiceCategories";
import AddCategory from "./Components/AddCategory";
import AddService from "./Components/AddService";
import CategoriesandServices from "./Components/CategoriesandServices";
import Employee from "./Components/Employee";
import Client from "./Components/Client";
import AddAppointment from "./Components/Createappointment";
import AppointmentList from "./Components/AppointmentList";
import AppointmentDetails from "./Components/AppointmentDetails";
import Appointments from "./Components/Appointments";


function App() {
    const responseMessage = (response) => {
        console.log(response);
    };

    const errorMessage = (error) => {
        console.log(error);
    }

    return (
        <AuthProvider>

    <Container fluid className="text-light">
      <BrowserRouter>
        <Navbar />
        <Row className="justify-content-md-center p-2">
          <Routes>
            <Route path="/" element={<Homepage />} />
            <Route path="/Login" element={<Login />} />
            <Route path="/Logout" element={<Logout />} />
            <Route path="/Dashboard" element={<Dashboard />} />
            <Route path="/Register" element={<Register />} />
            <Route path="/ConfirmationSent" element={<ConfirmationSent />} />
            <Route path="/users/account-confirm-email/:key" element={<VerifyEmail />} />
            <Route path="/PasswordReset" element={<PasswordReset />} />
            <Route path="/password-reset-confirm/:uid/:token" element={<ResetPasswordPage />} />

            <Route path="/CompanyPage" element={<CompanyPage />} />
            <Route path="/AddCompany" element={<AddCompany />} />
            <Route path="/UpdateCompany/:id" element={<UpdateCompany />} />
            <Route path="/CategoriesandServices" element={<CategoriesandServices />} />
            <Route path="/ServiceCategories" element={<ServiceCategories />} />
            <Route path="/AddCategory" element={<AddCategory />} />
            <Route path="/AddService" element={<AddService />} />

            <Route path="/Employee" element={<Employee />} />

            <Route path="/Appointments" element={<Appointments />} />
            <Route path="/AddAppointment" element={<AddAppointment />} />
            <Route path="/AppointmentList" element={<AppointmentList />} />
            <Route path="/appointments/:id" element={<AppointmentDetails />} />
            <Route path="/Client" element={<Client />} />

          </Routes>
        </Row>
      </BrowserRouter>
    </Container>
        </AuthProvider>
  );
}

export default App;
