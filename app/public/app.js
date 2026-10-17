const list = document.querySelector("#trip-list");
const select = document.querySelector("#tripId");
const message = document.querySelector("#message");
const money = (cents) => new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(cents / 100);

async function loadTrips() {
  try {
    const response = await fetch("/api/trips");
    if (!response.ok) throw new Error("Trips API unavailable");
    const trips = await response.json();
    list.replaceChildren();
    select.replaceChildren();
    for (const trip of trips) {
      const card = document.createElement("article");
      card.className = "card";
      const title = document.createElement("h3");
      title.textContent = trip.destination;
      const date = document.createElement("p");
      date.textContent = `Departure: ${new Date(`${trip.departure_date}T00:00:00`).toLocaleDateString()}`;
      const price = document.createElement("p");
      price.className = "price";
      price.textContent = money(trip.price_cents);
      card.append(title, date, price);
      list.append(card);
      const option = document.createElement("option");
      option.value = trip.id;
      option.textContent = `${trip.destination} — ${money(trip.price_cents)}`;
      select.append(option);
    }
  } catch (_error) {
    list.textContent = "Could not load destinations. Please try again later.";
  }
}
document.querySelector("#booking-form").addEventListener("submit", async (event) => {
  event.preventDefault();
  message.textContent = "Submitting…";
  try {
    const response = await fetch("/api/bookings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        tripId: Number(select.value),
        customerName: document.querySelector("#customerName").value.trim(),
        customerEmail: document.querySelector("#customerEmail").value.trim()
      })
    });
    const body = await response.json();
    if (!response.ok) throw new Error(body.error || "Booking failed");
    message.textContent = `Booking confirmed. Reference: ${body.id}`;
  } catch (error) {
    message.textContent = error.message;
  }
});
loadTrips();
