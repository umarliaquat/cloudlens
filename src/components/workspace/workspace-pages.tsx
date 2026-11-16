"use client";
import type { WorkspacePage } from "@/lib/workspace";
import type { PageContext } from "./shared";
import { lazy, Suspense } from "react";
import { workspacePages } from "@/lib/workspace";
import { WorkspaceLoadingContent } from "../workspace-loading";

const pages = {
  costs: lazy(() =>
    import("./cost-report").then((m) => ({ default: m.ResearchedCostPage })),
  ),
  anomalies: lazy(() =>
    import("./investigations-page").then((m) => ({
      default: m.InvestigationsPage,
    })),
  ),
  recommendations: lazy(() =>
    import("./analysis-pages").then((m) => ({
      default: m.RecommendationsPage,
    })),
  ),
  budget: lazy(() =>
    import("./operations-pages").then((m) => ({ default: m.BudgetsPage })),
  ),
  reports: lazy(() =>
    import("./operations-pages").then((m) => ({ default: m.ReportsPage })),
  ),
  audit: lazy(() =>
    import("./operations-pages").then((m) => ({ default: m.AuditPage })),
  ),
  portfolio: lazy(() =>
    import("./consultant-pages").then((m) => ({ default: m.PortfolioPage })),
  ),
  users: lazy(() =>
    import("./consultant-pages").then((m) => ({ default: m.UsersPage })),
  ),
  settings: lazy(() =>
    import("./consultant-pages").then((m) => ({ default: m.SettingsPage })),
  ),
  network: lazy(() =>
    import("./network-report").then((m) => ({ default: m.NetworkReportPage })),
  ),
};
export function WorkspacePages({
  page,
  context,
}: {
  page: Exclude<WorkspacePage, "overview">;
  context: PageContext;
}) {
  const Page = pages[page];
  if (
    (page === "users" || page === "portfolio") &&
    context.role !== "consultant"
  ) {
    return (
      <div className="workspace-page">
        <h1>Consultant workspace</h1>
        <p>This demo page is available in the consultant workspace.</p>
      </div>
    );
  }
  return (
    <div className={`workspace-page page-${page}`}>
      <Suspense
        fallback={
          <WorkspaceLoadingContent title={workspacePages[page].title} />
        }
      >
        <Page key={context.overview.client.id} context={context} />
      </Suspense>
      <footer className="page-footer">
        <span>All costs in USD · Daily buckets in UTC</span>
      </footer>
    </div>
  );
}
