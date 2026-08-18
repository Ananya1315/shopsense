from pydantic import BaseModel, EmailStr

class VendorCreate(BaseModel):
    name: str
    email: str
    password: str
    role: str = "vendor"
    phone: str
    address: str

class VendorResponse(BaseModel):
    vendor_id: int
    name: str
    email: str
    role: str
    phone: str
    address: str
    status: str
    class Config:
        from_attributes = True

class VendorLogin(BaseModel):
    email: EmailStr
    password: str