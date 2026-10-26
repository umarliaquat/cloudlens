import { describe, expect, it } from "vitest";
import { filterCosts, groupCosts } from "../src/server/analysis/breakdown";
import { provider } from "../src/server/providers/mock";

describe("Cost Explorer aggregation", () => {
  it("reconciles every grouping to the selected period spend", () => {
    for (const period of ["month", "7d", "30d"] as const) {
      const overview = provider.getOverview("brightloop", period);
      for (const dimension of ["service", "account", "region"] as const) {
        const rows = groupCosts(overview.records, dimension);
        expect(rows.reduce((sum, row) => sum + row.amount, 0)).toBe(
          overview.spend,
        );
        expect(rows.reduce((sum, row) => sum + row.share, 0)).toBeCloseTo(100);
      }
    }
  });
  it("intersects selected filters and excludes partial records", () => {
    const records = provider.getOverview("brightloop", "month").records;
    const selected = filterCosts(records, {
      service: "Amazon EC2",
      account: "Production",
      region: "us-east-1",
    });
    expect(selected.length).toBeGreaterThan(0);
    expect(
      selected.every(
        (r) =>
          !r.partial &&
          r.service === "Amazon EC2" &&
          r.account === "Production" &&
          r.region === "us-east-1",
      ),
    ).toBe(true);
    expect(groupCosts(selected, "service")[0].amount).toBe(
      selected.reduce((s, r) => s + r.amount, 0),
    );
    expect(filterCosts(records, { service: "all" })).toEqual(
      records.filter((r) => !r.partial),
    );
  });
});
