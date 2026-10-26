import type { Role } from "./domain";
export const workspacePages = {
  overview: { title: "Cost overview", path: "/", section: "Workspace" },
  costs: {
    title: "Cost Explorer",
    path: "/cost-explorer",
    section: "Workspace",
  },
  anomalies: { title: "Anomalies", path: "/anomalies", section: "Workspace" },
  network: {
    title: "Network flow report",
    path: "/network-flows",
    section: "Workspace",
  },
  recommendations: {
    title: "Recommendations",
    path: "/recommendations",
    section: "Workspace",
  },
  budget: { title: "Budgets", path: "/budgets", section: "Workspace" },
  reports: { title: "Reports", path: "/reports", section: "Workspace" },
  audit: { title: "Audit log", path: "/audit-log", section: "Workspace" },
  portfolio: {
    title: "Client portfolio",
    path: "/portfolio",
    section: "Consultancy",
  },
  users: { title: "Users & access", path: "/users", section: "Consultancy" },
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
) {
  return `${workspacePages[page].path}?client=${encodeURIComponent(client)}&period=${period}&role=${role}`;
}
