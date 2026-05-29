"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import type { ItineraryDay, TripDraft, TripRecord } from "@/lib/tripTypes";
import { preferenceOptions, tripStyles } from "@/lib/tripTypes";

const hotelSuggestions = [
  {
    name: "Urban Harbor Hotel",
    address: "12 Riverside Avenue",
    coords: { lat: 41.9028, lng: 12.4964 },
  },
  {
    name: "Starlight Lodge",
    address: "88 Plaza Street",
    coords: { lat: 35.6895, lng: 139.6917 },
  },
  {
    name: "Cityscape Suites",
    address: "450 Market Road",
    coords: { lat: 48.8566, lng: 2.3522 },
  },
];

const defaultDraft: TripDraft = {
  city: "",
  country: "",
  startDate: "",
  endDate: "",
  hotelName: "",
  hotelAddress: "",
  hotelCoords: null,
  preferences: [],
  tripStyle: "Standard",
  notes: "",
};


function ensureLocalTrips() {
  if (typeof window === "undefined") return [];
  try {
    const stored = window.localStorage.getItem("holiday-app-trips");
    return stored ? (JSON.parse(stored) as TripRecord[]) : [];
  } catch {
    return [];
  }
}

function persistLocalTrip(trip: TripRecord) {
  if (typeof window === "undefined") return;
  const current = ensureLocalTrips();
  const next = [trip, ...current.filter((item) => item.id !== trip.id)];
  window.localStorage.setItem("holiday-app-trips", JSON.stringify(next));
}

function removeLocalTrip(tripId: string) {
  if (typeof window === "undefined") return;
  const current = ensureLocalTrips();
  window.localStorage.setItem(
    "holiday-app-trips",
    JSON.stringify(current.filter((trip) => trip.id !== tripId))
  );
}

