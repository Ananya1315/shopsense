from app.models.vendor import Vendor
from app.utils.security import hash_password


def create_test_vendor(db):
    vendor = Vendor(
        name="Transaction Test Vendor",
        email="transaction_vendor@test.com",
        password=hash_password("test123"),
        role="vendor",
        phone="9876543221",
        address="Bangalore",
        status="approved"
    )

    db.add(vendor)
    db.commit()
    db.refresh(vendor)

    return vendor


def get_vendor_headers(client, db):
    vendor = create_test_vendor(db)

    response = client.post(
        "/login",
        data={
            "username": vendor.email,
            "password": "test123"
        }
    )

    assert response.status_code == 200

    token = response.json()["access_token"]

    return {
        "Authorization": f"Bearer {token}"
    }


def create_test_customer(client):
    response = client.post(
        "/customers",
        json={
            "name": "Transaction Test Customer",
            "email": "transaction_customer@test.com",
            "phone": "9876543220",
            "area": "Bangalore",
            "password": "test123"
        }
    )

    assert response.status_code == 200

    return response.json()["customer_id"]


def create_test_product(client, headers, stock=10):
    response = client.post(
        "/vendor/products",
        json={
            "name": "Transaction Test Product",
            "description": "Product for transaction testing",
            "price": 1000,
            "stock": stock,
            "category": "Testing",
            "image_url": None
        },
        headers=headers
    )

    assert response.status_code in [200, 201]

    return response.json()["product_id"]


def test_create_transaction(client, db):
    customer_id = create_test_customer(client)

    headers = get_vendor_headers(
        client,
        db
    )

    product_id = create_test_product(
        client,
        headers,
        stock=10
    )

    response = client.post(
        "/transactions",
        json={
            "customer_id": customer_id,
            "product_id": product_id,
            "quantity": 2
        }
    )

    assert response.status_code == 200

    data = response.json()

    assert data["customer_id"] == customer_id
    assert data["product_id"] == product_id
    assert data["quantity"] == 2

    # Product price = 1000
    # Quantity = 2
    # Total = 2000

    assert data["total_amount"] == 2000

    assert data["purchase_date"] is not None


def test_transaction_reduces_stock(client, db):
    customer_id = create_test_customer(client)

    headers = get_vendor_headers(
        client,
        db
    )

    product_id = create_test_product(
        client,
        headers,
        stock=10
    )

    response = client.post(
        "/transactions",
        json={
            "customer_id": customer_id,
            "product_id": product_id,
            "quantity": 3
        }
    )

    assert response.status_code == 200

    product_response = client.get(
        f"/products/{product_id}"
    )

    assert product_response.status_code == 200

    product = product_response.json()

    # 10 - 3 = 7

    assert product["stock"] == 7


def test_insufficient_stock_rejected(client, db):
    customer_id = create_test_customer(client)

    headers = get_vendor_headers(
        client,
        db
    )

    product_id = create_test_product(
        client,
        headers,
        stock=2
    )

    response = client.post(
        "/transactions",
        json={
            "customer_id": customer_id,
            "product_id": product_id,
            "quantity": 5
        }
    )

    assert response.status_code == 400

    assert (
        response.json()["detail"]
        == "Insufficient stock. Only 2 item(s) available."
    )


def test_invalid_customer_rejected(client, db):
    headers = get_vendor_headers(
        client,
        db
    )

    product_id = create_test_product(
        client,
        headers,
        stock=10
    )

    response = client.post(
        "/transactions",
        json={
            "customer_id": 999999,
            "product_id": product_id,
            "quantity": 1
        }
    )

    assert response.status_code == 404

    assert (
        response.json()["detail"]
        == "Customer not found"
    )


def test_invalid_product_rejected(client):
    customer_id = create_test_customer(client)

    response = client.post(
        "/transactions",
        json={
            "customer_id": customer_id,
            "product_id": 999999,
            "quantity": 1
        }
    )

    assert response.status_code == 404

    assert (
        response.json()["detail"]
        == "Product not found"
    )


def test_invalid_quantity_rejected(client, db):
    customer_id = create_test_customer(client)

    headers = get_vendor_headers(
        client,
        db
    )

    product_id = create_test_product(
        client,
        headers,
        stock=10
    )

    response = client.post(
        "/transactions",
        json={
            "customer_id": customer_id,
            "product_id": product_id,
            "quantity": 0
        }
    )

    assert response.status_code == 400

    assert (
        response.json()["detail"]
        == "Quantity must be greater than 0"
    )