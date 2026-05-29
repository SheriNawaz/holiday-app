"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import type { TripRecord } from "@/lib/tripTypes";
import TripCard from "@/components/TripCard";

function loadLocalTrips(): TripRecord[] {
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

function PlusIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path d="M8 2v12M2 8h12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

function SkeletonGrid() {
  return (
    <div className="trips-v2__grid">
      {[1, 2, 3].map((i) => (
        <div key={i} className="tc-skeleton">
          <div className="tc-skeleton__img" />
          <div className="tc-skeleton__body">
            <div className="tc-skeleton__line tc-skeleton__line--wide" />
            <div className="tc-skeleton__line tc-skeleton__line--medium" />
            <div className="tc-skeleton__line tc-skeleton__line--short" />
          </div>
        </div>
      ))}
    </div>
  );
}

export default function TripsPage() {
  const router = useRouter();
  const [trips, setTrips] = useState<TripRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [alert, setAlert] = useState<string | null>(null);

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
        const { data, error } = await supabase
          .from("trips")
          .select("*")
          .eq("user_id", userId)
          .order("created_at", { ascending: false });

        if (error) {
          if (mounted) {
            setAlert("Couldn't reach the server — showing saved trips.");
            setTrips(localTrips);
          }
        } else {
          const rows = Array.isArray(data) ? data : [];
          const remoteTrips: TripRecord[] = rows.map((r: any) => ({
            id: r.id,
            userId: r.user_id ?? r.userId,
            city: r.city,
            country: r.country,
            hotelName: r.hotel_name ?? r.hotelName,
            hotelAddress: r.hotel_address ?? r.hotelAddress,
            hotelCoords: r.hotel_coords ?? r.hotelCoords,
            startDate: r.start_date ?? r.startDate,
            endDate: r.end_date ?? r.endDate,
            tripStyle: r.trip_style ?? r.tripStyle,
            notes: r.notes,
            preferences: r.preferences ?? [],
            itinerary: r.itinerary ?? [],
            createdAt: r.created_at ?? r.createdAt,
            updatedAt: r.updated_at ?? r.updatedAt,
          }));

          const merged = [
            ...remoteTrips,
            ...localTrips.filter(
              (t) => !remoteTrips.some((r) => r.id === t.id)
            ),
          ];

          if (mounted) {
            setTrips(merged);
            persistLocalTrips(merged);
          }
        }
      } catch {
        if (mounted) {
          setAlert("Couldn't reach the server — showing saved trips.");
          setTrips(localTrips);
        }
      } finally {
        if (mounted) setLoading(false);
      }
    };

    loadTrips();
    return () => { mounted = false; };
  }, [router]);

  const deleteTrip = async (tripId: string) => {
    setAlert(null);
    try {
      await supabase.from("trips").delete().eq("id", tripId);
    } catch {
      // best-effort; update local state regardless
    }
    const next = trips.filter((t) => t.id !== tripId);
    setTrips(next);
    persistLocalTrips(next);
  };

  const duplicateTrip = async (trip: TripRecord) => {
    const copy: TripRecord = {
      ...trip,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    const next = [copy, ...trips];
    setTrips(next);
    persistLocalTrips(next);
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      const userId = sessionData.session?.user.id;
      if (userId) {
        await supabase.from("trips").insert([{
          id: copy.id,
          user_id: userId,
          city: copy.city,
          country: copy.country,
          hotel_name: copy.hotelName,
          hotel_address: copy.hotelAddress,
          hotel_coords: copy.hotelCoords,
          start_date: copy.startDate,
          end_date: copy.endDate,
          trip_style: copy.tripStyle,
          notes: copy.notes,
          preferences: copy.preferences,
          itinerary: copy.itinerary,
          created_at: copy.createdAt,
          updated_at: copy.updatedAt,
        }]);
      }
    } catch {
      // local copy already saved
    }
  };

  return (
    <main className="trips-v2">
      {/* ── Header ──────────────────────────────── */}
      <div className="trips-v2__top">
        <div>
          <span className="trips-v2__eyebrow">Your collection</span>
          <h1 className="trips-v2__h1">Trips</h1>
          {!loading && trips.length > 0 && (
            <p className="trips-v2__sub">
              {trips.length} trip{trips.length !== 1 ? "s" : ""} planned
            </p>
          )}
        </div>
        <button
          type="button"
          className="button button--primary trips-v2__new-btn"
          onClick={() => router.push("/trips/new")}
        >
          <PlusIcon />
          Plan a trip
        </button>
      </div>

      {/* ── Alert ──────────────────────────────── */}
      {alert && <div className="trips-v2__alert">{alert}</div>}

      {/* ── Content ────────────────────────────── */}
      {loading ? (
        <SkeletonGrid />
      ) : trips.length === 0 ? (
        <div className="trips-v2__empty">
          <div className="trips-v2__empty-icon">✈️</div>
          <h2>No trips yet</h2>
          <p>
            Build your first holiday itinerary — we'll help you plan every day.
          </p>
          <button
            type="button"
            className="button button--primary"
            onClick={() => router.push("/trips/new")}
          >
            Plan your first trip
          </button>
        </div>
      ) : (
        <div className="trips-v2__grid">
          {trips.map((trip) => (
            <TripCard
              key={trip.id}
              trip={trip}
              onDuplicate={duplicateTrip}
              onDelete={deleteTrip}
            />
          ))}
        </div>
      )}
    </main>
  );
}
