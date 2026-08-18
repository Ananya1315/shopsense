from typing import Optional
from pydantic import BaseModel


class ProductCreate(BaseModel):
    vendor_id: int
    name: str
    description: str = ""
    price: float
    stock: int
    category: str


class ProductResponse(BaseModel):
    product_id: int
    vendor_id: int
    name: str
    description: str
    seo_tags: Optional[str] = None
    seo_keywords: Optional[str] = None
    price: float
    stock: int
    category: str

    class Config:
        from_attributes = True