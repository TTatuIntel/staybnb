import { z } from "zod";
import { AMENITY_KEYS, MAX_ADVANCE_DAYS_LIMIT, PROPERTY_TYPE_VALUES } from "./constants";
import { isIsoDate } from "./dates";

export const isoDateSchema = z
  .string()
  .refine(isIsoDate, { message: "Expected a date in YYYY-MM-DD format" });

export const registerSchema = z.object({
  name: z.string().trim().min(2, "Name is too short").max(80),
  email: z.string().trim().toLowerCase().email("Enter a valid email"),
  password: z.string().min(8, "Password must be at least 8 characters").max(128),
});
export type RegisterInput = z.infer<typeof registerSchema>;

export const loginSchema = z.object({
  email: z.string().trim().toLowerCase().email("Enter a valid email"),
  password: z.string().min(1, "Password is required"),
});
export type LoginInput = z.infer<typeof loginSchema>;

export const updateProfileSchema = z.object({
  name: z.string().trim().min(2).max(80).optional(),
  bio: z.string().trim().max(600).nullable().optional(),
  avatarUrl: z.string().url().nullable().optional(),
});

export const listingInputSchema = z.object({
  title: z.string().trim().min(5, "Title is too short").max(120),
  description: z.string().trim().min(20, "Tell guests a bit more (20+ characters)").max(5000),
  propertyType: z.enum(PROPERTY_TYPE_VALUES),
  city: z.string().trim().min(1, "City is required").max(80),
  country: z.string().trim().min(1, "Country is required").max(80),
  address: z.string().trim().max(200).nullable().optional(),
  lat: z.number().min(-90).max(90).nullable().optional(),
  lng: z.number().min(-180).max(180).nullable().optional(),
  pricePerNight: z.number().int().min(100, "Minimum price is 1.00").max(100_000_00),
  cleaningFee: z.number().int().min(0).max(100_000_00).default(0),
  currency: z.string().length(3).default("USD"),
  maxGuests: z.number().int().min(1).max(50),
  bedrooms: z.number().int().min(0).max(50),
  beds: z.number().int().min(1).max(100),
  bathrooms: z.number().min(0).max(50),
  amenities: z.array(z.enum(AMENITY_KEYS)).default([]),
  images: z.array(z.string().url()).min(1, "Add at least one photo").max(20),
  instantBook: z.boolean().default(true),
  minNights: z.number().int().min(1).max(365).default(1),
  maxAdvanceDays: z.number().int().min(1).max(MAX_ADVANCE_DAYS_LIMIT).default(365),
  isActive: z.boolean().default(true),
});
export type ListingInput = z.infer<typeof listingInputSchema>;
export const listingUpdateSchema = listingInputSchema.partial();

export const listingSearchSchema = z.object({
  q: z.string().trim().max(100).optional(),
  checkIn: isoDateSchema.optional(),
  checkOut: isoDateSchema.optional(),
  guests: z.coerce.number().int().min(1).max(50).optional(),
  minPrice: z.coerce.number().int().min(0).optional(),
  maxPrice: z.coerce.number().int().min(0).optional(),
  type: z.enum(PROPERTY_TYPE_VALUES).optional(),
  instantBook: z
    .union([z.literal("true"), z.literal("false"), z.boolean()])
    .transform((v) => v === true || v === "true")
    .optional(),
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(50).default(24),
  sort: z.enum(["recommended", "price_asc", "price_desc", "rating"]).default("recommended"),
});
export type ListingSearchInput = z.infer<typeof listingSearchSchema>;

export const createBookingSchema = z
  .object({
    listingId: z.string().min(1),
    checkIn: isoDateSchema,
    checkOut: isoDateSchema,
    guests: z.number().int().min(1).max(50),
  })
  .refine((v) => v.checkOut > v.checkIn, {
    message: "Check-out must be after check-in",
    path: ["checkOut"],
  });
export type CreateBookingInput = z.infer<typeof createBookingSchema>;

export const createReviewSchema = z.object({
  bookingId: z.string().min(1),
  rating: z.number().int().min(1).max(5),
  comment: z.string().trim().min(10, "Say a little more (10+ characters)").max(2000),
});
export type CreateReviewInput = z.infer<typeof createReviewSchema>;
