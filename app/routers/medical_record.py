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
from app.models.user import User as UserModel

from app.core.dependencies import (
    get_db,
    get_current_user,
    require_roles,
)

router = APIRouter()


# ============================================================
# ADMIN + DOCTOR
# View all medical records
# ============================================================

@router.get(
    "/medical-record",
    response_model=list[MedicalRecordResponse]
)
def view_medical_records(
    db: Session = Depends(get_db),
    _: object = Depends(
        require_roles("admin", "doctor")
    ),
):
    return db.query(MedicalRecordModel).all()


# ============================================================
# PATIENT
# View only their own medical records
# IMPORTANT: This must come BEFORE /medical-record/{id}
# ============================================================

@router.get(
    "/medical-record/me",
    response_model=list[MedicalRecordResponse]
)
def view_my_medical_records(
    db: Session = Depends(get_db),
    current_user: UserModel = Depends(get_current_user),
):
    if current_user.role != "patient":
        raise HTTPException(
            status_code=HTTPStatus.FORBIDDEN,
            detail="Only patients can access this endpoint.",
        )

    db_patient = (
        db.query(PatientModel)
        .filter(
            PatientModel.user_id == current_user.id
        )
        .first()
    )

    if db_patient is None:
        raise HTTPException(
            status_code=HTTPStatus.NOT_FOUND,
            detail="Patient profile not found.",
        )

    records = (
        db.query(MedicalRecordModel)
        .filter(
            MedicalRecordModel.patient_id == db_patient.id
        )
        .all()
    )

    return records


# ============================================================
# ADMIN + DOCTOR + PATIENT
# View a medical record by ID
# ============================================================

@router.get(
    "/medical-record/{id}",
    response_model=MedicalRecordResponse
)
def view_medical_record_by_id(
    id: int,
    db: Session = Depends(get_db),
    current_user: UserModel = Depends(get_current_user),
):
    db_record = (
        db.query(MedicalRecordModel)
        .filter(MedicalRecordModel.id == id)
        .first()
    )

    if db_record is None:
        raise HTTPException(
            status_code=HTTPStatus.NOT_FOUND,
            detail="Medical Record does not exist",
        )

    # Patients can only view their own records
    if current_user.role == "patient":

        db_patient = (
            db.query(PatientModel)
            .filter(
                PatientModel.user_id == current_user.id
            )
            .first()
        )

        if db_patient is None:
            raise HTTPException(
                status_code=HTTPStatus.NOT_FOUND,
                detail="Patient profile not found.",
            )

        if db_record.patient_id != db_patient.id:
            raise HTTPException(
                status_code=HTTPStatus.FORBIDDEN,
                detail="You do not have permission to access this record.",
            )

    elif current_user.role not in ["admin", "doctor"]:
        raise HTTPException(
            status_code=HTTPStatus.FORBIDDEN,
            detail="You do not have permission to access this record.",
        )

    return db_record


# ============================================================
# ADMIN + DOCTOR
# Create medical record
# ============================================================

@router.post(
    "/medical-record",
    response_model=MedicalRecordResponse
)
def create_medical_record(
    medicalrecord: MedicalRecordCreate,
    db: Session = Depends(get_db),
    _: object = Depends(
        require_roles("admin", "doctor")
    ),
):
    db_appointment = (
        db.query(AppointmentModel)
        .filter(
            AppointmentModel.id == medicalrecord.appointment_id
        )
        .first()
    )

    if db_appointment is None:
        raise HTTPException(
            status_code=HTTPStatus.NOT_FOUND,
            detail="Appointment does not exist",
        )

    new_medical_record = MedicalRecordModel(
        patient_id=db_appointment.patient_id,
        doctor_id=db_appointment.doctor_id,
        appointment_id=db_appointment.id,
        diagnosis=medicalrecord.diagnosis,
        symptoms=medicalrecord.symptoms,
        treatment=medicalrecord.treatment,
        notes=medicalrecord.notes,
    )

    db.add(new_medical_record)
    db.commit()
    db.refresh(new_medical_record)

    return new_medical_record


# ============================================================
# ADMIN + DOCTOR
# Update medical record
# ============================================================

@router.patch(
    "/medical-record/{id}",
    response_model=MedicalRecordResponse
)
def update_medical_record(
    id: int,
    medicalrecord: MedicalRecordUpdate,
    db: Session = Depends(get_db),
    _: object = Depends(
        require_roles("admin", "doctor")
    ),
):
    db_record = (
        db.query(MedicalRecordModel)
        .filter(MedicalRecordModel.id == id)
        .first()
    )

    if db_record is None:
        raise HTTPException(
            status_code=HTTPStatus.NOT_FOUND,
            detail="Medical Record does not exist",
        )

    update_data = medicalrecord.model_dump(
        exclude_unset=True
    )

    for field, value in update_data.items():
        setattr(db_record, field, value)

    db.commit()
    db.refresh(db_record)

    return db_record


# ============================================================
# ADMIN ONLY
# Delete medical record
# ============================================================

@router.delete("/medical-record/{id}")
def delete_medical_record(
    id: int,
    db: Session = Depends(get_db),
    _: object = Depends(
        require_roles("admin")
    ),
):
    db_record = (
        db.query(MedicalRecordModel)
        .filter(MedicalRecordModel.id == id)
        .first()
    )

    if db_record is None:
        raise HTTPException(
            status_code=HTTPStatus.NOT_FOUND,
            detail="Medical Record does not exist",
        )

    db.delete(db_record)
    db.commit()

    return {
        "message": "Medical Record deleted successfully"
    }