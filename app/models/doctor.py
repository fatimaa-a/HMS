from sqlalchemy import String, ForeignKey, DateTime
from datetime import datetime
from sqlalchemy.orm import Mapped, mapped_column

from app.database.base import Base

class Doctor(Base):
    __tablename__ = 'doctors'
    
    id: Mapped[int] = mapped_column(primary_key=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id"), unique=True)
    department_id: Mapped[int] = mapped_column(ForeignKey("departments.id"))
    first_name: Mapped[str] = mapped_column(String(80))
    last_name: Mapped[str] = mapped_column(String(80))
    specialization: Mapped[str] = mapped_column(String(100))
    phone: Mapped[str] = mapped_column(String(20))
    license_number: Mapped[str] = mapped_column(String(25))
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)