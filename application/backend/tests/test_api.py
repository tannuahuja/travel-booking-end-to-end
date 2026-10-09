from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)


def test_health():
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json() == {"status": "ok"}


def test_invalid_seat_count_is_rejected():
    response = client.post(
        "/api/bookings",
        json={"customer_name": "Tannu", "destination": "Goa", "seats": 0},
    )
    assert response.status_code == 422
