import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";

import { useAuth } from "../../context/AuthContext";
import { getBills } from "../../services/billingService";

import type { Billing as BillingType } from "../../types/billing";

function Billing() {
  const { token, user } = useAuth();

  const [bills, setBills] = useState<BillingType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] =
    useState("all");

  const [currentPage, setCurrentPage] = useState(1);

  const itemsPerPage = 8;

  useEffect(() => {
    async function loadBills() {
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const data = await getBills(token);
        setBills(data);
      } catch (error) {
        console.error(error);

        if (error instanceof Error) {
          setError(error.message);
        } else {
          setError("Failed to load bills.");
        }
      } finally {
        setLoading(false);
      }
    }

    loadBills();
  }, [token]);

  const filteredBills = useMemo(() => {
    const query = search.trim().toLowerCase();

    return bills.filter((bill) => {
      const matchesSearch =
        !query ||
        String(bill.id).includes(query) ||
        String(bill.appointment_id).includes(query) ||
        String(bill.amount).includes(query) ||
        bill.status.toLowerCase().includes(query);

      const matchesStatus =
        statusFilter === "all" ||
        bill.status.toLowerCase() ===
          statusFilter.toLowerCase();

      return matchesSearch && matchesStatus;
    });
  }, [bills, search, statusFilter]);

  const totalPages = Math.max(
    1,
    Math.ceil(
      filteredBills.length / itemsPerPage
    )
  );

  const paginatedBills = filteredBills.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  function handleSearchChange(
    value: string
  ) {
    setSearch(value);
    setCurrentPage(1);
  }

  function handleStatusChange(
    value: string
  ) {
    setStatusFilter(value);
    setCurrentPage(1);
  }

  function clearFilters() {
    setSearch("");
    setStatusFilter("all");
    setCurrentPage(1);
  }

  function getStatusClass(status: string) {
    switch (status.toLowerCase()) {
      case "paid":
        return "status-badge status-paid";

      case "pending":
        return "status-badge status-pending";

      case "unpaid":
        return "status-badge status-unpaid";

      default:
        return "status-badge";
    }
  }

  if (loading) {
    return (
      <div className="list-page">
        <div className="loading-state">
          Loading bills...
        </div>
      </div>
    );
  }

  return (
    <div className="list-page">
      <div className="list-page-header">
        <div>
          <h1>Billing</h1>

          <p>
            Manage hospital billing and payments.
          </p>
        </div>

        {(user?.role === "admin" ||
          user?.role === "staff") && (
          <Link
            to="/billing/new"
            className="primary-button"
          >
            Create Bill
          </Link>
        )}
      </div>

      {error && (
        <div className="list-error">
          {error}
        </div>
      )}

      <div className="filter-card">
        <div className="filter-group">
          <label htmlFor="billing-search">
            Search
          </label>

          <input
            id="billing-search"
            type="text"
            value={search}
            onChange={(event) =>
              handleSearchChange(
                event.target.value
              )
            }
            placeholder="Search by bill, appointment, amount or status..."
          />
        </div>

        <div className="filter-group">
          <label htmlFor="billing-status">
            Status
          </label>

          <select
            id="billing-status"
            value={statusFilter}
            onChange={(event) =>
              handleStatusChange(
                event.target.value
              )
            }
          >
            <option value="all">
              All statuses
            </option>

            <option value="paid">
              Paid
            </option>

            <option value="pending">
              Pending
            </option>

            <option value="unpaid">
              Unpaid
            </option>
          </select>
        </div>

        {(search || statusFilter !== "all") && (
          <button
            type="button"
            className="clear-filter-button"
            onClick={clearFilters}
          >
            Clear
          </button>
        )}
      </div>

      <div className="table-card">
        {paginatedBills.length === 0 ? (
          <div className="empty-state">
            {bills.length === 0
              ? "No bills found."
              : "No bills match your filters."}
          </div>
        ) : (
          <div className="table-wrapper">
            <table className="data-table billing-table">
              <thead>
                <tr>
                  <th>Bill</th>
                  <th>Appointment</th>
                  <th>Amount</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>

              <tbody>
                {paginatedBills.map((bill) => (
                  <tr key={bill.id}>
                    <td>
                      <span className="bill-id">
                        #{bill.id}
                      </span>
                    </td>

                    <td>
                      <span className="appointment-id">
                        Appointment #
                        {bill.appointment_id}
                      </span>
                    </td>

                    <td>
                      <span className="bill-amount">
                        {Number(
                          bill.amount
                        ).toFixed(2)}
                      </span>
                    </td>

                    <td>
                      <span
                        className={getStatusClass(
                          bill.status
                        )}
                      >
                        {bill.status}
                      </span>
                    </td>

                    <td>
                      <div className="table-actions">
                        <Link
                          to={`/billing/${bill.id}`}
                          className="table-action"
                        >
                          View
                        </Link>

                        {(user?.role === "admin" ||
                          user?.role === "staff") && (
                          <Link
                            to={`/billing/${bill.id}/edit`}
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
      </div>

      {filteredBills.length > 0 && (
        <div className="pagination">
          <button
            type="button"
            disabled={currentPage === 1}
            onClick={() =>
              setCurrentPage(
                (page) => page - 1
              )
            }
          >
            Previous
          </button>

          <span>
            Page {currentPage} of {totalPages}
          </span>

          <button
            type="button"
            disabled={
              currentPage === totalPages
            }
            onClick={() =>
              setCurrentPage(
                (page) => page + 1
              )
            }
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}

export default Billing;