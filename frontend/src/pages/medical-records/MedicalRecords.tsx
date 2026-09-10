import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";

import { useAuth } from "../../context/AuthContext";
import {
  getMedicalRecords,
  getMyMedicalRecords,
  deleteMedicalRecord,
} from "../../services/medicalRecordService";
import type { MedicalRecord } from "../../types/medicalRecord";

function MedicalRecords() {
  const { token, user } = useAuth();

  const [records, setRecords] = useState<MedicalRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  const recordsPerPage = 8;

  const canManage =
    user?.role === "admin" ||
    user?.role === "doctor";

  const canDelete = user?.role === "admin";

  useEffect(() => {
    async function loadRecords() {
      if (!token || !user) {
        setLoading(false);
        return;
      }

      try {
        const data =
          user.role === "patient"
            ? await getMyMedicalRecords(token)
            : await getMedicalRecords(token);

        setRecords(data);
      } catch (error) {
        console.error(error);

        if (error instanceof Error) {
          setError(error.message);
        } else {
          setError("Failed to load medical records.");
        }
      } finally {
        setLoading(false);
      }
    }

    loadRecords();
  }, [token, user]);

  async function handleDelete(id: number) {
    if (!token || !canDelete) return;

    const confirmed = window.confirm(
      "Are you sure you want to delete this medical record?"
    );

    if (!confirmed) return;

    try {
      await deleteMedicalRecord(token, id);

      setRecords((current) =>
        current.filter((record) => record.id !== id)
      );
    } catch (error) {
      console.error(error);

      if (error instanceof Error) {
        setError(error.message);
      } else {
        setError("Failed to delete medical record.");
      }
    }
  }

  const filteredRecords = useMemo(() => {
    const searchValue = search.toLowerCase().trim();

    return records.filter((record) => {
      return (
        searchValue === "" ||
        record.id.toString().includes(searchValue) ||
        record.patient_id
          .toString()
          .includes(searchValue) ||
        record.doctor_id
          .toString()
          .includes(searchValue) ||
        record.appointment_id
          .toString()
          .includes(searchValue) ||
        record.diagnosis
          .toLowerCase()
          .includes(searchValue) ||
        record.symptoms
          .toLowerCase()
          .includes(searchValue)
      );
    });
  }, [records, search]);

  const totalPages = Math.ceil(
    filteredRecords.length / recordsPerPage
  );

  const startIndex =
    (currentPage - 1) * recordsPerPage;

  const currentRecords = filteredRecords.slice(
    startIndex,
    startIndex + recordsPerPage
  );

  function clearSearch() {
    setSearch("");
    setCurrentPage(1);
  }

  function formatDate(date: string) {
    return new Date(date).toLocaleDateString();
  }

  if (loading) {
    return (
      <div className="list-page">
        <div className="loading-state">
          Loading medical records...
        </div>
      </div>
    );
  }

  return (
    <div className="list-page">

      <div className="list-page-header">
        <div>
          <h1>Medical Records</h1>
          <p>
            Manage patient diagnoses, treatments, and
            clinical notes.
          </p>
        </div>

        {canManage && (
          <Link
            to="/medical-records/new"
            className="primary-button"
          >
            <span>+</span>
            Create Record
          </Link>
        )}
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
            placeholder="Search by ID, patient, doctor, diagnosis..."
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

      <div className="table-card">

        <div className="table-card-header">
          <div>
            <h2>All Medical Records</h2>

            <p>
              Showing{" "}
              <strong>
                {currentRecords.length}
              </strong>{" "}
              of{" "}
              <strong>
                {filteredRecords.length}
              </strong>{" "}
              records
            </p>
          </div>
        </div>

        {currentRecords.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">▤</div>

            <h3>No medical records found</h3>

            <p>
              Try changing your search.
            </p>
          </div>
        ) : (
          <div className="table-wrapper">
            <table className="data-table medical-records-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>PATIENT</th>
                  <th>DOCTOR</th>
                  <th>APPOINTMENT</th>
                  <th>DIAGNOSIS</th>
                  <th>CREATED</th>
                  <th>ACTION</th>
                </tr>
              </thead>

              <tbody>
                {currentRecords.map((record) => (
                  <tr key={record.id}>

                    <td>
                      <span className="user-id">
                        #{record.id}
                      </span>
                    </td>

                    <td>
                      <span className="record-person">
                        Patient #{record.patient_id}
                      </span>
                    </td>

                    <td>
                      <span className="record-person">
                        Dr. #{record.doctor_id}
                      </span>
                    </td>

                    <td>
                      <span className="department-id">
                        Appointment #{record.appointment_id}
                      </span>
                    </td>

                    <td>
                      <span className="diagnosis-text">
                        {record.diagnosis}
                      </span>
                    </td>

                    <td>
                      <span className="date-text">
                        {formatDate(record.created_at)}
                      </span>
                    </td>

                    <td>
                      <div className="table-actions">

                        <Link
                          to={`/medical-records/${record.id}`}
                          className="table-action"
                        >
                          View
                        </Link>

                        {canManage && (
                          <Link
                            to={`/medical-records/${record.id}/edit`}
                            className="table-action"
                          >
                            Edit
                          </Link>
                        )}

                        {canDelete && (
                          <button
                            type="button"
                            className="table-delete-action"
                            onClick={() =>
                              handleDelete(record.id)
                            }
                          >
                            Delete
                          </button>
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

export default MedicalRecords;