from fastapi import FastAPI

from app.database import Base, engine
from app.models.vendor import Vendor
from app.models.product import Product
from app.models.customer import Customer
from app.models.transaction import Transaction

from app.api.vendor import router as vendor_router
from app.api.product import router as product_router
from app.api.analytics import router as analytic_router

Base.metadata.create_all(bind=engine)


app = FastAPI()

app.include_router(vendor_router)
app.include_router(product_router)
app.include_router(analytic_router)

@app.get("/")
def home():
    return {"message": "Welcome to ShopSense Backend "}