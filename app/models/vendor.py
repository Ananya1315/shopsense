from sqlalchemy import Column, Integer, String, DateTime
from datetime import datetime
from app.database import Base

class Vendor(Base):
    __tablename__ = "vendors"
    vendor_id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    email = Column(String(100), unique=True, nullable=False)
    password = Column(String, nullable=False)
    role = Column(String, default="vendor")
    phone = Column(String(20), nullable=False)
    address = Column(String(255), nullable=False)
    status = Column(String(20), default="pending")
    created_at = Column(DateTime, default=datetime.utcnow)