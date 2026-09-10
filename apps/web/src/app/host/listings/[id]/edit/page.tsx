"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import type { Listing } from "@staybnb/shared";
import { HostListingForm } from "@/components/HostListingForm";
import { Skeleton } from "@/components/ui";
import { api, errorMessage } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";

export default function EditListingPage() {
  const { id } = useParams<{ id: string }>();
  const { user, loading } = useAuth();
  const router = useRouter();
  const [listing, setListing] = useState<Listing | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (loading) return;
    if (!user) { router.replace(`/login?next=/host/listings/${id}/edit`); return; }
    api<{ listing: Listing }>(`/listings/${id}`)
      .then(({ listing }) => {
        if (listing.host.id !== user.id) setError("You can only edit your own listings.");
        else setListing(listing);
      })
      .catch((e) => setError(errorMessage(e)));
  }, [id, user, loading, router]);

  if (error) return <div className="mx-auto max-w-3xl px-4 py-16 text-center text-zinc-600">{error}</div>;
  if (!listing) return <div className="mx-auto max-w-3xl px-4 py-10"><Skeleton className="h-64" /></div>;
  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
      <h1 className="text-2xl font-semibold text-zinc-900">Edit listing</h1>
      <p className="mb-8 text-sm text-zinc-500">Changes go live immediately, including for guests currently viewing the page.</p>
      <HostListingForm listing={listing} />
    </div>
  );
}
