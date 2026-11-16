"use client";
import { useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  IconArrowRight,
  IconCheck,
  IconBookmark,
  IconArrowDown,
} from "@tabler/icons-react";
import {
  comparisonReport,
  natProcessingComparison,
} from "@/server/analysis/research-workflows";
import { groupCosts, type GroupDimension } from "@/server/analysis/breakdown";
import { money, percent, shortDate } from "@/lib/format";
import type { Period } from "@/lib/domain";
import { workspaceHref } from "@/lib/workspace";
import {
  PageHeader,
  Section,
  Select,
  Search,
  ExportButton,
  downloadCsv,
  type PageContext,
} from "./shared";
import { Modal } from "./operations-pages";
import { useDemoState } from "./use-demo-state";
import { ServiceIcon, Delta, GroupedCostChart } from "./research-ui";
type SavedCostReport = {
  id: string;
  name: string;
  account: string;
  service: string;
  region: string;
  group: GroupDimension;
  period: string;
};
export function ResearchedCostPage({ context: c }: { context: PageContext }) {
  const query = useSearchParams();
  const [account, setAccount] = useState(query.get("account") || "all"),
    [service, setService] = useState(query.get("service") || "all"),
    [region, setRegion] = useState(query.get("region") || "all");
  const [group, setGroup] = useState<GroupDimension>(
    (["service", "account", "region"].includes(query.get("group") || "")
      ? query.get("group")
      : "service") as GroupDimension,
  );
  const [search, setSearch] = useState(""),
    [sort, setSort] = useState("Largest increase"),
    [day, setDay] = useState<string | null>(query.get("day")),
    [showTable, setShowTable] = useState(false),
    [save, setSave] = useState(false),
    [name, setName] = useState("");
  const [saved, setSaved] = useDemoState<SavedCostReport[]>(
    `cloudlens-cost-reports-${c.overview.client.id}`,
    [],
  );
  const report = comparisonReport(
    c.overview,
    { account, service, region },
    group,
  );
  const nat = natProcessingComparison(report.current, report.previous);
  const showNat = nat.actual.gb > 0 || nat.prior.gb > 0;
  const rows = report.rows
    .filter((r) => r.name.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) =>
      sort === "Largest increase" ? b.delta - a.delta : b.amount - a.amount,
    );
  const options = (key: GroupDimension) => [
    { value: "all", label: `All ${key}s` },
    ...[...new Set(c.overview.records.map((r) => r[key]))]
      .sort()
      .map((v) => ({ value: v, label: v })),
  ];
  function persistUrl(filters: {
    account?: string;
    service?: string;
    region?: string;
    group?: string;
  }) {
    const u = new URL(location.href);
    for (const [key, value] of Object.entries({
      account,
      service,
      region,
      group,
      ...filters,
    })) {
      if (value === "all") u.searchParams.delete(key);
      else u.searchParams.set(key, value);
    }
    window.history.replaceState(null, "", u);
  }
  function narrow(value: string) {
    if (group === "service") {
      setService(value);
      persistUrl({ service: value });
    }
    if (group === "account") {
      setAccount(value);
      persistUrl({ account: value });
    }
    if (group === "region") {
      setRegion(value);
      persistUrl({ region: value });
    }
  }
  function exportReport() {
    downloadCsv("cloudlens-cost-analysis.csv", [
      ["SIMULATED AWS costs", c.overview.client.name],
      ["Period", c.overview.rangeLabel],
      ["Basis", "Amortized USD · tax excluded · complete days"],
      ["Scope", `${account} / ${service} / ${region}`],
      [group, "Actual USD", "Prior USD", "Change USD", "Change %"],
      ...rows.map((r) => [
        r.name,
        (r.amount / 100).toFixed(2),
        (r.previous / 100).toFixed(2),
        (r.delta / 100).toFixed(2),
        r.change?.toFixed(2) || "New baseline",
      ]),
      ...(showNat
        ? [
            [
              "Usage type",
              "Resource",
              "Current GB",
              "Prior GB",
              "Current USD",
              "Prior USD",
            ],
            [
              "NATGateway-Bytes",
              nat.actual.resourceId ?? nat.prior.resourceId ?? "",
              nat.actual.gb,
              nat.prior.gb,
              (nat.actual.cost / 100).toFixed(2),
              (nat.prior.cost / 100).toFixed(2),
            ],
          ]
        : []),
    ]);
    c.audit("Cost report exported", `${group} · ${account} · ${service}`);
    c.notify("Scoped comparison report downloaded.");
  }
  return (
    <>
      <PageHeader
        title="Cost breakdown"
        subtitle="Amortized costs in USD · Tax excluded"
      >
        <button className="button secondary" onClick={() => setSave(true)}>
          <IconBookmark />
          Save report
        </button>
        <ExportButton onClick={exportReport} />
      </PageHeader>
      <Section title={`Daily spend by ${group}`} className="cost-report-panel">
        <div className="workspace-toolbar cost-report-toolbar">
          <Select
            label="Date range"
            value={c.overview.period}
            options={[
              { value: "month", label: "October 2026" },
              { value: "7d", label: "Last 7 days" },
              { value: "30d", label: "Last 30 days" },
            ]}
            onChange={(value) => c.onPeriod(value as Period)}
          />
          <Select
            label="Filter account"
            value={account}
            options={options("account")}
            onChange={(v) => {
              setAccount(v);
              persistUrl({ account: v });
            }}
          />
          <Select
            label="Filter service"
            value={service}
            options={options("service")}
            onChange={(v) => {
              setService(v);
              persistUrl({ service: v });
            }}
          />
          <Select
            label="Filter region"
            value={region}
            options={options("region")}
            onChange={(v) => {
              setRegion(v);
              persistUrl({ region: v });
            }}
          />
          <Select
            label="Cost grouping"
            value={group}
            onChange={(value) => {
              setGroup(value as GroupDimension);
              persistUrl({ group: value });
            }}
            options={[
              { value: "service", label: "Group by service" },
              { value: "account", label: "Group by account" },
              { value: "region", label: "Group by region" },
            ]}
          />
          <button
            className="text-button"
            onClick={() => {
              setAccount("all");
              setService("all");
              setRegion("all");
              persistUrl({ account: "all", service: "all", region: "all" });
            }}
          >
            Reset filters
          </button>
        </div>
        <div className="cost-report-comparison">
          <dl>
            <div>
              <dt>
                Current spend{" "}
                <small>
                  {c.overview.period === "month"
                    ? "Oct 1–24"
                    : c.overview.rangeLabel}
                </small>
              </dt>
              <dd className="num">{money(report.total)}</dd>
            </div>
            <div>
              <dt>
                Prior spend{" "}
                <small>
                  {c.overview.period === "month"
                    ? "Sep 1–24"
                    : `Previous ${c.overview.completeDays} days`}
                </small>
              </dt>
              <dd className="num">{money(report.prior)}</dd>
            </div>
            <div>
              <dt>Change</dt>
              <dd className="num">
                <Delta value={report.delta} />{" "}
                <small>{percent(report.change, true)}</small>
              </dd>
            </div>
          </dl>
          <button
            className="text-button"
            onClick={() => setShowTable(!showTable)}
          >
            {showTable ? "Show chart" : "View daily data"}
          </button>
        </div>
        {showTable ? (
          <div className="workspace-table-scroll">
            <table className="workspace-table">
              <thead>
                <tr>
                  <th>Date</th>
                  {report.series.map((s) => (
                    <th key={s.name}>{s.name}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {report.series[0]?.points.map((p, i) => (
                  <tr key={p.date}>
                    <td>{shortDate(p.date)}</td>
                    {report.series.map((s) => (
                      <td key={s.name} className="num">
                        {money(s.points[i].amount)}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <GroupedCostChart report={report} onDay={setDay} />
        )}
        <div className="workspace-toolbar cost-contributors-heading">
          <h3>{`Cost contributors by ${group}`}</h3>
          <Search
            value={search}
            onChange={setSearch}
            label="Search cost breakdown"
            placeholder={`Search ${group}…`}
          />
        </div>
        <div className="workspace-table-scroll">
          <table className="workspace-table">
            <thead>
              <tr>
                <th>{group}</th>
                <th
                  className="align-right"
                  aria-sort={
                    sort === "Highest spend" ? "descending" : undefined
                  }
                >
                  <button
                    className="text-button cost-sort"
                    onClick={() => setSort("Highest spend")}
                  >
                    Actual
                    {sort === "Highest spend" && (
                      <IconArrowDown aria-hidden="true" />
                    )}
                  </button>
                </th>
                <th className="align-right">Prior</th>
                <th
                  className="align-right"
                  aria-sort={
                    sort === "Largest increase" ? "descending" : undefined
                  }
                >
                  <button
                    className="text-button cost-sort"
                    onClick={() => setSort("Largest increase")}
                  >
                    Change
                    {sort === "Largest increase" && (
                      <IconArrowDown aria-hidden="true" />
                    )}
                  </button>
                </th>
                <th className="align-right">Change %</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.name}>
                  <td>
                    <button
                      className="table-entity"
                      onClick={() => narrow(r.name)}
                    >
                      {group === "service" && <ServiceIcon name={r.name} />}
                      <strong>{r.name}</strong>
                    </button>
                  </td>
                  <td className="align-right num">{money(r.amount)}</td>
                  <td className="align-right num">{money(r.previous)}</td>
                  <td className="align-right num">
                    <Delta value={r.delta} />
                  </td>
                  <td className="align-right num">{percent(r.change, true)}</td>
                  <td>
                    <button
                      className="text-button accent"
                      onClick={() => narrow(r.name)}
                    >
                      Narrow scope
                      <IconArrowRight />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr>
                <th>Selected total</th>
                <td className="align-right num">{money(report.total)}</td>
                <td className="align-right num">{money(report.prior)}</td>
                <td className="align-right num">
                  <Delta value={report.delta} />
                </td>
                <td className="align-right">{percent(report.change, true)}</td>
                <td />
              </tr>
            </tfoot>
          </table>
        </div>
      </Section>
      {showNat && (
        <Section
          title="NAT gateway data processing"
          subtitle="Simulated billing detail for Production · us-east-1. The model uses the same $0.045 per GB for both periods."
          action={
            c.overview.period === "month" && (
              <Link
                className="text-button accent"
                href={workspaceHref(
                  "network",
                  c.overview.client.id,
                  "month",
                  c.role,
                )}
              >
                See where the traffic went <IconArrowRight />
              </Link>
            )
          }
        >
          <div className="workspace-table-scroll">
            <table className="workspace-table">
              <thead>
                <tr>
                  <th>Usage type</th>
                  <th>Resource</th>
                  <th>Current usage</th>
                  <th>Previous usage</th>
                  <th>Current cost</th>
                  <th>Previous cost</th>
                  <th>Cost change</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>NATGateway-Bytes</td>
                  <td className="mono">
                    {nat.actual.resourceId ?? nat.prior.resourceId}
                  </td>
                  <td className="num">{nat.actual.gb.toLocaleString()} GB</td>
                  <td className="num">{nat.prior.gb.toLocaleString()} GB</td>
                  <td className="num">{money(nat.actual.cost)}</td>
                  <td className="num">{money(nat.prior.cost)}</td>
                  <td className="num">
                    <Delta value={nat.delta} />
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </Section>
      )}
      <Section title="Saved analyses" subtitle="Saved in this browser.">
        <div className="section-body research-saved-list">
          {saved.length ? (
            saved.map((r) => (
              <button
                key={r.id}
                className="research-saved-report"
                onClick={() => {
                  setAccount(r.account);
                  setService(r.service);
                  setRegion(r.region);
                  setGroup(r.group);
                  c.onPeriod(r.period as "month" | "7d" | "30d");
                  persistUrl({
                    account: r.account,
                    service: r.service,
                    region: r.region,
                    group: r.group,
                  });
                }}
              >
                <IconBookmark />
                <span>
                  <strong>{r.name}</strong>
                  <small>
                    {r.account} · {r.service} · group by {r.group}
                  </small>
                </span>
                <IconArrowRight />
              </button>
            ))
          ) : (
            <p>
              Save the current scope to return to an investigation or recurring
              review.
            </p>
          )}
        </div>
      </Section>
      <Modal
        open={save}
        onClose={() => setSave(false)}
        title="Save cost analysis"
        description="Store a reusable report in this browser."
      >
        <form
          className="workspace-modal-body"
          onSubmit={(e) => {
            e.preventDefault();
            setSaved((old) => [
              {
                id: crypto.randomUUID(),
                name: name.trim(),
                account,
                service,
                region,
                group,
                period: c.overview.period,
              },
              ...old,
            ]);
            c.audit("Cost analysis saved", name);
            setSave(false);
            setName("");
            c.notify("Cost analysis saved.");
          }}
        >
          <label className="form-label">
            Report name
            <input
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Production cost drivers"
            />
          </label>
          <p>
            {account} · {service} · {region} · group by {group}
          </p>
          <button className="button primary" type="submit">
            <IconCheck />
            Save analysis
          </button>
        </form>
      </Modal>
      <Modal
        open={!!day}
        onClose={() => setDay(null)}
        title={`Daily costs · ${day || ""}`}
        description="Current filters · complete billing records · USD"
      >
        <div className="workspace-table-scroll">
          <table className="workspace-table">
            <thead>
              <tr>
                <th>Service</th>
                <th className="align-right">Spend</th>
              </tr>
            </thead>
            <tbody>
              {groupCosts(
                report.current.filter((r) => r.date === day),
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
                    report.current
                      .filter((r) => r.date === day)
                      .reduce((s, r) => s + r.amount, 0),
                  )}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </Modal>
    </>
  );
}
