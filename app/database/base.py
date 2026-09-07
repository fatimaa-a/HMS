from sqlalchemy.orm import DeclarativeBase

class Base(DeclarativeBase):
    pass         

#DeclarativeBase already provides the machinery. We're simply creating our application's own base class that all our database models will inherit from later.

# from app.models.user import User
# from app.models.doctor import Doctor
# from app.models.patient import Patient
# from app.models.department import Department
# from app.models.appointment import Appointment
# from app.models.medical_record import MedicalRecord
# from app.models.prescription import Prescription
# from app.models.billing import Billing