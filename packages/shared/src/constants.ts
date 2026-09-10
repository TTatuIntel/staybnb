/** Booking lifecycle. Stored as strings so the schema works on SQLite and Postgres alike. */
export const BOOKING_STATUS = {
  CONFIRMED: "CONFIRMED",
  CANCELLED: "CANCELLED",
  COMPLETED: "COMPLETED",
} as const;
export type BookingStatus = (typeof BOOKING_STATUS)[keyof typeof BOOKING_STATUS];

export const PROPERTY_TYPES = [
  { value: "apartment", label: "Apartment" },
  { value: "house", label: "House" },
  { value: "villa", label: "Villa" },
  { value: "cabin", label: "Cabin" },
  { value: "loft", label: "Loft" },
  { value: "room", label: "Private room" },
  { value: "unique", label: "Unique stay" },
] as const;
export type PropertyType = (typeof PROPERTY_TYPES)[number]["value"];
export const PROPERTY_TYPE_VALUES = PROPERTY_TYPES.map((p) => p.value) as [PropertyType, ...PropertyType[]];

export const AMENITIES = [
  { key: "wifi", label: "Wi-Fi" },
  { key: "kitchen", label: "Kitchen" },
  { key: "washer", label: "Washer" },
  { key: "dryer", label: "Dryer" },
  { key: "ac", label: "Air conditioning" },
  { key: "heating", label: "Heating" },
  { key: "workspace", label: "Dedicated workspace" },
  { key: "tv", label: "TV" },
  { key: "parking", label: "Free parking" },
  { key: "pool", label: "Pool" },
  { key: "hot_tub", label: "Hot tub" },
  { key: "gym", label: "Gym" },
  { key: "bbq", label: "BBQ grill" },
  { key: "fireplace", label: "Fireplace" },
  { key: "beach_access", label: "Beach access" },
  { key: "ev_charger", label: "EV charger" },
  { key: "pets", label: "Pets allowed" },
  { key: "smoke_alarm", label: "Smoke alarm" },
  { key: "first_aid", label: "First aid kit" },
] as const;
export type AmenityKey = (typeof AMENITIES)[number]["key"];
export const AMENITY_KEYS = AMENITIES.map((a) => a.key) as [AmenityKey, ...AmenityKey[]];

/** Service fee charged to guests, as a fraction of the nightly subtotal. */
export const GUEST_SERVICE_FEE_RATE = 0.12;

/** Hard ceiling on how far ahead any listing can be booked. Hosts may set a lower limit. */
export const MAX_ADVANCE_DAYS_LIMIT = 730;

/** Guests can cancel free of charge until this many hours before check-in. */
export const FREE_CANCELLATION_HOURS = 48;

/** Socket.IO event names shared by server and clients (web + mobile). */
export const SOCKET_EVENTS = {
  // client -> server
  LISTING_JOIN: "listing:join",
  LISTING_LEAVE: "listing:leave",
  // server -> client
  LISTING_VIEWERS: "listing:viewers",
  LISTING_AVAILABILITY: "listing:availability",
  LISTING_BOOKED: "listing:booked",
  BOOKING_CREATED: "booking:created",
  BOOKING_UPDATED: "booking:updated",
} as const;
