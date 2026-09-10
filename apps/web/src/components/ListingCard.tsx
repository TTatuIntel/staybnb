import Image from "next/image";
import Link from "next/link";
import { formatMoney, type ListingSummary } from "@staybnb/shared";
import { propertyTypeLabel } from "@/lib/format";
import { Rating } from "./Rating";

export function ListingCard({ listing, href }: { listing: ListingSummary; href?: string }) {
  const cover = listing.images[0]?.url;
  return (
    <Link href={href ?? `/listings/${listing.id}`} className="group block animate-fade-up">
      <div className="relative aspect-[4/3] overflow-hidden rounded-2xl bg-zinc-100">
        {cover ? (
          <Image src={cover} alt={listing.title} fill sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw" className="object-cover transition-transform duration-500 group-hover:scale-105" />
        ) : (
          <div className="flex h-full items-center justify-center text-zinc-400">No photo</div>
        )}
        {listing.instantBook && (
          <span className="absolute left-3 top-3 rounded-full bg-white/95 px-2.5 py-1 text-xs font-semibold text-zinc-800 shadow-sm">⚡ Instant book</span>
        )}
      </div>
      <div className="mt-3 flex items-start justify-between gap-2">
        <div className="min-w-0">
          <h3 className="truncate font-semibold text-zinc-900">{listing.city}, {listing.country}</h3>
          <p className="truncate text-sm text-zinc-500">{listing.title}</p>
          <p className="text-sm text-zinc-500">{propertyTypeLabel(listing.propertyType)} · {listing.beds} {listing.beds === 1 ? "bed" : "beds"}</p>
        </div>
        <Rating value={listing.rating} count={listing.reviewCount} showCount={false} className="shrink-0" />
      </div>
      <p className="mt-1 text-sm text-zinc-900">
        <span className="font-semibold">{formatMoney(listing.pricePerNight, listing.currency, { compact: true })}</span> <span className="text-zinc-500">night</span>
      </p>
    </Link>
  );
}
