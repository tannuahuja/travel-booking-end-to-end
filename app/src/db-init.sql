CREATE TABLE IF NOT EXISTS trips (
  id BIGSERIAL PRIMARY KEY,
  destination VARCHAR(120) NOT NULL,
  departure_date DATE NOT NULL,
  price_cents INTEGER NOT NULL CHECK (price_cents >= 0)
);
CREATE TABLE IF NOT EXISTS bookings (
  id BIGSERIAL PRIMARY KEY,
  trip_id BIGINT NOT NULL REFERENCES trips(id),
  customer_name VARCHAR(100) NOT NULL,
  customer_email VARCHAR(254) NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
INSERT INTO trips (destination, departure_date, price_cents)
SELECT 'Jaipur', CURRENT_DATE + 14, 650000
WHERE NOT EXISTS (SELECT 1 FROM trips WHERE destination='Jaipur');
INSERT INTO trips (destination, departure_date, price_cents)
SELECT 'Goa', CURRENT_DATE + 30, 1250000
WHERE NOT EXISTS (SELECT 1 FROM trips WHERE destination='Goa');
INSERT INTO trips (destination, departure_date, price_cents)
SELECT 'Manali', CURRENT_DATE + 45, 890000
WHERE NOT EXISTS (SELECT 1 FROM trips WHERE destination='Manali');
