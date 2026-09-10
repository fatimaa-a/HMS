import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { getUserById } from "../../services/userService";
import type { User } from "../../types/user";

function UserDetails() {
  const { token, user } = useAuth();
  const { id } = useParams();

  const [account, setAccount] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const isAdmin = user?.role === "admin";

  useEffect(() => {
    async function loadUser() {
      if (!token || !id) {
        setLoading(false);
        return;
      }

      try {
        const data = await getUserById(token, Number(id));
        setAccount(data);
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

  if (loading) {
    return (
      <div className="details-page">
        <p>Loading user...</p>
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

  if (!account) {
    return (
      <div className="details-page">
        <p>User not found.</p>
      </div>
    );
  }

  return (
    <div className="details-page">
      <div className="form-page-header">
        <div>
          <h1>{account.username}</h1>
          <p>User ID: #{account.id}</p>
        </div>

        <div className="form-header-actions">
          {isAdmin && (
            <Link
              to={`/users/${account.id}/edit`}
              className="primary-button"
            >
              Edit User
            </Link>
          )}

          <Link to="/users" className="secondary-button">
            Back to Users
          </Link>
        </div>
      </div>

      <div className="details-grid">
        <section className="details-card">
          <div className="details-card-header">
            <h2>Account Information</h2>
          </div>

          <div className="details-list">
            <div className="details-item">
              <span>Username</span>
              <strong>{account.username}</strong>
            </div>

            <div className="details-item">
              <span>Email</span>
              <strong>{account.email}</strong>
            </div>

            <div className="details-item">
              <span>Role</span>
              <strong>{account.role}</strong>
            </div>
          </div>
        </section>

        <section className="details-card">
          <div className="details-card-header">
            <h2>Account Status</h2>
          </div>

          <div className="details-list">
            <div className="details-item">
              <span>Status</span>
              <strong>
                {account.is_active ? "Active" : "Inactive"}
              </strong>
            </div>

            <div className="details-item">
              <span>User ID</span>
              <strong>#{account.id}</strong>
            </div>

            <div className="details-item">
              <span>Created</span>
              <strong>
                {new Date(account.created_at).toLocaleDateString()}
              </strong>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

export default UserDetails;