"use client";

import { useEffect, useState } from "react";
import { SOCKET_EVENTS, type DateRange, type ListingAvailabilityEvent, type ListingBookedEvent, type ListingViewersEvent } from "@staybnb/shared";
import { getSocket } from "@/lib/socket";

export interface ListingLiveState {
  bookedRanges: DateRange[];
  minNights: number;
  maxAdvanceDays: number;
  viewers: number;
  lastBooked: ListingBookedEvent | null;
  connected: boolean;
}

/**
 * Subscribes to a listing's realtime room. The server pushes a fresh calendar
 * on join and whenever anyone books or cancels, so blocked dates never go stale.
 */
export function useListingLive(listingId: string, initial: Pick<ListingLiveState, "bookedRanges" | "minNights" | "maxAdvanceDays">): ListingLiveState {
  const [state, setState] = useState<ListingLiveState>({ ...initial, viewers: 0, lastBooked: null, connected: false });

  useEffect(() => {
    const socket = getSocket();
    const join = () => {
      socket.emit(SOCKET_EVENTS.LISTING_JOIN, listingId);
      setState((s) => ({ ...s, connected: true }));
    };
    const onAvailability = (e: ListingAvailabilityEvent) => {
      if (e.listingId !== listingId) return;
      setState((s) => ({ ...s, bookedRanges: e.bookedRanges, minNights: e.minNights, maxAdvanceDays: e.maxAdvanceDays }));
    };
    const onViewers = (e: ListingViewersEvent) => {
      if (e.listingId === listingId) setState((s) => ({ ...s, viewers: e.count }));
    };
    const onBooked = (e: ListingBookedEvent) => {
      if (e.listingId === listingId) setState((s) => ({ ...s, lastBooked: e }));
    };
    const onDisconnect = () => setState((s) => ({ ...s, connected: false }));

    socket.on("connect", join);
    socket.on("disconnect", onDisconnect);
    socket.on(SOCKET_EVENTS.LISTING_AVAILABILITY, onAvailability);
    socket.on(SOCKET_EVENTS.LISTING_VIEWERS, onViewers);
    socket.on(SOCKET_EVENTS.LISTING_BOOKED, onBooked);
    if (socket.connected) join();

    return () => {
      socket.emit(SOCKET_EVENTS.LISTING_LEAVE, listingId);
      socket.off("connect", join);
      socket.off("disconnect", onDisconnect);
      socket.off(SOCKET_EVENTS.LISTING_AVAILABILITY, onAvailability);
      socket.off(SOCKET_EVENTS.LISTING_VIEWERS, onViewers);
      socket.off(SOCKET_EVENTS.LISTING_BOOKED, onBooked);
    };
  }, [listingId]);

  return state;
}
