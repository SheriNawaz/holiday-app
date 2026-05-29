"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import type { TripRecord } from "@/lib/tripTypes";
import TripCard from "@/components/TripCard";

function loadLocalTrips() {
  if (typeof window === "undefined") return [];
  try {
    const stored = window.localStorage.getItem("holiday-app-trips");
    return stored ? (JSON.parse(stored) as TripRecord[]) : [];
  } catch {
    return [];
  }
}

function persistLocalTrips(trips: TripRecord[]) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem("holiday-app-trips", JSON.stringify(trips));
}

export default function TripsPage() {
  const router = useRouter();
  const [trips, setTrips] = useState<TripRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    const loadTrips = async () => {
      const { data: sessionData } = await supabase.auth.getSession();
      if (!mounted) return;
      const userId = sessionData.session?.user.id;
      if (!userId) {
        router.replace("/login");
        return;
      }

      const localTrips = loadLocalTrips();
      try {
        const { data, error } = await supabase.from("trips").select("*").eq("user_id", userId);
        if (error) {
          setStatus("Unable to load saved trips from the backend.");
          setTrips(localTrips);
        } else {
          const remoteTrips = Array.isArray(data) ? (data as TripRecord[]) : [];
          const merged = [...remoteTrips, ...localTrips.filter((trip) => !remoteTrips.some((remote) => remote.id === trip.id))];
          setTrips(merged);
          persistLocalTrips(merged);
        }
      } catch {
        setStatus("Unable to load saved trips from the backend.");
        setTrips(localTrips);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    loadTrips();
    return () => {
      mounted = false;
    };
  }, [router]);

  const deleteTrip = async (tripId: string) => {
    setStatus(null);
    try {
      await supabase.from("trips").delete().eq("id", tripId);
    } catch {
      // backend delete failed, fallback to local storage
    }
    const nextTrips = trips.filter((trip) => trip.id !== tripId);
    setTrips(nextTrips);
    persistLocalTrips(nextTrips);
  };

  const duplicateTrip = async (trip: TripRecord) => {
    const duplicated: TripRecord = {
      ...trip,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    const nextTrips = [duplicated, ...trips];
    setTrips(nextTrips);
    persistLocalTrips(nextTrips);
    try {
      await supabase.from("trips").insert([{ ...duplicated, user_id: trip.userId }]);
    } catch {
      // fallback only to local storage if backend is unavailable.
    }
  };

  return (
    <main className="dashboard-shell">
      <div className="dashboard-header">
        <div>
          <span className="eyebrow">Saved trips</span>
          <h1>Your holiday collection</h1>
          <p>Open, edit, duplicate, or delete saved trips. Create a new holiday plan to get started.</p>
        </div>
        <button type="button" className="button button--primary" onClick={() => router.push("/trips/new")}>Create new trip</button>
      </div>

      {status ? <div className="alert-card">{status}</div> : null}

      {loading ? (
        <p>Loading trips...</p>
      ) : trips.length === 0 ? (
        <div className="empty-state-card">
          <h2>No trips yet</h2>
          <p>Start building your first holiday itinerary with the guided creation wizard.</p>
          <button type="button" className="button button--secondary" onClick={() => router.push("/trips/new")}>Create your first trip</button>
        </div>
      ) : (
        <div className="trips-grid">
          {trips.map((trip) => (
            <div key={trip.id} className="trip-full-card">
              <TripCard trip={trip} />
              <div className="trip-card-actions">
                <button type="button" className="button button--secondary" onClick={() => router.push(`/trips/${trip.id}`)}>
                  Open
                </button>
                <button type="button" className="button button--secondary" onClick={() => duplicateTrip(trip)}>
                  Duplicate
                </button>
                <button type="button" className="button button--secondary" onClick={() => deleteTrip(trip.id)}>
                  Delete
                </button>
              </div>

              {trip.itinerary && Array.isArray(trip.itinerary) && trip.itinerary.length > 0 && (
                <div className="trip-itinerary-preview">
                  <h3>Itinerary</h3>
                  {trip.itinerary.map((day: any) => (
                    <div key={day.id} className="itinerary-day-preview">
                      <h4>{day.title}</h4>
                      <div className="itinerary-sections-preview">
                        {Array.isArray(day.sections) &&
                          day.sections.map((section: any) => (
                            <div key={section.id} className="section-preview">
                              <span className="section-time">{section.time}</span>
                              <span className="section-activity">{section.activity}</span>
                            </div>
                          ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </main>
  );
}
