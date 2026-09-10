import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import {
  createUser,
  getUserById,
  updateUser,
} from "../../services/userService";

function UserForm() {
  const { token } = useAuth();
  const navigate = useNavigate();
  const { id } = useParams();

  const isEditMode = Boolean(id);

  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("staff");
  const [isActive, setIsActive] = useState(true);

  const [loading, setLoading] = useState(isEditMode);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadUser() {
      if (!token || !id) {
        setLoading(false);
        return;
      }

      try {
        const user = await getUserById(token, Number(id));

        setUsername(user.username);
        setEmail(user.email);
        setRole(user.role);
        setIsActive(user.is_active);
      } catch (error) {
        console.error(error);

        if (error instanceof Error) {
          setError(error.message);
        } else {
          setError("Failed to load user.");
        }
      } finally {
        setLoading(false);
      }
    }

    loadUser();
  }, [token, id]);

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
        await updateUser(token, Number(id), {
          username,
          email,
          role,
          is_active: isActive,
        });
      } else {
        await createUser(token, {
          username,
          email,
          password,
          role,
        });
      }

      navigate("/users");
    } catch (error) {
      console.error(error);

      if (error instanceof Error) {
        setError(error.message);
      } else {
        setError("Something went wrong.");
      }
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="form-page">
        <p className="loading-state">Loading user...</p>
      </div>
    );
  }

  return (
    <div className="form-page">
      <div className="form-page-header">
        <div>
          <h1>
            {isEditMode ? "Edit User" : "Create User"}
          </h1>

          <p>
            {isEditMode
              ? "Update the user's account information."
              : "Create a new user account for the hospital system."}
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
        <section className="form-section">
          <h2 className="form-section-title">
            Account Information
          </h2>

          <div className="form-grid">
            <div className="form-group">
              <label htmlFor="username">
                Username
              </label>

              <input
                id="username"
                type="text"
                value={username}
                onChange={(event) =>
                  setUsername(event.target.value)
                }
                placeholder="Enter username"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="email">
                Email
              </label>

              <input
                id="email"
                type="email"
                value={email}
                onChange={(event) =>
                  setEmail(event.target.value)
                }
                placeholder="Enter email address"
                required
              />
            </div>

            {!isEditMode && (
              <div className="form-group">
                <label htmlFor="password">
                  Password
                </label>

                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(event) =>
                    setPassword(event.target.value)
                  }
                  placeholder="Enter password"
                  required
                />

                <p className="form-help">
                  The password will be securely stored as a
                  hash.
                </p>
              </div>
            )}

            <div className="form-group">
              <label htmlFor="role">
                Role
              </label>

              <select
                id="role"
                value={role}
                onChange={(event) =>
                  setRole(event.target.value)
                }
              >
                <option value="admin">Admin</option>
                <option value="doctor">Doctor</option>
                <option value="staff">Staff</option>
                <option value="patient">Patient</option>
              </select>
            </div>
          </div>
        </section>

        {isEditMode && (
          <section className="form-section">
            <h2 className="form-section-title">
              Account Status
            </h2>

            <div className="form-group">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={isActive}
                  onChange={(event) =>
                    setIsActive(event.target.checked)
                  }
                />

                <span>
                  Active account
                </span>
              </label>

              <p className="form-help">
                Inactive users will not be able to access the
                system.
              </p>
            </div>
          </section>
        )}

        <div className="form-actions">
          <button
            type="button"
            className="secondary-button"
            onClick={() => navigate("/users")}
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
                ? "Update User"
                : "Create User"}
          </button>
        </div>
      </form>
    </div>
  );
}

export default UserForm;