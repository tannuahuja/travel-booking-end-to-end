const express = require("express");
const path = require("node:path");
const { Pool } = require("pg");
const client = require("prom-client");

const app = express();
app.use(express.json({ limit: "100kb" }));
app.use(express.static(path.join(__dirname, "..", "public")));

const register = new client.Registry();
client.collectDefaultMetrics({ register });
const httpRequests = new client.Counter({
  name: "travel_booking_http_requests_total",
  help: "Total HTTP requests handled",
  labelNames: ["method", "route", "status"]
});
register.registerMetric(httpRequests);

app.use((req, res, next) => {
  res.on("finish", () => httpRequests.inc({
    method: req.method,
    route: req.route?.path || req.path,
    status: String(res.statusCode)
  }));
  next();
});

const pool = new Pool({
  host: process.env.DB_HOST || "localhost",
  port: Number(process.env.DB_PORT || 5432),
  database: process.env.DB_NAME || "travelbooking",
  user: process.env.DB_USER || "travelapp",
  password: process.env.DB_PASSWORD || "local-dev-only",
  max: Number(process.env.DB_POOL_SIZE || 5),
  connectionTimeoutMillis: 3000
});

app.get("/api/health", async (_req, res) => {
  try {
    await pool.query("SELECT 1");
    res.json({ status: "ok", database: "connected" });
  } catch (_err) {
    res.status(503).json({ status: "degraded", database: "unavailable" });
  }
});

app.get("/api/trips", async (_req, res) => {
  try {
    const result = await pool.query(
      "SELECT id, destination, departure_date, price_cents FROM trips ORDER BY id"
    );
    res.json(result.rows);
  } catch (_err) {
    res.status(500).json({ error: "Unable to fetch trips" });
  }
});

app.post("/api/bookings", async (req, res) => {
  const { tripId, customerName, customerEmail } = req.body || {};
  if (!Number.isInteger(tripId) || !customerName || !customerEmail ||
      String(customerName).length > 100 || String(customerEmail).length > 254) {
    return res.status(400).json({ error: "tripId, customerName and customerEmail are required" });
  }
  try {
    const result = await pool.query(
      `INSERT INTO bookings (trip_id, customer_name, customer_email)
       VALUES ($1, $2, $3)
       RETURNING id, trip_id, customer_name, customer_email, created_at`,
      [tripId, customerName, customerEmail]
    );
    return res.status(201).json(result.rows[0]);
  } catch (_err) {
    return res.status(500).json({ error: "Unable to create booking" });
  }
});

app.get("/metrics", async (_req, res) => {
  res.set("Content-Type", register.contentType);
  res.end(await register.metrics());
});

app.get("/api/version", (_req, res) => res.json({
  name: "travel-booking",
  version: process.env.APP_VERSION || "dev"
}));

module.exports = { app, pool };
