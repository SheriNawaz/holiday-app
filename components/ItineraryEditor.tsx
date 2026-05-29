"use client";

import { useEffect } from "react";
import type { ItineraryDay } from "@/lib/tripTypes";

type Props = {
  itinerary: ItineraryDay[];
  onChange: (itinerary: ItineraryDay[]) => void;
};

function cloneItinerary(itinerary: ItineraryDay[]) {
  return itinerary.map((day) => ({
    ...day,
    sections: day.sections.map((section) => ({ ...section })),
  }));
}

export default function ItineraryEditor({ itinerary, onChange }: Props) {
  useEffect(() => {
    if (!Array.isArray(itinerary) || itinerary.length === 0) {
      return;
    }
  }, [itinerary]);

  const updateSection = (
    dayId: string,
    sectionId: string,
    field: "activity" | "time",
    value: string
  ) => {
    const next = cloneItinerary(itinerary).map((day) => {
      if (day.id !== dayId) return day;
      return {
        ...day,
        sections: day.sections.map((section) =>
          section.id !== sectionId ? section : { ...section, [field]: value }
        ),
      };
    });
    onChange(next);
  };

  const addSection = (dayId: string) => {
    const next = cloneItinerary(itinerary).map((day) => {
      if (day.id !== dayId) return day;
      return {
        ...day,
        sections: [
          ...day.sections,
          {
            id: `${day.id}-section-${day.sections.length + 1}`,
            time: "New",
            activity: "New activity",
          },
        ],
      };
    });
    onChange(next);
  };

  const removeSection = (dayId: string, sectionId: string) => {
    const next = cloneItinerary(itinerary).map((day) => {
      if (day.id !== dayId) return day;
      return {
        ...day,
        sections: day.sections.filter((section) => section.id !== sectionId),
      };
    });
    onChange(next);
  };

  const addDay = () => {
    const nextDayNumber = itinerary.length + 1;
    onChange([
      ...cloneItinerary(itinerary),
      {
        id: `day-${nextDayNumber}`,
        dayNumber: nextDayNumber,
        title: `Day ${nextDayNumber}`,
        sections: [
          {
            id: `day-${nextDayNumber}-section-1`,
            time: "Morning",
            activity: "Open the day with a fresh local breakfast.",
          },
        ],
      },
    ]);
  };

  const removeDay = (dayId: string) => {
    const next = cloneItinerary(itinerary).filter((day) => day.id !== dayId);
    onChange(next.map((day, index) => ({ ...day, dayNumber: index + 1, title: `Day ${index + 1}` })));
  };

  const moveDay = (dayId: string, direction: "up" | "down") => {
    const index = itinerary.findIndex((day) => day.id === dayId);
    if (index === -1) return;
    const target = direction === "up" ? index - 1 : index + 1;
    if (target < 0 || target >= itinerary.length) return;
    const next = cloneItinerary(itinerary);
    [next[index], next[target]] = [next[target], next[index]];
    onChange(next.map((day, idx) => ({ ...day, dayNumber: idx + 1, title: `Day ${idx + 1}` })));
  };

  return (
    <section className="itinerary-editor">
      <div className="editor-header">
        <h2>Itinerary editor</h2>
        <button type="button" className="button button--secondary" onClick={addDay}>
          Add day
        </button>
      </div>

      {itinerary.map((day) => (
        <article key={day.id} className="itinerary-day-card">
          <div className="itinerary-day-header">
            <div>
              <h3>{day.title}</h3>
              <p>{day.sections.length} activities</p>
            </div>

            <div className="itinerary-day-actions">
              <button type="button" className="button button--secondary" onClick={() => moveDay(day.id, "up")}>
                Move up
              </button>
              <button type="button" className="button button--secondary" onClick={() => moveDay(day.id, "down")}>Move down</button>
              <button type="button" className="button button--secondary" onClick={() => removeDay(day.id)}>
                Remove day
              </button>
            </div>
          </div>

          <div className="section-grid">
            {day.sections.map((section) => (
              <div key={section.id} className="itinerary-section-card">
                <label>
                  Time
                  <input
                    type="text"
                    value={section.time}
                    onChange={(event) => updateSection(day.id, section.id, "time", event.target.value)}
                  />
                </label>
                <label>
                  Activity
                  <textarea
                    rows={3}
                    value={section.activity}
                    onChange={(event) => updateSection(day.id, section.id, "activity", event.target.value)}
                  />
                </label>
                <button type="button" className="button button--secondary" onClick={() => removeSection(day.id, section.id)}>
                  Remove activity
                </button>
              </div>
            ))}
          </div>

          <button type="button" className="button button--primary" onClick={() => addSection(day.id)}>
            Add activity
          </button>
        </article>
      ))}
    </section>
  );
}
