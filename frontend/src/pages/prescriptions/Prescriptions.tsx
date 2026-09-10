import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";

import { useAuth } from "../../context/AuthContext";
import {
  getPrescriptions,
  getMyPrescriptions,
  deletePrescription,
} from "../../services/prescriptionService";
import type { Prescription } from "../../types/prescription";

function Prescriptions() {
  const { token, user } = useAuth();

  const [prescriptions, setPrescriptions] = useState<
    Prescription[]
  >([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  const prescriptionsPerPage = 8;

  const canManage =
    user?.role === "admin" ||
    user?.role === "doctor";

  const canDelete = user?.role === "admin";

  useEffect(() => {
    async function loadPrescriptions() {
      if (!token || !user) {
        setLoading(false);
        return;
      }

      try {
        const data =
          user.role === "patient"
            ? await getMyPrescriptions(token)
            : await getPrescriptions(token);

        setPrescriptions(data);
      } catch (error) {
        console.error(error);

        if (error instanceof Error) {
          setError(error.message);
        } else {
          setError("Failed to load prescriptions.");
        }
      } finally {
        setLoading(false);
      }
    }

    loadPrescriptions();
  }, [token, user]);

  async function handleDelete(id: number) {
    if (!token || !canDelete) {
      return;
    }

    const confirmed = window.confirm(
      "Are you sure you want to delete this prescription?"
    );

    if (!confirmed) {
      return;
    }

    try {
      await deletePrescription(token, id);

      setPrescriptions((current) =>
        current.filter(
          (prescription) => prescription.id !== id
        )
      );
    } catch (error) {
      console.error(error);

      if (error instanceof Error) {
        setError(error.message);
      } else {
        setError("Failed to delete prescription.");
      }
    }
  }

  const filteredPrescriptions = useMemo(() => {
    const searchValue = search.toLowerCase().trim();

    return prescriptions.filter((prescription) => {
      return (
        searchValue === "" ||
        prescription.id
          .toString()
          .includes(searchValue) ||
        prescription.patient_id
          .toString()
          .includes(searchValue) ||
        prescription.doctor_id
          .toString()
          .includes(searchValue) ||
        prescription.medical_record_id
          .toString()
          .includes(searchValue) ||
        prescription.medication
          .toLowerCase()
          .includes(searchValue) ||
        prescription.dosage
          .toLowerCase()
          .includes(searchValue) ||
        prescription.frequency
          .toLowerCase()
          .includes(searchValue)
      );
    });
  }, [prescriptions, search]);

  const totalPages = Math.ceil(
    filteredPrescriptions.length /
      prescriptionsPerPage
  );

  const startIndex =
    (currentPage - 1) * prescriptionsPerPage;

  const currentPrescriptions =
    filteredPrescriptions.slice(
      startIndex,
      startIndex + prescriptionsPerPage
    );

  function clearSearch() {
    setSearch("");
    setCurrentPage(1);
  }

  if (loading) {
    return (
      <div className="list-page">
        <div className="loading-state">
          Loading prescriptions...
        </div>
      </div>
    );
  }

  return (
    <div className="list-page">
      <div className="list-page-header">
        <div>
          <h1>Prescriptions</h1>

          <p>
            Manage medications, dosages, and treatment
            instructions.
          </p>
        </div>

        {canManage && (
          <Link
            to="/prescriptions/new"
            className="primary-button"
          >
            <span>+</span>
            Create Prescription
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
            placeholder="Search by medication, patient, doctor..."
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
            <h2>All Prescriptions</h2>

            <p>
              Showing{" "}
              <strong>
                {currentPrescriptions.length}
              </strong>{" "}
              of{" "}
              <strong>
                {filteredPrescriptions.length}
              </strong>{" "}
              prescriptions
            </p>
          </div>
        </div>

        {currentPrescriptions.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">✚</div>

            <h3>No prescriptions found</h3>

            <p>
              Try changing your search.
            </p>
          </div>
        ) : (
          <div className="table-wrapper">
            <table className="data-table prescriptions-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>PATIENT</th>
                  <th>DOCTOR</th>
                  <th>MEDICATION</th>
                  <th>DOSAGE</th>
                  <th>FREQUENCY</th>
                  <th>DURATION</th>
                  <th>ACTIONS</th>
                </tr>
              </thead>

              <tbody>
                {currentPrescriptions.map(
                  (prescription) => (
                    <tr key={prescription.id}>
                      <td>
                        <span className="user-id">
                          #{prescription.id}
                        </span>
                      </td>

                      <td>
                        <span className="record-person">
                          Patient #
                          {prescription.patient_id}
                        </span>
                      </td>

                      <td>
                        <span className="record-person">
                          Dr. #
                          {prescription.doctor_id}
                        </span>
                      </td>

                      <td>
                        <span className="medication-name">
                          {prescription.medication}
                        </span>
                      </td>

                      <td>
                        <span className="prescription-detail">
                          {prescription.dosage}
                        </span>
                      </td>

                      <td>
                        <span className="frequency-badge">
                          {prescription.frequency}
                        </span>
                      </td>

                      <td>
                        <span className="prescription-detail">
                          {prescription.duration}
                        </span>
                      </td>

                      <td>
                        <div className="table-actions">
                          <Link
                            to={`/prescriptions/${prescription.id}`}
                            className="table-action"
                          >
                            View
                          </Link>

                          {canManage && (
                            <Link
                              to={`/prescriptions/${prescription.id}/edit`}
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
                                handleDelete(
                                  prescription.id
                                )
                              }
                            >
                              Delete
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  )
                )}
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

export default Prescriptions;