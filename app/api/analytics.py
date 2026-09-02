from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import StreamingResponse

from sqlalchemy.orm import Session
from sqlalchemy import func, desc
from typing import List

import csv
import io

from app.database import get_db

from app.models.vendor import Vendor
from app.models.product import Product
from app.models.transaction import Transaction
from app.models.customer import Customer
from app.utils.security import get_current_vendor
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


# =====================================================
# SALES BY PRODUCT
# =====================================================

@router.get("/analytics/sales-by-product")
def get_sales_by_product(
    db: Session = Depends(get_db)
):

    results = (
        db.query(
            Product.name.label("product_name"),
            func.sum(Transaction.quantity).label("total_sold")
        )
        .join(
            Transaction,
            Transaction.product_id == Product.product_id
        )
        .group_by(
            Product.product_id,
            Product.name
        )
        .order_by(
            desc("total_sold")
        )
        .all()
    )

    return [
        {
            "product_name": row.product_name,
            "total_sold": row.total_sold or 0
        }
        for row in results
    ]


# =====================================================
# REVENUE BY PRODUCT
# =====================================================

@router.get("/analytics/revenue-by-product")
def get_revenue_by_product(
    db: Session = Depends(get_db)
):

    results = (
        db.query(
            Product.name.label("product_name"),
            func.sum(Transaction.total_amount).label("total_revenue")
        )
        .join(
            Transaction,
            Transaction.product_id == Product.product_id
        )
        .group_by(
            Product.product_id,
            Product.name
        )
        .order_by(
            desc("total_revenue")
        )
        .all()
    )

    return [
        {
            "product_name": row.product_name,
            "total_revenue": row.total_revenue or 0
        }
        for row in results
    ]

# =====================================================
# VENDOR - SALES BY PRODUCT
# =====================================================

@router.get("/analytics/vendor/sales-by-product")
def get_vendor_sales_by_product(
    db: Session = Depends(get_db),
    current_vendor: Vendor = Depends(get_current_vendor)
):

    results = (
        db.query(
            Product.name.label("product_name"),
            func.sum(Transaction.quantity).label("total_sold")
        )
        .join(
            Transaction,
            Transaction.product_id == Product.product_id
        )
        .filter(
            Product.vendor_id == current_vendor.vendor_id
        )
        .group_by(
            Product.product_id,
            Product.name
        )
        .order_by(
            desc("total_sold")
        )
        .all()
    )

    return [
        {
            "product_name": row.product_name,
            "total_sold": row.total_sold or 0
        }
        for row in results
    ]


# =====================================================
# VENDOR - REVENUE BY PRODUCT
# =====================================================

@router.get("/analytics/vendor/revenue-by-product")
def get_vendor_revenue_by_product(
    db: Session = Depends(get_db),
    current_vendor: Vendor = Depends(get_current_vendor)
):

    results = (
        db.query(
            Product.name.label("product_name"),
            func.sum(Transaction.total_amount).label("total_revenue")
        )
        .join(
            Transaction,
            Transaction.product_id == Product.product_id
        )
        .filter(
            Product.vendor_id == current_vendor.vendor_id
        )
        .group_by(
            Product.product_id,
            Product.name
        )
        .order_by(
            desc("total_revenue")
        )
        .all()
    )

    return [
        {
            "product_name": row.product_name,
            "total_revenue": row.total_revenue or 0
        }
        for row in results
    ]

# =====================================================
# VENDOR - MARKETPLACE BENCHMARKING
# =====================================================

