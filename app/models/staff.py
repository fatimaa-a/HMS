from datetime import datetime

from sqlalchemy import DateTime, ForeignKey, String
from sqlalchemy.orm import Mapped, mapped_column

from app.database.base import Base


class Staff(Base):
    __tablename__ = "staff"

    id: Mapped[int] = mapped_column(primary_key=True)

    user_id: Mapped[int] = mapped_column(
        ForeignKey("users.id"),
        unique=True,
    )

    department_id: Mapped[int] = mapped_column(
        ForeignKey("departments.id")
    )

    first_name: Mapped[str] = mapped_column(String(80))

    last_name: Mapped[str] = mapped_column(String(80))

    position: Mapped[str] = mapped_column(String(100))

    phone: Mapped[str] = mapped_column(String(20))

    created_at: Mapped[datetime] = mapped_column(
        DateTime,
        default=datetime.utcnow,
    )