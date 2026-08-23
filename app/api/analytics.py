from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func, desc
from typing import List

from app.database import get_db

from app.models.vendor import Vendor
from app.models.product import Product
from app.models.transaction import Transaction
from app.models.customer import Customer

from app.schemas.product import ProductResponse
from app.schemas.analytics import (
    VendorInventoryValueResponse,
    CustomerSegmentResponse
)

router = APIRouter()


# =====================================================
# TOTAL PRODUCTS
# =====================================================

@router.get("/analytics/total-products")
def get_total_products(
    db: Session = Depends(get_db)
):

    total_products = (
        db.query(func.count(Product.product_id))
        .scalar()
    )

    return {
        "total_products": total_products
    }


# =====================================================
# AVERAGE PRODUCT PRICE
# =====================================================

@router.get("/analytics/avg-price")
def get_avg_price(
    db: Session = Depends(get_db)
):

    avg_price = (
        db.query(func.avg(Product.price))
        .scalar()
    )

    return {
        "average_price": avg_price
    }


# =====================================================
# TOTAL INVENTORY VALUE
# =====================================================

@router.get("/analytics/inventory-value")
def get_inventory_value(
    db: Session = Depends(get_db)
):

    inventory_value = (
        db.query(
            func.sum(
                Product.price * Product.stock
            )
        )
        .scalar()
    )

    return {
        "inventory_value": inventory_value or 0
    }


# =====================================================
# LOW STOCK PRODUCTS
# =====================================================

@router.get(
    "/analytics/low-stock",
    response_model=List[ProductResponse]
)
def get_low_stock_products(
    db: Session = Depends(get_db)
):

    low_stock_products = (
        db.query(Product)
        .filter(Product.stock < 5)
        .all()
    )

    return low_stock_products


# =====================================================
# OUT OF STOCK PRODUCTS
# =====================================================

@router.get(
    "/analytics/out-of-stock",
    response_model=List[ProductResponse]
)
def get_out_of_stock_products(
    db: Session = Depends(get_db)
):

    out_of_stock_products = (
        db.query(Product)
        .filter(Product.stock == 0)
        .all()
    )

    return out_of_stock_products


# =====================================================
# INVENTORY VALUE BY VENDOR
# =====================================================

@router.get(
    "/analytics/inventory-value-by-vendor",
    response_model=List[VendorInventoryValueResponse]
)
def get_inventory_value_by_vendor(
    db: Session = Depends(get_db)
):

    inventory_by_vendor = (
        db.query(
            Vendor.name,
            func.sum(
                Product.price * Product.stock
            ).label("inventory_value")
        )
        .join(
            Product,
            Vendor.vendor_id == Product.vendor_id
        )
        .group_by(
            Vendor.name
        )
        .all()
    )

    return [
        {
            "vendor_name": row.name,
            "inventory_value": row.inventory_value or 0
        }
        for row in inventory_by_vendor
    ]


# =====================================================
# TOP VENDOR
# =====================================================

@router.get(
    "/analytics/top-vendor",
    response_model=VendorInventoryValueResponse
)
def get_top_vendor(
    db: Session = Depends(get_db)
):

    top_vendor = (
        db.query(
            Vendor.name,
            func.sum(
                Product.price * Product.stock
            ).label("inventory_value")
        )
        .join(
            Product,
            Vendor.vendor_id == Product.vendor_id
        )
        .group_by(
            Vendor.name
        )
        .order_by(
            desc("inventory_value")
        )
        .first()
    )

    if top_vendor is None:

        raise HTTPException(
            status_code=404,
            detail="No vendor data found."
        )

    return {
        "vendor_name": top_vendor.name,
        "inventory_value": top_vendor.inventory_value or 0
    }


# =====================================================
# VENDOR TOTAL SALES
# =====================================================

