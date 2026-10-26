"use client";
import { useState, type FormEvent } from "react";
import Link from "next/link";
import {
  IconBriefcase,
  IconArrowUpRight,
  IconAlertCircle,
  IconBulb,
  IconPlus,
  IconUsers,
  IconMail,
  IconShieldCheck,
  IconCloud,
  IconCalendar,
  IconCheck,
  IconBell,
  IconSettings,
} from "@tabler/icons-react";
import { clientAttention } from "@/server/analysis/research-workflows";
import { money, shortDate } from "@/lib/format";
import { workspaceHref } from "@/lib/workspace";
import { useDemoState } from "./use-demo-state";
import { Modal } from "./operations-pages";
import { Sparkline } from "../spend-chart";
import {
  PageHeader,
  Section,
  Summary,
  Search,
  Select,
  Tabs,
  Status,
  TableFoot,
  ViewButton,
  type PageContext,
} from "./shared";

export function PortfolioPage({ context: c }: { context: PageContext }) {
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState("Needs attention");
  const clients = c.portfolio.map((o) => ({
    ...o,
    ...clientAttention(o),
    risk: !!o.forecast && o.forecast > o.budget,
  }));
  const rows = clients
    .filter((o) => o.client.name.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) =>
      sort === "Highest spend"
        ? b.mtd - a.mtd
        : b.overrun - a.overrun ||
          b.exposure - a.exposure ||
          b.decisions - a.decisions,
    );
  const priority = [...clients].sort(
    (a, b) =>
      b.overrun - a.overrun ||
      b.exposure - a.exposure ||
      b.decisions - a.decisions,
  )[0];
  return (
    <>
      <PageHeader
        title="Client portfolio"
        subtitle="Maya Brooks · Your assigned client workspaces"
      >
        <Link
          className="button primary"
          href={workspaceHref(
            "reports",
            c.overview.client.id,
            "month",
            "consultant",
          )}
        >
          <IconCalendar />
          Prepare client review
        </Link>
      </PageHeader>
      <Summary
        items={[
          {
            label: "Managed clients",
            value: clients.length,
            hint: `${clients.reduce((s, o) => s + o.client.accounts, 0)} AWS accounts`,
            icon: <IconBriefcase />,
          },
          {
            label: "Month-to-date spend",
            value: money(clients.reduce((s, o) => s + o.mtd, 0)),
            hint: "Across assigned clients · USD",
            icon: <IconCloud />,
          },
          {
            label: "Savings identified / month",
            value: money(clients.reduce((s, o) => s + o.identifiedSavings, 0)),
            hint: "Estimated, active opportunities",
            icon: <IconBulb />,
          },
          {
            label: "Clients needing attention",
            value: clients.filter((o) => o.reasons.length > 0).length,
            hint: "Budget overrun, cost investigations or pending decisions",
            icon: <IconAlertCircle />,
          },
        ]}
      />
      <div className="portfolio-priority">
        <span className="priority-icon">
          <IconAlertCircle />
        </span>
        <div>
          <span className="eyebrow">TODAY’S PRIORITY</span>
          <h2>{priority?.client.name || "Brightloop Retail"}</h2>
          <p>
            {priority?.anomalies.filter((a) =>
              ["New", "Investigating"].includes(a.status),
            ).length || 0}{" "}
            open cost events need a closer look. Start with the largest driver.
          </p>
        </div>
        <Link
          className="button secondary"
          href={workspaceHref(
            "anomalies",
            priority?.client.id || "brightloop",
            "month",
            "consultant",
          )}
        >
          Review client
          <IconArrowUpRight />
        </Link>
      </div>
      <Section
        title="Assigned clients"
        subtitle="Prioritize your work, then open a client workspace."
        action={
          <Search
            value={search}
            onChange={setSearch}
            placeholder="Search clients…"
            label="Search portfolio"
          />
        }
      >
        <div className="secondary-toolbar">
          <Select
            label="Sort clients"
            value={sort}
            onChange={setSort}
            options={["Needs attention", "Highest spend"]}
          />
          <span className="muted-text">
            October 2026 · Complete data through Oct 24
          </span>
        </div>
        <div className="workspace-table-scroll">
          <table className="workspace-table portfolio-table">
            <thead>
              <tr>
                <th>Client</th>
                <th>Spend trend</th>
                <th className="align-right">MTD spend</th>
                <th>Budget outlook</th>
                <th>Open events</th>
                <th>Next work</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {rows.map((o) => (
                <tr key={o.client.id}>
                  <td>
                    <Link
                      className="table-entity"
                      href={workspaceHref(
                        "overview",
                        o.client.id,
                        "month",
                        "consultant",
                      )}
                    >
                      <span className="portfolio-avatar">
                        {o.client.initials}
                      </span>
                      <span>
                        <strong>{o.client.name}</strong>
                        <small>{o.client.accounts} AWS accounts</small>
                      </span>
                    </Link>
                  </td>
                  <td>
                    <div className="portfolio-sparkline">
                      <Sparkline
                        values={o.trend
                          .filter((p) => p.actual !== null)
                          .map((p) => p.actual || 0)}
                      />
                    </div>
                  </td>
                  <td className="align-right num">{money(o.mtd)}</td>
                  <td>
                    <Status tone={o.risk ? "warning" : "success"}>
                      {o.risk ? "Forecast over budget" : "Within budget"}
                    </Status>
                    <small className="table-subtext">
                      {money(o.budget)} monthly limit
                    </small>
                  </td>
                  <td>
                    <span className="event-count">{o.anomalies.length}</span>
                  </td>
                  <td>
                    <span>{o.reasons[0] || "No pending work"}</span>
                    <small className="table-subtext">
                      {o.exposure > 0
                        ? `${money(o.exposure)} observed change under review`
                        : "No active cost investigations"}
                    </small>
                  </td>
                  <td>
                    <Link
                      className="text-button accent"
                      href={workspaceHref(
                        "overview",
                        o.client.id,
                        "month",
                        "consultant",
                      )}
                    >
                      Open
                      <IconArrowUpRight />
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <TableFoot count={rows.length} label="assigned clients">
          <span>
            Ordered by forecast overrun, observed cost impact, then pending
            decisions. No composite score.
          </span>
        </TableFoot>
      </Section>
      <div className="portfolio-note-grid">
        <Section
          title="Make the next review easier"
          subtitle="Keep evidence, recommendations and decisions in one client-ready report."
        >
          <div className="section-body">
            <Link
              className="text-button accent"
              href={workspaceHref(
                "reports",
                c.overview.client.id,
                "month",
                "consultant",
              )}
            >
              Open reports
              <IconArrowUpRight />
            </Link>
          </div>
        </Section>
        <Section
          title="Keep the right people involved"
          subtitle="Review who can see client costs and who can approve changes."
        >
          <div className="section-body">
            <Link
              className="text-button accent"
              href={workspaceHref(
                "users",
                c.overview.client.id,
                "month",
                "consultant",
              )}
            >
              Manage users & access
              <IconArrowUpRight />
            </Link>
          </div>
        </Section>
      </div>
    </>
  );
}
type Member = {
  id: string;
  name: string;
  email: string;
  role: string;
  clients: string[];
  status: "Active" | "Pending";
  lastActive: string;
};
const seedMembers: Member[] = [
  {
    id: "maya",
    name: "Maya Brooks",
    email: "maya@cloudlens.demo",
    role: "Consultant",
    clients: ["brightloop", "medora", "tallyard"],
    status: "Active",
    lastActive: "2026-10-25",
  },
  {
    id: "daniel",
    name: "Daniel Chen",
    email: "daniel@brightloop.demo",
    role: "Engineer",
    clients: ["brightloop"],
    status: "Active",
    lastActive: "2026-10-25",
  },
  {
    id: "priya",
    name: "Priya Sharma",
    email: "priya@brightloop.demo",
    role: "Executive",
    clients: ["brightloop"],
    status: "Active",
    lastActive: "2026-10-24",
  },
  {
    id: "amira",
    name: "Amira Hassan",
    email: "amira@medora.demo",
    role: "Engineer",
    clients: ["medora"],
    status: "Active",
    lastActive: "2026-10-24",
  },
  {
    id: "elena",
    name: "Elena Park",
    email: "elena@medora.demo",
    role: "Executive",
    clients: ["medora"],
    status: "Active",
    lastActive: "2026-10-23",
  },
  {
    id: "noah",
    name: "Noah Williams",
    email: "noah@tallyard.demo",
    role: "Engineer",
    clients: ["tallyard"],
    status: "Active",
    lastActive: "2026-10-24",
  },
  {
    id: "ben",
    name: "Ben Carter",
    email: "ben@tallyard.demo",
    role: "Executive",
    clients: ["tallyard"],
    status: "Active",
    lastActive: "2026-10-22",
  },
  {
    id: "leah",
    name: "Leah Morgan",
    email: "leah@brightloop.demo",
    role: "Engineer",
    clients: ["brightloop"],
    status: "Pending",
    lastActive: "2026-10-24",
  },
];
export function UsersPage({ context: c }: { context: PageContext }) {
  const [members, setMembers] = useDemoState<Member[]>(
    "cloudlens-members-v1",
    seedMembers,
  );
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState("All roles");
  const [status, setStatus] = useState("All");
  const [invite, setInvite] = useState(false);
  const [detail, setDetail] = useState<Member | null>(null);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("Engineer");
  const [client, setClient] = useState("brightloop");
  const rows = members.filter(
    (m) =>
      (filter === "All roles" || m.role === filter) &&
      (status === "All" || m.status === status) &&
      `${m.name} ${m.email}`.toLowerCase().includes(query.toLowerCase()),
  );
  function submit(e: FormEvent) {
    e.preventDefault();
    setMembers((old) => [
      ...old,
      {
        id: crypto.randomUUID(),
        name,
        email,
        role,
        clients: [client],
        status: "Pending",
        lastActive: "2026-10-25",
      },
    ]);
    c.audit("Demo user invited", email, `${role} · ${client}`);
    c.notify("Demo invitation added. No email was sent.");
    setInvite(false);
    setName("");
    setEmail("");
  }
  function changeRole(member: Member, next: string) {
    if (next !== "Consultant" && member.clients.length > 1) {
      c.notify(
        "Choose one client in View access before assigning a client role.",
      );
      return;
    }
    setMembers((old) =>
      old.map((m) => (m.id === member.id ? { ...m, role: next } : m)),
    );
    c.audit("User role updated", member.email, `${member.role} → ${next}`);
    c.notify("Demo role updated.");
  }
  return (
    <>
      <PageHeader
        title="Users & access"
        subtitle="Manage your consultancy team and client access"
      >
        <button className="button primary" onClick={() => setInvite(true)}>
          <IconPlus />
          Invite user
        </button>
      </PageHeader>
      <Summary
        items={[
          {
            label: "Workspace members",
            value: members.length,
            hint: "Across assigned client workspaces",
            icon: <IconUsers />,
          },
          {
            label: "Active members",
            value: members.filter((m) => m.status === "Active").length,
            hint: "Consultants, engineers and executives",
            icon: <IconShieldCheck />,
          },
          {
            label: "Pending invitations",
            value: members.filter((m) => m.status === "Pending").length,
            hint: "Simulated invitations · No emails sent",
            icon: <IconMail />,
          },
        ]}
      />
      <Section>
        <div className="workspace-toolbar">
          <Tabs
            label="Member status"
            value={status}
            onChange={setStatus}
            options={["All", "Active", "Pending"].map((value) => ({
              value,
              label: value,
              count: members.filter(
                (m) => value === "All" || m.status === value,
              ).length,
            }))}
          />
          <div className="toolbar-end">
            <Search
              value={query}
              onChange={setQuery}
              placeholder="Search name or email…"
              label="Search users"
            />
            <Select
              label="Member role"
              value={filter}
              onChange={setFilter}
              options={["All roles", "Consultant", "Engineer", "Executive"]}
            />
          </div>
        </div>
        <div className="workspace-table-scroll">
          <table className="workspace-table users-table">
            <thead>
              <tr>
                <th>Member</th>
                <th>Role</th>
                <th>Client access</th>
                <th>Status</th>
                <th>Last active</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {rows.map((m) => (
                <tr key={m.id}>
                  <td>
                    <div className="table-person">
                      <span className="avatar">
                        {m.name
                          .split(" ")
                          .map((s) => s[0])
                          .join("")}
                      </span>
                      <span>
                        <strong>
                          {m.name}
                          {m.id === "maya" && (
                            <small className="you-label">You</small>
                          )}
                        </strong>
                        <small className="table-subtext">{m.email}</small>
                      </span>
                    </div>
                  </td>
                  <td>
                    <select
                      className="inline-role-select"
                      aria-label={`Role for ${m.name}`}
                      value={m.role}
                      onChange={(e) => changeRole(m, e.target.value)}
                    >
                      {["Executive", "Engineer", "Consultant"].map((r) => (
                        <option key={r}>{r}</option>
                      ))}
                    </select>
                  </td>
                  <td>
                    {m.clients.length === 3 ? (
                      <Status>All assigned clients</Status>
                    ) : (
                      m.clients.map((id) => (
                        <span className="client-access-label" key={id}>
                          {c.clients.find((client) => client.id === id)?.name}
                        </span>
                      ))
                    )}
                  </td>
                  <td>
                    <Status
                      tone={m.status === "Active" ? "success" : "warning"}
                    >
                      {m.status}
                    </Status>
                  </td>
                  <td>
                    {m.status === "Pending"
                      ? "Not yet signed in"
                      : shortDate(m.lastActive)}
                  </td>
                  <td>
                    <ViewButton
                      label="View access"
                      onClick={() => setDetail(m)}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <TableFoot count={rows.length} label="members" />
      </Section>
      <div className="quiet-callout">
        <IconShieldCheck />
        <div>
          <strong>One workspace, different responsibilities.</strong>
          <p>
            Capabilities and client scope are separate. Executives view reports;
            engineers decide on changes; consultants advise and manage assigned
            clients. This is a browser-local preview, not production
            authorization.
          </p>
        </div>
      </div>
      <Section
        title="Capabilities and client scope"
        subtitle="A role controls available actions. Client assignment controls which records a person can access."
      >
        <div className="research-capabilities">
          <div>
            <h3>Executive · reporting</h3>
            <p>
              Review costs, budget position, savings and client reports. No
              infrastructure decisions or access administration.
            </p>
          </div>
          <div>
            <h3>Engineer · decisions</h3>
            <p>
              Investigate costs, review evidence, approve or request changes,
              and record implementation for their own client.
            </p>
          </div>
          <div>
            <h3>Consultant · advisory</h3>
            <p>
              Investigate assigned clients, prepare reviews, maintain budgets
              and manage demo access. Client engineers retain approval
              responsibility.
            </p>
          </div>
        </div>
      </Section>
      <Modal
        open={invite}
        onClose={() => setInvite(false)}
        title="Invite a user"
        description="Add a simulated invitation to a client workspace."
      >
        <form className="workspace-modal-body" onSubmit={submit}>
          <label className="form-label">
            Full name
            <input
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Full name"
            />
          </label>
          <label className="form-label">
            Email address
            <input
              required
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@company.com"
            />
          </label>
          <label className="form-label">
            Role
            <select value={role} onChange={(e) => setRole(e.target.value)}>
              {["Engineer", "Executive", "Consultant"].map((r) => (
                <option key={r}>{r}</option>
              ))}
            </select>
          </label>
          <label className="form-label">
            Client access
            <select value={client} onChange={(e) => setClient(e.target.value)}>
              {c.clients.map((cl) => (
                <option key={cl.id} value={cl.id}>
                  {cl.name}
                </option>
              ))}
            </select>
          </label>
          <p className="modal-note">
            No email will be sent. This creates a demo invitation only.
          </p>
          <div className="modal-actions">
            <button
              type="button"
              className="button secondary"
              onClick={() => setInvite(false)}
            >
              Cancel
            </button>
            <button className="button primary" type="submit">
              <IconMail />
              Add invitation
            </button>
          </div>
        </form>
      </Modal>
      <Modal
        open={!!detail}
        onClose={() => setDetail(null)}
        title={detail?.name || "Member access"}
        description={detail?.email || ""}
      >
        {detail && (
          <div className="workspace-modal-body">
            <Status tone={detail.status === "Active" ? "success" : "warning"}>
              {detail.status}
            </Status>
            <dl className="detail-facts">
              <div>
                <dt>Role</dt>
                <dd>{detail.role}</dd>
              </div>
              <div>
                <dt>Access</dt>
                <dd>
                  {detail.clients
                    .map((id) => c.clients.find((cl) => cl.id === id)?.name)
                    .join(", ")}
                </dd>
              </div>
              <div>
                <dt>Decisions</dt>
                <dd>
                  {detail.role === "Engineer"
                    ? "Approve, dismiss and request changes"
                    : detail.role === "Consultant"
                      ? "Advise and manage assigned clients; no client approval"
                      : "Read reports and decision history"}
                </dd>
              </div>
            </dl>
            <p>
              Access shown here is a demo preview. No live customer account is
              connected.
            </p>
            <label className="form-label">
              Assigned client scope
              <select
                aria-label={`Client scope for ${detail.name}`}
                value={
                  detail.clients.length === c.clients.length
                    ? "all"
                    : detail.clients[0]
                }
                onChange={(e) => {
                  const ids =
                    e.target.value === "all"
                      ? c.clients.map((cl) => cl.id)
                      : [e.target.value];
                  setMembers((old) =>
                    old.map((m) =>
                      m.id === detail.id ? { ...m, clients: ids } : m,
                    ),
                  );
                  setDetail({ ...detail, clients: ids });
                  c.audit(
                    "Demo client scope updated",
                    detail.email,
                    ids.join(", "),
                  );
                  c.notify("Demo client scope saved in this browser.");
                }}
              >
                {detail.role === "Consultant" && (
                  <option value="all">All assigned clients</option>
                )}
                {c.clients.map((cl) => (
                  <option key={cl.id} value={cl.id}>
                    {cl.name}
                  </option>
                ))}
              </select>
            </label>
          </div>
        )}
      </Modal>
    </>
  );
}

export function SettingsPage({ context: c }: { context: PageContext }) {
  const [tab, setTab] = useState("Workspace");
  const [preferences, setPreferences] = useDemoState("cloudlens-preferences", {
    budget: true,
    anomalies: true,
    comments: true,
    decisions: true,
    density: "Comfortable",
  });
  const [draft, setDraft] = useState(preferences);
  const [editing, setEditing] = useState(false);
  const current = editing ? draft : preferences;
  function update(key: string, value: string | boolean) {
    setDraft({ ...current, [key]: value });
    setEditing(true);
  }
  function save(e: FormEvent) {
    e.preventDefault();
    setPreferences(current);
    setEditing(false);
    c.audit("Workspace preferences updated", c.overview.client.name);
    c.notify("Demo preferences saved in this browser.");
  }
  return (
    <>
      <PageHeader
        title="Settings"
        subtitle="Inspect billing coverage, evidence sources and browser-local preferences"
      />
      <div className="settings-layout">
        <div
          className="settings-navigation"
          role="tablist"
          aria-label="Settings sections"
        >
          {[
            ["Workspace", IconSettings],
            ["Notifications", IconBell],
            ["Data sources", IconCloud],
          ].map(([label, Icon]) => {
            const ItemIcon = Icon as typeof IconSettings;
            return (
              <button
                key={String(label)}
                role="tab"
                aria-selected={tab === label}
                onClick={() => setTab(String(label))}
              >
                <ItemIcon />
                {String(label)}
              </button>
            );
          })}
        </div>
        <div className="settings-content">
          {tab === "Workspace" && (
            <>
              <Section
                title="Workspace details"
                subtitle="The client context used throughout your cost reports."
              >
                <div className="settings-form">
                  <div className="workspace-identity">
                    <span className="portfolio-avatar">
                      {c.overview.client.initials}
                    </span>
                    <div>
                      <h3>{c.overview.client.name}</h3>
                      <p>{c.overview.client.industry} · Client organization</p>
                    </div>
                    <Status>Demo workspace</Status>
                  </div>
                  <div className="settings-field-grid">
                    <label className="form-label">
                      Workspace name
                      <input value={c.overview.client.name} readOnly />
                    </label>
                    <label className="form-label">
                      Reporting currency
                      <input value="USD — US dollar" readOnly />
                    </label>
                    <label className="form-label">
                      Daily cost buckets
                      <input value="UTC" readOnly />
                    </label>
                    <label className="form-label">
                      Current role
                      <input
                        value={c.role[0].toUpperCase() + c.role.slice(1)}
                        readOnly
                      />
                    </label>
                  </div>
                </div>
              </Section>
              <Section
                title="Demo workspace"
                subtitle="Review the data source and manage changes saved in this browser."
              >
                <div className="settings-action-row">
                  <div>
                    <strong>Simulated data and decisions</strong>
                    <p>
                      Your budget edits and recommendation decisions stay in
                      this browser.
                    </p>
                  </div>
                  <button
                    className="button secondary"
                    onClick={() => c.onOpen("reset")}
                  >
                    Reset demo changes
                  </button>
                </div>
              </Section>
            </>
          )}
          {tab === "Notifications" && (
            <form onSubmit={save}>
              <Section
                title="Notification preferences"
                subtitle="Save your preferred categories in this browser. Delivery rules and external notifications are not implemented."
              >
                <div className="preference-list">
                  {[
                    [
                      "budget",
                      "Budget thresholds",
                      "Updates when spending reaches a configured limit.",
                    ],
                    [
                      "anomalies",
                      "Cost anomalies",
                      "Changes in cloud spending that may need investigation.",
                    ],
                    [
                      "comments",
                      "Comments and requests",
                      "Notes and requests related to a recommendation.",
                    ],
                    [
                      "decisions",
                      "Decision updates",
                      "Approvals and status changes from your team.",
                    ],
                  ].map(([key, title, description]) => (
                    <label className="preference-row" key={key}>
                      <span>
                        <strong>{title}</strong>
                        <small>{description}</small>
                      </span>
                      <input
                        type="checkbox"
                        role="switch"
                        checked={Boolean(current[key as keyof typeof current])}
                        onChange={(e) => update(key, e.target.checked)}
                      />
                    </label>
                  ))}
                </div>
                <div className="settings-save">
                  <span>Preferences are saved locally for this demo.</span>
                  <button className="button primary" type="submit">
                    Save preferences
                  </button>
                </div>
              </Section>
            </form>
          )}
          {tab === "Data sources" && (
            <>
              <Section
                title="AWS account data"
                subtitle="A deterministic dataset shaped like AWS billing records."
                action={<Status>Simulated provider</Status>}
              >
                <div className="research-source-contract">
                  <div>
                    <h3>Billing source</h3>
                    <p>
                      Simulated amortized line items in USD, tax excluded.
                      Complete through Oct 24 UTC. The partial current day is
                      excluded from spend and forecasts. Account inventory is
                      derived from the same records used in reports.
                    </p>
                  </div>
                  <div>
                    <h3>Additional evidence</h3>
                    <p>
                      Brightloop has a separate modeled VPC flow-log scenario
                      for NAT processing. Billing totals alone cannot identify
                      traffic paths. Resource utilization and measurement notes
                      are explicit scenario evidence, not live telemetry.
                    </p>
                  </div>
                </div>
                <div className="source-provider">
                  <span className="resource-tile">
                    <IconCloud />
                  </span>
                  <div>
                    <strong>CloudLens demo dataset</strong>
                    <p>
                      Simulated billing history · Complete through Oct 24 ·
                      Updated Oct 25 at 08:00 UTC
                    </p>
                  </div>
                </div>
                <div className="workspace-table-scroll">
                  <table className="workspace-table">
                    <thead>
                      <tr>
                        <th>Account</th>
                        <th>Account ID</th>
                        <th>Environment</th>
                        <th>Source</th>
                      </tr>
                    </thead>
                    <tbody>
                      {[
                        ...new Set(
                          c.overview.monthRecords.map((r) => r.account),
                        ),
                      ].map((name, i) => (
                        <tr key={name}>
                          <td>{name}</td>
                          <td className="mono">
                            demo-{c.overview.client.id}-{i + 1}
                          </td>
                          <td>
                            <Status>
                              {name === "Production"
                                ? "Production"
                                : name === "Development"
                                  ? "Development"
                                  : "Shared"}
                            </Status>
                          </td>
                          <td>
                            <Status>Demo data</Status>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </Section>
              <div className="quiet-callout">
                <IconShieldCheck />
                <div>
                  <strong>No AWS account is connected.</strong>
                  <p>
                    This concept uses simulated records. It never requests AWS
                    credentials or changes infrastructure.
                  </p>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
}
