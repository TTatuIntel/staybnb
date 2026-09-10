/** Demo content for local development. Photos are from Unsplash; avatars from pravatar. */
const u = (id: string) => `https://images.unsplash.com/${id}?auto=format&fit=crop&w=1400&q=80`;

export const HOSTS = [
  { email: "maya@staybnb.dev", name: "Maya Fernandes", avatar: 5, bio: "Architect turned host. I love sharing calm, light-filled spaces." },
  { email: "kenji@staybnb.dev", name: "Kenji Watanabe", avatar: 12, bio: "Third-generation innkeeper. Ask me for the best ramen nearby." },
  { email: "amara@staybnb.dev", name: "Amara Okafor", avatar: 25, bio: "Surfer, gardener, and proud owner of two very friendly dogs." },
  { email: "lucas@staybnb.dev", name: "Lucas Moreau", avatar: 33, bio: "Restoring old houses is my passion. Every stay has a story." },
];

export const GUESTS = [
  { email: "guest@staybnb.dev", name: "Sam Rivera", avatar: 47 },
  { email: "priya@staybnb.dev", name: "Priya Nair", avatar: 44 },
  { email: "tom@staybnb.dev", name: "Tom Becker", avatar: 51 },
];

export interface SeedListing {
  host: number; title: string; type: string; city: string; country: string; lat: number; lng: number;
  price: number; cleaning: number; guests: number; bedrooms: number; beds: number; baths: number;
  amenities: string[]; images: string[]; instant?: boolean; minNights?: number; maxAdvance?: number; description: string;
}

export const LISTINGS: SeedListing[] = [
  { host: 0, title: "Sunlit loft with river views in Alfama", type: "loft", city: "Lisbon", country: "Portugal", lat: 38.7118, lng: -9.1306, price: 14500, cleaning: 4000, guests: 3, bedrooms: 1, beds: 2, baths: 1,
    amenities: ["wifi", "kitchen", "ac", "workspace", "tv", "washer", "smoke_alarm"], images: [u("photo-1502672260266-1c1ef2d93688"), u("photo-1522708323590-d24dbb6b0267"), u("photo-1484154218962-a197022b5858"), u("photo-1505693416388-ac5ce068fe85")],
    description: "A bright top-floor loft in the oldest neighbourhood of Lisbon. Wake up to the sound of trams and sip coffee on the terrace overlooking the Tagus. Fast Wi-Fi and a proper desk make it perfect for longer stays." },
  { host: 2, title: "Bamboo villa with private pool in Ubud", type: "villa", city: "Ubud", country: "Indonesia", lat: -8.5069, lng: 115.2625, price: 21000, cleaning: 6000, guests: 4, bedrooms: 2, beds: 2, baths: 2,
    amenities: ["wifi", "kitchen", "pool", "ac", "workspace", "parking", "bbq"], images: [u("photo-1571003123894-1f0594d2b5d9"), u("photo-1582719478250-c89cae4dc85b"), u("photo-1540518614846-7eded433c457"), u("photo-1520250497591-112f2f40a3f4")],
    description: "Open-air living surrounded by rice terraces. The villa is built from sustainably sourced bamboo and features a 12m infinity pool, an outdoor kitchen and daily housekeeping. Scooters available on request." },
  { host: 1, title: "Traditional machiya townhouse near Gion", type: "house", city: "Kyoto", country: "Japan", lat: 35.0037, lng: 135.7788, price: 26000, cleaning: 8000, guests: 5, bedrooms: 2, beds: 4, baths: 1.5,
    amenities: ["wifi", "kitchen", "heating", "ac", "washer", "tv", "smoke_alarm", "first_aid"], images: [u("photo-1493809842364-78817add7ffb"), u("photo-1600607687939-ce8a6c25118c"), u("photo-1616486338812-3dadae4b4ace"), u("photo-1615874959474-d609969a20ed")],
    description: "A carefully restored 100-year-old wooden townhouse with tatami rooms, a small inner garden and a cedar bath. Ten minutes on foot to Gion and Kiyomizu-dera. Futons are laid out for you each evening." },
  { host: 3, title: "Chic Haussmann apartment in Le Marais", type: "apartment", city: "Paris", country: "France", lat: 48.8575, lng: 2.3622, price: 23500, cleaning: 5500, guests: 2, bedrooms: 1, beds: 1, baths: 1,
    amenities: ["wifi", "kitchen", "heating", "workspace", "tv", "washer", "dryer"], images: [u("photo-1560448204-e02f11c3d0e2"), u("photo-1554995207-c18c203602cb"), u("photo-1567767292278-a4f21aa2d36e"), u("photo-1631049307264-da0ec9d70304")],
    description: "Herringbone floors, 3.5m ceilings and a marble fireplace in a classic Haussmann building. The bakery downstairs opens at 7am. Two metro lines within a three-minute walk." },
  { host: 0, title: "Brooklyn brownstone garden apartment", type: "apartment", city: "New York", country: "United States", lat: 40.6782, lng: -73.9442, price: 19800, cleaning: 7000, guests: 4, bedrooms: 2, beds: 2, baths: 1,
    amenities: ["wifi", "kitchen", "ac", "heating", "washer", "dryer", "tv", "workspace", "smoke_alarm"], images: [u("photo-1600566753086-00f18fb6b3ea"), u("photo-1586023492125-27b2c045efd7"), u("photo-1598928506311-c55ded91a20c"), u("photo-1501117716987-c8e1ecb210af")],
    description: "Private garden-level floor of a Bed-Stuy brownstone with your own backyard. Exposed brick, a chef-grade kitchen and a king bed. The A/C train is four blocks away, 25 minutes to Manhattan." },
  { host: 2, title: "Clifftop beach house overlooking Camps Bay", type: "house", city: "Cape Town", country: "South Africa", lat: -33.9509, lng: 18.3776, price: 32000, cleaning: 9000, guests: 6, bedrooms: 3, beds: 4, baths: 2.5,
    amenities: ["wifi", "kitchen", "pool", "beach_access", "parking", "bbq", "tv", "workspace"], images: [u("photo-1499793983690-e29da59ef1c2"), u("photo-1613490493576-7fde63acd811"), u("photo-1600585154340-be6161a56a0c"), u("photo-1600047509807-ba8f99d2cdde")],
    description: "Floor-to-ceiling glass frames the Atlantic from every room. Heated plunge pool, braai deck and a private path down to the beach. Table Mountain hikes start ten minutes from the door." },
];
