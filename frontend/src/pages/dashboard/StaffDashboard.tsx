import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { getAppointments } from "../../services/appointmentService";
import { getPatients } from "../../services/patientService";
import { getBills } from "../../services/billingService";
import type { Appointment } from "../../types/appointment";
import type { Patient } from "../../types/patient";
import type { Billing } from "../../types/billing";

function StaffDashboard() {
  const { token, user } = useAuth();

  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [bills, setBills] = useState<Billing[]>([]);

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
          appointmentsData,
          patientsData,
          billsData,
        ] = await Promise.all([
          getAppointments(token),
          getPatients(token),
          getBills(token),
        ]);

        setAppointments(appointmentsData);
        setPatients(patientsData);
        setBills(billsData);
      } catch (error) {
        console.error(error);
        setError("Failed to load dashboard data.");
      } finally {
        setLoading(false);
      }
    }

    loadDashboard();
  }, [token]);

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

  const unpaidBills = bills.filter(
    (bill) =>
      bill.status.toLowerCase() === "unpaid"
  ).length;

  const pendingBills = bills.filter(
    (bill) =>
      bill.status.toLowerCase() === "pending"
  ).length;

  const paidBills = bills.filter(
    (bill) =>
      bill.status.toLowerCase() === "paid"
  ).length;

  const upcomingAppointments = [...appointments]
    .filter((appointment) => {
      const appointmentDate = new Date(
        appointment.appointment_date
      );

      return (
        appointmentDate >= new Date() &&
        appointment.status.toLowerCase() !== "cancelled" &&
        appointment.status.toLowerCase() !== "completed"
      );
    })
    .sort(
      (a, b) =>
        new Date(a.appointment_date).getTime() -
        new Date(b.appointment_date).getTime()
    )
    .slice(0, 5);

  return (
    <div className="dashboard-page">
      <div className="page-header">
        <div>
          <h1>Staff Dashboard</h1>
          <p>
            Welcome back, {user?.username}. Here's your hospital
            operations overview.
          </p>
        </div>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon">P</div>
          <div>
            <span>Total Patients</span>
            <h2>{patients.length}</h2>
            <small>Registered patients</small>
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
          <div className="stat-icon">✓</div>
          <div>
            <span>Completed</span>
            <h2>{completedAppointments}</h2>
            <small>{confirmedAppointments} confirmed</small>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">$</div>
          <div>
            <span>Unpaid Bills</span>
            <h2>{unpaidBills}</h2>
            <small>Require attention</small>
          </div>
        </div>
      </div>

      <div className="dashboard-grid">
        <section className="dashboard-card">
          <div className="card-header">
            <div>
              <h2>Upcoming Appointments</h2>
              <p>Next scheduled patient visits</p>
            </div>

            <Link to="/appointments">View all</Link>
          </div>

          {upcomingAppointments.length === 0 ? (
            <p className="empty-state">
              No upcoming appointments.
            </p>
          ) : (
            <div className="appointment-list">
              {upcomingAppointments.map((appointment) => (
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
              <h2>Staff Actions</h2>
              <p>Common administrative tasks</p>
            </div>
          </div>

          <div className="quick-actions">
            <Link to="/patients" className="quick-action">
              <span>→</span>
              <div>
                <strong>Patients</strong>
                <small>View registered patients</small>
              </div>
            </Link>

            <Link to="/patients/new" className="quick-action">
              <span>+</span>
              <div>
                <strong>Add Patient</strong>
                <small>Register a new patient</small>
              </div>
            </Link>

            <Link to="/billing" className="quick-action">
              <span>$</span>
              <div>
                <strong>Billing</strong>
                <small>View and manage bills</small>
              </div>
            </Link>

            <Link to="/billing/new" className="quick-action">
              <span>+</span>
              <div>
                <strong>Create Bill</strong>
                <small>Create a patient bill</small>
              </div>
            </Link>
          </div>
        </section>
      </div>

      <section className="dashboard-card overview-card">
        <div className="card-header">
          <div>
            <h2>Daily Overview</h2>
            <p>Current hospital workload</p>
          </div>
        </div>

        <div className="overview-grid">
          <div>
            <span>Total Patients</span>
            <strong>{patients.length}</strong>
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
            <span>Pending Bills</span>
            <strong>{pendingBills}</strong>
          </div>

          <div>
            <span>Paid Bills</span>
            <strong>{paidBills}</strong>
          </div>
        </div>
      </section>
    </div>
  );
}

export default StaffDashboard;