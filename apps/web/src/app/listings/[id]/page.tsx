import type { Metadata } from "next";
import { notFound } from "next/navigation";
import type { AvailabilityResponse, Listing, Review } from "@staybnb/shared";
import { Amenities } from "@/components/Amenities";
import { Avatar } from "@/components/Avatar";
import { BookingWidget } from "@/components/BookingWidget";
import { ImageGallery } from "@/components/ImageGallery";
import { Rating } from "@/components/Rating";
import { ReviewList } from "@/components/ReviewList";
import { ApiRequestError, api } from "@/lib/api";
import { fmtDate, plural, propertyTypeLabel } from "@/lib/format";

export const dynamic = "force-dynamic";

async function load(id: string) {
  try {
    const [{ listing }, availability, { reviews }] = await Promise.all([
      api<{ listing: Listing }>(`/listings/${id}`, { cache: "no-store" }),
      api<AvailabilityResponse>(`/listings/${id}/availability`, { cache: "no-store" }),
      api<{ reviews: Review[] }>(`/listings/${id}/reviews`, { cache: "no-store" }),
    ]);
    return { listing, availability, reviews };
  } catch (err) {
    if (err instanceof ApiRequestError && err.status === 404) return null;
    throw err;
  }
}

export async function generateMetadata({ params }: PageProps<"/listings/[id]">): Promise<Metadata> {
  const { id } = await params;
  const data = await load(id);
  return { title: data ? data.listing.title : "Listing" };
}

export default async function ListingPage({ params }: PageProps<"/listings/[id]">) {
  const { id } = await params;
  const data = await load(id);
  if (!data) notFound();
  const { listing, availability, reviews } = data;

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6">
      <h1 className="text-2xl font-semibold text-zinc-900 sm:text-3xl">{listing.title}</h1>
      <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-zinc-600">
        <Rating value={listing.rating} count={listing.reviewCount} />
        <span aria-hidden>·</span>
        <span className="font-medium text-zinc-900 underline">{listing.city}, {listing.country}</span>
        {listing.instantBook && <><span aria-hidden>·</span><span>⚡ Instant book</span></>}
      </div>

      <div className="relative mt-5">
        <ImageGallery images={listing.images} title={listing.title} />
      </div>

      <div className="mt-8 grid gap-10 lg:grid-cols-[1fr_380px]">
        <div className="space-y-8">
          <section className="flex items-center justify-between border-b border-zinc-200 pb-6">
            <div>
              <h2 className="text-xl font-semibold text-zinc-900">{propertyTypeLabel(listing.propertyType)} hosted by {listing.host.name}</h2>
              <p className="text-sm text-zinc-600">
                {plural(listing.maxGuests, "guest")} · {listing.bedrooms === 0 ? "Studio" : plural(listing.bedrooms, "bedroom")} · {plural(listing.beds, "bed")} · {plural(listing.bathrooms, "bath")}
              </p>
            </div>
            <Avatar name={listing.host.name} url={listing.host.avatarUrl} size={56} />
          </section>

          <section className="grid gap-4 border-b border-zinc-200 pb-6 sm:grid-cols-3">
            {[
              ["🗓️", "Book ahead", `Up to ${listing.maxAdvanceDays} days in advance`],
              ["🌙", "Minimum stay", `${plural(listing.minNights, "night")}`],
              ["🔄", "Cancellation", "Free before check-in day"],
            ].map(([icon, t, b]) => (
              <div key={t} className="flex gap-3">
                <span className="text-xl">{icon}</span>
                <div><div className="font-medium text-zinc-900">{t}</div><div className="text-sm text-zinc-500">{b}</div></div>
              </div>
            ))}
          </section>

          <section className="border-b border-zinc-200 pb-6">
            <p className="whitespace-pre-line leading-relaxed text-zinc-700">{listing.description}</p>
          </section>

          <div className="border-b border-zinc-200 pb-6"><Amenities items={listing.amenities} /></div>

          <ReviewList reviews={reviews} rating={listing.rating} count={listing.reviewCount} />

          <section className="rounded-2xl bg-zinc-50 p-6">
            <div className="flex items-center gap-4">
              <Avatar name={listing.host.name} url={listing.host.avatarUrl} size={64} />
              <div>
                <h3 className="text-lg font-semibold text-zinc-900">Meet your host, {listing.host.name}</h3>
                <p className="text-sm text-zinc-500">Hosting since {fmtDate(listing.host.createdAt, "MMMM yyyy")}</p>
              </div>
            </div>
            {listing.host.bio && <p className="mt-4 text-sm text-zinc-700">{listing.host.bio}</p>}
          </section>
        </div>

        <aside className="lg:sticky lg:top-24 lg:self-start">
          <BookingWidget listing={listing} availability={availability} />
        </aside>
      </div>
    </div>
  );
}
