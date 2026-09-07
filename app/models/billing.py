from sqlalchemy import ForeignKey, String, Numeric
from sqlalchemy.orm import Mapped, mapped_column
from decimal import Decimal

from app.database.base import Base

class Billing(Base):
    __tablename__ = 'billing'
    
    id: Mapped[int] = mapped_column(primary_key= True)
    appointment_id: Mapped[int] = mapped_column(ForeignKey('appointments.id'), unique= True)
    amount: Mapped[Decimal] = mapped_column(Numeric(10,2))
    status: Mapped[str] = mapped_column(String(20))
    
    