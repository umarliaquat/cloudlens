import type { Overview, Recommendation } from "../../lib/domain";
import { filterCosts, groupCosts } from "./breakdown";
import {
  changePercent,
  forecastMonth,
  savingsTotals,
  sumComplete,
} from "./costs";

export function homepageModel(
  o: Overview,
  account: string,
  recommendations: Recommendation[],
  budget: number,
) {
  const filter = { account };
  const records = filterCosts(o.records, filter),
    previous = filterCosts(o.previousRecords, filter);
  const month = filterCosts(o.monthRecords, filter),
    priorMonth = filterCosts(o.previousMonthRecords, filter);
  const spend = sumComplete(records),
    prior = sumComplete(previous),
    mtd = sumComplete(month),
    priorMtd = sumComplete(priorMonth);
  const forecast = forecastMonth(month, "2026-10-25");
  const previousGroups = groupCosts(previous, "service");
  const services = groupCosts(records, "service").map((r) => {
    const before = previousGroups.find((p) => p.name === r.name)?.amount || 0;
    return { ...r, previous: before, delta: r.amount - before };
  });
  const drivers = services
    .filter((r) => r.delta > 0)
    .sort((a, b) => b.delta - a.delta)
    .slice(0, 2);
  const otherChange = spend - prior - drivers.reduce((s, r) => s + r.delta, 0);
  const scopedRecommendations = recommendations.filter(
    (r) => account === "all" || r.account === account,
  );
  const savings = savingsTotals(scopedRecommendations);
  const verified = scopedRecommendations.filter((r) => r.status === "Verified");
  const ready = scopedRecommendations.filter((r) => r.status === "Open");
  const dates = o.trend.map((p) => p.date);
  let accrued = 0;
  const points = dates.map((date) => {
    const actual = date < "2026-10-25";
    if (actual) accrued += sumComplete(records.filter((r) => r.date === date));
    const day = Number(date.slice(-2));
    return {
      date,
      actual: actual ? accrued : null,
      forecast:
        o.period === "month" && forecast !== null && day >= 24
          ? Math.round(mtd + ((forecast - mtd) * Math.max(0, day - 24)) / 7)
          : null,
      budget:
        o.period === "month" && account === "all"
          ? Math.round((budget * day) / 31)
          : null,
    };
  });
  return {
    records,
    previous,
    spend,
    prior,
    change: changePercent(spend, prior),
    mtd,
    priorMtd,
    mtdChange: changePercent(mtd, priorMtd),
    forecast,
    budget: account === "all" ? budget : null,
    services,
    drivers,
    otherChange,
    savings,
    verified,
    ready,
    scopedRecommendations,
    points,
  };
}
export type HomepageModel = ReturnType<typeof homepageModel>;

export type SpendChartMode = "daily" | "cumulative";
export function spendChartSeries(
  points: HomepageModel["points"],
  mode: SpendChartMode,
) {
  if (mode === "cumulative") return points;
  let priorActual = 0,
    priorForecast = 0,
    priorBudget = 0;
  return points.map((p) => {
    const actual = p.actual === null ? null : p.actual - priorActual;
    const budget = p.budget === null ? null : p.budget - priorBudget;
    // The final actual day anchors the forecast line, not an extra forecast day.
    const forecast =
      p.forecast === null
        ? null
        : p.actual !== null
          ? actual
          : p.forecast - priorForecast;
    if (p.actual !== null) priorActual = p.actual;
    if (p.forecast !== null) priorForecast = p.forecast;
    if (p.budget !== null) priorBudget = p.budget;
    return { ...p, actual, forecast, budget };
  });
}

export function driverEvidence(
  client: string,
  service: string,
  period: string,
  account: string,
) {
  if (
    client === "brightloop" &&
    period === "month" &&
    (account === "all" || account === "Production")
  ) {
    if (service === "Amazon EC2")
      return {
        title: "EC2 instance usage",
        owner: "Production · Compute team",
        observation: "+3,000 m6i.2xlarge instance-hours.",
        caution: "Deployment cause unconfirmed.",
        quantity: 3000,
        unit: "instance-hours",
        rate: 0.365,
      };
    if (service === "Amazon VPC")
      return {
        title: "NAT data processing",
        owner: "Production · Platform team",
        observation: "+19,400 GB processed by NAT gateways.",
        caution: "Traffic source unconfirmed; investigate the paths.",
        quantity: 19400,
        unit: "GB",
        rate: 0.045,
      };
  }
  return {
    title: service,
    owner: account === "all" ? "All selected accounts" : account,
    observation: "Higher complete-period billed cost.",
    caution: "Investigate usage and rate changes before attributing a cause.",
    quantity: null,
    unit: null,
    rate: null,
  };
}
