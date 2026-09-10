import { Router } from "express";
import { BOOKING_STATUS, SOCKET_EVENTS, calculatePrice, createBookingSchema, parseIsoDate, todayIso, toIsoDate } from "@staybnb/shared";
import { asyncHandler, badRequest, forbidden, notFound, param, validate } from "../lib/errors";
import { prisma } from "../lib/prisma";
import { toBooking } from "../lib/serialize";
import { requireAuth } from "../middleware/auth";
import { assertAvailable } from "../services/availability";
import { completePastStays } from "../services/bookings";
import { ratingStatsFor } from "../services/ratings";
import { notifyUser, publishAvailability } from "../socket";

export const bookingsRouter = Router();
bookingsRouter.use(requireAuth);

export const bookingInclude = {
  listing: { include: { images: true, host: true } },
  guest: true,
  review: { include: { author: true } },
} as const;

/** Quote a stay without booking it (clients use this to show a live, server-verified price). */
bookingsRouter.post(
  "/quote",
  asyncHandler(async (req, res) => {
    const input = validate(createBookingSchema, req.body);
    const listing = await prisma.listing.findUnique({ where: { id: input.listingId } });
    if (!listing) throw notFound("Listing");
    if (input.guests > listing.maxGuests) throw badRequest(`This place sleeps up to ${listing.maxGuests} guests`);
    await assertAvailable(prisma, listing.id, listing, input.checkIn, input.checkOut);
    res.json({ quote: calculatePrice({ ...listing, checkIn: input.checkIn, checkOut: input.checkOut }) });
  }),
);

bookingsRouter.post(
  "/",
  asyncHandler(async (req, res) => {
    const input = validate(createBookingSchema, req.body);
    const guest = req.user!;

    const created = await prisma.$transaction(async (tx) => {
      const listing = await tx.listing.findUnique({ where: { id: input.listingId } });
      if (!listing) throw notFound("Listing");
      if (listing.hostId === guest.id) throw badRequest("You cannot book your own listing");
      if (input.guests > listing.maxGuests) throw badRequest(`This place sleeps up to ${listing.maxGuests} guests`);

      // Availability is re-checked inside the write transaction so two guests
      // racing for the same nights cannot both succeed.
      const nights = await assertAvailable(tx, listing.id, listing, input.checkIn, input.checkOut);
      const price = calculatePrice({ ...listing, checkIn: input.checkIn, checkOut: input.checkOut });

      return tx.booking.create({
        data: {
          listingId: listing.id,
          guestId: guest.id,
          checkIn: parseIsoDate(input.checkIn),
          checkOut: parseIsoDate(input.checkOut),
          guests: input.guests,
          nights,
          subtotal: price.subtotal,
          cleaningFee: price.cleaningFee,
          serviceFee: price.serviceFee,
          total: price.total,
          currency: listing.currency,
          status: BOOKING_STATUS.CONFIRMED,
        },
        include: bookingInclude,
      });
    });

    const booking = toBooking(created);
    // Realtime: everyone viewing this listing sees the dates disappear immediately.
    await publishAvailability(created.listingId, { start: booking.checkIn, end: booking.checkOut });
    notifyUser(created.listing.hostId, SOCKET_EVENTS.BOOKING_CREATED, booking);

    res.status(201).json({ booking });
  }),
);

bookingsRouter.get(
  "/mine",
  asyncHandler(async (req, res) => {
    await completePastStays({ guestId: req.user!.id });
    const rows = await prisma.booking.findMany({
      where: { guestId: req.user!.id },
      include: bookingInclude,
      orderBy: { checkIn: "desc" },
    });
    const stats = await ratingStatsFor(rows.map((r) => r.listingId));
    res.json({ bookings: rows.map((r) => toBooking(r, stats.get(r.listingId))) });
  }),
);

bookingsRouter.get(
  "/:id",
  asyncHandler(async (req, res) => {
    const row = await prisma.booking.findUnique({ where: { id: param(req, "id") }, include: bookingInclude });
    if (!row) throw notFound("Booking");
    const me = req.user!.id;
    if (row.guestId !== me && row.listing.hostId !== me) throw forbidden();
    res.json({ booking: toBooking(row) });
  }),
);

bookingsRouter.post(
  "/:id/cancel",
  asyncHandler(async (req, res) => {
    const row = await prisma.booking.findUnique({ where: { id: param(req, "id") }, include: bookingInclude });
    if (!row) throw notFound("Booking");
    const me = req.user!.id;
    const isGuest = row.guestId === me;
    const isHost = row.listing.hostId === me;
    if (!isGuest && !isHost) throw forbidden();
    if (row.status !== BOOKING_STATUS.CONFIRMED) throw badRequest("Only confirmed bookings can be cancelled");
    if (isGuest && !isHost && toIsoDate(row.checkIn) <= todayIso()) {
      throw badRequest("This stay has already started and can no longer be cancelled");
    }
    const updated = await prisma.booking.update({
      where: { id: row.id },
      data: { status: BOOKING_STATUS.CANCELLED },
      include: bookingInclude,
    });
    const booking = toBooking(updated);
    await publishAvailability(updated.listingId);
    notifyUser(updated.listing.hostId, SOCKET_EVENTS.BOOKING_UPDATED, booking);
    notifyUser(updated.guestId, SOCKET_EVENTS.BOOKING_UPDATED, booking);
    res.json({ booking });
  }),
);
