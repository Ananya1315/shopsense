from pydantic import BaseModel


class CustomerCreate(BaseModel):
    name: str
    email: str
    phone: str
    area: str


class CustomerResponse(BaseModel):
    customer_id: int
    name: str
    email: str
    phone: str
    area: str

    class Config:
        from_attributes = True