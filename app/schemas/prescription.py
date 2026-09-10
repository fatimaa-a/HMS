from pydantic import BaseModel
from typing import Optional
from datetime import datetime


class PrescriptionCreate(BaseModel):
    medical_record_id: int
    medication: str
    dosage: str
    frequency: str
    duration: str
    instructions: str
    
class PrescriptionResponse(BaseModel):
    id: int
    patient_id: int
    doctor_id: int
    medical_record_id: int
    medication: str
    dosage: str
    frequency: str
    duration: str
    instructions: str
    created_at: datetime
    
class PrescriptionUpdate(BaseModel):
    medication: Optional[str] = None
    dosage: Optional[str] = None
    frequency: Optional[str] = None
    duration: Optional[str] = None
    instructions: Optional[str] = None