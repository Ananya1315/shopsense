from sqlalchemy.orm import Session
from fastapi import APIRouter, Depends, HTTPException
from fastapi.security import OAuth2PasswordRequestForm

from app.database import get_db
from app.models.vendor import Vendor
from app.schemas.vendor import VendorCreate, VendorResponse

from app.utils.security import (
    hash_password,
    verify_password,
    create_access_token,
    get_current_admin
)

router = APIRouter()


# -----------------------------------------
# CREATE VENDOR
# Admin creates vendor directly
# -----------------------------------------

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
        role="vendor",
        phone=vendor.phone,
        address=vendor.address,
        status="approved"
    )

    db.add(new_vendor)
    db.commit()
    db.refresh(new_vendor)

    return new_vendor


# -----------------------------------------
# GET ALL VENDORS
# Admin only
# -----------------------------------------

@router.get("/vendors", response_model=list[VendorResponse])
def get_vendors(
    db: Session = Depends(get_db),
    current_admin: Vendor = Depends(get_current_admin)
):
    vendors = db.query(Vendor).all()

    return vendors


# -----------------------------------------
# GET SINGLE VENDOR
# -----------------------------------------

@router.get("/vendors/{vendor_id}", response_model=VendorResponse)
def get_vendor(
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

    return vendor


# -----------------------------------------
# APPROVE VENDOR
# Admin only
# -----------------------------------------

@router.put(
    "/vendors/{vendor_id}/approve",
    response_model=VendorResponse
)
def approve_vendor(
    vendor_id: int,
    db: Session = Depends(get_db),
    current_admin: Vendor = Depends(get_current_admin)
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

    vendor.status = "approved"

    db.commit()
    db.refresh(vendor)

    return vendor


# -----------------------------------------
# REJECT VENDOR
# Admin only
# -----------------------------------------

@router.put(
    "/vendors/{vendor_id}/reject",
    response_model=VendorResponse
)
def reject_vendor(
    vendor_id: int,
    db: Session = Depends(get_db),
    current_admin: Vendor = Depends(get_current_admin)
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

    vendor.status = "rejected"

    db.commit()
    db.refresh(vendor)

    return vendor


# -----------------------------------------
# LOGIN
# -----------------------------------------

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

    if not verify_password(
        form_data.password,
        vendor.password
    ):
        raise HTTPException(
            status_code=401,
            detail="Invalid email or password"
        )

    # Pending/rejected vendors cannot login
    if vendor.status != "approved":
        raise HTTPException(
            status_code=403,
            detail=f"Account is {vendor.status}. Admin approval required."
        )

    access_token = create_access_token(
        {
            "sub": vendor.email,
            "role": vendor.role
        }
    )

    return {
        "access_token": access_token,
        "token_type": "bearer"
    }


# -----------------------------------------
# UPDATE VENDOR
# -----------------------------------------

@router.put(
    "/vendor/{vendor_id}",
    response_model=VendorResponse
)
def update_vendor(
    vendor_id: int,
    vendor: VendorCreate,
    db: Session = Depends(get_db),
    current_admin: Vendor = Depends(get_current_admin)
):

    existing_vendor = (
        db.query(Vendor)
        .filter(Vendor.vendor_id == vendor_id)
        .first()
    )

    if existing_vendor is None:
        raise HTTPException(
            status_code=404,
            detail="Vendor not found"
        )

    existing_vendor.name = vendor.name
    existing_vendor.email = vendor.email
    existing_vendor.phone = vendor.phone
    existing_vendor.address = vendor.address

    db.commit()
    db.refresh(existing_vendor)

    return existing_vendor