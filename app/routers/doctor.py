from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session
from http import HTTPStatus
from app.models.doctor import Doctor as DoctorModel
from app.models.user import User as UserModel
from app.models.department import Department as DepartmentModel
from app.schemas.doctor import DoctorCreate, DoctorResponse, DoctorUpdate

from app.core.dependencies import get_db, require_roles

router = APIRouter()


@router.get("/doctors", response_model=list[DoctorResponse])
def get_doctors(
    db: Session = Depends(get_db),
    _: object = Depends(require_roles("admin", "doctor", "staff", "patient")),
):
    doctors = db.query(DoctorModel).all()
    return doctors


@router.get("/doctors/{id}", response_model=DoctorResponse)
def get_doctor_by_id(
    id: int,
    db: Session = Depends(get_db),
    _: object = Depends(require_roles("admin", "doctor", "staff", "patient")),
):
    doctor = db.query(DoctorModel).filter(DoctorModel.id == id).first()

    if doctor is None:
        raise HTTPException(status_code=HTTPStatus.NOT_FOUND, detail="Invalid ID")

    return doctor


@router.post("/doctors", response_model=DoctorResponse)
def add_doctor(
    doctor: DoctorCreate,
    db: Session = Depends(get_db),
    _: object = Depends(require_roles("admin")),
):
    user = db.query(UserModel).filter(UserModel.id == doctor.user_id).first()
    if user is None:
        raise HTTPException(status_code=HTTPStatus.NOT_FOUND, detail="Invalid user ID")

    department = (
        db.query(DepartmentModel)
        .filter(DepartmentModel.id == doctor.department_id)
        .first()
    )
    if department is None:
        raise HTTPException(
            status_code=HTTPStatus.NOT_FOUND, detail="Invalid department ID"
        )

    existing_doctor = (
        db.query(DoctorModel).filter(DoctorModel.user_id == doctor.user_id).first()
    )
    if existing_doctor is not None:
        raise HTTPException(
            status_code=HTTPStatus.CONFLICT,
            detail="This user is already registered as a doctor.",
        )

    new_doctor = DoctorModel(
        user_id=doctor.user_id,
        department_id=doctor.department_id,
        first_name=doctor.first_name,
        last_name=doctor.last_name,
        specialization=doctor.specialization,
        license_number=doctor.license_number,
        phone=doctor.phone,
    )

    db.add(new_doctor)
    db.commit()
    db.refresh(new_doctor)

    return new_doctor


@router.patch("/doctors/{id}", response_model=DoctorResponse)
def update_doctor(
    id: int,
    doctor: DoctorUpdate,
    db: Session = Depends(get_db),
    _: object = Depends(require_roles("admin")),
):
    db_doctor = db.query(DoctorModel).filter(DoctorModel.id == id).first()

    if db_doctor is None:
        raise HTTPException(
            status_code=HTTPStatus.NOT_FOUND, detail="Doctor not found."
        )

    update_data = doctor.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(db_doctor, field, value)

    db.commit()
    db.refresh(db_doctor)

    return db_doctor


@router.delete("/doctors/{id}")
def delete_doctor(
    id: int, db: Session = Depends(get_db), _: object = Depends(require_roles("admin"))
):
    doctor = db.query(DoctorModel).filter(DoctorModel.id == id).first()

    if doctor is None:
        raise HTTPException(status_code=HTTPStatus.NOT_FOUND, detail="doctor not found")

    db.delete(doctor)
    db.commit()

    return "Doctor deleted!"
