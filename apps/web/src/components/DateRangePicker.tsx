"use client";

import { useMemo, useState } from "react";
import { addDaysIso, nightsInRange, todayIso, type DateRange } from "@staybnb/shared";

interface Props {
  checkIn: string | null;
  checkOut: string | null;
  onChange: (checkIn: string | null, checkOut: string | null) => void;
  bookedRanges: DateRange[];
  minNights?: number;
  maxAdvanceDays?: number;
  months?: number;
}

const WEEKDAYS = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];
const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

function monthKey(y: number, m: number) {
  return `${y}-${String(m + 1).padStart(2, "0")}`;
}

/** A dependency-free two-month calendar that greys out booked nights and enforces min-nights. */
export function DateRangePicker({ checkIn, checkOut, onChange, bookedRanges, minNights = 1, maxAdvanceDays = 365, months = 2 }: Props) {
  const today = todayIso();
  const latest = addDaysIso(today, maxAdvanceDays);
  const start = checkIn ?? today;
  const [cursor, setCursor] = useState(() => ({ y: Number(start.slice(0, 4)), m: Number(start.slice(5, 7)) - 1 }));
  const [hover, setHover] = useState<string | null>(null);

  const blocked = useMemo(() => {
    const set = new Set<string>();
    for (const r of bookedRanges) for (const n of nightsInRange(r.start, r.end)) set.add(n);
    return set;
  }, [bookedRanges]);

  /** With a check-in chosen, the latest possible check-out is the first booked night after it. */
  const maxCheckOut = useMemo(() => {
    if (!checkIn || checkOut) return null;
    let d = addDaysIso(checkIn, 1);
    while (d <= latest && !blocked.has(addDaysIso(d, -1))) d = addDaysIso(d, 1);
    return d; // first day whose preceding night is blocked (or the horizon)
  }, [checkIn, checkOut, blocked, latest]);

  const pick = (day: string) => {
    if (!checkIn || checkOut) {
      onChange(day, null);
      return;
    }
    if (day <= checkIn) {
      onChange(day, null);
      return;
    }
    onChange(checkIn, day);
  };

  const shift = (delta: number) => {
    setCursor((c) => {
      const m = c.m + delta;
      return { y: c.y + Math.floor(m / 12), m: ((m % 12) + 12) % 12 };
    });
  };

  const previewEnd = checkOut ?? (checkIn && hover && hover > checkIn ? hover : null);

  const renderMonth = (y: number, m: number) => {
    const first = new Date(Date.UTC(y, m, 1));
    const offset = first.getUTCDay();
    const daysInMonth = new Date(Date.UTC(y, m + 1, 0)).getUTCDate();
    const cells: (string | null)[] = Array(offset).fill(null);
    for (let d = 1; d <= daysInMonth; d++) cells.push(`${monthKey(y, m)}-${String(d).padStart(2, "0")}`);

    return (
      <div key={monthKey(y, m)} className="w-full">
        <div className="mb-2 text-center text-sm font-semibold text-zinc-900">{MONTHS[m]} {y}</div>
        <div className="grid grid-cols-7 text-center text-[11px] font-medium text-zinc-500">
          {WEEKDAYS.map((w) => <div key={w} className="py-1">{w}</div>)}
        </div>
        <div className="grid grid-cols-7">
          {cells.map((day, i) => {
            if (!day) return <div key={`e${i}`} />;
            const past = day < today;
            const beyond = day > latest;
            const nightBlocked = blocked.has(day);
            // Selecting check-in: need the night itself free. Selecting check-out: must be <= maxCheckOut and > checkIn + minNights - 1.
            let disabled = past || beyond;
            if (!disabled) {
              if (!checkIn || checkOut) disabled = nightBlocked;
              else disabled = day > checkIn && (day > (maxCheckOut ?? day) || day < addDaysIso(checkIn, minNights)) ? true : day <= checkIn ? nightBlocked : false;
            }
            const isStart = day === checkIn;
            const isEnd = day === previewEnd;
            const inRange = checkIn && previewEnd && day > checkIn && day < previewEnd;
            const cls = [
              "relative mx-auto flex h-10 w-10 items-center justify-center rounded-full text-sm transition-colors",
              disabled ? "cursor-not-allowed text-zinc-300 line-through decoration-zinc-300" : "hover:border hover:border-zinc-900",
              isStart || isEnd ? "bg-zinc-900 font-semibold text-white hover:border-transparent" : "",
              inRange ? "bg-zinc-100 rounded-none" : "",
              nightBlocked && !disabled ? "text-zinc-400" : "",
            ].join(" ");
            return (
              <button
                type="button"
                key={day}
                disabled={disabled}
                onClick={() => pick(day)}
                onMouseEnter={() => setHover(day)}
                onMouseLeave={() => setHover(null)}
                className={cls}
                aria-label={day}
                aria-pressed={isStart || isEnd}
              >
                {Number(day.slice(8, 10))}
              </button>
            );
          })}
        </div>
      </div>
    );
  };

  const visible: [number, number][] = [];
  for (let i = 0; i < months; i++) {
    const m = cursor.m + i;
    visible.push([cursor.y + Math.floor(m / 12), m % 12]);
  }

  return (
    <div>
      <div className="mb-2 flex items-center justify-between">
        <button type="button" onClick={() => shift(-1)} className="rounded-full p-2 hover:bg-zinc-100" aria-label="Previous month">‹</button>
        <div className="text-xs text-zinc-500">
          {checkIn && !checkOut ? `Select check-out (min ${minNights} night${minNights > 1 ? "s" : ""})` : checkIn && checkOut ? `${nightsInRange(checkIn, checkOut).length} nights selected` : "Select check-in"}
        </div>
        <button type="button" onClick={() => shift(1)} className="rounded-full p-2 hover:bg-zinc-100" aria-label="Next month">›</button>
      </div>
      <div className={`grid gap-6 ${months > 1 ? "sm:grid-cols-2" : ""}`}>{visible.map(([y, m]) => renderMonth(y, m))}</div>
      {(checkIn || checkOut) && (
        <button type="button" onClick={() => onChange(null, null)} className="mt-3 text-xs font-medium text-zinc-600 underline">Clear dates</button>
      )}
    </div>
  );
}
