"use client";
import { useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { IconArrowRight, IconCheck, IconBookmark } from "@tabler/icons-react";
import { comparisonReport } from "@/server/analysis/research-workflows";
import { groupCosts, type GroupDimension } from "@/server/analysis/breakdown";
import { money, percent, shortDate } from "@/lib/format";
import { workspaceHref } from "@/lib/workspace";
import {
  PageHeader,
  Section,
  Select,
  Summary,
  Tabs,
  Search,
  ExportButton,
  downloadCsv,
  type PageContext,
} from "./shared";
import { Modal } from "./operations-pages";
import { useDemoState } from "./use-demo-state";
import {
  ServiceIcon,
  Delta,
  GroupedCostChart,
  EvidenceStrip,
} from "./research-ui";
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
    ]);
    c.audit("Cost report exported", `${group} · ${account} · ${service}`);
    c.notify("Scoped comparison report downloaded.");
  }
  return (
    <>
      <PageHeader
        title="Cost Explorer"
        subtitle="Compare like-for-like costs, identify contributors and inspect the evidence"
        period={c.overview.period}
        onPeriod={c.onPeriod}
      >
        <button className="button secondary" onClick={() => setSave(true)}>
          <IconBookmark />
          Save report
        </button>
        <ExportButton onClick={exportReport} />
      </PageHeader>
      <div className="research-filterbar">
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
        <span>Amortized USD · tax excluded</span>
      </div>
      <Summary
        items={[
          {
            label: "Selected actual spend",
            value: money(report.total),
            hint:
              c.overview.period === "month"
                ? "Oct 1–24 · complete days"
                : c.overview.rangeLabel,
          },
          {
            label: "Comparable prior period",
            value: money(report.prior),
            hint:
              c.overview.period === "month"
                ? "Sep 1–24"
                : `Previous ${c.overview.completeDays} days`,
          },
          {
            label: "Net cost change",
            value: <Delta value={report.delta} />,
            hint: percent(report.change, true),
          },
        ]}
      />
      <Section
        title={`Daily spend by ${group}`}
        subtitle="Series and table share the same scope. Change ranking below explains the comparison."
      >
        <div className="workspace-toolbar">
          <Tabs
            label="Cost grouping"
            value={group}
            onChange={(v) => {
              setGroup(v as GroupDimension);
              persistUrl({ group: v });
            }}
            options={["service", "account", "region"].map((v) => ({
              value: v,
              label: v[0].toUpperCase() + v.slice(1),
            }))}
          />
          <button
            className="text-button"
            onClick={() => setShowTable(!showTable)}
          >
            {showTable ? "Show chart" : "View data table"}
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
      </Section>
      {c.overview.client.id === "brightloop" &&
        (service === "all" || service === "Amazon VPC") && (
          <EvidenceStrip title="NAT processing increased by $873 over the comparable 24 days">
            <span>
              Billing identifies more GB processed, not the traffic path.{" "}
              <Link
                className="text-button accent"
                href={workspaceHref(
                  "network",
                  c.overview.client.id,
                  c.overview.period,
                  c.role,
                )}
              >
                Investigate network flows
                <IconArrowRight />
              </Link>
            </span>
          </EvidenceStrip>
        )}
      <Section
        title={`Cost contributors by ${group}`}
        subtitle="Increases and decreases both remain visible; contributions reconcile to the selected total."
        action={
          <Search
            value={search}
            onChange={setSearch}
            label="Search cost breakdown"
            placeholder={`Search ${group}…`}
          />
        }
      >
        <div className="secondary-toolbar">
          <Select
            label="Sort cost contributors"
            value={sort}
            onChange={setSort}
            options={["Largest increase", "Highest spend"]}
          />
          <span className="muted-text">
            Prior values use the same account, service and region filters
          </span>
        </div>
        <div className="workspace-table-scroll">
          <table className="workspace-table">
            <thead>
              <tr>
                <th>{group}</th>
                <th className="align-right">Actual</th>
                <th className="align-right">Prior</th>
                <th className="align-right">Change</th>
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
      <Section
        title="Saved analyses"
        subtitle="Reusable questions with their account, service, grouping and reporting range saved in this browser."
      >
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
