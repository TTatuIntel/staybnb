import { Router } from "express";
import { BOOKING_STATUS, createReviewSchema } from "@staybnb/shared";
import { asyncHandler, badRequest, conflict, forbidden, notFound, validate } from "../lib/errors";
import { prisma } from "../lib/prisma";
import { toReview } from "../lib/serialize";
import { requireAuth } from "../middleware/auth";
import { completePastStays } from "../services/bookings";

/** Exactly one review is allowed per completed stay, written by the guest. */
export const reviewsRouter = Router();
reviewsRouter.use(requireAuth);

reviewsRouter.post(
  "/",
  asyncHandler(async (req, res) => {
    const input = validate(createReviewSchema, req.body);
    await completePastStays({ guestId: req.user!.id });
    const booking = await prisma.booking.findUnique({ where: { id: input.bookingId }, include: { review: true } });
    if (!booking) throw notFound("Booking");
    if (booking.guestId !== req.user!.id) throw forbidden("Only the guest can review this stay");
    if (booking.status !== BOOKING_STATUS.COMPLETED) throw badRequest("You can review a stay once it is over");
    if (booking.review) throw conflict("You already reviewed this stay");
    const review = await prisma.review.create({
      data: {
        bookingId: booking.id,
        listingId: booking.listingId,
        authorId: req.user!.id,
        rating: input.rating,
        comment: input.comment,
      },
      include: { author: true },
    });
    res.status(201).json({ review: toReview(review) });
  }),
);
