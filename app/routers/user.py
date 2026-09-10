from fastapi import (
    APIRouter,
    HTTPException,
    Depends,
    UploadFile,
    File,
)
from http import HTTPStatus
from sqlalchemy.orm import Session
from pathlib import Path
import uuid

from fastapi.security import OAuth2PasswordRequestForm

from app.schemas.user import (
    UserCreate,
    UserResponse,
    TokenResponse,
    AdminUserCreate,
    UserUpdate,
)
from app.models.user import User as UserModel
from app.models.patient import Patient as PatientModel
from app.core.dependencies import (
    get_db,
    get_current_user,
    require_roles,
)
from app.core.security import (
    hash_password,
    verify_password,
    create_access_token,
)


router = APIRouter()


UPLOAD_DIR = Path("uploads/profile_pictures")
UPLOAD_DIR.mkdir(parents=True, exist_ok=True)


@router.post("/register", response_model=UserResponse)
def create_user(
    user: UserCreate,
    db: Session = Depends(get_db),
):
    email = (
        db.query(UserModel)
        .filter(UserModel.email == user.email)
        .first()
    )

    if email is not None:
        raise HTTPException(
            status_code=HTTPStatus.CONFLICT,
            detail="Email already exists",
        )

    username = (
        db.query(UserModel)
        .filter(UserModel.username == user.username)
        .first()
    )

    if username is not None:
        raise HTTPException(
            status_code=HTTPStatus.CONFLICT,
            detail="Username already exists",
        )

    password_hash = hash_password(user.password)

    new_user = UserModel(
        username=user.username,
        email=user.email,
        password_hash=password_hash,
        role="patient",
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
        blood_group=user.blood_group,
    )

    db.add(new_patient)

    db.commit()
    db.refresh(new_user)

    return new_user


@router.post("/login", response_model=TokenResponse)
def user_login(
    user: OAuth2PasswordRequestForm = Depends(),
    db: Session = Depends(get_db),
):
    db_user = (
        db.query(UserModel)
        .filter(UserModel.email == user.username)
        .first()
    )

    if db_user is None:
        raise HTTPException(
            status_code=HTTPStatus.UNAUTHORIZED,
            detail="Invalid email or password",
        )

    if not verify_password(
        user.password,
        db_user.password_hash,
    ):
        raise HTTPException(
            status_code=HTTPStatus.UNAUTHORIZED,
            detail="Invalid email or password",
        )

    created_token = create_access_token(
        {
            "sub": str(db_user.id),
            "role": db_user.role,
        }
    )

    return TokenResponse(
        access_token=created_token,
        token_type="bearer",
    )


@router.get("/me", response_model=UserResponse)
def get_me(
    user: UserModel = Depends(get_current_user),
):
    return user


