from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

from app.database import get_db
from app.models.customer import Customer
from app.schemas.customers import (
    CustomerCreate,
    CustomerResponse
)

router = APIRouter()


# =====================================================
# CREATE CUSTOMER
# =====================================================

@router.post(
    "/customers",
    response_model=CustomerResponse
)
def create_customer(
    customer: CustomerCreate,
    db: Session = Depends(get_db)
):

    new_customer = Customer(
        name=customer.name,
        email=customer.email,
        phone=customer.phone,
        area=customer.area
    )

    db.add(new_customer)
    db.commit()
    db.refresh(new_customer)

    return new_customer


# =====================================================
# GET ALL CUSTOMERS
# =====================================================

@router.get(
    "/customers",
    response_model=List[CustomerResponse]
)
def get_customers(
    db: Session = Depends(get_db)
):

    customers = (
        db.query(Customer)
        .all()
    )

    return customers


# =====================================================
# GET SINGLE CUSTOMER
# =====================================================

@router.get(
    "/customers/{customer_id}",
    response_model=CustomerResponse
)
def get_customer(
    customer_id: int,
    db: Session = Depends(get_db)
):

    customer = (
        db.query(Customer)
        .filter(
            Customer.customer_id == customer_id
        )
        .first()
    )

    if customer is None:

        raise HTTPException(
            status_code=404,
            detail="Customer not found"
        )

    return customer


# =====================================================
# UPDATE CUSTOMER
# =====================================================

@router.put(
    "/customers/{customer_id}",
    response_model=CustomerResponse
)
def update_customer(
    customer_id: int,
    customer: CustomerCreate,
    db: Session = Depends(get_db)
):

    existing_customer = (
        db.query(Customer)
        .filter(
            Customer.customer_id == customer_id
        )
        .first()
    )

    if existing_customer is None:

        raise HTTPException(
            status_code=404,
            detail="Customer not found"
        )

    existing_customer.name = customer.name
    existing_customer.email = customer.email
    existing_customer.phone = customer.phone
    existing_customer.area = customer.area

    db.commit()
    db.refresh(existing_customer)

    return existing_customer


# =====================================================
# DELETE CUSTOMER
# =====================================================

@router.delete(
    "/customers/{customer_id}"
)
def delete_customer(
    customer_id: int,
    db: Session = Depends(get_db)
):

    customer = (
        db.query(Customer)
        .filter(
            Customer.customer_id == customer_id
        )
        .first()
    )

    if customer is None:

        raise HTTPException(
            status_code=404,
            detail="Customer not found"
        )

    db.delete(customer)
    db.commit()

    return {
        "message":
        "Customer deleted successfully"
    }