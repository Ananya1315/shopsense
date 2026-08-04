from sqlalchemy.orm import Session
from fastapi import APIRouter, Depends, HTTPException
from fastapi.security import OAuth2PasswordRequestForm

from app.database import get_db
from app.models.vendor import Vendor
from app.schemas.vendor import VendorCreate, VendorResponse, VendorLogin

from app.utils.security import (
    hash_password,
    verify_password,
    create_access_token,
    get_current_admin
)

router = APIRouter()


@router.post("/vendors", response_model=VendorResponse)
def create_vendor(
    vendor: VendorCreate,
    db: Session = Depends(get_db),
   current_admin: Vendor = Depends(get_current_admin)
):
    new_vendor = Vendor(
        name=vendor.name,
        email=vendor.email,
        password=hash_password(vendor.password),
        role=vendor.role,
        phone=vendor.phone,
        address=vendor.address
    )

    db.add(new_vendor)
    db.commit()
    db.refresh(new_vendor)

    return new_vendor


@router.get("/vendors/{vendor_id}", response_model=VendorResponse)
def get_vendor(vendor_id: int, db: Session = Depends(get_db)):
    vendor = db.query(Vendor).filter(Vendor.vendor_id == vendor_id).first()

    if vendor is None:
        raise HTTPException(status_code=404, detail="Vendor not found")

    return vendor


@router.post("/login")
def login_vendor(
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: Session = Depends(get_db)
):

    vendor = (
        db.query(Vendor)
        .filter(Vendor.email == form_data.username)
        .first()
    )

    if vendor is None:
        raise HTTPException(
            status_code=401,
            detail="Invalid email or password"
        )

    if not verify_password(form_data.password, vendor.password):
        raise HTTPException(
            status_code=401,
            detail="Invalid email or password"
        )

    access_token = create_access_token(
        {
            "sub": vendor.email
        }
    )

    return {
        "access_token": access_token,
        "token_type": "bearer"
    }