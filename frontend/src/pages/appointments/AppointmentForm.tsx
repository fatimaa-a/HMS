import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import { useNavigate } from "react-router-dom";

import { useAuth } from "../../context/AuthContext";
import { createAppointment } from "../../services/appointmentService";
import { getDepartments } from "../../services/departmentService";
import { getDoctors } from "../../services/doctorService";

import type { Department } from "../../types/department";
import type { Doctor } from "../../types/doctor";

function AppointmentForm() {
  const { token } = useAuth();
  const navigate = useNavigate();

  const [departments, setDepartments] = useState<Department[]>([]);
  const [doctors, setDoctors] = useState<Doctor[]>([]);

  const [departmentId, setDepartmentId] = useState("");
  const [doctorId, setDoctorId] = useState("");
  const [appointmentDate, setAppointmentDate] = useState("");
  const [reason, setReason] = useState("");

  const [loading, setLoading] = useState(true);
  const [booking, setBooking] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadData() {
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const [departmentData, doctorData] =
          await Promise.all([
            getDepartments(token),
            getDoctors(token),
          ]);

        setDepartments(departmentData);
        setDoctors(doctorData);
      } catch (error) {
        console.error(error);

        if (error instanceof Error) {
          setError(error.message);
        } else {
          setError(
            "Failed to load departments and doctors."
          );
        }
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [token]);

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    if (!token) {
      setError("You must be logged in.");
      return;
    }

    if (!departmentId || !doctorId) {
      setError(
        "Please select a department and doctor."
      );
      return;
    }

    setBooking(true);
    setError("");

    try {
      await createAppointment(token, {
        doctor_id: Number(doctorId),
        department_id: Number(departmentId),
        appointment_date: appointmentDate,
        reason,
        status: "scheduled",
      });

      navigate("/appointments");
    } catch (error) {
      console.error(error);

      if (error instanceof Error) {
        setError(error.message);
      } else {
        setError("Failed to create appointment.");
      }
    } finally {
      setBooking(false);
    }
  }

  const filteredDoctors = doctors.filter(
    (doctor) =>
      doctor.department_id === Number(departmentId)
  );

  if (loading) {
    return (
      <div className="form-page">
        <div className="loading-state">
          Loading appointment form...
        </div>
      </div>
    );
  }

  return (
    <div className="form-page">

      <div className="form-page-header">
        <div>
          <h1>Book Appointment</h1>
          <p>
            Schedule a new appointment for a patient.
          </p>
        </div>
      </div>

      {error && (
        <div className="list-error">
          {error}
        </div>
      )}

      <div className="form-card">

        <form onSubmit={handleSubmit}>

          <div className="form-section">
            <div className="form-section-title">
              Appointment Details
            </div>

            <div className="form-grid">

              <div className="form-group">
                <label htmlFor="department">
                  Department
                </label>

                <select
                  id="department"
                  value={departmentId}
                  onChange={(event) => {
                    setDepartmentId(
                      event.target.value
                    );
                    setDoctorId("");
                  }}
                  required
                >
                  <option value="">
                    Select a department
                  </option>

                  {departments.map((department) => (
                    <option
                      key={department.id}
                      value={department.id}
                    >
                      {department.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="doctor">
                  Doctor
                </label>

                <select
                  id="doctor"
                  value={doctorId}
                  onChange={(event) =>
                    setDoctorId(event.target.value)
                  }
                  disabled={!departmentId}
                  required
                >
                  <option value="">
                    {departmentId
                      ? filteredDoctors.length > 0
                        ? "Select a doctor"
                        : "No doctors in this department"
                      : "Select a department first"}
                  </option>

                  {filteredDoctors.map((doctor) => (
                    <option
                      key={doctor.id}
                      value={doctor.id}
                    >
                      Dr. {doctor.first_name}{" "}
                      {doctor.last_name} —{" "}
                      {doctor.specialization}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="appointmentDate">
                  Appointment Date & Time
                </label>

                <input
                  id="appointmentDate"
                  type="datetime-local"
                  value={appointmentDate}
                  onChange={(event) =>
                    setAppointmentDate(
                      event.target.value
                    )
                  }
                  required
                />
              </div>

              <div className="form-group form-group-full">
                <label htmlFor="reason">
                  Reason for Visit
                </label>

                <textarea
                  id="reason"
                  value={reason}
                  onChange={(event) =>
                    setReason(event.target.value)
                  }
                  placeholder="Describe the reason for the appointment..."
                  rows={5}
                  required
                />
              </div>

            </div>
          </div>

          <div className="form-actions">

            <button
              type="button"
              className="secondary-button"
              onClick={() =>
                navigate("/appointments")
              }
              disabled={booking}
            >
              Cancel
            </button>

            <button
              type="submit"
              className="primary-button"
              disabled={booking}
            >
              {booking
                ? "Booking..."
                : "Book Appointment"}
            </button>

          </div>

        </form>

      </div>
    </div>
  );
}

export default AppointmentForm;