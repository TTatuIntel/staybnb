import type { BookingStatus } from "./constants";

export interface PublicUser {
  id: string;
  name: string;
  avatarUrl: string | null;
  bio: string | null;
  isHost: boolean;
  createdAt: string;
}

export interface AuthUser extends PublicUser {
  email: string;
}

export interface ListingImage {
  id: string;
  url: string;
  position: number;
}

export interface ListingSummary {
  id: string;
  title: string;
  city: string;
  country: string;
  propertyType: string;
  pricePerNight: number; // in minor units (cents)
  currency: string;
  maxGuests: number;
  bedrooms: number;
  beds: number;
  bathrooms: number;
  instantBook: boolean;
  images: ListingImage[];
  rating: number | null;
  reviewCount: number;
  lat: number | null;
  lng: number | null;
}

export interface Listing extends ListingSummary {
  description: string;
  address: string | null;
  cleaningFee: number;
  amenities: string[];
  minNights: number;
  maxAdvanceDays: number;
  isActive: boolean;
  host: PublicUser;
  createdAt: string;
  updatedAt: string;
}

/** A half-open [start, end) date range using YYYY-MM-DD strings. */
export interface DateRange {
  start: string;
  end: string;
}

export interface PriceBreakdown {
  nights: number;
  nightlyRate: number;
  subtotal: number;
  cleaningFee: number;
  serviceFee: number;
  total: number;
  currency: string;
}

export interface Booking {
  id: string;
  listingId: string;
  guestId: string;
  checkIn: string; // YYYY-MM-DD
  checkOut: string; // YYYY-MM-DD
  guests: number;
  nights: number;
  subtotal: number;
  cleaningFee: number;
  serviceFee: number;
  total: number;
  currency: string;
  status: BookingStatus;
  createdAt: string;
  updatedAt: string;
  listing?: ListingSummary & { host?: PublicUser };
  guest?: PublicUser;
  review?: Review | null;
}

export interface Review {
  id: string;
  listingId: string;
  bookingId: string;
  rating: number;
  comment: string;
  createdAt: string;
  author: PublicUser;
}

export interface ListingSearchResult {
  items: ListingSummary[];
  total: number;
  page: number;
  pageSize: number;
}

export interface AvailabilityResponse {
  listingId: string;
  bookedRanges: DateRange[];
  minNights: number;
  maxAdvanceDays: number;
}

export interface ApiError {
  error: string;
  details?: unknown;
}

// Realtime payloads
export interface ListingViewersEvent {
  listingId: string;
  count: number;
}
export type ListingAvailabilityEvent = AvailabilityResponse;
export interface ListingBookedEvent {
  listingId: string;
  range: DateRange;
  at: string;
}
