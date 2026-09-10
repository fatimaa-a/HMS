import { apiRequest } from "./api";
import type {
  Appointment,
  AppointmentCreate,
} from "../types/appointment";

export async function createAppointment(
  token: string,
  appointment: AppointmentCreate
): Promise<Appointment> {
  return apiRequest("/appointments", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(appointment),
  });
}

export async function getAppointments(
  token: string
): Promise<Appointment[]> {
  return apiRequest("/appointments", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
}

export async function getMyAppointments(
  token: string
): Promise<Appointment[]> {
  return apiRequest("/appointments/me", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
}

export async function getAppointmentById(
  token: string,
  id: number
): Promise<Appointment> {
  return apiRequest(`/appointments/${id}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
}

export async function updateAppointment(
  token: string,
  id: number,
  appointment: {
    status?: string;
    appointment_date?: string;
    reason?: string;
    doctor_id?: number;
    department_id?: number;
  }
): Promise<Appointment> {
  return apiRequest(`/appointments/${id}`, {
    method: "PATCH",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(appointment),
  });
}

export async function deleteAppointment(
  token: string,
  id: number
) {
  return apiRequest(`/appointments/${id}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
}