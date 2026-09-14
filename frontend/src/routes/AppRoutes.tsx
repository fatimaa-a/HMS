import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";

// Auth
import Login from "../pages/auth/Login";
import Register from "../pages/auth/Register";

// Dashboards
import AdminDashboard from "../pages/dashboard/AdminDashboard";
import DoctorDashboard from "../pages/dashboard/DoctorDashboard";
import StaffDashboard from "../pages/dashboard/StaffDashboard";
import PatientDashboard from "../pages/dashboard/PatientDashboard";

// Users
import Users from "../pages/users/Users";
import UserForm from "../pages/users/UserForm";
import UserDetails from "../pages/users/UserDetails";

// Doctors
import Doctors from "../pages/doctors/Doctors";
import DoctorDetails from "../pages/doctors/DoctorDetails";
import DoctorForm from "../pages/doctors/DoctorForm";

// Patients
import Patients from "../pages/patients/Patients";
import PatientDetails from "../pages/patients/PatientDetails";
import PatientForm from "../pages/patients/PatientForm";

// Staff
import Staff from "../pages/staff/Staff";
import StaffDetails from "../pages/staff/StaffDetails";

// Departments
import Departments from "../pages/departments/Departments";
import DepartmentDetails from "../pages/departments/DepartmentDetails";
import DepartmentForm from "../pages/departments/DepartmentForm";

// Appointments
import Appointments from "../pages/appointments/Appointments";
import AppointmentForm from "../pages/appointments/AppointmentForm";

// Medical Records
import MedicalRecords from "../pages/medical-records/MedicalRecords";
import MedicalRecordDetails from "../pages/medical-records/MedicalRecordDetails";
import MedicalRecordForm from "../pages/medical-records/MedicalRecordForm";

// Prescriptions
import Prescriptions from "../pages/prescriptions/Prescriptions";
import PrescriptionDetails from "../pages/prescriptions/PrescriptionDetails";
import PrescriptionForm from "../pages/prescriptions/PrescriptionForm";

// Billing
import Billing from "../pages/billing/Billing";
import BillDetails from "../pages/billing/BillDetails";
import BillingForm from "../pages/billing/BillingForm";

// Profile / Unauthorized
import Profile from "../pages/profile/Profile";
import Unauthorized from "../pages/Unauthorized";

// Layout / Route Protection
import DashboardLayout from "../components/layout/DashboardLayout";
import ProtectedRoute from "./ProtectedRoute";
import RoleRoute from "./RoleRoute";

