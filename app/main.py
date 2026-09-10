from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from app.routers import (
    user,
    department,
    doctor,
    patient,
    medical_record,
    billing,
    prescription,
    appointment,
)


app = FastAPI()


app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


app.mount(
    "/uploads",
    StaticFiles(directory="uploads"),
    name="uploads",
)


@app.get("/")
def root():
    return {
        "message": "Hospital Management System"
    }


app.include_router(user.router)
app.include_router(department.router)
app.include_router(doctor.router)
app.include_router(patient.router)
app.include_router(medical_record.router)
app.include_router(prescription.router)
app.include_router(billing.router)
app.include_router(appointment.router)