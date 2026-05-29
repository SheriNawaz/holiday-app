"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import type { TripRecord, ItineraryDay } from "@/lib/tripTypes";
import ItineraryEditor from "@/components/ItineraryEditor";

const sampleRecommendations = {
  Restaurants: [
    "Market Street Bistro",
    "Sunset Terrace Grill",
    "Local Harvest Kitchen",
  ],
  Bars: ["Skyline Lounge", "Hidden Garden Bar", "Vintage Cocktail House"],
  Attractions: ["Historic Old Town", "Waterfront Promenade", "City Museum"],
  Experiences: ["Guided walking tour", "Sunrise viewpoint hike", "Cooking class"],
};

function imageUrl(query: string) {
  return `https://source.unsplash.com/featured/800x600/?${encodeURIComponent(query)}`;
}

function persistLocalTrip(trip: TripRecord) {
  if (typeof window === "undefined") return;
  try {
    const stored = window.localStorage.getItem("holiday-app-trips");
    const current = stored ? (JSON.parse(stored) as TripRecord[]) : [];
    const updated = [trip, ...current.filter((item) => item.id !== trip.id)];
    window.localStorage.setItem("holiday-app-trips", JSON.stringify(updated));
  } catch {
    // ignore
  }
}

export default function TripDetailPage() {
  const router = useRouter();
  const params = useParams();
  const tripId = params?.tripId ?? "";
  const [trip, setTrip] = useState<TripRecord | null>(null);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    const loadTrip = async () => {
      const local = typeof window !== "undefined" ? window.localStorage.getItem("holiday-app-trips") : null;
      if (local) {
        try {
          const parsed = JSON.parse(local) as TripRecord[];
          const found = parsed.find((item) => item.id === tripId);
          if (found && mounted) {
            setTrip(found);
            setLoading(false);
            return;
          }
        } catch {
          // ignore
        }
      }

      const { data: sessionData } = await supabase.auth.getSession();
      const userId = sessionData.session?.user.id;
      if (!userId) {
        router.replace("/login");
        return;
      }

      try {
        const { data, error } = await supabase.from("trips").select("*").eq("id", tripId).single();
        if (error || !data) {
          if (mounted) {
            setStatus("Trip not found.");
            setLoading(false);
          }
          return;
        }
        if (mounted) {
          setTrip(data as TripRecord);
          setLoading(false);
        }
      } catch {
        if (mounted) {
          setStatus("Unable to load trip details.");
          setLoading(false);
        }
      }
    };

    loadTrip();
    return () => {
      mounted = false;
    };
  }, [router, tripId]);

  const saveItinerary = async (nextItinerary: ItineraryDay[]) => {
    if (!trip) return;
    const updated = { ...trip, itinerary: nextItinerary, updatedAt: new Date().toISOString() };
    setTrip(updated);
    persistLocalTrip(updated);
    setStatus("Saving itinerary...");
    try {
      await supabase.from("trips").update({ itinerary: nextItinerary, updated_at: updated.updatedAt }).eq("id", trip.id);
      setStatus("Itinerary saved.");
    } catch {
      setStatus("Saved locally because remote save was unavailable.");
    }
  };

  if (loading) {
    return (
      <main className="page-shell">
        <div className="page-content">
          <span className="page-label">Trip details</span>
          <h1>Loading trip...</h1>
        </div>
      </main>
    );
  }

  if (!trip) {
    return (
      <main className="page-shell">
        <div className="page-content">
          <span className="page-label">Trip details</span>
          <h1>Trip not found</h1>
          <p>Return to the dashboard and open a different plan.</p>
          <button type="button" className="button button--primary" onClick={() => router.push("/trips")}>Back to trips</button>
        </div>
      </main>
    );
  }

  return (
    <main className="trip-detail-shell">
      <section className="trip-detail-main">
        <div className="trip-detail-header">
          <span className="eyebrow">Trip detail</span>
          <h1>{trip.city}, {trip.country}</h1>
          <p>{trip.startDate} → {trip.endDate}</p>
        </div>

        <div className="detail-summary-card">
          <div>
            <h2>Hotel</h2>
            <p>{trip.hotelName}</p>
            <p>{trip.hotelAddress}</p>
            {trip.hotelCoords ? <p>Coordinates: {trip.hotelCoords.lat.toFixed(4)}, {trip.hotelCoords.lng.toFixed(4)}</p> : null}
          </div>
          <div>
            <h2>Preferences</h2>
            <p>{trip.preferences.join(", ") || "None"}</p>
            <h2>Style</h2>
            <p>{trip.tripStyle}</p>
          </div>
        </div>

        <ItineraryEditor itinerary={trip.itinerary ?? []} onChange={saveItinerary} />
      </section>

      <aside className="trip-detail-aside">
        <div className="image-card">
          <img src={imageUrl(`${trip.city} ${trip.country}`)} alt={`${trip.city} destination`} />
          <div className="image-overlay">
            <h2>Visual discovery</h2>
            <p>Destination inspiration for {trip.city}.</p>
          </div>
        </div>

        <div className="recommendation-card">
          <h3>Recommendations</h3>
          <div>
            <strong>Restaurants</strong>
            <ul>{sampleRecommendations.Restaurants.map((item) => <li key={item}>{item}</li>)}</ul>
          </div>
          <div>
            <strong>Bars</strong>
            <ul>{sampleRecommendations.Bars.map((item) => <li key={item}>{item}</li>)}</ul>
          </div>
          <div>
            <strong>Attractions</strong>
            <ul>{sampleRecommendations.Attractions.map((item) => <li key={item}>{item}</li>)}</ul>
          </div>
          <div>
            <strong>Experiences</strong>
            <ul>{sampleRecommendations.Experiences.map((item) => <li key={item}>{item}</li>)}</ul>
          </div>
        </div>

        <div className="notes-card">
          <h3>Additional notes</h3>
          <p>{trip.notes || "No personal notes were added."}</p>
        </div>
      </aside>
    </main>
  );
}
