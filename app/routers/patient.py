from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session
from http import HTTPStatus
from app.models.patient import Patient as PatientModel
from app.schemas.patient import PatientCreate, PatientResponse, PatientUpdate
from app.models.user import User as UserModel

from app.core.dependencies import get_db, require_roles, get_current_user

router = APIRouter()


@router.get("/patients", response_model=list[PatientResponse])
def get_patients(
    db: Session = Depends(get_db),
    _: object = Depends(require_roles("admin", "doctor", "staff")),
):
    db_patients = db.query(PatientModel).all()
    return db_patients

@router.get("/patients/me", response_model=PatientResponse)
def get_my_patient_profile(
    db: Session = Depends(get_db),
    current_user: UserModel = Depends(get_current_user),
):
    db_patient = (
        db.query(PatientModel)
        .filter(PatientModel.user_id == current_user.id)
        .first()
    )

    if db_patient is None:
        raise HTTPException(
            status_code=HTTPStatus.NOT_FOUND,
            detail="Patient profile not found."
        )

    return db_patient


@router.get("/patients/{id}", response_model=PatientResponse)
def get_patient_by_id(
    id: int,
    db: Session = Depends(get_db),
    _: object = Depends(require_roles("admin", "doctor", "staff")),
):
    db_patient = db.query(PatientModel).filter(PatientModel.id == id).first()

    if db_patient is None:
        raise HTTPException(status_code=HTTPStatus.NOT_FOUND, detail="Invalid ID.")

    return db_patient


@router.post("/patients", response_model=PatientResponse)
def add_patient(patient: PatientCreate, db: Session = Depends(get_db), _: object = Depends(require_roles("admin", "staff"))):
    db_user = db.query(UserModel).filter(UserModel.id == patient.user_id).first()

    if db_user is None:
        raise HTTPException(
            status_code=HTTPStatus.NOT_FOUND, detail="User does not exist."
        )

    db_patient = (
        db.query(PatientModel).filter(PatientModel.user_id == patient.user_id).first()
    )

    if db_patient is not None:
        raise HTTPException(
            status_code=HTTPStatus.CONFLICT,
            detail="This user is already registered as a patient.",
        )

    new_patient = PatientModel(
        user_id=patient.user_id,
        first_name=patient.first_name,
        last_name=patient.last_name,
        date_of_birth=patient.date_of_birth,
        gender=patient.gender,
        phone=patient.phone,
        address=patient.address,
        blood_group=patient.blood_group,
    )

    db.add(new_patient)
    db.commit()
    db.refresh(new_patient)

    return new_patient


@router.patch("/patients/{id}", response_model=PatientResponse)
def update_patient(id: int, patient: PatientUpdate, db: Session = Depends(get_db), _: object = Depends(require_roles("admin", "staff"))):
    db_patient = db.query(PatientModel).filter(PatientModel.id == id).first()

    if db_patient is None:
        raise HTTPException(
            status_code=HTTPStatus.NOT_FOUND, detail="Patient not found"
        )

    update_data = patient.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(db_patient, field, value)

    db.commit()
    db.refresh(db_patient)

    return db_patient


@router.delete("/patients/{id}")
def delete_patient(id: int, db: Session = Depends(get_db), _: object = Depends(require_roles("admin", "staff"))):
    db_patient = db.query(PatientModel).filter(PatientModel.id == id).first()

    if db_patient is None:
        raise HTTPException(
            status_code=HTTPStatus.NOT_FOUND, detail="Patient not found."
        )

    db.delete(db_patient)
    db.commit()

    return "Paitent deleted!"