@router.get("/analytics/vendor/benchmark")
def get_vendor_benchmark(
    db: Session = Depends(get_db),
    current_vendor: Vendor = Depends(get_current_vendor)
):

    # -------------------------------------------------
    # CURRENT VENDOR SALES
    # -------------------------------------------------

    vendor_sales = (
        db.query(
            func.sum(Transaction.quantity)
        )
        .join(
            Product,
            Product.product_id == Transaction.product_id
        )
        .filter(
            Product.vendor_id == current_vendor.vendor_id
        )
        .scalar()
    ) or 0


    # -------------------------------------------------
    # CURRENT VENDOR REVENUE
    # -------------------------------------------------

    vendor_revenue = (
        db.query(
            func.sum(Transaction.total_amount)
        )
        .join(
            Product,
            Product.product_id == Transaction.product_id
        )
        .filter(
            Product.vendor_id == current_vendor.vendor_id
        )
        .scalar()
    ) or 0


    # -------------------------------------------------
    # SALES OF EACH VENDOR
    # -------------------------------------------------

    vendor_sales_data = (
        db.query(
            Vendor.vendor_id,
            func.coalesce(
                func.sum(Transaction.quantity),
                0
            ).label("total_sales")
        )
        .outerjoin(
            Product,
            Product.vendor_id == Vendor.vendor_id
        )
        .outerjoin(
            Transaction,
            Transaction.product_id == Product.product_id
        )
        .group_by(
            Vendor.vendor_id
        )
        .all()
    )


    # -------------------------------------------------
    # REVENUE OF EACH VENDOR
    # -------------------------------------------------

    vendor_revenue_data = (
        db.query(
            Vendor.vendor_id,
            func.coalesce(
                func.sum(Transaction.total_amount),
                0
            ).label("total_revenue")
        )
        .outerjoin(
            Product,
            Product.vendor_id == Vendor.vendor_id
        )
        .outerjoin(
            Transaction,
            Transaction.product_id == Product.product_id
        )
        .group_by(
            Vendor.vendor_id
        )
        .all()
    )


    # -------------------------------------------------
    # MARKETPLACE AVERAGES
    # -------------------------------------------------

    if vendor_sales_data:

        marketplace_average_sales = (
            sum(
                row.total_sales
                for row in vendor_sales_data
            )
            / len(vendor_sales_data)
        )

    else:

        marketplace_average_sales = 0


    if vendor_revenue_data:

        marketplace_average_revenue = (
            sum(
                row.total_revenue
                for row in vendor_revenue_data
            )
            / len(vendor_revenue_data)
        )

    else:

        marketplace_average_revenue = 0


    # -------------------------------------------------
    # PERFORMANCE %
    #
    # Positive = above marketplace average
    # Negative = below marketplace average
    # -------------------------------------------------

    if marketplace_average_sales > 0:

        sales_performance = (
            (
                vendor_sales -
                marketplace_average_sales
            )
            /
            marketplace_average_sales
        ) * 100

    else:

        sales_performance = 0


    if marketplace_average_revenue > 0:

        revenue_performance = (
            (
                float(vendor_revenue) -
                float(marketplace_average_revenue)
            )
            /
            float(marketplace_average_revenue)
        ) * 100

    else:

        revenue_performance = 0


    # -------------------------------------------------
    # RESPONSE
    # -------------------------------------------------

    return {

        "vendor_id":
            current_vendor.vendor_id,

        "vendor_name":
            current_vendor.name,

        "vendor_total_sales":
            vendor_sales,

        "marketplace_average_sales":
            round(
                marketplace_average_sales,
                2
            ),

        "sales_performance_percentage":
            round(
                sales_performance,
                2
            ),

        "vendor_total_revenue":
            float(vendor_revenue),

        "marketplace_average_revenue":
            round(
                float(marketplace_average_revenue),
                2
            ),

        "revenue_performance_percentage":
            round(
                revenue_performance,
                2
            )
    }


# =====================================================
# VENDOR - EXPORT ANALYTICS CSV
# =====================================================

@router.get("/analytics/vendor/export-csv")
def export_vendor_analytics_csv(
    db: Session = Depends(get_db),
    current_vendor: Vendor = Depends(get_current_vendor)
):

    results = (
        db.query(
            Product.name.label("product_name"),
            func.coalesce(
                func.sum(Transaction.quantity),
                0
            ).label("total_sold"),
            func.coalesce(
                func.sum(Transaction.total_amount),
                0
            ).label("total_revenue")
        )
        .outerjoin(
            Transaction,
            Transaction.product_id == Product.product_id
        )
        .filter(
            Product.vendor_id == current_vendor.vendor_id
        )
        .group_by(
            Product.product_id,
            Product.name
        )
        .order_by(
            desc("total_sold")
        )
        .all()
    )

    # -----------------------------------------
    # CREATE CSV IN MEMORY
    # -----------------------------------------

    output = io.StringIO()

    writer = csv.writer(output)

    writer.writerow([
        "Product",
        "Units Sold",
        "Revenue"
    ])

    for row in results:

        writer.writerow([
            row.product_name,
            row.total_sold or 0,
            float(row.total_revenue or 0)
        ])

    # -----------------------------------------
    # PREPARE FILE
    # -----------------------------------------

    output.seek(0)

    filename = (
        f"{current_vendor.name}_analytics.csv"
    )

    return StreamingResponse(
        iter([output.getvalue()]),
        media_type="text/csv",
        headers={
            "Content-Disposition":
                f'attachment; filename="{filename}"'
        }
    )