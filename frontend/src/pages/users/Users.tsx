import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import { useAuth } from "../../context/AuthContext";
import { getUsers } from "../../services/userService";
import type { User } from "../../types/user";

function Users() {
  const { token } = useAuth();
  const navigate = useNavigate();

  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);

  const usersPerPage = 10;

  useEffect(() => {
    async function loadUsers() {
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const data = await getUsers(token);
        setUsers(data);
      } catch (error) {
        console.error(error);
        setError("Failed to load users.");
      } finally {
        setLoading(false);
      }
    }

    loadUsers();
  }, [token]);

  const filteredUsers = useMemo(() => {
    return users.filter((user) => {
      const searchValue = search.toLowerCase().trim();

      const matchesSearch =
        searchValue === "" ||
        user.id.toString().includes(searchValue) ||
        user.username.toLowerCase().includes(searchValue) ||
        user.email.toLowerCase().includes(searchValue);

      const matchesRole =
        roleFilter === "all" || user.role === roleFilter;

      const matchesStatus =
        statusFilter === "all" ||
        (statusFilter === "active" && user.is_active) ||
        (statusFilter === "inactive" && !user.is_active);

      return matchesSearch && matchesRole && matchesStatus;
    });
  }, [users, search, roleFilter, statusFilter]);

  const totalPages = Math.ceil(
    filteredUsers.length / usersPerPage
  );

  const startIndex = (currentPage - 1) * usersPerPage;

  const currentUsers = filteredUsers.slice(
    startIndex,
    startIndex + usersPerPage
  );

  function clearFilters() {
    setSearch("");
    setRoleFilter("all");
    setStatusFilter("all");
    setCurrentPage(1);
  }

  function getInitial(username: string) {
    return username.charAt(0).toUpperCase();
  }

  if (loading) {
    return (
      <div className="list-page">
        <div className="loading-state">Loading users...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="list-page">
        <div className="error-state">{error}</div>
      </div>
    );
  }

  return (
    <div className="list-page">

      {/* Page Header */}
      <div className="list-page-header">
        <div>
          <h1>Users</h1>
          <p>Manage system users and their access roles.</p>
        </div>

        <button
          className="primary-button"
          onClick={() => navigate("/users/new")}
        >
          <span>+</span>
          Add User
        </button>
      </div>

      {/* Filters */}
      <div className="filter-card">
        <div className="search-wrapper">
          <span className="search-icon">⌕</span>

          <input
            type="text"
            placeholder="Search by ID, username, or email..."
            value={search}
            onChange={(event) => {
              setSearch(event.target.value);
              setCurrentPage(1);
            }}
          />
        </div>

        <select
          value={roleFilter}
          onChange={(event) => {
            setRoleFilter(event.target.value);
            setCurrentPage(1);
          }}
        >
          <option value="all">All Roles</option>
          <option value="admin">Admin</option>
          <option value="doctor">Doctor</option>
          <option value="staff">Staff</option>
          <option value="patient">Patient</option>
        </select>

        <select
          value={statusFilter}
          onChange={(event) => {
            setStatusFilter(event.target.value);
            setCurrentPage(1);
          }}
        >
          <option value="all">All Statuses</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </select>

        <button
          className="clear-button"
          onClick={clearFilters}
        >
          Clear
        </button>
      </div>

      {/* Table Card */}
      <div className="table-card">

        <div className="table-card-header">
          <div>
            <h2>All Users</h2>
            <p>
              Showing{" "}
              <strong>{currentUsers.length}</strong>{" "}
              of{" "}
              <strong>{filteredUsers.length}</strong>{" "}
              users
            </p>
          </div>
        </div>

        {currentUsers.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">⌕</div>
            <h3>No users found</h3>
            <p>Try changing your search or filters.</p>
          </div>
        ) : (
          <div className="table-wrapper">
            <table className="data-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>USER</th>
                  <th>EMAIL</th>
                  <th>ROLE</th>
                  <th>STATUS</th>
                  <th>CREATED</th>
                  <th>ACTION</th>
                </tr>
              </thead>

              <tbody>
                {currentUsers.map((user) => (
                  <tr key={user.id}>

                    <td>
                      <span className="user-id">
                        #{user.id}
                      </span>
                    </td>

                    <td>
                      <div className="user-cell">
                        <div className="table-avatar">
                          {getInitial(user.username)}
                        </div>

                        <div>
                          <strong>{user.username}</strong>
                        </div>
                      </div>
                    </td>

                    <td>
                      <span className="email-text">
                        {user.email}
                      </span>
                    </td>

                    <td>
                      <span
                        className={`table-role role-${user.role}`}
                      >
                        {user.role}
                      </span>
                    </td>

                    <td>
                      <span
                        className={
                          user.is_active
                            ? "table-status status-active"
                            : "table-status status-inactive"
                        }
                      >
                        <span className="status-dot" />
                        {user.is_active
                          ? "Active"
                          : "Inactive"}
                      </span>
                    </td>

                    <td>
                      <span className="date-text">
                        {new Date(
                          user.created_at
                        ).toLocaleDateString()}
                      </span>
                    </td>

                    <td>
                      <button
                        className="table-action"
                        onClick={() =>
                          navigate(
                            `/users/${user.id}/edit`
                          )
                        }
                      >
                        Edit
                      </button>
                    </td>

                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="pagination">

            <button
              className="pagination-button"
              disabled={currentPage === 1}
              onClick={() =>
                setCurrentPage((page) => page - 1)
              }
            >
              ← Previous
            </button>

            <div className="pagination-info">
              Page <strong>{currentPage}</strong> of{" "}
              <strong>{totalPages}</strong>
            </div>

            <button
              className="pagination-button"
              disabled={currentPage === totalPages}
              onClick={() =>
                setCurrentPage((page) => page + 1)
              }
            >
              Next →
            </button>

          </div>
        )}

      </div>
    </div>
  );
}

export default Users;