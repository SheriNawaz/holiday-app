# ✈️ Holiday Planner

A full-stack web app for planning holidays and building AI-generated travel itineraries. Register an account, create trips with destination, dates, hotel, and preferences, then get a detailed day-by-day itinerary written by GPT-4o — all stored to your account and editable at any time.

**Live site:** https://holiday-app-rouge.vercel.app/

---

## Features

- Register and log in with a secure Supabase account
- Create trips with destination, travel dates, accommodation, preferences, and trip style (Budget / Standard / Luxury)
- Generate rich, specific AI itineraries via OpenAI GPT-4o — real venue names, insider tips, themed day titles
- View each trip as a clean card with a destination photo
- Expand any card to preview the full itinerary inline
- Open a trip to see a beautiful timeline view of every day
- Edit the itinerary in place — add/remove days and activities, reorder days
- Duplicate or delete trips
- Trip data synced to Supabase with localStorage fallback
- Light and dark mode with persistent preference
- Destination photos sourced automatically from Wikipedia for any city in the world

---

## Tech Stack

**Frontend**

- Next.js 16 (App Router, Turbopack)
- React 19 + TypeScript
- Tailwind CSS v4
- Supabase Auth (`@supabase/supabase-js`)

**Backend / API**

- Next.js API Routes (serverless)
- OpenAI API (`gpt-4o-mini`) for itinerary generation
- Wikipedia API for destination images (no key required)
- Supabase (PostgreSQL) for data persistence

---

## Project Structure

```
holiday-app/
├── app/
│   ├── api/
│   │   ├── itinerary/         # POST — AI itinerary generation
│   │   └── destination-image/ # GET  — Wikipedia city photo lookup
│   ├── login/                 # Login page
│   ├── signup/                # Sign-up page
│   ├── reset-password/        # Password reset page
│   ├── trips/
│   │   ├── page.tsx           # Trip list dashboard
│   │   ├── new/               # Trip creation wizard
│   │   └── [tripId]/          # Trip detail + itinerary view
│   ├── globals.css
│   ├── layout.tsx
│   └── page.tsx               # Home / landing page
├── components/
│   ├── AuthNavbar.tsx         # Nav with auth state + theme toggle
│   ├── Footer.tsx
│   ├── ItineraryEditor.tsx    # Day/activity editor
│   ├── TripCard.tsx           # Expandable trip card
│   └── TripWizard.tsx         # 7-step trip creation wizard
└── lib/
    ├── supabaseClient.ts
    └── tripTypes.ts
```

---

## Running Locally

### Prerequisites

- Node.js 18+
- A [Supabase](https://supabase.com) project (free tier works)
- An [OpenAI](https://platform.openai.com) API key

### Setup

```bash
git clone https://github.com/your-username/holiday-app
cd holiday-app
npm install
```

Create a `.env.local` file in the project root:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
OPENAI_API_KEY=sk-...
```

### Supabase table

Run this SQL in your Supabase SQL editor to create the trips table:

```sql
create table trips (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid references auth.users(id) on delete cascade,
  city        text,
  country     text,
  hotel_name  text,
  hotel_address text,
  hotel_coords  jsonb,
  start_date  text,
  end_date    text,
  trip_style  text,
  notes       text,
  preferences jsonb,
  itinerary   jsonb,
  created_at  timestamptz default now(),
  updated_at  timestamptz default now()
);

-- Enable Row Level Security
alter table trips enable row level security;

-- Users can only access their own trips
create policy "Users manage own trips"
  on trips for all
  using (auth.uid() = user_id);
```

### Start the dev server

```bash
npm run dev
```

App runs at `http://localhost:3000`.

---

## API Endpoints

### Itinerary generation

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/itinerary` | Generate an AI itinerary for a trip |

Requires an `Authorization: Bearer <token>` header (Supabase session token).

**Request body**
```json
{
  "trip": {
    "city": "Tokyo",
    "country": "Japan",
    "startDate": "2025-09-01",
    "endDate": "2025-09-07",
    "hotelName": "Park Hyatt Tokyo",
    "preferences": ["Food", "Culture"],
    "tripStyle": "Luxury",
    "notes": "Love rooftop bars and hidden local spots"
  }
}
```

### Destination images

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/destination-image?city=Tokyo&country=Japan` | Returns a Wikipedia photo URL for any city |

---

## Deployment

The app deploys to **Vercel** in one click. See the [deployment guide](https://nextjs.org/docs/app/getting-started/deploying) for details.

### Environment variables (Vercel)

| Variable | Description |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Your Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Your Supabase anon key |
| `OPENAI_API_KEY` | Your OpenAI API key |

### Supabase auth config

In **Supabase → Authentication → URL Configuration**, set:

- **Site URL** → `https://your-app.vercel.app`
- **Redirect URLs** → `https://your-app.vercel.app/**`
