"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import type { TripRecord } from "@/lib/tripTypes";

interface Props {
  trip: TripRecord;
  onDuplicate?: (trip: TripRecord) => void;
  onDelete?: (tripId: string) => void;
}

function nightsBetween(start: string, end: string): number {
  try {
    return Math.round((new Date(end).getTime() - new Date(start).getTime()) / 86_400_000);
  } catch {
    return 0;
  }
}

function fmtDate(str: string, opts?: Intl.DateTimeFormatOptions): string {
  try {
    return new Date(str).toLocaleDateString("en-US", opts ?? { month: "short", day: "numeric" });
  } catch {
    return str;
  }
}

function CalIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 16 16" fill="none" aria-hidden="true" style={{ flexShrink: 0 }}>
      <rect x="1.5" y="3" width="13" height="11.5" rx="2" stroke="currentColor" strokeWidth="1.4" />
      <path d="M1.5 7h13" stroke="currentColor" strokeWidth="1.4" />
      <path d="M5 1.5v3M11 1.5v3" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  );
}

function HotelIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 16 16" fill="none" aria-hidden="true" style={{ flexShrink: 0 }}>
      <path d="M2 14V6a1 1 0 011-1h10a1 1 0 011 1v8" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
      <path d="M1 14h14" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
      <rect x="5.5" y="9" width="2.5" height="5" rx="0.5" fill="currentColor" opacity="0.55" />
      <rect x="8.5" y="9" width="2.5" height="3" rx="0.5" stroke="currentColor" strokeWidth="1.1" />
    </svg>
  );
}

function ChevDown({ flip }: { flip?: boolean }) {
  return (
    <svg
      width="13"
      height="13"
      viewBox="0 0 16 16"
      fill="none"
      aria-hidden="true"
      style={{ transform: flip ? "rotate(180deg)" : undefined, transition: "transform 220ms ease", flexShrink: 0 }}
    >
      <path d="M3 6l5 4.5L13 6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export default function TripCard({ trip, onDuplicate, onDelete }: Props) {
  const router = useRouter();
  const [open, setOpen] = useState(false);

  const [imgSrc, setImgSrc] = useState<string>("");

  useEffect(() => {
    fetch(`/api/destination-image?city=${encodeURIComponent(trip.city)}&country=${encodeURIComponent(trip.country)}`)
      .then((r) => r.json())
      .then((data) => { if (data.url) setImgSrc(data.url); })
      .catch(() => {});
  }, [trip.city, trip.country]);

  const nights = trip.startDate && trip.endDate ? nightsBetween(trip.startDate, trip.endDate) : 0;
  const startFmt = trip.startDate ? fmtDate(trip.startDate) : "";
  const endFmt = trip.endDate
    ? fmtDate(trip.endDate, { month: "short", day: "numeric", year: "numeric" })
    : "";
  const dayCount = trip.itinerary?.length ?? 0;

  const stopProp = (e: React.MouseEvent) => e.stopPropagation();

  return (
    <article
      className={`tc${open ? " tc--open" : ""}`}
      onClick={() => setOpen((v) => !v)}
      role="button"
      tabIndex={0}
      aria-expanded={open}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          setOpen((v) => !v);
        }
      }}
    >
      {/* ── Image ─────────────────────────────── */}
      <div className={`tc__img-wrap${!imgSrc ? " tc__img-wrap--loading" : ""}`}>
        {imgSrc && (
          <img
            className="tc__img"
            src={imgSrc}
            alt={`${trip.city}, ${trip.country}`}
            loading="lazy"
          />
        )}
        <div className="tc__img-scrim" />
        <div className="tc__img-footer">
          <div>
            <h3 className="tc__city">{trip.city}</h3>
            <p className="tc__country">{trip.country}</p>
          </div>
          <span className="tc__style-pill">{trip.tripStyle ?? "Trip"}</span>
        </div>
        {dayCount > 0 && (
          <span className="tc__days-badge">
            {dayCount} day{dayCount !== 1 ? "s" : ""}
          </span>
        )}
      </div>

      {/* ── Meta ──────────────────────────────── */}
      <div className="tc__body">
        {startFmt && (
          <p className="tc__dates">
            <CalIcon />
            {startFmt} – {endFmt}
            {nights > 0 && (
              <span className="tc__nights">
                {nights} night{nights !== 1 ? "s" : ""}
              </span>
            )}
          </p>
        )}

        {trip.hotelName && (
          <p className="tc__hotel-row">
            <HotelIcon />
            <span className="tc__hotel-name">{trip.hotelName}</span>
          </p>
        )}

        {(trip.preferences ?? []).length > 0 && (
          <div className="tc__chips">
            {(trip.preferences ?? []).map((p) => (
              <span key={p} className="tc__chip">
                {p}
              </span>
            ))}
          </div>
        )}

        {/* ── Footer row ───────────────────── */}
        <div className="tc__footer" onClick={stopProp}>
          <button
            type="button"
            className="tc__see-btn"
            onClick={() => setOpen((v) => !v)}
          >
            {open ? "Hide itinerary" : "View itinerary"}
            <ChevDown flip={open} />
          </button>
          <button
            type="button"
            className="tc__edit-btn"
            onClick={(e) => {
              stopProp(e);
              router.push(`/trips/${trip.id}`);
            }}
          >
            Edit trip
          </button>
        </div>
      </div>

      {/* ── Expanded itinerary ─────────────── */}
      {open && (
        <div className="tc__drawer" onClick={stopProp}>
          {dayCount === 0 ? (
            <p className="tc__empty">
              No itinerary yet — open the trip to add activities.
            </p>
          ) : (
            <div className="tc__days">
              {(trip.itinerary ?? []).map((day: any, di: number) => (
                <div key={day.id ?? di} className="tc__day">
                  <p className="tc__day-label">{day.title}</p>
                  {(day.sections ?? []).map((s: any, si: number) => (
                    <div key={s.id ?? si} className="tc__activity">
                      <span className="tc__act-time">{s.time}</span>
                      <span className="tc__act-desc">{s.activity}</span>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          )}

          {(onDuplicate || onDelete) && (
            <div className="tc__drawer-footer">
              {onDuplicate && (
                <button
                  type="button"
                  className="tc__ghost-btn"
                  onClick={() => onDuplicate(trip)}
                >
                  Duplicate
                </button>
              )}
              {onDelete && (
                <button
                  type="button"
                  className="tc__del-btn"
                  onClick={() => onDelete(trip.id)}
                >
                  Delete trip
                </button>
              )}
            </div>
          )}
        </div>
      )}
    </article>
  );
}
