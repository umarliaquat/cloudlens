import type { CostRecord, Recommendation } from "../../lib/domain";
export function sumComplete(records: CostRecord[]) {
  return records
    .filter((r) => !r.partial)
    .reduce((sum, r) => sum + r.amount, 0);
}
export function changePercent(current: number, previous: number) {
  return previous === 0 ? null : ((current - previous) / previous) * 100;
}
export function forecastMonth(
  records: CostRecord[],
  today: string,
): number | null {
  const days = [
    ...new Set(
      records.filter((r) => !r.partial && r.date < today).map((r) => r.date),
    ),
  ].sort();
  if (days.length < 7) return null;
  const month = today.slice(0, 7);
  const mtd = sumComplete(
    records.filter((r) => r.date.startsWith(month) && r.date < today),
  );
  const window = new Set(days.slice(-7));
  const average = sumComplete(records.filter((r) => window.has(r.date))) / 7;
  const date = new Date(today + "T00:00:00Z");
  const daysInMonth = new Date(
    Date.UTC(date.getUTCFullYear(), date.getUTCMonth() + 1, 0),
  ).getUTCDate();
  return Math.round(mtd + average * (daysInMonth - date.getUTCDate() + 1));
}
export function savingsTotals(recommendations: Recommendation[]) {
  return {
    identified: recommendations
      .filter((r) =>
        ["Open", "Approved", "Changes requested"].includes(r.status),
      )
      .reduce((s, r) => s + r.savings, 0),
    verified: recommendations
      .filter((r) => r.status === "Verified")
      .reduce((s, r) => s + r.savings, 0),
  };
}

export function projectMonthEnd(
  mtd: number,
  forecast: number | null,
  remainingDays: number,
): number[] {
  if (forecast === null || remainingDays < 1) return [];
  // Same uniform daily run rate used by the month-end forecast, not a new model.
  return Array.from({ length: remainingDays + 1 }, (_, day) =>
    Math.round(mtd + ((forecast - mtd) * day) / remainingDays),
  );
}

export function savingsProgress(recommendations: Recommendation[]) {
  const totals = savingsTotals(recommendations);
  const implemented = recommendations
    .filter((r) => r.status === "Implemented")
    .reduce((sum, r) => sum + r.savings, 0);
  const tracked = totals.identified + implemented + totals.verified;
  return {
    tracked,
    verifiedPercent: tracked > 0 ? (totals.verified / tracked) * 100 : 0,
    activeCount: recommendations.filter((r) =>
      ["Open", "Approved", "Changes requested"].includes(r.status),
    ).length,
    verifiedCount: recommendations.filter((r) => r.status === "Verified")
      .length,
  };
}
