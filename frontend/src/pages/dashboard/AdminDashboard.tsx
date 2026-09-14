import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import { useAuth } from "../../context/AuthContext";

import {
  getUsers,
  getPendingUsers,
  updateUser,
} from "../../services/userService";

import { getPatients } from "../../services/patientService";
import { getDoctors } from "../../services/doctorService";
import { getDepartments } from "../../services/departmentService";
import { getAppointments } from "../../services/appointmentService";
import { getStaff } from "../../services/staffService";

import type { User, PendingUser } from "../../types/user";
import type { Patient } from "../../types/patient";
import type { Doctor } from "../../types/doctor";
import type { Department } from "../../types/department";
import type { Appointment } from "../../types/appointment";
import type { Staff } from "../../types/staff";


function AdminDashboard() {
  const { token, user } = useAuth();

  const [users, setUsers] = useState<User[]>([]);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [staff, setStaff] = useState<Staff[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [pendingUsers, setPendingUsers] = useState<PendingUser[]>([]);

  const [approvingId, setApprovingId] = useState<number | null>(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");


  useEffect(() => {
    async function loadDashboard() {
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const [
          usersData,
          patientsData,
          doctorsData,
          staffData,
          departmentsData,
          appointmentsData,
          pendingUsersData,
        ] = await Promise.all([
          getUsers(token),
          getPatients(token),
          getDoctors(token),
          getStaff(token),
          getDepartments(token),
          getAppointments(token),
          getPendingUsers(token),
        ]);

        setUsers(usersData);
        setPatients(patientsData);
        setDoctors(doctorsData);
        setStaff(staffData);
        setDepartments(departmentsData);
        setAppointments(appointmentsData);
        setPendingUsers(pendingUsersData);
      } catch (error) {
        console.error(error);
        setError("Failed to load dashboard data.");
      } finally {
        setLoading(false);
      }
    }

    loadDashboard();
  }, [token]);


  async function handleApprove(id: number) {
    if (!token) return;

    try {
      setApprovingId(id);

      const approvedUser = await updateUser(
        token,
        id,
        {
          is_active: true,
        }
      );

      setPendingUsers((current) =>
        current.filter(
          (pendingUser) => pendingUser.id !== id
        )
      );

      setUsers((current) =>
        current.map((currentUser) =>
          currentUser.id === id
            ? {
                ...currentUser,
                is_active: approvedUser.is_active,
              }
            : currentUser
        )
      );

      const [
        updatedDoctors,
        updatedStaff,
      ] = await Promise.all([
        getDoctors(token),
        getStaff(token),
      ]);

      setDoctors(updatedDoctors);
      setStaff(updatedStaff);
    } catch (error) {
      console.error(error);
      setError("Failed to approve account.");
    } finally {
      setApprovingId(null);
    }
  }


  if (loading) {
    return (
      <div className="dashboard-page">
        <p>Loading dashboard...</p>
      </div>
    );
  }


  if (error) {
    return (
      <div className="dashboard-page">
        <p>{error}</p>
      </div>
    );
  }


  const activeUsers = users.filter(
    (currentUser) => currentUser.is_active
  ).length;


  const pendingAppointments = appointments.filter(
    (appointment) =>
      appointment.status.toLowerCase() === "pending"
  ).length;


  const confirmedAppointments = appointments.filter(
    (appointment) =>
      appointment.status.toLowerCase() === "confirmed"
  ).length;


  const completedAppointments = appointments.filter(
    (appointment) =>
      appointment.status.toLowerCase() === "completed"
  ).length;


  const recentAppointments = [...appointments]
    .sort(
      (a, b) =>
        new Date(b.appointment_date).getTime() -
        new Date(a.appointment_date).getTime()
    )
    .slice(0, 5);


  function getDepartmentName(
    departmentId: number
  ) {
    const department = departments.find(
      (item) => item.id === departmentId
    );

    return department?.name ?? `Department #${departmentId}`;
  }


  return (
    <div className="dashboard-page">

      <div className="page-header">
        <div>
          <h1>Admin Dashboard</h1>

          <p>
            Welcome back, {user?.username}. Here's your hospital
            overview.
          </p>
        </div>
      </div>


      <div className="stats-grid">

        <div className="stat-card">
          <div className="stat-icon">U</div>

          <div>
            <span>Total Users</span>
            <h2>{users.length}</h2>
            <small>{activeUsers} active accounts</small>
          </div>
        </div>


        <div className="stat-card">
          <div className="stat-icon">P</div>

          <div>
            <span>Patients</span>
            <h2>{patients.length}</h2>
            <small>Registered patients</small>
          </div>
        </div>


        <div className="stat-card">
          <div className="stat-icon">D</div>

          <div>
            <span>Doctors</span>
            <h2>{doctors.length}</h2>
            <small>Medical professionals</small>
          </div>
        </div>


        <div className="stat-card">
          <div className="stat-icon">S</div>

          <div>
            <span>Staff</span>
            <h2>{staff.length}</h2>
            <small>Hospital staff</small>
          </div>
        </div>


        <div className="stat-card">
          <div className="stat-icon">A</div>

          <div>
            <span>Appointments</span>
            <h2>{appointments.length}</h2>
            <small>{pendingAppointments} pending</small>
          </div>
        </div>


        <div className="stat-card">
          <div className="stat-icon">!</div>

          <div>
            <span>Approvals</span>
            <h2>{pendingUsers.length}</h2>
            <small>Awaiting review</small>
          </div>
        </div>

      </div>


      <div className="dashboard-grid">

        <section className="dashboard-card">

          <div className="card-header">
            <div>
              <h2>Recent Appointments</h2>
              <p>Latest appointments in the system</p>
            </div>

            <Link to="/appointments">
              View all
            </Link>
          </div>


          {recentAppointments.length === 0 ? (
            <p className="empty-state">
              No appointments found.
            </p>
          ) : (
            <div className="appointment-list">

              {recentAppointments.map((appointment) => (

                <div
                  className="appointment-item"
                  key={appointment.id}
                >

                  <div className="appointment-date">
                    <strong>
                      {new Date(
                        appointment.appointment_date
                      ).toLocaleDateString()}
                    </strong>

                    <span>
                      {new Date(
                        appointment.appointment_date
                      ).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </div>


                  <div className="appointment-info">

                    <strong>
                      Appointment #{appointment.id}
                    </strong>

                    <span>
                      Patient #{appointment.patient_id} · Doctor #
                      {appointment.doctor_id}
                    </span>

                  </div>


                  <span
                    className={`status-badge status-${appointment.status.toLowerCase()}`}
                  >
                    {appointment.status}
                  </span>

                </div>

              ))}

            </div>
          )}

        </section>


        <section className="dashboard-card">

          <div className="card-header">
            <div>
              <h2>Quick Actions</h2>
              <p>Common administrative tasks</p>
            </div>
          </div>


          <div className="quick-actions">

            <Link
              to="/users/new"
              className="quick-action"
            >
              <span>+</span>

              <div>
                <strong>Add User</strong>
                <small>Create a new staff account</small>
              </div>
            </Link>


            <Link
              to="/doctors/new"
              className="quick-action"
            >
              <span>+</span>

              <div>
                <strong>Add Doctor</strong>
                <small>Register a new doctor</small>
              </div>
            </Link>


            <Link
              to="/patients/new"
              className="quick-action"
            >
              <span>+</span>

              <div>
                <strong>Add Patient</strong>
                <small>Create a patient profile</small>
              </div>
            </Link>


            <Link
              to="/departments/new"
              className="quick-action"
            >
              <span>+</span>

              <div>
                <strong>Add Department</strong>
                <small>Create a hospital department</small>
              </div>
            </Link>

          </div>

        </section>

      </div>


      <section className="dashboard-card">

        <div className="card-header">

          <div>
            <h2>Pending Approvals</h2>
            <p>
              Doctor and staff registrations awaiting approval
            </p>
          </div>

          <strong>{pendingUsers.length}</strong>

        </div>


        {pendingUsers.length === 0 ? (

          <p className="empty-state">
            No pending approvals.
          </p>

        ) : (

          <div className="appointment-list">

            {pendingUsers.map((pendingUser) => (

              <div
                className="appointment-item"
                key={pendingUser.id}
              >

                <div className="appointment-info">

                  <strong>
                    {pendingUser.first_name}{" "}
                    {pendingUser.last_name}
                  </strong>


                  <span>
                    {pendingUser.email} ·{" "}
                    {pendingUser.role}
                  </span>


                  {pendingUser.role === "doctor" ? (

                    <span>
                      {pendingUser.specialization} · License:{" "}
                      {pendingUser.license_number}
                    </span>

                  ) : (

                    <span>
                      Position: {pendingUser.position}
                    </span>

                  )}


                  {pendingUser.department_id !== null && (
                    <span>
                      {getDepartmentName(
                        pendingUser.department_id
                      )}
                    </span>
                  )}

                </div>


                <button
                  type="button"
                  onClick={() =>
                    handleApprove(pendingUser.id)
                  }
                  disabled={
                    approvingId === pendingUser.id
                  }
                >
                  {approvingId === pendingUser.id
                    ? "Approving..."
                    : "Approve"}
                </button>

              </div>

            ))}

          </div>

        )}

      </section>


      <section className="dashboard-card">

        <div className="card-header">

          <div>
            <h2>Staff</h2>
            <p>Approved hospital staff members</p>
          </div>

          <strong>{staff.length}</strong>

        </div>


        {staff.length === 0 ? (

          <p className="empty-state">
            No staff members found.
          </p>

        ) : (

          <div className="appointment-list">

            {staff.map((staffMember) => (

              <div
                className="appointment-item"
                key={staffMember.id}
              >

                <div className="appointment-info">

                  <strong>
                    {staffMember.first_name}{" "}
                    {staffMember.last_name}
                  </strong>

                  <span>
                    {staffMember.position}
                  </span>

                  <span>
                    {getDepartmentName(
                      staffMember.department_id
                    )}
                  </span>

                  <span>
                    {staffMember.phone}
                  </span>

                </div>

              </div>

            ))}

          </div>

        )}

      </section>


      <section className="dashboard-card overview-card">

        <div className="card-header">

          <div>
            <h2>Hospital Overview</h2>
            <p>Current system statistics</p>
          </div>

        </div>


        <div className="overview-grid">

          <div>
            <span>Departments</span>
            <strong>{departments.length}</strong>
          </div>


          <div>
            <span>Active Users</span>
            <strong>{activeUsers}</strong>
          </div>


          <div>
            <span>Pending Approvals</span>
            <strong>{pendingUsers.length}</strong>
          </div>


          <div>
            <span>Pending Appointments</span>
            <strong>{pendingAppointments}</strong>
          </div>


          <div>
            <span>Confirmed Appointments</span>
            <strong>{confirmedAppointments}</strong>
          </div>


          <div>
            <span>Completed Appointments</span>
            <strong>{completedAppointments}</strong>
          </div>


          <div>
            <span>Doctors</span>
            <strong>{doctors.length}</strong>
          </div>


          <div>
            <span>Staff</span>
            <strong>{staff.length}</strong>
          </div>

        </div>

      </section>

    </div>
  );
}


export default AdminDashboard;