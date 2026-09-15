from app.models.vendor import Vendor
from app.utils.security import hash_password


def create_test_vendor(db):
    vendor = Vendor(
        name="Product Test Vendor",
        email="product_vendor@test.com",
        password=hash_password("test123"),
        role="vendor",
        phone="9876543200",
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
    }, vendor


def create_product(client, headers, name="Test Product", stock=10):
    response = client.post(
        "/vendor/products",
        json={
            "name": name,
            "description": "Product for unit testing",
            "seo_tags": "test, product",
            "seo_keywords": "test product",
            "price": 1000,
            "stock": stock,
            "category": "Testing",
            "image_url": "https://example.com/product.jpg"
        },
        headers=headers
    )

    assert response.status_code in [200, 201]

    return response.json()


def test_create_product(client, db):
    headers, vendor = get_vendor_headers(client, db)

    product = create_product(
        client,
        headers,
        name="Test Laptop",
        stock=10
    )

    assert product["name"] == "Test Laptop"
    assert product["vendor_id"] == vendor.vendor_id
    assert product["price"] == 1000
    assert product["stock"] == 10
    assert product["category"] == "Testing"
    assert product["image_url"] == "https://example.com/product.jpg"


def test_get_product(client, db):
    headers, vendor = get_vendor_headers(client, db)

    product = create_product(
        client,
        headers,
        name="Test Phone",
        stock=20
    )

    product_id = product["product_id"]

    response = client.get(
        f"/products/{product_id}"
    )

    assert response.status_code == 200

    data = response.json()

    assert data["product_id"] == product_id
    assert data["name"] == "Test Phone"
    assert data["price"] == 1000
    assert data["stock"] == 20


def test_update_product(client, db):
    headers, vendor = get_vendor_headers(client, db)

    product = create_product(
        client,
        headers,
        name="Old Product",
        stock=5
    )

    product_id = product["product_id"]

    response = client.put(
        f"/vendor/products/{product_id}",
        json={
            "name": "Updated Product",
            "description": "Updated description",
            "seo_tags": "updated",
            "seo_keywords": "updated product",
            "price": 1500,
            "stock": 15,
            "category": "Updated Category",
            "image_url": "https://example.com/updated.jpg"
        },
        headers=headers
    )

    assert response.status_code == 200

    data = response.json()

    assert data["name"] == "Updated Product"
    assert data["price"] == 1500
    assert data["stock"] == 15
    assert data["category"] == "Updated Category"
    assert data["image_url"] == "https://example.com/updated.jpg"


def test_product_validation(client, db):
    headers, vendor = get_vendor_headers(client, db)

    response = client.post(
        "/vendor/products",
        json={
            "name": "Invalid Product",
            "description": "Invalid price test",
            "price": "not-a-number",
            "stock": 10,
            "category": "Testing"
        },
        headers=headers
    )

    assert response.status_code == 422


def test_product_requires_authentication(client):
    response = client.post(
        "/vendor/products",
        json={
            "name": "Unauthorized Product",
            "description": "Should fail",
            "price": 1000,
            "stock": 10,
            "category": "Testing"
        }
    )

    assert response.status_code == 401