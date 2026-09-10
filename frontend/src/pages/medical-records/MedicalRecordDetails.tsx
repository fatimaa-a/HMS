import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import { useNavigate, useParams } from "react-router-dom";

import { useAuth } from "../../context/AuthContext";
import {
  createMedicalRecord,
  getMedicalRecordById,
  updateMedicalRecord,
} from "../../services/medicalRecordService";

function MedicalRecordForm() {
  const { token } = useAuth();
  const navigate = useNavigate();
  const { id } = useParams();

  const isEditing = Boolean(id);

  const [patientId, setPatientId] = useState("");
  const [doctorId, setDoctorId] = useState("");
  const [appointmentId, setAppointmentId] = useState("");

  const [diagnosis, setDiagnosis] = useState("");
  const [symptoms, setSymptoms] = useState("");
  const [treatment, setTreatment] = useState("");
  const [notes, setNotes] = useState("");

  const [loading, setLoading] = useState(isEditing);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

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

        setPatientId(String(record.patient_id));
        setDoctorId(String(record.doctor_id));
        setAppointmentId(
          String(record.appointment_id)
        );

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

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    if (!token) {
      setError("You must be logged in.");
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
              : "Add a new clinical record for a patient."}
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
              Record Information
            </div>

            {!isEditing && (
              <div className="form-grid">

                <div className="form-group">
                  <label htmlFor="patientId">
                    Patient ID
                  </label>

                  <input
                    id="patientId"
                    type="number"
                    value={patientId}
                    onChange={(event) =>
                      setPatientId(
                        event.target.value
                      )
                    }
                    placeholder="Enter patient ID"
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="doctorId">
                    Doctor ID
                  </label>

                  <input
                    id="doctorId"
                    type="number"
                    value={doctorId}
                    onChange={(event) =>
                      setDoctorId(
                        event.target.value
                      )
                    }
                    placeholder="Enter doctor ID"
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="appointmentId">
                    Appointment ID
                  </label>

                  <input
                    id="appointmentId"
                    type="number"
                    value={appointmentId}
                    onChange={(event) =>
                      setAppointmentId(
                        event.target.value
                      )
                    }
                    placeholder="Enter appointment ID"
                    required
                  />
                </div>

              </div>
            )}

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