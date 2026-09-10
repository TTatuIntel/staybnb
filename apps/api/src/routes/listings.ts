import { Router } from "express";
import type { Prisma } from "@prisma/client";
import { listingInputSchema, listingSearchSchema, listingUpdateSchema, type AvailabilityResponse, type ListingSearchResult } from "@staybnb/shared";
import { asyncHandler, forbidden, notFound, param, validate } from "../lib/errors";
import { prisma } from "../lib/prisma";
import { toListing, toListingSummary, toReview } from "../lib/serialize";
import { requireHost } from "../middleware/auth";
import { getBookedRanges, listingIdsBookedBetween } from "../services/availability";
import { EMPTY_STATS, ratingStatsFor } from "../services/ratings";
import { publishAvailability } from "../socket";

export const listingsRouter = Router();

const listingInclude = { images: true, host: true } satisfies Prisma.ListingInclude;

listingsRouter.get(
  "/",
  asyncHandler(async (req, res) => {
    const q = validate(listingSearchSchema, req.query);

    const where: Prisma.ListingWhereInput = { isActive: true };
    if (q.q) {
      // SQLite LIKE is case-insensitive for ASCII; Postgres users can add mode: "insensitive".
      where.OR = [{ city: { contains: q.q } }, { country: { contains: q.q } }, { title: { contains: q.q } }];
    }
    if (q.guests) where.maxGuests = { gte: q.guests };
    if (q.type) where.propertyType = q.type;
    if (q.instantBook) where.instantBook = true;
    if (q.minPrice !== undefined || q.maxPrice !== undefined) {
      where.pricePerNight = {
        ...(q.minPrice !== undefined ? { gte: q.minPrice } : {}),
        ...(q.maxPrice !== undefined ? { lte: q.maxPrice } : {}),
      };
    }
    if (q.checkIn && q.checkOut && q.checkOut > q.checkIn) {
      const busy = await listingIdsBookedBetween(q.checkIn, q.checkOut);
      if (busy.length) where.id = { notIn: busy };
    }

    const orderBy: Prisma.ListingOrderByWithRelationInput =
      q.sort === "price_asc" ? { pricePerNight: "asc" } : q.sort === "price_desc" ? { pricePerNight: "desc" } : { createdAt: "desc" };

    const [total, rows] = await Promise.all([
      prisma.listing.count({ where }),
      prisma.listing.findMany({
        where,
        include: { images: true },
        orderBy,
        skip: (q.page - 1) * q.pageSize,
        take: q.pageSize,
      }),
    ]);

    const stats = await ratingStatsFor(rows.map((r) => r.id));
    let items = rows.map((r) => toListingSummary(r, stats.get(r.id) ?? EMPTY_STATS));
    if (q.sort === "rating") items = items.sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0) || b.reviewCount - a.reviewCount);

    const result: ListingSearchResult = { items, total, page: q.page, pageSize: q.pageSize };
    res.json(result);
  }),
);

listingsRouter.get(
  "/:id",
  asyncHandler(async (req, res) => {
    const listing = await prisma.listing.findUnique({ where: { id: param(req, "id") }, include: listingInclude });
    if (!listing) throw notFound("Listing");
    const stats = await ratingStatsFor([listing.id]);
    res.json({ listing: toListing(listing, stats.get(listing.id) ?? EMPTY_STATS) });
  }),
);

listingsRouter.get(
  "/:id/availability",
  asyncHandler(async (req, res) => {
    const listing = await prisma.listing.findUnique({
      where: { id: param(req, "id") },
      select: { id: true, minNights: true, maxAdvanceDays: true },
    });
    if (!listing) throw notFound("Listing");
    const body: AvailabilityResponse = {
      listingId: listing.id,
      bookedRanges: await getBookedRanges(listing.id),
      minNights: listing.minNights,
      maxAdvanceDays: listing.maxAdvanceDays,
    };
    res.json(body);
  }),
);

listingsRouter.get(
  "/:id/reviews",
  asyncHandler(async (req, res) => {
    const reviews = await prisma.review.findMany({
      where: { listingId: param(req, "id") },
      include: { author: true },
      orderBy: { createdAt: "desc" },
      take: 100,
    });
    res.json({ reviews: reviews.map(toReview) });
  }),
);

listingsRouter.post(
  "/",
  requireHost,
  asyncHandler(async (req, res) => {
    const input = validate(listingInputSchema, req.body);
    const { images, amenities, ...rest } = input;
    const listing = await prisma.listing.create({
      data: {
        ...rest,
        hostId: req.user!.id,
        amenities: JSON.stringify(amenities),
        images: { create: images.map((url, position) => ({ url, position })) },
      },
      include: listingInclude,
    });
    res.status(201).json({ listing: toListing(listing, EMPTY_STATS) });
  }),
);

listingsRouter.patch(
  "/:id",
  requireHost,
  asyncHandler(async (req, res) => {
    const existing = await prisma.listing.findUnique({ where: { id: param(req, "id") } });
    if (!existing) throw notFound("Listing");
    if (existing.hostId !== req.user!.id) throw forbidden("You can only edit your own listings");
    const input = validate(listingUpdateSchema, req.body);
    const { images, amenities, ...rest } = input;
    const listing = await prisma.$transaction(async (tx) => {
      if (images) {
        await tx.listingImage.deleteMany({ where: { listingId: existing.id } });
        await tx.listingImage.createMany({ data: images.map((url, position) => ({ url, position, listingId: existing.id })) });
      }
      return tx.listing.update({
        where: { id: existing.id },
        data: { ...rest, ...(amenities ? { amenities: JSON.stringify(amenities) } : {}) },
        include: listingInclude,
      });
    });
    await publishAvailability(listing.id);
    const stats = await ratingStatsFor([listing.id]);
    res.json({ listing: toListing(listing, stats.get(listing.id) ?? EMPTY_STATS) });
  }),
);

listingsRouter.delete(
  "/:id",
  requireHost,
  asyncHandler(async (req, res) => {
    const existing = await prisma.listing.findUnique({ where: { id: param(req, "id") } });
    if (!existing) throw notFound("Listing");
    if (existing.hostId !== req.user!.id) throw forbidden("You can only delete your own listings");
    // Soft-delete so past bookings and reviews keep their history.
    await prisma.listing.update({ where: { id: existing.id }, data: { isActive: false } });
    res.json({ ok: true });
  }),
);
