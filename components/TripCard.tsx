import type { TripRecord } from "@/lib/tripTypes";

export default function TripCard({ trip }: { trip: TripRecord }) {
  const start = new Date(trip.startDate).toLocaleDateString();
  const end = new Date(trip.endDate).toLocaleDateString();

  return (
    <article className="trip-card">
      <div className="trip-card__header">
        <div>
          <p className="trip-card__destination">{trip.city}, {trip.country}</p>
          <p className="trip-card__dates">{start} — {end}</p>
        </div>
        <span className="trip-card__style">{trip.tripStyle}</span>
      </div>

      <p className="trip-card__hotel">{trip.hotelName}{trip.hotelAddress ? ` · ${trip.hotelAddress}` : ""}</p>
      <p className="trip-card__notes">{trip.notes || "No additional notes."}</p>

      <div className="trip-card__meta">
        <span>{trip.preferences.length} preferences</span>
        <span>{trip.itinerary?.length ?? 0} days</span>
      </div>
    </article>
  );
}
