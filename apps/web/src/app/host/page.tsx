"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback, useState } from "react";
import { formatMoney, type Booking, type ListingSummary } from "@staybnb/shared";
import { Badge, Button, EmptyState, LinkButton, Skeleton } from "@/components/ui";
import { useAsyncData } from "@/hooks/useAsyncData";
import { useBookingFeed } from "@/hooks/useBookingFeed";
import { useRedirectUnlessSignedIn } from "@/hooks/useRedirectUnlessSignedIn";
import { api, errorMessage } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";
import { fmtRange } from "@/lib/format";
import { useToast } from "@/lib/toast";
import { StatusBadge } from "../trips/page";

type HostListing = ListingSummary & { isActive: boolean; bookingCount: number };
interface Stats { activeListings: number; upcomingStays: number; earnings: number }

export default function HostDashboard() {
  const { user, loading, becomeHost } = useAuth();
  const toast = useToast();
  const [busy, setBusy] = useState(false);

  const { data, setData, reload } = useAsyncData(
    useCallback(async () => {
      const [l, b, s] = await Promise.all([
        api<{ listings: HostListing[] }>("/host/listings"),
        api<{ bookings: Booking[] }>("/host/bookings"),
        api<{ stats: Stats }>("/host/stats"),
      ]);
      return { listings: l.listings, bookings: b.bookings, stats: s.stats };
    }, []),
    [],
    { enabled: Boolean(user?.isHost) },
  );
  const listings = data?.listings ?? null;
  const bookings = data?.bookings ?? null;
  const stats = data?.stats ?? null;

  useRedirectUnlessSignedIn("/host");

  useBookingFeed({
    onCreated: useCallback((b: Booking) => {
      toast.success(`New booking: ${b.guest?.name ?? "A guest"} reserved ${b.listing?.title ?? "your place"}`);
      setData((d) => (d ? { ...d, bookings: [b, ...d.bookings] } : d));
      reload();
    }, [toast, setData, reload]),
    onUpdated: useCallback((b: Booking) => {
      setData((d) => (d ? { ...d, bookings: d.bookings.map((x) => (x.id === b.id ? b : x)) } : d));
      reload();
    }, [setData, reload]),
  });

  if (loading || !user) return <div className="mx-auto max-w-6xl px-4 py-10"><Skeleton className="h-40" /></div>;

  if (!user.isHost) {
    const onBecome = async () => {
      setBusy(true);
      try { await becomeHost(); toast.success("You're a host now. Add your first place!"); } catch (e) { toast.error(errorMessage(e)); } finally { setBusy(false); }
    };
    return (
      <div className="mx-auto max-w-2xl px-4 py-16 text-center">
        <p className="text-5xl">🏡</p>
        <h1 className="mt-4 text-3xl font-bold text-zinc-900">Share your space on Staybnb</h1>
        <p className="mt-3 text-zinc-600">List your home in minutes. Guests can book instantly, and your calendar stays in sync in real time across every device.</p>
        <Button size="lg" className="mt-6" onClick={onBecome} loading={busy}>Become a host</Button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div><h1 className="text-2xl font-semibold text-zinc-900">Host dashboard</h1><p className="text-sm text-zinc-500">New bookings appear here the moment they happen.</p></div>
        <LinkButton href="/host/listings/new">+ New listing</LinkButton>
      </div>

      <div className="mt-6 grid grid-cols-3 gap-4">
        {[["Active listings", stats?.activeListings], ["Upcoming stays", stats?.upcomingStays], ["Earnings", stats ? formatMoney(stats.earnings, "USD", { compact: true }) : undefined]].map(([label, value]) => (
          <div key={String(label)} className="rounded-2xl border border-zinc-200 p-4"><div className="text-xs font-medium uppercase tracking-wide text-zinc-500">{label}</div><div className="mt-1 text-2xl font-semibold text-zinc-900">{value ?? "–"}</div></div>
        ))}
      </div>

      <section className="mt-10">
        <h2 className="text-lg font-semibold text-zinc-900">Your listings</h2>
        {!listings ? <Skeleton className="mt-3 h-32" /> : listings.length === 0 ? (
          <div className="mt-3"><EmptyState title="No listings yet" body="Publish your first place and start welcoming guests." action={<LinkButton href="/host/listings/new">Create a listing</LinkButton>} /></div>
        ) : (
          <ul className="mt-3 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {listings.map((l) => (
              <li key={l.id} className="flex gap-3 rounded-2xl border border-zinc-200 p-3">
                <Link href={`/listings/${l.id}`} className="relative h-20 w-28 shrink-0 overflow-hidden rounded-xl bg-zinc-100">{l.images[0] && <Image src={l.images[0].url} alt="" fill sizes="112px" className="object-cover" />}</Link>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2"><Link href={`/listings/${l.id}`} className="truncate font-semibold text-zinc-900 hover:underline">{l.title}</Link>{!l.isActive && <Badge tone="warning">Hidden</Badge>}</div>
                  <p className="text-xs text-zinc-500">{l.city} · {formatMoney(l.pricePerNight, l.currency, { compact: true })}/night · {l.bookingCount} booking{l.bookingCount === 1 ? "" : "s"}</p>
                  <Link href={`/host/listings/${l.id}/edit`} className="mt-2 inline-block text-xs font-semibold text-zinc-700 underline">Edit</Link>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="mt-10">
        <h2 className="text-lg font-semibold text-zinc-900">Reservations</h2>
        {!bookings ? <Skeleton className="mt-3 h-32" /> : bookings.length === 0 ? <p className="mt-2 text-sm text-zinc-500">No reservations yet.</p> : (
          <div className="mt-3 overflow-x-auto rounded-2xl border border-zinc-200">
            <table className="w-full text-sm">
              <thead className="bg-zinc-50 text-left text-xs uppercase tracking-wide text-zinc-500"><tr><th className="px-4 py-3">Guest</th><th className="px-4 py-3">Listing</th><th className="px-4 py-3">Dates</th><th className="px-4 py-3">Total</th><th className="px-4 py-3">Status</th></tr></thead>
              <tbody className="divide-y divide-zinc-100">
                {bookings.map((b) => (
                  <tr key={b.id} className="animate-fade-up">
                    <td className="px-4 py-3 font-medium text-zinc-900">{b.guest?.name}</td>
                    <td className="max-w-56 truncate px-4 py-3 text-zinc-700"><Link href={`/listings/${b.listingId}`} className="hover:underline">{b.listing?.title}</Link></td>
                    <td className="whitespace-nowrap px-4 py-3 text-zinc-700">{fmtRange(b.checkIn, b.checkOut)}</td>
                    <td className="px-4 py-3 text-zinc-900">{formatMoney(b.total, b.currency)}</td>
                    <td className="px-4 py-3"><Link href={`/bookings/${b.id}`}><StatusBadge status={b.status} /></Link></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
