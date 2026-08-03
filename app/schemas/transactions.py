from pydantic import BaseModel

class TransactionCreate(BaseModel):
    customer_id: int
    product_id: int
    quantity: int
    total_amount: float


class TransactionResponse(BaseModel):
    transaction_id: int
    customer_id: int
    product_id: int
    quantity: int
    total_amount: float

    class Config:
        from_attributes = True