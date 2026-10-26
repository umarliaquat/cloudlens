"use client";
import { useEffect, useRef, useState, type ReactNode } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  pageFromPath,
  workspaceHref,
  type WorkspacePage,
} from "@/lib/workspace";
import { WorkspacePages } from "./workspace/workspace-pages";
import { OverviewHome } from "./overview-home";
import {
  IconArrowDown,
  IconArrowUpRight,
  IconArrowRight,
  IconBell,
  IconBook2,
  IconBulb,
  IconCalendar,
  IconChartLine,
  IconCheck,
  IconChevronDown,
  IconChevronRight,
  IconCircleCheck,
  IconCloud,
  IconDots,
  IconDownload,
  IconExternalLink,
  IconFileText,
  IconHistory,
  IconLayoutDashboard,
  IconLoader2,
  IconMenu2,
  IconSearch,
  IconSettings,
  IconShieldCheck,
  IconTrendingUp,
  IconWallet,
  IconX,
  IconAlertCircle,
  IconRefresh,
  IconAdjustmentsHorizontal,
  IconArrowNarrowRight,
  IconCircle,
  IconInfoCircle,
  IconBriefcase,
  IconUsers,
  IconTopologyStar3,
} from "@tabler/icons-react";
import type {
  Anomaly,
  AuditEvent,
  Client,
  Overview,
  Period,
  Recommendation,
  Role,
} from "@/lib/domain";
import { csvCell, money, percent, shortDate } from "@/lib/format";
import { savingsTotals, savingsProgress } from "@/server/analysis/costs";
import { Sparkline, SpendChart } from "./spend-chart";

type Scenario = "normal" | "loading" | "empty" | "error" | "history";
const roles: Record<Role, { name: string; title: string; initials: string }> = {
  executive: { name: "Priya Sharma", title: "Executive", initials: "PS" },
  engineer: { name: "Daniel Chen", title: "Engineer", initials: "DC" },
  consultant: { name: "Maya Brooks", title: "Consultant", initials: "MB" },
};
const nav = [
  ["Overview", IconLayoutDashboard, "overview"],
  ["Cost Explorer", IconChartLine, "costs"],
  ["Network flows", IconTopologyStar3, "network"],
  ["Anomalies", IconAlertCircle, "anomalies"],
  ["Recommendations", IconBulb, "recommendations"],
  ["Budgets", IconWallet, "budget"],
  ["Reports", IconFileText, "reports"],
  ["Audit Log", IconHistory, "audit"],
] as const;
function Badge({
  children,
  tone = "neutral",
}: {
  children: ReactNode;
  tone?: string;
}) {
  return <span className={`badge ${tone}`}>{children}</span>;
}
function PanelHeading({
  icon,
  title,
  action,
  onClick,
}: {
  icon?: ReactNode;
  title: string;
  action?: string;
  onClick?: () => void;
}) {
  return (
    <div className="panel-heading">
      <h2>
        {icon}
        {title}
      </h2>
      {action && (
        <button className="text-button" onClick={onClick}>
          {action}
          <IconArrowRight />
        </button>
      )}
    </div>
  );
}
function ReportIllustration({
  kind = "report",
}: {
  kind?: "report" | "budget" | "audit";
}) {
  return (
    <svg className="prompt-art" viewBox="0 0 140 124" aria-hidden="true">
      <g
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
      >
        {kind === "report" ? (
          <>
            <path className="art-back" d="m52 19 59 10-13 82-59-10z" />
            <path className="art-paper" d="m28 15 62-6 8 84-62 6z" />
            <path d="m42 31 34-3m-33 12 24-2m-17 41-2-18 7-1 2 18m10-1-3-28 7-1 3 28m10-1-3-39 7-1 3 39" />
          </>
        ) : kind === "budget" ? (
          <>
            <path className="art-back" d="M26 37h78v58H26z" />
            <path className="art-paper" d="m26 37 14-19h51l13 19z" />
            <path d="M38 56h51M38 67h23M38 79h32" />
            <circle className="art-paper" cx="96" cy="84" r="23" />
            <path d="m84 84 8 8 16-18" />
          </>
        ) : (
          <>
            <path className="art-paper" d="M33 13h65v85H33z" />
            <path d="M46 33h35M46 45h22M46 57h30" />
            <circle className="art-back" cx="90" cy="84" r="23" />
            <path d="M90 69v16l10 6" />
          </>
        )}
      </g>
    </svg>
  );
}
const initialAudit: AuditEvent[] = [
  {
    id: "event-1",
    actor: "System",
    clientId: "brightloop",
    action: "Savings measurement recorded (simulated)",
    object: "dev-scheduled-workers",
    time: "2026-10-24T08:00:00Z",
    reason:
      "$325/month measured run rate; baseline Sep 27–Oct 10, observation Oct 11–24.",
  },
  {
    id: "event-2",
    actor: "Daniel Chen",
    action: "Recommendation implemented",
    clientId: "brightloop",
    object: "vol-unattached-archive",
    time: "2026-10-10T15:00:00Z",
    reason:
      "Retention review complete. External implementation recorded in the simulated scenario.",
  },
];

