from pydantic import BaseModel


class VendorCreate(BaseModel):
    name: str
    email: str
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