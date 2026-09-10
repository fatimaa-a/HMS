import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import { useNavigate, useParams } from "react-router-dom";

import { useAuth } from "../../context/AuthContext";

import {
  createPrescription,
  getPrescriptionById,
  updatePrescription,
} from "../../services/prescriptionService";

import { getMedicalRecords } from "../../services/medicalRecordService";

import type { MedicalRecord } from "../../types/medicalRecord";

function PrescriptionForm() {
  const { token } = useAuth();
  const navigate = useNavigate();
  const { id } = useParams();

  const isEditing = Boolean(id);

  const [medicalRecords, setMedicalRecords] = useState<MedicalRecord[]>(
    []
  );

  const [medicalRecordId, setMedicalRecordId] = useState("");

  const [selectedRecord, setSelectedRecord] =
    useState<MedicalRecord | null>(null);

  const [medication, setMedication] = useState("");
  const [dosage, setDosage] = useState("");
  const [frequency, setFrequency] = useState("");
  const [duration, setDuration] = useState("");
  const [instructions, setInstructions] = useState("");

  const [loading, setLoading] = useState(isEditing);
  const [loadingRecords, setLoadingRecords] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadMedicalRecords() {
      if (!token) {
        setLoadingRecords(false);
        return;
      }

      try {
        const data = await getMedicalRecords(token);
        setMedicalRecords(data);
      } catch (error) {
        console.error(error);

        if (error instanceof Error) {
          setError(error.message);
        } else {
          setError("Failed to load medical records.");
        }
      } finally {
        setLoadingRecords(false);
      }
    }

    loadMedicalRecords();
  }, [token]);

  useEffect(() => {
    async function loadPrescription() {
      if (!token || !id) {
        setLoading(false);
        return;
      }

      try {
        const prescription = await getPrescriptionById(
          token,
          Number(id)
        );

        setMedicalRecordId(
          String(prescription.medical_record_id)
        );

        setMedication(prescription.medication);
        setDosage(prescription.dosage);
        setFrequency(prescription.frequency);
        setDuration(prescription.duration);
        setInstructions(prescription.instructions);
      } catch (error) {
        console.error(error);

        if (error instanceof Error) {
          setError(error.message);
        } else {
          setError("Failed to load prescription.");
        }
      } finally {
        setLoading(false);
      }
    }

    loadPrescription();
  }, [token, id]);

  useEffect(() => {
    if (!medicalRecordId) {
      setSelectedRecord(null);
      return;
    }

    const record = medicalRecords.find(
      (item) => item.id === Number(medicalRecordId)
    );

    setSelectedRecord(record ?? null);
  }, [medicalRecordId, medicalRecords]);

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    if (!token) {
      setError("You must be logged in.");
      return;
    }

    if (!isEditing && !medicalRecordId) {
      setError("Please select a medical record.");
      return;
    }

    setSaving(true);
    setError("");

    try {
      if (isEditing) {
        await updatePrescription(
          token,
          Number(id),
          {
            medication,
            dosage,
            frequency,
            duration,
            instructions,
          }
        );
      } else {
        await createPrescription(token, {
          medical_record_id: Number(medicalRecordId),
          medication,
          dosage,
          frequency,
          duration,
          instructions,
        });
      }

      navigate("/prescriptions");
    } catch (error) {
      console.error(error);

      if (error instanceof Error) {
        setError(error.message);
      } else {
        setError("Failed to save prescription.");
      }
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="form-page">
        <div className="loading-state">
          Loading prescription...
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
              ? "Edit Prescription"
              : "Create Prescription"}
          </h1>

          <p>
            {isEditing
              ? "Update the prescription details."
              : "Create a prescription from a medical record."}
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
              Medical Record
            </div>

            {!isEditing ? (
              <div className="form-group">
                <label htmlFor="medicalRecord">
                  Medical Record
                </label>

                <select
                  id="medicalRecord"
                  value={medicalRecordId}
                  onChange={(event) =>
                    setMedicalRecordId(event.target.value)
                  }
                  required
                  disabled={loadingRecords}
                >
                  <option value="">
                    {loadingRecords
                      ? "Loading medical records..."
                      : "Select a medical record"}
                  </option>

                  {medicalRecords.map((record) => (
                    <option
                      key={record.id}
                      value={record.id}
                    >
                      Record #{record.id} — {record.diagnosis}
                    </option>
                  ))}
                </select>
              </div>
            ) : (
              <div className="form-group">
                <label>Medical Record</label>

                <input
                  type="text"
                  value={
                    selectedRecord
                      ? `Medical Record #${selectedRecord.id}`
                      : `Medical Record #${medicalRecordId}`
                  }
                  disabled
                />
              </div>
            )}

            {selectedRecord && (
              <div className="form-grid">
                <div className="form-group">
                  <label>Patient</label>

                  <input
                    type="text"
                    value={`Patient #${selectedRecord.patient_id}`}
                    disabled
                  />
                </div>

                <div className="form-group">
                  <label>Doctor</label>

                  <input
                    type="text"
                    value={`Doctor #${selectedRecord.doctor_id}`}
                    disabled
                  />
                </div>

                <div className="form-group">
                  <label>Appointment</label>

                  <input
                    type="text"
                    value={`Appointment #${selectedRecord.appointment_id}`}
                    disabled
                  />
                </div>

                <div className="form-group">
                  <label>Diagnosis</label>

                  <input
                    type="text"
                    value={selectedRecord.diagnosis}
                    disabled
                  />
                </div>

                <div className="form-group">
                  <label>Symptoms</label>

                  <input
                    type="text"
                    value={selectedRecord.symptoms}
                    disabled
                  />
                </div>

                <div className="form-group">
                  <label>Treatment</label>

                  <input
                    type="text"
                    value={selectedRecord.treatment}
                    disabled
                  />
                </div>
              </div>
            )}
          </div>

          <div className="form-section">
            <div className="form-section-title">
              Prescription Information
            </div>

            <div className="medical-form-fields">
              <div className="form-group">
                <label htmlFor="medication">
                  Medication
                </label>

                <input
                  id="medication"
                  value={medication}
                  onChange={(event) =>
                    setMedication(event.target.value)
                  }
                  placeholder="e.g. Amoxicillin"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="dosage">
                  Dosage
                </label>

                <input
                  id="dosage"
                  value={dosage}
                  onChange={(event) =>
                    setDosage(event.target.value)
                  }
                  placeholder="e.g. 500mg"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="frequency">
                  Frequency
                </label>

                <input
                  id="frequency"
                  value={frequency}
                  onChange={(event) =>
                    setFrequency(event.target.value)
                  }
                  placeholder="e.g. Twice daily"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="duration">
                  Duration
                </label>

                <input
                  id="duration"
                  value={duration}
                  onChange={(event) =>
                    setDuration(event.target.value)
                  }
                  placeholder="e.g. 7 days"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="instructions">
                  Instructions
                </label>

                <textarea
                  id="instructions"
                  value={instructions}
                  onChange={(event) =>
                    setInstructions(event.target.value)
                  }
                  placeholder="Instructions for the patient..."
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
                navigate("/prescriptions")
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
                  ? "Update Prescription"
                  : "Create Prescription"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default PrescriptionForm;