"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback, useState } from "react";
import { BOOKING_STATUS, formatMoney, todayIso, type Booking, type Review } from "@staybnb/shared";
import { ReviewForm } from "@/components/ReviewForm";
import { Badge, Button, EmptyState, LinkButton, Skeleton } from "@/components/ui";
import { useAsyncData } from "@/hooks/useAsyncData";
import { useBookingFeed } from "@/hooks/useBookingFeed";
import { useRedirectUnlessSignedIn } from "@/hooks/useRedirectUnlessSignedIn";
import { api, errorMessage } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";
import { fmtRange } from "@/lib/format";
import { useToast } from "@/lib/toast";

export default function TripsPage() {
  const { user } = useAuth();
  const toast = useToast();
  const [reviewing, setReviewing] = useState<string | null>(null);

  const { data: bookings, setData } = useAsyncData(
    useCallback(async () => (await api<{ bookings: Booking[] }>("/bookings/mine")).bookings, []),
    [],
    { enabled: Boolean(user) },
  );

  useRedirectUnlessSignedIn("/trips");

  useBookingFeed({
    onUpdated: useCallback((b: Booking) => setData((bs) => bs?.map((x) => (x.id === b.id ? { ...x, ...b, review: x.review } : x)) ?? null), [setData]),
  });

  const cancel = async (b: Booking) => {
    if (!confirm(`Cancel your stay at ${b.listing?.title}? This cannot be undone.`)) return;
    try {
      const { booking } = await api<{ booking: Booking }>(`/bookings/${b.id}/cancel`, { method: "POST" });
      setData((bs) => bs?.map((x) => (x.id === booking.id ? booking : x)) ?? null);
      toast.info("Booking cancelled");
    } catch (e) {
      toast.error(errorMessage(e));
    }
  };

  const onReviewed = (bookingId: string, review: Review) => {
    setData((bs) => bs?.map((x) => (x.id === bookingId ? { ...x, review } : x)) ?? null);
    setReviewing(null);
  };

  const today = todayIso();
  const upcoming = bookings?.filter((b) => b.status === BOOKING_STATUS.CONFIRMED && b.checkOut > today) ?? [];
  const past = bookings?.filter((b) => !(b.status === BOOKING_STATUS.CONFIRMED && b.checkOut > today)) ?? [];

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
      <h1 className="text-2xl font-semibold text-zinc-900">Trips</h1>
      <p className="text-sm text-zinc-500">Your upcoming stays and past adventures.</p>

      {!bookings ? (
        <div className="mt-6 space-y-4">{[0, 1, 2].map((i) => <Skeleton key={i} className="h-32" />)}</div>
      ) : bookings.length === 0 ? (
        <div className="mt-8"><EmptyState title="No trips booked… yet" body="Time to dust off your bags and start planning your next adventure." action={<LinkButton href="/search">Start searching</LinkButton>} /></div>
      ) : (
        <>
          <Section title="Upcoming" bookings={upcoming} empty="Nothing coming up. Book your next stay!" render={(b) => (
            <div className="flex gap-2">
              <LinkButton href={`/bookings/${b.id}`} variant="secondary" size="sm">Details</LinkButton>
              {b.checkIn > today && <Button variant="danger" size="sm" onClick={() => cancel(b)}>Cancel</Button>}
            </div>
          )} />
          <Section title="Where you've been" bookings={past} empty="Your completed stays will show up here." render={(b) => (
            b.status === BOOKING_STATUS.COMPLETED ? (
              b.review ? (
                <p className="text-sm text-zinc-600">You rated this stay {b.review.rating}/5 · <Link href={`/listings/${b.listingId}#reviews`} className="underline">see reviews</Link></p>
              ) : reviewing === b.id ? (
                <ReviewForm bookingId={b.id} onDone={(r) => onReviewed(b.id, r)} onCancel={() => setReviewing(null)} />
              ) : (
                <Button size="sm" onClick={() => setReviewing(b.id)}>Write a review</Button>
              )
            ) : null
          )} />
        </>
      )}
    </div>
  );
}

function Section({ title, bookings, empty, render }: { title: string; bookings: Booking[]; empty: string; render: (b: Booking) => React.ReactNode }) {
  return (
    <section className="mt-8">
      <h2 className="text-lg font-semibold text-zinc-900">{title}</h2>
      {bookings.length === 0 ? <p className="mt-2 text-sm text-zinc-500">{empty}</p> : (
        <ul className="mt-3 space-y-4">
          {bookings.map((b) => (
            <li key={b.id} className="flex flex-col gap-4 rounded-2xl border border-zinc-200 p-4 sm:flex-row">
              <Link href={`/listings/${b.listingId}`} className="relative aspect-[4/3] w-full shrink-0 overflow-hidden rounded-xl bg-zinc-100 sm:w-44">
                {b.listing?.images[0] && <Image src={b.listing.images[0].url} alt="" fill sizes="176px" className="object-cover" />}
              </Link>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <Link href={`/listings/${b.listingId}`} className="font-semibold text-zinc-900 hover:underline">{b.listing?.title ?? "Listing"}</Link>
                  <StatusBadge status={b.status} />
                </div>
                <p className="text-sm text-zinc-500">{b.listing?.city}, {b.listing?.country}</p>
                <p className="mt-1 text-sm text-zinc-700">{fmtRange(b.checkIn, b.checkOut)} · {b.guests} guest{b.guests > 1 ? "s" : ""} · <span className="font-medium">{formatMoney(b.total, b.currency)}</span></p>
                <div className="mt-3">{render(b)}</div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

export function StatusBadge({ status }: { status: string }) {
  if (status === BOOKING_STATUS.CONFIRMED) return <Badge tone="success">Confirmed</Badge>;
  if (status === BOOKING_STATUS.COMPLETED) return <Badge tone="neutral">Completed</Badge>;
  if (status === BOOKING_STATUS.CANCELLED) return <Badge tone="danger">Cancelled</Badge>;
  return <Badge>{status}</Badge>;
}
