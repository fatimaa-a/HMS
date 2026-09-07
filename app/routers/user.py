from fastapi import APIRouter, HTTPException, Depends
from http import HTTPStatus
from sqlalchemy.orm import Session
from fastapi.security import OAuth2PasswordRequestForm
from app.schemas.user import UserCreate, UserResponse, TokenResponse, AdminUserCreate
from app.models.user import User as UserModel
from app.models.patient import Patient as PatientModel
from app.core.dependencies import get_db, get_current_user, require_roles
from app.core.security import hash_password, verify_password, create_access_token

router = APIRouter()

@router.post("/register", response_model=UserResponse)
@router.post("/register", response_model=UserResponse)
def create_user(
    user: UserCreate,
    db: Session = Depends(get_db)
):
    email = db.query(UserModel).filter(
        UserModel.email == user.email
    ).first()

    if email is not None:
        raise HTTPException(
            status_code=HTTPStatus.CONFLICT,
            detail="Email already exists"
        )

    username = db.query(UserModel).filter(
        UserModel.username == user.username
    ).first()

    if username is not None:
        raise HTTPException(
            status_code=HTTPStatus.CONFLICT,
            detail="Username already exists"
        )

    password_hash = hash_password(user.password)

    new_user = UserModel(
        username=user.username,
        email=user.email,
        password_hash=password_hash,
        role="patient"
    )

    db.add(new_user)
    db.flush()

    new_patient = PatientModel(
        user_id=new_user.id,
        first_name=user.first_name,
        last_name=user.last_name,
        date_of_birth=user.date_of_birth,
        gender=user.gender,
        phone=user.phone,
        address=user.address,
        blood_group=user.blood_group
    )

    db.add(new_patient)

    db.commit()
    db.refresh(new_user)

    return new_user

@router.post("/login", response_model=TokenResponse)
def user_login(
    user: OAuth2PasswordRequestForm = Depends(),
    db: Session = Depends(get_db)
):
    db_user = db.query(UserModel).filter(
        UserModel.email == user.username
    ).first()

    if db_user is None:
        raise HTTPException(
            status_code=HTTPStatus.UNAUTHORIZED,
            detail="Invalid email or password"
        )

    if not verify_password(user.password, db_user.password_hash):
        raise HTTPException(
            status_code=HTTPStatus.UNAUTHORIZED,
            detail="Invalid email or password"
        )

    created_token = create_access_token({
        "sub": str(db_user.id),
        "role": db_user.role
    })

    return TokenResponse(
        access_token=created_token,
        token_type="bearer"
    )
    
@router.get("/me", response_model=UserResponse)
def get_me(user: UserModel = Depends(get_current_user)):
    return user

@router.post("/admin/users", response_model=UserResponse)
def create_staff_or_admin_user(
    user: AdminUserCreate,
    db: Session = Depends(get_db),
    _: object = Depends(require_roles("admin"))
):
    if user.role not in ["admin", "doctor", "staff"]:
        raise HTTPException(
            status_code=HTTPStatus.BAD_REQUEST,
            detail="Invalid role."
        )

    existing_email = (
        db.query(UserModel)
        .filter(UserModel.email == user.email)
        .first()
    )

    if existing_email is not None:
        raise HTTPException(
            status_code=HTTPStatus.CONFLICT,
            detail="Email already exists."
        )

    existing_username = (
        db.query(UserModel)
        .filter(UserModel.username == user.username)
        .first()
    )

    if existing_username is not None:
        raise HTTPException(
            status_code=HTTPStatus.CONFLICT,
            detail="Username already exists."
        )

    password_hash = hash_password(user.password)

    new_user = UserModel(
        username=user.username,
        email=user.email,
        password_hash=password_hash,
        role=user.role
    )

    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    return new_user