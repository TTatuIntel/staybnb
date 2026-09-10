"use client";

import { useEffect } from "react";
import { SOCKET_EVENTS, type Booking } from "@staybnb/shared";
import { getSocket } from "@/lib/socket";

/** Fires when a booking is created or updated on any listing the signed-in user hosts or booked. */
export function useBookingFeed(handlers: { onCreated?: (b: Booking) => void; onUpdated?: (b: Booking) => void }) {
  const { onCreated, onUpdated } = handlers;
  useEffect(() => {
    const socket = getSocket();
    const created = (b: Booking) => onCreated?.(b);
    const updated = (b: Booking) => onUpdated?.(b);
    socket.on(SOCKET_EVENTS.BOOKING_CREATED, created);
    socket.on(SOCKET_EVENTS.BOOKING_UPDATED, updated);
    return () => {
      socket.off(SOCKET_EVENTS.BOOKING_CREATED, created);
      socket.off(SOCKET_EVENTS.BOOKING_UPDATED, updated);
    };
  }, [onCreated, onUpdated]);
}
