from datetime import datetime
from enum import Enum
from typing import Optional

from pydantic import BaseModel


class AppointmentStatus(str, Enum):
    SCHEDULED = "scheduled"
    COMPLETED = "completed"
    CANCELLED = "cancelled"
    REBOOKED = "rebooked"


class AppointmentCreate(BaseModel):
    patient_id: Optional[int] = None
    doctor_id: int
    department_id: int
    appointment_date: datetime
    reason: str
    status: AppointmentStatus = AppointmentStatus.SCHEDULED


class AppointmentResponse(BaseModel):
    id: int
    patient_id: int
    doctor_id: int
    department_id: int
    appointment_date: datetime
    reason: str
    status: AppointmentStatus
    created_at: datetime


class AppointmentUpdate(BaseModel):
    appointment_date: Optional[datetime] = None
    reason: Optional[str] = None
    status: Optional[AppointmentStatus] = None
    doctor_id: Optional[int] = None
    department_id: Optional[int] = None