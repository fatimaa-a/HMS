import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { getDoctorById } from "../../services/doctorService";
import type { Doctor } from "../../types/doctor";

function DoctorDetails() {
  const { token, user } = useAuth();
  const { id } = useParams();

  const [doctor, setDoctor] = useState<Doctor | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const isAdmin = user?.role === "admin";

  useEffect(() => {
    async function loadDoctor() {
      if (!token || !id) {
        setLoading(false);
        return;
      }

      try {
        const data = await getDoctorById(token, Number(id));
        setDoctor(data);
      } catch (error) {
        console.error(error);

        if (error instanceof Error) {
          setError(error.message);
        } else {
          setError("Failed to load doctor.");
        }
      } finally {
        setLoading(false);
      }
    }

    loadDoctor();
  }, [token, id]);

  if (loading) {
    return (
      <div className="details-page">
        <p>Loading doctor...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="details-page">
        <p className="list-error">{error}</p>
      </div>
    );
  }

  if (!doctor) {
    return (
      <div className="details-page">
        <p>Doctor not found.</p>
      </div>
    );
  }

  return (
    <div className="details-page">
      <div className="form-page-header">
        <div>
          <h1>
            Dr. {doctor.first_name} {doctor.last_name}
          </h1>

          <p>
            {doctor.specialization} · Doctor #{doctor.id}
          </p>
        </div>

        <div className="form-header-actions">
          {isAdmin && (
            <Link
              to={`/doctors/${doctor.id}/edit`}
              className="primary-button"
            >
              Edit Doctor
            </Link>
          )}

          <Link
            to="/doctors"
            className="secondary-button"
          >
            Back to Doctors
          </Link>
        </div>
      </div>

      <div className="details-grid">
        <section className="details-card">
          <div className="details-card-header">
            <h2>Professional Information</h2>
          </div>

          <div className="details-list">
            <div className="details-item">
              <span>Doctor ID</span>
              <strong>#{doctor.id}</strong>
            </div>

            <div className="details-item">
              <span>User ID</span>
              <strong>#{doctor.user_id}</strong>
            </div>

            <div className="details-item">
              <span>Department ID</span>
              <strong>#{doctor.department_id}</strong>
            </div>

            <div className="details-item">
              <span>Specialization</span>
              <strong>{doctor.specialization}</strong>
            </div>
          </div>
        </section>

        <section className="details-card">
          <div className="details-card-header">
            <h2>Contact & License</h2>
          </div>

          <div className="details-list">
            <div className="details-item">
              <span>License Number</span>
              <strong>{doctor.license_number}</strong>
            </div>

            <div className="details-item">
              <span>Phone</span>
              <strong>{doctor.phone}</strong>
            </div>

            <div className="details-item">
              <span>Registered</span>
              <strong>
                {new Date(
                  doctor.created_at
                ).toLocaleDateString()}
              </strong>
            </div>
          </div>
        </section>

        <section className="details-card details-card-full">
          <div className="details-card-header">
            <h2>Doctor Summary</h2>
          </div>

          <div className="details-text">
            Dr. {doctor.first_name} {doctor.last_name} is a{" "}
            {doctor.specialization.toLowerCase()} doctor
            registered in department #{doctor.department_id}.
            Their professional license number is{" "}
            {doctor.license_number}.
          </div>
        </section>
      </div>
    </div>
  );
}

export default DoctorDetails;