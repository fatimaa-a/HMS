from pydantic import BaseModel
from datetime import date, datetime
from typing import Optional

class PatientCreate(BaseModel):
    user_id:int
    first_name: str
    last_name: str
    date_of_birth: date
    gender: str
    phone: str
    address: str
    blood_group: str
    
class PatientResponse(BaseModel):
    id: int
    user_id: int
    first_name: str
    last_name: str
    date_of_birth: date
    gender: str
    phone: str
    address: str
    blood_group: str
    created_at: datetime
    
class PatientUpdate(BaseModel):
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    date_of_birth: Optional[date] = None
    gender: Optional[str] = None
    phone: Optional[str] = None
    address: Optional[str] = None
    blood_group: Optional[str] = None