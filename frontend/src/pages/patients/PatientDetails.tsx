import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";

import { useAuth } from "../../context/AuthContext";

import { getPatientById } from "../../services/patientService";

import type { Patient } from "../../types/patient";

function PatientDetails() {
  const { token, user } = useAuth();
  const { id } = useParams();

  const [patient, setPatient] =
    useState<Patient | null>(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadPatient() {
      if (!token || !id) {
        setLoading(false);
        return;
      }

      try {
        const data = await getPatientById(
          token,
          Number(id)
        );

        setPatient(data);
      } catch (error) {
        console.error(error);

        if (error instanceof Error) {
          setError(error.message);
        } else {
          setError("Failed to load patient.");
        }
      } finally {
        setLoading(false);
      }
    }

    loadPatient();
  }, [token, id]);

  if (loading) {
    return (
      <div className="form-page">
        <div className="loading-state">
          Loading patient...
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

  if (!patient) {
    return (
      <div className="form-page">
        <div className="empty-state">
          Patient not found.
        </div>
      </div>
    );
  }

  const canManage =
    user?.role === "admin" ||
    user?.role === "staff";

  const birthDate = new Date(
    patient.date_of_birth
  );

  const today = new Date();

  let age =
    today.getFullYear() -
    birthDate.getFullYear();

  const monthDifference =
    today.getMonth() -
    birthDate.getMonth();

  if (
    monthDifference < 0 ||
    (monthDifference === 0 &&
      today.getDate() < birthDate.getDate())
  ) {
    age--;
  }

  return (
    <div className="form-page">
      <div className="form-page-header">
        <div>
          <h1>
            {patient.first_name}{" "}
            {patient.last_name}
          </h1>

          <p>
            Patient #{patient.id} · {age} years old
          </p>
        </div>

        {canManage && (
          <Link
            to={`/patients/${patient.id}/edit`}
            className="primary-button"
          >
            Edit Patient
          </Link>
        )}
      </div>

      <div className="details-grid">
        <section className="details-card">
          <div className="details-card-header">
            <h2>Personal Information</h2>
          </div>

          <div className="details-list">
            <div className="details-item">
              <span>Patient ID</span>

              <strong>
                #{patient.id}
              </strong>
            </div>

            <div className="details-item">
              <span>User ID</span>

              <strong>
                #{patient.user_id}
              </strong>
            </div>

            <div className="details-item">
              <span>Full Name</span>

              <strong>
                {patient.first_name}{" "}
                {patient.last_name}
              </strong>
            </div>

            <div className="details-item">
              <span>Date of Birth</span>

              <strong>
                {new Date(
                  patient.date_of_birth
                ).toLocaleDateString()}
              </strong>
            </div>

            <div className="details-item">
              <span>Age</span>

              <strong>
                {age} years
              </strong>
            </div>

            <div className="details-item">
              <span>Gender</span>

              <strong>
                {patient.gender}
              </strong>
            </div>
          </div>
        </section>

        <section className="details-card">
          <div className="details-card-header">
            <h2>Medical Information</h2>
          </div>

          <div className="details-list">
            <div className="details-item">
              <span>Blood Group</span>

              <strong>
                {patient.blood_group}
              </strong>
            </div>

            <div className="details-item">
              <span>Phone</span>

              <strong>
                {patient.phone}
              </strong>
            </div>

            <div className="details-item">
              <span>Profile Created</span>

              <strong>
                {new Date(
                  patient.created_at
                ).toLocaleDateString()}
              </strong>
            </div>
          </div>
        </section>

        <section className="details-card details-card-full">
          <div className="details-card-header">
            <h2>Address</h2>
          </div>

          <div className="details-text">
            {patient.address}
          </div>
        </section>
      </div>

      <div className="details-footer">
        <Link
          to="/patients"
          className="secondary-button"
        >
          Back to Patients
        </Link>
      </div>
    </div>
  );
}

export default PatientDetails;