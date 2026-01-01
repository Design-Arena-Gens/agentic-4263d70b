import { NextRequest, NextResponse } from "next/server";
import { createReservation } from "../../../lib/reservations";

export const runtime = "edge";

export async function POST(request: NextRequest) {
  try {
    const payload = await request.json();

    if (!payload?.date || !payload?.time || !payload?.partySize || !payload?.restaurant) {
      return NextResponse.json(
        { error: "Missing required reservation details. Provide date, time, party size, and restaurant." },
        { status: 400 }
      );
    }

    const result = createReservation({
      partySize: Number(payload.partySize),
      date: String(payload.date),
      time: String(payload.time),
      restaurant: String(payload.restaurant),
      occasion: String(payload.occasion ?? ""),
      preferences: payload.preferences ?? "standard",
      requests: String(payload.requests ?? "")
    });

    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unable to process reservation." },
      { status: 400 }
    );
  }
}
