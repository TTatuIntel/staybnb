"use client";

import Image from "next/image";
import Link from "next/link";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { BOOKING_STATUS, formatMoney, type Booking } from "@staybnb/shared";
import { Badge, LinkButton, Skeleton } from "@/components/ui";
import { api, errorMessage } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";
import { fmtDate, fmtDateTime } from "@/lib/format";

export default function BookingPage() {
  const { id } = useParams<{ id: string }>();
  const sp = useSearchParams();
  const router = useRouter();
  const { user, loading } = useAuth();
  const [booking, setBooking] = useState<Booking | null>(null);
  const [error, setError] = useState<string | null>(null);
  const isNew = sp.get("new") === "1";

  useEffect(() => {
    if (loading) return;
    if (!user) {
      router.replace(`/login?next=${encodeURIComponent(`/bookings/${id}`)}`);
      return;
    }
    api<{ booking: Booking }>(`/bookings/${id}`).then((r) => setBooking(r.booking)).catch((e) => setError(errorMessage(e)));
  }, [id, user, loading, router]);

  if (error) return <div className="mx-auto max-w-2xl px-4 py-16 text-center text-zinc-600">{error}</div>;
  if (!booking) return <div className="mx-auto max-w-2xl px-4 py-10"><Skeleton className="h-64" /></div>;

  const l = booking.listing;
  const isHostView = user?.id === l?.host?.id;
  return (
    <div className="mx-auto max-w-2xl px-4 py-10 sm:px-6">
      {isNew && booking.status === BOOKING_STATUS.CONFIRMED && (
        <div className="mb-6 animate-fade-up rounded-2xl bg-emerald-50 p-5 text-emerald-900">
          <div className="text-2xl">🎉</div>
          <h1 className="mt-1 text-xl font-semibold">Your stay is confirmed</h1>
          <p className="text-sm">We&apos;ve locked in your dates. Everyone else looking at this place just saw them disappear from the calendar.</p>
        </div>
      )}
      <div className="overflow-hidden rounded-2xl border border-zinc-200">
        {l?.images[0] && (
          <div className="relative aspect-[2/1] bg-zinc-100">
            <Image src={l.images[0].url} alt="" fill sizes="(max-width: 672px) 100vw, 672px" className="object-cover" />
          </div>
        )}
        <div className="p-6">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <Link href={`/listings/${booking.listingId}`} className="text-lg font-semibold text-zinc-900 hover:underline">{l?.title}</Link>
            <Badge tone={booking.status === BOOKING_STATUS.CONFIRMED ? "success" : booking.status === BOOKING_STATUS.CANCELLED ? "danger" : "neutral"}>{booking.status.toLowerCase()}</Badge>
          </div>
          <p className="text-sm text-zinc-500">{l?.city}, {l?.country}{l?.host ? ` · Hosted by ${l.host.name}` : ""}</p>

          <dl className="mt-6 grid grid-cols-2 gap-4 rounded-xl bg-zinc-50 p-4 text-sm">
            <div><dt className="text-zinc-500">Check-in</dt><dd className="font-semibold text-zinc-900">{fmtDate(booking.checkIn, "EEE, MMM d, yyyy")}</dd></div>
            <div><dt className="text-zinc-500">Check-out</dt><dd className="font-semibold text-zinc-900">{fmtDate(booking.checkOut, "EEE, MMM d, yyyy")}</dd></div>
            <div><dt className="text-zinc-500">Guests</dt><dd className="font-semibold text-zinc-900">{booking.guests}</dd></div>
            <div><dt className="text-zinc-500">{isHostView ? "Guest" : "Booked"}</dt><dd className="font-semibold text-zinc-900">{isHostView ? booking.guest?.name : fmtDateTime(booking.createdAt)}</dd></div>
          </dl>

          <dl className="mt-6 space-y-2 text-sm text-zinc-700">
            <div className="flex justify-between"><dt>{formatMoney(booking.subtotal / booking.nights, booking.currency)} × {booking.nights} night{booking.nights > 1 ? "s" : ""}</dt><dd>{formatMoney(booking.subtotal, booking.currency)}</dd></div>
            {booking.cleaningFee > 0 && <div className="flex justify-between"><dt>Cleaning fee</dt><dd>{formatMoney(booking.cleaningFee, booking.currency)}</dd></div>}
            <div className="flex justify-between"><dt>Service fee</dt><dd>{formatMoney(booking.serviceFee, booking.currency)}</dd></div>
            <div className="flex justify-between border-t border-zinc-200 pt-2 text-base font-semibold text-zinc-900"><dt>Total</dt><dd>{formatMoney(booking.total, booking.currency)}</dd></div>
          </dl>
          <p className="mt-2 text-xs text-zinc-500">Booking reference: <span className="font-mono">{booking.id}</span></p>

          <div className="mt-6 flex flex-wrap gap-2">
            <LinkButton href={isHostView ? "/host" : "/trips"} variant="secondary">{isHostView ? "Back to dashboard" : "View all trips"}</LinkButton>
            <LinkButton href="/search" variant="ghost">Keep exploring</LinkButton>
          </div>
        </div>
      </div>
    </div>
  );
}
