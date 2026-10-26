"use client";
import { useRef, useState, type FormEvent } from "react";
import Link from "next/link";
import { workspaceHref } from "@/lib/workspace";
import {
  clientReviewRows,
  comparisonReport,
} from "@/server/analysis/research-workflows";
import { Delta, EvidenceStrip } from "./research-ui";
import * as Dialog from "@radix-ui/react-dialog";
import {
  IconPlus,
  IconWallet,
  IconAlertCircle,
  IconArrowUpRight,
  IconBell,
  IconFileText,
  IconDownload,
  IconPrinter,
  IconHistory,
  IconX,
  IconCheck,
  IconCalendar,
  IconUsers,
} from "@tabler/icons-react";
import type { AuditEvent } from "@/lib/domain";
import { money, shortDate } from "@/lib/format";
import { savingsTotals, forecastMonth } from "@/server/analysis/costs";
import { useDemoState } from "./use-demo-state";
import {
  PageHeader,
  Section,
  Summary,
  Search,
  Select,
  Status,
  statusTone,
  TableFoot,
  ExportButton,
  ViewButton,
  ReportArt,
  downloadCsv,
  type PageContext,
} from "./shared";
export { Modal };

function Modal({
  open,
  onClose,
  title,
  description,
  children,
  className = "",
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  description: string;
  children: React.ReactNode;
  className?: string;
}) {
  const trigger = useRef<HTMLElement | null>(null);
  return (
    <Dialog.Root
      open={open}
      onOpenChange={(v) => {
        if (!v) onClose();
      }}
    >
      <Dialog.Portal>
        <Dialog.Overlay className="dialog-overlay" />
        <Dialog.Content
          className={`workspace-modal ${className}`}
          onOpenAutoFocus={() => {
            if (document.activeElement instanceof HTMLElement)
              trigger.current = document.activeElement;
          }}
          onCloseAutoFocus={(e) => {
            e.preventDefault();
            if (trigger.current?.isConnected) trigger.current.focus();
            else document.getElementById("main")?.focus();
          }}
        >
          <div className="workspace-modal-header">
            <div>
              <Dialog.Title>{title}</Dialog.Title>
              <Dialog.Description>{description}</Dialog.Description>
            </div>
            <Dialog.Close asChild>
              <button className="icon-button" aria-label="Close dialog">
                <IconX />
              </button>
            </Dialog.Close>
          </div>
          {children}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
type ScopedBudget = {
  id: string;
  name: string;
  account: string;
  amount: number;
  thresholds: number[];
  owner?: string;
};
export function BudgetsPage({ context: c }: { context: PageContext }) {
  const monthly =
    c.portfolio.find((o) => o.client.id === c.overview.client.id) || c.overview;
  const [budgets, setBudgets] = useDemoState<ScopedBudget[]>(
    `cloudlens-budgets-v2-${c.overview.client.id}`,
    [
      {
        id: "production",
        name: "Production infrastructure",
        account: "Production",
        amount: 3000000,
        owner: "Daniel Chen",
        thresholds: [80, 100],
      },
      {
        id: "development",
        name: "Development environment",
        account: "Development",
        amount: 680000,
        owner: "Platform team",
        thresholds: [50, 80, 100],
      },
    ],
  );
  const [scope, setScope] = useState("All scopes");
  const [editing, setEditing] = useState<ScopedBudget | null>(null);
  const [show, setShow] = useState(false);
  const [name, setName] = useState("");
  const [account, setAccount] = useState("Production");
  const [amount, setAmount] = useState("");
  const [thresholds, setThresholds] = useState([80, 100]);
  const records = [
    {
      id: "client",
      name: "Monthly cloud budget",
      account: "All accounts",
      amount: c.budget,
      thresholds: [80, 100],
    },
    ...budgets,
  ].map((b) => {
    const scoped =
      b.id === "client"
        ? monthly.monthRecords
        : monthly.monthRecords.filter((r) => r.account === b.account);
    const spent = scoped.reduce((s, r) => s + r.amount, 0);
    const forecast =
      b.id === "client"
        ? monthly.forecast
        : forecastMonth(scoped, "2026-10-25");
    return {
      ...b,
      spent,
      forecast,
      used: (spent / b.amount) * 100,
      atRisk: forecast !== null && forecast > b.amount,
    };
  });
  function edit(b?: ScopedBudget) {
    setEditing(b || null);
    setName(b?.name || "");
    setAccount(b?.account || "Production");
    setAmount(b ? String(b.amount / 100) : "");
    setThresholds(b?.thresholds || [80, 100]);
    setShow(true);
  }
  function save(e: FormEvent) {
    e.preventDefault();
    const item = {
      id: editing?.id || crypto.randomUUID(),
      name,
      account,
      amount: Math.round(Number(amount) * 100),
      thresholds,
      owner: c.role === "consultant" ? "Maya Brooks" : "Daniel Chen",
    };
    setBudgets((old) =>
      editing
        ? old.map((b) => (b.id === editing.id ? item : b))
        : [...old, item],
    );
    c.audit(
      editing ? "Scoped budget updated" : "Scoped budget created",
      name,
      `${account} · ${money(item.amount)}/month`,
    );
    c.notify(editing ? "Budget updated." : "Budget created.");
    setShow(false);
  }
  return (
    <>
      <PageHeader
        title="Budgets"
        subtitle="Review spending limits, accountable owners and forecast variance"
      >
        <button
          className="button primary"
          onClick={() => edit()}
          disabled={c.role === "executive"}
        >
          <IconPlus />
          Create budget
        </button>
      </PageHeader>
      <Summary
        items={[
          {
            label: "Client monthly budget",
            value: money(c.budget),
            hint: "October 2026 · All accounts",
            icon: <IconWallet />,
          },
          {
            label: "Forecast vs budget",
            value: `${Math.round(((monthly.forecast || 0) / c.budget) * 100)}%`,
            hint:
              monthly.forecast && monthly.forecast > c.budget
                ? "Forecast to exceed budget"
                : "Forecast within budget",
            icon: <IconArrowUpRight />,
          },
          {
            label: "Budgets at risk",
            value: records.filter((r) => r.atRisk).length,
            hint: `Across ${records.length} independently tracked scopes`,
            icon: <IconAlertCircle />,
          },
        ]}
      />
      <EvidenceStrip title="Independent budget scopes">
        Account budgets overlap the client-wide budget. Do not add these limits
        or their spending together. Thresholds are browser-local configuration;
        no external alert is sent.
      </EvidenceStrip>
      <div className="standalone-toolbar">
        <h2>
          Active budgets <span>{records.length}</span>
        </h2>
        <Select
          label="Budget scope"
          value={scope}
          onChange={setScope}
          options={["All scopes", "Client-wide", "Account"]}
        />
      </div>
      <div className="budget-card-grid">
        {records
          .filter(
            (b) =>
              scope === "All scopes" ||
              (scope === "Client-wide" ? b.id === "client" : b.id !== "client"),
          )
          .map((b) => (
            <section className="panel scoped-budget-card" key={b.id}>
              <div className="scoped-budget-heading">
                <span className="resource-tile">
                  <IconWallet />
                </span>
                <div>
                  <h2>{b.name}</h2>
                  <p>{b.account} · Monthly</p>
                </div>
                <Status tone={b.atRisk ? "warning" : "success"}>
                  {b.atRisk ? "At risk" : "On track"}
                </Status>
              </div>
              <div className="scoped-budget-value">
                <strong className="num">{money(b.spent)}</strong>
                <span>of {money(b.amount)}</span>
              </div>
              <div className="scoped-budget-track">
                <span
                  className={b.atRisk ? "risk" : ""}
                  style={{ width: `${Math.min(100, b.used)}%` }}
                />
                {b.thresholds.map((t) => (
                  <i key={t} style={{ left: `${t}%` }} />
                ))}
              </div>
              <div className="scoped-budget-scale">
                <span>{b.used.toFixed(1)}% used</span>
                <span>24 of 31 days</span>
              </div>
              <div className="scoped-budget-forecast">
                <span>
                  Month-end forecast <small>Estimate</small>
                </span>
                <strong className="num">{money(b.forecast || 0)}</strong>
              </div>
              <div className="research-budget-details">
                <div>
                  <span>Forecast variance</span>
                  <strong className="num">
                    {b.forecast === null ? (
                      "Unavailable"
                    ) : (
                      <Delta value={b.forecast - b.amount} />
                    )}
                  </strong>
                </div>
                <div>
                  <span>Accountable owner</span>
                  <strong>
                    {b.id === "client"
                      ? "Daniel Chen"
                      : b.owner || "Platform team"}
                  </strong>
                </div>
                <Link
                  className="text-button accent"
                  href={
                    workspaceHref(
                      "costs",
                      c.overview.client.id,
                      "month",
                      c.role,
                    ) +
                    (b.id === "client"
                      ? ""
                      : "&account=" + encodeURIComponent(b.account))
                  }
                >
                  Investigate this scope
                  <IconArrowUpRight />
                </Link>
              </div>
              <div className="scoped-budget-footer">
                <span>
                  <IconBell />
                  Alerts at {b.thresholds.join("%, ")}%
                </span>
                <button
                  className="text-button"
                  disabled={c.role === "executive"}
                  onClick={() =>
                    b.id === "client" ? c.onOpen("budget") : edit(b)
                  }
                >
                  Edit budget
                  <IconArrowUpRight />
                </button>
              </div>
            </section>
          ))}
      </div>
      <div className="quiet-callout">
        <IconBell />
        <div>
          <strong>Stay informed before you reach the limit.</strong>
          <p>
            Each scope is tracked separately. Alert thresholds are saved with
            your demo budget.
          </p>
        </div>
      </div>
      <Modal
        open={show}
        onClose={() => setShow(false)}
        title={editing ? "Edit budget" : "Create a budget"}
        description="Track a monthly spending limit for one AWS account."
      >
        <form className="workspace-modal-body" onSubmit={save}>
          <label className="form-label">
            Budget name
            <input
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Production infrastructure"
            />
          </label>
          <label className="form-label">
            AWS account
            <select
              value={account}
              onChange={(e) => setAccount(e.target.value)}
            >
              {[...new Set(monthly.records.map((r) => r.account))].map((a) => (
                <option key={a}>{a}</option>
              ))}
            </select>
          </label>
          <label className="form-label">
            Monthly amount (USD)
            <input
              required
              type="number"
              min="1"
              step=".01"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="10,000"
            />
          </label>
          <fieldset className="threshold-options">
            <legend>Alert thresholds</legend>
            {[50, 80, 100].map((t) => (
              <label key={t}>
                <input
                  type="checkbox"
                  checked={thresholds.includes(t)}
                  onChange={(e) =>
                    setThresholds((old) =>
                      e.target.checked
                        ? [...old, t].sort((a, b) => a - b)
                        : old.filter((v) => v !== t),
                    )
                  }
                />
                {t}%
              </label>
            ))}
          </fieldset>
          <div className="modal-actions">
            <button
              type="button"
              className="button secondary"
              onClick={() => setShow(false)}
            >
              Cancel
            </button>
            <button className="button primary" type="submit">
              {editing ? "Save changes" : "Create budget"}
            </button>
          </div>
        </form>
      </Modal>
    </>
  );
}

type ReportKind = "overview" | "costs" | "savings" | "activity";
type ReportRecord = {
  id: string;
  title: string;
  kind: ReportKind;
  period: string;
  created: string;
  author: string;
  rows: (string | number)[][];
  total: number;
};
const reportNames: Record<ReportKind, string> = {
  overview: "Executive cost summary",
  costs: "Service cost breakdown",
  savings: "Savings opportunities",
  activity: "Decision activity",
};
export function ReportsPage({ context: c }: { context: PageContext }) {
  const totals = savingsTotals(c.recommendations);
  function reportRows(kind: ReportKind): (string | number)[][] {
    if (kind === "overview")
      return clientReviewRows(
        c.overview,
        c.recommendations,
        c.budget,
        c.events,
      );
    const head = [
      ["CloudLens · Portfolio concept · Simulated AWS data"],
      ["Client", c.overview.client.name],
      ["Period", c.overview.rangeLabel],
    ];
    if (kind === "costs")
      return [
        ...head,
        ["Service", "Spend (USD)", "Share (%)"],
        ...c.overview.services.map((s) => [
          s.name,
          (s.amount / 100).toFixed(2),
          s.share.toFixed(2),
        ]),
      ];
    if (kind === "savings")
      return [
        ...head,
        [
          "Recommendation",
          "Resource",
          "Status",
          "Monthly run rate USD · estimated unless Verified",
        ],
        ...c.recommendations.map((r) => [
          r.title,
          r.resource,
          r.status,
          (r.savings / 100).toFixed(2),
        ]),
      ];
    if (kind === "activity")
      return [
        ...head,
        ["Time (UTC)", "Actor", "Action", "Object", "Reason"],
        ...c.events.map((e) => [
          e.time,
          e.actor,
          e.action,
          e.object,
          e.reason || "",
        ]),
      ];
    return [
      ...head,
      ["Metric", "USD"],
      ["Period spend", (c.overview.spend / 100).toFixed(2)],
      [
        "Month-end forecast (estimate)",
        ((c.overview.forecast || 0) / 100).toFixed(2),
      ],
      [
        "Identified savings / month (estimate)",
        (totals.identified / 100).toFixed(2),
      ],
      [
        "Verified savings / month (simulated)",
        (totals.verified / 100).toFixed(2),
      ],
      ["Service", "Spend (USD)"],
      ...c.overview.services.map((s) => [s.name, (s.amount / 100).toFixed(2)]),
    ];
  }
  function make(
    kind: ReportKind,
    created = "2026-10-25T08:00:00Z",
  ): ReportRecord {
    return {
      id: crypto.randomUUID(),
      title: reportNames[kind],
      kind,
      period: c.overview.rangeLabel,
      created,
      author:
        c.role === "consultant"
          ? "Maya Brooks"
          : c.role === "engineer"
            ? "Daniel Chen"
            : "Priya Sharma",
      rows: reportRows(kind),
      total: c.overview.spend,
    };
  }
  const [reports, setReports] = useDemoState<ReportRecord[]>(
    `cloudlens-reports-v2-${c.overview.client.id}`,
    (["overview", "costs", "savings", "activity"] as ReportKind[]).map(
      (kind, i) => ({
        ...make(kind, `2026-10-24T${10 + i}:30:00Z`),
        id: `seed-${kind}`,
      }),
    ),
  );
  const [preview, setPreview] = useState<ReportRecord | null>(null);
  const [search, setSearch] = useState("");
  const [type, setType] = useState("All reports");
  function openNew(kind: ReportKind) {
    setPreview(make(kind));
  }
  function saveReport(download = false) {
    if (!preview) return;
    setReports((old) =>
      old.some((r) => r.id === preview.id) ? old : [preview, ...old],
    );
    if (download) downloadCsv(`cloudlens-${preview.kind}.csv`, preview.rows);
    c.audit(
      download ? "Report exported" : "Report generated",
      preview.title,
      preview.period,
    );
    c.notify(
      download
        ? "Report downloaded as CSV."
        : "Report saved to your demo report library.",
    );
    if (!download) setPreview(null);
  }
  const rows = reports.filter(
    (r) =>
      (type === "All reports" || r.kind === type) &&
      r.title.toLowerCase().includes(search.toLowerCase()),
  );
  return (
    <>
      <PageHeader
        title="Reports"
        subtitle="Prepare a client review with financial position, explained changes and pending decisions"
        period={c.overview.period}
        onPeriod={c.onPeriod}
      >
        <button className="button primary" onClick={() => openNew("overview")}>
          <IconPlus />
          Generate report
        </button>
      </PageHeader>
      <Section
        title={`Client review · ${c.overview.rangeLabel}`}
        subtitle="A review that connects financial position, explained variance and the decisions that follow."
      >
        <div className="research-review-grid">
          <div>
            <span className="eyebrow">FINANCIAL POSITION</span>
            <h2 className="research-review-total num">
              {money(c.overview.spend)}
            </h2>
            <p>
              Actual period spend · {c.overview.rangeLabel}. Forecast{" "}
              {money(c.overview.forecast || 0)} against a {money(c.budget)}{" "}
              monthly budget.
            </p>
          </div>
          <div>
            <span className="eyebrow">WHAT CHANGED</span>
            {comparisonReport(c.overview, {}, "service")
              .rows.sort((a, b) => b.delta - a.delta)
              .slice(0, 2)
              .map((r) => (
                <p key={r.name}>
                  <strong>{r.name}</strong> · <Delta value={r.delta} /> vs
                  comparable prior period.
                </p>
              ))}
            <p>
              Billing identifies contributors; operational causes must be
              validated.
            </p>
          </div>
          <div>
            <span className="eyebrow">DECISIONS NEEDED</span>
            {c.recommendations
              .filter((r) => ["Open", "Changes requested"].includes(r.status))
              .slice(0, 3)
              .map((r) => (
                <button
                  className="research-review-action"
                  key={r.id}
                  onClick={() => c.onOpen(`recommendation:${r.id}`)}
                >
                  {r.title}
                  <small>
                    {r.owner} · {r.status} · {money(r.savings)}/mo estimated
                  </small>
                </button>
              ))}
          </div>
          <div>
            <span className="eyebrow">OUTCOMES & ASSUMPTIONS</span>
            <p>
              {money(totals.verified)}/month verified run rate. Each result
              needs a baseline, observation window and recorded implementation.
            </p>
            <p>
              This is not cash saved in the selected month. All records are
              simulated.
            </p>
            <button
              className="button primary"
              onClick={() => openNew("overview")}
            >
              Preview client review
              <IconArrowUpRight />
            </button>
          </div>
        </div>
      </Section>
      <div className="research-report-options">
        {(["costs", "savings", "activity"] as ReportKind[]).map((kind) => (
          <button
            className="button secondary"
            key={kind}
            onClick={() => openNew(kind)}
          >
            {reportNames[kind]}
            <IconArrowUpRight />
          </button>
        ))}
      </div>
      <Section
        title="Report library"
        subtitle="Generated reports for this client workspace."
        action={
          <Search
            value={search}
            onChange={setSearch}
            placeholder="Search reports…"
            label="Search reports"
          />
        }
      >
        <div className="secondary-toolbar">
          <Select
            label="Report type"
            value={type}
            onChange={setType}
            options={[
              { value: "All reports", label: "All reports" },
              ...Object.entries(reportNames).map(([value, label]) => ({
                value,
                label,
              })),
            ]}
          />
          <span className="muted-text">CSV download · Print to PDF</span>
        </div>
        <div className="workspace-table-scroll">
          <table className="workspace-table">
            <thead>
              <tr>
                <th>Report</th>
                <th>Period</th>
                <th>Created by</th>
                <th>Created</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.id}>
                  <td>
                    <button
                      className="table-entity"
                      onClick={() => setPreview(r)}
                    >
                      <span className="resource-tile">
                        <IconFileText />
                      </span>
                      <span>
                        <strong>{r.title}</strong>
                        <small>Client report · Simulated data</small>
                      </span>
                    </button>
                  </td>
                  <td>{r.period}</td>
                  <td>{r.author}</td>
                  <td>{shortDate(r.created)}</td>
                  <td>
                    <ViewButton
                      label="Open report"
                      onClick={() => setPreview(r)}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <TableFoot count={rows.length} label="reports" />
      </Section>
      <Modal
        open={!!preview}
        onClose={() => setPreview(null)}
        title={preview?.title || "Report preview"}
        description={`${c.overview.client.name} · ${preview?.period || ""}`}
        className="report-preview"
      >
        {preview && (
          <div className="workspace-modal-body">
            <div className="report-document-header">
              <IconCloudMark />
              <div>
                <strong>CloudLens</strong>
                <span>Client cost report</span>
              </div>
              <Status>Simulated data</Status>
            </div>
            <div className="report-document-meta">
              <span>{preview.period}</span>
              <span>Prepared for {c.overview.client.name}</span>
            </div>
            <h3>{preview.title}</h3>
            <div className="report-document-total">
              <span>Period spend</span>
              <strong className="num">{money(preview.total)}</strong>
            </div>
            <div className="workspace-table-scroll">
              <table className="workspace-table report-data">
                <tbody>
                  {preview.rows.slice(3).map((r, i) => (
                    <tr key={i}>
                      {r.map((cell, j) => (
                        <td key={j}>{cell}</td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="report-disclosure">
              Portfolio concept using simulated AWS data. Forecasts and
              identified savings are estimates; verification is simulated.
            </p>
            <div className="modal-actions report-actions">
              <button
                className="button secondary"
                onClick={() => window.print()}
              >
                <IconPrinter />
                Print / Save PDF
              </button>
              <button
                className="button secondary"
                onClick={() => saveReport(false)}
              >
                Save report
              </button>
              <button
                className="button primary"
                onClick={() => saveReport(true)}
              >
                <IconDownload />
                Download CSV
              </button>
            </div>
          </div>
        )}
      </Modal>
    </>
  );
}
function IconCloudMark() {
  return <IconFileText className="report-logo" />;
}

const seedAudit: AuditEvent[] = [
  {
    id: "seed-a1",
    actor: "Maya Brooks",
    action: "Report exported",
    object: "October service breakdown",
    time: "2026-10-24T13:30:00Z",
    reason: "Monthly client review",
  },
  {
    id: "seed-a2",
    actor: "Daniel Chen",
    action: "Recommendation approved",
    object: "Unattached EBS volumes",
    time: "2026-10-23T15:42:00Z",
    reason: "Retention reviewed with Infrastructure team.",
  },
  {
    id: "seed-a3",
    actor: "Daniel Chen",
    action: "Anomaly status updated",
    object: "Production EC2 spend",
    time: "2026-10-22T10:20:00Z",
    reason: "New → Investigating",
  },
  {
    id: "seed-a4",
    actor: "Maya Brooks",
    action: "Monthly budget updated",
    object: "Brightloop Retail",
    time: "2026-10-21T09:12:00Z",
    reason: "Client-wide monthly budget reviewed.",
  },
  {
    id: "seed-a5",
    actor: "Daniel Chen",
    action: "Changes requested",
    object: "Application log lifecycle",
    time: "2026-10-20T14:06:00Z",
    reason: "Confirm the compliance retention policy before archival.",
  },
  {
    id: "seed-a6",
    actor: "System",
    action: "Anomaly detected",
    object: "Development data transfer",
    time: "2026-10-18T08:00:00Z",
    reason: "Spend exceeded the trailing baseline.",
  },
];
export function AuditPage({ context: c }: { context: PageContext }) {
  const [search, setSearch] = useState("");
  const [actor, setActor] = useState("All actors");
  const [action, setAction] = useState("All actions");
  const [detail, setDetail] = useState<AuditEvent | null>(null);
  const events = [
    ...c.events.filter(
      (e) => !e.clientId || e.clientId === c.overview.client.id,
    ),
    ...(c.overview.client.id === "brightloop"
      ? [
          {
            id: "measured-shutdown",
            clientId: "brightloop",
            actor: "System",
            action: "Savings measurement recorded",
            object: "dev-scheduled-workers",
            time: "2026-10-24T08:00:00Z",
            reason:
              "Baseline Sep 27–Oct 10; observation Oct 11–24; $325/month simulated run rate.",
          },
          {
            id: "measured-storage",
            clientId: "brightloop",
            actor: "System",
            action: "Savings measurement recorded",
            object: "vol-unattached-archive",
            time: "2026-10-24T08:01:00Z",
            reason:
              "Baseline Sep 27–Oct 10; observation Oct 11–24; $240/month simulated run rate.",
          },
          {
            id: "implemented-shutdown",
            clientId: "brightloop",
            actor: "Daniel Chen",
            action: "Implementation recorded",
            object: "dev-scheduled-workers",
            time: "2026-10-10T14:00:00Z",
            reason:
              "Scheduled development shutdown. Follow-up observation begins Oct 11.",
          },
          {
            id: "implemented-storage",
            clientId: "brightloop",
            actor: "Daniel Chen",
            action: "Implementation recorded",
            object: "vol-unattached-archive",
            time: "2026-10-10T15:00:00Z",
            reason:
              "Unattached EBS volumes removed after retention review. No automatic AWS action.",
          },
        ]
      : seedAudit
    )
      .filter(
        (s) =>
          !c.events.some(
            (e) =>
              e.id === s.id || (e.object === s.object && e.time === s.time),
          ),
      )
      .map((e) => ({
        ...e,
        object:
          e.object === "Brightloop Retail" ? c.overview.client.name : e.object,
      })),
  ].sort((a, b) => b.time.localeCompare(a.time));
  const rows = events.filter(
    (e) =>
      (actor === "All actors" || actor === e.actor) &&
      (action === "All actions" || action === e.action) &&
      `${e.object} ${e.action} ${e.actor}`
        .toLowerCase()
        .includes(search.toLowerCase()),
  );
  function exportData() {
    downloadCsv("cloudlens-audit-log.csv", [
      ["CloudLens · Simulated activity"],
      ["Time (UTC)", "Actor", "Action", "Object", "Reason"],
      ...rows.map((e) => [e.time, e.actor, e.action, e.object, e.reason || ""]),
    ]);
    c.notify("Filtered audit log downloaded.");
  }
  return (
    <>
      <PageHeader
        title="Audit log"
        subtitle="Follow recorded decisions, implementation and measurement within this client"
      >
        <ExportButton onClick={exportData} />
      </PageHeader>
      <div className="audit-intro">
        <span className="resource-tile">
          <IconHistory />
        </span>
        <div>
          <strong>A clear record of who did what, and why.</strong>
          <p>
            Decisions, budget changes and exports are recorded with their actor
            and time.
          </p>
        </div>
        <Status>Demo activity</Status>
      </div>
      <Section>
        <div className="workspace-toolbar">
          <Search
            value={search}
            onChange={setSearch}
            placeholder="Search actions or resources…"
            label="Search audit log"
          />
          <div className="toolbar-end">
            <Select
              label="Audit actor"
              value={actor}
              onChange={setActor}
              options={[
                "All actors",
                ...[...new Set(events.map((e) => e.actor))],
              ]}
            />
            <Select
              label="Audit action"
              value={action}
              onChange={setAction}
              options={[
                "All actions",
                ...[...new Set(events.map((e) => e.action))],
              ]}
            />
          </div>
        </div>
        <div className="workspace-table-scroll">
          <table className="workspace-table audit-table">
            <thead>
              <tr>
                <th>Time · UTC</th>
                <th>Actor</th>
                <th>Action</th>
                <th>Resource / object</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {rows.map((e) => (
                <tr key={e.id}>
                  <td>
                    <span>{shortDate(e.time)}</span>
                    <small className="table-subtext mono">
                      {new Date(e.time).toISOString().slice(11, 16)}
                    </small>
                  </td>
                  <td>
                    <div className="table-person">
                      <span className="avatar">
                        {e.actor === "System"
                          ? "S"
                          : e.actor
                              .split(" ")
                              .map((s) => s[0])
                              .join("")}
                      </span>
                      <span>
                        {e.actor}
                        <small className="table-subtext">
                          {e.actor === "System"
                            ? "Automated"
                            : e.actor === "Daniel Chen"
                              ? "Engineer"
                              : "Consultant"}
                        </small>
                      </span>
                    </div>
                  </td>
                  <td>
                    <span className="audit-action-label">
                      <IconCheck />
                      {e.action}
                    </span>
                  </td>
                  <td>
                    <span className="table-object">{e.object}</span>
                  </td>
                  <td>
                    <ViewButton onClick={() => setDetail(e)} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <TableFoot count={rows.length} label="events">
          <span>
            Client-scoped demo history · browser-local, not an immutable
            production audit store
          </span>
        </TableFoot>
      </Section>
      <Modal
        open={!!detail}
        onClose={() => setDetail(null)}
        title="Activity details"
        description="The context behind this recorded event."
      >
        {detail && (
          <div className="workspace-modal-body">
            <Status tone="info">Recorded event</Status>
            <h3 className="modal-event-title">{detail.action}</h3>
            <dl className="detail-facts">
              <div>
                <dt>Actor</dt>
                <dd>{detail.actor}</dd>
              </div>
              <div>
                <dt>Object</dt>
                <dd>{detail.object}</dd>
              </div>
              <div>
                <dt>Time (UTC)</dt>
                <dd>{detail.time.replace("T", " ").replace("Z", "")}</dd>
              </div>
              <div>
                <dt>Event ID</dt>
                <dd className="mono">{detail.id}</dd>
              </div>
            </dl>
            <h4>Reason / context</h4>
            <p>
              {detail.reason ||
                "No additional note was recorded for this event."}
            </p>
          </div>
        )}
      </Modal>
    </>
  );
}
