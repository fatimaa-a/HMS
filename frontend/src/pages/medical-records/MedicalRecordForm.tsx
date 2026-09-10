import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import {
  createMedicalRecord,
  getMedicalRecordById,
  updateMedicalRecord,
} from "../../services/medicalRecordService";
import { getAppointments } from "../../services/appointmentService";
import type { Appointment } from "../../types/appointment";

function MedicalRecordForm() {
  const { token } = useAuth();
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditing = Boolean(id);

  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [appointmentId, setAppointmentId] = useState("");

  const [selectedAppointment, setSelectedAppointment] =
    useState<Appointment | null>(null);

  const [diagnosis, setDiagnosis] = useState("");
  const [symptoms, setSymptoms] = useState("");
  const [treatment, setTreatment] = useState("");
  const [notes, setNotes] = useState("");

  const [loading, setLoading] = useState(isEditing);
  const [loadingAppointments, setLoadingAppointments] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadAppointments() {
      if (!token) {
        setLoadingAppointments(false);
        return;
      }

      try {
        const data = await getAppointments(token);
        setAppointments(data);
      } catch (error) {
        console.error(error);

        if (error instanceof Error) {
          setError(error.message);
        } else {
          setError("Failed to load appointments.");
        }
      } finally {
        setLoadingAppointments(false);
      }
    }

    loadAppointments();
  }, [token]);

  useEffect(() => {
    async function loadRecord() {
      if (!token || !id) {
        setLoading(false);
        return;
      }

      try {
        const record = await getMedicalRecordById(
          token,
          Number(id)
        );

        setAppointmentId(String(record.appointment_id));
        setDiagnosis(record.diagnosis);
        setSymptoms(record.symptoms);
        setTreatment(record.treatment);
        setNotes(record.notes);
      } catch (error) {
        console.error(error);

        if (error instanceof Error) {
          setError(error.message);
        } else {
          setError("Failed to load medical record.");
        }
      } finally {
        setLoading(false);
      }
    }

    loadRecord();
  }, [token, id]);

  useEffect(() => {
    if (!appointmentId) {
      setSelectedAppointment(null);
      return;
    }

    const appointment = appointments.find(
      (item) => item.id === Number(appointmentId)
    );

    setSelectedAppointment(appointment ?? null);
  }, [appointmentId, appointments]);

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    if (!token) {
      setError("You must be logged in.");
      return;
    }

    if (!isEditing && !appointmentId) {
      setError("Please select an appointment.");
      return;
    }

    setSaving(true);
    setError("");

    try {
      if (isEditing) {
        await updateMedicalRecord(
          token,
          Number(id),
          {
            diagnosis,
            symptoms,
            treatment,
            notes,
          }
        );
      } else {
        await createMedicalRecord(token, {
          appointment_id: Number(appointmentId),
          diagnosis,
          symptoms,
          treatment,
          notes,
        });
      }

      navigate("/medical-records");
    } catch (error) {
      console.error(error);

      if (error instanceof Error) {
        setError(error.message);
      } else {
        setError("Failed to save medical record.");
      }
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="form-page">
        <div className="loading-state">
          Loading medical record...
        </div>
      </div>
    );
  }

  return (
    <div className="form-page">
      <div className="form-page-header">
        <div>
          <h1>
            {isEditing
              ? "Edit Medical Record"
              : "Create Medical Record"}
          </h1>

          <p>
            {isEditing
              ? "Update the patient's clinical information."
              : "Create a clinical record from an appointment."}
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
              Appointment Information
            </div>

            {!isEditing ? (
              <div className="form-group">
                <label htmlFor="appointment">
                  Appointment
                </label>

                <select
                  id="appointment"
                  value={appointmentId}
                  onChange={(event) =>
                    setAppointmentId(event.target.value)
                  }
                  required
                  disabled={loadingAppointments}
                >
                  <option value="">
                    {loadingAppointments
                      ? "Loading appointments..."
                      : "Select an appointment"}
                  </option>

                  {appointments.map((appointment) => (
                    <option
                      key={appointment.id}
                      value={appointment.id}
                    >
                      Appointment #{appointment.id} —{" "}
                      {new Date(
                        appointment.appointment_date
                      ).toLocaleString()}
                    </option>
                  ))}
                </select>
              </div>
            ) : (
              <div className="form-group">
                <label>Appointment</label>

                <input
                  type="text"
                  value={
                    selectedAppointment
                      ? `Appointment #${selectedAppointment.id}`
                      : `Appointment #${appointmentId}`
                  }
                  disabled
                />
              </div>
            )}

            {selectedAppointment && (
              <div className="form-grid">
                <div className="form-group">
                  <label>Patient</label>
                  <input
                    type="text"
                    value={`Patient #${selectedAppointment.patient_id}`}
                    disabled
                  />
                </div>

                <div className="form-group">
                  <label>Doctor</label>
                  <input
                    type="text"
                    value={`Doctor #${selectedAppointment.doctor_id}`}
                    disabled
                  />
                </div>

                <div className="form-group">
                  <label>Department</label>
                  <input
                    type="text"
                    value={`Department #${selectedAppointment.department_id}`}
                    disabled
                  />
                </div>

                <div className="form-group">
                  <label>Appointment Date</label>
                  <input
                    type="text"
                    value={new Date(
                      selectedAppointment.appointment_date
                    ).toLocaleString()}
                    disabled
                  />
                </div>

                <div className="form-group">
                  <label>Status</label>
                  <input
                    type="text"
                    value={selectedAppointment.status}
                    disabled
                  />
                </div>

                <div className="form-group">
                  <label>Reason</label>
                  <input
                    type="text"
                    value={selectedAppointment.reason}
                    disabled
                  />
                </div>
              </div>
            )}
          </div>

          <div className="form-section">
            <div className="form-section-title">
              Clinical Information
            </div>

            <div className="medical-form-fields">
              <div className="form-group">
                <label htmlFor="diagnosis">
                  Diagnosis
                </label>

                <textarea
                  id="diagnosis"
                  value={diagnosis}
                  onChange={(event) =>
                    setDiagnosis(event.target.value)
                  }
                  placeholder="Enter diagnosis..."
                  rows={3}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="symptoms">
                  Symptoms
                </label>

                <textarea
                  id="symptoms"
                  value={symptoms}
                  onChange={(event) =>
                    setSymptoms(event.target.value)
                  }
                  placeholder="Describe the patient's symptoms..."
                  rows={4}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="treatment">
                  Treatment
                </label>

                <textarea
                  id="treatment"
                  value={treatment}
                  onChange={(event) =>
                    setTreatment(event.target.value)
                  }
                  placeholder="Describe the recommended treatment..."
                  rows={4}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="notes">
                  Clinical Notes
                </label>

                <textarea
                  id="notes"
                  value={notes}
                  onChange={(event) =>
                    setNotes(event.target.value)
                  }
                  placeholder="Add any additional clinical notes..."
                  rows={4}
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
                navigate("/medical-records")
              }
              disabled={saving}
            >
              Cancel
            </button>

            <button
              type="submit"
              className="primary-button"
              disabled={saving}
            >
              {saving
                ? "Saving..."
                : isEditing
                  ? "Update Record"
                  : "Create Record"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default MedicalRecordForm;