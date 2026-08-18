from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey
from datetime import datetime

from app.database import Base

class Product(Base):
    __tablename__ = "products"

    product_id = Column(Integer, primary_key=True, index=True)
    vendor_id = Column(
        Integer,
        ForeignKey("vendors.vendor_id"),
        nullable=False
    )
    name = Column(String(100), nullable=False)
    description = Column(String(255))
    seo_tags=Column(String(255))
    seo_keywords=Column(String(255))
    price = Column(Float, nullable=False)
    stock = Column(Integer, nullable=False)
    category = Column(String(100))
    created_at = Column(DateTime, default=datetime.utcnow)