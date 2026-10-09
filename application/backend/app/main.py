import os
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel, Field
from sqlalchemy import create_engine, text

DATABASE_URL = os.getenv(
    "DATABASE_URL",
    "postgresql+psycopg://travel_app:local_learning_password@localhost:5432/travel_booking",
)
engine = create_engine(DATABASE_URL, pool_pre_ping=True)
app = FastAPI(title="Travel Booking API", version="0.1.0")


class BookingCreate(BaseModel):
    customer_name: str = Field(min_length=2, max_length=100)
    destination: str = Field(min_length=2, max_length=100)
    seats: int = Field(ge=1, le=8)


@app.get("/health")
def health():
    # Liveness-style endpoint: the API process is running.
    return {"status": "ok"}


@app.get("/ready")
def ready():
    # Readiness-style endpoint: check whether the database can be reached.
    try:
        with engine.connect() as connection:
            connection.execute(text("SELECT 1"))
        return {"status": "ready", "database": "reachable"}
    except Exception as exc:
        raise HTTPException(status_code=503, detail="database unavailable") from exc


@app.get("/api/bookings")
def list_bookings():
    with engine.connect() as connection:
        rows = connection.execute(
            text("SELECT id, customer_name, destination, seats FROM bookings ORDER BY id")
        ).mappings().all()
    return [dict(row) for row in rows]


@app.post("/api/bookings", status_code=201)
def create_booking(payload: BookingCreate):
    with engine.begin() as connection:
        row = connection.execute(
            text("INSERT INTO bookings (customer_name, destination, seats) "
                 "VALUES (:customer_name, :destination, :seats) "
                 "RETURNING id, customer_name, destination, seats"),
            payload.model_dump(),
        ).mappings().one()
    return dict(row)
