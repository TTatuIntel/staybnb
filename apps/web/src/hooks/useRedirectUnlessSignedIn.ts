"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useAuth } from "@/lib/auth-context";

/** Sends signed-out visitors to the login page, returning them here afterwards. */
export function useRedirectUnlessSignedIn(next: string, alsoRequireHost = false) {
  const { user, loading } = useAuth();
  const router = useRouter();
  useEffect(() => {
    if (loading) return;
    if (!user) router.replace(`/login?next=${encodeURIComponent(next)}`);
    else if (alsoRequireHost && !user.isHost) router.replace("/host");
  }, [user, loading, router, next, alsoRequireHost]);
  return { user, loading };
}
