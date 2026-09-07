from pydantic import BaseModel, ConfigDict
from datetime import datetime
from typing import Optional

class DepartmentCreate(BaseModel):
    name: str
    description: str
    
class DepartmentResponse(BaseModel):
    id: int
    name: str
    description: str
    created_at: datetime
    
    model_config = ConfigDict(from_attributes=True)
    
class DepartmentUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    