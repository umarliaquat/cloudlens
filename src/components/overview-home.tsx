"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  IconArrowRight,
  IconCalendar,
  IconChevronDown,
  IconChevronRight,
  IconDownload,
  IconInfoCircle,
  IconShieldCheck,
  IconWallet,
  IconBulb,
  IconDots,
} from "@tabler/icons-react";
import type { Overview, Period, Recommendation, Role } from "@/lib/domain";
import { money, percent, shortDate } from "@/lib/format";
import { workspaceHref } from "@/lib/workspace";
import {
  homepageModel,
  driverEvidence,
  spendChartSeries,
  type SpendChartMode,
} from "@/server/analysis/homepage";
import { HomeSpendChart } from "./overview-spend-chart";
import { Modal } from "./workspace/operations-pages";
import { downloadCsv } from "./workspace/shared";

const serviceIcons: Record<string, string> = {
  "Amazon EC2": "ec2",
  "Amazon RDS": "rds",
  "Amazon VPC": "vpc",
  "Amazon S3": "s3",
  "Amazon CloudFront": "cloudfront",
};
function AwsIcon({ service }: { service: string }) {
  return serviceIcons[service] ? (
    <img
      className="home-aws-icon"
      src={`/aws/${serviceIcons[service]}.svg`}
      alt=""
      aria-hidden="true"
      width={28}
      height={28}
    />
  ) : (
    <span className="home-aws-icon home-other-icon">
      <IconDots aria-hidden="true" />
    </span>
  );
}
function Signed({ value }: { value: number }) {
  return (
    <>
      {value > 0 ? "+" : value < 0 ? "−" : ""}
      {money(Math.abs(value))}
    </>
  );
}
type Props = {
  overview: Overview;
  recommendations: Recommendation[];
  budget: number;
  role: Role;
  onOpen: (panel: string) => void;
  onPeriod: (period: Period) => void;
  notify: (message: string) => void;
  audit: (action: string, object: string, reason?: string) => void;
};
type Detail = {
  kind:
    | "basis"
    | "driver"
    | "measurement"
    | "forecast"
    | "export"
    | "opportunities";
  service?: string;
};
export function OverviewHome({
  overview: o,
  recommendations,
  budget,
  role,
  onOpen,
  onPeriod,
  notify,
  audit,
}: Props) {
  const router = useRouter(),
    query = useSearchParams();
  const accounts = useMemo(
    () => [...new Set(o.monthRecords.map((r) => r.account))].sort(),
    [o.monthRecords],
  );
  const [account, setAccount] = useState(query.get("account") || "all");
  const [detail, setDetail] = useState<Detail | null>(null);
  const returnFocus = useRef<HTMLElement | null>(null);
  function showDetail(next: Detail | null) {
    if (next && document.activeElement instanceof HTMLElement)
      returnFocus.current = document.activeElement;
    setDetail(next);
    if (!next) requestAnimationFrame(() => returnFocus.current?.focus());
  }
  const [table, setTable] = useState(false);
  const [chartMode, setChartMode] = useState<SpendChartMode>("daily");
  useEffect(() => {
    if (account !== "all" && !accounts.includes(account)) setAccount("all");
  }, [account, accounts]);
  const m = homepageModel(o, account, recommendations, budget);
  const chartPoints = spendChartSeries(m.points, chartMode);
  const monthComparison = "Sep 1–24";
  const comparison =
    o.period === "month" ? monthComparison : `prior ${o.completeDays} days`;
  function chooseAccount(value: string) {
    setAccount(value);
    const url = new URL(window.location.href);
    if (value === "all") url.searchParams.delete("account");
    else url.searchParams.set("account", value);
    window.history.replaceState(null, "", url);
  }
  function explore(service?: string, day?: string, period: Period = o.period) {
    const url = new URL(
      workspaceHref("costs", o.client.id, period, role),
      window.location.origin,
    );
    if (account !== "all") url.searchParams.set("account", account);
    if (service) url.searchParams.set("service", service);
    if (day) url.searchParams.set("day", day);
    router.push(url.pathname + url.search);
  }
  const driver = m.drivers.find((r) => r.name === detail?.service);
  const evidence = driver
    ? driverEvidence(o.client.id, driver.name, o.period, account)
    : null;
  function exportReview() {
    downloadCsv(
      `cloudlens-${o.client.id}-${o.period}-${account.toLowerCase()}-review.csv`,
      [
        ["CloudLens client review · SIMULATED DATA", o.client.name],
        ["Period", o.rangeLabel],
        ["Scope", account === "all" ? "All accounts" : account],
        ["Basis", "Amortized USD; tax excluded; complete days only"],
        ["Complete through", "2026-10-24 UTC"],
        ["Service", "Current USD", "Comparable prior USD", "Change USD"],
        ...m.services.map((r) => [
          r.name,
          (r.amount / 100).toFixed(2),
          (r.previous / 100).toFixed(2),
          (r.delta / 100).toFixed(2),
        ]),
        [
          "TOTAL",
          (m.spend / 100).toFixed(2),
          (m.prior / 100).toFixed(2),
          ((m.spend - m.prior) / 100).toFixed(2),
        ],
        ["Month-to-date USD", (m.mtd / 100).toFixed(2)],
        [
          "Month-end forecast USD · estimate",
          m.forecast === null ? "Unavailable" : (m.forecast / 100).toFixed(2),
        ],
        ["Recommendation", "Status", "Monthly run rate USD", "Owner"],
        ...m.scopedRecommendations.map((r) => [
          r.title,
          r.status,
          (r.savings / 100).toFixed(2),
          r.owner,
        ]),
        [
          "Savings note",
          "Identified is estimated, not realized. Verified is simulated measured monthly run rate, not cash saved in the selected month.",
        ],
        ...(o.client.id === "brightloop"
          ? [
              [
                "Verification window",
                "Baseline Sep 27–Oct 10; observation Oct 11–24; 30-day normalization; comparable workload and unchanged rates assumed.",
              ],
            ]
          : []),
      ],
    );
    audit("Client review exported", `${o.rangeLabel} · ${account}`);
    notify("Scoped client review downloaded as CSV.");
    showDetail(null);
  }
  return (
    <div className="home-view">
      <header className="home-heading">
        <div>
          <h1>Cost overview</h1>
          <p>Demo data · Costs through Oct 24, 2026 (UTC)</p>
        </div>
        <div className="home-actions">
          <label className="button secondary date-select">
            <IconCalendar aria-hidden="true" />
            <select
              aria-label="Date range"
              value={o.period}
              onChange={(e) => onPeriod(e.target.value as Period)}
            >
              <option value="month">October 2026</option>
              <option value="7d">Last 7 days</option>
              <option value="30d">Last 30 days</option>
            </select>
            <IconChevronDown aria-hidden="true" />
          </label>
          <button
            className="button primary"
            onClick={() => showDetail({ kind: "export" })}
          >
            <IconDownload aria-hidden="true" />
            Export review
          </button>
        </div>
      </header>
      <div className="home-scope">
        <label className="button secondary">
          <span className="sr-only">Filter accounts</span>
          <select
            aria-label="Filter accounts"
            value={account}
            onChange={(e) => chooseAccount(e.target.value)}
          >
            <option value="all">All {accounts.length} accounts</option>
            {accounts.map((a) => (
              <option key={a}>{a}</option>
            ))}
          </select>
          <IconChevronDown aria-hidden="true" />
        </label>
        <button
          className="button secondary"
          onClick={() => showDetail({ kind: "basis" })}
        >
          Amortized cost
          <IconInfoCircle aria-hidden="true" />
        </button>
        <span>USD · Excludes tax</span>
      </div>
      {o.period !== "month" && (
        <p className="home-range-note">
          Chart, cost changes and service breakdown:{" "}
          {o.rangeLabel.toLowerCase()}. Month-to-date and month-end metrics
          remain October.
        </p>
      )}
      <section className="home-metrics" aria-label="Financial summary">
        <div className="home-metric-group">
          <div className="home-metric-caption">
            <IconWallet aria-hidden="true" />
            Cloud spend
          </div>
          <div className="home-metric-body">
            <button
              className="home-metric"
              onClick={() => explore(undefined, undefined, "month")}
              aria-label="View month-to-date costs"
            >
              <span>Month to date</span>
              <strong className="num">{money(m.mtd)}</strong>
              <small>
                <Signed value={m.mtd - m.priorMtd} /> (
                {percent(m.mtdChange, true)}) vs {monthComparison}
              </small>
            </button>
            <button
              className="home-metric"
              onClick={() => showDetail({ kind: "forecast" })}
              aria-label="View forecast method"
            >
              <span>Month-end forecast · estimate</span>
              <strong className="num">
                {m.forecast === null ? "—" : money(m.forecast)}
              </strong>
              <small
                className={
                  m.budget && m.forecast && m.forecast > m.budget
                    ? "home-warning"
                    : "home-success"
                }
              >
                {m.budget && m.forecast
                  ? `${money(Math.abs(m.forecast - m.budget))} ${m.forecast > m.budget ? "above" : "below"} ${money(m.budget)} budget`
                  : "No account-specific budget set"}
              </small>
            </button>
          </div>
        </div>
        <div className="home-metric-group">
          <div className="home-metric-caption">
            <IconBulb aria-hidden="true" />
            Savings · monthly run rate
          </div>
          <div className="home-metric-body">
            <button
              className="home-metric"
              onClick={() => showDetail({ kind: "opportunities" })}
              aria-label="View identified savings"
            >
              <span>Identified · estimate</span>
              <strong className="num">{money(m.savings.identified)}</strong>
              <small>
                {
                  m.scopedRecommendations.filter((r) =>
                    ["Open", "Approved", "Changes requested"].includes(
                      r.status,
                    ),
                  ).length
                }{" "}
                opportunities · not yet realized
              </small>
            </button>
            <button
              className="home-metric"
              onClick={() => showDetail({ kind: "measurement" })}
              aria-label="View verified savings"
            >
              <span>Verified · measured run rate</span>
              <strong className="num">{money(m.savings.verified)}</strong>
              <small className="home-success">
                {m.verified.length}{" "}
                {m.verified.length === 1 ? "change" : "changes"} ·{" "}
                {o.client.id === "brightloop"
                  ? "measured Oct 11–24"
                  : "simulated verification"}
              </small>
            </button>
          </div>
        </div>
      </section>
      <div className="home-main-grid">
        <section className="home-panel home-chart-panel">
          <div className="home-panel-heading">
            <div>
              <h2>
                {chartMode === "daily"
                  ? "Spend over time"
                  : "Spend against plan"}
              </h2>
              <p>
                {chartMode === "daily" ? "Daily costs" : "Cumulative spend"} ·
                USD · {o.rangeLabel}
              </p>
            </div>
            <button className="text-button accent" onClick={() => explore()}>
              View analysis
              <IconArrowRight aria-hidden="true" />
            </button>
          </div>
          <div className="home-chart-summary">
            <div>
              <span>
                Actual spend ·{" "}
                {o.period === "month" ? "Oct 1–24" : o.rangeLabel.toLowerCase()}
              </span>
              <div className="home-chart-total">
                <strong className="num">{money(m.spend)}</strong>
                <small>
                  <Signed value={m.spend - m.prior} /> (
                  {percent(m.change, true)}) vs {comparison}
                </small>
              </div>
            </div>
            <div
              className="home-chart-modes"
              role="group"
              aria-label="Chart view"
            >
              <button
                aria-pressed={chartMode === "daily"}
                onClick={() => setChartMode("daily")}
              >
                Daily
              </button>
              <button
                aria-pressed={chartMode === "cumulative"}
                onClick={() => setChartMode("cumulative")}
              >
                Cumulative
              </button>
            </div>
          </div>
          {table ? (
            <div className="home-data-scroll">
              <table className="home-table">
                <caption>
                  {chartMode === "daily" ? "Daily costs" : "Cumulative spend"} ·
                  USD
                </caption>
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Actual</th>
                    <th>Forecast</th>
                    <th>
                      {chartMode === "daily"
                        ? "Daily allowance"
                        : "Budget pace"}
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {chartPoints.map((p) => (
                    <tr key={p.date}>
                      <td>{shortDate(p.date)}</td>
                      <td>{p.actual === null ? "—" : money(p.actual)}</td>
                      <td>
                        {p.forecast === null || p.actual !== null
                          ? "—"
                          : money(p.forecast)}
                      </td>
                      <td>{p.budget === null ? "—" : money(p.budget)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <HomeSpendChart
              points={chartPoints}
              mode={chartMode}
              onPoint={(date, estimated) =>
                estimated
                  ? showDetail({ kind: "forecast" })
                  : explore(undefined, date)
              }
            />
          )}
          <div className="home-chart-foot">
            <div className="home-legend">
              <span>
                <i className="home-line" />
                Actual
              </span>
              {o.period === "month" && (
                <>
                  <span>
                    <i className="home-line dashed" />
                    Forecast
                  </span>
                  {m.budget && (
                    <span>
                      <i className="home-line budget" />
                      {chartMode === "daily" ? "Budget / day" : "Budget pace"}
                    </span>
                  )}
                </>
              )}
            </div>
            <button className="text-button" onClick={() => setTable(!table)}>
              {table ? "Show chart" : "View data table"}
            </button>
          </div>
        </section>
        <section className="home-panel home-changes">
          <div className="home-panel-heading">
            <div>
              <h2>What changed?</h2>
              <p>
                <Signed value={m.spend - m.prior} /> vs {comparison}
              </p>
            </div>
          </div>
          <div className="home-drivers">
            {m.drivers.map((d) => {
              const e = driverEvidence(o.client.id, d.name, o.period, account);
              return (
                <button
                  className="home-driver"
                  key={d.name}
                  onClick={() =>
                    showDetail({ kind: "driver", service: d.name })
                  }
                >
                  <AwsIcon service={d.name} />
                  <span>
                    <strong>{e.title}</strong>
                    <small>{e.owner}</small>
                    <span className="home-evidence-copy">
                      {e.observation}
                      <br />
                      {e.caution}
                    </span>
                  </span>
                  <strong className="num">
                    <Signed value={d.delta} />
                  </strong>
                </button>
              );
            })}
            {!m.drivers.length && (
              <p className="home-inline-note">
                No service-level cost increases in this scope.
              </p>
            )}
          </div>
          <p className="home-change-offset">
            {m.drivers.length
              ? `Other services ${m.otherChange <= 0 ? "offset the increase by" : "added"}`
              : `Total spend ${m.otherChange < 0 ? "decreased by" : "changed by"}`}{" "}
            {money(Math.abs(m.otherChange))}.
          </p>
          <button className="home-panel-link" onClick={() => explore()}>
            Investigate cost drivers
            <IconArrowRight aria-hidden="true" />
          </button>
        </section>
        <section className="home-panel home-service-panel">
          <div className="home-panel-heading">
            <div>
              <h2>Where the money goes</h2>
              <p>
                {o.period === "month"
                  ? "Oct 1–24 vs Sep 1–24"
                  : `${o.rangeLabel} vs ${comparison}`}{" "}
                ·{" "}
                {account === "all"
                  ? `All ${accounts.length} accounts`
                  : account}
              </p>
            </div>
            <button className="text-button accent" onClick={() => explore()}>
              Open Cost Explorer
              <IconArrowRight aria-hidden="true" />
            </button>
          </div>
          <div className="home-service-scroll">
            <table className="home-table home-service-table">
              <thead>
                <tr>
                  <th>AWS service</th>
                  <th>Share</th>
                  <th className="align-right">Spend</th>
                  <th className="align-right">Change</th>
                </tr>
              </thead>
              <tbody>
                {m.services.map((s) => (
                  <tr key={s.name}>
                    <td>
                      <button
                        className="home-service-name"
                        onClick={() => explore(s.name)}
                      >
                        <AwsIcon service={s.name} />
                        <span>{s.name}</span>
                      </button>
                    </td>
                    <td>
                      <div className="home-share">
                        <span>
                          <i style={{ width: `${s.share}%` }} />
                        </span>
                        <small>{s.share.toFixed(1)}%</small>
                      </div>
                    </td>
                    <td className="align-right num">{money(s.amount)}</td>
                    <td className="align-right num">
                      <Signed value={s.delta} />
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr>
                  <th>Total</th>
                  <td>100%</td>
                  <td className="align-right num">{money(m.spend)}</td>
                  <td className="align-right num">
                    <Signed value={m.spend - m.prior} />
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </section>
        <section className="home-panel home-outcomes">
          <div className="home-panel-heading">
            <div>
              <h2>Changes that delivered</h2>
              <p>
                {m.verified.length} implemented{" "}
                {m.verified.length === 1 ? "action" : "actions"} ·{" "}
                {o.client.id === "brightloop"
                  ? "measurement Oct 11–24"
                  : "simulated measurement"}
              </p>
            </div>
          </div>
          <div className="home-outcome-summary">
            <strong className="num">
              <IconShieldCheck aria-hidden="true" />
              {money(m.savings.verified)} / month
            </strong>
            <p>Verified run rate · not cash saved this month</p>
          </div>
          <div className="home-outcome-list">
            {m.verified.map((r) => (
              <button
                key={r.id}
                onClick={() => showDetail({ kind: "measurement" })}
              >
                <span>
                  <strong>{r.title}</strong>
                  <small>
                    {o.client.id === "brightloop"
                      ? "Implemented Oct 10"
                      : "Simulated implementation"}{" "}
                    · {r.owner}
                  </small>
                </span>
                <strong className="num">{money(r.savings)}/mo</strong>
              </button>
            ))}
          </div>
          <p className="home-measurement-note">
            {o.client.id === "brightloop"
              ? "Compared with Sep 27–Oct 10; normalized to 30 days."
              : "Review the evidence and assumptions before using these estimates."}
          </p>
          <button
            className="home-panel-link"
            onClick={() => showDetail({ kind: "measurement" })}
          >
            View measurement evidence
            <IconArrowRight aria-hidden="true" />
          </button>
        </section>
      </div>
      <section className="home-panel home-decisions">
        <div className="home-panel-heading">
          <div>
            <h2>
              {role === "engineer"
                ? "Ready for your team"
                : "Recommendations to review"}
            </h2>
            <p>
              {m.ready.length} {m.ready.length === 1 ? "decision" : "decisions"}{" "}
              waiting ·{" "}
              {role === "engineer"
                ? "review evidence before deciding"
                : "an engineer must approve changes"}
            </p>
          </div>
          <button
            className="text-button accent"
            onClick={() =>
              account === "all"
                ? router.push(
                    workspaceHref(
                      "recommendations",
                      o.client.id,
                      o.period,
                      role,
                    ),
                  )
                : showDetail({ kind: "opportunities" })
            }
          >
            All recommendations
            <IconArrowRight aria-hidden="true" />
          </button>
        </div>
        <div className="home-decision-scroll">
          <table className="home-table">
            <thead>
              <tr>
                <th>Recommendation</th>
                <th>Est. savings / mo</th>
                <th>Owner / risk</th>
                <th>
                  <span className="sr-only">Next step</span>
                </th>
              </tr>
            </thead>
            <tbody>
              {m.ready.slice(0, 2).map((r) => (
                <tr key={r.id}>
                  <td>
                    <div className="home-decision-title">
                      <AwsIcon service="Amazon EC2" />
                      <span>
                        <strong>{r.title}</strong>
                        <small>
                          {r.resource} · {r.account}
                        </small>
                      </span>
                    </div>
                  </td>
                  <td className="num home-decision-saving">
                    {money(r.savings)}
                  </td>
                  <td>
                    <strong>{r.owner}</strong>
                    <small>
                      {r.risk} risk ·{" "}
                      {r.risk === "Medium"
                        ? "review memory"
                        : "confirm batch jobs"}
                    </small>
                  </td>
                  <td>
                    <button
                      className="button secondary"
                      onClick={() => onOpen(`recommendation:${r.id}`)}
                    >
                      Review evidence
                      <IconArrowRight aria-hidden="true" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {!m.ready.length && (
          <p className="home-inline-note">
            No recommendations awaiting initial review in this scope. View all
            recommendations for ongoing work.
          </p>
        )}
      </section>
      <footer className="home-footer">
        <span>
          Sample scenario · no live AWS connection or automatic infrastructure
          changes
        </span>
        <span>USD · Amortized · Complete days only</span>
      </footer>
      <Modal
        open={detail !== null}
        onClose={() => showDetail(null)}
        title={
          detail?.kind === "basis"
            ? "How these costs are calculated"
            : detail?.kind === "driver"
              ? "Cost change evidence"
              : detail?.kind === "measurement"
                ? "Verified savings measurement"
                : detail?.kind === "forecast"
                  ? "Month-end forecast"
                  : detail?.kind === "opportunities"
                    ? "Identified savings"
                    : "Export client review"
        }
        description={`${o.client.name} · ${account === "all" ? "All accounts" : account} · Simulated data`}
      >
        {detail?.kind === "basis" && (
          <div className="home-detail-copy">
            <h3>Amortized cost</h3>
            <p>
              Upfront commitment charges are spread over their covered period.
              This demo provides one cost basis; it does not offer an
              unsupported alternative calculation.
            </p>
            <p>
              All amounts are USD, exclude tax, and exclude the partial current
              day. Complete data ends Oct 24, 2026 UTC. Month-to-date compares
              Oct 1–24 with Sep 1–24. Other ranges compare the preceding
              equal-length period.
            </p>
            <p>
              Account scope affects spend, services, recommendations and
              exported evidence. Savings are monthly run rates as of the demo
              date.
            </p>
          </div>
        )}
        {detail?.kind === "forecast" && (
          <div className="home-detail-copy">
            <strong className="home-dialog-value num">
              {m.forecast === null ? "Unavailable" : money(m.forecast)}
            </strong>
            <p>
              October month-to-date actual: {money(m.mtd)}. The forecast adds
              seven days at the average daily cost of the last seven complete
              days. It is an estimate, not a bill.
            </p>
            {m.forecast !== null && (
              <p>
                {money(m.mtd)} actual + {money(m.forecast - m.mtd)} estimated
                Oct 25–31 = {money(m.forecast)}.
              </p>
            )}
            <p>
              {m.budget
                ? `Monthly all-account budget: ${money(m.budget)}.`
                : "No account-specific budget is configured. The all-account budget is not applied to an individual account."}
            </p>
            {m.budget && (
              <button
                className="button secondary"
                onClick={() => {
                  showDetail(null);
                  onOpen("budget");
                }}
              >
                View monthly budget
                <IconArrowRight />
              </button>
            )}
          </div>
        )}
        {detail?.kind === "driver" && driver && evidence && (
          <div className="home-detail-copy">
            <div className="home-detail-service">
              <AwsIcon service={driver.name} />
              <h3>{evidence.title}</h3>
            </div>
            <p>
              {comparison}: {money(driver.previous)} → {money(driver.amount)} (
              <Signed value={driver.delta} />
              ).
            </p>
            <p>
              {evidence.observation} {evidence.caution}
            </p>
            {evidence.quantity !== null && (
              <p>
                {evidence.quantity.toLocaleString()} {evidence.unit} × $
                {evidence.rate} effective rate = {money(driver.delta)}.
                Synthetic effective rates are scenario assumptions, not AWS
                list-price quotations.
              </p>
            )}
            <p>
              Billing supports the cost and usage observation. It does not prove
              a deployment or network-path cause. Network attribution requires
              additional flow-log evidence.
            </p>
            <button
              className="button primary"
              onClick={() => explore(driver.name)}
            >
              Investigate {driver.name}
              <IconArrowRight />
            </button>
          </div>
        )}
        {detail?.kind === "measurement" && (
          <div className="home-detail-copy">
            <strong className="home-dialog-value num">
              {money(m.savings.verified)} / month
            </strong>
            <p>
              Monthly run rate from simulated measurements. This is separate
              from identified savings and is not cash saved in October.
            </p>
            {m.verified.map((r) => (
              <section className="home-detail-evidence" key={r.id}>
                <h3>
                  {r.title} · {money(r.savings)}/mo
                </h3>
                <p>{r.evidence}</p>
              </section>
            ))}
            {!m.verified.length && (
              <p>No verified changes in this account scope.</p>
            )}
            <button
              className="button secondary"
              onClick={() => {
                showDetail(null);
                router.push(
                  workspaceHref("audit", o.client.id, o.period, role),
                );
              }}
            >
              View decision trail
              <IconArrowRight />
            </button>
          </div>
        )}
        {detail?.kind === "opportunities" && (
          <div className="home-detail-copy">
            <strong className="home-dialog-value num">
              {money(m.savings.identified)} / month
            </strong>
            <p>
              Estimated savings, not yet realized. Approval and implementation
              are separate steps.
            </p>
            {m.scopedRecommendations
              .filter((r) =>
                ["Open", "Approved", "Changes requested"].includes(r.status),
              )
              .map((r) => (
                <button
                  className="home-opportunity"
                  key={r.id}
                  onClick={() => {
                    showDetail(null);
                    onOpen(`recommendation:${r.id}`);
                  }}
                >
                  <span>
                    <strong>{r.title}</strong>
                    <small>
                      {r.status} · {r.owner}
                    </small>
                  </span>
                  <strong>{money(r.savings)}/mo</strong>
                  <IconChevronRight aria-hidden="true" />
                </button>
              ))}
          </div>
        )}
        {detail?.kind === "export" && (
          <div className="home-detail-copy">
            <h3>A review with the same reporting scope</h3>
            <p>
              {o.rangeLabel} · {account === "all" ? "All accounts" : account} ·
              USD, amortized, tax excluded.
            </p>
            <p>
              The CSV includes service costs and comparisons, the month-end
              estimate, recommendation statuses, owners and savings assumptions.
              All data is simulated.
            </p>
            <button className="button primary" onClick={exportReview}>
              <IconDownload aria-hidden="true" />
              Download review · CSV
            </button>
            <button
              className="button secondary"
              onClick={() => {
                showDetail(null);
                setTimeout(() => window.print(), 200);
              }}
            >
              Print overview / Save as PDF
            </button>
          </div>
        )}
      </Modal>
    </div>
  );
}
