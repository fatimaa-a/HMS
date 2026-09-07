from pydantic import BaseModel
from typing import Optional
from decimal import Decimal

class BillingCreate(BaseModel):
    appointment_id: int
    amount: Decimal
    status: str
    
class BillingResponse(BaseModel):
    id: int
    appointment_id: int
    amount: Decimal
    status: str
    
class BillingUpdate(BaseModel):
    amount: Optional[Decimal] = None
    status: Optional[str] = None