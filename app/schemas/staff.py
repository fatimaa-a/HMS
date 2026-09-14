from datetime import datetime

from pydantic import BaseModel, ConfigDict


class StaffResponse(BaseModel):
    id: int
    user_id: int
    department_id: int
    first_name: str
    last_name: str
    position: str
    phone: str
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)