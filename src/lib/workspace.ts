import type { Role } from "./domain";
export const workspacePages = {
  overview: { title: "Cost overview", path: "/", section: "Workspace" },
  costs: {
    title: "Cost breakdown",
    path: "/cost-explorer",
    section: "Workspace",
  },
  anomalies: {
    title: "Unusual spending",
    path: "/anomalies",
    section: "Workspace",
  },
  network: {
    title: "Network costs",
    path: "/network-flows",
    section: "Workspace",
  },
  recommendations: {
    title: "Ways to save",
    path: "/recommendations",
    section: "Workspace",
  },
  budget: { title: "Budgets", path: "/budgets", section: "Workspace" },
  reports: { title: "Reports", path: "/reports", section: "Workspace" },
  audit: {
    title: "Activity history",
    path: "/audit-log",
    section: "Workspace",
  },
  portfolio: {
    title: "Clients",
    path: "/portfolio",
    section: "Consultancy",
  },
  users: { title: "People & access", path: "/users", section: "Consultancy" },
  settings: { title: "Settings", path: "/settings", section: "Workspace" },
} as const;
export type WorkspacePage = keyof typeof workspacePages;
export function pageFromPath(pathname: string): WorkspacePage {
  const base = process.env.NEXT_PUBLIC_BASE_PATH || "";
  if (base && (pathname === base || pathname.startsWith(base + "/")))
    pathname = pathname.slice(base.length) || "/";
  pathname = pathname.replace(/\/$/, "") || "/";
  return (
    (Object.keys(workspacePages) as WorkspacePage[]).find(
      (key) => workspacePages[key].path === pathname,
    ) || "overview"
  );
}
export function workspaceHref(
  page: WorkspacePage,
  client: string,
  period: string,
  role: Role,
  filters?: Record<string, string>,
) {
  const query = new URLSearchParams(filters);
  if (client !== "brightloop") query.set("client", client);
  if (period !== "month") query.set("period", period);
  const defaultRole =
    page === "portfolio" || page === "users" ? "consultant" : "engineer";
  if (role !== defaultRole) query.set("role", role);
  return query.size
    ? workspacePages[page].path + "?" + query
    : workspacePages[page].path;
}