export default function TripWizard() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [draft, setDraft] = useState<TripDraft>(defaultDraft);
  const [hotelQuery, setHotelQuery] = useState("");
  const [itinerary, setItinerary] = useState<ItineraryDay[]>([]);
  const [status, setStatus] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const hotelResults = useMemo(
    () =>
      hotelSuggestions.filter((hotel) =>
        `${hotel.name} ${hotel.address}`.toLowerCase().includes(hotelQuery.toLowerCase())
      ),
    [hotelQuery]
  );

  const setField = <K extends keyof TripDraft>(key: K, value: TripDraft[K]) => {
    setDraft((current) => ({ ...current, [key]: value }));
  };

  const togglePreference = (preference: string) => {
    setDraft((current) => {
      const next = current.preferences.includes(preference)
        ? current.preferences.filter((item) => item !== preference)
        : [...current.preferences, preference];
      return { ...current, preferences: next };
    });
  };

  const nextStep = () => {
    if (step === 2 && draft.startDate && draft.endDate) {
      const start = new Date(draft.startDate);
      const end = new Date(draft.endDate);
      const days = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24) + 1);
      if (end <= start) {
        setStatus("End date must be after the start date.");
        return;
      }
      if (days > 30) {
        setStatus("Trips can be a maximum of 30 days.");
        return;
      }
    }
    setStatus(null);
    setStep((current) => Math.min(7, current + 1));
  };

  const previousStep = () => {
    setStatus(null);
    setStep((current) => Math.max(1, current - 1));
  };

  const selectHotel = (hotel: typeof hotelSuggestions[number]) => {
    setDraft((current) => ({
      ...current,
      hotelName: hotel.name,
      hotelAddress: hotel.address,
      hotelCoords: hotel.coords,
    }));
  };

  const generateItinerary = async () => {
    setIsGenerating(true);
    setStatus("Generating your itinerary with AI — this usually takes 20–60 seconds…");

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 120_000);

    try {
      const { data: sessionData } = await supabase.auth.getSession();
      const token = sessionData.session?.access_token ?? "";

      const response = await fetch("/api/itinerary", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ trip: draft }),
        signal: controller.signal,
      });
      const json = await response.json();
      if (json.itinerary && Array.isArray(json.itinerary)) {
        setItinerary(json.itinerary);
        setStatus("Itinerary generated. Review the plan below then save your trip.");
      } else {
        setStatus(`Error: ${json.error ?? "The AI returned an unexpected response. Please try again."}`);
      }
    } catch (err: any) {
      if (err?.name === "AbortError") {
        setStatus("Error: The request timed out. Please try again.");
      } else {
        setStatus("Error: Could not connect to the itinerary service. Please check your connection and try again.");
      }
    } finally {
      clearTimeout(timeout);
      setIsGenerating(false);
    }
  };

  const saveTrip = async () => {
    setIsSaving(true);
    setStatus(null);
    const trip: TripRecord = {
      id: crypto.randomUUID(),
      ...draft,
      preferences: draft.preferences,
      itinerary,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    try {
      const { data: sessionData } = await supabase.auth.getSession();
      const userId = sessionData.session?.user.id;
      if (userId) {
        const { data, error } = await supabase.from("trips").insert([
          {
            id: trip.id,
            user_id: userId,
            city: trip.city,
            country: trip.country,
            hotel_name: trip.hotelName,
            hotel_address: trip.hotelAddress,
            hotel_coords: trip.hotelCoords,
            start_date: trip.startDate,
            end_date: trip.endDate,
            trip_style: trip.tripStyle,
            notes: trip.notes,
            preferences: trip.preferences,
            itinerary: trip.itinerary,
          },
        ]);
        if (error) {
          throw error;
        }
      }
      persistLocalTrip(trip);
      setStatus("Trip saved successfully.");
      router.push(`/trips/${trip.id}`);
    } catch (error) {
      console.error(error);
      persistLocalTrip(trip);
      setStatus("Saved locally because remote save was unavailable.");
      router.push(`/trips/${trip.id}`);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <section className="wizard-shell">
      <div className="wizard-header">
        <div>
          <span className="eyebrow">Trip creation wizard</span>
          <h1>Create your holiday plan</h1>
          <p>Use the guided steps to enter destination, travel dates, hotel details, preferences, and notes.</p>
        </div>
        <div className="step-pill">Step {step} / 7</div>
      </div>

      <div className="wizard-card">
        {step === 1 && (
          <div className="wizard-step">
            <h2>Destination</h2>
            <label>
              City
              <input
                value={draft.city}
                onChange={(event) => setField("city", event.target.value)}
                placeholder="Rome"
              />
            </label>
            <label>
              Country
              <input
                value={draft.country}
                onChange={(event) => setField("country", event.target.value)}
                placeholder="Italy"
              />
            </label>
          </div>
        )}

        {step === 2 && (
          <div className="wizard-step">
            <h2>Travel dates</h2>
            <label>
              Start date
              <input
                type="date"
                value={draft.startDate}
                onChange={(event) => setField("startDate", event.target.value)}
              />
            </label>
            <label>
              End date
              <input
                type="date"
                value={draft.endDate}
                onChange={(event) => setField("endDate", event.target.value)}
              />
            </label>
          </div>
        )}

        {step === 3 && (
          <div className="wizard-step">
            <h2>Accommodation</h2>
            <p>Search hotel suggestions or enter details manually.</p>
            <label>
              Search hotels
              <input
                value={hotelQuery}
                onChange={(event) => setHotelQuery(event.target.value)}
                placeholder="Search by hotel name or address"
              />
            </label>
            <div className="hotel-suggestions">
              {hotelResults.map((hotel) => (
                <button
                  key={hotel.name}
                  type="button"
                  className="hotel-suggestion"
                  onClick={() => selectHotel(hotel)}
                >
                  <strong>{hotel.name}</strong>
                  <span>{hotel.address}</span>
                </button>
              ))}
            </div>
            <label>
              Hotel name
              <input
                value={draft.hotelName}
                onChange={(event) => setField("hotelName", event.target.value)}
                placeholder="Hotel name"
              />
            </label>
            <label>
              Hotel address
              <input
                value={draft.hotelAddress}
                onChange={(event) => setField("hotelAddress", event.target.value)}
                placeholder="Hotel address"
              />
            </label>
          </div>
        )}

        {step === 4 && (
          <div className="wizard-step">
            <h2>Travel preferences</h2>
            <p>Select the experiences that matter most to you.</p>
            <div className="preferences-grid">
              {preferenceOptions.map((preference) => (
                <button
                  type="button"
                  key={preference}
                  className={`preference-chip ${draft.preferences.includes(preference) ? "selected" : ""}`}
                  onClick={() => togglePreference(preference)}
                >
                  {preference}
                </button>
              ))}
            </div>
          </div>
        )}

        {step === 5 && (
          <div className="wizard-step">
            <h2>Trip style</h2>
            <div className="style-grid">
              {tripStyles.map((style) => (
                <label key={style} className="style-card">
                  <input
                    type="radio"
                    name="tripStyle"
                    value={style}
                    checked={draft.tripStyle === style}
                    onChange={(event) => setField("tripStyle", event.target.value)}
                  />
                  <div>
                    <strong>{style}</strong>
                    <p>{style === "Budget" ? "Smart planning with savings." : style === "Luxury" ? "Premium stays and experiences." : "Balanced travel with comfort."}</p>
                  </div>
                </label>
              ))}
            </div>
          </div>
        )}

        {step === 6 && (
          <div className="wizard-step">
            <h2>Additional notes</h2>
            <p>Tell us what matters most so the itinerary fits your style.</p>
            <textarea
              value={draft.notes}
              onChange={(event) => setField("notes", event.target.value)}
              placeholder="Vegetarian-friendly, love rooftop bars, avoid museums, prefer walkable areas"
              rows={8}
            />
          </div>
        )}

        {step === 7 && (
          <div className="wizard-step">
            <h2>Review & generate</h2>
            <div className="review-grid">
              <div className="review-card">
                <strong>Destination</strong>
                <p>{draft.city}, {draft.country}</p>
              </div>
              <div className="review-card">
                <strong>Dates</strong>
                <p>{draft.startDate} → {draft.endDate}</p>
              </div>
              <div className="review-card">
                <strong>Hotel</strong>
                <p>{draft.hotelName || "No hotel selected"}</p>
                <p>{draft.hotelAddress}</p>
              </div>
              <div className="review-card">
                <strong>Preferences</strong>
                <p>{draft.preferences.join(", ") || "None selected"}</p>
              </div>
              <div className="review-card">
                <strong>Style</strong>
                <p>{draft.tripStyle}</p>
              </div>
              <div className="review-card">
                <strong>Notes</strong>
                <p>{draft.notes || "None"}</p>
              </div>
            </div>

            <div className="wizard-actions">
              <button type="button" className="button button--primary" onClick={generateItinerary} disabled={isGenerating}>
                {isGenerating ? "⏳ Generating — please wait…" : "Generate itinerary"}
              </button>
              {itinerary.length > 0 && (
                <button type="button" className="button button--secondary" onClick={saveTrip} disabled={isSaving}>
                  {isSaving ? "Saving trip..." : "Save trip"}
                </button>
              )}
            </div>
          </div>
        )}

        {status && (
          <p className={`wizard-status${status.startsWith("Error") ? " wizard-status--error" : ""}`}>
            {status}
          </p>
        )}
      </div>

      <div className="wizard-footer">
        {step > 1 && (
          <button type="button" className="button button--secondary" onClick={previousStep}>
            Back
          </button>
        )}
        {step < 7 && (
          <button type="button" className="button button--primary" onClick={nextStep}>
            Continue
          </button>
        )}
      </div>
    </section>
  );
}