@router.get(
    "/analytics/vendor/{vendor_id}/sales"
)
def get_total_sales(
    vendor_id: int,
    db: Session = Depends(get_db)
):

    vendor = (
        db.query(Vendor)
        .filter(
            Vendor.vendor_id == vendor_id
        )
        .first()
    )

    if vendor is None:

        raise HTTPException(
            status_code=404,
            detail="Vendor not found"
        )

    total_sales = (
        db.query(
            func.sum(Transaction.quantity)
        )
        .join(
            Product,
            Product.product_id ==
            Transaction.product_id
        )
        .filter(
            Product.vendor_id == vendor_id
        )
        .scalar()
    )

    return {
        "vendor_id": vendor_id,
        "total_sales": total_sales or 0
    }


# =====================================================
# VENDOR TOTAL REVENUE
# =====================================================

@router.get(
    "/analytics/vendor/{vendor_id}/revenue"
)
def get_total_revenue(
    vendor_id: int,
    db: Session = Depends(get_db)
):

    vendor = (
        db.query(Vendor)
        .filter(
            Vendor.vendor_id == vendor_id
        )
        .first()
    )

    if vendor is None:

        raise HTTPException(
            status_code=404,
            detail="Vendor not found"
        )

    total_revenue = (
        db.query(
            func.sum(Transaction.total_amount)
        )
        .join(
            Product,
            Product.product_id ==
            Transaction.product_id
        )
        .filter(
            Product.vendor_id == vendor_id
        )
        .scalar()
    )

    return {
        "vendor_id": vendor_id,
        "total_revenue": total_revenue or 0
    }


# =====================================================
# CUSTOMER SEGMENTATION
# =====================================================
#
# Segmentation is based on:
#
# 1. Customer area
# 2. Total number of orders
# 3. Total amount spent
# 4. Average Order Value (AOV)
#
# AOV:
#       Total Spent / Number of Orders
#
# Segment:
#       AOV >= 5000  -> High Value
#       AOV >= 2000  -> Medium Value
#       AOV <  2000  -> Low Value
#
# =====================================================

@router.get(
    "/analytics/customer-segmentation",
    response_model=List[CustomerSegmentResponse]
)
def get_customer_segmentation(
    db: Session = Depends(get_db)
):

    results = (
        db.query(
            Customer.customer_id,

            Customer.name.label(
                "customer_name"
            ),

            Customer.area,

            func.count(
                Transaction.transaction_id
            ).label(
                "total_orders"
            ),

            func.sum(
                Transaction.total_amount
            ).label(
                "total_spent"
            ),

            (
                func.sum(
                    Transaction.total_amount
                )
                /
                func.count(
                    Transaction.transaction_id
                )
            ).label(
                "average_order_value"
            )
        )

        .join(
            Transaction,
            Customer.customer_id ==
            Transaction.customer_id
        )

        .group_by(
            Customer.customer_id,
            Customer.name,
            Customer.area
        )

        .all()
    )

    response = []

    for row in results:

        total_orders = int(
            row.total_orders or 0
        )

        total_spent = float(
            row.total_spent or 0
        )

        average_order_value = float(
            row.average_order_value or 0
        )

        # -----------------------------------------
        # CUSTOMER SEGMENT
        # -----------------------------------------

        if average_order_value >= 5000:

            segment = "High Value"

        elif average_order_value >= 2000:

            segment = "Medium Value"

        else:

            segment = "Low Value"

        response.append({

            "customer_id":
                row.customer_id,

            "customer_name":
                row.customer_name,

            "area":
                row.area,

            "total_orders":
                total_orders,

            "total_spent":
                total_spent,

            "average_order_value":
                average_order_value,

            "segment":
                segment
        })

    return response
@router.get("/analytics/recommendations/{category}")
def get_recommendations(
    category: str,
    db: Session = Depends(get_db)
):

    recommendations = (
        db.query(
            Product.product_id,
            Product.name,
            Product.category,
            func.sum(Transaction.quantity).label("total_sold")
        )
        .join(
            Transaction,
            Transaction.product_id == Product.product_id
        )
        .filter(
            Product.category == category
        )
        .group_by(
            Product.product_id,
            Product.name,
            Product.category
        )
        .order_by(
            desc("total_sold")
        )
        .limit(5)
        .all()
    )

    return [
        {
            "product_id": row.product_id,
            "product_name": row.name,
            "category": row.category,
            "total_sold": row.total_sold
        }
        for row in recommendations
    ]