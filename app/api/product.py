from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

from app.database import get_db
from app.models.product import Product
from app.models.vendor import Vendor
from app.schemas.product import ProductCreate, ProductResponse
from app.utils.security import oauth2_scheme

from app.utils.security import get_current_vendor

router = APIRouter()

@router.post("/products",response_model=ProductResponse)
def create_product(product: ProductCreate, db: Session = Depends(get_db)):
    vendor = (
    db.query(Vendor)
      .filter(Vendor.vendor_id == product.vendor_id)
      .first()
    )
    if vendor is None:
        raise HTTPException(
            status_code=404,
            detail="Vendor not found"
            )
    new_product=Product(
        vendor_id=product.vendor_id,
        name=product.name,
        description=product.description,
        price=product.price,
        stock=product.stock,
        category=product.category,
    )
    db.add(new_product)
    db.commit()
    db.refresh(new_product)        

    return new_product

@router.get("/products", response_model=List[ProductResponse])
def get_products(
    token: str = Depends(oauth2_scheme),
    db: Session = Depends(get_db)
):
    print("TOKEN =", token)

    products = db.query(Product).all()
    return products

@router.get("/products/{product_id}", response_model=ProductResponse)
def get_product(product_id: int, db: Session = Depends(get_db)):
    product = db.query(Product).filter(Product.product_id == product_id).first()

    if product is None:
        raise HTTPException(status_code=404, detail="Product not found")

    return product

@router.put("/products/{product_id}", response_model=ProductResponse)
def update_product(product_id: int,product: ProductCreate,db: Session = Depends(get_db)):

    vendor = (db.query(Vendor).filter(Vendor.vendor_id == product.vendor_id).first())

    if vendor is None:
        raise HTTPException(
            status_code=404,
            detail="Vendor not found"
            )

    existing_product = ( db.query(Product).filter(Product.product_id == product_id).first())

    if existing_product is None:
        raise HTTPException(
            status_code=404,
            detail="Product not found"
        )

    existing_product.vendor_id = product.vendor_id
    existing_product.name = product.name
    existing_product.description = product.description
    existing_product.category = product.category
    existing_product.price = product.price
    existing_product.stock = product.stock

    db.commit()
    db.refresh(existing_product)

    return existing_product

@router.delete("/products/{product_id}")
def delete_product(product_id: int,db: Session = Depends(get_db)):

    existing_product = ( db.query(Product).filter(Product.product_id == product_id).first())
    
    if existing_product is None:
        raise HTTPException(
            status_code=404,
            detail="Product not found"
        )

    db.delete(existing_product)
    db.commit()

    return{
        "message":"Product deleted successfully"
    }