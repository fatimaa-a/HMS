import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";

import { useAuth } from "../../context/AuthContext";

import {
  getPrescriptionById,
  deletePrescription,
} from "../../services/prescriptionService";

import type { Prescription } from "../../types/prescription";

function PrescriptionDetails() {
  const { token, user } = useAuth();
  const { id } = useParams();
  const navigate = useNavigate();

  const [prescription, setPrescription] =
    useState<Prescription | null>(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadPrescription() {
      if (!token || !id) {
        setLoading(false);
        return;
      }

      try {
        const data = await getPrescriptionById(
          token,
          Number(id)
        );

        setPrescription(data);
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

  async function handleDelete() {
    if (!token || !id) {
      return;
    }

    const confirmed = window.confirm(
      "Are you sure you want to delete this prescription?"
    );

    if (!confirmed) {
      return;
    }

    try {
      await deletePrescription(
        token,
        Number(id)
      );

      navigate("/prescriptions");
    } catch (error) {
      console.error(error);

      if (error instanceof Error) {
        setError(error.message);
      } else {
        setError("Failed to delete prescription.");
      }
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

  if (error) {
    return (
      <div className="form-page">
        <div className="list-error">
          {error}
        </div>
      </div>
    );
  }

  if (!prescription) {
    return (
      <div className="form-page">
        <div className="empty-state">
          Prescription not found.
        </div>
      </div>
    );
  }

  const canEdit =
    user?.role === "admin" ||
    user?.role === "doctor";

  const canDelete =
    user?.role === "admin";

  return (
    <div className="form-page">
      <div className="form-page-header">
        <div>
          <h1>
            Prescription #{prescription.id}
          </h1>

          <p>
            View prescription and medication details.
          </p>
        </div>

        <div className="form-header-actions">
          {canEdit && (
            <Link
              to={`/prescriptions/${prescription.id}/edit`}
              className="secondary-button"
            >
              Edit
            </Link>
          )}

          {canDelete && (
            <button
              type="button"
              className="danger-button"
              onClick={handleDelete}
            >
              Delete
            </button>
          )}
        </div>
      </div>

      <div className="details-grid">
        <section className="details-card">
          <div className="details-card-header">
            <h2>Medical Information</h2>
          </div>

          <div className="details-list">
            <div className="details-item">
              <span>Patient</span>
              <strong>
                Patient #{prescription.patient_id}
              </strong>
            </div>

            <div className="details-item">
              <span>Doctor</span>
              <strong>
                Doctor #{prescription.doctor_id}
              </strong>
            </div>

            <div className="details-item">
              <span>Medical Record</span>
              <strong>
                Record #{prescription.medical_record_id}
              </strong>
            </div>

            <div className="details-item">
              <span>Created</span>
              <strong>
                {new Date(
                  prescription.created_at
                ).toLocaleString()}
              </strong>
            </div>
          </div>
        </section>

        <section className="details-card">
          <div className="details-card-header">
            <h2>Medication</h2>
          </div>

          <div className="details-list">
            <div className="details-item">
              <span>Medication</span>
              <strong>
                {prescription.medication}
              </strong>
            </div>

            <div className="details-item">
              <span>Dosage</span>
              <strong>
                {prescription.dosage}
              </strong>
            </div>

            <div className="details-item">
              <span>Frequency</span>
              <strong>
                {prescription.frequency}
              </strong>
            </div>

            <div className="details-item">
              <span>Duration</span>
              <strong>
                {prescription.duration}
              </strong>
            </div>
          </div>
        </section>

        <section className="details-card details-card-full">
          <div className="details-card-header">
            <h2>Instructions</h2>
          </div>

          <div className="details-text">
            {prescription.instructions}
          </div>
        </section>
      </div>

      <div className="details-footer">
        <Link
          to="/prescriptions"
          className="secondary-button"
        >
          Back to Prescriptions
        </Link>
      </div>
    </div>
  );
}

export default PrescriptionDetails;