import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { getAppointments } from "../../services/appointmentService";
import type { Appointment } from "../../types/appointment";

function DoctorDashboard() {
  const { token, user } = useAuth();

  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadDashboard() {
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const data = await getAppointments(token);
        setAppointments(data);
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

  const cancelledAppointments = appointments.filter(
    (appointment) =>
      appointment.status.toLowerCase() === "cancelled"
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
          <h1>Doctor Dashboard</h1>
          <p>
            Welcome back, Dr. {user?.username}. Here's your
            clinical overview.
          </p>
        </div>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon">A</div>
          <div>
            <span>Total Appointments</span>
            <h2>{appointments.length}</h2>
            <small>All assigned appointments</small>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">P</div>
          <div>
            <span>Pending</span>
            <h2>{pendingAppointments}</h2>
            <small>Awaiting confirmation</small>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">C</div>
          <div>
            <span>Confirmed</span>
            <h2>{confirmedAppointments}</h2>
            <small>Upcoming appointments</small>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">✓</div>
          <div>
            <span>Completed</span>
            <h2>{completedAppointments}</h2>
            <small>{cancelledAppointments} cancelled</small>
          </div>
        </div>
      </div>

      <div className="dashboard-grid">
        <section className="dashboard-card">
          <div className="card-header">
            <div>
              <h2>Upcoming Appointments</h2>
              <p>Your next scheduled patient visits</p>
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
                      Patient #{appointment.patient_id}
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
              <h2>Clinical Actions</h2>
              <p>Manage patient care</p>
            </div>
          </div>

          <div className="quick-actions">
            <Link
              to="/medical-records"
              className="quick-action"
            >
              <span>→</span>
              <div>
                <strong>Medical Records</strong>
                <small>Review patient medical history</small>
              </div>
            </Link>

            <Link
              to="/medical-records/new"
              className="quick-action"
            >
              <span>+</span>
              <div>
                <strong>Add Medical Record</strong>
                <small>Document a patient visit</small>
              </div>
            </Link>

            <Link
              to="/prescriptions"
              className="quick-action"
            >
              <span>→</span>
              <div>
                <strong>Prescriptions</strong>
                <small>Review existing prescriptions</small>
              </div>
            </Link>

            <Link
              to="/prescriptions/new"
              className="quick-action"
            >
              <span>+</span>
              <div>
                <strong>Add Prescription</strong>
                <small>Prescribe medication</small>
              </div>
            </Link>
          </div>
        </section>
      </div>

      <section className="dashboard-card overview-card">
        <div className="card-header">
          <div>
            <h2>Appointment Overview</h2>
            <p>Current appointment status</p>
          </div>
        </div>

        <div className="overview-grid">
          <div>
            <span>Pending</span>
            <strong>{pendingAppointments}</strong>
          </div>

          <div>
            <span>Confirmed</span>
            <strong>{confirmedAppointments}</strong>
          </div>

          <div>
            <span>Completed</span>
            <strong>{completedAppointments}</strong>
          </div>

          <div>
            <span>Cancelled</span>
            <strong>{cancelledAppointments}</strong>
          </div>
        </div>
      </section>
    </div>
  );
}

export default DoctorDashboard;