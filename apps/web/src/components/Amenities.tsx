"use client";

import { useState } from "react";
import { amenityLabel } from "@/lib/format";

export function Amenities({ items }: { items: string[] }) {
  const [all, setAll] = useState(false);
  if (items.length === 0) return null;
  const shown = all ? items : items.slice(0, 8);
  return (
    <section>
      <h2 className="text-xl font-semibold text-zinc-900">What this place offers</h2>
      <ul className="mt-4 grid grid-cols-1 gap-x-8 gap-y-3 sm:grid-cols-2">
        {shown.map((a) => (
          <li key={a} className="flex items-center gap-3 text-zinc-700">
            <span className="flex h-6 w-6 items-center justify-center rounded-md bg-zinc-100 text-xs">✓</span>
            {amenityLabel(a)}
          </li>
        ))}
      </ul>
      {items.length > 8 && (
        <button onClick={() => setAll((v) => !v)} className="mt-4 rounded-xl border border-zinc-900 px-4 py-2 text-sm font-medium hover:bg-zinc-50">
          {all ? "Show less" : `Show all ${items.length} amenities`}
        </button>
      )}
    </section>
  );
}
