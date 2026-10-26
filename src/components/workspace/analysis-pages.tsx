"use client";
import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import {
  IconCloud,
  IconArrowUpRight,
  IconAlertCircle,
  IconBulb,
  IconCircleCheck,
  IconAdjustmentsHorizontal,
  IconChartLine,
} from "@tabler/icons-react";
import { money, percent } from "@/lib/format";
import {
  filterCosts,
  groupCosts,
  type GroupDimension,
} from "@/server/analysis/breakdown";
import { savingsTotals } from "@/server/analysis/costs";
import { SpendChart, Sparkline } from "../spend-chart";
import { ServiceIcon, EvidenceStrip } from "./research-ui";
import { Modal } from "./operations-pages";
import {
  PageHeader,
  Section,
  Summary,
  Search,
  Select,
  Tabs,
  Status,
  riskTone,
  statusTone,
  TableFoot,
  ExportButton,
  ViewButton,
  downloadCsv,
  type PageContext,
} from "./shared";

export function CostExplorerPage({ context: c }: { context: PageContext }) {
  const query = useSearchParams();
  const [group, setGroup] = useState<GroupDimension>(
    (["service", "account", "region"].includes(query.get("group") || "")
      ? query.get("group")
      : "service") as GroupDimension,
  );
  const [account, setAccount] = useState(query.get("account") || "all");
  const [service, setService] = useState(query.get("service") || "all");
  const [region, setRegion] = useState(query.get("region") || "all");
  const [search, setSearch] = useState("");
  const [tableChart, setTableChart] = useState(false);
  const [day, setDay] = useState<string | null>(query.get("day"));
  const records = filterCosts(c.overview.records, { account, service, region });
  const rows = groupCosts(records, group);
  const total = rows.reduce((s, r) => s + r.amount, 0);
  const filtered = rows.filter((r) =>
    r.name.toLowerCase().includes(search.toLowerCase()),
  );
  const points = c.overview.trend
    .filter((p) => p.actual !== null)
    .map((p) => ({
      ...p,
      actual: records
        .filter((r) => r.date === p.date)
        .reduce((s, r) => s + r.amount, 0),
      previous: null,
      forecast: null,
    }));
  useEffect(() => {
    const u = new URL(window.location.href);
    for (const [key, value] of Object.entries({
      group,
      account,
      service,
      region,
    })) {
      if (value === "all") u.searchParams.delete(key);
      else u.searchParams.set(key, value);
    }
    window.history.replaceState(null, "", u);
  }, [group, account, service, region]);
  function exportData() {
    downloadCsv(`cloudlens-${c.overview.client.id}-${group}.csv`, [
      ["CloudLens · Simulated data", c.overview.rangeLabel],
      ["Group", "Spend (USD)", "Share (%)"],
      ...filtered.map((r) => [
        r.name,
        (r.amount / 100).toFixed(2),
        r.share.toFixed(2),
      ]),
    ]);
    c.audit("Cost breakdown exported", `${group} · ${c.overview.rangeLabel}`);
    c.notify("Filtered cost breakdown downloaded.");
  }
  const options = (key: GroupDimension) => [
    {
      value: "all",
      label: `All ${key === "account" ? "accounts" : key === "region" ? "regions" : "services"}`,
    },
    ...[...new Set(c.overview.records.map((r) => r[key]))].map((name) => ({
      value: name,
      label: name,
    })),
  ];
  return (
    <>
      <PageHeader
        title="Cost Explorer"
        subtitle={`${c.overview.client.name} · Explore the drivers behind your spend`}
        period={c.overview.period}
        onPeriod={c.onPeriod}
      >
        <ExportButton onClick={exportData} />
      </PageHeader>
      <div className="explorer-filters">
        <span className="filter-caption">
          <IconAdjustmentsHorizontal />
          Filter costs
        </span>
        <Select
          label="Filter account"
          value={account}
          onChange={setAccount}
          options={options("account")}
        />
        <Select
          label="Filter service"
          value={service}
          onChange={setService}
          options={options("service")}
        />
        <Select
          label="Filter region"
          value={region}
          onChange={setRegion}
          options={options("region")}
        />
        <button
          className="text-button"
          onClick={() => {
            setAccount("all");
            setService("all");
            setRegion("all");
          }}
        >
          Reset filters
        </button>
      </div>
      <Section className="explorer-chart">
        <div className="explorer-chart-heading">
          <div>
            <span className="summary-label">Selected spend</span>
            <strong className="num explorer-total">{money(total)}</strong>
            <p>{c.overview.rangeLabel} · Complete daily records · USD</p>
          </div>
          <div>
            <span className="summary-label">Group by</span>
            <Tabs
              label="Cost grouping"
              value={group}
              onChange={(v) => setGroup(v as GroupDimension)}
              options={[
                { value: "service", label: "Service" },
                { value: "account", label: "Account" },
                { value: "region", label: "Region" },
              ]}
            />
          </div>
        </div>
        {tableChart ? (
          <div className="workspace-table-scroll">
            <table className="workspace-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th className="align-right">Daily spend</th>
                </tr>
              </thead>
              <tbody>
                {points.map((p) => (
                  <tr key={p.date}>
                    <td>{p.date}</td>
                    <td className="align-right num">{money(p.actual)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <SpendChart points={points} compare={false} onPoint={setDay} />
        )}
        <div className="chart-footer">
          <span>Daily spend · Current filters · UTC</span>
          <button
            className="text-button"
            onClick={() => setTableChart(!tableChart)}
          >
            {tableChart ? "Show chart" : "View data table"}
          </button>
        </div>
      </Section>
      <Section
        title={`Spend by ${group}`}
        subtitle="Select a row to narrow the breakdown."
        action={
          <Search
            value={search}
            onChange={setSearch}
            placeholder={`Search ${group}…`}
            label="Search cost breakdown"
          />
        }
      >
        <div className="workspace-table-scroll">
          <table className="workspace-table">
            <thead>
              <tr>
                <th>{group[0].toUpperCase() + group.slice(1)}</th>
                <th>Share of spend</th>
                <th className="align-right">Spend</th>
                <th className="align-right">Daily average</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {filtered.map((r, i) => (
                <tr key={r.name}>
                  <td>
                    <button
                      className="table-entity"
                      onClick={() =>
                        group === "service"
                          ? setService(r.name)
                          : group === "account"
                            ? setAccount(r.name)
                            : setRegion(r.name)
                      }
                    >
                      <span className={`service-symbol service-${i % 5}`}>
                        <IconCloud />
                      </span>
                      <strong>{r.name}</strong>
                    </button>
                  </td>
                  <td>
                    <div className="wide-share">
                      <span>
                        <i style={{ width: `${r.share}%` }} />
                      </span>
                      <small className="num">{r.share.toFixed(1)}%</small>
                    </div>
                  </td>
                  <td className="align-right num">{money(r.amount)}</td>
                  <td className="align-right num">
                    {money(r.amount / c.overview.completeDays)}
                  </td>
                  <td>
                    <button
                      className="icon-button"
                      aria-label={`Inspect ${r.name}`}
                      onClick={() =>
                        group === "service"
                          ? setService(r.name)
                          : group === "account"
                            ? setAccount(r.name)
                            : setRegion(r.name)
                      }
                    >
                      <IconArrowUpRight />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr>
                <th>Total</th>
                <td>100%</td>
                <td className="align-right num">{money(total)}</td>
                <td className="align-right num">
                  {money(total / c.overview.completeDays)}
                </td>
                <td />
              </tr>
            </tfoot>
          </table>
        </div>
        <TableFoot
          count={filtered.length}
          label={
            group === "service"
              ? "services"
              : group === "account"
                ? "accounts"
                : "regions"
          }
        >
          <span>Costs exclude today’s partial data</span>
        </TableFoot>
      </Section>
      <Modal
        open={!!day}
        onClose={() => setDay(null)}
        title={`Daily costs · ${day || ""}`}
        description="Service breakdown within your selected account, service and region filters."
      >
        <div className="workspace-modal-body">
          <div className="workspace-table-scroll">
            <table className="workspace-table report-data">
              <thead>
                <tr>
                  <th>Service</th>
                  <th className="align-right">Spend · USD</th>
                </tr>
              </thead>
              <tbody>
                {groupCosts(
                  records.filter((r) => r.date === day),
                  "service",
                ).map((r) => (
                  <tr key={r.name}>
                    <td>{r.name}</td>
                    <td className="align-right num">{money(r.amount)}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr>
                  <th>Total</th>
                  <td className="align-right num">
                    {money(
                      records
                        .filter((r) => r.date === day)
                        .reduce((s, r) => s + r.amount, 0),
                    )}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      </Modal>
    </>
  );
}

export function AnomaliesPage({ context: c }: { context: PageContext }) {
  const [status, setStatus] = useState("All");
  const [severity, setSeverity] = useState("All severities");
  const [search, setSearch] = useState("");
  const filtered = c.anomalies.filter(
    (a) =>
      (status === "All" || a.status === status) &&
      (severity === "All severities" || a.severity === severity) &&
      `${a.title} ${a.account}`.toLowerCase().includes(search.toLowerCase()),
  );
  const impact = c.anomalies.reduce((s, a) => s + a.impact, 0);
  const exportData = () => {
    downloadCsv("cloudlens-anomalies.csv", [
      ["CloudLens · Simulated data"],
      [
        "Anomaly",
        "Service",
        "Account",
        "Severity",
        "Status",
        "Extra spend (USD)",
      ],
      ...filtered.map((a) => [
        a.title,
        a.service,
        a.account,
        a.severity,
        a.status,
        (a.impact / 100).toFixed(2),
      ]),
    ]);
    c.notify("Anomaly report downloaded.");
  };
  return (
    <>
      <PageHeader
        title="Anomalies"
        subtitle={`${c.overview.client.name} · Investigate unusual changes in spend`}
      >
        <ExportButton onClick={exportData} />
      </PageHeader>
      <Summary
        items={[
          {
            label: "Extra spend detected",
            value: money(impact),
            hint: "Across current events",
            icon: <IconChartLine />,
          },
          {
            label: "Needs investigation",
            value: c.anomalies.filter((a) =>
              ["New", "Investigating"].includes(a.status),
            ).length,
            hint: "New or investigating",
            icon: <IconAlertCircle />,
          },
          {
            label: "High severity",
            value: c.anomalies.filter((a) => a.severity === "High").length,
            hint: "Prioritize the largest impact",
            icon: <IconAlertCircle />,
          },
        ]}
      />
      <Section>
        <div className="workspace-toolbar">
          <Tabs
            label="Anomaly status"
            value={status}
            onChange={setStatus}
            options={[
              "All",
              "New",
              "Investigating",
              "Expected",
              "Resolved",
            ].map((value) => ({
              value,
              label: value,
              count:
                value === "All"
                  ? c.anomalies.length
                  : c.anomalies.filter((a) => a.status === value).length,
            }))}
          />
          <div className="toolbar-end">
            <Search
              value={search}
              onChange={setSearch}
              placeholder="Search anomalies…"
              label="Search anomalies"
            />
            <Select
              label="Severity filter"
              value={severity}
              onChange={setSeverity}
              options={["All severities", "High", "Medium", "Low"]}
            />
          </div>
        </div>
        <div className="anomaly-feed">
          {filtered.map((a) => (
            <article className="event-card" key={a.id}>
              <div className="event-card-main">
                <div className="event-icon">
                  <IconAlertCircle />
                </div>
                <div>
                  <div className="detail-badges">
                    <Status tone={riskTone(a.severity)}>
                      {a.severity} severity
                    </Status>
                    <Status tone={statusTone(a.status)}>{a.status}</Status>
                  </div>
                  <button
                    className="event-title"
                    onClick={() => c.onOpen(`anomaly:${a.id}`)}
                  >
                    {a.title}
                    <IconArrowUpRight />
                  </button>
                  <p>
                    {a.account} <span>·</span> {a.region} <span>·</span> Started{" "}
                    {a.since}
                  </p>
                  <div className="event-explanation">
                    {a.explanation.replace(
                      " This is a rule-based summary of simulated data.",
                      "",
                    )}
                  </div>
                </div>
              </div>
              <div className="event-impact">
                <span className="summary-label">Extra spend</span>
                <strong className="num">+{money(a.impact)}</strong>
                <small>{a.percent}% above baseline</small>
                <div className="event-sparkline">
                  <Sparkline
                    values={c.overview.records
                      .filter((r) => r.service === a.service)
                      .map((r) => r.amount)}
                  />
                </div>
                <ViewButton
                  label="Investigate"
                  onClick={() => c.onOpen(`anomaly:${a.id}`)}
                />
              </div>
            </article>
          ))}
        </div>
        <TableFoot count={filtered.length} label="events">
          <span>Baseline: trailing 14 complete days</span>
        </TableFoot>
      </Section>
      <div className="quiet-callout">
        <IconCircleCheck />
        <div>
          <strong>Expected spikes have a place, too.</strong>
          <p>
            Mark planned increases as Expected to keep your investigation queue
            focused.
          </p>
        </div>
      </div>
    </>
  );
}

export function RecommendationsPage({ context: c }: { context: PageContext }) {
  const [accountFilter, setAccountFilter] = useState("All accounts");
  const [tab, setTab] = useState("Active");
  const [search, setSearch] = useState("");
  const [risk, setRisk] = useState("All risks");
  const [sort, setSort] = useState("Highest savings");
  const totals = savingsTotals(c.recommendations);
  const matches = (status: string) =>
    tab === "All" ||
    (tab === "Active"
      ? ["Open", "Approved", "Changes requested"].includes(status)
      : status === tab);
  const rows = c.recommendations
    .filter(
      (r) =>
        matches(r.status) &&
        (accountFilter === "All accounts" || r.account === accountFilter) &&
        (risk === "All risks" || risk === r.risk) &&
        `${r.title} ${r.resource} ${r.account}`
          .toLowerCase()
          .includes(search.toLowerCase()),
    )
    .sort((a, b) =>
      sort === "Highest savings"
        ? b.savings - a.savings
        : a.title.localeCompare(b.title),
    );
  const exportData = () => {
    downloadCsv("cloudlens-recommendations.csv", [
      ["CloudLens · Simulated data"],
      [
        "Recommendation",
        "Resource",
        "Account",
        "Status",
        "Risk",
        "Monthly run rate USD · estimated unless Verified",
      ],
      ...rows.map((r) => [
        r.title,
        r.resource,
        r.account,
        r.status,
        r.risk,
        (r.savings / 100).toFixed(2),
      ]),
    ]);
    c.notify("Recommendation list downloaded.");
  };
  return (
    <>
      <PageHeader
        title="Recommendations"
        subtitle="Review the evidence, assign a decision and follow implementation through measurement"
      >
        <ExportButton onClick={exportData} />
      </PageHeader>
      <Summary
        items={[
          {
            label: "Identified savings / month",
            value: money(totals.identified),
            hint: "Estimated · Active recommendations",
            icon: <IconBulb />,
          },
          {
            label: "Verified savings / month",
            value: money(totals.verified),
            hint: "Measured run rate · not cash saved this month",
            icon: <IconCircleCheck />,
          },
          {
            label: "Awaiting a decision",
            value: c.recommendations.filter(
              (r) => r.status === "Open" && r.evidenceReady !== false,
            ).length,
            hint: "Ready for client engineering review",
            icon: <IconAlertCircle />,
          },
        ]}
      />
      <EvidenceStrip title="An approval is a decision, not a deployment">
        Consultant evidence → client decision → recorded implementation → a
        defined measurement window. Estimated and measured savings stay
        separate.
      </EvidenceStrip>
      <Section>
        <div className="workspace-toolbar">
          <Tabs
            label="Recommendation status"
            value={tab}
            onChange={setTab}
            options={[
              "Active",
              "Approved",
              "Changes requested",
              "Implemented",
              "Dismissed",
              "Verified",
              "All",
            ].map((value) => ({ value, label: value }))}
          />
          <div className="toolbar-end">
            <Search
              value={search}
              onChange={setSearch}
              placeholder="Search resources…"
              label="Search recommendations"
            />
          </div>
        </div>
        <div className="secondary-toolbar">
          <Select
            label="Recommendation account"
            value={accountFilter}
            onChange={setAccountFilter}
            options={[
              "All accounts",
              ...[...new Set(c.recommendations.map((r) => r.account))],
            ]}
          />
          <Select
            label="Recommendation risk"
            value={risk}
            onChange={setRisk}
            options={["All risks", "Low", "Medium", "High"]}
          />
          <Select
            label="Sort recommendations"
            value={sort}
            onChange={setSort}
            options={["Highest savings", "Name A–Z"]}
          />
          <span className="muted-text">Savings shown per month · USD</span>
        </div>
        <div className="workspace-table-scroll">
          <table className="workspace-table recommendation-table">
            <thead>
              <tr>
                <th>Recommendation</th>
                <th>Account / owner</th>
                <th>Risk</th>
                <th>Status</th>
                <th className="align-right">Monthly run rate</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.id}>
                  <td>
                    <button
                      className="table-entity"
                      onClick={() => c.onOpen(`recommendation:${r.id}`)}
                    >
                      <ServiceIcon
                        name={
                          r.type.includes("Storage")
                            ? "Amazon S3"
                            : "Amazon EC2"
                        }
                      />
                      <span>
                        <strong>{r.title}</strong>
                        <small className="mono">{r.resource}</small>
                        <small className="table-subtext">
                          {r.evidenceReady === false
                            ? "Consultant evidence requested"
                            : r.status === "Implemented"
                              ? "Awaiting measurement"
                              : r.status === "Verified"
                                ? "Measurement available"
                                : "Review prerequisites before deciding"}
                        </small>
                      </span>
                    </button>
                  </td>
                  <td>
                    <span>{r.account}</span>
                    <small className="table-subtext">{r.owner}</small>
                  </td>
                  <td>
                    <Status tone={riskTone(r.risk)}>{r.risk}</Status>
                  </td>
                  <td>
                    <Status tone={statusTone(r.status)}>{r.status}</Status>
                  </td>
                  <td className="align-right num savings-amount">
                    {money(r.savings)}
                    <small>
                      {r.status === "Verified" ? "Measured" : "Estimated"}
                    </small>
                  </td>
                  <td>
                    <ViewButton
                      label="Review"
                      onClick={() => c.onOpen(`recommendation:${r.id}`)}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <TableFoot count={rows.length} label="recommendations">
          <span>Estimates include confidence and resource evidence</span>
        </TableFoot>
      </Section>
      <div className="quiet-callout">
        <IconCircleCheck />
        <div>
          <strong>Your team stays in control.</strong>
          <p>
            Review the evidence, approve a recommendation, then implement the
            change outside CloudLens.
          </p>
        </div>
      </div>
    </>
  );
}
