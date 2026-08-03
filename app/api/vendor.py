from sqlalchemy.orm import Session
from fastapi import APIRouter, Depends, HTTPException

from app.database import get_db
from app.models.vendor import Vendor
from app.schemas.vendor import VendorCreate, VendorResponse

from app.utils.security import hash_password
from app.schemas.vendor import VendorLogin
from app.utils.security import verify_password
from app.utils.security import create_access_token


router = APIRouter()

@router.post("/vendors", response_model=VendorResponse)
def create_vendor(vendor: VendorCreate, db: Session = Depends(get_db)):
    new_vendor = Vendor(
        name=vendor.name,
        email=vendor.email,
        password=hash_password(vendor.password),
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
def login_vendor(login_data: VendorLogin, db: Session = Depends(get_db)):

    vendor = (
        db.query(Vendor)
        .filter(Vendor.email == login_data.email)
        .first()
    )

    if vendor is None:
        raise HTTPException(
            status_code=401,
            detail="Invalid email or password"
        )
    
    if not verify_password(login_data.password, vendor.password):
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
