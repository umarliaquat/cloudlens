import { describe, expect, it } from "vitest";
import { projectMonthEnd, savingsProgress } from "../src/server/analysis/costs";
import { provider } from "../src/server/providers/mock";

describe("KPI context", () => {
  it("projects from complete MTD spend to the same month-end estimate for every chart range", () => {
    for (const period of ["month", "7d", "30d"] as const) {
      const overview = provider.getOverview("brightloop", period);
      expect(overview.forecastProjection).toHaveLength(8);
      expect(overview.forecastProjection[0]).toBe(overview.mtd);
      expect(overview.forecastProjection.at(-1)).toBe(overview.forecast);
      expect(
        overview.forecastProjection.every(
          (v, i, values) => i === 0 || v >= values[i - 1],
        ),
      ).toBe(true);
    }
  });
  it("does not invent a projection when the forecast is unavailable", () => {
    expect(projectMonthEnd(100, null, 7)).toEqual([]);
    expect(projectMonthEnd(100, 200, 0)).toEqual([]);
  });
  it("measures verified savings against all tracked stages, including implemented savings", () => {
    const { recommendations } = provider.getOverview("brightloop", "month");
    const status = savingsProgress(recommendations);
    expect(status.tracked).toBe(163100);
    expect(status.verifiedCount).toBe(2);
    expect(status.activeCount).toBe(3);
    expect(status.verifiedPercent).toBeCloseTo((56500 / 163100) * 100);
    const implemented = recommendations.map((r, i) =>
      i === 0 ? { ...r, status: "Implemented" as const } : r,
    );
    expect(savingsProgress(implemented).tracked).toBe(status.tracked);
    expect(savingsProgress(implemented).activeCount).toBe(2);
  });
  it("handles no tracked savings without NaN or infinity", () => {
    expect(savingsProgress([]).verifiedPercent).toBe(0);
  });
});
