def test_create_customer(client):
    response = client.post(
        "/customers",
        json={
            "name": "Test Customer",
            "email": "test_customer_unit@test.com",
            "phone": "9876543210",
            "area": "Bangalore",
            "password": "test123"
        }
    )

    assert response.status_code == 200

    data = response.json()

    assert data["name"] == "Test Customer"
    assert data["email"] == "test_customer_unit@test.com"
    assert data["phone"] == "9876543210"
    assert data["area"] == "Bangalore"


def test_duplicate_customer_rejected(client):
    customer = {
        "name": "Duplicate Customer",
        "email": "duplicate_unit@test.com",
        "phone": "9876543211",
        "area": "Hyderabad",
        "password": "test123"
    }

    # First registration
    first_response = client.post(
        "/customers",
        json=customer
    )

    assert first_response.status_code == 200

    # Second registration with same email
    second_response = client.post(
        "/customers",
        json=customer
    )

    assert second_response.status_code == 400

    assert (
        second_response.json()["detail"]
        == "Customer with this email already exists"
    )


def test_get_customer(client):
    # Create customer
    response = client.post(
        "/customers",
        json={
            "name": "Get Customer",
            "email": "get_customer_unit@test.com",
            "phone": "9876543212",
            "area": "Mumbai",
            "password": "test123"
        }
    )

    assert response.status_code == 200

    customer_id = response.json()["customer_id"]

    # Get customer
    response = client.get(
        f"/customers/{customer_id}"
    )

    assert response.status_code == 200

    data = response.json()

    assert data["customer_id"] == customer_id
    assert data["email"] == "get_customer_unit@test.com"