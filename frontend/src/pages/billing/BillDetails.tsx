import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";

import { useAuth } from "../../context/AuthContext";

import {
  getBillById,
  deleteBill,
} from "../../services/billingService";

import type { Billing } from "../../types/billing";

function BillDetails() {
  const { token, user } = useAuth();
  const { id } = useParams();
  const navigate = useNavigate();

  const [bill, setBill] =
    useState<Billing | null>(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadBill() {
      if (!token || !id) {
        setLoading(false);
        return;
      }

      try {
        const data = await getBillById(
          token,
          Number(id)
        );

        setBill(data);
      } catch (error) {
        console.error(error);

        if (error instanceof Error) {
          setError(error.message);
        } else {
          setError("Failed to load bill.");
        }
      } finally {
        setLoading(false);
      }
    }

    loadBill();
  }, [token, id]);

  async function handleDelete() {
    if (!token || !id) {
      return;
    }

    const confirmed = window.confirm(
      "Are you sure you want to delete this bill?"
    );

    if (!confirmed) {
      return;
    }

    try {
      await deleteBill(
        token,
        Number(id)
      );

      navigate("/billing");
    } catch (error) {
      console.error(error);

      if (error instanceof Error) {
        setError(error.message);
      } else {
        setError("Failed to delete bill.");
      }
    }
  }

  if (loading) {
    return (
      <div className="form-page">
        <div className="loading-state">
          Loading bill...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="form-page">
        <div className="list-error">
          {error}
        </div>
      </div>
    );
  }

  if (!bill) {
    return (
      <div className="form-page">
        <div className="empty-state">
          Bill not found.
        </div>
      </div>
    );
  }

  const canEdit =
    user?.role === "admin" ||
    user?.role === "staff";

  const canDelete =
    user?.role === "admin";

  return (
    <div className="form-page">
      <div className="form-page-header">
        <div>
          <h1>
            Bill #{bill.id}
          </h1>

          <p>
            View billing and payment details.
          </p>
        </div>

        <div className="form-header-actions">
          {canEdit && (
            <Link
              to={`/billing/${bill.id}/edit`}
              className="secondary-button"
            >
              Edit
            </Link>
          )}

          {canDelete && (
            <button
              type="button"
              className="danger-button"
              onClick={handleDelete}
            >
              Delete
            </button>
          )}
        </div>
      </div>

      <div className="details-grid">
        <section className="details-card">
          <div className="details-card-header">
            <h2>Appointment</h2>
          </div>

          <div className="details-list">
            <div className="details-item">
              <span>Appointment</span>
              <strong>
                Appointment #{bill.appointment_id}
              </strong>
            </div>
          </div>
        </section>

        <section className="details-card">
          <div className="details-card-header">
            <h2>Payment</h2>
          </div>

          <div className="details-list">
            <div className="details-item">
              <span>Amount</span>

              <strong>
                {Number(
                  bill.amount
                ).toFixed(2)}
              </strong>
            </div>

            <div className="details-item">
              <span>Status</span>

              <strong>
                {bill.status}
              </strong>
            </div>
          </div>
        </section>
      </div>

      <div className="details-footer">
        <Link
          to="/billing"
          className="secondary-button"
        >
          Back to Billing
        </Link>
      </div>
    </div>
  );
}

export default BillDetails;