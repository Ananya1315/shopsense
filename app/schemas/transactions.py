from pydantic import BaseModel
from typing import Optional
from datetime import datetime


class TransactionCreate(BaseModel):
    customer_id: int
    product_id: int
    quantity: int
    total_amount: Optional[float] = None


class TransactionResponse(BaseModel):
    transaction_id: int
    customer_id: int
    product_id: int
    quantity: int
    total_amount: float
    purchase_date: Optional[datetime] = None

    class Config:
        from_attributes = True