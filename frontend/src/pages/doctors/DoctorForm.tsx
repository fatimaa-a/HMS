import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import { useNavigate, useParams } from "react-router-dom";

import { useAuth } from "../../context/AuthContext";
import {
  createDoctor,
  getDoctorById,
  updateDoctor,
} from "../../services/doctorService";
import { getDepartments } from "../../services/departmentService";

import type { Department } from "../../types/department";

function DoctorForm() {
  const { token } = useAuth();
  const navigate = useNavigate();
  const { id } = useParams();

  const isEditMode = Boolean(id);

  const [userId, setUserId] = useState("");
  const [departmentId, setDepartmentId] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [specialization, setSpecialization] = useState("");
  const [licenseNumber, setLicenseNumber] = useState("");
  const [phone, setPhone] = useState("");

  const [departments, setDepartments] = useState<Department[]>([]);

  const [loading, setLoading] = useState(isEditMode);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadData() {
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const departmentData = await getDepartments(token);
        setDepartments(departmentData);

        if (isEditMode && id) {
          const doctor = await getDoctorById(
            token,
            Number(id)
          );

          setUserId(String(doctor.user_id));
          setDepartmentId(String(doctor.department_id));
          setFirstName(doctor.first_name);
          setLastName(doctor.last_name);
          setSpecialization(doctor.specialization);
          setLicenseNumber(doctor.license_number);
          setPhone(doctor.phone);
        }
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

    loadData();
  }, [token, id, isEditMode]);

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    if (!token) {
      return;
    }

    try {
      setSaving(true);
      setError("");

      if (isEditMode) {
        await updateDoctor(token, Number(id), {
          department_id: Number(departmentId),
          first_name: firstName,
          last_name: lastName,
          specialization,
          phone,
        });
      } else {
        await createDoctor(token, {
          user_id: Number(userId),
          department_id: Number(departmentId),
          first_name: firstName,
          last_name: lastName,
          specialization,
          license_number: licenseNumber,
          phone,
        });
      }

      navigate("/doctors");
    } catch (error) {
      console.error(error);

      if (error instanceof Error) {
        setError(error.message);
      } else {
        setError("Failed to save doctor.");
      }
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="form-page">
        <p className="loading-state">
          Loading doctor...
        </p>
      </div>
    );
  }

  return (
    <div className="form-page">
      <div className="form-page-header">
        <div>
          <h1>
            {isEditMode
              ? "Edit Doctor"
              : "Add Doctor"}
          </h1>

          <p>
            {isEditMode
              ? "Update the doctor's professional information."
              : "Add a new doctor to the hospital system."}
          </p>
        </div>
      </div>

      {error && (
        <p className="list-error">
          {error}
        </p>
      )}

      <form
        className="form-card"
        onSubmit={handleSubmit}
      >
        {!isEditMode && (
          <section className="form-section">
            <h2 className="form-section-title">
              Account Information
            </h2>

            <div className="form-grid">
              <div className="form-group">
                <label htmlFor="userId">
                  User ID
                </label>

                <input
                  id="userId"
                  type="number"
                  value={userId}
                  onChange={(event) =>
                    setUserId(event.target.value)
                  }
                  placeholder="Enter user ID"
                  required
                />

                <p className="form-help">
                  Enter the ID of the existing user
                  account for this doctor.
                </p>
              </div>
            </div>
          </section>
        )}

        <section className="form-section">
          <h2 className="form-section-title">
            Professional Information
          </h2>

          <div className="form-grid">
            <div className="form-group">
              <label htmlFor="firstName">
                First Name
              </label>

              <input
                id="firstName"
                type="text"
                value={firstName}
                onChange={(event) =>
                  setFirstName(event.target.value)
                }
                placeholder="Enter first name"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="lastName">
                Last Name
              </label>

              <input
                id="lastName"
                type="text"
                value={lastName}
                onChange={(event) =>
                  setLastName(event.target.value)
                }
                placeholder="Enter last name"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="department">
                Department
              </label>

              <select
                id="department"
                value={departmentId}
                onChange={(event) =>
                  setDepartmentId(event.target.value)
                }
                required
              >
                <option value="">
                  Select Department
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
              <label htmlFor="specialization">
                Specialization
              </label>

              <input
                id="specialization"
                type="text"
                value={specialization}
                onChange={(event) =>
                  setSpecialization(event.target.value)
                }
                placeholder="e.g. Cardiology"
                required
              />
            </div>

            {!isEditMode && (
              <div className="form-group">
                <label htmlFor="licenseNumber">
                  License Number
                </label>

                <input
                  id="licenseNumber"
                  type="text"
                  value={licenseNumber}
                  onChange={(event) =>
                    setLicenseNumber(event.target.value)
                  }
                  placeholder="Enter license number"
                  required
                />

                <p className="form-help">
                  The professional license number
                  cannot be changed after creation.
                </p>
              </div>
            )}

            <div className="form-group">
              <label htmlFor="phone">
                Phone
              </label>

              <input
                id="phone"
                type="text"
                value={phone}
                onChange={(event) =>
                  setPhone(event.target.value)
                }
                placeholder="Enter phone number"
                required
              />
            </div>
          </div>
        </section>

        {isEditMode && (
          <section className="form-section">
            <h2 className="form-section-title">
              Doctor Information
            </h2>

            <div className="form-grid">
              <div className="form-group">
                <label htmlFor="doctorUserId">
                  User ID
                </label>

                <input
                  id="doctorUserId"
                  type="text"
                  value={userId}
                  disabled
                />

                <p className="form-help">
                  The user account linked to this doctor
                  cannot be changed here.
                </p>
              </div>

              <div className="form-group">
                <label htmlFor="doctorLicense">
                  License Number
                </label>

                <input
                  id="doctorLicense"
                  type="text"
                  value={licenseNumber}
                  disabled
                />

                <p className="form-help">
                  License information is read-only.
                </p>
              </div>
            </div>
          </section>
        )}

        <div className="form-actions">
          <button
            type="button"
            className="secondary-button"
            onClick={() => navigate("/doctors")}
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
              : isEditMode
                ? "Update Doctor"
                : "Create Doctor"}
          </button>
        </div>
      </form>
    </div>
  );
}

export default DoctorForm;