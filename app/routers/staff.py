from http import HTTPStatus

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database.database import get_db
from app.models.staff import Staff as StaffModel
from app.schemas.staff import StaffResponse
from app.routers.user import require_roles


router = APIRouter()


@router.get(
    "/staff",
    response_model=list[StaffResponse],
)
def get_staff(
    db: Session = Depends(get_db),
    _: object = Depends(require_roles("admin")),
):
    return db.query(StaffModel).all()


@router.get(
    "/staff/{id}",
    response_model=StaffResponse,
)
def get_staff_by_id(
    id: int,
    db: Session = Depends(get_db),
    _: object = Depends(require_roles("admin")),
):
    staff = (
        db.query(StaffModel)
        .filter(StaffModel.id == id)
        .first()
    )

    if staff is None:
        raise HTTPException(
            status_code=HTTPStatus.NOT_FOUND,
            detail="Staff member not found.",
        )

    return staff