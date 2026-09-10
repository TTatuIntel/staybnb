/**
 * Date helpers that operate on plain YYYY-MM-DD strings so the same logic runs
 * identically in Node, the browser and React Native regardless of timezone.
 */

export const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

export function isIsoDate(value: unknown): value is string {
  if (typeof value !== "string" || !DATE_RE.test(value)) return false;
  const d = new Date(value + "T00:00:00Z");
  return !Number.isNaN(d.getTime()) && d.toISOString().slice(0, 10) === value;
}

/** Parse YYYY-MM-DD as a UTC midnight Date. */
export function parseIsoDate(value: string): Date {
  return new Date(value + "T00:00:00Z");
}

/** Format a Date (or timestamp) as YYYY-MM-DD in UTC. */
export function toIsoDate(date: Date): string {
  return date.toISOString().slice(0, 10);
}

/** Current date as YYYY-MM-DD in the local timezone of the caller. */
export function todayIso(now: Date = new Date()): string {
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, "0");
  const d = String(now.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export function addDaysIso(value: string, days: number): string {
  const d = parseIsoDate(value);
  d.setUTCDate(d.getUTCDate() + days);
  return toIsoDate(d);
}

/** Whole days between two YYYY-MM-DD dates (b - a). */
export function diffDays(a: string, b: string): number {
  return Math.round((parseIsoDate(b).getTime() - parseIsoDate(a).getTime()) / 86_400_000);
}

/** Do two half-open ranges [aStart, aEnd) and [bStart, bEnd) overlap? */
export function rangesOverlap(aStart: string, aEnd: string, bStart: string, bEnd: string): boolean {
  return aStart < bEnd && aEnd > bStart;
}

/** Every night (check-in day .. day before check-out) covered by a range. */
export function nightsInRange(start: string, end: string): string[] {
  const out: string[] = [];
  let cur = start;
  while (cur < end) {
    out.push(cur);
    cur = addDaysIso(cur, 1);
  }
  return out;
}
