import { NextResponse } from "next/server";

function buildPrompt(trip: any): string {
  const start = new Date(trip.startDate);
  const end = new Date(trip.endDate);
  const numDays = Math.max(
    1,
    Math.round((end.getTime() - start.getTime()) / 86_400_000) + 1
  );

  const styleGuidance: Record<string, string> = {
    budget: "prioritise free or low-cost attractions, street food, local markets and public transport",
    luxury: "recommend premium restaurants, private tours, exclusive experiences and fine dining",
    standard: "balance mid-range restaurants, popular sights and authentic local spots",
  };
  const style = (trip.tripStyle ?? "standard").toLowerCase();
  const guidance = styleGuidance[style] ?? styleGuidance.standard;

  return `You are a world-class travel concierge creating a detailed, expert travel itinerary.

TRIP DETAILS:
- Destination: ${trip.city}, ${trip.country}
- Travel style: ${trip.tripStyle ?? "Standard"} (${guidance})
- Dates: ${trip.startDate} to ${trip.endDate} (${numDays} days)
- Hotel: ${trip.hotelName}${trip.hotelAddress ? `, ${trip.hotelAddress}` : ""}
- Traveller preferences: ${(trip.preferences ?? []).join(", ") || "general sightseeing"}
- Additional notes: ${trip.notes || "none"}

REQUIREMENTS:
1. Use SPECIFIC, REAL venue names with neighbourhood or street context (e.g. "Osteria Francescana, Via Stella 22")
2. Include practical tips: booking requirements, best visiting times, insider advice
3. Give every day a descriptive theme title (e.g. "Day 2: Ancient Ruins & Hidden Piazzas")
4. Group activities geographically so the traveller minimises transit time
5. Include meal suggestions (breakfast spot, lunch, dinner) woven into each day
6. Provide 4–5 activities per day with realistic time slots (e.g. "9:00 AM", "2:30 PM")
7. Write each activity description in 2–3 vivid, helpful sentences
8. Account for the ${trip.tripStyle ?? "Standard"} budget level throughout

Return ONLY valid JSON — no markdown, no code fences, nothing outside the JSON object:
{
  "itinerary": [
    {
      "id": "day-1",
      "dayNumber": 1,
      "title": "Day 1: Descriptive Theme Here",
      "sections": [
        {
          "id": "day-1-section-1",
          "time": "9:00 AM",
          "activity": "Venue name (Neighbourhood/Address) — vivid description including tips."
        }
      ]
    }
  ]
}`;
}

export async function POST(request: Request) {
  // Verify the request carries a valid Supabase session cookie
  const authHeader = request.headers.get("authorization") ?? "";
  if (!authHeader.startsWith("Bearer ")) {
    return NextResponse.json({ error: "Unauthorised." }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  if (!body?.trip) {
    return NextResponse.json({ error: "Missing trip data." }, { status: 400 });
  }

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "Itinerary generation is not configured. Please add an OpenAI API key to your environment variables." },
      { status: 503 }
    );
  }

  const trip = body.trip;

  try {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content:
              "You are an expert travel planner. Always respond with valid JSON only — no markdown, no prose, no code fences.",
          },
          { role: "user", content: buildPrompt(trip) },
        ],
        temperature: 0.7,
        response_format: { type: "json_object" },
      }),
    });

    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      const message = (err as any)?.error?.message ?? `OpenAI returned ${response.status}`;
      return NextResponse.json({ error: `Generation failed: ${message}` }, { status: 502 });
    }

    const json = await response.json();
    const text: string = json.choices?.[0]?.message?.content ?? "";

    let parsed: any;
    try {
      parsed = JSON.parse(text);
    } catch {
      const match = text.match(/\{[\s\S]*\}/);
      if (match) {
        try { parsed = JSON.parse(match[0]); } catch { /* fall through */ }
      }
    }

    if (parsed?.itinerary && Array.isArray(parsed.itinerary)) {
      return NextResponse.json({ itinerary: parsed.itinerary });
    }

    return NextResponse.json(
      { error: "The AI returned an unexpected response. Please try again." },
      { status: 502 }
    );
  } catch (err) {
    console.error("Itinerary generation error:", err);
    return NextResponse.json(
      { error: "Failed to connect to the AI service. Please check your connection and try again." },
      { status: 502 }
    );
  }
}
