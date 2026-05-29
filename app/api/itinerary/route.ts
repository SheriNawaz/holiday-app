import { NextResponse } from "next/server";

const placesByDestination: Record<string, Record<string, string[]>> = {
  rome: {
    morning: [
      "Early morning visit to the Colosseum (Piazza del Colosseo) - 2-3 hours. Explore the ancient amphitheater with skip-the-line ticket. Grab espresso at nearby Bar Colosseo.",
      "Morning at the Roman Forum & Palatine Hill (Via dei Fori Imperiali) - 3 hours. Walk through ancient ruins of temples and monuments. Include lunch at Armando al Pantheon nearby.",
      "Visit the Pantheon (Piazza della Rotonda) - 1.5 hours. Marvel at the dome and architecture. Breakfast at Tazza d'Oro for authentic Roman coffee.",
      "Historic walking tour through Centro Storico - 2 hours. Explore narrow medieval streets around Piazza Navona. Stop at Pasticceria Regoli for pastries.",
      "Capitoline Museums (Piazza del Campidoglio) - 2-3 hours. Ancient Roman sculptures and paintings. Early morning is less crowded.",
    ],
    afternoon: [
      "Late lunch at Trastevere neighborhood (Via della Lungaretta area) - 2 hours. Enjoy pasta at Flavio al Velavevodetto or Sora Margherita. Browse local shops and galleries.",
      "Vatican Museums & Sistine Chapel (Viale Vaticano) - 3-4 hours. Book skip-the-line tickets in advance. Then see St. Peter's Basilica. Refuel at Bonci Panificio nearby.",
      "Spanish Steps area (Piazza di Spagna) - 1.5 hours. People-watch on the steps. Shop on Via Condotti. Lunch at Café Greco, Rome's oldest café since 1760.",
      "Trevi Fountain (Fontana di Trevi) - 1 hour with crowds. Best visited late afternoon. Toss a coin for return to Rome. Dinner at restaurants on nearby Via del Tritone.",
      "Shopping at Campo de' Fiori market (open morning only) or Porta Portese (Sunday flea market). Browse fresh produce and local goods. Lunch at market stalls.",
    ],
    evening: [
      "Sunset from Gianicolo Hill (Passeggiata del Gianicolo) - 1.5 hours. Panoramic views of Rome at golden hour. Pack snacks from local shops. Walk back through Trastevere for dinner.",
      "Dinner at rooftop restaurant like Imàgo (Hassler Hotel) or Terrazza Borghese - reserve in advance. Enjoy city views with Italian cuisine, 2-3 hours with meal.",
      "Evening stroll along Tiber River (Lungo Tevere) - 1.5 hours. Walk from Castel Sant'Angelo toward Isola Tiberina. Stop at riverside restaurants or wine bars.",
      "Visit a traditional enoteca (wine bar) in Centro Storico like Armando's Wine Bar (Via dei Fori Imperiali) - 1.5-2 hours. Sample Italian wines with charcuterie and cheese.",
      "Gelato at San Crispino (Via della Panetteria) - 30 minutes. Try pistachio or stracciatella. Then walk to nearby bars on Via Nazionale.",
    ],
  },
  tokyo: {
    morning: [
      "Early morning at Tsukiji Outer Market (Tsukishima area) - 2 hours. Fresh sushi breakfast at Tsukiji Sushidai or similar stalls. Watch the energy of the market.",
      "Senso-ji Temple (Asakusa) - 1.5-2 hours. Start before 8am to beat crowds. Explore Nakamise shopping street for souvenirs. Breakfast at Ichiran nearby.",
      "Meiji Shrine & Yoyogi Park (Shibuya ward) - 2-3 hours. Peaceful forest walk. See traditional torii gates. Walk through park, grab coffee at nearby cafés.",
      "Tsukiji Fish Market area or teamLab Borderless pre-opening wait (Toyosu) - 2-3 hours. Explore the digital art museum early before long lines form.",
      "Shibuya Crossing & shopping district exploration (Shibuya Center-gai street) - 2 hours. Watch people scramble across world's busiest intersection. Breakfast in small cafés.",
    ],
    afternoon: [
      "Lunch at Ippudo Ramen (Shibuya or Shinjuku) - 1 hour. Queue for authentic tonkotsu ramen. Then explore Shibuya department stores Magnet and 109.",
      "teamLab Borderless digital art museum (Toyosu) - 3-4 hours. Immersive digital installations. Book tickets online. Bring comfortable shoes. Lunch at in-museum café.",
      "Harajuku Takeshita Street shopping (Meiji-dori & Takeshita-dori) - 2-3 hours. Youth fashion district. Try crepe at crepe stand. Browse quirky shops and boutiques.",
      "Shinjuku Gyoen National Garden (Shinjuku-ku) - 2 hours. Three garden styles (Japanese, English, French). Peaceful escape from city. Café inside serves light meals.",
      "Akihabara electronics & anime district (Chuo-dori) - 2-3 hours. Yodobashi Camera, Don Quijote megastore, anime/manga shops. Lunch at maid café or ramen.",
    ],
    evening: [
      "Dinner at traditional izakaya like Kushikatsu Daruma (Shinjuku) - 1.5-2 hours. Deep-fried skewers and sake. Lively atmosphere with locals. Reserve ahead.",
      "Karaoke at Shinjuku Karaoke-kan (Shinjuku) - 2-3 hours. Private rooms by hour. Practice your Japanese songs. Many foreigners - fun atmosphere. Order drinks between songs.",
      "Tokyo Tower at night (Minato ward) - 1.5-2 hours. Observation deck with city lights. Have dinner at Tower Restaurant or grab snacks. Less crowded after 8pm.",
      "Shibuya Sky observation deck & shopping (Dogenzaka building) - 2 hours. 360° city views at night. Rooftop bar with cocktails. Upscale shopping in building.",
      "Conveyor belt sushi at Kura Sushi (multiple locations) - 1.5 hours. Fresh sushi by color-coded plates. Self-serve drinks. Budget-friendly and fun.",
    ],
  },
  paris: {
    morning: [
      "Eiffel Tower early morning (Trocadéro approach) - 2-3 hours. Arrive before 9am to skip lines. Take elevator to top. Bring pastries from nearby boulangerie for breakfast.",
      "Musée du Louvre (Rue de Rivoli) - 3-4 hours. Book timed entry online. Focus on Mona Lisa, Venus de Milo, Winged Victory. Audio guide available. Café Richelieu inside.",
      "Latin Quarter stroll (Boulevard Saint-Germain area) - 2-3 hours. Browse Shakespeare and Company bookstore. Street musicians everywhere. Breakfast at Café de Flore (expensive but iconic).",
      "Montmartre morning walk (18th arrondissement) - 2.5 hours. Wander cobblestone streets. Visit Basilique Sacré-Cœur. Local cafés on Rue Lepic and Rue des Trois Frères.",
      "Seine riverside morning walk (Île de la Cité) - 2 hours. Explore Sainte-Chapelle stained glass (30 mins). Browse bouquiniste stalls along riverbanks. Breakfast boulangerie.",
    ],
    afternoon: [
      "Lunch at traditional bistro like L'Comptoir du Relais (Saint-Germain) or small café - 1.5 hours. Classic French cuisine: croque-monsieur, escargot, coq au vin.",
      "Notre-Dame Cathedral exterior tour (Île de la Cité) - 1.5 hours. View facade and square. Climb towers if open (387 steps). Visit adjacent cloister. See Parvis.",
      "Montmartre artist square & Moulin Rouge area (Place du Tertre) - 2 hours. Local artists sketch portraits. Visit Moulin Rouge facade. Shop galleries and studios on Rue Lepic.",
      "Palace of Versailles (30min train from Paris) - 4-5 hours. Pre-book tickets. Tour opulent rooms, Hall of Mirrors. Stroll manicured gardens with fountains. Lunch at La Petite Venise café.",
      "Musée d'Orsay impressionist art (Rue de la Légion d'Honneur) - 2-3 hours. Monet, Renoir, Van Gogh. Book timed tickets. Café Campagne inside for snacks.",
    ],
    evening: [
      "Dinner at Michelin-starred Le Jules Verne (Eiffel Tower) - 2.5 hours. Fine dining with tower views. Dress code: smart casual. Reserve months ahead. Expensive but unforgettable.",
      "Seine river cruise (6pm departure from Pont d'Alma) - 1.5 hours. See illuminated monuments. Dinner cruises available (pricier). Romantic and relaxing.",
      "Moulin Rouge cabaret show (Pigalle, 9pm or 11pm) - 2.5 hours. Can-can dancers and dancers in feathers. Dinner packages available. Book tickets in advance.",
      "Jazz club in Latin Quarter like Le Caveau de la Huchette (Rue de la Huchette) - 2-3 hours. Live jazz nightly. Standing room or table seating. Drink minimum required.",
      "Wine bar like L'Avant Comptoir (Rue de Buci) - 1.5-2 hours. Small plates, wine selection. Standing-room only but packed atmosphere. Great for people-watching.",
    ],
  },
  barcelona: {
    morning: [
      "Sagrada Familia (Carrer de Mallorca) - 2-3 hours. Gaudí's unfinished masterpiece. Book skip-the-line tickets. Climb towers for views. Audio guide explains details. Café inside.",
      "Park Güell (Passeig de la Muntanya) - 2-3 hours. Book timed tickets online. Colorful mosaics and terraces. Panoramic city views. Trail is hilly - wear good shoes.",
      "Gothic Quarter (Barri Gòtic) walking tour - 2-3 hours. Medieval narrow streets and plazas. Visit Barcelona Cathedral (Catedral de Santa Eulàlia). Breakfast at local café in Plaza Reial.",
      "Las Ramblas stroll (La Rambla tree-lined boulevard) - 1.5-2 hours. Living statue performers, flower stalls, street artists. Browse shops. Start at Plaça Reial, walk downhill to waterfront.",
      "Montjuïc morning (cable car from Barceloneta) - 2 hours. Visit gardens like Jardins de Mossèn Costa i Llobera. See Olympic Stadium area. Great views over city and sea.",
    ],
    afternoon: [
      "Lunch at tapas bars like El Xampanyet (Santa Maria del Pi neighborhood) - 1.5-2 hours. Patatas bravas, jamón ibérico, croquetas. Wash down with local vermouth.",
      "Casa Batlló (Passeig de Gràcia) - 1.5 hours. Gaudí's colorful residential building. Skip-the-line tickets. Virtual reality tour optional. Rooftop with stunning views.",
      "Montjuïc museums (MNAC art museum, Fundació Joan Miró) - 2-3 hours. Choose one or both based on interest. Both have excellent collections and rooftop views.",
      "Barceloneta Beach (Passeig Marítim) - 2-3 hours. Relax on sandy beach. Swim in Mediterranean. Beach bars serve paella and seafood. Umbrella and chair rentals available.",
      "Passeig de Gràcia upscale shopping area - 2-3 hours. Designer boutiques, modernist architecture to admire. Lunch at rooftop restaurant on Casa Amatller.",
    ],
    evening: [
      "Dinner with sea views at seaside restaurant like Fishbone (Barceloneta waterfront) - 2-3 hours. Fresh seafood paella. Menus del día (set menus) offer good value.",
      "Flamenco show at Palau de la Música (Carrer de Sant Francesc de Paula) or Tarantos (La Rambla) - 1.5-2 hours. Passionate dancing and music. Dinner packages available. Reserve ahead.",
      "Rooftop bar/cocktails at MondBar or Bresca Poblenou (trendy areas) - 2 hours. City skyline views at night. Modern cocktails. Dress code: smart casual.",
      "Evening walk along Port Vell (waterfront promenade) - 1.5 hours. See Christopher Columbus Monument. Browse shops and restaurants. Street performers and artists.",
      "Local wine bar in Born neighborhood like El Nacional - 1.5-2 hours. Catalan wine selection, small plates (montaditos). Social atmosphere with mix of locals and tourists.",
    ],
  },
};

