import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";

import { useAuth } from "../../context/AuthContext";
import { getStaffById } from "../../services/staffService";

import type { Staff } from "../../types/staff";

function StaffDetails() {
  const { token } = useAuth();
  const { id } = useParams();

  const [staff, setStaff] = useState<Staff | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadStaff() {
      if (!token || !id) {
        setLoading(false);
        return;
      }

      try {
        const data = await getStaffById(
          token,
          Number(id)
        );

        setStaff(data);
      } catch (error) {
        console.error(error);

        if (error instanceof Error) {
          setError(error.message);
        } else {
          setError("Failed to load staff member.");
        }
      } finally {
        setLoading(false);
      }
    }

    loadStaff();
  }, [token, id]);

  if (loading) {
    return (
      <div className="details-page">
        <p>Loading staff member...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="details-page">
        <p className="list-error">
          {error}
        </p>
      </div>
    );
  }

  if (!staff) {
    return (
      <div className="details-page">
        <p>Staff member not found.</p>
      </div>
    );
  }

  return (
    <div className="details-page">
      <div className="form-page-header">
        <div>
          <h1>
            {staff.first_name} {staff.last_name}
          </h1>

          <p>
            {staff.position} · Staff #{staff.id}
          </p>
        </div>

        <div className="form-header-actions">
          <Link
            to="/staff"
            className="secondary-button"
          >
            Back to Staff
          </Link>
        </div>
      </div>

      <div className="details-grid">
        <section className="details-card">
          <div className="details-card-header">
            <h2>Staff Information</h2>
          </div>

          <div className="details-list">
            <div className="details-item">
              <span>Staff ID</span>
              <strong>#{staff.id}</strong>
            </div>

            <div className="details-item">
              <span>User ID</span>
              <strong>#{staff.user_id}</strong>
            </div>

            <div className="details-item">
              <span>Department ID</span>
              <strong>
                #{staff.department_id}
              </strong>
            </div>

            <div className="details-item">
              <span>Position</span>
              <strong>{staff.position}</strong>
            </div>
          </div>
        </section>

        <section className="details-card">
          <div className="details-card-header">
            <h2>Contact Information</h2>
          </div>

          <div className="details-list">
            <div className="details-item">
              <span>First Name</span>
              <strong>{staff.first_name}</strong>
            </div>

            <div className="details-item">
              <span>Last Name</span>
              <strong>{staff.last_name}</strong>
            </div>

            <div className="details-item">
              <span>Phone</span>
              <strong>{staff.phone}</strong>
            </div>

            <div className="details-item">
              <span>Registered</span>
              <strong>
                {new Date(
                  staff.created_at
                ).toLocaleDateString()}
              </strong>
            </div>
          </div>
        </section>

        <section className="details-card details-card-full">
          <div className="details-card-header">
            <h2>Staff Summary</h2>
          </div>

          <div className="details-text">
            {staff.first_name} {staff.last_name} is a{" "}
            {staff.position.toLowerCase()} assigned to
            department #{staff.department_id}.
          </div>
        </section>
      </div>
    </div>
  );
}

export default StaffDetails;