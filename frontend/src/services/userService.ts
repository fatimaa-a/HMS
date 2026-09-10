import { apiRequest } from "./api";
import type {
  User,
  UserCreate,
  UserUpdate,
} from "../types/user";

export async function getUsers(
  token: string
): Promise<User[]> {
  return apiRequest("/admin/users", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
}

export async function getUserById(
  token: string,
  id: number
): Promise<User> {
  return apiRequest(`/admin/users/${id}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
}

export async function createUser(
  token: string,
  user: UserCreate
): Promise<User> {
  return apiRequest("/admin/users", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(user),
  });
}

export async function updateUser(
  token: string,
  id: number,
  user: UserUpdate
): Promise<User> {
  return apiRequest(`/admin/users/${id}`, {
    method: "PATCH",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(user),
  });
}