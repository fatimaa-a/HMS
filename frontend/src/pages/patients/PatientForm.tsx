import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import { useNavigate, useParams } from "react-router-dom";

import { useAuth } from "../../context/AuthContext";

import {
  createPatient,
  getPatientById,
  updatePatient,
} from "../../services/patientService";

function PatientForm() {
  const { token } = useAuth();
  const navigate = useNavigate();
  const { id } = useParams();

  const isEditMode = Boolean(id);

  const [userId, setUserId] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [gender, setGender] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [bloodGroup, setBloodGroup] = useState("");

  const [loading, setLoading] = useState(isEditMode);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadPatient() {
      if (!token || !id) {
        setLoading(false);
        return;
      }

      try {
        const patient = await getPatientById(
          token,
          Number(id)
        );

        setUserId(String(patient.user_id));
        setFirstName(patient.first_name);
        setLastName(patient.last_name);
        setDateOfBirth(patient.date_of_birth);
        setGender(patient.gender);
        setPhone(patient.phone);
        setAddress(patient.address);
        setBloodGroup(patient.blood_group);
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

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    if (!token) {
      setError("You must be logged in.");
      return;
    }

    if (!isEditMode && !userId) {
      setError("Please enter a user ID.");
      return;
    }

    setSaving(true);
    setError("");

    try {
      if (isEditMode) {
        await updatePatient(
          token,
          Number(id),
          {
            first_name: firstName,
            last_name: lastName,
            date_of_birth: dateOfBirth,
            gender,
            phone,
            address,
            blood_group: bloodGroup,
          }
        );
      } else {
        await createPatient(
          token,
          {
            user_id: Number(userId),
            first_name: firstName,
            last_name: lastName,
            date_of_birth: dateOfBirth,
            gender,
            phone,
            address,
            blood_group: bloodGroup,
          }
        );
      }

      navigate("/patients");
    } catch (error) {
      console.error(error);

      if (error instanceof Error) {
        setError(error.message);
      } else {
        setError("Failed to save patient.");
      }
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="form-page">
        <div className="loading-state">
          Loading patient...
        </div>
      </div>
    );
  }

  return (
    <div className="form-page">
      <div className="form-page-header">
        <div>
          <h1>
            {isEditMode
              ? "Edit Patient"
              : "Add Patient"}
          </h1>

          <p>
            {isEditMode
              ? "Update the patient's personal information."
              : "Create a new patient profile."}
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
              Account Information
            </div>

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
                  disabled={isEditMode}
                  required={!isEditMode}
                />
              </div>
            </div>

            {!isEditMode && (
              <p className="form-help">
                Enter the ID of the user account that
                this patient profile belongs to.
              </p>
            )}
          </div>

          <div className="form-section">
            <div className="form-section-title">
              Personal Information
            </div>

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
                <label htmlFor="dateOfBirth">
                  Date of Birth
                </label>

                <input
                  id="dateOfBirth"
                  type="date"
                  value={dateOfBirth}
                  onChange={(event) =>
                    setDateOfBirth(event.target.value)
                  }
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="gender">
                  Gender
                </label>

                <select
                  id="gender"
                  value={gender}
                  onChange={(event) =>
                    setGender(event.target.value)
                  }
                  required
                >
                  <option value="">
                    Select gender
                  </option>

                  <option value="male">
                    Male
                  </option>

                  <option value="female">
                    Female
                  </option>

                  <option value="other">
                    Other
                  </option>
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="bloodGroup">
                  Blood Group
                </label>

                <select
                  id="bloodGroup"
                  value={bloodGroup}
                  onChange={(event) =>
                    setBloodGroup(event.target.value)
                  }
                  required
                >
                  <option value="">
                    Select blood group
                  </option>

                  <option value="A+">A+</option>
                  <option value="A-">A-</option>
                  <option value="B+">B+</option>
                  <option value="B-">B-</option>
                  <option value="AB+">AB+</option>
                  <option value="AB-">AB-</option>
                  <option value="O+">O+</option>
                  <option value="O-">O-</option>
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="phone">
                  Phone
                </label>

                <input
                  id="phone"
                  type="tel"
                  value={phone}
                  onChange={(event) =>
                    setPhone(event.target.value)
                  }
                  placeholder="Enter phone number"
                  required
                />
              </div>
            </div>
          </div>

          <div className="form-section">
            <div className="form-section-title">
              Contact Information
            </div>

            <div className="form-group">
              <label htmlFor="address">
                Address
              </label>

              <textarea
                id="address"
                value={address}
                onChange={(event) =>
                  setAddress(event.target.value)
                }
                placeholder="Enter patient's address"
                rows={4}
                required
              />
            </div>
          </div>

          <div className="form-actions">
            <button
              type="button"
              className="secondary-button"
              onClick={() =>
                navigate("/patients")
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
                : isEditMode
                  ? "Update Patient"
                  : "Create Patient"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default PatientForm;