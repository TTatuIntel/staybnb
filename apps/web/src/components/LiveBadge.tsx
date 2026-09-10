"use client";

import { useEffect, useState } from "react";
import type { ListingBookedEvent } from "@staybnb/shared";
import { fmtRange } from "@/lib/format";

const FLASH_MS = 8000;

export function LiveBadge({ viewers, lastBooked, connected }: { viewers: number; lastBooked: ListingBookedEvent | null; connected: boolean }) {
  // `lastBooked.at` identifies the event; the banner shows while it is the
  // newest one and the dismiss timer has not fired.
  const [dismissed, setDismissed] = useState<string | null>(null);
  const flash = lastBooked && lastBooked.at !== dismissed ? lastBooked : null;
  const flashAt = flash?.at;

  useEffect(() => {
    if (!flashAt) return;
    const t = window.setTimeout(() => setDismissed(flashAt), FLASH_MS);
    return () => window.clearTimeout(t);
  }, [flashAt]);

  const others = Math.max(0, viewers - 1);
  return (
    <div className="space-y-2 text-sm" aria-live="polite">
      <div className="flex items-center gap-2 text-zinc-600">
        <span className={`inline-block h-2 w-2 rounded-full ${connected ? "bg-emerald-500 animate-pulse-soft" : "bg-zinc-300"}`} />
        {connected ? (others > 0 ? `${others} other ${others === 1 ? "person is" : "people are"} looking at this place right now` : "Live availability") : "Connecting to live availability…"}
      </div>
      {flash && (
        <div className="animate-fade-up rounded-lg bg-amber-50 px-3 py-2 text-amber-800">
          Just booked: {fmtRange(flash.range.start, flash.range.end)}. The calendar has been updated.
        </div>
      )}
    </div>
  );
}
