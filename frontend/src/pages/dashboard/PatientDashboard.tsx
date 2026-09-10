import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { getMyPatientProfile } from "../../services/patientService";
import { getMyAppointments } from "../../services/appointmentService";
import { getMyMedicalRecords } from "../../services/medicalRecordService";
import { getMyPrescriptions } from "../../services/prescriptionService";
import type { Patient } from "../../types/patient";
import type { Appointment } from "../../types/appointment";
import type { MedicalRecord } from "../../types/medicalRecord";
import type { Prescription } from "../../types/prescription";

function PatientDashboard() {
  const { token, user } = useAuth();

  const [patient, setPatient] = useState<Patient | null>(null);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [medicalRecords, setMedicalRecords] = useState<
    MedicalRecord[]
  >([]);
  const [prescriptions, setPrescriptions] = useState<
    Prescription[]
  >([]);

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
          patientData,
          appointmentsData,
          medicalRecordsData,
          prescriptionsData,
        ] = await Promise.all([
          getMyPatientProfile(token),
          getMyAppointments(token),
          getMyMedicalRecords(token),
          getMyPrescriptions(token),
        ]);

        setPatient(patientData);
        setAppointments(appointmentsData);
        setMedicalRecords(medicalRecordsData);
        setPrescriptions(prescriptionsData);
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

  if (!patient) {
    return (
      <div className="dashboard-page">
        <p>Patient profile not found.</p>
      </div>
    );
  }

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

  const completedAppointments = appointments.filter(
    (appointment) =>
      appointment.status.toLowerCase() === "completed"
  ).length;

  return (
    <div className="dashboard-page">
      <div className="page-header">
        <div>
          <h1>Welcome, {patient.first_name}</h1>
          <p>
            Here's an overview of your hospital information and
            upcoming care.
          </p>
        </div>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon">A</div>
          <div>
            <span>Upcoming Appointments</span>
            <h2>{upcomingAppointments.length}</h2>
            <small>Scheduled visits</small>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">M</div>
          <div>
            <span>Medical Records</span>
            <h2>{medicalRecords.length}</h2>
            <small>Your medical history</small>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">R</div>
          <div>
            <span>Prescriptions</span>
            <h2>{prescriptions.length}</h2>
            <small>Issued prescriptions</small>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">✓</div>
          <div>
            <span>Completed Visits</span>
            <h2>{completedAppointments}</h2>
            <small>Completed appointments</small>
          </div>
        </div>
      </div>

      <div className="dashboard-grid">
        <section className="dashboard-card">
          <div className="card-header">
            <div>
              <h2>Upcoming Appointments</h2>
              <p>Your next scheduled visits</p>
            </div>

            <Link to="/appointments">View all</Link>
          </div>

          {upcomingAppointments.length === 0 ? (
            <p className="empty-state">
              You have no upcoming appointments.
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
                      Doctor #{appointment.doctor_id}
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
              <p>Access your hospital services</p>
            </div>
          </div>

          <div className="quick-actions">
            <Link
              to="/appointments/new"
              className="quick-action"
            >
              <span>+</span>
              <div>
                <strong>Book Appointment</strong>
                <small>Schedule a new visit</small>
              </div>
            </Link>

            <Link
              to="/appointments"
              className="quick-action"
            >
              <span>→</span>
              <div>
                <strong>My Appointments</strong>
                <small>View your scheduled visits</small>
              </div>
            </Link>

            <Link
              to="/medical-records"
              className="quick-action"
            >
              <span>→</span>
              <div>
                <strong>Medical Records</strong>
                <small>View your medical history</small>
              </div>
            </Link>

            <Link
              to="/prescriptions"
              className="quick-action"
            >
              <span>→</span>
              <div>
                <strong>Prescriptions</strong>
                <small>View your medications</small>
              </div>
            </Link>
          </div>
        </section>
      </div>

      <section className="dashboard-card overview-card">
        <div className="card-header">
          <div>
            <h2>Personal Information</h2>
            <p>Your registered patient information</p>
          </div>

          <Link to={`/patients/${patient.id}`}>
            View profile
          </Link>
        </div>

        <div className="patient-info-grid">
          <div>
            <span>Full Name</span>
            <strong>
              {patient.first_name} {patient.last_name}
            </strong>
          </div>

          <div>
            <span>Date of Birth</span>
            <strong>
              {new Date(
                patient.date_of_birth
              ).toLocaleDateString()}
            </strong>
          </div>

          <div>
            <span>Gender</span>
            <strong>{patient.gender}</strong>
          </div>

          <div>
            <span>Blood Group</span>
            <strong>{patient.blood_group}</strong>
          </div>

          <div>
            <span>Phone</span>
            <strong>{patient.phone}</strong>
          </div>

          <div>
            <span>Address</span>
            <strong>{patient.address}</strong>
          </div>
        </div>
      </section>

      <section className="dashboard-card overview-card">
        <div className="card-header">
          <div>
            <h2>Account Information</h2>
            <p>Your HMS account details</p>
          </div>
        </div>

        <div className="overview-grid">
          <div>
            <span>Username</span>
            <strong>{user?.username}</strong>
          </div>

          <div>
            <span>Email</span>
            <strong>{user?.email}</strong>
          </div>

          <div>
            <span>Account Status</span>
            <strong>
              {user?.is_active ? "Active" : "Inactive"}
            </strong>
          </div>
        </div>
      </section>
    </div>
  );
}

export default PatientDashboard;