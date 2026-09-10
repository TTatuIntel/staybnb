import { Suspense } from "react";
import type { ListingSearchResult } from "@staybnb/shared";
import { ListingCard } from "@/components/ListingCard";
import { SearchBar } from "@/components/SearchBar";
import { LinkButton } from "@/components/ui";
import { api } from "@/lib/api";

export const dynamic = "force-dynamic";

async function loadFeatured(): Promise<ListingSearchResult | null> {
  try {
    return await api<ListingSearchResult>("/listings?pageSize=8&sort=rating", { cache: "no-store" });
  } catch {
    return null;
  }
}

export default async function HomePage() {
  const featured = await loadFeatured();
  return (
    <div>
      <section className="relative overflow-hidden bg-gradient-to-b from-brand-50 to-white">
        <div className="mx-auto max-w-7xl px-4 pb-16 pt-14 sm:px-6 sm:pt-20">
          <div className="mx-auto max-w-3xl text-center">
            <span className="inline-flex items-center gap-2 rounded-full border border-brand-200 bg-white px-3 py-1 text-xs font-semibold text-brand-700">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse-soft" /> Live availability on every stay
            </span>
            <h1 className="mt-5 text-4xl font-bold tracking-tight text-zinc-900 sm:text-5xl">
              Book tonight, or next summer.
            </h1>
            <p className="mt-4 text-lg text-zinc-600">
              Homes, cabins and villas you can reserve instantly. Calendars update the moment someone books, so you never chase dates that are already gone.
            </p>
          </div>
          <div className="mx-auto mt-8 max-w-4xl">
            <Suspense>
              <SearchBar />
            </Suspense>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
        <div className="flex items-end justify-between">
          <div>
            <h2 className="text-2xl font-semibold text-zinc-900">Top-rated stays</h2>
            <p className="text-sm text-zinc-500">Loved by guests, ready to book right now.</p>
          </div>
          <LinkButton href="/search" variant="secondary" size="sm">Explore all</LinkButton>
        </div>
        {featured === null ? (
          <div className="mt-8 rounded-2xl border border-amber-200 bg-amber-50 p-6 text-sm text-amber-800">
            Could not reach the Staybnb API. Start it with <code className="rounded bg-amber-100 px-1">npm run dev:api</code> and refresh.
          </div>
        ) : (
          <div className="mt-6 grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-2 lg:grid-cols-4">
            {featured.items.map((l) => <ListingCard key={l.id} listing={l} />)}
          </div>
        )}
      </section>

      <section className="mx-auto max-w-7xl px-4 pb-8 sm:px-6">
        <div className="grid gap-6 sm:grid-cols-3">
          {[
            ["⚡", "Instant booking", "Most places confirm the second you reserve. No waiting on a host."],
            ["📅", "Plan far ahead", "Reserve up to two years in advance and lock in the dates that matter."],
            ["⭐", "Honest reviews", "Only guests who actually stayed can leave a review, one per trip."],
          ].map(([icon, title, body]) => (
            <div key={title} className="rounded-2xl border border-zinc-200 p-6">
              <div className="text-2xl">{icon}</div>
              <h3 className="mt-3 font-semibold text-zinc-900">{title}</h3>
              <p className="mt-1 text-sm text-zinc-500">{body}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
