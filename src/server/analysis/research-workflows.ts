import type {
  Overview,
  CostRecord,
  Recommendation,
  AuditEvent,
} from "../../lib/domain";
import { filterCosts, groupCosts, type GroupDimension } from "./breakdown";
import { sumComplete, changePercent } from "./costs";

export function comparisonReport(
  o: Overview,
  filters: Partial<Record<GroupDimension, string>>,
  group: GroupDimension,
) {
  const current = filterCosts(o.records, filters),
    previous = filterCosts(o.previousRecords, filters);
  const before = groupCosts(previous, group),
    now = groupCosts(current, group);
  const names = [...new Set([...now, ...before].map((r) => r.name))];
  const total = sumComplete(current),
    prior = sumComplete(previous);
  const rows = names
    .map((name) => {
      const amount = now.find((r) => r.name === name)?.amount || 0,
        prev = before.find((r) => r.name === name)?.amount || 0;
      return {
        name,
        amount,
        previous: prev,
        delta: amount - prev,
        change: changePercent(amount, prev),
        share: total ? (amount / total) * 100 : 0,
      };
    })
    .sort((a, b) => b.amount - a.amount);
  const dates = o.trend.filter((p) => p.actual !== null).map((p) => p.date);
  const series = rows.map((row) => ({
    name: row.name,
    points: dates.map((date) => ({
      date,
      amount: sumComplete(
        current.filter((r) => r.date === date && r[group] === row.name),
      ),
    })),
  }));
  return {
    current,
    previous,
    total,
    prior,
    delta: total - prior,
    change: changePercent(total, prior),
    rows,
    series,
  };
}
export function clientAttention(o: Overview) {
  const active = o.anomalies.filter(
    (a) => !["Resolved", "Expected"].includes(a.status),
  );
  const exposure = active.reduce((s, a) => s + a.impact, 0);
  const overrun = Math.max(0, (o.forecast || 0) - o.budget);
  const decisions = o.recommendations.filter((r) => r.status === "Open").length;
  return {
    exposure,
    overrun,
    decisions,
    active: active.length,
    reasons: [
      ...(overrun ? [`Forecast ${overrun / 100} USD over budget`] : []),
      ...(active.length
        ? [`${active.length} cost changes to investigate`]
        : []),
      ...(decisions ? [`${decisions} decisions awaiting review`] : []),
    ],
  };
}
export const measurementWindow =
  "Baseline Sep 27–Oct 10; observation Oct 11–24; normalized to 30 days. Comparable workload and unchanged effective rates assumed.";
export function clientReviewRows(
  o: Overview,
  recommendations: Recommendation[],
  budget: number,
  events: AuditEvent[],
): (string | number)[][] {
  const report = comparisonReport(o, {}, "service");
  return [
    ["CloudLens client review · SIMULATED DATA", o.client.name],
    [
      "Reporting scope",
      o.rangeLabel,
      "USD · amortized · tax excluded · complete through Oct 24 UTC",
    ],
    ["Actual spend USD", (report.total / 100).toFixed(2)],
    ["Comparable prior USD", (report.prior / 100).toFixed(2)],
    ["Net change USD", (report.delta / 100).toFixed(2)],
    [
      "Month-end forecast USD · estimate",
      o.forecast === null ? "Unavailable" : (o.forecast / 100).toFixed(2),
    ],
    ["Monthly budget USD", (budget / 100).toFixed(2)],
    ["Service", "Actual USD", "Prior USD", "Change USD"],
    ...report.rows.map((r) => [
      r.name,
      (r.amount / 100).toFixed(2),
      (r.previous / 100).toFixed(2),
      (r.delta / 100).toFixed(2),
    ]),
    ["Pending decision", "Owner", "Status", "Estimated monthly savings USD"],
    ...recommendations
      .filter((r) =>
        ["Open", "Changes requested", "Approved"].includes(r.status),
      )
      .map((r) => [r.title, r.owner, r.status, (r.savings / 100).toFixed(2)]),
    ["Completed action", "Monthly measured run rate USD", "Evidence"],
    ...recommendations
      .filter((r) => r.status === "Verified")
      .map((r) => [r.title, (r.savings / 100).toFixed(2), r.evidence]),
    [
      "Caution",
      "Billing changes are observations, not proof of a deployment cause. Forecasts and identified savings are estimates; verified savings are simulated monthly run rates, not cash saved this month.",
    ],
    ["Activity UTC", "Actor", "Decision", "Reason"],
    ...events.map((e) => [
      e.time,
      e.actor,
      e.action,
      e.reason || "No reason recorded",
    ]),
  ];
}

