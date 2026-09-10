from fastapi import APIRouter, Depends, HTTPException
from http import HTTPStatus
from sqlalchemy.orm import Session

from app.models.appointment import Appointment as AppointmentModel
from app.models.patient import Patient as PatientModel
from app.models.doctor import Doctor as DoctorModel
from app.models.department import Department as DepartmentModel
from app.models.user import User as UserModel

from app.schemas.appointment import (
    AppointmentCreate,
    AppointmentResponse,
    AppointmentUpdate,
)

from app.core.dependencies import (
    get_db,
    get_current_user,
    require_roles,
)

router = APIRouter()


@router.get(
    "/appointments",
    response_model=list[AppointmentResponse]
)
def view_appointments(
    db: Session = Depends(get_db),
    current_user: UserModel = Depends(get_current_user),
):
    if current_user.role == "admin" or current_user.role == "staff":
        appointments = (
            db.query(AppointmentModel)
            .all()
        )

    elif current_user.role == "doctor":
        db_doctor = (
            db.query(DoctorModel)
            .filter(
                DoctorModel.user_id == current_user.id
            )
            .first()
        )

        if db_doctor is None:
            raise HTTPException(
                status_code=HTTPStatus.NOT_FOUND,
                detail="Doctor profile not found."
            )

        appointments = (
            db.query(AppointmentModel)
            .filter(
                AppointmentModel.doctor_id == db_doctor.id
            )
            .all()
        )

    else:
        raise HTTPException(
            status_code=HTTPStatus.FORBIDDEN,
            detail="You do not have permission to view appointments."
        )

    return appointments

@router.get(
    "/appointments/me",
    response_model=list[AppointmentResponse]
)
def view_my_appointments(
    db: Session = Depends(get_db),
    current_user: UserModel = Depends(get_current_user),
):
    if current_user.role != "patient":
        raise HTTPException(
            status_code=HTTPStatus.FORBIDDEN,
            detail="Only patients can access this endpoint."
        )

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

    appointments = (
        db.query(AppointmentModel)
        .filter(AppointmentModel.patient_id == db_patient.id)
        .all()
    )

    return appointments

@router.get(
    "/appointments/{id}",
    response_model=AppointmentResponse
)
def view_appt_by_id(
    id: int,
    db: Session = Depends(get_db),
    _: object = Depends(
        require_roles("admin", "doctor", "staff")
    ),
):
    db_appt = (
        db.query(AppointmentModel)
        .filter(AppointmentModel.id == id)
        .first()
    )

    if db_appt is None:
        raise HTTPException(
            status_code=HTTPStatus.NOT_FOUND,
            detail="Appointment does not exist"
        )

    return db_appt


@router.post(
    "/appointments",
    response_model=AppointmentResponse
)
def create_appt(
    appointment: AppointmentCreate,
    db: Session = Depends(get_db),
    current_user: UserModel = Depends(get_current_user),
):
    if current_user.role not in ["admin", "staff", "patient"]:
        raise HTTPException(
            status_code=HTTPStatus.FORBIDDEN,
            detail="You do not have permission to create appointments."
        )

    # Patient can only create an appointment for themselves
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
                detail="Patient profile not found"
            )

        patient_id = db_patient.id

    else:
        # Admin / staff can create for a patient
        if appointment.patient_id is None:
            raise HTTPException(
                status_code=HTTPStatus.BAD_REQUEST,
                detail="Patient ID is required."
            )

        patient_id = appointment.patient_id

        db_patient = (
            db.query(PatientModel)
            .filter(
                PatientModel.id == patient_id
            )
            .first()
        )

        if db_patient is None:
            raise HTTPException(
                status_code=HTTPStatus.NOT_FOUND,
                detail="Patient does not exist"
            )

    # Check doctor
    db_doctor = (
        db.query(DoctorModel)
        .filter(
            DoctorModel.id == appointment.doctor_id
        )
        .first()
    )

    if db_doctor is None:
        raise HTTPException(
            status_code=HTTPStatus.NOT_FOUND,
            detail="Doctor does not exist"
        )

    # Check department
    db_department = (
        db.query(DepartmentModel)
        .filter(
            DepartmentModel.id == appointment.department_id
        )
        .first()
    )

    if db_department is None:
        raise HTTPException(
            status_code=HTTPStatus.NOT_FOUND,
            detail="Department does not exist"
        )

    # Doctor must belong to selected department
    if db_doctor.department_id != appointment.department_id:
        raise HTTPException(
            status_code=HTTPStatus.BAD_REQUEST,
            detail="Doctor does not belong to the selected department"
        )

    new_appointment = AppointmentModel(
        patient_id=patient_id,
        doctor_id=appointment.doctor_id,
        department_id=appointment.department_id,
        appointment_date=appointment.appointment_date,
        reason=appointment.reason,
        status=appointment.status,
    )

    db.add(new_appointment)
    db.commit()
    db.refresh(new_appointment)

    return new_appointment


@router.patch(
    "/appointments/{id}",
    response_model=AppointmentResponse
)
def update_appointment(
    id: int,
    appointment: AppointmentUpdate,
    db: Session = Depends(get_db),
    _: object = Depends(
        require_roles("admin", "doctor", "staff")
    ),
):
    db_appointment = (
        db.query(AppointmentModel)
        .filter(AppointmentModel.id == id)
        .first()
    )

    if db_appointment is None:
        raise HTTPException(
            status_code=HTTPStatus.NOT_FOUND,
            detail="Appointment does not exist"
        )

    update_data = appointment.model_dump(
        exclude_unset=True
    )

    # Determine final doctor and department
    final_doctor_id = update_data.get(
        "doctor_id",
        db_appointment.doctor_id
    )

    final_department_id = update_data.get(
        "department_id",
        db_appointment.department_id
    )

    # Validate doctor
    db_doctor = (
        db.query(DoctorModel)
        .filter(
            DoctorModel.id == final_doctor_id
        )
        .first()
    )

    if db_doctor is None:
        raise HTTPException(
            status_code=HTTPStatus.NOT_FOUND,
            detail="Doctor does not exist"
        )

    # Validate department
    db_department = (
        db.query(DepartmentModel)
        .filter(
            DepartmentModel.id == final_department_id
        )
        .first()
    )

    if db_department is None:
        raise HTTPException(
            status_code=HTTPStatus.NOT_FOUND,
            detail="Department does not exist"
        )

    # Doctor and department must match
    if db_doctor.department_id != final_department_id:
        raise HTTPException(
            status_code=HTTPStatus.BAD_REQUEST,
            detail="Doctor does not belong to the selected department"
        )

    # Apply updates
    for field, value in update_data.items():
        setattr(db_appointment, field, value)

    db.commit()
    db.refresh(db_appointment)

    return db_appointment


@router.delete("/appointments/{id}")
def delete_appointment(
    id: int,
    db: Session = Depends(get_db),
    _: object = Depends(
        require_roles("admin", "doctor", "staff")
    ),
):
    db_appointment = (
        db.query(AppointmentModel)
        .filter(AppointmentModel.id == id)
        .first()
    )

    if db_appointment is None:
        raise HTTPException(
            status_code=HTTPStatus.NOT_FOUND,
            detail="Appointment does not exist"
        )

    db.delete(db_appointment)
    db.commit()

    return {"message": "Appointment deleted successfully"}