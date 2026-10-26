export const money = (minor: number, compact = false) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: compact ? 1 : 0,
    notation: compact ? "compact" : "standard",
  }).format(minor / 100);
export const percent = (value: number | null | undefined, signed = false) =>
  value === null
    ? "New"
    : value === undefined || !Number.isFinite(value)
      ? "—"
    : `${signed && value > 0 ? "+" : ""}${value.toFixed(1)}%`;
export const shortDate = (date: string) =>
  new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    timeZone: "UTC",
  }).format(new Date(date + (date.length === 10 ? "T00:00:00Z" : "")));
export const csvCell = (value: string | number) =>
  `"${String(value).replaceAll('"', '""')}"`;
