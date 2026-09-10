import { BOOKING_STATUS, addDaysIso, diffDays, parseIsoDate, todayIso, toIsoDate, type DateRange } from "@staybnb/shared";
import type { Prisma, PrismaClient } from "@prisma/client";
import { badRequest, conflict } from "../lib/errors";
import { prisma } from "../lib/prisma";

type Db = PrismaClient | Prisma.TransactionClient;

/** Statuses that block dates on the calendar. */
const BLOCKING_STATUSES = [BOOKING_STATUS.CONFIRMED, BOOKING_STATUS.COMPLETED];

/** Booked [checkIn, checkOut) ranges for a listing from today onward (past stays are irrelevant to the calendar). */
export async function getBookedRanges(listingId: string, db: Db = prisma, from = todayIso()): Promise<DateRange[]> {
  const rows = await db.booking.findMany({
    where: { listingId, status: { in: BLOCKING_STATUSES }, checkOut: { gt: parseIsoDate(from) } },
    select: { checkIn: true, checkOut: true },
    orderBy: { checkIn: "asc" },
  });
  return rows.map((r) => ({ start: toIsoDate(r.checkIn), end: toIsoDate(r.checkOut) }));
}

export interface AvailabilityRules {
  minNights: number;
  maxAdvanceDays: number;
  isActive: boolean;
}

/**
 * Validate a requested stay against listing rules and existing bookings.
 * Throws an HttpError describing the first problem found.
 */
export async function assertAvailable(
  db: Db,
  listingId: string,
  rules: AvailabilityRules,
  checkIn: string,
  checkOut: string,
  now = new Date(),
) {
  const today = todayIso(now);
  if (!rules.isActive) throw badRequest("This listing is not accepting bookings right now");
  if (checkIn < today) throw badRequest("Check-in cannot be in the past");
  const nights = diffDays(checkIn, checkOut);
  if (nights < 1) throw badRequest("Stay must be at least one night");
  if (nights < rules.minNights) throw badRequest(`This place has a ${rules.minNights}-night minimum`);
  const latestCheckIn = addDaysIso(today, rules.maxAdvanceDays);
  if (checkIn > latestCheckIn) {
    throw badRequest(`This place can be booked at most ${rules.maxAdvanceDays} days in advance`);
  }

  const overlapping = await db.booking.findFirst({
    where: {
      listingId,
      status: { in: BLOCKING_STATUSES },
      checkIn: { lt: parseIsoDate(checkOut) },
      checkOut: { gt: parseIsoDate(checkIn) },
    },
    select: { checkIn: true, checkOut: true },
  });
  if (overlapping) {
    throw conflict("Those dates were just booked by someone else. Pick different dates.", {
      conflict: { start: toIsoDate(overlapping.checkIn), end: toIsoDate(overlapping.checkOut) },
    });
  }
  return nights;
}

/** Listing ids that have at least one blocking booking overlapping [checkIn, checkOut). */
export async function listingIdsBookedBetween(checkIn: string, checkOut: string): Promise<string[]> {
  const rows = await prisma.booking.findMany({
    where: {
      status: { in: BLOCKING_STATUSES },
      checkIn: { lt: parseIsoDate(checkOut) },
      checkOut: { gt: parseIsoDate(checkIn) },
    },
    select: { listingId: true },
    distinct: ["listingId"],
  });
  return rows.map((r) => r.listingId);
}
