import { apiRequest } from "./api";

import type {
  Billing,
  BillingCreate,
  BillingUpdate,
} from "../types/billing";

export async function getBills(
  token: string
): Promise<Billing[]> {
  return apiRequest("/bills", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
}

export async function getBillById(
  token: string,
  id: number
): Promise<Billing> {
  return apiRequest(`/bills/${id}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
}

export async function createBill(
  token: string,
  bill: BillingCreate
): Promise<Billing> {
  return apiRequest("/bills", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(bill),
  });
}

export async function updateBill(
  token: string,
  id: number,
  bill: BillingUpdate
): Promise<Billing> {
  return apiRequest(`/bills/${id}`, {
    method: "PATCH",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(bill),
  });
}

export async function deleteBill(
  token: string,
  id: number
) {
  return apiRequest(`/bills/${id}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
}