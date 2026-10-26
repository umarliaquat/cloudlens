import type {
  Client,
  CostRecord,
  Overview,
  Period,
  Anomaly,
  Recommendation,
  TrendPoint,
} from "../../lib/domain";
import {
  changePercent,
  forecastMonth,
  projectMonthEnd,
  savingsTotals,
  sumComplete,
} from "../analysis/costs";
import { brightloopRecords, brightloopRecommendations } from "./brightloop";
export const DEMO_TODAY = "2026-10-25";
export const clients: Client[] = [
  {
    id: "brightloop",
    name: "Brightloop Retail",
    industry: "E-commerce",
    initials: "BR",
    budget: 4800000,
    accounts: 4,
  },
  {
    id: "medora",
    name: "Medora Health",
    industry: "Healthcare SaaS",
    initials: "MH",
    budget: 3600000,
    accounts: 3,
  },
  {
    id: "tallyard",
    name: "Tallyard Logistics",
    industry: "Logistics",
    initials: "TL",
    budget: 5400000,
    accounts: 5,
  },
];
const services = [
  ["Amazon EC2", 52800],
  ["Amazon RDS", 29600],
  ["Data Transfer", 13400],
  ["Amazon S3", 11200],
  ["Amazon CloudFront", 8200],
  ["AWS Lambda", 4800],
  ["Amazon Bedrock", 3600],
  ["Other services", 4100],
] as const;
export function seedCosts(clientId: string): CostRecord[] {
  const scale =
    clientId === "medora" ? 0.82 : clientId === "tallyard" ? 1.18 : 1;
  const today = new Date(DEMO_TODAY + "T00:00:00Z");
  const out: CostRecord[] = [];
  for (let ago = 179; ago >= 0; ago--) {
    const d = new Date(today);
    d.setUTCDate(today.getUTCDate() - ago);
    const date = d.toISOString().slice(0, 10);
    const day = d.getUTCDay();
    for (let i = 0; i < services.length; i++) {
      const [service, base] = services[i];
      const variation = 1 + Math.sin((179 - ago) * 1.7 + i * 2.2) * 0.07;
      const spike =
        clientId === "brightloop" && ago <= 7 && (i === 0 || i === 2)
          ? i === 2
            ? 1.95
            : 1.32
          : 1;
      const growth =
        clientId === "tallyard" && i === 6 ? 1 + (179 - ago) / 180 : 1;
      const weekend = day === 0 || day === 6 ? 0.87 : 1;
      out.push({
        date,
        service,
        account: ["Production", "Staging", "Development", "Shared", "Platform"][
          i % (clients.find((c) => c.id === clientId)?.accounts || 3)
        ],
        region: i % 2 ? "eu-west-1" : "us-east-1",
        amount: Math.round(
          base *
            scale *
            variation *
            spike *
            growth *
            weekend *
            (ago === 0 ? 0.35 : 1),
        ),
        partial: ago === 0,
      });
    }
  }
  if (clientId === "brightloop")
    return [
      ...out
        .filter(
          (r) =>
            !(r.date >= "2026-09-01" && r.date <= "2026-09-24") &&
            !(r.date >= "2026-10-01" && r.date <= "2026-10-24"),
        )
        .map((r) => ({
          ...r,
          service: r.service === "Data Transfer" ? "Amazon VPC" : r.service,
        })),
      ...brightloopRecords(),
    ];
  return out;
}
const baseRecommendations: Recommendation[] = [
  {
    id: "rec-1",
    title: "Rightsize 3 underutilized instances",
    resource: "prod-api-workers",
    account: "Production",
    type: "Rightsizing",
    savings: 64000,
    risk: "Medium",
    confidence: "Medium",
    status: "Open",
    version: 1,
    evidence:
      "Peak CPU below 28% over 14 complete days. Three m5.2xlarge instances are candidates for m5.xlarge.",
    explanation:
      "These instances consistently use less than a third of their CPU capacity. A smaller size could reduce monthly costs. Memory and burst requirements are not visible from CPU alone; test the change before implementing.",
    owner: "Platform team",
  },
  {
    id: "rec-2",
    title: "Stop an idle development instance",
    resource: "dev-worker-03",
    account: "Development",
    type: "Idle instance",
    savings: 18600,
    risk: "Low",
    confidence: "High",
    status: "Open",
    version: 1,
    evidence:
      "Average CPU 1.8% over 14 complete days, with less than 1 MB daily network traffic.",
    explanation:
      "This development instance has little activity. Confirm that it is not needed for a scheduled task before stopping it outside CloudLens.",
    owner: "Daniel Chen",
  },
  {
    id: "rec-3",
    title: "Remove 8 unattached EBS volumes",
    resource: "vol-dev-archive × 8",
    account: "Development",
    type: "Unused storage",
    savings: 14800,
    risk: "Low",
    confidence: "High",
    status: "Open",
    version: 1,
    evidence:
      "Eight volumes have been unattached for 18 days. Estimated combined monthly cost: $148.",
    explanation:
      "These volumes are not attached to an instance. Check retention requirements and take a snapshot if the data might be needed.",
    owner: "Infrastructure team",
  },
  {
    id: "rec-4",
    title: "Archive older application logs",
    resource: "brightloop-app-logs",
    account: "Platform",
    type: "Storage lifecycle",
    savings: 9200,
    risk: "Low",
    confidence: "Medium",
    status: "Changes requested",
    version: 1,
    evidence:
      "2,400 GB stored without a lifecycle policy. Savings estimate ranges from $65 to $115 per month.",
    explanation:
      "A storage lifecycle rule could move older objects to a lower-cost tier. Confirm how often older logs are read and their retention policy.",
    owner: "Observability team",
  },
  {
    id: "rec-5",
    title: "Consolidate unused staging resources",
    resource: "staging-legacy",
    account: "Platform",
    type: "Idle instance",
    savings: 42100,
    risk: "Medium",
    confidence: "High",
    status: "Verified",
    version: 3,
    evidence:
      "Implemented 2 Oct 2026. Verified through the simulated demo clock on 16 Oct 2026.",
    explanation:
      "Simulated verification marks the expected monthly savings as verified. A real integration would compare actual costs before and after implementation.",
    owner: "Daniel Chen",
  },
  {
    id: "rec-6",
    title: "Release unassociated IP addresses",
    resource: "eip-dev × 4",
    account: "Development",
    type: "Unused addresses",
    savings: 14400,
    risk: "Low",
    confidence: "High",
    status: "Verified",
    version: 3,
    evidence:
      "Implemented 5 Oct 2026. Simulated verification completed 19 Oct 2026.",
    explanation:
      "Four unused addresses were released in the simulated environment.",
    owner: "Daniel Chen",
  },
];
function anomaliesFor(id: string, records: CostRecord[]): Anomaly[] {
  if (id === "brightloop")
    return [
      {
        id: "an-1",
        title: "NAT data processing increased",
        service: "Amazon VPC",
        account: "Production",
        region: "us-east-1",
        impact: 87300,
        percent: 28.5,
        severity: "High",
        status: "New",
        since: "Oct 1",
        explanation:
          "Compared with Sep 1–24, NAT processing increased by 19,400 GB at a simulated effective rate of $0.045/GB: $873 extra. The traffic source is unconfirmed; review flow-log evidence before attributing a cause.",
      },
      {
        id: "an-2",
        title: "EC2 instance-hours increased",
        service: "Amazon EC2",
        account: "Production",
        region: "us-east-1",
        impact: 109500,
        percent: 8.9,
        severity: "Medium",
        status: "Investigating",
        since: "Oct 1",
        explanation:
          "Compared with Sep 1–24, m6i.2xlarge usage increased by 3,000 hours at a simulated effective amortized rate of $0.365/hour: $1,095 extra. Deployment cause remains unconfirmed.",
      },
    ];
  if (id === "tallyard")
    return [
      {
        id: "an-3",
        title: "Bedrock usage is growing",
        service: "Amazon Bedrock",
        account: "Production",
        region: "us-east-1",
        impact: 32200,
        percent: 34,
        severity: "Medium",
        status: "New",
        since: "Oct 20",
        explanation:
          "Model inference usage has increased with the new routing service. Confirm that this growth matches expected adoption.",
      },
    ];
  if (id === "medora") return [];
  const seeded: Anomaly[] = [
    {
      id: "an-1",
      title: "Data transfer is above its usual level",
      service: "Data Transfer",
      account: "Development",
      region: "us-east-1",
      impact: 82400,
      percent: 95,
      severity: "High",
      status: "New",
      since: "Oct 18",
      explanation:
        "Data transfer costs rose after October 18. The largest contributor is inter-region traffic in the Development account. Review recent changes to replication or data movement. This is a rule-based summary of simulated data.",
    },
    {
      id: "an-2",
      title: "EC2 spend increased in Production",
      service: "Amazon EC2",
      account: "Production",
      region: "us-east-1",
      impact: 108600,
      percent: 32,
      severity: "High",
      status: "Investigating",
      since: "Oct 18",
      explanation:
        "Production EC2 costs increased as compute capacity grew. Check recent deployments and instance counts against expected demand. This is a rule-based summary of simulated data.",
    },
  ];
  return seeded.map((anomaly) => {
    const baseline = records
      .filter(
        (r) =>
          r.service === anomaly.service &&
          r.date >= "2026-10-04" &&
          r.date < "2026-10-18" &&
          !r.partial,
      )
      .map((r) => r.amount)
      .sort((a, b) => a - b);
    const median = (baseline[6] + baseline[7]) / 2;
    const recent = records.filter(
      (r) =>
        r.service === anomaly.service &&
        r.date >= "2026-10-18" &&
        r.date < DEMO_TODAY &&
        !r.partial,
    );
    const impact = Math.round(
      recent.reduce((sum, r) => sum + Math.max(0, r.amount - median), 0),
    );
    const average =
      recent.reduce((sum, r) => sum + r.amount, 0) / recent.length;
    return {
      ...anomaly,
      impact,
      percent: Math.round(((average - median) / median) * 100),
    };
  });
}
export interface CostProvider {
  getOverview(clientId: string, period: Period): Overview;
}
export class MockProvider implements CostProvider {
  getOverview(clientId: string, period: Period = "month"): Overview {
    const client = clients.find((c) => c.id === clientId);
    if (!client) throw new Error("Client not found");
    const all = seedCosts(clientId);
    const days = period === "7d" ? 7 : period === "30d" ? 30 : 24;
    const end = new Date(DEMO_TODAY + "T00:00:00Z");
    const start = new Date(end);
    start.setUTCDate(start.getUTCDate() - days);
    const startStr = start.toISOString().slice(0, 10);
    const previousStart = new Date(start);
    previousStart.setUTCDate(start.getUTCDate() - days);
    if (period === "month") previousStart.setTime(Date.UTC(2026, 8, 1));
    const previousStr = previousStart.toISOString().slice(0, 10);
    const current = all.filter(
      (r) => r.date >= startStr && r.date < DEMO_TODAY,
    );
    const previous = all.filter(
      (r) =>
        r.date >= previousStr &&
        r.date < (period === "month" ? "2026-09-25" : startStr),
    );
    const spend = sumComplete(current);
    const previousSpend = sumComplete(previous);
    const recs = (
      clientId === "brightloop"
        ? brightloopRecommendations(baseRecommendations)
        : baseRecommendations
    ).map((r) => ({
      ...r,
      account:
        r.account === "Platform" && client.accounts < 5 ? "Staging" : r.account,
      id: `${clientId}-${r.id}`,
      savings: Math.round(
        r.savings *
          (clientId === "medora" ? 0.75 : clientId === "tallyard" ? 1.1 : 1),
      ),
    }));
    const savings = savingsTotals(recs);
    const forecast = forecastMonth(all, DEMO_TODAY);
    const trend: TrendPoint[] = [];
    for (let i = 0; i < days; i++) {
      const d = new Date(start);
      d.setUTCDate(start.getUTCDate() + i);
      const date = d.toISOString().slice(0, 10);
      const p = new Date(previousStart);
      p.setUTCDate(p.getUTCDate() + i);
      const previousDate = p.toISOString().slice(0, 10);
      trend.push({
        date,
        actual: sumComplete(current.filter((r) => r.date === date)),
        previous: sumComplete(previous.filter((r) => r.date === previousDate)),
        forecast: null,
      });
    }
    const avg = trend.slice(-7).reduce((s, p) => s + (p.actual || 0), 0) / 7;
    if (period === "month") {
      trend[trend.length - 1].forecast = trend[trend.length - 1].actual;
      for (let i = 0; i < 7; i++) {
        const d = new Date(end);
        d.setUTCDate(end.getUTCDate() + i);
        trend.push({
          date: d.toISOString().slice(0, 10),
          actual: null,
          previous: null,
          forecast: Math.round(avg),
        });
      }
    }
    const mtd = sumComplete(
      all.filter((r) => r.date.startsWith("2026-10") && r.date < DEMO_TODAY),
    );
    const priorMtd = sumComplete(
      all.filter((r) => r.date >= "2026-09-01" && r.date < "2026-09-25"),
    );
    return {
      client,
      asOf: "2026-10-25T08:00:00Z",
      period,
      rangeLabel: period === "month" ? "October 2026" : `Last ${days} days`,
      spend,
      previousSpend,
      change: changePercent(spend, previousSpend),
      mtd,
      mtdChange: changePercent(mtd, priorMtd),
      forecast,
      forecastProjection: projectMonthEnd(mtd, forecast, 7),
      budget: client.budget,
      completeDays: days,
      identifiedSavings: savings.identified,
      verifiedSavings: savings.verified,
      trend,
      anomalies: anomaliesFor(clientId, all),
      recommendations: recs,
      records: current,
      previousRecords: previous,
      monthRecords: all.filter(
        (r) => r.date >= "2026-10-01" && r.date < DEMO_TODAY && !r.partial,
      ),
      previousMonthRecords: all.filter(
        (r) => r.date >= "2026-09-01" && r.date < "2026-09-25" && !r.partial,
      ),
      services: [...new Set(current.map((r) => r.service))]
        .map((name) => {
          const amount = sumComplete(current.filter((r) => r.service === name));
          const prev = sumComplete(previous.filter((r) => r.service === name));
          return {
            name,
            amount,
            previous: prev,
            change: changePercent(amount, prev),
            share: spend ? (amount / spend) * 100 : 0,
          };
        })
        .sort((a, b) => b.amount - a.amount),
    };
  }
}
export const provider = new MockProvider();
