import { Router } from "express";
import { BOOKING_STATUS, parseIsoDate, todayIso } from "@staybnb/shared";
import { asyncHandler } from "../lib/errors";
import { prisma } from "../lib/prisma";
import { toBooking, toListingSummary } from "../lib/serialize";
import { requireHost } from "../middleware/auth";
import { completePastStays } from "../services/bookings";
import { EMPTY_STATS, ratingStatsFor } from "../services/ratings";

export const hostRouter = Router();
hostRouter.use(requireHost);

hostRouter.get(
  "/listings",
  asyncHandler(async (req, res) => {
    const rows = await prisma.listing.findMany({
      where: { hostId: req.user!.id },
      include: { images: true, _count: { select: { bookings: true } } },
      orderBy: { createdAt: "desc" },
    });
    const stats = await ratingStatsFor(rows.map((r) => r.id));
    res.json({
      listings: rows.map((r) => ({
        ...toListingSummary(r, stats.get(r.id) ?? EMPTY_STATS),
        isActive: r.isActive,
        bookingCount: r._count.bookings,
      })),
    });
  }),
);

hostRouter.get(
  "/bookings",
  asyncHandler(async (req, res) => {
    await completePastStays({ hostId: req.user!.id });
    const rows = await prisma.booking.findMany({
      where: { listing: { hostId: req.user!.id } },
      include: { listing: { include: { images: true, host: true } }, guest: true, review: { include: { author: true } } },
      orderBy: { checkIn: "desc" },
      take: 200,
    });
    res.json({ bookings: rows.map((r) => toBooking(r)) });
  }),
);

hostRouter.get(
  "/stats",
  asyncHandler(async (req, res) => {
    const hostId = req.user!.id;
    const today = parseIsoDate(todayIso());
    const [activeListings, upcomingStays, revenue] = await Promise.all([
      prisma.listing.count({ where: { hostId, isActive: true } }),
      prisma.booking.count({ where: { listing: { hostId }, status: BOOKING_STATUS.CONFIRMED, checkIn: { gte: today } } }),
      prisma.booking.aggregate({
        where: { listing: { hostId }, status: { in: [BOOKING_STATUS.CONFIRMED, BOOKING_STATUS.COMPLETED] } },
        _sum: { subtotal: true, cleaningFee: true },
      }),
    ]);
    res.json({
      stats: {
        activeListings,
        upcomingStays,
        earnings: (revenue._sum.subtotal ?? 0) + (revenue._sum.cleaningFee ?? 0),
      },
    });
  }),
);
