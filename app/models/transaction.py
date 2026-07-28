from sqlalchemy import Column, Integer, Float, DateTime, ForeignKey
from datetime import datetime
from app.database import Base

class Transaction(Base):
    __tablename__ = "transactions"
    transaction_id = Column(Integer, primary_key=True, index=True)
    customer_id = Column(
        Integer,
        ForeignKey("customers.customer_id"),
        nullable=False
    )
    product_id = Column(
        Integer,
        ForeignKey("products.product_id"),
        nullable=False
    )
    quantity = Column(Integer, nullable=False)
    total_amount = Column(Float, nullable=False)
    purchase_date = Column(DateTime, default=datetime.utcnow)