function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public Routes */}

        <Route
          path="/"
          element={<Navigate to="/login" replace />}
        />

        <Route
          path="/login"
          element={<Login />}
        />

        <Route
          path="/register"
          element={<Register />}
        />

        <Route
          path="/unauthorized"
          element={<Unauthorized />}
        />

        {/* Protected Routes */}

        <Route element={<ProtectedRoute />}>
          <Route element={<DashboardLayout />}>
            {/* Profile */}

            <Route
              path="/profile"
              element={<Profile />}
            />

            {/* ==================== ADMIN ==================== */}

            <Route
              element={
                <RoleRoute allowedRoles={["admin"]} />
              }
            >
              <Route
                path="/admin/dashboard"
                element={<AdminDashboard />}
              />
            </Route>

            {/* ==================== USERS ==================== */}

            <Route
              element={
                <RoleRoute allowedRoles={["admin"]} />
              }
            >
              <Route
                path="/users"
                element={<Users />}
              />

              <Route
                path="/users/:id"
                element={<UserDetails />}
              />

              <Route
                path="/users/new"
                element={<UserForm />}
              />

              <Route
                path="/users/:id/edit"
                element={<UserForm />}
              />
            </Route>

            {/* ==================== DOCTOR DASHBOARD ==================== */}

            <Route
              element={
                <RoleRoute allowedRoles={["doctor"]} />
              }
            >
              <Route
                path="/doctor/dashboard"
                element={<DoctorDashboard />}
              />
            </Route>

            {/* ==================== STAFF DASHBOARD ==================== */}

            <Route
              element={
                <RoleRoute allowedRoles={["staff"]} />
              }
            >
              <Route
                path="/staff/dashboard"
                element={<StaffDashboard />}
              />
            </Route>

            {/* ==================== PATIENT DASHBOARD ==================== */}

            <Route
              element={
                <RoleRoute allowedRoles={["patient"]} />
              }
            >
              <Route
                path="/patient/dashboard"
                element={<PatientDashboard />}
              />
            </Route>

            {/* ==================== DOCTORS ==================== */}

            <Route
              element={
                <RoleRoute
                  allowedRoles={[
                    "admin",
                    "doctor",
                    "staff",
                    "patient",
                  ]}
                />
              }
            >
              <Route
                path="/doctors"
                element={<Doctors />}
              />

              <Route
                path="/doctors/:id"
                element={<DoctorDetails />}
              />
            </Route>

            <Route
              element={
                <RoleRoute allowedRoles={["admin"]} />
              }
            >
              <Route
                path="/doctors/new"
                element={<DoctorForm />}
              />

              <Route
                path="/doctors/:id/edit"
                element={<DoctorForm />}
              />
            </Route>

            {/* ==================== PATIENTS ==================== */}

            <Route
              element={
                <RoleRoute
                  allowedRoles={[
                    "admin",
                    "doctor",
                    "staff",
                  ]}
                />
              }
            >
              <Route
                path="/patients"
                element={<Patients />}
              />

              <Route
                path="/patients/:id"
                element={<PatientDetails />}
              />
            </Route>

            <Route
              element={
                <RoleRoute
                  allowedRoles={[
                    "admin",
                    "staff",
                  ]}
                />
              }
            >
              <Route
                path="/patients/new"
                element={<PatientForm />}
              />

              <Route
                path="/patients/:id/edit"
                element={<PatientForm />}
              />
            </Route>

            {/* ==================== STAFF ==================== */}

            <Route
              element={
                <RoleRoute allowedRoles={["admin"]} />
              }
            >
              <Route
                path="/staff"
                element={<Staff />}
              />

              <Route
                path="/staff/:id"
                element={<StaffDetails />}
              />
            </Route>

            {/* ==================== DEPARTMENTS ==================== */}

            <Route
              element={
                <RoleRoute
                  allowedRoles={[
                    "admin",
                    "doctor",
                    "staff",
                    "patient",
                  ]}
                />
              }
            >
              <Route
                path="/departments"
                element={<Departments />}
              />

              <Route
                path="/departments/:id"
                element={<DepartmentDetails />}
              />
            </Route>

            <Route
              element={
                <RoleRoute allowedRoles={["admin"]} />
              }
            >
              <Route
                path="/departments/new"
                element={<DepartmentForm />}
              />

              <Route
                path="/departments/:id/edit"
                element={<DepartmentForm />}
              />
            </Route>

            {/* ==================== MEDICAL RECORDS ==================== */}

            <Route
              element={
                <RoleRoute
                  allowedRoles={[
                    "admin",
                    "doctor",
                    "patient",
                  ]}
                />
              }
            >
              <Route
                path="/medical-records"
                element={<MedicalRecords />}
              />

              <Route
                path="/medical-records/:id"
                element={<MedicalRecordDetails />}
              />
            </Route>

            <Route
              element={
                <RoleRoute
                  allowedRoles={[
                    "admin",
                    "doctor",
                  ]}
                />
              }
            >
              <Route
                path="/medical-records/new"
                element={<MedicalRecordForm />}
              />

              <Route
                path="/medical-records/:id/edit"
                element={<MedicalRecordForm />}
              />
            </Route>

            {/* ==================== PRESCRIPTIONS ==================== */}

            <Route
              element={
                <RoleRoute
                  allowedRoles={[
                    "admin",
                    "doctor",
                    "patient",
                  ]}
                />
              }
            >
              <Route
                path="/prescriptions"
                element={<Prescriptions />}
              />

              <Route
                path="/prescriptions/:id"
                element={<PrescriptionDetails />}
              />
            </Route>

            <Route
              element={
                <RoleRoute
                  allowedRoles={[
                    "admin",
                    "doctor",
                  ]}
                />
              }
            >
              <Route
                path="/prescriptions/new"
                element={<PrescriptionForm />}
              />

              <Route
                path="/prescriptions/:id/edit"
                element={<PrescriptionForm />}
              />
            </Route>

            {/* ==================== BILLING ==================== */}

            <Route
              element={
                <RoleRoute
                  allowedRoles={[
                    "admin",
                    "staff",
                  ]}
                />
              }
            >
              <Route
                path="/billing"
                element={<Billing />}
              />

              <Route
                path="/billing/:id"
                element={<BillDetails />}
              />

              <Route
                path="/billing/new"
                element={<BillingForm />}
              />

              <Route
                path="/billing/:id/edit"
                element={<BillingForm />}
              />
            </Route>

            {/* ==================== APPOINTMENTS ==================== */}

            <Route
              path="/appointments"
              element={<Appointments />}
            />

            <Route
              path="/appointments/new"
              element={<AppointmentForm />}
            />
          </Route>
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default AppRoutes;