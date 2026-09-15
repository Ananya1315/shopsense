from pydantic import BaseModel
from datetime import datetime


class CustomerCreate(BaseModel):
    name: str
    email: str
    phone: str
    area: str
    password: str


class CustomerResponse(BaseModel):
    customer_id: int
    name: str
    email: str
    phone: str
    area: str
    created_at: datetime

    class Config:
        from_attributes = True