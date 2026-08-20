from sqlalchemy.orm import Session

from fastapi import (
    APIRouter,
    Depends,
    HTTPException
)

from app.database import get_db

from app.models.product import Product
from app.models.vendor import Vendor

from app.schemas.product import (
    ProductCreate,
    ProductResponse,
    VendorProductCreate,
    VendorProductUpdate,
    StockUpdate
)

from app.utils.security import (
    get_current_admin,
    get_current_vendor
)


router = APIRouter()


# =====================================================
# ADMIN / GENERAL PRODUCT LIST
# =====================================================

@router.get(
    "/products",
    response_model=list[ProductResponse]
)
def get_products(
    db: Session = Depends(get_db)
):

    products = (
        db.query(Product)
        .all()
    )

    return products


# =====================================================
# ADMIN CREATE PRODUCT
# =====================================================

@router.post(
    "/products",
    response_model=ProductResponse
)
def create_product(
    product: ProductCreate,
    db: Session = Depends(get_db),
    current_admin: Vendor = Depends(get_current_admin)
):

    vendor = (
        db.query(Vendor)
        .filter(
            Vendor.vendor_id == product.vendor_id
        )
        .first()
    )

    if vendor is None:

        raise HTTPException(
            status_code=404,
            detail="Vendor not found"
        )

    new_product = Product(
        vendor_id=product.vendor_id,
        name=product.name,
        description=product.description,
        seo_tags=product.seo_tags,
        seo_keywords=product.seo_keywords,
        price=product.price,
        stock=product.stock,
        category=product.category
    )

    db.add(new_product)
    db.commit()
    db.refresh(new_product)

    return new_product


# =====================================================
# ADMIN GET SINGLE PRODUCT
# =====================================================

@router.get(
    "/products/{product_id}",
    response_model=ProductResponse
)
def get_product(
    product_id: int,
    db: Session = Depends(get_db)
):

    product = (
        db.query(Product)
        .filter(
            Product.product_id == product_id
        )
        .first()
    )

    if product is None:

        raise HTTPException(
            status_code=404,
            detail="Product not found"
        )

    return product


# =====================================================
# VENDOR - GET OWN PRODUCTS
# =====================================================

@router.get(
    "/vendor/products",
    response_model=list[ProductResponse]
)
def get_my_products(
    db: Session = Depends(get_db),
    current_vendor: Vendor = Depends(get_current_vendor)
):

    products = (
        db.query(Product)
        .filter(
            Product.vendor_id ==
            current_vendor.vendor_id
        )
        .all()
    )

    return products


# =====================================================
# VENDOR - CREATE PRODUCT
# =====================================================

@router.post(
    "/vendor/products",
    response_model=ProductResponse
)
def create_vendor_product(
    product: VendorProductCreate,
    db: Session = Depends(get_db),
    current_vendor: Vendor = Depends(get_current_vendor)
):

    new_product = Product(

        # IMPORTANT:
        # vendor_id comes from JWT,
        # NOT from frontend.
        vendor_id=current_vendor.vendor_id,

        name=product.name,
        description=product.description,
        seo_tags=product.seo_tags,
        seo_keywords=product.seo_keywords,
        price=product.price,
        stock=product.stock,
        category=product.category
    )

    db.add(new_product)

    db.commit()

    db.refresh(new_product)

    return new_product


# =====================================================
# VENDOR - UPDATE OWN PRODUCT
# =====================================================

@router.put(
    "/vendor/products/{product_id}",
    response_model=ProductResponse
)
def update_vendor_product(
    product_id: int,
    product_data: VendorProductUpdate,
    db: Session = Depends(get_db),
    current_vendor: Vendor = Depends(get_current_vendor)
):

    product = (
        db.query(Product)
        .filter(
            Product.product_id == product_id,
            Product.vendor_id ==
            current_vendor.vendor_id
        )
        .first()
    )

    if product is None:

        raise HTTPException(
            status_code=404,
            detail="Product not found or access denied"
        )

    product.name = product_data.name
    product.description = product_data.description
    product.seo_tags = product_data.seo_tags
    product.seo_keywords = product_data.seo_keywords
    product.price = product_data.price
    product.stock = product_data.stock
    product.category = product_data.category

    db.commit()

    db.refresh(product)

    return product


# =====================================================
# VENDOR - UPDATE STOCK
# =====================================================

@router.put(
    "/vendor/products/{product_id}/stock",
    response_model=ProductResponse
)
def update_product_stock(
    product_id: int,
    stock_data: StockUpdate,
    db: Session = Depends(get_db),
    current_vendor: Vendor = Depends(get_current_vendor)
):

    if stock_data.stock < 0:

        raise HTTPException(
            status_code=400,
            detail="Stock cannot be negative"
        )

    product = (
        db.query(Product)
        .filter(
            Product.product_id == product_id,
            Product.vendor_id ==
            current_vendor.vendor_id
        )
        .first()
    )

    if product is None:

        raise HTTPException(
            status_code=404,
            detail="Product not found or access denied"
        )

    product.stock = stock_data.stock

    db.commit()

    db.refresh(product)

    return product


# =====================================================
# VENDOR - DELETE OWN PRODUCT
# =====================================================

@router.delete(
    "/vendor/products/{product_id}"
)
def delete_vendor_product(
    product_id: int,
    db: Session = Depends(get_db),
    current_vendor: Vendor = Depends(get_current_vendor)
):

    product = (
        db.query(Product)
        .filter(
            Product.product_id == product_id,
            Product.vendor_id ==
            current_vendor.vendor_id
        )
        .first()
    )

    if product is None:

        raise HTTPException(
            status_code=404,
            detail="Product not found or access denied"
        )

    db.delete(product)

    db.commit()

    return {
        "message": "Product deleted successfully"
    }