export function CloudLensApp({
  initialOverview,
  clients,
  initialVariant,
  initialRole = "engineer",
  portfolioOverviews = [],
}: {
  initialOverview: Overview;
  clients: Client[];
  initialVariant: "a" | "b";
  initialRole?: Role;
  portfolioOverviews?: Overview[];
}) {
  const activePage = pageFromPath(usePathname());
  const router = useRouter();
  function go(page: WorkspacePage) {
    setPanel(null);
    router.push(workspaceHref(page, clientId, period, role));
  }
  const [overview, setOverview] = useState(initialOverview);
  const [variant] = useState(initialVariant);
  const [clientId, setClientId] = useState(initialOverview.client.id);
  const [period, setPeriod] = useState<Period>(initialOverview.period);
  const [role, setRole] = useState<Role>(initialRole);
  const [compare, setCompare] = useState(true);
  const [scenario, setScenario] = useState<Scenario>("normal");
  const [loading, setLoading] = useState(false);
  const [fetchError, setFetchError] = useState("");
  const [panel, setPanel] = useState<string | null>(null);
  const [mobileNav, setMobileNav] = useState(false);
  const [chartTable, setChartTable] = useState(false);
  const [query, setQuery] = useState("");
  const [toast, setToast] = useState("");
  const [notificationsRead, setNotificationsRead] = useState(false);
  const [budgetOverrides, setBudgetOverrides] = useState<
    Record<string, number>
  >({});
  const [budgetInput, setBudgetInput] = useState("");
  const [formError, setFormError] = useState("");
  const [decisions, setDecisions] = useState<
    Record<string, { status: Recommendation["status"]; version: number }>
  >({});
  const [anomalyStatuses, setAnomalyStatuses] = useState<
    Record<string, string>
  >({});
  const [events, setEvents] = useState<AuditEvent[]>(initialAudit);
  const [decisionAction, setDecisionAction] = useState<
    "approve" | "dismiss" | "changes" | null
  >(null);
  const [reason, setReason] = useState("");
  const [clientReady, setClientReady] = useState(false);
  const firstLoad = useRef(true);
  const lastPanelTrigger = useRef<HTMLElement | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const persona = roles[role];
  const budget = budgetOverrides[clientId] || overview.budget;
  const visibleForecast = scenario === "history" ? null : overview.forecast;
  const recommendations = overview.recommendations.map((r) => ({
    ...r,
    ...(decisions[r.id] || {}),
  }));
  const savings = savingsTotals(recommendations);
  const savingsStatus = savingsProgress(recommendations);
  const openRecommendations = recommendations.filter((r) =>
    ["Open", "Changes requested", "Approved"].includes(r.status),
  );
  const anomalies = overview.anomalies.map((a) => ({
    ...a,
    status: anomalyStatuses[clientId + a.id] || a.status,
  }));
  const openAnomalies = anomalies.filter(
    (a) => !["Expected", "Resolved"].includes(a.status),
  );
  const forecastRatio =
    scenario !== "history" && visibleForecast
      ? (visibleForecast / budget) * 100
      : null;
  const budgetUsed = (overview.mtd / budget) * 100;
  const isEmpty = scenario === "empty";
  const isLoading = loading || scenario === "loading";
  const hasError = scenario === "error" || !!fetchError;
  const currentRecommendation = panel?.startsWith("recommendation:")
    ? recommendations.find((r) => r.id === panel.split(":")[1])
    : undefined;
  const currentAnomaly = panel?.startsWith("anomaly:")
    ? anomalies.find((a) => a.id === panel.split(":")[1])
    : undefined;
  useEffect(() => {
    setOverview(initialOverview);
    setClientId(initialOverview.client.id);
    setPeriod(initialOverview.period);
    setRole(initialRole);
  }, [initialOverview, initialRole]);
  useEffect(() => {
    try {
      const saved = JSON.parse(
        localStorage.getItem("cloudlens-demo-v1") || "{}",
      );
      setBudgetOverrides(saved.budgets || {});
      setDecisions(saved.decisions || {});
      setAnomalyStatuses(saved.anomalies || {});
      setEvents(saved.events || initialAudit);
    } catch {
      /* Ignore an invalid old demo snapshot. */
    }
    setClientReady(true);
  }, []);
  useEffect(() => {
    if (clientReady)
      try {
        localStorage.setItem(
          "cloudlens-demo-v1",
          JSON.stringify({
            budgets: budgetOverrides,
            decisions,
            anomalies: anomalyStatuses,
            events,
          }),
        );
      } catch {
        setToast(
          "Your browser could not save demo changes. They will last for this session.",
        );
      }
  }, [budgetOverrides, decisions, anomalyStatuses, events, clientReady]);
  useEffect(() => {
    if (firstLoad.current) {
      firstLoad.current = false;
      return;
    }
    const controller = new AbortController();
    setLoading(true);
    setFetchError("");
    fetch(`/api/clients/${clientId}/overview?period=${period}`, {
      signal: controller.signal,
    })
      .then(async (r) => {
        if (!r.ok) throw new Error("We couldn’t refresh your cost data.");
        return r.json();
      })
      .then((data) => setOverview(data))
      .catch((e) => {
        if (e.name !== "AbortError") setFetchError(e.message);
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });
    return () => controller.abort();
  }, [clientId, period, refreshKey]);
  useEffect(() => {
    const u = new URL(window.location.href);
    u.searchParams.set("variant", variant);
    u.searchParams.set("client", clientId);
    u.searchParams.set("period", period);
    u.searchParams.set("role", role);
    window.history.replaceState(null, "", u);
  }, [variant, clientId, period, role]);
  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(""), 5000);
    return () => clearTimeout(timer);
  }, [toast]);
  useEffect(() => {
    const listener = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setPanel("search");
      }
    };
    window.addEventListener("keydown", listener);
    return () => window.removeEventListener("keydown", listener);
  }, []);
  function open(next: string) {
    if (document.activeElement instanceof HTMLElement)
      lastPanelTrigger.current = document.activeElement;
    setPanel(next);
    setMobileNav(false);
    setFormError("");
    setDecisionAction(null);
    setReason("");
    if (next === "budget") setBudgetInput(String(budget / 100));
  }
  function audit(action: string, object: string, detail?: string) {
    setEvents((e) => [
      {
        id: crypto.randomUUID(),
        clientId,
        actor: persona.name,
        action,
        object,
        time: new Date().toISOString(),
        reason: detail,
      },
      ...e,
    ]);
  }
  function exportCsv() {
    const rows = [
      ["CloudLens · simulated data", overview.client.name],
      ["Period", overview.rangeLabel],
      ["Service", "Spend (USD)", "Previous equal-length period (USD)"],
      ...overview.services.map((r) => [
        r.name,
        (r.amount / 100).toFixed(2),
        (r.previous / 100).toFixed(2),
      ]),
    ];
    const blob = new Blob(
      ["\uFEFF" + rows.map((r) => r.map(csvCell).join(",")).join("\r\n")],
      { type: "text/csv;charset=utf-8;" },
    );
    const a = document.createElement("a");
    const url = URL.createObjectURL(blob);
    a.href = url;
    a.download = `cloudlens-${clientId}-${period}.csv`;
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    audit("Report exported", overview.rangeLabel);
    setToast("Your cost report has been downloaded.");
  }
  function saveBudget(e: React.FormEvent) {
    e.preventDefault();
    if (role === "executive") return;
    const dollars = Number(budgetInput);
    if (!Number.isFinite(dollars) || dollars <= 0 || dollars > 100000000) {
      setFormError("Enter a budget between $1 and $100,000,000.");
      return;
    }
    setBudgetOverrides((v) => ({
      ...v,
      [clientId]: Math.round(dollars * 100),
    }));
    audit(
      "Monthly budget updated",
      overview.client.name,
      `${money(budget)} → ${money(Math.round(dollars * 100))}`,
    );
    setToast("Monthly demo budget updated.");
    setPanel(null);
  }
  function decide() {
    if (!currentRecommendation || role !== "engineer" || !decisionAction)
      return;
    if (
      decisionAction === "approve" &&
      currentRecommendation.evidenceReady === false
    ) {
      setFormError(
        "Supporting evidence is still requested. Review it before approving.",
      );
      return;
    }
    if (decisionAction !== "approve" && !reason.trim()) {
      setFormError("Add a reason so the decision is traceable.");
      return;
    }
    const status =
      decisionAction === "approve"
        ? "Approved"
        : decisionAction === "dismiss"
          ? "Dismissed"
          : "Changes requested";
    setDecisions((d) => ({
      ...d,
      [currentRecommendation.id]: {
        status,
        version: currentRecommendation.version + 1,
      },
    }));
    audit(
      `Recommendation ${status.toLowerCase()}`,
      currentRecommendation.resource,
      reason,
    );
    setDecisionAction(null);
    setToast(
      `Recommendation ${status.toLowerCase()}. Decision recorded in the demo audit log.`,
    );
  }
  const Sidebar = (
    <>
      <div className="brand">
        <span className="brand-symbol">
          <IconCloud stroke={1.7} />
        </span>
        <span>
          CloudLens<span className="brand-dot">.</span>
        </span>
        <button
          className="icon-button close-mobile"
          aria-label="Close navigation"
          onClick={() => setMobileNav(false)}
        >
          <IconX />
        </button>
      </div>
      <label className="client-select">
        <span className="client-avatar">{overview.client.initials}</span>
        <span>
          {role === "consultant" ? (
            <select
              aria-label="Selected client"
              value={clientId}
              onChange={(e) => {
                setClientId(e.target.value);
                setPanel(null);
              }}
            >
              {clients
                .filter((c) => role === "consultant" || c.id === clientId)
                .map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
            </select>
          ) : (
            <strong className="client-name">{overview.client.name}</strong>
          )}
          <small>
            {role === "consultant" ? "Assigned demo client" : "Demo client"}
          </small>
        </span>
        {role === "consultant" && <IconChevronDown />}
      </label>
      <button className="sidebar-search" onClick={() => open("search")}>
        <IconSearch />
        <span>Search anything...</span>
        <kbd>⌘ K</kbd>
      </button>
      {role === "consultant" && (
        <>
          <div className="nav-section-label">CONSULTANCY</div>
          <nav aria-label="Consultancy navigation">
            {[
              ["Client portfolio", IconBriefcase, "portfolio"],
              ["Users & access", IconUsers, "users"],
            ].map(([label, Icon, target]) => {
              const NavIcon = Icon as typeof IconBriefcase;
              const page = target as WorkspacePage;
              return (
                <Link
                  key={page}
                  href={workspaceHref(page, clientId, period, role)}
                  className={`nav-item ${activePage === page ? "active" : ""}`}
                  aria-current={activePage === page ? "page" : undefined}
                  onClick={() => {
                    setMobileNav(false);
                    setPanel(null);
                  }}
                >
                  <NavIcon />
                  <span>{String(label)}</span>
                </Link>
              );
            })}
          </nav>
        </>
      )}
      <div className="nav-section-label">WORKSPACE</div>
      <nav aria-label="Main navigation">
        {nav.map(([label, Icon, target]) => (
          <Link
            key={target}
            href={workspaceHref(target, clientId, period, role)}
            aria-current={target === activePage ? "page" : undefined}
            className={`nav-item ${target === activePage ? "active" : ""}`}
            onClick={() => {
              setPanel(null);
              setMobileNav(false);
            }}
          >
            <Icon />
            <span>{label}</span>
            {target === "anomalies" && openAnomalies.length > 0 && (
              <span className="nav-count">{openAnomalies.length}</span>
            )}
            {target === "recommendations" && (
              <span className="nav-count muted">
                {openRecommendations.length}
              </span>
            )}
          </Link>
        ))}
      </nav>
      <div className="sidebar-bottom">
        <Link
          className={`nav-item ${activePage === "settings" ? "active" : ""}`}
          href={workspaceHref("settings", clientId, period, role)}
          onClick={() => setMobileNav(false)}
        >
          <IconSettings />
          <span>Settings</span>
        </Link>
        <button className="persona" onClick={() => open("persona")}>
          <span className="avatar">{persona.initials}</span>
          <span>
            <strong>{persona.name}</strong>
            <small>{persona.title}</small>
          </span>
          <IconChevronDown />
        </button>
      </div>
    </>
  );
  function MetricGroups({ compact = false }: { compact?: boolean }) {
    const groups = [
      {
        title: "Cloud spend",
        icon: IconWallet,
        metrics: [
          ["Month to date", overview.mtd],
          [
            "Month-end forecast",
            scenario === "history" ? null : visibleForecast,
          ],
        ],
        tone: "orange" as const,
      },
      {
        title: "Savings opportunity",
        icon: IconBulb,
        metrics: [
          ["Identified / month", savings.identified],
          ["Verified / month", savings.verified],
        ],
        tone: "green" as const,
      },
    ];
    return (
      <section
        className={`metric-groups ${compact ? "compact" : ""}`}
        aria-label="Account summary"
      >
        {groups.map((g, i) => (
          <div className="metric-group" key={g.title}>
            <div className="metric-group-heading">
              <g.icon />
              <span>{g.title}</span>
            </div>
            <div className="metric-cells">
              {g.metrics.map(([label, value], j) => (
                <button
                  key={String(label)}
                  className={`metric-cell ${i === 0 ? "has-trend" : "has-status"}`}
                  onClick={() =>
                    open(
                      i === 0
                        ? j
                          ? "budget"
                          : "costs"
                        : i === 1
                          ? j
                            ? "audit"
                            : "recommendations"
                          : j
                            ? "recommendations"
                            : "anomalies",
                    )
                  }
                >
                  <span className="metric-label">
                    {label}
                    {i === 0 && j === 1 && (
                      <span className="estimate-dot" title="Estimate" />
                    )}
                  </span>
                  <strong className="num">
                    {value === null
                      ? "—"
                      : i < 2
                        ? money(Number(value))
                        : value}
                  </strong>
                  <small>
                    {i === 0 ? (
                      j ? (
                        scenario === "history" ? (
                          "Needs 7 complete days"
                        ) : (
                          <span
                            className={
                              forecastRatio && forecastRatio > 100
                                ? "warning-text"
                                : ""
                            }
                          >
                            {percent((forecastRatio || 100) - 100, true)} vs
                            budget
                          </span>
                        )
                      ) : (
                        <>
                          <span className="warning-text">
                            {percent(overview.mtdChange, true)}
                          </span>{" "}
                          vs prior 24 days
                        </>
                      )
                    ) : i === 1 ? (
                      j ? (
                        "Simulated verification"
                      ) : (
                        "Estimated savings"
                      )
                    ) : j ? (
                      "Review recommendations"
                    ) : (
                      <span className="danger-text">
                        {
                          openAnomalies.filter((a) => a.severity === "High")
                            .length
                        }{" "}
                        high severity
                      </span>
                    )}
                  </small>
                  {i === 0 && j === 0 && (
                    <Sparkline
                      values={overview.trend
                        .filter((p) => p.actual !== null)
                        .map((p) => p.actual || 0)}
                    />
                  )}
                  {i === 0 && j === 1 && visibleForecast !== null && (
                    <>
                      <span className="sr-only">
                        Projected cumulative spend from {money(overview.mtd)} to{" "}
                        {money(visibleForecast)} over the remaining seven days,
                        using the trailing seven-day daily average.
                      </span>
                      <Sparkline
                        values={overview.forecastProjection ?? []}
                        dashed
                      />
                    </>
                  )}
                  {i === 1 && j === 0 && (
                    <span className="kpi-status-footer">
                      <IconBulb />
                      <span>
                        {savingsStatus.activeCount} active recommendations
                      </span>
                    </span>
                  )}
                  {i === 1 && j === 1 && (
                    <span
                      className="kpi-progress-footer"
                      title={`${money(savings.verified)} of ${money(savingsStatus.tracked)} in tracked monthly savings is verified. Verification is simulated.`}
                    >
                      <span className="kpi-progress-caption">
                        <IconCircleCheck />
                        {Math.round(savingsStatus.verifiedPercent)}% of tracked
                        total
                      </span>
                      <span
                        className="kpi-progress-track"
                        role="progressbar"
                        aria-label="Share of tracked monthly savings verified, simulated"
                        aria-valuemin={0}
                        aria-valuemax={100}
                        aria-valuenow={Math.round(
                          savingsStatus.verifiedPercent,
                        )}
                      >
                        <span
                          style={{ width: `${savingsStatus.verifiedPercent}%` }}
                        />
                      </span>
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>
        ))}
      </section>
    );
  }
  const BudgetPanel = (
    <section className="panel budget-panel">
      <PanelHeading
        title="Budget health"
        icon={<IconWallet />}
        action="Manage"
        onClick={() => open("budget")}
      />
      <div className="budget-amount">
        <strong className="num">{money(overview.mtd)}</strong>
        <span>of {money(budget)} budget</span>
      </div>
      <div className="budget-track">
        <span style={{ width: `${Math.min(100, budgetUsed)}%` }} />
      </div>
      <div className="budget-scale">
        <span>{percent(budgetUsed)} used</span>
        <span>24 of 31 days</span>
      </div>
      <div
        className={`budget-notice ${forecastRatio && forecastRatio > 100 ? "at-risk" : "on-track"}`}
      >
        <IconTrendingUp />
        <div>
          <strong>
            {visibleForecast === null
              ? "Forecast not available"
              : forecastRatio && forecastRatio > 100
                ? "Forecast is over budget"
                : "Forecast is within budget"}
          </strong>
          <p>
            {visibleForecast
              ? `${money(Math.abs(visibleForecast - budget))} ${visibleForecast > budget ? "above" : "below"} your monthly budget.`
              : "More history is needed for a forecast."}
          </p>
        </div>
      </div>
    </section>
  );
  const RecommendationsPanel = (
    <section className="panel recommendations-panel">
      <PanelHeading
        title="Savings recommendations"
        icon={<IconBulb />}
        action="View all"
        onClick={() => go("recommendations")}
      />
      <div className="panel-subtitle">
        {money(savings.identified)}/month in estimated savings to review.
      </div>
      <div className="recommendation-list">
        {openRecommendations.slice(0, 3).map((r) => (
          <button
            className="recommendation-row"
            key={r.id}
            onClick={() => open(`recommendation:${r.id}`)}
          >
            <span className="resource-icon">
              <IconCloud />
            </span>
            <span className="recommendation-copy">
              <strong>{r.title}</strong>
              <small>
                {r.account} <span>·</span>{" "}
                <span
                  className={
                    r.risk === "Medium" ? "warning-text" : "muted-text"
                  }
                >
                  {r.risk} risk
                </span>
              </small>
            </span>
            <span className="saving-value num">
              {money(r.savings)}
              <small>/mo</small>
            </span>
            <IconChevronRight />
          </button>
        ))}
      </div>
      <div className="panel-footnote">
        <IconShieldCheck />
        Nothing changes in AWS without your team.
      </div>
    </section>
  );
  const AnomaliesPanel = (
    <section className="panel anomalies-panel">
      <PanelHeading
        title="Anomalies to investigate"
        icon={<IconAlertCircle />}
        action="View all"
        onClick={() => go("anomalies")}
      />
      {openAnomalies.length ? (
        openAnomalies.slice(0, 2).map((a) => (
          <button
            className="anomaly-row"
            key={a.id}
            onClick={() => open(`anomaly:${a.id}`)}
          >
            <span className={`severity-dot ${a.severity.toLowerCase()}`} />
            <span>
              <strong>{a.title}</strong>
              <small>
                {a.account} · Since {a.since}
              </small>
            </span>
            <span className="anomaly-impact num">
              +{money(a.impact)}
              <small>extra spend</small>
            </span>
            <IconChevronRight />
          </button>
        ))
      ) : (
        <div className="inline-empty">
          <IconCircleCheck />
          <strong>No unusual spend detected.</strong>
          <span>We’ll highlight changes that need your attention.</span>
        </div>
      )}
    </section>
  );
  const Breakdown = (
    <section className="panel breakdown-panel">
      <PanelHeading
        title="Spend by service"
        action="Explore costs"
        onClick={() => go("costs")}
      />
      <div className="service-table-wrap">
        <table className="service-table">
          <thead>
            <tr>
              <th>Service</th>
              <th>Share of spend</th>
              <th className="align-right">Spend</th>
              <th className="align-right">Change</th>
            </tr>
          </thead>
          <tbody>
            {overview.services.slice(0, 5).map((s, i) => (
              <tr key={s.name}>
                <td>
                  <button
                    className="service-name"
                    onClick={() => open(`service:${s.name}`)}
                  >
                    <span className={`service-symbol service-${i}`}>
                      <IconCloud />
                    </span>
                    {s.name}
                  </button>
                </td>
                <td>
                  <div className="share-cell">
                    <div className="share-track">
                      <span style={{ width: `${s.share}%` }} />
                    </div>
                    <span className="num">{s.share.toFixed(0)}%</span>
                  </div>
                </td>
                <td className="align-right num">{money(s.amount)}</td>
                <td
                  className={`align-right num ${s.change && s.change > 15 ? "warning-text" : ""}`}
                >
                  {percent(s.change, true)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="panel-footnote">
        Top services by spend · {overview.rangeLabel}
      </div>
    </section>
  );
  const ChartPanel = (
    <section className="panel chart-panel">
      <div className="chart-panel-head">
        <div>
          <h2>Spend over time</h2>
          <p>Daily costs · USD · UTC</p>
        </div>
        <div className="chart-total">
          <strong className="num">{money(overview.spend)}</strong>
          <span>
            this period{" "}
            <Badge tone="warning">{percent(overview.change, true)}</Badge>
          </span>
        </div>
      </div>
      <div className="chart-controls">
        <div className="chart-legend">
          <span>
            <i className="legend-dot actual" />
            Actual spend
          </span>
          {compare && (
            <span>
              <i className="legend-dash" />
              Previous period
            </span>
          )}
          {period === "month" && scenario !== "history" && (
            <span>
              <i className="legend-dash forecast" />
              Forecast
            </span>
          )}
        </div>
        <label className="checkbox-label">
          <input
            type="checkbox"
            checked={compare}
            onChange={(e) => setCompare(e.target.checked)}
          />
          Compare previous period
        </label>
      </div>
      {chartTable ? (
        <div className="chart-data-table">
          <table>
            <caption>Daily cost data · USD · UTC</caption>
            <thead>
              <tr>
                <th>Date</th>
                <th>Actual</th>
                {compare && <th>Previous</th>}
                <th>Estimate</th>
              </tr>
            </thead>
            <tbody>
              {overview.trend.map((p) => (
                <tr key={p.date}>
                  <td>{shortDate(p.date)}</td>
                  <td>{p.actual === null ? "—" : money(p.actual)}</td>
                  {compare && (
                    <td>{p.previous === null ? "—" : money(p.previous)}</td>
                  )}
                  <td>{p.forecast === null ? "—" : money(p.forecast)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <SpendChart
          points={
            scenario === "history"
              ? overview.trend
                  .filter((p) => p.actual !== null)
                  .map((p) => ({ ...p, forecast: null }))
              : overview.trend
          }
          compare={compare}
          onPoint={(date) => open(`day:${date}`)}
        />
      )}
      <div className="chart-footer">
        <span>
          <IconInfoCircle />
          Today’s partial data is excluded. Forecast is an estimate.
        </span>
        <button
          className="text-button"
          onClick={() => setChartTable(!chartTable)}
        >
          {chartTable ? "Show chart" : "View data table"}
        </button>
      </div>
    </section>
  );
  const Prompts = (
    <section className="prompt-grid" aria-label="Useful next steps">
      {[
        [
          "report",
          "Monthly cost report",
          "Share this period’s service costs with your team.",
          "Create a report",
          "reports",
        ],
        [
          "budget",
          "Monthly budget",
          "Set your spending limit and track the month-end forecast.",
          "Manage budget",
          "budget",
        ],
      ].map(([kind, title, description, cta, target]) => (
        <div className="prompt-card" key={kind}>
          <div>
            <h3>{title}</h3>
            <p>{description}</p>
            <button
              className="text-button accent"
              onClick={() => go(target as WorkspacePage)}
            >
              {cta}
              <IconArrowRight />
            </button>
          </div>
          <ReportIllustration kind={kind as "report" | "budget"} />
        </div>
      ))}
    </section>
  );
  const ErrorState = (
    <div className="workspace-state">
      <span className="state-icon danger">
        <IconAlertCircle />
      </span>
      <h2>We couldn’t load your cost data.</h2>
      <p>
        {fetchError ||
          "The data provider is temporarily unavailable. Your saved decisions are safe."}
      </p>
      <button
        className="button secondary"
        onClick={() => {
          setScenario("normal");
          setFetchError("");
          setRefreshKey((k) => k + 1);
        }}
      >
        <IconRefresh />
        Try again
      </button>
    </div>
  );
  const EmptyState = (
    <div className="workspace-state">
      <ReportIllustration kind="report" />
      <Badge tone="info">No billing history yet</Badge>
      <h2>A clearer picture starts with your data.</h2>
      <p>
        Once cost records are available, you’ll see spend trends, anomalies and
        savings opportunities here.
      </p>
      <button
        className="button primary"
        onClick={() => {
          setScenario("normal");
          setToast("Sample billing history restored.");
        }}
      >
        <IconRefresh />
        Load sample data
      </button>
      <small>This is a simulated demo. No AWS account is connected.</small>
    </div>
  );
  const skeleton = (
    <div
      className="dashboard-skeleton"
      aria-busy="true"
      aria-label="Loading cost overview"
    >
      <div className="skeleton metric-skeleton" />
      <div className="skeleton chart-skeleton" />
      <div className="skeleton card-skeleton" />
      <div className="skeleton card-skeleton" />
    </div>
  );

  return (
    <div className={`app-shell variant-${variant}`}>
      <a className="skip-link" href="#main">
        Skip to overview
      </a>
      <aside className="sidebar desktop-sidebar">{Sidebar}</aside>
      <Dialog.Root open={mobileNav} onOpenChange={setMobileNav}>
        <Dialog.Portal>
          <Dialog.Overlay className="mobile-scrim" />
          <Dialog.Content asChild>
            <aside className="sidebar mobile-sidebar">
              <Dialog.Title className="sr-only">
                Workspace navigation
              </Dialog.Title>
              <Dialog.Description className="sr-only">
                Navigate your CloudLens workspace.
              </Dialog.Description>
              {Sidebar}
            </aside>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
      <div className="workspace">
        <header className="topbar">
          <div className="workspace-context">
            <button
              className="icon-button mobile-menu"
              aria-label="Open navigation"
              onClick={() => setMobileNav(true)}
            >
              <IconMenu2 />
            </button>
            {activePage !== "overview" && <span>Client workspace</span>}
          </div>
          <div className="topbar-actions">
            {activePage !== "overview" && (
              <span className="data-freshness">
                <i />
                Updated at 08:00 UTC
              </span>
            )}
            <button className="help-button" onClick={() => open("about")}>
              <IconBook2 />
              Help & resources
            </button>
            <span className="vertical-divider" />
            <button
              className="icon-button notification-button"
              aria-label="Notifications"
              onClick={() => {
                open("notifications");
                setNotificationsRead(true);
              }}
            >
              <IconBell />
              {!notificationsRead && <i />}
            </button>
            <button
              className="avatar small-avatar"
              onClick={() => open("persona")}
              aria-label={`Switch demo persona, currently ${persona.name}`}
            >
              {persona.initials}
            </button>
          </div>
        </header>
        <main id="main" className="main-content" tabIndex={-1}>
          {activePage !== "overview" ? (
            <WorkspacePages
              page={activePage}
              context={{
                overview,
                clients,
                portfolio: portfolioOverviews.map((o) => {
                  const recs = o.recommendations.map((r) => ({
                    ...r,
                    ...(decisions[r.id] || {}),
                  }));
                  return {
                    ...o,
                    budget: budgetOverrides[o.client.id] || o.budget,
                    identifiedSavings: savingsTotals(recs).identified,
                    recommendations: recs,
                    anomalies: o.anomalies.map((a) => ({
                      ...a,
                      status: anomalyStatuses[o.client.id + a.id] || a.status,
                    })),
                  };
                }),
                role,
                budget,
                recommendations,
                anomalies,
                events: events.filter((e) =>
                  e.clientId
                    ? e.clientId === clientId
                    : clientId === "brightloop",
                ),
                onOpen: open,
                onPeriod: setPeriod,
                notify: setToast,
                audit,
              }}
            />
          ) : (
            <>
              {isLoading ? (
                skeleton
              ) : hasError ? (
                ErrorState
              ) : isEmpty ? (
                EmptyState
              ) : (
                <>
                  {scenario === "history" && (
                    <div className="info-banner">
                      <IconInfoCircle />
                      <span>
                        New account preview: forecasts and anomaly detection
                        need more history. Spend totals remain available.
                      </span>
                    </div>
                  )}
                  {variant === "a" ? (
                    <>
                      <OverviewHome
                        overview={overview}
                        recommendations={recommendations}
                        budget={budget}
                        role={role}
                        onOpen={open}
                        onPeriod={setPeriod}
                        notify={setToast}
                        audit={audit}
                      />
                    </>
                  ) : (
                    <>
                      <div className="briefing-banner">
                        <div className="briefing-content">
                          <div className="eyebrow">
                            <IconBulb />
                            YOUR OCTOBER BRIEFING
                          </div>
                          <h2>
                            {openAnomalies.length
                              ? "A few changes deserve a closer look."
                              : "Your cloud is running steadily."}
                          </h2>
                          <p>
                            {openAnomalies.length ? (
                              <>
                                Spend is up{" "}
                                <strong>{percent(overview.change)}</strong> from
                                the previous equal-length period. We’ve found{" "}
                                <strong>
                                  {money(savings.identified)}/month
                                </strong>{" "}
                                in potential savings.
                              </>
                            ) : (
                              <>
                                You have {money(savings.identified)} in
                                estimated monthly savings to review. Keep an eye
                                on your budget as the month progresses.
                              </>
                            )}
                          </p>
                          <button
                            className="button primary"
                            onClick={() =>
                              open(
                                openAnomalies.length
                                  ? "anomalies"
                                  : "recommendations",
                              )
                            }
                          >
                            Review what changed
                            <IconArrowRight />
                          </button>
                        </div>
                        <div className="briefing-stat">
                          <span className="metric-label">
                            Month-to-date spend
                          </span>
                          <strong className="num">{money(overview.mtd)}</strong>
                          <div className="briefing-mini-chart">
                            <Sparkline
                              values={overview.trend
                                .filter((p) => p.actual !== null)
                                .map((p) => p.actual || 0)}
                            />
                          </div>
                          <span className="muted-text">
                            Across {overview.client.accounts} AWS accounts · USD
                          </span>
                        </div>
                      </div>
                      <div className="briefing-grid">
                        <div className="briefing-primary">
                          {scenario !== "history" && AnomaliesPanel}
                          {RecommendationsPanel}
                        </div>
                        <div className="briefing-secondary">
                          {BudgetPanel}
                          <section className="savings-note">
                            <IconShieldCheck />
                            <span>Verified savings / month</span>
                            <strong className="num">
                              {money(savings.verified)}
                            </strong>
                            <p>
                              Changes implemented by your team.
                              <br />
                              Verification is simulated in this demo.
                            </p>
                            <button
                              className="text-button"
                              onClick={() => open("audit")}
                            >
                              See the decision trail
                              <IconArrowRight />
                            </button>
                          </section>
                        </div>
                      </div>
                      {ChartPanel}
                      {Breakdown}
                      {Prompts}
                    </>
                  )}
                  {variant !== "a" && (
                    <footer className="page-footer">
                      <span>
                        <IconShieldCheck />
                        Read-only insights. Human-approved decisions.
                      </span>
                      <span>All costs in USD · Daily buckets in UTC</span>
                    </footer>
                  )}
                </>
              )}
            </>
          )}
        </main>
        <div className="demo-toolbar" aria-label="Demo controls">
          <div className="demo-label">
            <span className="demo-orbit" />
            CONCEPT DEMO<span className="toolbar-dot">·</span>
            <span>Simulated AWS data</span>
          </div>
          <div className="demo-controls">
            <label>
              <span className="sr-only">Demo persona</span>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value as Role)}
              >
                <option value="engineer">Daniel · Engineer</option>
                <option value="executive">Priya · Executive</option>
                <option value="consultant">Maya · Consultant</option>
              </select>
            </label>
            {activePage === "overview" && (
              <label>
                <span className="sr-only">Preview state</span>
                <select
                  value={scenario}
                  onChange={(e) => setScenario(e.target.value as Scenario)}
                >
                  <option value="normal">Default state</option>
                  <option value="loading">Loading state</option>
                  <option value="empty">Empty state</option>
                  <option value="error">Error state</option>
                  <option value="history">Limited history</option>
                </select>
              </label>
            )}
          </div>
        </div>
      </div>
      <Dialog.Root
        open={panel !== null}
        onOpenChange={(v) => {
          if (!v) setPanel(null);
        }}
      >
        <Dialog.Portal>
          <Dialog.Overlay className="dialog-overlay" />
          <Dialog.Content
            className={`drawer ${panel === "search" ? "search-dialog" : ""}`}
            onCloseAutoFocus={(e) => {
              e.preventDefault();
              if (lastPanelTrigger.current?.isConnected)
                lastPanelTrigger.current.focus();
              else document.getElementById("main")?.focus();
            }}
            onOpenAutoFocus={(e) => {
              if (panel !== "search" && panel !== "budget") {
                e.preventDefault();
                document.getElementById("drawer-title")?.focus();
              }
            }}
          >
            <div className="drawer-header">
              <div>
                <div className="eyebrow">{overview.client.name}</div>
                <Dialog.Title id="drawer-title" tabIndex={-1}>
                  {currentRecommendation
                    ? "Recommendation"
                    : currentAnomaly
                      ? "Anomaly details"
                      : {
                          costs: "Cost Explorer",
                          anomalies: "Anomalies",
                          recommendations: "Savings recommendations",
                          budget: "Monthly budget",
                          reports: "Create a report",
                          audit: "Decision trail",
                          notifications: "Notifications",
                          search: "Search your workspace",
                          settings: "Workspace settings",
                          reset: "Reset demo changes",
                          persona: "Explore another perspective",
                          about: "A clearer view of your cloud",
                        }[panel || ""] || "Cost breakdown"}
                </Dialog.Title>
              </div>
              <Dialog.Close asChild>
                <button className="icon-button" aria-label="Close panel">
                  <IconX />
                </button>
              </Dialog.Close>
            </div>
            <Dialog.Description className="drawer-description">
              {currentRecommendation
                ? "Review the evidence and decide what happens next."
                : currentAnomaly
                  ? "Understand what changed before taking action."
                  : "Portfolio concept · All data and changes are simulated."}
            </Dialog.Description>
            <div className="drawer-body">
              {currentRecommendation && (
                <>
                  <div className="detail-badges">
                    <Badge
                      tone={
                        currentRecommendation.risk === "Low"
                          ? "success"
                          : "warning"
                      }
                    >
                      {currentRecommendation.risk} risk
                    </Badge>
                    <Badge tone="info">{currentRecommendation.status}</Badge>
                  </div>
                  <h3 className="detail-title">
                    {currentRecommendation.title}
                  </h3>
                  <div className="detail-saving">
                    <span>Estimated monthly savings</span>
                    <strong className="num">
                      {money(currentRecommendation.savings)}
                      <small>/month</small>
                    </strong>
                    <span>{currentRecommendation.confidence} confidence</span>
                  </div>
                  <dl className="detail-facts">
                    <div>
                      <dt>Resource</dt>
                      <dd className="mono">{currentRecommendation.resource}</dd>
                    </div>
                    <div>
                      <dt>Account</dt>
                      <dd>{currentRecommendation.account}</dd>
                    </div>
                    <div>
                      <dt>Owner</dt>
                      <dd>{currentRecommendation.owner}</dd>
                    </div>
                  </dl>
                  <h4>The evidence</h4>
                  <p>{currentRecommendation.evidence}</p>
                  {currentRecommendation.evidenceReady === false && (
                    <div className="warning-banner">
                      Supporting evidence is requested from the consultant.
                      Approval is unavailable until this prerequisite is met.
                    </div>
                  )}
                  <div className="explanation">
                    <Badge>Scenario assessment</Badge>
                    <p>{currentRecommendation.explanation}</p>
                  </div>
                  {role !== "engineer" ? (
                    <div className="info-banner">
                      <IconInfoCircle />
                      <span>
                        {persona.title}s can review recommendations. An engineer
                        must approve, dismiss or request changes.
                      </span>
                    </div>
                  ) : ["Open", "Changes requested"].includes(
                      currentRecommendation.status,
                    ) ? (
                    decisionAction ? (
                      <div className="decision-confirm">
                        <h4>
                          {decisionAction === "approve"
                            ? "Approve this recommendation?"
                            : decisionAction === "changes"
                              ? "Request changes"
                              : "Dismiss recommendation"}
                        </h4>
                        <p>
                          {decisionAction === "approve"
                            ? `Approve a potential saving of ${money(currentRecommendation.savings)}/month for ${currentRecommendation.resource}. Your team must perform the change outside CloudLens.`
                            : "Record why this recommendation needs a different approach."}
                        </p>
                        {currentRecommendation.account === "Production" && (
                          <div className="warning-banner">
                            <IconAlertCircle />
                            Production resource. Confirm with its owner before
                            implementation.
                          </div>
                        )}
                        {decisionAction !== "approve" && (
                          <label className="form-label">
                            Reason (required)
                            <textarea
                              value={reason}
                              onChange={(e) => setReason(e.target.value)}
                              rows={3}
                              aria-invalid={!!formError}
                            />
                          </label>
                        )}
                        {formError && (
                          <p className="form-error" role="alert">
                            {formError}
                          </p>
                        )}
                        <div className="drawer-actions">
                          <button
                            className="button secondary"
                            onClick={() => {
                              setDecisionAction(null);
                              setFormError("");
                            }}
                          >
                            Cancel
                          </button>
                          <button className="button primary" onClick={decide}>
                            Confirm decision
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="drawer-actions wrap">
                        <button
                          className="button primary"
                          onClick={() => {
                            if (currentRecommendation.evidenceReady === false) {
                              setFormError(
                                "Supporting evidence is still requested.",
                              );
                              return;
                            }
                            setDecisionAction("approve");
                            setFormError("");
                          }}
                          disabled={
                            currentRecommendation.evidenceReady === false
                          }
                        >
                          <IconCheck />
                          Approve
                        </button>
                        <button
                          className="button secondary"
                          onClick={() => {
                            setDecisionAction("changes");
                            setFormError("");
                          }}
                        >
                          Request changes
                        </button>
                        <button
                          className="text-button"
                          onClick={() => {
                            setDecisionAction("dismiss");
                            setFormError("");
                          }}
                        >
                          Dismiss
                        </button>
                      </div>
                    )
                  ) : (
                    <div className="info-banner">
                      <IconCircleCheck />
                      <span>
                        Status: {currentRecommendation.status}. This decision is
                        recorded in your demo audit log.
                      </span>
                    </div>
                  )}
                </>
              )}
              {currentRecommendation &&
                role === "engineer" &&
                currentRecommendation.status === "Approved" && (
                  <div className="research-implementation">
                    <h4>Record implementation separately</h4>
                    <p>
                      Record only a change your team completed outside
                      CloudLens. Savings will remain unverified.
                    </p>
                    <label className="form-label">
                      Implementation note
                      <textarea
                        value={reason}
                        onChange={(e) => setReason(e.target.value)}
                        placeholder="Change ticket, implementation date and observation plan"
                        rows={3}
                      />
                    </label>
                    <button
                      className="button secondary"
                      disabled={!reason.trim()}
                      onClick={() => {
                        setDecisions((d) => ({
                          ...d,
                          [currentRecommendation.id]: {
                            status: "Implemented",
                            version: currentRecommendation.version + 1,
                          },
                        }));
                        audit(
                          "Implementation recorded",
                          currentRecommendation.resource,
                          reason,
                        );
                        setReason("");
                        setToast(
                          "Implementation recorded. Savings await measurement.",
                        );
                      }}
                    >
                      Record completed implementation
                    </button>
                  </div>
                )}
              {currentRecommendation?.status === "Implemented" && (
                <p className="info-banner">
                  Awaiting measurement. Implementation is not verification; the
                  verified savings total is unchanged.
                </p>
              )}
              {currentAnomaly && (
                <>
                  <div className="detail-badges">
                    <Badge
                      tone={
                        currentAnomaly.severity === "High"
                          ? "danger"
                          : "warning"
                      }
                    >
                      {currentAnomaly.severity} severity
                    </Badge>
                    <Badge>{currentAnomaly.status}</Badge>
                  </div>
                  <h3 className="detail-title">{currentAnomaly.title}</h3>
                  <div className="detail-saving">
                    <span>
                      {clientId === "brightloop"
                        ? "Cost change · Oct 1–24 vs Sep 1–24"
                        : `Extra spend since ${currentAnomaly.since}`}
                    </span>
                    <strong className="num">
                      +{money(currentAnomaly.impact)}
                    </strong>
                    <span>
                      {currentAnomaly.percent}% above the comparison cost
                    </span>
                  </div>
                  <dl className="detail-facts">
                    <div>
                      <dt>Service</dt>
                      <dd>{currentAnomaly.service}</dd>
                    </div>
                    <div>
                      <dt>Account</dt>
                      <dd>{currentAnomaly.account}</dd>
                    </div>
                    <div>
                      <dt>Region</dt>
                      <dd className="mono">{currentAnomaly.region}</dd>
                    </div>
                  </dl>
                  <div className="explanation">
                    <Badge>Observed billing change</Badge>
                    <p>{currentAnomaly.explanation}</p>
                  </div>
                  <button
                    className="button secondary"
                    onClick={() => {
                      const url = workspaceHref(
                        currentAnomaly.service === "Amazon VPC"
                          ? "network"
                          : "costs",
                        clientId,
                        "month",
                        role,
                      );
                      setPanel(null);
                      router.push(
                        currentAnomaly.service === "Amazon VPC"
                          ? url
                          : `${url}&service=${encodeURIComponent(currentAnomaly.service)}&account=${encodeURIComponent(currentAnomaly.account)}`,
                      );
                    }}
                  >
                    {currentAnomaly.service === "Amazon VPC"
                      ? "Inspect network flows"
                      : "Explore service costs"}
                    <IconArrowUpRight />
                  </button>
                  {role !== "executive" && (
                    <label className="form-label">
                      Investigation status
                      <select
                        value={currentAnomaly.status}
                        onChange={(e) => {
                          setAnomalyStatuses((s) => ({
                            ...s,
                            [clientId + currentAnomaly.id]: e.target.value,
                          }));
                          audit(
                            "Anomaly status updated",
                            currentAnomaly.title,
                            e.target.value,
                          );
                          setToast("Investigation status updated.");
                        }}
                      >
                        {["New", "Investigating", "Expected", "Resolved"].map(
                          (s) => (
                            <option key={s}>{s}</option>
                          ),
                        )}
                      </select>
                    </label>
                  )}
                </>
              )}
              {panel === "budget" && (
                <form onSubmit={saveBudget}>
                  <Badge
                    tone={
                      forecastRatio && forecastRatio > 100
                        ? "warning"
                        : "success"
                    }
                  >
                    {forecastRatio && forecastRatio > 100
                      ? "Forecast over budget"
                      : "On track"}
                  </Badge>
                  <h3>Give your spend a guardrail.</h3>
                  <p>
                    A client-wide budget for October 2026. Changes update the
                    forecast comparison on your overview.
                  </p>
                  <label className="form-label">
                    Monthly budget (USD)
                    <input
                      type="number"
                      min="1"
                      max="100000000"
                      step=".01"
                      value={budgetInput}
                      onChange={(e) => setBudgetInput(e.target.value)}
                      disabled={role === "executive"}
                      aria-invalid={!!formError}
                    />
                  </label>
                  {formError && (
                    <p className="form-error" role="alert">
                      {formError}
                    </p>
                  )}
                  <dl className="detail-facts">
                    <div>
                      <dt>Month-to-date spend</dt>
                      <dd>{money(overview.mtd)}</dd>
                    </div>
                    <div>
                      <dt>Forecast · estimate</dt>
                      <dd>
                        {visibleForecast
                          ? money(visibleForecast)
                          : "Not enough history"}
                      </dd>
                    </div>
                  </dl>
                  {role === "executive" ? (
                    <p className="info-banner">
                      Your executive role can view budgets. Switch to Engineer
                      or Consultant to edit this demo.
                    </p>
                  ) : (
                    <button className="button primary" type="submit">
                      Save budget
                    </button>
                  )}
                </form>
              )}
              {(panel === "costs" ||
                panel?.startsWith("service:") ||
                panel?.startsWith("day:")) && (
                <>
                  <div className="detail-saving">
                    <span>
                      {panel.startsWith("service:")
                        ? panel.slice(8)
                        : panel.startsWith("day:")
                          ? shortDate(panel.slice(4))
                          : overview.rangeLabel}
                    </span>
                    <strong className="num">
                      {money(
                        panel.startsWith("service:")
                          ? overview.services.find(
                              (s) => s.name === panel.slice(8),
                            )?.amount || 0
                          : panel.startsWith("day:")
                            ? overview.records
                                .filter((r) => r.date === panel.slice(4))
                                .reduce((s, r) => s + r.amount, 0)
                            : overview.spend,
                      )}
                    </strong>
                    <span>
                      {panel.startsWith("day:") &&
                      !overview.records.some((r) => r.date === panel.slice(4))
                        ? "Forecast day — actual billing data is not available yet."
                        : "Complete cost records · USD"}
                    </span>
                  </div>
                  {overview.services
                    .filter(
                      (s) =>
                        !panel.startsWith("service:") ||
                        s.name === panel.slice(8),
                    )
                    .map((s) => (
                      <div className="detail-list-row" key={s.name}>
                        <span>{s.name}</span>
                        <strong className="num">
                          {money(
                            panel.startsWith("day:")
                              ? overview.records
                                  .filter(
                                    (r) =>
                                      r.service === s.name &&
                                      r.date === panel.slice(4),
                                  )
                                  .reduce((a, r) => a + r.amount, 0)
                              : s.amount,
                          )}
                        </strong>
                      </div>
                    ))}
                  <button className="button secondary" onClick={exportCsv}>
                    <IconDownload />
                    Export period costs
                  </button>
                  <p className="muted-text">
                    Filter by account, service and region in Cost Explorer.
                  </p>
                </>
              )}
              {panel === "recommendations" && (
                <>
                  <p>
                    {money(savings.identified)} in estimated monthly savings
                    across {openRecommendations.length} active recommendations.
                  </p>
                  {recommendations.map((r) => (
                    <button
                      className="drawer-list-button"
                      key={r.id}
                      onClick={() => open(`recommendation:${r.id}`)}
                    >
                      <span>
                        <strong>{r.title}</strong>
                        <small>
                          {r.status} · {r.risk} risk
                        </small>
                      </span>
                      <strong className="num">
                        {money(r.savings)}
                        <IconChevronRight />
                      </strong>
                    </button>
                  ))}
                </>
              )}
              {panel === "anomalies" && (
                <>
                  {anomalies.length ? (
                    anomalies.map((a) => (
                      <button
                        className="drawer-list-button"
                        key={a.id}
                        onClick={() => open(`anomaly:${a.id}`)}
                      >
                        <span>
                          <Badge
                            tone={a.severity === "High" ? "danger" : "warning"}
                          >
                            {a.severity}
                          </Badge>
                          <strong>{a.title}</strong>
                          <small>
                            {a.status} · {a.account}
                          </small>
                        </span>
                        <IconChevronRight />
                      </button>
                    ))
                  ) : (
                    <div className="inline-empty">
                      <IconCircleCheck />
                      <h3>No unusual spend detected.</h3>
                      <p>We’ll show changes here when they need attention.</p>
                    </div>
                  )}
                </>
              )}
              {panel === "reports" && (
                <>
                  <ReportIllustration />
                  <h3>The full picture, ready to share.</h3>
                  <p>
                    Export the {overview.rangeLabel.toLowerCase()} service
                    breakdown for {overview.client.name}. The CSV uses the same
                    complete-day totals shown on your overview.
                  </p>
                  <button
                    className="button primary full-width"
                    onClick={exportCsv}
                  >
                    <IconDownload />
                    Download cost report · CSV
                  </button>
                  <button
                    className="button secondary full-width"
                    onClick={() => {
                      setPanel(null);
                      setTimeout(() => window.print(), 200);
                    }}
                  >
                    Print overview / Save as PDF
                  </button>
                  <p className="muted-text">
                    Reports use simulated data. Open the report library to
                    create and save a cost summary or savings report.
                  </p>
                  <button
                    className="text-button accent"
                    onClick={() => go("reports")}
                  >
                    Open report library
                    <IconArrowRight />
                  </button>
                </>
              )}
              {panel === "audit" && (
                <>
                  {events.map((e) => (
                    <div className="audit-event" key={e.id}>
                      <span className="audit-marker">
                        <IconCheck />
                      </span>
                      <div>
                        <strong>{e.action}</strong>
                        <p>{e.object}</p>
                        <small>
                          {e.actor} ·{" "}
                          {new Intl.DateTimeFormat("en-US", {
                            dateStyle: "medium",
                            timeStyle: "short",
                            timeZone: "UTC",
                          }).format(new Date(e.time))}{" "}
                          UTC
                        </small>
                        {e.reason && <p className="audit-reason">{e.reason}</p>}
                      </div>
                    </div>
                  ))}
                  <p className="muted-text">
                    Demo decisions are saved in this browser. Server-side
                    append-only audit storage will be implemented with
                    authentication.
                  </p>
                </>
              )}
              {panel === "notifications" && (
                <>
                  <div className="notification-entry">
                    <IconAlertCircle />
                    <div>
                      <strong>
                        {forecastRatio && forecastRatio > 100
                          ? "Your forecast is over budget"
                          : "Your budget is on track"}
                      </strong>
                      <p>{overview.client.name} · October 2026</p>
                      <button
                        className="text-button"
                        onClick={() => open("budget")}
                      >
                        Review budget
                        <IconArrowRight />
                      </button>
                    </div>
                  </div>
                  {openAnomalies.map((a) => (
                    <button
                      className="drawer-list-button"
                      key={a.id}
                      onClick={() => open(`anomaly:${a.id}`)}
                    >
                      <span>
                        <strong>{a.title}</strong>
                        <small>New cost insight · Since {a.since}</small>
                      </span>
                      <IconChevronRight />
                    </button>
                  ))}
                </>
              )}
              {panel === "search" && (
                <>
                  <label className="search-field">
                    <IconSearch />
                    <input
                      autoFocus
                      aria-label="Search resources, services and recommendations"
                      placeholder="Search services, resources, recommendations…"
                      value={query}
                      onChange={(e) => setQuery(e.target.value)}
                    />
                  </label>
                  <p className="eyebrow">
                    {query ? "RESULTS" : "QUICK ACCESS"}
                  </p>
                  {[
                    ...overview.services.map((s) => ({
                      name: s.name,
                      target: `service:${s.name}`,
                      detail: "AWS service",
                    })),
                    ...recommendations.map((r) => ({
                      name: r.title,
                      target: `recommendation:${r.id}`,
                      detail: r.resource,
                    })),
                  ]
                    .filter((s) =>
                      `${s.name} ${s.detail}`
                        .toLowerCase()
                        .includes(query.toLowerCase()),
                    )
                    .map((s) => (
                      <button
                        className="drawer-list-button"
                        key={s.target}
                        onClick={() => open(s.target)}
                      >
                        <span>
                          <strong>{s.name}</strong>
                          <small>{s.detail}</small>
                        </span>
                        <IconArrowRight />
                      </button>
                    ))}
                  {query &&
                    ![
                      ...overview.services.map((s) => s.name),
                      ...recommendations.map((r) => r.title + " " + r.resource),
                    ].some((s) =>
                      s.toLowerCase().includes(query.toLowerCase()),
                    ) && (
                      <p>
                        No results. Try a service name such as EC2 or a resource
                        name.
                      </p>
                    )}
                </>
              )}
              {panel === "persona" && (
                <>
                  <p>
                    See the same data from another perspective. This selector
                    previews role-based interfaces; it is not an authenticated
                    session.
                  </p>
                  {Object.entries(roles).map(([key, person]) => (
                    <button
                      className={`persona-choice ${role === key ? "selected" : ""}`}
                      key={key}
                      onClick={() => {
                        setRole(key as Role);
                        setPanel(null);
                      }}
                    >
                      <span className="avatar">{person.initials}</span>
                      <span>
                        <strong>{person.name}</strong>
                        <small>{person.title}</small>
                      </span>
                      {role === key && <IconCheck />}
                    </button>
                  ))}
                </>
              )}
              {panel === "settings" && (
                <>
                  <h3>{overview.client.name}</h3>
                  <dl className="detail-facts">
                    <div>
                      <dt>Currency</dt>
                      <dd>USD</dd>
                    </div>
                    <div>
                      <dt>Daily buckets</dt>
                      <dd>UTC</dd>
                    </div>
                    <div>
                      <dt>Data source</dt>
                      <dd>Deterministic mock provider</dd>
                    </div>
                    <div>
                      <dt>Workspace role</dt>
                      <dd>{persona.title}</dd>
                    </div>
                  </dl>
                  <p>
                    Account management and authenticated access settings will be
                    completed after the core screens.
                  </p>
                  <button
                    className="button secondary"
                    onClick={() => open("reset")}
                  >
                    Reset this browser’s demo changes
                  </button>
                </>
              )}
              {panel === "reset" && (
                <>
                  <h3>Reset demo changes?</h3>
                  <p>
                    This clears saved budgets, recommendation decisions,
                    investigation statuses, reports, members, preferences and
                    demo audit events from this browser. Your current role stays
                    selected.
                  </p>
                  <div className="drawer-actions">
                    <button
                      className="button secondary"
                      onClick={() => open("settings")}
                    >
                      Cancel
                    </button>
                    <button
                      className="button primary"
                      onClick={() => {
                        setBudgetOverrides({});
                        setDecisions({});
                        setAnomalyStatuses({});
                        setEvents(initialAudit);
                        for (const key of Object.keys(localStorage)) {
                          if (
                            key.startsWith("cloudlens-budgets-") ||
                            key.startsWith("cloudlens-reports-") ||
                            key === "cloudlens-members-v1" ||
                            key === "cloudlens-preferences"
                          )
                            localStorage.removeItem(key);
                        }
                        window.dispatchEvent(new Event("cloudlens-demo-reset"));
                        setScenario("normal");
                        setPanel(null);
                        setToast("Demo changes reset.");
                      }}
                    >
                      Reset demo
                    </button>
                  </div>
                </>
              )}
              {panel === "about" && (
                <>
                  <ReportIllustration kind="audit" />
                  <h3>Clarity before complexity.</h3>
                  <p>
                    CloudLens helps AWS consultancies and their clients
                    understand spend, investigate unusual changes and make
                    traceable savings decisions.
                  </p>
                  <div className="info-banner">
                    <IconInfoCircle />
                    <span>
                      This portfolio concept uses simulated data. It does not
                      connect to AWS or execute infrastructure changes.
                    </span>
                  </div>
                  <h4>Working in this preview</h4>
                  <p>
                    Explore cost data, review recommendations, change a demo
                    budget and inspect loading, empty and error states.
                  </p>
                  <p>
                    Workspace pages use simulated data and browser-local demo
                    changes. Authentication and server persistence are planned
                    for a later phase.
                  </p>
                </>
              )}
            </div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
      {toast && (
        <div className="toast" role="status">
          <IconCircleCheck />
          <span>{toast}</span>
          <button
            className="icon-button"
            aria-label="Dismiss notification"
            onClick={() => setToast("")}
          >
            <IconX />
          </button>
        </div>
      )}
    </div>
  );
}
