import { describe, it, expect } from "vitest";
import { provider } from "../src/server/providers/mock";
import {
  homepageModel,
  driverEvidence,
  spendChartSeries,
} from "../src/server/analysis/homepage";

describe("approved homepage evidence and scope", () => {
  it("daily values reconcile to the exact same actual total and forecast without counting the anchor twice", () => {
    const o = provider.getOverview("brightloop", "month");
    const m = homepageModel(o, "all", o.recommendations, o.budget);
    const daily = spendChartSeries(m.points, "daily");
    expect(daily.reduce((sum, p) => sum + (p.actual || 0), 0)).toBe(3150400);
    expect(
      daily
        .filter((p) => p.actual === null)
        .reduce((sum, p) => sum + (p.forecast || 0), 0),
    ).toBe(1059100);
    expect(daily.reduce((sum, p) => sum + (p.budget || 0), 0)).toBe(4800000);
    expect(daily[23].actual).toBe(142400);
    expect(daily[24].forecast).toBe(151300);
    expect(
      new Set(daily.filter((p) => p.actual !== null).map((p) => p.actual)).size,
    ).toBeGreaterThan(10);
    expect(spendChartSeries(m.points, "cumulative").at(-1)?.forecast).toBe(
      4209500,
    );
  });
  it("reconciles the approved current, prior and forecast amounts from integer records", () => {
    const o = provider.getOverview("brightloop", "month");
    const m = homepageModel(o, "all", o.recommendations, o.budget);
    expect(m.spend).toBe(3150400);
    expect(m.prior).toBe(2963600);
    expect(m.forecast).toBe(4209500);
    expect(m.services.reduce((s, r) => s + r.amount, 0)).toBe(m.spend);
    expect(m.points.filter((p) => p.actual !== null).at(-1)?.actual).toBe(
      m.spend,
    );
    expect(m.points.at(-1)?.forecast).toBe(m.forecast);
    expect(m.points.at(-1)?.budget).toBe(4800000);
    expect(m.drivers.map((d) => d.delta)).toEqual([109500, 87300]);
    expect(m.otherChange).toBe(-10000);
    expect(m.ready).toHaveLength(2);
  });
  it("account totals reconcile and do not borrow the full organization's budget", () => {
    const o = provider.getOverview("brightloop", "month");
    const accounts = [...new Set(o.monthRecords.map((r) => r.account))];
    expect(accounts).toHaveLength(o.client.accounts);
    const models = accounts.map((a) =>
      homepageModel(o, a, o.recommendations, o.budget),
    );
    expect(models.reduce((s, m) => s + m.spend, 0)).toBe(o.spend);
    for (const m of models) {
      expect(m.budget).toBeNull();
      expect(m.points.every((p) => p.budget === null)).toBe(true);
    }
    const prod = homepageModel(o, "Production", o.recommendations, o.budget);
    expect(prod.drivers.map((d) => d.delta)).toEqual([109500, 87300]);
    expect(prod.verified.every((r) => r.account === "Production")).toBe(true);
  });
  it("preserves MTD scope across period changes while chart and table track the selected period", () => {
    for (const period of ["month", "7d", "30d"] as const) {
      const o = provider.getOverview("brightloop", period),
        m = homepageModel(o, "all", o.recommendations, o.budget);
      expect(m.mtd).toBe(3150400);
      expect(m.forecast).toBe(4209500);
      expect(m.points.filter((p) => p.actual !== null).at(-1)?.actual).toBe(
        m.spend,
      );
      expect(m.services.reduce((s, r) => s + r.delta, 0)).toBe(
        m.spend - m.prior,
      );
      if (period !== "month")
        expect(
          m.points.every((p) => p.forecast === null && p.budget === null),
        ).toBe(true);
    }
  });
  it("only uses quantity explanations for the records that actually support them", () => {
    expect(
      driverEvidence("brightloop", "Amazon VPC", "month", "all").quantity,
    ).toBe(19400);
    expect(
      driverEvidence("brightloop", "Amazon VPC", "month", "Development")
        .quantity,
    ).toBeNull();
    expect(
      driverEvidence("brightloop", "Amazon VPC", "7d", "all").quantity,
    ).toBeNull();
    expect(
      driverEvidence("medora", "Amazon EC2", "month", "all").quantity,
    ).toBeNull();
  });
  it("does not treat approval as implementation or verified savings", () => {
    const o = provider.getOverview("brightloop", "month");
    const recs = o.recommendations.map((r) =>
      r.id.endsWith("rec-1") ? { ...r, status: "Approved" as const } : r,
    );
    const m = homepageModel(o, "all", recs, o.budget);
    expect(m.ready).toHaveLength(1);
    expect(m.savings.identified).toBe(106600);
    expect(m.savings.verified).toBe(56500);
  });
});
