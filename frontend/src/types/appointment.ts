export interface Appointment {
  id: number;
  patient_id: number;
  doctor_id: number;
  department_id: number;
  appointment_date: string;
  reason: string;
  status: string;
}

export interface AppointmentCreate {
  doctor_id: number;
  department_id: number;
  appointment_date: string;
  reason: string;
  status: string;
  patient_id?: number;
}