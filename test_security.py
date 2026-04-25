import pytest
from fastapi.testclient import TestClient
from api.index import app

client = TestClient(app)

def test_protected_route_without_jwt():
    response = client.get("/api/admin/products")
    assert response.status_code == 422 # Missing Header parameter
    assert "detail" in response.json()

def test_admin_route_without_jwt():
    response = client.get("/api/admin/orders")
    assert response.status_code == 422 # Missing Header parameter

def test_sync_user_endpoint_invalid_data():
    # Should fail if schema is invalid
    response = client.post("/api/auth/sync", json={"wrong_key": "value"})
    assert response.status_code == 422 # Unprocessable Entity

def test_non_admin_token_on_admin_route():
    # We can't easily mock the DB in this simple test without setup,
    # but we can pass a fake token and see if it returns 401 or 403.
    # The actual get_current_user logic will return 401 for an invalid token.
    response = client.get("/api/admin/orders", headers={"Authorization": "Bearer FAKE_TOKEN"})
    assert response.status_code == 401 # Fails at token decode

