from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func, desc
from typing import List


from app.database import get_db
from app.models.vendor import Vendor
from app.models.product import Product
from app.models.transaction import Transaction

from app.database import get_db
from app.models.product import Product
from app.models.vendor import Vendor
from app.schemas.product import ProductResponse
from app.schemas.analytics import VendorInventoryValueResponse

router = APIRouter()

@router.get("/analytics/total-products")
def get_total_products(db: Session = Depends(get_db)):
    total_products = db.query(func.count(Product.product_id)).scalar()

    return{
        "total_products":total_products
    }

@router.get("/analytics/avg-price")
def get_avg_price(db:Session = Depends(get_db)):
    avg_price=db.query(func.avg(Product.price)).scalar()

    return{
        "average_price":avg_price
    }

@router.get("/analytics/inventory-value")
def get_inventory_value(db: Session = Depends(get_db)):
    inventory_value = db.query(func.sum(Product.price * Product.stock)).scalar()
    return {
        "inventory_value": inventory_value
    }

@router.get("/analytics/low-stock",response_model=List[ProductResponse])
def get_low_stock_products(db: Session = Depends(get_db)):
    low_stock_products= db.query(Product).filter(Product.stock < 5).all()

    return low_stock_products

@router.get("/analytics/out-of-stock",response_model=List[ProductResponse])
def get_out_of_low_stock_products(db: Session = Depends(get_db)):
    out_of_stock_products= db.query(Product).filter(Product.stock== 0).all()

    return out_of_stock_products

@router.get("/analytics/inventory-value-by-vendor",response_model=List[VendorInventoryValueResponse])
def get_inventory_value_by_vendor(db: Session = Depends(get_db)):
    inventory_by_vendor = (db.query(Vendor.name,func.sum(Product.price * Product.stock)
        .label("inventory_value"))
         .join(
        Product,
        Vendor.vendor_id == Product.vendor_id)
         .group_by(Vendor.name).all()
    )
    return [
    {
        "vendor_name": row.name,
        "inventory_value": row.inventory_value
    }
    for row in inventory_by_vendor
    ]

@router.get("/analytics/top-vendor",response_model=VendorInventoryValueResponse)
def get_top_vendor(db: Session = Depends(get_db)):
    top_vendor = (db.query(Vendor.name,
            func.sum(Product.price * Product.stock).label("inventory_value")
        )
        .join(Product,Vendor.vendor_id == Product.vendor_id)
        .group_by(Vendor.name)
        .order_by(desc("inventory_value")).first()
    )
    if top_vendor is None:
        raise HTTPException(
            status_code=404,
            detail="No vendor data found."
        )

    return {
        "vendor_name": top_vendor.name,
        "inventory_value": top_vendor.inventory_value
    }


@router.get("/analytics/vendor/{vendor_id}/sales")
def get_total_sales(
    vendor_id: int,
    db: Session = Depends(get_db)
):

    vendor = (
        db.query(Vendor)
        .filter(Vendor.vendor_id == vendor_id)
        .first()
    )

    if vendor is None:
        raise HTTPException(
            status_code=404,
            detail="Vendor not found"
        )

    total_sales = (
        db.query(func.sum(Transaction.quantity))
        .join(Product, Product.product_id == Transaction.product_id)
        .filter(Product.vendor_id == vendor_id)
        .scalar()
    )

    return {
        "vendor_id": vendor_id,
        "total_sales": total_sales or 0
    }


@router.get("/analytics/vendor/{vendor_id}/revenue")
def get_total_revenue(
    vendor_id: int,
    db: Session = Depends(get_db)
):

    vendor = (
        db.query(Vendor)
        .filter(Vendor.vendor_id == vendor_id)
        .first()
    )

    if vendor is None:
        raise HTTPException(
            status_code=404,
            detail="Vendor not found"
        )

    total_revenue = (
        db.query(func.sum(Transaction.total_amount))
        .join(Product, Product.product_id == Transaction.product_id)
        .filter(Product.vendor_id == vendor_id)
        .scalar()
    )

    return {
        "vendor_id": vendor_id,
        "total_revenue": total_revenue or 0
    }