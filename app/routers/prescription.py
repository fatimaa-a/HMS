from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session
from http import HTTPStatus

from app.models.prescription import Prescription as PrescriptionModel
from app.schemas.prescription import (
    PrescriptionCreate,
    PrescriptionResponse,
    PrescriptionUpdate,
)
from app.models.patient import Patient as PatientModel
from app.models.doctor import Doctor as DoctorModel
from app.models.medical_record import MedicalRecord as MedicalRecordModel
from app.models.user import User as UserModel

from app.core.dependencies import (
    get_db,
    get_current_user,
    require_roles,
)

router = APIRouter()


# ============================================================
# ADMIN + DOCTOR
# View all prescriptions
# ============================================================

@router.get(
    "/prescriptions",
    response_model=list[PrescriptionResponse]
)
def view_prescriptions(
    db: Session = Depends(get_db),
    _: object = Depends(
        require_roles("admin", "doctor")
    ),
):
    return db.query(PrescriptionModel).all()


# ============================================================
# PATIENT
# View only their own prescriptions
# IMPORTANT: must come before /prescriptions/{id}
# ============================================================

@router.get(
    "/prescriptions/me",
    response_model=list[PrescriptionResponse]
)
def view_my_prescriptions(
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

    prescriptions = (
        db.query(PrescriptionModel)
        .filter(
            PrescriptionModel.patient_id == db_patient.id
        )
        .all()
    )

    return prescriptions


# ============================================================
# ADMIN + DOCTOR + PATIENT
# View prescription by ID
# ============================================================

@router.get(
    "/prescriptions/{id}",
    response_model=PrescriptionResponse
)
def view_prescription_by_id(
    id: int,
    db: Session = Depends(get_db),
    current_user: UserModel = Depends(get_current_user),
):
    db_prescription = (
        db.query(PrescriptionModel)
        .filter(PrescriptionModel.id == id)
        .first()
    )

    if db_prescription is None:
        raise HTTPException(
            status_code=HTTPStatus.NOT_FOUND,
            detail="Prescription does not exist.",
        )

    # Patients can only access their own prescriptions
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

        if db_prescription.patient_id != db_patient.id:
            raise HTTPException(
                status_code=HTTPStatus.FORBIDDEN,
                detail="You do not have permission to access this prescription.",
            )

    elif current_user.role not in ["admin", "doctor"]:
        raise HTTPException(
            status_code=HTTPStatus.FORBIDDEN,
            detail="You do not have permission to access this prescription.",
        )

    return db_prescription


# ============================================================
# ADMIN + DOCTOR
# Create prescription
# ============================================================

@router.post(
    "/prescriptions",
    response_model=PrescriptionResponse
)
def add_prescription(
    prescription: PrescriptionCreate,
    db: Session = Depends(get_db),
    _: object = Depends(
        require_roles("admin", "doctor")
    ),
):
    db_medical_record = (
        db.query(MedicalRecordModel)
        .filter(
            MedicalRecordModel.id
            == prescription.medical_record_id
        )
        .first()
    )

    if db_medical_record is None:
        raise HTTPException(
            status_code=HTTPStatus.NOT_FOUND,
            detail="Medical Record does not exist",
        )

    new_prescription = PrescriptionModel(
        patient_id=db_medical_record.patient_id,
        doctor_id=db_medical_record.doctor_id,
        medical_record_id=prescription.medical_record_id,
        medication=prescription.medication,
        dosage=prescription.dosage,
        frequency=prescription.frequency,
        duration=prescription.duration,
        instructions=prescription.instructions,
    )

    db.add(new_prescription)
    db.commit()
    db.refresh(new_prescription)

    return new_prescription


# ============================================================
# ADMIN + DOCTOR
# Update prescription
# ============================================================

@router.patch(
    "/prescriptions/{id}",
    response_model=PrescriptionResponse
)
def update_prescription(
    id: int,
    prescription: PrescriptionUpdate,
    db: Session = Depends(get_db),
    _: object = Depends(
        require_roles("admin", "doctor")
    ),
):
    db_prescription = (
        db.query(PrescriptionModel)
        .filter(PrescriptionModel.id == id)
        .first()
    )

    if db_prescription is None:
        raise HTTPException(
            status_code=HTTPStatus.NOT_FOUND,
            detail="Prescription does not exist.",
        )

    update_data = prescription.model_dump(
        exclude_unset=True
    )

    for field, value in update_data.items():
        setattr(db_prescription, field, value)

    db.commit()
    db.refresh(db_prescription)

    return db_prescription


# ============================================================
# ADMIN ONLY
# Delete prescription
# ============================================================

@router.delete("/prescriptions/{id}")
def delete_prescription(
    id: int,
    db: Session = Depends(get_db),
    _: object = Depends(
        require_roles("admin")
    ),
):
    db_prescription = (
        db.query(PrescriptionModel)
        .filter(PrescriptionModel.id == id)
        .first()
    )

    if db_prescription is None:
        raise HTTPException(
            status_code=HTTPStatus.NOT_FOUND,
            detail="Prescription does not exist.",
        )

    db.delete(db_prescription)
    db.commit()

    return {
        "message": "Prescription deleted successfully"
    }