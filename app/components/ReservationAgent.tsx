"use client";

import { FormEvent, useMemo, useState } from "react";

type SeatingPreference = "standard" | "window" | "patio" | "chef";

type ReservationSummary = {
  confirmationCode: string;
  restaurant: string;
  time: string;
  partySize: number;
  notes: string[];
};

const defaultPartySize = 2;
const maxPartySize = 8;

const seatingOptions: { label: string; value: SeatingPreference }[] = [
  { label: "Standard", value: "standard" },
  { label: "Window", value: "window" },
  { label: "Patio", value: "patio" },
  { label: "Chef's Counter", value: "chef" }
];

const restaurants = [
  "Lumen Bistro",
  "Cedar & Sage",
  "Marinée",
  "The Copper Finch",
  "Velvet Harbor"
];

export default function ReservationAgent() {
  const [partySize, setPartySize] = useState(defaultPartySize);
  const [date, setDate] = useState<string>(() => {
    const today = new Date();
    today.setHours(today.getHours() + 2);
    return today.toISOString().split("T")[0] ?? "";
  });
  const [time, setTime] = useState("19:00");
  const [restaurant, setRestaurant] = useState(restaurants[0] ?? "");
  const [occasion, setOccasion] = useState("Dinner");
  const [preferences, setPreferences] = useState<SeatingPreference>("standard");
  const [requests, setRequests] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [summary, setSummary] = useState<ReservationSummary | null>(null);

  const minDate = useMemo(() => {
    const dateObj = new Date();
    return dateObj.toISOString().split("T")[0] ?? "";
  }, []);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSummary(null);
    setError(null);
    setLoading(true);

    try {
      const response = await fetch("/api/reservations", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          partySize,
          date,
          time,
          restaurant,
          occasion,
          preferences,
          requests
        })
      });

      if (!response.ok) {
        const payload = await response.json();
        throw new Error(payload?.error ?? "Failed to book reservation.");
      }

      const payload = (await response.json()) as ReservationSummary;
      setSummary(payload);
    } catch (bookingError) {
      setError(bookingError instanceof Error ? bookingError.message : "Unexpected error booking reservation.");
    } finally {
      setLoading(false);
    }
  };

  const increasePartySize = () => setPartySize((size) => Math.min(size + 1, maxPartySize));
  const decreasePartySize = () => setPartySize((size) => Math.max(1, size - 1));

  return (
    <main className="agent-shell">
      <section className="agent-panel">
        <header className="agent-header">
          <div className="agent-title">
            <span className="agent-title-badge">AI Host</span>
            <h1>Restaurant Reservation Agent</h1>
            <p>Craft the perfect night out with curated table recommendations and concierge follow-up.</p>
          </div>
        </header>

        <form onSubmit={handleSubmit} className="agent-form">
          <div className="grid">
            <label>
              Party Size
              <div className="counter">
                <button type="button" onClick={decreasePartySize} aria-label="Decrease party size">
                  −
                </button>
                <span>{partySize}</span>
                <button type="button" onClick={increasePartySize} aria-label="Increase party size">
                  +
                </button>
              </div>
            </label>

            <label>
              Date
              <input
                type="date"
                min={minDate}
                value={date}
                onChange={(event) => setDate(event.target.value)}
                required
              />
            </label>

            <label>
              Time
              <input type="time" value={time} onChange={(event) => setTime(event.target.value)} required />
            </label>

            <label>
              Restaurant
              <select value={restaurant} onChange={(event) => setRestaurant(event.target.value)} required>
                {restaurants.map((name) => (
                  <option key={name} value={name}>
                    {name}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <label>
            Occasion
            <input
              type="text"
              placeholder="Birthday, anniversary, client dinner..."
              value={occasion}
              onChange={(event) => setOccasion(event.target.value)}
            />
          </label>

          <label>
            Seating Preference
            <div className="seating-options">
              {seatingOptions.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  className={preferences === option.value ? "selected" : ""}
                  onClick={() => setPreferences(option.value)}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </label>

          <label>
            Special Requests
            <textarea
              placeholder="Allergies, celebrations, accessibility, etc."
              value={requests}
              onChange={(event) => setRequests(event.target.value)}
            />
          </label>

          <button className="submit" type="submit" disabled={loading}>
            {loading ? "Confirming..." : "Book Reservation"}
          </button>
        </form>

        {error ? <p className="error">{error}</p> : null}

        {summary ? (
          <section className="summary">
            <h2>Reservation Confirmed</h2>
            <p>
              Confirmation code <strong>{summary.confirmationCode}</strong> at <strong>{summary.restaurant}</strong>.
            </p>
            <p>
              {summary.partySize} guests on {summary.time}.
            </p>
            <ul>
              {summary.notes.map((note) => (
                <li key={note}>{note}</li>
              ))}
            </ul>
          </section>
        ) : null}
      </section>
    </main>
  );
}
