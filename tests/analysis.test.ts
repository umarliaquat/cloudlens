import { describe, expect, it } from "vitest";
import {
  changePercent,
  forecastMonth,
  savingsTotals,
  sumComplete,
} from "../src/server/analysis/costs";
import { provider, seedCosts } from "../src/server/providers/mock";
describe("cost contracts", () => {
  it("excludes partial data from totals and forecast", () => {
    const records = seedCosts("brightloop");
    expect(sumComplete(records)).toBe(
      sumComplete(records.filter((r) => !r.partial)),
    );
    const altered = records.map((r) =>
      r.partial ? { ...r, amount: 999999999 } : r,
    );
    expect(forecastMonth(records, "2026-10-25")).toBe(
      forecastMonth(altered, "2026-10-25"),
    );
  });
  it("hides forecast with fewer than seven complete days", () =>
    expect(
      forecastMonth(
        seedCosts("brightloop").filter((r) => r.date >= "2026-10-20"),
        "2026-10-25",
      ),
    ).toBeNull());
  it("shows a new baseline instead of infinity", () =>
    expect(changePercent(150, 0)).toBeNull());
  it("reconciles breakdown and chart to the overview", () => {
    for (const range of ["month", "7d", "30d"] as const) {
      const o = provider.getOverview("brightloop", range);
      expect(o.services.reduce((s, r) => s + r.amount, 0)).toBe(o.spend);
      expect(o.trend.reduce((s, r) => s + (r.actual || 0), 0)).toBe(o.spend);
    }
  });
  it("keeps verified savings separate from identified savings", () => {
    const o = provider.getOverview("brightloop", "month");
    const s = savingsTotals(o.recommendations);
    expect(s.identified).toBe(106600);
    expect(s.verified).toBe(56500);
  });
  it("rejects unknown clients", () =>
    expect(() => provider.getOverview("unknown", "month")).toThrow(
      "Client not found",
    ));
  it("does not change month-to-date KPIs when changing chart range", () => {
    const a = provider.getOverview("brightloop", "month");
    const b = provider.getOverview("brightloop", "7d");
    expect(b.mtd).toBe(a.mtd);
    expect(b.mtdChange).toBe(a.mtdChange);
    expect(b.forecast).toBe(a.forecast);
  });
});
