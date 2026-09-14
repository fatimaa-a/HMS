import { apiRequest } from "./api";
import type { LoginResponse } from "../types/auth";

interface BaseRegisterData {
  username: string;
  email: string;
  password: string;
}

interface PatientRegisterData extends BaseRegisterData {
  first_name: string;
  last_name: string;
  date_of_birth: string;
  gender: string;
  phone: string;
  address: string;
  blood_group: string;
}

interface DoctorRegisterData extends BaseRegisterData {
  first_name: string;
  last_name: string;
  department_id: number;
  specialization: string;
  phone: string;
  license_number: string;
}

interface StaffRegisterData extends BaseRegisterData {
  first_name: string;
  last_name: string;
  department_id: number;
  position: string;
  phone: string;
}

type RegisterData =
  | { role: "patient"; data: PatientRegisterData }
  | { role: "doctor"; data: DoctorRegisterData }
  | { role: "staff"; data: StaffRegisterData };

export async function login(
  email: string,
  password: string
): Promise<LoginResponse> {
  const formData = new URLSearchParams();

  formData.append("username", email);
  formData.append("password", password);

  return apiRequest("/login", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: formData,
  });
}

export async function register(form: RegisterData) {
  const endpoint = `/register/${form.role}`;

  return apiRequest(endpoint, {
    method: "POST",
    body: JSON.stringify(form.data),
  });
}

export async function getCurrentUser(token: string) {
  return apiRequest("/me", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
}

export async function uploadProfilePicture(
  token: string,
  file: File
) {
  const formData = new FormData();

  formData.append("file", file);

  return apiRequest("/me/profile-picture", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: formData,
  });
}

export async function deleteProfilePicture(
  token: string
) {
  return apiRequest("/me/profile-picture", {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
}