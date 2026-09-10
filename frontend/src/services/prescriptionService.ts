import { apiRequest } from "./api";

import type {
  Prescription,
  PrescriptionCreate,
  PrescriptionUpdate,
} from "../types/prescription";

export async function getPrescriptions(
  token: string
): Promise<Prescription[]> {
  return apiRequest("/prescriptions", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
}

export async function getMyPrescriptions(
  token: string
): Promise<Prescription[]> {
  return apiRequest("/prescriptions/me", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
}

export async function getPrescriptionById(
  token: string,
  id: number
): Promise<Prescription> {
  return apiRequest(`/prescriptions/${id}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
}

export async function createPrescription(
  token: string,
  prescription: PrescriptionCreate
): Promise<Prescription> {
  return apiRequest("/prescriptions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(prescription),
  });
}

export async function updatePrescription(
  token: string,
  id: number,
  prescription: PrescriptionUpdate
): Promise<Prescription> {
  return apiRequest(`/prescriptions/${id}`, {
    method: "PATCH",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(prescription),
  });
}

export async function deletePrescription(
  token: string,
  id: number
) {
  return apiRequest(`/prescriptions/${id}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
}