"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import type { TripRecord, ItineraryDay } from "@/lib/tripTypes";
import ItineraryEditor from "@/components/ItineraryEditor";


function fmtLong(str: string): string {
  try {
    return new Date(str).toLocaleDateString("en-US", {
      weekday: "long",
      month: "long",
      day: "numeric",
      year: "numeric",
    });
  } catch {
    return str;
  }
}

function nightsBetween(start: string, end: string): number {
  try {
    return Math.round((new Date(end).getTime() - new Date(start).getTime()) / 86_400_000);
  } catch {
    return 0;
  }
}

function persistLocalTrip(trip: TripRecord) {
  if (typeof window === "undefined") return;
  try {
    const stored = window.localStorage.getItem("holiday-app-trips");
    const current = stored ? (JSON.parse(stored) as TripRecord[]) : [];
    window.localStorage.setItem(
      "holiday-app-trips",
      JSON.stringify([trip, ...current.filter((item) => item.id !== trip.id)])
    );
  } catch {
    // ignore
  }
}

function BackArrow() {
  return (
    <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path d="M10 3L5 8l5 5" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export default function TripDetailPage() {
  const router = useRouter();
  const params = useParams();
  const tripId = (params?.tripId as string) ?? "";

  const [trip, setTrip] = useState<TripRecord | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [saveStatus, setSaveStatus] = useState<string | null>(null);
  const [heroImg, setHeroImg] = useState<string>("");

  useEffect(() => {
    let mounted = true;

    const loadTrip = async () => {
      // Try localStorage first for instant load
      const local = typeof window !== "undefined"
        ? window.localStorage.getItem("holiday-app-trips")
        : null;
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
          // fall through to remote fetch
        }
      }

      const { data: sessionData } = await supabase.auth.getSession();
      const userId = sessionData.session?.user.id;
      if (!userId) {
        router.replace("/login");
        return;
      }

      try {
        const { data, error } = await supabase
          .from("trips")
          .select("*")
          .eq("id", tripId)
          .single();

        if (error || !data) {
          if (mounted) setLoading(false);
          return;
        }

        const r: any = data;
        const normalized: TripRecord = {
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
        };

        if (mounted) {
          setTrip(normalized);
          setLoading(false);
        }
      } catch {
        if (mounted) setLoading(false);
      }
    };

    loadTrip();
    return () => { mounted = false; };
  }, [router, tripId]);

  useEffect(() => {
    if (!trip) return;
    fetch(`/api/destination-image?city=${encodeURIComponent(trip.city)}&country=${encodeURIComponent(trip.country)}`)
      .then((r) => r.json())
      .then((data) => { if (data.url) setHeroImg(data.url); })
      .catch(() => {});
  }, [trip]);

  const saveItinerary = async (nextItinerary: ItineraryDay[]) => {
    if (!trip) return;
    const updated = {
      ...trip,
      itinerary: nextItinerary,
      updatedAt: new Date().toISOString(),
    };
    setTrip(updated);
    persistLocalTrip(updated);
    setSaveStatus("Saving…");
    try {
      await supabase
        .from("trips")
        .update({ itinerary: nextItinerary, updated_at: updated.updatedAt })
        .eq("id", trip.id);
      setSaveStatus("Saved ✓");
    } catch {
      setSaveStatus("Saved locally");
    }
    setTimeout(() => setSaveStatus(null), 2500);
  };

  /* ── Loading ──────────────────────────────────── */
  if (loading) {
    return (
      <main className="trip-page">
        <div className="trip-hero trip-hero--skeleton" />
        <div className="trip-content">
          <div className="tl-skeleton tl-skeleton--wide" />
          <div className="tl-skeleton tl-skeleton--medium" />
          <div className="tl-skeleton" />
        </div>
      </main>
    );
  }

  /* ── Not found ────────────────────────────────── */
  if (!trip) {
    return (
      <main className="trip-page">
        <div className="trip-content trip-content--center">
          <h1>Trip not found</h1>
          <p>This trip may have been deleted or doesn't exist.</p>
          <button
            type="button"
            className="button button--primary"
            onClick={() => router.push("/trips")}
          >
            Back to trips
          </button>
        </div>
      </main>
    );
  }

  const nights =
    trip.startDate && trip.endDate
      ? nightsBetween(trip.startDate, trip.endDate)
      : 0;
  const itinerary = trip.itinerary ?? [];

  return (
    <main className="trip-page">
      {/* ── Hero ─────────────────────────────────── */}
      <div className={`trip-hero${!heroImg ? " trip-hero--skeleton" : ""}`}>
        {heroImg && (
          <img
            className="trip-hero__img"
            src={heroImg}
            alt={`${trip.city}, ${trip.country}`}
          />
        )}
        <div className="trip-hero__scrim" />
        <div className="trip-hero__content">
          <button
            type="button"
            className="trip-back"
            onClick={() => router.push("/trips")}
          >
            <BackArrow /> All trips
          </button>
          <div>
            <h1 className="trip-hero__title">
              {trip.city}
              <span className="trip-hero__sep">, </span>
              {trip.country}
            </h1>
            {trip.startDate && (
              <p className="trip-hero__meta">
                {fmtLong(trip.startDate)} – {fmtLong(trip.endDate ?? trip.startDate)}
                {nights > 0 && ` · ${nights} night${nights !== 1 ? "s" : ""}`}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* ── Body ─────────────────────────────────── */}
      <div className="trip-content">

        {/* Trip info chips */}
        <div className="trip-info-row">
          {trip.hotelName && (
            <span className="trip-chip">🏨 {trip.hotelName}</span>
          )}
          {trip.tripStyle && (
            <span className="trip-chip">{trip.tripStyle}</span>
          )}
          {(trip.preferences ?? []).map((p) => (
            <span key={p} className="trip-chip trip-chip--accent">{p}</span>
          ))}
        </div>

        {trip.notes && (
          <blockquote className="trip-notes">{trip.notes}</blockquote>
        )}

        {/* Itinerary section */}
        <div className="trip-section-hd">
          <h2>Itinerary</h2>
          <div className="trip-section-hd__right">
            {saveStatus && <span className="trip-save-badge">{saveStatus}</span>}
            <button
              type="button"
              className={`button ${editing ? "button--secondary" : "button--primary"}`}
              onClick={() => setEditing((v) => !v)}
            >
              {editing ? "Done editing" : "Edit itinerary"}
            </button>
          </div>
        </div>

        {editing ? (
          <ItineraryEditor itinerary={itinerary} onChange={saveItinerary} />
        ) : itinerary.length === 0 ? (
          <div className="trip-tl-empty">
            <p>No itinerary yet.</p>
            <p>Click <strong>Edit itinerary</strong> to add your first day.</p>
          </div>
        ) : (
          <div className="trip-timeline">
            {itinerary.map((day: any, dayIdx: number) => (
              <div key={day.id ?? dayIdx} className="trip-tl-day">
                <h3 className="trip-tl-day-title">{day.title}</h3>
                <div className="trip-tl-items">
                  {(day.sections ?? []).map((section: any, i: number) => (
                    <div key={section.id ?? i} className="trip-tl-item">
                      <div className="trip-tl-time">{section.time}</div>
                      <div className="trip-tl-spine">
                        <div className="trip-tl-dot" />
                        {i < (day.sections?.length ?? 0) - 1 && (
                          <div className="trip-tl-line" />
                        )}
                      </div>
                      <div className="trip-tl-text">{section.activity}</div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
