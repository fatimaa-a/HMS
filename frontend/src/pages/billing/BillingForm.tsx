import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import { useNavigate, useParams } from "react-router-dom";

import { useAuth } from "../../context/AuthContext";

import {
  createBill,
  getBillById,
  updateBill,
} from "../../services/billingService";

import { getAppointments } from "../../services/appointmentService";
import type { Appointment } from "../../types/appointment";

function BillingForm() {
  const { token } = useAuth();
  const navigate = useNavigate();
  const { id } = useParams();

  const isEditing = Boolean(id);

  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [appointmentId, setAppointmentId] = useState("");

  const [selectedAppointment, setSelectedAppointment] =
    useState<Appointment | null>(null);

  const [amount, setAmount] = useState("");
  const [status, setStatus] = useState("unpaid");

  const [loading, setLoading] = useState(isEditing);
  const [loadingAppointments, setLoadingAppointments] =
    useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadAppointments() {
      if (!token) {
        setLoadingAppointments(false);
        return;
      }

      try {
        const data = await getAppointments(token);
        setAppointments(data);
      } catch (error) {
        console.error(error);

        if (error instanceof Error) {
          setError(error.message);
        } else {
          setError("Failed to load appointments.");
        }
      } finally {
        setLoadingAppointments(false);
      }
    }

    loadAppointments();
  }, [token]);

  useEffect(() => {
    async function loadBill() {
      if (!token || !id) {
        setLoading(false);
        return;
      }

      try {
        const bill = await getBillById(
          token,
          Number(id)
        );

        setAppointmentId(
          String(bill.appointment_id)
        );

        setAmount(String(bill.amount));
        setStatus(bill.status);
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

  useEffect(() => {
    if (!appointmentId) {
      setSelectedAppointment(null);
      return;
    }

    const appointment = appointments.find(
      (item) => item.id === Number(appointmentId)
    );

    setSelectedAppointment(
      appointment ?? null
    );
  }, [appointmentId, appointments]);

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    if (!token) {
      setError("You must be logged in.");
      return;
    }

    if (!isEditing && !appointmentId) {
      setError("Please select an appointment.");
      return;
    }

    if (!amount || Number(amount) < 0) {
      setError("Please enter a valid amount.");
      return;
    }

    setSaving(true);
    setError("");

    try {
      if (isEditing) {
        await updateBill(
          token,
          Number(id),
          {
            amount: Number(amount),
            status,
          }
        );
      } else {
        await createBill(
          token,
          {
            appointment_id: Number(appointmentId),
            amount: Number(amount),
            status,
          }
        );
      }

      navigate("/billing");
    } catch (error) {
      console.error(error);

      if (error instanceof Error) {
        setError(error.message);
      } else {
        setError("Failed to save bill.");
      }
    } finally {
      setSaving(false);
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

  return (
    <div className="form-page">
      <div className="form-page-header">
        <div>
          <h1>
            {isEditing
              ? "Edit Bill"
              : "Create Bill"}
          </h1>

          <p>
            {isEditing
              ? "Update the billing information."
              : "Create a bill from an appointment."}
          </p>
        </div>
      </div>

      {error && (
        <div className="list-error">
          {error}
        </div>
      )}

      <div className="form-card">
        <form onSubmit={handleSubmit}>
          <div className="form-section">
            <div className="form-section-title">
              Appointment Information
            </div>

            {!isEditing ? (
              <div className="form-group">
                <label htmlFor="appointment">
                  Appointment
                </label>

                <select
                  id="appointment"
                  value={appointmentId}
                  onChange={(event) =>
                    setAppointmentId(
                      event.target.value
                    )
                  }
                  required
                  disabled={loadingAppointments}
                >
                  <option value="">
                    {loadingAppointments
                      ? "Loading appointments..."
                      : "Select an appointment"}
                  </option>

                  {appointments.map(
                    (appointment) => (
                      <option
                        key={appointment.id}
                        value={appointment.id}
                      >
                        Appointment #
                        {appointment.id} —{" "}
                        {new Date(
                          appointment.appointment_date
                        ).toLocaleString()}
                      </option>
                    )
                  )}
                </select>
              </div>
            ) : (
              <div className="form-group">
                <label>Appointment</label>

                <input
                  type="text"
                  value={
                    selectedAppointment
                      ? `Appointment #${selectedAppointment.id}`
                      : `Appointment #${appointmentId}`
                  }
                  disabled
                />
              </div>
            )}

            {selectedAppointment && (
              <div className="form-grid">
                <div className="form-group">
                  <label>Patient</label>

                  <input
                    type="text"
                    value={`Patient #${selectedAppointment.patient_id}`}
                    disabled
                  />
                </div>

                <div className="form-group">
                  <label>Doctor</label>

                  <input
                    type="text"
                    value={`Doctor #${selectedAppointment.doctor_id}`}
                    disabled
                  />
                </div>

                <div className="form-group">
                  <label>Department</label>

                  <input
                    type="text"
                    value={`Department #${selectedAppointment.department_id}`}
                    disabled
                  />
                </div>

                <div className="form-group">
                  <label>Appointment Date</label>

                  <input
                    type="text"
                    value={new Date(
                      selectedAppointment.appointment_date
                    ).toLocaleString()}
                    disabled
                  />
                </div>

                <div className="form-group">
                  <label>Status</label>

                  <input
                    type="text"
                    value={selectedAppointment.status}
                    disabled
                  />
                </div>

                <div className="form-group">
                  <label>Reason</label>

                  <input
                    type="text"
                    value={selectedAppointment.reason}
                    disabled
                  />
                </div>
              </div>
            )}
          </div>

          <div className="form-section">
            <div className="form-section-title">
              Billing Information
            </div>

            <div className="form-grid">
              <div className="form-group">
                <label htmlFor="amount">
                  Amount
                </label>

                <input
                  id="amount"
                  type="number"
                  min="0"
                  step="0.01"
                  value={amount}
                  onChange={(event) =>
                    setAmount(event.target.value)
                  }
                  placeholder="Enter amount"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="status">
                  Payment Status
                </label>

                <select
                  id="status"
                  value={status}
                  onChange={(event) =>
                    setStatus(event.target.value)
                  }
                  required
                >
                  <option value="unpaid">
                    Unpaid
                  </option>

                  <option value="pending">
                    Pending
                  </option>

                  <option value="paid">
                    Paid
                  </option>
                </select>
              </div>
            </div>
          </div>

          <div className="form-actions">
            <button
              type="button"
              className="secondary-button"
              onClick={() =>
                navigate("/billing")
              }
              disabled={saving}
            >
              Cancel
            </button>

            <button
              type="submit"
              className="primary-button"
              disabled={saving}
            >
              {saving
                ? "Saving..."
                : isEditing
                  ? "Update Bill"
                  : "Create Bill"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default BillingForm;