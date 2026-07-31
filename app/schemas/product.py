from pydantic import BaseModel, Field

class ProductCreate(BaseModel):
    vendor_id: int
    name: str
    description: str
    price: float = Field(..., gt=0)
    stock: int = Field(..., ge=0)
    category: str

class ProductResponse(BaseModel):
    product_id: int
    vendor_id: int
    name: str
    description: str
    price: float
    stock: int
    category: str

    class Config:
        from_attributes = True