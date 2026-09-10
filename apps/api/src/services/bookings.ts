import { BOOKING_STATUS, parseIsoDate, todayIso } from "@staybnb/shared";
import { prisma } from "../lib/prisma";

/**
 * Mark confirmed stays whose check-out date has passed as COMPLETED so guests
 * can review them. Called lazily when bookings are listed; a cron could do the same.
 */
export async function completePastStays(scope: { guestId?: string; hostId?: string } = {}) {
  await prisma.booking.updateMany({
    where: {
      status: BOOKING_STATUS.CONFIRMED,
      checkOut: { lte: parseIsoDate(todayIso()) },
      ...(scope.guestId ? { guestId: scope.guestId } : {}),
      ...(scope.hostId ? { listing: { hostId: scope.hostId } } : {}),
    },
    data: { status: BOOKING_STATUS.COMPLETED },
  });
}
