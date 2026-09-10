from pydantic import BaseModel
from typing import Optional
from datetime import datetime


class MedicalRecordCreate(BaseModel):
    appointment_id: int
    diagnosis: str
    symptoms: str
    treatment: str
    notes: str


class MedicalRecordResponse(BaseModel):
    id: int
    patient_id: int
    doctor_id: int
    appointment_id: int
    diagnosis: str
    symptoms: str
    treatment: str
    notes: str
    created_at: datetime


class MedicalRecordUpdate(BaseModel):
    diagnosis: Optional[str] = None
    symptoms: Optional[str] = None
    treatment: Optional[str] = None
    notes: Optional[str] = None