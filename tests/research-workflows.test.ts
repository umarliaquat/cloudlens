import { describe, it, expect } from "vitest";
import { provider } from "../src/server/providers/mock";
import {
  comparisonReport,
  networkFlows,
  flowTotals,
  sankeyLayout,
  clientAttention,
  clientReviewRows,
} from "../src/server/analysis/research-workflows";
describe("research-backed workspace contracts", () => {
  it("keeps Sankey nodes and label wells inside desktop canvases across filters and weights", () => {
    const all = networkFlows("brightloop", 24);
    for (const width of [800, 1072, 1464])
      for (const flows of [
        all,
        all.filter((f) => f.source === "prod-worker"),
        all.filter((f) => f.category === "AWS service"),
      ])
        for (const weight of ["cost", "gb"] as const) {
          const layout = sankeyLayout(flows, weight, width);
          for (const node of layout.nodes) {
            expect(node.x).toBeGreaterThanOrEqual(0);
            expect(node.x + 16 + 172).toBeLessThanOrEqual(width);
            expect(node.y).toBeGreaterThanOrEqual(22);
            expect(node.y + node.height).toBeLessThanOrEqual(310);
            expect(Number.isFinite(node.height)).toBe(true);
          }
          expect(
            layout.links.every(
              (link) =>
                !link.path.includes("NaN") && !link.path.includes("Infinity"),
            ),
          ).toBe(true);
          const middle = layout.nodes.filter((n) => n.column === 1);
          for (const node of middle)
            expect(
              layout.links
                .filter((l) => l.target === node.name)
                .reduce((sum, l) => sum + l.width, 0),
            ).toBeCloseTo(node.height);
        }
  });
  it("comparison groupings and daily series reconcile across all scopes", () => {
    const o = provider.getOverview("brightloop", "month");
    for (const group of ["service", "account", "region"] as const)
      for (const account of ["all", "Production", "Development"]) {
        const r = comparisonReport(o, { account }, group);
        expect(r.rows.reduce((s, r) => s + r.amount, 0)).toBe(r.total);
        expect(r.rows.reduce((s, r) => s + r.delta, 0)).toBe(r.delta);
        expect(
          r.series.reduce(
            (s, row) => s + row.points.reduce((a, p) => a + p.amount, 0),
            0,
          ),
        ).toBe(r.total);
      }
  });
  it("Sankey conserves flow at every stage and costs are a subset of the VPC bill", () => {
    const flows = networkFlows("brightloop", 24),
      totals = flowTotals(flows);
    expect(totals).toEqual({ gb: 59400, cost: 267300 });
    expect(totals.cost).toBeLessThan(
      provider
        .getOverview("brightloop", "month")
        .services.find((s) => s.name === "Amazon VPC")!.amount,
    );
    expect(totals.cost - 180000).toBe(87300);
    for (const weight of ["cost", "gb"] as const) {
      const layout = sankeyLayout(flows, weight);
      for (const column of [0, 1, 2])
        expect(
          layout.nodes
            .filter((n) => n.column === column)
            .reduce((s, n) => s + n.value, 0),
        ).toBe(totals[weight]);
      for (const node of layout.nodes.filter((n) => n.column === 1)) {
        expect(
          layout.links
            .filter((l) => l.target === node.name)
            .reduce((s, l) => s + l.value, 0),
        ).toBe(node.value);
        expect(
          layout.links
            .filter((l) => l.source === node.name)
            .reduce((s, l) => s + l.value, 0),
        ).toBe(node.value);
      }
      expect(
        layout.links.every((l) => l.width > 0 && !l.path.includes("NaN")),
      ).toBe(true);
    }
  });
  it("filters and partial modeled ranges stay internally consistent without inventing other client flows", () => {
    expect(networkFlows("medora", 24)).toEqual([]);
    const all = networkFlows("brightloop", 24),
      filtered = all.filter((f) => f.category === "AWS service");
    expect(flowTotals(filtered)).toEqual({ gb: 40000, cost: 180000 });
    expect(sankeyLayout(filtered, "cost").total).toBe(180000);
    expect(flowTotals(networkFlows("brightloop", 7)).gb).toBeLessThan(59400);
  });
  it("portfolio priority uses auditable reasons rather than a composite score", () => {
    const o = provider.getOverview("brightloop", "month"),
      a = clientAttention(o);
    expect(a.exposure).toBe(196800);
    expect(a.overrun).toBe(0);
    expect(a.decisions).toBe(2);
    expect(a.reasons).toHaveLength(2);
    expect(a).not.toHaveProperty("score");
  });
  it("review exports include comparisons, decision owners and measurement evidence", () => {
    const o = provider.getOverview("brightloop", "month");
    const rows = clientReviewRows(o, o.recommendations, o.budget, []);
    expect(rows).toContainEqual(["Actual spend USD", "31504.00"]);
    expect(rows).toContainEqual(["Net change USD", "1868.00"]);
    expect(rows.some((r) => r.includes("Daniel Chen"))).toBe(true);
    expect(
      rows.some((r) => r.some((v) => String(v).includes("Baseline Sep 27"))),
    ).toBe(true);
    expect(
      o.recommendations.find((r) => r.id.endsWith("rec-3"))?.evidenceReady,
    ).toBe(false);
  });
});
