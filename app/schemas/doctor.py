from pydantic import BaseModel
from datetime import datetime
from typing import Optional

class DoctorCreate(BaseModel):
    user_id: int
    department_id: int
    first_name: str
    last_name: str
    specialization: str
    license_number: str
    phone: str
    
class DoctorResponse(BaseModel):
    id: int
    user_id: int
    department_id: int
    first_name: str
    last_name: str
    specialization: str
    license_number: str
    phone: str
    created_at: datetime
    
class DoctorUpdate(BaseModel):
    department_id: Optional[int] = None
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    specialization: Optional[str] = None
    phone: Optional[str] = None