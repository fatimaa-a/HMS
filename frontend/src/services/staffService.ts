import { apiRequest } from "./api";

import type { Staff } from "../types/staff";


export async function getStaff(
  token: string
): Promise<Staff[]> {
  return apiRequest("/staff", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
}


export async function getStaffById(
  token: string,
  id: number
): Promise<Staff> {
  return apiRequest(`/staff/${id}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
}