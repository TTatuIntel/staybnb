import { GUEST_SERVICE_FEE_RATE } from "./constants";
import { diffDays } from "./dates";
import type { PriceBreakdown } from "./types";

export interface PricingInput {
  pricePerNight: number;
  cleaningFee: number;
  currency: string;
  checkIn: string;
  checkOut: string;
}

/** Pure pricing function used by the API (source of truth) and previewed by clients. */
export function calculatePrice(input: PricingInput): PriceBreakdown {
  const nights = Math.max(0, diffDays(input.checkIn, input.checkOut));
  const subtotal = nights * input.pricePerNight;
  const cleaningFee = nights > 0 ? input.cleaningFee : 0;
  const serviceFee = Math.round(subtotal * GUEST_SERVICE_FEE_RATE);
  return {
    nights,
    nightlyRate: input.pricePerNight,
    subtotal,
    cleaningFee,
    serviceFee,
    total: subtotal + cleaningFee + serviceFee,
    currency: input.currency,
  };
}

const CURRENCY_LOCALE: Record<string, string> = { USD: "en-US", EUR: "de-DE", GBP: "en-GB", JPY: "ja-JP" };

/** Format minor units (cents) as a currency string, e.g. 12050 -> "$120.50". */
export function formatMoney(minorUnits: number, currency = "USD", opts: { compact?: boolean } = {}): string {
  const zeroDecimal = currency === "JPY";
  const amount = zeroDecimal ? minorUnits : minorUnits / 100;
  const whole = Number.isInteger(amount);
  return new Intl.NumberFormat(CURRENCY_LOCALE[currency] ?? "en-US", {
    style: "currency",
    currency,
    minimumFractionDigits: whole || opts.compact ? 0 : 2,
    maximumFractionDigits: zeroDecimal ? 0 : opts.compact ? 0 : 2,
  }).format(amount);
}
