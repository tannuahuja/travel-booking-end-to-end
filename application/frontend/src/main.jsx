import React, { useEffect, useState } from "react";
import { createRoot } from "react-dom/client";
import "./style.css";

function App() {
  const [bookings, setBookings] = useState([]);
  const [message, setMessage] = useState("Loading bookings...");
  const [form, setForm] = useState({ customer_name: "", destination: "", seats: 1 });

  async function loadBookings() {
    try {
      const response = await fetch("/api/bookings");
      if (!response.ok) throw new Error("API request failed");
      setBookings(await response.json());
      setMessage("");
    } catch {
      setMessage("Could not load bookings. Check that the backend is running.");
    }
  }

  useEffect(() => { loadBookings(); }, []);

  async function submit(event) {
    event.preventDefault();
    setMessage("Saving booking...");
    try {
      const response = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, seats: Number(form.seats) }),
      });
      if (!response.ok) throw new Error(await response.text());
      setForm({ customer_name: "", destination: "", seats: 1 });
      await loadBookings();
      setMessage("Booking saved.");
    } catch (error) {
      setMessage(`Could not save booking: ${error.message}`);
    }
  }

  return <main className="container">
    <p className="eyebrow">DEVOPS LEARNING PROJECT</p>
    <h1>Travel Booking</h1>
    <p className="intro">A three-tier app for learning containers, Kubernetes, delivery automation and operations.</p>
    <section className="panel">
      <h2>Create a booking</h2>
      <form onSubmit={submit}>
        <label>Customer name<input required minLength="2" maxLength="100" value={form.customer_name} onChange={e => setForm({...form, customer_name:e.target.value})} /></label>
        <label>Destination<input required minLength="2" maxLength="100" value={form.destination} onChange={e => setForm({...form, destination:e.target.value})} /></label>
        <label>Seats<input type="number" min="1" max="8" required value={form.seats} onChange={e => setForm({...form, seats:e.target.value})} /></label>
        <button type="submit">Create booking</button>
      </form>
      <p className="message" role="status">{message}</p>
    </section>
    <section className="panel">
      <h2>Bookings</h2>
      {bookings.length === 0 ? <p>No bookings yet.</p> : <ul className="bookings">
        {bookings.map(b => <li key={b.id}><strong>#{b.id} — {b.destination}</strong><span>{b.customer_name} · {b.seats} seat(s)</span></li>)}
      </ul>}
    </section>
    <footer>Frontend → FastAPI → PostgreSQL</footer>
  </main>;
}
createRoot(document.getElementById("root")).render(<App />);