@router.post("/me/profile-picture")
async def upload_profile_picture(
    file: UploadFile = File(...),
    current_user: UserModel = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    allowed_types = {
        "image/jpeg",
        "image/png",
        "image/webp",
    }

    if file.content_type not in allowed_types:
        raise HTTPException(
            status_code=HTTPStatus.BAD_REQUEST,
            detail="Only JPG, PNG, and WEBP images are allowed.",
        )

    extension = Path(file.filename or "").suffix.lower()

    if extension not in {
        ".jpg",
        ".jpeg",
        ".png",
        ".webp",
    }:
        raise HTTPException(
            status_code=HTTPStatus.BAD_REQUEST,
            detail="Invalid image format.",
        )

    contents = await file.read()

    max_size = 5 * 1024 * 1024

    if len(contents) > max_size:
        raise HTTPException(
            status_code=HTTPStatus.BAD_REQUEST,
            detail="Profile picture must be smaller than 5 MB.",
        )

    filename = f"{uuid.uuid4()}{extension}"
    file_path = UPLOAD_DIR / filename

    with open(file_path, "wb") as buffer:
        buffer.write(contents)

    # Delete the user's old profile picture
    if current_user.profile_picture:
        old_file = UPLOAD_DIR / current_user.profile_picture

        if old_file.exists():
            old_file.unlink()

    current_user.profile_picture = filename

    db.commit()
    db.refresh(current_user)

    return {
        "message": "Profile picture uploaded successfully.",
        "profile_picture": (
            f"/uploads/profile_pictures/{filename}"
        ),
    }


@router.delete("/me/profile-picture")
def delete_profile_picture(
    current_user: UserModel = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    if not current_user.profile_picture:
        raise HTTPException(
            status_code=HTTPStatus.NOT_FOUND,
            detail="No profile picture found.",
        )

    file_path = UPLOAD_DIR / current_user.profile_picture

    if file_path.exists():
        file_path.unlink()

    current_user.profile_picture = None

    db.commit()

    return {
        "message": "Profile picture removed successfully.",
    }


@router.post("/admin/users", response_model=UserResponse)
def create_staff_or_admin_user(
    user: AdminUserCreate,
    db: Session = Depends(get_db),
    _: object = Depends(require_roles("admin")),
):
    if user.role not in ["admin", "doctor", "staff"]:
        raise HTTPException(
            status_code=HTTPStatus.BAD_REQUEST,
            detail="Invalid role.",
        )

    existing_email = (
        db.query(UserModel)
        .filter(UserModel.email == user.email)
        .first()
    )

    if existing_email is not None:
        raise HTTPException(
            status_code=HTTPStatus.CONFLICT,
            detail="Email already exists.",
        )

    existing_username = (
        db.query(UserModel)
        .filter(UserModel.username == user.username)
        .first()
    )

    if existing_username is not None:
        raise HTTPException(
            status_code=HTTPStatus.CONFLICT,
            detail="Username already exists.",
        )

    password_hash = hash_password(user.password)

    new_user = UserModel(
        username=user.username,
        email=user.email,
        password_hash=password_hash,
        role=user.role,
    )

    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    return new_user


@router.get(
    "/admin/users",
    response_model=list[UserResponse],
)
def get_users(
    db: Session = Depends(get_db),
    _: object = Depends(require_roles("admin")),
):
    return db.query(UserModel).all()


@router.get(
    "/admin/users/{id}",
    response_model=UserResponse,
)
def get_user_by_id(
    id: int,
    db: Session = Depends(get_db),
    _: object = Depends(require_roles("admin")),
):
    db_user = (
        db.query(UserModel)
        .filter(UserModel.id == id)
        .first()
    )

    if db_user is None:
        raise HTTPException(
            status_code=HTTPStatus.NOT_FOUND,
            detail="User not found.",
        )

    return db_user


@router.patch(
    "/admin/users/{id}",
    response_model=UserResponse,
)
def update_user(
    id: int,
    user: UserUpdate,
    db: Session = Depends(get_db),
    _: object = Depends(require_roles("admin")),
):
    db_user = (
        db.query(UserModel)
        .filter(UserModel.id == id)
        .first()
    )

    if db_user is None:
        raise HTTPException(
            status_code=HTTPStatus.NOT_FOUND,
            detail="User not found.",
        )

    if user.role is not None:
        if user.role not in [
            "admin",
            "doctor",
            "staff",
            "patient",
        ]:
            raise HTTPException(
                status_code=HTTPStatus.BAD_REQUEST,
                detail="Invalid role.",
            )

    if user.username is not None:
        existing_username = (
            db.query(UserModel)
            .filter(
                UserModel.username == user.username,
                UserModel.id != id,
            )
            .first()
        )

        if existing_username is not None:
            raise HTTPException(
                status_code=HTTPStatus.CONFLICT,
                detail="Username already exists.",
            )

    if user.email is not None:
        existing_email = (
            db.query(UserModel)
            .filter(
                UserModel.email == user.email,
                UserModel.id != id,
            )
            .first()
        )

        if existing_email is not None:
            raise HTTPException(
                status_code=HTTPStatus.CONFLICT,
                detail="Email already exists.",
            )

    if user.username is not None:
        db_user.username = user.username

    if user.email is not None:
        db_user.email = user.email

    if user.role is not None:
        db_user.role = user.role

    if user.is_active is not None:
        db_user.is_active = user.is_active

    db.commit()
    db.refresh(db_user)

    return db_user