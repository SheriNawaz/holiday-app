export type Coordinates = {
  lat: number;
  lng: number;
};

export type TripDraft = {
  city: string;
  country: string;
  startDate: string;
  endDate: string;
  hotelName: string;
  hotelAddress: string;
  hotelCoords?: Coordinates | null;
  preferences: string[];
  tripStyle: string;
  notes: string;
};

export type ItinerarySection = {
  id: string;
  time: string;
  activity: string;
};

export type ItineraryDay = {
  id: string;
  dayNumber: number;
  title: string;
  sections: ItinerarySection[];
};

export type TripRecord = TripDraft & {
  id: string;
  userId?: string | null;
  preferences: string[];
  itinerary?: ItineraryDay[];
  createdAt?: string;
  updatedAt?: string;
};

export const preferenceOptions = [
  "Nightlife",
  "Food",
  "Sightseeing",
  "Adventure",
  "Relaxation",
  "Shopping",
  "Nature",
  "Culture",
  "Family-friendly",
] as const;

export const tripStyles = ["Budget", "Standard", "Luxury"] as const;
