export interface Department {
  id: number;
  name: string;
  description: string;
  created_at: string;
}

export interface DepartmentCreate {
  name: string;
  description: string;
}

export interface DepartmentUpdate {
  name?: string;
  description?: string;
}