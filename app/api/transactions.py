from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

from app.database import get_db

from app.models.transaction import Transaction
from app.models.customer import Customer
from app.models.product import Product

from app.schemas.transactions import (
    TransactionCreate,
    TransactionResponse
)

router = APIRouter()


# =========================================================
# CREATE TRANSACTION
# =========================================================

@router.post(
    "/transactions",
    response_model=TransactionResponse
)
def create_transaction(
    transaction: TransactionCreate,
    db: Session = Depends(get_db)
):

    # -----------------------------------------------------
    # CHECK CUSTOMER
    # -----------------------------------------------------

    customer = (
        db.query(Customer)
        .filter(
            Customer.customer_id ==
            transaction.customer_id
        )
        .first()
    )

    if customer is None:

        raise HTTPException(
            status_code=404,
            detail="Customer not found"
        )


    # -----------------------------------------------------
    # CHECK PRODUCT
    # -----------------------------------------------------

    product = (
        db.query(Product)
        .filter(
            Product.product_id ==
            transaction.product_id
        )
        .first()
    )

    if product is None:

        raise HTTPException(
            status_code=404,
            detail="Product not found"
        )


    # -----------------------------------------------------
    # VALIDATE QUANTITY
    # -----------------------------------------------------

    if transaction.quantity <= 0:

        raise HTTPException(
            status_code=400,
            detail="Quantity must be greater than 0"
        )


    # -----------------------------------------------------
    # CHECK STOCK
    # -----------------------------------------------------

    if product.stock < transaction.quantity:

        raise HTTPException(
            status_code=400,
            detail=(
                f"Insufficient stock. "
                f"Only {product.stock} "
                f"item(s) available."
            )
        )


    # -----------------------------------------------------
    # CALCULATE TOTAL ON SERVER
    # -----------------------------------------------------

    total_amount = (
        float(product.price) *
        transaction.quantity
    )


    # -----------------------------------------------------
    # CREATE TRANSACTION
    # -----------------------------------------------------

    new_transaction = Transaction(

        customer_id=transaction.customer_id,

        product_id=transaction.product_id,

        quantity=transaction.quantity,

        total_amount=total_amount
    )

    db.add(new_transaction)


    # -----------------------------------------------------
    # REDUCE STOCK
    # -----------------------------------------------------

    product.stock -= transaction.quantity


    # -----------------------------------------------------
    # SAVE
    # -----------------------------------------------------

    db.commit()

    db.refresh(new_transaction)


    return new_transaction


# =========================================================
# GET ALL TRANSACTIONS
# =========================================================

@router.get(
    "/transactions",
    response_model=List[TransactionResponse]
)
def get_transactions(
    db: Session = Depends(get_db)
):

    return (
        db.query(Transaction)
        .order_by(
            Transaction.purchase_date.desc()
        )
        .all()
    )


# =========================================================
# GET CUSTOMER TRANSACTIONS
# =========================================================

@router.get(
    "/transactions/customer/{customer_id}",
    response_model=List[TransactionResponse]
)
def get_customer_transactions(
    customer_id: int,
    db: Session = Depends(get_db)
):

    # -----------------------------------------------------
    # CHECK CUSTOMER
    # -----------------------------------------------------

    customer = (
        db.query(Customer)
        .filter(
            Customer.customer_id ==
            customer_id
        )
        .first()
    )

    if customer is None:

        raise HTTPException(
            status_code=404,
            detail="Customer not found"
        )


    # -----------------------------------------------------
    # GET CUSTOMER ORDERS
    # -----------------------------------------------------

    transactions = (
        db.query(Transaction)
        .filter(
            Transaction.customer_id ==
            customer_id
        )
        .order_by(
            Transaction.purchase_date.desc()
        )
        .all()
    )


    return transactions


# =========================================================
# GET SINGLE TRANSACTION
# =========================================================

@router.get(
    "/transactions/{transaction_id}",
    response_model=TransactionResponse
)
def get_transaction(
    transaction_id: int,
    db: Session = Depends(get_db)
):

    transaction = (
        db.query(Transaction)
        .filter(
            Transaction.transaction_id ==
            transaction_id
        )
        .first()
    )

    if transaction is None:

        raise HTTPException(
            status_code=404,
            detail="Transaction not found"
        )

    return transaction


# =========================================================
# UPDATE TRANSACTION
# =========================================================

@router.put(
    "/transactions/{transaction_id}",
    response_model=TransactionResponse
)
def update_transaction(
    transaction_id: int,
    transaction: TransactionCreate,
    db: Session = Depends(get_db)
):

    existing_transaction = (
        db.query(Transaction)
        .filter(
            Transaction.transaction_id ==
            transaction_id
        )
        .first()
    )

    if existing_transaction is None:

        raise HTTPException(
            status_code=404,
            detail="Transaction not found"
        )


    # -----------------------------------------------------
    # CHECK CUSTOMER
    # -----------------------------------------------------

    customer = (
        db.query(Customer)
        .filter(
            Customer.customer_id ==
            transaction.customer_id
        )
        .first()
    )

    if customer is None:

        raise HTTPException(
            status_code=404,
            detail="Customer not found"
        )


    # -----------------------------------------------------
    # CHECK PRODUCT
    # -----------------------------------------------------

    product = (
        db.query(Product)
        .filter(
            Product.product_id ==
            transaction.product_id
        )
        .first()
    )

    if product is None:

        raise HTTPException(
            status_code=404,
            detail="Product not found"
        )


    # -----------------------------------------------------
    # VALIDATE QUANTITY
    # -----------------------------------------------------

    if transaction.quantity <= 0:

        raise HTTPException(
            status_code=400,
            detail="Quantity must be greater than 0"
        )


    # -----------------------------------------------------
    # CALCULATE TOTAL
    # -----------------------------------------------------

    total_amount = (
        float(product.price) *
        transaction.quantity
    )


    # -----------------------------------------------------
    # UPDATE
    # -----------------------------------------------------

    existing_transaction.customer_id = (
        transaction.customer_id
    )

    existing_transaction.product_id = (
        transaction.product_id
    )

    existing_transaction.quantity = (
        transaction.quantity
    )

    existing_transaction.total_amount = (
        total_amount
    )


    db.commit()

    db.refresh(existing_transaction)


    return existing_transaction


# =========================================================
# DELETE TRANSACTION
# =========================================================

@router.delete(
    "/transactions/{transaction_id}"
)
def delete_transaction(
    transaction_id: int,
    db: Session = Depends(get_db)
):

    transaction = (
        db.query(Transaction)
        .filter(
            Transaction.transaction_id ==
            transaction_id
        )
        .first()
    )

    if transaction is None:

        raise HTTPException(
            status_code=404,
            detail="Transaction not found"
        )


    db.delete(transaction)

    db.commit()


    return {
        "message":
            "Transaction deleted successfully"
    }