function getActivityForDestination(
  destination: string,
  timeOfDay: "morning" | "afternoon" | "evening",
  index: number
): string {
  const normalizedDest = destination.toLowerCase().split(",")[0].trim();
  const activities = placesByDestination[normalizedDest]?.[timeOfDay];

  if (activities) {
    return activities[index % activities.length];
  }

  const fallbacks: Record<string, string[]> = {
    morning: [
      "Early morning at the main attraction or museum (2-3 hours) - skip lines by arriving before 9am. Book tickets online if available.",
      "Walk through historic city center neighborhoods (1.5-2 hours) - explore architecture, street art, and local squares. Stop for breakfast at a local café.",
      "Visit the city's main market or food hall - fresh produce, local vendors, and street food. Ideal breakfast spot with authentic local experience.",
      "Explore museums or cultural sites (2-3 hours) - plan ahead for major attractions. Allocate enough time for each section. Bring water bottle.",
      "Morning hike or nature walk if available - parks, gardens, waterfalls. Research popular trails. Bring proper footwear and sun protection.",
    ],
    afternoon: [
      "Lunch at popular local restaurant or food market (1.5-2 hours) - ask hotel for recommendations. Try regional specialties and signature dishes.",
      "Shopping district exploration - department stores, local boutiques, street markets. Browse for souvenirs and local crafts. Budget 2-3 hours.",
      "Second major attraction or museum (2-3 hours) - choose based on interests. Combination tickets often available. Pace yourself between activities.",
      "Relax in main city park or garden (1.5-2 hours) - scenic walks, benches, picnic areas. Many have cafés for snacks and people-watching.",
      "Street food tour or specialty food exploration (2 hours) - visit neighborhoods known for cuisine. Sample local snacks at different stalls. Avoid peak lunch hours.",
    ],
    evening: [
      "Dinner at local restaurant in residential neighborhood (2-2.5 hours) - less touristy than downtown. Walk around after dinner. Experience local dining culture.",
      "Sunset from scenic viewpoint - lookout tower, hill, or waterfront. Bring light snacks. Golden hour photography opportunity. Plan 1.5 hours including walk time.",
      "Evening entertainment like live music, theater, or cultural show (1.5-2.5 hours) - book tickets in advance if popular. Check local event listings.",
      "Walk along waterfront or main promenade (1.5 hours) - riverside strolls, harbor views, street performers. Stop at riverside café or bar.",
      "Wine/craft beer bar with local selection (1.5-2 hours) - sample regional drinks and small plates. Ask locals for recommendations. Ask about aperitivo hours (usually 6-8pm) for deals.",
    ],
  };

  return fallbacks[timeOfDay][index % fallbacks[timeOfDay].length];
}

