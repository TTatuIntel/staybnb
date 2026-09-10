import type { Server as HttpServer } from "node:http";
import { Server, type Socket } from "socket.io";
import { SOCKET_EVENTS, type Booking, type ListingAvailabilityEvent, type ListingBookedEvent, type ListingViewersEvent } from "@staybnb/shared";
import { AUTH_COOKIE, verifyToken } from "./lib/auth";
import { env } from "./lib/env";
import { getBookedRanges } from "./services/availability";
import { prisma } from "./lib/prisma";

let io: Server | null = null;

const listingRoom = (listingId: string) => `listing:${listingId}`;
const userRoom = (userId: string) => `user:${userId}`;

function parseCookie(header: string | undefined, name: string): string | null {
  if (!header) return null;
  for (const part of header.split(";")) {
    const [k, ...rest] = part.trim().split("=");
    if (k === name) return decodeURIComponent(rest.join("="));
  }
  return null;
}

/** Resolve the user id from a Bearer token (mobile) or the auth cookie (web). */
function userIdFromSocket(socket: Socket): string | null {
  const auth = socket.handshake.auth as { token?: string } | undefined;
  const header = socket.handshake.headers.authorization;
  const token = auth?.token ?? (header?.startsWith("Bearer ") ? header.slice(7) : null) ?? parseCookie(socket.handshake.headers.cookie, AUTH_COOKIE);
  if (!token) return null;
  return verifyToken(token)?.sub ?? null;
}

function viewerCount(listingId: string): number {
  return io?.sockets.adapter.rooms.get(listingRoom(listingId))?.size ?? 0;
}

function broadcastViewers(listingId: string) {
  const payload: ListingViewersEvent = { listingId, count: viewerCount(listingId) };
  io?.to(listingRoom(listingId)).emit(SOCKET_EVENTS.LISTING_VIEWERS, payload);
}

export function initSocket(server: HttpServer): Server {
  io = new Server(server, {
    cors: { origin: env.CORS_ORIGINS, credentials: true },
  });

  io.on("connection", (socket) => {
    const userId = userIdFromSocket(socket);
    if (userId) socket.join(userRoom(userId));

    socket.on(SOCKET_EVENTS.LISTING_JOIN, async (listingId: unknown) => {
      if (typeof listingId !== "string" || !listingId) return;
      // A socket watches one listing at a time.
      for (const room of socket.rooms) {
        if (room.startsWith("listing:") && room !== listingRoom(listingId)) {
          socket.leave(room);
          broadcastViewers(room.slice("listing:".length));
        }
      }
      socket.join(listingRoom(listingId));
      broadcastViewers(listingId);
      // Send the newcomer a fresh calendar so they never start stale.
      const listing = await prisma.listing.findUnique({
        where: { id: listingId },
        select: { minNights: true, maxAdvanceDays: true },
      });
      if (!listing) return;
      const payload: ListingAvailabilityEvent = {
        listingId,
        bookedRanges: await getBookedRanges(listingId),
        minNights: listing.minNights,
        maxAdvanceDays: listing.maxAdvanceDays,
      };
      socket.emit(SOCKET_EVENTS.LISTING_AVAILABILITY, payload);
    });

    socket.on(SOCKET_EVENTS.LISTING_LEAVE, (listingId: unknown) => {
      if (typeof listingId !== "string") return;
      socket.leave(listingRoom(listingId));
      broadcastViewers(listingId);
    });

    socket.on("disconnecting", () => {
      for (const room of socket.rooms) {
        if (room.startsWith("listing:")) {
          const id = room.slice("listing:".length);
          // Room still contains this socket until fully disconnected; subtract it.
          const payload: ListingViewersEvent = { listingId: id, count: Math.max(0, viewerCount(id) - 1) };
          socket.to(room).emit(SOCKET_EVENTS.LISTING_VIEWERS, payload);
        }
      }
    });
  });

  return io;
}

/** Push the latest calendar for a listing to everyone currently looking at it. */
export async function publishAvailability(listingId: string, bookedRange?: { start: string; end: string }) {
  if (!io) return;
  const listing = await prisma.listing.findUnique({
    where: { id: listingId },
    select: { minNights: true, maxAdvanceDays: true },
  });
  if (!listing) return;
  const payload: ListingAvailabilityEvent = {
    listingId,
    bookedRanges: await getBookedRanges(listingId),
    minNights: listing.minNights,
    maxAdvanceDays: listing.maxAdvanceDays,
  };
  io.to(listingRoom(listingId)).emit(SOCKET_EVENTS.LISTING_AVAILABILITY, payload);
  if (bookedRange) {
    const booked: ListingBookedEvent = { listingId, range: bookedRange, at: new Date().toISOString() };
    io.to(listingRoom(listingId)).emit(SOCKET_EVENTS.LISTING_BOOKED, booked);
  }
}

/** Notify a host (or guest) about a booking on their dashboard. */
export function notifyUser(userId: string, event: typeof SOCKET_EVENTS.BOOKING_CREATED | typeof SOCKET_EVENTS.BOOKING_UPDATED, booking: Booking) {
  io?.to(userRoom(userId)).emit(event, booking);
}
