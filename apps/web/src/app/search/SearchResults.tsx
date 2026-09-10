"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback } from "react";
import { PROPERTY_TYPES, type ListingSearchResult } from "@staybnb/shared";
import { ListingCard } from "@/components/ListingCard";
import { EmptyState, Select, Skeleton } from "@/components/ui";
import { useAsyncData } from "@/hooks/useAsyncData";
import { api } from "@/lib/api";
import { fmtRange } from "@/lib/format";

export function SearchResults() {
  const sp = useSearchParams();
  const router = useRouter();
  const query = sp.toString();
  const { data, error } = useAsyncData(
    useCallback(() => api<ListingSearchResult>(`/listings?${query}`), [query]),
    [query],
  );

  const set = (key: string, value: string) => {
    const next = new URLSearchParams(sp.toString());
    if (value) next.set(key, value); else next.delete(key);
    next.delete("page");
    router.push(`/search?${next.toString()}`);
  };

  const checkIn = sp.get("checkIn");
  const checkOut = sp.get("checkOut");
  const q = sp.get("q");

  return (
    <div className="mt-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-zinc-600">
          {data ? <><span className="font-semibold text-zinc-900">{data.total}</span> {data.total === 1 ? "stay" : "stays"}</> : "Searching"}
          {q ? <> in <span className="font-semibold text-zinc-900">{q}</span></> : null}
          {checkIn && checkOut ? <> · available {fmtRange(checkIn, checkOut)}</> : null}
        </p>
        <div className="flex flex-wrap gap-2">
          <Select value={sp.get("type") ?? ""} onChange={(e) => set("type", e.target.value)} className="!h-9 !w-auto !text-xs" aria-label="Property type">
            <option value="">Any type</option>
            {PROPERTY_TYPES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
          </Select>
          <Select value={sp.get("maxPrice") ?? ""} onChange={(e) => set("maxPrice", e.target.value)} className="!h-9 !w-auto !text-xs" aria-label="Max price">
            <option value="">Any price</option>
            <option value="10000">Up to $100</option>
            <option value="15000">Up to $150</option>
            <option value="20000">Up to $200</option>
            <option value="30000">Up to $300</option>
          </Select>
          <Select value={sp.get("instantBook") ?? ""} onChange={(e) => set("instantBook", e.target.value)} className="!h-9 !w-auto !text-xs" aria-label="Instant book">
            <option value="">Any booking</option>
            <option value="true">Instant book only</option>
          </Select>
          <Select value={sp.get("sort") ?? "recommended"} onChange={(e) => set("sort", e.target.value)} className="!h-9 !w-auto !text-xs" aria-label="Sort">
            <option value="recommended">Newest</option>
            <option value="rating">Top rated</option>
            <option value="price_asc">Price: low to high</option>
            <option value="price_desc">Price: high to low</option>
          </Select>
        </div>
      </div>

      {error ? (
        <EmptyState title="Could not load stays" body={error} />
      ) : !data ? (
        <div className="mt-6 grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 8 }, (_, i) => <div key={i}><Skeleton className="aspect-[4/3]" /><Skeleton className="mt-3 h-4 w-2/3" /><Skeleton className="mt-2 h-4 w-1/3" /></div>)}
        </div>
      ) : data.items.length === 0 ? (
        <div className="mt-6"><EmptyState title="No stays match" body="Try different dates, fewer guests, or another destination." /></div>
      ) : (
        <div className="mt-6 grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-2 lg:grid-cols-4">
          {data.items.map((l) => <ListingCard key={l.id} listing={l} />)}
        </div>
      )}
    </div>
  );
}
