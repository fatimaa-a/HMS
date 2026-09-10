import { apiRequest } from "./api";
import type {
  Doctor,
  DoctorCreate,
  DoctorUpdate,
} from "../types/doctor";

export async function getDoctors(
  token: string
): Promise<Doctor[]> {
  return apiRequest("/doctors", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
}

export async function getDoctorById(
  token: string,
  id: number
): Promise<Doctor> {
  return apiRequest(`/doctors/${id}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
}

export async function createDoctor(
  token: string,
  doctor: DoctorCreate
): Promise<Doctor> {
  return apiRequest("/doctors", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(doctor),
  });
}

export async function updateDoctor(
  token: string,
  id: number,
  doctor: DoctorUpdate
): Promise<Doctor> {
  return apiRequest(`/doctors/${id}`, {
    method: "PATCH",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(doctor),
  });
}

export async function deleteDoctor(
  token: string,
  id: number
) {
  return apiRequest(`/doctors/${id}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
}