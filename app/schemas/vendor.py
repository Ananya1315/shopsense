from pydantic import BaseModel, EmailStr


class VendorCreate(BaseModel):
    name: str
    email: str
    password: str
    phone: str
    address: str

class VendorResponse(BaseModel):
    vendor_id: int
    name: str
    email: str
    phone: str
    address: str

    class Config:
        from_attributes = True

class VendorLogin(BaseModel):
    email: EmailStr
    password: str