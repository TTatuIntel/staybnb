import type { SeedListing } from "./seed-data";

const u = (id: string) => `https://images.unsplash.com/${id}?auto=format&fit=crop&w=1400&q=80`;

export const LISTINGS_2: SeedListing[] = [
  { host: 3, title: "Modernist penthouse steps from Sagrada Familia", type: "apartment", city: "Barcelona", country: "Spain", lat: 41.4036, lng: 2.1744, price: 17500, cleaning: 5000, guests: 4, bedrooms: 2, beds: 3, baths: 2,
    amenities: ["wifi", "kitchen", "ac", "tv", "washer", "workspace", "ev_charger"], images: [u("photo-1536376072261-38c75010e6c9"), u("photo-1600210492486-724fe5c67fb0"), u("photo-1600121848594-d8644e57abab"), u("photo-1522771739844-6a9f6d5f14af")],
    description: "A 90m2 rooftop terrace with views of Gaudi's basilica. Inside: polished concrete, oak joinery and a Sonos system throughout. Tapas bars, the metro and a food market are all on the block." },
  { host: 1, title: "Lakeside A-frame cabin with wood-fired sauna", type: "cabin", city: "Reykjavik", country: "Iceland", lat: 64.1466, lng: -21.9426, price: 24000, cleaning: 6500, guests: 4, bedrooms: 2, beds: 3, baths: 1,
    amenities: ["wifi", "kitchen", "heating", "fireplace", "hot_tub", "parking", "pets"], images: [u("photo-1518780664697-55e3ad937233"), u("photo-1587061949409-02df41d5e562"), u("photo-1470770841072-f978cf4d019e"), u("photo-1449844908441-8829872d2607")],
    description: "Thirty minutes from the city, a black-timber A-frame on the shore of a glacial lake. Northern lights from the hot tub in winter, midnight sun on the deck in summer. Wood, kindling and marshmallows included." },
  { host: 2, title: "Jungle treehouse with cenote access in Tulum", type: "unique", city: "Tulum", country: "Mexico", lat: 20.2114, lng: -87.4654, price: 16500, cleaning: 4500, guests: 2, bedrooms: 1, beds: 1, baths: 1, instant: false, minNights: 2,
    amenities: ["wifi", "kitchen", "beach_access", "bbq", "pets"], images: [u("photo-1510798831971-661eb04b3739"), u("photo-1523217582562-09d0def993a6"), u("photo-1564013799919-ab600027ffc6"), u("photo-1416331108676-a22ccb276e35")],
    description: "A hand-built treehouse 8m above the jungle floor with a net hammock, outdoor rain shower and a private cenote a short walk away. Bikes provided for the ride to the beach. Two-night minimum." },
  { host: 0, title: "Riad with rooftop pool in the Medina", type: "house", city: "Marrakech", country: "Morocco", lat: 31.6295, lng: -7.9811, price: 12800, cleaning: 3500, guests: 6, bedrooms: 3, beds: 5, baths: 3,
    amenities: ["wifi", "kitchen", "pool", "ac", "heating", "tv", "smoke_alarm"], images: [u("photo-1566073771259-6a8506099945"), u("photo-1542314831-068cd1dbfeeb"), u("photo-1445019980597-93fa8acb246c"), u("photo-1600596542815-ffad4c1539a9")],
    description: "A traditional riad around a citrus courtyard, restored with zellige tiles and tadelakt walls. Breakfast is served on the roof beside the pool. Our housekeeper Fatima can arrange cooking classes and desert trips." },
  { host: 3, title: "Harbourside studio in Sydney's Rocks", type: "apartment", city: "Sydney", country: "Australia", lat: -33.8599, lng: 151.2090, price: 15900, cleaning: 4000, guests: 2, bedrooms: 0, beds: 1, baths: 1,
    amenities: ["wifi", "kitchen", "ac", "workspace", "tv", "washer", "gym"], images: [u("photo-1602343168117-bb8ffe3e2e9f"), u("photo-1512917774080-9991f1c4c750"), u("photo-1600607687939-ce8a6c25118c"), u("photo-1502005229762-cf1b2da7c5d6")],
    description: "A compact, beautifully designed studio with a glimpse of the Harbour Bridge from the bed. Building gym and pool, ferry wharf downstairs. Ideal for a solo traveller or a couple on a city break." },
  { host: 1, title: "Shinjuku micro-apartment with skyline views", type: "apartment", city: "Tokyo", country: "Japan", lat: 35.6938, lng: 139.7034, price: 9800, cleaning: 2500, guests: 2, bedrooms: 1, beds: 1, baths: 1, maxAdvance: 180,
    amenities: ["wifi", "kitchen", "ac", "heating", "washer", "tv", "workspace"], images: [u("photo-1480074568708-e3b0e7e7d5a3"), u("photo-1522708323590-d24dbb6b0267"), u("photo-1505693416388-ac5ce068fe85"), u("photo-1484154218962-a197022b5858")],
    description: "Twenty-second floor, five minutes from Shinjuku station. Everything you need in 28 square metres: a proper kitchenette, a washer-dryer and blackout curtains for jet lag. Pocket Wi-Fi included." },
];
