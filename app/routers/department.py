from fastapi import APIRouter, HTTPException, Depends
from http import HTTPStatus
from sqlalchemy.orm import Session
from app.models.department import Department as DepartmentModel
from app.schemas.department import (
    DepartmentCreate,
    DepartmentResponse,
    DepartmentUpdate,
)
from app.core.dependencies import get_db, require_roles

router = APIRouter()


@router.post("/departments", response_model=DepartmentResponse)
def create_department(
    department: DepartmentCreate,
    db: Session = Depends(get_db),
    _: object = Depends(require_roles("admin")),
):
    db_dep = (
        db.query(DepartmentModel)
        .filter(DepartmentModel.name == department.name)
        .first()
    )

    if db_dep is not None:
        raise HTTPException(
            status_code=HTTPStatus.CONFLICT, detail="department already exists"
        )

    new_dept = DepartmentModel(name=department.name, description=department.description)

    db.add(new_dept)
    db.commit()
    db.refresh(new_dept)
    return new_dept


@router.get("/departments", response_model=list[DepartmentResponse])
def get_departments(
    db: Session = Depends(get_db),
    _: object = Depends(require_roles("admin", "doctor", "staff", "patient")),
):
    departments = db.query(DepartmentModel).all()
    return departments


@router.get("/departments/{id}", response_model=DepartmentResponse)
def get_department_by_id(
    id: int,
    db: Session = Depends(get_db),
    _: object = Depends(require_roles("admin", "doctor", "staff", "patient")),
):
    department = db.query(DepartmentModel).filter(DepartmentModel.id == id).first()

    if department is None:
        raise HTTPException(status_code=HTTPStatus.NOT_FOUND, detail="Invalid ID.")

    return department


@router.patch("/departments/{id}", response_model=DepartmentResponse)
def update_department(
    id: int,
    department: DepartmentUpdate,
    db: Session = Depends(get_db),
    _: object = Depends(require_roles("admin")),
):
    db_department = db.query(DepartmentModel).filter(DepartmentModel.id == id).first()

    if db_department is None:
        raise HTTPException(status_code=HTTPStatus.NOT_FOUND, detail="Invalid ID.")

    update_data = department.model_dump(exclude_unset=True)

    for field, value in update_data.items():
        setattr(db_department, field, value)

    db.commit()
    db.refresh(db_department)

    return db_department


@router.delete("/departments/{id}")
def delete_department(
    id: int, db: Session = Depends(get_db), _: object = Depends(require_roles("admin"))
):
    department = db.query(DepartmentModel).filter(DepartmentModel.id == id).first()

    if department is None:
        raise HTTPException(status_code=HTTPStatus.NOT_FOUND, detail="Invalid ID.")

    db.delete(department)
    db.commit()
    return "Department deleted!"
