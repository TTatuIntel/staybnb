"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { calculatePrice, formatMoney, rangesOverlap, type AvailabilityResponse, type Booking, type Listing } from "@staybnb/shared";
import { useListingLive } from "@/hooks/useListingLive";
import { api, errorMessage } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";
import { fmtRange } from "@/lib/format";
import { useToast } from "@/lib/toast";
import { DateRangePicker } from "./DateRangePicker";
import { LiveBadge } from "./LiveBadge";
import { Rating } from "./Rating";
import { Button, Select } from "./ui";

export function BookingWidget({ listing, availability }: { listing: Listing; availability: AvailabilityResponse }) {
  const router = useRouter();
  const toast = useToast();
  const { user } = useAuth();
  const live = useListingLive(listing.id, availability);
  const [checkIn, setCheckIn] = useState<string | null>(null);
  const [checkOut, setCheckOut] = useState<string | null>(null);
  const [guests, setGuests] = useState(1);
  const [showCalendar, setShowCalendar] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isOwner = user?.id === listing.host.id;

  // If someone else books the nights we picked, the selection is void. This is
  // derived from the live calendar rather than stored, so it can never go stale.
  const clash = Boolean(checkIn && checkOut && live.bookedRanges.some((r) => rangesOverlap(checkIn, checkOut, r.start, r.end)));
  const effectiveCheckIn = clash ? null : checkIn;
  const effectiveCheckOut = clash ? null : checkOut;

  const quote = useMemo(
    () => (effectiveCheckIn && effectiveCheckOut ? calculatePrice({ ...listing, checkIn: effectiveCheckIn, checkOut: effectiveCheckOut }) : null),
    [listing, effectiveCheckIn, effectiveCheckOut],
  );

  const onDates = (a: string | null, b: string | null) => {
    setCheckIn(a);
    setCheckOut(b);
    setError(null);
    if (a && b) setShowCalendar(false);
  };

  const book = async () => {
    if (!effectiveCheckIn || !effectiveCheckOut) {
      setShowCalendar(true);
      return;
    }
    if (!user) {
      router.push(`/login?next=${encodeURIComponent(`/listings/${listing.id}`)}`);
      return;
    }
    setBusy(true);
    setError(null);
    try {
      const { booking } = await api<{ booking: Booking }>("/bookings", {
        method: "POST",
        body: { listingId: listing.id, checkIn: effectiveCheckIn, checkOut: effectiveCheckOut, guests },
      });
      toast.success("You're booked! 🎉");
      router.push(`/bookings/${booking.id}?new=1`);
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-float">
      <div className="flex items-baseline justify-between">
        <div>
          <span className="text-2xl font-semibold text-zinc-900">{formatMoney(listing.pricePerNight, listing.currency, { compact: true })}</span>
          <span className="text-zinc-500"> night</span>
        </div>
        <Rating value={listing.rating} count={listing.reviewCount} />
      </div>

      <div className="mt-4 overflow-hidden rounded-xl border border-zinc-300">
        <button type="button" onClick={() => setShowCalendar((v) => !v)} className="grid w-full grid-cols-2 divide-x divide-zinc-300 text-left">
          <span className="px-3 py-2">
            <span className="block text-[10px] font-bold uppercase tracking-wide text-zinc-600">Check-in</span>
            <span className="text-sm text-zinc-900">{effectiveCheckIn ?? "Add date"}</span>
          </span>
          <span className="px-3 py-2">
            <span className="block text-[10px] font-bold uppercase tracking-wide text-zinc-600">Checkout</span>
            <span className="text-sm text-zinc-900">{effectiveCheckOut ?? "Add date"}</span>
          </span>
        </button>
        <div className="border-t border-zinc-300 px-3 py-2">
          <label className="block text-[10px] font-bold uppercase tracking-wide text-zinc-600">Guests</label>
          <Select value={guests} onChange={(e) => setGuests(Number(e.target.value))} className="!h-8 !border-0 !px-0 !text-sm focus:!ring-0">
            {Array.from({ length: listing.maxGuests }, (_, i) => i + 1).map((n) => (
              <option key={n} value={n}>{n} guest{n > 1 ? "s" : ""}</option>
            ))}
          </Select>
        </div>
      </div>

      {showCalendar && (
        <div className="mt-4 rounded-xl border border-zinc-200 p-3">
          <DateRangePicker checkIn={effectiveCheckIn} checkOut={effectiveCheckOut} onChange={onDates} bookedRanges={live.bookedRanges} minNights={live.minNights} maxAdvanceDays={live.maxAdvanceDays} months={1} />
        </div>
      )}

      {isOwner ? (
        <div className="mt-4 rounded-xl bg-zinc-50 p-3 text-sm text-zinc-600">
          This is your listing. <Link href={`/host/listings/${listing.id}/edit`} className="font-medium underline">Edit it</Link>
        </div>
      ) : (
        <Button className="mt-4 w-full" size="lg" onClick={book} loading={busy} disabled={!listing.isActive}>
          {!listing.isActive ? "Not available" : effectiveCheckIn && effectiveCheckOut ? (listing.instantBook ? "Reserve instantly" : "Reserve") : "Check availability"}
        </Button>
      )}
      {clash && <p className="mt-3 text-sm text-red-600" role="alert">Sorry, those dates were just booked by someone else. Please pick new dates.</p>}
      {error && !clash && <p className="mt-3 text-sm text-red-600" role="alert">{error}</p>}
      {!effectiveCheckIn && !error && !clash && <p className="mt-3 text-center text-xs text-zinc-500">You won&apos;t be charged yet</p>}

      {quote && effectiveCheckIn && effectiveCheckOut && (
        <dl className="mt-4 space-y-2 border-t border-zinc-200 pt-4 text-sm text-zinc-700">
          <div className="flex justify-between"><dt className="underline decoration-dotted">{fmtRange(effectiveCheckIn, effectiveCheckOut)}</dt><dd>{quote.nights} night{quote.nights > 1 ? "s" : ""}</dd></div>
          <div className="flex justify-between"><dt>{formatMoney(quote.nightlyRate, quote.currency)} × {quote.nights}</dt><dd>{formatMoney(quote.subtotal, quote.currency)}</dd></div>
          {quote.cleaningFee > 0 && <div className="flex justify-between"><dt>Cleaning fee</dt><dd>{formatMoney(quote.cleaningFee, quote.currency)}</dd></div>}
          <div className="flex justify-between"><dt>Staybnb service fee</dt><dd>{formatMoney(quote.serviceFee, quote.currency)}</dd></div>
          <div className="flex justify-between border-t border-zinc-200 pt-2 text-base font-semibold text-zinc-900"><dt>Total</dt><dd>{formatMoney(quote.total, quote.currency)}</dd></div>
        </dl>
      )}

      <div className="mt-4 border-t border-zinc-200 pt-4">
        <LiveBadge viewers={live.viewers} lastBooked={live.lastBooked} connected={live.connected} />
      </div>
    </div>
  );
}
