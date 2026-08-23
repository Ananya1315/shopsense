from pydantic import BaseModel
from typing import List


class VendorInventoryValueResponse(BaseModel):
    vendor_name: str
    inventory_value: float

class CustomerSegmentResponse(BaseModel):
    customer_id: int
    customer_name: str
    total_spent: float
    segment: str

class ProductRecommendationResponse(BaseModel):
    product_id: int
    product_name: str
    category: str
    price: float
    total_sold: int


class CustomerSegmentResponse(BaseModel):
    customer_id: int
    customer_name: str
    area: str
    total_orders: int
    total_spent: float
    average_order_value: float
    segment: str