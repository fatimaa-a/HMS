from sqlalchemy import String, Text, DateTime, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column
from datetime import datetime

from app.database.base import Base

class Prescription(Base):
    __tablename__ = 'prescriptions'
    
    id: Mapped[int] = mapped_column(primary_key=True)
    patient_id: Mapped[int] = mapped_column(ForeignKey('patients.id'))
    doctor_id: Mapped[int] = mapped_column(ForeignKey('doctors.id'))
    medical_record_id: Mapped[int] = mapped_column(ForeignKey('medical_records.id'))
    medication: Mapped[str] = mapped_column(String(100))
    dosage: Mapped[str] = mapped_column(String(50))
    frequency: Mapped[str] = mapped_column(String(50))
    duration: Mapped[str] = mapped_column(String(50))
    instructions: Mapped[str] = mapped_column(Text)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)