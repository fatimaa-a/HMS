import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";

import { useAuth } from "../../context/AuthContext";
import {
  getAppointments,
  getMyAppointments,
  updateAppointment,
} from "../../services/appointmentService";
import type { Appointment } from "../../types/appointment";

function Appointments() {
  const { token, user } = useAuth();

  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);

  const appointmentsPerPage = 8;

  const canBook =
    user?.role === "patient" ||
    user?.role === "staff" ||
    user?.role === "admin";

  useEffect(() => {
    async function loadAppointments() {
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const data =
          user?.role === "patient"
            ? await getMyAppointments(token)
            : await getAppointments(token);

        setAppointments(data);
      } catch (error) {
        console.error(error);

        if (error instanceof Error) {
          setError(error.message);
        } else {
          setError("Failed to load appointments.");
        }
      } finally {
        setLoading(false);
      }
    }

    loadAppointments();
  }, [token, user]);

  const statuses = useMemo(() => {
    return Array.from(
      new Set(
        appointments.map((appointment) =>
          appointment.status.toLowerCase()
        )
      )
    ).sort();
  }, [appointments]);

  const filteredAppointments = useMemo(() => {
    const searchValue = search.toLowerCase().trim();

    return appointments.filter((appointment) => {
      const matchesSearch =
        searchValue === "" ||
        appointment.id.toString().includes(searchValue) ||
        appointment.patient_id
          .toString()
          .includes(searchValue) ||
        appointment.doctor_id
          .toString()
          .includes(searchValue) ||
        appointment.department_id
          .toString()
          .includes(searchValue) ||
        appointment.reason
          .toLowerCase()
          .includes(searchValue);

      const matchesStatus =
        statusFilter === "all" ||
        appointment.status.toLowerCase() === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [appointments, search, statusFilter]);

  const totalPages = Math.ceil(
    filteredAppointments.length / appointmentsPerPage
  );

  const startIndex =
    (currentPage - 1) * appointmentsPerPage;

  const currentAppointments = filteredAppointments.slice(
    startIndex,
    startIndex + appointmentsPerPage
  );

  async function handleStatusChange(
    appointmentId: number,
    status: string
  ) {
    if (!token) {
      return;
    }

    try {
      const updatedAppointment = await updateAppointment(
        token,
        appointmentId,
        { status }
      );

      setAppointments((currentAppointments) =>
        currentAppointments.map((appointment) =>
          appointment.id === appointmentId
            ? updatedAppointment
            : appointment
        )
      );
    } catch (error) {
      console.error(error);

      if (error instanceof Error) {
        setError(error.message);
      } else {
        setError("Failed to update appointment status.");
      }
    }
  }

  function clearFilters() {
    setSearch("");
    setStatusFilter("all");
    setCurrentPage(1);
  }

  function formatDate(date: string) {
    return new Date(date).toLocaleDateString();
  }

  function formatTime(date: string) {
    return new Date(date).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  function getStatusClass(status: string) {
    const normalizedStatus = status.toLowerCase();

    if (normalizedStatus === "scheduled") {
      return "appointment-status status-scheduled";
    }

    if (normalizedStatus === "completed") {
      return "appointment-status status-completed";
    }

    if (normalizedStatus === "cancelled") {
      return "appointment-status status-cancelled";
    }

    if (normalizedStatus === "rebooked") {
      return "appointment-status status-rebooked";
    }

    return "appointment-status status-default";
  }

  if (loading) {
    return (
      <div className="list-page">
        <div className="loading-state">
          Loading appointments...
        </div>
      </div>
    );
  }

  return (
    <div className="list-page">

      {/* Page Header */}
      <div className="list-page-header">
        <div>
          <h1>Appointments</h1>
          <p>
            Manage patient appointments and scheduled visits.
          </p>
        </div>

        {canBook && (
          <Link
            to="/appointments/new"
            className="primary-button"
          >
            <span>+</span>
            Book Appointment
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
            placeholder="Search by ID, patient, doctor, reason..."
            value={search}
            onChange={(event) => {
              setSearch(event.target.value);
              setCurrentPage(1);
            }}
          />
        </div>

        <select
          value={statusFilter}
          onChange={(event) => {
            setStatusFilter(event.target.value);
            setCurrentPage(1);
          }}
        >
          <option value="all">
            All Statuses
          </option>

          {statuses.map((status) => (
            <option
              key={status}
              value={status}
            >
              {status.charAt(0).toUpperCase() +
                status.slice(1)}
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

      {/* Appointments Table */}
      <div className="table-card">

        <div className="table-card-header">
          <div>
            <h2>All Appointments</h2>

            <p>
              Showing{" "}
              <strong>
                {currentAppointments.length}
              </strong>{" "}
              of{" "}
              <strong>
                {filteredAppointments.length}
              </strong>{" "}
              appointments
            </p>
          </div>
        </div>

        {currentAppointments.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">◷</div>

            <h3>No appointments found</h3>

            <p>
              Try changing your search or filters.
            </p>
          </div>
        ) : (
          <div className="table-wrapper">
            <table className="data-table appointments-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>PATIENT</th>
                  <th>DOCTOR</th>
                  <th>DEPARTMENT</th>
                  <th>DATE & TIME</th>
                  <th>REASON</th>
                  <th>STATUS</th>
                </tr>
              </thead>

              <tbody>
                {currentAppointments.map((appointment) => (
                  <tr key={appointment.id}>

                    <td>
                      <span className="user-id">
                        #{appointment.id}
                      </span>
                    </td>

                    <td>
                      <span className="appointment-person">
                        Patient #{appointment.patient_id}
                      </span>
                    </td>

                    <td>
                      <span className="appointment-person">
                        Dr. #{appointment.doctor_id}
                      </span>
                    </td>

                    <td>
                      <span className="department-id">
                        Department #{appointment.department_id}
                      </span>
                    </td>

                    <td>
                      <div className="appointment-datetime">
                        <strong>
                          {formatDate(
                            appointment.appointment_date
                          )}
                        </strong>

                        <small>
                          {formatTime(
                            appointment.appointment_date
                          )}
                        </small>
                      </div>
                    </td>

                    <td>
                      <span className="appointment-reason">
                        {appointment.reason}
                      </span>
                    </td>

                    <td>
                      <select
                        className={getStatusClass(appointment.status)}
                        value={appointment.status.toLowerCase()}
                        onChange={(event) =>
                          handleStatusChange(
                            appointment.id,
                            event.target.value
                          )
                        }
                      >
                        <option value="scheduled">Scheduled</option>
                        <option value="completed">Completed</option>
                        <option value="cancelled">Cancelled</option>
                        <option value="rebooked">Rebooked</option>
                      </select>
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

export default Appointments;