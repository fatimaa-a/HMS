import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";

import { useAuth } from "../../context/AuthContext";
import { getStaff } from "../../services/staffService";

import type { Staff as StaffType } from "../../types/staff";

function Staff() {
  const { token, user } = useAuth();

  const [staff, setStaff] = useState<StaffType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [positionFilter, setPositionFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);

  const staffPerPage = 8;

  const isAdmin = user?.role === "admin";

  useEffect(() => {
    async function loadStaff() {
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const data = await getStaff(token);
        setStaff(data);
      } catch (error) {
        console.error(error);

        if (error instanceof Error) {
          setError(error.message);
        } else {
          setError("Failed to load staff.");
        }
      } finally {
        setLoading(false);
      }
    }

    loadStaff();
  }, [token]);

  const positions = useMemo(() => {
    return Array.from(
      new Set(staff.map((member) => member.position))
    ).sort();
  }, [staff]);

  const filteredStaff = useMemo(() => {
    const searchValue = search.toLowerCase().trim();

    return staff.filter((member) => {
      const fullName =
        `${member.first_name} ${member.last_name}`.toLowerCase();

      const matchesSearch =
        searchValue === "" ||
        member.id.toString().includes(searchValue) ||
        member.user_id.toString().includes(searchValue) ||
        fullName.includes(searchValue) ||
        member.position.toLowerCase().includes(searchValue) ||
        member.phone.toLowerCase().includes(searchValue);

      const matchesPosition =
        positionFilter === "all" ||
        member.position === positionFilter;

      return matchesSearch && matchesPosition;
    });
  }, [staff, search, positionFilter]);

  const totalPages = Math.ceil(
    filteredStaff.length / staffPerPage
  );

  const startIndex =
    (currentPage - 1) * staffPerPage;

  const currentStaff = filteredStaff.slice(
    startIndex,
    startIndex + staffPerPage
  );

  function clearFilters() {
    setSearch("");
    setPositionFilter("all");
    setCurrentPage(1);
  }

  function getInitials(
    firstName: string,
    lastName: string
  ) {
    return `${firstName.charAt(0)}${lastName.charAt(
      0
    )}`.toUpperCase();
  }

  if (loading) {
    return (
      <div className="list-page">
        <div className="loading-state">
          Loading staff...
        </div>
      </div>
    );
  }

  return (
    <div className="list-page">
      <div className="list-page-header">
        <div>
          <h1>Staff</h1>
          <p>
            Manage hospital staff and department assignments.
          </p>
        </div>
      </div>

      {error && (
        <div className="list-error">
          {error}
        </div>
      )}

      <div className="filter-card">
        <div className="search-wrapper">
          <span className="search-icon">⌕</span>

          <input
            type="text"
            placeholder="Search by name, position, phone..."
            value={search}
            onChange={(event) => {
              setSearch(event.target.value);
              setCurrentPage(1);
            }}
          />
        </div>

        <select
          value={positionFilter}
          onChange={(event) => {
            setPositionFilter(event.target.value);
            setCurrentPage(1);
          }}
        >
          <option value="all">
            All Positions
          </option>

          {positions.map((position) => (
            <option
              key={position}
              value={position}
            >
              {position}
            </option>
          ))}
        </select>

        <button
          type="button"
          className="clear-button"
          onClick={clearFilters}
        >
          Clear
        </button>
      </div>

      <div className="table-card">
        <div className="table-card-header">
          <div>
            <h2>All Staff</h2>

            <p>
              Showing{" "}
              <strong>
                {currentStaff.length}
              </strong>{" "}
              of{" "}
              <strong>
                {filteredStaff.length}
              </strong>{" "}
              staff members
            </p>
          </div>
        </div>

        {currentStaff.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">
              ♙
            </div>

            <h3>No staff found</h3>

            <p>
              Try changing your search or filters.
            </p>
          </div>
        ) : (
          <div className="table-wrapper">
            <table className="data-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>STAFF</th>
                  <th>POSITION</th>
                  <th>DEPARTMENT</th>
                  <th>PHONE</th>
                  <th>ACTIONS</th>
                </tr>
              </thead>

              <tbody>
                {currentStaff.map((member) => (
                  <tr key={member.id}>
                    <td>
                      <span className="user-id">
                        #{member.id}
                      </span>
                    </td>

                    <td>
                      <Link
                        to={`/staff/${member.id}`}
                        className="doctor-name"
                      >
                        <span className="doctor-avatar">
                          {getInitials(
                            member.first_name,
                            member.last_name
                          )}
                        </span>

                        <span className="doctor-name-text">
                          <strong>
                            {member.first_name}{" "}
                            {member.last_name}
                          </strong>

                          <small>
                            User #{member.user_id}
                          </small>
                        </span>
                      </Link>
                    </td>

                    <td>
                      <span className="specialization-badge">
                        {member.position}
                      </span>
                    </td>

                    <td>
                      <span className="department-id">
                        Department #{member.department_id}
                      </span>
                    </td>

                    <td>
                      <span className="phone-text">
                        {member.phone}
                      </span>
                    </td>

                    <td>
                      <div className="table-actions">
                        <Link
                          to={`/staff/${member.id}`}
                          className="table-action"
                        >
                          View
                        </Link>

                        {isAdmin && (
                          <Link
                            to={`/staff/${member.id}/edit`}
                            className="table-action"
                          >
                            Edit
                          </Link>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {totalPages > 1 && (
          <div className="pagination">
            <button
              className="pagination-button"
              disabled={currentPage === 1}
              onClick={() =>
                setCurrentPage(
                  (page) => page - 1
                )
              }
            >
              ← Previous
            </button>

            <div className="pagination-info">
              Page{" "}
              <strong>{currentPage}</strong>{" "}
              of{" "}
              <strong>{totalPages}</strong>
            </div>

            <button
              className="pagination-button"
              disabled={
                currentPage === totalPages
              }
              onClick={() =>
                setCurrentPage(
                  (page) => page + 1
                )
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

export default Staff;