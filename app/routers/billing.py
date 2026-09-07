from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session
from http import HTTPStatus

from app.models.billing import Billing as BillingModel
from app.schemas.billing import (
    BillingCreate,
    BillingResponse,
    BillingUpdate,
)
from app.models.appointment import Appointment as AppointmentModel

from app.core.dependencies import get_db, require_roles

router = APIRouter()


@router.get(
    "/bills",
    response_model=list[BillingResponse]
)
def view_bills(
    db: Session = Depends(get_db),
    _: object = Depends(require_roles("admin", "staff")),
):
    return db.query(BillingModel).all()


@router.get(
    "/bills/{id}",
    response_model=BillingResponse
)
def view_bill_by_id(
    id: int,
    db: Session = Depends(get_db),
    _: object = Depends(require_roles("admin", "staff")),
):
    db_bill = (
        db.query(BillingModel)
        .filter(BillingModel.id == id)
        .first()
    )

    if db_bill is None:
        raise HTTPException(
            status_code=HTTPStatus.NOT_FOUND,
            detail="Bill does not exist."
        )

    return db_bill


@router.post(
    "/bills",
    response_model=BillingResponse
)
def add_bill(
    bill: BillingCreate,
    db: Session = Depends(get_db),
    _: object = Depends(require_roles("admin", "staff")),
):
    db_appointment = (
        db.query(AppointmentModel)
        .filter(AppointmentModel.id == bill.appointment_id)
        .first()
    )

    if db_appointment is None:
        raise HTTPException(
            status_code=HTTPStatus.NOT_FOUND,
            detail="Appointment does not exist"
        )

    db_bill = (
        db.query(BillingModel)
        .filter(
            BillingModel.appointment_id == bill.appointment_id
        )
        .first()
    )

    if db_bill is not None:
        raise HTTPException(
            status_code=HTTPStatus.CONFLICT,
            detail="Bill already exists."
        )

    new_bill = BillingModel(
        appointment_id=bill.appointment_id,
        amount=bill.amount,
        status=bill.status,
    )

    db.add(new_bill)
    db.commit()
    db.refresh(new_bill)

    return new_bill


@router.patch(
    "/bills/{id}",
    response_model=BillingResponse
)
def update_bill(
    id: int,
    bill: BillingUpdate,
    db: Session = Depends(get_db),
    _: object = Depends(require_roles("admin", "staff")),
):
    db_bill = (
        db.query(BillingModel)
        .filter(BillingModel.id == id)
        .first()
    )

    if db_bill is None:
        raise HTTPException(
            status_code=HTTPStatus.NOT_FOUND,
            detail="Bill does not exist."
        )

    update_data = bill.model_dump(exclude_unset=True)

    for field, value in update_data.items():
        setattr(db_bill, field, value)

    db.commit()
    db.refresh(db_bill)

    return db_bill


@router.delete("/bills/{id}")
def delete_bill(
    id: int,
    db: Session = Depends(get_db),
    _: object = Depends(require_roles("admin")),
):
    db_bill = (
        db.query(BillingModel)
        .filter(BillingModel.id == id)
        .first()
    )

    if db_bill is None:
        raise HTTPException(
            status_code=HTTPStatus.NOT_FOUND,
            detail="Bill does not exist."
        )

    db.delete(db_bill)
    db.commit()

    return {"message": "Bill deleted successfully"}