from app.database.database import SessionLocal
from fastapi.security import OAuth2PasswordBearer
from jose import jwt, JWTError
from app.core.security import SECRET_KEY, ALGORITHM
from fastapi import HTTPException, Depends
from http import HTTPStatus
from sqlalchemy.orm import Session
from app.models.user import User

def get_db():
    db = SessionLocal()
    
    try:
        yield db
    finally:
        db.close()
        
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/login")   #extracts the Bearer token from incoming requests

def get_current_user(
    token: str = Depends(oauth2_scheme),
    db: Session = Depends(get_db)
):
    try:
        payload = jwt.decode(
            token,
            SECRET_KEY,
            algorithms=[ALGORITHM]
        )

        user_id = payload.get("sub")

        if user_id is None:
            raise HTTPException(
                status_code=HTTPStatus.UNAUTHORIZED,
                detail="Invalid token"
            )

        user_id = int(user_id)

    except JWTError as e:
        raise HTTPException(
            status_code=HTTPStatus.UNAUTHORIZED,
            detail=str(e)
    )

    user = db.query(User).filter(User.id == user_id).first()

    if user is None:
        raise HTTPException(
            status_code=HTTPStatus.UNAUTHORIZED,
            detail="User not found"
        )

    return user

def require_roles(*allowed_roles: str):
    def role_checker(user: User = Depends(get_current_user)):
        if user.role not in allowed_roles:
            raise HTTPException(
                status_code=HTTPStatus.FORBIDDEN,
                detail="You do not have permission to access this resource."
            )

        return user

    return role_checker