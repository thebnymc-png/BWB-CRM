// Display helpers. Currency defaults to AUD (shown as $) but can be overridden
// with the CURRENCY / CURRENCY_LOCALE env vars if you bill in another currency.
const CURRENCY = process.env.CURRENCY ?? "AUD";
const LOCALE = process.env.CURRENCY_LOCALE ?? "en-AU";

export function money(amount: number | null | undefined): string {
  return new Intl.NumberFormat(LOCALE, {
    style: "currency",
    currency: CURRENCY,
  }).format(amount ?? 0);
}

export function hoursFromMinutes(minutes: number): number {
  return Math.round((minutes / 60) * 100) / 100;
}

// "2h 35m" style duration from a minute count.
export function duration(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (h === 0) return `${m}m`;
  if (m === 0) return `${h}h`;
  return `${h}h ${m}m`;
}

export function formatDate(d: Date | string | null | undefined): string {
  if (!d) return "—";
  const date = typeof d === "string" ? new Date(d) : d;
  return new Intl.DateTimeFormat(LOCALE, {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(date);
}

export function formatDateTime(d: Date | string | null | undefined): string {
  if (!d) return "—";
  const date = typeof d === "string" ? new Date(d) : d;
  return new Intl.DateTimeFormat(LOCALE, {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

// For <input type="datetime-local"> and date inputs.
export function toDateInput(d: Date | string | null | undefined): string {
  if (!d) return "";
  const date = typeof d === "string" ? new Date(d) : d;
  return date.toISOString().slice(0, 10);
}
