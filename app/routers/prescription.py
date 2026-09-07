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

from app.core.dependencies import get_db, require_roles

router = APIRouter()


@router.get(
    "/prescriptions",
    response_model=list[PrescriptionResponse]
)
def view_prescriptions(
    db: Session = Depends(get_db),
    _: object = Depends(require_roles("admin", "doctor")),
):
    return db.query(PrescriptionModel).all()


@router.get(
    "/prescriptions/{id}",
    response_model=PrescriptionResponse
)
def view_prescription_by_id(
    id: int,
    db: Session = Depends(get_db),
    _: object = Depends(require_roles("admin", "doctor")),
):
    db_prescription = (
        db.query(PrescriptionModel)
        .filter(PrescriptionModel.id == id)
        .first()
    )

    if db_prescription is None:
        raise HTTPException(
            status_code=HTTPStatus.NOT_FOUND,
            detail="Prescription does not exist."
        )

    return db_prescription


@router.post(
    "/prescriptions",
    response_model=PrescriptionResponse
)
def add_prescription(
    prescription: PrescriptionCreate,
    db: Session = Depends(get_db),
    _: object = Depends(require_roles("admin", "doctor")),
):
    db_patient = (
        db.query(PatientModel)
        .filter(PatientModel.id == prescription.patient_id)
        .first()
    )

    if db_patient is None:
        raise HTTPException(
            status_code=HTTPStatus.NOT_FOUND,
            detail="Patient does not exist"
        )

    db_doctor = (
        db.query(DoctorModel)
        .filter(DoctorModel.id == prescription.doctor_id)
        .first()
    )

    if db_doctor is None:
        raise HTTPException(
            status_code=HTTPStatus.NOT_FOUND,
            detail="Doctor does not exist"
        )

    db_medical_record = (
        db.query(MedicalRecordModel)
        .filter(
            MedicalRecordModel.id == prescription.medical_record_id
        )
        .first()
    )

    if db_medical_record is None:
        raise HTTPException(
            status_code=HTTPStatus.NOT_FOUND,
            detail="Medical Record does not exist"
        )

    # Make sure prescription belongs to the medical record
    if (
        db_medical_record.patient_id != prescription.patient_id
        or db_medical_record.doctor_id != prescription.doctor_id
    ):
        raise HTTPException(
            status_code=HTTPStatus.BAD_REQUEST,
            detail="Patient and doctor do not match the medical record"
        )

    new_prescription = PrescriptionModel(
        patient_id=prescription.patient_id,
        doctor_id=prescription.doctor_id,
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


@router.patch(
    "/prescriptions/{id}",
    response_model=PrescriptionResponse
)
def update_prescription(
    id: int,
    prescription: PrescriptionUpdate,
    db: Session = Depends(get_db),
    _: object = Depends(require_roles("admin", "doctor")),
):
    db_prescription = (
        db.query(PrescriptionModel)
        .filter(PrescriptionModel.id == id)
        .first()
    )

    if db_prescription is None:
        raise HTTPException(
            status_code=HTTPStatus.NOT_FOUND,
            detail="Prescription does not exist."
        )

    update_data = prescription.model_dump(exclude_unset=True)

    for field, value in update_data.items():
        setattr(db_prescription, field, value)

    db.commit()
    db.refresh(db_prescription)

    return db_prescription


@router.delete("/prescriptions/{id}")
def delete_prescription(
    id: int,
    db: Session = Depends(get_db),
    _: object = Depends(require_roles("admin")),
):
    db_prescription = (
        db.query(PrescriptionModel)
        .filter(PrescriptionModel.id == id)
        .first()
    )

    if db_prescription is None:
        raise HTTPException(
            status_code=HTTPStatus.NOT_FOUND,
            detail="Prescription does not exist."
        )

    db.delete(db_prescription)
    db.commit()

    return {"message": "Prescription deleted successfully"}