export type NetworkFlow = {
  id: string;
  source: string;
  category: string;
  destination: string;
  account: string;
  region: string;
  gb: number;
  cost: number;
};
// Sample VPC flow-log attribution, separate from billing records. Units are decimal GB.
const paths = [
  ["prod-api-a", "AWS service", "S3 public endpoint", 18000],
  ["prod-api-b", "AWS service", "S3 public endpoint", 14000],
  ["prod-worker", "AWS service", "S3 public endpoint", 8000],
  ["prod-api-a", "External API", "Payments API", 8000],
  ["prod-api-b", "External API", "Payments API", 6000],
  ["prod-worker", "External API", "Telemetry endpoint", 5400],
] as const;
export function networkFlows(client: string, days: number): NetworkFlow[] {
  if (client !== "brightloop") return [];
  return paths.map(([source, category, destination, gb], i) => {
    const scoped = Math.round((gb * Math.min(24, days)) / 24);
    return {
      id: `flow-${i + 1}`,
      source,
      category,
      destination,
      account: "Production",
      region: "us-east-1",
      gb: scoped,
      cost: Math.round(scoped * 4.5),
    };
  });
}
export function flowTotals(flows: NetworkFlow[]) {
  return {
    gb: flows.reduce((s, f) => s + f.gb, 0),
    cost: flows.reduce((s, f) => s + f.cost, 0),
  };
}

export function sankeyLayout(
  flows: NetworkFlow[],
  weight: "cost" | "gb",
  canvasWidth = 1010,
) {
  const width = Math.max(640, canvasWidth);
  const columnX = [20, (width - 200) / 2, width - 200];
  const columns = ["source", "category", "destination"] as const;
  const total = flows.reduce((s, f) => s + f[weight], 0);
  const height = 240,
    gap = 18;
  const maxNodes = Math.max(
    1,
    ...columns.map((key) => new Set(flows.map((f) => f[key])).size),
  );
  const scale = total ? (height - gap * (maxNodes - 1)) / total : 0;
  const nodes = columns.map((key, column) => {
    let y = 22;
    return [...new Set(flows.map((f) => f[key]))].map((name) => {
      const value = flows
        .filter((f) => f[key] === name)
        .reduce((s, f) => s + f[weight], 0);
      const node = {
        id: `${key}:${name}`,
        name,
        column,
        x: columnX[column],
        y,
        height: value * scale,
        value,
      };
      y += node.height + gap;
      return node;
    });
  });
  const links: {
    id: string;
    source: string;
    target: string;
    value: number;
    path: string;
    width: number;
    flowIds: string[];
  }[] = [];
  for (let column = 0; column < 2; column++) {
    const sourceOffsets = new Map<string, number>(),
      targetOffsets = new Map<string, number>();
    const pairs = new Map<string, NetworkFlow[]>();
    for (const f of flows) {
      const k = `${f[columns[column]]}|${f[columns[column + 1]]}`;
      pairs.set(k, [...(pairs.get(k) || []), f]);
    }
    for (const [key, items] of pairs) {
      const [a, b] = key.split("|"),
        s = nodes[column].find((n) => n.name === a)!,
        t = nodes[column + 1].find((n) => n.name === b)!;
      const value = items.reduce((v, f) => v + f[weight], 0),
        width = value * scale;
      const sy = s.y + (sourceOffsets.get(a) || 0) + width / 2,
        ty = t.y + (targetOffsets.get(b) || 0) + width / 2;
      sourceOffsets.set(a, (sourceOffsets.get(a) || 0) + width);
      targetOffsets.set(b, (targetOffsets.get(b) || 0) + width);
      links.push({
        id: key,
        source: a,
        target: b,
        value,
        width,
        path: `M${s.x + 10},${sy} C${s.x + 10 + (t.x - s.x - 10) / 2},${sy} ${t.x - (t.x - s.x - 10) / 2},${ty} ${t.x},${ty}`,
        flowIds: items.map((f) => f.id),
      });
    }
  }
  return { nodes: nodes.flat(), links, total };
}
