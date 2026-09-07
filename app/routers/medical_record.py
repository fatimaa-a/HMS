from fastapi import APIRouter, Depends, HTTPException
from http import HTTPStatus
from sqlalchemy.orm import Session
from app.models.medical_record import MedicalRecord as MedicalRecordModel
from app.schemas.medical_record import (
    MedicalRecordCreate,
    MedicalRecordResponse,
    MedicalRecordUpdate,
)

from app.models.patient import Patient as PatientModel
from app.models.doctor import Doctor as DoctorModel
from app.models.appointment import Appointment as AppointmentModel

from app.core.dependencies import get_db, require_roles

router = APIRouter()


@router.get("/medical-record", response_model=list[MedicalRecordResponse])
def view_med_rec(
    db: Session = Depends(get_db), _: object = Depends(require_roles("admin", "doctor"))
):
    db_records = db.query(MedicalRecordModel).all()
    return db_records


@router.get("/medical-record/{id}", response_model=MedicalRecordResponse)
def view_med_rec_by_id(
    id: int,
    db: Session = Depends(get_db),
    _: object = Depends(require_roles("admin", "doctor")),
):
    db_record = db.query(MedicalRecordModel).filter(MedicalRecordModel.id == id).first()

    if db_record is None:
        raise HTTPException(status_code=HTTPStatus.NOT_FOUND, detail="Invalid ID")

    return db_record


@router.post("/medical-record", response_model=MedicalRecordResponse)
def create_medical_record(
    medicalrecord: MedicalRecordCreate,
    db: Session = Depends(get_db),
    _: object = Depends(require_roles("admin", "doctor")),
):
    db_patient = (
        db.query(PatientModel)
        .filter(PatientModel.id == medicalrecord.patient_id)
        .first()
    )
    if db_patient is None:
        raise HTTPException(
            status_code=HTTPStatus.NOT_FOUND, detail="Patient does not exist"
        )

    db_doctor = (
        db.query(DoctorModel).filter(DoctorModel.id == medicalrecord.doctor_id).first()
    )
    if db_doctor is None:
        raise HTTPException(
            status_code=HTTPStatus.NOT_FOUND, detail="Doctor does not exist"
        )

    db_appointment = (
        db.query(AppointmentModel)
        .filter(AppointmentModel.id == medicalrecord.appointment_id)
        .first()
    )
    if db_appointment is None:
        raise HTTPException(
            status_code=HTTPStatus.NOT_FOUND, detail="Appointment does not exist"
        )

    new_medical_record = MedicalRecordModel(
        patient_id=medicalrecord.patient_id,
        doctor_id=medicalrecord.doctor_id,
        appointment_id=medicalrecord.appointment_id,
        diagnosis=medicalrecord.diagnosis,
        symptoms=medicalrecord.symptoms,
        treatment=medicalrecord.treatment,
        notes=medicalrecord.notes,
    )

    db.add(new_medical_record)
    db.commit()
    db.refresh(new_medical_record)

    return new_medical_record


@router.patch("/medical-record/{id}", response_model=MedicalRecordResponse)
def update_medical_record(
    id: int,
    medicalrecord: MedicalRecordUpdate,
    db: Session = Depends(get_db),
    _: object = Depends(require_roles("admin", "doctor")),
):
    db_record = db.query(MedicalRecordModel).filter(MedicalRecordModel.id == id).first()
    if db_record is None:
        raise HTTPException(
            status_code=HTTPStatus.NOT_FOUND, detail="Medical Record does not exist"
        )

    update_data = medicalrecord.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(db_record, field, value)

    db.commit()
    db.refresh(db_record)

    return db_record


@router.delete("/medical-record/{id}")
def delete_medical_record(
    id: int, db: Session = Depends(get_db), _: object = Depends(require_roles("admin"))
):
    db_record = db.query(MedicalRecordModel).filter(MedicalRecordModel.id == id).first()
    if db_record is None:
        raise HTTPException(
            status_code=HTTPStatus.NOT_FOUND, detail="Medical Record does not exist"
        )

    db.delete(db_record)
    db.commit()

    return "Medical Record deleted!"