function generateFallbackItinerary(trip: any) {
  const start = new Date(trip.startDate);
  const end = new Date(trip.endDate);
  const days = Math.min(
    30,
    Math.max(1, Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24) + 1))
  );
  const prefs = Array.isArray(trip.preferences) ? trip.preferences : [];
  const destination = trip.city || "the destination";

  return Array.from({ length: days }).map((_, index) => ({
    id: `day-${index + 1}`,
    dayNumber: index + 1,
    title: `Day ${index + 1}`,
    sections: [
      {
        id: `day-${index + 1}-morning`,
        time: "Morning",
        activity: getActivityForDestination(destination, "morning", index),
      },
      {
        id: `day-${index + 1}-afternoon`,
        time: "Afternoon",
        activity: getActivityForDestination(destination, "afternoon", index),
      },
      {
        id: `day-${index + 1}-evening`,
        time: "Evening",
        activity: getActivityForDestination(destination, "evening", index),
      },
      {
        id: `day-${index + 1}-night`,
        time: "Night",
        activity: prefs.includes("Relaxation")
          ? "Rest at the hotel"
          : "Evening entertainment or quiet stroll",
      },
    ],
  }));
}

function buildPrompt(trip: any) {
  return `Create a structured travel itinerary in JSON format for a ${trip.tripStyle || "Standard"} trip to ${trip.city}, ${trip.country}. The trip runs from ${trip.startDate} to ${trip.endDate}. The traveler is staying at ${trip.hotelName}${trip.hotelAddress ? `, ${trip.hotelAddress}` : ""}. Preferences: ${trip.preferences?.join(", ") || "General travel"}. Additional notes: ${trip.notes || "None"}. Return a JSON object with a top-level key named "itinerary" and an array of days. Each day should include dayNumber, title, and sections with time and activity. Only return valid JSON.`;
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  if (!body?.trip) {
    return NextResponse.json({ error: "Missing trip data." }, { status: 400 });
  }

  const trip = body.trip;
  const apiKey = process.env.OPENAI_API_KEY;

  if (!apiKey) {
    return NextResponse.json({ itinerary: generateFallbackItinerary(trip) });
  }

  const prompt = buildPrompt(trip);

  try {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.7,
      }),
    });

    const json = await response.json();
    const text = json.choices?.[0]?.message?.content || "";

    let parsed;
    try {
      parsed = JSON.parse(text);
    } catch {
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        try {
          parsed = JSON.parse(jsonMatch[0]);
        } catch {
          parsed = null;
        }
      }
    }

    if (parsed?.itinerary) {
      return NextResponse.json({ itinerary: parsed.itinerary });
    }
  } catch (error) {
    console.error("Itinerary generation error:", error);
  }

  return NextResponse.json({ itinerary: generateFallbackItinerary(trip) });
}
