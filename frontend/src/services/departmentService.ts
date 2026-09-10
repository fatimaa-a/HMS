import { apiRequest } from "./api";
import type {
  Department,
  DepartmentCreate,
  DepartmentUpdate,
} from "../types/department";

export async function getDepartments(
  token: string
): Promise<Department[]> {
  return apiRequest("/departments", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
}

export async function getDepartmentById(
  token: string,
  id: number
): Promise<Department> {
  return apiRequest(`/departments/${id}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
}

export async function createDepartment(
  token: string,
  department: DepartmentCreate
): Promise<Department> {
  return apiRequest("/departments", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(department),
  });
}

export async function updateDepartment(
  token: string,
  id: number,
  department: DepartmentUpdate
): Promise<Department> {
  return apiRequest(`/departments/${id}`, {
    method: "PATCH",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(department),
  });
}

export async function deleteDepartment(
  token: string,
  id: number
) {
  return apiRequest(`/departments/${id}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
}