import { apiRequest } from "./api";
import type {
  Patient,
  PatientCreate,
  PatientUpdate,
} from "../types/patient";

export async function getPatients(
  token: string
): Promise<Patient[]> {
  return apiRequest("/patients", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
}

export async function getMyPatientProfile(
  token: string
): Promise<Patient> {
  return apiRequest("/patients/me", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
}

export async function getPatientById(
  token: string,
  id: number
): Promise<Patient> {
  return apiRequest(`/patients/${id}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
}

export async function createPatient(
  token: string,
  patient: PatientCreate
): Promise<Patient> {
  return apiRequest("/patients", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(patient),
  });
}

export async function updatePatient(
  token: string,
  id: number,
  patient: PatientUpdate
): Promise<Patient> {
  return apiRequest(`/patients/${id}`, {
    method: "PATCH",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(patient),
  });
}

export async function deletePatient(
  token: string,
  id: number
) {
  return apiRequest(`/patients/${id}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
}