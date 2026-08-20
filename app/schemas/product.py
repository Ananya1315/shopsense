from typing import Optional
from pydantic import BaseModel


class ProductCreate(BaseModel):
    vendor_id: int
    name: str
    description: str = ""
    seo_tags: Optional[str] = None
    seo_keywords: Optional[str] = None
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


# Used by vendors.
# vendor_id is NOT supplied by the frontend.
# It comes from the JWT/current logged-in vendor.

class VendorProductCreate(BaseModel):
    name: str
    description: str = ""
    seo_tags: Optional[str] = None
    seo_keywords: Optional[str] = None
    price: float
    stock: int
    category: str


class VendorProductUpdate(BaseModel):
    name: str
    description: str = ""
    seo_tags: Optional[str] = None
    seo_keywords: Optional[str] = None
    price: float
    stock: int
    category: str


class StockUpdate(BaseModel):
    stock: int