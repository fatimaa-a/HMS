import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";

import { useAuth } from "../../context/AuthContext";
import {
  getDepartments,
  deleteDepartment,
} from "../../services/departmentService";
import type { Department } from "../../types/department";

function Departments() {
  const { token, user } = useAuth();

  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  const departmentsPerPage = 8;

  const isAdmin = user?.role === "admin";

  useEffect(() => {
    async function loadDepartments() {
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const data = await getDepartments(token);
        setDepartments(data);
      } catch (error) {
        console.error(error);

        if (error instanceof Error) {
          setError(error.message);
        } else {
          setError("Failed to load departments.");
        }
      } finally {
        setLoading(false);
      }
    }

    loadDepartments();
  }, [token]);

  async function handleDelete(id: number) {
    if (!token) return;

    const confirmed = window.confirm(
      "Are you sure you want to delete this department?"
    );

    if (!confirmed) return;

    try {
      await deleteDepartment(token, id);

      setDepartments((current) =>
        current.filter((department) => department.id !== id)
      );
    } catch (error) {
      console.error(error);

      if (error instanceof Error) {
        setError(error.message);
      } else {
        setError("Failed to delete department.");
      }
    }
  }

  const filteredDepartments = useMemo(() => {
    const searchValue = search.toLowerCase().trim();

    if (!searchValue) {
      return departments;
    }

    return departments.filter(
      (department) =>
        department.id.toString().includes(searchValue) ||
        department.name.toLowerCase().includes(searchValue) ||
        department.description.toLowerCase().includes(searchValue)
    );
  }, [departments, search]);

  const totalPages = Math.ceil(
    filteredDepartments.length / departmentsPerPage
  );

  const startIndex =
    (currentPage - 1) * departmentsPerPage;

  const currentDepartments = filteredDepartments.slice(
    startIndex,
    startIndex + departmentsPerPage
  );

  function clearSearch() {
    setSearch("");
    setCurrentPage(1);
  }

  if (loading) {
    return (
      <div className="list-page">
        <div className="loading-state">
          Loading departments...
        </div>
      </div>
    );
  }

  return (
    <div className="list-page">

      {/* Page Header */}
      <div className="list-page-header">
        <div>
          <h1>Departments</h1>
          <p>
            Manage hospital departments and their information.
          </p>
        </div>

        {isAdmin && (
          <Link
            to="/departments/new"
            className="primary-button"
          >
            <span>+</span>
            Add Department
          </Link>
        )}
      </div>

      {error && (
        <div className="list-error">
          {error}
        </div>
      )}

      {/* Search */}
      <div className="filter-card">
        <div className="search-wrapper">
          <span className="search-icon">⌕</span>

          <input
            type="text"
            placeholder="Search by ID, name, or description..."
            value={search}
            onChange={(event) => {
              setSearch(event.target.value);
              setCurrentPage(1);
            }}
          />
        </div>

        <button
          type="button"
          className="clear-button"
          onClick={clearSearch}
        >
          Clear
        </button>
      </div>

      {/* Department Table */}
      <div className="table-card">

        <div className="table-card-header">
          <div>
            <h2>All Departments</h2>

            <p>
              Showing{" "}
              <strong>
                {currentDepartments.length}
              </strong>{" "}
              of{" "}
              <strong>
                {filteredDepartments.length}
              </strong>{" "}
              departments
            </p>
          </div>
        </div>

        {currentDepartments.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">
              ⌕
            </div>

            <h3>No departments found</h3>

            <p>
              Try changing your search.
            </p>
          </div>
        ) : (
          <div className="table-wrapper">
            <table className="data-table departments-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>DEPARTMENT</th>
                  <th>DESCRIPTION</th>
                  <th>CREATED</th>

                  {isAdmin && (
                    <th>ACTIONS</th>
                  )}
                </tr>
              </thead>

              <tbody>
                {currentDepartments.map(
                  (department) => (
                    <tr key={department.id}>

                      <td>
                        <span className="user-id">
                          #{department.id}
                        </span>
                      </td>

                      <td>
                        <Link
                          to={`/departments/${department.id}`}
                          className="department-name"
                        >
                          <span className="department-icon">
                            +
                          </span>

                          <strong>
                            {department.name}
                          </strong>
                        </Link>
                      </td>

                      <td>
                        <span className="description-text">
                          {department.description ||
                            "No description"}
                        </span>
                      </td>

                      <td>
                        <span className="date-text">
                          {new Date(
                            department.created_at
                          ).toLocaleDateString()}
                        </span>
                      </td>

                      {isAdmin && (
                        <td>
                          <div className="table-actions">

                            <Link
                              to={`/departments/${department.id}/edit`}
                              className="table-action"
                            >
                              Edit
                            </Link>

                            <button
                              type="button"
                              className="table-delete-action"
                              onClick={() =>
                                handleDelete(
                                  department.id
                                )
                              }
                            >
                              Delete
                            </button>

                          </div>
                        </td>
                      )}

                    </tr>
                  )
                )}
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

export default Departments;