from sqlalchemy import String, ForeignKey, DateTime, Date, Text
from sqlalchemy.orm import mapped_column, Mapped
from datetime import date, datetime

from app.database.base import Base

class Appointment(Base):
    __tablename__ = 'appointments'
    
    id: Mapped[int] = mapped_column(primary_key= True)
    patient_id: Mapped[int] = mapped_column(ForeignKey('patients.id'))
    doctor_id: Mapped[int] = mapped_column(ForeignKey('doctors.id'))
    department_id: Mapped[int] = mapped_column(ForeignKey('departments.id'))
    appointment_date: Mapped[datetime] = mapped_column(DateTime)
    reason: Mapped[str] = mapped_column(Text)
    status: Mapped[str] = mapped_column(String(20))
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)