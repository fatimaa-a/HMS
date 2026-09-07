from sqlalchemy import ForeignKey, String, Text, DateTime
from sqlalchemy.orm import Mapped, mapped_column
from datetime import datetime

from app.database.base import Base

class MedicalRecord(Base):
    __tablename__ = 'medical_records'
    
    id: Mapped[int] = mapped_column(primary_key=True)
    patient_id: Mapped[int] = mapped_column(ForeignKey('patients.id'))
    doctor_id: Mapped[int] = mapped_column(ForeignKey('doctors.id'))
    appointment_id: Mapped[int] = mapped_column(ForeignKey('appointments.id'))
    diagnosis: Mapped[str] = mapped_column(Text)
    symptoms: Mapped[str] = mapped_column(Text)
    treatment: Mapped[str] = mapped_column(Text)
    notes: Mapped[str] = mapped_column(Text)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)