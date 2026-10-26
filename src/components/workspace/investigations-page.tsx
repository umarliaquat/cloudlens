"use client";
import { useState } from "react";
import Link from "next/link";
import { IconArrowRight, IconAlertCircle } from "@tabler/icons-react";
import { money, percent } from "@/lib/format";
import { workspaceHref } from "@/lib/workspace";
import {
  PageHeader,
  Section,
  Summary,
  Tabs,
  Select,
  Search,
  ExportButton,
  downloadCsv,
  type PageContext,
} from "./shared";
import { ServiceIcon } from "./research-ui";

export function InvestigationsPage({ context: c }: { context: PageContext }) {
  const [status, setStatus] = useState("Active"),
    [severity, setSeverity] = useState("All severities"),
    [search, setSearch] = useState("");
  const active = c.anomalies.filter(
    (a) => !["Resolved", "Expected"].includes(a.status),
  );
  const rows = c.anomalies
    .filter(
      (a) =>
        (status === "All" || status === "Active"
          ? !["Resolved", "Expected"].includes(a.status) || status === "All"
          : a.status === status) &&
        (severity === "All severities" || severity === a.severity) &&
        `${a.title} ${a.account} ${a.service}`
          .toLowerCase()
          .includes(search.toLowerCase()),
    )
    .sort((a, b) => b.impact - a.impact);
  return (
    <>
      <PageHeader
        title="Anomalies"
        subtitle="Separate observed cost changes from causes that still need investigation"
      >
        <ExportButton
          onClick={() => {
            downloadCsv("cloudlens-investigations.csv", [
              ["SIMULATED cost investigations", c.overview.client.name],
              [
                "Change",
                "Account",
                "Service",
                "Impact USD",
                "Comparison",
                "Status",
              ],
              ...rows.map((a) => [
                a.title,
                a.account,
                a.service,
                (a.impact / 100).toFixed(2),
                c.overview.client.id === "brightloop"
                  ? "Oct 1–24 vs Sep 1–24"
                  : "Trailing complete-day baseline",
                a.status,
              ]),
            ]);
            c.notify("Investigation queue downloaded.");
          }}
        />
      </PageHeader>
      <Summary
        items={[
          {
            label: "Cost change under review",
            value: money(active.reduce((s, a) => s + a.impact, 0)),
            hint: "Observed impact · not a savings estimate",
          },
          {
            label: "Active investigations",
            value: active.length,
            hint: "New or investigating",
          },
          {
            label: "High-severity items",
            value: active.filter((a) => a.severity === "High").length,
            hint: "Review business impact before acting",
          },
        ]}
      />
      <Section
        title="Investigation queue"
        subtitle="Largest observed dollar changes first. Planned growth may be expected rather than waste."
      >
        <div className="workspace-toolbar">
          <Tabs
            label="Investigation status"
            value={status}
            onChange={setStatus}
            options={["Active", "Expected", "Resolved", "All"].map((v) => ({
              value: v,
              label: v,
            }))}
          />
          <div className="toolbar-end">
            <Search
              label="Search investigations"
              value={search}
              onChange={setSearch}
              placeholder="Service, workload or account…"
            />
            <Select
              label="Investigation severity"
              value={severity}
              onChange={setSeverity}
              options={["All severities", "High", "Medium", "Low"]}
            />
          </div>
        </div>
        <div className="workspace-table-scroll">
          <table className="workspace-table research-investigations">
            <thead>
              <tr>
                <th>Observed change</th>
                <th>Scope / comparison</th>
                <th className="align-right">Impact</th>
                <th>Status</th>
                <th>Next action</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((a) => (
                <tr key={a.id}>
                  <td>
                    <div className="table-entity">
                      <ServiceIcon name={a.service} />
                      <span>
                        <strong>{a.title}</strong>
                        <small className="table-subtext">
                          {a.severity} severity · cause requires validation
                        </small>
                      </span>
                    </div>
                  </td>
                  <td>
                    {a.account} · {a.region}
                    <small className="table-subtext">
                      {c.overview.client.id === "brightloop"
                        ? "Oct 1–24 vs Sep 1–24"
                        : "Trailing 14 complete days"}
                    </small>
                  </td>
                  <td className="align-right num">
                    +{money(a.impact)}
                    <small className="table-subtext">
                      {percent(a.percent)} change
                    </small>
                  </td>
                  <td>
                    <span className="badge">{a.status}</span>
                  </td>
                  <td>
                    <button
                      className="text-button accent"
                      onClick={() => c.onOpen(`anomaly:${a.id}`)}
                    >
                      Review evidence
                      <IconArrowRight />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Section>
      {c.overview.client.id === "brightloop" && (
        <Section
          title="Network processing investigation"
          subtitle="A specific route from a billed usage increase to modeled traffic evidence."
        >
          <div className="research-investigation-feature">
            <ServiceIcon name="Amazon VPC" />
            <div>
              <h3>Where did the extra NAT processing come from?</h3>
              <p>
                59,400 GB processed vs 40,000 GB in the comparison window. The
                modeled flow report shows source workloads and destinations; it
                does not assume the increase can all be eliminated.
              </p>
              <span className="muted-text">
                Oct 1–24 · Production · us-east-1 · $873 increase
              </span>
            </div>
            <Link
              className="button secondary"
              href={workspaceHref(
                "network",
                c.overview.client.id,
                "month",
                c.role,
              )}
            >
              Inspect network flows
              <IconArrowRight />
            </Link>
          </div>
        </Section>
      )}
      <div className="quiet-callout">
        <IconAlertCircle />
        <div>
          <strong>Observation → evidence → classification</strong>
          <p>
            Review billed usage and effective rates, correlate operational
            events, then mark expected or continue investigating. A status
            change is a recorded decision, not proof that a cost problem has
            been fixed.
          </p>
        </div>
      </div>
    </>
  );
}
