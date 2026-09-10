export interface MedicalRecord {
  id: number;
  patient_id: number;
  doctor_id: number;
  appointment_id: number;
  diagnosis: string;
  symptoms: string;
  treatment: string;
  notes: string;
  created_at: string;
}

export interface MedicalRecordCreate {
  appointment_id: number;
  diagnosis: string;
  symptoms: string;
  treatment: string;
  notes: string;
}

export interface MedicalRecordUpdate {
  diagnosis?: string;
  symptoms?: string;
  treatment?: string;
  notes?: string;
}