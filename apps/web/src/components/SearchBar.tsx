"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState, type FormEvent } from "react";
import { addDaysIso, todayIso } from "@staybnb/shared";
import { qs } from "@/lib/api";

export function SearchBar({ compact = false }: { compact?: boolean }) {
  const router = useRouter();
  const sp = useSearchParams();
  const [q, setQ] = useState(sp.get("q") ?? "");
  const [checkIn, setCheckIn] = useState(sp.get("checkIn") ?? "");
  const [checkOut, setCheckOut] = useState(sp.get("checkOut") ?? "");
  const [guests, setGuests] = useState(sp.get("guests") ?? "");
  const today = todayIso();

  const submit = (e: FormEvent) => {
    e.preventDefault();
    const validDates = checkIn && checkOut && checkOut > checkIn;
    router.push(`/search${qs({ q, checkIn: validDates ? checkIn : "", checkOut: validDates ? checkOut : "", guests })}`);
  };

  const cell = "flex min-w-0 flex-1 flex-col px-4 py-2";
  const label = "text-[11px] font-semibold uppercase tracking-wide text-zinc-500";
  const input = "w-full bg-transparent text-sm text-zinc-900 placeholder:text-zinc-400 focus:outline-none";

  return (
    <form
      onSubmit={submit}
      className={`flex w-full flex-col overflow-hidden rounded-3xl border border-zinc-200 bg-white shadow-card sm:flex-row sm:items-center sm:rounded-full ${compact ? "" : "sm:shadow-float"}`}
      role="search"
    >
      <div className={cell}>
        <span className={label}>Where</span>
        <input className={input} placeholder="Search a city or country" value={q} onChange={(e) => setQ(e.target.value)} aria-label="Destination" />
      </div>
      <div className="hidden h-8 w-px bg-zinc-200 sm:block" />
      <div className={cell}>
        <span className={label}>Check in</span>
        <input type="date" className={input} min={today} value={checkIn} onChange={(e) => { setCheckIn(e.target.value); if (checkOut && checkOut <= e.target.value) setCheckOut(addDaysIso(e.target.value, 1)); }} aria-label="Check in" />
      </div>
      <div className="hidden h-8 w-px bg-zinc-200 sm:block" />
      <div className={cell}>
        <span className={label}>Check out</span>
        <input type="date" className={input} min={checkIn ? addDaysIso(checkIn, 1) : addDaysIso(today, 1)} value={checkOut} onChange={(e) => setCheckOut(e.target.value)} aria-label="Check out" />
      </div>
      <div className="hidden h-8 w-px bg-zinc-200 sm:block" />
      <div className={`${cell} sm:max-w-32`}>
        <span className={label}>Guests</span>
        <input type="number" min={1} max={50} className={input} placeholder="Add guests" value={guests} onChange={(e) => setGuests(e.target.value)} aria-label="Guests" />
      </div>
      <div className="p-2">
        <button type="submit" className="flex h-11 w-full items-center justify-center gap-2 rounded-full bg-brand-600 px-5 text-sm font-semibold text-white hover:bg-brand-700 sm:w-auto">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden><circle cx="11" cy="11" r="7" /><path d="m20 20-3.5-3.5" /></svg>
          Search
        </button>
      </div>
    </form>
  );
}
