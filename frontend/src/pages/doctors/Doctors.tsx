import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";

import { useAuth } from "../../context/AuthContext";
import {
  getDoctors,
  deleteDoctor,
} from "../../services/doctorService";
import type { Doctor } from "../../types/doctor";

function Doctors() {
  const { token, user } = useAuth();

  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [specializationFilter, setSpecializationFilter] =
    useState("all");
  const [currentPage, setCurrentPage] = useState(1);

  const doctorsPerPage = 8;

  const isAdmin = user?.role === "admin";

  useEffect(() => {
    async function loadDoctors() {
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const data = await getDoctors(token);
        setDoctors(data);
      } catch (error) {
        console.error(error);

        if (error instanceof Error) {
          setError(error.message);
        } else {
          setError("Failed to load doctors.");
        }
      } finally {
        setLoading(false);
      }
    }

    loadDoctors();
  }, [token]);

  async function handleDelete(id: number) {
    if (!token) return;

    const confirmed = window.confirm(
      "Are you sure you want to delete this doctor?"
    );

    if (!confirmed) return;

    try {
      await deleteDoctor(token, id);

      setDoctors((current) =>
        current.filter((doctor) => doctor.id !== id)
      );
    } catch (error) {
      console.error(error);

      if (error instanceof Error) {
        setError(error.message);
      } else {
        setError("Failed to delete doctor.");
      }
    }
  }

  const specializations = useMemo(() => {
    return Array.from(
      new Set(doctors.map((doctor) => doctor.specialization))
    ).sort();
  }, [doctors]);

  const filteredDoctors = useMemo(() => {
    const searchValue = search.toLowerCase().trim();

    return doctors.filter((doctor) => {
      const fullName =
        `${doctor.first_name} ${doctor.last_name}`.toLowerCase();

      const matchesSearch =
        searchValue === "" ||
        doctor.id.toString().includes(searchValue) ||
        fullName.includes(searchValue) ||
        doctor.specialization
          .toLowerCase()
          .includes(searchValue) ||
        doctor.phone.toLowerCase().includes(searchValue) ||
        doctor.license_number
          .toLowerCase()
          .includes(searchValue);

      const matchesSpecialization =
        specializationFilter === "all" ||
        doctor.specialization === specializationFilter;

      return matchesSearch && matchesSpecialization;
    });
  }, [doctors, search, specializationFilter]);

  const totalPages = Math.ceil(
    filteredDoctors.length / doctorsPerPage
  );

  const startIndex =
    (currentPage - 1) * doctorsPerPage;

  const currentDoctors = filteredDoctors.slice(
    startIndex,
    startIndex + doctorsPerPage
  );

  function clearFilters() {
    setSearch("");
    setSpecializationFilter("all");
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
          Loading doctors...
        </div>
      </div>
    );
  }

  return (
    <div className="list-page">

      {/* Page Header */}
      <div className="list-page-header">
        <div>
          <h1>Doctors</h1>
          <p>
            Manage doctors, specializations, and
            department assignments.
          </p>
        </div>

        {isAdmin && (
          <Link
            to="/doctors/new"
            className="primary-button"
          >
            <span>+</span>
            Add Doctor
          </Link>
        )}
      </div>

      {error && (
        <div className="list-error">
          {error}
        </div>
      )}

      {/* Filters */}
      <div className="filter-card">
        <div className="search-wrapper">
          <span className="search-icon">⌕</span>

          <input
            type="text"
            placeholder="Search by name, specialization, phone..."
            value={search}
            onChange={(event) => {
              setSearch(event.target.value);
              setCurrentPage(1);
            }}
          />
        </div>

        <select
          value={specializationFilter}
          onChange={(event) => {
            setSpecializationFilter(
              event.target.value
            );
            setCurrentPage(1);
          }}
        >
          <option value="all">
            All Specializations
          </option>

          {specializations.map(
            (specialization) => (
              <option
                key={specialization}
                value={specialization}
              >
                {specialization}
              </option>
            )
          )}
        </select>

        <button
          type="button"
          className="clear-button"
          onClick={clearFilters}
        >
          Clear
        </button>
      </div>

      {/* Doctors Table */}
      <div className="table-card">

        <div className="table-card-header">
          <div>
            <h2>All Doctors</h2>

            <p>
              Showing{" "}
              <strong>
                {currentDoctors.length}
              </strong>{" "}
              of{" "}
              <strong>
                {filteredDoctors.length}
              </strong>{" "}
              doctors
            </p>
          </div>
        </div>

        {currentDoctors.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">
              ♙
            </div>

            <h3>No doctors found</h3>

            <p>
              Try changing your search or filters.
            </p>
          </div>
        ) : (
          <div className="table-wrapper">
            <table className="data-table doctors-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>DOCTOR</th>
                  <th>SPECIALIZATION</th>
                  <th>DEPARTMENT</th>
                  <th>PHONE</th>
                  <th>ACTIONS</th>
                </tr>
              </thead>

              <tbody>
                {currentDoctors.map((doctor) => (
                  <tr key={doctor.id}>

                    {/* ID */}
                    <td>
                      <span className="user-id">
                        #{doctor.id}
                      </span>
                    </td>

                    {/* Doctor */}
                    <td>
                      <Link
                        to={`/doctors/${doctor.id}`}
                        className="doctor-name"
                      >
                        <span className="doctor-avatar">
                          {getInitials(
                            doctor.first_name,
                            doctor.last_name
                          )}
                        </span>

                        <span className="doctor-name-text">
                          <strong>
                            Dr. {doctor.first_name}{" "}
                            {doctor.last_name}
                          </strong>

                          <small>
                            License #{doctor.license_number}
                          </small>
                        </span>
                      </Link>
                    </td>

                    {/* Specialization */}
                    <td>
                      <span className="specialization-badge">
                        {doctor.specialization}
                      </span>
                    </td>

                    {/* Department */}
                    <td>
                      <span className="department-id">
                        Department #{doctor.department_id}
                      </span>
                    </td>

                    {/* Phone */}
                    <td>
                      <span className="phone-text">
                        {doctor.phone}
                      </span>
                    </td>

                    {/* Actions */}
                    <td>
                      <div className="table-actions">

                        <Link
                          to={`/doctors/${doctor.id}`}
                          className="table-action"
                        >
                          View
                        </Link>

                        {isAdmin && (
                          <>
                            <Link
                              to={`/doctors/${doctor.id}/edit`}
                              className="table-action"
                            >
                              Edit
                            </Link>

                            <button
                              type="button"
                              className="table-delete-action"
                              onClick={() =>
                                handleDelete(
                                  doctor.id
                                )
                              }
                            >
                              Delete
                            </button>
                          </>
                        )}

                      </div>
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

export default Doctors;