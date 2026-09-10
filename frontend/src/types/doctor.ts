export interface Doctor {
  id: number;
  user_id: number;
  department_id: number;
  first_name: string;
  last_name: string;
  specialization: string;
  license_number: string;
  phone: string;
  created_at: string;
}

export interface DoctorCreate {
  user_id: number;
  department_id: number;
  first_name: string;
  last_name: string;
  specialization: string;
  license_number: string;
  phone: string;
}

export interface DoctorUpdate {
  department_id?: number;
  first_name?: string;
  last_name?: string;
  specialization?: string;
  phone?: string;
}