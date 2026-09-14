export interface User {
  id: number;
  username: string;
  email: string;
  role: string;
  is_active: boolean;
  created_at: string;
  profile_picture: string | null;
}

export interface UserCreate {
  username: string;
  email: string;
  password: string;
  role: string;
}

export interface UserUpdate {
  username?: string;
  email?: string;
  role?: string;
  is_active?: boolean;
}

export interface PendingUser {
  id: number;
  username: string;
  email: string;
  role: string;
  is_active: boolean;
  first_name: string | null;
  last_name: string | null;
  phone: string | null;
  department_id: number | null;
  specialization: string | null;
  license_number: string | null;
  position: string | null;
}