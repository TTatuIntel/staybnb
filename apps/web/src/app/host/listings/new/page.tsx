"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { HostListingForm } from "@/components/HostListingForm";
import { Skeleton } from "@/components/ui";
import { useAuth } from "@/lib/auth-context";

export default function NewListingPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  useEffect(() => {
    if (loading) return;
    if (!user) router.replace("/login?next=/host/listings/new");
    else if (!user.isHost) router.replace("/host");
  }, [user, loading, router]);

  if (loading || !user?.isHost) return <div className="mx-auto max-w-3xl px-4 py-10"><Skeleton className="h-64" /></div>;
  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
      <h1 className="text-2xl font-semibold text-zinc-900">List your place</h1>
      <p className="mb-8 text-sm text-zinc-500">Fill in the details below. You can edit everything later.</p>
      <HostListingForm />
    </div>
  );
}
