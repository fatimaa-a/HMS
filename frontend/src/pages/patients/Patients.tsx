import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";

import { useAuth } from "../../context/AuthContext";
import {
  getPatients,
  deletePatient,
} from "../../services/patientService";
import type { Patient } from "../../types/patient";

function Patients() {
  const { token, user } = useAuth();

  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [genderFilter, setGenderFilter] = useState("all");
  const [bloodGroupFilter, setBloodGroupFilter] =
    useState("all");
  const [currentPage, setCurrentPage] = useState(1);

  const patientsPerPage = 8;

  const canManage =
    user?.role === "admin" ||
    user?.role === "staff";

  useEffect(() => {
    async function loadPatients() {
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const data = await getPatients(token);
        setPatients(data);
      } catch (error) {
        console.error(error);

        if (error instanceof Error) {
          setError(error.message);
        } else {
          setError("Failed to load patients.");
        }
      } finally {
        setLoading(false);
      }
    }

    loadPatients();
  }, [token]);

  async function handleDelete(id: number) {
    if (!token) return;

    const confirmed = window.confirm(
      "Are you sure you want to delete this patient?"
    );

    if (!confirmed) return;

    try {
      await deletePatient(token, id);

      setPatients((current) =>
        current.filter((patient) => patient.id !== id)
      );
    } catch (error) {
      console.error(error);

      if (error instanceof Error) {
        setError(error.message);
      } else {
        setError("Failed to delete patient.");
      }
    }
  }

  const genders = useMemo(() => {
    return Array.from(
      new Set(patients.map((patient) => patient.gender))
    ).sort();
  }, [patients]);

  const bloodGroups = useMemo(() => {
    return Array.from(
      new Set(
        patients.map((patient) => patient.blood_group)
      )
    ).sort();
  }, [patients]);

  const filteredPatients = useMemo(() => {
    const searchValue = search.toLowerCase().trim();

    return patients.filter((patient) => {
      const fullName =
        `${patient.first_name} ${patient.last_name}`.toLowerCase();

      const matchesSearch =
        searchValue === "" ||
        patient.id.toString().includes(searchValue) ||
        fullName.includes(searchValue) ||
        patient.phone.toLowerCase().includes(searchValue) ||
        patient.address.toLowerCase().includes(searchValue);

      const matchesGender =
        genderFilter === "all" ||
        patient.gender === genderFilter;

      const matchesBloodGroup =
        bloodGroupFilter === "all" ||
        patient.blood_group === bloodGroupFilter;

      return (
        matchesSearch &&
        matchesGender &&
        matchesBloodGroup
      );
    });
  }, [
    patients,
    search,
    genderFilter,
    bloodGroupFilter,
  ]);

  const totalPages = Math.ceil(
    filteredPatients.length / patientsPerPage
  );

  const startIndex =
    (currentPage - 1) * patientsPerPage;

  const currentPatients = filteredPatients.slice(
    startIndex,
    startIndex + patientsPerPage
  );

  function clearFilters() {
    setSearch("");
    setGenderFilter("all");
    setBloodGroupFilter("all");
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

  function calculateAge(dateOfBirth: string) {
    const birthDate = new Date(dateOfBirth);
    const today = new Date();

    let age =
      today.getFullYear() -
      birthDate.getFullYear();

    const monthDifference =
      today.getMonth() -
      birthDate.getMonth();

    if (
      monthDifference < 0 ||
      (monthDifference === 0 &&
        today.getDate() < birthDate.getDate())
    ) {
      age--;
    }

    return age;
  }

  if (loading) {
    return (
      <div className="list-page">
        <div className="loading-state">
          Loading patients...
        </div>
      </div>
    );
  }

  return (
    <div className="list-page">

      {/* Page Header */}
      <div className="list-page-header">
        <div>
          <h1>Patients</h1>
          <p>
            Manage patient profiles and personal
            information.
          </p>
        </div>

        {canManage && (
          <Link
            to="/patients/new"
            className="primary-button"
          >
            <span>+</span>
            Add Patient
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
            placeholder="Search by name, phone, address..."
            value={search}
            onChange={(event) => {
              setSearch(event.target.value);
              setCurrentPage(1);
            }}
          />
        </div>

        <select
          value={genderFilter}
          onChange={(event) => {
            setGenderFilter(event.target.value);
            setCurrentPage(1);
          }}
        >
          <option value="all">
            All Genders
          </option>

          {genders.map((gender) => (
            <option
              key={gender}
              value={gender}
            >
              {gender}
            </option>
          ))}
        </select>

        <select
          value={bloodGroupFilter}
          onChange={(event) => {
            setBloodGroupFilter(event.target.value);
            setCurrentPage(1);
          }}
        >
          <option value="all">
            All Blood Groups
          </option>

          {bloodGroups.map((bloodGroup) => (
            <option
              key={bloodGroup}
              value={bloodGroup}
            >
              {bloodGroup}
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

      {/* Patients Table */}
      <div className="table-card">

        <div className="table-card-header">
          <div>
            <h2>All Patients</h2>

            <p>
              Showing{" "}
              <strong>
                {currentPatients.length}
              </strong>{" "}
              of{" "}
              <strong>
                {filteredPatients.length}
              </strong>{" "}
              patients
            </p>
          </div>
        </div>

        {currentPatients.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">
              ♙
            </div>

            <h3>No patients found</h3>

            <p>
              Try changing your search or filters.
            </p>
          </div>
        ) : (
          <div className="table-wrapper">
            <table className="data-table patients-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>PATIENT</th>
                  <th>AGE</th>
                  <th>GENDER</th>
                  <th>BLOOD GROUP</th>
                  <th>PHONE</th>
                  <th>ACTIONS</th>
                </tr>
              </thead>

              <tbody>
                {currentPatients.map((patient) => (
                  <tr key={patient.id}>

                    {/* ID */}
                    <td>
                      <span className="user-id">
                        #{patient.id}
                      </span>
                    </td>

                    {/* Patient */}
                    <td>
                      <Link
                        to={`/patients/${patient.id}`}
                        className="patient-name"
                      >
                        <span className="patient-avatar">
                          {getInitials(
                            patient.first_name,
                            patient.last_name
                          )}
                        </span>

                        <span className="patient-name-text">
                          <strong>
                            {patient.first_name}{" "}
                            {patient.last_name}
                          </strong>

                          <small>
                            Patient #{patient.id}
                          </small>
                        </span>
                      </Link>
                    </td>

                    {/* Age */}
                    <td>
                      <span className="age-text">
                        {calculateAge(
                          patient.date_of_birth
                        )}{" "}
                        years
                      </span>
                    </td>

                    {/* Gender */}
                    <td>
                      <span className="gender-badge">
                        {patient.gender}
                      </span>
                    </td>

                    {/* Blood Group */}
                    <td>
                      <span className="blood-group-badge">
                        {patient.blood_group}
                      </span>
                    </td>

                    {/* Phone */}
                    <td>
                      <span className="phone-text">
                        {patient.phone}
                      </span>
                    </td>

                    {/* Actions */}
                    <td>
                      <div className="table-actions">

                        <Link
                          to={`/patients/${patient.id}`}
                          className="table-action"
                        >
                          View
                        </Link>

                        {canManage && (
                          <>
                            <Link
                              to={`/patients/${patient.id}/edit`}
                              className="table-action"
                            >
                              Edit
                            </Link>

                            <button
                              type="button"
                              className="table-delete-action"
                              onClick={() =>
                                handleDelete(
                                  patient.id
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

export default Patients;