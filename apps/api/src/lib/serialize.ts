import type { Booking as DbBooking, Listing as DbListing, ListingImage, Review as DbReview, User } from "@prisma/client";
import type { AuthUser, Booking, Listing, ListingSummary, PublicUser, Review } from "@staybnb/shared";
import { toIsoDate } from "@staybnb/shared";

export function toPublicUser(u: User): PublicUser {
  return {
    id: u.id,
    name: u.name,
    avatarUrl: u.avatarUrl,
    bio: u.bio,
    isHost: u.isHost,
    createdAt: u.createdAt.toISOString(),
  };
}

export function toAuthUser(u: User): AuthUser {
  return { ...toPublicUser(u), email: u.email };
}

export interface RatingStats {
  rating: number | null;
  reviewCount: number;
}

type ListingWithImages = DbListing & { images: ListingImage[] };

export function toListingSummary(l: ListingWithImages, stats: RatingStats): ListingSummary {
  return {
    id: l.id,
    title: l.title,
    city: l.city,
    country: l.country,
    propertyType: l.propertyType,
    pricePerNight: l.pricePerNight,
    currency: l.currency,
    maxGuests: l.maxGuests,
    bedrooms: l.bedrooms,
    beds: l.beds,
    bathrooms: l.bathrooms,
    instantBook: l.instantBook,
    images: [...l.images].sort((a, b) => a.position - b.position).map((i) => ({ id: i.id, url: i.url, position: i.position })),
    rating: stats.rating,
    reviewCount: stats.reviewCount,
    lat: l.lat,
    lng: l.lng,
  };
}

export function toListing(l: ListingWithImages & { host: User }, stats: RatingStats): Listing {
  let amenities: string[] = [];
  try {
    const parsed = JSON.parse(l.amenities);
    if (Array.isArray(parsed)) amenities = parsed.filter((a): a is string => typeof a === "string");
  } catch {
    amenities = [];
  }
  return {
    ...toListingSummary(l, stats),
    description: l.description,
    address: l.address,
    cleaningFee: l.cleaningFee,
    amenities,
    minNights: l.minNights,
    maxAdvanceDays: l.maxAdvanceDays,
    isActive: l.isActive,
    host: toPublicUser(l.host),
    createdAt: l.createdAt.toISOString(),
    updatedAt: l.updatedAt.toISOString(),
  };
}

export function toReview(r: DbReview & { author: User }): Review {
  return {
    id: r.id,
    listingId: r.listingId,
    bookingId: r.bookingId,
    rating: r.rating,
    comment: r.comment,
    createdAt: r.createdAt.toISOString(),
    author: toPublicUser(r.author),
  };
}

export function toBooking(
  b: DbBooking & {
    listing?: ListingWithImages & { host?: User };
    guest?: User;
    review?: (DbReview & { author: User }) | null;
  },
  listingStats?: RatingStats,
): Booking {
  return {
    id: b.id,
    listingId: b.listingId,
    guestId: b.guestId,
    checkIn: toIsoDate(b.checkIn),
    checkOut: toIsoDate(b.checkOut),
    guests: b.guests,
    nights: b.nights,
    subtotal: b.subtotal,
    cleaningFee: b.cleaningFee,
    serviceFee: b.serviceFee,
    total: b.total,
    currency: b.currency,
    status: b.status as Booking["status"],
    createdAt: b.createdAt.toISOString(),
    updatedAt: b.updatedAt.toISOString(),
    listing: b.listing
      ? {
          ...toListingSummary(b.listing, listingStats ?? { rating: null, reviewCount: 0 }),
          host: b.listing.host ? toPublicUser(b.listing.host) : undefined,
        }
      : undefined,
    guest: b.guest ? toPublicUser(b.guest) : undefined,
    review: b.review === undefined ? undefined : b.review ? toReview(b.review) : null,
  };
}
