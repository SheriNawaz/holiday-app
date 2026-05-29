import { NextResponse } from "next/server";

// Wikipedia returns a thumbnail for any city article — no API key required.
async function fetchWikipediaImage(city: string): Promise<string | null> {
  const url =
    `https://en.wikipedia.org/w/api.php?` +
    new URLSearchParams({
      action: "query",
      titles: city,
      prop: "pageimages",
      piprop: "thumbnail",
      pithumbsize: "1200",
      format: "json",
      origin: "*",
    });

  const res = await fetch(url, { next: { revalidate: 86400 } }); // cache 24h
  if (!res.ok) return null;

  const data = await res.json();
  const pages: Record<string, any> = data?.query?.pages ?? {};
  const page = Object.values(pages)[0];
  return (page?.thumbnail?.source as string) ?? null;
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const city = searchParams.get("city")?.trim() ?? "";
  const country = searchParams.get("country")?.trim() ?? "";

  if (!city) {
    return NextResponse.json({ error: "city is required" }, { status: 400 });
  }

  // 1. Try the city name alone
  let imageUrl = await fetchWikipediaImage(city).catch(() => null);

  // 2. Try "City, Country" for disambiguation
  if (!imageUrl && country) {
    imageUrl = await fetchWikipediaImage(`${city}, ${country}`).catch(() => null);
  }

  // 3. Hardcoded fallbacks (direct Unsplash CDN — no redirect, no API key)
  if (!imageUrl) {
    const fallbacks = [
      "https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=1200&q=80&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=1200&q=80&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1200&q=80&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1488085061851-e6b3b4d7b4b4?w=1200&q=80&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1530521954074-e64f6810b32d?w=1200&q=80&auto=format&fit=crop",
    ];
    const idx = (city.charCodeAt(0) + (country.charCodeAt(0) ?? 0)) % fallbacks.length;
    imageUrl = fallbacks[idx];
  }

  return NextResponse.json({ url: imageUrl });
}
