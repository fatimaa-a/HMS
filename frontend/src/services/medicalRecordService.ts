import { apiRequest } from "./api";

import type {
  MedicalRecord,
  MedicalRecordCreate,
  MedicalRecordUpdate,
} from "../types/medicalRecord";

export async function getMedicalRecords(
  token: string
): Promise<MedicalRecord[]> {
  return apiRequest("/medical-record", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
}

export async function getMyMedicalRecords(
  token: string
): Promise<MedicalRecord[]> {
  return apiRequest("/medical-record/me", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
}

export async function getMedicalRecordById(
  token: string,
  id: number
): Promise<MedicalRecord> {
  return apiRequest(`/medical-record/${id}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
}

export async function createMedicalRecord(
  token: string,
  record: MedicalRecordCreate
): Promise<MedicalRecord> {
  return apiRequest("/medical-record", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(record),
  });
}

export async function updateMedicalRecord(
  token: string,
  id: number,
  record: MedicalRecordUpdate
): Promise<MedicalRecord> {
  return apiRequest(`/medical-record/${id}`, {
    method: "PATCH",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(record),
  });
}

export async function deleteMedicalRecord(
  token: string,
  id: number
) {
  return apiRequest(`/medical-record/${id}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
}