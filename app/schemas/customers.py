from pydantic import BaseModel, EmailStr

class CustomerCreate(BaseModel):
    name: str
    email: EmailStr
    phone: str


class CustomerResponse(BaseModel):
    customer_id: int
    name: str
    email: EmailStr
    phone: str

    class Config:
        from_attributes = True