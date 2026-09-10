import { format, parseISO } from "date-fns";
import { PROPERTY_TYPES, AMENITIES } from "@staybnb/shared";

export function fmtDate(iso: string, pattern = "MMM d"): string {
  return format(parseISO(iso), pattern);
}

/** "Mar 3 – 7, 2026" or "Mar 30 – Apr 2, 2026" */
export function fmtRange(checkIn: string, checkOut: string): string {
  const a = parseISO(checkIn);
  const b = parseISO(checkOut);
  const sameMonth = a.getMonth() === b.getMonth() && a.getFullYear() === b.getFullYear();
  return sameMonth ? `${format(a, "MMM d")} – ${format(b, "d, yyyy")}` : `${format(a, "MMM d")} – ${format(b, "MMM d, yyyy")}`;
}

export function fmtDateTime(iso: string): string {
  return format(new Date(iso), "MMM d, yyyy 'at' h:mm a");
}

export function propertyTypeLabel(value: string): string {
  return PROPERTY_TYPES.find((p) => p.value === value)?.label ?? value;
}

export function amenityLabel(key: string): string {
  return AMENITIES.find((a) => a.key === key)?.label ?? key;
}

export function plural(n: number, one: string, many = `${one}s`): string {
  return `${n} ${n === 1 ? one : many}`;
}
