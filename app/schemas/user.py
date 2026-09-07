from pydantic import BaseModel, ConfigDict
from datetime import datetime, date

class UserCreate(BaseModel):
    username: str
    email: str
    password: str
    first_name: str
    last_name: str
    date_of_birth: date
    gender: str
    phone: str
    address: str
    blood_group: str
    
class UserLogin(BaseModel):
    email: str
    password: str
    
class UserResponse(BaseModel):
    id: int
    username: str
    email: str
    role: str
    is_active: bool
    created_at: datetime 
    
    model_config = ConfigDict(from_attributes=True)    #add ConfigDict and configure the response schema to accept SQLAlchemy objects
    
class TokenResponse(BaseModel):
    access_token: str
    token_type: str
    
class AdminUserCreate(BaseModel):
    username: str
    email: str
    password: str
    role: str