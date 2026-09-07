from app.database.database import SessionLocal
from app.models.user import User
from app.core.security import hash_password


db = SessionLocal()

try:
    admin = User(
        username="admin",
        email="admin@hms.com",
        password_hash=hash_password("Admin@123"),
        role="admin"
    )

    db.add(admin)
    db.commit()

    print("First admin created successfully!")

finally:
    db.close()