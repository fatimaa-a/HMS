from fastapi import FastAPI
from app.routers import user, department, doctor, patient, medical_record, billing, prescription, appointment

app = FastAPI()

@app.get("/")
def root():
    return {"message": "Hospital Management System"}

app.include_router(user.router)
app.include_router(department.router)
app.include_router(doctor.router)
app.include_router(patient.router)
app.include_router(medical_record.router)
app.include_router(prescription.router)
app.include_router(billing.router)
app.include_router(appointment.router)