"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { AMENITIES, PROPERTY_TYPES, listingInputSchema, type Listing, type ListingInput } from "@staybnb/shared";
import { api, errorMessage } from "@/lib/api";
import { useToast } from "@/lib/toast";
import { Button, Field, Input, Select, Textarea } from "./ui";

type FormState = Omit<ListingInput, "images" | "pricePerNight" | "cleaningFee"> & { images: string; pricePerNight: string; cleaningFee: string };

const blank: FormState = {
  title: "", description: "", propertyType: "apartment", city: "", country: "", address: "", lat: null, lng: null,
  pricePerNight: "120", cleaningFee: "30", currency: "USD", maxGuests: 2, bedrooms: 1, beds: 1, bathrooms: 1,
  amenities: ["wifi"], images: "", instantBook: true, minNights: 1, maxAdvanceDays: 365, isActive: true,
};

function fromListing(l: Listing): FormState {
  return {
    ...blank, title: l.title, description: l.description, propertyType: l.propertyType as ListingInput["propertyType"], city: l.city, country: l.country,
    address: l.address ?? "", lat: l.lat, lng: l.lng, pricePerNight: (l.pricePerNight / 100).toString(), cleaningFee: (l.cleaningFee / 100).toString(), currency: l.currency,
    maxGuests: l.maxGuests, bedrooms: l.bedrooms, beds: l.beds, bathrooms: l.bathrooms, amenities: l.amenities as ListingInput["amenities"],
    images: l.images.map((i) => i.url).join("\n"), instantBook: l.instantBook, minNights: l.minNights, maxAdvanceDays: l.maxAdvanceDays, isActive: l.isActive,
  };
}

export function HostListingForm({ listing }: { listing?: Listing }) {
  const router = useRouter();
  const toast = useToast();
  const [f, setF] = useState<FormState>(() => (listing ? fromListing(listing) : blank));
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const set = <K extends keyof FormState>(k: K, v: FormState[K]) => setF((s) => ({ ...s, [k]: v }));
  const num = (v: string) => (v === "" ? 0 : Number(v));

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    const payload = {
      ...f,
      address: f.address || null,
      pricePerNight: Math.round(num(f.pricePerNight) * 100),
      cleaningFee: Math.round(num(f.cleaningFee) * 100),
      images: f.images.split(/\s+/).map((s) => s.trim()).filter(Boolean),
    };
    const parsed = listingInputSchema.safeParse(payload);
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? "Please check the form");
      return;
    }
    setBusy(true);
    try {
      const res = listing
        ? await api<{ listing: Listing }>(`/listings/${listing.id}`, { method: "PATCH", body: parsed.data })
        : await api<{ listing: Listing }>("/listings", { method: "POST", body: parsed.data });
      toast.success(listing ? "Listing updated" : "Your place is live!");
      router.push(`/listings/${res.listing.id}`);
      router.refresh();
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setBusy(false);
    }
  };

  const numField = (label: string, key: "maxGuests" | "bedrooms" | "beds" | "bathrooms" | "minNights" | "maxAdvanceDays", min = 0, step = 1) => (
    <Field label={label}><Input type="number" min={min} step={step} value={f[key]} onChange={(e) => set(key, Number(e.target.value))} required /></Field>
  );

  return (
    <form onSubmit={submit} className="space-y-8">
      <section className="space-y-4">
        <h2 className="text-lg font-semibold text-zinc-900">The basics</h2>
        <Field label="Title"><Input value={f.title} onChange={(e) => set("title", e.target.value)} placeholder="Sunny loft with harbour views" required /></Field>
        <Field label="Description"><Textarea value={f.description} onChange={(e) => set("description", e.target.value)} placeholder="What makes your place special?" required /></Field>
        <div className="grid gap-4 sm:grid-cols-3">
          <Field label="Property type"><Select value={f.propertyType} onChange={(e) => set("propertyType", e.target.value as FormState["propertyType"])}>{PROPERTY_TYPES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}</Select></Field>
          <Field label="City"><Input value={f.city} onChange={(e) => set("city", e.target.value)} required /></Field>
          <Field label="Country"><Input value={f.country} onChange={(e) => set("country", e.target.value)} required /></Field>
        </div>
        <Field label="Street address" hint="Only shared with confirmed guests"><Input value={f.address ?? ""} onChange={(e) => set("address", e.target.value)} /></Field>
      </section>

      <section className="space-y-4">
        <h2 className="text-lg font-semibold text-zinc-900">Space</h2>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          {numField("Max guests", "maxGuests", 1)}{numField("Bedrooms", "bedrooms", 0)}{numField("Beds", "beds", 1)}{numField("Bathrooms", "bathrooms", 0, 0.5)}
        </div>
        <div>
          <span className="mb-2 block text-sm font-medium text-zinc-800">Amenities</span>
          <div className="flex flex-wrap gap-2">
            {AMENITIES.map((a) => {
              const on = f.amenities.includes(a.key);
              return (
                <button type="button" key={a.key} onClick={() => set("amenities", on ? f.amenities.filter((k) => k !== a.key) : [...f.amenities, a.key])} className={`rounded-full border px-3 py-1.5 text-sm transition-colors ${on ? "border-zinc-900 bg-zinc-900 text-white" : "border-zinc-300 text-zinc-700 hover:border-zinc-500"}`} aria-pressed={on}>
                  {a.label}
                </button>
              );
            })}
          </div>
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-lg font-semibold text-zinc-900">Photos</h2>
        <Field label="Image URLs" hint="One per line. The first one is the cover photo."><Textarea value={f.images} onChange={(e) => set("images", e.target.value)} placeholder="https://images.unsplash.com/..." required className="font-mono text-xs" /></Field>
      </section>

      <section className="space-y-4">
        <h2 className="text-lg font-semibold text-zinc-900">Pricing and booking rules</h2>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          <Field label="Price per night (USD)"><Input type="number" min={1} step="0.01" value={f.pricePerNight} onChange={(e) => set("pricePerNight", e.target.value)} required /></Field>
          <Field label="Cleaning fee (USD)"><Input type="number" min={0} step="0.01" value={f.cleaningFee} onChange={(e) => set("cleaningFee", e.target.value)} /></Field>
          {numField("Minimum nights", "minNights", 1)}{numField("Book up to (days ahead)", "maxAdvanceDays", 1)}
        </div>
        <div className="flex flex-wrap gap-6 text-sm text-zinc-700">
          <label className="flex items-center gap-2"><input type="checkbox" checked={f.instantBook} onChange={(e) => set("instantBook", e.target.checked)} className="h-4 w-4 accent-brand-600" /> Instant book (guests confirm immediately)</label>
          <label className="flex items-center gap-2"><input type="checkbox" checked={f.isActive} onChange={(e) => set("isActive", e.target.checked)} className="h-4 w-4 accent-brand-600" /> Listing is active and visible</label>
        </div>
      </section>

      {error && <p className="text-sm text-red-600" role="alert">{error}</p>}
      <div className="flex gap-3">
        <Button type="submit" size="lg" loading={busy}>{listing ? "Save changes" : "Publish listing"}</Button>
        <Button type="button" variant="ghost" size="lg" onClick={() => router.back()}>Cancel</Button>
      </div>
    </form>
  );
}
